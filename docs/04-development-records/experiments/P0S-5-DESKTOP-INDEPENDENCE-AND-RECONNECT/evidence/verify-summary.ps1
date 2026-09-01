[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false, $true)
$evidenceRoot = $PSScriptRoot
$experimentRoot = Split-Path -Parent $evidenceRoot
$summaryPath = Join-Path $evidenceRoot 'summary.json'
$checks = [ordered]@{}

function Assert-Evidence([bool]$Condition, [string]$Name) {
  $script:checks[$Name] = $Condition
  if (-not $Condition) { throw "Evidence check failed: $Name" }
}

function Read-StrictJson([string]$Path) {
  return [System.IO.File]::ReadAllText($Path, $utf8NoBom) | ConvertFrom-Json -Depth 100
}

function Same-Turn([object]$Old, [object]$New) {
  return $Old.sessionId -eq $New.sessionId -and
    $Old.agentId -eq $New.agentId -and
    $Old.turnId -eq $New.turnId -and
    $Old.currentTurn -eq $New.currentTurn -and
    $New.status -eq 'running'
}

function Host-No-Resume-Delta([object]$Before, [object]$After) {
  return [int]$Before.agentStartAuthorityCount -eq [int]$After.agentStartAuthorityCount -and
    [int]$Before.agentResumeAuthorityCount -eq [int]$After.agentResumeAuthorityCount -and
    [int]$Before.turnCreationCount -eq [int]$After.turnCreationCount
}

function Test-ReplayPath([object]$Path, [string]$Kind) {
  $old = $Path.oldDesktop
  $new = $Path.newDesktop
  $settlementProperty = if ($Kind -eq 'approval') { 'approvalSettlements' } else { 'questionSettlements' }
  $beforeSettlements = [int]$old.hostTruth.$settlementProperty
  $afterSettlements = [int]$new.hostTruth.$settlementProperty
  $label = "$Kind-$($Path.termination)"
  $agent = @($new.hostTruth.agents | Where-Object { $_.label -eq $label })
  $durable = if ($Kind -eq 'approval') { $agent.Count -eq 1 -and [int]$agent[0].approvalDecisions -eq 1 } else { $true }
  return [bool](
    $new.sameEventIdAfterReconnect -and
    (-not [bool]$new.oldEnvelopeProbe.accepted) -and
    [bool]$new.currentEnvelope.accepted -and
    [bool]$new.duplicateProbe.response.ok -and
    $afterSettlements -eq ($beforeSettlements + 1) -and
    [int]$new.lifecycle.counters.oldDraftImportCount -eq 0 -and
    [int]$new.lifecycle.counters.automaticResultSendCount -eq 0 -and
    [int]$new.lifecycle.counters.explicitRendererActionCount -eq 1 -and
    $durable
  )
}

