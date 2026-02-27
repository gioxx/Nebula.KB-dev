---
sidebar_position: 3
title: "Microsoft Graph"
id: graph
description: Functions for Microsoft Graph connectivity and validation.
tags:
  - Test-MgGraphConnection
  - Microsoft.Graph
  - Nebula.Automations
---

# Microsoft Graph

This page covers Graph connectivity checks used by automation scripts. For full and always-up-to-date details, use `Get-Help <FunctionName> -Detailed` (or `-Examples`).

## Test-MgGraphConnection

Validate and initialize Microsoft Graph connectivity, with optional auto-install behavior.

**Syntax**

```powershell
Test-MgGraphConnection [-TenantId <String>] [-ClientId <String>] [-ClientSecret <String>]
                       [-AutoInstall] [-LogLocation <String>] [-ShowInformations]
```

**Parameters**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `TenantId` | `String` | Yes | - | Azure AD tenant ID (GUID or verified domain). |
| `ClientId` | `String` | Yes | - | Application (client) ID. |
| `ClientSecret` | `String` | Yes | - | Client secret associated with the application. |
| `AutoInstall` | `Boolean` | No | `False` | Installs `Microsoft.Graph` if missing. |
| `LogLocation` | `String` | No | - | Optional log file/location. |
| `ShowInformations` | `Boolean` | No | `False` | Emits additional diagnostics (secret is masked). |

**Example**

```powershell
$ok = Test-MgGraphConnection `
  -TenantId "00000000-0000-0000-0000-000000000000" `
  -ClientId "11111111-1111-1111-1111-111111111111" `
  -ClientSecret $secret `
  -AutoInstall
```
