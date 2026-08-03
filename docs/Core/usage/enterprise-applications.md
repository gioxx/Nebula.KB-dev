---
sidebar_position: 5
title: "Enterprise Applications"
description: Export, import, clone, and diff Enterprise Applications (App Registration + Service Principal) within the same Entra tenant.
hide_title: true
id: enterprise-applications
tags:
  - Compare-EnterpriseApplication
  - Copy-EnterpriseApplication
  - Enterprise Applications
  - Entra
  - Export-EnterpriseApplication
  - Import-EnterpriseApplication
  - Microsoft Graph
  - Nebula.Core
  - Service Principal
---

# Enterprise Applications

Requires Microsoft Graph (`Application.ReadWrite.All`, `Directory.Read.All` for write operations; `Application.Read.All` is enough for `Compare-EnterpriseApplication` when comparing two files). For full details and examples, run `Get-Help <FunctionName> -Detailed`.

These four cmdlets let you clone or diff an Enterprise Application (an Entra Application/App Registration plus its Service Principal) between environments in the **same tenant** — for example, building a production app from a tested one, or the other way around.

:::info[What is/isn't copied]
- Copied: display name, sign-in audience, identifier URIs, notes, tags, redirect URIs (Web/SPA/public client), required resource access (API permissions), app roles, exposed API scopes, owners, and — only when requested — App Role Assignments.
- Never copied: client secrets and certificates. Microsoft Graph never returns their values, so Nebula.Core can only capture and report their metadata (display name, key ID, expiry). You must create new credentials on the destination app yourself after cloning it.
:::

## Export-EnterpriseApplication
Read a source Enterprise Application and write a normalized JSON snapshot to disk.

**Syntax**

```powershell
Export-EnterpriseApplication -ApplicationName <String> -OutputPath <String> [-IncludeAppRoleAssignments] [-Force]
Export-EnterpriseApplication -ApplicationId <String> -OutputPath <String> [-IncludeAppRoleAssignments] [-Force]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `ApplicationName` | String | Display name of the source Enterprise Application. | Yes* | - |
| `ApplicationId` | String | Object ID of the source Application (use instead of `ApplicationName`). | Yes* | - |
| `OutputPath` | String | Destination JSON file path. | Yes | - |
| `IncludeAppRoleAssignments` | Switch | Also export App Role Assignments (users/groups assigned to the app). | No | `False` |
| `Force` | Switch | Overwrite `OutputPath` if it already exists. | No | `False` |

\*Use `ApplicationName` or `ApplicationId`.

**Examples**
```powershell
Export-EnterpriseApplication -ApplicationName "Contoso Test App" -OutputPath .\contoso-test-app.json
```

```powershell
Export-EnterpriseApplication -ApplicationName "Contoso Test App" -OutputPath .\contoso-test-app.json -IncludeAppRoleAssignments -Force
```

## Import-EnterpriseApplication
Create or update an Enterprise Application from a JSON snapshot file produced by `Export-EnterpriseApplication`. If no app with `-TargetDisplayName` exists it is created; if it exists, it is updated in place.

**Syntax**

```powershell
Import-EnterpriseApplication -InputPath <String> -TargetDisplayName <String> [-IncludeAppRoleAssignments] [-PassThru] [-WhatIf] [-Confirm]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `InputPath` | String | Path to the JSON snapshot file. | Yes | - |
| `TargetDisplayName` | String | Display name of the destination Enterprise Application. | Yes | - |
| `IncludeAppRoleAssignments` | Switch | Also apply App Role Assignments captured in the snapshot. | No | `False` |
| `PassThru` | Switch | Emit the apply-result summary object. | No | `False` |

**Examples**
```powershell
Import-EnterpriseApplication -InputPath .\contoso-test-app.json -TargetDisplayName "Contoso Prod App"
```

```powershell
Import-EnterpriseApplication -InputPath .\contoso-test-app.json -TargetDisplayName "Contoso Prod App" -IncludeAppRoleAssignments -PassThru
```

:::info[No credentials are created]
The destination app will have no client secret or certificate after import — it cannot authenticate anywhere until you create one for it (Portal, `Update-MgApplication`, or your own automation).
:::

## Copy-EnterpriseApplication
Clone a source Enterprise Application directly into a new or existing destination, in one step, without writing an intermediate file. Equivalent to `Export-EnterpriseApplication` followed by `Import-EnterpriseApplication`, done in memory.

**Syntax**

```powershell
Copy-EnterpriseApplication -SourceApplicationName <String> -TargetDisplayName <String> [-IncludeAppRoleAssignments] [-PassThru] [-WhatIf] [-Confirm]
Copy-EnterpriseApplication -SourceApplicationId <String> -TargetDisplayName <String> [-IncludeAppRoleAssignments] [-PassThru] [-WhatIf] [-Confirm]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `SourceApplicationName` | String | Display name of the source Enterprise Application. | Yes* | - |
| `SourceApplicationId` | String | Object ID of the source Application (use instead of `SourceApplicationName`). | Yes* | - |
| `TargetDisplayName` | String | Display name of the destination Enterprise Application. Created if missing, updated if it exists. | Yes | - |
| `IncludeAppRoleAssignments` | Switch | Also copy App Role Assignments (users/groups assigned to the app). | No | `False` |
| `PassThru` | Switch | Emit the apply-result summary object. | No | `False` |

\*Use `SourceApplicationName` or `SourceApplicationId`.

**Examples**
```powershell
Copy-EnterpriseApplication -SourceApplicationName "Contoso Test App" -TargetDisplayName "Contoso Prod App"
```

```powershell
Copy-EnterpriseApplication -SourceApplicationName "Contoso Test App" -TargetDisplayName "Contoso Prod App" -IncludeAppRoleAssignments -PassThru
```

## Compare-EnterpriseApplication
Diff two Enterprise Applications — each side can independently be a JSON snapshot file or a live application looked up by name/ID. Returns the differing properties on the pipeline, and can optionally write a JSON or CSV report.

**Syntax**

```powershell
Compare-EnterpriseApplication (-ReferencePath <String> | -ReferenceApplicationName <String> | -ReferenceApplicationId <String>) (-DifferencePath <String> | -DifferenceApplicationName <String> | -DifferenceApplicationId <String>) [-IncludeAppRoleAssignments] [-OutputReportPath <String>] [-PassThru]
```

| Parameter | Type | Description | Required | Default |
| --- | --- | --- | :---: | --- |
| `ReferencePath` | String | JSON snapshot file for the reference ("A") side. | Yes** | - |
| `ReferenceApplicationName` | String | Display name of a live application for the reference side. | Yes** | - |
| `ReferenceApplicationId` | String | Object ID of a live application for the reference side. | Yes** | - |
| `DifferencePath` | String | JSON snapshot file for the difference ("B") side. | Yes** | - |
| `DifferenceApplicationName` | String | Display name of a live application for the difference side. | Yes** | - |
| `DifferenceApplicationId` | String | Object ID of a live application for the difference side. | Yes** | - |
| `IncludeAppRoleAssignments` | Switch | Also compare App Role Assignments. | No | `False` |
| `OutputReportPath` | String | Optional report file. Written as JSON if the path ends in `.json`, otherwise as CSV. | No | - |
| `PassThru` | Switch | Accepted for symmetry with the other cmdlets; diff rows are always returned regardless. | No | `False` |

\*\*Use exactly one of the three Reference parameters, and exactly one of the three Difference parameters. Comparing two files requires no Microsoft Graph connection at all.

**Examples**
```powershell
Compare-EnterpriseApplication -ReferencePath .\contoso-test-app.json -DifferenceApplicationName "Contoso Prod App"
```

```powershell
Compare-EnterpriseApplication -ReferenceApplicationName "Contoso Test App" -DifferenceApplicationName "Contoso Prod App" -OutputReportPath .\diff.csv
```

```powershell
Compare-EnterpriseApplication -ReferencePath .\before.json -DifferencePath .\after.json -OutputReportPath .\diff.json
```

:::info[Secrets/certificates in the report]
`Compare-EnterpriseApplication` reports credential metadata (expiry, key ID) as ordinary diff rows so you can spot an expiring or missing secret between environments — it never compares or reports the secret/certificate values themselves, since Graph doesn't expose them.
:::
