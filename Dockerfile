FROM golang:1.24 AS builder

RUN apt update && apt-get install -y git

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
COPY webserver/go.mod webserver/go.sum ./webserver/

# Copy vendor directories (must be created locally with: go mod vendor)
COPY vendor ./vendor
COPY webserver/vendor ./webserver/vendor

# Copy source code (exclude binary files)
COPY main.go ./
COPY webserver ./webserver
COPY data ./data

# Build using vendored dependencies (no network access needed)
RUN CGO_ENABLED=0 GOOS=linux go build -mod=vendor -o /sysfas ./main.go

# Final stage - use alpine for minimal size but with shell/filesystem
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy the binary
COPY --from=builder /sysfas /app/sysfas

# Copy data and templates needed at runtime (paths must match webserver.go expectations)
COPY --from=builder /app/data /app/data
COPY --from=builder /app/webserver/templates /app/webserver/templates
COPY --from=builder /app/webserver/static /app/webserver/static

EXPOSE 8080

ENTRYPOINT ["/app/sysfas"]