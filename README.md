# MCP Desktop Notification Server

A Model Context Protocol (MCP) server that provides desktop notification capabilities. 

Useful to add as an instruction to notify you every time an instruction has finished. That way, you can move to a different window and get notified once the instruction is done

_For example_

```
$ Whenever you finish an instruction, notify using desktop-notification mcp tool
```

## Features

- **Desktop Notifications**: Send notifications with title and message
- **Audio Support**: Automatic audio playback with embedded sound file
- **Cross-platform**: Works on macOS, Linux, and Windows
- **MCP Integration**: Ready for use with Claude Code and other MCP clients

## Build before Installing to as an MCP to your tool

```bash
git clone <repository>
cd mcp-desktop-notification
go build -o mcp-desktop-notification
```

## Usage

### Install in Different Tools

<details>
<summary><strong>Claude Code</strong></summary>

Add to your MCP configuration:
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

</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Add to `claude_desktop_config.json`:
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

</details>

<details>
<summary><strong>Cursor</strong></summary>

1. Open Cursor Settings
2. Navigate to Extensions → MCP
3. Add server configuration:
```json
{
  "desktop-notification": {
    "command": "/path/to/mcp-desktop-notification",
    "args": []
  }
}
```

</details>

<details>
<summary><strong>Windsurf</strong></summary>

Add to `.windsurf/mcp.json`:
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

</details>

<details>
<summary><strong>VS Code (with MCP extension)</strong></summary>

Add to VS Code settings or workspace configuration:
```json
{
  "mcp.servers": {
    "desktop-notification": {
      "command": "/path/to/mcp-desktop-notification",
      "args": []
    }
  }
}
```

</details>

<details>
<summary><strong>Zed</strong></summary>

Add to Zed configuration file:
```json
{
  "experimental": {
    "mcp": {
      "servers": {
        "desktop-notification": {
          "command": "/path/to/mcp-desktop-notification",
          "args": []
        }
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Cline (VS Code Extension)</strong></summary>

Configure in Cline settings:
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

</details>

<details>
<summary><strong>Trae</strong></summary>

Refer to Trae's MCP configuration documentation and use:
```json
{
  "command": "/path/to/mcp-desktop-notification",
  "args": []
}
```

</details>

<details>
<summary><strong>Visual Studio 2022</strong></summary>

Refer to Visual Studio 2022's MCP configuration documentation and use:
```json
{
  "command": "/path/to/mcp-desktop-notification",
  "args": []
}
```

</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

Refer to Gemini CLI's MCP configuration documentation and use:
```json
{
  "command": "/path/to/mcp-desktop-notification",
  "args": []
}
```

</details>

<details>
<summary><strong>BoltAI</strong></summary>

Refer to BoltAI's MCP configuration documentation and use:
```json
{
  "command": "/path/to/mcp-desktop-notification",
  "args": []
}
```

</details>

<details>
<summary><strong>Augment Code</strong></summary>

Refer to Augment Code's MCP configuration documentation and use:
```json
{
  "command": "/path/to/mcp-desktop-notification",
  "args": []
}
```

</details>

<details>
<summary><strong>Roo Code</strong></summary>

Refer to Roo Code's MCP configuration documentation and use:
```json
{
  "command": "/path/to/mcp-desktop-notification",
  "args": []
}
```

</details>

<details>
<summary><strong>Zencoder</strong></summary>

Refer to Zencoder's MCP configuration documentation and use:
```json
{
  "command": "/path/to/mcp-desktop-notification",
  "args": []
}
```

</details>

<details>
<summary><strong>Amazon Q Developer CLI</strong></summary>

Refer to Amazon Q Developer CLI's MCP configuration documentation and use:
```json
{
  "command": "/path/to/mcp-desktop-notification",
  "args": []
}
```

</details>

<details>
<summary><strong>Qodo Gen</strong></summary>

Refer to Qodo Gen's MCP configuration documentation and use:
```json
{
  "command": "/path/to/mcp-desktop-notification",
  "args": []
}
```

</details>

<details>
<summary><strong>JetBrains AI Assistant</strong></summary>

Refer to JetBrains AI Assistant's MCP configuration documentation and use:
```json
{
  "command": "/path/to/mcp-desktop-notification",
  "args": []
}
```

</details>

<details>
<summary><strong>Warp</strong></summary>

Refer to Warp's MCP configuration documentation and use:
```json
{
  "command": "/path/to/mcp-desktop-notification",
  "args": []
}
```

</details>

<details>
<summary><strong>Opencode</strong></summary>

Refer to Opencode's MCP configuration documentation and use:
```json
{
  "command": "/path/to/mcp-desktop-notification",
  "args": []
}
```

</details>

**Note:** Replace `/path/to/mcp-desktop-notification` with the actual path to your compiled binary.

### Available Tools

#### `send_notification`
Send a desktop notification with embedded audio.

**Parameters:**
- `title` (required): Notification title
- `message` (required): Notification message

**Audio:** Automatically plays embedded [sound.mp3](sound.mp3) file with each notification.

## Manual Dev Testing

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

**Audio Support**: Includes an embedded sound.mp3 file that plays automatically with each notification. Uses system audio commands (`afplay` on macOS, `paplay`/`aplay`/`mpg123`/`ffplay` on Linux, PowerShell on Windows) for maximum compatibility.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
