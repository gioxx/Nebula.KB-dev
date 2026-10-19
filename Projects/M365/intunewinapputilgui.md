---
id: intunewinapputilgui
title: IntuneWinAppUtil GUI
description: WPF/PowerShell GUI wrapper around Microsoft's IntuneWinAppUtil.exe for packaging Win32 apps, with PSAppDeployToolkit/MSI auto-detection, FileVersion and Intune detection-rule helpers.
sidebar_position: 1
tags:
  - Projects
  - Intune
  - Win32 apps
  - Packaging
  - PSAppDeployToolkit
---

# IntuneWinAppUtil GUI

PowerShell module with a WPF front-end that wraps Microsoft's `IntuneWinAppUtil.exe` (the [Microsoft Win32 Content Prep Tool](https://github.com/microsoft/Microsoft-Win32-Content-Prep-Tool)), making it quicker and less error-prone to package Win32 apps for Intune. It is built with WPF (XAML) and PowerShell only, with no external dependencies.

Besides filling in the `-c`, `-s` and `-o` switches for you, the GUI downloads and caches the prep tool, recognises PSAppDeployToolkit and MSI packages to propose the setup file and package name, warns about paths that are too long, renames the generated `.intunewin` file and remembers your settings. The module also ships a FileVersion helper and a ready-to-adapt Intune detection script.

