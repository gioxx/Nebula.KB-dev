---
sidebar_position: 4
title: Scheduled Tasks
id: scheduled-tasks-overview
description: Functions to register, unregister, and orchestrate scheduled script tasks.
---

# Scheduled Tasks

This page groups the Task Scheduler lifecycle functions.

## Register-ScriptScheduledTask

Create or update a scheduled task that runs a PowerShell script.

## Unregister-ScriptScheduledTask

Remove a scheduled task by name/path.

## Invoke-ScriptTaskLifecycle

Orchestrate create/update/remove flow for scheduled tasks.

## Typical flow

```powershell
Register-ScriptScheduledTask `
  -TaskName "Daily-InventorySync" `
  -TaskPath "\Nebula\" `
  -ScriptPath "C:\Ops\Inventory\Sync.ps1" `
  -StartTime ((Get-Date).Date.AddHours(3)) `
  -ScheduleType Daily `
  -Force
```

## Notes

Use `Get-Help <FunctionName> -Detailed` for advanced scheduling options and lifecycle switches.