try {
  foreach ($name in @('run-manifest.json','events.ndjson','processes.json','scenario-results.json','host-truth.json','envelopes.json')) {
    Assert-Evidence (Test-Path -LiteralPath (Join-Path $evidenceRoot $name) -PathType Leaf) "file.$name"
  }
  $manifest = Read-StrictJson (Join-Path $evidenceRoot 'run-manifest.json')
  $processes = @(Read-StrictJson (Join-Path $evidenceRoot 'processes.json'))
  $scenarios = Read-StrictJson (Join-Path $evidenceRoot 'scenario-results.json')
  $envelopes = @(Read-StrictJson (Join-Path $evidenceRoot 'envelopes.json'))
  $events = @(
    foreach ($line in [System.IO.File]::ReadLines((Join-Path $evidenceRoot 'events.ndjson'), $utf8NoBom)) {
      if (-not [string]::IsNullOrWhiteSpace($line)) { $line | ConvertFrom-Json -Depth 100 }
    }
  )

  Assert-Evidence ($manifest.classification -eq 'NOT_PRODUCTION' -and [bool]$manifest.formalRun) 'formalNotProductionRun'
  Assert-Evidence ($manifest.baseline.shacoHead -eq 'c51d6107eb6da3379490fcb9d8a9eecb4e63e647') 'shacoHead'
  Assert-Evidence ($manifest.baseline.harnessHead -eq 'cd5ef8148158c3a752a658978873241fdf8e2bbc') 'harnessHead'
  Assert-Evidence ($manifest.baseline.harnessPackage -eq '0.1.2-alpha.1') 'harnessPackage'
  Assert-Evidence ($manifest.baseline.harnessLockSha256 -eq '506ad1fc7c40f71ce8c6afe08724fdd55020c1a527d7a7a185c559d39ecfcaf1') 'harnessLock'
  Assert-Evidence ([bool]$manifest.baseline.harnessCleanBefore -and [bool]$manifest.baseline.harnessCleanAfter) 'harnessClean'
  Assert-Evidence ($manifest.baseline.harnessTrackedTreeDigestBefore -eq $manifest.baseline.harnessTrackedTreeDigestAfter) 'harnessBytesUnchanged'
  Assert-Evidence ($manifest.baseline.protectedP0S1ThroughP0S4DigestBefore -eq $manifest.baseline.protectedP0S1ThroughP0S4DigestAfter) 'protectedArtifactsUnchanged'
  Assert-Evidence ($manifest.constraints.userUiActionsRequired -eq 'NONE') 'noHumanUiActions'
  Assert-Evidence (-not [bool]$manifest.constraints.providerUsed -and -not [bool]$manifest.constraints.externalNetworkUsed) 'noProviderOrNetwork'
  Assert-Evidence (-not [bool]$manifest.constraints.browserAuthConstructed -and -not [bool]$manifest.constraints.stockWebStarted -and -not [bool]$manifest.constraints.tcpListenerStarted) 'noStockWebOrTcp'
  Assert-Evidence (-not [bool]$manifest.constraints.runnerWorkerReplacementNotificationSent) 'noRunnerReplacementNotification'
  Assert-Evidence ($manifest.constraints.desktopEquivalentInvalidationAdapter -eq 'NOT_PRODUCTION') 'desktopEquivalentAdapterClassification'
  Assert-Evidence (-not [bool]$manifest.constraints.constantResetEvidenceAllowed) 'noConstantInvalidationEvidence'

  Assert-Evidence ($events.Count -gt 0) 'rawEventsPresent'
  Assert-Evidence (@($events | Where-Object { [int]$_.globalSequence -le 0 }).Count -eq 0) 'globalSequencesPositive'
  Assert-Evidence ((@($events.globalSequence | Sort-Object -Unique).Count) -eq $events.Count) 'globalSequencesUnique'
  $byId = @{}
  foreach ($event in $events) { $byId[[string]$event.recordId] = $event }
  $allowedInvalidationSources = @('transport_loss','worker_identity_lost','worker_identity_replaced','authenticated_generation_replacement')
  $invalidations = @($events | Where-Object { $_.type -eq 'projection_invalidated' })
  $repulls = @($events | Where-Object { $_.type -eq 'projection_repull_requested' })
  $rebuilds = @($events | Where-Object { $_.type -eq 'host_truth_rebuilt' })
  Assert-Evidence ($invalidations.Count -gt 0 -and $repulls.Count -gt 0 -and $rebuilds.Count -gt 0) 'projectionCausalRecordsPresent'
  foreach ($record in $invalidations) {
    $source = $byId[[string]$record.causedByRecordId]
    Assert-Evidence ($null -ne $source) "invalidationSourceExists.$($record.recordId)"
    Assert-Evidence ($source.type -in $allowedInvalidationSources) "invalidationSourceAllowed.$($record.recordId)"
    Assert-Evidence ([int]$source.globalSequence -lt [int]$record.globalSequence) "invalidationCausalOrder.$($record.recordId)"
    Assert-Evidence ($record.resultingProjectionState -eq 'INVALIDATED') "invalidationState.$($record.recordId)"
  }
  foreach ($record in $repulls) {
    $source = $byId[[string]$record.causedByRecordId]
    Assert-Evidence ($null -ne $source -and $source.type -eq 'harness_events_ready') "repullRealReadySource.$($record.recordId)"
    Assert-Evidence ([int]$source.globalSequence -lt [int]$record.globalSequence) "repullCausalOrder.$($record.recordId)"
    Assert-Evidence ($null -ne $record.workerIdentity -and $null -ne $record.desktopIdentity -and $null -ne $record.newGeneration) "repullIdentityContext.$($record.recordId)"
  }
  foreach ($record in $rebuilds) {
    $source = $byId[[string]$record.causedByRecordId]
    Assert-Evidence ($null -ne $source -and $source.type -eq 'host_truth_received') "rebuildHostTruthSource.$($record.recordId)"
    Assert-Evidence ([int]$source.globalSequence -lt [int]$record.globalSequence) "rebuildCausalOrder.$($record.recordId)"
  }

  $s01 = $scenarios.S01_DESKTOP_CLOSE
  $s01OldTurn = $s01.oldDesktop.hostAfter.agents | Where-Object { $_.label -eq 'turn-close' }
  $s01NewTurn = $s01.newDesktop.hostTruth.agents | Where-Object { $_.label -eq 'turn-close' }
  $desktopCloseGate = [bool](
    $s01.oldDesktop.workerIdentity.workerInstanceId -eq $s01.newDesktop.workerIdentity.workerInstanceId -and
    (Same-Turn $s01OldTurn $s01NewTurn) -and
    (Host-No-Resume-Delta $s01.oldDesktop.hostAfter $s01.newDesktop.hostTruth) -and
    [int]$s01.newDesktop.lifecycle.counters.promptRequestCount -eq 0 -and
    [int]$s01.newDesktop.lifecycle.counters.agentStartRequestCount -eq 0 -and
    [int]$s01.newDesktop.lifecycle.counters.agentResumeRequestCount -eq 0
  )

  $s03 = $scenarios.S03_DESKTOP_CRASH
  $s03OldTurn = $s03.oldDesktop.hostAfter.agents | Where-Object { $_.label -eq 'turn-crash' }
  $s03NewTurn = $s03.newDesktop.hostTruth.agents | Where-Object { $_.label -eq 'turn-crash' }
  $desktopCrashGate = [bool](
    $s03.oldDesktop.workerIdentity.workerInstanceId -eq $s03.newDesktop.workerIdentity.workerInstanceId -and
    (Same-Turn $s03OldTurn $s03NewTurn) -and
    (Host-No-Resume-Delta $s03.oldDesktop.hostAfter $s03.newDesktop.hostTruth) -and
    [int]$s03.newDesktop.lifecycle.counters.promptRequestCount -eq 0 -and
    [int]$s03.newDesktop.lifecycle.counters.agentStartRequestCount -eq 0 -and
    [int]$s03.newDesktop.lifecycle.counters.agentResumeRequestCount -eq 0
  )

  $s02 = $scenarios.S02_SECOND_DESKTOP
  $secondaryCounters = $s02.secondary.lifecycle.counters
  $postCrashOwnerId = $s03.newDesktop.desktopIdentity.desktopInstanceId
  $focusEvents = @($events | Where-Object {
    $null -ne $_.PSObject.Properties['scenarioId'] -and
    $_.scenarioId -eq 'S02' -and
    $_.type -eq 'second_instance_focus_existing'
  })
  $postCrashOwnerLocks = @($events | Where-Object {
    $_.source -eq 'desktop-main' -and
    $_.type -eq 'single_instance_lock_acquired' -and
    $_.desktopIdentity.desktopInstanceId -eq $postCrashOwnerId
  })
  $secondDesktopGate = [bool](
    [bool]$s02.primary.lockAcquired -and (-not [bool]$s02.secondary.lockAcquired) -and
    [int]$secondaryCounters.workerDiscoveryCount -eq 0 -and
    [int]$secondaryCounters.credentialAccessCount -eq 0 -and
    [int]$secondaryCounters.pipeAttachCount -eq 0 -and
    [int]$secondaryCounters.workerSpawnCount -eq 0 -and
    [int]$secondaryCounters.gatewayDispatchCount -eq 0 -and
    $focusEvents.Count -eq 1 -and
    $postCrashOwnerLocks.Count -eq 1
  )
  foreach ($desktopGroup in $events | Where-Object { $_.source -eq 'desktop-main' } | Group-Object { $_.desktopIdentity.desktopInstanceId }) {
    $lock = @($desktopGroup.Group | Where-Object { $_.type -eq 'single_instance_lock_acquired' })
    $discovery = @($desktopGroup.Group | Where-Object { $_.type -eq 'worker_identity_discovered' })
    if ($discovery.Count -gt 0) {
      Assert-Evidence ($lock.Count -eq 1 -and [int]$lock[0].globalSequence -lt [int]$discovery[0].globalSequence) "lockBeforeDiscovery.$($desktopGroup.Name)"
    }
  }

  $workerAuthorities = @($processes | Where-Object { $_.kind -eq 'worker-authority' } | Sort-Object { [datetime]::Parse($_.authorityStartUtc) })
  Assert-Evidence ($workerAuthorities.Count -eq 2) 'twoWorkerAuthorities'
  $oldAuthorityEnd = [datetime]::Parse($workerAuthorities[0].authorityEndUtc).ToUniversalTime()
  $newCarrierStart = [datetime]::Parse($workerAuthorities[1].carrierStartTimeUtc).ToUniversalTime()
  $authorityOverlapMilliseconds = [Math]::Max(0, ($oldAuthorityEnd - $newCarrierStart).TotalMilliseconds)
  $authorityOverlapZero = $authorityOverlapMilliseconds -eq 0
  $s09 = $scenarios.S09_WORKER_CRASH_RESTART
  $s09Events = @($events | Where-Object {
    $null -ne $_.PSObject.Properties['scenarioId'] -and $_.scenarioId -eq 'S09'
  })
  $lossEvent = @($s09Events | Where-Object { $_.type -eq 'transport_loss' } | Select-Object -First 1)
  $s09Invalidated = @($s09Events | Where-Object { $_.type -eq 'projection_invalidated' })
  $s09Ready = @($s09Events | Where-Object { $_.type -eq 'harness_events_ready' } | Sort-Object globalSequence)
  $s09Rebuild = @($s09Events | Where-Object { $_.type -eq 'host_truth_rebuilt' } | Sort-Object globalSequence)
  $workerRestartGate = [bool](
    [bool]$s09.forceKill -and (-not [bool]$s09.gracefulStopUsed) -and
    [bool]$s09.final.sameElectronProcess -and
    $s09.precrash.desktopIdentity.electronPid -eq $s09.final.desktopIdentity.electronPid -and
    $s09.precrash.desktopIdentity.processStartTimeUtc -eq $s09.final.desktopIdentity.processStartTimeUtc -and
    $s09.precrash.runningTurn.status -eq 'running' -and
    [bool]$s09.lost.connectionLost -and $s09.lost.projection.state -eq 'INVALIDATED' -and
    [int]$s09.lost.cancelDelta -eq 0 -and [int]$s09.lost.completionDelta -eq 0 -and
    $s09.final.worker1.workerInstanceId -ne $s09.final.worker2.workerInstanceId -and
    (-not [bool]$s09.final.oldProjectionVisible) -and
    [int]$s09.final.automaticStartResumeCount -eq 0 -and
    [bool]$workerAuthorities[0].forceKill -and (-not [bool]$workerAuthorities[0].gracefulStop) -and
    [bool]$workerAuthorities[0].carrierExited -and [bool]$workerAuthorities[0].dshExited -and
    $authorityOverlapZero -and
    $lossEvent.Count -eq 1 -and $s09Invalidated.Count -ge 1 -and $s09Ready.Count -ge 2 -and $s09Rebuild.Count -ge 2 -and
    [int]$lossEvent[0].globalSequence -lt [int]$s09Ready[-1].globalSequence -and
    [int]$s09Ready[-1].globalSequence -lt [int]$s09Rebuild[-1].globalSequence
  )

  $noDuplicateResumeGate = [bool](
    $desktopCloseGate -and $desktopCrashGate -and
    [int]$s09.final.automaticStartResumeCount -eq 0 -and
    [int]$s09.lost.promptStartResumeResultAnswerDelta -eq 0
  )

  $approvalClose = Test-ReplayPath $scenarios.S05_APPROVAL_CLOSE 'approval'
  $approvalCrash = Test-ReplayPath $scenarios.S06_APPROVAL_CRASH 'approval'
  $questionClose = Test-ReplayPath $scenarios.S07_QUESTION_CLOSE 'question'
  $questionCrash = Test-ReplayPath $scenarios.S08_QUESTION_CRASH 'question'
  $approvalReplayGate = $approvalClose -and $approvalCrash
  $questionReplayGate = $questionClose -and $questionCrash

  $s04 = $scenarios.S04_EXPLICIT_CANCEL
  Assert-Evidence ([int]$s04.hostAfter.cancelCompletions -eq ([int]$s04.hostBefore.cancelCompletions + 1)) 'explicitCancelExactlyOnce'
  $cancelledAgent = @($s04.hostAfter.agents | Where-Object { $_.label -eq 'turn-crash' })
  Assert-Evidence ($cancelledAgent.Count -eq 1 -and $cancelledAgent[0].status -eq 'idle') 'explicitCancelAgentIdle'

  $s10 = $scenarios.S10_STALE_WORKER
  Assert-Evidence ([bool]$s10.oldPipeFailed) 'staleWorkerPipeFailed'
  Assert-Evidence ([bool]$s10.staleCredentialRejected) 'staleCredentialRejected'
  Assert-Evidence ([bool]$s10.staleIdentityRejected) 'staleIdentityRejected'
  Assert-Evidence ([bool]$s10.staleResultSafe) 'staleWorkerResultSafe'
  Assert-Evidence ([bool]$scenarios.S11_GRACEFUL_WORKER_STOP_SUPPORT.supportingScenarioOnly -and (-not [bool]$scenarios.S11_GRACEFUL_WORKER_STOP_SUPPORT.usedForWorkerCrashRestartGate)) 'gracefulStopExcludedFromHardGate'

  Assert-Evidence ($envelopes.Count -eq 4) 'fourIndependentReplayEnvelopes'
  Assert-Evidence (@($envelopes | Group-Object { $_.oldEnvelope.payload.args.eventId } | Where-Object Count -ne 1).Count -eq 0) 'uniqueReplayEventIds'

  $renderer = $s01.oldDesktop.renderer
  Assert-Evidence ($renderer.requireType -eq 'undefined' -and $renderer.processType -eq 'undefined') 'rendererNoNodeGlobals'
  Assert-Evidence (-not [bool]$renderer.directNamedPipeAccess -and -not [bool]$renderer.preload.pipePathExposed -and -not [bool]$renderer.preload.reusableCredentialExposed) 'rendererNoTransportOrCredential'
  Assert-Evidence ([bool]$renderer.preload.contextIsolated -and [bool]$renderer.preload.sandboxed) 'rendererIsolated'

  $gates = [ordered]@{
    P0S_DESKTOP_CLOSE_WORKER_SURVIVES = $desktopCloseGate
    P0S_DESKTOP_CRASH_WORKER_SURVIVES = $desktopCrashGate
    P0S_SECOND_DESKTOP_POLICY_PASS = $secondDesktopGate
    P0S_WORKER_RESTART_RECONNECT_PASS = $workerRestartGate
    P0S_NO_DUPLICATE_RESUME = $noDuplicateResumeGate
    P0S_NO_APPROVAL_REPLAY = $approvalReplayGate
    P0S_NO_QUESTION_REPLAY = $questionReplayGate
  }
  foreach ($gate in $gates.GetEnumerator()) { Assert-Evidence ([bool]$gate.Value) "gate.$($gate.Key)" }

  foreach ($source in $manifest.sourceSha256.PSObject.Properties) {
    $path = Join-Path $experimentRoot $source.Name
    Assert-Evidence (Test-Path -LiteralPath $path -PathType Leaf) "sourceExists.$($source.Name)"
    $actual = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
    Assert-Evidence ($actual -eq [string]$source.Value) "sourceHash.$($source.Name)"
  }

  $summary = [ordered]@{
    classification = 'NOT_PRODUCTION'
    runId = $manifest.runId
    result = 'PASS'
    gates = $gates
    workerCrashRestart = [ordered]@{
      hardGatePlannedAndExecuted = $true
      gracefulWorkerStopUsedAsHardGate = $false
      desktopRemainedAlive = $true
      runnerDirectReplacementNotificationAllowed = $false
      authorityOverlapAllowed = $false
      authorityOverlapMilliseconds = $authorityOverlapMilliseconds
    }
    replay = [ordered]@{
      oldResultEnvelopeReplayProbeExecuted = $true
      newDesktopOldDraftImportAllowed = $false
      automaticResultReplayAllowed = $false
      approvalClose = $approvalClose
      approvalCrash = $approvalCrash
      questionClose = $questionClose
      questionCrash = $questionCrash
    }
    duplicateResume = [ordered]@{
      hostSideStartResumeCountsVerified = $true
      desktopTraceOnlyUsedAsProof = $false
    }
    cf01 = [ordered]@{
      namedHarnessConnectionResetEventExists = $false
      realEventsReadyUsed = $true
      transportIdentityGenerationInvalidationUsed = $true
      desktopEquivalentInvalidationAdapter = 'NOT_PRODUCTION'
      invalidationRepullCausalRecordsRequired = $true
      constantResetEvidenceAllowed = $false
    }
    secondDesktopPolicy = 'ELECTRON_SINGLE_INSTANCE_FAIL_CLOSED_FOCUS_EXISTING; POST_CRASH_NEW_OWNER_REATTACHES_EXISTING_WORKER'
    corePatchExpectation = 'NO'
    checksPassed = $checks.Count
  }
  [System.IO.File]::WriteAllText($summaryPath, (($summary | ConvertTo-Json -Depth 80) + "`n"), [System.Text.UTF8Encoding]::new($false))
  [ordered]@{
    verifier = 'P0.S-5 evidence verifier'
    result = 'PASS'
    runId = $manifest.runId
    checksPassed = $checks.Count
    gates = $gates
  } | ConvertTo-Json -Depth 20
} catch {
  $failure = [ordered]@{
    classification = 'NOT_PRODUCTION'
    result = 'FAIL'
    error = $_.Exception.Message
    checks = $checks
  }
  [System.IO.File]::WriteAllText($summaryPath, (($failure | ConvertTo-Json -Depth 80) + "`n"), [System.Text.UTF8Encoding]::new($false))
  $failure | ConvertTo-Json -Depth 80
  exit 1
}
