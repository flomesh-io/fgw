# syntax = docker/dockerfile:1.4
ARG GO_VERSION
ARG PIPY_VERSION

# Build the gateway binary
FROM --platform=$BUILDPLATFORM golang:$GO_VERSION AS builder
ARG LDFLAGS
ARG TARGETOS
ARG TARGETARCH

WORKDIR /workspace
# Copy the Go Modules manifests
COPY go.mod go.mod
COPY go.sum go.sum
# cache deps before building and copying source so that we don't need to re-download as much
# and so that source changes don't invalidate our downloaded layer
RUN --mount=type=cache,target=/go/pkg go mod download
# Copy the go source
COPY . .

# Build
RUN --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=cache,target=/go/pkg \
    GOOS=$TARGETOS GOARCH=$TARGETARCH make build

# Build the final image
FROM flomesh/pipy-repo:$PIPY_VERSION
WORKDIR /
COPY --from=builder /workspace/bin/fgw .
COPY pjs/ pjs/

ENTRYPOINT ["/fgw"]