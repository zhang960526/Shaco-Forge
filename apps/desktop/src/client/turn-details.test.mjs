import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { TurnDisclosure, projectTurnDetails, turnDuration } from './turn-details.mjs'

const event = (type, time, data) => ({ type, seq: time, time, data })
const dataStore = { get: () => undefined }
function turn({ status = 'closed', reason = 'completed', start = 1000, end = 4250, steps = [] } = {}) {
  return {
    turn: 7,
    status,
    start: start === null ? undefined : event('turn/start', start, { turn: 7 }),
    end: end === null ? undefined : event('turn/end', end, { turn: 7, reason: { kind: reason } }),
    steps,
    data: dataStore,
  }
}
function snapshot(nodes, keys = Object.keys(nodes)) {
  return { order: keys, nodes: { get: key => nodes[key], values: () => Object.values(nodes) }, locations: { getTurn: () => keys, getStep: () => [] }, timeline: { turnOrder: [7], turns: new Map() } }
}
const location = (owner, step) => step === undefined ? { kind: 'turn', turn: owner } : { kind: 'step', turn: owner, step }

test('duration is exact for complete, error and cancel; running never estimates; missing boundaries are unavailable', () => {
  assert.deepEqual(turnDuration(turn()), { state: 'completed', label: '用时 3秒', terminal: '已完成', durationMs: 3250, startTime: 1000, endTime: 4250 })
  assert.match(turnDuration(turn({ reason: 'error' })).terminal, /执行失败/)
  assert.match(turnDuration(turn({ reason: 'aborted' })).terminal, /已取消/)
  const running = turnDuration(turn({ status: 'open', end: null }))
  assert.equal(running.label, '执行中…')
  assert.equal('durationMs' in running, false)
  assert.equal(turnDuration(turn({ start: null })).label, '用时不可用')
  assert.equal(turnDuration(turn({ end: null })).label, '用时不可用')
})

test('details retain public order, visit duplicate keys once and traverse nested subcalls once', () => {
  const owner = turn({ steps: [
    { step: 1, status: 'closed', start: event('step/start', 1100, { turn: 7, step: 1 }), end: event('step/end', 2000, { turn: 7, step: 1 }), data: dataStore },
    { step: 2, status: 'closed', start: event('step/start', 2100, { turn: 7, step: 2 }), end: event('step/end', 4000, { turn: 7, step: 2 }), data: dataStore },
  ] })
  const nodes = {
    context: { kind: 'context', visibility: 'visible', location: location(owner, owner.steps[0]), data: { time: 1150, provenance: { role: 'inject', label: 'PRIVATE' }, content: [{ type: 'text', text: 'SECRET' }] } },
    tool: { kind: 'tool-call', visibility: 'visible', location: location(owner, owner.steps[0]), data: { root: { name: 'read_file', callId: 'root', time: 1200, argsRaw: 'ARGS_SECRET', subCalls: [
      { kind: 'tool-result', callId: 'child', time: 1500, callTime: 1300, call: { name: 'unknown-secret-tool', argsRaw: 'CHILD_ARGS_SECRET' }, content: [{ type: 'text', text: 'RESULT_SECRET' }], meta: { token: 'META_SECRET' }, isError: false, subCalls: [] },
    ] } } },
    retry: { kind: 'model-retry', visibility: 'visible', location: location(owner, owner.steps[1]), data: { attempts: [{ retry: 2, retryState: 'started', delayMs: 250, time: 2300, message: 'RETRY_SECRET' }] } },
    unknown: { kind: 'unknown', visibility: 'visible', location: location(owner, owner.steps[1]), data: { secret: 'UNKNOWN_SECRET' } },
  }
  const chat = snapshot(nodes, ['context', 'tool', 'tool', 'retry', 'unknown'])
  const projected = projectTurnDetails(chat, owner)
  assert.deepEqual(projected.entries.filter(row => row.kind === 'tool').map(row => row.label), ['文件读取', '工具调用'])
  assert.deepEqual(projected.entries.filter(row => row.kind === 'boundary').map(row => row.label), ['步骤 1 开始', '步骤 1 结束', '步骤 2 开始', '步骤 2 结束'])
  assert.ok(projected.entries.findIndex(row => row.label === '上下文注入') < projected.entries.findIndex(row => row.label === '文件读取'))
  assert.equal(projected.entries.some(row => row.kind === 'unknown'), false)
})

test('full details DOM exposes only fixed labels, time, numbers and states', () => {
  const canaries = ['SYSTEM_SECRET', 'CONTEXT_SECRET', 'REASONING_SECRET', 'ARGS_SECRET', 'RESULT_SECRET', 'META_SECRET', 'ERROR_SECRET', 'UNKNOWN_SECRET', 'Bearer credential-secret', 'ENV_SECRET=value']
  const owner = turn()
  const nodes = {
    system: { kind: 'system-prompt', visibility: 'visible', location: location(owner), data: { text: canaries[0] } },
    context: { kind: 'context', visibility: 'visible', location: location(owner), data: { time: 1200, content: [{ text: canaries[1] }], source: { path: canaries[8] }, provenance: { role: 'recall', label: canaries[9] } } },
    assistant: { kind: 'assistant-step', visibility: 'visible', location: location(owner), data: { status: 'settled', time: 2000, blocks: [{ kind: 'reasoning', text: canaries[2] }, { kind: 'text', text: 'VISIBLE_ASSISTANT_BODY_ONLY_IN_CHAT' }] } },
    tool: { kind: 'tool-call', visibility: 'visible', location: location(owner), data: { root: { kind: 'tool-result', callId: 'c', time: 3000, callTime: 2500, call: { name: 'opaque', argsRaw: canaries[3] }, content: [{ type: 'text', text: canaries[4] }], meta: { secret: canaries[5] }, isError: true, error: { name: canaries[6], code: canaries[6] }, subCalls: [] } } },
    unknown: { kind: 'unknown', visibility: 'visible', location: location(owner), data: { secret: canaries[7] } },
  }
  const html = renderToStaticMarkup(createElement(TurnDisclosure, { chat: snapshot(nodes), turn: owner }))
  for (const canary of canaries) assert.doesNotMatch(html, new RegExp(canary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(html, /上下文回忆/)
  assert.match(html, /思考/)
  assert.match(html, /模型回答/)
  assert.match(html, /工具调用/)
  assert.match(html, /执行失败|失败/)
  assert.match(html, /Agent 思考过程摘要/)
  assert.match(html, /读取项目上下文/)
  assert.match(html, /检查交互与响应状态/)
  assert.match(html, /整理思路并形成回答/)
  assert.match(html, /turn-detail-group/)
  assert.match(html, /aria-label="[^"]+项详情"/)
  assert.match(html, /data-testid="shaco-tool"/)
  assert.doesNotMatch(html, /VISIBLE_ASSISTANT_BODY_ONLY_IN_CHAT/)
})
