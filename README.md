# MCP Desktop Notification Server

A Model Context Protocol (MCP) server that provides desktop notification capabilities with sound support.

## Features

- **Desktop Notifications**: Send notifications using `beeep` library
- **Sound Support**: Play notification sounds with multiple options:
  - System beep sounds (`"beep"`, `"system"`)  
  - Custom frequency beeps (`"beep:440"` for 440Hz)
  - MP3 file playback using native Go libraries (`@sound.mp3`)
  - Other audio formats via system commands
- **Cross-platform**: Works on macOS, Linux, and Windows
- **MCP Integration**: Ready for use with Claude Code and other MCP clients

## Installation

```bash
git clone <repository>
cd mcp-desktop-notification
go build -o mcp-desktop-notification
```

## Usage

### As MCP Server

Add to your Claude Code configuration:

```json
{
  "mcpServers": {
    "desktop-notification": {
      "command": "/path/to/mcp-desktop-notification",
      "args": []
    }
  }
}
```

### Available Tools

#### `send_notification`
Send a standard desktop notification.

**Parameters:**
- `title` (required): Notification title
- `message` (required): Notification message  
- `icon` (optional): Path to icon file
- `sound` (optional): Sound to play (defaults to `@sound.mp3`)

### Sound Options

- `"beep"` or `"system"` - High-pitch system beep (800Hz)
- `"beep:440"` - Custom frequency beep (440Hz example)
- `"@sound.mp3"` - MP3 file (played with system audio commands)
- `"/path/to/file.wav"` - Other audio formats (via system commands)

## Testing

```
# Start the server
go run main.go

# Then send initialization (paste this):
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}}}

# Then send the notification request:
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"send_notification","arguments":{"title":"Test Alert","message":"This is a test notification!"}}}
```

## Dependencies

- `github.com/gen2brain/beeep` - Cross-platform notifications
- `github.com/mark3labs/mcp-go` - MCP protocol implementation

**Audio Playback**: Uses system audio commands (`afplay` on macOS, `paplay`/`aplay`/`mpg123`/`ffplay` on Linux, PowerShell on Windows) for maximum compatibility and to avoid audio system initialization issues.

## License

[License information]