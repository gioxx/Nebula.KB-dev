---
sidebar_position: 5
title: "Groups"
description: Export distribution/dynamic groups, M365 groups, role groups, and user/device memberships.
hide_title: true
id: groups
tags:
  - Add-EntraGroupDevice
  - Add-EntraGroupUser
  - Distribution Groups
  - Dynamic Distribution Groups
  - Export-DistributionGroups
  - Export-DynamicDistributionGroups
  - Export-M365Group
  - Get-DynamicDistributionGroupFilter
  - Get-EntraGroupDevice
  - Get-EntraGroupMembers
  - Get-EntraGroupUser
  - Get-RoleGroupsMembers
  - Get-UserGroups
  - Microsoft 365 Unified Groups
  - Nebula.Core
  - Remove-EntraGroupDevice
  - Remove-EntraGroupUser
  - Search-EntraGroup
---

# Group helpers

Requires EXO (for DGs/role groups) and Microsoft Graph for M365 groups where applicable. For complete, up-to-date info, run `Get-Help <FunctionName> -Detailed`.

## Add-EntraGroupDevice
Add one or more devices to an Entra group (Graph scopes: `Group.ReadWrite.All`, `Directory.Read.All`).

**Syntax**

```powershell
Add-EntraGroupDevice [-GroupName <String>] [-GroupId <String>] -DeviceIdentifier <String[]> [-TreatInputAsId] [-PassThru]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `GroupName` | Target group display name. | Yes* | - |
| `GroupId` | Target group object ID (use instead of `GroupName`). | Yes* | - |
| `DeviceIdentifier` | Device display name or object ID. Pipeline accepted. | Yes | - |
| `TreatInputAsId` | Treat every `DeviceIdentifier` as an object ID (skip name lookup). | No | `False` |
| `PassThru` | Emit a status object per device. | No | `False` |

\*Use either `GroupName` or `GroupId`.

**Examples**
```powershell
"PC1","PC2" | Add-EntraGroupDevice -GroupName "Zero Trust Devices"
```

```powershell
Add-EntraGroupDevice -GroupId "00000000-0000-0000-0000-000000000000" -DeviceIdentifier "PC1" -PassThru
```

## Add-EntraGroupUser
Add one or more users to an Entra group (Graph scopes: `Group.ReadWrite.All`, `Directory.Read.All`).

**Syntax**

```powershell
Add-EntraGroupUser [-GroupName <String>] [-GroupId <String>] -UserIdentifier <String[]> [-TreatInputAsId] [-PassThru]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `GroupName` | Target group display name. | Yes* | - |
| `GroupId` | Target group object ID (use instead of `GroupName`). | Yes* | - |
| `UserIdentifier` | UPN/display name/object ID. Pipeline accepted. | Yes | - |
| `TreatInputAsId` | Treat every `UserIdentifier` as an object ID (skip name lookup). | No | `False` |
| `PassThru` | Emit a status object per user. | No | `False` |

\*Use either `GroupName` or `GroupId`.

**Examples**
```powershell
"user1@contoso.com","user2@contoso.com" | Add-EntraGroupUser -GroupName "Project Team"
```

```powershell
Add-EntraGroupUser -GroupId "00000000-0000-0000-0000-000000000000" -UserIdentifier "user1@contoso.com" -PassThru
```

## Export-DistributionGroups
Export distribution groups and members.

**Syntax**

```powershell
Export-DistributionGroups [-DistributionGroup <String[]>] [-Csv] [-CsvFolder <String>]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `DistributionGroup` | Group identity (name/alias/SMTP). Pipeline accepted. | No | All DGs |
| `Csv` | Force CSV export. | No | `False` |
| `CsvFolder` | Destination for CSV. | No | Current directory |

**Example**
```powershell
Export-DistributionGroups -DistributionGroup "IT Team" -CsvFolder 'C:\Temp\DGs'
```

## Export-DynamicDistributionGroups
Export dynamic DGs and evaluated members.

**Syntax**

```powershell
Export-DynamicDistributionGroups [-DynamicDistributionGroup <String[]>] [-Csv] [-CsvFolder <String>]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `DynamicDistributionGroup` | Dynamic DG identity. Pipeline accepted. | No | All dynamic DGs |
| `Csv` | Force CSV export. | No | `False` |
| `CsvFolder` | Destination for CSV. | No | Current directory |

**Example**
```powershell
Export-DynamicDistributionGroups -CsvFolder 'C:\Temp\DynDGs'
```

## Export-M365Group
Export Microsoft 365 groups (members/owners).

**Syntax**

