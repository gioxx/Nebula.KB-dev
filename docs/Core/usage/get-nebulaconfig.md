---
sidebar_position: 1
title: 'Configuration'
description: Inspect or reload Nebula.Core configuration without re-importing the module.
hide_title: true
id: configuration
tags:
  - Get-NebulaConfig
  - Sync-NebulaConfig
  - Nebula.Core
---

# Configuration helpers

## Get-NebulaConfig
Shows effective configuration, including machine/user config files and license catalog sources.

**Syntax**

```powershell
Get-NebulaConfig
```

- No parameters.
- Outputs summary plus tables (active config and license sources).
- For more details or examples, run `Get-Help Get-NebulaConfig -Detailed`.

**Output example**
```powershell
PS C:\Users\john.doe\Downloads> Get-NebulaConfig

ModuleRoot          : C:\Users\john.doe\Documents\GitHub\Nebula.Core
UserConfigPath      : C:\Users\john.doe\.NebulaCore\settings.psd1
UserConfigExists    : True
UserConfigLoaded    : True
MachineConfigPath   : C:\ProgramData\Nebula.Core\settings.psd1
MachineConfigExists : False
MachineConfigLoaded : False

Key                   Value
---                   -----
CSV_DefaultLimiter    ;
CSV_Encoding          ISO-8859-15
CheckUpdatesOnConnect True
CheckUpdatesIntervalHours 24
DateTimeString_CSV    yyyyMMdd
DateTimeString_Full   dd/MM/yyyy HH:mm:ss
LicenseCacheDays      7
LicenseCacheDirectory C:\Users\john.doe\.NebulaCore\Cache
MaxFieldLength        35
UsageLocation         US
UserConfigRoot        C:\Users\john.doe\.NebulaCore

Source  CacheFile                 FileUrl
------  ---------                 -------
Custom  M365_licenses_custom.json https://raw.githubusercontent.com/gioxx/Nebula.Core/main/JSON/M365_licenses_custom.json
Primary M365_licenses.json        https://raw.githubusercontent.com/gioxx/Nebula.Core/main/JSON/M365_licenses.json
```

## Sync-NebulaConfig
Reload Nebula.Core configuration in the current session (machine/user PSD1 and environment overrides).

**Syntax**

```powershell
Sync-NebulaConfig
```

- No parameters.
- For more details or examples, run `Get-Help Sync-NebulaConfig -Detailed`.

## Questions and answers

### Where is configuration loaded from?

`Get-NebulaConfig` shows loaded PSD1 files: `C:\ProgramData\Nebula.Core\settings.psd1` (machine) and `%USERPROFILE%\.NebulaCore\settings.psd1` (user), plus any environment overrides. Use `Sync-NebulaConfig` to reload without re-importing the module.

Below is an example of a `settings.psd1` file that you can save in your user folder (i.e., `%USERPROFILE%\.NebulaCore\settings.psd1`) and that will overwrite the default settings of Nebula.Core:

```powershell
@{
    CSV_DefaultLimiter  = ";"
    CSV_Encoding        = 'ISO-8859-15'
    CheckUpdatesOnConnect = $false
    CheckUpdatesIntervalHours = 24
    DateTimeString_Full = 'dd/MM/yyyy HH:mm:ss'
    UsageLocation       = 'IT'
}
```

### Where is the license catalog stored?

In the cache directory shown in `UserConfigRoot` (typically `%USERPROFILE%\.NebulaCore\Cache`). `Update-LicenseCatalog` refreshes it; `-ForceLicenseCatalogRefresh` redownloads during reports.