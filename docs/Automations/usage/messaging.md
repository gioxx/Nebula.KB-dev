---
sidebar_position: 2
title: "Messaging"
id: messaging
description: Functions for sending emails and change-based reports.
tags:
  - Send-Mail
  - Send-ReportIfChanged
  - Nebula.Automations
---

# Messaging

This page groups the messaging functions used to send emails and conditional reports. For full and always-up-to-date details, use `Get-Help <FunctionName> -Detailed` (or `-Examples`).

## Send-Mail

Send emails via SMTP with support for CC/BCC, attachments, SSL/TLS, and credentials.

**Syntax**

```powershell
Send-Mail -SMTPServer <String> -From <String> -To <String[]> -Subject <String> -Body <String>
         [-SMTPPort <Int>] [-Cc <String[]>] [-Bcc <String[]>] [-AttachmentPath <String[]>]
         [-PlainText] [-Credential <PSCredential>] [-UseSsl]
```

**Parameters**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `SMTPServer` | `String` | Yes | - | SMTP server address. |
| `SMTPPort` | `Int` | No | `25` | SMTP port (`1..65535`). |
| `From` | `String` | Yes | - | Sender e-mail address. |
| `To` | `String[]` | Yes | - | Recipient e-mail addresses. |
| `Cc` | `String[]` | No | - | Carbon copy recipients. |
| `Bcc` | `String[]` | No | - | Blind carbon copy recipients. |
| `Subject` | `String` | Yes | - | E-mail subject. |
| `Body` | `String` | Yes | - | E-mail body content. |
| `AttachmentPath` | `String[]` | No | - | File path(s) to attach. |
| `PlainText` | `Switch` | No | `False` | Sends body as plain text (otherwise HTML). |
| `Credential` | `PSCredential` | No | - | SMTP credential. |
| `UseSsl` | `Switch` | No | `False` | Enables SSL/TLS for SMTP connection. |

**Example**

```powershell
Send-Mail `
  -SMTPServer "smtp.contoso.com" `
  -UseSsl `
  -Credential (Get-Credential) `
  -From "user@contoso.com" `
  -To "ops@contoso.com" `
  -Subject "Nightly job completed" `
  -Body "<p>Done</p>"
```

## Send-ReportIfChanged

Finalize and send an HTML report only when changes are detected.

**Syntax**

```powershell
Send-ReportIfChanged -ModCounter <Int> -MailBody <String> -SmtpServer <String> -From <String> -To <String[]>
                     -Subject <String> [-SendLogs <Boolean>] [-AttachmentPath <String[]>]
                     [-ForceMailTo <Boolean>] [-LogLocation <String>]
```

**Parameters**

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `ModCounter` | `Int` | Yes | - | Number of detected changes. |
| `MailBody` | `String` | Yes | - | HTML body prefix/content to finalize. |
| `SmtpServer` | `String` | Yes | - | SMTP server address. |
| `From` | `String` | Yes | - | Sender e-mail address. |
| `To` | `String[]` | Yes | - | Recipient e-mail addresses. |
| `Subject` | `String` | Yes | - | E-mail subject. |
| `SendLogs` | `Boolean` | No | `True` | Enables/disables report sending flow. |
| `AttachmentPath` | `String[]` | No | - | Optional attachment path(s). |
| `ForceMailTo` | `Boolean` | No | `False` | Marks manual recipient override in logs. |
| `LogLocation` | `String` | No | - | Optional log file/directory location. |

**Example**

```powershell
$result = Send-ReportIfChanged `
  -SendLogs $true `
  -ModCounter 4 `
  -MailBody $mailBody `
  -SmtpServer "smtp.contoso.com" `
  -From "user@contoso.com" `
  -To "ops@contoso.com" `
  -Subject "User sync report"
```
