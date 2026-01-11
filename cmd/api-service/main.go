package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	repo "github.com/danilovid/linkkeeper/internal/api-service/repository"
	"github.com/danilovid/linkkeeper/internal/api-service/transport/http"
	"github.com/danilovid/linkkeeper/internal/api-service/usecase"
	"github.com/danilovid/linkkeeper/pkg/config"
	"github.com/danilovid/linkkeeper/pkg/database/postgresql"
	"github.com/danilovid/linkkeeper/pkg/httpclient"
	"github.com/danilovid/linkkeeper/pkg/logger"
)

const shutdownTimeout = 5 * time.Second

func main() {
	cfg := config.New()

	logger.Init()

	db := postgresql.New(cfg.PostgresDSN, &repo.LinkModel{})
	linkRepo := repo.NewLinkRepo(db)
	linkSvc := usecase.NewLinkService(linkRepo)

	httpSrv := http.NewServer(linkSvc)
	srv := httpclient.New(cfg.HTTPAddr, httpSrv.Handler(), nil)

	go func() {
		logger.L().Info().Str("addr", cfg.HTTPAddr).Msg("api listening")
		if err := srv.ListenAndServe(); err != nil {
			logger.L().Fatal().Err(err).Msg("http server")
		}
	}()

	waitForShutdown(func() {
		ctx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
		defer cancel()
		_ = srv.Shutdown(ctx)
	})
}

func waitForShutdown(fn func()) {
	ch := make(chan os.Signal, 1)
	signal.Notify(ch, syscall.SIGINT, syscall.SIGTERM)
	<-ch
	fn()
}
