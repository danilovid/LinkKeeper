package main

import (
	"os"
	"strconv"
	"time"

	"github.com/danilovid/linkkeeper/internal/bot-service/bot"
	"github.com/danilovid/linkkeeper/pkg/logger"
)

const defaultTimeout = 10 * time.Second

func main() {
	logger.Init()

	cfg := bot.Config{
		Token:      os.Getenv("TELEGRAM_TOKEN"),
		APIBaseURL: os.Getenv("API_BASE_URL"),
		Timeout:    readTimeout(),
	}

	w, err := bot.NewWrapper(&cfg)
	if err != nil {
		logger.L().Fatal().Err(err).Msg("init bot")
	}

	logger.L().Info().Msg("bot started")
	if err := w.Start(); err != nil {
		logger.L().Fatal().Err(err).Msg("bot stopped")
	}
}

func readTimeout() time.Duration {
	raw := os.Getenv("BOT_TIMEOUT_SECONDS")
	if raw == "" {
		return defaultTimeout
	}
	seconds, err := strconv.Atoi(raw)
	if err != nil || seconds <= 0 {
		return defaultTimeout
	}
	return time.Duration(seconds) * time.Second
}
