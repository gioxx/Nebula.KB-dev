---
sidebar_position: 5
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

# License reports

Backed by Microsoft Graph with a cached SKU catalog. For full details and examples, run `Get-Help <FunctionName> -Detailed`.

## Add-UserMsolAccountSku
Assign licenses by friendly name (resolved via catalog), SKU part number, or SKU ID to a user.

**Syntax**

```powershell
Add-UserMsolAccountSku -UserPrincipalName <String> -License <String[]> [-ForceLicenseCatalogRefresh] [-ShowErrorDetails]
```

| Parameter | Description | Required |
| --- | --- | :---: |
| `UserPrincipalName` | Target user UPN or object ID. | Yes |
| `License` | Friendly name, SKU part number, or SKU ID. Accepts multiple values. | Yes |
| `ForceLicenseCatalogRefresh` | Redownload license catalog cache. | No |
| `ShowErrorDetails` | Include exception details in error messages. | No |

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

:::note
If the target user has no `UsageLocation`, Nebula.Core sets it automatically using the `UsageLocation` key from your configuration (default `US`, override via `%USERPROFILE%\.NebulaCore\settings.psd1`). If updating the usage location fails, license assignment stops.
:::

:::warning
If the tenant does not have units available for the requested license, the assignment is avoided and a warning message is displayed.
:::

## Copy-UserMsolAccountSku
Copy all licenses (with disabled plans preserved) from one user to another without removing them from the source.

**Syntax**

```powershell
Copy-UserMsolAccountSku -SourceUserPrincipalName <String> -DestinationUserPrincipalName <String>
```

| Parameter | Description | Required |
| --- | --- | :---: |
| `SourceUserPrincipalName` | Source user UPN or object ID. | Yes |
| `DestinationUserPrincipalName` | Destination user UPN or object ID. | Yes |

**Example**
```powershell
Copy-UserMsolAccountSku -SourceUserPrincipalName 'user1@contoso.com' -DestinationUserPrincipalName 'user2@contoso.com'
```

## Export-MsolAccountSku
Export all users with assigned licenses to CSV, mapping SKU part numbers to friendly names.

**Syntax**

```powershell
Export-MsolAccountSku [-CsvFolder <String>] [-ForceLicenseCatalogRefresh]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `CsvFolder` | Output folder. | No | Current directory |
| `ForceLicenseCatalogRefresh` | Redownload the license catalog cache. | No | `False` |

**Example**
```powershell
Export-MsolAccountSku -CsvFolder 'C:\Temp\Reports'
```

## Get-TenantMsolAccountSku
List tenant SKUs with resolved names, totals, consumed, available (enabled minus consumed), and seat states (filter by name or SKU part number).

**Syntax**

```powershell
Get-TenantMsolAccountSku [-ForceLicenseCatalogRefresh] [-Filter <String>] [-SampleUsers <Int32>] [-AsTable] [-GridView]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `ForceLicenseCatalogRefresh` | Redownload license catalog cache. | No | `False` |
| `Filter` | Show only licenses whose name or `SkuPartNumber` contains the provided text. | No |  |
| `SampleUsers` | Return up to N sample users per license (requires `-Filter`). Defaults to 5 when specified. | No | `5` |
| `AsTable` | Format output as a table. | No | `False` |
| `GridView` | Show output in a GridView window. | No | `False` |

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

:::note
`Available` is calculated as `Enabled - Consumed` (never below zero). The `Total` column shows a friendly breakdown (Enabled/Suspended), while `TotalCount` remains the numeric total for scripting.
:::

:::tip
Need renewal/expiration or billing profile details? Open the Microsoft 365 Admin Center subscriptions page: https://admin.cloud.microsoft/?#/subscriptions
:::

## Get-UserMsolAccountSku
Show licenses assigned to a single user with friendly names.

**Syntax**

```powershell
Get-UserMsolAccountSku -UserPrincipalName <String> [-Clipboard] [-CheckAvailability] [-ForceLicenseCatalogRefresh] [-ShowErrorDetails]
```

| Parameter | Description | Required |
| --- | --- | :---: |
| `UserPrincipalName` | Target UPN or object ID. | Yes |
| `Clipboard` | Copy the resolved license names (fallback: `SkuPartNumber`) to the clipboard as `"License1","License2"`. | No |
| `CheckAvailability` | Show tenant available seat counts for the assigned SKUs. | No |
| `ForceLicenseCatalogRefresh` | Redownload license catalog cache. | No |
| `ShowErrorDetails` | Include exception details in error messages. | No |

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
```

| Parameter | Description | Required |
| --- | --- | :---: |
| `SourceUserPrincipalName` | Source user UPN or object ID. | Yes |
| `DestinationUserPrincipalName` | Destination user UPN or object ID. | Yes |

**Example**
```powershell
Move-UserMsolAccountSku -SourceUserPrincipalName 'user1@contoso.com' -DestinationUserPrincipalName 'user2@contoso.com'
```

## Remove-UserMsolAccountSku
Remove licenses from a user by friendly name (resolved via catalog), SKU part number, or SKU ID.

**Syntax**

```powershell
Remove-UserMsolAccountSku -UserPrincipalName <String> -License <String[]> [-ForceLicenseCatalogRefresh] [-ShowErrorDetails]
```

| Parameter | Description | Required |
| --- | --- | :---: |
| `UserPrincipalName` | Target user UPN or object ID. | Yes |
| `License` | Friendly name, SKU part number, or SKU ID. Accepts multiple values. | Yes |
| `ForceLicenseCatalogRefresh` | Redownload license catalog cache. | No |
| `ShowErrorDetails` | Include exception details in error messages. | No |

```powershell
Remove-UserMsolAccountSku -UserPrincipalName <String> -All [-ForceLicenseCatalogRefresh] [-ShowErrorDetails]
```

| Parameter | Description | Required |
| --- | --- | :---: |
| `UserPrincipalName` | Target user UPN or object ID. | Yes |
| `All` | Remove all assigned licenses. | Yes |
| `ForceLicenseCatalogRefresh` | Redownload license catalog cache. | No |
| `ShowErrorDetails` | Include exception details in error messages. | No |

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
Remove-UserMsolAccountSku -UserPrincipalName 'user@contoso.com' -All
```

## Update-LicenseCatalog
Refresh the local license catalog cache (download SKU mappings).

**Syntax**

```powershell
Update-LicenseCatalog [-Force]
```

| Parameter | Description |
| --- | --- |
| `Force` | Force a refresh even if cache exists. |

**Example**
```powershell
Update-LicenseCatalog -Force
```

## Questions and answers

### Can I export licenses/mailboxes without Graph?

No. License functions and some statistics require Microsoft Graph for complete data. Ensure `Connect-Nebula` requested the right scopes.
