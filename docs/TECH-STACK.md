# PoliSwipe Tech Stack

Complete reference for every dependency, config file, and version constraint in the project. If you are setting up from scratch, you should be able to copy-paste every config file below verbatim.

---

## Table of Contents

1. [Frontend (React Native / Expo)](#frontend-react-native--expo)
2. [Backend (Python / FastAPI)](#backend-python--fastapi)
3. [Config Files (Complete Contents)](#config-files-complete-contents)
4. [Version Sensitivity Notes](#version-sensitivity-notes)
5. [Known Install Issues and Fixes](#known-install-issues-and-fixes)

---

## Frontend (React Native / Expo)

### Runtime Dependencies

| Package | Version | What It Does | Why It Is Needed |
|---|---|---|---|
| `expo` | `~54.0.33` | The Expo SDK framework. Provides the managed workflow, dev server, OTA updates, and the bridge between JS and native modules. | Core of the entire app. Every other `expo-*` package must match this SDK version. |
| `react` | `19.1.0` | The UI library. Provides the component model, hooks, and reconciler. | Required by React Native. Pinned to an exact version because Expo SDK 54 ships with React 19.1 and mismatches cause build failures. |
| `react-native` | `0.81.5` | The native runtime that renders React components to iOS/Android views. | Expo SDK 54 targets this exact RN version. Never change this independently of the Expo SDK. |
| `expo-router` | `~6.0.23` | File-based routing for React Native (like Next.js). Maps files in `app/` to screens and handles deep links. | Provides all navigation structure. The `"main": "expo-router/entry"` in package.json hands control to this package at startup. |
| `@react-navigation/native` | `^7.1.8` | The navigation primitives that expo-router builds on. Manages the navigation state tree, screen lifecycle, and transition events. | Required peer dependency of expo-router. |
| `react-native-screens` | `~4.16.0` | Replaces generic `<View>` containers with native screen primitives (`UIViewController` on iOS, `Fragment` on Android). Dramatically improves memory and performance for stack-based navigation. | Required by @react-navigation/native. |
| `react-native-safe-area-context` | `~5.6.0` | Provides the `<SafeAreaView>` and `useSafeAreaInsets()` hook so content avoids the notch, status bar, and home indicator. | Required by @react-navigation/native and used throughout the UI. |
| `react-native-gesture-handler` | `~2.28.0` | Replaces React Native's built-in touch system with a native gesture recognizer. Powers swipe, pan, pinch, and long-press gestures on the native thread. | Required for the card-swipe interaction (the core mechanic of PoliSwipe) and by @gorhom/bottom-sheet. |
| `react-native-reanimated` | `~4.1.1` | Animation library that runs animations on the UI thread via worklets (small JS functions compiled to native). Avoids the JS thread bottleneck for 60fps animations. | Powers all card swipe animations and the bottom sheet spring physics. Requires a Babel plugin (see babel.config.js). |
| `react-native-worklets` | `0.5.1` | Low-level worklet runtime that react-native-reanimated 4.x depends on. Lets JS functions execute synchronously on the UI thread. | Hard peer dependency of reanimated 4.x. **Version must match exactly** -- see version sensitivity section. |
| `@gorhom/bottom-sheet` | `^5.2.10` | A performant, gesture-driven bottom sheet component built on reanimated and gesture-handler. | Used for the action drawer on policy cards (email draft, chat, RSVP). |
| `@expo/vector-icons` | `^15.0.3` | Bundles icon sets (Ionicons, MaterialIcons, FontAwesome, etc.) as React Native components. | Provides all icons throughout the UI without loading external fonts at runtime. |
| `@react-native-async-storage/async-storage` | `2.2.0` | Simple, unencrypted, persistent key-value store (backed by SQLite on iOS, SharedPreferences on Android). | Stores user preferences, onboarding state, and cached card data locally. |
| `expo-calendar` | `~15.0.8` | Native module to read/write device calendar events. | Lets users RSVP to rallies and add events directly to their phone calendar. |
| `expo-constants` | `~18.0.13` | Exposes app manifest values (version, slug, scheme) and device info at runtime. | Used to read config values and distinguish dev/production environments. |
| `expo-font` | `~14.0.11` | Loads custom fonts asynchronously and provides a hook (`useFonts`) to gate rendering until fonts are ready. | Loads the app's custom typeface so text renders correctly from first frame. Registered as a plugin in app.json. |
| `expo-haptics` | `~15.0.8` | Triggers haptic feedback (Taptic Engine on iOS, vibration on Android). | Provides tactile feedback on card swipes and button presses. |
| `expo-linear-gradient` | `~15.0.8` | Renders native linear gradients as a `<LinearGradient>` component. | Used for card background gradients and overlay effects in the UI. |
| `expo-linking` | `~8.0.11` | Handles deep links and universal links. Lets the app open URLs and be opened via `poliswipe://` scheme. | Required by expo-router for deep link resolution. Also used to open external URLs (e.g., representative websites). |
| `expo-splash-screen` | `~31.0.13` | Controls the native splash screen. Keeps it visible until the app explicitly hides it (after fonts load, data fetches, etc.). | Prevents a white flash between native launch and React rendering. |
| `expo-status-bar` | `~3.0.9` | Controls the status bar appearance (light/dark text, background color) from React. | Ensures the status bar matches the app's visual theme. |

### Dev Dependencies

| Package | Version | What It Does |
|---|---|---|
| `typescript` | `~5.9.2` | The TypeScript compiler. Provides static type checking across all `.ts` and `.tsx` files. |
| `@types/react` | `~19.1.0` | TypeScript type definitions for React 19.1. Must match the `react` version. |

---

## Backend (Python / FastAPI)

The backend is a single file (`backend/server.py`) that proxies requests to a local Ollama instance for AI text generation.

### Python Dependencies

These are imported directly in `server.py`. There is no `requirements.txt` yet -- install them manually with pip.

| Package | What It Does | Install Command |
|---|---|---|
| `fastapi` | Async web framework for building the REST API. Provides automatic request validation via Pydantic models and auto-generated OpenAPI docs at `/docs`. | `pip install fastapi` |
| `uvicorn` | ASGI server that runs the FastAPI app. Used in the npm `backend` script. | `pip install uvicorn` |
| `pydantic` | Data validation library (ships with FastAPI). Defines the request/response schemas (`DraftRequest`, `ChatRequest`). | Installed automatically with FastAPI. |
| `httpx` | Async HTTP client used to call the local Ollama API. Chosen over `requests` because it supports `async/await` natively. | `pip install httpx` |

### External Service: Ollama

The backend expects Ollama running locally at `http://localhost:11434`. It uses the `llama3.2:latest` model for text generation.

Install Ollama: https://ollama.com/download  
Pull the model: `ollama pull llama3.2`

### Recommended pip install (one-liner)

```bash
pip install fastapi uvicorn httpx
```

---

## Config Files (Complete Contents)

### package.json

```json
{
  "name": "poliswipe",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "ios": "expo start --ios",
    "android": "expo start --android",
    "backend": "uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload"
  },
  "dependencies": {
    "@expo/vector-icons": "^15.0.3",
    "@gorhom/bottom-sheet": "^5.2.10",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@react-navigation/native": "^7.1.8",
    "expo": "~54.0.33",
    "expo-calendar": "~15.0.8",
    "expo-constants": "~18.0.13",
    "expo-font": "~14.0.11",
    "expo-haptics": "~15.0.8",
    "expo-linear-gradient": "~15.0.8",
    "expo-linking": "~8.0.11",
    "expo-router": "~6.0.23",
    "expo-splash-screen": "~31.0.13",
    "expo-status-bar": "~3.0.9",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-worklets": "0.5.1"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "typescript": "~5.9.2"
  },
  "private": true
}
```

**Key points:**
- `"main": "expo-router/entry"` -- hands app entry to expo-router so file-based routing works.
- `"private": true` -- prevents accidental npm publish.
- The `backend` script starts the Python server with hot reload.

### app.json

```json
{
  "expo": {
    "name": "PoliSwipe",
    "slug": "poliswipe",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "poliswipe",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#FAFAF7"
    },
    "ios": {
      "supportsTablet": false,
      "infoPlist": {
        "NSCalendarsFullAccessUsageDescription": "PoliSwipe adds rally events to your calendar when you RSVP."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#FAFAF7"
      }
    },
    "plugins": [
      [
        "expo-calendar",
        {
          "calendarPermission": "PoliSwipe adds rally events to your calendar when you RSVP."
        }
      ],
      "expo-font"
    ]
  }
}
```

**Key points:**
- `"newArchEnabled": true` -- enables React Native's New Architecture (Fabric renderer + TurboModules). Required by reanimated 4.x and worklets 0.5.x.
- `"scheme": "poliswipe"` -- registers the `poliswipe://` deep link scheme used by expo-router and expo-linking.
- `"orientation": "portrait"` -- locks the app to portrait mode (swipe UX is portrait-only).
- `"plugins"` -- expo-calendar needs the plugin entry to inject the iOS permission string at build time. expo-font needs the plugin to bundle custom fonts.
- `NSCalendarsFullAccessUsageDescription` -- required by iOS 17+ for full calendar read/write access.

### tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Key points:**
- `"extends": "expo/tsconfig.base"` -- inherits Expo's recommended TS settings (JSX transform, module resolution, target).
- `"strict": true` -- enables all strict type-checking flags.
- `"paths": { "@/*": ["./*"] }` -- sets up the `@/` import alias so you can write `import X from '@/components/Foo'` instead of relative paths like `../../components/Foo`.

### babel.config.js

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

**Key points:**
- `react-native-reanimated/plugin` **must be the last plugin** in the plugins array. It transforms worklet functions at compile time. If it runs before other plugins, builds will fail with cryptic errors.
- `api.cache(true)` -- caches the Babel config for the lifetime of the process (standard for Expo projects).

### .gitignore

```
node_modules/
.expo/
dist/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
__pycache__/
*.pyc
.env
```

**Key points:**
- `node_modules/` -- never commit dependencies (reinstall with `npm install`).
- `.expo/` -- local Expo dev cache; machine-specific.
- `dist/` -- production build output.
- `*.jks`, `*.p8`, `*.p12`, `*.key`, `*.mobileprovision` -- signing credentials. Never commit these.
- `__pycache__/`, `*.pyc` -- Python bytecode from the backend.
- `.env` -- environment variables (API keys, secrets). Never commit this.

---

## Version Sensitivity Notes

### react-native-reanimated ~4.1.1 + react-native-worklets 0.5.1

This is the most version-sensitive pair in the project. Reanimated 4.x extracted its worklet runtime into the separate `react-native-worklets` package. These two packages share native C++ code, and **their versions must be compatible or the app will crash on launch** with errors like:

```
Error: Failed to install react-native-worklets: Native module not found
```

The rule: always let `npx expo install --fix` choose the versions of both packages together. Do not manually bump one without the other.

### Expo SDK 54 version matrix

Expo SDK 54 pins specific versions of React, React Native, and all `expo-*` packages. The tilde (`~`) ranges in package.json exist because Expo publishes patch releases within an SDK version. The key locked versions:

| Package | Pinned To | Why |
|---|---|---|
| `react` | `19.1.0` (exact) | Expo SDK 54 requires React 19.1. Using 18.x or a different 19.x will break. |
| `react-native` | `0.81.5` (exact) | Expo SDK 54 requires RN 0.81. Using 0.82+ or 0.80- will break native modules. |
| `react-native-gesture-handler` | `~2.28.0` | Must match the version Expo SDK 54 tests against. Major version changes break the native bridge. |
| `react-native-safe-area-context` | `~5.6.0` | Expo SDK 54 specific. |
| `react-native-screens` | `~4.16.0` | Expo SDK 54 specific. |

**General rule:** Never run `npm install <expo-package>@latest`. Always use `npx expo install <package>` which resolves to the correct version for your SDK.

### New Architecture (Fabric + TurboModules)

`"newArchEnabled": true` in app.json opts into React Native's New Architecture. This is required because:
- `react-native-reanimated` 4.x uses TurboModules for its native bridge.
- `react-native-worklets` 0.5.x requires the New Architecture JSI bindings.

If you disable this flag, the app will crash on startup because reanimated and worklets cannot find their native modules.

### @react-navigation/native ^7.x

React Navigation 7 is a major version bump from 6. Expo-router ~6.0 is built specifically for React Navigation 7. Do not downgrade to `@react-navigation/native` 6.x -- expo-router will fail to render.

---

## Known Install Issues and Fixes

### 1. Peer dependency conflicts during `npm install`

**Symptom:**
```
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! peer react@"^18.0.0" from some-package
```

**Cause:** Some packages have not updated their `peerDependencies` to include React 19. npm's strict resolver treats this as an error.

**Fix:**
```bash
npm install --legacy-peer-deps
```

This tells npm to skip peer dependency validation. It is safe for this project because Expo tests all packages together before releasing an SDK version. Use this flag for every `npm install` operation.

### 2. Version mismatch after adding a new Expo package

**Symptom:** You installed a package with `npm install expo-whatever` and now the app crashes or shows a version warning on startup.

**Fix:**
```bash
npx expo install --fix
```

This scans all installed Expo packages and corrects any that are not compatible with your SDK version. Run this after every manual `npm install` of an Expo-ecosystem package.

### 3. Reanimated build errors after version bump

**Symptom:**
```
Error: Reanimated: Failed to create a worklet. Did you forget to add the Babel plugin?
```

**Fixes (in order):**
1. Confirm `react-native-reanimated/plugin` is in `babel.config.js` and is the **last** plugin.
2. Clear the Babel cache: `npx expo start --clear`
3. If the error persists, delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   npm install --legacy-peer-deps
   npx expo install --fix
   ```

### 4. Metro bundler cache stale after dependency changes

**Symptom:** The app shows old code, imports fail, or you see "module not found" for a package you just installed.

**Fix:**
```bash
npx expo start --clear
```

This clears Metro's transform cache and forces a fresh bundle.

### 5. Ollama connection refused on backend startup

**Symptom:**
```
[AI unavailable: [Errno 61] Connection refused]
```

**Cause:** The Python backend starts but Ollama is not running, or the model is not pulled.

**Fix:**
```bash
# Start Ollama (macOS -- it may already be running as a menu bar app)
ollama serve

# Pull the model the backend expects
ollama pull llama3.2
```

### 6. Python ImportError for backend packages

**Symptom:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Fix:**
```bash
pip install fastapi uvicorn httpx
```

If you use a virtual environment (recommended):
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn httpx
```

### 7. iOS calendar permission denied

**Symptom:** `expo-calendar` throws a permission error or the permission dialog never appears.

**Cause:** The `expo-calendar` plugin must be in `app.json` so the permission string is injected into `Info.plist` at build time. This only takes effect in development builds (Expo Go uses its own permissions).

**Fix:** If using a development build, verify the plugin entry exists in `app.json` (see config above) and rebuild:
```bash
npx expo prebuild --clean
npx expo run:ios
```
