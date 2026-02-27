---
sidebar_position: 4
title: 'Import-PreferredModule'
description: Import a module preferring a development manifest when available.
hide_title: true
id: import-preferredmodule
tags:
  - Import-PreferredModule
  - Runtime
  - Nebula.Automations
---

# Import-PreferredModule

Imports a module from a development manifest when available, otherwise falls back to the installed module by name.

## Syntax

```powershell
Import-PreferredModule -ModuleName <String> [-DevManifestPath <String>] [-PreferDev <Boolean>] [-Force]
```

## Parameters

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `ModuleName` | Module name to import. | Yes | - |
| `DevManifestPath` | Optional path to a development `.psd1`. | No | - |
| `PreferDev` | Prefer `DevManifestPath` when valid. | No | `True` |
| `Force` | Force module reload. | No | `False` |

## Example

```powershell
$result = Import-PreferredModule `
  -ModuleName "Nebula.Automations" `
  -DevManifestPath "C:\Temp\Nebula.Automations\Nebula.Automations.psd1" `
  -Force

if (-not $result.Success) { throw $result.Message }
```
