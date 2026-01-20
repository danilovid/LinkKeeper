# UI Variants for LinkKeeper

The project contains 4 ready-made interface variants. Choose one and replace the import in `App.tsx`.

## 🎨 Current variant: Modern Interface (ModernScreen)

**Features:**
- ✅ Dark theme in Cursor/GitHub style
- ✅ Minimalist and clean design
- ✅ Link search
- ✅ Resource filtering (chips)
- ✅ Statistics in header (total links, viewed, views)
- ✅ Collapsible add form
- ✅ Random link card
- ✅ Professional typography
- ✅ Modern colors and spacing

**Suitable for:** Modern and professional interface

**File:** `src/screens/ModernScreen.tsx`

**Color scheme:**
- Background: `#0d1117` (GitHub dark)
- Cards: `#161b22`
- Borders: `#21262d`
- Text: `#f0f6fc` / `#8b949e`
- Accents: `#58a6ff` (blue), `#238636` (green), `#da3633` (red)

---

## Variant 1: Classic List (Variant1_ClassicList)

**Features:**
- ✅ Simple vertical list of all links
- ✅ Add form at the top of the page
- ✅ Minimalist design
- ✅ All functions on one screen
- ✅ Quick navigation

**Suitable for:** Quick access and simple link management

**File:** `src/screens/Variant1_ClassicList.tsx`

---

## Variant 2: Card Grid (Variant2_CardGrid)

**Features:**
- ✅ Links displayed as beautiful cards
- ✅ Modal window for adding new links
- ✅ Resource filtering (chips)
- ✅ "Random link" function
- ✅ More visually appealing design

**Suitable for:** Visual browsing and organization by categories

**File:** `src/screens/Variant2_CardGrid.tsx`

---

## Variant 3: Dashboard with Statistics (Variant3_Dashboard)

**Features:**
- ✅ Statistics: total links, viewed, resources, views
- ✅ Quick actions for getting random links
- ✅ Link search
- ✅ Compact list with metadata
- ✅ Focus on analytics and metrics

**Suitable for:** Usage analysis and quick access to random links

**File:** `src/screens/Variant3_Dashboard.tsx`

---

## How to choose a variant

1. Open the `App.tsx` file
2. Find the `ModernScreen` import (or other current variant)
3. Replace with the desired variant:

```typescript
// Modern interface (current):
import ModernScreen from './src/screens/ModernScreen';

// For variant 1:
import Variant1_ClassicList from './src/screens/Variant1_ClassicList';

// For variant 2:
import Variant2_CardGrid from './src/screens/Variant2_CardGrid';

// For variant 3:
import Variant3_Dashboard from './src/screens/Variant3_Dashboard';
```

4. Replace the component in Stack.Screen:

```typescript
<Stack.Screen 
  name="Home" 
  component={ModernScreen}  // replace with desired variant
  options={{ title: 'LinkKeeper', headerShown: false }}
/>
```

**Note:** For `ModernScreen`, `headerShown: false` is used because it has a custom header. For other variants, you can keep the standard header.
