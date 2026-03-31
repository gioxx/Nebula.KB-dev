---
sidebar_position: 6
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
  - Move-UserMsolAccountSku
  - Remove-UserMsolAccountSku
  - Update-LicenseCatalog
  - Nebula.Core
  - Licenses
---

# License helpers

Requires Microsoft Graph and a cached SKU catalog. For full details and examples, run `Get-Help <FunctionName> -Detailed`.

Use `Export-MsolAccountSku` when you need:
- a full tenant license assignment export
- a domain-scoped report for a specific mail domain
- a license-scoped report for users who hold a specific SKU, while still keeping all of their assigned licenses in the CSV

| Scenario | Use this filter | Result |
| --- | --- | --- |
| Full export | none | All licensed users and all of their assigned licenses |
| Domain report | `-Domain` | Only users in the selected domain, with all of their assigned licenses |
| License report | `-License` | Only users who have the selected license, with all of their assigned licenses |

:::note User identifier resolution
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
| `UserPrincipalName` | String | Target user UPN, object ID, or short identifier. | Yes | - |
| `License` | String[] | Friendly name, SKU part number, or SKU ID. Accepts multiple values. | Yes | - |
| `ForceLicenseCatalogRefresh` | Switch | Redownload license catalog cache. | No | `False` |
| `ShowErrorDetails` | Switch | Include exception details in error messages. | No | `False` |

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

:::note Mandatory usage location parameter
If the target user has no `UsageLocation`, Nebula.Core sets it automatically using the `UsageLocation` key from your configuration (default `US`, override via `%USERPROFILE%\.NebulaCore\settings.psd1`). If updating the usage location fails, license assignment stops.
:::

:::warning Licenses availability
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
| `SourceUserPrincipalName` | String | Source user UPN, object ID, or short identifier. | Yes | - |
| `DestinationUserPrincipalName` | String | Destination user UPN, object ID, or short identifier. | Yes | - |

**Example**
```powershell
Copy-UserMsolAccountSku -SourceUserPrincipalName 'user1@contoso.com' -DestinationUserPrincipalName 'user2@contoso.com'
```

```powershell
Copy-UserMsolAccountSku 'user1@contoso.com' 'user2@contoso.com'
```

## Export-MsolAccountSku
Export all users with assigned licenses to CSV, mapping SKU part numbers to friendly names.
Use `-Domain` to limit the export to users whose `Mail`, `UserPrincipalName`, or `ProxyAddresses` match the domain.
Use `-License` to limit the export to users who have at least one matching license, while still exporting all of the licenses assigned to those users.

**Syntax**

```powershell
Export-MsolAccountSku [-CsvFolder <String>] [-Domain <String>] [-License <String[]>] [-ForceLicenseCatalogRefresh]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `CsvFolder` | String | Output folder. | No | Current directory |
| `Domain` | String | Limit the export to users in the specified domain. | No | - |
| `License` | String[] | Limit the export to users who have at least one matching license. Accepts friendly name, SKU part number, or SKU ID. | No | - |
| `ForceLicenseCatalogRefresh` | Switch | Redownload the license catalog cache. | No | `False` |

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

:::note License filtered export
When you pass `-License`, the CSV still includes every license assigned to each matching user. If a user has `Exchange Online (Plan 1)` plus `Microsoft 365 E3`, both rows are exported.
:::

## Get-TenantMsolAccountSku
List tenant SKUs with resolved names, totals, consumed, available (enabled minus consumed), and seat states (filter by name or SKU part number).

**Syntax**

```powershell
Get-TenantMsolAccountSku [-ForceLicenseCatalogRefresh] [-Filter <String>] [-SampleUsers <Int32>] [-AsTable] [-GridView]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `ForceLicenseCatalogRefresh` | Switch | Redownload license catalog cache. | No | `False` |
| `Filter` | String | Show only licenses whose name or `SkuPartNumber` contains the provided text. | No | - |
| `SampleUsers` | Int32 | Return up to N sample users per license (requires `-Filter`). Defaults to 5 when specified. | No | `5` |
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

