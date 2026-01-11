# Быстрый старт

## 1. Установка зависимостей

```bash
cd frontend
npm install
```

## 2. Запуск в браузере

```bash
npm run dev
```

Приложение откроется автоматически в браузере на `http://localhost:19006`

## 3. Выбор варианта UI

Откройте файл `App.tsx` и замените:

```typescript
// Текущий вариант (полный функционал)
import HomeScreen from './src/screens/HomeScreen';

// Или выберите один из вариантов:
import Variant1_ClassicList from './src/screens/Variant1_ClassicList';
// import Variant2_CardGrid from './src/screens/Variant2_CardGrid';
// import Variant3_Dashboard from './src/screens/Variant3_Dashboard';
```

И в компоненте:

```typescript
<Stack.Screen 
  name="Home" 
  component={Variant1_ClassicList}  // замените на выбранный вариант
  options={{ title: 'LinkKeeper' }}
/>
```

## 4. Настройка API URL (опционально)

Если ваш API работает на другом адресе, создайте `.env`:

```
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
```

По умолчанию используется `http://localhost:8080/api/v1`

## Готово! 🎉

Приложение готово к использованию. Все изменения автоматически применяются в браузере.
