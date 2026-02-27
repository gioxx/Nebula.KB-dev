---
sidebar_position: 5
title: 'Initialize-ScriptRuntime'
description: Initialize modules, configuration, and optional log directory for scripts.
hide_title: true
id: initialize-scriptruntime
tags:
  - Initialize-ScriptRuntime
  - Runtime
  - Nebula.Automations
---

# Initialize-ScriptRuntime

Initializes common runtime prerequisites: module imports, XML config loading, and optional log directory creation.

## Syntax

```powershell
Initialize-ScriptRuntime -ConfigPath <String> [-ModulesToImport <String[]>] [-LogDirectory <String>] [-EnsureLogDirectory]
```

## Example

```powershell
$runtime = Initialize-ScriptRuntime `
  -ConfigPath "C:\Config\tenant.config.xml" `
  -ModulesToImport @("Nebula.Log", "Nebula.Automations") `
  -LogDirectory "C:\Logs\TenantA" `
  -EnsureLogDirectory

if (-not $runtime.Success) { throw $runtime.Message }
```

