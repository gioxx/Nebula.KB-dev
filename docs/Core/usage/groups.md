---
sidebar_position: 5
title: "Groups"
description: Export distribution/dynamic groups, M365 groups, role groups, and user/device memberships, plus Entra security-group ownership helpers.
hide_title: true
id: groups
tags:
  - Add-EntraGroupDevice
  - Add-EntraGroupOwner
  - Add-EntraGroupUser
  - Copy-EntraGroup
  - Copy-EntraGroupOwner
  - Distribution Groups
  - Dynamic Distribution Groups
  - Export-DistributionGroups
  - Export-DynamicDistributionGroups
  - Export-EmptyEntraGroups
  - Export-M365Group
  - Get-DynamicDistributionGroupFilter
  - Get-EntraGroupDevice
  - Get-EntraGroupMembers
  - Get-EntraGroupUser
  - Get-RoleGroupsMembers
  - Get-UserGroups
  - Microsoft 365 Unified Groups
  - Nebula.Core
  - New-EntraSecurityGroup
  - Remove-EntraGroupOwner
  - Remove-EntraGroupDevice
  - Remove-EntraGroupUser
  - Search-EntraGroup
  - Set-EntraGroupDescription
  - Set-EntraGroupDisplayName
---

# Group helpers

Requires EXO for DGs and role groups, and Microsoft Graph for Microsoft 365 groups where applicable. For full details and examples, run `Get-Help <FunctionName> -Detailed`.

## Add-EntraGroupDevice
Add one or more devices to an Entra group (Graph scopes: `Group.ReadWrite.All`, `Directory.Read.All`).

**Syntax**

