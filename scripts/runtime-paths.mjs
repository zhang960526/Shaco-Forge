import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

export const paths = {
  root,
  workerEntry: join(root, 'apps/worker/dist/index.js'),
  nativeHelper: join(root, 'apps/native-carrier/bin/Release/net10.0-windows/ShacoForge.NativeCarrier.exe'),
  desktopRoot: join(root, 'apps/desktop'),
}
