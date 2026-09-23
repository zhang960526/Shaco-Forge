import { createElement as h } from 'react'

const TERMINAL_LABELS = {
  completed: '已完成',
  error: '执行失败',
  aborted: '已取消',
  blocked: '已阻止',
  'max-tokens': '达到输出上限',
  interrupted: '异常中断',
}
const RETRY_LABELS = { scheduled: '等待重试', started: '正在重试', cancelled: '重试已取消' }

const boundaryTime = boundary => Number.isFinite(boundary?.time) ? boundary.time : undefined
const terminalKind = turn => typeof turn?.end?.data?.reason?.kind === 'string' ? turn.end.data.reason.kind : undefined
const timeText = time => new Date(time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export function turnDuration(turn) {
  const start = boundaryTime(turn?.start)
  const end = boundaryTime(turn?.end)
  const terminal = TERMINAL_LABELS[terminalKind(turn)] ?? (turn?.status === 'closed' ? '已结束' : '')
  if (turn?.status === 'open' && start !== undefined) {
    return { state: 'running', label: '执行中…', terminal: '', startTime: start }
  }
  if (turn?.status !== 'closed' || start === undefined || end === undefined) {
    return { state: 'unavailable', label: '用时不可用', terminal }
  }
  const durationMs = Math.max(0, end - start)
  return { state: terminalKind(turn) ?? 'closed', label: `用时 ${formatDuration(durationMs)}`, terminal, durationMs, startTime: start, endTime: end }
}

export function formatDuration(durationMs) {
  const milliseconds = Math.max(0, Math.floor(durationMs))
  if (milliseconds < 1000) return `${milliseconds}毫秒`
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const remainderSeconds = seconds % 60
  const remainderMinutes = minutes % 60
  if (hours > 0) return `${hours}小时${remainderMinutes}分${remainderSeconds}秒`
  if (minutes > 0) return `${minutes}分${remainderSeconds}秒`
  return `${seconds}秒`
}

function safeToolLabel(name) {
  if (typeof name !== 'string') return '工具调用'
  if (name === 'read_file' || name === 'read' || name.startsWith('file_read')) return '文件读取'
  if (name === 'search' || name === 'grep' || name === 'rg' || name.startsWith('search_')) return '搜索'
  if (name === 'command' || name === 'exec' || name === 'exec_command' || name.startsWith('command_')) return '命令'
  if (name === 'subagent' || name.startsWith('subagent_')) return '子任务'
  return '工具调用'
}

function toolName(block) {
  return 'kind' in block ? block.call?.name : block.name
}

function toolEntry(block, depth) {
  const label = safeToolLabel(toolName(block))
  const settled = 'kind' in block
  const interrupted = settled && block.isError === true && block.error?.code === 'interrupted'
  const state = !settled ? 'running' : interrupted ? 'interrupted' : block.isError === true ? 'error' : 'settled'
  const stateLabel = !settled ? '执行中' : interrupted ? '已中断' : block.isError === true ? '失败' : '已返回'
  const entry = {
    kind: label === '子任务' ? 'subagent' : 'tool',
    label: label === '子任务' ? '子任务委派' : label,
    state,
    stateLabel,
    depth,
    time: boundaryTime(settled ? block.callTime ?? block.time : block.time),
  }
  const children = Array.isArray(block.subCalls) ? block.subCalls.flatMap(child => toolEntries(child, depth + 1)) : []
  return [entry, ...children]
}

function toolEntries(block, depth = 0) {
  return block && typeof block === 'object' ? toolEntry(block, depth) : []
}

function nodeEntries(node) {
  if (!node || node.visibility === 'hidden') return []
  const data = node.data
  if (node.kind === 'system-prompt') return [{ kind: 'preparation', label: '系统准备', state: 'prepared', stateLabel: '已准备' }]
  if (node.kind === 'context') {
    const recall = data?.provenance?.role === 'recall'
    return [{ kind: 'preparation', label: recall ? '上下文回忆' : '上下文注入', state: 'prepared', stateLabel: recall ? '回忆' : '注入', time: boundaryTime(data?.time) }]
  }
  if (node.kind === 'assistant-step') {
    const reasoning = Array.isArray(data?.blocks) && data.blocks.some(block => block?.kind === 'reasoning')
    const rows = reasoning ? [{ kind: 'reasoning', label: data?.status === 'running' ? '分析中' : '思考', state: data?.status === 'running' ? 'running' : 'settled' }] : []
    const visible = Array.isArray(data?.blocks) && data.blocks.some(block => block?.kind === 'text' || block?.kind === 'image')
    return visible ? [...rows, { kind: 'assistant', label: data?.status === 'running' ? '回答中' : '模型回答', state: data?.status ?? 'settled', time: boundaryTime(data?.time) }] : rows
  }
  if (node.kind === 'tool-call') return toolEntries(data?.root)
  if (node.kind === 'model-retry') return (Array.isArray(data?.attempts) ? data.attempts : []).map(attempt => ({
    kind: 'retry', label: '模型重试', state: RETRY_LABELS[attempt?.retryState] ? attempt.retryState : 'scheduled',
    stateLabel: RETRY_LABELS[attempt?.retryState] ?? RETRY_LABELS.scheduled,
    attempt: Number.isSafeInteger(attempt?.retry) && attempt.retry >= 0 ? attempt.retry : undefined,
    delayMs: Number.isFinite(attempt?.delayMs) && attempt.delayMs >= 0 ? attempt.delayMs : undefined,
    time: boundaryTime(attempt?.time),
  }))
  if (node.kind === 'command' || node.kind === 'manual-compaction') {
    const command = node.kind === 'manual-compaction' ? data?.command : data
    const state = command?.outcome === null ? 'running' : command?.outcome?.kind === 'error' ? 'error' : 'settled'
    return [{ kind: 'command', label: node.kind === 'manual-compaction' ? '上下文整理' : '命令', state,
      stateLabel: state === 'running' ? '执行中' : state === 'error' ? '失败' : '已完成', time: boundaryTime(command?.time) }]
  }
  if (node.kind === 'compaction') return [{ kind: 'preparation', label: '上下文整理', state: 'settled', stateLabel: '已完成', time: boundaryTime(data?.time) }]
  return []
}

function stepNumber(node) {
  return node?.location?.kind === 'step' && Number.isSafeInteger(node.location.step?.step) ? node.location.step.step : undefined
}

export function projectTurnDetails(chat, turn) {
  const details = []
  const visited = new Set()
  let activeStep
  for (const key of chat?.locations?.getTurn(turn?.turn) ?? []) {
    if (visited.has(key)) continue
    visited.add(key)
    const node = chat.nodes.get(key)
    const step = stepNumber(node)
    if (step !== undefined && step !== activeStep) {
      if (activeStep !== undefined) {
        const previous = turn.steps?.find(candidate => candidate.step === activeStep)
        if (previous?.status === 'closed') details.push({ kind: 'boundary', label: `步骤 ${activeStep} 结束`, state: 'end', step: activeStep, time: boundaryTime(previous.end) })
      }
      const location = turn.steps?.find(candidate => candidate.step === step)
      details.push({ kind: 'boundary', label: `步骤 ${step} 开始`, state: 'start', step, time: boundaryTime(location?.start) })
      activeStep = step
    }
    details.push(...nodeEntries(node))
  }
  if (activeStep !== undefined) {
    const location = turn.steps?.find(candidate => candidate.step === activeStep)
    if (location?.status === 'closed') details.push({ kind: 'boundary', label: `步骤 ${activeStep} 结束`, state: 'end', step: activeStep, time: boundaryTime(location.end) })
  }
  const duration = turnDuration(turn)
  if (turn?.status === 'closed') details.push({ kind: 'terminal', label: duration.terminal || '已结束', state: duration.state, time: boundaryTime(turn.end) })
  return { turn: turn?.turn, duration, entries: details }
}

function detailPhase(entry) {
  if (entry.kind === 'preparation' || (entry.kind === 'tool' && (entry.label === '文件读取' || entry.label === '搜索'))) return 'context'
  if (entry.kind === 'tool' || entry.kind === 'subagent' || entry.kind === 'retry' || entry.kind === 'command') return 'execution'
  if (entry.kind === 'reasoning' || entry.kind === 'assistant') return 'response'
  return 'status'
}

const PHASE_LABELS = {
  context: '读取项目上下文',
  execution: '检查交互与响应状态',
  response: '整理思路并形成回答',
  status: '查看运行状态',
}

function groupEntries(entries) {
  const groups = []
  let current
  let pending = []
  const start = (phase, entry) => {
    current = { phase, label: PHASE_LABELS[phase], entries: [...pending, entry] }
    pending = []
    groups.push(current)
  }
  for (const entry of entries) {
    if (entry.kind === 'boundary' && entry.state === 'start') {
      pending.push(entry)
      current = undefined
      continue
    }
    if (entry.kind === 'boundary' && entry.state === 'end') {
      if (current) current.entries.push(entry)
      else pending.push(entry)
      current = undefined
      continue
    }
    const phase = detailPhase(entry)
    if (!current || current.phase !== phase) start(phase, entry)
    else current.entries.push(entry)
  }
  if (pending.length > 0) {
    groups.push({ phase: 'status', label: PHASE_LABELS.status, entries: pending })
  }
  return groups
}

function summaryText(groups) {
  const labels = [...new Set(groups.map(group => group.label))]
  if (labels.length === 0) return '本轮暂无可展示的公开过程细节。'
  return `本轮公开过程包括${labels.join('、')}；展开下方分组可查看全部公开细节。`
}

function DetailEntry({ entry }) {
  return h('li', { 'data-detail-kind': entry.kind,
    'data-tool-state': entry.kind === 'tool' || entry.kind === 'subagent' ? entry.state : undefined,
    style: entry.depth ? { '--turn-detail-indent': `${entry.depth * 16}px` } : undefined },
  h('span', { className: 'turn-detail-content' }, entry.label, entry.attempt !== undefined && h('span', null, ` ${entry.attempt}`),
    entry.delayMs !== undefined && h('span', null, ` · ${entry.delayMs}毫秒`),
    entry.stateLabel && h('span', null, ` · ${entry.stateLabel}`)),
  entry.time !== undefined && h('time', { dateTime: new Date(entry.time).toISOString() }, timeText(entry.time)))
}

export function TurnDisclosure({ chat, turn }) {
  if (!turn) return null
  const projected = projectTurnDetails(chat, turn)
  const summary = [projected.duration.label, projected.duration.terminal].filter(Boolean).join(' · ')
  const containsTool = projected.entries.some(entry => entry.kind === 'tool' || entry.kind === 'subagent')
  const groups = groupEntries(projected.entries)
  const details = groups.length === 0
    ? h('p', { className: 'turn-detail-empty' }, '暂无可用步骤')
    : h('div', { className: 'turn-detail-groups', 'aria-label': `第 ${turn.turn} 轮执行详情` },
      groups.map((group, groupIndex) => h('details', { className: 'turn-detail-group', key: groupIndex },
        h('summary', { 'aria-label': `${group.label}，${group.entries.length} 项详情` },
          h('span', { className: 'turn-group-chevron', 'aria-hidden': 'true' }),
          h('span', { className: 'turn-group-title' }, group.label),
          h('span', { className: 'turn-group-count', 'aria-hidden': 'true' }, group.entries.length)),
        h('ol', { className: 'turn-detail-list' },
          group.entries.map((entry, entryIndex) => h(DetailEntry, { key: entryIndex, entry }))))))
  return h('details', { className: 'shaco-tool shaco-turn-details', 'data-testid': containsTool ? 'shaco-tool' : undefined, 'data-turn-details': String(turn.turn) },
    h('summary', { 'aria-label': `${summary}，执行详情`, title: summary },
      h('span', { className: 'turn-duration' }, projected.duration.label), h('span', { className: 'turn-chevron', 'aria-hidden': 'true' })),
    h('div', { className: 'turn-details-content' },
      h('section', { className: 'turn-summary-block', 'aria-labelledby': `turn-summary-${turn.turn}` },
        h('h3', { id: `turn-summary-${turn.turn}` }, 'Agent 思考过程摘要'),
        h('p', null, summaryText(groups))),
      details))
}
