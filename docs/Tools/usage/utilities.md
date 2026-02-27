---
sidebar_position: 4
title: "Utilities"
description: General-purpose helpers like CSV delimiter conversion and PowerShell updates.
hide_title: true
id: utilities
tags:
  - Nebula.Tools
  - Tools
  - Join-ClipboardLines
  - Update-CSVDelimiter
  - Update-PS7
  - Utilities
---

# Utilities

General-purpose helpers for everyday tasks. This page groups small utilities that don't need a dedicated section yet.

For full details and examples, run `Get-Help Join-ClipboardLines -Detailed`, `Get-Help Update-CSVDelimiter -Detailed`, or `Get-Help Update-PS7 -Detailed`.

## Join-ClipboardLines

`Join-ClipboardLines` turns a list of lines from the clipboard into a single PowerShell-ready string.

**Syntax**

```powershell
Join-ClipboardLines [-Separator <String>] [-Quote <String>] [-RemoveDuplicates] [-ShowOutput] [-NoClipboard]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `Separator` | String used between items. | No | `, ` |
| `Quote` | Quote character to wrap each item (empty string disables quoting). | No | `"` |
| `RemoveDuplicates` | Remove duplicate lines before joining. | No | `False` |
| `ShowOutput` | Write the joined string to the pipeline. | No | `False` |
| `NoClipboard` | Do not copy the output back to the clipboard. | No | `False` |

**Examples**
```powershell
# Join lines as a PowerShell-ready string and copy the result back to the clipboard (default)
Join-ClipboardLines

# No quotes, custom separator
Join-ClipboardLines -Separator '; ' -Quote ''

# Remove duplicates before joining
Join-ClipboardLines -RemoveDuplicates

# Show the joined string in the output
Join-ClipboardLines -ShowOutput

# Return output only (no clipboard write)
Join-ClipboardLines -NoClipboard
```

:::note
- Empty lines are ignored.
- When `-RemoveDuplicates` is used, the first occurrence is kept and order is preserved.
- The command prints the number of joined items, and (if enabled) the number of duplicates removed.
- The joined string is only written to the pipeline when `-ShowOutput` is used.
- Copies output to the clipboard by default (unless `-NoClipboard` is used).
- Requires clipboard availability in the current session.
:::

## Update-CSVDelimiter

`Update-CSVDelimiter` switches CSV files between comma and semicolon separators while preserving encoding.

**Syntax**

```powershell
Update-CSVDelimiter -FilePath <String> [-Encoding <String>] [-ToComma] [-ToSemicolon]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `Encoding` | Input/output encoding. | No | `ISO-8859-15` |
| `FilePath` | Path to the CSV file. | Yes | - |
| `ToComma` | Convert `;` to `,`. | No | `False` |
| `ToSemicolon` | Convert `,` to `;`. | No | `False` |

**Examples**
```powershell
# Convert semicolons to commas
Update-CSVDelimiter -FilePath 'C:\path\to\file.csv' -ToComma

# Convert commas to semicolons with a custom encoding
Update-CSVDelimiter -FilePath 'C:\path\to\file.csv' -Encoding 'UTF8' -ToSemicolon
```

:::note
- Default encoding is `ISO-8859-15`.
- The cmdlet overwrites the target file with the updated delimiter.
:::

## Update-PS7

`Update-PS7` runs the official Microsoft helper script to install or upgrade PowerShell 7 via MSI.

**Syntax**

```powershell
Update-PS7
```

:::note
- Downloads `aka.ms/install-powershell.ps1` and executes it with `-UseMSI`.
- Ideal for keeping managed endpoints on the latest stable PowerShell release.
- The installer UI appears; run from an elevated session for system-wide upgrades.
- On Windows PowerShell 5.1, the function enforces TLS 1.2 before downloading.
:::

## Questions and answers

### Does `Update-PS7` install silently?

No. It downloads and runs the official Microsoft script with the interactive MSI (`-UseMSI`). Use an elevated session for system-wide upgrades.
