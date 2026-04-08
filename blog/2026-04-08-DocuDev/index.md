---
slug: DocuDev
title: "Differences between the available versions of the documentation"
date: 2026-04-08T09:00:00+02:00
authors: [gioxx]
tags: [nebula, kb, documentation, dev]
---

If you ever check both [Nebula.KB-dev](https://gioxx.github.io/Nebula.KB-dev) and [kb.gioxx.org](https://kb.gioxx.org), there is one simple rule to keep in mind: the `-dev` documentation is usually the most up to date.

This is not just a technical detail. `Nebula.KB-dev` is a clone of Nebula.KB built to follow the development versions of the various modules, so it usually reflects what will later appear in production releases before the public site does.

In practice, if a Nebula module is about to get new features, fixes, or important changes, the updated documentation is very likely already available on `Nebula.KB-dev` first.

That does not mean `kb.gioxx.org` is "_old_" or should be ignored. It simply serves a different purpose: the main site remains the stable reference for the released version, while the `-dev` branch is the right place to see what is coming next.

:::warning
There is also an important caveat: using modules that have not yet been officially released on the PowerShell Gallery can mean running into instability, incomplete behavior, or bugs that have not been fixed yet. In other words, if you choose to download the latest builds directly from GitHub before they are published, you do so at your own risk.
:::

In short:

- [kb.gioxx.org](https://kb.gioxx.org) = documentation for the production version
- [Nebula.KB-dev](https://gioxx.github.io/Nebula.KB-dev) = documentation for the development version
- if you want to see what is coming next, start with `Nebula.KB-dev`

When a Nebula module is being prepared for a new release, the `-dev` documentation is usually the best place to check first, even if some features are still being tested and may change before the official release.
