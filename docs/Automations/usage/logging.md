---
sidebar_position: 3
title: "Logging"
id: logging
description: Functions related to log writing and fallback logging behavior.
tags:
  - Log-Message
  - Write-Log
  - Write-NALog
  - Nebula.Automations
---

# Logging

This page contains logging compatibility helpers used by Nebula.Automations. For full and always-up-to-date details, use `Get-Help <FunctionName> -Detailed` (or `-Examples`).

## Log-Message

Alias of `Write-Log` with the same parameters and behavior.

**Parameters**

Uses the same parameters as `Write-Log`.

## Write-Log

Compatibility wrapper exposed by Nebula.Automations when `Nebula.Log` is unavailable.

**Syntax**

```powershell
Write-Log [-Message <String>] [-Level <INFO|SUCCESS|WARNING|DEBUG|ERROR>] [-LogLocation <String>] [-WriteToFile]
```

**Parameters**

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | --- | --- |
| `Message` | `String` | Log message text to write. | No | `None` |
| `Level` | `String` | Severity level (`INFO`, `SUCCESS`, `WARNING`, `DEBUG`, `ERROR`). | No | `INFO` |
| `LogLocation` | `String` | Log file path or destination location. | No | `None` |
| `WriteToFile` | `Switch` | Forces file output when supported by the active logger. | No | `False` |

**Example**

```powershell
Write-Log -Message "Nightly sync completed" -Level INFO -LogLocation "C:\Logs\sync.log"
```

**Notes**

- If `Nebula.Log` exists, its native `Write-Log` is used.
- Otherwise, Nebula.Automations exposes a compatible `Write-Log`/`Log-Message` flow.
