---
sidebar_position: 12
title: 'Invoke-ScriptTaskLifecycle'
description: Wrapper to register or unregister scheduled tasks with a single workflow.
hide_title: true
id: invoke-scripttasklifecycle
tags:
  - Invoke-ScriptTaskLifecycle
  - Task Scheduler
  - Nebula.Automations
---

# Invoke-ScriptTaskLifecycle

Wrapper helper that orchestrates task registration or unregistration and can prompt for credentials.

## Syntax

```powershell
Invoke-ScriptTaskLifecycle -RegisterTask -TaskName <String> -TaskPath <String> -ScriptPath <String>
                           [-TaskTime <String>] [-ScheduleType Daily|Once] [-Description <String>]
                           [-PwshPath <String>] [-WorkingDirectory <String>] [-ExecutionPolicy <String>]
                           [-PromptForCredential] [-DefaultUserName <String>] [-Credential <PSCredential>] [-Force]
```

```powershell
Invoke-ScriptTaskLifecycle -UnregisterTask -TaskName <String> [-TaskPath <String>] [-LogLocation <String>]
```

## Example

```powershell
Invoke-ScriptTaskLifecycle `
  -RegisterTask `
  -TaskName "Daily-InventorySync" `
  -TaskPath "\Nebula\" `
  -ScriptPath "C:\Ops\Inventory\Sync.ps1" `
  -TaskTime "03:00" `
  -PromptForCredential `
  -Force
```

