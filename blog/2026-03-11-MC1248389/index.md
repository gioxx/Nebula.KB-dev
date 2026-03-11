---
slug: MC1248389
title: Retirement of -Credential parameter when connecting to Exchange Online PowerShell
authors: [gioxx]
tags: [microsoft, exchange, powershell, core]
---

### Introduction

Microsoft is retiring the [-Credential](https://learn.microsoft.com/powershell/module/exchangepowershell/connect-exchangeonline?view=exchange-ps#-credential) parameter used when connecting to Exchange Online PowerShell. Starting with module versions released in July 2026 and later, the -Credential parameter will be removed from both [Connect-ExchangeOnline](https://learn.microsoft.com/powershell/module/exchangepowershell/connect-exchangeonline?view=exchange-ps) and [Connect-IppsSession](https://learn.microsoft.com/powershell/module/exchangepowershell/connect-ippssession?view=exchange-ps) cmdlets. Organizations using this parameter in automation scripts must migrate to a supported authentication method before that date. This change improves security by moving away from legacy authentication methods that do not support modern protections such as multifactor authentication (MFA).

<!-- truncate -->

Simply add Markdown files (or folders) to the `blog` directory.

Regular blog authors can be added to `authors.yml`.

The blog post date can be extracted from filenames, such as:

- `2019-05-30-welcome.md`
- `2019-05-30-welcome/index.md`

A blog post folder can be convenient to co-locate blog post images:

The blog supports tags as well!

**And if you don't want a blog**: just delete this directory, and use `blog: false` in your Docusaurus config.
