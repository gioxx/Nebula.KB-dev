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
  -SMTPServer "smtp.internal.local" `
  -From "automation@contoso.com" `
  -To "team@contoso.com" `
  -Subject "Nightly batch OK" `
  -Body $body
```

## Authenticated SMTP with TLS and attachments

```powershell
$cred = Get-Credential  # relay credentials

Send-Mail `
  -SMTPServer "smtp.secure.local" `
  -SMTPPort 587 `
  -UseSsl `
  -Credential $cred `
  -From "alerts@contoso.com" `
  -To "ops@contoso.com" `
  -Subject "Alert with attachment" `
  -Body "<p>See attached log.</p>" `
  -AttachmentPath "C:\Logs\alert.log"
```

## Plain-text notification to multiple recipients (To + CC + BCC)

```powershell
Send-Mail `
  -SMTPServer "smtp.internal.local" `
  -From "notifications@contoso.com" `
  -To "primary@contoso.com","secondary@contoso.com" `
  -Cc "manager@contoso.com" `
  -Bcc "audit@contoso.com" `
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
