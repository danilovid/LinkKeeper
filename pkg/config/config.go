package config

import (
	"flag"
	"os"
)

// Config represents system configuration.
type Config struct {
	Env         string // runtime environment
	HTTPAddr    string // address "[host]:port" for HTTP server
	PostgresDSN string // Postgres DSN
}

// New reads config from environment/flags and returns pointer to a new Config.
func New() *Config {
	c := &Config{}

	flag.StringVar(&c.Env, "env", lookupEnvString("ENV", "dev"), "Set runtime environment.")
	flag.StringVar(&c.HTTPAddr, "httpAddr", lookupEnvString("HTTP_ADDR", ":8080"), `Address in form of "[host]:port" that HTTP server should be listening on.`)
	flag.StringVar(
		&c.PostgresDSN,
		"postgresDsn",
		lookupEnvString("POSTGRES_DSN", "postgres://postgres:postgres@localhost:5432/linkkeeper?sslmode=disable"),
		"PostgreSQL DSN.",
	)

	flag.Parse()

	return c
}

func lookupEnvString(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
