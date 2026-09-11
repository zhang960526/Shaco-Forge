import { spawnSync } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
const root = resolve(import.meta.dirname, '../../../../../..')
const env = { ...process.env }
delete env.SHACO_FORGE_PACKAGED_LOCATION
const child = spawnSync(process.execPath, ['--test', 'scripts/harness-production-closure.test.mjs'], { cwd: root, env, windowsHide: true, encoding: 'utf8' })
await writeFile(join(import.meta.dirname, 'corrected-pruning-unit-diagnostic.log'), child.stdout + child.stderr, 'utf8')
const result = { result: child.status === 0 ? 'PASS_FIXTURES_ONLY' : 'FAIL', exitCode: child.status, actualCandidateCase: 'EXPLICIT_SKIP_UNTIL_REPACKAGED_FINAL_GATE', log: 'corrected-pruning-unit-diagnostic.log' }
await writeFile(join(import.meta.dirname, 'corrected-pruning-unit-diagnostic.json'), JSON.stringify(result, null, 2) + '\n', 'utf8')
console.log(JSON.stringify(result))
process.exitCode = child.status ?? 1
