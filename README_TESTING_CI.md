# Testing & CI/CD Guide

## Quick Start

### Run Tests

```bash
# Run all tests (fastest)
task test

# Run tests with coverage report
task test:coverage

# Run only unit tests
task test:unit

# Run only integration tests
task test:integration

# Run CI checks locally (before commit)
task ci:local
```

### Install Pre-commit Hooks

```bash
# Automatically run tests and checks before each commit
task hooks:install
```

### View Test Results

After running `task test:coverage`, open `coverage.html` in your browser to see detailed coverage.

## What Was Added

### ✅ Comprehensive Test Suite

1. **User Service Tests** (100% usecase coverage)
   - Repository layer: 8 tests (CRUD operations, duplicate prevention)
   - Usecase layer: 8 tests (business logic, GetOrCreate pattern)
   - HTTP layer: 8 tests (API endpoints, validation, error handling)

2. **API Service Tests** (52% usecase coverage)
   - Usecase layer: 11 tests (link management, view stats)
   - Error handling scenarios

3. **Integration Tests** (3 tests)
   - End-to-end user flows
   - Multiple user scenarios
   - Database integration

**Total: 38 tests covering critical functionality**

### ✅ CI/CD Pipeline (GitHub Actions)

Located in `.github/workflows/ci.yml`

**Runs automatically on:**
- Every push to `main` and `develop` branches
- Every pull request to `main` and `develop`

**Pipeline stages:**
1. **Test** - Runs all tests with PostgreSQL, generates coverage
2. **Lint** - Checks code quality with golangci-lint
3. **Build** - Verifies all services compile
4. **Docker** - Builds Docker images (main branch only)

### ✅ Pre-commit Hooks

Located in `.pre-commit-config.yaml`

**Automatically runs before each commit:**
- Code formatting (go fmt)
- Static analysis (go vet)
- Dependency management (go mod tidy)
- Unit tests (fast, < 30s)

### ✅ Configuration Files

- `.golangci.yml` - Linter configuration
- `.pre-commit-config.yaml` - Pre-commit hooks
- `Makefile` - Alternative task runner
- `Taskfile.yml` - Updated with test commands

### ✅ Documentation

- `TESTING.md` - Comprehensive testing guide
- `CI_CD.md` - CI/CD documentation
- `TEST_SUMMARY.md` - Coverage summary
- `README_TESTING_CI.md` - This file

## Testing Stack

### Libraries
- `github.com/stretchr/testify` - Assertions & mocking
- `gorm.io/driver/sqlite` - In-memory test database

### Tools
- `golangci-lint` - Comprehensive Go linter
- `pre-commit` - Git hook framework
- GitHub Actions - CI/CD platform

## Project Structure

```
LinkKeeper/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
├── internal/
│   ├── user-service/
│   │   ├── repository/
│   │   │   ├── user.go
│   │   │   └── user_test.go    # ✨ Repository tests
│   │   ├── usecase/
│   │   │   ├── user.go
│   │   │   └── user_test.go    # ✨ Business logic tests
│   │   └── transport/http/
│   │       ├── http.go
│   │       └── http_test.go    # ✨ HTTP handler tests
│   └── api-service/
│       └── usecase/
│           ├── link.go
│           └── link_test.go    # ✨ Link service tests
├── tests/
│   └── integration_test.go     # ✨ Integration tests
├── .golangci.yml               # ✨ Linter config
├── .pre-commit-config.yaml     # ✨ Pre-commit hooks
├── Makefile                    # ✨ Make commands
├── Taskfile.yml                # Updated with test tasks
├── TESTING.md                  # ✨ Testing guide
├── CI_CD.md                    # ✨ CI/CD guide
├── TEST_SUMMARY.md             # ✨ Coverage summary
└── README_TESTING_CI.md        # ✨ This file
```

## Development Workflow

### 1. Before Starting Work

```bash
# Install pre-commit hooks (once)
task hooks:install

# Or with make
make install-hooks
```

### 2. While Developing

Write code and tests together:

```bash
# Run tests continuously while developing
task test:unit

# Check specific package
go test -v ./internal/user-service/usecase/...
```

### 3. Before Committing

```bash
# Run all CI checks locally
task ci:local

# This runs:
# - go fmt ./...
# - go vet ./...
# - golangci-lint run
# - go test with coverage
```

Or just commit - pre-commit hooks will run automatically!

### 4. Creating Pull Request

The CI pipeline will run automatically:
- ✅ Tests must pass
- ✅ Linting must pass
- ✅ Build must succeed
- ✅ Coverage should not decrease

### 5. After Merge

On `main` branch, Docker images are automatically built.

## Test Coverage Targets

| Component | Current | Target | Status |
|-----------|---------|--------|--------|
| User Service (Usecase) | 100% | 100% | ✅ |
| User Service (Repository) | 86.4% | 90% | ⚠️ |
| API Service (Usecase) | 52.2% | 80% | 🔴 |
| User Service (HTTP) | 50.7% | 80% | 🔴 |
| **Overall** | **~70%** | **85%** | ⚠️ |

## Common Commands

### Testing

