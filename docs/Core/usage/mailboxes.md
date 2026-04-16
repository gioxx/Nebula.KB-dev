---
sidebar_position: 7
title: "Mailboxes"
description: Manage aliases, permissions, languages, quotas, and shared mailbox setup.
hide_title: true
id: mailboxes
tags:
  - Add-MboxAlias
  - Add-MboxPermission
  - Export-MboxAlias
  - Export-MboxPermission
  - Get-MboxAlias
  - Get-MboxLastMessageTrace
  - Get-MboxPermission
  - Get-MboxPrimarySmtpAddress
  - Get-UserLastSeen
  - Nebula.Core
  - New-SharedMailbox
  - Remove-MboxAlias
  - Remove-MboxPermission
  - Set-MboxLanguage
  - Set-MboxRulesQuota
  - Set-SharedMboxCopyForSent
  - Test-SharedMailboxCompliance
---

# Mailbox helpers

Requires an EXO session. For full details and examples, run `Get-Help <FunctionName> -Detailed`.

## Add-MboxAlias
Add SMTP aliases on a recipient.

**Syntax**

```powershell
Add-MboxAlias -SourceMailbox <String> -MailboxAlias <String>
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceMailbox` (`Identity`) | String | Target mailbox/recipient. Pipeline accepted. | Yes | - |
| `MailboxAlias` | String | Alias (SMTP address) to add. | Yes | - |

**Examples**
```powershell
Add-MboxAlias -SourceMailbox 'user@contoso.com' -MailboxAlias 'alias@contoso.com'
```

```powershell
Add-MboxAlias -Identity 'user@contoso.com' -MailboxAlias 'alias@contoso.com'
```

## Add-MboxPermission
Grant mailbox permissions.

**Syntax**

```powershell
Add-MboxPermission -SourceMailbox <String> -UserMailbox <String[]> [-AccessRights <String>] [-AutoMapping] [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceMailbox` (`Identity`) | String | Target mailbox. | Yes | - |
| `UserMailbox` | String[] | One or more principals to grant. Pipeline accepted. | Yes | - |
| `AccessRights` | String | Rights: `All`, `FullAccess`, `SendAs`, `SendOnBehalfTo`. | No | `All` |
| `AutoMapping` | Switch | Enable/disable Outlook automapping. | No | `False` |
| `PassThru` | Switch | Emit detailed permission objects (default shows only confirmation messages). | No | `False` |

**Examples**
```powershell
Add-MboxPermission -SourceMailbox 'sharedmailbox@contoso.com' -UserMailbox 'user@contoso.com' -AccessRights FullAccess -AutoMapping:$false
```

```powershell
Add-MboxPermission -SourceMailbox 'sharedmailbox@contoso.com' -UserMailbox 'user@contoso.com' -PassThru
```

## Export-MboxPermission
Export mailbox permissions to CSV with optional batching and resume support.

**Syntax**

