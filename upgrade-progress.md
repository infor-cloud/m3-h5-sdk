# H5 SDK v9.0.0 Upgrade Progress

Branch: `angular-20`  
Started: 2026-08-03

---

## Completed ✅

### Phase 1: Angular 20 + Zoneless

- [x] Created `angular-20` branch from `master`
- [x] Updated `m3-odin/` workspace to Angular 20, TypeScript 5.8, ng-packagr 20
- [x] Updated `tsconfig.json` — `moduleResolution: "bundler"`, ES2022 target/lib
- [x] Updated `angular.json` — switched samples app to `application` builder, removed Protractor e2e project
- [x] Removed zone.js as runtime dependency (kept as devDependency for test runner)
- [x] Added `provideM3Odin()` standalone provider function
- [x] Made all services `@Injectable()` (provided via `provideM3Odin()`)
- [x] `MIService` now uses Angular `HttpClient` (zoneless compatible)
- [x] `FormService` now uses Angular `HttpClient` (zoneless compatible)
- [x] `DatePipe` made standalone
- [x] `M3OdinModule` kept as deprecated compat shim
- [x] Both libraries build cleanly (`npm run build:libs` ~2s)
- [x] Fixed CSRF token fetch to use `responseType: 'text'` (required for HttpClient)

### Phase 2: IDS Enterprise NG 20

- [x] Updated `ids-enterprise-ng` to `^20.1.0` in workspace and boilerplate
- [x] Boilerplate angular.json still references jQuery/d3/sohoxi scripts (same pattern as IDS 18, works with 20)
- [x] Verified IDS 20 renders correctly (SoHo busyindicator, buttons, inputs, icons)

### Phase 3: CLI Modernization

- [x] CLI version bumped to 9.0.0
- [x] `@angular/cli` dependency updated to ^20.0.0
- [x] TypeScript updated to ~5.8
- [x] Engine requirement bumped to `>=20.11.0`
- [x] `odin new` no longer forces `--standalone=false` or old `browser` builder
- [x] `odin new` removes Angular's default generated app files before copying boilerplate
- [x] `odin new` strips zone.js from build polyfills (zoneless by default)
- [x] Boilerplate templates fully modernized (standalone, zoneless, provideM3Odin)
- [x] Boilerplate includes `main.ts` that bootstraps `AppComponent` correctly
- [x] CLI builds cleanly (`npm run build`)
- [x] `odin --version` reports 9.0.0
- [x] `odin new` generates correct Angular 20 project structure (verified locally)
- [x] Multi-tenant proxy updated for Vite-based dev server (`configure(proxy)` pattern)

### Phase 4: Testing & CI

- [x] Rewrote `mi-service-core.spec.ts` to match the v8 Observable-based API
- [x] Added zone.js polyfills to karma test config
- [x] All 196 unit tests pass in ChromeHeadless
- [x] CI workflow updated to Node 22, added `angular-20` branch trigger
- [x] Removed reference to deprecated Protractor

### End-to-End Verification

- [x] Generated Angular+SoHo project with `odin new`
- [x] Installed SDK libs via `npm pack` (file: protocol has issues on Windows)
- [x] IDS 20 components render correctly
- [x] Multi-tenant proxy authenticates and forwards MNE cookies
- [x] CSRF token fetch works (responseType: 'text' fix)
- [x] MI API call (GetUserData) succeeds via v2 endpoint
- [x] User context returned and logged correctly (JEHRNSTROM 400/AAA)
- [x] UI updates with `markForCheck()` workaround (signals TODO for boilerplate)

### Documentation

- [x] `CHANGELOG.md` — v9.0.0 entry with breaking changes + upgrade guide
- [x] `DEVELOPER.md` — local development workflow guide

---

## Ready for Manual Testing 🧪

These items are done but need hands-on verification:

1. **Generate a new Angular+Soho project and build it**
   ```bash
   odin new test-app --angular --soho --skip-git -p https://your-m3-url -po https://your-portal-url
   cd test-app
   # Edit package.json to use file: refs for m3-odin/m3-odin-angular
   npm install
   odin build
   ```
   _Purpose: Verify the full scaffolding works end-to-end with IDS 20._

2. **Serve a generated app and verify IDS components render**
   ```bash
   odin serve
   ```
   _Purpose: Confirm SoHo icons, busyindicator, and input styling work with ids-enterprise-ng 20._

3. **Test the MIService against a real M3 environment**
   _Purpose: Verify zoneless change detection + HttpClient transport doesn't break MI API calls._

4. **Test `odin login-cloud`**
   _Purpose: Verify the multi-tenant login flow still works with the updated dependencies._

5. **Build the basic (non-Angular) project template**
   ```bash
   odin new test-basic --soho --angular false --skip-git -p https://your-m3-url -po https://your-portal-url
   cd test-basic
   npm install
   odin build
   ```

---

## Next Steps 📋

### Short term (before release)

- [ ] Update boilerplate component to use Angular signals (replace markForCheck pattern)
- [ ] Verify `odin build` produces correct production output for generated apps
- [ ] Run the full CI pipeline on GitHub to validate the workflow
- [ ] Publish a pre-release: `9.0.0-next.1`
- [ ] Test `odin new` installing from npm with the pre-release tag
- [ ] Document `npm pack` as the recommended Windows local dev workflow (file: protocol has dual-package issues)
- [ ] Remove debug `console.log` from MIService before release

