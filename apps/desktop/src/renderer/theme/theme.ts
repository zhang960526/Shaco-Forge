export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'
export type ThemeTemplate = 'BRAUN' | 'FAMICOM'
export interface ThemeSnapshot { mode: ThemeMode; resolved: ResolvedTheme; template: ThemeTemplate }

export interface ThemeRoot {
  dataset: {
    theme?: string
    themeMode?: string
    themeTemplate?: string
  }
}

export interface SystemThemePreference {
  matchesDark(): boolean
  subscribe(listener: () => void): () => void
}

export function resolveThemeMode(mode: ThemeMode, systemDark: boolean): ResolvedTheme {
  return mode === 'system' ? (systemDark ? 'dark' : 'light') : mode
}

export class RootThemeController {
  #mode: ThemeMode = 'light'
  #resolvedTheme: ResolvedTheme = 'light'
  #template: ThemeTemplate = 'BRAUN'
  #snapshot: ThemeSnapshot = { mode: 'light', resolved: 'light', template: 'BRAUN' }
  #listeners = new Set<() => void>()
  #unsubscribe: () => void

  constructor(
    private readonly root: ThemeRoot,
    private readonly systemPreference: SystemThemePreference,
  ) {
    this.#unsubscribe = systemPreference.subscribe(() => {
      if (this.#mode === 'system') this.#apply()
    })
    this.#apply()
  }

  setThemeMode(mode: ThemeMode): void {
    if (!['light', 'dark', 'system'].includes(mode)) throw new Error('INVALID_THEME_MODE')
    this.#mode = mode
    this.#apply()
  }

  getThemeMode(): ThemeMode {
    return this.#mode
  }

  setThemeTemplate(template: ThemeTemplate): void {
    if (template !== 'BRAUN' && template !== 'FAMICOM') throw new Error('INVALID_THEME_TEMPLATE')
    this.#template = template
    this.#apply()
  }

  getThemeTemplate(): ThemeTemplate { return this.#template }
  getSnapshot = (): ThemeSnapshot => this.#snapshot
  subscribe = (listener: () => void): (() => void) => { this.#listeners.add(listener); return () => this.#listeners.delete(listener) }

  getResolvedTheme(): ResolvedTheme {
    return this.#resolvedTheme
  }

  dispose(): void {
    this.#unsubscribe()
    this.#listeners.clear()
  }

  #apply(): void {
    this.#resolvedTheme = resolveThemeMode(this.#mode, this.systemPreference.matchesDark())
    this.root.dataset.themeMode = this.#mode
    this.root.dataset.theme = this.#resolvedTheme
    this.root.dataset.themeTemplate = this.#template
    if (this.#snapshot.mode !== this.#mode || this.#snapshot.resolved !== this.#resolvedTheme || this.#snapshot.template !== this.#template) {
      this.#snapshot = { mode: this.#mode, resolved: this.#resolvedTheme, template: this.#template }
      for (const listener of this.#listeners) listener()
    }
  }
}
