import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

export const paths = {
  root,
  workerEntry: join(root, 'apps/worker/dist/index.js'),
  desktopRoot: join(root, 'apps/desktop'),
}
