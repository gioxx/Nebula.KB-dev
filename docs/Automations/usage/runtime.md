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

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | --- | --- |
| `ModuleName` | `String` | Name of the module to import. | Yes | N/A |
| `DevManifestPath` | `String` | Path to a development `.psd1` manifest used when `PreferDev` is enabled. | No | `None` |
| `PreferDev` | `Boolean` | Prefer the development manifest when available. | No | `True` |
| `Force` | `Switch` | Forces module import/reload behavior. | No | `False` |

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

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | --- | --- |
| `ConfigPath` | `String` | Path to the XML configuration file to load. | Yes | N/A |
| `ModulesToImport` | `String[]` | One or more module names to import before loading configuration. | No | `@('Nebula.Log','Nebula.Automations')` |
| `LogDirectory` | `String` | Target log directory used by runtime helpers. | No | `None` |
| `EnsureLogDirectory` | `Switch` | Creates `LogDirectory` when it does not exist. | No | `False` |

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

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | --- | --- |
| `ScriptRoot` | `String` | Root path of the running script (typically `$PSScriptRoot`). | Yes | N/A |
| `ConfigRelativePath` | `String` | Config file path relative to `ConfigRootPath` (or parent of `ScriptRoot`). | Yes | N/A |
| `ConfigRootPath` | `String` | Explicit root folder for config path resolution. | No | `Parent of ScriptRoot` |
| `LogRelativePath` | `String` | Relative path used to build the resolved log directory. | No | `None` |
| `OutputRelativePath` | `String` | Relative path used to build the resolved output file path. | No | `None` |
| `EnsureDirectories` | `Switch` | Creates missing parent directories for resolved log/output paths. | No | `False` |

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

## Start-ScriptTranscript

Safely start transcript logging.

**Syntax**

```powershell
Start-ScriptTranscript -OutputDirectory <String> [-CleanupOld] [-CleanupPattern <String>] [-IncludeInvocationHeader]
```

**Parameters**

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | --- | --- |
| `OutputDirectory` | `String` | Folder where transcript files are written. | Yes | N/A |
| `CleanupOld` | `Switch` | Deletes old transcript files matching `CleanupPattern` before start. | No | `False` |
| `CleanupPattern` | `String` | Filename pattern used when `CleanupOld` is enabled. | No | `PowerShell*.txt` |
| `IncludeInvocationHeader` | `Switch` | Includes invocation header metadata in transcript output. | No | `False` |

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

## Test-ScriptActivityLog

Evaluate script activity state based on a log/timestamp source.

**Syntax**

```powershell
Test-ScriptActivityLog -LogLocation <String>
```

**Parameters**

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | --- | --- |
| `LogLocation` | `String` | Path used to validate script activity logging capability. | Yes | N/A |

**Notes**

- Uses `Test-ActivityLog` when available (typically from `Nebula.Log`).
- Falls back to a write/delete probe file test if `Test-ActivityLog` is unavailable.
- Returns `Success`, `Status` (`OK`/`KO`), `LogLocation`, and `Message`.

**Example**

```powershell
$activity = Test-ScriptActivityLog -LogLocation "C:\Logs\TenantA"
if ($activity.Status -ne "OK") { throw $activity.Message }
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
