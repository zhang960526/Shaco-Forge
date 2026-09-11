// Presentation adaptations: MessageItem, AssistantMarkdown, tool-call-model.
// DeepSeek MIT notice and exact frozen sources: apps/desktop/THIRD_PARTY_NOTICES.md.
import { createElement as h, useEffect, useState } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'

const markdownLabels = { code: { copyLabel: '复制', copiedLabel: '已复制' }, footnotes: '注释' }
export const Markdown = ({ text = '', streaming = false }) => h('div', { className: 'shaco-markdown' }, h(MarkdownText, { text, streaming, labels: markdownLabels }))
const bounded = value => {
  try { return (typeof value === 'string' ? value : JSON.stringify(value, null, 2) ?? '').slice(0, 24000) }
  catch { return '无法显示此内容' }
}

// Extracted from Harness MessageItem.contentParts; no source/event interpretation.
export function contentParts(content = []) {
  const texts = [], images = [], rest = []
  for (const block of content) {
    if (block?.type === 'text' && typeof block.text === 'string') texts.push(block.text)
    else if (block?.type === 'image' && block.attachment !== undefined) images.push({ attachment: block.attachment })
    else rest.push(block)
  }
  return { text: texts.join(''), images, rest }
}
// Extracted from Harness tool-call-model.resultText (pure display formatting).
export function resultText(node) {
  const parts = []
  for (const block of node.content ?? []) parts.push(block.type === 'text' ? block.text : bounded(block))
  if (!parts.length && node.error) parts.push(`${node.error.name}: ${node.error.code}`)
  return parts.join('\n')
}
export function ShacoToolResult({ block }) {
  if (!block) return null
  const settled = block.kind === 'tool-result'
  const call = settled ? block.call : block
  const state = !settled ? 'running' : block.isError ? 'error' : 'settled'
  const output = settled ? resultText(block) : ''
  return h('details', { className: 'shaco-tool', 'data-testid': 'shaco-tool', 'data-tool-state': state },
    h('summary', null, h('span', { className: 'state-dot', 'data-state': state }), h('strong', null, call?.name ?? '工具结果'),
      h('span', { className: 'tool-summary' }, (call?.argsRaw ?? '').slice(0, 120)), h('span', null, !settled ? '运行中' : block.isError ? '执行失败' : '已返回结果')),
    h('div', { className: 'tool-detail' }, call && h('div', null, h('small', null, '输入'), h('pre', null, bounded(call.argsRaw))),
      settled && h('div', null, h('small', null, '结果'), h('pre', null, bounded(output) || '工具未返回文本内容')),
      (block.subCalls ?? []).map(child => h(ShacoToolResult, { key: child.callId, block: child }))))
}

function ImageReference({ attachment, actions }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    let active = true
    setUrl('')
    // Harness owns the authorized image cache and URL lifetime.
    void actions.imageUrl(attachment).then(value => { if (active && actions.current()) setUrl(value) }).catch(() => {})
    return () => { active = false }
  }, [attachment, actions])
  return url ? h('img', { className: 'historical-image', src: url, alt: attachment?.name ?? '图片附件' }) :
    h('span', { className: 'image-reference' }, '▧ ', attachment?.name ?? attachment?.mediaType ?? '图片附件')
}
export function ShacoMessage({ node, actions }) {
  const data = node.data
  if (node.visibility === 'hidden') return null
  if (node.kind === 'tool-call') return h(ShacoToolResult, { block: data.root })
  if (node.kind === 'turn-tail' || node.kind === 'turn-process') return null
  const user = node.kind === 'user' || node.kind === 'steering'
  let body
  if (user) {
    const parts = contentParts(data.content)
    body = h('div', null, h('div', { className: 'user-prose' }, parts.text), parts.images.map((image, i) => h(ImageReference, { key: i, ...image, actions })),
      parts.rest.length > 0 && h('details', null, h('summary', null, '其他内容'), h('pre', null, bounded(parts.rest))))
  } else if (node.kind === 'assistant-step') {
    // Adapt AssistantMarkdown's content branches and truthful interruption marker.
    body = h('div', { 'data-streaming': data.status === 'running' || undefined }, data.blocks.map((block, i) => {
      if (block.kind === 'text') return h(Markdown, { key: i, text: block.text, streaming: data.status === 'running' })
      if (block.kind === 'reasoning') return h('details', { key: i, className: 'shaco-reasoning' }, h('summary', null, data.status === 'running' ? '正在思考' : '思考过程'), h('div', { className: 'user-prose' }, block.text))
      if (block.kind === 'image') return h(ImageReference, { key: i, attachment: block.attachment, actions })
      if (block.kind === 'tool-call') return null
      return h('details', { key: i }, h('summary', null, '其他内容'), h('pre', null, bounded(block.block)))
    }), h('small', { className: 'message-state' }, data.status === 'running' ? '正在生成…' : data.status === 'interrupted' ? '已中断' : '已结束'))
  } else if (node.kind === 'turn-error' || node.kind === 'turn-max-tokens') {
    body = h('div', { role: 'status', className: 'shaco-error' }, data.message || (node.kind === 'turn-error' ? '本轮执行失败' : '已达到输出上限'))
  } else if (node.kind === 'command' || node.kind === 'manual-compaction') {
    const command = data.command ?? data
    const outcome = command.outcome
    body = h('div', null,
      h('strong', null, node.kind === 'manual-compaction' ? '上下文整理' : `/${command.name ?? '命令'}`),
      command.args && h('div', { className: 'user-prose' }, bounded(command.args)),
      outcome && h('div', { className: outcome.kind === 'error' ? 'shaco-error' : 'user-prose' },
        outcome.text || (outcome.kind === 'success' ? '命令已完成' : '命令未完成')))
  } else {
    body = h('details', null, h('summary', null, `会话记录 · ${node.kind}`), h('pre', null, bounded(data)))
  }
  return h('article', { className: `shaco-message ${user ? 'message-user' : 'message-assistant'}`, 'data-message-kind': node.kind },
    h('div', { className: 'message-avatar', 'aria-hidden': true }, user ? 'U' : 'S'),
    h('div', { className: 'message-column' }, h('div', { className: 'message-meta' }, user ? '你' : 'Shaco Forge',
      Number.isFinite(data.time) && h('time', null, new Date(data.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))),
    h('div', { className: 'message-body' }, body)))
}
