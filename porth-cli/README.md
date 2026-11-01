# porth-cli

Build and run Vite apps as sideloadable Android APKs.

> **Status: pre-alpha.** The Docker builder image is not published yet.

```bash
npm install -g porth-cli
porth --help
```

Or run it without a global install:

```bash
npx porth-cli --help
```

## Commands

```bash
porth dev          # start Vite on 0.0.0.0:5173 for phone live reload
porth dev-build    # build dist/app-dev.apk that loads your dev server
porth build        # build a signed dist/app.apk
porth drizzle bundle
```

## Requirements

- Node.js 18+
- Docker for `build` and `dev-build`
- A locally built or published Porth builder image

```bash
porth build --builder-image ghcr.io/YOUR_ACCOUNT/porth-builder:0.1.0
```

## App configuration

`porth` creates `.porth/config.json` on first build:

```json
{
  "packageName": "com.example.myapp",
  "versionCode": 1,
  "keystorePath": ".porth/keystore/release.p12"
}
```

Keep `.porth/keystore/` backed up. Losing it means you cannot ship updates that Android
will install over the previous version.

## Links

- Core package: <https://github.com/MuneerAhmed03/porth-core>
- Monorepo: <https://github.com/MuneerAhmed03/porth>
