---
sidebar_position: 3
title: 'Register-ScriptScheduledTask'
description: Register and unregister scheduled tasks for PowerShell scripts, with standard or custom XML scheduling.
hide_title: true
id: register-scriptscheduledtask
tags:
  - Register-ScriptScheduledTask
  - Unregister-ScriptScheduledTask
  - Task Scheduler
  - Nebula.Automations
---

# Register-ScriptScheduledTask

Register (and remove) scheduled tasks for PowerShell scripts using two modes:

- `Standard`: action/trigger objects via `Register-ScheduledTask`.
- `Xml`: custom XML (inline or file) for advanced scheduler options.

Use `Unregister-ScriptScheduledTask` to remove tasks safely.

## Syntax

```powershell
Register-ScriptScheduledTask -TaskName <String>
                             [-TaskPath <String>]
                             [-Mode Standard|Xml]
                             [-ScriptPath <String>]
                             [-PwshPath <String>]
                             [-ScriptArguments <String>]
                             [-WorkingDirectory <String>]
                             [-ExecutionPolicy <String>]
                             [-StartTime <DateTime>]
                             [-ScheduleType Daily|Once]
                             [-RepetitionIntervalMinutes <Int>]
                             [-RepetitionDurationHours <Int>]
                             [-TaskXml <String>]
                             [-TaskXmlPath <String>]
                             [-Description <String>]
                             [-Credential <PSCredential>]
                             [-RunElevated]
                             [-Force]
                             [-LogLocation <String>]
                             [-WhatIf]
```

```powershell
Unregister-ScriptScheduledTask -TaskName <String>
                               [-TaskPath <String>]
                               [-LogLocation <String>]
                               [-WhatIf]
```

## Key parameters

| Parameter | Description |
| --- | --- |
| `TaskName` | Task name (required). |
| `TaskPath` | Task Scheduler path. Default: `\`. |
| `Mode` | `Standard` or `Xml`. |
| `ScriptPath` | Script to execute (required in `Standard`). |
| `TaskXml` / `TaskXmlPath` | XML content or path (required in `Xml`). |
| `Credential` | Account used to run the task (optional). |
| `Force` | Recreate task if already present. |
| `RunElevated` | Request highest privileges during registration. |
| `LogLocation` | Optional log destination for Nebula logging. |

:::important
In `Xml` mode, specify only one between `-TaskXml` and `-TaskXmlPath`.
:::

## Examples

- **Standard daily task**

```powershell
Register-ScriptScheduledTask `
  -TaskName "Daily-UserSync" `
  -TaskPath "\Nebula\" `
  -Mode Standard `
  -ScriptPath "C:\Ops\Scripts\UserSync.ps1" `
  -StartTime ((Get-Date).Date.AddHours(3)) `
  -ScheduleType Daily `
  -ExecutionPolicy Bypass `
  -Description "Daily user sync"
```

- **Standard task with repetition**

```powershell
Register-ScriptScheduledTask `
  -TaskName "Hourly-QuarantineCheck" `
  -TaskPath "\Nebula\" `
  -ScriptPath "C:\Ops\Scripts\Check-Quarantine.ps1" `
  -StartTime ((Get-Date).Date.AddHours(1)) `
  -RepetitionIntervalMinutes 60 `
  -RepetitionDurationHours 24 `
  -Force
```

- **Custom XML task**

```powershell
$cred = Get-Credential

Register-ScriptScheduledTask `
  -TaskName "ConditionalAccess-Automation" `
  -TaskPath "\" `
  -Mode Xml `
  -TaskXmlPath "C:\Ops\TaskXml\ConditionalAccess.xml" `
  -Credential $cred `
  -Force
```

- **Unregister task**

```powershell
Unregister-ScriptScheduledTask `
  -TaskName "Hourly-QuarantineCheck" `
  -TaskPath "\Nebula\"
```

## Questions and answers

### When should I use Xml mode?

Use `Xml` mode when you need scheduler features not easily expressed with standard trigger/action creation (complex repetition, principal details, advanced settings).

### Is this safe for idempotent automation runs?

Yes. Use `-Force` to recreate tasks cleanly, and `-WhatIf` to preview changes.

### Does it replace the built-in Register-ScheduledTask?

No. It wraps common script-automation scenarios and keeps one consistent API for standard and XML-based scheduling.
