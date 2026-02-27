---
sidebar_position: 5
title: Runtime Helpers
id: runtime-overview
description: Functions for script bootstrap, configuration, activity checks, and transcripts.
---

# Runtime Helpers

This page collects the runtime bootstrap and operational helper functions.

## Import-PreferredModule

Import a module preferring an installed version or a specific source when needed.

## Initialize-ScriptRuntime

Initialize module imports, XML config loading, and optional log directory creation.

## Resolve-ScriptConfigPaths

Resolve configuration and runtime paths consistently across environments.

## Test-ScriptActivityLog

Evaluate script activity state based on a log/timestamp source.

## Start-ScriptTranscript

Safely start transcript logging.

## Stop-ScriptTranscriptSafe

Safely stop transcript logging without breaking script execution flow.

## Typical bootstrap

```powershell
$runtime = Initialize-ScriptRuntime `
  -ConfigPath "C:\Config\tenant.config.xml" `
  -ModulesToImport @("Nebula.Log", "Nebula.Automations") `
  -LogDirectory "C:\Logs\TenantA" `
  -EnsureLogDirectory
```

## Notes

Use `Get-Help <FunctionName> -Detailed` to inspect full signatures and edge-case behavior for each runtime helper.

## Next

- [Logging](./logging)
