---
sidebar_position: 8
title: 'Start-ScriptTranscript'
description: Start script transcript safely with optional cleanup of old files.
hide_title: true
id: start-scripttranscript
tags:
  - Start-ScriptTranscript
  - Runtime
  - Nebula.Automations
---

# Start-ScriptTranscript

Starts a transcript in a target output directory and can optionally remove old transcript files first.

## Syntax

```powershell
Start-ScriptTranscript -OutputDirectory <String> [-CleanupOld] [-CleanupPattern <String>] [-IncludeInvocationHeader]
```

## Example

```powershell
$tx = Start-ScriptTranscript `
  -OutputDirectory "C:\Logs\MyScript" `
  -CleanupOld `
  -CleanupPattern "PowerShell*.txt"

if (-not $tx.Success) { throw $tx.Message }
```

