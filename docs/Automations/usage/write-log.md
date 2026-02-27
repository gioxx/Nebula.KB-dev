---
sidebar_position: 13
title: 'Write-Log (fallback)'
description: Compatibility logging function exposed when Nebula.Log is not installed.
hide_title: true
id: write-log
tags:
  - Write-Log
  - Logging
  - Nebula.Automations
---

# Write-Log (fallback)

When `Nebula.Log` is not available, Nebula.Automations exposes a compatibility `Write-Log` implementation (alias: `Log-Message`) that delegates to `Write-NALog`.

## Syntax

```powershell
Write-Log -Message <String> [-Level INFO|SUCCESS|WARNING|DEBUG|ERROR] [-LogLocation <String>] [-WriteToFile]
```

## Notes

- `-WriteToFile` is kept for compatibility and ignored in fallback mode.
- If `Nebula.Log` is installed and provides `Write-Log`, that implementation is used instead.

## Example

```powershell
Write-Log -Message "Synchronization started" -Level INFO -LogLocation "C:\Logs\SyncUsers"
```
