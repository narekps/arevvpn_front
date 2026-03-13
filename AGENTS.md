# AGENTS.md

## Project at a glance
- Angular 19 marketing + checkout frontend for ArevVPN; bootstrap is module-based (`src/main.ts` -> `src/app/app.module.ts`), while route components are imported directly in component decorators (standalone-style).
- Main user flow spans multiple areas: tariff listing (`src/app/home/home.component.ts`) -> order form (`src/app/order/order.component.ts`) -> payment callback activation (`src/app/order/callback/callback.component.ts`).
- Backend boundary is thin HTTP services in `src/app/services/*` (`tariff`, `order`, `subscription`) using `POST /api/v1/...` against `environment.API_URL`.
- Response/request payloads are wrapped into class-based models (e.g., `CreateOrderRequest`, `ListResponse`, `Tariff`) under `src/app/models/**`; follow this pattern when adding API calls.
- HTTP client is provided via `provideHttpClient(withFetch())` in AppModule providers — do **not** import `HttpClientModule`.

## Local workflows (verified from config)
- Install deps: `npm install`
- Dev server: `npm start` (Angular serve uses `development` target with host `vpn.ru` and port `4200` from `angular.json`).
- Production build: `npm run build` (default config is `production`; includes service worker).
- Dev watch build: `npm run watch`
- Unit tests (Karma + Jasmine): `npm test`

## Routing and composition patterns
- App routes live in `src/app/app-routing.module.ts`; page titles are assembled with `environment.APP_NAME`.
- Root shell (`src/app/app.component.html`) owns global nav/footer and `<router-outlet>`.
- **Standalone split**: `AppComponent` is `standalone: false` (declared in NgModule); every feature/page route component is standalone (`imports: [...]` in the decorator, no `standalone: false`).
- Feature/page components import their own Angular/MDB modules in `imports: [...]` inside each component (see `home.component.ts`, `order.component.ts`, `cancel-subscription.component.ts`). Keep dependencies local to the component.
- Full route table: `/` (Home), `/order` (checkout), `/order/callback` (activation), `/instruction`, `/oferta`, `/return-policy`, `/cancel-subscription`, `/cookies-policy`, `/privacy-policy`; `**` redirects to `/`.

## Service and data-flow conventions
- Service methods call `HttpClient.post`, then `map` response to model class and `catchError` -> `throwError` (see `tariff.service.ts`, `order.service.ts`, `subscription.service.ts`).
- UI components keep request state flags (`isLoading`, `isSubmitting`, `errorMessage`) and subscribe directly; use `takeUntil(this.destroy$)` where long-lived subscriptions exist.
- Order/captcha flow relies on `YandexCaptchaService` widget lifecycle (`render`/`getResponse`/`destroy`), with explicit re-render after failed submit.
- Toast notifications are shown via `MdbNotificationService.open(ToastComponent, { position, delay, autohide, data: { type, title, message } })`; `type` is an MDB color string (`'danger'`, `'success'`, etc.). Use `environment.TOAST_DURATION` / `environment.TOAST_ERROR_DURATION` for the `delay` value.

## External integrations and gotchas
- Yandex SmartCaptcha is loaded dynamically in `src/app/shared/services/yandex-captcha.service.ts`; CAPTCHA is toggled by `environment.CAPTCHA_ENABLED`.
- Yandex.Metrika exists in two places: inline script in `src/index.html` and runtime service `src/app/core/services/yandex-metrika.service.ts` (initialized in `AppComponent`). Be careful to avoid duplicate tracking changes.
- CSP is strict and repeated both in `src/index.html` and dev-server headers in `angular.json`; any new third-party script/domain usually needs updates in both.
- PWA/service worker is enabled only for production (`ServiceWorkerModule.register(...)` in `app.module.ts`, asset caching rules in `ngsw-config.json`). `AppComponent` polls `SwUpdate` every hour and auto-reloads the page on `VERSION_READY`.
- `ngx-mask` is globally registered in AppModule via `provideEnvironmentNgxMask({ validation: false })`; add `NgxMaskDirective` (and optionally `NgxMaskPipe`) to the `imports` of any standalone component that needs input masking.
- `moment` and `@auth0/angular-jwt` appear in `package.json` but are **not used** in any source file — do not import them when adding new features.

## UI stack specifics
- MDB UI Kit is consumed from local tarball dependency `mdb-angular-ui-kit-8.0.0.tgz` (`package.json`), not from npm registry version pinning.
- Global styles import MDB and FontAwesome in `src/styles.scss`; prefer project utility classes and existing Bootstrap/MDB composition before adding custom CSS.
- Locale is Russian (`LOCALE_ID = 'ru'` in `app.module.ts`), and copy/content is Russian-first; keep UX text consistent.
- Shared pipes in `src/app/shared/pipes/`: `MoneyPipe` (formats a number as `1 234 ₽`), `MonthWordPipe` (Russian plural for months), `DayWordPipe` (Russian plural for days). The underlying logic lives in `src/app/shared/util.ts` (`getDayWord`, `getMonthWord`, `randomControlName`). Import individual pipe classes directly into standalone component `imports` arrays.
- `environment` contains business constants beyond `API_URL`/`APP_NAME`: `SUPPORT_MAIL`, `TRIAL_PERIOD_DAYS`, `TELEGRAM.BOT_NAME`/`TELEGRAM.SUPPORT_USERNAME`, and `IP.*` (legal entity data). Always read from `environment` rather than hardcoding these values.

## Directory map for fast navigation
- `src/app/home/` -> landing + tariffs.
- `src/app/order/` -> checkout form and payment callback.
- `src/app/page/` -> static/legal pages (privacy, oferta, instruction, cancel subscription, cookies policy, return policy).
- `src/app/shared/` -> reusable UI (`toast`, `cookie-consent`, `popconfirm`), pipes (`money`, `month-word`, `day-word`), `util.ts`, captcha service.
- `src/app/core/services/` -> cross-cutting integrations (Metrika).
