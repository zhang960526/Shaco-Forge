param(
    [Parameter(Mandatory = $true)][ValidateSet('held', 'hung', 'retain')][string]$Mode,
    [Parameter(Mandatory = $true)][string]$LifecycleName
)
# Test-only OS fixture. No credential, Carrier endpoint, Harness or business RPC.
$ErrorActionPreference = 'Stop'
$taskMutexName = 'Local\' + $LifecycleName.Replace('lifecycle', 'authority')
$taskMutex = $null
$taskPipe = $null
$taskOwned = $false
try {
    if ($Mode -eq 'retain') {
        $taskMutex = [Threading.Mutex]::OpenExisting($taskMutexName)
    } else {
        $taskCreated = $false
        $taskMutex = [Threading.Mutex]::new($true, $taskMutexName, [ref]$taskCreated)
        if (-not $taskCreated) { throw 'Fixture refuses to replace an existing authority mutex.' }
        $taskOwned = $true
    }
    if ($Mode -eq 'hung') {
        $taskSid = [Security.Principal.WindowsIdentity]::GetCurrent().User
        $taskSecurity = [IO.Pipes.PipeSecurity]::new()
        $taskSecurity.SetOwner($taskSid)
        $taskSecurity.SetAccessRuleProtection($true, $false)
        $taskSecurity.AddAccessRule([IO.Pipes.PipeAccessRule]::new($taskSid, [IO.Pipes.PipeAccessRights]::FullControl, [Security.AccessControl.AccessControlType]::Allow))
        $taskPipe = [IO.Pipes.NamedPipeServerStreamAcl]::Create($LifecycleName, [IO.Pipes.PipeDirection]::InOut, 1,
            [IO.Pipes.PipeTransmissionMode]::Byte, ([IO.Pipes.PipeOptions]::Asynchronous -bor [IO.Pipes.PipeOptions]::FirstPipeInstance),
            4096, 4096, $taskSecurity, [IO.HandleInheritability]::None, [IO.Pipes.PipeAccessRights]0)
    }
    [Console]::Out.WriteLine('{"ready":true}')
    [Console]::Out.Flush()
    if ($taskPipe) {
        $taskTimeout = [Threading.CancellationTokenSource]::new(20000)
        try { $taskPipe.WaitForConnectionAsync($taskTimeout.Token).GetAwaiter().GetResult() } finally { $taskTimeout.Dispose() }
    }
    # Parent closes this bounded fixture control stream during cleanup.
    [void][Console]::In.ReadLine()
} finally {
    if ($taskPipe) { $taskPipe.Dispose() }
    if ($taskOwned) { $taskMutex.ReleaseMutex() }
    if ($taskMutex) { $taskMutex.Dispose() }
}
