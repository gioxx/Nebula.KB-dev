---
sidebar_position: 2
title: "Modules"
description: Find, update, and clean up installed PowerShell modules.
hide_title: true
id: modules
tags:
  - Find-ModulesUpdates
  - Modules
  - Nebula.Tools
  - Remove-OldModuleVersions
  - Tools
  - Update-Modules
---

# Modules

For full details and examples, run `Get-Help Find-ModulesUpdates -Detailed`, `Get-Help Remove-OldModuleVersions -Detailed`, or `Get-Help Update-Modules -Detailed`.

## Find-ModulesUpdates

Checks installed modules for available updates using PSResourceGet (v3) or PowerShellGet (v2). Provider selection defaults to PSResourceGet and falls back to PowerShellGet when needed.

**Syntax**

```powershell
Find-ModulesUpdates [-Scope <String>] [-Provider <String>] [-IncludePrerelease]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `IncludePrerelease` | Include prerelease versions. | No | `False` |
| `Provider` | `Auto`, `PSResourceGet`, or `PowerShellGet`. | No | `Auto` |
| `Scope` | Filter by install scope: `User`, `System`, `All`, `Unknown`. | No | `All` |

**Example**
```powershell
Find-ModulesUpdates -Scope User -Provider Auto |
  Sort-Object Name |
  Format-Table Name, InstalledVersion, LatestVersion, Scope
```

## Remove-OldModuleVersions

Removes stale module folders while keeping the most recent releases.

**Syntax**

```powershell
Remove-OldModuleVersions -Name <String> [-Keep <Int>] [-Force] [-WhatIf] [-Confirm]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `Force` | Force removal where supported. | No | `False` |
| `Keep` | How many latest versions to keep. | No | `1` |
| `Name` | Target module name. | Yes | - |

**Example**
```powershell
# Keep the latest version and preview the removal
Remove-OldModuleVersions -Name 'PSAppDeployToolkit' -Keep 1 -WhatIf
```

## Update-Modules

Updates installed modules to the latest available version using the selected provider, with preview and optional cleanup.

**Syntax**

```powershell
Update-Modules [-Scope <String>] [-Provider <String>] [-Name <String[]>] [-CleanupOld] [-IncludePrerelease] [-Preview]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `CleanupOld` | Remove older versions after updating. | No | `False` |
| `IncludePrerelease` | Include prerelease versions. | No | `False` |
| `Name` | Optional module name filter (wildcards allowed). | No | - |
| `Preview` | Show plan only; make no changes. | No | `False` |
| `Provider` | `Auto`, `PSResourceGet`, or `PowerShellGet`. | No | `Auto` |
| `Scope` | Target scope: `User`, `System`, `All`, `Unknown`. | No | `All` |

**Examples**
```powershell
# Dry run only
Update-Modules -Scope User -Provider Auto -IncludePrerelease -Preview

# Install updates and remove older copies
Update-Modules -Scope User -CleanupOld
```

## Questions and answers

### Do I need admin rights to update modules?

Only for system scope. `Update-Modules -Scope User` and `Find-ModulesUpdates` work without elevation; system-scope updates are skipped when not admin.

### How do I clean old versions after an update?

Run `Update-Modules -CleanupOld` or `Remove-OldModuleVersions -Name '<Module>' -Keep 1` for a specific module (add `-WhatIf` for a preview).
