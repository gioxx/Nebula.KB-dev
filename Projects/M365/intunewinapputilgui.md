---
id: intunewinapputilgui
title: IntuneWinAppUtil GUI
description: WPF/PowerShell GUI wrapper around Microsoft's IntuneWinAppUtil.exe for packaging Win32 apps, plus FileVersion and Intune detection-rule helpers.
sidebar_position: 1
tags:
  - Projects
  - Intune
  - Win32 apps
  - Packaging
---

# IntuneWinAppUtil GUI

PowerShell module with a WPF front-end that wraps Microsoft's `IntuneWinAppUtil.exe`, making it quicker to package Win32 apps for Intune. Built with WPF (XAML) and PowerShell only — no external dependencies. Includes validation, auto-download of the prep tool, path-length checks, configuration persistence, a FileVersion helper, and a ready-to-adapt Intune detection script.

## Demo and repository
- Source code: [github.com/gioxx/IntuneWinAppUtilGUI](https://github.com/gioxx/IntuneWinAppUtilGUI)
- PowerShell Gallery package: `IntuneWinAppUtilGUI`

## Key features
- GUI over all required switches (`-c`, `-s`, `-o`) with browse dialogs.
- Auto-download and cache of the latest `IntuneWinAppUtil.exe` from Microsoft's GitHub release.
- Remembers tool path in `%APPDATA%\IntuneWinAppUtilGUI\config.json`; optional update-check banner.
- Detects PSAppDeployToolkit usage and proposes setup file/output names, including MSI-backed packages; sanitizes invalid filename characters.
- Live path-length indicators for Source/Output folders, plus a final MAX_PATH check at Run time.
- Windows-version-safe UI labels (no emoji glyphs) in the WPF interface.
- In-app **Help** dialog covering command-line switches and keyboard shortcuts.
- Command-line helper (`Get-IntuneFileVersion`) for reading the FileVersion used in Intune detection rules.
- Ready-to-adapt Intune Win32 app detection script (`Scripts/Intune_CheckAppInstallation.ps1`).
- Optional flags: `-ShowVersion` to display installed/latest module versions, `-ForceUpdateBanner` for testing, `-Diag` for startup/shutdown diagnostics (handles, GDI handles, memory).

## Requirements
- Windows 10 or later (Windows 11 recommended).
- PowerShell 5.1+ (7 recommended).
- .NET Framework 4.7.2+ (usually already present on supported systems).

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
| Source Folder (`-c`) | ✅ | Root folder containing the setup file. |
| Setup File (`-s`) | ✅ | EXE or MSI; auto-suggested when possible, including MSI-backed PSAppDeployToolkit packages. If in the same folder, only the filename is shown. |
| Output Folder (`-o`) | ✅ | Target `.intunewin` location. |
| IntuneWinAppUtil | ✅\* | Path to the tool, or let the GUI download it automatically. |
| Final Filename | Optional | Renames the generated `.intunewin`; invalid characters stripped automatically. |

\* Optional only until the GUI downloads the tool.

## Configuration
- Stored at `%APPDATA%\IntuneWinAppUtilGUI\config.json`.
- Keeps `ToolPath` so it's reused at next launch, plus an optional `UpdateCheckEnabled` boolean to enable/disable the update-check banner.
- Updated on GUI close.

## Auto-download behavior
If no tool path is set, the GUI automatically downloads and extracts the latest release of Microsoft's [Win32 Content Prep Tool](https://github.com/microsoft/Microsoft-Win32-Content-Prep-Tool/releases/latest) and stores it under `%APPDATA%\IntuneWinAppUtilGUI\bin`. Trigger a fresh download at any time with the **Force download** button.

## Get-IntuneFileVersion
Command-line helper that returns the `FileVersion` of an executable — the value commonly used in Intune detection rules:
```powershell
Get-IntuneFileVersion -Path 'C:\Program Files\MyApp\MyApp.exe'
```
Returns only the FileVersion string (e.g. `1.2.3.4`). Raises an error if the path does not exist or points to a directory.

## Intune detection script
[`Scripts/Intune_CheckAppInstallation.ps1`](https://github.com/gioxx/IntuneWinAppUtilGUI/blob/main/Scripts/Intune_CheckAppInstallation.ps1) is a starting point for a custom Win32 app detection rule. It checks both 64-bit and 32-bit `Program Files` locations and returns:
- exit code `0` when the executable is found and (if configured) meets the minimum version;
- exit code `1` when the executable is missing or below the required minimum version.

Edit `$searchPath` to the relative path of the target executable:
```powershell
$searchPath = "Vendor\Application\application.exe"
```
Pass a minimum version to `Get-AppStatus` to enforce it, or omit it to detect the file regardless of version:
```powershell
$status = Get-AppStatus -MinimumVersion "1.2.3.4"
```
The script writes a concise status message to standard output, useful when reviewing Intune Management Extension logs.

## Repository structure
```text
IntuneWinAppUtilGUI/
|- IntuneWinAppUtilGUI.psm1/.psd1
|- Public/Show-IntuneWinAppUtilGui.ps1     # Show-IntuneWinAppUtilGUI entry point
|- Public/Get-IntuneFileVersion.ps1        # FileVersion helper
|- Private/                                # Setup, tool download, path-length, update-check helpers
|- UI/UI.xaml
|- Scripts/Intune_CheckAppInstallation.ps1 # Detection-rule template
|- Tools/IntuneWinAppUtilVersions.md       # Reference table of upstream releases
|- Tests/                                  # Pester tests
|- README.md
`- LICENSE
```

## Operational notes
- Use the in-app **Help** button to review switches/shortcuts; `ESC` closes the window (after confirmation); `ENTER` runs packaging.
- A small tooltip at the bottom of the GUI provides quick usage hints; Clear and Exit buttons reset inputs or close the app manually.
- `Show-IntuneWinAppUtilGUI -ShowVersion` prints installed/latest module versions in the header banner.
- `Show-IntuneWinAppUtilGUI -ForceUpdateBanner` simulates the update banner for testing.
- `Show-IntuneWinAppUtilGUI -Diag` writes startup/shutdown diagnostics (handles, GDI handles, memory usage).
- `-Verbose`/`-Debug` are preserved when the GUI relaunches itself in STA mode.
- Module version in repo: **1.0.9**. UI title reflects the module version (see `UI/UI.xaml`).
- Reference table of upstream IntuneWinAppUtil releases: `Tools/IntuneWinAppUtilVersions.md`.
- UI no longer uses emoji glyphs (Windows-version-safe labels instead), so the old Windows 10 emoji-rendering caveat no longer applies.

## Contributions
Pull requests and issues are welcome — open a discussion or PR with your improvement idea.

## License
MIT License. See `LICENSE` in the repo.