```bash
# Task (recommended)
task test                 # All tests
task test:unit           # Unit tests only
task test:integration    # Integration tests only
task test:coverage       # With HTML coverage report
task ci:local            # Full CI simulation

# Make
make test                # All tests
make test-coverage       # With coverage report
make lint                # Run linter
make fmt                 # Format code

# Go directly
go test ./...                              # All tests
go test -v ./...                           # Verbose
go test -race ./...                        # With race detector
go test -short ./...                       # Skip integration tests
go test -coverprofile=coverage.out ./...  # Generate coverage
```

### Linting

```bash
task lint                # Run all linters
make lint                # Same with make
golangci-lint run        # Direct command
go fmt ./...             # Format code
go vet ./...             # Static analysis
```

### CI/CD

```bash
task ci:local            # Run CI checks locally
task hooks:install       # Install pre-commit hooks
pre-commit run --all-files  # Run hooks manually
```

## Troubleshooting

### Tests Fail with "inconsistent vendoring"

```bash
go mod tidy
go mod vendor
```

### Pre-commit Hooks Not Working

```bash
# Reinstall hooks
pre-commit uninstall
task hooks:install

# Or manually
pre-commit install
```

### Linter Not Found

```bash
# Install golangci-lint
brew install golangci-lint  # macOS

# Or
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
```

### Tests Pass Locally but Fail in CI

```bash
# Clean cache
go clean -cache -testcache

# Run with same flags as CI
go test -v -race -coverprofile=coverage.out ./...

# Check formatting
gofmt -s -l .
```

### Coverage Report Not Generated

```bash
# Generate coverage
task test:coverage

# Or manually
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html
open coverage.html  # macOS
```

## CI Pipeline Details

### When Does It Run?

✅ On push to `main` or `develop`  
✅ On pull requests to `main` or `develop`  
❌ On feature branches without PR

### What Does It Do?

1. **Checkout code**
2. **Setup Go 1.23**
3. **Setup PostgreSQL 16** (for integration tests)
4. **Install dependencies**
5. **Format check** (`go fmt`)
6. **Static analysis** (`go vet`)
7. **Run linter** (`golangci-lint`)
8. **Run all tests** with race detector
9. **Generate coverage report**
10. **Upload to Codecov** (optional)
11. **Build all services**
12. **Build Docker images** (main branch only)

### Typical Run Time

- Fast: ~3-5 minutes
- Includes all checks and builds

## Pre-commit Hook Details

### What Gets Checked?

Before EVERY commit:
1. ✅ Trailing whitespace removed
2. ✅ File ends with newline
3. ✅ YAML files valid
4. ✅ No large files
5. ✅ No merge conflicts
6. ✅ No private keys
7. ✅ Code formatted (`go fmt`)
8. ✅ Static analysis (`go vet`)
9. ✅ Dependencies tidy (`go mod tidy`)
10. ✅ Unit tests pass (fast only)

### How to Skip (Emergency Only)

```bash
git commit --no-verify -m "emergency fix"
```

⚠️ **Warning**: CI will still run all checks!

## Continuous Improvement

### Adding New Tests

When adding features:
1. Write tests first (TDD)
2. Ensure tests pass
3. Check coverage doesn't decrease
4. Update documentation if needed

### Increasing Coverage

Priority areas for improvement:
1. 🔴 API Service HTTP handlers
2. 🔴 User Service HTTP handlers
3. ⚠️ API Service repository
4. ⚠️ Bot Service (not covered yet)

### Benchmarking (Future)

```bash
# Run benchmarks
go test -bench=. ./...

# With memory profiling
go test -bench=. -benchmem ./...
```

## Best Practices

### ✅ DO
- Write tests for new features
- Run tests before committing
- Keep tests fast (<100ms each)
- Use meaningful test names
- Test error cases
- Mock external dependencies
- Clean up test resources

### ❌ DON'T
- Skip tests (except in emergency)
- Commit without running CI locally
- Write flaky tests
- Test implementation details
- Share state between tests
- Leave commented-out code

## Commit Message Format

Use Conventional Commits:

```
feat(user): add user registration
fix(api): handle nil pointer in link creation
test(user): add repository tests
ci: update GitHub Actions workflow
docs(testing): add coverage guide
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `test` - Add/update tests
- `ci` - CI/CD changes
- `docs` - Documentation
- `refactor` - Code refactoring
- `chore` - Maintenance

## Resources

### Documentation
- [TESTING.md](./TESTING.md) - Detailed testing guide
- [CI_CD.md](./CI_CD.md) - CI/CD documentation
- [TEST_SUMMARY.md](./TEST_SUMMARY.md) - Coverage summary

### External Links
- [testify Documentation](https://github.com/stretchr/testify)
- [golangci-lint](https://golangci-lint.run/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [pre-commit](https://pre-commit.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Support

If you have questions:
1. Check documentation (TESTING.md, CI_CD.md)
2. Look at existing tests for examples
3. Ask team members
4. Create an issue

## Summary

✅ **38 tests** covering user service, API service, and integration flows  
✅ **GitHub Actions CI/CD** running on every push/PR  
✅ **Pre-commit hooks** catching issues before commit  
✅ **70% code coverage** with clear targets for improvement  
✅ **Comprehensive documentation** for testing and CI/CD  

**You're all set! Start developing with confidence! 🚀**

---

*Last updated: January 19, 2026*
