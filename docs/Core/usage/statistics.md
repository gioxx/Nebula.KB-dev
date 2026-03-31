---
sidebar_position: 10
title: "Statistics"
description: Export mailbox statistics for reporting or capacity checks.
hide_title: true
id: statistics
tags:
  - Export-MboxStatistics
  - Export-MboxDeletedItemSize
  - Get-MboxStatistics
  - Nebula.Core
  - Statistics
---

# Statistic helpers

For full details and examples, run `Get-Help Export-MboxStatistics -Detailed` or `Get-Help Get-MboxStatistics -Detailed`.

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

## Export-MboxDeletedItemSize
Export deleted item store usage for user mailboxes. The report is exported to CSV by default.

**Syntax**

```powershell
Export-MboxDeletedItemSize [[-UserPrincipalName] <String[]>] [-CsvFolder <String>] [-Csv]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserPrincipalName` (`User`, `Identity`, `Mailbox`, `SourceMailbox`) | String[] | Optional mailbox identity or identities. When omitted, all user mailboxes are scanned. Pipeline accepted. | No | - |
| `CsvFolder` | String | Destination folder for the CSV file. | No | Current directory |
| `Csv` | Boolean | Export the report to CSV. Use `-Csv:$false` to return objects instead. | No | `True` |

**Examples**
```powershell
# Export all user mailboxes to CSV
Export-MboxDeletedItemSize
```

```powershell
# Export a subset of mailboxes to a custom folder
'user1@contoso.com','user2@contoso.com' | Export-MboxDeletedItemSize -CsvFolder 'C:\Temp\Reports'
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
