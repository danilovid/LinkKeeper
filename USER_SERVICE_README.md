# User Service

Микросервис для управления пользователями LinkKeeper.

## Описание

User Service автоматически регистрирует пользователей при первом взаимодействии с ботом и предоставляет API для персонализации.

## Функциональность

- ✅ Автоматическая регистрация пользователей из Telegram
- ✅ Сохранение данных: Telegram ID, username, имя, фамилия
- ✅ Проверка существования пользователя
- ✅ Получение пользователя по Telegram ID
- ✅ GetOrCreate паттерн (получить или создать)

## API Endpoints

### POST /api/v1/users
Создать или получить существующего пользователя (GetOrCreate)

**Request:**
```json
{
  "telegram_id": 123456789,
  "username": "testuser",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "id": "uuid",
  "telegram_id": 123456789,
  "username": "testuser",
  "first_name": "John",
  "last_name": "Doe",
  "created_at": "2026-01-15T21:20:01Z",
  "updated_at": "2026-01-15T21:20:01Z"
}
```

### GET /api/v1/users/{id}
Получить пользователя по UUID

**Response:** JSON с данными пользователя

### GET /api/v1/users/telegram/{telegram_id}
Получить пользователя по Telegram ID

**Response:** JSON с данными пользователя

### GET /api/v1/users/telegram/{telegram_id}/exists
Проверить, существует ли пользователь

**Response:**
```json
{
  "exists": true
}
```

### GET /health
Health check endpoint

**Response:** `OK`

## Запуск

### Через Docker Compose
```bash
task start
```

### Локально
```bash
task user:run
```

## Конфигурация

Переменные окружения:
- `HTTP_ADDR` - адрес для HTTP сервера (по умолчанию `:8081`)
- `POSTGRES_DSN` - строка подключения к PostgreSQL

## Интеграция с Bot Service

Bot Service автоматически регистрирует пользователей при команде `/start`:

1. Пользователь отправляет `/start` боту
2. Bot-service отправляет данные в User-service
3. User-service создает пользователя или возвращает существующего
4. Пользователь может использовать функции бота

## База данных

### Таблица `users`
- `id` (UUID) - уникальный идентификатор
- `telegram_id` (BIGINT) - Telegram ID пользователя (уникальный)
- `username` (VARCHAR) - Telegram username
- `first_name` (VARCHAR) - имя
- `last_name` (VARCHAR) - фамилия
- `created_at` (TIMESTAMP) - дата создания
- `updated_at` (TIMESTAMP) - дата обновления

### Связи
- `link_models.user_id` → `users.id` (ON DELETE CASCADE)

## Тестирование

```bash
# Создать пользователя
curl -X POST http://localhost:8081/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": 123456789,
    "username": "testuser",
    "first_name": "Test",
    "last_name": "User"
  }'

# Проверить существование
curl http://localhost:8081/api/v1/users/telegram/123456789/exists

# Получить пользователя
curl http://localhost:8081/api/v1/users/telegram/123456789
```

## Структура

```
cmd/user-service/           # Точка входа
internal/user-service/      # Бизнес-логика
  ├── models.go            # Модели данных
  ├── repository.go        # Интерфейс репозитория
  ├── repository/
  │   └── user.go         # Реализация репозитория
  ├── usecase.go          # Интерфейс use case
  ├── usecase/
  │   └── user.go         # Реализация use case
  └── transport/http/     # HTTP транспорт
      ├── http.go         # Handlers
      └── routers.go      # Роуты
```

## Архитектура

User Service следует Clean Architecture:
- **Models** - определение структур данных
- **Repository** - работа с БД через GORM
- **Use Case** - бизнес-логика
- **Transport** - HTTP API (gorilla/mux)

## Логирование

Использует `zerolog` для структурированного логирования.

## Порты

- HTTP API: `8081`