```powershell
Export-MboxPermission -RecipientType <String> [-CsvFolder <String>] [-BatchSize <Int32>] [-Resume] [-CsvPath <String>] [-MaxConsecutiveErrors <Int32>]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `RecipientType` | String | Recipient type to analyze: `User`, `Shared`, `Room`, or `All`. | Yes | - |
| `CsvFolder` | String | Destination folder for the CSV. | No | Current directory |
| `BatchSize` | Int32 | Number of processed mailboxes buffered before the CSV is flushed. | No | `25` |
| `Resume` | Switch | Resume from the latest matching CSV or from `-CsvPath`. | No | `False` |
| `CsvPath` | String | Explicit CSV file to resume. When omitted, the latest matching CSV is used. | No | - |
| `MaxConsecutiveErrors` | Int32 | Stop after this many consecutive mailbox-level failures. | No | `5` |

**Examples**
```powershell
Export-MboxPermission -RecipientType All -CsvFolder 'C:\Temp' -Resume
```

```powershell
Export-MboxPermission -RecipientType Shared -CsvFolder 'C:\Temp' -CsvPath 'C:\Temp\20260414_M365-MboxPermissions-Report.csv'
```

## Export-MboxAlias

:::warning Deprecated function
`Export-MboxAlias` is deprecated and no longer available as a function. Use [Get-MboxAlias](#get-mboxalias) instead.
:::

## Get-MboxAlias
List aliases for auditing. This also replaces `Export-MboxAlias`.

`Get-MboxAlias` is now the single command for alias reporting.
It supports:
- a single mailbox or recipient identity
- tenant-wide export with `-All`
- domain-scoped export with `-Domain`
- CSV output for single mailbox queries with `-Csv` and `-CsvFolder`
- automatic CSV export for `-All` and `-Domain`
- batch flushing and resume for long-running CSV exports with `-BatchSize`, `-Resume`, `-CsvPath`, and `-MaxConsecutiveErrors`
- optional inclusion of primary-only recipients with `-IncludePrimaryOnly`
- extra CSV fields `DisplayName` and `Name`
- extra CSV fields `UserPrincipalName` and `IsMoera` in CSV exports

Note:
- `-Csv` is the explicit switch for single-mailbox exports.
- `-All` and `-Domain` already export to CSV, so `-Csv` is optional in those modes.
- `-CsvFolder` controls the export destination for every CSV-producing mode.
- `-Resume` reuses the latest matching CSV in the target folder unless `-CsvPath` is specified.
- `-BatchSize` controls how many processed recipients are buffered before the CSV is flushed.
- `-IncludePrimaryOnly` keeps recipients that would otherwise be omitted because they have no secondary aliases.
- `-IncludeMoera` keeps addresses in the tenant's `onmicrosoft.com` domain that would otherwise be hidden.
- Primary-only exclusion is evaluated after MOERA filtering, so a mailbox with only a primary SMTP and a MOERA proxy stays hidden by default.

**Syntax**

```powershell
Get-MboxAlias -SourceMailbox <String> [-Csv] [-CsvFolder <String>] [-IncludePrimaryOnly] [-IncludeMoera] [-BatchSize <Int32>] [-Resume] [-CsvPath <String>] [-MaxConsecutiveErrors <Int32>] [-All] [-Domain <String>]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceMailbox` (`Identity`) | String | Target mailbox/recipient. Pipeline accepted. | Yes in single mode | - |
| `Csv` | Switch | Force CSV export for a single mailbox query. Optional when using `-All` or `-Domain`. | No | `False` |
| `CsvFolder` | String | Destination folder for CSV export. | No | - |
| `IncludePrimaryOnly` | Switch | Include recipients with only a primary SMTP address in CSV exports. | No | `False` |
| `IncludeMoera` | Switch | Include MOERA addresses in CSV exports. | No | `False` |
| `BatchSize` | Int32 | Number of processed recipients to buffer before flushing the CSV. | No | `25` |
| `Resume` | Switch | Resume from the latest matching CSV or from `-CsvPath`. | No | `False` |
| `CsvPath` | String | Explicit CSV file to resume. When omitted, the latest matching CSV is used. | No | - |
| `MaxConsecutiveErrors` | Int32 | Stop after this many consecutive recipient-level failures. | No | `5` |
| `All` | Switch | Export aliases for all non-guest recipients and write a CSV report. | No | `False` |
| `Domain` | String | Export aliases for recipients matching a domain and write a CSV report. | No | - |

**Examples**
```powershell
Get-MboxAlias -SourceMailbox 'user@contoso.com'
```

```powershell
Get-MboxAlias 'user@contoso.com'
```

```powershell
Get-MboxAlias -SourceMailbox 'user@contoso.com' -Csv -CsvFolder 'C:\Temp'
```

```powershell
Get-MboxAlias -SourceMailbox 'user@contoso.com' -Csv -IncludePrimaryOnly -CsvFolder 'C:\Temp'
```

```powershell
Get-MboxAlias -SourceMailbox 'user@contoso.com' -Csv -IncludeMoera -CsvFolder 'C:\Temp'
```

Example behavior:
- `Get-MboxAlias -SourceMailbox 'user@contoso.com' -Csv` hides the MOERA row and keeps the mailbox only if it has a real secondary alias.
- `Get-MboxAlias -SourceMailbox 'user@contoso.com' -Csv -IncludeMoera` includes the MOERA row as well.

```powershell
Get-MboxAlias -All -CsvFolder 'C:\Temp'
```

```powershell
Get-MboxAlias -Domain 'contoso.com' -CsvFolder 'C:\Temp'
```

```powershell
Get-MboxAlias -All -CsvFolder 'C:\Temp' -Resume
```

```powershell
Get-MboxAlias -Domain 'contoso.com' -CsvFolder 'C:\Temp' -Resume -CsvPath 'C:\Temp\20260414_M365-Alias-Report.csv'
```

## Get-MboxLastMessageTrace
Return the most recent received and sent message traces for a mailbox.

**Syntax**

```powershell
Get-MboxLastMessageTrace -SourceMailbox <String> [-IncludeTrace]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceMailbox` (`Identity`) | String | Target mailbox/recipient. Pipeline accepted. | No | - |
| `IncludeTrace` | Switch | Include raw message trace objects in the output. | No | `False` |

**Example**
```powershell
Get-MboxLastMessageTrace -SourceMailbox 'user@contoso.com'
```

```powershell
Get-MboxLastMessageTrace -SourceMailbox 'user@contoso.com' -IncludeTrace
```

## Get-MboxPermission
List mailbox permissions.

**Syntax**

```powershell
Get-MboxPermission -Identity <String>
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `Identity` | String | Target mailbox. | Yes | - |

