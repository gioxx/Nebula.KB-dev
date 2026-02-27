---
sidebar_position: 50
title: "More examples"
description: Practical recipes that show common ways to use Nebula.Log.
hide_title: true
id: more-examples
tags:
  - Nebula.Log
  - Examples
  - Log
---

# More examples

Practical recipes that show common ways to use Nebula.Log.

## Script bootstrap

```powershell
param(
    [string]$LogDir = "C:\Logs\MyJob"
)

Write-Log -LogLocation $LogDir -Message "Job started" -Level INFO -WriteToFile

try {
    # ... your work here ...
    Write-Log -LogLocation $LogDir -Message "Job completed" -Level SUCCESS -WriteToFile
}
catch {
    Write-Log -LogLocation $LogDir -Message "Job failed: $_" -Level ERROR -WriteToFile
    throw
}
```

## JSON-friendly logging

For ingestion in tools that expect JSON Lines:

```powershell
Write-Log -LogLocation "C:\Logs\Api" `
          -Message "POST /orders accepted" `
          -Level INFO `
          -AsJson -WriteToFile -WriteOnlyToFile
```

## Rotating smaller files

Keep files small by lowering the threshold:

```powershell
$common = @{ LogLocation = "C:\Logs\Service"; LogFileName = "service.log"; WriteToFile = $true }

Write-Log @common -Message "Starting" -Level INFO -MaxFileSizeKB 64
Write-Log @common -Message "Tick" -Level DEBUG -MaxFileSizeKB 64
```

## Colorized console without files

```powershell
Write-Log -Message "Heads up: cache warming" -Level WARNING -Color
Write-Log -Message "All good" -Level SUCCESS -Color
Write-Log -Message "Failed to connect" -Level ERROR -Color
```

## Confirm the log path resolves as expected

```powershell
# Called from inside a script file
Write-Log -Message "Check target folder" -Level DEBUG -WriteToFile

# If you prefer an explicit folder
Write-Log -LogLocation "D:\Logs\Explicit" -Message "Forced path" -Level INFO -WriteToFile
```

## Pre-flight log check

Detect a bad or locked log file before a long-running job:

```powershell
$check = Test-ActivityLog -LogLocation "C:\Logs\Nightly" -TryFix
if ($check.Status -ne 'OK') {
    throw "Cannot write to $($check.Path): $($check.Error)"
}
```
