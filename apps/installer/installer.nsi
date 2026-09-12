Unicode true
!ifndef RELEASE_TRUST_MODE
  !error "RELEASE_TRUST_MODE is required"
!endif
!if "${RELEASE_TRUST_MODE}" != "GITHUB_OPEN_SOURCE_UNSIGNED"
  !if "${RELEASE_TRUST_MODE}" != "TRUSTED_AUTHENTICODE"
    !error "Unknown RELEASE_TRUST_MODE"
  !endif
!endif
!include "x64.nsh"
!include "FileFunc.nsh"
Name "Shaco Forge"
OutFile "${OUTPUT}"
RequestExecutionLevel user
ManifestLongPathAware true
SetCompressor /SOLID lzma
ShowInstDetails show
AutoCloseWindow true
Page instfiles
Var Operation

Function .onInit
  ${IfNot} ${RunningX64}
    SetErrorLevel 1
    Quit
  ${EndIf}
  SetShellVarContext current
  StrCpy $Operation "--install"
  ${GetParameters} $R0
  ClearErrors
  ${GetOptions} $R0 "/UNINSTALL" $R1
  IfErrors +2 0
    StrCpy $Operation "--uninstall"
  ClearErrors
  ${GetOptions} $R0 "/RECOVER" $R1
  IfErrors +2 0
    StrCpy $Operation "--recover"
  InitPluginsDir
  SetOutPath "$PLUGINSDIR"
!if "${RELEASE_TRUST_MODE}" == "TRUSTED_AUTHENTICODE"
    SetOutPath "$PLUGINSDIR\native"
    File /r "${PAYLOAD}\native\*"
    SetOutPath "$PLUGINSDIR"
    File /oname=signer-policy.json "${SOURCE}\apps\installer\signer-policy.json"
    ClearErrors
    ExecWait '"$PLUGINSDIR\native\ShacoForge.NativeCarrier.exe" --verify-installer "$EXEPATH" "$PLUGINSDIR\signer-policy.json"' $R0
    IfErrors rejected
    StrCmp $R0 "0" accepted rejected
    rejected:
      IfSilent +2
        MessageBox MB_OK|MB_ICONSTOP "Shaco Forge Authenticode verification failed."
      SetErrorLevel 1
      Quit
    accepted:
!endif
FunctionEnd

Section
  SetOutPath "$PLUGINSDIR\payload"
  File /r "${PAYLOAD}\*"
  ClearErrors
  ExecWait '"$PLUGINSDIR\payload\runtime\node.exe" "$PLUGINSDIR\payload\resources\app\worker\dist\installer-entry.js" "$EXEPATH" $Operation' $R0
  IfErrors failed
  StrCmp $R0 "0" completed failed
  failed:
    SetErrorLevel 1
    Abort "Install/update did not commit. Run this installer with /RECOVER when recovery is required."
  completed:
    SetErrorLevel 0
SectionEnd
