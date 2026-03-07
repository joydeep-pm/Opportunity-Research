#!/bin/bash
# Setup cron job for daily 9pm signal digest

PROJECT_DIR="/Users/joy/Opportunity Research"

# Cron entry (runs at 9pm daily)
CRON_ENTRY="0 21 * * * cd \"$PROJECT_DIR\" && bash backend/run_daily_digest.sh >> logs/digest_cron.log 2>&1"

echo "Setting up cron job for daily 9pm digest generation..."
echo ""
echo "Cron entry:"
echo "$CRON_ENTRY"
echo ""

# Create logs directory
mkdir -p "$PROJECT_DIR/logs"

# Check if cron entry already exists
if crontab -l 2>/dev/null | grep -q "run_daily_digest.sh"; then
    echo "⚠️  Cron job already exists. Remove it first with:"
    echo "   crontab -e"
    echo "   (then delete the line with run_daily_digest.sh)"
else
    # Add to crontab
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    echo "✓ Cron job installed!"
    echo ""
    echo "Digest will generate daily at 9:00 PM"
    echo "Check logs at: $PROJECT_DIR/logs/digest_cron.log"
    echo ""
    echo "To verify:"
    echo "  crontab -l"
    echo ""
    echo "To remove:"
    echo "  crontab -e"
fi
