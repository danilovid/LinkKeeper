package httpclient

import (
	"crypto/tls"
	"net/http"
	"time"
)

const (
	readTimeout  = 5 * time.Second
	writeTimeout = 5 * time.Second
)

func New(httpAddr string, handler http.Handler, tlsConfig *tls.Config) *http.Server {
	return &http.Server{
		ReadTimeout:  readTimeout,
		WriteTimeout: writeTimeout,
		Addr:         httpAddr,
		Handler:      handler,
		TLSConfig:    tlsConfig,
	}
}
