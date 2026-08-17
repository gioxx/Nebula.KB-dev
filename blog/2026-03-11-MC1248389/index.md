---
slug: MC1248389
title: Retirement of -Credential parameter when connecting to Exchange Online PowerShell
date: 2026-03-11T01:08:00+01:00
authors: [gioxx]
tags: [microsoft, exchange, powershell, core]
---

:::info[Update - July 16, 2026]
Based on customer feedback, Microsoft postponed the client-side removal of the `-Credential` parameter. New Exchange Online PowerShell module releases will stop supporting it beginning in **December 2026**, not July 2026 as originally announced.

The retirement has not been cancelled, but the additional time removes the immediate July deadline and gives administrators a longer migration window.
:::

### Introduction

Microsoft is retiring the [`-Credential`](https://learn.microsoft.com/powershell/module/exchangepowershell/connect-exchangeonline?view=exchange-ps#-credential) parameter used when connecting to Exchange Online PowerShell. Starting with module versions released in **December 2026** and later, the parameter will be removed from both [`Connect-ExchangeOnline`](https://learn.microsoft.com/powershell/module/exchangepowershell/connect-exchangeonline?view=exchange-ps) and [`Connect-IppsSession`](https://learn.microsoft.com/powershell/module/exchangepowershell/connect-ippssession?view=exchange-ps).

The change moves administrators and automation away from the Resource Owner Password Credentials (ROPC) flow, which cannot satisfy modern protections such as multifactor authentication and Conditional Access.

{/* truncate */}

### When this will happen

- The **`-Credential` parameter** will continue to function in Exchange Online PowerShell modules released before December 2026.
- New module versions released beginning in **December 2026** will remove it from `Connect-ExchangeOnline` and `Connect-IppsSession`.
- Microsoft plans a separate server-side retirement of the underlying authentication flow. That date has not yet been announced and will be communicated in advance.

### How this affects your organization

#### Who is affected

- Microsoft 365 administrators using Exchange Online or Security & Compliance PowerShell.
- Organizations with scripts or automation workflows that pass the **`-Credential` parameter** to `Connect-ExchangeOnline` or `Connect-IppsSession`.

#### What will happen

- Affected scripts will fail after they are moved to an Exchange Online PowerShell module released from December 2026 onward.
- Scripts using supported interactive authentication, certificate-based app-only authentication, or managed identity are not affected by this parameter removal.
- If your code does not use **`-Credential`**, no action is required specifically for MC1248389.

:::info
### Impact on Nebula modules (starting December 2026)

The current Nebula connection implementation does **not** pass `-Credential` to Exchange Online. `Nebula.Core` uses modern interactive authentication, with WAM enabled by default and a non-WAM fallback when required. Therefore, no currently documented Nebula connection path has a direct breaking dependency on the parameter being retired.

- **Nebula.Core:** no known direct impact in the current connection code. External scripts that wrap Nebula and call `Connect-ExchangeOnline` or `Connect-IppsSession -Credential` remain in scope.
- **Nebula.Automations:** no known direct impact. Graph authentication and SMTP credentials are separate from this retirement.
- **Nebula.Tools / Nebula.Log:** no known direct impact; these modules do not expose Exchange Online or Purview connection entry points using `-Credential`.
- **Risk timeline:** the first change remains client-side and is now associated with module releases beginning in December 2026. A later server-side retirement could eventually affect older modules too, but Microsoft has not published that schedule.

#### What we will do

- Continue monitoring the Exchange Team announcement and ExchangeOnlineManagement release notes.
- Keep Nebula connection documentation aligned with supported modern authentication methods.
- Recheck the repositories before the December 2026 module releases in case new Exchange Online or Purview automation paths are introduced.
- Avoid urgent Nebula code changes for MC1248389 while no direct use of `-Credential` exists.
:::

:::note
The [Exchange Online and Microsoft Graph PowerShell assembly clash](/news/exchange-online-graph-assembly-clash) observed with recent module versions is a separate issue. It affects modern authentication dependencies and is not caused by MC1248389.
:::

### What you can do to prepare

There is no longer a July emergency deadline, but scripts that still use `-Credential` should be inventoried and migrated before adopting Exchange Online PowerShell releases published from December 2026 onward.

Choose the supported authentication method that matches the scenario:

- **Interactive administrator access:** use modern interactive authentication with MFA. See [Connect to Exchange Online PowerShell](https://learn.microsoft.com/powershell/exchange/connect-to-exchange-online-powershell?view=exchange-ps).
- **Automation outside Azure:** use certificate-based app-only authentication. See [App-only authentication for unattended scripts in Exchange Online PowerShell and Security & Compliance PowerShell](https://learn.microsoft.com/powershell/exchange/app-only-auth-powershell-v2?view=exchange-ps).
- **Automation hosted in Azure:** use managed identity authentication. See [Use Azure managed identities to connect to Exchange Online PowerShell](https://learn.microsoft.com/powershell/exchange/connect-exo-powershell-managed-identity?view=exchange-ps).

Also:

- review internal scripts, scheduled tasks, runbooks, and documentation;
- pin and test ExchangeOnlineManagement versions used by production automation;
- communicate the revised December timeline without treating the postponement as a cancellation;
- take no MC1248389-specific action if your workflows do not use `-Credential`.

### Additional information

The announced December 2026 change is **client-side**. Existing scripts can continue to use `-Credential` while running an Exchange Online PowerShell module released before that cutoff.

This does not make old modules a permanent solution. Microsoft still plans a separate service-side retirement of the ROPC-based flow, at which point keeping an older module will no longer be sufficient. That schedule will be announced separately.

The authoritative status and future timeline changes are published in the [Exchange Team Blog announcement](https://techcommunity.microsoft.com/blog/exchange/deprecation-of-the--credential-parameter-in-exchange-online-powershell/4494584). Review that post and MC1248389 in the Microsoft 365 Message Center before changing production baselines.

### Compliance considerations

| Compliance area | Impact |
| --- | --- |
| Conditional Access and MFA | Retiring `-Credential` removes a connection path based on ROPC, which cannot satisfy MFA and is incompatible with modern Conditional Access requirements. |
