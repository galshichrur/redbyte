!macro customInstall
  ExecWait '"$SYSDIR\schtasks.exe" /create /f /sc onstart /rl highest /tn RedByteAgent /tr "\"$INSTDIR\resources\backend\agent.exe\""'
!macroend

!macro customUnInstall
  ExecWait '"$SYSDIR\schtasks.exe" /delete /f /tn RedByteAgent'
!macroend