# Provider Finder App - UI Testing Guide

This guide provides instructions on how to test the Provider Finder UI across multiple platforms and devices.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Flutter SDK](https://flutter.dev/docs/get-started/install) (version 3.x or higher)
- [Android Studio](https://developer.android.com/studio) (for Android emulators)
- [Google Chrome](https://www.google.com/chrome/) (for web testing)
- [Xcode](https://developer.apple.com/xcode/) (for iOS testing, Mac only)
- [Git](https://git-scm.com/downloads) (for version control)

Verify your Flutter installation:

```bash
flutter doctor
```

Make sure all components show a checkmark (✓). Address any issues before proceeding.

## 1. Testing on Web (Chrome/Safari)

### Chrome

1. Navigate to the user app directory:
   ```bash
   cd apps/user-app
   ```

2. Launch the app in Chrome:
   ```bash
   flutter run -d chrome
   ```

3. The app should open in a new Chrome window. If it doesn't open automatically, check the terminal for a URL (usually http://localhost:xxxx).

4. Test responsive layouts using Chrome DevTools:
   - Press `F12` to open DevTools
   - Click the "Toggle device toolbar" icon or press `Ctrl+Shift+M` (Windows/Linux) or `Cmd+Shift+M` (Mac)
   - Select different device profiles or set custom dimensions

### Safari (Mac Only)

1. First build a web version:
   ```bash
   flutter build web
   ```

2. Serve the built app:
   ```bash
   cd build/web
   python -m http.server 8000
   ```

3. Open Safari and navigate to `http://localhost:8000`

## 2. Testing on Android Emulators

1. List available emulators:
   ```bash
   flutter emulators
   ```

2. Launch a specific emulator:
   ```bash
   flutter emulators --launch <emulator_id>
   ```
   Example: `flutter emulators --launch Pixel_9_Pro`

3. Run the app on the emulator:
   ```bash
   cd apps/user-app
   flutter run
   ```

4. To test on different screen sizes, launch various emulators:
   - Phone: `Pixel_9_Pro` (or any Pixel device)
   - Tablet: Create a tablet emulator in Android Studio
   - Foldable: Create a foldable device emulator in Android Studio

### Creating Custom Android Emulators

1. Open Android Studio
2. Go to `Tools > Device Manager`
3. Click `Create Device`
4. Select a hardware profile (Phone, Tablet, Foldable, etc.)
5. Choose a system image (recommend API 30+ for best compatibility)
6. Configure advanced settings if needed
7. Name your emulator and click `Finish`

### Testing Different Orientations

- Press `Ctrl + Right Arrow` or `Ctrl + Left Arrow` while the emulator is in focus
- Or use the rotation buttons in the emulator controls

## 3. Testing on iOS Simulators (Mac Only)

1. List available simulators:
   ```bash
   xcrun simctl list devices
   ```

2. Open a simulator:
   ```bash
   open -a Simulator
   ```

3. From the Simulator menu, select `File > Open Simulator` to choose a different device

4. Run the app on the iOS simulator:
   ```bash
   cd apps/user-app
   flutter run
   ```

## 4. Testing on Physical Devices

### Android Physical Device

1. Enable Developer options and USB debugging on your Android device:
   - Go to `Settings > About phone`
   - Tap on `Build number` 7 times to enable Developer options
   - Go to `Settings > System > Developer options` and enable `USB debugging`

2. Connect your device via USB

3. Verify the device is recognized:
   ```bash
   flutter devices
   ```

4. Run the app on your device:
   ```bash
   flutter run -d <device_id>
   ```

### iOS Physical Device (Mac Only)

1. Connect your iOS device via USB

2. Open the Runner.xcworkspace file in Xcode:
   ```bash
   cd apps/user-app/ios
   open Runner.xcworkspace
   ```

3. In Xcode, select your device from the device dropdown

4. Configure signing with your Apple Developer account

5. Run the app from Xcode or use Flutter:
   ```bash
   flutter run
   ```

## 5. Hot Reload and Hot Restart

While the app is running:

- Press `r` in the terminal to perform a hot reload (preserves state)
- Press `R` in the terminal to perform a hot restart (resets state)
- Press `h` to see all available commands
- Press `d` to open DevTools in the browser

## 6. Testing Specific Features

### Map Functionality

- Verify map loads correctly on all devices
- Test different zoom levels
- Ensure provider pins appear correctly
- Test clustering behavior (if implemented)
- Verify provider selection and detail views

### Provider Search and Filtering

- Test search functionality with various queries
- Verify filters work correctly
- Test result sorting options

### Responsive UI Elements

- Verify navigation drawer/bottom bar adapts to different screen sizes
- Test that provider details display correctly on small and large screens
- Ensure buttons and interactive elements are large enough for touch on mobile

## 7. Performance Testing

1. Run the app in profile mode to get more accurate performance metrics:
   ```bash
   flutter run --profile
   ```

2. Use Flutter DevTools for performance monitoring:
   ```bash
   flutter run --profile
   ```
   Then press `d` in the terminal to open DevTools

## 8. Debugging

1. Print statements appear in the terminal
2. Use Flutter DevTools for more advanced debugging:
   - While app is running, press `d` in the terminal
   - Select the debugging tool you need (Inspector, Performance, Network, etc.)

## Common Issues & Solutions

### Google Maps Not Loading

If Google Maps isn't loading, check that:
1. The API key in `apps/user-app/web/index.html` is valid
2. For Android, verify the API key in `apps/user-app/android/app/src/main/AndroidManifest.xml`
3. For iOS, check `apps/user-app/ios/Runner/AppDelegate.swift`

### Backend Connection Issues

If the app can't connect to the backend:
1. Verify all backend services are running
2. Check that you're using the correct API base URL for your environment
3. On emulators, use `10.0.2.2` instead of `localhost` to connect to services on your host machine

## Best Practices for Multi-Device Development

- Use `MediaQuery` to adapt layouts based on screen size
- Implement `LayoutBuilder` for constraint-based UI adaptation
- Test with different text scaling factors for accessibility
- Use `FittedBox` for content that needs to adapt to different spaces
- When possible, use Flexbox-style layouts with `Expanded` and `Flexible` widgets

Happy testing! 