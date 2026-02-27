---
sidebar_position: 1
title: "Active Directory"
description: Active Directory helpers for everyday administration tasks.
hide_title: true
id: active-directory
tags:
  - Active Directory
  - Find-ADAccountExpirations
  - Nebula.Tools
  - Tools
---

# Active Directory

Active Directory helpers for everyday tasks. This page starts with account expiration management.

## Find-ADAccountExpirations

For full details and examples, run `Get-Help Find-ADAccountExpirations -Detailed`.

`Find-ADAccountExpirations` scans Active Directory for users with a valid expiration date. By default it returns only enabled accounts; use `-IncludeDisabled` to include disabled accounts. You can filter by target date and/or email domain, export results to CSV, and optionally extend account expirations. Output is objects by default; use `-AsTable` for formatted display.

:::caution Date handling (midnight, exact vs. before)
`TargetDate` is interpreted as a date boundary: the comparison is done on the **date only** (midnight).  
- **Default behavior**: accounts expiring **on or before** the `TargetDate` date are included.  
- **With `-ExactDate`**: only accounts expiring **on that exact date** are included.  

This means times during the day are ignored: `2027-01-01 08:30` and `2027-01-01 23:59` are treated as **the same date**.
:::

**Syntax**

```powershell
Find-ADAccountExpirations [-TargetDate <String>] [-FilterDomain <String>] [-ExactDate] [-ExportCsv] [-ExportPath <String>] [-AsTable] [-IncludeDisabled] [-ExtendExpiration] [-ExtendTo <String>] [-TargetServer <String>]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `ExportCsv` | Export results to CSV. | No | `False` |
| `ExportPath` | Output folder for CSV export. | No | Current location |
| `AsTable` | Format output as a table for display (not pipeline-friendly). | No | `False` |
| `IncludeDisabled` | Include disabled accounts in the results. | No | `False` |
| `ExtendExpiration` | Extend expiration for matched accounts. | No | `False` |
| `ExtendTo` | New expiration date when using `-ExtendExpiration`. | No | - |
| `ExactDate` | Match only accounts expiring exactly on `TargetDate` (date-only). | No | `False` |
| `FilterDomain` | Filter by email domain (e.g., `@contoso.com` or `contoso.com`). | No | - |
| `TargetDate` | Reference expiration date (accepts any DateTime-compatible format). If set, matches expirations on or before the date unless `-ExactDate` is used. | No | - |
| `TargetServer` | Domain controller to query/update. | No | Default DC |

**Examples**
```powershell
# Find users expiring on or before a target date
Find-ADAccountExpirations -TargetDate "2027-01-01"

# Find users expiring exactly on a target date
Find-ADAccountExpirations -TargetDate "2027-01-01" -ExactDate

# Filter by email domain and export to CSV in the current folder
Find-ADAccountExpirations -FilterDomain "@contoso.com" -ExportCsv

# Include disabled accounts and render as a table
Find-ADAccountExpirations -FilterDomain "contoso.com" -IncludeDisabled -AsTable

# Extend expirations (preview only)
Find-ADAccountExpirations -TargetDate "2027-01-01" -ExtendExpiration -ExtendTo "2027-12-31" -WhatIf
```

:::note
- Requires the `ActiveDirectory` module (RSAT) and appropriate permissions.
- Use `-WhatIf` to preview changes before extending expirations.
- Accounts with no expiration (or invalid/zero file time values) are excluded.
:::

## Questions and answers

### Is `TargetDate` mandatory?

Only if `-FilterDomain` is not supplied.

### Is `TargetServer` required?

No. If omitted, the default domain controller is used.
