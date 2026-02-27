---
sidebar_position: 10
title: "Statistics"
description: Export mailbox statistics for reporting or capacity checks.
hide_title: true
id: statistics
tags:
  - Export-MboxStatistics
  - Get-MboxStatistics
  - Nebula.Core
  - Statistics
---

# Statistic helpers

For full parameter descriptions and up-to-date notes, run `Get-Help Export-MboxStatistics -Detailed` or `Get-Help Get-MboxStatistics -Detailed`.

## Export-MboxStatistics
Export mailbox statistics (size, quotas, archive info) either to CSV (all mailboxes) or as objects (single mailbox).

**Syntax**

```powershell
Export-MboxStatistics [-UserPrincipalName <String>] [-CsvFolder <String>] [-Round] [-BatchSize <Int>]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserPrincipalName` | String | Optional single mailbox identity; when omitted, all mailboxes are exported to CSV. | No | - |
| `CsvFolder` | String | Output folder (for all-mailbox export). | No | Current directory |
| `Round` | Switch | Round quota values up to the nearest integer GB. | No | `False` |
| `BatchSize` | Int | Flush to CSV every N mailboxes. | No | `25` |

**Examples**
```powershell
# Export every mailbox to CSV (batched writes)
Export-MboxStatistics -CsvFolder 'C:\Temp\Reports' -Round

# Inspect a single mailbox as objects
Export-MboxStatistics -UserPrincipalName 'user@contoso.com'
```

## Get-MboxStatistics
Return a simplified mailbox statistics view as objects.

**Syntax**

```powershell
Get-MboxStatistics [-UserPrincipalName <String>] [-IncludeArchive] [-IncludeMessageActivity] [-Round]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserPrincipalName` | String | Optional mailbox identity (also from pipeline, including multiple values); when omitted, all mailboxes are returned. | No | - |
| `IncludeArchive` | Switch | Include archive size and usage info when archive is enabled. | No | `False` |
| `IncludeMessageActivity` | Switch | Include message activity fields (`LastReceived`, `LastSent`, `OldestItemReceivedDate`, `OldestItemFolderPath`). | No | `False` |
| `Round` | Switch | Round quota values up to the nearest integer GB. | No | `True` |

**Output (main fields)**
- `DisplayName`
- `UserPrincipalName`
- `PrimarySmtpAddress`
- `MailboxTypeDetail`
- `ArchiveEnabled`
- `MailboxSizeGB`
- `ItemCount`
- `MailboxCreated`
- `LastLogonTime`
- `WarningQuotaGB`
- `ProhibitSendQuotaGB`
- `PercentUsed`
- `LastReceived` (only with `-IncludeMessageActivity`)
- `LastSent` (only with `-IncludeMessageActivity`)
- `OldestItemReceivedDate` (only with `-IncludeMessageActivity`)
- `OldestItemFolderPath` (only with `-IncludeMessageActivity`)
- `ArchiveSizeGB` (only with `-IncludeArchive`)
- `ArchivePercentUsed` (only with `-IncludeArchive`)

**Examples**
```powershell
# Quick glance at a single mailbox
Get-MboxStatistics -UserPrincipalName 'user@contoso.com'

# Include archive data
Get-MboxStatistics -UserPrincipalName 'user@contoso.com' -IncludeArchive

# Include message activity (latest trace + oldest item details)
Get-MboxStatistics -UserPrincipalName 'user@contoso.com' -IncludeMessageActivity

# Multiple mailboxes from pipeline
'user1@contoso.com','user2@contoso.com','user3@contoso.com' | Get-MboxStatistics -IncludeArchive

# All mailboxes (may take a while due to message trace queries)
Get-MboxStatistics -IncludeMessageActivity
```
