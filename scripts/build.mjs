import { resolve } from 'node:path'
import { assertToolchain, root, runNode, runTool } from './tool-runner.mjs'

assertToolchain()
runTool('.NET 10 Native Carrier build', 'dotnet', ['build', 'apps/native-carrier/ShacoForge.NativeCarrier.csproj', '--configuration', 'Release', '--no-restore'])
runNode('contracts build', 'node_modules/typescript/bin/tsc', ['-p', 'packages/contracts/tsconfig.json'])
runNode('worker build', 'node_modules/typescript/bin/tsc', ['-p', 'apps/worker/tsconfig.json'])
const harnessRoot = process.env.SHACO_FORGE_HARNESS_ROOT
if (harnessRoot === undefined || harnessRoot.trim() === '') throw new Error('SHACO_FORGE_HARNESS_ROOT is required')
const { materializeFrozenHarnessRuntime } = await import('../apps/worker/dist/harness-runtime.js')
const runtime = await materializeFrozenHarnessRuntime(harnessRoot, resolve(root, 'node_modules/.shaco-forge-build'))
process.env.SHACO_FORGE_HARNESS_OVERLAY_NODE_MODULES = runtime.overlayNodeModules
const preserveLinks = { nodeArgs: ['--preserve-symlinks', '--preserve-symlinks-main'] }
runNode('Harness Client preparation', 'apps/desktop/scripts/prepare-harness-client.mjs', [], preserveLinks)
runNode('desktop host build', 'node_modules/typescript/bin/tsc', ['-p', 'apps/desktop/tsconfig.node.json'])
runNode('desktop theme test build', 'node_modules/typescript/bin/tsc', ['-p', 'apps/desktop/tsconfig.test.json'])
runNode('renderer build', 'node_modules/vite/bin/vite.js', ['build', '--config', 'apps/desktop/vite.config.ts'])
