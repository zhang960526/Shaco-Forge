import { createElement as h, useEffect, useRef, useState, useSyncExternalStore } from 'react'

function unwrap(result) {
  if (!result.ok) throw new Error('HARNESS_FAILURE')
  return result.value
}

/** Local public reads only: never model discovery, login, probe or provider I/O. */
export async function readSettings(ctx, shell) {
  const token = shell.token()
  const describe = ctx.settingsScope.describe()
  const [registered, declared] = await Promise.all([ctx.remote.llm.listProviders(), ctx.remote.llm.listConfigurableProviders(), describe.ensure()])
  if (!shell.current(token)) throw new Error('STALE_GENERATION')
  const snapshot = describe.getSnapshot()
  if (!snapshot.view || snapshot.error) throw new Error('HARNESS_FAILURE')
  return { registered: unwrap(registered), declared: unwrap(declared), view: snapshot.view }
}

export async function saveProfile(ctx, shell, namespace, path, value, revision) {
  const token = shell.token()
  if (!shell.current(token)) throw new Error('STALE_GENERATION')
  // Missing revision is an unconditional write in Harness. This UI refuses it.
  if (!Number.isInteger(revision)) throw new Error('REVISION_UNAVAILABLE')
  const scope = ctx.settingsScope.bind({ namespace })
  if (scope.getSnapshot().mode !== 'host' || !scope.getSnapshot().writable) throw new Error('HARNESS_FAILURE')
  // The scope's mutate() resolves after rejected writes too. Use the public
  // acknowledged wire face so the UI cannot mistake recovery for success.
  let response
  try { response = await ctx.remote.settings.mutate(namespace, [{ op: 'set', path, value }], revision) }
  catch {
    if (shell.current(token)) {
      const fresh = await ctx.remote.settings.describe().catch(() => undefined)
      if (fresh?.ok && shell.current(token)) for (const view of fresh.value.namespaces) ctx.settingsScope.describe().acceptView(view)
    }
    throw new Error('OUTCOME_UNKNOWN')
  }
  if (!shell.current(token)) throw new Error('STALE_GENERATION')
  ctx.settingsScope.describe().acceptView(unwrap(response))
}

export async function writeCredential(ctx, shell, ref, secret, remove = false) {
  const token = shell.token()
  if (!shell.current(token)) throw new Error('STALE_GENERATION')
  let pending
  try {
    pending = remove ? ctx.remote.credentials.unset(ref) : ctx.remote.credentials.set(ref, secret)
  } finally { secret = '' }
  let response
  try {
    response = await pending
    if (!shell.current(token)) throw new Error('STALE_GENERATION')
  } catch {
    // No revision/exactly-once exists for credentials. Read status, never replay.
    if (shell.current(token)) await ctx.remote.credentials.describe([ref]).catch(() => {})
    throw new Error('OUTCOME_UNKNOWN')
  }
  unwrap(response)
  const metadata = unwrap(await ctx.remote.credentials.describe([ref]))
  if (!shell.current(token)) throw new Error('STALE_GENERATION')
  return metadata
}

