FROM golang:1.22 AS build

WORKDIR /src
COPY go.mod go.sum ./
COPY vendor ./vendor
COPY cmd ./cmd
COPY internal ./internal
COPY pkg ./pkg

ENV CGO_ENABLED=0
ENV GOFLAGS=-mod=vendor

RUN go build -o /out/api-service ./cmd/api-service
RUN go build -o /out/ai-worker ./cmd/ai-worker
RUN go build -o /out/bot-service ./cmd/bot-service

FROM debian:bookworm-slim

WORKDIR /app
COPY --from=build /out/api-service ./api-service
COPY --from=build /out/ai-worker ./ai-worker
COPY --from=build /out/bot-service ./bot-service

