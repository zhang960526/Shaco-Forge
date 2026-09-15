import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const taskRoot = resolve(process.env.SHACO_FORGE_TEST_ROOT
  ?? join(process.cwd(), '..', 'Shaco-Forge-Test', 'V1-ON-E-WRITER-20260915'))
const fixtureRoot = join(taskRoot, 'message-runtime-import-v3')

await mkdir(fixtureRoot, { recursive: true })
const original = await readFile(new URL('./message.mjs', import.meta.url), 'utf8')
const adapted = original
  .replace("from 'react'", "from './react-stub.mjs'")
  .replace("from '@deepseek-ai/dsh-client-ui-primitives'", "from './primitive-stub.mjs'")
assert.notEqual(adapted, original)
await writeFile(join(fixtureRoot, 'message.mjs'), adapted, 'utf8')
await writeFile(join(fixtureRoot, 'package.json'), '{"private":true,"type":"module"}\n', 'utf8')
await writeFile(join(fixtureRoot, 'react-stub.mjs'), `
export const createElement = (type, props, ...children) => ({
  type,
  props: { ...(props ?? {}), children: children.length < 2 ? children[0] : children },
})
export const useEffect = () => {}
export const useState = value => [value, () => {}]
`, 'utf8')
await writeFile(join(fixtureRoot, 'primitive-stub.mjs'), 'export const MarkdownText = () => null\n', 'utf8')
const { ShacoMessage, contentParts } = await import(`${pathToFileURL(join(fixtureRoot, 'message.mjs')).href}?run=${process.pid}`)

const realAdapted = original
  .replace("from 'react'", `from '${import.meta.resolve('react')}'`)
  .replace("from '@deepseek-ai/dsh-client-ui-primitives'", "from './primitive-real-stub.mjs'")
assert.notEqual(realAdapted, original)
await writeFile(join(fixtureRoot, 'message-real.mjs'), realAdapted, 'utf8')
await writeFile(join(fixtureRoot, 'primitive-real-stub.mjs'), 'export const MarkdownText = ({ text }) => text\n', 'utf8')
const { ShacoMessage: RealShacoMessage } = await import(`${pathToFileURL(join(fixtureRoot, 'message-real.mjs')).href}?run=${process.pid}`)

function textContent(value) {
  if (value === null || value === undefined || typeof value === 'boolean') return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.map(textContent).join('')
  return textContent(value.props?.children)
}

test('stable Provider budget error is rendered as a truthful user-readable turn error', () => {
  const message = 'This run reached its safe model-call limit. Send a new message to start a new bounded run.'
  const node = {
    kind: 'turn-error',
    visibility: 'visible',
    data: {
      turn: 1,
      step: 1,
      time: Date.now(),
      code: 'PROVIDER_EXECUTION_BUDGET_EXHAUSTED',
      message,
    },
  }
  const rendered = ShacoMessage({ node, actions: {} })
  const visible = textContent(rendered)
  assert.match(visible, /Shaco Forge/)
  assert.match(visible, /safe model-call limit/)
  assert.doesNotMatch(visible, /completed|已完成/)
  const body = rendered.props.children[1].props.children[1].props.children
  assert.equal(body.props.role, 'status')
  assert.equal(body.props.className, 'shaco-error')
  assert.equal(textContent(body), message)
})

