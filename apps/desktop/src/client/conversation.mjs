// Adapted ChatView presentation: ordered public target, follow-scroll and older-history anchoring.
// DeepSeek MIT notice: apps/desktop/THIRD_PARTY_NOTICES.md. No event folding or reducer.
import { createElement as h, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useSource } from './presentation-hooks.mjs'
import { bindPresentationActions } from './presentation-actions.mjs'
import { ShacoMessage } from './message.mjs'
import { TurnDisclosure } from './turn-details.mjs'
import { ShacoComposer } from './composer.mjs'
import { ShacoApproval, ShacoQuestion } from './interactions.mjs'

export function ShacoChatWorkspace({ ctx, shell, binding }) {
  // The key is a presentation instance identity, never a replacement Session identity.
  const key = useMemo(() => crypto.randomUUID(), [binding])
  return binding ? h(SessionWorkspace, { key, ctx, shell, binding }) : h('div', { className: 'shaco-empty' }, '正在读取会话…')
}

function nodeTurn(node) {
  return node?.location?.kind === 'turn' || node?.location?.kind === 'step' ? node.location.turn : undefined
}

function turnPresentation(chat, turn) {
  const keys = turn ? chat.locations.getTurn(turn.turn) ?? [] : []
  const tailKey = keys.find(key => chat.nodes.get(key)?.kind === 'turn-tail')
  const processKey = keys.find(key => chat.nodes.get(key)?.kind === 'turn-process')
  const assistantKey = [...keys].reverse().find(key => {
    const candidate = chat.nodes.get(key)
    return candidate?.kind === 'assistant-step' && candidate.visibility !== 'hidden'
  })
  return { assistantKey, disclosureKey: tailKey ?? processKey, hasTail: tailKey !== undefined }
}

function SessionWorkspace({ ctx, shell, binding }) {
  const actions = useMemo(() => bindPresentationActions(ctx, shell, binding), [ctx, shell, binding])
  const session = useSource(binding.session)
  const conversation = ctx.uiConversation.binding(binding)
  const target = conversation.target('chat')
  const chat = useSource(target)
  const interactions = useSource(ctx.uiSession.pendingInteractions)
  const pending = interactions?.get(session.sessionId)
  const directory = ctx.modelDirectories.directoryFor(session.sessionId)
  const pendingKey = useMemo(() => crypto.randomUUID(), [pending])
  const scroll = useRef(null), follow = useRef(true), paging = useRef(null)
  const [error, setError] = useState('')
  useLayoutEffect(() => {
    const element = scroll.current
    if (!element) return
    if (paging.current && !session.loadingOlder) {
      element.scrollTop += element.scrollHeight - paging.current.height
      paging.current = null
    } else if (follow.current) element.scrollTop = element.scrollHeight
  }, [chat, session.loadingOlder])
  const older = async () => {
    if (!actions.current() || session.loadingOlder) return
    paging.current = { height: scroll.current.scrollHeight }
    follow.current = false; setError('')
    try { await actions.loadOlder() } catch { if (actions.current()) { paging.current = null; setError('历史记录读取失败，请重试。') } }
  }
  return h('div', { className: 'shaco-session', 'data-testid': 'shaco-session' },
    h('div', { className: 'conversation-scroll', ref: scroll, 'data-conversation-scroll': '', onScroll: () => { const element = scroll.current; follow.current = element.scrollHeight - element.scrollTop - element.clientHeight <= 24 } },
      h('div', { className: 'shaco-conversation centered-content', 'data-testid': 'shaco-conversation', role: 'log', 'aria-label': '会话消息' },
        session.hasMore && h('button', { className: 'load-older', disabled: session.loadingOlder, onClick: older }, session.loadingOlder ? '读取中…' : '加载更早记录'),
        (error || session.openError || session.lastAgentError) && h('p', { className: 'shaco-error', role: 'status' }, error || session.lastAgentError || '会话记录读取失败'),
        !chat ? h('p', null, '正在读取对话…') : chat.order.length === 0 ? h('div', { className: 'shaco-empty' }, h('h2', null, '从一个想法开始'), h('p', null, '描述需要完成的工作，或添加图片说明。')) :
          chat.order.map(key => {
            const node = chat.nodes.get(key)
            if (!node) return null
            const turn = nodeTurn(node)
            const presentation = turnPresentation(chat, turn)
            if (node.kind === 'turn-tail') return presentation.assistantKey ? null : h(TurnDisclosure, { key, chat, turn })
            if (node.kind === 'turn-process') {
              return presentation.hasTail || presentation.assistantKey ? null : h(TurnDisclosure, { key, chat, turn })
            }
            if (node.kind === 'assistant-step' && presentation.assistantKey === key && presentation.disclosureKey) {
              return h('div', { key, className: 'shaco-assistant-turn' },
                h(TurnDisclosure, { chat, turn }),
                h(ShacoMessage, { node, actions }))
            }
            return h(ShacoMessage, { key, node, actions })
          }),
        session.running && h('p', { className: 'running-indicator', role: 'status' }, h('span', { className: 'state-dot', 'data-state': 'running' }), '正在处理…'))),
    h('div', { className: 'composer-dock centered-content' },
      pending?.kind === 'approval' && h(ShacoApproval, { key: pendingKey, pending, actions }),
      (pending?.kind === 'question' || pending?.kind === 'plan-review') && h(ShacoQuestion, { key: pendingKey, pending, actions }),
      h(ShacoComposer, { ctx, binding, actions, directory, pending })))
}
