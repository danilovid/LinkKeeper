# LinkKeeper Frontend

React Native application for link management with web viewing support.

## Requirements

- Node.js 18+ 
- npm or yarn
- Expo CLI (will be installed automatically)

## Installation

```bash
cd frontend
npm install
```

## Running

### Web mode (for development)
```bash
npm run dev
```

Or:
```bash
npm run web
```

The application will open in the browser at `http://localhost:19006`

**Important:** Make sure your API server is running on `http://localhost:8080` (or change the URL in configuration)

### Mobile platforms
```bash
npm start
```

Then select the platform (iOS/Android/Web) or scan the QR code in the Expo Go app.

## Interface

**Current interface:** Modern design in Cursor/GitHub style
- 🌙 Dark theme
- 🎨 Minimalist and clean design
- 🔍 Search and filtering
- 📊 Statistics in header
- ✨ Professional look

The project also contains 3 additional interface variants. Details in [VARIANTS.md](./VARIANTS.md).

**Additional variants:**
1. **Classic List** - simple vertical list
2. **Card Grid** - visual cards with filtering
3. **Dashboard with Statistics** - analytics and quick actions

To select another variant, open `App.tsx` and replace the `ModernScreen` import with the desired variant.

## Configuration

Default API URL: `http://localhost:8080/api/v1`

To change it, create a `.env` file in the `frontend` folder:
```
EXPO_PUBLIC_API_URL=http://your-api-url/api/v1
```

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts      # API client for backend interaction
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Base screen (current)
│   │   ├── Variant1_ClassicList.tsx # Variant 1: Classic list
│   │   ├── Variant2_CardGrid.tsx   # Variant 2: Card grid
│   │   └── Variant3_Dashboard.tsx   # Variant 3: Dashboard
│   ├── types.ts          # TypeScript types
│   └── config.ts          # Configuration
├── App.tsx                # Main component
├── package.json
└── VARIANTS.md            # UI variants description
```

## Functionality

- ✅ Create links with optional resource
- ✅ View list of all links
- ✅ Get random link (with resource filter)
- ✅ Mark link as viewed
- ✅ Delete links
- ✅ Display statistics (views, dates)

## Development

When code changes, the application will automatically reload in the browser (Hot Reload).

To stop, press `Ctrl+C` in the terminal.
