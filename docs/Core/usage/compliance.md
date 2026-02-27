---
sidebar_position: 4
title: "Compliance"
description: Purview compliance helpers for mailbox content isolation and related workflows.
hide_title: true
id: compliance
tags:
  - Search-MboxCutoffWindow
  - Set-MboxMrmCleanup
  - Nebula.Core
  - Purview
  - Compliance
---

# Compliance helpers

Requires an EXO session with Purview Compliance PowerShell availability (`Connect-IPPSSession`). For full and always-up-to-date details, use `Get-Help <FunctionName> -Detailed`.

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
