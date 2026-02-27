---
sidebar_position: 6
title: "Scheduled Tasks"
id: scheduled-tasks
description: Functions to register, unregister, and orchestrate scheduled script tasks.
tags:
  - Invoke-ScriptTaskLifecycle
  - Register-ScriptScheduledTask
  - Unregister-ScriptScheduledTask
  - Nebula.Automations
---

# Scheduled Tasks

This page groups the Task Scheduler lifecycle functions. For full and always-up-to-date details, use `Get-Help <FunctionName> -Detailed` (or `-Examples`).

## Invoke-ScriptTaskLifecycle

Orchestrate create/update/remove flow for scheduled tasks through a single lifecycle entry point.

**Syntax**

```powershell
Invoke-ScriptTaskLifecycle -RegisterTask -TaskName <String> -ScriptPath <String> [-TaskPath <String>]
  [-TaskTime <String>] [-ScheduleType <Daily|Once>] [-Description <String>] [-PwshPath <String>]
  [-WorkingDirectory <String>] [-ExecutionPolicy <String>] [-PromptForCredential]
  [-DefaultUserName <String>] [-Credential <PSCredential>] [-Force] [-LogLocation <String>]

Invoke-ScriptTaskLifecycle -UnregisterTask -TaskName <String> [-TaskPath <String>] [-LogLocation <String>]
```

**Parameters**

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | --- | --- |
| `RegisterTask` | `Switch` | Enables register/update lifecycle mode. | Conditional | `False` |
| `UnregisterTask` | `Switch` | Enables unregister lifecycle mode. | Conditional | `False` |
| `TaskName` | `String` | Scheduled task name. | Yes | N/A |
| `TaskPath` | `String` | Task Scheduler folder path (for example `\Nebula\`). | No | `\` |
| `ScriptPath` | `String` | Script file to execute when registering. | Required for register | N/A |
| `TaskTime` | `String` | Trigger time string used by lifecycle registration flow. | No | `02:00` |
| `ScheduleType` | `String` | Trigger type (`Daily` or `Once`). | No | `Daily` |
| `Description` | `String` | Task description text. | No | `None` |
| `PwshPath` | `String` | Path to PowerShell executable. | No | `Auto-detect (pwsh.exe fallback path)` |
| `WorkingDirectory` | `String` | Working directory for task execution. | No | `None` |
| `ExecutionPolicy` | `String` | Execution policy passed to PowerShell. | No | `Bypass` |
| `PromptForCredential` | `Switch` | Prompts for credentials when needed. | No | `False` |
| `DefaultUserName` | `String` | Default username used with credential prompting. | No | `$Env:UserDomain\$Env:UserName` |
| `Credential` | `PSCredential` | Explicit credentials for task principal. | No | `None` |
| `Force` | `Switch` | Replaces existing task when applicable. | No | `False` |
| `LogLocation` | `String` | Log path used for lifecycle diagnostics. | No | `None` |

**Example**

```powershell
Invoke-ScriptTaskLifecycle `
  -RegisterTask `
  -TaskName "Daily-InventorySync" `
  -TaskPath "\Nebula\" `
  -ScriptPath "C:\Ops\Inventory\Sync.ps1" `
  -TaskTime "03:00" `
  -ScheduleType Daily `
  -Force
```

## Register-ScriptScheduledTask

Create or update a scheduled task that runs a PowerShell script.

**Syntax**

```powershell
Register-ScriptScheduledTask -TaskName <String> [-TaskPath <String>] [-Mode <Standard|Xml>] [-ScriptPath <String>]
  [-PwshPath <String>] [-ScriptArguments <String>] [-WorkingDirectory <String>] [-ExecutionPolicy <String>]
  [-StartTime <DateTime>] [-ScheduleType <Daily|Once>] [-RepetitionIntervalMinutes <Int>]
  [-RepetitionDurationHours <Int>] [-TaskXml <String>] [-TaskXmlPath <String>] [-Description <String>]
  [-Credential <PSCredential>] [-RunElevated] [-Force] [-LogLocation <String>]
```

**Parameters**

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | --- | --- |
| `TaskName` | `String` | Scheduled task name. | Yes | N/A |
| `TaskPath` | `String` | Task Scheduler folder path. | No | `\` |
| `Mode` | `String` | Registration mode (`Standard` or `Xml`). | No | `Standard` |
| `ScriptPath` | `String` | Script file path (used in `Standard` mode). | Conditional | N/A |
| `PwshPath` | `String` | Path to `pwsh.exe`/`powershell.exe`. | No | `pwsh.exe` |
| `ScriptArguments` | `String` | Extra arguments passed to the script. | No | `None` |
| `WorkingDirectory` | `String` | Working directory for the task action. | No | `Script parent folder` |
| `ExecutionPolicy` | `String` | Execution policy passed to PowerShell. | No | `Bypass` |
| `StartTime` | `DateTime` | Trigger start time (standard mode). | No | `Now + 5 minutes` |
| `ScheduleType` | `String` | Schedule type (`Daily` or `Once`). | No | `Daily` |
| `RepetitionIntervalMinutes` | `Int` | Repetition interval in minutes. | No | `0` |
| `RepetitionDurationHours` | `Int` | Repetition window duration in hours. | No | `0` |
| `TaskXml` | `String` | Raw task XML content (xml mode). | Conditional | `None` |
| `TaskXmlPath` | `String` | Path to task XML file (xml mode). | Conditional | `None` |
| `Description` | `String` | Task description. | No | `None` |
| `Credential` | `PSCredential` | Credentials used for the task principal. | No | `None` |
| `RunElevated` | `Switch` | Runs task with highest available privileges. | No | `False` |
| `Force` | `Switch` | Replaces existing task when present. | No | `False` |
| `LogLocation` | `String` | Log destination for registration operations. | No | `None` |

**Example**

```powershell
Register-ScriptScheduledTask `
  -TaskName "Daily-InventorySync" `
  -TaskPath "\Nebula\" `
  -ScriptPath "C:\Ops\Inventory\Sync.ps1" `
  -StartTime ((Get-Date).Date.AddHours(3)) `
  -ScheduleType Daily `
  -Force
```

## Unregister-ScriptScheduledTask

Remove a scheduled task by name/path.

**Syntax**

```powershell
Unregister-ScriptScheduledTask -TaskName <String> [-TaskPath <String>] [-LogLocation <String>]
```

**Parameters**

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | --- | --- |
| `TaskName` | `String` | Name of the task to remove. | Yes | N/A |
| `TaskPath` | `String` | Task Scheduler folder path. | No | `\` |
| `LogLocation` | `String` | Log destination for removal operations. | No | `None` |

**Example**

```powershell
Unregister-ScriptScheduledTask `
  -TaskName "Legacy-InventorySync" `
  -TaskPath "\Nebula\" `
```
