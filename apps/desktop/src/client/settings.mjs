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
  const data = { registered: unwrap(registered), declared: unwrap(declared), view: snapshot.view }
  return { ...data, configured: userConfiguredProviders(ctx, data) }
}

/** Adapter registration, shipped composition and resolved defaults are not user additions. */
export function userConfiguredProviders(ctx, data) {
  return data.declared.filter(row => {
    const namespace = data.view.namespaces.find(item => item.ns === row.settingsNs)
    if (namespace?.user === undefined) return false
    // Harness unset([]) persists {} at the namespace root. Nested empty
    // profiles remain explicit additions; an empty root is the reset state.
    return row.settingsPath.length === 0
      ? Object.keys(namespace.user).length > 0
      : ctx.settingsSchema.hasPath(namespace.user, row.settingsPath)
  })
}

export async function saveProfile(ctx, shell, namespace, path, value, revision) {
  return mutateProfile(ctx, shell, namespace, [{ op: 'set', path, value }], revision)
}

export async function removeProfile(ctx, shell, namespace, path, revision) {
  return mutateProfile(ctx, shell, namespace, [{ op: 'unset', path }], revision)
}

async function mutateProfile(ctx, shell, namespace, ops, revision) {
  const token = shell.token()
  if (!shell.current(token)) throw new Error('STALE_GENERATION')
  // Missing revision is an unconditional write in Harness. This UI refuses it.
  if (!Number.isInteger(revision)) throw new Error('REVISION_UNAVAILABLE')
  const scope = ctx.settingsScope.bind({ namespace })
  if (scope.getSnapshot().mode !== 'host' || !scope.getSnapshot().writable) throw new Error('HARNESS_FAILURE')
  // The scope's mutate() resolves after rejected writes too. Use the public
  // acknowledged wire face so the UI cannot mistake recovery for success.
  let response
  try { response = await ctx.remote.settings.mutate(namespace, ops, revision) }
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

function ProfileEditor({ ctx, shell, data, row, catalog, onSelect, onCancel, onSaved }) {
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
  const editor = useRef(null)
  const secretInput = useRef(null)
  const token = shell.token()
  const path = row?.settingsPath ?? ['providers', route]
  const profileSchema = schema && ctx.settingsSchema.nodeAtPath(schema, row?.settingsPath ?? ['providers', 'custom-provider'])
  const supports = field => profileSchema && ctx.settingsSchema.nodeAtPath(profileSchema, [field]) !== undefined
  const protocolSchema = profileSchema && ctx.settingsSchema.nodeAtPath(profileSchema, ['api'])
  const protocols = protocolSchema?.list?.map(item => item.value).filter(item => typeof item === 'string') ?? []
  useEffect(() => { editor.current?.scrollIntoView({ block: 'nearest' }) }, [])
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
  return h('section', { className: 'settings-editor', ref: editor, 'data-testid': 'provider-editor' },
    catalog ? h('label', null, '提供方', h('select', { value: row.provider, disabled: busy, 'data-testid': 'provider-catalog', onChange: event => onSelect(event.target.value) },
      catalog.map(item => h('option', { key: item.provider, value: item.provider, disabled: data.configured.some(added => added.provider === item.provider) }, item.displayName))))
      : h('h3', null, custom ? '添加自定义 Provider / 中转站' : row.displayName),
    custom && h('label', null, 'Route 名称', h('input', { value: route, onChange: event => setRoute(event.target.value), disabled: busy, 'data-testid': 'provider-route' })),
    field('displayName', '显示名称'), field('baseURL', 'API Endpoint / 中转地址', { 'data-testid': 'provider-endpoint' }),
    supports('api') && h('label', null, 'Protocol', h('select', { value: draft.api, onChange: event => setDraft({ ...draft, api: event.target.value }), disabled: busy, 'data-testid': 'provider-protocol' }, h('option', { value: '' }, '使用 Provider 默认协议'), protocols.map(value => h('option', { key: value, value }, value)))),
    supports('models') && h('fieldset', null, h('legend', null, '模型'),
      draft.models.map((model, index) => h('div', { key: index, className: 'model-row' }, h('span', null, model.name || model.id), h('button', { disabled: busy, onClick: () => setDraft({ ...draft, models: draft.models.filter((_, i) => i !== index) }) }, '移除'))),
      h('label', null, '模型 ID', h('input', { value: modelId, onChange: event => setModelId(event.target.value), 'data-testid': 'model-id' })),
      h('button', { disabled: busy || !modelId.trim(), 'data-testid': 'add-model', onClick: () => { setDraft({ ...draft, models: [...draft.models, { id: modelId.trim() }] }); setModelId('') } }, '添加模型')),
    field('apiKeyEnv', 'Credential 引用名称', { autoComplete: 'off' }),
    h('div', { className: 'settings-form-actions' }, h('button', { disabled: busy, onClick: onCancel }, '取消'), h('button', { className: 'settings-primary', disabled: busy || !data.view.writable || !Number.isInteger(revision), onClick: save, 'data-testid': 'save-provider' }, '保存配置')),
    h('fieldset', { className: 'settings-credentials' }, h('legend', null, 'Credential'), h('p', { 'data-testid': 'credential-status' }, credential),
      h('label', null, 'API Key', h('input', { ref: secretInput, type: 'password', autoComplete: 'new-password', disabled: busy, 'data-testid': 'credential-input' })),
      h('div', { className: 'settings-form-actions' },
        h('button', { disabled: busy || !draft.apiKeyEnv, onClick: () => credentialAction(false) }, '保存凭据'),
        h('button', { className: 'settings-danger', disabled: busy || !draft.apiKeyEnv, onClick: () => credentialAction(true) }, '移除凭据'))),
    message && h('p', { role: 'status' }, message))
}

function Appearance() {
  const theme = window.__SHACO_PRESENTATION__.theme
  const state = useSyncExternalStore(theme.subscribe, theme.getSnapshot)
  return h('div', { className: 'appearance-settings' },
    h('fieldset', { className: 'theme-picker', 'data-testid': 'theme-template' }, h('legend', null, '模板切换'),
      h('p', null, '即时切换，当前对话、输入内容与配置保持不变。'),
      h('div', { className: 'theme-options' }, [
        ['FAMICOM', '红白机 · FAMICOM', '米白 / 灰棕酒红'], ['BRAUN', 'Braun · 工业设备', '暖白 / 炭灰 / 橙红'],
      ].map(([value, label, detail]) => h('label', { key: value, className: `theme-option${state.template === value ? ' is-selected' : ''}` },
        h('input', { type: 'radio', name: 'theme-template', value, checked: state.template === value, 'aria-label': label, onChange: () => theme.setThemeTemplate(value) }),
        h('span', { className: `theme-color theme-color-${value.toLowerCase()}`, 'aria-hidden': true }),
        h('span', { className: 'theme-option-copy' }, h('strong', null, label), h('small', null, detail)),
        state.template === value && h('span', { className: 'control-icon control-icon-check', 'aria-hidden': true }))))),
    h('div', { className: 'settings-appearance' }, h('h3', null, '外观'),
      h('div', { className: 'settings-appearance-options', role: 'group', 'aria-label': '显示模式', 'data-testid': 'theme-mode' },
        [['light', '浅色', 'sun'], ['dark', '深色', 'moon'], ['system', '跟随系统', 'monitor']].map(([value, label, icon]) => h('button', {
          key: value, type: 'button', className: state.mode === value ? 'is-selected' : '', 'aria-pressed': state.mode === value,
          onClick: () => theme.setThemeMode(value),
        }, h('span', { className: `control-icon control-icon-${icon}`, 'aria-hidden': true }), h('span', null, label),
        state.mode === value && h('span', { className: 'control-icon control-icon-check appearance-check', 'aria-hidden': true }))))))
}

function SettingsPage({ ctx, shell }) {
  const [section, setSection] = useState('general')
  const [data, setData] = useState()
  const [selected, setSelected] = useState()
  const [adding, setAdding] = useState(false)
  const [version, setVersion] = useState(0)
  const [error, setError] = useState('')
  const [removing, setRemoving] = useState(false)
  useEffect(() => {
    let live = true
    readSettings(ctx, shell).then(value => { if (live) { setData(value); setError('') } }).catch(() => { if (live) setError('无法读取设置，请重新读取。') })
    return () => { live = false }
  }, [version])
  const remove = async row => {
    if (removing) return
    const token = shell.token()
    setRemoving(true); setError('')
    try {
      const namespace = data.view.namespaces.find(item => item.ns === row.settingsNs)
      await removeProfile(ctx, shell, row.settingsNs, row.settingsPath, namespace?.revision)
      if (shell.current(token)) { setSelected(undefined); setAdding(false); setVersion(value => value + 1) }
    } catch (error) {
      if (shell.current(token)) setError(/OUTCOME_UNKNOWN/.test(String(error))
        ? 'OUTCOME_UNKNOWN：删除结果未知，已重新读取状态；请确认后再操作。'
        : '删除未完成，请重新读取并检查配置。')
    } finally { if (shell.current(token)) setRemoving(false) }
  }
  return h('div', { className: 'settings-backdrop' },
    h('section', { className: 'shaco-settings', 'data-testid': 'settings-surface', role: 'dialog', 'aria-modal': true, 'aria-label': '全局设置', onKeyDown: event => { if (event.key === 'Escape') shell.settings(false) } },
      h('header', { className: 'settings-header' }, h('h2', null, '设置'), h('button', { className: 'settings-close', onClick: () => shell.settings(false), autoFocus: true, 'aria-label': '关闭设置', title: '关闭设置' }, h('span', { className: 'control-icon control-icon-close', 'aria-hidden': true }))),
      h('div', { className: 'settings-body' },
        h('nav', { className: 'settings-nav', 'aria-label': '设置分类' },
          h('button', { 'aria-current': section === 'general' ? 'page' : undefined, onClick: () => setSection('general') }, h('span', { className: 'control-icon control-icon-settings', 'aria-hidden': true }), '通用设置'),
          h('button', { 'aria-current': section === 'models' ? 'page' : undefined, onClick: () => setSection('models') }, h('span', { className: 'control-icon control-icon-models', 'aria-hidden': true }), '模型')),
        h('div', { className: 'settings-content' },
          h('section', { hidden: section !== 'general', className: 'settings-general' },
            h(Appearance)),
          h('section', { hidden: section !== 'models' },
            h('div', { className: 'settings-page-title' },
              h('div', { className: 'settings-page-heading' }, h('h3', null, '模型'), h('button', { onClick: () => { setSelected(undefined); setAdding(false); setVersion(version + 1) } }, '重新读取')),
              h('p', { className: 'settings-description' }, '管理 Provider 与模型，选择提供方以编辑配置。')),
            error && h('p', { role: 'alert' }, error),
            !data ? h('p', null, '正在读取设置…') : h('div', { className: 'settings-columns' },
              h('div', { className: 'settings-provider-list', 'aria-label': 'Provider' }, data.configured.map(row => h('div', { className: `settings-provider-row${selected === row.provider ? ' is-editing' : ''}`, key: row.provider },
                h('div', { className: 'settings-provider-name' }, h('strong', { title: row.displayName }, row.displayName),
                  row.declared === true && h('span', { className: 'settings-custom-label' }, '自定义')),
                h('div', { className: 'settings-provider-actions' }, h('button', { disabled: removing, 'aria-label': `编辑 ${row.displayName}`, 'aria-pressed': selected === row.provider, onClick: () => { setAdding(false); setSelected(row.provider) } }, '编辑'),
                  h('button', { className: 'settings-delete-provider', disabled: removing || !data.view.writable || !Number.isInteger(data.view.namespaces.find(item => item.ns === row.settingsNs)?.revision), 'aria-label': `删除 ${row.displayName}`, onClick: () => remove(row) }, '删除'))))),
              data.configured.length === 0 && h('p', { className: 'settings-description settings-provider-empty', 'data-testid': 'provider-empty' }, '尚未添加提供方'),
              !adding && selected !== '__custom__' && h('div', { className: 'settings-add-actions' },
                h('button', { className: 'settings-add-provider', disabled: !data.declared.some(row => !data.configured.some(added => added.provider === row.provider)), onClick: () => {
                  setAdding(true); setSelected(data.declared.find(row => !data.configured.some(added => added.provider === row.provider)).provider)
                }, 'data-testid': 'add-provider' }, h('span', { className: 'control-icon control-icon-plus', 'aria-hidden': true }), '添加提供方'),
                h('button', { className: 'settings-add-provider', onClick: () => { setAdding(false); setSelected('__custom__') }, 'data-testid': 'custom-provider' }, h('span', { className: 'control-icon control-icon-plus', 'aria-hidden': true }), '添加自定义提供方')),
              selected && h(ProfileEditor, { key: `${selected}:${version}`, ctx, shell, data, row: data.declared.find(row => row.provider === selected),
                catalog: adding ? data.declared : undefined, onSelect: setSelected, onCancel: () => { setSelected(undefined); setAdding(false) },
                onSaved: () => { setSelected(undefined); setAdding(false); setVersion(version + 1) } }))))),
      h('footer', { className: 'settings-footer' }, 'Provider 配置与凭据分别保存。')))
}

export function SettingsOverlay({ ctx, shell }) {
  const state = useSyncExternalStore(shell.subscribe, shell.getSnapshot)
  return state.settings ? h(SettingsPage, { ctx, shell }) : null
}
