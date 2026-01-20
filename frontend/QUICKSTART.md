# Quick Start

## 1. Install dependencies

```bash
cd frontend
npm install
```

## 2. Run in browser

```bash
npm run dev
```

The application will open automatically in the browser at `http://localhost:19006`

## 3. Select UI variant

Open the `App.tsx` file and replace:

```typescript
// Current variant (full functionality)
import HomeScreen from './src/screens/HomeScreen';

// Or choose one of the variants:
import Variant1_ClassicList from './src/screens/Variant1_ClassicList';
// import Variant2_CardGrid from './src/screens/Variant2_CardGrid';
// import Variant3_Dashboard from './src/screens/Variant3_Dashboard';
```

And in the component:

```typescript
<Stack.Screen 
  name="Home" 
  component={Variant1_ClassicList}  // replace with selected variant
  options={{ title: 'LinkKeeper' }}
/>
```

## 4. Configure API URL (optional)

If your API runs on a different address, create `.env`:

```
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
```

Default is `http://localhost:8080/api/v1`

## Ready! 🎉

The application is ready to use. All changes are automatically applied in the browser.
