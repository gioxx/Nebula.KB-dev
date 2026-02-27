---
sidebar_position: 2
title: Connection
id: connection
description: Functions for (Microsoft Graph) connectivity and validation.
tags:
  - Test-MgGraphConnection
  - Microsoft.Graph
  - Nebula.Automations
---

# Connect to Microsoft 365

This page covers Graph connectivity checks used by automation scripts. For full and always-up-to-date details, use `Get-Help <FunctionName> -Detailed` (or `-Examples`).

## Test-MgGraphConnection

Validate and initialize Microsoft Graph connectivity, with optional auto-install behavior.

**Syntax**

```powershell
Test-MgGraphConnection -TenantId <String> -ClientId <String> -ClientSecret <String>
                       [-AutoInstall] [-LogLocation <String>] [-ShowInformations]
```

**Parameters**

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | --- | --- |
| `TenantId` | `String` | Microsoft Entra tenant ID used for app authentication. | Yes | N/A |
| `ClientId` | `String` | Application (client) ID. | Yes | N/A |
| `ClientSecret` | `String` | Client secret for app-based authentication. | Yes | N/A |
| `AutoInstall` | `Boolean` | Automatically installs `Microsoft.Graph` when missing. | No | `False` |
| `LogLocation` | `String` | Log destination path for connection checks. | No | `None` |
| `ShowInformations` | `Boolean` | Emits additional diagnostic information during validation. | No | `False` |

**Example**

```powershell
$ok = Test-MgGraphConnection `
  -TenantId "00000000-0000-0000-0000-000000000000" `
  -ClientId "11111111-1111-1111-1111-111111111111" `
  -ClientSecret $secret `
  -AutoInstall
```
