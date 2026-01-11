package postgresql

import (
	"os"
	"path/filepath"
	"sort"
	"strings"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/danilovid/linkkeeper/pkg/logger"
)

func New(dsn string, models ...any) *gorm.DB {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		logger.L().Fatal().Err(err).Msg("open database")
	}
	if len(models) > 0 {
		if err := db.AutoMigrate(models...); err != nil {
			logger.L().Fatal().Err(err).Msg("auto migrate")
		}
	}
	if err := applyMigrations(db, migrationsDir()); err != nil {
		logger.L().Fatal().Err(err).Msg("apply migrations")
	}
	return db
}

func migrationsDir() string {
	if v := os.Getenv("MIGRATIONS_DIR"); v != "" {
		return v
	}
	return "migrations"
}

func applyMigrations(db *gorm.DB, dir string) error {
	if err := db.Exec(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version text PRIMARY KEY,
			applied_at timestamptz NOT NULL DEFAULT now()
		)
	`).Error; err != nil {
		return err
	}

	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	var files []string
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if strings.HasSuffix(entry.Name(), ".sql") {
			files = append(files, entry.Name())
		}
	}
	sort.Strings(files)

	for _, name := range files {
		var exists int
		if err := db.Raw(`SELECT 1 FROM schema_migrations WHERE version = ?`, name).Scan(&exists).Error; err != nil {
			return err
		}
		if exists == 1 {
			continue
		}

		path := filepath.Join(dir, name)
		content, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		if err := db.Exec(string(content)).Error; err != nil {
			return err
		}
		if err := db.Exec(`INSERT INTO schema_migrations (version) VALUES (?)`, name).Error; err != nil {
			return err
		}
	}
	return nil
}
