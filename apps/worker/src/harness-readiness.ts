export const name = 'shaco-forge-host-readiness'
export const inject = ['agentPresets']

interface HarnessContext {
  agentPresets: {
    list(): Promise<unknown[]> | unknown[]
    resolve(id: string): Promise<unknown>
  }
  effect(callback: () => () => void): void
}

export function apply(ctx: HarnessContext): void {
  const keepAlive = setInterval(() => undefined, 1_000)
  ctx.effect(() => () => clearInterval(keepAlive))

  void Promise.resolve().then(async () => {
    const presets = await ctx.agentPresets.list()
    await ctx.agentPresets.resolve('standard')
    const readiness = {
      type: 'shaco-forge-host-ready',
      hostPid: process.pid,
      gatewayPresetCount: presets.length,
      standardPresetPresent: true,
    }
    process.stdout.write(`SHACO_FORGE_HOST_READY ${JSON.stringify(readiness)}\n`)
  }).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`SHACO_FORGE_HOST_READINESS_FAILED ${JSON.stringify({ message })}\n`)
    process.exitCode = 1
    process.emit('SIGTERM')
  })
}
