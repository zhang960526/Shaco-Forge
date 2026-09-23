export const name = 'shaco-forge-host-readiness'
export const inject = ['agentPresets', 'llm', 'shacoForgeProviderExecutionGuard']

interface P8EffectiveState {
  P8_ENABLED: boolean
  SCENARIO_ID?: string
  AUTHORIZATION_ID?: string
  SCENARIO_BUDGET_INITIAL?: number
  SCENARIO_BUDGET_REMAINING?: number
  PROVIDER?: string
  MODEL?: string
  INPUT_CLASS?: string
  RESOLVED_RETRY_MODE?: string
  RESOLVED_MAX_RETRIES?: number
}

interface HarnessContext {
  agentPresets: {
    list(): Promise<unknown[]> | unknown[]
    resolve(id: string): Promise<unknown>
  }
  shacoForgeProviderExecutionGuard: { effectiveState(): P8EffectiveState }
  effect(callback: () => () => void): void
}

export async function collectHostReadiness(ctx: HarnessContext): Promise<Record<string, unknown>> {
  const presets = await ctx.agentPresets.list()
  await ctx.agentPresets.resolve('standard')
  return {
    type: 'shaco-forge-host-ready',
    hostPid: process.pid,
    gatewayPresetCount: presets.length,
    standardPresetPresent: true,
    ...ctx.shacoForgeProviderExecutionGuard.effectiveState(),
  }
}

export function apply(ctx: HarnessContext): void {
  const keepAlive = setInterval(() => undefined, 1_000)
  ctx.effect(() => () => clearInterval(keepAlive))

  void Promise.resolve().then(async () => {
    const readiness = await collectHostReadiness(ctx)
    process.stdout.write(`SHACO_FORGE_HOST_READY ${JSON.stringify(readiness)}\n`)
  }).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`SHACO_FORGE_HOST_READINESS_FAILED ${JSON.stringify({ message })}\n`)
    process.exitCode = 1
    process.emit('SIGTERM')
  })
}
