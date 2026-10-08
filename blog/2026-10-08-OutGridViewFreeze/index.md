---
slug: powershell-7-6-6-out-gridview-freeze
title: PowerShell 7.6.6 freezes on Out-GridView (and every -GridView switch)
date: 2026-10-08T12:00:00+02:00
authors: [gioxx]
tags: [powershell, core, scripts, nebula]
---

If you run a Nebula command with `-GridView` on **PowerShell 7.6.6** and the console stops responding, the command is not slow and nothing is wrong with your tenant. On that release `Out-GridView` never returns and never opens its window, so the session is stuck until you close it.

```powershell
Get-EntraGroupMembers "My Entra Group" -GridView   # never returns on PowerShell 7.6.6
```

The bug is in PowerShell itself, not in Nebula: a plain `Get-Process | Out-GridView` freezes in exactly the same way. Every Nebula command that offers `-GridView` is affected until you either update Nebula.Core or avoid that PowerShell release.

{/* truncate */}

:::danger[Current status — October 8, 2026]
The upstream report, [PowerShell/PowerShell issue #27994](https://github.com/PowerShell/PowerShell/issues/27994), is still open and no fixed PowerShell release has been confirmed yet. Starting with **Nebula.Core 1.3.0**, Nebula detects PowerShell 7.6.6 and no longer calls `Out-GridView` there. On older Nebula.Core versions, follow the workarounds below.
:::

## Am I affected?

Check the PowerShell version of the window you use for Nebula:

```powershell
$PSVersionTable.PSVersion
```

| PowerShell | `Out-GridView` |
| --- | --- |
| 7.6.6 | Freezes: no window, no error, the prompt never comes back |
| 7.6.5 | Works, according to the upstream report |
| Windows PowerShell 5.1 | Works |

In our test, `[pscustomobject]@{ A = 1 } | Out-GridView` was still running after 20 seconds in a clean `pwsh -NoProfile` session on 7.6.6 x64, with no window on screen and nothing on standard error. The same command returned in under a second on an older PowerShell 7 build and opened the grid as expected.

Several PowerShell 7 installations can live side by side (for example x64 under `C:\Program Files\PowerShell\7` and x86 under `C:\Program Files (x86)\PowerShell\7`), and Windows Terminal, VS Code and your `PATH` may each start a different one. Check the version in the exact window where the freeze happens.

## What is affected in Nebula

Any command that shows its results with `-GridView` freezes on 7.6.6:

- **Nebula.Core** — `Get-EntraGroupMembers`, `Get-EntraGroupUser`, `Get-EntraGroupDevice`, `Get-UserGroups`, `Search-EntraGroup`, `Search-EntraUser`, `Get-RoleGroupsMembers`, `Export-DistributionGroups`, `Export-DynamicDistributionGroups`, `Export-M365Group`, `Get-TenantMsolAccountSku`, `Get-IntuneProfileAssignmentsByGroup`, `Search-IntuneProfileLocation`, `Get-RoomDetails`, `Get-QuarantineToRelease`.
- **Nebula.Core** — `Test-SharedMailboxCompliance` opens the grid **by default**, so it freezes on 7.6.6 even if you don't add `-GridView`. Use `-GridView:$false` to get the objects back.
- **Nebula.Scripts** — `Intune\Get-IntuneApps.ps1 -GridView`. Version 1.0.3 of the script falls back to a console table on PowerShell 7.6.6.

Commands run without `-GridView` are not affected.

## What Nebula.Core 1.3.0 changes

Starting with Nebula.Core 1.3.0, every `-GridView` goes through one internal check. On PowerShell 7.6.6:

- Nebula prints a warning pointing to the upstream issue and **writes the results to the console** instead of opening the grid, so the command completes and you still get your data (you can pipe it to `Export-Csv`, `Format-Table`, and so on).
- `Get-QuarantineToRelease -GridView` normally lets you **select** which messages to release or delete. Since the selection grid can't be shown, Nebula treats it as **nothing selected**. Combined with `-ReleaseSelected` or `-DeleteSelected`, this means no message is released or deleted. Without this safeguard, a broken selection could have fallen back to acting on every quarantined message in the interval.

On every other PowerShell version, `-GridView` opens the grid exactly as before. When a fixed PowerShell release ships, nothing changes on your side: the check targets 7.6.6 only.

## Workarounds for older Nebula.Core versions

If you can't update Nebula.Core yet, pick one of these:

1. **Don't use `-GridView` on 7.6.6.** Let the command return objects and choose the output yourself:

   ```powershell
   Get-EntraGroupMembers "My Entra Group" | Format-Table -AutoSize
   Get-EntraGroupMembers "My Entra Group" | Export-Csv .\members.csv -NoTypeInformation
   ```

   For `Test-SharedMailboxCompliance`, pass `-GridView:$false` explicitly.

2. **Run grid-based work in Windows PowerShell 5.1** (`powershell.exe`), where `Out-GridView` works. Nebula.Core supports 5.1, but your Exchange Online and Microsoft Graph module versions must also support it.

3. **Install PowerShell 7.6.5** next to (or instead of) 7.6.6 until a fixed release is available. Remember that ExchangeOnlineManagement 3.10.0 and later require PowerShell 7.6.0 or later, so don't go below 7.6.

:::warning
If a session is already frozen, close the window (or end the `pwsh` process) and open a new one. Any Exchange Online or Microsoft Graph connection in that window is lost, so you'll need to reconnect.
:::

## Quarantine: be careful with older versions

On Nebula.Core versions before 1.3.0, `Get-QuarantineToRelease -GridView -ReleaseSelected` (or `-DeleteSelected`) freezes before any message is processed, so no message is released or deleted by mistake. The risk is a different one: if you end up removing `-GridView` to get the command to finish, there is no selection step any more, and `-ReleaseSelected`/`-DeleteSelected` apply to **every** message in the interval (each one still asks for confirmation unless you pass `-Confirm:$false`). On 7.6.6, run the command without `-ReleaseSelected`/`-DeleteSelected` to review the list first, then release individual messages with `Unlock-QuarantineMessageId`, or do the selection from Windows PowerShell 5.1.

## How to follow the issue

1. Follow [PowerShell/PowerShell issue #27994](https://github.com/PowerShell/PowerShell/issues/27994) for root cause and fix.
2. Check the [PowerShell releases](https://github.com/PowerShell/PowerShell/releases) before updating, and test `Get-Process | Out-GridView` in a fresh window after each update.
3. If a later release also freezes, please report it. Nebula's check is limited to 7.6.6 on purpose, so that a fixed release gets the grid back right away; any newly affected version has to be added to the check.

This article will be updated when a fixed PowerShell release is confirmed.
