---
sidebar_position: 6
title: 'Resolve-ScriptConfigPaths'
description: Build reusable config, log, and output paths from script root.
hide_title: true
id: resolve-scriptconfigpaths
tags:
  - Resolve-ScriptConfigPaths
  - Runtime
  - Nebula.Automations
---

# Resolve-ScriptConfigPaths

Builds a normalized path set used by automation scripts: config path, log directory, and output path.

## Syntax

```powershell
Resolve-ScriptConfigPaths -ScriptRoot <String> -ConfigRelativePath <String>
                          [-ConfigRootPath <String>] [-LogRelativePath <String>]
                          [-OutputRelativePath <String>] [-EnsureDirectories]
```

## Example

```powershell
$paths = Resolve-ScriptConfigPaths `
  -ScriptRoot $PSScriptRoot `
  -ConfigRelativePath "Config\tenant.config.xml" `
  -LogRelativePath "Logs\SyncUsers" `
  -OutputRelativePath "Output\result.json" `
  -EnsureDirectories

if (-not $paths.Success) { throw $paths.Message }
```

