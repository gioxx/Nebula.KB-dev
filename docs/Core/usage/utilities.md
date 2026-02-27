---
sidebar_position: 11
title: "Utilities"
description: Clipboard helpers for quarantine identities and e-mail address lists.
hide_title: true
id: utilities
tags:
  - Format-MessageIDsFromClipboard
  - Format-SortedEmailsFromClipboard
  - Get-NebulaModuleUpdates
  - Nebula.Core
  - Tools
---

# Utilities

For full details and examples, run `Get-Help Format-MessageIDsFromClipboard -Detailed` or `Get-Help Format-SortedEmailsFromClipboard -Detailed`.

## Format-MessageIDsFromClipboard

:::note
The function name is `Format-MessageIDsFromClipboard`. The legacy alias `mids` remains available for backward compatibility.
:::

Reads quarantine identities (one per line) from the clipboard, deduplicates them, copies a quoted/comma-separated list back to the clipboard, and can release the messages immediately using `Unlock-QuarantineMessageId -Identity`.

**Syntax**

```powershell
Format-MessageIDsFromClipboard [-NoRelease] [-PassThru]
```

| Parameter | Description | Default |
| --- | --- | --- |
| `NoRelease` | Skip automatic release of the identities. | `False` |
| `PassThru` | Emit the formatted string to the pipeline. | `False` |

**Example**
```powershell
# Format and release immediately (by Identity)
Format-MessageIDsFromClipboard
```

```powershell
# Format only, keep the list in the clipboard and show it
Format-MessageIDsFromClipboard -NoRelease -PassThru
```

:::tip
`Format-MessageIDsFromClipboard` (`mids`) prepares quarantine identities and can trigger `Unlock-QuarantineMessageId -Identity` directly from clipboard content.
:::

## Format-SortedEmailsFromClipboard

:::note
The function name is `Format-SortedEmailsFromClipboard`. The legacy alias `fse` remains available for backward compatibility.
:::

Extracts e-mail addresses from clipboard text, deduplicates and sorts them, then copies a quoted/comma-separated list back to the clipboard.

**Syntax**

```powershell
Format-SortedEmailsFromClipboard [-PassThru]
```

| Parameter | Description | Default |
| --- | --- | --- |
| `PassThru` | Emit the formatted string to the pipeline. | `False` |

**Example**
```powershell
Format-SortedEmailsFromClipboard -PassThru
```

## Get-NebulaModuleUpdates

Checks PowerShell Gallery for updates of installed `Nebula.*` modules plus the meta modules `ExchangeOnlineManagement` and `Microsoft.Graph`, and reports only the modules that have newer versions available.

**Syntax**

```powershell
Get-NebulaModuleUpdates
```

This command always forces a fresh check. The automatic check in `Connect-Nebula` can be disabled with
`CheckUpdatesOnConnect = $false`, and throttled via `CheckUpdatesIntervalHours` (default `24`) in `settings.psd1`.
After edits, run `Sync-NebulaConfig`.

:::tip
The same details above are also published in the Nebula.Core [configuration](./configuration) section.
:::
