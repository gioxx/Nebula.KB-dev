---
sidebar_position: 1
title: "Getting started"
description: Modernize your M365/Exchange admin workflows with Nebula.Core.
hide_title: true
id: intro
tags:
  - Getting started
  - Nebula.Core
---

<img
  src="/img/Nebula.Core.png"
  alt="Nebula.Core"
  className="nebula-doc-icon"
  style={{ float: "right", maxWidth: "140px", marginLeft: "1rem" }}
/>

# Getting started

**Nebula.Core** is a PowerShell module that wraps common Microsoft 365 and Exchange Online admin tasks with safer defaults, clear logging, and CSV-friendly outputs. Use it to connect, inspect, export, and remediate faster.

## What's included
- Connections: `Connect-Nebula`, `Connect-EOL`, `Disconnect-Nebula` (with health checks and optional Graph).
- Configuration: `Get-NebulaConfig`, `Sync-NebulaConfig`.
- Mailboxes: aliases, permissions, quotas, language, shared mailbox setup, sent-items copy.
- Groups: export distribution/dynamic/M365 groups, role groups, and memberships.
- Licenses: Graph-backed SKU catalog and user/license exports.
- Quarantine: search, export EML, release/delete in bulk.
- Statistics: mailbox size/quota exports (CSV or object mode).
- Utilities: clipboard helpers for message IDs and e-mails (`mids`, `fse`).

:::tip
Every function exposes built-in help. Use `Get-Help <FunctionName> -Detailed` or `-Examples` for notes, parameters, and prerequisites.
:::

## Requirements
- PowerShell 5.1+ (or 7+ recommended).
- Exchange Online Management module for EXO features.
- Microsoft Graph PowerShell SDK for Graph-backed commands (licenses, M365 groups, etc.).
- Proper tenant permissions for the actions you run.

# How to download Nebula.Core

Nebula.Core is available on the PowerShell Gallery.  
Its GitHub repository is available at [github.com/gioxx/Nebula.Core](https://github.com/gioxx/Nebula.Core).

## Installation from PowerShell Gallery
This is definitely the recommended option and is currently the simplest, provided your machine has internet connectivity and the ability to download files from Microsoft's PowerShell Gallery ([powershellgallery.com](https://www.powershellgallery.com/)).

The CurrentUser installs modules in a location that's accessible only to the current user of the computer (for example: ```$HOME\Documents\PowerShell\Modules```):

```powershell
Install-Module -Name Nebula.Core -Scope CurrentUser
```

The `AllUsers` scope installs modules in a location that's accessible to all users of the computer (```$env:ProgramFiles\PowerShell\Modules```):

```powershell
Install-Module -Name Nebula.Core -Scope AllUsers
```

When no Scope is defined, the default is set based on the PowerShellGet version.
:::info
In PowerShellGet 1.x versions, the default is `AllUsers`, which requires elevation for install.  
For PowerShellGet versions 2.0.0 and above in PowerShell 6 or higher:
 - The default is CurrentUser, which doesn't require elevation for install.
 - If you are running in an elevated session, the default is `AllUsers`.

I recommend forcing the installation for `AllUsers` so that the entire system can call the module's functions, regardless of where the script to be executed is located. Needless to say, the final assessment is up to you, and the module also works in a user context (the user who will install the module, of course).
:::

If Graph/EXO modules are missing, some commands can auto-install them when `-AutoInstall` is available.

## Update module

The same rules mentioned in the previous paragraph apply. You can therefore also associate the `Scope` parameter with the Update command.

```powershell
Update-Module -Name Nebula.Core
```

## Cleaning of previous installations (optional)

The most up-to-date version of the module installed on your system will always be the one that PowerShell will prefer when you launch an `Import-Module` or call one of the Nebula.Core functions.  
In any case, if you want, you can always perform a complete cleanup of the installed versions and get the latest one (from PowerShell Gallery).

```powershell
Uninstall-Module -Name Nebula.Core -AllVersions -Force
Install-Module -Name Nebula.Core -Scope CurrentUser -Force
```
