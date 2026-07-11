# AidUp Google Auth & Build Summary

This file contains the summary of the Google Authentication integration and useful commands for building and running the application on the emulator.

## Google Authentication Integration
- **Mechanism**: Android Credential Manager API.
- **Client ID**: `gen-lang-client-0344134307` (stored in `strings.xml`).
- **Endpoint**: `POST /api/auth/google-login`
- **Parameters**: `credential` (ID Token), `role` (Donator/Organizer).

## Useful Commands (PowerShell)

### 1. Build and Run on Emulator
Use this command to fully rebuild the app, install it, and launch the main screen.
```powershell
.\gradlew.bat assembleDebug; D:\sdk\platform-tools\adb.exe install -r app\build\outputs\apk\debug\app-debug.apk; D:\sdk\platform-tools\adb.exe shell am start -n com.aidup.app/.MainActivity
```

### 2. Reset App / Logout (Clear Session)
If you are stuck in an old session or want to test the login flow from scratch, run this:
```powershell
D:\sdk\platform-tools\adb.exe shell pm clear com.aidup.app
```

### 3. Check Logs (Filtered for AidUp)
```powershell
D:\sdk\platform-tools\adb.exe logcat | findstr com.aidup.app
```

## Troubleshooting
- **Device Offline**: If the emulator shows as offline, restart it or run `adb kill-server; adb start-server`.
- **Google Sign-in popup not showing**: Ensure the `google_web_client_id` in `strings.xml` matches your Google Cloud Console configuration and that the SHA-1 of your debug key is added to the console.
