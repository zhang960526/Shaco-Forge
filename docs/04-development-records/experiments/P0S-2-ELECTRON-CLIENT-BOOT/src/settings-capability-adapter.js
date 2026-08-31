(function registerP0S2SettingsCapabilityAdapter() {
  'use strict'

  const PACKAGE_ID = '@shaco-forge/p0s2-settings-capability-adapter'
  const SETTINGS_NS = 'p0s2-canary'
  const ALLOWED = new Set([
    'settings/describe',
    'settings/update',
    'settings/replace',
    'settings/mutate',
  ])

  window.__ModuleLoader__.load({
    id: PACKAGE_ID,
    factory: () => ({
      inject: ['connection', 'remote', 'remote.settings'],
      async apply(ctx) {
        const bridge = globalThis.p0s2Bridge
        if (bridge === undefined || typeof bridge.settingsRpc !== 'function') {
          throw new Error('P0.S-2 settings bridge is unavailable')
        }

        const originalCall = ctx.connection.rpc.call.bind(ctx.connection.rpc)
        ctx.connection.rpc.call = async (channel, endpoint, payload, signal) => {
          if (channel === '/api' && ALLOWED.has(endpoint)) {
            if (signal?.aborted === true) {
              return { ok: false, error: { code: 'cancelled', message: 'settings call aborted', details: {} } }
            }
            return bridge.settingsRpc(endpoint, payload)
          }
          return originalCall(channel, endpoint, payload, signal)
        }

        try {
          const request = await bridge.runRequest()
          const before = await ctx.remote.settings.describe()
          if (!before.ok) throw new Error(`settings.describe failed: ${before.error.message}`)
          const beforeNamespace = before.value.namespaces.find((row) => row.ns === SETTINGS_NS)
          if (beforeNamespace === undefined) throw new Error(`settings namespace ${SETTINGS_NS} missing`)

          let mutation = null
          if (request.runMode === 'write') {
            mutation = await ctx.remote.settings.mutate(
              SETTINGS_NS,
              [{ op: 'set', path: ['canary'], value: request.canary }],
              beforeNamespace.revision,
            )
            if (!mutation.ok) throw new Error(`settings.mutate failed: ${mutation.error.message}`)
          }

          const after = await ctx.remote.settings.describe()
          if (!after.ok) throw new Error(`settings.describe after operation failed: ${after.error.message}`)
          const afterNamespace = after.value.namespaces.find((row) => row.ns === SETTINGS_NS)
          if (afterNamespace === undefined) throw new Error(`settings namespace ${SETTINGS_NS} missing after operation`)
          const observedCanary = afterNamespace.value?.canary

          globalThis.__P0S2_SETTINGS_RESULT__ = {
            ok: observedCanary === request.canary,
            contract: 'ctx.remote.settings.describe/mutate',
            persistenceMode: 'host',
            provider: '@deepseek-ai/dsh-settings-file',
            namespace: SETTINGS_NS,
            runMode: request.runMode,
            expectedCanary: request.canary,
            observedCanary,
            writable: after.value.writable,
            hasDocument: after.value.hasDocument,
            revisionBefore: beforeNamespace.revision,
            revisionAfter: afterNamespace.revision,
            mutationOk: mutation === null ? null : mutation.ok,
          }
        } catch (error) {
          globalThis.__P0S2_SETTINGS_RESULT__ = {
            ok: false,
            contract: 'ctx.remote.settings.describe/mutate',
            persistenceMode: 'host',
            provider: '@deepseek-ai/dsh-settings-file',
            namespace: SETTINGS_NS,
            error: error instanceof Error ? error.message : String(error),
          }
        }
      },
    }),
  })
})()