function ProfileEditor({ ctx, shell, data, row, onSaved }) {
  const custom = row === undefined
  const namespace = data.view.namespaces.find(item => item.ns === (row?.settingsNs ?? 'llm-pi-ai'))
  const schema = namespace && ctx.settingsSchema.rehydrate(namespace.schema)
  const initial = namespace && row ? ctx.settingsSchema.getPath(namespace.value, row.settingsPath) ?? {} : {}
  const [draft, setDraft] = useState(() => ({ baseURL: initial.baseURL ?? '', displayName: initial.displayName ?? '', apiKeyEnv: initial.apiKeyEnv ?? '', api: initial.api ?? '', models: initial.models ?? [] }))
  const [revision] = useState(namespace?.revision)
  const [route, setRoute] = useState('')
  const [modelId, setModelId] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [credential, setCredential] = useState('')
  const secretInput = useRef(null)
  const token = shell.token()
  const path = row?.settingsPath ?? ['providers', route]
  const profileSchema = schema && ctx.settingsSchema.nodeAtPath(schema, row?.settingsPath ?? ['providers', 'custom-provider'])
  const supports = field => profileSchema && ctx.settingsSchema.nodeAtPath(profileSchema, [field]) !== undefined
  const protocolSchema = profileSchema && ctx.settingsSchema.nodeAtPath(profileSchema, ['api'])
  const protocols = protocolSchema?.list?.map(item => item.value).filter(item => typeof item === 'string') ?? []
  useEffect(() => {
    if (!draft.apiKeyEnv) { setCredential('未配置'); return }
    let live = true
    ctx.remote.credentials.describe([draft.apiKeyEnv]).then(result => {
      if (live && shell.current(token)) {
        const value = unwrap(result)[draft.apiKeyEnv]
        setCredential(value?.configured === true ? '已配置' : '未配置')
      }
    }).catch(() => { if (live && shell.current(token)) setCredential('无法读取状态') })
    return () => { live = false; if (secretInput.current) secretInput.current.value = '' }
  }, [draft.apiKeyEnv])
  const field = (key, label, extra = {}) => !supports(key) ? null : h('label', null, label, h('input', { value: draft[key], disabled: busy, onChange: event => setDraft({ ...draft, [key]: event.target.value }), ...extra }))
  const act = async work => {
    if (busy || !shell.current(token)) return
    setBusy(true); setMessage('')
    try { await work(); if (shell.current(token)) setMessage('已保存') }
    catch (error) {
      if (shell.current(token)) setMessage(/OUTCOME_UNKNOWN/.test(String(error)) ? 'OUTCOME_UNKNOWN：结果未知，已重新读取状态；请确认后再操作。' : '保存未完成，请重新读取并检查配置。')
    } finally { if (shell.current(token)) setBusy(false) }
  }
  const save = () => act(async () => {
    if (custom && (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(route) || data.declared.some(item => item.provider === route) || !draft.baseURL || !draft.api || !draft.models.length)) throw new Error('INVALID_PROFILE')
    const value = { ...initial }
    for (const [key, item] of Object.entries(draft)) if (supports(key)) {
      if (item === '') delete value[key]
      else value[key] = item
    }
    if (ctx.settingsSchema.validate(profileSchema, value)) throw new Error('INVALID_PROFILE')
    await saveProfile(ctx, shell, namespace.ns, path, value, revision)
    onSaved()
  })
  const credentialAction = remove => act(async () => {
    let value = secretInput.current?.value ?? ''
    if (secretInput.current) secretInput.current.value = ''
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(draft.apiKeyEnv) || (!remove && !value)) throw new Error('INVALID_CREDENTIAL')
    let request
    try { request = writeCredential(ctx, shell, draft.apiKeyEnv, value, remove) } finally { value = '' }
    await request
    if (shell.current(token)) setCredential(remove ? '未配置' : '已配置')
  })
  if (!namespace || !profileSchema) return h('p', { role: 'alert' }, '当前 Harness 未提供此 Provider 的可写配置。')
  return h('section', { className: 'settings-editor', 'data-testid': 'provider-editor' },
    h('h3', null, custom ? '添加自定义 Provider / 中转站' : row.displayName),
    custom && h('label', null, 'Route 名称', h('input', { value: route, onChange: event => setRoute(event.target.value), disabled: busy, 'data-testid': 'provider-route' })),
    field('displayName', '显示名称'), field('baseURL', 'API Endpoint / 中转地址', { 'data-testid': 'provider-endpoint' }),
    supports('api') && h('label', null, 'Protocol', h('select', { value: draft.api, onChange: event => setDraft({ ...draft, api: event.target.value }), disabled: busy, 'data-testid': 'provider-protocol' }, h('option', { value: '' }, '使用 Provider 默认协议'), protocols.map(value => h('option', { key: value, value }, value)))),
    supports('models') && h('fieldset', null, h('legend', null, '模型'),
      draft.models.map((model, index) => h('div', { key: index, className: 'model-row' }, h('span', null, model.name || model.id), h('button', { disabled: busy, onClick: () => setDraft({ ...draft, models: draft.models.filter((_, i) => i !== index) }) }, '移除'))),
      h('label', null, '模型 ID', h('input', { value: modelId, onChange: event => setModelId(event.target.value), 'data-testid': 'model-id' })),
      h('button', { disabled: busy || !modelId.trim(), 'data-testid': 'add-model', onClick: () => { setDraft({ ...draft, models: [...draft.models, { id: modelId.trim() }] }); setModelId('') } }, '添加模型')),
    field('apiKeyEnv', 'Credential 引用名称', { autoComplete: 'off' }),
    h('button', { disabled: busy || !data.view.writable || !Number.isInteger(revision), onClick: save, 'data-testid': 'save-provider' }, '保存配置'),
    h('fieldset', null, h('legend', null, 'Credential'), h('p', { 'data-testid': 'credential-status' }, credential),
      h('label', null, 'API Key', h('input', { ref: secretInput, type: 'password', autoComplete: 'new-password', disabled: busy, 'data-testid': 'credential-input' })),
      h('button', { disabled: busy || !draft.apiKeyEnv, onClick: () => credentialAction(false) }, '保存凭据'),
      h('button', { disabled: busy || !draft.apiKeyEnv, onClick: () => credentialAction(true) }, '移除凭据')),
    message && h('p', { role: 'status' }, message))
}

