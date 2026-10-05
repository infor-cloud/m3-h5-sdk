# Release Checklist

Generic checklist for publishing a new version of the M3 H5 SDK.
Replace `X.Y.Z` with the actual version number.

## Phase 1: Pre-release (next)

- [ ] Make sure you're on the feature branch
- [ ] Update version to pre-release (from `m3-odin` directory):
  ```
  npm run odin-update-version X.Y.Z-next.1
  ```
- [ ] Build the libraries to verify everything compiles:
  ```
  npm run build:libs
  ```
- [ ] Run unit tests:
  ```
  npm run test:once
  ```
- [ ] Make sure you're logged in to npm:
  ```
  npm whoami
  ```
  (if not, `npm login`)
- [ ] Publish the pre-release (the script auto-adds `--tag next` for `-next` versions):
  ```
  npm run odin-publish
  ```
- [ ] Verify the packages are published with the `next` tag:
  ```
  npm view @infor-up/m3-odin versions
  npm view @infor-up/m3-odin-angular versions
  npm view @infor-up/m3-odin-cli versions
  ```

## Phase 2: Test the pre-release

- [ ] Install the CLI globally:
  ```
  npm install -g @infor-up/m3-odin-cli@next
  ```
- [ ] Verify installed version:
  ```
  odin --version
  ```
- [ ] Create a new Angular+SoHo project:
  ```
  odin new test-X-Y-Z --angular --soho --install --skip-git -p https://your-m3-url -po https://your-portal-url
  ```
- [ ] Verify the project builds:
  ```
  cd test-X-Y-Z
  odin build
  ```
- [ ] Verify the project serves and API calls work:
  ```
  odin login path/to/your.ionapi
  odin serve --multi-tenant
  ```
- [ ] Click Load and verify user context is returned
- [ ] *(Optional)* Test a basic (non-Angular) project:
  ```
  odin new test-basic --soho --angular false --install --skip-git -p https://your-m3-url -po https://your-portal-url
  cd test-basic
  odin build
  ```
- [ ] Clean up test projects when done

## Phase 3: Final release

- [ ] Update version to final release:
  ```
  npm run odin-update-version X.Y.Z
  ```
- [ ] Make sure CHANGELOG.md is complete
- [ ] Commit and push feature branch
- [ ] Create pull request → `master`
- [ ] After PR review/merge, switch to `master` and pull:
  ```
  git checkout master
  git pull
  ```
- [ ] Publish the final version:
  ```
  npm run odin-publish
  ```
- [ ] Create a GitHub release:
  1. Go to https://github.com/infor-cloud/m3-h5-sdk/releases/new
  2. Choose tag: create new tag `vX.Y.Z` on `master`
  3. Set release title: `vX.Y.Z`
  4. Copy release notes from CHANGELOG.md into the description
  5. Click "Publish release"

## Phase 4: Documentation

- [ ] Build documentation:
  ```
  npm run odin-documentation
  ```
- [ ] Review docs locally:
  ```
  start m3-odin/docs/index.html
  ```
- [ ] Commit and push docs to `master`:
  ```
  git add m3-odin/docs
  git commit -m "Update API documentation for vX.Y.Z"
  git push
  ```
  GitHub Pages will automatically deploy from `master`.
  If push is rejected due to branch protection, create a branch and PR instead.

## Notes

- If you find issues during testing, bump to `X.Y.Z-next.2`, `X.Y.Z-next.3`, etc. and repeat phases 1-2.
- The `odin-publish` script builds and publishes all three packages (core, angular, cli) in sequence.
- Pre-release versions with `-next` in the name are automatically tagged as `next` on npm.
