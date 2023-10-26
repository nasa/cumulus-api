# Releasing a new Cumulus API version

## Releasing a version

### 1. Create a branch for the new release

#### From Master

Create a branch titled `release-MAJOR.MINOR.x` for the release (use a literal x
for the patch version).

```shell
    git checkout -b release-MAJOR.MINOR.x
```
e.g.:
```shell
    git checkout -b release-9.1.x
```

If creating a new major version release from master, say `5.0.0`, then the
branch would be named `release-5.0.x`. If creating a new minor version release
from master, say `1.14.0` then the branch would be named `release-1.14.x`.

Push the `release-MAJOR.MINOR.x` branch to GitHub if it was created locally.
(Commits should be even with master at this point.)

If creating a patch release, you can check out the existing base branch. NOTE:
We **should not** create a patch release if there is no API update.

### 2. Create a git tag for the release

From the minor version base branch (`release-1.2.x`), create and push a new git
tag:

```bash
    git tag -a vMAJOR.MINOR.PATCH -m "Release MAJOR.MINOR.PATCH"
    git push origin vMAJOR.MINOR.PATCH
```
e.g.:
```shell
    git tag -a v9.1.0 -m "Release 9.1.0"
    git push origin v9.1.0
```

### 3. Generate the API document

```bash
    npm install
```
```bash
    npm run build vMAJOR.MINOR.PATCH
```
e.g.:
```shell
    npm run build v9.1.0
```

You can view the generated API document with `npm run serve-all`.

### 4. Add the new API document

Add the new API document link to `website/index.html`, and add to the commit with `git add
website/index.html`.

```bash
    git add website/vMAJOR.MINOR.PATCH
    git commit -m "Release MAJOR.MINOR.PATCH"
```
e.g.:
```shell
    git add website/v9.1.0 website/index.html
    git commit -m "Release 9.1.0"
```

### 5: Create a PR against master