test('real React DOM never exposes raw turn-error payloads, codes, or JSON fallbacks', () => {
  const generic = '本轮执行失败'
  const budget = 'This run reached its safe model-call limit. Send a new message to start a new bounded run.'
  let messageGetterRead = false
  const cases = [
    { name: 'internal error', data: { code: 'INTERNAL', message: 'INTERNAL_ERROR_SECRET' }, expected: generic, blocked: ['INTERNAL_ERROR_SECRET', 'INTERNAL'] },
    { name: 'credential-shaped diagnosis', data: { code: 'INTERNAL', message: 'Bearer credential-secret at C:\\private\\provider.json' }, expected: generic, blocked: ['credential-secret', 'provider.json', 'INTERNAL'] },
    { name: 'object fallback', data: { code: 'INTERNAL', message: { secret: 'OBJECT_SECRET' } }, expected: generic, blocked: ['OBJECT_SECRET', 'INTERNAL'] },
    { name: 'JSON fallback', data: { code: 'INTERNAL', message: '{"token":"JSON_FALLBACK_SECRET"}' }, expected: generic, blocked: ['JSON_FALLBACK_SECRET', 'INTERNAL'] },
    { name: 'budget code with malicious message', data: { code: 'PROVIDER_EXECUTION_BUDGET_EXHAUSTED', message: 'BUDGET_MESSAGE_SECRET' }, expected: budget, blocked: ['BUDGET_MESSAGE_SECRET', 'PROVIDER_EXECUTION_BUDGET_EXHAUSTED'] },
    { name: 'unknown code', data: { code: 'RAW_CODE_SECRET', message: 'UNKNOWN_MESSAGE_SECRET' }, expected: generic, blocked: ['RAW_CODE_SECRET', 'UNKNOWN_MESSAGE_SECRET'] },
    { name: 'malformed code', data: { code: { secret: 'MALFORMED_CODE_SECRET' }, message: 'MALFORMED_MESSAGE_SECRET' }, expected: generic, blocked: ['MALFORMED_CODE_SECRET', 'MALFORMED_MESSAGE_SECRET'] },
    { name: 'missing code', data: { message: 'MISSING_CODE_MESSAGE_SECRET' }, expected: generic, blocked: ['MISSING_CODE_MESSAGE_SECRET'] },
    { name: 'message getter', data: { code: 'INTERNAL', get message() { messageGetterRead = true; throw new Error('GETTER_SECRET') } }, expected: generic, blocked: ['GETTER_SECRET', 'INTERNAL'] },
  ]

  for (const scenario of cases) {
    const html = renderToStaticMarkup(createElement(RealShacoMessage, {
      node: { kind: 'turn-error', visibility: 'visible', data: scenario.data },
      actions: {},
    }))
    assert.match(html, /<article[^>]*data-message-kind="turn-error"/, scenario.name)
    assert.match(html, /<div role="status" class="shaco-error">/, scenario.name)
    assert.match(html, new RegExp(scenario.expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), scenario.name)
    assert.doesNotMatch(html, /completed|已完成/, scenario.name)
    for (const canary of scenario.blocked) assert.doesNotMatch(html, new RegExp(canary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${scenario.name}: ${canary}`)
  }
  assert.equal(messageGetterRead, false)
})

test('normal chat allowlist preserves human and visible assistant text/images only', () => {
  const actions = { imageUrl: async () => '', current: () => true }
  const human = ShacoMessage({ node: { kind: 'user', visibility: 'visible', data: { time: 1, content: [
    { type: 'text', text: 'VISIBLE_HUMAN' }, { type: 'image', attachment: { name: 'visible.png' } }, { type: 'secret', value: 'HUMAN_BLOCK_SECRET' },
  ] } }, actions })
  assert.match(textContent(human), /VISIBLE_HUMAN/)
  assert.match(JSON.stringify(human), /visible\.png/)
  assert.doesNotMatch(textContent(human), /HUMAN_BLOCK_SECRET/)
  const assistant = ShacoMessage({ node: { kind: 'assistant-step', visibility: 'visible', data: { time: 2, status: 'settled', blocks: [
    { kind: 'text', text: 'VISIBLE_ASSISTANT' }, { kind: 'image', attachment: { name: 'answer.png' } }, { kind: 'reasoning', text: 'REASONING_SECRET' }, { kind: 'other', block: 'OTHER_SECRET' },
  ] } }, actions })
  assert.match(JSON.stringify(assistant), /VISIBLE_ASSISTANT/)
  assert.match(JSON.stringify(assistant), /answer\.png/)
  assert.doesNotMatch(textContent(assistant), /REASONING_SECRET|OTHER_SECRET/)
  assert.deepEqual(contentParts([{ type: 'text', text: 'a' }, { type: 'secret', value: 'x' }]), { text: 'a', images: [] })
})

test('system, context, runtime, tool, retry, command and unknown nodes never impersonate ordinary chat', () => {
  const actions = {}
  for (const kind of ['system-prompt', 'context', 'runtime-injection', 'tool-call', 'model-retry', 'command', 'manual-compaction', 'unknown', 'turn-tail', 'turn-process']) {
    assert.equal(ShacoMessage({ node: { kind, visibility: 'visible', data: { secret: `${kind}-SECRET` } }, actions }), null, kind)
  }
  assert.equal(ShacoMessage({ node: { kind: 'user', visibility: 'hidden', data: { content: [{ type: 'text', text: 'HIDDEN' }] } }, actions }), null)
})
