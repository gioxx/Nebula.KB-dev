---
sidebar_position: 9
title: "Security"
description: Disable devices, block sign-in, edit content filter policies, and revoke sessions via Microsoft Graph.
hide_title: true
id: security
tags:
  - Disable-UserDevices
  - Disable-UserSignIn
  - Get-ContentFilterPolicy
  - Edit-ContentFilterPolicy
  - Revoke-UserSessions
  - Nebula.Core
---

# Security helpers

Requires a Microsoft Graph session for the Graph-based cmdlets and an Exchange Online session for `Edit-ContentFilterPolicy`. For full details and examples, run `Get-Help <FunctionName> -Detailed` (or `-Examples`).

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

## Edit-ContentFilterPolicy
Update hosted content filter allow/block lists and keep the related allowed-senders group and transport-rule domain exceptions in sync.

**Syntax**
```powershell
Edit-ContentFilterPolicy -Identity <String> [-BlockedSender <String[]>] [-BlockedDomain <String[]>] [-AllowedSender <String[]>] [-AllowedDomain <String[]>] [-AllowedSendersGroup <String>] [-TransportRuleNames <String[]>] [-Remove]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `Identity` (`SpamFilter`, `PolicyName`) | String | Hosted content filter policy name. Pipeline accepted. | Yes | - |
| `BlockedSender` | String[] | Sender addresses to add or remove from `BlockedSenders`. | No | - |
| `BlockedDomain` | String[] | Domains to add or remove from `BlockedSenderDomains`. | No | - |
| `AllowedSender` | String[] | Sender addresses to add or remove from `AllowedSenders`. | No | - |
| `AllowedDomain` | String[] | Domains to add or remove from `AllowedSenderDomains`. | No | - |
| `AllowedSendersGroup` | String | Optional distribution group used to mirror allowed senders. | No | - |
| `TransportRuleNames` | String[] | Optional transport rules that should mirror allowed-domain exceptions. | No | - |
| `Remove` | Switch | Remove the provided values instead of adding them. | No | `False` |

**Examples**
```powershell
Edit-ContentFilterPolicy -Identity Contoso -BlockedSender user@contoso.com
```

```powershell
Edit-ContentFilterPolicy -Identity Contoso -AllowedDomain contoso.com -Remove
```

Notes:
- The command returns a summary object with the refreshed policy state.
- When adding allowed senders, missing mail contacts are created and hidden from the address list if `-AllowedSendersGroup` is provided.
- When adding or removing allowed domains, matching transport-rule exceptions are updated too if `-TransportRuleNames` is provided.

## Get-ContentFilterPolicy
List hosted content filter policies and inspect their current allow/block lists.

**Syntax**
```powershell
Get-ContentFilterPolicy [[-Identity] <String[]>] [-Detailed]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `Identity` (`SpamFilter`, `PolicyName`) | String[] | One or more policy names to inspect. If omitted, all policies are returned. Pipeline accepted. | No | - |
| `Detailed` | Switch | Include the resolved allow/block lists in the output. | No | `False` |

**Examples**
```powershell
Get-ContentFilterPolicy
```

```powershell
Get-ContentFilterPolicy -Identity Contoso
```

```powershell
Get-ContentFilterPolicy -Detailed
```

Notes:
- The default output is compact and shows counts.
- Use `-Detailed` to include the resolved allow/block entries.
- Use this before `Edit-ContentFilterPolicy` if you want to see the current configuration.

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
