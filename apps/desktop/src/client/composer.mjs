// Native input fallback assessed against Harness InputBar; Model/Permission presentation adapted.
// DeepSeek MIT notice and selected source inventory: apps/desktop/THIRD_PARTY_NOTICES.md.
import { createElement as h, useEffect, useRef, useState } from 'react'
import { useSource } from './presentation-hooks.mjs'

export function ShacoModelSelector({ directory, actions, locked }) {
  const state = useSource(directory?.store)
  const [error, setError] = useState('')
  useEffect(() => { if (directory && actions.current()) void directory.load().catch(() => { if (actions.current()) setError('模型目录暂不可用') }) }, [directory, actions])
  if (!directory || !state) return h('span', { className: 'control-note' }, '模型不可用')
  // Adapted Host-owned provider/model and exact-model reasoning choices.
  const choices = state.groups.flatMap(group => group.models.map(model => ({ group, model, selection: { provider: group.id, model: model.id,
    ...(model.reasoning?.defaultEffort === undefined ? {} : { reasoningEffort: model.reasoning.defaultEffort }) } })))
  const index = choices.findIndex(row => row.group.id === state.current?.provider && row.model.id === state.current?.model)
  const selected = choices[index]
  const choose = async selection => {
    if (locked || !actions.current()) return
    setError('')
    try { await actions.selectModel(directory, selection) } catch { if (actions.current()) setError('模型选择未确认，请重新读取目录。') }
  }
  return h('div', { className: 'model-controls' },
    h('select', { 'aria-label': '模型', 'data-testid': 'shaco-model', disabled: locked || state.status === 'selecting', value: index < 0 ? '' : String(index), onChange: event => { const row = choices[Number(event.target.value)]; if (row) void choose(row.selection) } },
      h('option', { value: '', disabled: true }, state.current ? `${state.current.provider} / ${state.current.model}` : '选择模型'),
      choices.map((row, i) => h('option', { value: String(i), key: `${row.group.id}:${row.model.id}` }, `${row.group.name} · ${row.model.name}`))),
    selected?.model.reasoning && h('select', { 'aria-label': '推理强度', value: state.current?.reasoningEffort ?? selected.model.reasoning.defaultEffort ?? '',
      disabled: locked || state.status === 'selecting', onChange: event => void choose({ ...state.current, reasoningEffort: event.target.value || undefined }) },
      h('option', { value: '' }, '默认强度'), selected.model.reasoning.efforts.map(effort => h('option', { value: effort.id, key: effort.id }, effort.name))),
    state.routable === false && h('span', { className: 'shaco-error' }, '当前模型路由不可用'),
    (error || state.error) && h('span', { role: 'status', className: 'shaco-error' }, error || '模型目录读取失败'))
}

export function ShacoPermission({ source, actions, locked }) {
  const value = useSource(source)
  const [confirmation, setConfirmation] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (!value) return null
  const submit = async id => {
    if (busy || locked || !actions.current()) return
    setBusy(true); setError('')
    try { await actions.permission(id) } catch { if (actions.current()) setError('权限变更未确认，请检查当前状态。') }
    finally { if (actions.current()) setBusy(false) }
  }
  return h('div', { className: 'permission-controls' },
    h('select', { 'aria-label': '权限', 'data-testid': 'shaco-permission', disabled: locked || busy, value: value.currentValue,
      onChange: event => { if (event.target.value === 'danger-full-access') { setAcknowledged(false); setConfirmation(true) } else void submit(event.target.value) } },
      value.options.map(option => h('option', { key: option.value, value: option.value, disabled: option.value === 'custom' }, option.name))),
    error && h('p', { role: 'status', className: 'shaco-error' }, error),
    confirmation && h('div', { className: 'shaco-confirmation', role: 'dialog', 'aria-modal': true, 'aria-label': '确认完全访问' },
      h('h3', null, '允许完全访问'), h('p', null, '此模式允许操作超出项目写入范围。请确认你信任当前任务。'),
      h('label', { className: 'question-option' }, h('input', { type: 'checkbox', checked: acknowledged, onChange: event => setAcknowledged(event.target.checked) }), '我了解并确认此权限范围'),
      h('div', { className: 'interaction-actions' }, h('button', { onClick: () => setConfirmation(false) }, '取消'),
        h('button', { className: 'primary', disabled: !acknowledged || locked || busy, onClick: () => { setConfirmation(false); void submit('danger-full-access') } }, '确认完全访问'))))
}

