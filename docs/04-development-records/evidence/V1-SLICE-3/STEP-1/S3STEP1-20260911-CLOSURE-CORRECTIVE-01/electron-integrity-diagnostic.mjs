import { app } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = resolve(import.meta.dirname, '../../../../../..')
const { verifyPackagedRuntime } = await import(pathToFileURL(resolve(root, 'packages/contracts/dist/packaged-runtime.js')))
const location = JSON.parse(await readFile(resolve(root, 'dist/packaged-runtime-location.json'), 'utf8'))
const started = Date.now()
const samples = []
const timer = setInterval(() => {
  const sample = { elapsedMs: Date.now() - started, appReady: app.isReady(), resources: process.getActiveResourcesInfo() }
  samples.push(sample)
  console.log(JSON.stringify(sample))
}, 5000)
const timeout = setTimeout(async () => {
  await writeFile(resolve(import.meta.dirname, 'electron-integrity-diagnostic.json'), JSON.stringify({ result: 'FAIL_TIMEOUT', samples }, null, 2) + '\n', 'utf8')
  app.exit(1)
}, 45000)
try {
  await verifyPackagedRuntime(location.packagedRoot)
  const result = { result: 'PASS', verificationMs: Date.now() - started, versions: process.versions, samples }
  await writeFile(resolve(import.meta.dirname, 'electron-integrity-diagnostic.json'), JSON.stringify(result, null, 2) + '\n', 'utf8')
  console.log(JSON.stringify(result))
  clearInterval(timer); clearTimeout(timeout)
  app.exit(0)
} catch (error) {
  console.log(String(error))
  await writeFile(resolve(import.meta.dirname, 'electron-integrity-diagnostic.json'), JSON.stringify({ result: 'FAIL', error: String(error), samples }, null, 2) + '\n', 'utf8')
  app.exit(1)
}
