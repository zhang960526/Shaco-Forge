# NOT_PRODUCTION: compiles and runs the P0.S-5 current-user Worker Carrier.
$ErrorActionPreference = 'Stop'
Add-Type -Path (Join-Path $PSScriptRoot 'worker-carrier.cs')
exit [ShacoForge.P0S5.WorkerCarrier]::Run()
