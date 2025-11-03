# ============================
# Stage 1 - Builder
# ============================
FROM golang:1.24-alpine AS builder
WORKDIR /app

# Dependencies and timezone
RUN apk add --no-cache git tzdata ca-certificates

# Copy go.mod and go.sum
COPY go.mod go.sum ./
RUN go mod download

# Copy backend source
COPY . ./

# Build binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server ./cmd/server

# ============================
# Stage 2 - Runtime
# ============================
FROM alpine:3.20
WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata dumb-init

# Copy built binary
COPY --from=builder /app/server .

# Optional: copy migrations or config if used at runtime
COPY --from=builder /app/internal/db/migrations ./migrations
COPY --from=builder /app/config ./config

# Environment
ENV PORT=8080 \
    GIN_MODE=release \
    TZ=UTC

EXPOSE 8080

# Security: non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENTRYPOINT ["dumb-init", "--"]
CMD ["./server"]
