import { hashFile, type ReleaseManifest, type ReleaseTrustMode } from '@shaco-forge/contracts/packaged-runtime'
import { verifyAuthenticode, type SignerPolicy } from './signature-verification.js'

export interface InstallerReleaseTrustInput {
  release: ReleaseManifest
  installer: string
  digest: string
  nativeHelper: string
}

export interface InstallerReleaseTrustResult {
  releaseTrustMode: ReleaseTrustMode
  installer: string
  digest: string
  authenticodeRequired: boolean
  publisherAuthenticity: 'NOT_PROVIDED' | 'VERIFIED_TRUSTED_AUTHENTICODE'
}

// ReleaseTrustMode is accepted only from a verified packaged release manifest.
// There is deliberately no CLI, environment, settings or runtime override.
export async function verifyInstallerReleaseTrust(input: InstallerReleaseTrustInput): Promise<InstallerReleaseTrustResult> {
  if (!/^[a-f0-9]{64}$/.test(input.digest) || await hashFile(input.installer) !== input.digest) throw new Error('INSTALLER_ARTIFACT_DIGEST_MISMATCH')
  if (input.release.ReleaseTrustMode === 'GITHUB_OPEN_SOURCE_UNSIGNED') {
    return { releaseTrustMode: input.release.ReleaseTrustMode, installer: input.installer, digest: input.digest,
      authenticodeRequired: false, publisherAuthenticity: 'NOT_PROVIDED' }
  }
  if (input.release.ReleaseTrustMode === 'TRUSTED_AUTHENTICODE') {
    await verifyAuthenticode(input.installer, input.digest, input.release.ProductionSignerPolicy as SignerPolicy, input.nativeHelper)
    return { releaseTrustMode: input.release.ReleaseTrustMode, installer: input.installer, digest: input.digest,
      authenticodeRequired: true, publisherAuthenticity: 'VERIFIED_TRUSTED_AUTHENTICODE' }
  }
  throw new Error('RELEASE_INTEGRITY_FAILURE: release trust mode')
}
