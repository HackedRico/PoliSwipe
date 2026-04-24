# Setup -- From Zero to Running

This guide recreates the entire project from an empty directory.

## Prerequisites

- Node.js >= 18
- npm
- Python 3.9+
- Ollama installed and running (`ollama serve`)
- Ollama model pulled: `ollama pull llama3.2:latest`
- Expo Go app installed on your iPhone
- Your dev machine and iPhone on the same Wi-Fi network

## 1. Scaffold the Expo Project

```bash
npx create-expo-app@latest poliswipe
cd poliswipe
```

Delete all template files except `app.json`, `package.json`, `tsconfig.json`, `babel.config.js`, `assets/`.

## 2. Install Dependencies

All at once with legacy peer deps (required for bottom-sheet compatibility):

```bash
npm install --legacy-peer-deps \
  expo@~54.0.33 \
  expo-router@~6.0.23 \
  expo-constants@~18.0.8 \
  expo-haptics@~15.0.8 \
  expo-calendar@~15.0.8 \
  expo-linking@~7.0.13 \
  expo-linear-gradient@~15.0.8 \
  expo-font@~14.0.6 \
  expo-status-bar@~2.2.3 \
  expo-system-ui@~5.0.7 \
  expo-web-browser@~15.0.5 \
  react@19.1.0 \
  react-native@0.81.5 \
  react-native-reanimated@~4.1.1 \
  react-native-gesture-handler@~2.28.0 \
  react-native-screens@~4.11.1 \
  react-native-safe-area-context@5.4.0 \
  react-native-web@~0.20.0 \
  react-native-worklets@~0.5.1 \
  @gorhom/bottom-sheet@^5.2.10 \
  @react-native-async-storage/async-storage@2.2.0 \
  @react-navigation/bottom-tabs@^7.3.10 \
  @react-navigation/native@^7.1.8 \
  @expo/vector-icons@15.0.3
```

Dev dependencies:

```bash
npm install --save-dev --legacy-peer-deps \
  typescript@~5.9.2 \
  @types/react@~19.1.0 \
  @babel/core@^7.25.2
```

Python backend:

```bash
pip install fastapi uvicorn httpx
```

## 3. Configure package.json

Set the entry point for expo-router:

```json
{
  "name": "poliswipe",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "ios": "expo start --ios",
    "android": "expo start --android",
    "backend": "uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload"
  }
}
```

The `"main": "expo-router/entry"` line is critical. Without it, Expo can't find the app entry point.

## 4. Configure app.json

```json
{
  "expo": {
    "name": "PoliSwipe",
    "slug": "poliswipe",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "poliswipe",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "imageSize": 200,
      "resizeMode": "contain",
      "backgroundColor": "#FAFAF7"
    },
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "NSCalendarsUsageDescription": "PoliSwipe adds rally events to your calendar when you RSVP",
        "NSCalendarsFullAccessUsageDescription": "PoliSwipe adds rally events to your calendar when you RSVP"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#FAFAF7"
      }
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-calendar",
      "expo-font"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

**Important**: Do NOT put `"expo-router"` in the plugins array. It causes resolution errors with SDK 54.

## 5. Configure tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

The `@/*` path alias maps to the project root, so `@/theme/tokens` resolves to `./theme/tokens`.

## 6. Configure babel.config.js

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

**The reanimated plugin MUST be the last plugin in the array.** This is a hard requirement from the reanimated library.

## 7. Create the Directory Structure

```bash
mkdir -p app
mkdir -p screens
mkdir -p card
mkdir -p sheets
mkdir -p components
mkdir -p hooks
mkdir -p actions
mkdir -p types
mkdir -p theme
mkdir -p data
mkdir -p backend
mkdir -p assets/images
```

## 8. Create Asset Placeholders

You need at minimum these image files in `assets/images/`:
- `icon.png` (1024x1024)
- `splash-icon.png` (200x200)
- `adaptive-icon.png` (1024x1024)

For quick placeholders, generate solid-color PNGs:

```python
from PIL import Image
for name, size in [("icon", 1024), ("splash-icon", 200), ("adaptive-icon", 1024)]:
    img = Image.new("RGB", (size, size), "#E63946")
    img.save(f"assets/images/{name}.png")
```

Or use any image editor. The brand color is `#E63946`.

## 9. Create the .gitignore

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

## 10. Build Files in Order

Create files following the dependency order:

1. **Types first**: `types/index.ts` (everything else imports from here)
2. **Theme**: `theme/tokens.ts`, `theme/typography.ts`, `theme/shadow.ts`
3. **Data**: `data/cards.ts`, `data/categories.ts`, `data/profile.ts`, `data/chatScripts.ts`
4. **Hooks**: `hooks/usePersistentState.ts`, `hooks/useFilteredDeck.ts`, `hooks/useHaptic.ts`
5. **Actions**: `actions/api.ts`, `actions/calendar.ts`, `actions/email.ts`, `actions/share.ts`
6. **Components**: `components/Chip.tsx`, `components/StatPill.tsx`, etc.
7. **Card system**: `card/useSwipeGesture.ts`, `card/SwipeOverlay.tsx`, `card/CardFace.tsx`, `card/SwipeCard.tsx`
8. **Sheets**: `sheets/Backdrop.tsx`, then all 6 sheet modals
9. **Screens**: `screens/StackScreen.tsx`, `screens/CivicWrap.tsx`
10. **App routing**: `app/_layout.tsx`, `app/index.tsx`, `app/wrap.tsx`
11. **Backend**: `backend/server.py`
12. **Startup**: `start.sh`

See the individual doc files for the exact contents of each file.

## 11. Create the Startup Script

```bash
#!/usr/bin/env bash
set -e

echo "Killing stale processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

echo "Clearing Expo cache..."
rm -rf .expo

echo "Starting backend..."
uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

sleep 2
if curl -sf http://localhost:8000/health > /dev/null; then
  echo "Backend healthy"
else
  echo "Warning: backend not responding"
fi

echo "Starting Expo..."
npx expo start --port 8081 &
EXPO_PID=$!

trap "kill $BACKEND_PID $EXPO_PID 2>/dev/null; exit" INT TERM
wait
```

```bash
chmod +x start.sh
```

## 12. Run It

```bash
./start.sh
```

- Scan QR code with iPhone camera (opens Expo Go)
- Backend runs at `http://<your-lan-ip>:8000`
- The app auto-detects your LAN IP via expo-constants

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `expo-router` plugin error | Remove `"expo-router"` from `plugins` in app.json |
| Missing `App.js` / default export | Set `"main": "expo-router/entry"` in package.json |
| Reanimated/Worklets version clash | Run `npx expo install --fix` to pin SDK-compatible versions |
| npm peer dep conflicts | Always use `--legacy-peer-deps` flag |
| Missing icon assets | Generate placeholder PNGs (see step 8) |
| Backend unreachable from phone | Ensure same Wi-Fi network; check firewall allows port 8000 |
| Ollama not responding | Run `ollama serve` in a separate terminal, confirm `ollama list` shows llama3.2:latest |
