[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$summaryPath = Join-Path $PSScriptRoot 'summary.json'
$experimentRoot = Split-Path -Parent $PSScriptRoot
$checks = [ordered]@{}

function Assert-Evidence {
  param(
    [Parameter(Mandatory)] [bool] $Condition,
    [Parameter(Mandatory)] [string] $Name
  )

  $script:checks[$Name] = $Condition
  if (-not $Condition) {
    throw "Evidence check failed: $Name"
  }
}

try {
  Assert-Evidence (Test-Path -LiteralPath $summaryPath -PathType Leaf) 'summaryExists'
  $summaryText = [System.IO.File]::ReadAllText($summaryPath, [System.Text.UTF8Encoding]::new($false, $true))
  $summary = $summaryText | ConvertFrom-Json -Depth 50

  Assert-Evidence ($summary.classification -eq 'NOT_PRODUCTION') 'notProductionClassification'
  Assert-Evidence ($summary.result -eq 'PASS') 'runnerResultPass'
  Assert-Evidence ($summary.baseline.harnessHead -eq 'cd5ef8148158c3a752a658978873241fdf8e2bbc') 'frozenHarnessHead'
  Assert-Evidence ($summary.baseline.harnessPackage -eq '0.1.2-alpha.1') 'frozenHarnessPackage'
  Assert-Evidence ([bool]$summary.baseline.harnessCleanBefore -and [bool]$summary.baseline.harnessCleanAfter) 'frozenHarnessClean'

  foreach ($gate in $summary.gates.PSObject.Properties) {
    Assert-Evidence ([bool]$gate.Value) "gate.$($gate.Name)"
  }

  Assert-Evidence ([bool]$summary.electron.rendererIsolation.preload.sandboxed) 'rendererSandboxed'
  Assert-Evidence ([bool]$summary.electron.rendererIsolation.preload.contextIsolated) 'rendererContextIsolated'
  Assert-Evidence (-not [bool]$summary.electron.rendererIsolation.directNamedPipeAccess) 'rendererNoDirectPipe'
  Assert-Evidence (-not [bool]$summary.electron.rendererIsolation.reusableWorkerCredentialExposed) 'rendererNoReusableCredential'
  Assert-Evidence ([bool]$summary.workerReady.currentUserOnly -and [bool]$summary.workerReady.aclProtected) 'currentUserProtectedAcl'

  Assert-Evidence ([bool]$summary.electron.streams.normal.pass) 'streamNormal'
  Assert-Evidence ([bool]$summary.electron.streams.producerError.pass) 'streamProducerError'
  Assert-Evidence ([bool]$summary.electron.streams.consumerCancel.pass) 'streamConsumerCancel'
  Assert-Evidence ([bool]$summary.electron.streams.concurrent.pass) 'streamConcurrency'
  Assert-Evidence ([bool]$summary.electron.streams.connectionLoss.pass) 'streamConnectionLoss'
  Assert-Evidence ([bool]$summary.electron.streams.backpressure.pass) 'streamBackpressure'

  Assert-Evidence ([bool]$summary.electron.events.readyObserved) 'eventsReadyObserved'
  Assert-Evidence ([bool]$summary.electron.events.uniqueClientIds) 'eventClientIdsUnique'
  $resetMeasurement = $summary.electron.events.resetMeasurement
  $readyRecords = @($resetMeasurement.readyRecords)
  $resetRecords = @($resetMeasurement.resetRecords)
  $repullRequests = @($resetMeasurement.projectionRepullRequests)
  $uniqueReadyGenerations = @($readyRecords | ForEach-Object { [int]$_.generation } | Sort-Object -Unique)
  $uniqueResetGenerations = @($resetRecords | ForEach-Object { [int]$_.generation } | Sort-Object -Unique)
  Assert-Evidence ($readyRecords.Count -gt 0) 'eventReadyRecordsObserved'
  Assert-Evidence ([int]$summary.electron.events.readyCount -eq $readyRecords.Count) 'eventReadyCountDerived'
  Assert-Evidence ([int]$summary.electron.events.generations.Count -eq $readyRecords.Count) 'eventGenerationCountDerived'
  Assert-Evidence ([int]$resetMeasurement.readyCount -eq $readyRecords.Count) 'resetReadyCountDerived'
  Assert-Evidence ([int]$resetMeasurement.uniqueGenerationCount -eq $uniqueReadyGenerations.Count) 'uniqueGenerationCountDerived'
  Assert-Evidence ([int]$summary.electron.events.connectionResetCount -eq $resetRecords.Count) 'connectionResetCountDerived'
  Assert-Evidence ([int]$resetMeasurement.connectionResetCount -eq $resetRecords.Count) 'resetRecordCountDerived'
  Assert-Evidence ([bool]$summary.electron.events.connectionResetObserved -eq ($resetRecords.Count -gt 0)) 'connectionResetObservedDerived'
  Assert-Evidence ($summary.electron.events.resetSource -eq 'real Harness $events.ready triggers test-owned Desktop-equivalent reset/projection invalidation') 'accurateResetSource'
  Assert-Evidence ([int]$resetMeasurement.preReadyResetCount -eq 0) 'noResetBeforeReady'
  Assert-Evidence ([bool]$resetMeasurement.noResetWithoutReady) 'noResetWithoutReady'
  Assert-Evidence ([bool]$resetMeasurement.oneResetPerReady) 'oneResetPerReady'
  Assert-Evidence ([bool]$resetMeasurement.noDuplicateGenerationReset) 'noDuplicateGenerationReset'
  Assert-Evidence ($uniqueResetGenerations.Count -eq $resetRecords.Count) 'uniqueResetGenerationRecords'
  Assert-Evidence ([int]$resetMeasurement.projectionInvalidationCount -eq $resetRecords.Count) 'projectionInvalidationCountMatchesReset'
  Assert-Evidence ([int]$resetMeasurement.projectionRepullRequestedCount -eq $resetRecords.Count) 'projectionRepullCountMatchesReset'
  Assert-Evidence ($repullRequests.Count -eq $resetRecords.Count) 'projectionRepullRecordsMatchReset'
  Assert-Evidence ([bool]$resetMeasurement.everyRepullHasResetCause) 'projectionRepullCausalMapping'
  foreach ($readyRecord in $readyRecords) {
    Assert-Evidence ($readyRecord.sourceEvent -eq '$events.ready') "readySource.$($readyRecord.readySequence)"
    Assert-Evidence ($readyRecord.readyClientIdHashPrefix -match '^[0-9a-f]{16}$') "readyClientHash.$($readyRecord.readySequence)"
    $matchingResets = @($resetRecords | Where-Object {
      [int]$_.causedByReadySequence -eq [int]$readyRecord.readySequence -and
      [int]$_.generation -eq [int]$readyRecord.generation -and
      $_.readyClientIdHashPrefix -eq $readyRecord.readyClientIdHashPrefix
    })
    Assert-Evidence ($matchingResets.Count -eq 1) "readyHasExactlyOneReset.$($readyRecord.readySequence)"
  }
  foreach ($resetRecord in $resetRecords) {
    Assert-Evidence ($resetRecord.source -eq 'events.ready') "resetSource.$($resetRecord.resetSequence)"
    Assert-Evidence ([bool]$resetRecord.projectionInvalidated) "projectionInvalidated.$($resetRecord.resetSequence)"
    Assert-Evidence ([bool]$resetRecord.projectionRepullRequested) "projectionRepullRequested.$($resetRecord.resetSequence)"
    $matchingRepulls = @($repullRequests | Where-Object {
      [int]$_.causedByResetSequence -eq [int]$resetRecord.resetSequence -and
      [int]$_.generation -eq [int]$resetRecord.generation -and
      $_.readyClientIdHashPrefix -eq $resetRecord.readyClientIdHashPrefix -and
      [bool]$_.requested
    })
    Assert-Evidence ($matchingRepulls.Count -eq 1) "resetHasExactlyOneRepull.$($resetRecord.resetSequence)"
  }
  Assert-Evidence ([bool]$summary.electron.approval.staleGenerationRejected) 'approvalStaleRejected'
  Assert-Evidence ([int]$summary.electron.approval.hostSettlementCount -eq 1) 'approvalSingleSettlement'
  Assert-Evidence ([int]$summary.electron.approval.durableDecisionCount -eq 1) 'approvalSingleDurableDecision'
  Assert-Evidence ([bool]$summary.electron.userQuestion.staleGenerationRejected) 'questionStaleRejected'
  Assert-Evidence ([int]$summary.electron.userQuestion.hostSettlementCount -eq 1) 'questionSingleSettlement'
  Assert-Evidence ([bool]$summary.electron.explicitCancel.disconnectDidNotCancel) 'disconnectIsNotAgentCancel'
  Assert-Evidence ([int]$summary.electron.explicitCancel.completionCount -eq 1) 'explicitCancelSingleCompletion'

  $binarySizes = @($summary.electron.binary.matrix | ForEach-Object { [int]$_.size })
  Assert-Evidence (($binarySizes -join ',') -eq '3,4096,65537,262144') 'binarySizeMatrix'
  Assert-Evidence (@($summary.electron.binary.matrix | Where-Object { -not $_.pass -or -not $_.exactSpecialBytes }).Count -eq 0) 'binaryExactBytes'
  Assert-Evidence ([int]$summary.electron.binary.malformedStatus -eq 400) 'binaryMalformedFailClosed'
  Assert-Evidence ([int]$summary.electron.binary.oversizeStatus -eq 413) 'binaryOversizeFailClosed'
  Assert-Evidence ([int]$summary.electron.binary.limits.observedPeakChunkBytes -le [int]$summary.electron.binary.limits.binaryChunkBytes) 'binaryChunkBounded'
  Assert-Evidence ([int]$summary.dsh.maxBinaryCreditsObserved -le 4) 'binaryCreditsBounded'
  Assert-Evidence ([int]$summary.worker.maxDshResponseQueueDepth -le [int]$summary.worker.dshResponseQueueCapacity) 'workerQueueBounded'
  Assert-Evidence ([bool]$summary.electron.boundedResources.finalResourceCleanupPass) 'finalResourceCleanup'
  Assert-Evidence ([int]$summary.electron.boundedResources.finalActiveStreams -eq 0) 'finalActiveStreamsZero'
  Assert-Evidence ([int]$summary.electron.boundedResources.finalActiveBinaries -eq 0) 'finalActiveBinariesZero'
  Assert-Evidence ([bool]$summary.electron.events.finalSubscriptionCancelRequested) 'finalEventSubscriptionCancelRequested'
  Assert-Evidence ($summary.electron.events.finalSubscriptionTerminal -in @('stream-cancelled', 'stream-end')) 'finalEventSubscriptionTerminated'

  Assert-Evidence ([bool]$summary.electron.nativePicker.success.exactExpectedPath) 'nativePickerSuccess'
  Assert-Evidence ([bool]$summary.electron.nativePicker.cancel.canceled) 'nativePickerCancel'
  Assert-Evidence (-not [bool]$summary.electron.nativePicker.automation.runnerSelfAutomated) 'nativePickerRunnerInteractive'
  Assert-Evidence ([bool]$summary.processCleanup.noResidualProcesses) 'noResidualProcesses'
  Assert-Evidence ([bool]$summary.tcp.noMatchingTcpListener) 'noMatchingTcpListener'
  Assert-Evidence ([bool]$summary.identities.pipeEndpointRedacted -and -not [bool]$summary.identities.ephemeralSecretPersisted) 'identityAndSecretRedaction'
  Assert-Evidence ($summary.runtimeRoot -eq '<TEMP>\shaco-forge-p0s4-<RUN_ID>') 'runtimeRootRedacted'

  foreach ($source in $summary.sourceSha256.PSObject.Properties) {
    $sourcePath = Join-Path $experimentRoot $source.Name
    Assert-Evidence (Test-Path -LiteralPath $sourcePath -PathType Leaf) "sourceExists.$($source.Name)"
    $actualHash = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash.ToLowerInvariant()
    Assert-Evidence ($actualHash -eq [string]$source.Value) "sourceHash.$($source.Name)"
  }

  [ordered]@{
    verifier = 'P0.S-4 evidence verifier'
    result = 'PASS'
    summaryRunId = $summary.runId
    checksPassed = $checks.Count
  } | ConvertTo-Json -Depth 5
} catch {
  [ordered]@{
    verifier = 'P0.S-4 evidence verifier'
    result = 'FAIL'
    error = $_.Exception.Message
    checks = $checks
  } | ConvertTo-Json -Depth 10
  exit 1
}
