// NOT_PRODUCTION_TEST_ONLY_HOST_INTERACTION_FIXTURE.
// Real Host services own the Session, Agent, pending waterfall and settlement.
import { createHash } from 'node:crypto'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { createUserMessage, createMessage, createToolResultMessage } from '@deepseek-ai/dsh-llm'

export const name = 'shaco-step3-test-only-interactions'
export const inject = ['agents', 'sessionController', 'approval', 'userQuestions']
const hash = value => createHash('sha256').update(value).digest('hex')
const initializers = []
const methodContext = name => ({ kind: 'method', name, static: false, private: false,
  access: { has: object => name in object, get: object => object[name] },
  addInitializer: initialize => initializers.push(initialize) })

class InteractionFixture extends TypertRemoteService {
  constructor(ctx) {
    super(ctx, 'shacoStep3TestInteractions', { namespace: 'shacoStep3TestOnly' })
    this.ctx = ctx
    this.agent = undefined
    this.cancelCalls = 0
    this.agentExecutionCalls = 0
    this.states = {}
    for (const initialize of initializers) initialize.call(this)
  }

  async ensure(request) {
    if (this.agent) {
      if (this.agent.id !== request.sessionId) throw new Error('TEST_SESSION_BINDING_CHANGED')
      return this.status()
    }
    const resolved = await this.ctx.sessionController.resolveAgent(request.sessionId)
    if (!resolved.agent) throw new Error('TEST_REAL_AGENT_REQUIRED')
    this.agent = resolved.agent
    if (this.ctx.agents.get(this.agent.id) !== this.agent) throw new Error('TEST_AGENT_REGISTRY_MISMATCH')
    const cancel = this.agent.cancel.bind(this.agent)
    this.agent.cancel = (...args) => { this.cancelCalls++; return cancel(...args) }
    // Test-only tripwires. No prompt, Tool or Agent execution is admitted.
    for (const method of ['followup', 'steer', 'inject']) {
      this.agent[method] = () => { this.agentExecutionCalls++; throw new Error('TEST_AGENT_EXECUTION_FORBIDDEN') }
    }
    return this.status()
  }

  trigger(request) {
    const kind = request.kind
    if (!['approval', 'question', 'plan', 'multi'].includes(kind) || !this.agent) throw new Error('TEST_INVALID_TRIGGER')
    if (this.states[kind]) throw new Error('TEST_REPLAY_TRIGGER_FORBIDDEN')
    const state = this.states[kind] = { calls: 1, pending: 1, settlements: 0, failures: 0, cancelled: 0 }
    const agent = this.agent
    const run = async () => {
      if (kind === 'approval') {
        // Harness requires an audit enclosure; this does not run the Agent
        // driver, enqueue a message, emit a step, invoke a Tool or a Provider.
        const turn = 1 + agent.session.events.filter(event => event.type === 'turn/start').length
        agent.session.append('turn/start', { turn })
        try {
          const outcome = await this.ctx.approval.request({ agent,
            toolName: 'shaco-review026-not-production-fixture',
            reason: 'REVIEW026 deterministic approval lifecycle' })
          state.outcome = outcome
          if (outcome === 'cancelled') state.cancelled++
        } finally {
          agent.session.append('turn/end', { turn, reason: { kind: 'completed' } })
        }
      } else {
        const questions = kind === 'plan' ? [{ id: 'plan-choice', header: '实现计划', question: '是否批准此本地计划？', detail: '## 计划\n\n保持公开业务对象，完成展示验证。',
          intent: { kind: 'plan-review', approve: '批准方案' }, options: [{ label: '继续讨论' }, { label: '批准方案' }] }] : kind === 'multi' ? [
          { id: 'multi-choice', header: '验证范围', question: '选择需要验证的项目', multiSelect: true, detail: '可选择多个项目。', options: [{label:'Alpha'},{label:'Beta'}] },
          { id: 'custom-choice', header: '补充说明', question: '填写本地验证说明', options: [] },
        ] : [{
          id: 'review026-choice', header: 'REVIEW026',
          question: 'REVIEW026 deterministic question lifecycle',
          options: [{ label: 'Alpha', description: 'First fixture choice.' }, { label: 'Beta', description: 'Second fixture choice.' }],
        }]
        const answer = await this.ctx.userQuestions.ask({ agent, questions })
        state.expectedAnswer = kind === 'plan' ? answer.answers?.[0]?.selected?.[0] === '批准方案' : kind === 'multi' ?
          JSON.stringify(answer.answers?.[0]?.selected) === JSON.stringify(['Alpha','Beta']) && answer.answers?.[1]?.custom === '本地验证，无外部调用' : answer.answers?.[0]?.selected?.[0] === 'Beta'
      }
      state.settlements++
    }
    void run().catch(() => { state.failures++ }).finally(() => { state.pending = 0 })
    return this.status()
  }