export function ShacoComposer({ binding, ctx, actions, directory, pending }) {
  const session = useSource(binding.session)
  const blocked = useSource(ctx.conversation.blocks.storeFor(session.sessionId))
  const model = useSource(directory?.store)
  const [draft, setDraft] = useState('')
  const [images, setImages] = useState([])
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const lock = useRef(false), input = useRef(null)
  const unavailable = !actions.current() || session.removed || session.openState !== 'open'
  const sendBlocked = unavailable || !!pending || !!blocked || model?.routable === false
  const act = async (stop = false) => {
    if (lock.current || unavailable || (!stop && (sendBlocked || (!draft.trim() && !images.length)))) return
    lock.current = true; setBusy(true); setFeedback('')
    try {
      if (stop) await actions.cancel()
      else {
        const content = [...(draft.trim() ? [{ type: 'text', text: draft }] : []), ...images.map(image => ({ type: 'image', mediaType: image.mediaType, data: image.data, name: image.name }))]
        await actions.prompt(content)
        if (actions.current()) { setDraft(''); setImages([]) }
      }
      if (actions.current()) setFeedback(stop ? '停止请求已提交，等待运行状态更新。' : '已接收，等待执行。')
    } catch { if (actions.current()) setFeedback('操作结果未确认。输入已保留，请检查会话状态；不会自动重发。') }
    finally { if (actions.current()) { lock.current = false; setBusy(false) } }
  }
  const addImages = async event => {
    const files = Array.from(event.target.files ?? []); event.target.value = ''
    if (!actions.current()) return
    if (files.length + images.length > 8 || files.some(file => !/^image\/(png|jpeg|webp|gif)$/.test(file.type) || file.size > 10 * 1024 * 1024)) { setFeedback('请选择最多 8 张 PNG/JPEG/WebP/GIF 图片，每张不超过 10 MB。'); return }
    try {
      const items = await Promise.all(files.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => { const url = String(reader.result); resolve({ name: file.name, mediaType: file.type, data: url.slice(url.indexOf(',') + 1), url }) }
        reader.onerror = reject; reader.readAsDataURL(file)
      })))
      if (actions.current()) setImages(current => [...current, ...items])
    } catch { if (actions.current()) setFeedback('图片读取失败，请重新选择。') }
  }
  return h('section', { className: 'shaco-composer', 'data-testid': 'shaco-composer', 'aria-label': '消息输入' },
    h('textarea', { 'data-testid': 'shaco-draft', 'aria-label': '发送消息给 Shaco Forge', placeholder: '发送消息给 Shaco Forge…', rows: 3, value: draft, disabled: unavailable || busy,
      onChange: event => setDraft(event.target.value), onKeyDown: event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.nativeEvent.keyCode !== 229) { event.preventDefault(); void act() }
      } }),
    images.length > 0 && h('div', { className: 'attachment-list' }, images.map((image, i) => h('figure', { key: `${i}:${image.name}` }, h('img', { src: image.url, alt: image.name }), h('button', { disabled: busy, 'aria-label': `移除 ${image.name}`, onClick: () => setImages(current => current.filter((_, index) => index !== i)) }, '×')))),
    h('div', { className: 'composer-controls' }, h('input', { ref: input, hidden: true, type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif', multiple: true, onChange: addImages }),
      h('button', { title: '添加图片', 'aria-label': '添加图片', disabled: unavailable || busy, onClick: () => input.current?.click() }, '＋'),
      h(ShacoPermission, { source: binding.session.projections.faceOf('permissions'), actions, locked: unavailable || busy }),
      h('div', { className: 'composer-spacer' }), h(ShacoModelSelector, { directory, actions, locked: unavailable || busy }),
      session.running && h('button', { disabled: unavailable || busy, onClick: () => void act(true), 'data-testid': 'shaco-stop' }, '停止'),
      h('button', { className: 'primary', 'data-testid': 'shaco-send', disabled: sendBlocked || busy || (!draft.trim() && !images.length), onClick: () => void act() }, session.running ? '加入队列' : '↑ 发送')),
    (blocked?.reason || feedback || session.promptError) && h('p', { className: 'composer-feedback', role: 'status' }, blocked?.reason ?? (feedback || '请求未完成，请检查会话状态。')),
    session.queue.length > 0 && h('p', { className: 'composer-feedback' }, `${session.queue.length} 条消息正在队列中`))
}
