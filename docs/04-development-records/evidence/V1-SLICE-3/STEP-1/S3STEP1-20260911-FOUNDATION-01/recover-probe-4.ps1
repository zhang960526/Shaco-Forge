$ErrorActionPreference = 'Stop'
$packageRoot = 'D:\Project\Shaco-Forge\dist\packaging\1789114872072\output\Shaco Forge-win32-x64'
$workerImage = Join-Path $packageRoot 'runtime\node.exe'
$worker = Get-Process -Id 40964 -ErrorAction SilentlyContinue
if ($null -ne $worker) {
    if ($worker.Path -ne $workerImage -or $worker.StartTime.ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss') -ne '2026-09-11T08:27:26') { throw 'Recovery PID identity mismatch' }
    Stop-Process -Id $worker.Id
}
Start-Sleep -Seconds 2
$remaining = Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -like ($packageRoot + '\*') }
if ($remaining) { throw 'Package process remains; preserve home' }
# The ACTUAL_KNOWN_FOLDER_JUNCTION gate ran only because this Product root did
# not exist at test entry. Remove only this newly created test root, never links'
# targets. Node fs.rm unlinks junctions instead of following them.
$node = 'C:/Users/18902/AppData/Local/Temp/shaco-forge-v1-slice-1a-toolchain/node-v22.19.0-win-x64/node.exe'
& $node --input-type=module -e 'import {realpath,lstat,rm,writeFile} from "node:fs/promises"; const root="C:\\Users\\18902\\AppData\\Local\\Shaco Forge"; if(await realpath(root)!==root || (await lstat(root)).isSymbolicLink()) throw Error("Recovery home boundary"); await rm(root,{recursive:true}); await writeFile("D:/Project/Shaco-Forge/docs/04-development-records/evidence/V1-SLICE-3/STEP-1/S3STEP1-20260911-FOUNDATION-01/probe-4-recovery.json",JSON.stringify({workerPid:40964,verifiedStartTime:"2026-09-11T08:27:26Z",noPackageProcess:true,newlyCreatedTestHomeRemoved:root,providerRuns:0,signingRuns:0},null,2)+"\n","utf8")'
exit $LASTEXITCODE
