---
slug: MC1248389
title: Retirement of -Credential parameter when connecting to Exchange Online PowerShell
date: 2026-03-11T01:08:00+01:00
authors: [gioxx]
tags: [microsoft, exchange, powershell, core]
---

### Introduction

Microsoft is retiring the [-Credential](https://learn.microsoft.com/powershell/module/exchangepowershell/connect-exchangeonline?view=exchange-ps#-credential) parameter used when connecting to Exchange Online PowerShell. Starting with module versions released in July 2026 and later, the -Credential parameter will be removed from both [Connect-ExchangeOnline](https://learn.microsoft.com/powershell/module/exchangepowershell/connect-exchangeonline?view=exchange-ps) and [Connect-IppsSession](https://learn.microsoft.com/powershell/module/exchangepowershell/connect-ippssession?view=exchange-ps) cmdlets. Organizations using this parameter in automation scripts must migrate to a supported authentication method before that date. This change improves security by moving away from legacy authentication methods that do not support modern protections such as multifactor authentication (MFA).

<!-- truncate -->

### When this will happen

- The **-Credential parameter** will be removed from `Connect-ExchangeOnline` and `Connect-IppsSession` cmdlets in **Exchange Online PowerShell** module versions released beginning **July 2026**.
- A separate server-side retirement of the underlying authentication flow is planned for a later date and will be communicated in advance.

### How this affects your organization

#### Who is affected

- Microsoft 365 administrators using **Exchange Online** or **Security & Compliance PowerShell**
- Organizations with automation scripts that use the **`-Credential` parameter**

#### What will happen

- If your organization uses the **`-Credential` parameter** in PowerShell scripts or automation workflows connecting to **Exchange Online** or **Security & Compliance PowerShell**, those scripts will break when you update to an Exchange Online PowerShell module version released beginning **July 2026**.
- No impact if your organization does not use the **`-Credential` parameter**

:::note Impact on Nebula modules (starting July 2026)
For the **Nebula** ecosystem, the direct impact is concentrated on **Exchange Online / Purview** connection flows.

- **Nebula.Core (high impact):** any function path that relies on `Connect-ExchangeOnline` and/or `Connect-IPPSSession` may fail starting **July 2026** if it still uses `-Credential` and the `ExchangeOnlineManagement` module is upgraded to a version released from that date onward. This includes EXO-dependent commands and Compliance/Purview scenarios.
- **Nebula.Automations (low to no direct impact):** current Graph-based and SMTP credential usage is not part of this retirement. It would only be impacted if EXO/Purview wrappers using `-Credential` are introduced or still exist outside current docs.
- **Nebula.Tools / Nebula.Log (no known direct impact):** these modules do not currently expose EXO/Purview connection entry points documented with `Connect-ExchangeOnline`/`Connect-IPPSSession -Credential`.
- **Risk timeline:** the first breaking point is **client-side** (triggered when upgrading the Exchange Online PowerShell module in/after July 2026). A later **server-side** retirement is also planned by Microsoft; at that point, old module versions will no longer be a workaround.

### What we will do

- Run a targeted audit across all `Nebula.*` repositories to identify any usage of `Connect-ExchangeOnline` / `Connect-IPPSSession` with `-Credential`.
- Migrate affected flows to supported methods: modern interactive auth (MFA), app-only auth (certificate or client secret), or managed identity where applicable.
- Update docs, examples, and operational runbooks so unattended automations do not regress.
- Add regression tests for EXO/Purview connection paths before promoting `ExchangeOnlineManagement` module updates to production baselines.
- Keep module update policies conservative until migration is complete, to avoid accidental breakage in production environments.
:::

### What you can do to prepare

- If you are using the **`-Credential` parameter**, begin migrating your scripts now. Do not wait until **July 2026**. Choose the appropriate alternative based on your scenario:
    - **Interactive admin access**: Switch to modern authentication with MFA. Learn more: [Connect to Exchange Online PowerShell](https://learn.microsoft.com/powershell/exchange/connect-to-exchange-online-powershell?view=exchange-ps).
    - **Automation outside Azure**: Use app-only authentication (certificate-based or client secret). Learn more: [App-only authentication for unattended scripts in Exchange OnlinePowerShell and Security & Compliance PowerShell](https://learn.microsoft.com/powershell/exchange/app-only-auth-powershell-v2?view=exchange-ps).
    - **Automation within Azure**: Use managed identity authentication (no secrets required). Learn more: [Use Azure managed identities to connect to Exchange Online PowerShell](https://learn.microsoft.com/powershell/exchange/connect-exo-powershell-managed-identity?view=exchange-ps).
- Review internal documentation and communicate changes to admins
- If you are not using the **`-Credential` parameter**, no action is required.

### Additional information

This change iscurrently **client-side only** and will not take effect automatically. Your existing scripts will continue to work if you continue using an Exchange Online PowerShell module version released before **July 2026**. The **`-Credential` parameter** will only be removed when you upgrade to a module version released in **July 2026** and later.

A separate **server-side retirement** of the Credential parameter authentication flow is planned for a later date.When that occurs, the **`-Credential` parameter** will stop functioning even on older module versions. Microsoft will communicate that timeline separately and provide advance notice before any service-side changes take effect.

We strongly recommend migrating proactively rather than waiting, to avoid disruption when either change occurs. If you have questions or concerns, contact Microsoft Support or leave a comment on the [Exchange Team Blog](https://techcommunity.microsoft.com/blog/exchange/deprecation-of-the--credential-parameter-in-exchange-online-powershell/4494584) post.

### Compliance considerations

| Compliance area | Impact |  
| --- | --- |
| Conditional Access policies | Retiring the `-Credential` parameter removes use of the ROPC authentication flow and enables enforcement of Conditional Access and multifactor authentication for Exchange Online PowerShell connections. |
