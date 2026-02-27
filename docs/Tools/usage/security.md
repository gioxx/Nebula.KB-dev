---
sidebar_position: 3
title: "Security"
description: Security utilities for everyday use, starting with password helpers.
hide_title: true
id: security
tags:
  - Get-RandomPassword
  - Nebula.Tools
  - New-RandomPassword
  - Passwords
  - Security
  - Tools
---

# Security

Security utilities for everyday tasks.

## New-RandomPassword

For full details and examples, run `Get-Help New-RandomPassword -Detailed`.

:::note
The function name is `New-RandomPassword`. The legacy alias `Get-RandomPassword` remains available for backward compatibility.
:::

Creates strong or simplified passwords and can copy results to the clipboard.

**Syntax**

```powershell
New-RandomPassword [-PasswordLength <Int>] [-Simple] [-Count <Int>] [-Clipboard]
```

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `Clipboard` | Copy the generated password(s) to the clipboard. | No | `False` |
| `Count` | Number of passwords to generate. | No | `1` |
| `PasswordLength` | Length of the password. | No | `12` |
| `Simple` | Use a reduced special-character set. | No | `False` |

**Examples**
```powershell
# Single strong password (default length 12)
New-RandomPassword

# Explicit length
New-RandomPassword -PasswordLength 16

# Simplified characters, three passwords, copied to clipboard
New-RandomPassword -Simple -Count 3 -Clipboard
```

:::note
- `-Clipboard` writes the generated passwords to the Windows clipboard.
- `-Count` lets you produce multiple passwords in one call.
- `-Simple` reduces special characters for systems with stricter input rules.
- If the clipboard is not available, the cmdlet warns and still outputs the passwords.
:::