**Examples**
```powershell
Get-MboxPermission -Identity 'sharedmailbox@contoso.com'
```

## Get-MboxPrimarySmtpAddress
Return the PrimarySmtpAddress for a mailbox or recipient.

**Syntax**

```powershell
Get-MboxPrimarySmtpAddress -SourceMailbox <String[]> [-Raw] [-Detailed]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceMailbox` (`Identity`) | String[] | Target mailbox/recipient. Pipeline accepted. | Yes | - |
| `Raw` | Switch | Return only the PrimarySmtpAddress values. | No | `False` |
| `Detailed` | Switch | Include additional fields (`Identity`, `RecipientTypeDetails`). | No | `False` |

:::tip
`Get-MboxPrimarySmtpAddress` is also available as `gpa` (alias).
:::

By default, object output is compact and optimized for console readability:
- `DisplayName`
- `PrimarySmtpAddress`

**Example**
```powershell
Get-MboxPrimarySmtpAddress -SourceMailbox 'user@contoso.com'
```

```powershell
Get-MboxPrimarySmtpAddress -SourceMailbox 'user@contoso.com' -Raw
```

```powershell
gpa 'user@contoso.com' -Raw
```

```powershell
Get-MboxPrimarySmtpAddress -SourceMailbox 'user@contoso.com' -Detailed
```

## Get-UserLastSeen
Return the most recent activity for a mailbox combining Exchange LastUserActionTime and (when available) Entra ID sign-in logs.

**Syntax**

