FROM golang:1.22 AS build

WORKDIR /src
COPY go.mod go.sum ./
COPY vendor ./vendor
COPY cmd ./cmd
COPY internal ./internal
COPY pkg ./pkg
COPY migrations ./migrations

ENV CGO_ENABLED=0
ENV GOFLAGS=-mod=vendor

RUN go build -o /out/api-service ./cmd/api-service

FROM debian:bookworm-slim

WORKDIR /app
COPY --from=build /out/api-service ./api-service
