## 1. Makefile

- [x] 1.1 Add `ci` target to Makefile that runs `make lint && make test`

## 2. CI workflow

- [x] 2.1 Create `.github/workflows/ci.yaml` that triggers on PRs to main and pushes to main
- [x] 2.2 Add steps: checkout, setup Node 20, `npm ci`, `make ci`

## 3. Release workflow

- [x] 3.1 Create `.github/workflows/release.yaml` that triggers on pushes to main
- [x] 3.2 Add Release Please step using `googleapis/release-please-action@v4` with Node release type
- [x] 3.3 Add conditional publish job that runs when `releases_created` is true
- [x] 3.4 Configure publish job with `id-token: write` permission and `npm publish --provenance`
- [x] 3.5 Configure `NPM_TOKEN` secret as `NODE_AUTH_TOKEN` environment variable

## 4. Verify

- [x] 4.1 Push branch and confirm CI workflow runs lint and tests
- [x] 4.2 Add `NPM_TOKEN` secret to GitHub repo settings
