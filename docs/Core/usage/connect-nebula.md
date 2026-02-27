---
sidebar_position: 2
title: "Connect to M365"
description: Establish and tear down Exchange Online and Microsoft Graph sessions with one call.
hide_title: true
id: connect-nebula
tags:
  - Connect-Nebula
  - Connect-EOL
  - Get-NebulaConnections
  - Update-NebulaConnections
  - Disconnect-Nebula
  - Leave-Nebula
  - Nebula.Core
---

# Connect (and disconnects) to/from Microsoft 365

For full, always-up-to-date details and examples, use `Get-Help <FunctionName> -Detailed` or `-Examples`.

## Connect-EOL
Connect to Exchange Online (EXO V3), auto-importing the module and auto-detecting the current user when `-UserPrincipalName` is not supplied.

**Syntax**

```powershell
Connect-EOL [-UserPrincipalName <String>] [-DelegatedOrganization <String>] [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserPrincipalName` | String | UPN/e-mail for the EXO auth prompt. | No | Current user (`Find-UserConnected`) |
| `DelegatedOrganization` | String | Target customer tenant (delegated admin). | No | - |
| `PassThru` | Switch | Return the `Connect-ExchangeOnline` session object. | No | `False` |

**Example**
```powershell
Connect-EOL -UserPrincipalName 'admin@contoso.com'
```

## Connect-Nebula
One-shot helper that ensures EXO is connected, then (optionally) connects Microsoft Graph.

**Syntax**

```powershell
Connect-Nebula [-UserPrincipalName <String>] [-GraphScopes <String[]>] [-GraphTenantId <String>]
               [-GraphDeviceCode] [-AutoInstall] [-ForceReconnect] [-SkipGraph]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserPrincipalName` | String | UPN for EXO auth. | No | Auto-detected |
| `GraphScopes` | String[] | Graph delegated scopes to request. | No | `User.Read.All` |
| `GraphTenantId` | String | Tenant ID/domain for Graph. | No | - |
| `GraphDeviceCode` | Switch | Use device code instead of browser for Graph. | No | `False` |
| `AutoInstall` | Switch | Auto-install missing modules. | No | `False` |
| `ForceReconnect` | Switch | Skip health checks and reconnect both services. | No | `False` |
| `SkipGraph` | Switch | Connect only EXO, skip Graph entirely. | No | `False` |

**Example**
```powershell
Connect-Nebula -GraphScopes 'User.Read.All','Directory.Read.All' -AutoInstall
```

:::note Automatic update function
By default, `Connect-Nebula` checks PowerShell Gallery for updates of `Nebula.*` modules plus the meta modules `ExchangeOnlineManagement` and `Microsoft.Graph`, warning only when updates are available.
Disable it by setting `CheckUpdatesOnConnect = $false` in your `settings.psd1` and then run `Sync-NebulaConfig`.
You can also throttle checks by setting `CheckUpdatesIntervalHours` (default is `24`).
Run `Get-NebulaModuleUpdates` anytime to trigger a manual check.
:::

## Disconnect-Nebula
Disconnect EXO and/or Graph.

**Syntax**

```powershell
Disconnect-Nebula [-ExchangeOnly] [-GraphOnly]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `ExchangeOnly` | Switch | Disconnect only EXO. | No | `False` |
| `GraphOnly` | Switch | Disconnect only Graph. | No | `False` |

**Example**
```powershell
Disconnect-Nebula -GraphOnly   # keep EXO session alive
```

:::tip
`Leave-Nebula` is an alias for `Disconnect-Nebula`.
:::

## Get-NebulaConnections
Show current Nebula connection status for Exchange Online and Microsoft Graph.
By default it runs lightweight health probes (unless `-SkipHealthCheck`) which can also refresh provider-side sessions/tokens.

**Syntax**

```powershell
Get-NebulaConnections [-SkipHealthCheck]
```

## Update-NebulaConnections
Explicit refresh entry point for connection status checks. It runs the same checks as `Get-NebulaConnections` and is preferred when your intent is to "refresh/revive" current sessions.

**Syntax**

```powershell
Update-NebulaConnections [-SkipHealthCheck]
```

**Returned properties**

| Property | Description |
| --- | --- |
| `ExchangeOnlineConnected` | `True` when an EXO session is active. |
| `ExchangeOnlineHealthy` | `True` when a lightweight EXO probe succeeds (session really usable). |
| `ExchangeOnlineError` | Last EXO validation error (if any). |
| `ExchangeOnlineUser` | Connected EXO user (when available). |
| `ExchangeOnlineTenant` | Connected EXO organization/tenant (when available). |
| `MicrosoftGraphConnected` | `True` when a Graph context is active. |
| `MicrosoftGraphHealthy` | `True` when a lightweight Graph probe succeeds (token really usable). |
| `MicrosoftGraphError` | Last Graph validation error (if any). |
| `MicrosoftGraphAccount` | Connected Graph account (when available). |
| `MicrosoftGraphTenantId` | Connected Graph tenant ID (when available). |
| `MicrosoftGraphScopes` | Scopes present in the active Graph context. |

**Example**
```powershell
Connect-Nebula
Update-NebulaConnections
Leave-Nebula
```

## Questions and answers

### Which services does `Connect-Nebula` connect?

Exchange Online always; Microsoft Graph unless you use `-SkipGraph`. Default Graph scopes include `User.Read.All` (extend with `-GraphScopes`).

### Can I operate across multiple tenants?

Yes. Use `Connect-EOL -DelegatedOrganization` for delegated tenants and `Connect-Nebula -GraphTenantId` for Graph. Run `Disconnect-Nebula` before switching contexts.

### How can I check active sessions before disconnecting?

Run `Update-NebulaConnections` (or `Get-NebulaConnections`) and verify `ExchangeOnlineConnected` / `MicrosoftGraphConnected` are `True` or `False`.
For real usability checks after long idle periods, prefer `ExchangeOnlineHealthy` / `MicrosoftGraphHealthy`.
