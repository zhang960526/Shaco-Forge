// Native input fallback assessed against Harness InputBar; Model/Permission presentation adapted.
// DeepSeek MIT notice and selected source inventory: apps/desktop/THIRD_PARTY_NOTICES.md.
import { createElement as h, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSource } from './presentation-hooks.mjs'

const LONG_DRAFT_THRESHOLD = 1000
const MAX_DRAFT_LINES = 10
const permissionIconName = value => value === 'workspace-write' ? 'workspace-write' : value === 'danger-full-access' ? 'full-access' : 'read-only'
const permissionIcon = value => h('span', { className: `theme-icon permission-icon icon-permission-${permissionIconName(value)}`, 'aria-hidden': true })

function fitDraftInput(element) {
  if (!element) return
  element.style.height = 'auto'
  const style = getComputedStyle(element)
  const lineHeight = Number.parseFloat(style.lineHeight) || 22.5
  const borderHeight = Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth)
  const paddingHeight = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
  const maximum = lineHeight * MAX_DRAFT_LINES + paddingHeight + borderHeight
  const desired = element.scrollHeight + borderHeight
  element.style.height = `${Math.ceil(Math.min(Math.max(desired, Number.parseFloat(style.minHeight) || 0), maximum))}px`
  element.style.overflowY = desired > maximum + 0.5 ? 'auto' : 'hidden'
}

export function composeDraftText(longDrafts, draft, editingLongDraft) {
  const texts = longDrafts.map(item => item.text)
  if (draft.length > 0) texts.splice(editingLongDraft?.index ?? texts.length, 0, draft)
  return texts.join('')
}

export function collapseLongDraftPaste(longDrafts, draft, editingLongDraft, pastedText, selectionStart, selectionEnd, id) {
  const start = Math.max(0, Math.min(selectionStart ?? draft.length, draft.length))
  const end = Math.max(start, Math.min(selectionEnd ?? start, draft.length))
  const text = `${draft.slice(0, start)}${pastedText}${draft.slice(end)}`
  const next = [...longDrafts]
  next.splice(editingLongDraft?.index ?? next.length, 0, { id: editingLongDraft?.id ?? id, text })
  return next
}

export function restoreLongDraft(longDrafts, draft, editingLongDraft, item, id) {
  const available = [...longDrafts]
  if (editingLongDraft) available.splice(editingLongDraft.index, 0, { id: editingLongDraft.id, text: draft })
  else if (draft) available.push({ id, text: draft })
  const selectedIndex = available.findIndex(row => row.id === item.id)
  if (selectedIndex < 0) return null
  return {
    longDrafts: available.filter(row => row.id !== item.id),
    draft: item.text,
    editingLongDraft: { id: item.id, index: selectedIndex },
  }
}

export function removeStoredLongDraft(longDrafts, editingLongDraft, item, index) {
  return {
    longDrafts: longDrafts.filter(row => row.id !== item.id),
    editingLongDraft: editingLongDraft && index < editingLongDraft.index ? { ...editingLongDraft, index: editingLongDraft.index - 1 } : editingLongDraft,
  }
}

