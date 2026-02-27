---
sidebar_position: 3
title: 'Scripts'
description: How Nebula.Scripts fits into the Nebula ecosystem, between standalone utilities and module candidates.
hide_title: true
id: Scripts
tags:
  - Scripts
  - Nebula.Scripts
  - PowerShell
---

# Nebula: Scripts

This page explains the role of [Nebula.Scripts](https://github.com/gioxx/Nebula.Scripts) inside the Nebula ecosystem.

Unlike the module-focused repositories, `Nebula.Scripts` is designed to stay flexible:
- it hosts practical, ready-to-run scripts;
- it can include scripts also published on PowerShell Gallery;
- it acts as an incubation area for automations that may later move into a Nebula module (especially `Nebula.Core`);
- some scripts may remain standalone permanently, when migration would add little value.

## How to read script documentation
Each script page should clarify:
- what the script does and when to use it;
- whether it is standalone-only or a candidate for module integration;
- where to find its PowerShell Gallery package (if available);
- dependencies, execution context, and operational notes.

:::note
`Nebula.Scripts` is intentionally not a temporary parking lot only.
The objective is to keep useful automation available, regardless of whether it will ever become part of a module.
:::

## Typical use cases
Use scripts documentation when you need:
- quick operational utilities;
- reusable building blocks not yet in modules;
- preserved historical scripts that are still useful in real-world scenarios.
