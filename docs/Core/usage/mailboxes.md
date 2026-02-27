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

Requires an EXO session. For full and always-up-to-date details, use `Get-Help <FunctionName> -Detailed`.

## Add-MboxAlias
Add SMTP aliases on a recipient.

**Syntax**

```powershell
Add-MboxAlias -SourceMailbox <String> -MailboxAlias <String>
```

| Parameter | Description | Required |
| --- | --- | :---: |
| `SourceMailbox` (`Identity`) | Target mailbox/recipient. Pipeline accepted. | Yes |
| `MailboxAlias` | Alias (SMTP address) to add. | Yes |

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

| Parameter | Description | Required |
| --- | --- | :---: |
| `SourceMailbox` (`Identity`) | Target mailbox. | Yes |
| `UserMailbox` | One or more principals to grant. Pipeline accepted. | Yes |
| `AccessRights` | Rights: `All`, `FullAccess`, `SendAs`, `SendOnBehalfTo`. | No |
| `AutoMapping` | Enable/disable Outlook automapping. | No |
| `PassThru` | Emit detailed permission objects (default shows only confirmation messages). | No |

**Examples**
```powershell
Add-MboxPermission -SourceMailbox 'sharedmailbox@contoso.com' -UserMailbox 'user@contoso.com' -AccessRights FullAccess -AutoMapping:$false
```

```powershell
Add-MboxPermission -SourceMailbox 'sharedmailbox@contoso.com' -UserMailbox 'user@contoso.com' -PassThru
```

## Export-MboxAlias
Export aliases for auditing.

**Syntax**

```powershell
Export-MboxAlias [-SourceMailbox <String[]>] [-Csv] [-CsvFolder <String>] [-All] [-Domain <String>]
```

| Parameter | Description | Required |
| --- | --- | :---: |
| `SourceMailbox` (`Identity`) | Target mailbox/recipient. Pipeline accepted. | No |
| `Csv` | Export results to CSV. | No |
| `CsvFolder` | Destination folder for CSV export. | No |
| `All` | Export aliases for all non-guest recipients. | No |
| `Domain` | Export aliases for recipients matching a domain. | No |

**Examples**
```powershell
Export-MboxAlias -SourceMailbox 'user@contoso.com'
```

```powershell
Export-MboxAlias -All -CsvFolder 'C:\Temp'
```

## Export-MboxPermission
Export mailbox permissions to CSV.

**Syntax**

```powershell
Export-MboxPermission -RecipientType <String> [-CsvFolder <String>]
```

| Parameter | Description | Required |
| --- | --- | :---: |
| `RecipientType` | Mailbox scope: `User`, `Shared`, `Room`, `All`. | Yes |
| `CsvFolder` | Destination folder for CSV export. | No |

**Examples**
```powershell
Export-MboxPermission -RecipientType Shared -CsvFolder 'C:\Temp'
```

```powershell
Export-MboxPermission -RecipientType All -CsvFolder 'C:\Temp'
```

## Get-MboxAlias
List aliases for auditing.

**Syntax**

```powershell
Get-MboxAlias -Identity <String>
```

| Parameter | Description | Required |
| --- | --- | :---: |
| `Identity` | Target mailbox/recipient. | Yes |

**Examples**
```powershell
Get-MboxAlias -Identity 'user@contoso.com'
```

## Get-MboxLastMessageTrace
Return the most recent received and sent message traces for a mailbox.

**Syntax**

```powershell
Get-MboxLastMessageTrace -SourceMailbox <String> [-IncludeTrace]
```

| Parameter | Description |
| --- | --- |
| `SourceMailbox` (`Identity`) | Target mailbox/recipient. Pipeline accepted. |
| `IncludeTrace` | Include raw message trace objects in the output. |

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

| Parameter | Description | Required |
| --- | --- | :---: |
| `Identity` | Target mailbox. | Yes |

**Examples**
```powershell
Get-MboxPermission -Identity 'sharedmailbox@contoso.com'
```

## Get-MboxPrimarySmtpAddress
Return the PrimarySmtpAddress for a mailbox or recipient.

**Syntax**

```powershell
Get-MboxPrimarySmtpAddress -SourceMailbox <String[]> [-Raw]
```

| Parameter | Description | Required |
| --- | --- | :---: |
| `SourceMailbox` (`Identity`) | Target mailbox/recipient. Pipeline accepted. | Yes |
| `Raw` | Return only the PrimarySmtpAddress values. | No |

:::tip
`Get-MboxPrimarySmtpAddress` is also available as `gpa` (alias).
:::

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

## Get-UserLastSeen
Return the most recent activity for a mailbox combining Exchange LastUserActionTime and (when available) Entra ID sign-in logs.

**Syntax**

```powershell
Get-UserLastSeen -User <String>
```

| Parameter | Description |
| --- | --- |
| `User` (`Identity`, `UserPrincipalName`) | Target mailbox identity. Pipeline accepted. |

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

| Parameter | Description | Required |
| --- | --- | :---: |
| `SharedMailboxSMTPAddress` | Primary SMTP address of the new shared mailbox. | Yes |
| `SharedMailboxDisplayName` | Display name. | Yes |
| `SharedMailboxAlias` | Mail alias. | Yes |

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

| Parameter | Description | Required |
| --- | --- | :---: |
| `SourceMailbox` (`Identity`) | Target mailbox/recipient. Pipeline accepted. | Yes |
| `MailboxAlias` | Alias (SMTP address) to remove. | Yes |

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

| Parameter | Description | Required |
| --- | --- | :---: |
| `SourceMailbox` (`Identity`) | Target mailbox. | Yes |
| `UserMailbox` | Principal(s) to revoke. | Yes (User mode) |
| `AccessRights` | Rights (e.g., FullAccess, SendAs, SendOnBehalfTo). Defaults to All. | No |
| `ClearAll` | Remove all non-inherited FullAccess, SendAs, and SendOnBehalfTo permissions from the source mailbox. | Yes (All mode) |

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

| Parameter | Description |
| --- | --- |
| `SourceMailbox` (`Identity`) | Target mailbox(es). Pipeline accepted. |
| `Csv` | CSV file path containing `EmailAddress` column. |
| `Language` | Culture code (e.g., it-IT, en-US). |

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

| Parameter | Description |
| --- | --- |
| `SourceMailbox` (`Identity`) | Target mailbox(es). Pipeline accepted. |

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

| Parameter | Description | Required |
| --- | --- | :---: |
| `SourceMailbox` (`Identity`) | Shared mailbox(es). Pipeline accepted. | Yes |

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

| Parameter | Description |
| --- | --- |
| `GridView` | Show output in Out-GridView (default behavior). Use `-GridView:$false` to return objects. |

**Example**
```powershell
Test-SharedMailboxCompliance
```
