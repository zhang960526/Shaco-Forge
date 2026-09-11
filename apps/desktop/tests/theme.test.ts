import assert from 'node:assert/strict'
import test from 'node:test'
import {
  RootThemeController,
  resolveThemeMode,
  type SystemThemePreference,
  type ThemeRoot,
} from '../src/renderer/theme/theme.js'

class FakeSystemPreference implements SystemThemePreference {
  dark = false
  listener: (() => void) | undefined

  matchesDark(): boolean {
    return this.dark
  }

  subscribe(listener: () => void): () => void {
    this.listener = listener
    return () => { this.listener = undefined }
  }

  change(dark: boolean): void {
    this.dark = dark
    this.listener?.()
  }
}

test('ThemeMode resolves light, dark and system', () => {
  assert.equal(resolveThemeMode('light', true), 'light')
  assert.equal(resolveThemeMode('dark', false), 'dark')
  assert.equal(resolveThemeMode('system', false), 'light')
  assert.equal(resolveThemeMode('system', true), 'dark')
})

test('root controller starts light and applies every mode at one root', () => {
  const root: ThemeRoot = { dataset: {} }
  const system = new FakeSystemPreference()
  const controller = new RootThemeController(root, system)

  assert.equal(controller.getThemeMode(), 'light')
  assert.equal(controller.getResolvedTheme(), 'light')
  assert.deepEqual(root.dataset, { themeMode: 'light', theme: 'light', themeTemplate: 'BRAUN' })

  controller.setThemeMode('dark')
  assert.deepEqual(root.dataset, { themeMode: 'dark', theme: 'dark', themeTemplate: 'BRAUN' })

  controller.setThemeMode('system')
  assert.deepEqual(root.dataset, { themeMode: 'system', theme: 'light', themeTemplate: 'BRAUN' })
  system.change(true)
  assert.deepEqual(root.dataset, { themeMode: 'system', theme: 'dark', themeTemplate: 'BRAUN' })
  system.change(false)
  assert.deepEqual(root.dataset, { themeMode: 'system', theme: 'light', themeTemplate: 'BRAUN' })

  controller.dispose()
  assert.equal(system.listener, undefined)
})

test('template and mode stay independent through Braun/FAMICOM/system changes', () => {
  const root: ThemeRoot = { dataset: {} }
  const system = new FakeSystemPreference()
  const controller = new RootThemeController(root, system)
  const initial = controller.getSnapshot()
  let publications = 0
  controller.subscribe(() => { publications++ })
  controller.setThemeTemplate('BRAUN')
  assert.equal(controller.getSnapshot(), initial)
  assert.equal(publications, 0)
  controller.setThemeTemplate('FAMICOM')
  for (const mode of ['dark', 'system', 'light'] as const) {
    controller.setThemeMode(mode)
    assert.equal(controller.getThemeTemplate(), 'FAMICOM')
    assert.equal(root.dataset.themeTemplate, 'FAMICOM')
  }
  controller.setThemeMode('system')
  system.change(true)
  controller.setThemeTemplate('BRAUN')
  assert.equal(controller.getThemeMode(), 'system')
  assert.equal(controller.getResolvedTheme(), 'dark')
  assert.equal(root.dataset.themeTemplate, 'BRAUN')
  controller.dispose()
})
