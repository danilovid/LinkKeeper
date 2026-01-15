FROM golang:latest AS build

WORKDIR /src
COPY go.mod go.sum ./
COPY vendor ./vendor
COPY cmd ./cmd
COPY internal ./internal
COPY pkg ./pkg
COPY migrations ./migrations

ENV CGO_ENABLED=0
ENV GOFLAGS=-mod=vendor

RUN go build -o /out/user-service ./cmd/user-service

FROM debian:bookworm-slim

WORKDIR /app
COPY --from=build /out/user-service ./user-service
