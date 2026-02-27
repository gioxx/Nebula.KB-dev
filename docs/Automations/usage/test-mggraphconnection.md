---
sidebar_position: 2
title: 'Test-MgGraphConnection'
description: Connect to Microsoft Graph using application (client credential) authentication.
hide_title: true
id: test-mggraphconnection
tags:
  - Test-MgGraphConnection
  - Nebula.Automations
  - Microsoft Graph
---

# Test-MgGraphConnection

Connect to **Microsoft Graph** using application (client credential) authentication. Returns `$true` on success, `$false` on failure.

:::note
The function name is `Test-MgGraphConnection`. The legacy alias `CheckMGGraphConnection` remains available for backward compatibility.
:::

The function ensures that the `Microsoft.Graph` module is available (optionally auto-installs it), then performs a client credentials flow to obtain an access token and calls `Connect-MgGraph -AccessToken`. It returns `$true`/`$false`. Logging uses `Write-Log` when available; if `Nebula.Log` is missing, the module exposes a compatible `Write-Log`/`Log-Message` that delegates to `Write-NALog`.

## Syntax

```powershell
Test-MgGraphConnection -TenantId <Guid> -ClientId <Guid> -ClientSecret <String>
                       [-AutoInstall] [-LogLocation <String>] [-ShowInformations]
```

## Parameters

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `TenantId` | Azure AD tenant ID (GUID). | Yes | - |
| `ClientId` | App registration (client) ID. | Yes | - |
| `ClientSecret` | Client secret associated with the app registration. | Yes | - |
| `AutoInstall` | Install `Microsoft.Graph` if missing. | No | `$false` |
| `LogLocation` | Full path of the log file. Used by `Write-Log` if available. | No | - |
| `ShowInformations` | When `$true`, writes verbose connection details (client secrets are masked). | No | `$false` |

:::important
- Auto-install is supported: add `-AutoInstall` if `Microsoft.Graph` might be missing.
- `ShowInformations` masks secrets but still prints identifiers; enable only for troubleshooting and protect the log file.
:::

## Examples

- **Basic connection (Boolean return)**

```powershell
$secret = Get-Content "$env:APPDATA\nebula\.graph_secret.txt" -Raw

$connected = Test-MgGraphConnection `
  -TenantId "00000000-0000-0000-0000-000000000000" `
  -ClientId "11111111-1111-1111-1111-111111111111" `
  -ClientSecret $secret `
  -LogLocation "$env:APPDATA\nebula\logs\graph-connect.log"

if (-not $connected) { throw "Unable to connect to Microsoft Graph." }
```

- **Auto-install if needed**

```powershell
$connected = CheckMGGraphConnection `
  -TenantId $tenantId `
  -ClientId $clientId `
  -ClientSecret $clientSecret `
  -AutoInstall

if (-not $connected) { throw "Unable to connect to Microsoft Graph." }
```

- **Enable verbose diagnostics**

```powershell
$connected = Test-MgGraphConnection `
  -TenantId $tenantId `
  -ClientId $clientId `
  -ClientSecret $clientSecret `
  -LogLocation "C:\Logs\graph-debug.log" `
  -ShowInformations $true

if (-not $connected) { throw "Unable to connect to Microsoft Graph." }
```

:::note
- When `Nebula.Log` is installed, its `Write-Log` handles log output; otherwise Nebula.Automations provides a compatible `Write-Log`/`Log-Message` that delegates to `Write-NALog`.
- Secrets are masked when verbose logging is enabled.
:::

## Questions and answers

### Does Test-MgGraphConnection auto-install Microsoft.Graph?

Only when you specify `-AutoInstall`. Otherwise the module must already be installed.

### What does Test-MgGraphConnection log?

If `Nebula.Log` is available, it uses `Write-Log` and honors `-LogLocation`. Otherwise it exposes a compatible `Write-Log` (`Write-NALog`).

### How are secrets masked?

With `-ShowInformations` it masks secrets in logs but still prints identifiers; enable it only for troubleshooting and protect the log file.