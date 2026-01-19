# User Service

Microservice for managing LinkKeeper users.

## Description

User Service automatically registers users on their first interaction with the bot and provides an API for personalization.

## Features

- ✅ Automatic user registration from Telegram
- ✅ Data storage: Telegram ID, username, first name, last name
- ✅ User existence check
- ✅ Get user by Telegram ID
- ✅ GetOrCreate pattern (get or create)

## API Endpoints

### POST /api/v1/users
Create or get existing user (GetOrCreate)

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
Get user by UUID

**Response:** JSON with user data

### GET /api/v1/users/telegram/{telegram_id}
Get user by Telegram ID

**Response:** JSON with user data

### GET /api/v1/users/telegram/{telegram_id}/exists
Check if user exists

**Response:**
```json
{
  "exists": true
}
```

### GET /health
Health check endpoint

**Response:** `OK`

## Running

### Via Docker Compose
```bash
task start
```

### Locally
```bash
task user:run
```

## Configuration

Environment variables:
- `HTTP_ADDR` - address for HTTP server (default `:8081`)
- `POSTGRES_DSN` - PostgreSQL connection string

## Integration with Bot Service

Bot Service automatically registers users on `/start` command:

1. User sends `/start` to the bot
2. Bot-service sends data to User-service
3. User-service creates user or returns existing one
4. User can use bot features

## Database

### Table `users`
- `id` (UUID) - unique identifier
- `telegram_id` (BIGINT) - Telegram user ID (unique)
- `username` (VARCHAR) - Telegram username
- `first_name` (VARCHAR) - first name
- `last_name` (VARCHAR) - last name
- `created_at` (TIMESTAMP) - creation date
- `updated_at` (TIMESTAMP) - update date

### Relations
- `link_models.user_id` → `users.id` (ON DELETE CASCADE)

## Testing

```bash
# Create user
curl -X POST http://localhost:8081/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": 123456789,
    "username": "testuser",
    "first_name": "Test",
    "last_name": "User"
  }'

# Check existence
curl http://localhost:8081/api/v1/users/telegram/123456789/exists

# Get user
curl http://localhost:8081/api/v1/users/telegram/123456789
```

## Structure

```
cmd/user-service/           # Entry point
internal/user-service/      # Business logic
  ├── models.go            # Data models
  ├── repository.go        # Repository interface
  ├── repository/
  │   └── user.go         # Repository implementation
  ├── usecase.go          # Use case interface
  ├── usecase/
  │   └── user.go         # Use case implementation
  └── transport/http/     # HTTP transport
      ├── http.go         # Handlers
      └── routers.go      # Routes
```

## Architecture

User Service follows Clean Architecture:
- **Models** - data structure definitions
- **Repository** - database operations via GORM
- **Use Case** - business logic
- **Transport** - HTTP API (gorilla/mux)

## Logging

Uses `zerolog` for structured logging.

## Ports

- HTTP API: `8081`
