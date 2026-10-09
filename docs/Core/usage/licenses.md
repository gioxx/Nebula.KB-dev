---
sidebar_position: 8
title: "Licenses"
description: Export tenant license assignments and inspect user licenses with friendly SKU names.
hide_title: true
id: licenses
tags:
  - Add-UserMsolAccountSku
  - Copy-UserMsolAccountSku
  - Export-MsolAccountSku
  - Get-TenantMsolAccountSku
  - Get-UserMsolAccountSku
  - Get-UserUsageLocation
  - Move-UserMsolAccountSku
  - Remove-UserMsolAccountSku
  - Set-UserUsageLocation
  - Update-LicenseCatalog
  - Nebula.Core
  - Licenses
---

# License helpers

Requires Microsoft Graph and a cached SKU catalog. For full details and examples, run `Get-Help <FunctionName> -Detailed`.

:::note[Primary and custom catalogs]
SKU part numbers are resolved against the primary catalog (`M365_licenses.json`, sourced from Microsoft's official CSV) first, then against a custom catalog (`M365_licenses_custom.json`) for SKUs Microsoft hasn't published there yet. Both are cached locally and shown by `Get-NebulaConfig`. Lookup also strips invisible Unicode characters (e.g. zero-width spaces occasionally present in `SkuPartNumber` values returned by Graph for some tenants/SKUs) before matching, so those SKUs resolve correctly instead of showing up as unmapped.
:::

Use `Export-MsolAccountSku` when you need:
- a full tenant license assignment export
- a domain-scoped report for a specific mail domain
- a license-scoped report for users who hold a specific SKU, while still keeping all of their assigned licenses in the CSV

| Scenario | Use this filter | Result |
| --- | --- | --- |
| Full export | none | All licensed users and all of their assigned licenses |
| Domain report | `-Domain` | Only users in the selected domain, with all of their assigned licenses |
| License report | `-License` | Only users who have the selected license, with all of their assigned licenses |

:::note[User identifier resolution]
User-centric license cmdlets (`Add/Get/Remove/Copy/Move-UserMsolAccountSku`) support full UPNs/object IDs and short identifiers (for example alias/SamAccountName/UPN prefix) via the shared resolver.
Now the resolver prefers a Microsoft Graph-friendly identity when available (`-PreferGraphIdentity`), improving reliability for object-ID-based lookups.
:::

## Add-UserMsolAccountSku
Assign licenses by friendly name (resolved via catalog), SKU part number, or SKU ID to a user.

**Syntax**

```powershell
Add-UserMsolAccountSku -UserPrincipalName <String> -License <String[]> [-ForceLicenseCatalogRefresh] [-ShowErrorDetails]
Add-UserMsolAccountSku <UserPrincipalName> -License <String[]> [-ForceLicenseCatalogRefresh] [-ShowErrorDetails]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserPrincipalName` (`User`, `UPN`) | String | Target user UPN, object ID, or short identifier. | Yes | - |
| `License` | String[] | Friendly name, SKU part number, or SKU ID. Accepts multiple values. | Yes | - |
| `ForceLicenseCatalogRefresh` | Switch | Redownload license catalog cache. | No | `False` |
| `ShowErrorDetails` | Switch | Kept for compatibility. Since 1.3.0 error messages always include the Microsoft Graph error detail, so this switch has no effect. | No | `False` |

Licenses the user already has are skipped with a warning: they don't use a seat, and the service plans disabled for that user stay disabled.

**Examples**
```powershell
Add-UserMsolAccountSku -UserPrincipalName 'user@contoso.com' -License 'Microsoft 365 E3'
```

```powershell
Add-UserMsolAccountSku -UserPrincipalName 'user@contoso.com' -License 'ENTERPRISEPACK','VISIOCLIENT'
```

```powershell
Add-UserMsolAccountSku -UserPrincipalName 'user@contoso.com' -License '18181a46-0d4e-45cd-891e-60aabd171b4e'
```

```powershell
Add-UserMsolAccountSku 'user@contoso.com' -License 'Microsoft 365 Business Standard EEA (no Teams)'
```

```powershell
'user1@contoso.com','user2@contoso.com' | Add-UserMsolAccountSku -License 'Microsoft 365 Business Standard EEA (no Teams)'
```

:::note[Mandatory usage location parameter]
If the target user has no `UsageLocation`, Nebula.Core sets it automatically using the `UsageLocation` key from your configuration (default `US`, override via `%USERPROFILE%\.NebulaCore\settings.psd1`). If updating the usage location fails, license assignment stops.
:::

:::warning[Licenses availability]
If the tenant does not have units available for the requested license, the assignment is avoided and a warning message is displayed.
:::

## Copy-UserMsolAccountSku
Copy all licenses (with disabled plans preserved) from one user to another without removing them from the source.

**Syntax**

```powershell
Copy-UserMsolAccountSku -SourceUserPrincipalName <String> -DestinationUserPrincipalName <String>
Copy-UserMsolAccountSku <SourceUserPrincipalName> <DestinationUserPrincipalName>
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceUserPrincipalName` (`Source`, `From`) | String | Source user UPN, object ID, or short identifier. | Yes | - |
| `DestinationUserPrincipalName` (`Destination`, `To`) | String | Destination user UPN, object ID, or short identifier. | Yes | - |

**Example**
```powershell
Copy-UserMsolAccountSku -SourceUserPrincipalName 'user1@contoso.com' -DestinationUserPrincipalName 'user2@contoso.com'
```

```powershell
Copy-UserMsolAccountSku 'user1@contoso.com' 'user2@contoso.com'
```

:::warning[Licenses availability]
Before assigning, Nebula.Core checks tenant seat availability for each source license. Licenses with no available units are skipped with a warning instead of failing the whole copy; every license that does have availability is still assigned.
:::

## Export-MsolAccountSku
Export all users with assigned licenses to CSV, mapping SKU part numbers to friendly names.
Use `-Domain` to limit the export to users whose `Mail`, `UserPrincipalName`, or `ProxyAddresses` match the domain.
Use `-License` to limit the export to users who have at least one matching license, while still exporting all of the licenses assigned to those users.

**Syntax**

```powershell
Export-MsolAccountSku [-CsvFolder <String>] [-Domain <String>] [-License <String[]>] [-ForceLicenseCatalogRefresh]
                      [-BatchSize <Int32>] [-Resume] [-CsvPath <String>] [-MaxConsecutiveErrors <Int32>]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `CsvFolder` | String | Output folder. | No | Current directory |
| `Domain` | String | Limit the export to users in the specified domain. | No | - |
| `License` | String[] | Limit the export to users who have at least one matching license. Accepts friendly name, SKU part number, or SKU ID. | No | - |
| `ForceLicenseCatalogRefresh` | Switch | Redownload the license catalog cache. | No | `False` |
| `BatchSize` | Int32 | Number of processed users before flushing partial CSV output. | No | `50` |
| `Resume` | Switch | Resume from the latest matching CSV in the target folder or from `-CsvPath`. | No | `False` |
| `CsvPath` | String | Explicit CSV file to resume. When omitted, the most recent matching CSV in the target folder is used. | No | - |
| `MaxConsecutiveErrors` | Int32 | Stop after this many consecutive user-level failures. | No | `5` |

**Example**
```powershell
Export-MsolAccountSku -CsvFolder 'C:\Temp\Reports'
```

```powershell
Export-MsolAccountSku -Domain 'contoso.com'
```

```powershell
Export-MsolAccountSku -License 'Exchange Online (Plan 1)'
```

:::note[License filtered export]
When you pass `-License`, the CSV still includes every license assigned to each matching user. If a user has `Exchange Online (Plan 1)` plus `Microsoft 365 E3`, both rows are exported.
:::

## Get-TenantMsolAccountSku
List tenant SKUs with resolved names, totals, consumed, available (enabled minus consumed), and seat states (filter by name or SKU part number).

**Syntax**

```powershell
Get-TenantMsolAccountSku [-ForceLicenseCatalogRefresh] [-Filter <String>] [-Domain <String>] [-SampleUsers <Int32>] [-IncludeSampleUsers] [-AsTable] [-GridView]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `ForceLicenseCatalogRefresh` | Switch | Redownload license catalog cache. | No | `False` |
| `Filter` | String | Show only licenses whose name or `SkuPartNumber` contains the provided text. | No | - |
| `Domain` | String | Limit sample users to accounts whose `Mail`, `UserPrincipalName`, or `ProxyAddresses` belong to the domain. | No | - |
| `SampleUsers` | Int32 | Return up to N sample users per license (requires `-Filter`). | No | `5` |
| `IncludeSampleUsers` | Switch | Return sample users using the default limit of 5 (requires `-Filter`). | No | `False` |
| `AsTable` | Switch | Format output as a table. | No | `False` |
| `GridView` | Switch | Show output in a GridView window. | No | `False` |

**Example**
```powershell
Get-TenantMsolAccountSku -AsTable
```

```powershell
Get-TenantMsolAccountSku -Filter "E3" -AsTable
```

```powershell
Get-TenantMsolAccountSku -Filter "E3" -SampleUsers
```

```powershell
Get-TenantMsolAccountSku -Filter "E3" -IncludeSampleUsers
```

:::note[Available licenses: how counting works]
`Available` is calculated as `Enabled - Consumed` (never below zero). The `Total` column shows a friendly breakdown (Enabled/Suspended), while `TotalCount` remains the numeric total for scripting.
:::

:::note[Sample users display]
When you request sample users together with `-AsTable`, Nebula.Core prints the license summary as a table and then lists sample users in a separate readable block for each SKU.
With `-GridView`, Nebula.Core opens a summary grid and, when sample users are requested, a second grid dedicated to sample users.
:::

:::tip[Microsoft 365 Subscriptions (Admin Portal)]
Need renewal/expiration or billing profile details? Open the Microsoft 365 Admin Center subscriptions page: https://admin.cloud.microsoft/?#/subscriptions
:::

:::note[Offline fallback to stale cache]
If the license catalog file can't be downloaded from GitHub (network issue, GitHub outage, ...) after all retry attempts, Nebula.Core falls back to the last cached copy instead of failing, and prints a warning noting the cache is stale. The command still works, just with a possibly outdated SKU catalog. If no cache exists yet, the error is still raised.
:::

## Get-UserMsolAccountSku
Show licenses assigned to a single user with friendly names.

:::note[No assigned licenses]
If the target user exists but has no assigned licenses, Nebula.Core prints an explicit warning instead of returning only the processing header.
:::

**Syntax**

```powershell
Get-UserMsolAccountSku -UserPrincipalName <String> [-Clipboard] [-CheckAvailability] [-ForceLicenseCatalogRefresh] [-ShowErrorDetails]
Get-UserMsolAccountSku <UserPrincipalName> [-Clipboard] [-CheckAvailability] [-ForceLicenseCatalogRefresh] [-ShowErrorDetails]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserPrincipalName` (`User`, `UPN`) | String | Target UPN, object ID, or short identifier. | Yes | - |
| `Clipboard` | Switch | Copy the resolved license names (fallback: `SkuPartNumber`) to the clipboard as `"License1","License2"`. | No | `False` |
| `CheckAvailability` | Switch | Show tenant available seat counts for the assigned SKUs. | No | `False` |
| `ForceLicenseCatalogRefresh` | Switch | Redownload license catalog cache. | No | `False` |
| `ShowErrorDetails` | Switch | Kept for compatibility. Since 1.3.0 error messages always include the Microsoft Graph error detail, so this switch has no effect. | No | `False` |

**Example**
```powershell
Get-UserMsolAccountSku -UserPrincipalName 'user@contoso.com'
```

```powershell
'user1@contoso.com','user2@contoso.com' | Get-UserMsolAccountSku
```

```powershell
Get-UserMsolAccountSku -UserPrincipalName 'user@contoso.com' -Clipboard
```

```powershell
Get-UserMsolAccountSku -UserPrincipalName 'user@contoso.com' -CheckAvailability
```

## Get-UserUsageLocation
Read the current usage location for one or more users, next to the configured Nebula.Core default (`UsageLocation`), so you can compare them at a glance.

**Syntax**

```powershell
Get-UserUsageLocation -UserPrincipalName <String[]>
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserPrincipalName` (`User`, `UPN`, `Identity`) | String[] | User principal name, object ID, or short identifier. Pipeline accepted. | Yes | - |

**Examples**
```powershell
Get-UserUsageLocation -UserPrincipalName user@contoso.com
```

```powershell
'user1@contoso.com','user2@contoso.com' | Get-UserUsageLocation
```

```powershell
Get-MgUser -Filter "endsWith(userPrincipalName,'@contoso.com')" | Get-UserUsageLocation
```

## Move-UserMsolAccountSku
Move all licenses (with disabled plans preserved) from one user to another.

**Syntax**

```powershell
Move-UserMsolAccountSku -SourceUserPrincipalName <String> -DestinationUserPrincipalName <String>
Move-UserMsolAccountSku <SourceUserPrincipalName> <DestinationUserPrincipalName>
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceUserPrincipalName` (`Source`, `From`) | String | Source user UPN, object ID, or short identifier. | Yes | - |
| `DestinationUserPrincipalName` (`Destination`, `To`) | String | Destination user UPN, object ID, or short identifier. | Yes | - |

**Example**
```powershell
Move-UserMsolAccountSku -SourceUserPrincipalName 'user1@contoso.com' -DestinationUserPrincipalName 'user2@contoso.com'
```

```powershell
Move-UserMsolAccountSku 'user1@contoso.com' 'user2@contoso.com'
```

:::warning[Licenses availability]
Before assigning, Nebula.Core checks tenant seat availability for each source license. A license with no available units is left on the source (not removed) instead of failing the whole move; every license that does have availability is still assigned to the destination and removed from the source.
:::

## Remove-UserMsolAccountSku
Remove licenses from a user by friendly name (resolved via catalog), SKU part number, or SKU ID.

**Syntax**

```powershell
Remove-UserMsolAccountSku -UserPrincipalName <String> -License <String[]> [-ForceLicenseCatalogRefresh] [-ShowErrorDetails]
Remove-UserMsolAccountSku <UserPrincipalName> -License <String[]> [-ForceLicenseCatalogRefresh] [-ShowErrorDetails]
'user1@contoso.com','user2@contoso.com' | Remove-UserMsolAccountSku -License <String[]> [-ForceLicenseCatalogRefresh] [-ShowErrorDetails]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserPrincipalName` (`User`, `UPN`) | String | Target user UPN, object ID, or short identifier. | Yes | - |
| `License` | String[] | Friendly name, SKU part number, or SKU ID. Accepts multiple values. | Yes | - |
| `ForceLicenseCatalogRefresh` | Switch | Redownload license catalog cache. | No | `False` |
| `ShowErrorDetails` | Switch | Kept for compatibility. Since 1.3.0 error messages always include the Microsoft Graph error detail, so this switch has no effect. | No | `False` |

```powershell
Remove-UserMsolAccountSku -UserPrincipalName <String> -All [-ForceLicenseCatalogRefresh] [-ShowErrorDetails]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserPrincipalName` (`User`, `UPN`) | String | Target user UPN, object ID, or short identifier. | Yes | - |
| `All` | Switch | Remove all assigned licenses. | Yes | - |
| `ForceLicenseCatalogRefresh` | Switch | Redownload license catalog cache. | No | `False` |
| `ShowErrorDetails` | Switch | Kept for compatibility. Since 1.3.0 error messages always include the Microsoft Graph error detail, so this switch has no effect. | No | `False` |

**Examples**
```powershell
Remove-UserMsolAccountSku -UserPrincipalName 'user@contoso.com' -License 'Microsoft 365 E3'
```

```powershell
Remove-UserMsolAccountSku -UserPrincipalName 'user@contoso.com' -License 'ENTERPRISEPACK','VISIOCLIENT'
```

```powershell
Remove-UserMsolAccountSku -UserPrincipalName 'user@contoso.com' -License '18181a46-0d4e-45cd-891e-60aabd171b4e'
```

```powershell
Remove-UserMsolAccountSku 'user@contoso.com' -License 'Exchange Online (Plan 2)'
```

```powershell
'user1@contoso.com','user2@contoso.com' | Remove-UserMsolAccountSku -License 'Exchange Online (Plan 1)'
```

```powershell
Remove-UserMsolAccountSku -UserPrincipalName 'user@contoso.com' -All
```

## Set-UserUsageLocation
Update the usage location for one or more users. When `-UsageLocation` is omitted, the configured Nebula.Core default is used (`UsageLocation`, `US` unless overridden). Users already at the target value are skipped. Supports `-WhatIf`/`-Confirm`.

**Syntax**

```powershell
Set-UserUsageLocation -UserPrincipalName <String[]> [-UsageLocation <String>] [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserPrincipalName` (`User`, `UPN`, `Identity`) | String[] | User principal name, object ID, or short identifier. Pipeline accepted. | Yes | - |
| `UsageLocation` | String | Two-letter country code to set. | No | Configured `UsageLocation` |
| `PassThru` | Switch | Emit the processed users as objects. | No | `False` |

**Examples**
```powershell
Set-UserUsageLocation -UserPrincipalName user@contoso.com -UsageLocation IT
```

```powershell
'user1@contoso.com','user2@contoso.com' | Set-UserUsageLocation -UsageLocation DE
```

## Update-LicenseCatalog
Refresh the local license catalog cache (download SKU mappings). It always redownloads the primary and custom catalogs, regardless of cache age.

**Syntax**

```powershell
Update-LicenseCatalog
```

- No parameters.

**Example**
```powershell
Update-LicenseCatalog
```

## Questions and answers

### Can I export licenses/mailboxes without Graph?

No. License functions and some statistics require Microsoft Graph for complete data. Ensure `Connect-Nebula` requested the right scopes.