```powershell
Add-EntraGroupDevice [-GroupName <String>] [-GroupId <String>] [[-DeviceIdentifier] <String[]>] [-TreatInputAsId] [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `GroupName` | String | Target group display name. | Yes* | - |
| `GroupId` | String | Target group object ID (use instead of `GroupName`). | Yes* | - |
| `DeviceIdentifier` | String[] | Device display name or object ID. Pipeline accepted. | Yes | - |
| `TreatInputAsId` | Switch | Treat every `DeviceIdentifier` as an object ID (skip name lookup). | No | `False` |
| `PassThru` | Switch | Emit a status object per device. | No | `False` |

\*Use either `GroupName` or `GroupId`.

**Examples**
```powershell
"PC1","PC2" | Add-EntraGroupDevice -GroupName "Zero Trust Devices"
```

```powershell
Add-EntraGroupDevice "PC1" -GroupId "00000000-0000-0000-0000-000000000000" -PassThru
```

## Add-EntraGroupOwner
Add one or more owners to an Entra group (Graph scopes: `Group.ReadWrite.All`, `Directory.Read.All`).

**Syntax**

```powershell
Add-EntraGroupOwner [-GroupName <String>] [-GroupId <String>] [[-OwnerIdentifier] <String[]>] [-TreatInputAsId] [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `GroupName` | String | Target group display name. | Yes* | - |
| `GroupId` | String | Target group object ID (use instead of `GroupName`). | Yes* | - |
| `OwnerIdentifier` | String[] | User principal name, display name, or object ID. Pipeline accepted. | Yes | - |
| `TreatInputAsId` | Switch | Treat every `OwnerIdentifier` as an object ID (skip name lookup). | No | `False` |
| `PassThru` | Switch | Emit a status object per owner. | No | `False` |

\*Use either `GroupName` or `GroupId`.

**Examples**
```powershell
"user1@contoso.com","user2@contoso.com" | Add-EntraGroupOwner -GroupName "Project Team"
```

```powershell
Add-EntraGroupOwner "user1@contoso.com" -GroupId "00000000-0000-0000-0000-000000000000" -PassThru
```

## Add-EntraGroupUser
Add one or more users to an Entra group (Graph scopes: `Group.ReadWrite.All`, `Directory.Read.All`).

**Syntax**

```powershell
Add-EntraGroupUser [-GroupName <String>] [-GroupId <String>] [[-UserIdentifier] <String[]>] [-TreatInputAsId] [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `GroupName` | String | Target group display name. | Yes* | - |
| `GroupId` | String | Target group object ID (use instead of `GroupName`). | Yes* | - |
| `UserIdentifier` | String[] | UPN/display name/object ID, plus short identifiers (alias/SamAccountName/UPN prefix). Pipeline accepted. | Yes | - |
| `TreatInputAsId` | Switch | Treat every `UserIdentifier` as an object ID (skip name lookup). | No | `False` |
| `PassThru` | Switch | Emit a status object per user. | No | `False` |

\*Use either `GroupName` or `GroupId`.

**Examples**
```powershell
"user1@contoso.com","user2@contoso.com" | Add-EntraGroupUser -GroupName "Project Team"
```

```powershell
Add-EntraGroupUser "user1@contoso.com" -GroupId "00000000-0000-0000-0000-000000000000" -PassThru
```

## Copy-EntraGroup
Clone an Entra group into a new or existing group. By default the cmdlet copies description, owners, and members; dynamic groups are cloned as a static snapshot of their current members.

**Syntax**

```powershell
Copy-EntraGroup -SourceGroupName <String> -DestinationGroupName <String> [-SkipMembers] [-SkipOwners] [-SkipDescription] [-PassThru]
Copy-EntraGroup -SourceGroupId <String> -DestinationGroupId <String> [-SkipMembers] [-SkipOwners] [-SkipDescription] [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceGroupName` (`Source`, `From`) | String | Source group display name. | Yes* | - |
| `SourceGroupId` | String | Source group object ID (use instead of `SourceGroupName`). | Yes* | - |
| `DestinationGroupName` (`Destination`, `To`) | String | Destination group display name. If no group with this name exists, a new one is created. | Yes* | - |
| `DestinationGroupId` | String | Destination group object ID (use instead of `DestinationGroupName`). | Yes* | - |
| `SkipMembers` | Switch | Do not copy members. | No | `False` |
| `SkipOwners` | Switch | Do not copy owners. | No | `False` |
| `SkipDescription` | Switch | Do not copy the source description. | No | `False` |
| `PassThru` | Switch | Emit a summary object for the clone operation. | No | `False` |

\*Use the `Name` pair or the `Id` pair.

**Examples**
```powershell
Copy-EntraGroup -SourceGroupName "GitLab-Prod" -DestinationGroupName "GitLab-Prod-Test"
```

```powershell
Copy-EntraGroup -SourceGroupName "GitLab-Prod" -DestinationGroupName "GitLab-Prod-Test" -SkipOwners -PassThru
```

```powershell
Copy-EntraGroup -SourceGroupId "00000000-0000-0000-0000-000000000000" -DestinationGroupId "11111111-1111-1111-1111-111111111111" -SkipMembers
```

## Copy-EntraGroupOwner
Copy owners from one Entra group to another without removing existing owners from the destination.

**Syntax**

```powershell
Copy-EntraGroupOwner -SourceGroupName <String> -DestinationGroupName <String> [-PassThru]
Copy-EntraGroupOwner -SourceGroupId <String> -DestinationGroupId <String> [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceGroupName` (`Source`, `From`) | String | Source group display name. | Yes* | - |
| `SourceGroupId` | String | Source group object ID (use instead of `SourceGroupName`). | Yes* | - |
| `DestinationGroupName` (`Destination`, `To`) | String | Destination group display name. | Yes* | - |
| `DestinationGroupId` | String | Destination group object ID (use instead of `DestinationGroupName`). | Yes* | - |
| `PassThru` | Switch | Emit a status object per copied owner. | No | `False` |

\*Use the `Name` pair or the `Id` pair.

**Examples**
```powershell
Copy-EntraGroupOwner -SourceGroupName "HR" -DestinationGroupName "HR - Test"
```

```powershell
Copy-EntraGroupOwner -SourceGroupId "00000000-0000-0000-0000-000000000000" -DestinationGroupId "11111111-1111-1111-1111-111111111111" -PassThru
```

## Export-DistributionGroups
Export distribution groups and members.

**Syntax**

```powershell
Export-DistributionGroups [-DistributionGroup <String[]>] [-Csv] [-CsvFolder <String>]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `DistributionGroup` | String[] | Group identity (name/alias/SMTP). Pipeline accepted. | No | All DGs |
| `Csv` | Switch | Force CSV export. | No | `False` |
| `CsvFolder` | String | Destination for CSV. | No | Current directory |

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

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `DynamicDistributionGroup` | String[] | Dynamic DG identity. Pipeline accepted. | No | All dynamic DGs |
| `Csv` | Switch | Force CSV export. | No | `False` |
| `CsvFolder` | String | Destination for CSV. | No | Current directory |

**Example**
```powershell
Export-DynamicDistributionGroups -CsvFolder 'C:\Temp\DynDGs'
```

## Export-EmptyEntraGroups
Export Entra groups with zero members.

**Syntax**

```powershell
Export-EmptyEntraGroups [-CsvFolder <String>] [-Csv]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `CsvFolder` | String | Destination for the CSV file. | No | Current directory |
| `Csv` | Boolean | Export the report to CSV. Use `-Csv:$false` to return objects instead. | No | `True` |

**Examples**
```powershell
# Export every empty Entra group to CSV
Export-EmptyEntraGroups
```

```powershell
# Export to a custom folder
Export-EmptyEntraGroups -CsvFolder 'C:\Temp\Groups'
```

## Export-M365Group
Export Microsoft 365 groups (members/owners).

**Syntax**

```powershell
Export-M365Group [-M365Group <String[]>] [-Csv] [-CsvFolder <String>]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `M365Group` | String[] | Group identity (name/alias/SMTP). Pipeline accepted. | No | All M365 groups |
| `Csv` | Switch | Force CSV export. | No | `False` |
| `CsvFolder` | String | Destination for CSV. | No | Current directory |

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

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `DynamicDistributionGroup` | String | Dynamic DG identity. Pipeline accepted. | Yes | - |
| `IncludeDefaults` | Switch | Include default EXO filter clauses. | No | `False` |
| `AsObject` | Switch | Return as object instead of string. | No | `False` |

**Example**
```powershell
Get-DynamicDistributionGroupFilter -DynamicDistributionGroup "All Mailboxes"
```

## Get-EntraGroupDevice
Show the Entra groups a device belongs to (Graph scopes: `Group.Read.All`, `Directory.Read.All`).

**Syntax**

```powershell
Get-EntraGroupDevice [[-DeviceIdentifier] <String>] [-TreatInputAsId] [-GridView]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `DeviceIdentifier` | String | Device display name or object ID. Pipeline accepted. | Yes | - |
| `TreatInputAsId` | Switch | Treat the `DeviceIdentifier` as an object ID (skip name lookup). | No | `False` |
| `GridView` | Switch | Show details in Out-GridView. | No | `False` |

**Examples**
```powershell
Get-EntraGroupDevice "PC123"
```

```powershell
"00000000-0000-0000-0000-000000000000" | Get-EntraGroupDevice -TreatInputAsId -GridView
```

## Get-EntraGroupMembers
Show the members of an Entra group (users, devices, and other directory objects) (Graph scopes: `Group.Read.All`, `Directory.Read.All`).

**Syntax**

```powershell
Get-EntraGroupMembers [-GroupName <String>] [-GroupId <String>] [-IncludeDeviceUsers] [-GridView]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `GroupName` | String | Target group display name. Pipeline accepted. | Yes* | - |
| `GroupId` | String | Target group object ID (use instead of `GroupName`). | Yes* | - |
| `IncludeDeviceUsers` | Switch | When members are devices, resolve registered owners and users. | No | `False` |
| `GridView` | Switch | Show details in Out-GridView. | No | `False` |

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

## Get-EntraGroupUser
Show the Entra groups a user belongs to (Graph scopes: `Group.Read.All`, `Directory.Read.All`).

**Syntax**

```powershell
Get-EntraGroupUser [[-UserIdentifier] <String>] [-TreatInputAsId] [-GridView]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserIdentifier` | String | UPN/display name/object ID, plus short identifiers (alias/SamAccountName/UPN prefix). Pipeline accepted. | Yes | - |
| `TreatInputAsId` | Switch | Treat the `UserIdentifier` as an object ID (skip name lookup). | No | `False` |
| `GridView` | Switch | Show details in Out-GridView. | No | `False` |

**Examples**
```powershell
Get-EntraGroupUser "user@contoso.com"
```

```powershell
"00000000-0000-0000-0000-000000000000" | Get-EntraGroupUser -TreatInputAsId -GridView
```

## Get-RoleGroupsMembers
List Exchange Online role groups and members.

**Syntax**

```powershell
Get-RoleGroupsMembers [-AsTable] [-GridView]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `AsTable` | Switch | Show formatted table output. | No | `False` (objects) |
| `GridView` | Switch | Show results in Out-GridView. | No | `False` |

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

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `UserPrincipalName` | String | User/contact/group identity. | Yes | - |
| `GridView` | Switch | Show details in Out-GridView. | No | `False` |

**Output**
- Default output columns: `GroupName`, `GroupMail`
- With `-GridView`: additional details are included (description, type, ID, etc.)

:::warning[Breaking Change (version 1.2.0 or newer)]
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

## New-EntraSecurityGroup
Create a new Entra security group with a generated mail nickname unless one is supplied.

**Syntax**

```powershell
New-EntraSecurityGroup -GroupName <String> [-Description <String>] [-MailNickname <String>] [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `GroupName` (`DisplayName`, `Name`) | String | Display name of the new security group. | Yes | - |
| `Description` | String | Optional group description. | No | - |
| `MailNickname` | String | Optional mail nickname. When omitted, a sanitized value is generated from `GroupName`. | No | Generated |
| `PassThru` | Switch | Return the created group object. | No | `False` |

**Examples**
```powershell
New-EntraSecurityGroup -GroupName "Sec - Finance"
```

```powershell
New-EntraSecurityGroup -GroupName "Sec - Finance" -Description "Finance security group" -PassThru
```

## Remove-EntraGroupDevice
Remove one or more devices from an Entra group (Graph scopes: `Group.ReadWrite.All`, `Directory.Read.All`).

**Syntax**

```powershell
Remove-EntraGroupDevice [-GroupName <String>] [-GroupId <String>] [[-DeviceIdentifier] <String[]>] [-TreatInputAsId] [-PassThru]
Remove-EntraGroupDevice [-GroupName <String>] [-GroupId <String>] -ClearAll [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `GroupName` | String | Target group display name. | Yes* | - |
| `GroupId` | String | Target group object ID (use instead of `GroupName`). | Yes* | - |
| `DeviceIdentifier` | String[] | Device display name or object ID. Pipeline accepted. | Yes | - |
| `TreatInputAsId` | Switch | Treat every `DeviceIdentifier` as an object ID (skip name lookup). | No | `False` |
| `ClearAll` | Switch | Remove all device members from the group (users and other objects are not removed). Prompts for confirmation. | No | `False` |
| `PassThru` | Switch | Emit a status object per device. | No | `False` |

\*Use either `GroupName` or `GroupId`.

**Examples**
```powershell
"PC1","PC2" | Remove-EntraGroupDevice -GroupName "Zero Trust Devices"
```

```powershell
Remove-EntraGroupDevice "PC1" -GroupId "00000000-0000-0000-0000-000000000000" -PassThru
```

```powershell
Remove-EntraGroupDevice -GroupName "Zero Trust Devices" -ClearAll
```

```powershell
Remove-EntraGroupDevice -GroupName "Zero Trust Devices" -ClearAll -WhatIf
```

## Remove-EntraGroupOwner
Remove one or more owners from an Entra group (Graph scopes: `Group.ReadWrite.All`, `Directory.Read.All`).

**Syntax**

```powershell
Remove-EntraGroupOwner [-GroupName <String>] [-GroupId <String>] [[-OwnerIdentifier] <String[]>] [-TreatInputAsId] [-PassThru]
Remove-EntraGroupOwner [-GroupName <String>] [-GroupId <String>] -ClearAll [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `GroupName` | String | Target group display name. | Yes* | - |
| `GroupId` | String | Target group object ID (use instead of `GroupName`). | Yes* | - |
| `OwnerIdentifier` | String[] | User principal name, display name, or object ID. Pipeline accepted. | Yes | - |
| `TreatInputAsId` | Switch | Treat every `OwnerIdentifier` as an object ID (skip name lookup). | No | `False` |
| `ClearAll` | Switch | Remove all owners from the group. Prompts for confirmation. | No | `False` |
| `PassThru` | Switch | Emit a status object per owner. | No | `False` |

\*Use either `GroupName` or `GroupId`.

**Examples**
```powershell
"user1@contoso.com","user2@contoso.com" | Remove-EntraGroupOwner -GroupName "Project Team"
```

```powershell
Remove-EntraGroupOwner -GroupName "Project Team" -ClearAll
```

```powershell
Remove-EntraGroupOwner -GroupName "Project Team" -ClearAll -WhatIf
```

:::note[Owner resolution]
`Add/Remove-EntraGroupOwner` use the same user resolver behavior as the membership cmdlets, and `Copy-EntraGroupOwner` preserves existing destination owners while skipping duplicates.
:::

## Remove-EntraGroupUser
Remove one or more users from an Entra group (Graph scopes: `Group.ReadWrite.All`, `Directory.Read.All`).

**Syntax**

```powershell
Remove-EntraGroupUser [-GroupName <String>] [-GroupId <String>] [[-UserIdentifier] <String[]>] [-TreatInputAsId] [-PassThru]
Remove-EntraGroupUser [-GroupName <String>] [-GroupId <String>] -ClearAll [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `GroupName` | String | Target group display name. | Yes* | - |
| `GroupId` | String | Target group object ID (use instead of `GroupName`). | Yes* | - |
| `UserIdentifier` | String[] | UPN/display name/object ID, plus short identifiers (alias/SamAccountName/UPN prefix). Pipeline accepted. | Yes | - |
| `TreatInputAsId` | Switch | Treat every `UserIdentifier` as an object ID (skip name lookup). | No | `False` |
| `ClearAll` | Switch | Remove all user members from the group (devices and other objects are not removed). Prompts for confirmation. | No | `False` |
| `PassThru` | Switch | Emit a status object per user. | No | `False` |

\*Use either `GroupName` or `GroupId`.

**Examples**
```powershell
"user1@contoso.com","user2@contoso.com" | Remove-EntraGroupUser -GroupName "Project Team"
```

```powershell
Remove-EntraGroupUser "user1@contoso.com" -GroupId "00000000-0000-0000-0000-000000000000" -PassThru
```

```powershell
Remove-EntraGroupUser -GroupName "Project Team" -ClearAll
```

```powershell
Remove-EntraGroupUser -GroupName "Project Team" -ClearAll -WhatIf
```

:::note[User resolution]
`Add/Get/Remove-EntraGroupUser` now use the shared resolver (`Find-UserRecipient`), so short identifiers are supported in addition to full UPNs and object IDs.
:::

## Search-EntraGroup
Find Entra groups by display name and/or description (Graph scopes: `Group.Read.All`, `Directory.Read.All`).

**Syntax**

```powershell
Search-EntraGroup -SearchText <String> [-SearchIn <String>] [-GridView]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SearchText` | String | Text to search in display name and/or description. Pipeline accepted. | Yes | - |
| `SearchIn` | String | Search target: DisplayName, Description, Any. | No | `DisplayName` |
| `GridView` | Switch | Show details in Out-GridView. | No | `False` |

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

## Set-EntraGroupDescription
Update the description of an Entra group (Graph scopes: `Group.ReadWrite.All`, `Directory.Read.All`).

The first positional argument is treated as the group identifier, so you can pass the current group name or its object ID without typing `-GroupName` or `-GroupId`.

**Syntax**

```powershell
Set-EntraGroupDescription -GroupName <String> -Description <String> [-PassThru]
Set-EntraGroupDescription -GroupId <String> -Description <String> [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `GroupName` (`DisplayName`, `Name`) | String | Target group display name. | Yes* | - |
| `GroupId` | String | Target group object ID (use instead of `GroupName`). | Yes* | - |
| `Description` | String | New description. Pass an empty string to clear it. | Yes | - |
| `PassThru` | Switch | Return the updated group object. | No | `False` |

\*Use either `GroupName` or `GroupId`.

**Examples**
```powershell
Set-EntraGroupDescription GitLab-Prod -Description "Production GitLab access group"
```

```powershell
Set-EntraGroupDescription -GroupName "GitLab-Prod" -Description "Production GitLab access group"
```

```powershell
Set-EntraGroupDescription -GroupId "00000000-0000-0000-0000-000000000000" -Description "" -PassThru
```

## Set-EntraGroupDisplayName
Update the display name of an Entra group (Graph scopes: `Group.ReadWrite.All`, `Directory.Read.All`).

The first positional argument is treated as the current group identifier, so you can pass the current group name or its object ID without typing `-GroupName` or `-GroupId`.

**Syntax**

```powershell
Set-EntraGroupDisplayName -GroupName <String> -DisplayName <String> [-PassThru]
Set-EntraGroupDisplayName -GroupId <String> -DisplayName <String> [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `GroupName` (`CurrentName`, `CurrentDisplayName`) | String | Current group display name. | Yes* | - |
| `GroupId` | String | Target group object ID (use instead of `GroupName`). | Yes* | - |
| `DisplayName` | String | New display name for the group. | Yes | - |
| `PassThru` | Switch | Return the updated group object. | No | `False` |

\*Use either `GroupName` or `GroupId`.

**Examples**
```powershell
Set-EntraGroupDisplayName GitLab-Prod -DisplayName "GitLab - Production"
```

```powershell
Set-EntraGroupDisplayName -GroupName "GitLab-Prod" -DisplayName "GitLab - Production"
```

```powershell
Set-EntraGroupDisplayName -GroupId "00000000-0000-0000-0000-000000000000" -DisplayName "GitLab - Production" -PassThru
```
