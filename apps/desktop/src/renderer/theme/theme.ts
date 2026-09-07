export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeRoot {
  dataset: {
    theme?: string
    themeMode?: string
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
    this.#mode = mode
    this.#apply()
  }

  getThemeMode(): ThemeMode {
    return this.#mode
  }

  getResolvedTheme(): ResolvedTheme {
    return this.#resolvedTheme
  }

  dispose(): void {
    this.#unsubscribe()
  }

  #apply(): void {
    this.#resolvedTheme = resolveThemeMode(this.#mode, this.systemPreference.matchesDark())
    this.root.dataset.themeMode = this.#mode
    this.root.dataset.theme = this.#resolvedTheme
  }
}
