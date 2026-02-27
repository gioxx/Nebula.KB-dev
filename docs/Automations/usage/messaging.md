---
sidebar_position: 4
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

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | --- | --- |
| `SMTPServer` | `String` | SMTP host name or IP address. | Yes | N/A |
| `From` | `String` | Sender e-mail address. | Yes | N/A |
| `To` | `String[]` | One or more recipient e-mail addresses. | Yes | N/A |
| `Subject` | `String` | E-mail subject. | Yes | N/A |
| `Body` | `String` | Message body (HTML by default). | Yes | N/A |
| `SMTPPort` | `Int` | SMTP port (for example `25`, `465`, `587`). | No | `25` |
| `Cc` | `String[]` | CC recipient addresses. | No | `None` |
| `Bcc` | `String[]` | BCC recipient addresses. | No | `None` |
| `AttachmentPath` | `String[]` | One or more file paths to attach. | No | `None` |
| `PlainText` | `Switch` | Sends body as plain text instead of HTML. | No | `False` |
| `Credential` | `PSCredential` | Credentials used for authenticated SMTP. | No | `None` |
| `UseSsl` | `Switch` | Enables SSL/TLS for SMTP connection. | No | `False` |

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

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | --- | --- |
| `ModCounter` | `Int` | Number of detected changes used to decide whether to send. | Yes | N/A |
| `MailBody` | `String` | HTML body content for the report e-mail. | Yes | N/A |
| `SmtpServer` | `String` | SMTP host used to send the report. | Yes | N/A |
| `From` | `String` | Sender e-mail address. | Yes | N/A |
| `To` | `String[]` | One or more recipient e-mail addresses. | Yes | N/A |
| `Subject` | `String` | Subject line for the report e-mail. | Yes | N/A |
| `SendLogs` | `Boolean` | Include log artifacts when available. | No | `True` |
| `AttachmentPath` | `String[]` | Additional attachment file paths. | No | `None` |
| `ForceMailTo` | `Boolean` | Forces send behavior even when no changes are detected. | No | `False` |
| `LogLocation` | `String` | Log file/location used for diagnostics. | No | `None` |

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