```powershell
Export-M365Group [-M365Group <String[]>] [-Csv] [-CsvFolder <String>]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `M365Group` | Group identity (name/alias/SMTP). Pipeline accepted. | No | All M365 groups |
| `Csv` | Force CSV export. | No | `False` |
| `CsvFolder` | Destination for CSV. | No | Current directory |

**Example**
```powershell
Export-M365Group -M365Group "Project A" -CsvFolder 'C:\Temp\M365'
```

## Get-DynamicDistributionGroupFilter
Show the simplified filter of a dynamic distribution group.

**Syntax**

```powershell
Get-DynamicDistributionGroupFilter -DynamicDistributionGroup <String> [-IncludeDefaults] [-AsObject]
```

| Parameter | Description | Required |
| --- | --- | :---: |
| `DynamicDistributionGroup` | Dynamic DG identity. Pipeline accepted. | Yes |
| `IncludeDefaults` | Include default EXO filter clauses. | No |
| `AsObject` | Return as object instead of string. | No |

**Example**
```powershell
Get-DynamicDistributionGroupFilter -DynamicDistributionGroup "All Mailboxes"
```

## Get-EntraGroupDevice
Show the Entra groups a device belongs to (Graph scopes: `Group.Read.All`, `Directory.Read.All`).

**Syntax**

```powershell
Get-EntraGroupDevice -DeviceIdentifier <String> [-TreatInputAsId] [-GridView]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `DeviceIdentifier` | Device display name or object ID. Pipeline accepted. | Yes | - |
| `TreatInputAsId` | Treat the `DeviceIdentifier` as an object ID (skip name lookup). | No | `False` |
| `GridView` | Show details in Out-GridView. | No | `False` |

**Examples**
```powershell
Get-EntraGroupDevice -DeviceIdentifier "PC123"
```

```powershell
"00000000-0000-0000-0000-000000000000" | Get-EntraGroupDevice -TreatInputAsId -GridView
```

## Get-EntraGroupUser
Show the Entra groups a user belongs to (Graph scopes: `Group.Read.All`, `Directory.Read.All`).

**Syntax**

```powershell
Get-EntraGroupUser -UserIdentifier <String> [-TreatInputAsId] [-GridView]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `UserIdentifier` | UPN/display name/object ID. Pipeline accepted. | Yes | - |
| `TreatInputAsId` | Treat the `UserIdentifier` as an object ID (skip name lookup). | No | `False` |
| `GridView` | Show details in Out-GridView. | No | `False` |

**Examples**
```powershell
Get-EntraGroupUser -UserIdentifier "user@contoso.com"
```

```powershell
"00000000-0000-0000-0000-000000000000" | Get-EntraGroupUser -TreatInputAsId -GridView
```

## Get-EntraGroupMembers
Show the members of an Entra group (users, devices, and other directory objects) (Graph scopes: `Group.Read.All`, `Directory.Read.All`).

**Syntax**

```powershell
Get-EntraGroupMembers [-GroupName <String>] [-GroupId <String>] [-IncludeDeviceUsers] [-GridView]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `GroupName` | Target group display name. Pipeline accepted. | Yes* | - |
| `GroupId` | Target group object ID (use instead of `GroupName`). | Yes* | - |
| `IncludeDeviceUsers` | When members are devices, resolve registered owners and users. | No | `False` |
| `GridView` | Show details in Out-GridView. | No | `False` |

\*Use either `GroupName` or `GroupId`.

**Examples**
```powershell
Get-EntraGroupMembers "intune - app - netterm"
```

```powershell
"intune - app - netterm" | Get-EntraGroupMembers
```

```powershell
Get-EntraGroupMembers -GroupId "00000000-0000-0000-0000-000000000000" -GridView
```

```powershell
Get-EntraGroupMembers "intune - app - netterm" -IncludeDeviceUsers
```

:::note
- When `-IncludeDeviceUsers` is used and the member is a device, the output includes a `Device Owners/Users` column.
- If owners and users are identical, the list is shown once; otherwise owners and users are combined in the same column.
:::

## Get-RoleGroupsMembers
List Exchange Online role groups and members.

**Syntax**

```powershell
Get-RoleGroupsMembers [-AsTable] [-GridView]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `AsTable` | Show formatted table output. | No | `False` (objects) |
| `GridView` | Show results in Out-GridView. | No | `False` |

**Example**
```powershell
Get-RoleGroupsMembers -AsTable
```

## Get-UserGroups
Show the groups (DGs/M365) a user/contact/group belongs to.

**Syntax**

```powershell
Get-UserGroups -UserPrincipalName <String> [-GridView]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `UserPrincipalName` | User/contact/group identity. | Yes | - |
| `GridView` | Show details in Out-GridView. | No | `False` |