export function ShacoModelSelector({ directory, actions, locked }) {
  const state = useSource(directory?.store)
  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState('root')
  const [error, setError] = useState('')
  const root = useRef(null)
  useEffect(() => { if (directory && actions.current()) void directory.load().catch(() => { if (actions.current()) setError('模型目录暂不可用') }) }, [directory, actions])
  useEffect(() => {
    if (!open) return undefined
    const closeOutside = event => { if (!root.current?.contains(event.target)) setOpen(false) }
    const closeOnEscape = event => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeOnEscape) }
  }, [open])
  if (!directory || !state) return h('span', { className: 'control-note' }, '模型不可用')
  // Adapted Host-owned provider/model and exact-model reasoning choices.
  const choices = state.groups.flatMap(group => group.models.map(model => ({ group, model, selection: { provider: group.id, model: model.id,
    ...(model.reasoning?.defaultEffort === undefined ? {} : { reasoningEffort: model.reasoning.defaultEffort }) } })))
  const index = choices.findIndex(row => row.group.id === state.current?.provider && row.model.id === state.current?.model)
  const selected = choices[index]
  const effortId = state.current?.reasoningEffort ?? selected?.model.reasoning?.defaultEffort ?? ''
  const effort = selected?.model.reasoning?.efforts.find(row => row.id === effortId)
  const modelName = selected?.model.name ?? state.current?.model ?? '选择模型'
  const modelLabel = selected ? `${selected.group.name} · ${selected.model.name}` : state.current ? `${state.current.provider} / ${state.current.model}` : '选择模型'
  const effortLabel = effort?.name ?? (selected?.model.reasoning ? '默认强度' : '')
  const choose = async selection => {
    if (locked || !actions.current()) return
    setError('')
    try { await actions.selectModel(directory, selection) } catch { if (actions.current()) setError('模型选择未确认，请重新读取目录。') }
  }
  const selectModel = row => { setOpen(false); setPanel('root'); void choose(row.selection) }
  const selectEffort = id => { setOpen(false); setPanel('root'); void choose({ ...state.current, reasoningEffort: id || undefined }) }
  const menu = panel === 'models'
    ? h('div', { className: 'model-menu model-option-menu', role: 'menu', 'aria-label': '选择模型' },
      h('button', { type: 'button', className: 'model-menu-back', onClick: () => setPanel('root') }, '模型'),
      choices.map(row => h('button', { key: `${row.group.id}:${row.model.id}`, type: 'button', role: 'menuitemradio', className: 'model-option',
        'aria-checked': row === selected, disabled: locked || state.status === 'selecting', onClick: () => selectModel(row) },
      h('span', { className: 'model-option-copy' }, h('span', { className: 'model-option-name' }, `${row.group.name} · ${row.model.name}`)),
      row === selected && h('span', { className: 'model-option-check', 'aria-hidden': true }, '✓'))))
    : panel === 'reasoning'
      ? h('div', { className: 'model-menu model-option-menu', role: 'menu', 'aria-label': '选择推理强度' },
        h('button', { type: 'button', className: 'model-menu-back', onClick: () => setPanel('root') }, '推理强度'),
        [{ id: '', name: '默认强度' }, ...(selected?.model.reasoning?.efforts ?? [])].map(row => h('button', { key: row.id || 'default', type: 'button', role: 'menuitemradio', className: 'model-option',
          'aria-checked': (state.current?.reasoningEffort ?? '') === row.id, disabled: locked || state.status === 'selecting', onClick: () => selectEffort(row.id) },
        h('span', { className: 'model-option-copy' }, h('span', { className: 'model-option-name' }, row.name)),
        (state.current?.reasoningEffort ?? '') === row.id && h('span', { className: 'model-option-check', 'aria-hidden': true }, '✓'))))
      : h('div', { className: 'model-menu', role: 'menu', 'aria-label': '模型与推理强度' },
        h('button', { type: 'button', className: 'model-menu-row', onClick: () => setPanel('models') },
          h('span', { className: 'model-menu-label' }, '模型'), h('span', { className: 'model-menu-value' }, modelLabel), h('span', { 'aria-hidden': true }, '›')),
        selected?.model.reasoning && h('button', { type: 'button', className: 'model-menu-row', onClick: () => setPanel('reasoning') },
          h('span', { className: 'model-menu-label' }, '推理强度'), h('span', { className: 'model-menu-value' }, effortLabel), h('span', { 'aria-hidden': true }, '›')))
  return h('div', { className: 'model-controls', ref: root },
    h('button', { type: 'button', className: 'model-trigger', 'aria-label': '模型与推理强度', 'data-testid': 'shaco-model', disabled: locked || state.status === 'selecting',
      'aria-haspopup': 'menu', 'aria-expanded': open, onClick: () => { setPanel('root'); setOpen(current => !current) } },
      h('span', { className: 'model-trigger-value' }, modelName), effortLabel && h('span', { className: 'model-trigger-effort' }, effortLabel)),
    open && menu,
    state.routable === false && h('span', { className: 'shaco-error' }, '当前模型路由不可用'),
    (error || state.error) && h('span', { role: 'status', className: 'shaco-error' }, error || '模型目录读取失败'))
}

