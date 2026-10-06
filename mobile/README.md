# Mansyd Android app

The Android app includes the complete website functionality, packaged with Capacitor.
Customer and business accounts use the same feature components, API services, validation
and role guards as the website. Mobile-specific layouts add safe-area spacing, a
bottom navigation bar, an accessible feature drawer and Android back-button handling.

## Features

- Public portfolio, sign-in and customer registration with email verification.
- Customer dashboard, profile, service requests, quotations, orders, projects,
  portfolio, appointments, billing/payments, notifications and documents.
- Business dashboard, customers, suppliers, requests, quotations, orders, project
  delivery and review requests, portfolio management, appointments, billing,
  notifications, document management and audit logs.
- Customer project details retain camera/gallery uploads, private photos,
  conversations, timeline history and completion confirmation/issue reporting.

Authorization remains enforced by the backend. Customers cannot enter business routes,
and business accounts enter the admin workspace. Source components are shared instead
of maintaining separate copies of the feature screens.

## Browser preview

From the frontend repository root:

```powershell
npm ci
npm run mobile:start
```

Open http://localhost:4300. This preview uses the hosted backend through the development
proxy. For your local backend on port 8080, use `npm run mobile:start:local` instead.
Browser builds use `/api`; native builds embed an absolute server address.

```powershell
npm run mobile:build
npm run mobile:test
```

The mobile tests exercise shared authentication and role guards, full route parity,
customer/business isolation, CSRF handling and bounded API request timeouts.

## Android with the hosted backend

```powershell
npm run mobile:android
```

The default backend is configured in `mobile/api-settings.json`. API requests time out
with a connection error after 20 seconds. Offline startup allows the public screens to
open; signing in retries the CSRF/session flow when a connection is available.

Open the frontend repository's `android/` folder in Android Studio, select the `app`
configuration and your emulator or phone, then click Run. Opening `mobile/` alone does
not load the native Gradle project.

## Android with your local backend

Keep the backend running on port 8080, then in the same frontend PowerShell terminal:

```powershell
$env:MOBILE_API_URL = 'http://10.0.2.2:8080/api'
$env:MOBILE_ALLOW_HTTP = '1'
npm run mobile:android
```

Run from Android Studio again to install the new bundle. `10.0.2.2` refers to your
computer from the Android emulator. For a physical phone on the same Wi-Fi, use your
computer's reachable LAN address instead. The account must exist in the selected
backend's database. Environment overrides apply to the terminal where you set them;
a later build without them returns to the hosted default.

Before a release, remove `MOBILE_ALLOW_HTTP` and use an HTTPS backend.
`mobile/src/api-config.ts` is generated and ignored by Git. The Angular mobile build
replaces the website environment with this mobile configuration; website builds keep
their existing environment settings.

## Java and APK build

Use Java 21 with this Gradle wrapper. In Android Studio select it under Settings >
Build, Execution, Deployment > Build Tools > Gradle. On this Windows machine:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21.0.10'
cd android
.\gradlew.bat assembleDebug
```

Generated Android output is stored under Gradle's local user cache (`.gradle/mansyd-builds`),
with a separate directory for this checkout and each module. This avoids OneDrive
cloud placeholders and file locks in generated manifests and dex files. Capacitor's
generated assets are streamed into this cache before Gradle snapshots them.
Find the APK location with:

```powershell
.\gradlew.bat printDebugApkPath
```
The SDK path and local Java configuration are ignored by Git.

## Verification

Run `npm test -- --watch=false --browsers=ChromeHeadless`, `npm run mobile:test`,
`npm run build`, `npm run mobile:android` and the native Gradle build.
Verify against the selected backend on a real device: registration/email verification,
login/logout/session expiry for both roles, requests/quotes/orders, billing, appointments,
private project photos, camera cancellation, completion reviews, documents and role
isolation. Browser checks with mocked data verify navigation/layout only; they do not
establish successful native authentication or server-side mutations.

The native HTTP and cookie bridges are enabled for Angular XMLHttpRequest/fetch,
private downloads and multipart uploads. Android backups are disabled and release
manifests prohibit cleartext traffic. Notifications retain the website's in-app behavior;
background push notifications are not implemented. iOS packaging remains a later phase.