  status() {
    const events = this.agent?.session.events ?? []
    return { classification: 'NOT_PRODUCTION_TEST_ONLY_HOST_INTERACTION_FIXTURE', hostPid: process.pid,
      sessionHash: this.agent ? hash(this.agent.id) : null,
      exactLiveAgent: !!this.agent && this.ctx.agents.get(this.agent.id) === this.agent,
      rootAgent: !!this.agent && this.ctx.agents.roots().includes(this.agent),
      agentStatus: this.agent?.status, cancelCalls: this.cancelCalls, agentExecutionCalls: this.agentExecutionCalls,
      stepStarts: events.filter(event => event.type === 'step/start').length,
      approvalAsked: events.filter(event => event.type === 'approval/asked').length,
      approvalDecided: events.filter(event => event.type === 'approval/decided').length,
      states: structuredClone(this.states) }
  }

  presentation(request) {
    // Deterministic recorded/streaming events, never an Agent or Provider turn.
    // Only available inside the existing doubly gated test profile.
    if (!this.agent) throw new Error('TEST_REAL_AGENT_REQUIRED')
    const session = this.agent.session
    const turn = this.visualTurn ?? (this.visualTurn = 100)
    const text = '已检查项目结构。\n\n1. 保留现有会话与工具执行语义。\n2. 完成 Shaco 工作区与双主题展示。\n3. 验证连接恢复和显式交互。\n\n**本地验证记录**：此内容由非 Provider fixture 生成。'
    if (request.state === 'streaming') {
      if (this.visualStarted) throw new Error('TEST_VISUAL_REPLAY_FORBIDDEN')
      this.visualStarted = true
      session.append('turn/start', { turn })
      session.append('user/message', createUserMessage({ content: [{ type: 'text', text: '检查项目结构，并说明主界面的实现与验证顺序。' }], source: { kind: 'user' } }), { surfaceOp: 'append' })
      session.append('step/start', { turn, step: 1 })
      session.append('assistant/chunk', { turn, step: 1, chunk: { type: 'text-delta', index: 0, text } })
    } else if (request.state === 'tool') {
      session.append('tool/call', { turn, step: 1, callId: 'full-shaco-local-tool', name: 'read', arguments: '{"path":"README.md"}' })
    } else if (request.state === 'result') {
      session.append('tool/result', { turn, step: 1, message: createToolResultMessage({ callId: 'full-shaco-local-tool', content: [{ type: 'text', text: '# Shaco Forge\n本地项目说明读取完成。' }], isError: false }) }, { surfaceOp: 'append' })
      session.append('assistant/message', { turn, step: 1, message: createMessage({ role: 'assistant', content: [{ type: 'text', text }], source: { kind: 'model', provider: 'local-presentation-fixture', model: 'no-provider' } }) }, { surfaceOp: 'append' })
      session.append('step/end', { turn, step: 1 })
      session.append('turn/end', { turn, reason: { kind: 'completed' } })
    } else if (request.state === 'error') {
      session.append('turn/start', { turn: 101 })
      session.append('step/start', { turn: 101, step: 1 })
      session.append('turn/end', { turn: 101, reason: { kind: 'error', error: { message: '本地测试：操作失败，结果未被标记为成功。', code: 'TEST_ERROR' } } })
    } else if (request.state === 'history') {
      if(this.historyAdded)throw new Error('TEST_HISTORY_REPLAY_FORBIDDEN')
      this.historyAdded=true
      for(let i=0;i<60;i++)session.append('user/message',createUserMessage({content:[{type:'text',text:`本地历史记录 ${i+1}`}],source:{kind:'user'}}),{surfaceOp:'append'})
    } else throw new Error('TEST_VISUAL_STATE_INVALID')
    return { state: request.state, realSessionAppend: true, assembledByFrozenHarness: true, providerRuns: 0, agentExecutions: this.agentExecutionCalls }
  }
}
for (const method of ['ensure', 'trigger', 'status', 'presentation']) Remote(InteractionFixture.prototype[method], methodContext(method))
export function apply(ctx) {
  if (process.env.SHACO_FORGE_HARNESS_PROFILE_NAME !== 'shaco-forge-step3-lifecycle-proof'
    || process.env.SHACO_FORGE_STEP3_LIFECYCLE_PROOF !== '1') throw new Error('TEST_ONLY_PROFILE_REQUIRED')
  new InteractionFixture(ctx)
}
