---
sidebar_position: 1
title: 'Send-Mail'
description: Send emails via SMTP with support for attachments, CC/BCC, and custom servers/ports.
hide_title: true
id: send-mail
tags:
  - Send-Mail
  - E-mail
  - Nebula.Automations
---

# Send-Mail

Send emails via SMTP with support for attachments, CC/BCC, and custom servers/ports.

## Syntax

```powershell
Send-Mail -SMTPServer <String> -From <String> -To <String[]> -Subject <String> -Body <String>
         [-SMTPPort <Int>] [-Cc <String[]>] [-Bcc <String[]>] [-AttachmentPath <String[]>]
         [-PlainText] [-Credential <PSCredential>] [-UseSsl]
```

## Parameters

| Parameter | Description | Required | Default |
| --- | --- | :---: | --- |
| `SMTPServer` | Hostname or IP of the SMTP relay to use. | Yes | - |
| `SMTPPort` | TCP port of the SMTP relay. | No | `25` |
| `From` | Sender email address. | Yes | - |
| `To` | Recipient list (supports multiple values). | Yes | - |
| `Cc` | CC recipient list. | No | Empty |
| `Bcc` | BCC recipient list. | No | Empty |
| `Subject` | Email subject. | Yes | - |
| `Body` | Email body (HTML is enabled by default). | Yes | - |
| `AttachmentPath` | One or more file paths to attach. | No | Empty |
| `PlainText` | Send the body as plain text (HTML is default). | No | `False` |
| `Credential` | PSCredential used for authenticated SMTP. | No | - |
| `UseSsl` | Enable SSL/TLS when connecting to SMTP. | No | `False` |

:::note
The function relies on .NET `System.Net.Mail.SmtpClient`. Auth/TLS are supported via `-Credential` and `-UseSsl`; ensure your relay accepts the chosen method.
:::

## Examples

- **Send a simple HTML email**

```powershell
Send-Mail `
  -SMTPServer "smtp.contoso.com" `
  -From "user@contoso.com" `
  -To "sharedmailbox@contoso.com" `
  -Subject "Job completed" `
  -Body "<p>The overnight job finished successfully.</p>"
```

- **Add CC/BCC recipients and an attachment**

```powershell
Send-Mail `
  -SMTPServer "smtp.contoso.com" `
  -SMTPPort 2525 `
  -From "user@contoso.com" `
  -UseSsl `
  -Credential (Get-Credential) `
  -To "user1@contoso.com","user2@contoso.com" `
  -Cc "sharedmailbox@contoso.com" `
  -Bcc "user3@contoso.com" `
  -Subject "Weekly metrics" `
  -Body "<p>Attached you will find the weekly metrics.</p>" `
  -AttachmentPath "C:\Exports\metrics.xlsx","C:\Exports\trend.pdf"
```

- **Reusable helper inside a script**

```powershell
function Send-JobAlert {
  param(
    [string]$ReportPath,
    [string]$Status
  )

  $subject = "Nightly job status: $Status"
  $body = "<h2>Status: $Status</h2><p>See attached log.</p>"

  Send-Mail -SMTPServer "smtp.contoso.com" -From "user@contoso.com" -To "sharedmailbox@contoso.com" `
    -Subject $subject -Body $body -AttachmentPath $ReportPath
}
```

:::tip
- Multiple attachments are supported; paths must exist or the function throws.
- HTML is enabled by default. Add `-PlainText` if your relay/policy requires plain text bodies.
- Use `-UseSsl` and `-Credential` when relaying through authenticated/TLS SMTP servers.
:::

## Questions and answers

### Does Send-Mail send HTML or plain text?

HTML is enabled by default via `System.Net.Mail.SmtpClient`. Add `-PlainText` to force text-only output.

### Can I use TLS/authentication?

Yes. Use `-UseSsl` and `-Credential` (PSCredential) for authenticated SMTP on ports like 587; ensure the relay accepts that method.

### How do I handle multiple recipients?

`-To`, `-Cc`, and `-Bcc` accept arrays: `-To "a@contoso.com","b@contoso.com"`.

### Are attachments supported?

Yes. Use `-AttachmentPath`; paths must exist or the cmdlet throws.
