---
id: intunewinapputilgui
title: IntuneWinAppUtil GUI
description: WPF/PowerShell GUI wrapper around Microsoft’s IntuneWinAppUtil.exe for packaging Win32 apps.
sidebar_position: 1
tags:
  - Projects
  - Intune
  - Win32 apps
  - Packaging
---

# IntuneWinAppUtil GUI

PowerShell module with a WPF front‑end that wraps Microsoft’s `IntuneWinAppUtil.exe`, making it quicker to package Win32 apps for Intune. Includes validation, auto-download of the prep tool, path-length checks, and configuration persistence.

## Demo and repository
- Source code: [github.com/gioxx/IntuneWinAppUtilGUI](https://github.com/gioxx/IntuneWinAppUtilGUI)
- PowerShell Gallery package: `IntuneWinAppUtilGUI`

## Key features
- GUI over all required switches (`-c`, `-s`, `-o`) with browse dialogs.
- Auto-download and cache of the latest `IntuneWinAppUtil.exe` from Microsoft’s GitHub release.
- Remembers tool path in `%APPDATA%\IntuneWinAppUtilGUI\config.json`; optional update-check banner.
- Detects PSAppDeployToolkit usage and proposes installer/output names; sanitizes invalid filename characters.
- Path-length indicators plus final MAX_PATH validation at run time.
- Optional flags: `-ShowVersion` to display installed/latest module versions, `-ForceUpdateBanner` for testing.

## Requirements
- Windows 10/11.
- PowerShell 5.1+ (7 recommended).
- .NET Framework 4.7.2+.

## Quick start
### PowerShell Gallery (recommended)
```powershell
Install-Module IntuneWinAppUtilGUI -Scope CurrentUser
Show-IntuneWinAppUtilGUI
```

### Local module import (repo/ZIP)
```powershell
Import-Module "C:\IntuneWinAppUtilGUI\IntuneWinAppUtilGUI.psm1"
Show-IntuneWinAppUtilGUI
```
Optionally add the module folder to `$env:PSModulePath` for persistence.

## Fields at a glance
| Field | Required | Notes |
| --- | :---: | --- |
| Source Folder (`-c`) | ✅ | Root containing the installer. |
| Setup File (`-s`) | ✅ | EXE or MSI; auto-suggested when possible. |
| Output Folder (`-o`) | ✅ | Target `.intunewin` location. |
| IntuneWinAppUtil | ✅\* | Path to the tool or let the GUI download it automatically. |
| Final Filename | Optional | Output name; invalid chars stripped. |

\* Optional only until the GUI downloads the tool.

## Configuration
- Stored at `%APPDATA%\IntuneWinAppUtilGUI\config.json`.
- Keeps `ToolPath` and optional `UpdateCheckEnabled` flag.
- Updated on GUI close.

## Auto-download behavior
If no tool path is set, the GUI downloads the latest release of Microsoft’s Win32 Content Prep Tool and stores it under `%APPDATA%\IntuneWinAppUtilGUI\bin`. You can trigger a fresh download with the **Force download** button.

## Repository structure
```text
IntuneWinAppUtilGUI/
|- IntuneWinAppUtilGUI.psm1
|- UI/UI.xaml
|- Tools/IntuneWinAppUtilVersions.md
|- README.md
`- LICENSE
```

## Operational notes
- `ESC` closes the window; `ENTER` runs packaging.
- `Show-IntuneWinAppUtilGUI -ShowVersion` prints installed/latest module versions.
- `Show-IntuneWinAppUtilGUI -ForceUpdateBanner` simulates the update banner.
- Module version in repo: **1.0.7**.
- UI title reflects the module version (see `UI/UI.xaml`).
- Reference table of upstream IntuneWinAppUtil releases: `Tools/IntuneWinAppUtilVersions.md`.
- On Windows 10 or earlier some emojis (✅, 🚀, 🔧) may render as fallback symbols due to font support. Cosmetic only; functionality is unaffected.

## License
MIT License. See `LICENSE` in the repo.
