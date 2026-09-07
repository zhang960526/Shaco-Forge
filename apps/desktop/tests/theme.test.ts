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
  assert.deepEqual(root.dataset, { themeMode: 'light', theme: 'light' })

  controller.setThemeMode('dark')
  assert.deepEqual(root.dataset, { themeMode: 'dark', theme: 'dark' })

  controller.setThemeMode('system')
  assert.deepEqual(root.dataset, { themeMode: 'system', theme: 'light' })
  system.change(true)
  assert.deepEqual(root.dataset, { themeMode: 'system', theme: 'dark' })
  system.change(false)
  assert.deepEqual(root.dataset, { themeMode: 'system', theme: 'light' })

  controller.dispose()
  assert.equal(system.listener, undefined)
})
