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
porth doctor       # diagnose your environment when a build fails
```

## Requirements

- Node.js 18+
- Docker for `build` and `dev-build`
- A locally built or published Porth builder image

```bash
porth build --builder-image ghcr.io/YOUR_ACCOUNT/porth-builder:0.2.0
```

### Platform note (Apple Silicon)

`porth` always builds in a `linux/amd64` container (Google's `aapt2` ships x86_64-only).
Docker Desktop and OrbStack run amd64 under Rosetta automatically. If you use **colima**,
enable x86_64 emulation:

```bash
colima start --arch x86_64 --vz-rosetta
```

### Troubleshooting

```bash
porth doctor
```

checks Node, Docker, and amd64-container support, and prints the exact fix for each failure.

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
