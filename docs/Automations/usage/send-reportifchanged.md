---
sidebar_position: 10
title: 'Send-ReportIfChanged'
description: Send report email only when changes are detected.
hide_title: true
id: send-reportifchanged
tags:
  - Send-ReportIfChanged
  - Messaging
  - Nebula.Automations
---

# Send-ReportIfChanged

Finalizes an HTML report and sends it only when `SendLogs` is enabled and `ModCounter` is greater than zero.

## Syntax

```powershell
Send-ReportIfChanged -ModCounter <Int> -MailBody <String> -SmtpServer <String> -From <String> -To <String[]>
                     -Subject <String> [-SendLogs <Boolean>] [-AttachmentPath <String[]>]
                     [-ForceMailTo <Boolean>] [-LogLocation <String>]
```

## Example

```powershell
$result = Send-ReportIfChanged `
  -SendLogs $true `
  -ModCounter 4 `
  -MailBody $mailBody `
  -SmtpServer "smtp.contoso.com" `
  -From "user@contoso.com" `
  -To "sharedmailbox@contoso.com" `
  -Subject "User sync report" `
  -AttachmentPath "C:\Logs\SyncUsers\run.log"

if (-not $result.Success) { throw $result.Message }
```
