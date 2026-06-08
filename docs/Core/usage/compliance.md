---
sidebar_position: 4
title: "Compliance"
description: Purview compliance helpers for mailbox content isolation and related workflows.
hide_title: true
id: compliance
tags:
  - Get-MboxMrmCleanup
  - Remove-MboxMrmCleanup
  - Search-MboxCutoffWindow
  - Set-MboxMrmCleanup
  - Nebula.Core
  - Purview
  - Compliance
---

# Compliance helpers

Requires an EXO session with Purview Compliance PowerShell availability (`Connect-IPPSSession`). For full details and examples, run `Get-Help <FunctionName> -Detailed`.

## Get-MboxMrmCleanup
List retention policies used by MRM cleanup workflows, with linked tag details shown inline.

By default, Nebula.Core limits the inventory to temporary objects created by `Set-MboxMrmCleanup`.
Use `-AllTenantObjects` to list every retention policy in the tenant.
Use `-Detailed` when you want the linked tag names and assigned mailbox lists in the output.

**Syntax**

```powershell
Get-MboxMrmCleanup [-Identity <String[]>] [-AllTenantObjects] [-Detailed]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `Identity` (`Name`, `TagName`, `PolicyName`) | String[] | Policy name or linked tag name to inspect. When omitted, temporary cleanup policies are listed. | No | - |
| `AllTenantObjects` | Switch | Include every retention tag and policy in the tenant. | No | `False` |
| `Detailed` | Switch | Include linked tag names and assigned mailbox lists. | No | `False` |

**Examples**
```powershell
Get-MboxMrmCleanup
```

```powershell
Get-MboxMrmCleanup -Detailed
```

```powershell
Get-MboxMrmCleanup -AllTenantObjects
```

```powershell
Get-MboxMrmCleanup -Identity 'OneShot_PreCutoff_20250101'
```

:::note What the inventory shows
Each row represents a retention policy and includes the linked tag details inline, plus the number of mailboxes currently using that policy.
:::

## Remove-MboxMrmCleanup
Restore affected mailboxes to a standard retention policy or to the default mailbox behavior, then remove temporary cleanup tags and policies.

Use `-Identity` to target a specific temporary tag or policy.
If you omit `-Identity`, Nebula.Core targets all temporary objects whose names start with `OneShot_PreCutoff_`.
Use `-RestorePolicyName` to move mailboxes to a known standard policy before deletion, or `-ClearRetentionPolicy` to remove the mailbox-level assignment altogether. The restore policy name must match the exact retention policy name in the tenant.

**Syntax**

```powershell
Remove-MboxMrmCleanup [-Identity <String[]>] [-Mailbox <String[]>] [-RestorePolicyName <String>] [-ClearRetentionPolicy] [-RemoveTag <Boolean>] [-RemovePolicy <Boolean>]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `Identity` (`Name`, `TagName`, `PolicyName`) | String[] | Temporary cleanup tag or policy to remove. | No | - |
| `Mailbox` (`UserPrincipalName`, `IdentityMailbox`, `SourceMailbox`) | String[] | Optional mailbox list to restore before deleting the cleanup policy. | No | - |
| `RestorePolicyName` | String | Standard retention policy to assign back to the mailbox or mailboxes. | No | - |
| `ClearRetentionPolicy` | Switch | Clear the mailbox retention policy instead of assigning another one. | No | `False` |
| `RemoveTag` | Boolean | Remove the retention policy tag after cleanup. | No | `True` |
| `RemovePolicy` | Boolean | Remove the retention policy after affected mailboxes are restored. | No | `True` |

**Examples**
```powershell
Remove-MboxMrmCleanup -Identity 'OneShot_PreCutoff_20250101'
```

```powershell
Remove-MboxMrmCleanup -PolicyName 'OneShot_PreCutoff_20250101' -RestorePolicyName 'Default MRM Policy'
```

```powershell
'user@contoso.com' | Remove-MboxMrmCleanup -Identity 'OneShot_PreCutoff_20250101' -ClearRetentionPolicy
```

:::warning Removal safety
Before removing a tag or policy, Nebula.Core tries to restore the impacted mailbox assignments first. If a policy is still linked elsewhere, the cmdlet warns you instead of deleting it blindly.
:::

