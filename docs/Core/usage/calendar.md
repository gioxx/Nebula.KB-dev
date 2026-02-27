---
sidebar_position: 3
title: "Calendar"
description: Manage out-of-office messages and export calendar permissions.
hide_title: true
id: calendar
tags:
  - Copy-OoOMessage
  - Set-OoO
  - Export-CalendarPermission
  - Get-RoomDetails
  - Nebula.Core
---

# Calendar helpers

Requires an EXO session. For full and always-up-to-date details, use `Get-Help <FunctionName> -Detailed` (or `-Examples`).

## Copy-OoOMessage
Clone automatic reply (out-of-office) settings from one mailbox to another.

**Syntax**
```powershell
Copy-OoOMessage -SourceMailbox <String> -DestinationMailbox <String> [-ForceEnable] [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceMailbox` (`Identity`) | String | Mailbox to read auto-reply configuration from. Pipeline accepted. | Yes | - |
| `DestinationMailbox` | String | Mailbox to apply the configuration to. | Yes | - |
| `ForceEnable` | Switch | Enable auto-replies immediately on the destination, ignoring source state/schedule. | No | `False` |
| `PassThru` | Switch | Emit the updated destination configuration. | No | `False` |

**Example**
```powershell
Copy-OoOMessage -SourceMailbox user1@contoso.com -DestinationMailbox user2@contoso.com -ForceEnable -PassThru
```

## Export-CalendarPermission
Export calendar permissions for one or more mailboxes to CSV (and optionally to the pipeline).

**Syntax**
```powershell
Export-CalendarPermission [-SourceMailbox <String[]>] [-SourceDomain <String[]>]
                          [-OutputFolder <String>] [-All] [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceMailbox` (`Identity`) | String[] | Mailboxes to analyze. Pipeline accepted. | No | None (`All` mailboxes if no scope is provided) |
| `SourceDomain` | String[] | Domain filter (includes all matching mailboxes). | No | None (`All` mailboxes if no scope is provided) |
| `OutputFolder` | String | Destination folder for the CSV report. Defaults to current directory. | No | Current directory |
| `All` | Switch | Analyze every mailbox (CSV is written). | No | `False` |
| `PassThru` | Switch | Emit the collected permission objects as well as CSV path. | No | `False` |

**Examples**
```powershell
Export-CalendarPermission -SourceMailbox user@contoso.com -OutputFolder C:\Temp
```

```powershell
Export-CalendarPermission -SourceDomain contoso.com -OutputFolder C:\Temp -PassThru
```

```powershell
Export-CalendarPermission -All -OutputFolder C:\Temp
```

:::note
- CSV is saved as `yyyyMMdd_M365-CalendarPermissions-Report.csv` using module-configured delimiter/encoding.
- Permissions `AvailabilityOnly` and `None` are excluded.
- If no mailbox/domain is specified and `-All` is not set, the cmdlet scans the entire tenant.
:::


## Get-RoomDetails
List room list members with capacity and location details.

**Syntax**
```powershell
Get-RoomDetails [-City <String[]>] [-Csv] [-OutputFolder <String>] [-GridView] [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `City` | String[] | Filter room lists whose name/display name matches the provided text. | No | No filter (all room lists) |
| `Csv` | Switch | Export results to CSV. | No | `False` |
| `OutputFolder` | String | Destination for CSV; defaults to current directory. | No | Current directory |
| `GridView` | Switch | Show results in Out-GridView. | No | `False` |
| `PassThru` | Switch | Emit room detail objects (also when exporting). | No | `False` |

**Examples**
```powershell
Get-RoomDetails
```

```powershell
Get-RoomDetails -City Milan -Csv -OutputFolder C:\Temp
```

```powershell
Get-RoomDetails -GridView
```

## Set-OoO
Enable, schedule, or disable automatic replies on a mailbox.

**Syntax**
```powershell
Set-OoO -SourceMailbox <String> [-InternalMessage <String>] [-ExternalMessage <String>]
       [-ExternalAudience <None|Known|All>]
       [-StartTime <DateTime>] [-EndTime <DateTime>] [-ChooseDayFromCalendar]
       [-Disable] [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceMailbox` (`Identity`) | String | Mailbox to configure. Pipeline accepted. | Yes | - |
| `InternalMessage` | String | Message for internal recipients. Defaults to current config/template. | No | Current config/template |
| `ExternalMessage` | String | Message for external recipients. Defaults to internal message. | No | InternalMessage |
| `ExternalAudience` | String (`None`/`Known`/`All`) | External scope: `None`, `Known`, or `All`. | No | `All` |
| `StartTime` / `EndTime` | DateTime | Schedule window (both required together). | No | - |
| `ChooseDayFromCalendar` | Switch | Pick start/end dates via popups (mutually exclusive with Start/End). | No | `False` |
| `Disable` | Switch | Turn off automatic replies. | No | `False` |
| `PassThru` | Switch | Emit the updated configuration. | No | `False` |

**Examples**
```powershell
# Enable immediately
Set-OoO -SourceMailbox user@contoso.com -InternalMessage "<p>Back soon</p>" -ExternalAudience All
```

```powershell
# Schedule via parameters
Set-OoO -SourceMailbox user@contoso.com -StartTime "2025-12-27 08:00" -EndTime "2025-12-30 18:00"
```

```powershell
# Schedule via calendar popups
Set-OoO -SourceMailbox user@contoso.com -ChooseDayFromCalendar
```

```powershell
# Disable
Set-OoO -SourceMailbox user@contoso.com -Disable
```

:::warning
- Do not combine `-ChooseDayFromCalendar` with `-StartTime/-EndTime`.
- Messages accept HTML; defaults are reused from the current configuration when omitted.
:::
