import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../../../../../..')
assert.equal(process.version, 'v22.19.0')
const env = { ...process.env,
  SHACO_FORGE_PNPM_ENTRY: 'C:/Users/18902/AppData/Local/Temp/shaco-forge-v1-slice-1a-toolchain/corepack/v1/pnpm/11.7.0/bin/pnpm.cjs',
  SHACO_FORGE_GIT: 'D:/Development/Git/cmd/git.exe',
  SHACO_FORGE_POWERSHELL: 'C:/Users/18902/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/powershell/pwsh.exe',
  SHACO_FORGE_ELECTRON_ZIP_DIR: 'C:/Users/18902/AppData/Local/electron/Cache/091145cafe56050876f1d18a63e2cd89dbfc75bba207f769653cb22455d90b4e',
  SHACO_FORGE_STEP1_FINAL: '1',
}
const commands = ['typecheck', 'build', 'test', 'verify:static', 'verify:theme', 'composition', 'smoke:worker', 'smoke:carrier', 'smoke:electron', 'smoke:failure', 'smoke:slice2-step1', 'smoke:slice2-step2', 'smoke:slice2-step3', 'smoke:slice2-step3-interactions', 'test:full-shaco', 'smoke:full-shaco', 'package:runtime', 'test:packaged-runtime']
// The 18th gate uses the existing Windows desktop driver separately, because
// packaged known-folder checks require the actual ordinary desktop context.
const start = process.argv[2] ?? commands[0]
assert.ok(commands.includes(start))
for (const command of commands.slice(commands.indexOf(start))) {
  console.log(`FINAL_GATE_START ${command}`)
  const child = spawnSync(process.execPath, ['scripts/slice3-step1-command.mjs', command], { cwd: root, env, windowsHide: true, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  console.log(`FINAL_GATE_END ${command} exit=${child.status}`)
  if (child.status !== 0 || child.error) {
    console.log((child.stdout ?? '').slice(-10000))
    console.log(child.stderr ?? child.error ?? '')
    process.exit(child.status ?? 1)
  }
}
