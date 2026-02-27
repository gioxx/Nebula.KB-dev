---
sidebar_position: 11
title: 'Unregister-ScriptScheduledTask'
description: Remove an existing scheduled task used by script automation.
hide_title: true
id: unregister-scriptscheduledtask
tags:
  - Unregister-ScriptScheduledTask
  - Task Scheduler
  - Nebula.Automations
---

# Unregister-ScriptScheduledTask

Removes a scheduled task by name and path and returns a status object.

## Syntax

```powershell
Unregister-ScriptScheduledTask -TaskName <String> [-TaskPath <String>] [-LogLocation <String>] [-WhatIf]
```

## Example

```powershell
Unregister-ScriptScheduledTask `
  -TaskName "Daily-PolicyAudit" `
  -TaskPath "\Nebula\"
```

See also: [Register-ScriptScheduledTask](./register-scriptscheduledtask).

