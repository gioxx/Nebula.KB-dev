---
sidebar_position: 1
title: "Getting started"
description: Quickly and easily call everyday tools with PowerShell commands.
hide_title: true
id: intro
tags:
  - Getting started
  - Nebula.Tools
---

<img
  src="/img/Nebula.Tools.png"
  alt="Nebula.Tools"
  className="nebula-doc-icon"
  style={{ float: "right", maxWidth: "140px", marginLeft: "1rem" }}
/>

# Getting started

**Nebula.Tools** is a PowerShell module that bundles small, reliable helpers for everyday administration tasks. It targets Windows PowerShell 5.1 and PowerShell 7+, and is published on the PowerShell Gallery.

## What's included

- Audit, update, and clean up PowerShell modules using either PSResourceGet or PowerShellGet.
- Find AD accounts with expiration dates and optionally extend them.
- Generate strong passwords quickly, with clipboard support when you need to paste them elsewhere.
- Keep PowerShell 7 up to date with a single command (`Update-PS7`).
- Rewrite CSV delimiters in bulk while preserving encoding.

:::tip
Every function exposes built-in help. Use `Get-Help <FunctionName> -Detailed` or `-Examples` for notes, parameters, and prerequisites.
:::

## Requirements
- PowerShell 5.1+ (or 7+ recommended).

# How to download Nebula.Tools

Nebula.Tools is available on the PowerShell Gallery.  
Its GitHub repository is available at [github.com/gioxx/Nebula.Tools](https://github.com/gioxx/Nebula.Tools).

## Installation from PowerShell Gallery
This is definitely the recommended option and is currently the simplest, provided your machine has internet connectivity and the ability to download files from Microsoft's PowerShell Gallery ([powershellgallery.com](https://www.powershellgallery.com/)).

The CurrentUser installs modules in a location that's accessible only to the current user of the computer (for example: ```$HOME\Documents\PowerShell\Modules```):

```powershell
Install-Module -Name Nebula.Tools -Scope CurrentUser
```

The `AllUsers` scope installs modules in a location that's accessible to all users of the computer (```$env:ProgramFiles\PowerShell\Modules```):

```powershell
Install-Module -Name Nebula.Tools -Scope AllUsers
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
Update-Module -Name Nebula.Tools
```

## Cleaning of previous installations (optional)

The most up-to-date version of the module installed on your system will always be the one that PowerShell will prefer when you launch an `Import-Module` or call one of the Nebula.Tools functions.  
In any case, if you want, you can always perform a complete cleanup of the installed versions and get the latest one (from PowerShell Gallery).

```powershell
Uninstall-Module -Name Nebula.Tools -AllVersions -Force
Install-Module -Name Nebula.Tools -Scope CurrentUser -Force
```
