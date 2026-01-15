package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	repo "github.com/danilovid/linkkeeper/internal/user-service/repository"
	"github.com/danilovid/linkkeeper/internal/user-service/transport/http"
	"github.com/danilovid/linkkeeper/internal/user-service/usecase"
	"github.com/danilovid/linkkeeper/pkg/config"
	"github.com/danilovid/linkkeeper/pkg/database/postgresql"
	"github.com/danilovid/linkkeeper/pkg/httpclient"
	"github.com/danilovid/linkkeeper/pkg/logger"

	userservice "github.com/danilovid/linkkeeper/internal/user-service"
)

const shutdownTimeout = 5 * time.Second

func main() {
	cfg := config.New()

	logger.Init()

	db := postgresql.New(cfg.PostgresDSN, &userservice.UserModel{})
	userRepo := repo.NewUserRepo(db)
	userSvc := usecase.NewUserService(userRepo)

	httpSrv := http.NewServer(userSvc)
	srv := httpclient.New(cfg.HTTPAddr, httpSrv.Handler(), nil)

	go func() {
		logger.L().Info().Str("addr", cfg.HTTPAddr).Msg("user-service listening")
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
