---
sidebar_position: 4
title: "Scheduled Tasks"
id: scheduled-tasks
description: Functions to register, unregister, and orchestrate scheduled script tasks.
tags:
  - Register-ScriptScheduledTask
  - Unregister-ScriptScheduledTask
  - Invoke-ScriptTaskLifecycle
  - Nebula.Automations
---

# Scheduled Tasks

This page groups the Task Scheduler lifecycle functions. For full and always-up-to-date details, use `Get-Help <FunctionName> -Detailed` (or `-Examples`).

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

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `TaskName` | `String` | Yes | - | Scheduled task name. |
| `TaskPath` | `String` | No | `\` | Task Scheduler path (for example `\Nebula\`). |
| `Mode` | `String` | No | `Standard` | Registration mode: `Standard` or `Xml`. |
| `ScriptPath` | `String` | Cond. | - | Script file path (`required in Standard mode`). |
| `PwshPath` | `String` | No | `pwsh.exe` | PowerShell executable path (Standard mode). |
| `ScriptArguments` | `String` | No | - | Additional arguments appended after `-File`. |
| `WorkingDirectory` | `String` | No | Script folder | Working directory used at runtime. |
| `ExecutionPolicy` | `String` | No | `Bypass` | Execution policy for PowerShell action. |
| `StartTime` | `DateTime` | No | `Now + 5 minutes` | Trigger start time (Standard mode). |
| `ScheduleType` | `String` | No | `Daily` | Trigger type: `Daily` or `Once` (Standard mode). |
| `RepetitionIntervalMinutes` | `Int` | No | `0` | Repetition interval in minutes (`0..1440`). |
| `RepetitionDurationHours` | `Int` | No | `0` | Repetition duration in hours (`0..744`). |
| `TaskXml` | `String` | Cond. | - | Raw task XML content (`required in Xml mode, alternative to TaskXmlPath`). |
| `TaskXmlPath` | `String` | Cond. | - | Path to task XML file (`required in Xml mode, alternative to TaskXml`). |
| `Description` | `String` | No | - | Optional task description. |
| `Credential` | `PSCredential` | No | - | Account credential for scheduled task. |
| `RunElevated` | `Switch` | No | `False` | Registers task with highest privileges. |
| `Force` | `Switch` | No | `False` | Recreates task if already present. |
| `LogLocation` | `String` | No | - | Optional logging location. |

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

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `TaskName` | `String` | Yes | - | Scheduled task name. |
| `TaskPath` | `String` | No | `\` | Task Scheduler path (for example `\Nebula\`). |
| `LogLocation` | `String` | No | - | Optional logging location. |

**Example**

```powershell
Unregister-ScriptScheduledTask `
  -TaskName "Legacy-InventorySync" `
  -TaskPath "\Nebula\" `
```

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

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `RegisterTask` | `Switch` | Yes* | `False` | Selects register lifecycle path (`*register parameter set`). |
| `UnregisterTask` | `Switch` | Yes* | `False` | Selects unregister lifecycle path (`*unregister parameter set`). |
| `TaskName` | `String` | Yes | - | Scheduled task name. |
| `TaskPath` | `String` | No | `\` | Task Scheduler path. |
| `ScriptPath` | `String` | Cond. | - | Script path to execute (`required with -RegisterTask`). |
| `TaskTime` | `String` | No | `02:00` | Start time in `h:mm` or `HH:mm` format. |
| `ScheduleType` | `String` | No | `Daily` | Schedule type for register flow (`Daily`/`Once`). |
| `Description` | `String` | No | - | Optional task description. |
| `PwshPath` | `String` | No | Auto-discovered | PowerShell executable path for register flow. |
| `WorkingDirectory` | `String` | No | - | Optional working directory. |
| `ExecutionPolicy` | `String` | No | `Bypass` | Execution policy used at registration. |
| `PromptForCredential` | `Switch` | No | `False` | Prompts for credential if not provided. |
| `DefaultUserName` | `String` | No | `$Env:UserDomain\$Env:UserName` | Default username for credential prompt. |
| `Credential` | `PSCredential` | No | - | Credential used for registration. |
| `Force` | `Switch` | No | `False` | Recreates task if already existing. |
| `LogLocation` | `String` | No | - | Optional logging location. |
