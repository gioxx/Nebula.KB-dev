---
sidebar_position: 1
title: "Test-ActivityLog"
description: Validates that the activity log is reachable and writable. Can optionally archive a bad file and recreate it.
hide_title: true
id: test-activitylog
tags:
  - Test-ActivityLog
  - Nebula.Log
  - Log
---

# Test-ActivityLog

Validates that the activity log is reachable and writable. Can optionally archive a bad file and recreate it.

## Syntax

```powershell
Test-ActivityLog [-LogLocation <String>] [-LogFileName <String>] [-TryFix]
```

## Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `LogLocation` | string | inferred | Optional directory for logs. Resolved the same way as `Write-Log` and created if missing. |
| `LogFileName` | string | `activity.log` | File name to check. |
| `TryFix` | switch | off | If the file is unwritable, archive it and attempt to create a fresh one, then retry logging. |

## Return value

Returns a `[pscustomobject]` with:

- `Status`: `OK` or `KO`
- `Path`: full path to the checked log file
- `Fixed`: `$true` when `TryFix` successfully repaired the file, otherwise `$false` or `$null`
- `Error`: present only when `Status` is `KO`

## Behavior

1) Resolves the log directory (creates it when needed).  
2) Verifies the target file exists. If missing, it returns `KO` and emits an error.  
3) Writes a test log entry through `Write-Log`.  
4) On failure and with `-TryFix`, archives the existing file as `<name>.unwritable.<yyyyMMdd-HHmmss>.bak`, then retries the write.  
5) Reports success (`OK`) or failure (`KO`) with details.

## Examples

Check that the default activity log is writable:

```powershell
Test-ActivityLog -LogLocation "C:\Logs"
```

Attempt an automatic repair when the file is locked or corrupted:

```powershell
Test-ActivityLog -LogLocation "C:\Logs" -TryFix
```

## Questions and answers

### Does `Test-ActivityLog` create the file?

It creates the directory if missing. The file must exist; otherwise it returns `KO` with `NotFound`. If the file exists but is unwritable, use `-TryFix` to archive it and recreate a new one.