### Medium term (can be done post-initial-release)

- [ ] Revisit `login-cloud` — goal: unified authentication supporting M3 APIs, Bookmarks, and API Gateway in a single login flow
- [ ] Add `ids-enterprise-wc` as an alternative template option (`--ids-wc` flag)
- [ ] Replace Karma with Jest or Vitest for unit tests
- [ ] Replace webpack in basic/non-Angular template with Vite
- [ ] Add ESLint configuration (replace deprecated TSLint/codelyzer)
- [ ] Update the samples application (`m3-odin/src/`)
- [ ] Consider dropping Puppeteer dependency (only used for `login` commands)
- [ ] Investigate making `odin serve` work without `--multi-tenant` for simpler local setups

### Nice to have

- [ ] Explore Nx or Turborepo for build caching
- [ ] Add Angular schematics for `ng update @infor-up/m3-odin` migration
- [ ] Signal-based reactive state in SDK services (future Angular direction, not needed for v9)

---

## Samples App Status

The samples app (`m3-odin/src/app/soho-app/samples/`) does not compile on Angular 20 yet.
Decide which to modernize and which to retire.

| Sample | Description | Depends on | Decision |
|--------|-------------|-----------|----------|
| home | Static landing page (lorem ipsum) | Nothing | Retire? |
| user-context | Load user context via MI | MIService, UserService | Keep & modernize |
| customer | MI list + detail + update with DataGrid | MIService, DataGrid | Keep & modernize |
| formatting | M3 date/number formatting | FormatUtil | Keep & modernize |
| infinite-paging | MI with paginated DataGrid | MIService, DataGrid | Keep & modernize |
| log | Demonstrates logging utilities | Log | Keep (trivial) |
| launch | Launch M3 programs | ApplicationService | Keep (trivial) |
| chart | SoHo chart rendering | SoHo only | Retire? (not SDK-specific) |
| theme | Theme switching | SoHo only | Retire? (not SDK-specific) |
| bookmark | M3 bookmarks | FormService | Keep, defer (needs auth) |
| search | M3 search | FormService | Keep, defer (needs auth) |
| idm | Infor Document Management | IonApiService | Keep, defer (needs ION API) |
| ionapi-social | ION API social service | IonApiService | Keep, defer (needs ION API) |

### Common compilation issues found

- Components are standalone by default in Angular 20 → add `standalone: false` or migrate
- `SohoDataGridOptions` and other SoHo types need explicit imports
- `@types/jquery` must be installed for SoHo jQuery API usage
- `main` and `polyfills` properties replaced by `browser` in the `application` builder

---

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| Zoneless by default in new apps | Angular 20 stabilizes it; simplifies debugging; better perf |
| Keep `M3OdinModule` as deprecated | Avoids forcing immediate migration for existing users |
| Use `HttpClient` in MIService | Required for zoneless; also improves testability with `HttpTestingController` |
| IDS Enterprise NG 20 first, WC later | Lower risk; existing users already know the API; WC can be additive |
| `npm pack` over file: protocol (Windows) | file: protocol causes dual-package resolution issues with Angular DI |
| Keep Karma for now | Works fine; replacing test infra is orthogonal to the upgrade |
| SDK keeps Observable API | Observables are the right abstraction for async request/response; components use `toSignal()` or signals for state |
| `configure(proxy)` for Vite compat | Angular 20's dev server uses Vite; old `onProxyReq` callbacks don't work |

---

## Known Issues / Workarounds

| Issue | Workaround | Status |
|-------|-----------|--------|
| `file:` protocol causes NG0203 injection errors on Windows | Use `npm pack` + install from tarball | Documented |
| `login-cloud` doesn't configure proxy correctly for all auth scenarios | Use legacy `odin login` + `--multi-tenant` | To fix later |
| Zoneless components need `markForCheck()` for async state updates | Use signals in component state (TODO for boilerplate) | In progress |

---

## Files Changed (from master)

```
.github/workflows/main.yml
cli/boilerplate/angular-soho/package.json
cli/boilerplate/angular-soho/src/app/app.component.css    (new)
cli/boilerplate/angular-soho/src/app/app.component.ts
cli/boilerplate/angular-soho/src/app/app.config.ts        (new)
cli/boilerplate/angular-soho/src/app/app.module.ts        (deleted)
cli/boilerplate/angular-soho/src/tsconfig.app.json
cli/boilerplate/angular/package.json
cli/boilerplate/angular/src/app/app.config.ts             (new)
cli/boilerplate/angular/src/app/app.module.ts             (deleted)
cli/boilerplate/basic/package.json
cli/package.json
cli/src/commands/new.ts
m3-odin/angular.json
m3-odin/package.json
m3-odin/tsconfig.json
m3-odin/projects/infor-up/m3-odin/package.json
m3-odin/projects/infor-up/m3-odin/src/lib/mi/mi-service-core.spec.ts
m3-odin/projects/infor-up/m3-odin-angular/package.json
m3-odin/projects/infor-up/m3-odin-angular/src/index.ts
m3-odin/projects/infor-up/m3-odin-angular/src/lib/pipes.ts
m3-odin/projects/infor-up/m3-odin-angular/src/lib/service.module.ts
m3-odin/projects/infor-up/m3-odin-angular/src/lib/service.ts
m3-odin/projects/infor-up/m3-odin-angular/tsconfig.lib.json
CHANGELOG.md
DEVELOPER.md                                              (new)
```