**Output**
- Default output columns: `GroupName`, `GroupMail`
- With `-GridView`: additional details are included (description, type, ID, etc.)

:::warning Breaking Change (version 1.2.0 or newer)
`Get-UserGroups` now returns `GroupName` and `GroupMail` instead of `Group Name` and `Group Mail`.
Update any legacy filters/scripts accordingly, for example: use `$_.GroupName` instead of `$_.'Group Name'`.
:::

**Examples**
```powershell
Get-UserGroups -UserPrincipalName 'user@contoso.com'
```

```powershell
Get-UserGroups 'user@contoso.com' | Where-Object { $_.GroupName -like '*portion-of-group-name*' }
```

## Remove-EntraGroupDevice
Remove one or more devices from an Entra group (Graph scopes: `Group.ReadWrite.All`, `Directory.Read.All`).

**Syntax**

```powershell
Remove-EntraGroupDevice [-GroupName <String>] [-GroupId <String>] -DeviceIdentifier <String[]> [-TreatInputAsId] [-PassThru]
Remove-EntraGroupDevice [-GroupName <String>] [-GroupId <String>] -ClearAll [-PassThru]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `GroupName` | Target group display name. | Yes* | - |
| `GroupId` | Target group object ID (use instead of `GroupName`). | Yes* | - |
| `DeviceIdentifier` | Device display name or object ID. Pipeline accepted. | Yes | - |
| `TreatInputAsId` | Treat every `DeviceIdentifier` as an object ID (skip name lookup). | No | `False` |
| `ClearAll` | Remove all device members from the group (users and other objects are not removed). Prompts for confirmation. | No | `False` |
| `PassThru` | Emit a status object per device. | No | `False` |

\*Use either `GroupName` or `GroupId`.

**Examples**
```powershell
"PC1","PC2" | Remove-EntraGroupDevice -GroupName "Zero Trust Devices"
```

```powershell
Remove-EntraGroupDevice -GroupId "00000000-0000-0000-0000-000000000000" -DeviceIdentifier "PC1" -PassThru
```

```powershell
Remove-EntraGroupDevice -GroupName "Zero Trust Devices" -ClearAll
```

```powershell
Remove-EntraGroupDevice -GroupName "Zero Trust Devices" -ClearAll -WhatIf
```

## Remove-EntraGroupUser
Remove one or more users from an Entra group (Graph scopes: `Group.ReadWrite.All`, `Directory.Read.All`).

**Syntax**

```powershell
Remove-EntraGroupUser [-GroupName <String>] [-GroupId <String>] -UserIdentifier <String[]> [-TreatInputAsId] [-PassThru]
Remove-EntraGroupUser [-GroupName <String>] [-GroupId <String>] -ClearAll [-PassThru]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `GroupName` | Target group display name. | Yes* | - |
| `GroupId` | Target group object ID (use instead of `GroupName`). | Yes* | - |
| `UserIdentifier` | UPN/display name/object ID. Pipeline accepted. | Yes | - |
| `TreatInputAsId` | Treat every `UserIdentifier` as an object ID (skip name lookup). | No | `False` |
| `ClearAll` | Remove all user members from the group (devices and other objects are not removed). Prompts for confirmation. | No | `False` |
| `PassThru` | Emit a status object per user. | No | `False` |

\*Use either `GroupName` or `GroupId`.

**Examples**
```powershell
"user1@contoso.com","user2@contoso.com" | Remove-EntraGroupUser -GroupName "Project Team"
```

```powershell
Remove-EntraGroupUser -GroupId "00000000-0000-0000-0000-000000000000" -UserIdentifier "user1@contoso.com" -PassThru
```

```powershell
Remove-EntraGroupUser -GroupName "Project Team" -ClearAll
```

```powershell
Remove-EntraGroupUser -GroupName "Project Team" -ClearAll -WhatIf
```

## Search-EntraGroup
Find Entra groups by display name and/or description (Graph scopes: `Group.Read.All`, `Directory.Read.All`).

**Syntax**

```powershell
Search-EntraGroup -SearchText <String> [-SearchIn <String>] [-GridView]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `SearchText` | Text to search in display name and/or description. Pipeline accepted. | Yes | - |
| `SearchIn` | Search target: DisplayName, Description, Any. | No | `DisplayName` |
| `GridView` | Show details in Out-GridView. | No | `False` |

**Examples**
```powershell
Search-EntraGroup -SearchText "java"
```

```powershell
Search-EntraGroup -SearchText "jre"
```

```powershell
Search-EntraGroup -SearchText "legacy apps" -SearchIn Description
```

```powershell
"marketing" | Search-EntraGroup -SearchIn Any -GridView
```
