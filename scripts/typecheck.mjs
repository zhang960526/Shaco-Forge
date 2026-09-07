import { assertToolchain, runNode } from './tool-runner.mjs'

assertToolchain()
// Referenced projects require the contract declaration output before checking dependants.
runNode('contracts prerequisite build', 'node_modules/typescript/bin/tsc', ['-p', 'packages/contracts/tsconfig.json'])
runNode('contracts typecheck', 'node_modules/typescript/bin/tsc', ['-p', 'packages/contracts/tsconfig.json', '--noEmit'])
runNode('worker typecheck', 'node_modules/typescript/bin/tsc', ['-p', 'apps/worker/tsconfig.json', '--noEmit'])
runNode('desktop host typecheck', 'node_modules/typescript/bin/tsc', ['-p', 'apps/desktop/tsconfig.node.json', '--noEmit'])
runNode('desktop theme test typecheck', 'node_modules/typescript/bin/tsc', ['-p', 'apps/desktop/tsconfig.test.json', '--noEmit'])
runNode('renderer typecheck', 'node_modules/typescript/bin/tsc', ['-p', 'apps/desktop/tsconfig.renderer.json', '--noEmit'])
