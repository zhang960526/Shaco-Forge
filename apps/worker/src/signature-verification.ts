import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { hashFile } from '@shaco-forge/contracts/packaged-runtime'

export interface PublicCertificate { sha256: string; subject: string; issuer: string; serialNumber: string; notBefore: string; notAfter: string }
export interface SignatureResult {
  status: string; signatureType: string; signer: PublicCertificate | null
  timestamp: { certificate: PublicCertificate | null; signingTimes: string[]; source?: string }
  fileSha256: string
}
export interface SignerPolicy { certificateSha256: string[]; timestampRequired: boolean }
export function acceptSignature(result: SignatureResult, expectedDigest: string, policy: SignerPolicy): SignatureResult {
  if (result.status === 'NotSigned' || !result.signer) throw new Error('SIGNATURE_MISSING')
  if (result.status !== 'Valid' || result.signatureType !== 'Authenticode') throw new Error('SIGNATURE_INVALID')
  if (!/^[a-f0-9]{64}$/.test(expectedDigest) || result.fileSha256 !== expectedDigest) throw new Error('SIGNED_ARTIFACT_DIGEST_MISMATCH')
  if (!/^[a-f0-9]{64}$/.test(result.signer.sha256) || !policy.certificateSha256.includes(result.signer.sha256)) throw new Error('SIGNER_NOT_ALLOWED')
  if (policy.timestampRequired && (!result.timestamp.certificate || result.timestamp.signingTimes.length === 0)) throw new Error('SIGNATURE_TIMESTAMP_MISSING')
  return result
}
const run = promisify(execFile)
// Only verification runs here. No signing command, certificate store key access,
// PFX import, key-generation API or unsigned production override exists.
export async function inspectAuthenticode(file: string, nativeHelper: string): Promise<SignatureResult> {
  const before = await hashFile(file)
  const { stdout } = await run(nativeHelper, ['--inspect-authenticode', file], {
    env: {}, windowsHide: true, timeout: 30_000, maxBuffer: 32_768,
  })
  const result = JSON.parse(stdout) as Omit<SignatureResult, 'fileSha256'>
  if (await hashFile(file) !== before) throw new Error('SIGNED_ARTIFACT_CHANGED_DURING_VERIFICATION')
  return { ...result, fileSha256: before }
}
export async function verifyAuthenticode(file: string, digest: string, policy: SignerPolicy, nativeHelper: string): Promise<SignatureResult> {
  return acceptSignature(await inspectAuthenticode(file, nativeHelper), digest, policy)
}
