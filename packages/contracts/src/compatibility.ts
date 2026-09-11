// Product control-plane policy. The frozen Carrier wire contract is unchanged.
import { win32 } from 'node:path'
import { HARNESS_COMMIT, type ReleaseManifest } from './packaged-runtime.js'

export const NO_STORE = 'NOT_IMPLEMENTED_NO_CONTROL_STORE_WRITES'
export const CONTROL_SCHEMA = '1'
export const STEP1_BASELINE = '99561f80629a8f9640af702fe322996bcc850906'
export const STEP1_ARTIFACT = 'b84beea0575404242b3979bd260cb3f98ed6c443ba9e71789e6f799c8f409b05'
export const IDENTITY_KEYS = ['ProductVersion', 'DesktopVersion', 'WorkerVersion', 'CarrierVersion', 'HarnessBaselineVersion', 'ControlStoreSchemaVersion'] as const
export interface SixIdentities {
  ProductVersion: string; DesktopVersion: string; WorkerVersion: string
  CarrierVersion: number; HarnessBaselineVersion: string; ControlStoreSchemaVersion: string
}
export const MISMATCH_ACTIONS = Object.freeze({
  PRODUCT_RELEASE_MISMATCH: 'Install the matching Shaco Forge release.',
  DESKTOP_TOO_OLD: 'Update Desktop using the verified installer.',
  WORKER_TOO_OLD: 'Update the installed Worker using the verified installer.',
  WORKER_TOO_NEW: 'Use the Desktop paired with the installed Worker; arbitrary downgrade is unsupported.',
  DESKTOP_WORKER_MISMATCH: 'Repair the matching Desktop and Worker release pair.',
  CARRIER_UNSUPPORTED: 'Repair the release; the Carrier version is unsupported.',
  HARNESS_BASELINE_MISMATCH: 'Repair the exact bundled Harness baseline.',
  CONTROL_SCHEMA_UNSUPPORTED: 'Use the supported installer migration or restore the verified release/data pair.',
  DSH_HOME_MISMATCH: 'Restore the attested current-user data location; alternate homes are unsupported.',
  UPGRADE_IN_PROGRESS: 'Wait for the installer transaction or use its recovery action.',
  RESTORE_REQUIRED: 'Run installer recovery before starting Shaco Forge.',
  RELEASE_INTEGRITY_FAILURE: 'Obtain or repair the verified release artifact.',
})
export type MismatchCode = keyof typeof MISMATCH_ACTIONS
export class CompatibilityError extends Error {
  constructor(readonly code: MismatchCode) { super(`${code}: ${MISMATCH_ACTIONS[code]}`); this.name = 'CompatibilityError' }
}
export function fail(code: MismatchCode): never { throw new CompatibilityError(code) }
export function sixIdentities(release: SixIdentities): SixIdentities {
  return Object.fromEntries(IDENTITY_KEYS.map(key => [key, release[key]])) as unknown as SixIdentities
}
export interface CompatibilityDeclaration {
  allowedTuples: SixIdentities[]
  desktopCarrierVersions: number[]; workerCarrierVersions: number[]; workerSchemas: string[]
  sourceRoutes: Array<{ kind: 'STEP1_NO_STORE'; sourceBaselineCommit: string; artifactDigest: string; schema: string; targetSchema: string; restore: 'EXACT_SOURCE_RUNTIME_AND_PRE_UPGRADE_BYTES' }>
  freshInstall: 'INSTALLER_EXPLICIT_BOOTSTRAP'
}
export function declaration(version: string, sourceArtifact: string): CompatibilityDeclaration {
  return { allowedTuples: [{ ProductVersion: version, DesktopVersion: version, WorkerVersion: version, CarrierVersion: 1,
    HarnessBaselineVersion: '0.1.2-alpha.1', ControlStoreSchemaVersion: CONTROL_SCHEMA }],
    desktopCarrierVersions: [1], workerCarrierVersions: [1], workerSchemas: [CONTROL_SCHEMA],
    sourceRoutes: [{ kind: 'STEP1_NO_STORE', sourceBaselineCommit: STEP1_BASELINE, artifactDigest: sourceArtifact, schema: NO_STORE,
      targetSchema: CONTROL_SCHEMA, restore: 'EXACT_SOURCE_RUNTIME_AND_PRE_UPGRADE_BYTES' }], freshInstall: 'INSTALLER_EXPLICIT_BOOTSTRAP' }
}
function version(value: unknown): number[] | undefined {
  if (typeof value !== 'string') return undefined
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/.exec(value)
  return match ? match.slice(1, 4).map(Number) : undefined
}
function compare(a: unknown, b: unknown): number | undefined {
  const x = version(a), y = version(b)
  if (!x || !y) return undefined
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return Math.sign(x[i]! - y[i]!)
  return 0
}
export function transactionBlock(state: unknown): MismatchCode | undefined {
  if (['IDLE', 'COMMITTED', 'RESTORED', 'ABORTED'].includes(String(state))) return undefined
  if (['CHECKING', 'DRAINING', 'BACKING_UP'].includes(String(state))) return 'UPGRADE_IN_PROGRESS'
  return 'RESTORE_REQUIRED'
}
export function assertCompatibility(release: ReleaseManifest, observed: Partial<SixIdentities>, context: {
  dshHome: unknown; attestedDshHome: unknown; transactionState: unknown; integrity: boolean
}): void {
  if (context.integrity !== true) fail('RELEASE_INTEGRITY_FAILURE')
  const block = transactionBlock(context.transactionState)
  if (block) fail(block)
  if (!observed || Object.keys(observed).length !== IDENTITY_KEYS.length) fail('DESKTOP_WORKER_MISMATCH')
  const policy = release.Compatibility as CompatibilityDeclaration | undefined
  if (!policy || !Array.isArray(policy.allowedTuples) || policy.allowedTuples.length === 0) fail('PRODUCT_RELEASE_MISMATCH')
  if (!version(observed.ProductVersion) || observed.ProductVersion !== release.ProductVersion) fail('PRODUCT_RELEASE_MISMATCH')
  if (!version(observed.DesktopVersion)) fail('DESKTOP_WORKER_MISMATCH')
  if (compare(observed.DesktopVersion, release.DesktopVersion) === -1) fail('DESKTOP_TOO_OLD')
  if (!version(observed.WorkerVersion)) fail('DESKTOP_WORKER_MISMATCH')
  const workerOrder = compare(observed.WorkerVersion, release.WorkerVersion)
  if (workerOrder === -1) fail('WORKER_TOO_OLD')
  if (workerOrder === 1) fail('WORKER_TOO_NEW')
  if (observed.DesktopVersion !== release.DesktopVersion || observed.WorkerVersion !== release.WorkerVersion) fail('DESKTOP_WORKER_MISMATCH')
  if (!Number.isSafeInteger(observed.CarrierVersion) || observed.CarrierVersion !== 1
    || !policy.desktopCarrierVersions?.includes(observed.CarrierVersion) || !policy.workerCarrierVersions?.includes(observed.CarrierVersion)) fail('CARRIER_UNSUPPORTED')
  if (observed.HarnessBaselineVersion !== '0.1.2-alpha.1' || release.HarnessCommit !== HARNESS_COMMIT
    || release.HarnessPackage !== '@deepseek-ai/dsh@0.1.2-alpha.1') fail('HARNESS_BASELINE_MISMATCH')
  if (observed.ControlStoreSchemaVersion !== CONTROL_SCHEMA || !policy.workerSchemas?.includes(observed.ControlStoreSchemaVersion)) fail('CONTROL_SCHEMA_UNSUPPORTED')
  if (!policy.allowedTuples.some(tuple => IDENTITY_KEYS.every(key => tuple[key] === observed[key]))) fail('DESKTOP_WORKER_MISMATCH')
  const home = context.dshHome, attested = context.attestedDshHome
  if (typeof home !== 'string' || typeof attested !== 'string' || !win32.isAbsolute(home) || !win32.isAbsolute(attested)
    || win32.normalize(home).toLowerCase() !== win32.normalize(attested).toLowerCase()) fail('DSH_HOME_MISMATCH')
}
