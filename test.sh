#!/bin/bash

# Test script for MCP Desktop Notification Server
# This script demonstrates how to test the server manually

echo "=== MCP Desktop Notification Server Test ==="
echo ""
echo "To test this MCP server, you have several options:"
echo ""

echo "1. Start the server manually:"
echo "   ./mcp-desktop-notification"
echo ""

echo "2. Test with Claude Code (recommended):"
echo "   Add this to your Claude Code MCP configuration:"
echo ""
echo "   {"
echo "     \"mcpServers\": {"
echo "       \"desktop-notification\": {"
echo "         \"command\": \"$(pwd)/mcp-desktop-notification\","
echo "         \"args\": []"
echo "       }"
echo "     }"
echo "   }"
echo ""

echo "3. Manual JSON-RPC test (advanced):"
echo "   You can send JSON-RPC requests via stdin to test the tools."
echo ""

echo "Available tools:"
echo "  - send_notification: Send a standard desktop notification (optional sound)"
echo "  - send_alert: Send an alert-style notification (plays beep by default)"
echo ""

echo "Example JSON-RPC requests (for manual testing):"
echo ""
echo "Basic notification:"
echo '{'
echo '  "jsonrpc": "2.0",'
echo '  "id": 1,'
echo '  "method": "tools/call",'
echo '  "params": {'
echo '    "name": "send_notification",'
echo '    "arguments": {'
echo '      "title": "Test Notification",'
echo '      "message": "This is a test message from the MCP server!"'
echo '    }'
echo '  }'
echo '}'
echo ""
echo "Notification with sound:"
echo '{'
echo '  "jsonrpc": "2.0",'
echo '  "id": 2,'
echo '  "method": "tools/call",'
echo '  "params": {'
echo '    "name": "send_notification",'
echo '    "arguments": {'
echo '      "title": "Sound Test",'
echo '      "message": "This notification has a beep sound!",'
echo '      "sound": "beep"'
echo '    }'
echo '  }'
echo '}'
echo ""
echo "Alert with custom frequency beep:"
echo '{'
echo '  "jsonrpc": "2.0",'
echo '  "id": 3,'
echo '  "method": "tools/call",'
echo '  "params": {'
echo '    "name": "send_alert",'
echo '    "arguments": {'
echo '      "title": "Emergency Alert",'
echo '      "message": "This is an urgent alert!",'
echo '      "sound": "beep:880"'
echo '    }'
echo '  }'
echo '}'
echo ""

echo "To quickly test if notifications work on your system:"
echo "Run this Go test program:"
cat << 'EOF'

package main

import (
    "github.com/gen2brain/beeep"
    "log"
)

func main() {
    err := beeep.Notify("Test", "Desktop notifications are working!", "")
    if err != nil {
        log.Printf("Notification failed: %v", err)
    } else {
        log.Println("Notification sent successfully")
    }
}
EOF

echo ""
echo "Save the above as test_notification.go and run: go run test_notification.go"
echo ""
echo "Sound options:"
echo "  - 'beep' or 'system': Default system beep sound"
echo "  - 'beep:440': Custom frequency beep (440Hz in this example)"
echo "  - '/path/to/file.wav': Play a sound file (macOS: .wav/.aiff, Linux: various, Windows: .wav)"
echo ""
echo "Test sound functionality: go run test_sound.go"