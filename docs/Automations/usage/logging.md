---
sidebar_position: 6
title: "Logging"
id: logging
description: Functions related to log writing and fallback logging behavior.
tags:
  - Write-Log
  - Log-Message
  - Write-NALog
  - Nebula.Automations
---

# Logging

This page contains logging compatibility helpers used by Nebula.Automations. For full and always-up-to-date details, use `Get-Help <FunctionName> -Detailed` (or `-Examples`).

## Write-Log

Compatibility wrapper exposed by Nebula.Automations when `Nebula.Log` is unavailable.

**Syntax**

```powershell
Write-Log [-Message <String>] [-Level <INFO|SUCCESS|WARNING|DEBUG|ERROR>] [-LogLocation <String>] [-WriteToFile]
```

**Parameters**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `Message` | `String` | No | - | Log message text. |
| `Level` | `String` | No | `INFO` | Log severity level. |
| `LogLocation` | `String` | No | Current location | Optional target log path/directory. |
| `WriteToFile` | `Switch` | No | `False` | Compatibility switch (ignored in fallback mode). |

**Example**

```powershell
Write-Log -Message "Nightly sync completed" -Level INFO -LogLocation "C:\Logs\sync.log"
```

**Notes**

- If `Nebula.Log` exists, its native `Write-Log` is used.
- Otherwise, Nebula.Automations exposes a compatible `Write-Log`/`Log-Message` flow.

## Log-Message

Alias of `Write-Log` with the same parameters and behavior.
