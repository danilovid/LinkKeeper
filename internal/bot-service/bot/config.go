package bot

import (
	"errors"
	"strings"
	"time"
)

type Config struct {
	Token      string
	APIBaseURL string
	Timeout    time.Duration
}

func (c *Config) Validate() error {
	if strings.TrimSpace(c.Token) == "" {
		return errors.New("missing TELEGRAM_TOKEN")
	}
	if strings.TrimSpace(c.APIBaseURL) == "" {
		return errors.New("missing API_BASE_URL")
	}
	if c.Timeout <= 0 {
		c.Timeout = 10 * time.Second
	}
	return nil
}
