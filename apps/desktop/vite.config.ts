import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { indexFrozenHarnessPackages, resolvePublicExport } from './scripts/frozen-harness-packages.mjs'

const here = (relative: string): string => fileURLToPath(new URL(relative, import.meta.url))
const harnessRoot = process.env.SHACO_FORGE_HARNESS_ROOT
if (harnessRoot === undefined || harnessRoot.trim() === '') throw new Error('SHACO_FORGE_HARNESS_ROOT is required')
const overlayNodeModules = process.env.SHACO_FORGE_HARNESS_OVERLAY_NODE_MODULES
if (overlayNodeModules === undefined || overlayNodeModules.trim() === '') {
  throw new Error('SHACO_FORGE_HARNESS_OVERLAY_NODE_MODULES is required')
}
const harnessPackages = indexFrozenHarnessPackages(harnessRoot)

export default defineConfig({
  root: here('.'),
  base: './',
  publicDir: here('./.generated-client'),
  build: {
    outDir: here('./dist/renderer'),
    emptyOutDir: true,
    target: 'es2022',
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      { find: /^node:module$/, replacement: here('./src/renderer/node-module-stub.ts') },
    ],
  },
  plugins: [{
    name: 'shaco-frozen-harness-public-exports',
    enforce: 'pre',
    resolveId(source) {
      if (!source.startsWith('@deepseek-ai/')) return undefined
      return resolvePublicExport(harnessPackages, source, overlayNodeModules)
    },
  }],
  define: {
    'process.env': '{}',
    'process.env.DSH_CLIENT_VERSION': JSON.stringify('0.1.2-alpha.1'),
    'process.env.DSH_CLIENT_COMMIT_HASH': JSON.stringify('cd5ef81'),
    'process.env.DSH_CLIENT_GIT_DIRTY': JSON.stringify('false'),
    'process.env.CORDIS_SHARED': 'undefined',
    'process.versions.node': JSON.stringify('0.0.0'),
    'process.execArgv': '[]',
  },
})
