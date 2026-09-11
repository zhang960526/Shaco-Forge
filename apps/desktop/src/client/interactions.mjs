// Adapted pure presentation from Harness ApprovalPanel, QuestionComposer and PlanReviewPanel.
// DeepSeek MIT notice: apps/desktop/THIRD_PARTY_NOTICES.md. No pending implementation copied.
import { createElement as h, useRef, useState } from 'react'
import { Markdown } from './message.mjs'

export function parseRecommendedLabel(label) {
  const suffix = /\s*(?:\((?:recommended|推荐)\)|（(?:recommended|推荐)）)\s*$/i
  return suffix.test(label) ? { label: label.replace(suffix, ''), recommended: true } : { label, recommended: false }
}

function useSettlement(pending, actions) {
  const lock = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const answer = async value => {
    if (lock.current || !actions.pendingCurrent(pending)) return
    lock.current = true; setBusy(true); setError('')
    try { await actions.answer(pending, value) }
    catch {
      if (actions.pendingCurrent(pending)) {
        setError('操作结果未确认。请检查当前请求后，再明确选择；不会自动重试。')
        lock.current = false; setBusy(false)
      }
    }
  }
  return { busy, error, answer }
}

export function ShacoApproval({ pending, actions }) {
  const flow = useSettlement(pending, actions)
  return h('section', { className: 'shaco-interaction', 'data-approval-key': pending.key, 'aria-label': '操作审批' },
    h('header', { className: 'interaction-strip' }, h('span', { className: 'state-dot', 'data-state': 'waiting' }), '等待你的批准'),
    h('div', { className: 'interaction-body' }, h('h3', null, pending.toolName), h('p', null, pending.reason ?? '此操作需要你的确认。'),
      pending.callId && h('details', null, h('summary', null, '请求详情'), h('code', null, pending.callId))),
    h('div', { className: 'interaction-actions' }, h('p', { role: 'status' }, flow.error),
      h('button', { disabled: flow.busy, onClick: () => flow.answer('rejected'), 'data-testid': 'reject-approval' }, '拒绝'),
      h('button', { className: 'primary', disabled: flow.busy, onClick: () => flow.answer('allowed-once'), 'data-testid': 'allow-approval' }, '允许一次')))
}

export function ShacoQuestion({ pending, actions }) {
  const flow = useSettlement(pending, actions)
  const [drafts, setDrafts] = useState(() => pending.questions.map(() => ({ selected: [], custom: '' })))
  const [validation, setValidation] = useState('')
  const update = (index, change) => setDrafts(current => current.map((row, i) => i === index ? { ...row, ...change } : row))
  const submit = event => {
    event.preventDefault()
    if (drafts.some(row => !row.selected.length && !row.custom.trim())) { setValidation('请回答每个问题后提交。'); return }
    setValidation('')
    void flow.answer({ answers: pending.questions.map((question, i) => ({ id: question.id, selected: drafts[i].selected,
      ...(drafts[i].custom.trim() ? { custom: drafts[i].custom.trim() } : {}) })) })
  }
  const plan = pending.questions.some(question => question.intent?.kind === 'plan-review')
  return h('form', { className: 'shaco-interaction', 'data-question-key': pending.key, 'data-plan-review-key': plan ? pending.key : undefined,
    onSubmit: submit, 'aria-label': plan ? '计划审阅' : '回答问题' },
    h('header', { className: 'interaction-strip' }, h('span', { className: 'state-dot', 'data-state': 'waiting' }), plan ? '请审阅计划' : '需要你的选择'),
    h('div', { className: 'interaction-body question-list' }, pending.questions.map((question, index) => h('fieldset', { key: question.id, disabled: flow.busy },
      h('legend', null, question.header ?? `问题 ${index + 1}`), h('h3', null, question.question),
      question.detail && h(Markdown, { text: question.detail }),
      (question.options ?? []).map(option => {
        const label = parseRecommendedLabel(option.label)
        return h('label', { key: option.label, className: 'question-option' },
          h('input', { type: question.multiSelect ? 'checkbox' : 'radio', name: `question-${index}`, checked: drafts[index].selected.includes(option.label),
            onChange: event => update(index, { selected: question.multiSelect ? event.target.checked ? [...drafts[index].selected, option.label] : drafts[index].selected.filter(value => value !== option.label) : [option.label],
              ...(!question.multiSelect ? { custom: '' } : {}) }) }),
          h('span', null, h('strong', null, label.label), label.recommended && h('small', { className: 'recommended' }, '推荐'),
            question.intent?.kind === 'plan-review' && question.intent.approve === option.label && h('small', null, '批准计划'),
            option.description && h('small', null, option.description)))
      }),
      h('label', null, '自定义回答', h('textarea', { rows: 2, value: drafts[index].custom, 'aria-label': `自定义回答 ${index + 1}`,
        onChange: event => update(index, { custom: event.target.value, ...(!question.multiSelect ? { selected: [] } : {}) }) }))))),
    h('div', { className: 'interaction-actions' }, h('p', { role: 'status' }, validation || flow.error), h('button', { className: 'primary', type: 'submit', disabled: flow.busy, 'data-testid': 'submit-question' }, '提交回答')))
}
