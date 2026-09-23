// Adapted from DeepSeek web/src/boot.ts at cd5ef8148158c3a752a658978873241fdf8e2bbc.
// MIT notice: apps/desktop/THIRD_PARTY_NOTICES.md. Public imports only.
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { getStaticModules } from '@deepseek-ai/dsh-client-web'
import { startPresentation } from './presentation-lifecycle.mjs'

// Public FiberState is a const enum, erased from JS. Mirror its pinned ACTIVE
// literal like the upstream loader-status adapter; never import a private runtime.
/** @type {import('@deepseek-ai/cordis').FiberState.ACTIVE} */
const ACTIVE = 2

export function startShaco(container, bridge) {
  return startPresentation({ container, bridge, target: window.__ModuleLoader__, boot: window.__DSH_BOOT__,
    staticModules: getStaticModules(), Context, Loader, activeState: ACTIVE,
    loadBundle: window.__DSH_TRANSPORT__?.loadBundle })
}
