# AidUp: Build and Run Guide (Windows)

This guide provides the exact steps and commands to build and run the AidUp Android application on this machine.

## Prerequisites

- **Android SDK Path**: `D:\sdk`
- **AVD Name**: `Pixel_API_30`
- **Gradle**: Use `.\gradlew.bat` in the project root.

## Step-by-Step Execution

### 1. Build the APK
Run the following command in the project root to generate the debug APK:
```powershell
.\gradlew.bat assembleDebug
```
The APK will be generated at: `app\build\outputs\apk\debug\app-debug.apk`

### 2. Start the Emulator
Launch the Android emulator in the background:
```powershell
Start-Process -FilePath "D:\sdk\emulator\emulator.exe" -ArgumentList "-avd Pixel_API_30", "-no-snapshot-load", "-no-audio" -WindowStyle Hidden
```

### 3. Wait for Device
Wait until the emulator is fully booted and recognized by ADB:
```powershell
do {
    $status = & "D:\sdk\platform-tools\adb.exe" shell getprop init.svc.bootanim
    Write-Host "Waiting for emulator to boot..."
    Start-Sleep -Seconds 5
} while ($status -ne "stopped")
```

### 4. Install and Launch
Install the APK and start the main activity:
```powershell
# Install the APK
& "D:\sdk\platform-tools\adb.exe" install -r app\build\outputs\apk\debug\app-debug.apk

# Launch the App
& "D:\sdk\platform-tools\adb.exe" shell am start -n com.aidup.app/.MainActivity
```

---

## Quick Reference Commands

| Action | Command |
| :--- | :--- |
| **Check Devices** | `& "D:\sdk\platform-tools\adb.exe" devices` |
| **View Logs** | `& "D:\sdk\platform-tools\adb.exe" logcat | Select-String com.aidup.app` |
| **Stop App** | `& "D:\sdk\platform-tools\adb.exe" shell am force-stop com.aidup.app` |
| **List AVDs** | `& "D:\sdk\emulator\emulator.exe" -list-avds` |
