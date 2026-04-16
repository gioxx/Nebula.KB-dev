---
sidebar_position: 50
title: "More examples"
description: Practical recipes that show common ways to use Nebula.Core.
hide_title: true
id: more-examples
tags:
  - Nebula.Core
  - Examples
  - Core
---

# More examples

Practical recipes for common Nebula.Core workflows.

## Connect EXO and Graph in one call

```powershell
Connect-Nebula -GraphScopes 'User.Read.All','Directory.Read.All' -AutoInstall
```

## Reload configuration after updating PSD1 files

```powershell
Sync-NebulaConfig
```

## Export all licenses to CSV with a fresh catalog

```powershell
Export-MsolAccountSku -CsvFolder 'C:\Reports\Licenses' -ForceLicenseCatalogRefresh
```

## Review quarantine and release via grid

```powershell
Get-QuarantineToRelease -Interval 7 -GridView -ReleaseSelected -ReportFalsePositive
```

## Create a ready-to-use shared mailbox

```powershell
New-SharedMailbox -SharedMailboxSMTPAddress "sharedmailbox@contoso.com" `
  -SharedMailboxDisplayName "Support Team" `
  -SharedMailboxAlias "SupportTeam"
```

## Set language on an existing mailbox

```powershell
Set-MboxLanguage -SourceMailbox 'user@contoso.com' -Language en-US
```

## Set usage location for users

```powershell
'user1@contoso.com','user2@contoso.com' | Set-UserUsageLocation -UsageLocation IT
```

## Get usage location for users

```powershell
'user1@contoso.com','user2@contoso.com' | Get-UserUsageLocation
```

## Export mailbox statistics (CSV, batched)

```powershell
Export-MboxStatistics -CsvFolder 'C:\Reports\Mailboxes' -Round -BatchSize 50 -Resume
```

## Export Intune app inventory

```powershell
Export-IntuneAppInventory -ApplicationName 'Microsoft*' -IncludeDeployedApps -FilterByType Win32 -OutputCsvPath 'C:\Reports\apps.csv'
```

## Create Intune app-based groups

```powershell
New-IntuneAppBasedGroup -ApplicationName 'Chrome' -MinimumVersion '120.0' -UpdateExisting
```

```powershell
New-IntuneAppBasedGroup -ApplicationName 'Chrome' -GroupName 'Devices - Chrome'
```

## Search Intune profile location

```powershell
Search-IntuneProfileLocation -SearchText 'Wi-Fi' -GridView
```

## Export deleted item size report

```powershell
Export-MboxDeletedItemSize -CsvFolder 'C:\Reports\Mailboxes'
```

## Export DG and M365 groups with members

```powershell
Export-DistributionGroups -CsvFolder 'C:\Reports\DGs'
Export-M365Group -CsvFolder 'C:\Reports\M365'
```

## Export empty Entra groups

```powershell
Export-EmptyEntraGroups -CsvFolder 'C:\Reports\Groups'
```

## Normalize MessageIds from clipboard and release immediately

```powershell
Format-MessageIDsFromClipboard   # formats, releases, and shows output
```