function Appearance() {
  const theme = window.__SHACO_PRESENTATION__.theme
  const state = useSyncExternalStore(theme.subscribe, theme.getSnapshot)
  return h('fieldset', { className: 'appearance-settings' }, h('legend', null, '通用 · 外观'),
    h('label', null, '主题模板', h('select', { value: state.template, 'data-testid': 'theme-template', onChange: event => theme.setThemeTemplate(event.target.value) },
      h('option', { value: 'BRAUN' }, 'Braun'), h('option', { value: 'FAMICOM' }, 'FAMICOM'))),
    h('label', null, '显示模式', h('select', { value: state.mode, 'data-testid': 'theme-mode', onChange: event => theme.setThemeMode(event.target.value) },
      h('option', { value: 'light' }, '浅色'), h('option', { value: 'dark' }, '深色'), h('option', { value: 'system' }, '跟随系统'))))
}

function SettingsPage({ ctx, shell }) {
  const [data, setData] = useState()
  const [selected, setSelected] = useState()
  const [version, setVersion] = useState(0)
  const [error, setError] = useState('')
  useEffect(() => {
    let live = true
    readSettings(ctx, shell).then(value => { if (live) { setData(value); setError('') } }).catch(() => { if (live) setError('无法读取设置，请重新读取。') })
    return () => { live = false }
  }, [version])
  return h('section', { className: 'shaco-settings', 'data-testid': 'settings-surface', 'aria-label': '全局设置', onKeyDown: event => { if (event.key === 'Escape') shell.settings(false) } },
    h('header', null, h('h2', null, '设置'), h('button', { onClick: () => shell.settings(false), autoFocus: true }, '关闭')),
    h(Appearance),
    h('p', null, 'Provider 与模型'), error && h('p', { role: 'alert' }, error),
    h('button', { onClick: () => { setSelected(undefined); setVersion(version + 1) } }, '重新读取'),
    !data ? h('p', null, '正在读取设置…') : h('div', { className: 'settings-columns' },
      h('nav', { 'aria-label': 'Provider' }, data.declared.map(row => h('button', { key: row.provider, 'aria-pressed': selected === row.provider, onClick: () => setSelected(row.provider) }, row.displayName)),
        h('button', { onClick: () => setSelected('__custom__'), 'data-testid': 'custom-provider' }, '+ 自定义 Provider')),
      selected ? h(ProfileEditor, { key: `${selected}:${version}`, ctx, shell, data, row: data.declared.find(row => row.provider === selected), onSaved: () => { setSelected(undefined); setVersion(version + 1) } }) : h('p', null, '选择 Provider，或添加自定义 Provider / 中转站。')))
}

export function SettingsOverlay({ ctx, shell }) {
  const state = useSyncExternalStore(shell.subscribe, shell.getSnapshot)
  return state.settings ? h(SettingsPage, { ctx, shell }) : null
}
