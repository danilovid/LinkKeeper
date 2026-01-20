# Testing Documentation

This document describes the testing strategy and how to run tests for the LinkKeeper project.

## Test Structure

The project uses a comprehensive testing strategy with multiple levels:

### 1. Unit Tests
Located in the same packages as the code being tested (with `_test.go` suffix):

- `internal/user-service/repository/user_test.go` - User repository tests
- `internal/user-service/usecase/user_test.go` - User business logic tests
- `internal/user-service/transport/http/http_test.go` - User HTTP handler tests
- `internal/api-service/repository/link_test.go` - Link repository tests
- `internal/api-service/usecase/link_test.go` - Link business logic tests

### 2. Integration Tests
Located in `tests/` directory:

- `tests/integration_test.go` - End-to-end integration tests

## Running Tests

### Quick Start

```bash
# Run all tests
task test

# Run only unit tests
task test:unit

# Run only integration tests
task test:integration

# Run tests with coverage report
task test:coverage
```

### Using Go Commands Directly

```bash
# Run all tests
go test ./...

# Run tests with verbose output
go test -v ./...

# Run tests with race detector
go test -v -race ./...

# Run only short tests (skip integration tests)
go test -v -short ./...

# Run tests with coverage
go test -v -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### Using Taskfile

```bash
# Run tests
task test

# Run tests with coverage
task test:coverage

# Run linters
task lint

# Format code
task fmt
```

## Test Dependencies

The project uses the following testing libraries:

- `github.com/stretchr/testify` - Assertions and mocking
  - `assert` - Assertion functions
  - `require` - Required assertions that stop test on failure
  - `mock` - Mocking framework
- `gorm.io/driver/sqlite` - In-memory SQLite for testing databases

Install test dependencies:

```bash
go get github.com/stretchr/testify/assert
go get github.com/stretchr/testify/mock
go get github.com/stretchr/testify/require
```

## Writing Tests

### Unit Test Example

```go
func TestUserRepo_Create(t *testing.T) {
    db := setupTestDB(t)
    repo := NewUserRepo(db)

    user := &userservice.UserModel{
        TelegramID: 123456789,
        Username:   "testuser",
    }

    err := repo.Create(user)
    assert.NoError(t, err)
    assert.NotEqual(t, uuid.Nil, user.ID)
}
```

### Mock Example

```go
type MockRepository struct {
    mock.Mock
}

func (m *MockRepository) GetByID(id uuid.UUID) (*User, error) {
    args := m.Called(id)
    return args.Get(0).(*User), args.Error(1)
}

func TestUsecase(t *testing.T) {
    mockRepo := new(MockRepository)
    mockRepo.On("GetByID", mock.Anything).Return(&User{}, nil)
    
    // Use mockRepo in your test
    mockRepo.AssertExpectations(t)
}
```

### Integration Test Example

```go
func TestIntegration_CreateAndGetUser(t *testing.T) {
    if testing.Short() {
        t.Skip("Skipping integration test in short mode")
    }
    
    // Setup services
    // Make HTTP requests
    // Assert responses
}
```

## Coverage Goals

- **Unit Tests**: Aim for >80% coverage
- **Critical Paths**: 100% coverage for authentication, data persistence
- **Integration Tests**: Cover main user flows

Check current coverage:

```bash
task test:coverage
```

## Continuous Integration

### GitHub Actions

The project uses GitHub Actions for CI. See `.github/workflows/ci.yml`.

The CI pipeline runs:
1. Code formatting checks (`go fmt`)
2. Static analysis (`go vet`)
3. Linter checks (`golangci-lint`)
4. All tests with race detector
5. Build verification for all services
6. Docker image builds (on main branch)

### Local CI Simulation

Run all CI checks locally before pushing:

```bash
task ci:local
```

## Pre-commit Hooks

Install pre-commit hooks to run checks before each commit:

```bash
task hooks:install
```

The hooks will:
- Format code automatically
- Run `go vet`
- Run `go mod tidy`
- Run unit tests

## Test Best Practices

1. **Keep tests isolated** - Each test should be independent
2. **Use table-driven tests** - For testing multiple scenarios
3. **Name tests clearly** - `TestFunctionName_Scenario_ExpectedResult`
4. **Mock external dependencies** - Use interfaces and mocks
5. **Test error cases** - Don't only test happy paths
6. **Clean up resources** - Use `t.Cleanup()` or defer
7. **Use test fixtures** - For complex test data
8. **Skip slow tests** - Use `t.Skip()` for integration tests in short mode

## Troubleshooting

### Tests are slow

```bash
# Run only unit tests (skip integration)
go test -short ./...

# Run tests in parallel
go test -parallel 4 ./...
```

### Race detector issues

```bash
# Run with race detector to find concurrency issues
go test -race ./...
```

### Coverage not working

```bash
# Generate coverage profile
go test -coverprofile=coverage.out ./...

# View coverage in browser
go tool cover -html=coverage.out

# View coverage summary
go tool cover -func=coverage.out
```

## Future Improvements

- [ ] Add benchmark tests for performance-critical code
- [ ] Add E2E tests with Docker Compose
- [ ] Add mutation testing
- [ ] Increase coverage to >85%
- [ ] Add performance regression tests