![IntuneWinAppUtil GUI main window](https://raw.githubusercontent.com/gioxx/IntuneWinAppUtilGUI/main/Assets/screenshot.png)

:::tip What's new in 1.1.0
- The **Setup File** field accepts any file type, not only EXE and MSI: PowerShell (`.ps1`), `.bat` and `.cmd` scripts, MSIX packages and so on. See [Packaging scripts and other file types](#packaging-scripts-and-other-file-types).
- Typing in the **Source Folder** field no longer lags: the folder scan used for auto-detection now waits until you stop typing and runs in the background.
:::

## Demo and repository
- Source code: [github.com/gioxx/IntuneWinAppUtilGUI](https://github.com/gioxx/IntuneWinAppUtilGUI)
- PowerShell Gallery: [IntuneWinAppUtilGUI](https://www.powershellgallery.com/packages/IntuneWinAppUtilGUI)
- Releases and changelog: [github.com/gioxx/IntuneWinAppUtilGUI/releases](https://github.com/gioxx/IntuneWinAppUtilGUI/releases)

## Key features
- GUI for all the switches `IntuneWinAppUtil.exe` needs (`-c`, `-s`, `-o`), with browse dialogs.
- Any file can be the setup file: EXE, MSI, PowerShell/batch scripts, MSIX and more, with a reminder when the Intune install command needs to match a non-EXE/MSI file.
- Auto-download and local cache of `IntuneWinAppUtil.exe`, with a **Force download** button to refresh it and the detected tool version shown in the window.
- PSAppDeployToolkit detection: proposes `Invoke-AppDeployToolkit.exe` as setup file and builds the package name from `AppName`/`AppVersion`, falling back to the MSI `ProductName`/`ProductVersion`.
- Optional final filename, with invalid characters removed and a collision-safe rename (`_1`, `_2`, ...) so existing packages are never overwritten.
- Live path-length indicators for the Source and Output folders, plus a check of the longest file path in the source before packaging.
- Output folder created automatically if it does not exist; when packaging completes, the GUI offers to open the folder with the new package selected.
- Settings saved in `%APPDATA%\IntuneWinAppUtilGUI\config.json`.
- Non-blocking update check against the PowerShell Gallery, shown as a banner.
- `Get-IntuneFileVersion` command to read the FileVersion used by Intune detection rules.
- Ready-to-adapt Intune detection script, `Scripts/Intune_CheckAppInstallation.ps1`.

## Requirements
- Windows 10 or later (Windows 11 recommended).
- PowerShell 7 recommended; Windows PowerShell 5.1 is the minimum declared by the module manifest.
- .NET Framework 4.7.2 or later (usually already present on supported systems).
- Internet access to GitHub only if you let the GUI download `IntuneWinAppUtil.exe`, and to the PowerShell Gallery for the update check.

## Installation
### PowerShell Gallery (recommended)
```powershell
Install-Module IntuneWinAppUtilGUI -Scope CurrentUser
Show-IntuneWinAppUtilGUI
```

Update to the latest release, or remove the module:
```powershell
Update-Module IntuneWinAppUtilGUI
Uninstall-Module IntuneWinAppUtilGUI
```

### From the repository (clone or ZIP)
```powershell
Import-Module "C:\IntuneWinAppUtilGUI\IntuneWinAppUtilGUI.psd1"
Show-IntuneWinAppUtilGUI
```
To keep it available in every session, copy the folder into one of the paths listed in `$env:PSModulePath` (for example `Documents\PowerShell\Modules\IntuneWinAppUtilGUI` for PowerShell 7).

## Launching the GUI
```powershell
Show-IntuneWinAppUtilGUI
```

WPF needs a single-threaded apartment (STA). If the current session is not STA, the command starts a new `pwsh` (or `powershell`, under Windows PowerShell) process with `-STA` and launches the GUI there, passing along any switch you used.

| Switch | What it does |
| --- | --- |
| `-ShowVersion` | Shows the installed module version and the latest version on the PowerShell Gallery in the header banner. Works even when the update check is disabled in the configuration. |
| `-ForceUpdateBanner` | Shows a test "update available" banner, useful to check how the notification looks. |
| `-Diag` | Writes diagnostics (handles, GDI handles, working set) when the GUI starts and after it closes. |
| `-Verbose`, `-Debug` | Standard PowerShell switches; preserved when the GUI relaunches itself in STA mode. |

The **Help** link at the bottom of the window shows the same switches and the keyboard shortcuts.

## The window at a glance
The window has two sections, **Package source** and **Tool and output**, followed by the Run, Clear and Exit buttons. Fields marked with `*` are required.

| Field | Required | Notes |
| --- | :---: | --- |
| Source Folder (`-c`) | Yes | Root folder with everything that goes into the package. A path-length counter appears under the field. Typing or pasting a path starts the PSADT/MSI auto-detection. |
| Setup File (`-s`) | Yes | The file Intune will run: EXE, MSI or any other file type. Shown relative to the source folder when it lives inside it, otherwise as a full path. |
| Output Folder (`-o`) | Yes | Where the `.intunewin` file is written. Created automatically if missing. Has its own path-length counter. |
| IntuneWinAppUtil Path | No | Path to `IntuneWinAppUtil.exe`. Leave it empty and the GUI uses its cached copy, or downloads the latest one. The detected tool version is shown under the field, with a link to the [version history](https://github.com/gioxx/IntuneWinAppUtilGUI/blob/main/Tools/IntuneWinAppUtilVersions.md). |
| Final filename | No | Name of the generated package. If empty, the package is named after the source folder. A trailing `.intunewin` is optional; invalid filename characters are removed. |

Buttons:
- **Run**: validates the fields and starts packaging (also with `Enter`).
- **Clear**: empties Source Folder, Setup File, Output Folder and Final filename; the tool path is kept.
- **Exit (ESC)**: closes the window. Pressing `Esc` asks for confirmation first, because the field values are not kept (only the tool path is saved).
- **Force download**: downloads the latest `IntuneWinAppUtil.exe` again, replacing the cached copy (asks for confirmation).

## Packaging step by step
1. Pick the **Source Folder**. If it contains a PSAppDeployToolkit package or an MSI, the Setup File and Final filename are filled in for you (see [Auto-detection](#auto-detection-psappdeploytoolkit-and-msi)).
2. Check or choose the **Setup File**. If you browse to a file before setting the source folder, the GUI uses the file's folder as source folder. The same happens if you type or paste a full path in Setup File while Source Folder is empty: when you leave the field, the path is split into folder and file name.
3. Choose the **Output Folder**.
4. Optionally set a **Final filename** and a specific **IntuneWinAppUtil Path**.
5. Click **Run** or press `Enter`.

When you click Run, the GUI:
1. checks that the source folder exists and that the setup file exists, either as a full path or relative to the source folder;
2. creates the output folder if needed;
3. checks path lengths against the 260-character Windows limit: the source folder, the output folder and the longest file path inside the source. If any of them is too long, it lists them, shows the longest path, and asks whether to continue anyway;
4. resolves `IntuneWinAppUtil.exe` (field value, then cached copy, then a fresh download);
5. runs `IntuneWinAppUtil.exe -c "<source>" -s "<setup>" -o "<output>"` in its own console window and waits for it to finish;
6. renames the generated file (by default `<setup file name>.intunewin`) to the final filename, or to the source folder name. If a file with that name already exists, `_1`, `_2` and so on are appended instead of overwriting it;
7. reports the final file name and offers to open the output folder with the package selected.

## Packaging scripts and other file types
Since version 1.1.0 the Setup File can be any file. The browse dialog offers three filters: **Executable or MSI** (default), **Script files** (`*.ps1`, `*.bat`, `*.cmd`) and **All files**.

When the setup file is not an EXE or MSI (or has no extension), a note appears under the field: Intune does not run the file by itself, so the **install command** you set in the Intune app must start it. For example, for a PowerShell script:

```text
%SystemRoot%\Sysnative\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -NoProfile -File .\Install.ps1
```

`Sysnative` makes the Intune Management Extension (a 32-bit process) start the 64-bit PowerShell. Batch files can be started with `cmd.exe /c Install.cmd`.

:::note
`IntuneWinAppUtil.exe` packages the whole source folder anyway. The setup file only tells the tool which file to record as the setup file in the package metadata, which is also the name the `.intunewin` file gets before it is renamed.
:::

## Auto-detection (PSAppDeployToolkit and MSI)
When the Source Folder changes, the GUI scans it (including subfolders) and proposes values for Setup File and Final filename. The scan starts once you stop typing and runs in the background, so large or network folders do not freeze the window. If you edit Setup File or Final filename while a scan is running, the scan is discarded and your values are kept.

Rules:
- If Setup File already points to an existing file (full path or relative to the source folder), nothing is proposed.
- Setup File: the first `Invoke-AppDeployToolkit.exe` found (PSAppDeployToolkit 4.x). If there is none, the first `.msi` found, preferring files under a `Files` folder.
- Final filename, proposed only when the field is empty:
  - for PSADT, `AppName` and `AppVersion` are read from `Invoke-AppDeployToolkit.ps1` in the same folder (forms such as `AppName = '...'` inside the `$adtSession` hashtable are recognised);
  - if `AppName` is missing, `ProductName` and `ProductVersion` are read from the MSI;
  - the result is `AppName_AppVersion`, or only `AppName` when the version is missing. Spaces are removed and characters not allowed in file names are replaced with `-`.

Example: a PSADT package with `AppName = 'Contoso Agent'` and `AppVersion = '4.2.0'` produces the setup file `Invoke-AppDeployToolkit.exe` and the final filename `ContosoAgent_4.2.0`, so the package becomes `ContosoAgent_4.2.0.intunewin`.

## IntuneWinAppUtil.exe: download and cache
When packaging, the tool is taken from:
1. the **IntuneWinAppUtil Path** field, if it points to an existing file;
2. otherwise the cached copy in `%APPDATA%\IntuneWinAppUtilGUI\bin\IntuneWinAppUtil.exe`;
3. otherwise a fresh download, saved to the cache.

The download takes the current `master` branch of [microsoft/Microsoft-Win32-Content-Prep-Tool](https://github.com/microsoft/Microsoft-Win32-Content-Prep-Tool) as a ZIP archive over TLS 1.2, extracts `IntuneWinAppUtil.exe` and removes the temporary files. Use **Force download** to replace the cached copy with the current one, for example after Microsoft publishes a new release.

The FileVersion shown under the field tells you which release you have; the [version history table](https://github.com/gioxx/IntuneWinAppUtilGUI/blob/main/Tools/IntuneWinAppUtilVersions.md) maps FileVersions to upstream releases and is refreshed weekly by a GitHub Actions workflow.

## Configuration file
Settings are stored in `%APPDATA%\IntuneWinAppUtilGUI\config.json` and written when the window closes:

```json
{
  "ToolPath": "C:\\Users\\alice\\AppData\\Roaming\\IntuneWinAppUtilGUI\\bin\\IntuneWinAppUtil.exe",
  "UpdateCheckEnabled": true
}
```

| Key | Meaning |
| --- | --- |
| `ToolPath` | Path loaded into the IntuneWinAppUtil Path field at startup, if the file still exists. |
| `UpdateCheckEnabled` | `true` (default) checks the PowerShell Gallery for a newer module version at startup. Set it to `false` to turn the check off, for example on machines without internet access. |

Field values other than the tool path are not saved.

## Update check
At startup the GUI asks the PowerShell Gallery for the latest version of the module, in the background and with a 10-second timeout, so the window opens straight away. It uses `Find-Module` and falls back to the Gallery API if needed. When a newer version exists, a banner suggests running:

```powershell
Update-Module IntuneWinAppUtilGUI
```

If the Gallery cannot be reached, nothing is shown. Use `-ShowVersion` to see both versions and the error, if any.

## Keyboard shortcuts
| Key | Action |
| --- | --- |
| `Enter` | Run packaging. |
| `Esc` | Close the window, after confirmation. |

## Get-IntuneFileVersion
Command-line helper that returns the `FileVersion` of a file, the value used by Intune file-based detection rules (**File or folder** rule, **Detection method: String (version)**):

```powershell
Get-IntuneFileVersion -Path 'C:\Program Files\Contoso\Agent\ContosoAgent.exe'
# 4.2.0.118
```

- Returns only the FileVersion string. It works on any file that carries version information (EXE, DLL, ...); for files without it the result is empty.
- Throws if the path does not exist or is a folder.
- `-Path` is positional, so `Get-IntuneFileVersion .\ContosoAgent.exe` works too.

Read the version from the installed file on a reference machine, not from the installer, because the two often differ.

## Intune detection script
[`Scripts/Intune_CheckAppInstallation.ps1`](https://github.com/gioxx/IntuneWinAppUtilGUI/blob/main/Scripts/Intune_CheckAppInstallation.ps1) is a starting point for a **custom detection script** in a Win32 app. It looks for an executable under both `%ProgramFiles%` and `%ProgramFiles(x86)%` and, optionally, checks a minimum version.

1. Download the script and set `$searchPath` to the executable path relative to Program Files:
   ```powershell
   $searchPath = "Contoso\Agent\ContosoAgent.exe"
   ```
2. Near the end of the script, decide whether a minimum version is required:
   ```powershell
   $status = Get-AppStatus -MinimumVersion "4.2.0.0"   # installed and at least 4.2.0.0
   $status = Get-AppStatus                             # installed, any version
   ```
3. In the Intune app, under **Detection rules**, choose **Use a custom detection script**, upload the script and set **Run script as 32-bit process on 64-bit clients** to **No**.

How it behaves:
- It reads `FileVersion`, or `ProductVersion` when FileVersion is empty.
- Versions are normalised before comparing: non-numeric characters are dropped and only the first four parts are kept, so `R25.1.164.0.0` becomes `25.1.164.0`.
- Exit code `0` with a message on standard output when the app is found and meets the minimum version; exit code `1` when it is missing or older. Intune treats the app as installed only with exit code `0` **and** some output.
- The message (`App detected. Version: ...`, `App detected but version below minimum requirement`, `App NOT detected.`) is written to the Intune Management Extension log, which helps when troubleshooting.

## Troubleshooting
| Symptom | What to check |
| --- | --- |
| `Setup file not found.` | The setup file must exist as a full path or relative to the source folder. Clear the field and browse to it again. |
| Path length warning before packaging | A file inside the source folder (shown as "Longest path") or one of the folders is longer than 260 characters. Move the source closer to the drive root or shorten folder names; `IntuneWinAppUtil.exe` can fail with long paths. |
| `IntuneWinAppUtil exited with code N.` | Read the output in the console window opened by the tool. Common causes: files locked by other processes and paths that are too long. |
| `Output file not found` | The tool finished but the expected `<setup file name>.intunewin` did not appear in the output folder within 10 seconds. Check the output folder and the tool's console output. |
| `Renaming failed` | The package was created but could not be renamed, usually because antivirus or indexing still holds the file. The original `.intunewin` stays in the output folder; rename it by hand. |
| `Download failed` or `IntuneWinAppUtil.exe not found and could not be initialized.` | GitHub is not reachable (proxy, firewall). Download the tool manually and set its path in **IntuneWinAppUtil Path**. |
| No update banner | The update check may be disabled in `config.json` or the Gallery may be unreachable. Run `Show-IntuneWinAppUtilGUI -ShowVersion` to see the result. |

## Repository structure
```text
IntuneWinAppUtilGUI/
|- IntuneWinAppUtilGUI.psd1 / .psm1          # Module manifest and loader
|- Public/Show-IntuneWinAppUtilGui.ps1       # GUI entry point (Show-IntuneWinAppUtilGUI)
|- Public/Get-IntuneFileVersion.ps1          # FileVersion helper
|- Private/IWAPG-Hlp-Setup.ps1               # PSADT/MSI auto-detection, relative paths
|- Private/IWAPG-Hlp-Tool.ps1                # Tool download, cache and version
|- Private/IWAPG-Hlp-PathLength.ps1          # Path-length checks
|- Private/IWAPG-Hlp-UpdateCheck.ps1         # PowerShell Gallery version check
|- UI/UI.xaml                                # WPF window
|- Assets/                                   # Icons and screenshot
|- Scripts/Intune_CheckAppInstallation.ps1   # Detection script template
|- Tools/                                    # Upstream version table and maintenance scripts
|- Tests/                                    # Pester tests
`- README.md, LICENSE
```

Tests use [Pester](https://pester.dev/) and run on GitHub Actions for pushes to `main` and for pull requests. To run them locally:
```powershell
Invoke-Pester -Path .\Tests
```

## Contributions
Issues and pull requests are welcome on [GitHub](https://github.com/gioxx/IntuneWinAppUtilGUI/issues).

## License
MIT License. See `LICENSE` in the repository.
