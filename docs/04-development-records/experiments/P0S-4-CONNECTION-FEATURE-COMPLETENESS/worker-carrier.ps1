# NOT_PRODUCTION: compiles and runs the disposable current-user Named Pipe carrier.
$ErrorActionPreference = 'Stop'
Add-Type -Path (Join-Path $PSScriptRoot 'worker-carrier.cs')
exit [ShacoForge.P0S4.WorkerCarrier]::Run()

