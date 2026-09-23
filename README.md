# Shaco Forge

## Overview

Shaco Forge is a Windows desktop application with an Electron interface, a local worker, and a native carrier.

## Release

v1.0.0 source release.

## Development

Use Node.js 22.19.0 and pnpm 11.7.0. From the repository root:

```sh
pnpm install
pnpm build
pnpm typecheck
pnpm verify:static
pnpm verify:theme
```

The build requires .NET 10 and `SHACO_FORGE_HARNESS_ROOT` pointing to the frozen Harness source. Static verification also needs that Harness root to resolve its public exports.

## Repository Model

This repository is a curated public release mirror.
