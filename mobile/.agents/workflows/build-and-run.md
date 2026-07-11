---
description: How to build and run the AidUp Android application
---

# AidUp Development Workflow

This guide explains how to build the application, start the Android emulator, and run the app from the terminal.

## // turbo-all

### 1. Build the APK
First, compile the project and generate the debug APK using the Gradle wrapper.
```bash
./gradlew assembleDebug
```
> [!NOTE]
> The generated APK will be located at: `app/build/outputs/apk/debug/app-debug.apk`

### 2. Start the Emulator
Launch your virtual device. Replace `Pixel_3` with your preferred AVD name if different.
```bash
export ANDROID_AVD_HOME=/home/tyrel/.config/.android/avd
/home/tyrel/Android/Sdk/emulator/emulator -avd Pixel_3 -no-snapshot-load -no-audio
```
> [!IMPORTANT]
> Keep this terminal open or run the command in the background. The emulator must be fully booted before the next step.

### 3. Install and Run the App
Once the emulator is running, use `adb` to install the APK and launch the main screen.
```bash
# Install the APK
adb install app/build/outputs/apk/debug/app-debug.apk

# Launch the app
adb shell am start -n com.aidup.app/.MainActivity
```

---

## Useful adb Commands
- **Check for connected devices:** `adb devices`
- **View logs:** `adb logcat | grep com.aidup.app`
- **Stop the app:** `adb shell am force-stop com.aidup.app`
- **Take a screenshot:** `adb shell screencap -p /sdcard/s.png && adb pull /sdcard/s.png`
