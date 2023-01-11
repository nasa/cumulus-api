# Releasing a new Cumulus API version

## Releasing a version

### 1. Create a branch for the new release

#### From Master

Create a branch titled `release-MAJOR.MINOR.x` for the release (use a literal x for the patch version).

```shell
    git checkout -b release-MAJOR.MINOR.x

e.g.:
    git checkout -b release-9.1.x
```

If creating a new major version release from master, say `5.0.0`, then the branch would be named `release-5.0.x`. If creating a new minor version release from master, say `1.14.0` then the branch would be named `release-1.14.x`.

Push the `release-MAJOR.MINOR.x` branch to GitHub if it was created locally. (Commits should be even with master at this point.)

If creating a patch release, you can check out the existing base branch. NOTE: We **should not** create a patch release if there is no API update.

### 2. Create a git tag for the release

From the minor version base branch (`release-1.2.x`), create and push a new git tag:

```bash
    git tag -a vMAJOR.MINOR.PATCH -m "Release MAJOR.MINOR.PATCH"
    git push origin vMAJOR.MINOR.PATCH

e.g.:
    git tag -a v9.1.0 -m "Release 9.1.0"
    git push origin v9.1.0
```

### 3. Generate the API documentation

```bash
    npm install
```
```bash
    npm run build vMAJOR.MINOR.PATCH

e.g.:
    npm run build v9.1.0
```

### 4. View and commit the generated document

```bash
    npm run serve-all
```
```bash
    git add website/vMAJOR.MINOR.PATCH
    git commit -m "Release MAJOR.MINOR.PATCH"

e.g.:
    git add website/v9.1.0
    git commit -m "Release 9.1.0"
```

### 5: Create a PR against master