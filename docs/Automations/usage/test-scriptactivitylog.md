---
sidebar_position: 7
title: 'Test-ScriptActivityLog'
description: Validate that script activity logging is available and writable.
hide_title: true
id: test-scriptactivitylog
tags:
  - Test-ScriptActivityLog
  - Logging
  - Nebula.Automations
---

# Test-ScriptActivityLog

Checks whether a log directory is writable. Uses `Test-ActivityLog` when available, otherwise performs a fallback write/delete probe.

## Syntax

```powershell
Test-ScriptActivityLog -LogLocation <String>
```

## Example

```powershell
$status = Test-ScriptActivityLog -LogLocation "C:\Logs\TenantA"
if (-not $status.Success) { throw $status.Message }
```

