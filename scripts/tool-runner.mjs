import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

export const root = resolve(import.meta.dirname, '..')

export function runNode(label, entry, args = [], options = {}) {
  const result = spawnSync(process.execPath, [...(options.nodeArgs ?? []), resolve(root, entry), ...args], {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
    windowsHide: true,
  })
  if (result.error !== undefined) throw result.error
  if (result.status !== 0) throw new Error(`${label} failed with exit code ${result.status ?? 'unknown'}`)
}

export function runTool(label, command, args = []) {
  const result = spawnSync(command, args, { cwd: root, env: process.env, stdio: 'inherit', windowsHide: true })
  if (result.error !== undefined) throw result.error
  if (result.status !== 0) throw new Error(`${label} failed with exit code ${result.status ?? 'unknown'}`)
}

export function assertToolchain() {
  if (process.version !== 'v22.19.0') {
    throw new Error(`Shaco Forge build requires Node v22.19.0; received ${process.version}`)
  }
}