```powershell
Get-UserLastSeen -User <String>
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `User` (`Identity`, `UserPrincipalName`) | String | Target mailbox identity. Pipeline accepted. | No | - |

**Example**
```powershell
Get-UserLastSeen -User 'user@contoso.com'
```

Notes:
- Requires Exchange Online connection. Graph sign-in logs are included when `AuditLog.Read.All` + `Directory.Read.All` scopes are available.
- Output includes `LastUserActionTime`, `LastInteractiveSignIn`, `LastSeen`, and the `Source` used.

## New-SharedMailbox
Create a shared mailbox.

**Syntax**

```powershell
New-SharedMailbox -SharedMailboxSMTPAddress <String> -SharedMailboxDisplayName <String> -SharedMailboxAlias <String>
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SharedMailboxSMTPAddress` | String | Primary SMTP address of the new shared mailbox. | Yes | - |
| `SharedMailboxDisplayName` | String | Display name. | Yes | - |
| `SharedMailboxAlias` | String | Mail alias. | Yes | - |

**Example**
```powershell
New-SharedMailbox -SharedMailboxSMTPAddress 'sharedmailbox@contoso.com' -SharedMailboxDisplayName 'Support Team' -SharedMailboxAlias 'SupportTeam'
```

## Remove-MboxAlias
Remove SMTP aliases from a recipient.

**Syntax**

```powershell
Remove-MboxAlias -SourceMailbox <String> -MailboxAlias <String>
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceMailbox` (`Identity`) | String | Target mailbox/recipient. Pipeline accepted. | Yes | - |
| `MailboxAlias` | String | Alias (SMTP address) to remove. | Yes | - |

**Examples**
```powershell
Remove-MboxAlias -SourceMailbox 'user@contoso.com' -MailboxAlias 'alias@contoso.com'
```

## Remove-MboxPermission
Revoke mailbox permissions.

**Syntax**

```powershell
Remove-MboxPermission -SourceMailbox <String> -UserMailbox <String[]> [-AccessRights <String>]
Remove-MboxPermission -SourceMailbox <String> -ClearAll
Remove-MboxPermission <SourceMailbox> <UserMailbox> [-AccessRights <String>]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceMailbox` (`Identity`) | String | Target mailbox. | Yes | - |
| `UserMailbox` | String[] | Principal(s) to revoke. | Yes (User mode) | - |
| `AccessRights` | String | Rights (e.g., FullAccess, SendAs, SendOnBehalfTo). Defaults to All. | No | All |
| `ClearAll` | Switch | Remove all non-inherited FullAccess, SendAs, and SendOnBehalfTo permissions from the source mailbox. | Yes (All mode) | - |

**Examples**
```powershell
Remove-MboxPermission -SourceMailbox 'sharedmailbox@contoso.com' -UserMailbox 'user@contoso.com' -AccessRights FullAccess
```

```powershell
# Positional call (SourceMailbox = position 0, UserMailbox = position 1)
Remove-MboxPermission 'sharedmailbox@contoso.com' 'user@contoso.com'
```

```powershell
Remove-MboxPermission -SourceMailbox 'sharedmailbox@contoso.com' -ClearAll
```

## Set-MboxLanguage
Set mailbox UI language and regional defaults.

**Syntax**

```powershell
Set-MboxLanguage -SourceMailbox <String[]> [-Language <String>]
Set-MboxLanguage -Csv <String> [-Language <String>]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceMailbox` (`Identity`) | String[] | Target mailbox(es). Pipeline accepted. | No | - |
| `Csv` | String | CSV file path containing `EmailAddress` column. | No | - |
| `Language` | String | Culture code (e.g., it-IT, en-US). | No | `it-IT` |

**Example**
```powershell
Set-MboxLanguage -SourceMailbox 'user@contoso.com' -Language it-IT
```

```powershell
Set-MboxLanguage -Csv 'C:\Temp\mailboxes.csv' -Language en-US
```

## Set-MboxRulesQuota
Set rules quota to `256KB` for one or more mailboxes.

**Syntax**

```powershell
Set-MboxRulesQuota -SourceMailbox <String[]>
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceMailbox` (`Identity`) | String[] | Target mailbox(es). Pipeline accepted. | No | - |

**Example**
```powershell
Set-MboxRulesQuota -SourceMailbox 'user@contoso.com','sharedmailbox@contoso.com'
```

## Set-SharedMboxCopyForSent
Enable sent-item copy settings for shared mailboxes.

**Syntax**

```powershell
Set-SharedMboxCopyForSent -SourceMailbox <String[]>
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceMailbox` (`Identity`) | String[] | Shared mailbox(es). Pipeline accepted. | Yes | - |

**Example**
```powershell
Set-SharedMboxCopyForSent -SourceMailbox 'sharedmailbox@contoso.com'
```

## Test-SharedMailboxCompliance
Report shared mailbox sign-in activity and Exchange Online licensing indicators.

**Syntax**

```powershell
Test-SharedMailboxCompliance [-GridView]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `GridView` | Switch | Show output in Out-GridView (default behavior). Use `-GridView:$false` to return objects. | No | True |

**Example**
```powershell
Test-SharedMailboxCompliance
```
