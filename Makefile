.PHONY: help install-hooks test test-coverage lint fmt clean

help:
	@echo "Available commands:"
	@echo "  make install-hooks  - Install pre-commit hooks"
	@echo "  make test          - Run all tests"
	@echo "  make test-coverage - Run tests with coverage report"
	@echo "  make lint          - Run linters"
	@echo "  make fmt           - Format code"
	@echo "  make clean         - Clean build artifacts"

install-hooks:
	@echo "Installing pre-commit hooks..."
	pip install pre-commit || pip3 install pre-commit
	pre-commit install
	@echo "Hooks installed successfully!"

test:
	@echo "Running tests..."
	go test -v -race -short ./...

test-coverage:
	@echo "Running tests with coverage..."
	go test -v -race -coverprofile=coverage.out -covermode=atomic ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

lint:
	@echo "Running linters..."
	golangci-lint run --timeout=5m

fmt:
	@echo "Formatting code..."
	gofmt -s -w .
	goimports -w .

clean:
	@echo "Cleaning build artifacts..."
	rm -rf bin/
	rm -f coverage.out coverage.html
	go clean -cache -testcache
