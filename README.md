# LinkKeeper

> Modern link management system with Telegram bot, REST API, and web interface support

[![CI](https://github.com/danilovid/linkkeeper/workflows/CI/badge.svg)](https://github.com/danilovid/linkkeeper/actions)
[![Go Version](https://img.shields.io/badge/Go-1.23+-00ADD8?logo=go)](https://golang.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

LinkKeeper is a full-featured system for saving, organizing, and managing links with support for multiple interfaces: Telegram bot, REST API, and modern web interface.

## ✨ Features

### 🔗 Link Management
- ✅ Save links with categories (resources)
- ✅ View view statistics
- ✅ Get random links
- ✅ Filter by resources
- ✅ Search links

### 🤖 Telegram Bot
- ✅ Interactive menu with buttons
- ✅ Save links via commands
- ✅ Get random links
- ✅ Filter by resource types (articles, videos)
- ✅ Automatic user registration

### 🌐 REST API
- ✅ Full CRUD for links
- ✅ View statistics
- ✅ RESTful architecture
- ✅ CORS support

### 👥 User Management
- ✅ Automatic registration on first use
- ✅ Personalization via Telegram ID
- ✅ User existence check

### 📱 Web Interface
- ✅ Modern React Native interface
- ✅ Dark theme in GitHub/Cursor style
- ✅ Responsive design
- ✅ Statistics and analytics
- ✅ Multiple UI variants

## 🏗️ Architecture

LinkKeeper is built on a microservices architecture:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│  API Service │────▶│ PostgreSQL  │
│ (React/Expo)│     │   (Go)       │     │  Database   │
└─────────────┘     └──────────────┘     └─────────────┘
                            │
                            │
                    ┌───────┴────────┐
                    │               │
            ┌───────▼──────┐ ┌──────▼────────┐
            │ Bot Service  │ │ User Service  │
            │    (Go)      │ │     (Go)      │
            └──────────────┘ └───────────────┘
```

### Services

1. **API Service** (`:8080`) — main REST API for link management
2. **User Service** (`:8081`) — Telegram user management
3. **Bot Service** — Telegram bot for interactive management
4. **Frontend** — web interface on React Native/Expo

## 🚀 Quick Start

### Requirements

- **Go** 1.23+
- **Node.js** 18+
- **PostgreSQL** 16+
- **Docker** and **Docker Compose** (optional)
- **Telegram Bot Token** (for bot)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/danilovid/linkkeeper.git
cd linkkeeper
```

2. **Install dependencies:**
```bash
# Go dependencies
go mod download
go mod vendor

# Frontend dependencies
cd frontend && npm install && cd ..
```

3. **Set up the database:**
```bash
# Start PostgreSQL via Docker
task db:up

# Apply migrations
task db:migrate
```

4. **Configure environment variables:**
```bash
export POSTGRES_DSN="postgres://postgres:postgres@localhost:5432/linkkeeper?sslmode=disable"
export TELEGRAM_TOKEN="your_telegram_bot_token"
export API_BASE_URL="http://localhost:8080"
export USER_SERVICE_URL="http://localhost:8081"
```

### Running

#### Option 1: Docker Compose (recommended)

```bash
# Start all services
task start

# Or directly
docker-compose up -d
```

#### Option 2: Local Run

```bash
# Terminal 1: API Service
task api:run

# Terminal 2: User Service
task user:run

# Terminal 3: Bot Service
export TELEGRAM_TOKEN="your_token"
task bot:run

# Terminal 4: Frontend
task frontend:start
```

## 📖 Usage

### API Endpoints

#### Links
- `POST /api/v1/links` — create link
- `GET /api/v1/links` — list links
- `GET /api/v1/links/{id}` — get link
- `GET /api/v1/links/random` — random link
- `POST /api/v1/links/{id}/viewed` — mark as viewed
- `DELETE /api/v1/links/{id}` — delete link
- `GET /api/v1/stats` — view statistics

#### Users
- `POST /api/v1/users` — create/get user
- `GET /api/v1/users/{id}` — get user
- `GET /api/v1/users/telegram/{telegram_id}` — get by Telegram ID
- `GET /api/v1/users/telegram/{telegram_id}/exists` — check existence

### Telegram Bot

Commands:
- `/start` — start working with bot
- `/save <url>` — save link
- `/viewed <id>` — mark link as viewed
- `/random [resource]` — get random link

Buttons:
- 💾 Save link — save link
- ✅ Mark viewed — mark as viewed
- 🎲 Random — random link
- 📰 Random article — random article
- 🎬 Random video — random video

### Frontend

Open `http://localhost:19006` (or port specified by Expo)

**Features:**
- View all links
- Add new links
- Search and filter
- View statistics
- Modern interface

## 🧪 Testing

### Running Tests

```bash
# All tests
task test

# With coverage
task test:coverage

# Unit tests only
task test:unit

# Integration tests
task test:integration
```

### Coverage Statistics

| Component | Coverage |
|-----------|----------|
| User Service (Usecase) | 100% ✅ |
| User Service (Repository) | 86.4% ✅ |
| API Service (Usecase) | 52.2% ⚠️ |
| User Service (HTTP) | 50.7% ⚠️ |
| **Overall** | **~70%** ⚠️ |

**Total tests:** 38 unit + 3 integration

For more details: [Testing Guide](./docs/TESTING.md)

## 🔧 Development

### Project Structure

```
LinkKeeper/
├── cmd/                    # Service entry points
│   ├── api-service/
│   ├── bot-service/
│   └── user-service/
├── internal/               # Internal packages
│   ├── api-service/        # API service
│   ├── bot-service/        # Telegram bot
│   └── user-service/       # User service
├── pkg/                    # Shared packages
│   ├── config/            # Configuration
│   ├── database/          # Database
│   ├── httpclient/        # HTTP client
│   └── logger/            # Logging
├── frontend/              # React Native application
├── migrations/            # SQL migrations
├── build/                 # Dockerfiles
├── tests/                 # Integration tests
└── .github/workflows/     # CI/CD
```

### Development Commands

```bash
# Show all available commands
task

# Code formatting
task fmt

# Linting
task lint

# Run CI checks locally
task ci:local

# Install pre-commit hooks
task hooks:install
```

### Pre-commit Hooks

Automatically before each commit:
- ✅ Code formatting
- ✅ go vet
- ✅ go mod tidy
- ✅ Unit tests

Installation:
```bash
task hooks:install
```

## 🚢 CI/CD

### GitHub Actions

Automatically runs on:
- Push to `main` and `develop`
- Pull requests

**Pipeline includes:**
1. ✅ Tests (with race detector)
2. ✅ Linting (golangci-lint)
3. ✅ Formatting (go fmt)
4. ✅ Build all services
5. ✅ Docker images (main branch)

For more details: [CI/CD Documentation](./docs/CI_CD.md)

## 📚 Documentation

All documentation is located in the [`docs/`](./docs/) directory:

- [Testing Guide](./docs/TESTING.md) — comprehensive testing documentation
- [CI/CD Documentation](./docs/CI_CD.md) — CI/CD pipeline details
- [Test Coverage Summary](./docs/TEST_SUMMARY.md) — coverage statistics
- [Testing & CI Quick Start](./docs/README_TESTING_CI.md) — quick start guide
- [User Service Documentation](./docs/USER_SERVICE_README.md) — User Service details
- [Documentation Index](./docs/README.md) — complete documentation index
- [Frontend Documentation](./frontend/README.md) — Frontend documentation

## 🛠️ Technologies

### Backend
- **Go** 1.23+ — main language
- **PostgreSQL** 16+ — database
- **GORM** — ORM
- **Gorilla Mux** — HTTP routing
- **Zerolog** — logging
- **Telebot** — Telegram Bot API

### Frontend
- **React Native** — mobile framework
- **Expo** — development tools
- **TypeScript** — typing

### DevOps
- **Docker** & **Docker Compose** — containerization
- **GitHub Actions** — CI/CD
- **golangci-lint** — linter
- **pre-commit** — git hooks

## 🔐 Configuration

### Environment Variables

#### API Service
- `HTTP_ADDR` — HTTP server address (default: `:8080`)
- `POSTGRES_DSN` — PostgreSQL connection string

#### User Service
- `HTTP_ADDR` — HTTP server address (default: `:8081`)
- `POSTGRES_DSN` — PostgreSQL connection string

#### Bot Service
- `TELEGRAM_TOKEN` — Telegram bot token (required)
- `API_BASE_URL` — API service URL (default: `http://localhost:8080`)
- `USER_SERVICE_URL` — User service URL (default: `http://localhost:8081`)
- `BOT_TIMEOUT_SECONDS` — request timeout (default: 10)

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Guidelines

- ✅ Follow Go code style
- ✅ Add tests for new features
- ✅ Update documentation
- ✅ Use Conventional Commits

## 📝 License

MIT License — see [LICENSE](LICENSE) file

## 👤 Author

**Danilovid**

- GitHub: [@danilovid](https://github.com/danilovid)

## 🙏 Acknowledgments

- [Telebot](https://github.com/tucnak/telebot) — excellent library for Telegram bots
- [GORM](https://gorm.io/) — powerful ORM for Go
- [Expo](https://expo.dev/) — tools for React Native development

## 📊 Project Status

- ✅ API Service — ready
- ✅ User Service — ready
- ✅ Bot Service — ready
- ✅ Frontend — ready
- ✅ Tests — 38 unit + 3 integration
- ✅ CI/CD — configured
- ⚠️ Test coverage — 70% (target: 85%)

---

**Made with ❤️ for convenient link management**
