# Fixing gofmt Check in CI

## Problem

CI was failing with error:
```
Please run 'go fmt ./...'
vendor/github.com/davecgh/go-spew/spew/bypass.go
vendor/github.com/google/uuid/uuid.go
... (many files from vendor/)
Error: Process completed with exit code 1.
```

## Cause

The `gofmt` check was checking all files, including the `vendor/` directory, which contains external dependencies. These files should not be checked because:
1. They are not part of our code
2. They may be formatted differently
3. We don't control their formatting

## Solution

Excluded the `vendor/` directory from formatting check.

### Before:
```yaml
- name: Run go fmt
  run: |
    if [ "$(gofmt -s -l . | wc -l)" -gt 0 ]; then
      echo "Please run 'go fmt ./...'"
      gofmt -s -l .
      exit 1
    fi
```

### After:
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

## What changed

1. ✅ Uses `find` to search for `.go` files
2. ✅ Excludes `vendor/` directory
3. ✅ Excludes `.git/` directory
4. ✅ Checks only project files

## Verification

```bash
# Local check (excluding vendor)
unformatted=$(gofmt -s -l $(find . -name '*.go' -not -path './vendor/*' -not -path './.git/*' 2>/dev/null))
if [ -n "$unformatted" ]; then
  echo "Unformatted files found"
  echo "$unformatted"
else
  echo "✅ All files are properly formatted"
fi
```

## Alternative approaches

### Option 1: Use go fmt directly
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

### Option 2: Use gofmt with explicit directory list
```yaml
- name: Run go fmt
  run: |
    for dir in cmd internal pkg tests; do
      if [ -d "$dir" ]; then
        gofmt -s -l "$dir"
      fi
    done
```

## Recommendation

Current solution is optimal:
- ✅ Checks only project files
- ✅ Ignores vendor and .git
- ✅ Shows list of unformatted files
- ✅ Works fast

## Files changed

- `.github/workflows/ci.yml` - Updated gofmt check

## Result

- ✅ CI no longer fails on files from vendor/
- ✅ Only project files are checked
- ✅ Faster check (fewer files)
