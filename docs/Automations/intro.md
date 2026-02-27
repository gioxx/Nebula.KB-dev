---
sidebar_position: 1
title: 'Getting started'
description: Get up and running with Nebula.Automations in minutes.
hide_title: true
id: intro
tags:
  - Getting started
  - Nebula.Automations
---

import useBaseUrl from '@docusaurus/useBaseUrl';

<img
  src={useBaseUrl('/img/Nebula.Automations.png')}
  alt="Nebula.Automations"
  className="nebula-doc-icon"
  style={{ float: "right", maxWidth: "140px", marginLeft: "1rem" }}
/>

# Getting started

**Nebula.Automations** is a PowerShell module that provides reusable functions for scripting, automation, and integration with cloud services.
It is the natural evolution of *Nebula.Tools* and was created with a specific focus on automation.

**Main features currently available:**
- Messaging: `Send-Mail`, `Send-ReportIfChanged`.
- Microsoft Graph connectivity: `Test-MgGraphConnection` (alias `CheckMGGraphConnection`).
- Scheduled task automation: `Register-ScriptScheduledTask`, `Unregister-ScriptScheduledTask`, `Invoke-ScriptTaskLifecycle`.
- Runtime helpers: `Import-PreferredModule`, `Initialize-ScriptRuntime`, `Resolve-ScriptConfigPaths`, `Test-ScriptActivityLog`, `Start-ScriptTranscript`, `Stop-ScriptTranscriptSafe`.
- Logging fallback: if `Nebula.Log` is not installed, the module exposes a compatible `Write-Log` (alias `Log-Message`) that internally calls `Write-NALog`, so scripts using `Write-Log` do not break.

## Quick examples

- Send a daily report with an attachment:

```powershell
Send-Mail `
  -SMTPServer "smtp.contoso.com" `
  -UseSsl `
  -Credential (Get-Credential) `
  -From "user@contoso.com" `
  -To "sharedmailbox@contoso.com","user2@contoso.com" `
  -Subject "Daily report" `
  -Body "<h1>Report</h1><p>See attachment.</p>" `
  -AttachmentPath "C:\Reports\daily.csv","C:\Reports\chart.pdf"
```

- Connect to Microsoft Graph using client credentials (app context):

```powershell
$secret = Get-Content "$env:APPDATA\nebula\.graph_secret.txt" -Raw
$connected = Test-MgGraphConnection `
  -TenantId "00000000-0000-0000-0000-000000000000" `
  -ClientId "11111111-1111-1111-1111-111111111111" `
  -ClientSecret $secret `
  -LogLocation "$env:APPDATA\nebula\logs\graph-connect.log" `
  -AutoInstall `
  -ShowInformations:$false

if (-not $connected) { throw "Unable to connect to Microsoft Graph." }
```

- Register a daily scheduled task for a script:

```powershell
Register-ScriptScheduledTask `
  -TaskName "Daily-InventorySync" `
  -TaskPath "\Nebula\" `
  -ScriptPath "C:\Ops\Inventory\Sync.ps1" `
  -StartTime ((Get-Date).Date.AddHours(3)) `
  -ScheduleType Daily `
  -Force
```

:::tip
Every function exposes built-in help. Use `Get-Help <FunctionName> -Detailed` or `-Examples` for notes, parameters, and prerequisites.
:::

## Browse by area

- [Messaging](./usage/messaging)
- [Microsoft Graph](./usage/graph)
- [Scheduled Tasks](./usage/scheduled-tasks)
- [Runtime Helpers](./usage/runtime)
- [Logging](./usage/logging)
- [Functions A-Z](./usage/reference)

## Requirements

- PowerShell 5.1+ or PowerShell 7+
- `Send-Mail`: no external dependencies; uses .NET `System.Net.Mail`. Supports credentials/TLS when the relay requires them.
- `Test-MgGraphConnection`: uses `Microsoft.Graph`; can auto-install it when `-AutoInstall` is set. Logging relies on `Write-Log` from `Nebula.Log`; if that module is missing, Nebula.Automations exposes a compatible `Write-Log`/`Log-Message` that delegates to `Write-NALog`.
- `Register-ScriptScheduledTask`: requires the ScheduledTasks module/cmdlets available on Windows hosts where Task Scheduler automation is supported.

## Logging behavior

- When `Nebula.Log` is installed, its `Write-Log` is used.
- If `Nebula.Log` is missing, Nebula.Automations publishes a compatible `Write-Log` (alias `Log-Message`) that delegates to `Write-NALog`. This prevents scripts that call `Write-Log` from failing.
- `Write-NALog` only uses `Write-Log` when it comes from `Nebula.Log`; otherwise it writes to the transcript (and, when possible, to a file in the current directory or the supplied `-LogLocation`).

# How to download Nebula.Automations

Nebula.Automations is available on the PowerShell Gallery.  
Its GitHub repository is available at [github.com/gioxx/Nebula.Automations](https://github.com/gioxx/Nebula.Automations).

## Installation from PowerShell Gallery

This is definitely the recommended option and is currently the simplest, provided your machine has internet connectivity and the ability to download files from Microsoft's PowerShell Gallery ([powershellgallery.com](https://www.powershellgallery.com/)).

The CurrentUser installs modules in a location that's accessible only to the current user of the computer (for example: ```$HOME\Documents\PowerShell\Modules```):

```powershell
Install-Module -Name Nebula.Automations -Scope CurrentUser
```

The `AllUsers` scope installs modules in a location that's accessible to all users of the computer (```$env:ProgramFiles\PowerShell\Modules```):

```powershell
Install-Module -Name Nebula.Automations -Scope AllUsers
```

When no Scope is defined, the default is set based on the PowerShellGet version.
:::info
In PowerShellGet 1.x versions, the default is `AllUsers`, which requires elevation for install.  
For PowerShellGet versions 2.0.0 and above in PowerShell 6 or higher:
 - The default is CurrentUser, which doesn't require elevation for install.
 - If you are running in an elevated session, the default is `AllUsers`.

I recommend forcing the installation for `AllUsers` so that the entire system can call the module's functions, regardless of where the script to be executed is located. Needless to say, the final assessment is up to you, and the module also works in a user context (the user who will install the module, of course).
:::

## Update module

The same rules mentioned in the previous paragraph apply. You can therefore also associate the `Scope` parameter with the Update command.

```powershell
Update-Module -Name Nebula.Automations
```

## Cleaning of previous installations (optional)

The most up-to-date version of the module installed on your system will always be the one that PowerShell will prefer when you launch an `Import-Module` or call one of the Nebula.Automations functions.  
In any case, if you want, you can always perform a complete cleanup of the installed versions and get the latest one (from PowerShell Gallery).

```powershell
Uninstall-Module -Name Nebula.Automations -AllVersions -Force
Install-Module -Name Nebula.Automations -Scope CurrentUser -Force
```