## Search-MboxCutoffWindow
Create/reuse a Purview Compliance Search to isolate mailbox items by date criteria (estimate + optional preview sample).

**Syntax**

```powershell
Search-MboxCutoffWindow -Mailbox <String> [-Mode <String>] [-CutoffDate <DateTime>] [-ExistingSearchName <String>] [-UseExistingOnly] [-Preview] [-PreviewCount <Int32>] [-PollingSeconds <Int32>] [-MaxWaitMinutes <Int32>]
Search-MboxCutoffWindow -Mailbox <String> -Mode Range -StartDate <DateTime> -EndDate <DateTime> [-ExistingSearchName <String>] [-UseExistingOnly] [-Preview] [-PreviewCount <Int32>] [-PollingSeconds <Int32>] [-MaxWaitMinutes <Int32>]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `Mailbox` (`Identity`, `UserPrincipalName`, `SourceMailbox`) | String | Target mailbox. Pipeline accepted. | Yes | - |
| `Mode` | String | `BeforeCutoff` (default) or `Range`. | No | BeforeCutoff |
| `CutoffDate` | DateTime | Cutoff date used when `Mode BeforeCutoff`. | No | `2025-01-01` |
| `StartDate` | DateTime | Range start date (used with `Mode Range`). | Yes (`Range`) | - |
| `EndDate` | DateTime | Range end date, exclusive (used with `Mode Range`). | Yes (`Range`) | - |
| `ExistingSearchName` | String | Reuse an existing Purview Compliance Search name. | No | - |
| `UseExistingOnly` | Switch | Do not create/modify search definition; run estimate/preview on existing search only. | No | `False` |
| `Preview` | Switch | Create a Purview Preview action and return sampled lines. | No | `False` |
| `PreviewCount` | Int32 | Max preview sample lines to return. | No | `50` |
| `PollingSeconds` | Int32 | Poll interval while waiting for completion. | No | `10` |
| `MaxWaitMinutes` | Int32 | Maximum wait time before timeout. | No | `60` |

**Examples**
```powershell
Search-MboxCutoffWindow -Mailbox 'user@contoso.com' -Mode BeforeCutoff -CutoffDate '2025-01-01'
```

```powershell
Search-MboxCutoffWindow -Mailbox 'user@contoso.com' -Mode Range -StartDate '2025-01-01' -EndDate '2025-02-01' -Preview -PreviewCount 25
```

```powershell
Search-MboxCutoffWindow -Mailbox 'user@contoso.com' -ExistingSearchName 'Isolate_Pre_20250101_140530' -UseExistingOnly
```

## Set-MboxMrmCleanup
Apply a one-shot MRM cleanup policy/tag to a mailbox (optional Managed Folder Assistant trigger).
The cmdlet also returns the mailbox's previous retention policy, a ready-to-use rollback command, and removal hints for the temporary tag and policy.

**Syntax**

```powershell
Set-MboxMrmCleanup -Mailbox <String> [-FixedCutoffDate <DateTime>] [-SafetyBufferDays <Int32>] [-RetentionAction <String>] [-TagName <String>] [-PolicyName <String>] [-RunAssistant]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `Mailbox` (`Identity`, `UserPrincipalName`, `SourceMailbox`) | String | Target mailbox. Pipeline accepted. | Yes | - |
| `FixedCutoffDate` | DateTime | Fixed date used to compute `AgeLimitForRetention` days. | No | `2025-01-01` |
| `SafetyBufferDays` | Int32 | Additional days added as safety buffer. | No | `7` |
| `RetentionAction` | String | `DeleteAndAllowRecovery` (default) or `PermanentlyDelete`. | No | DeleteAndAllowRecovery |
| `TagName` | String | Retention policy tag name (auto-generated if omitted). | No | - |
| `PolicyName` | String | Retention policy name (auto-generated if omitted). | No | - |
| `RunAssistant` | Switch | Trigger Managed Folder Assistant (`Start-ManagedFolderAssistant -FullCrawl`) after assignment. | No | `False` |

**Examples**
```powershell
Set-MboxMrmCleanup -Mailbox 'user@contoso.com' -FixedCutoffDate '2025-01-01' -SafetyBufferDays 7
```

```powershell
Set-MboxMrmCleanup -Mailbox 'user@contoso.com' -RetentionAction PermanentlyDelete -RunAssistant -WhatIf
```
