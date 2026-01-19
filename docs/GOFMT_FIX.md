# Исправление проверки gofmt в CI

## Проблема

CI падал с ошибкой:
```
Please run 'go fmt ./...'
vendor/github.com/davecgh/go-spew/spew/bypass.go
vendor/github.com/google/uuid/uuid.go
... (много файлов из vendor/)
Error: Process completed with exit code 1.
```

## Причина

Проверка `gofmt` проверяла все файлы, включая директорию `vendor/`, которая содержит внешние зависимости. Эти файлы не должны проверяться, так как:
1. Они не являются частью нашего кода
2. Они могут быть отформатированы по-другому
3. Мы не контролируем их форматирование

## Решение

Исключили директорию `vendor/` из проверки форматирования.

### Было:
```yaml
- name: Run go fmt
  run: |
    if [ "$(gofmt -s -l . | wc -l)" -gt 0 ]; then
      echo "Please run 'go fmt ./...'"
      gofmt -s -l .
      exit 1
    fi
```

### Стало:
```yaml
- name: Run go fmt
  run: |
    unformatted=$(gofmt -s -l $(find . -name '*.go' -not -path './vendor/*' -not -path './.git/*' 2>/dev/null))
    if [ -n "$unformatted" ]; then
      echo "Please run 'go fmt ./...'"
      echo "$unformatted"
      exit 1
    fi
```

## Что изменилось

1. ✅ Используется `find` для поиска `.go` файлов
2. ✅ Исключается `vendor/` директория
3. ✅ Исключается `.git/` директория
4. ✅ Проверяются только файлы проекта

## Проверка

```bash
# Локальная проверка (исключая vendor)
unformatted=$(gofmt -s -l $(find . -name '*.go' -not -path './vendor/*' -not -path './.git/*' 2>/dev/null))
if [ -n "$unformatted" ]; then
  echo "Unformatted files found"
  echo "$unformatted"
else
  echo "✅ All files are properly formatted"
fi
```

## Альтернативные подходы

### Вариант 1: Использовать go fmt напрямую
```yaml
- name: Run go fmt
  run: |
    go fmt ./...
    if [ -n "$(git diff --name-only)" ]; then
      echo "Files were modified by go fmt"
      git diff
      exit 1
    fi
```

### Вариант 2: Использовать gofmt с явным списком директорий
```yaml
- name: Run go fmt
  run: |
    for dir in cmd internal pkg tests; do
      if [ -d "$dir" ]; then
        gofmt -s -l "$dir"
      fi
    done
```

## Рекомендация

Текущее решение оптимально:
- ✅ Проверяет только файлы проекта
- ✅ Игнорирует vendor и .git
- ✅ Показывает список неотформатированных файлов
- ✅ Работает быстро

## Файлы изменены

- `.github/workflows/ci.yml` - Обновлена проверка gofmt

## Результат

- ✅ CI больше не падает на файлах из vendor/
- ✅ Проверяются только файлы проекта
- ✅ Более быстрая проверка (меньше файлов)
