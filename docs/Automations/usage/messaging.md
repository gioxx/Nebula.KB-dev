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