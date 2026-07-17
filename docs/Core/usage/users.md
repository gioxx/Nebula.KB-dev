---
sidebar_position: 6
title: "Users"
description: Search and resolve Entra users, including guests and partial identity matches.
hide_title: true
id: users
tags:
  - Find-UserConnected
  - Find-UserRecipient
  - Search-EntraUser
  - Remove-EntraUser
  - Nebula.Core
  - Users
  - Microsoft Graph
---

# User helpers

Search and resolution helpers for Entra users and user-linked identities.

Requires Microsoft Graph for Entra user searches. For full details and examples, run `Get-Help <FunctionName> -Detailed`.

`Search-EntraUser` is the quick-search helper for users. It is especially useful for guest identities where you only remember a fragment of the invited domain, a bit of the display name, or part of the UPN. It uses Microsoft Graph search first and then falls back to a broader substring scan so partial guest UPN fragments are less likely to be missed.

## Search-EntraUser
Find Entra users by display name, user principal name, and/or mail (Graph scopes: `User.Read.All`, `Directory.Read.All`).

**Syntax**

```powershell
Search-EntraUser -SearchText <String> [-SearchIn <String>] [-IndexOnly] [-Detailed] [-GridView]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SearchText` | String | Text to search in display name, UPN, and/or mail. Pipeline accepted. | Yes | - |
| `SearchIn` | String | Search target: DisplayName, UserPrincipalName, Mail, Any. | No | `Any` |
| `IndexOnly` | Switch | Use Graph indexed search only. Faster, but may miss guest fragments and other partial matches. | No | `False` |
| `Detailed` | Switch | Show match source, guest fragment, and user metadata columns. | No | `False` |
| `GridView` | Switch | Show details in Out-GridView. | No | `False` |

**Examples**
```powershell
Search-EntraUser -SearchText "step"
```

```powershell
Search-EntraUser -SearchText "federica" -SearchIn DisplayName
```

```powershell
"guest" | Search-EntraUser -SearchIn Any -GridView
```

```powershell
Search-EntraUser -SearchText "step" -IndexOnly
```

Use `-Detailed` when you want the extra diagnostic columns like `Matched By`, `Guest Fragment`, `Search Mode`, and user metadata.

## Remove-EntraUser
Remove an Entra user from the tenant by user principal name (Graph scopes: `User.ReadWrite.All`, `Directory.Read.All`).

**Syntax**

```powershell
Remove-EntraUser -UserPrincipalName <String> [-PassThru] [-WhatIf] [-Confirm]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserPrincipalName` | String | Exact user principal name to remove. Pipeline accepted. | Yes | - |
| `PassThru` | Switch | Return the removed user details after deletion. | No | `False` |

**Examples**
```powershell
Remove-EntraUser -UserPrincipalName "antonio.sala_stepsrl.org#EXT#@messita.onmicrosoft.com"
```

```powershell
"federica.arpaia_stepsrl.it#EXT#@messita.onmicrosoft.com" | Remove-EntraUser -WhatIf
```

```powershell
Remove-EntraUser -UserPrincipalName "antonio.sala_stepsrl.org#EXT#@messita.onmicrosoft.com" -PassThru
```

The command uses `ShouldProcess`, so `-WhatIf` and `-Confirm` are respected.