:::note Available licenses: how counting works
`Available` is calculated as `Enabled - Consumed` (never below zero). The `Total` column shows a friendly breakdown (Enabled/Suspended), while `TotalCount` remains the numeric total for scripting.
:::

:::tip Microsoft 365 Subscriptions (Admin Portal)
Need renewal/expiration or billing profile details? Open the Microsoft 365 Admin Center subscriptions page: https://admin.cloud.microsoft/?#/subscriptions
:::

## Get-UserMsolAccountSku
Show licenses assigned to a single user with friendly names.

**Syntax**

```powershell
Get-UserMsolAccountSku -UserPrincipalName <String> [-Clipboard] [-CheckAvailability] [-ForceLicenseCatalogRefresh] [-ShowErrorDetails]
Get-UserMsolAccountSku <UserPrincipalName> [-Clipboard] [-CheckAvailability] [-ForceLicenseCatalogRefresh] [-ShowErrorDetails]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserPrincipalName` | String | Target UPN, object ID, or short identifier. | Yes | - |
| `Clipboard` | Switch | Copy the resolved license names (fallback: `SkuPartNumber`) to the clipboard as `"License1","License2"`. | No | `False` |
| `CheckAvailability` | Switch | Show tenant available seat counts for the assigned SKUs. | No | `False` |
| `ForceLicenseCatalogRefresh` | Switch | Redownload license catalog cache. | No | `False` |
| `ShowErrorDetails` | Switch | Include exception details in error messages. | No | `False` |

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

## Move-UserMsolAccountSku
Move all licenses (with disabled plans preserved) from one user to another.

**Syntax**

```powershell
Move-UserMsolAccountSku -SourceUserPrincipalName <String> -DestinationUserPrincipalName <String>
Move-UserMsolAccountSku <SourceUserPrincipalName> <DestinationUserPrincipalName>
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceUserPrincipalName` | String | Source user UPN, object ID, or short identifier. | Yes | - |
| `DestinationUserPrincipalName` | String | Destination user UPN, object ID, or short identifier. | Yes | - |

**Example**
```powershell
Move-UserMsolAccountSku -SourceUserPrincipalName 'user1@contoso.com' -DestinationUserPrincipalName 'user2@contoso.com'
```

```powershell
Move-UserMsolAccountSku 'user1@contoso.com' 'user2@contoso.com'
```

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
| `UserPrincipalName` | String | Target user UPN, object ID, or short identifier. | Yes | - |
| `License` | String[] | Friendly name, SKU part number, or SKU ID. Accepts multiple values. | Yes | - |
| `ForceLicenseCatalogRefresh` | Switch | Redownload license catalog cache. | No | `False` |
| `ShowErrorDetails` | Switch | Include exception details in error messages. | No | `False` |

```powershell
Remove-UserMsolAccountSku -UserPrincipalName <String> -All [-ForceLicenseCatalogRefresh] [-ShowErrorDetails]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserPrincipalName` | String | Target user UPN, object ID, or short identifier. | Yes | - |
| `All` | Switch | Remove all assigned licenses. | Yes | - |
| `ForceLicenseCatalogRefresh` | Switch | Redownload license catalog cache. | No | `False` |
| `ShowErrorDetails` | Switch | Include exception details in error messages. | No | `False` |

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

## Update-LicenseCatalog
Refresh the local license catalog cache (download SKU mappings).

**Syntax**

```powershell
Update-LicenseCatalog [-Force]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `Force` | Switch | Force a refresh even if cache exists. | No | `False` |

**Example**
```powershell
Update-LicenseCatalog -Force
```

## Questions and answers

### Can I export licenses/mailboxes without Graph?

No. License functions and some statistics require Microsoft Graph for complete data. Ensure `Connect-Nebula` requested the right scopes.
