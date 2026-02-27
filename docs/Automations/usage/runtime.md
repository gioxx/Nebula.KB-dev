---
sidebar_position: 5
title: "Runtime Helpers"
id: runtime
description: Functions for script bootstrap, configuration, activity checks, and transcripts.
tags:
  - Initialize-ScriptRuntime
  - Resolve-ScriptConfigPaths
  - Start-ScriptTranscript
  - Stop-ScriptTranscriptSafe
  - Nebula.Automations
---

# Runtime Helpers

This page collects the runtime bootstrap and operational helper functions. For full and always-up-to-date details, use `Get-Help <FunctionName> -Detailed` (or `-Examples`).

## Import-PreferredModule

Import a module preferring an installed version or a specific source when needed.

**Syntax**

```powershell
Import-PreferredModule -ModuleName <String> [-DevManifestPath <String>] [-PreferDev <Boolean>] [-Force]
```

**Parameters**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `ModuleName` | `String` | Yes | - | Module name to import. |
| `DevManifestPath` | `String` | No | - | Optional path to a development manifest (`.psd1`). |
| `PreferDev` | `Boolean` | No | `True` | Prefer `DevManifestPath` when available. |
| `Force` | `Switch` | No | `False` | Forces module reload. |

**Notes**

- If `-PreferDev` is enabled and `-DevManifestPath` exists, the module is imported from that manifest.
- Returns an object with `Success`, `Source` (`DEV` or `Installed`), `Version`, `Path`, and `Message`.

**Example**

```powershell
$mod = Import-PreferredModule `
  -ModuleName "Nebula.Automations" `
  -DevManifestPath "C:\Repos\Nebula.Automations\Nebula.Automations.psd1" `
  -PreferDev $true `
  -Force

if (-not $mod.Success) { throw $mod.Message }
```

## Initialize-ScriptRuntime

Initialize module imports, XML config loading, and optional log directory creation.

**Syntax**

```powershell
Initialize-ScriptRuntime -ConfigPath <String> [-ModulesToImport <String[]>] [-LogDirectory <String>] [-EnsureLogDirectory]
```

**Parameters**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `ConfigPath` | `String` | Yes | - | Full path to the XML configuration file. |
| `ModulesToImport` | `String[]` | No | `@('Nebula.Log', 'Nebula.Automations')` | Modules imported before execution. |
| `LogDirectory` | `String` | No | - | Log directory path. |
| `EnsureLogDirectory` | `Switch` | No | `False` | Creates `LogDirectory` when missing. |

**Notes**

- Imports modules first, then loads XML config from `-ConfigPath`.
- With `-EnsureLogDirectory`, creates the log folder if missing.
- Returns `Success`, `Config`, `ConfigPath`, `LogDirectory`, and `Message`.

**Example**

```powershell
$runtime = Initialize-ScriptRuntime `
  -ConfigPath "C:\Config\tenant.config.xml" `
  -ModulesToImport @("Nebula.Log", "Nebula.Automations") `
  -LogDirectory "C:\Logs\TenantA" `
  -EnsureLogDirectory

if (-not $runtime.Success) { throw $runtime.Message }
```

## Resolve-ScriptConfigPaths

Resolve configuration and runtime paths consistently across environments.

**Syntax**

```powershell
Resolve-ScriptConfigPaths -ScriptRoot <String> -ConfigRelativePath <String> `
  [-ConfigRootPath <String>] [-LogRelativePath <String>] [-OutputRelativePath <String>] [-EnsureDirectories]
