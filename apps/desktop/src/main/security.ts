import type { BrowserWindowConstructorOptions } from 'electron'

export const rendererSecurityPreferences = {
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: true,
  webSecurity: true,
  allowRunningInsecureContent: false,
} as const satisfies NonNullable<BrowserWindowConstructorOptions['webPreferences']>

export function isSecureRendererConfiguration(): boolean {
  return rendererSecurityPreferences.nodeIntegration === false
    && rendererSecurityPreferences.contextIsolation === true
    && rendererSecurityPreferences.sandbox === true
    && rendererSecurityPreferences.webSecurity === true
    && rendererSecurityPreferences.allowRunningInsecureContent === false
}
