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
| `AccessRights` | String | Rights: `All`, `FullAccess`, `SendAs`, `SendOnBehalfTo`. | No | - |
| `AutoMapping` | Switch | Enable/disable Outlook automapping. | No | - |
| `PassThru` | Switch | Emit detailed permission objects (default shows only confirmation messages). | No | - |

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

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceMailbox` (`Identity`) | String[] | Target mailbox/recipient. Pipeline accepted. | No | - |
| `Csv` | Switch | Export results to CSV. | No | - |
| `CsvFolder` | String | Destination folder for CSV export. | No | - |
| `All` | Switch | Export aliases for all non-guest recipients. | No | - |
| `Domain` | String | Export aliases for recipients matching a domain. | No | - |

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

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `RecipientType` | String | Mailbox scope: `User`, `Shared`, `Room`, `All`. | Yes | - |
| `CsvFolder` | String | Destination folder for CSV export. | No | - |

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

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `Identity` | String | Target mailbox/recipient. | Yes | - |

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

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceMailbox` (`Identity`) | String | Target mailbox/recipient. Pipeline accepted. | No | - |
| `IncludeTrace` | Switch | Include raw message trace objects in the output. | No | - |

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
Get-MboxPrimarySmtpAddress -SourceMailbox <String[]> [-Raw]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceMailbox` (`Identity`) | String[] | Target mailbox/recipient. Pipeline accepted. | Yes | - |
| `Raw` | Switch | Return only the PrimarySmtpAddress values. | No | - |

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
| `AccessRights` | String | Rights (e.g., FullAccess, SendAs, SendOnBehalfTo). Defaults to All. | No | - |
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
| `Language` | String | Culture code (e.g., it-IT, en-US). | No | - |

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
| `GridView` | Switch | Show output in Out-GridView (default behavior). Use `-GridView:$false` to return objects. | No | - |

**Example**
```powershell
Test-SharedMailboxCompliance
```
