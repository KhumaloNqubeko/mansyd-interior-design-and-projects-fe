# Mansyd Mobile App

## Local browser preview

Install Node.js 22 or later and start the local backend using its README.
From the frontend repository's main folder, run:

```powershell
npm ci
npm run mobile:start:local
```

Open http://localhost:4300. Keep the backend and preview terminals open.

## Login details

| Account | Email | Password |
| --- | --- | --- |
| Business / Admin | carpenter@local.test | Carpenter123! |
| Customer | customer@local.test | Customer123! |

## Run on an Android emulator (optional)

Install Android Studio with an Android SDK and emulator, and Java 21.
Keep the local backend running. From the frontend repository's main folder, run in PowerShell:

```powershell
$env:MOBILE_API_URL = 'http://10.0.2.2:8080/api'
$env:MOBILE_ALLOW_HTTP = '1'
npm run mobile:android
```

Open the `android` folder in Android Studio, select an emulator, and click Run.
For a physical phone on the same Wi-Fi, replace `10.0.2.2` with your computer's local IP address.
