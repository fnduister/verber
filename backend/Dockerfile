# Development stage
FROM golang:1.21-alpine AS development

# Install development tools
RUN apk add --no-cache git curl

WORKDIR /app

# Copy go mod files (go.sum might not exist initially)
COPY go.mod ./
COPY go.sum* ./
RUN go mod download

# Install air for live reloading (compatible with Go 1.21)
RUN go install github.com/cosmtrek/air@v1.49.0

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Use air for live reloading in development
CMD ["air", "-c", ".air.toml"]

# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install ca-certificates and git for building
RUN apk add --no-cache ca-certificates git

# Copy go mod files (go.sum might not exist initially)
COPY go.mod ./
COPY go.sum* ./
RUN go mod download

# Copy source code
COPY . .

# Build the application with optimizations
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo \
    -o main cmd/server/main.go

# Production stage
FROM scratch AS production

# Copy ca-certificates from builder
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy the binary from builder stage
COPY --from=builder /app/main /main

# Expose port
EXPOSE 8080

# Run the binary
ENTRYPOINT ["/main"]