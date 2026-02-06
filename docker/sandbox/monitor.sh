#!/bin/sh
# MoltStore Sandbox Monitor
# Monitors app execution and collects metrics

set -e

# Configuration
TIMEOUT=${SANDBOX_TIMEOUT:-60}
LOG_FILE="/app/logs/execution.log"
METRICS_FILE="/app/output/metrics.json"

# Initialize log
echo "=== MoltStore Sandbox ===" > "$LOG_FILE"
echo "Started at: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$LOG_FILE"
echo "Timeout: ${TIMEOUT}s" >> "$LOG_FILE"

# Detect app type and run
run_app() {
    cd /app/code

    # Check for package.json (Node.js app)
    if [ -f "package.json" ]; then
        echo "Detected: Node.js application" >> "$LOG_FILE"

        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            npm install --production 2>&1 | head -50 >> "$LOG_FILE"
        fi

        # Try to find main entry point
        if [ -f "index.js" ]; then
            timeout "$TIMEOUT" node index.js 2>&1 | head -1000 >> "$LOG_FILE"
        elif [ -f "main.js" ]; then
            timeout "$TIMEOUT" node main.js 2>&1 | head -1000 >> "$LOG_FILE"
        elif [ -f "app.js" ]; then
            timeout "$TIMEOUT" node app.js 2>&1 | head -1000 >> "$LOG_FILE"
        else
            # Try start script from package.json
            timeout "$TIMEOUT" npm start 2>&1 | head -1000 >> "$LOG_FILE"
        fi

    # Check for requirements.txt (Python app)
    elif [ -f "requirements.txt" ]; then
        echo "Detected: Python application" >> "$LOG_FILE"

        # Install dependencies
        pip install --user -r requirements.txt 2>&1 | head -50 >> "$LOG_FILE"

        # Find main entry point
        if [ -f "main.py" ]; then
            timeout "$TIMEOUT" python3 main.py 2>&1 | head -1000 >> "$LOG_FILE"
        elif [ -f "app.py" ]; then
            timeout "$TIMEOUT" python3 app.py 2>&1 | head -1000 >> "$LOG_FILE"
        fi

    else
        echo "Unknown app type" >> "$LOG_FILE"
    fi
}

# Collect metrics
collect_metrics() {
    cat > "$METRICS_FILE" << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "status": "$1",
    "exitCode": $2,
    "executionTimeMs": $3
}
EOF
}

# Main execution
START_TIME=$(date +%s%3N 2>/dev/null || date +%s)

# Run app with timeout
run_app
EXIT_CODE=$?

END_TIME=$(date +%s%3N 2>/dev/null || date +%s)
DURATION=$((END_TIME - START_TIME))

# Determine status
if [ $EXIT_CODE -eq 0 ]; then
    STATUS="success"
elif [ $EXIT_CODE -eq 124 ]; then
    STATUS="timeout"
else
    STATUS="error"
fi

# Collect final metrics
collect_metrics "$STATUS" $EXIT_CODE $DURATION

echo "" >> "$LOG_FILE"
echo "=== Execution Complete ===" >> "$LOG_FILE"
echo "Status: $STATUS" >> "$LOG_FILE"
echo "Exit Code: $EXIT_CODE" >> "$LOG_FILE"
echo "Duration: ${DURATION}ms" >> "$LOG_FILE"

exit 0
