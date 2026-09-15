// Presentation adaptations: MessageItem, AssistantMarkdown, tool-call-model.
// DeepSeek MIT notice and exact frozen sources: apps/desktop/THIRD_PARTY_NOTICES.md.
import { createElement as h, useEffect, useState } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'

const markdownLabels = { code: { copyLabel: '复制', copiedLabel: '已复制' }, footnotes: '注释' }
const turnErrorLabel = code => code === 'PROVIDER_EXECUTION_BUDGET_EXHAUSTED'
  ? 'This run reached its safe model-call limit. Send a new message to start a new bounded run.'
  : '本轮执行失败'
export const Markdown = ({ text = '', streaming = false }) => h('div', { className: 'shaco-markdown' }, h(MarkdownText, { text, streaming, labels: markdownLabels }))
// Extracted from Harness MessageItem.contentParts; no source/event interpretation.
export function contentParts(content = []) {
  const texts = [], images = []
  for (const block of content) {
    if (block?.type === 'text' && typeof block.text === 'string') texts.push(block.text)
    else if (block?.type === 'image' && block.attachment !== undefined) images.push({ attachment: block.attachment })
  }
  return { text: texts.join(''), images }
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
  const user = node.kind === 'user' || node.kind === 'steering'
  let body
  if (user) {
    const parts = contentParts(data.content)
    body = h('div', null, h('div', { className: 'user-prose' }, parts.text), parts.images.map((image, i) => h(ImageReference, { key: i, ...image, actions })))
  } else if (node.kind === 'assistant-step') {
    // Adapt AssistantMarkdown's content branches and truthful interruption marker.
    body = h('div', { 'data-streaming': data.status === 'running' || undefined }, data.blocks.map((block, i) => {
      if (block.kind === 'text') return h(Markdown, { key: i, text: block.text, streaming: data.status === 'running' })
      if (block.kind === 'image') return h(ImageReference, { key: i, attachment: block.attachment, actions })
      return null
    }), h('small', { className: 'message-state' }, data.status === 'running' ? '正在生成…' : data.status === 'interrupted' ? '已中断' : '已结束'))
  } else if (node.kind === 'turn-error') {
    body = h('div', { role: 'status', className: 'shaco-error' }, turnErrorLabel(data.code))
  } else if (node.kind === 'turn-max-tokens') {
    body = h('div', { role: 'status', className: 'shaco-error' }, '已达到输出上限')
  } else return null
  return h('article', { className: `shaco-message ${user ? 'message-user' : 'message-assistant'}`, 'data-message-kind': node.kind },
    h('div', { className: 'message-avatar', 'aria-hidden': true }, user ? 'U' : 'S'),
    h('div', { className: 'message-column' }, h('div', { className: 'message-meta' }, user ? '你' : 'Shaco Forge',
      Number.isFinite(data.time) && h('time', null, new Date(data.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))),
    h('div', { className: 'message-body' }, body)))
}
