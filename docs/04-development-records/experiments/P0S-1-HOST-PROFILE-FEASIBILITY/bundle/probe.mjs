/**
 * NOT_PRODUCTION P0.S-1 evidence probe. This is deliberately a disposable
 * liveness witness, not a Production Worker main or product control plane.
 */
import { createHash, randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export const name = 'p0s1-host-probe'
export const inject = [
  'loader',
  'agents',
  'tools',
  'agentPresets',
  'typert',
  'typertGateway',
  'connection',
  'workspaceRegistry',
  'sessionController',
  'settingsController',
  'workspaceController',
]

const requiredTools = [
  'pwsh',
  'read',
  'write',
  'edit',
  'grep',
  'glob',
  'ask_user_question',
  'subagent',
  'send_message',
  'interrupt_agent',
  'list_agents',
]

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function safeContent(result) {
  return (result.content ?? []).map(block => {
    if (block && typeof block === 'object' && block.type === 'text') {
      return { type: 'text', text: String(block.text).slice(0, 800) }
    }
    return { type: block?.type ?? 'unknown' }
  })
}

async function executeTool(ctx, agent, toolName, args) {
  const controller = new AbortController()
  const result = await ctx.tools.execute({
    callId: randomUUID(),
    name: toolName,
    arguments: args,
    agent,
    signal: controller.signal,
  })
  return {
    toolName,
    isError: result.isError,
    error: result.isError
      ? { code: result.error?.code ?? 'UNKNOWN', message: result.error?.message ?? 'tool failed' }
      : undefined,
    content: safeContent(result),
  }
}

function summarizeTypertPackage(record) {
  return {
    name: record.name ?? record.packageName ?? record.package ?? null,
    face: record.face ?? null,
    serviceNames: (record.model?.services ?? []).map(service => service.key),
    eventNames: (record.model?.events ?? []).map(event => event.name),
    objectNames: (record.model?.objects ?? []).map(object => object.name),
    keys: Object.keys(record).sort(),
  }
}

export function apply(ctx) {
  const readyFile = process.env.P0S1_READY_FILE
  const failureFile = process.env.P0S1_FAILURE_FILE
  const heartbeatFile = process.env.P0S1_HEARTBEAT_FILE
  const disposedFile = process.env.P0S1_DISPOSED_FILE
  const stopFile = process.env.P0S1_STOP_FILE
  const workspace = process.env.P0S1_WORKSPACE

  let active = true
  let stopping = false
  let agentHandle
  let heartbeatCount = 0

  const heartbeat = setInterval(() => {
    heartbeatCount += 1
    writeJson(heartbeatFile, {
      pid: process.pid,
      heartbeatCount,
      timestamp: new Date().toISOString(),
    })
    if (!stopping && existsSync(stopFile)) {
      stopping = true
      process.emit('SIGTERM')
    }
  }, 250)

  ctx.effect(() => async () => {
    active = false
    clearInterval(heartbeat)
    if (agentHandle) {
      try {
        await agentHandle.dispose()
      } catch {
        // Root disposal may already own the agent factory teardown.
      }
    }
    writeJson(disposedFile, {
      pid: process.pid,
      disposedAt: new Date().toISOString(),
      gracefulDisposalObserved: true,
    })
  })

  // This Host-only composition deliberately leaves optional providers (for
  // example a future directory-picker backend) pending. Whole-tree
  // loader.await() would therefore never describe REQUIRED Host readiness.
  // The hard inject list above is the readiness barrier for this spike; one
  // short turn lets Typert's incremental loader observe the active entries.
  void new Promise(resolve => setTimeout(resolve, 1000)).then(async () => {
    const standard = await ctx.agentPresets.resolve('standard')
    const standardText = await ctx.agentPresets.read('standard')
    const standardHash = createHash('sha256').update(standardText, 'utf8').digest('hex')

    agentHandle = await ctx.agents.create({
      sessionId: randomUUID(),
      meta: {
        cwd: workspace,
        agentPreset: 'standard',
      },
      setup: async agentCtx => {
        await ctx.agentPresets.mount(agentCtx, 'standard')
      },
    })

    const agent = agentHandle.agent
    const toolProbeFile = join(workspace, `p0s1-tool-probe-${process.pid}.txt`)

    const schemas = ctx.tools.schemas(agent)
    const schemaNames = schemas.map(schema => schema.name)
    const toolsPresent = Object.fromEntries(requiredTools.map(tool => [tool, schemaNames.includes(tool)]))

    const toolResults = []
    // The frozen Windows ACL restricted-token runner is unavailable on this
    // host. Exercise only this inert marker under the Harness-owned explicit
    // session policy, then immediately restore the normal workspace boundary.
    agent.session.append('sandbox/mode', { mode: 'danger-full-access' })
    toolResults.push(await executeTool(ctx, agent, 'pwsh', {
      command: 'Write-Output P0S1_PWSH_OK',
      description: 'Emit P0S1 PowerShell probe marker',
      timeoutMs: 10000,
      workdir: workspace,
    }))
    agent.session.append('sandbox/mode', { mode: 'workspace-write' })
    toolResults.push(await executeTool(ctx, agent, 'write', {
      file_path: toolProbeFile,
      content: 'P0S1_ALPHA\n',
    }))
    toolResults.push(await executeTool(ctx, agent, 'read', {
      file_path: toolProbeFile,
    }))
    toolResults.push(await executeTool(ctx, agent, 'edit', {
      file_path: toolProbeFile,
      old_string: 'P0S1_ALPHA',
      new_string: 'P0S1_BETA',
    }))
    toolResults.push(await executeTool(ctx, agent, 'grep', {
      pattern: 'P0S1_BETA',
      path: workspace,
      include: '*.txt',
    }))
    toolResults.push(await executeTool(ctx, agent, 'glob', {
      pattern: '**/*.txt',
      path: workspace,
    }))
    toolResults.push(await executeTool(ctx, agent, 'ask_user_question', {
      questions: [{
        id: 'p0s1-safe-question',
        question: 'Confirm the isolated P0.S-1 question seam.',
        options: [{ label: 'Continue', description: 'Use the local automatic spike answerer.' }],
      }],
    }))
    toolResults.push(await executeTool(ctx, agent, 'list_agents', { scope: 'children' }))
    toolResults.push(await executeTool(ctx, agent, 'send_message', {
      subagent_id: '00000000-0000-4000-8000-000000000001',
      message: 'P0.S-1 controlled missing-child probe',
    }))
    toolResults.push(await executeTool(ctx, agent, 'interrupt_agent', {
      agent_id: '00000000-0000-4000-8000-000000000001',
    }))

    const exactRouteDisposer = ctx.connection.fetch.register({
      path: '/api/p0s1-connection-probe',
      methods: ['GET'],
      fetch: async () => new Response('P0S1_CONNECTION_OK', { status: 200 }),
    })
    const sharedHandler = ctx.connection.createSharedFetchHandler('/api')
    const connectionResponse = await sharedHandler.fetch(
      new Request('http://127.0.0.1/api/p0s1-connection-probe', { method: 'GET' }),
    )
    const connectionBody = await connectionResponse.text()
    await exactRouteDisposer()

    const typertPackages = ctx.typert.listPackages().map(summarizeTypertPackage)
    const typertInvocations = ctx.typert.local.list().map(record => ({
      id: record.id,
      endpoint: `${record.namespace}/${record.method}`,
      service: record.service,
      mode: record.mode ?? null,
    }))
    const typertSchemas = ctx.typert.list().map(record => ({
      key: record.key ?? record.id ?? null,
      packageName: record.packageName ?? record.package ?? null,
      face: record.face ?? null,
    }))
    const gatewayPresetList = await ctx.typertGateway.invoke({
      namespace: 'agentPresets',
      method: 'list',
      args: {},
    })

    const evidence = {
      classification: 'NOT_PRODUCTION',
      profileIdentity: '@shaco-forge/not-production-p0s1-host-profile',
      profileName: 'shaco-host',
      bundleIdentity: '@shaco-forge/not-production-p0s1-host-bundle',
      composition: ['@deepseek-ai/dsh-base', '@shaco-forge/not-production-p0s1-host-bundle'],
      pid: process.pid,
      nodeExecutable: process.execPath,
      nodeVersion: process.version,
      cwd: process.cwd(),
      dshHome: process.env.DSH_HOME,
      readyAt: new Date().toISOString(),
      services: {
        hostRuntime: true,
        agents: Boolean(ctx.agents),
        gateway: Boolean(ctx.typertGateway),
        gatewayInvoke: typeof ctx.typertGateway.invoke === 'function',
        gatewayStream: typeof ctx.typertGateway.stream === 'function',
        gatewayWireStream: typeof ctx.typertGateway.wireStream?.open === 'function',
        typert: Boolean(ctx.typert),
        connection: Boolean(ctx.connection),
        connectionRpc: Boolean(ctx.connection?.rpc),
        connectionFetch: Boolean(ctx.connection?.fetch),
        workspaceRegistry: Boolean(ctx.workspaceRegistry),
        sessionController: Boolean(ctx.sessionController),
        settingsController: Boolean(ctx.settingsController),
        workspaceController: Boolean(ctx.workspaceController),
        webServer: Boolean(ctx.get('webServer')),
      },
      connectionCompatibility: {
        className: ctx.connection?.constructor?.name ?? null,
        publicRootExportUsed: 'HostConnectionService',
        browserAuthConstructed: false,
        listening: false,
        tokenUrlMinted: false,
        failClosedUnauthenticatedStatus: ctx.connection.requestRejection({
          headers: { host: '127.0.0.1' },
        }),
        exactFetchProbe: {
          status: connectionResponse.status,
          body: connectionBody,
        },
      },
      standardPreset: {
        id: standard.id,
        trust: standard.trust,
        path: standard.path,
        broken: standard.broken ?? null,
        sha256: standardHash,
        defaultId: ctx.agentPresets.defaultId,
        includeShippedRoot: ctx.agentPresets.roots.some(root => root.trust === 'system'),
        includeUserRoot: ctx.agentPresets.roots.some(root => root.trust === 'user'),
        continuableSubagentConfigured: /backgroundMode:\s*continuable/.test(standardText),
        controlPluginConfigured: /dsh-tool-subagent-control/.test(standardText),
        copiedOrForked: false,
      },
      tools: {
        required: requiredTools,
        present: toolsPresent,
        allRequiredPresent: Object.values(toolsPresent).every(Boolean),
        schemaNames,
        safeUsability: toolResults,
        subagentExecutionOmitted: 'No model call or credential use is allowed in this isolated spike.',
      },
      remoteSurface: {
        packageCount: typertPackages.length,
        invocationCount: typertInvocations.length,
        schemaCount: typertSchemas.length,
        packages: typertPackages,
        invocations: typertInvocations,
        schemas: typertSchemas,
        gatewayPresetListProbe: {
          returnedRoster: Boolean(gatewayPresetList)
            && typeof gatewayPresetList === 'object'
            && Array.isArray(gatewayPresetList.presets),
          containsStandard: Boolean(gatewayPresetList)
            && typeof gatewayPresetList === 'object'
            && Array.isArray(gatewayPresetList.presets)
            && gatewayPresetList.presets.some(preset => preset?.id === 'standard'),
        },
      },
      stockWebExclusion: {
        dshWebAppComposed: false,
        dshHostWebserverComposed: false,
        browserOpenerComposed: false,
        tokenUrlBootstrapComposed: false,
        clientHmrComposed: false,
        clientModulesComposed: false,
        spaFallbackComposed: false,
        lanProductListenerComposed: false,
      },
    }

    if (active) writeJson(readyFile, evidence)
  }).catch(error => {
    writeJson(failureFile, {
      pid: process.pid,
      failedAt: new Date().toISOString(),
      name: error?.name ?? 'Error',
      message: error?.message ?? String(error),
      stack: error?.stack ?? null,
    })
  })
}
