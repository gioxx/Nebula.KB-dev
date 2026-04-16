---
sidebar_position: 6
title: "Intune"
description: Find Intune configuration profiles assigned to an Entra group.
hide_title: true
id: intune
tags:
  - Device Configuration
  - Entra
  - Export-IntuneAppInventory
  - Get-IntuneProfileAssignmentsByGroup
  - Intune
  - Microsoft Graph
  - Nebula.Core
  - New-IntuneAppBasedGroup
  - Search-IntuneProfileLocation
---

# Intune helpers

Requires Microsoft Graph. For full details and examples, run `Get-Help <FunctionName> -Detailed`.

## Export-IntuneAppInventory
Report Intune-managed devices that have matching applications installed. The report is built from detected apps and can optionally include deployed app status data as well.

:::info Credits
The original script is entirely the work of **Ugur Koc** (via [intuneautomation.com/script/get-application-inventory-report/](https://www.intuneautomation.com/script/get-application-inventory-report/)).  
I merely made a few minor tweaks and integrated the rest into the module and this specific function.
:::

**Syntax**

```powershell
Export-IntuneAppInventory -ApplicationName <String> [-MinimumVersion <String>] [-FilterByType <String>] [-FilterByPlatform <String>] [-OnlySuccessfulInstalls] [-IncludeDeployedApps] [-MaxDevices <Int32>] [-OutputCsvPath <String>] [-OutputJsonPath <String>] [-BatchSize <Int32>] [-Resume] [-CsvPath <String>] [-MaxConsecutiveErrors <Int32>] [-PivotSummary]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `ApplicationName` (`SearchText`, `Name`, `DisplayName`, `Query`, `AppName`) | String | Application name or wildcard pattern to match. Pipeline accepted. | Yes | - |
| `MinimumVersion` | String | Minimum application version to keep in the report. | No | - |
| `FilterByType` | String | App type filter: `Win32`, `Store`, `LOB`, `Web`, `iOS`, `Android`, `macOS`, or `All`. Applies when `-IncludeDeployedApps` is used. | No | `All` |
| `FilterByPlatform` | String | Device platform filter: `Windows`, `iOS`, `Android`, `macOS`, or `All`. | No | `All` |
| `OnlySuccessfulInstalls` | Switch | Keep only successful installs when querying deployment status. | No | `False` |
| `IncludeDeployedApps` | Switch | Also query deployed app device status. | No | `False` |
| `MaxDevices` | Int32 | Maximum number of devices to process. | No | `0` |
| `OutputCsvPath` | String | Optional CSV output path. | No | - |
| `OutputJsonPath` | String | Optional JSON output path. | No | - |
| `BatchSize` | Int32 | Number of rows to flush at a time when writing CSV output. | No | `25` |
| `Resume` | Switch | Resume CSV export from the latest matching CSV or from `-CsvPath`. | No | `False` |
| `CsvPath` | String | Explicit CSV file to resume or export to. When omitted, a default file is used. | No | - |
| `MaxConsecutiveErrors` | Int32 | Stop after this many consecutive device-level failures. | No | `5` |
| `PivotSummary` | Switch | Print a per-app summary after the report is built. | No | `False` |

**Examples**
```powershell
Export-IntuneAppInventory -ApplicationName "TeamViewer"
```

```powershell
Export-IntuneAppInventory -ApplicationName "Microsoft*" -IncludeDeployedApps -FilterByType Win32 -OutputCsvPath "apps.csv"
```

```powershell
Export-IntuneAppInventory -ApplicationName "Chrome" -MinimumVersion "120.0" -IncludeDeployedApps -PivotSummary
```

:::note
`FilterByType` can be evaluated against deployed-app data. When `-IncludeDeployedApps` is not used, the report is based on detected apps only and the type filter is ignored.
CSV resume works when `-OutputCsvPath` or `-CsvPath` points to a report file; if `-Resume` is used without an explicit path, the cmdlet reuses the latest matching CSV in the current folder or creates a new one.
:::

## Get-IntuneProfileAssignmentsByGroup
Show where an Entra group is used in Intune (Graph scopes: `DeviceManagementConfiguration.Read.All`, `DeviceManagementApps.Read.All`, `Group.Read.All`, `Directory.Read.All`).

This command is group-centric. It inspects:

- classic and beta Intune device configurations from `deviceConfigurations`
- settings catalog policies from `configurationPolicies`
- Intune apps from `deviceAppManagement/mobileApps`

The output is object-based and pipe-friendly. It can also include parent-group matches when the requested group is nested in other Entra groups.

**Syntax**

```powershell
Get-IntuneProfileAssignmentsByGroup [-GroupName <String>] [-ProfileName <String>] [-ProfileId <String>] [-IncludeNestedGroups] [-GridView] [-Diagnostic]

Get-IntuneProfileAssignmentsByGroup [-GroupId <String>] [-ProfileName <String>] [-ProfileId <String>] [-IncludeNestedGroups] [-GridView] [-Diagnostic]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `GroupName` | String | Target Entra group display name. Pipeline accepted. | Yes* | - |
| `GroupId` | String | Target Entra group object ID (use instead of `GroupName`). | Yes* | - |
| `ProfileName` | String | Optional filter for profile or app display name. | No | - |
| `ProfileId` | String | Optional filter for a specific Intune object ID. | No | - |
| `IncludeNestedGroups` | Switch | Also match parent groups that include the requested Entra group. | No | `False` |
| `GridView` | Switch | Show additional details in Out-GridView. | No | `False` |
| `Diagnostic` | Switch | Include diagnostic columns in the returned objects. | No | `False` |

\*Use either `GroupName` or `GroupId`.

**Examples**
```powershell
Get-IntuneProfileAssignmentsByGroup -GroupName "Windows 11 Pilot"
```

```powershell
Get-IntuneProfileAssignmentsByGroup -GroupId "00000000-0000-0000-0000-000000000000"
```

```powershell
"Windows 11 Pilot" | Get-IntuneProfileAssignmentsByGroup -GridView
```

```powershell
Get-IntuneProfileAssignmentsByGroup -GroupName "Intune - Reception" -IncludeNestedGroups
```

```powershell
Get-IntuneProfileAssignmentsByGroup -GroupName "Intune - Reception" |
    Where-Object Category -like '*App*'
```

```powershell
Get-IntuneProfileAssignmentsByGroup -GroupName "Intune - Reception" -ProfileName "Zoom Workplace" -Diagnostic
```

**Output**

Default output includes:

| Column | Description |
| --- | --- |
| `Category` | Intune surface, for example `Device Configuration`, `Settings Catalog Policy`, `Required App`, `Available App`, or `Uninstall App`. |
| `Profile Name` | Intune configuration profile display name. |
| `Profile Type` | Graph OData type for the profile or app object. |
| `Assignment` | `Include`, `Exclude`, or `Include; Exclude` when both assignment types exist for the same object. |

When `-GridView` or `-Diagnostic` is used, the output also includes:

| Column | Description |
| --- | --- |
| `Profile Id` | Intune configuration profile object ID. |
| `Source` | Graph surface used to retrieve the object. |
| `Group Name` | Resolved Entra group display name. |
| `Group Id` | Resolved Entra group object ID. |
| `Assignment Id` | Assignment object ID or IDs. |
| `Target OData Type` | Graph target type or types used by the assignments. |
| `Target Group Id` | Target group object ID or IDs. |
| `Target Group Name` | Resolved target group display name or names. |
| `Matched Requested Group` | Boolean indicating whether at least one assignment matched the requested group context. |
| `App Intent` | Present for app assignments, for example `required`, `available`, or `uninstall`. |

:::note
Current scope is intentionally focused. The command currently covers `deviceConfigurations`, `configurationPolicies`, and `mobileApps`. It does not yet enumerate all Intune surfaces such as compliance policies, scripts, filters, enrollment profiles, app protection policies, or endpoint security policy families.
:::

:::tip
Default console output highlights rows containing `Exclude` with a different color, while the underlying objects remain unchanged for pipeline use.
:::

## New-IntuneAppBasedGroup
Create or update Entra security groups based on apps detected on Intune-managed devices. The command supports multiple apps in a single run, optional version and platform filtering, and a dry-run preview.

:::info Credits
The original script is entirely the work of **Ugur Koc** (via [intuneautomation.com/script/create-app-based-entra-id-groups/](https://www.intuneautomation.com/script/create-app-based-entra-id-groups/)).  
I merely made a few minor tweaks and integrated the rest into the module and this specific function.
:::

**Syntax**

```powershell
New-IntuneAppBasedGroup -ApplicationName <String> [-GroupName <String>] [-GroupPrefix <String>] [-GroupSuffix <String>] [-UpdateExisting] [-MinimumVersion <String>] [-FilterByType <String>] [-FilterByPlatform <String>] [-OnlySuccessfulInstalls] [-DryRun] [-MaxDevices <Int32>]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `ApplicationName` (`SearchText`, `Name`, `DisplayName`, `Query`, `AppName`) | String | Application name or wildcard pattern to match. Pipeline accepted. | Yes | - |
| `GroupName` | String | Explicit full group name to use instead of generating one from prefix and suffix. When supplied, the command creates one aggregated group from all matching devices. | No | - |
| `GroupPrefix` | String | Prefix applied to generated group names. | No | `Devices-With-` |
| `GroupSuffix` | String | Suffix applied to generated group names. | No | - |
| `UpdateExisting` | Switch | Update matching groups instead of skipping them when they already exist. | No | `False` |
| `MinimumVersion` | String | Minimum application version to keep in the result set. | No | - |
| `FilterByType` | String | App type filter: `Win32`, `Store`, `LOB`, `Web`, `iOS`, `Android`, `macOS`, or `All`. | No | `All` |
| `FilterByPlatform` | String | Device platform filter: `Windows`, `iOS`, `Android`, `macOS`, or `All`. | No | `All` |
| `OnlySuccessfulInstalls` | Switch | Keep only successful installs when deployment data is used. | No | `False` |
| `DryRun` | Switch | Preview the changes without creating or updating groups. | No | `False` |
| `MaxDevices` | Int32 | Maximum number of devices to process. | No | `0` |

**Examples**
```powershell
New-IntuneAppBasedGroup -ApplicationName "TeamViewer"
```

```powershell
New-IntuneAppBasedGroup -ApplicationName "TeamViewer" -GroupName "Devices - TeamViewer"
```

```powershell
New-IntuneAppBasedGroup -ApplicationName "Microsoft*" -GroupPrefix "SW-" -GroupSuffix "-Installed"
```

```powershell
New-IntuneAppBasedGroup -ApplicationName "Chrome" -MinimumVersion "120.0" -UpdateExisting
```

```powershell
New-IntuneAppBasedGroup -ApplicationName "*" -FilterByType Win32 -DryRun
```

:::note
The command creates Entra security groups and adds devices by resolving Intune-managed devices back to their corresponding Entra device objects. When `-GroupName` is supplied, it overrides generated prefix and suffix values and collapses all matches into a single group target.
:::

## Search-IntuneProfileLocation
Find which Intune endpoint exposes a profile by name. This is a discovery command that scans multiple Graph surfaces and returns the matching source, profile ID, and OData type.

**Syntax**

```powershell
Search-IntuneProfileLocation -SearchText <String> [-Exact] [-GridView]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SearchText` (`Name`, `DisplayName`, `ProfileName`, `Query`) | String | Profile name or wildcard pattern to search for. Pipeline accepted. | Yes | - |
| `Exact` | Switch | Match the profile name exactly instead of using a contains search. | No | `False` |
| `GridView` | Switch | Show the results in Out-GridView instead of returning objects. | No | `False` |

**Examples**
```powershell
Search-IntuneProfileLocation -SearchText "iOS - Wi-Fi M-Smartphone"
```

```powershell
Search-IntuneProfileLocation -SearchText "Wi-Fi" -GridView
```

:::note
The command scans a curated set of Intune surfaces, including device configurations, configuration policies, compliance policies, enrollment configurations, scripts, and mobile apps.
:::
