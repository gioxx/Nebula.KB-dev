---
sidebar_position: 9
title: "Security"
description: Disable devices, block sign-in, and revoke sessions via Microsoft Graph.
hide_title: true
id: security
tags:
  - Disable-UserDevices
  - Disable-UserSignIn
  - Revoke-UserSessions
  - Nebula.Core
---

# Security helpers

Requires a Microsoft Graph session. For full details and examples, run `Get-Help <FunctionName> -Detailed` (or `-Examples`).

## Disable-UserDevices
Disable all registered devices for specified users.

**Syntax**
```powershell
Disable-UserDevices -UserPrincipalName <String[]> [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserPrincipalName` (`Identity`) | String[] | Target users (UPN/object ID/short identifier). Pipeline accepted. | Yes | - |
| `PassThru` | Switch | Emit the impacted devices. | No | `False` |

**Example**
```powershell
Disable-UserDevices -UserPrincipalName user1@contoso.com,user2@contoso.com -WhatIf
```

## Disable-UserSignIn
Block sign-in (AccountEnabled = $false) for specified users.

**Syntax**
```powershell
Disable-UserSignIn -UserPrincipalName <String[]> [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserPrincipalName` (`Identity`) | String[] | Target users (UPN/object ID/short identifier). Pipeline accepted. | Yes | - |
| `PassThru` | Switch | Emit the impacted users. | No | `False` |

**Example**
```powershell
Disable-UserSignIn -UserPrincipalName user1@contoso.com -Confirm:$false
```

## Revoke-UserSessions
Force sign-out by revoking refresh tokens for users.

**Syntax**
```powershell
Revoke-UserSessions [-All] [-UserPrincipalName <String[]>] [-Exclude <String[]>] [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `All` | Switch | Target every user in the tenant. | No | `False` |
| `UserPrincipalName` (`Identity`) | String[] | Users to target (UPN/object ID/short identifier). Pipeline accepted. | No | - |
| `Exclude` | String[] | Users to skip (UPN/object ID/short identifier; applies to both -All and explicit lists). | No | - |
| `PassThru` | Switch | Emit the impacted users. | No | `False` |

**Examples**
```powershell
Revoke-UserSessions -UserPrincipalName user1@contoso.com,user2@contoso.com
```

```powershell
Revoke-UserSessions -All -Exclude user@contoso.com -Confirm:$false
```

Notes:
- Supports `-WhatIf`/`-Confirm` for safety.
- Skips missing users and reports exclusions.
- User identities are resolved through `Find-UserRecipient`, so short identifiers are supported.
