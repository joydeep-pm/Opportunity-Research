#!/bin/bash
# Setup cron job for daily 7am signal digest

PROJECT_DIR="/Users/joy/Opportunity Research"
VENV_PYTHON="$PROJECT_DIR/.venv/bin/python"

# Cron entry (runs at 7am daily)
CRON_ENTRY="0 7 * * * cd \"$PROJECT_DIR\" && \"$VENV_PYTHON\" backend/signal_engine.py >> logs/digest_cron.log 2>&1"

echo "Setting up cron job for daily 7am signal digest generation..."
echo ""
echo "Cron entry:"
echo "$CRON_ENTRY"
echo ""

# Create logs directory
mkdir -p "$PROJECT_DIR/logs"

if [ ! -x "$VENV_PYTHON" ]; then
    echo "⚠️  Virtualenv python not found at: $VENV_PYTHON"
    echo "   Run ./setup.sh first."
    exit 1
fi

# Check if cron entry already exists
if crontab -l 2>/dev/null | grep -q "backend/signal_engine.py"; then
    echo "⚠️  Cron job already exists. Remove it first with:"
    echo "   crontab -e"
    echo "   (then delete the line with backend/signal_engine.py)"
else
    # Add to crontab
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    echo "✓ Cron job installed!"
    echo ""
    echo "Digest will generate daily at 7:00 AM"
    echo "Check logs at: $PROJECT_DIR/logs/digest_cron.log"
    echo ""
    echo "To verify:"
    echo "  crontab -l"
    echo ""
    echo "To remove:"
    echo "  crontab -e"
fi
