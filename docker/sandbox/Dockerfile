# MoltStore App Sandbox
# Isolated environment for testing uploaded apps

FROM node:20-alpine

# Install runtime dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create app directories
WORKDIR /app
RUN mkdir -p /app/code /app/output /app/logs && \
    chown -R appuser:appgroup /app

# Install monitoring tools
COPY monitor.sh /app/monitor.sh
RUN chmod +x /app/monitor.sh

# Set resource limits via environment
ENV NODE_OPTIONS="--max-old-space-size=256"
ENV PYTHONUNBUFFERED=1

# Switch to non-root user
USER appuser

# Set entrypoint
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/app/monitor.sh"]
