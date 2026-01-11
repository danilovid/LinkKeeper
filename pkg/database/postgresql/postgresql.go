package postgresql

import (
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
	return db
}
