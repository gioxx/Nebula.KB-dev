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

Requires Microsoft Graph (`Application.ReadWrite.All`, `Directory.Read.All` for write operations, plus `AppRoleAssignment.ReadWrite.All` when `-IncludeAppRoleAssignments` is used; `Application.Read.All` is enough for `Compare-EnterpriseApplication` when comparing two files). For full details and examples, run `Get-Help <FunctionName> -Detailed`.

These four cmdlets let you clone or diff an Enterprise Application (an Entra Application/App Registration plus its Service Principal) between environments in the **same tenant** — for example, building a production app from a tested one, or the other way around.

:::info[What is/isn't copied]
These cmdlets copy a fixed set of settings, listed below. Anything not listed is not copied: check it on the destination after cloning.

| Object | Copied settings |
| --- | --- |
| Application | display name, sign-in audience, notes, tags, fallback public client, redirect URIs (Web, SPA, public client), Web home page and logout URLs, implicit grant settings, required resource access (API permissions), app roles, group membership claims, optional claims |
| Exposed API | permission scopes, pre-authorized client applications, known client applications, requested access token version, mapped claims |
| Service Principal | tags, homepage, "Assignment required", enabled state |
| Owners | owners of the application and of the Service Principal |
| App Role Assignments | users and groups assigned to the app, only with `-IncludeAppRoleAssignments` |

- Added, never removed: owners and App Role Assignments. Those the destination already has and the source doesn't are kept, so an environment's own owners stay in place; `Compare-EnterpriseApplication` still lists them as differences.
- Not supported: SAML and password-based single sign-on. Their signing certificates and SSO settings are not copied; Nebula.Core warns when the source uses them, and you must configure single sign-on on the destination yourself.
- Not copied: identifier URIs (Application ID URI), because they must be unique in the tenant. Nebula.Core warns with the source value so you can set a new one on the destination.
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
Create or update an Enterprise Application from a JSON snapshot file produced by `Export-EnterpriseApplication`. If no app with `-TargetDisplayName` exists it is created; if it exists, it is updated in place. The file must be a complete version 1 snapshot: a file from another tool, a partial file or another schema version is refused before anything is changed.

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
