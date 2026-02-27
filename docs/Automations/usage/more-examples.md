---
sidebar_position: 50
title: "More examples"
description: Practical recipes that show common ways to use Nebula.Automations.
hide_title: true
id: more-examples
tags:
  - Nebula.Automations
  - Examples
  - Automations
---

# More examples

Practical recipes that show common ways to use Nebula.Automations.

## Send a styled HTML e-mail

```powershell
$body = @"
<h2 style="color:#0a6ebd;">Report ready</h2>
<p>The nightly batch finished successfully.</p>
"@

Send-Mail `
  -SMTPServer "smtp.contoso.com" `
  -From "user@contoso.com" `
  -To "sharedmailbox@contoso.com" `
  -Subject "Nightly batch OK" `
  -Body $body
```

## Authenticated SMTP with TLS and attachments

```powershell
$cred = Get-Credential  # relay credentials

Send-Mail `
  -SMTPServer "smtp.contoso.com" `
  -SMTPPort 587 `
  -UseSsl `
  -Credential $cred `
  -From "user@contoso.com" `
  -To "sharedmailbox@contoso.com" `
  -Subject "Alert with attachment" `
  -Body "<p>See attached log.</p>" `
  -AttachmentPath "C:\Logs\alert.log"
```

## Plain-text notification to multiple recipients (To + CC + BCC)

```powershell
Send-Mail `
  -SMTPServer "smtp.contoso.com" `
  -From "user@contoso.com" `
  -To "user1@contoso.com","user2@contoso.com" `
  -Cc "sharedmailbox@contoso.com" `
  -Bcc "user3@contoso.com" `
  -Subject "Maintenance window" `
  -Body "Service downtime tonight 22:00-23:00 UTC." `
  -PlainText
```

## Validate Microsoft Graph app connectivity

```powershell
$connected = Test-MgGraphConnection `
  -TenantId "00000000-0000-0000-0000-000000000000" `
  -ClientId "11111111-1111-1111-1111-111111111111" `
  -ClientSecret (Get-Content "$env:APPDATA\\nebula\\.graph_secret.txt" -Raw) `
  -LogLocation "$env:APPDATA\\nebula\\logs\\graph-connect.log"

if (-not $connected) { throw "Unable to connect to Microsoft Graph." }
```

## Auto-install Microsoft.Graph if missing

```powershell
if (-not (Test-MgGraphConnection -TenantId $tenantId -ClientId $clientId -ClientSecret $clientSecret -AutoInstall)) {
    throw "Graph connection failed even after installing Microsoft.Graph."
}
```

## Register a daily script task (standard mode)

```powershell
Register-ScriptScheduledTask `
  -TaskName "Daily-PolicyAudit" `
  -TaskPath "\Nebula\" `
  -Mode Standard `
  -ScriptPath "C:\Ops\Audit\Invoke-PolicyAudit.ps1" `
  -StartTime ((Get-Date).Date.AddHours(2)) `
  -ScheduleType Daily `
  -RunElevated
```

## Register with custom XML (advanced scheduling)

```powershell
$cred = Get-Credential

Register-ScriptScheduledTask `
  -TaskName "ConditionalAccess-Automation" `
  -Mode Xml `
  -TaskXmlPath "C:\Ops\TaskXml\ConditionalAccess.xml" `
  -Credential $cred `
  -Force
```

## Remove a scheduled script task

```powershell
Unregister-ScriptScheduledTask `
  -TaskName "Daily-PolicyAudit" `
  -TaskPath "\Nebula\"
```
