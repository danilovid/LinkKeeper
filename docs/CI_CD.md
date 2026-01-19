# CI/CD Documentation

This document describes the Continuous Integration and Continuous Deployment setup for the LinkKeeper project.

## GitHub Actions Workflows

### Main CI Pipeline (`.github/workflows/ci.yml`)

The CI pipeline runs automatically on:
- Push to `main` and `develop` branches
- Pull requests to `main` and `develop` branches

#### Pipeline Jobs

##### 1. Test Job
- **Environment**: Ubuntu latest with PostgreSQL 16
- **Steps**:
  - Checkout code
  - Set up Go 1.23
  - Install dependencies (including test libraries)
  - Run `go fmt` check
  - Run `go vet` static analysis
  - Run all tests with race detector and coverage
  - Upload coverage report to Codecov

##### 2. Lint Job
- **Environment**: Ubuntu latest
- **Steps**:
  - Checkout code
  - Set up Go 1.23
  - Run golangci-lint with 5-minute timeout

##### 3. Build Job
- **Dependencies**: Requires Test and Lint jobs to pass
- **Steps**:
  - Checkout code
  - Set up Go 1.23
  - Build all three services (api-service, user-service, bot-service)

##### 4. Docker Job
- **Dependencies**: Requires Test and Lint jobs to pass
- **Trigger**: Only on push to `main` branch
- **Steps**:
  - Checkout code
  - Set up Docker Buildx
  - Build Docker images for all services
  - Uses GitHub Actions cache for faster builds

## Linter Configuration

### golangci-lint (`.golangci.yml`)

Enabled linters:
- `bodyclose` - Checks HTTP response body is closed
- `errcheck` - Checks for unchecked errors
- `govet` - Go vet analysis
- `ineffassign` - Detects ineffectual assignments
- `staticcheck` - Static analysis checks
- `gosec` - Security checks
- `gocritic` - Comprehensive Go code analysis
- `misspell` - Spell checking
- `dupl` - Code duplication detection
- `gocyclo` - Cyclomatic complexity
- And more...

### Settings:
- Line length limit: 140 characters
- Minimum complexity for warning: 15
- Timeout: 5 minutes

## Pre-commit Hooks

### Setup (`.pre-commit-config.yaml`)

Install hooks:
```bash
task hooks:install
# or
pre-commit install
```

### Hooks:
1. **pre-commit/pre-commit-hooks**:
   - Remove trailing whitespace
   - Fix end of files
   - Check YAML syntax
   - Detect large files
   - Check for merge conflicts
   - Detect private keys

2. **dnephin/pre-commit-golang**:
   - Run `go fmt`
   - Run `go vet`
   - Run `go mod tidy`
   - Run unit tests (with 30s timeout, short mode)

3. **Local hooks**:
   - Run full test suite with race detector

## Running CI Checks Locally

### Quick Check
```bash
task ci:local
```

This will run:
1. Code formatting (`go fmt`)
2. Linting (`go vet`, `golangci-lint`)
3. All tests with coverage

### Individual Steps

```bash
# Format code
task fmt

# Run linter
task lint

# Run tests
task test

# Run tests with coverage
task test:coverage

# Run only unit tests
task test:unit

# Run only integration tests
task test:integration
```

## Environment Variables

### Required for CI/CD:

#### GitHub Secrets
- `CODECOV_TOKEN` - (Optional) For Codecov integration

### Local Development
- `POSTGRES_DSN` - Database connection string
- `TELEGRAM_TOKEN` - Telegram bot token
- `HTTP_ADDR` - Service HTTP address

## Docker Build Strategy

### Multi-stage Builds
All services use multi-stage Docker builds:
1. **Build stage**: Use `golang:latest` with full toolchain
2. **Runtime stage**: Use `debian:bookworm-slim` for smaller images

### Build Caching
- GitHub Actions uses build cache to speed up builds
- Cache keys based on Go modules hash

### Building Locally

```bash
# Build specific service
docker build -f build/api-service/Dockerfile -t api-service .
docker build -f build/user-service/Dockerfile -t user-service .
docker build -f build/bot-service/Dockerfile -t bot-service .

# Build all services
docker-compose build

# Build with task
task docker:build
```

## Branch Strategy

### Main Branches
- `main` - Production-ready code
  - Full CI pipeline + Docker builds
  - Should always be stable
  - Protected branch (requires PR reviews)

- `develop` - Development branch
  - Full CI pipeline
  - Integration of features
  - Can be unstable

### Feature Branches
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Workflow
1. Create feature branch from `develop`
2. Make changes and commit
3. Push and create PR to `develop`
4. CI checks run automatically
5. After review and CI pass, merge to `develop`
6. Periodically merge `develop` to `main`

## Quality Gates

### Before Merge
- ✅ All tests pass
- ✅ No linter warnings
- ✅ Code coverage maintained
- ✅ Code review approved
- ✅ No merge conflicts

### Pre-commit (Local)
- ✅ Code formatted
- ✅ `go vet` passes
- ✅ Unit tests pass

## Monitoring and Alerts

### Current Setup
- GitHub Actions notifications
- Codecov coverage reports

### Future Enhancements
- [ ] Slack/Discord notifications
- [ ] Performance regression detection
- [ ] Security vulnerability scanning
- [ ] Dependency update notifications
- [ ] Deploy previews for frontend

## Deployment (Planned)

### Future CD Pipeline
1. **Staging Deployment**
   - Automatic deployment on merge to `develop`
   - Deploy to staging environment
   - Run smoke tests

2. **Production Deployment**
   - Manual approval required
   - Deploy on merge to `main`
   - Blue-green deployment
   - Automatic rollback on failure

3. **Container Registry**
   - Push images to Docker Hub/GitHub Container Registry
   - Tag with version/commit SHA
   - Keep last 10 versions

## Troubleshooting

### CI Fails but Local Passes

```bash
# Clean cache
go clean -cache -testcache

# Run with same flags as CI
go test -v -race -coverprofile=coverage.out -covermode=atomic ./...

# Check formatting
gofmt -s -l .

# Run linter
golangci-lint run --timeout=5m
```

### Docker Build Fails

```bash
# Clear Docker cache
docker system prune -a

# Build without cache
docker-compose build --no-cache

# Check Dockerfile syntax
docker build --check -f build/api-service/Dockerfile .
```

### Pre-commit Hooks Fail

```bash
# Update hooks
pre-commit autoupdate

# Run manually
pre-commit run --all-files

# Skip hooks (emergency only)
git commit --no-verify
```

## Best Practices

1. **Always run tests locally before pushing**
2. **Keep commits small and focused**
3. **Write meaningful commit messages** (use Conventional Commits)
4. **Don't skip CI checks** (only in emergencies)
5. **Monitor CI failures** and fix quickly
6. **Keep dependencies updated** regularly
7. **Add tests for bug fixes** before fixing
8. **Review CI logs** when tests fail

## Commit Message Format

Use Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

Examples:
```
feat(user-service): add user registration endpoint

fix(api): handle nil pointer in link creation

test(user): add integration tests for user service

ci: add coverage upload to codecov
```
