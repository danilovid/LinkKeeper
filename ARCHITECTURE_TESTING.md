# Тестирование и архитектура в GitHub Actions

## Краткий ответ: НЕТ, отдельная сборка с указанием архитектуры НЕ нужна

### Почему не нужно?

1. **`go test` автоматически компилирует для текущей платформы**
   - GitHub Actions runner (`ubuntu-latest`) работает на `linux/amd64`
   - `go test` автоматически компилирует тесты для `linux/amd64`
   - Тесты запускаются на той же архитектуре, что и runner

2. **Текущая конфигурация правильная:**
```yaml
- name: Run tests
  run: |
    go test -v -race -coverprofile=coverage.out -covermode=atomic ./...
```

3. **Go автоматически определяет:**
   - Операционную систему (Linux)
   - Архитектуру (amd64)
   - Компилирует и запускает соответственно

## Когда МОЖЕТ понадобиться указать архитектуру?

### 1. Кросс-платформенное тестирование

Если нужно тестировать на разных платформах:

```yaml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        go-version: ['1.23']
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: ${{ matrix.go-version }}
      - run: go test ./...
```

### 2. Тестирование на разных архитектурах (ARM, x86)

```yaml
jobs:
  test:
    strategy:
      matrix:
        arch: [amd64, arm64]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.23'
      - run: |
          GOARCH=${{ matrix.arch }} go test ./...
```

### 3. Сборка бинарников для разных платформ

Для сборки (не тестов) может понадобиться:

```yaml
- name: Build for multiple platforms
  run: |
    GOOS=linux GOARCH=amd64 go build -o bin/api-service-linux-amd64 ./cmd/api-service
    GOOS=linux GOARCH=arm64 go build -o bin/api-service-linux-arm64 ./cmd/api-service
    GOOS=windows GOARCH=amd64 go build -o bin/api-service-windows-amd64.exe ./cmd/api-service
```

## Текущая конфигурация (оптимальная для большинства случаев)

```yaml
- name: Set up Go
  uses: actions/setup-go@v5
  with:
    go-version: '1.23'
    cache: true

- name: Run tests
  run: |
    go test -v -race -coverprofile=coverage.out -covermode=atomic ./...
```

**Это работает потому что:**
- ✅ `ubuntu-latest` = Linux amd64
- ✅ `go test` автоматически компилирует для Linux amd64
- ✅ Тесты запускаются нативно (быстро)
- ✅ Race detector работает корректно
- ✅ Coverage собирается правильно

## Сравнение подходов

### Текущий подход (рекомендуется)
```yaml
go test ./...
```
- ✅ Просто и быстро
- ✅ Автоматическая компиляция для текущей платформы
- ✅ Нативная производительность
- ✅ Подходит для 99% проектов

### Явное указание архитектуры (избыточно)
```yaml
GOOS=linux GOARCH=amd64 go test ./...
```
- ⚠️ Избыточно (то же самое, что и без указания)
- ⚠️ Может быть медленнее (если нужна кросс-компиляция)
- ✅ Нужно только для кросс-платформенного тестирования

## Когда добавить multi-arch тестирование?

Добавьте только если:
1. ✅ Проект должен работать на разных платформах (Windows, macOS, Linux)
2. ✅ Есть платформо-специфичный код (syscalls, файловые пути)
3. ✅ Нужно тестировать на ARM (например, для Docker на ARM)
4. ✅ Требования проекта/компании

## Рекомендации

### Для вашего проекта (LinkKeeper)

**Текущая конфигурация идеальна:**
- ✅ Тесты запускаются на Linux amd64 (стандарт для серверов)
- ✅ Быстро и эффективно
- ✅ Покрывает основную целевую платформу
- ✅ Race detector работает корректно

**Не нужно добавлять:**
- ❌ Явное указание GOOS/GOARCH (избыточно)
- ❌ Multi-arch тестирование (если не требуется)
- ❌ Дополнительные сборки (только для тестов)

### Если понадобится расширить

Добавьте matrix strategy только если:
- Нужно тестировать на Windows/macOS
- Нужна поддержка ARM
- Есть платформо-специфичный код

## Пример расширенной конфигурации (если понадобится)

```yaml
jobs:
  test:
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            go-version: '1.23'
          - os: windows-latest
            go-version: '1.23'
          - os: macos-latest
            go-version: '1.23'
    runs-on: ${{ matrix.os }}
    services:
      postgres:
        image: postgres:16
        # ... (только для Linux)
        if: matrix.os == 'ubuntu-latest'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: ${{ matrix.go-version }}
      - name: Run tests
        run: go test -v -race ./...
        # PostgreSQL только на Linux
        if: matrix.os == 'ubuntu-latest'
```

## Вывод

**Для вашего проекта:**
- ✅ Текущая конфигурация правильная
- ✅ Не нужно указывать архитектуру явно
- ✅ `go test` автоматически работает корректно
- ✅ Все тесты запускаются нативно на Linux amd64

**Добавляйте multi-arch только если:**
- Требуется поддержка других платформ
- Есть специфичные требования проекта