```

**Parameters**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `ScriptRoot` | `String` | Yes | - | Script root folder (typically `$PSScriptRoot`). |
| `ConfigRelativePath` | `String` | Yes | - | Relative path to config file under config root. |
| `ConfigRootPath` | `String` | No | Parent of `ScriptRoot` | Optional explicit config root path. |
| `LogRelativePath` | `String` | No | - | Optional relative path for log directory. |
| `OutputRelativePath` | `String` | No | - | Optional relative path for output file. |
| `EnsureDirectories` | `Switch` | No | `False` | Creates missing log/output parent directories. |

**Notes**

- If `-ConfigRootPath` is omitted, config root defaults to parent of `-ScriptRoot`.
- Can compute `ConfigPath`, `LogDirectory`, and `OutputPath` in one call.
- With `-EnsureDirectories`, creates missing log/output parent directories.

**Example**

```powershell
$paths = Resolve-ScriptConfigPaths `
  -ScriptRoot $PSScriptRoot `
  -ConfigRelativePath "Config\tenant.config.xml" `
  -LogRelativePath "Logs\TenantA" `
  -OutputRelativePath "Export\result.json" `
  -EnsureDirectories

if (-not $paths.Success) { throw $paths.Message }
```

## Test-ScriptActivityLog

Evaluate script activity state based on a log/timestamp source.

**Syntax**

```powershell
Test-ScriptActivityLog -LogLocation <String>
```

**Parameters**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `LogLocation` | `String` | Yes | - | Log directory path to validate. |

**Notes**

- Uses `Test-ActivityLog` when available (typically from `Nebula.Log`).
- Falls back to a write/delete probe file test if `Test-ActivityLog` is unavailable.
- Returns `Success`, `Status` (`OK`/`KO`), `LogLocation`, and `Message`.

**Example**

```powershell
$activity = Test-ScriptActivityLog -LogLocation "C:\Logs\TenantA"
if ($activity.Status -ne "OK") { throw $activity.Message }
```

## Start-ScriptTranscript

Safely start transcript logging.

**Syntax**

```powershell
Start-ScriptTranscript -OutputDirectory <String> [-CleanupOld] [-CleanupPattern <String>] [-IncludeInvocationHeader]
```

**Parameters**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `OutputDirectory` | `String` | Yes | - | Directory where transcript files are written. |
| `CleanupOld` | `Switch` | No | `False` | Removes existing transcript files before starting. |
| `CleanupPattern` | `String` | No | `PowerShell*.txt` | Filter used when `CleanupOld` is enabled. |
| `IncludeInvocationHeader` | `Switch` | No | `False` | Includes invocation header in transcript output. |

**Notes**

- Creates output directory when missing.
- With `-CleanupOld`, removes files matching `-CleanupPattern` before starting transcript.
- Returns `Success`, `TranscriptPath`, and `Message`.

**Example**

```powershell
$transcript = Start-ScriptTranscript `
  -OutputDirectory "C:\Logs\TenantA" `
  -CleanupOld `
  -CleanupPattern "PowerShell*.txt"

if (-not $transcript.Success) { throw $transcript.Message }
```

## Stop-ScriptTranscriptSafe

Safely stop transcript logging without breaking script execution flow.

**Syntax**

```powershell
Stop-ScriptTranscriptSafe
```

**Parameters**

This function has no parameters.

**Notes**

- If no transcript is active, it does not fail the script.
- Returns `Success` and `Message`.

**Example**

```powershell
$stop = Stop-ScriptTranscriptSafe
Write-Output $stop.Message
```

## End-to-end bootstrap example

```powershell
$paths = Resolve-ScriptConfigPaths `
  -ScriptRoot $PSScriptRoot `
  -ConfigRelativePath "Config\tenant.config.xml" `
  -LogRelativePath "Logs\MyScript" `
  -OutputRelativePath "Export\result.json" `
  -EnsureDirectories
if (-not $paths.Success) { throw $paths.Message }

$runtime = Initialize-ScriptRuntime `
  -ConfigPath $paths.ConfigPath `
  -ModulesToImport @("Nebula.Log", "Nebula.Automations") `
  -LogDirectory $paths.LogDirectory `
  -EnsureLogDirectory
if (-not $runtime.Success) { throw $runtime.Message }

$activity = Test-ScriptActivityLog -LogLocation $paths.LogDirectory
if ($activity.Status -ne "OK") { throw $activity.Message }

$transcript = Start-ScriptTranscript -OutputDirectory $paths.LogDirectory -CleanupOld
if (-not $transcript.Success) { throw $transcript.Message }

try {
  # Script workload here
}
finally {
  [void](Stop-ScriptTranscriptSafe)
}
```
