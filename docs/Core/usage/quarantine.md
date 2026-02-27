---
sidebar_position: 8
title: "Quarantine"
description: Search, export, release, or delete Exchange Online quarantine items.
hide_title: true
id: quarantine
tags:
  - Export-QuarantineEml
  - Get-QuarantineFrom
  - Get-QuarantineFromDomain
  - Get-QuarantineToRelease
  - Unlock-QuarantineFrom
  - Unlock-QuarantineMessageId
  - Nebula.Core
  - Quarantine
---

# Quarantine helpers

All commands require an active EXO session (`Test-EOLConnection` is called internally). For complete and current details, run `Get-Help <FunctionName> -Detailed`.

## Export-QuarantineEml
Fetch quarantined message(s) by MessageId **or** Identity, save as EML, optionally open, and optionally release to all recipients.

**Syntax**

```powershell
Export-QuarantineEml [-MessageId <String[]>] [-Identity <String[]>] [-DestinationFolder <String>] [-OpenFile] [-ReleaseToAll] [-ReportFalsePositive]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `MessageId` | - | MessageId with/without angle brackets. | One of MessageId/Identity | - |
| `Identity` | - | Quarantine Identity (e.g., GUID\GUID). | One of MessageId/Identity | - |
| `DestinationFolder` | - | Folder for the EML file. | No | Current directory |
| `OpenFile` | - | Open the file after saving. | No | `False` |
| `ReleaseToAll` | - | Release to all recipients after export. | No | `False` |
| `ReportFalsePositive` | - | Also report as false positive on release. | No | `False` |

**Example**
```powershell
Export-QuarantineEml -MessageId '20230617142935.F5B74194B266E458@contoso.com' `
  -DestinationFolder C:\Temp\Quarantine `
  -OpenFile -ReleaseToAll -ReportFalsePositive
```

```powershell
# Export using an Identity (e.g., copied from Get-QuarantineMessage)
Export-QuarantineEml -Identity 'f3a3dda8-3f78-46c9-332b-08de38f41262\a94e1c02-1d07-7d44-fd2b-482688059fbb' `
  -DestinationFolder C:\Temp\Quarantine
```

## Get-QuarantineFrom
List quarantined messages by sender.

**Syntax**

```powershell
Get-QuarantineFrom -SenderAddress <String[]> [-IncludeReleased]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SenderAddress` | - | Sender address(es). Pipeline accepted. | Yes | - |
| `IncludeReleased` | - | Include messages already released. | No | - |

**Example**
```powershell
Get-QuarantineFrom -SenderAddress 'bad@contoso.com' -IncludeReleased
```

## Get-QuarantineFromDomain
List quarantined messages by sender domain.

**Syntax**

```powershell
Get-QuarantineFromDomain -SenderDomain <String[]> [-IncludeReleased]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SenderDomain` | - | Domain(s) (e.g., contoso.com). Pipeline accepted. | Yes | - |
| `IncludeReleased` | - | Include messages already released. | No | - |

**Example**
```powershell
Get-QuarantineFromDomain -SenderDomain 'contoso.com'
```

## Get-QuarantineToRelease
Pull quarantine items for a date range, optionally pick items via Out-GridView, export CSV/HTML, and release or delete in bulk.

**Syntax**

```powershell
Get-QuarantineToRelease -Interval <Int> [-ChooseDayFromCalendar] [-GridView] [-Csv] [-Html]
                       [-OutputFolder <String>] [-ReleaseSelected] [-DeleteSelected] [-ReportFalsePositive]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `Interval` | - | Days back to search (1-30). | Yes (unless calendar) | - |
| `ChooseDayFromCalendar` | - | Pick a single day via calendar UI. | No | `False` |
| `GridView` | - | Select items via Out-GridView. | No | `False` |
| `Csv` / `Html` | - | Export reports. | No | `False` |
| `OutputFolder` | - | Target folder for CSV/HTML. | No | Current directory |
| `ReleaseSelected` / `DeleteSelected` | - | Release or delete selected items. | No | `False` |
| `ReportFalsePositive` | - | Also report as false positive when releasing. | No | `False` |

**Example**
```powershell
Get-QuarantineToRelease -Interval 7 -GridView -ReleaseSelected -ReportFalsePositive
```

## Unlock-QuarantineFrom
Bulk-release messages for specific senders (to all recipients, with optional false-positive report). Confirmation is controlled by `SupportsShouldProcess`; use `-Confirm:$false` when you want to suppress prompts.

**Syntax**

```powershell
Unlock-QuarantineFrom -SenderAddress <String[]> [-ReportFalsePositive] [-Confirm]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SenderAddress` | - | Sender address(es). Pipeline accepted. | Yes | - |
| `ReportFalsePositive` | - | Also report as false positive. | No | - |

**Example**
```powershell
Unlock-QuarantineFrom -SenderAddress 'user@contoso.com' -ReportFalsePositive -Confirm:$false
```

## Unlock-QuarantineMessageId
Bulk-release messages for specific message IDs or identities (to all recipients, with optional false-positive report). Confirmation is controlled by `SupportsShouldProcess`; use `-Confirm:$false` when you want to suppress prompts.

**Syntax**

```powershell
Unlock-QuarantineMessageId [-MessageId <String[]>] [-Identity <String[]>] [-ReportFalsePositive] [-Confirm]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `MessageId` | - | MessageId values (with/without angle brackets). Pipeline accepted. | One of MessageId/Identity | - |
| `Identity` | - | Quarantine Identity values (e.g., GUID\GUID). Pipeline accepted. | One of MessageId/Identity | - |
| `ReportFalsePositive` | - | Also report as false positive. | No | - |

**Example**
```powershell
Unlock-QuarantineMessageId -MessageId '20230617142935.F5B74194B266E458@contoso.com' -ReportFalsePositive -Confirm:$false
```

:::tip
`Unlock-QuarantineMessageId` is also available as `qrel` (alias).
:::

## Questions and answers

### Is EXO required for quarantine functions?

Yes. Quarantine cmdlets call `Test-EOLConnection` and expect an active EXO session (`Connect-EOL`/`Connect-Nebula`).

### How do I handle confirmations for destructive actions?

Cmdlets like `Unlock-QuarantineFrom` or `Remove-MboxPermission` support `-Confirm:$false` / `-WhatIf` via `SupportsShouldProcess`. Use them to automate or dry run.
