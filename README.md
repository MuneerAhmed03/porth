# Porth

Turn a Vite web app into a sideloadable Android app, with durable local data.

> **Status: pre-alpha.** APIs, package names, and the APK build flow are still changing.
> Porth is not published on npm yet.

## Packages

| Package | Purpose |
| --- | --- |
| [`porth`](https://github.com/MuneerAhmed03/porth-core) | Local storage and SQLite for browser and Android, including optional Drizzle support |
| `porth-cli` | `porth build`, `porth dev`, `porth dev-build`, and `porth drizzle bundle` |
| [`porth-shell`](https://github.com/MuneerAhmed03/porth-shell) | Android WebView shell, JavaScript bridge, and Docker APK builder |

## Repository layout

This repository uses two git submodules:

```bash
git clone --recurse-submodules https://github.com/MuneerAhmed03/porth.git
# or, after cloning:
git submodule update --init --recursive
```

```text
porth/
  porth-cli/    # CLI package
  porth-core/   # core package (submodule)
  porth-shell/  # Android shell and builder (submodule)
  skills/       # agent guidance for building storage layers
```

## What it does

- `porth dev` starts Vite on `0.0.0.0:5173` for live reload on a phone.
- `porth dev-build` builds a development APK that loads from your local dev server.
- `porth build` builds a signed production APK inside a Dockerized Android builder.
- `porth drizzle bundle` converts Drizzle Kit migrations into a runtime module for the browser and Android.

## Current limitations

- The default Docker builder image is not published yet. Until it is, pass `--builder-image` with a locally built image.
- Browser `DB` is currently in-memory and loads `sql.js` from a CDN. Browser SQLite persistence is on the roadmap.
- No stable release, license, or published npm package yet.
