---
sidebar_position: 9
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

# Statistics

For full parameter descriptions and up-to-date notes, run `Get-Help Export-MboxStatistics -Detailed` or `Get-Help Get-MboxStatistics -Detailed`.

## Export-MboxStatistics
Export mailbox statistics (size, quotas, archive info) either to CSV (all mailboxes) or as objects (single mailbox).

**Syntax**

```powershell
Export-MboxStatistics [-UserPrincipalName <String>] [-CsvFolder <String>] [-Round] [-BatchSize <Int>]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `UserPrincipalName` | Optional single mailbox identity; when omitted, all mailboxes are exported to CSV. | No | - |
| `CsvFolder` | Output folder (for all-mailbox export). | No | Current directory |
| `Round` | Round quota values up to the nearest integer GB. | No | `False` |
| `BatchSize` | Flush to CSV every N mailboxes. | No | `25` |

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
Get-MboxStatistics [-UserPrincipalName <String>] [-IncludeArchive] [-Round]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `UserPrincipalName` | Optional single mailbox identity; when omitted, all mailboxes are returned. | No | - |
| `IncludeArchive` | Include archive size and usage info when archive is enabled. | No | `False` |
| `Round` | Round quota values up to the nearest integer GB. | No | `True` |

**Output (main fields)**
- `DisplayName`
- `UserPrincipalName`
- `PrimarySmtpAddress`
- `MailboxTypeDetail`
- `MailboxSizeGB`
- `ItemCount`
- `MailboxCreated`
- `LastLogonTime`
- `LastReceived`
- `LastSent`
- `WarningQuotaGB`
- `ProhibitSendQuotaGB`
- `PercentUsed`
- `ArchiveSizeGB` (only with `-IncludeArchive`)
- `ArchivePercentUsed` (only with `-IncludeArchive`)

**Examples**
```powershell
# Quick glance at a single mailbox
Get-MboxStatistics -UserPrincipalName 'user@contoso.com'

# Include archive data
Get-MboxStatistics -UserPrincipalName 'user@contoso.com' -IncludeArchive

# All mailboxes (may take a while due to message trace queries)
Get-MboxStatistics
```
