---
sidebar_position: 6
title: Logging
id: logging-overview
description: Functions related to log writing and fallback logging behavior.
---

# Logging

This page contains logging compatibility helpers used by Nebula.Automations.

## Write-Log

Compatibility wrapper exposed by Nebula.Automations when `Nebula.Log` is unavailable.

### Notes

- If `Nebula.Log` exists, its native `Write-Log` is used.
- Otherwise, Nebula.Automations exposes a compatible `Write-Log`/`Log-Message` flow.

## Notes

Use `Get-Help Write-Log -Detailed` for compatibility and output behavior details.