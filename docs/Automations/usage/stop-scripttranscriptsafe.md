---
sidebar_position: 9
title: 'Stop-ScriptTranscriptSafe'
description: Stop transcript safely without failing when no transcript is active.
hide_title: true
id: stop-scripttranscriptsafe
tags:
  - Stop-ScriptTranscriptSafe
  - Runtime
  - Nebula.Automations
---

# Stop-ScriptTranscriptSafe

Stops the active transcript and returns a status object. If no transcript is active, it returns success with an informational message.

## Syntax

```powershell
Stop-ScriptTranscriptSafe
```

## Example

```powershell
$txStop = Stop-ScriptTranscriptSafe
if (-not $txStop.Success) { throw $txStop.Message }
```

