---
sidebar_position: 2
title: Microsoft Graph overview
id: graph-overview
description: Functions for Microsoft Graph connectivity and validation.
---

# Microsoft Graph

This page covers Graph connectivity checks used by automation scripts.

## Test-MgGraphConnection

Validate and initialize Microsoft Graph connectivity, with optional auto-install behavior.

### Syntax

```powershell
Test-MgGraphConnection [-TenantId <String>] [-ClientId <String>] [-ClientSecret <String>]
                       [-AutoInstall] [-LogLocation <String>] [-ShowInformations]
```

### Typical use

```powershell
$ok = Test-MgGraphConnection `
  -TenantId "00000000-0000-0000-0000-000000000000" `
  -ClientId "11111111-1111-1111-1111-111111111111" `
  -ClientSecret $secret `
  -AutoInstall
```

## Notes

Use `Get-Help Test-MgGraphConnection -Detailed` for complete parameter behavior and authentication options.
