---
sidebar_position: 2
title: "Write-Log"
description: Main entry point for writing console and file logs with levels, rotation, JSON, and optional colors.
hide_title: true
id: write-log
tags:
  - Write-Log
  - Nebula.Log
  - Log
---

# Write-Log

Main entry point for writing console and file logs with levels, rotation, JSON, and optional colors.

:::note
The function name is `Write-Log`. The legacy alias `Log-Message` remains available for backward compatibility.
:::

## Syntax

```powershell
Write-Log [-LogLocation <String>] -Message <String> [-LogFileName <String>] [-Level <String>]
          [-WriteToFile] [-WriteOnlyToFile] [-MaxFileSizeKB <Int>] [-AsJson] [-PassThru] [-Color]
```

## Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `LogLocation` | string | inferred | Optional directory for logs. If omitted, uses the first caller script folder outside the module, otherwise the current directory. |
| `Message` | string | n/a | Message to log. |
| `LogFileName` | string | `activity.log` | File name. Invalid file-name characters are rejected. |
| `Level` | INFO, SUCCESS, WARNING, DEBUG, ERROR | `INFO` | Log level and console color mapping. |
| `WriteToFile` | switch | off | Write the entry to file. Creates the directory if missing. |
| `WriteOnlyToFile` | switch | off | Suppress console output. Only relevant when logging to file. |
| `MaxFileSizeKB` | int | `512` | Threshold before rotation. Minimum enforced value is 1 KB. |
| `AsJson` | switch | off | Emit JSON Lines objects (`{"timestamp":"...","level":"...","message":"..."}`). |
| `PassThru` | switch | off | Return a `[pscustomobject]` with Timestamp, Level, Message, Path (if written). |
| `Color` | switch | off | Colorize console output by level. |

## Behavior

- Directory resolution: `Resolve-LogLocation` finds the target folder and can create it.
- Rotation: when `-WriteToFile` is set and the file size is at least `MaxFileSizeKB`, the existing file is moved to `<name>.<yyyyMMdd-HHmmss>.bak` and a new file starts.
- Encoding: file writes use UTF-8 (no BOM) with small retries to handle transient locks.
- Console formatting: plain text by default; JSON when `-AsJson`; optional colors when `-Color`.
- Error handling: failed file writes raise an error; rotation issues are reported with `Write-Error` but do not stop execution unless the write itself fails.

## Where logs go by default

`LogLocation` is optional. If you do not set it:

1) Nebula.Log inspects the call stack and uses the folder of the first caller script outside the module.  
2) If nothing is found (for example, an interactive console), it falls back to the current working directory.

## Rotation defaults

If `-WriteToFile` is used and the log file reaches 512 KB, it is archived as `<name>.<yyyyMMdd-HHmmss>.bak` and a fresh file is created.

## Examples

Minimal console log:

```powershell
Write-Log -Message "Ready" -Level INFO
```

Write and rotate at 128 KB:

```powershell
Write-Log -LogLocation "C:\Logs\Sales" `
          -LogFileName "sales.log" `
          -Message "Batch completed" `
          -Level SUCCESS `
          -WriteToFile `
          -MaxFileSizeKB 128
```

Quiet file-only JSON logging, returning the object:

```powershell
$entry = Write-Log -Message "Webhook accepted" -Level DEBUG `
                   -AsJson -WriteToFile -WriteOnlyToFile -PassThru
```

Colorized console output without touching the disk:

```powershell
Write-Log -Message "Heads up" -Level WARNING -Color
```

## Questions and answers

### What is the default log directory?

If `LogLocation` is not provided, Nebula.Log inspects the call stack and uses the first caller script folder outside the module. When it cannot find a caller script (for example, in the interactive console), it falls back to the current working directory.

### How are rotated files named?

When the size reaches `MaxFileSizeKB`, the current file is moved to `<name>.<yyyyMMdd-HHmmss>.bak` in the same directory, and a new file starts.

### Does console logging stop when I set `-WriteToFile`?

No. `-WriteToFile` adds file output and keeps console output. Use `-WriteOnlyToFile` to suppress console output.

### What does `-AsJson` look like?

Output is one JSON object per line, for example:

```json
{"timestamp":"2025-12-03T10:55:00.0000000Z","level":"INFO","message":"Service ready"}
```

### Can I capture the log entry as an object?

Yes. Add `-PassThru` to receive a `[pscustomobject]` containing `Timestamp`, `Level`, `Message`, and `Path` (when writing to file).

### How do I add colors?

Use `-Color` on `Write-Log`. Colors by level: SUCCESS = Green, WARNING = Yellow, DEBUG = Cyan, ERROR = Red, INFO = White.