export function ShacoPermission({ source, actions, locked }) {
  const value = useSource(source)
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const root = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    const closeOutside = event => { if (!root.current?.contains(event.target)) setOpen(false) }
    const closeOnEscape = event => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeOnEscape) }
  }, [open])
  if (!value) return null
  const descriptions = {
    'read-only': '不产生文件变更',
    'workspace-write': '允许编辑项目',
    'danger-full-access': '可不受限制的访问互联网和计算机的全部文件',
    custom: '使用自定义权限配置',
  }
  const current = value.options.find(option => option.value === value.currentValue)
  const submit = async id => {
    if (busy || locked || !actions.current()) return
    setBusy(true); setError('')
    try { await actions.permission(id) } catch { if (actions.current()) setError('权限变更未确认，请检查当前状态。') }
    finally { if (actions.current()) setBusy(false) }
  }
  const choose = id => {
    setOpen(false)
    if (id === 'danger-full-access') { setAcknowledged(false); setConfirmation(true) } else void submit(id)
  }
  return h('div', { className: 'permission-controls', ref: root },
    h('button', { type: 'button', className: 'permission-trigger', 'aria-label': '权限', 'data-testid': 'shaco-permission', disabled: locked || busy,
      value: value.currentValue, 'aria-haspopup': 'menu', 'aria-expanded': open, onClick: () => setOpen(currentOpen => !currentOpen) },
      h('span', { className: 'permission-trigger-content' }, permissionIcon(value.currentValue), h('span', { className: 'permission-trigger-label' }, current?.name ?? '选择权限'))),
    open && h('div', { className: 'permission-menu', role: 'menu', 'aria-label': '工作区权限' }, value.options.map(option => h('button', {
      key: option.value, type: 'button', role: 'menuitemradio', className: 'permission-option', 'data-permission-value': option.value,
      'aria-checked': option.value === value.currentValue, disabled: locked || busy || option.value === 'custom', onClick: () => choose(option.value),
    }, permissionIcon(option.value), h('span', { className: 'permission-option-copy' }, h('span', { className: 'permission-option-name' }, option.name),
      h('small', null, descriptions[option.value] ?? '权限配置')), option.value === value.currentValue && h('span', { className: 'permission-option-check', 'aria-hidden': true }, '✓')))),
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
  const [longDrafts, setLongDrafts] = useState([])
  const [images, setImages] = useState([])
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [longDraftExpanded, setLongDraftExpanded] = useState(false)
  const [editingLongDraft, setEditingLongDraft] = useState(null)
  const lock = useRef(false), attachmentInput = useRef(null), draftInput = useRef(null), longDraftId = useRef(0)
  const unavailable = !actions.current() || session.removed || session.openState !== 'open'
  const sendBlocked = unavailable || !!pending || !!blocked || model?.routable === false
  const longDraftCollapsed = draft.length > LONG_DRAFT_THRESHOLD && !longDraftExpanded
  const hasContent = !!draft.trim() || longDrafts.some(item => item.text.trim()) || images.length > 0
  const queuedMessages = session.queue.filter(item => item.placement === 'queued')
  useLayoutEffect(() => { if (!longDraftCollapsed) fitDraftInput(draftInput.current) }, [draft, longDraftCollapsed])
  useEffect(() => {
    const resize = () => fitDraftInput(draftInput.current)
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])
  const act = async (stop = false) => {
    if (lock.current || unavailable || (!stop && (sendBlocked || !hasContent))) return
    lock.current = true; setBusy(true); setFeedback('')
    try {
      if (stop) await actions.cancel()
      else {
        const text = composeDraftText(longDrafts, draft, editingLongDraft)
        const content = [...(text.trim() ? [{ type: 'text', text }] : []), ...images.map(image => ({ type: 'image', mediaType: image.mediaType, data: image.data, name: image.name }))]
        await actions.prompt(content)
        if (actions.current()) { setDraft(''); setLongDrafts([]); setImages([]); setLongDraftExpanded(false); setEditingLongDraft(null) }
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
  const updateDraft = value => {
    setDraft(value)
    if (value.length <= LONG_DRAFT_THRESHOLD) setLongDraftExpanded(false)
  }
  const addLongDraft = event => {
    const text = event.clipboardData?.getData('text/plain') ?? ''
    if (text.length <= LONG_DRAFT_THRESHOLD) return
    event.preventDefault()
    const input = event.currentTarget
    const selectionStart = input.selectionStart
    const selectionEnd = input.selectionEnd
    const id = editingLongDraft?.id ?? ++longDraftId.current
    setLongDrafts(current => collapseLongDraftPaste(current, draft, editingLongDraft, text, selectionStart, selectionEnd, id))
    setDraft('')
    setLongDraftExpanded(false)
    setEditingLongDraft(null)
    setFeedback('')
  }
  const expandLongDraft = () => {
    setLongDraftExpanded(true)
    requestAnimationFrame(() => draftInput.current?.focus())
  }
  const expandStoredLongDraft = (item, index) => {
    const id = !editingLongDraft && draft ? ++longDraftId.current : undefined
    const restored = restoreLongDraft(longDrafts, draft, editingLongDraft, item, id)
    if (!restored) return
    setLongDrafts(restored.longDrafts)
    setEditingLongDraft(restored.editingLongDraft)
    setDraft(restored.draft)
    setLongDraftExpanded(true)
    requestAnimationFrame(() => draftInput.current?.focus())
  }
  const removeLongDraft = (item, index, stored) => {
    if (stored) {
      const removed = removeStoredLongDraft(longDrafts, editingLongDraft, item, index)
      setLongDrafts(removed.longDrafts)
      setEditingLongDraft(removed.editingLongDraft)
    } else {
      setDraft('')
      setLongDraftExpanded(false)
      setEditingLongDraft(null)
    }
  }
  const longDraftCard = (item, index, stored = true) => {
    const summary = item.text.replace(/\s+/g, ' ').trim().slice(0, 32)
    const disabled = unavailable || busy
    return h('div', { key: item.id, className: 'long-draft-item' },
      h('button', { type: 'button', className: 'long-draft-preview', 'data-testid': 'long-draft-preview',
        onClick: stored ? () => expandStoredLongDraft(item, index) : expandLongDraft,
        disabled, 'aria-label': `展开长文本继续编辑，共 ${item.text.length} 字` },
      h('span', { className: 'long-draft-copy' }, h('strong', null, summary || '长文本'),
        h('span', { className: 'long-draft-meta' }, h('small', null, `总字数 ${item.text.length.toLocaleString('zh-CN')} 字`),
          h('span', { className: 'long-draft-action', 'aria-hidden': true }, '在文本框中显示 ›')))),
      h('button', { type: 'button', className: 'long-draft-remove', disabled, 'aria-label': `删除长文本，共 ${item.text.length} 字`,
        onClick: event => { event.stopPropagation(); removeLongDraft(item, index, stored) } }, '×'))
  }
  return h('section', { className: 'shaco-composer', 'data-testid': 'shaco-composer', 'aria-label': '消息输入' },
    (longDrafts.length > 0 || longDraftCollapsed || images.length > 0) && h('div', { className: 'composer-previews', 'data-testid': 'composer-previews' },
      longDrafts.map((item, index) => longDraftCard(item, index)),
      longDraftCollapsed && longDraftCard({ id: 'active-long-draft', text: draft }, longDrafts.length, false),
      images.length > 0 && h('div', { className: 'attachment-list' }, images.map((image, i) => h('figure', { key: `${i}:${image.name}` }, h('img', { src: image.url, alt: image.name }), h('button', { disabled: busy, 'aria-label': `移除 ${image.name}`, onClick: () => setImages(current => current.filter((_, index) => index !== i)) }, '×'))))),
    !longDraftCollapsed && h('textarea', { ref: draftInput, 'data-testid': 'shaco-draft', 'aria-label': '发送消息给 Shaco Forge', placeholder: '发送消息给 Shaco Forge…', rows: 1, value: draft, disabled: unavailable || busy,
      onChange: event => updateDraft(event.target.value), onPaste: addLongDraft, onKeyDown: event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.nativeEvent.keyCode !== 229) { event.preventDefault(); void act() }
      } }),
    h('div', { className: 'composer-controls' }, h('input', { ref: attachmentInput, hidden: true, type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif', multiple: true, onChange: addImages }),
      h('button', { title: '添加图片', 'aria-label': '添加图片', disabled: unavailable || busy, onClick: () => attachmentInput.current?.click() }, h('span', { className: 'theme-icon icon-attachment', 'aria-hidden': true })),
      h(ShacoPermission, { source: binding.session.projections.faceOf('permissions'), actions, locked: unavailable || busy }),
      h('div', { className: 'composer-spacer' }), h(ShacoModelSelector, { directory, actions, locked: unavailable || busy }),
      session.running && h('button', { disabled: unavailable || busy, onClick: () => void act(true), 'data-testid': 'shaco-stop' }, '停止'),
      h('button', { className: 'primary', 'data-testid': 'shaco-send', disabled: sendBlocked || busy || !hasContent, onClick: () => void act() }, session.running ? '加入队列' : [h('span', { key: 'icon', className: 'theme-icon icon-send', 'aria-hidden': true }, h('span', { className: 'icon-spacing' }, '↑')), ' 发送'])),
    (blocked?.reason || feedback || session.promptError) && h('p', { className: 'composer-feedback', role: 'status' }, blocked?.reason ?? (feedback || '请求未完成，请检查会话状态。')),
    queuedMessages.length > 0 && h('p', { className: 'composer-feedback' }, `${queuedMessages.length} 条消息正在队列中`))
}
