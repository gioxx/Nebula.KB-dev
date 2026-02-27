---
sidebar_position: 5
title: "More examples"
description: Practical recipes that show common ways to use Nebula.Tools.
hide_title: true
id: more-examples
tags:
  - Examples
  - Nebula.Tools
  - Tools
---

# More examples

Practical recipes that show common ways to use Nebula.Tools.

## Convert CSV delimiters in bulk

```powershell
Get-ChildItem 'C:\Exports' -Filter *.csv |
  ForEach-Object {
    Update-CSVDelimiter -FilePath $_.FullName -ToComma
  }
```

## Discover updates with previews only

```powershell
Find-ModulesUpdates -Scope User -Provider Auto |
  Sort-Object Name |
  Format-Table Name, InstalledVersion, LatestVersion, Scope
```

## Export AD expirations to CSV

```powershell
Find-ADAccountExpirations -TargetDate "2027-01-01" -ExportCsv -ExportPath 'C:\Reports'
```

## Generate multiple passwords and copy them

```powershell
New-RandomPassword -Count 5 -PasswordLength 16 -Clipboard
```

## Keep PowerShell 7 current

```powershell
Update-PS7   # launches the official MSI-based installer
```

## Remove old versions for one module

```powershell
Remove-OldModuleVersions -Name 'Az' -Keep 1 -WhatIf
```

## Update modules and clean superseded versions

```powershell
Update-Modules -Scope User -Provider Auto -CleanupOld
```
