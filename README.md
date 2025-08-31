# MCP Desktop Notification Server

A desktop notification server that can work either as an MCP (Model Context Protocol) server and a Claude Code hook processor. Send desktop notifications with sound alerts from your AI assistants or command line.

## Features

- 🔔 Desktop notifications with customizable title and message
- 🔊 Sound alerts (system beeps or custom audio files)
- 🤖 MCP server mode for AI assistant integration
- 🪝 Claude Code hook processor for event notifications
- 💻 Command-line interface for direct usage
- 🌍 Cross-platform support (macOS, Linux, Windows)

## Installation

### Prerequisites

- Node.js v18 or higher
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/franz-see/mcp-desktop-notification
cd mcp-desktop-notification

# Install dependencies
npm install

# Build the project
npm run build

# Optional: Install globally
npm install -g .
```

## Usage Modes

### 1. Command Line Interface (CLI)

Send notifications directly from the terminal:

```bash
# Basic notification
node dist/index.js --title "Build Complete" --message "Your project has been built successfully"

# With custom sound
node dist/index.js --title "Alert" --message "Important notification" --sound beep

# With icon (path to image file)
node dist/index.js --title "Info" --message "Check this out" --icon /path/to/icon.png

# If installed globally
mcp-desktop-notification --title "Hello" --message "World"
```

#### CLI Options

- `-t, --title <title>` - Notification title (required)
- `-m, --message <message>` - Notification message (required)
- `-i, --icon <icon>` - Path to icon file (optional)
- `-s, --sound <sound>` - Sound to play (optional):
  - `beep` or `system` - System beep sound
  - `beep:frequency` - Beep with specific frequency
  - `/path/to/audio.mp3` - Custom audio file
  - Default: Uses embedded sound (`@sound.mp3`)
- `--verbose` - Show debug output

### 2. MCP Server Mode

Use as an MCP server for AI assistants like Claude Desktop.

#### Configuration for Claude Desktop

1. Open Claude Desktop settings
2. Navigate to Developer > Edit Config
3. Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "desktop-notification": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js", "--server"],
      "env": {}
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "desktop-notification": {
      "command": "mcp-desktop-notification",
      "args": ["--server"],
      "env": {}
    }
  }
}
```

#### Available MCP Tool

Once configured, Claude will have access to the `send_notification` tool:

```typescript
send_notification({
  title: "Task Complete",
  message: "The requested operation has finished successfully"
})
```

The tool will:
- Display a desktop notification with the specified title and message
- Play the default sound alert (@sound.mp3 or system beep)
- Return success/failure status to the AI assistant

#### Example Usage in Claude

You can ask Claude to:
- "Send me a desktop notification when the analysis is complete"
- "Alert me with a notification saying 'Build finished'"
- "Notify me when you're done processing the data"

### 3. Claude Code Hook Mode

Integrate with Claude Code to receive notifications for various events during your coding session.

#### Setup Claude Code Hooks

1. In Claude Code, configure hooks in your settings
2. Add the notification command as a hook:

```bash
# For specific events
mcp-desktop-notification --claude-hook

# Or using the full path
node /path/to/dist/index.js --claude-hook

# With verbose output for debugging
node /path/to/dist/index.js --claude-hook --verbose
```

#### Supported Hook Events

The notification server handles these Claude Code events:

| Event | Notification Title | Description |
|-------|-------------------|-------------|
| `PreToolUse` | Claude Code: [Tool Name] | Before a tool executes |
| `PostToolUse` | ✓ [Tool Name] Completed | After a tool finishes |
| `UserPromptSubmit` | Claude Code | When you submit a prompt |
| `Notification` | Claude Code Notification | Custom notifications |
| `Stop` | Claude Code | Response completed |
| `SubagentStop` | Claude Code Subagent | Subagent task completed |
| `SessionStart` | Claude Code Session | New session started |
| `SessionEnd` | Claude Code Session | Session ended |
| `PreCompact` | Claude Code | Context compaction starting |

#### Example Hook Configuration

In your Claude Code settings or configuration file:

```json
{
  "hooks": {
    "PostToolUse": "mcp-desktop-notification --claude-hook",
    "UserPromptSubmit": "mcp-desktop-notification --claude-hook",
    "Stop": "mcp-desktop-notification --claude-hook"
  }
}
```

#### Testing Hooks

You can test the hook processor manually:

```bash
# Test PostToolUse event
echo '{"hook_event_name":"PostToolUse","tool_name":"Bash"}' | node dist/index.js --claude-hook

# Test with verbose output
echo '{"hook_event_name":"UserPromptSubmit","prompt":"Test prompt"}' | node dist/index.js --claude-hook --verbose

# Test notification event
echo '{"hook_event_name":"Notification","message":"Custom message"}' | node dist/index.js --claude-hook
```

## Sound Configuration

### Default Sound

By default, all notifications use `@sound.mp3` which:
1. First attempts to play the embedded `assets/sound.mp3` file
2. Falls back to system beep if the file doesn't exist or fails

### Custom Sounds

You can specify custom sounds:

```bash
# System beep
--sound beep

# Custom audio file
--sound /path/to/notification.mp3

# Platform-specific system sounds
--sound system
```

### Adding Your Own Sound

Replace `assets/sound.mp3` with your preferred notification sound:

```bash
# Copy your sound file
cp ~/my-notification-sound.mp3 assets/sound.mp3

# Rebuild the project
npm run build
```

## Development

### Project Structure

```
mcp-desktop-notification-ts/
├── src/
│   ├── index.ts           # Main entry point
│   ├── types.ts           # TypeScript interfaces
│   ├── notification.ts    # Notification handling
│   ├── sound.ts          # Sound playback logic
│   ├── claude-hook.ts    # Claude hook processor
│   └── mcp-server.ts     # MCP server implementation
├── assets/
│   └── sound.mp3         # Default notification sound
├── dist/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

### Available Scripts

```bash
# Build TypeScript to JavaScript
npm run build

# Run in development mode (using tsx)
npm run dev -- --title "Dev" --message "Test"

# Run MCP server in development
npm run server

# Run Claude hook processor in development
npm run claude-hook

# Start compiled version
npm start -- --title "Test" --message "Hello"
```

### Testing

Test all three modes:

```bash
# 1. Test CLI mode
node dist/index.js --title "CLI Test" --message "Testing CLI mode"

# 2. Test MCP server (starts server, use Ctrl+C to stop)
node dist/index.js --server

# 3. Test Claude hook
echo '{"hook_event_name":"PostToolUse","tool_name":"TestTool"}' | node dist/index.js --claude-hook
```

## Platform Support

### macOS
- Uses `afplay` for audio playback
- System sound: `/System/Library/Sounds/Glass.aiff`
- Full notification support via `node-notifier`

### Linux
- Attempts multiple audio players: `paplay`, `aplay`, `mpg123`, `ffplay`
- System sound: ALSA default or terminal bell
- Requires notification daemon (most desktop environments have one)

### Windows
- Uses PowerShell for audio playback
- System beep via `[console]::beep()`
- Windows notification support via `node-notifier`

## Troubleshooting

### Notifications not appearing

1. **macOS**: Check System Preferences > Notifications > Terminal/Node
2. **Linux**: Ensure a notification daemon is running (`notify-osd`, `dunst`, etc.)
3. **Windows**: Check notification settings in Windows Settings

### Sound not playing

1. Check if the audio file exists: `ls assets/sound.mp3`
2. Test system beep: `--sound beep`
3. Verify audio player is installed (platform-specific)
4. Check system volume settings

### MCP server not connecting

1. Verify the path in Claude Desktop config is absolute
2. Check the server starts correctly: `npm run server`
3. Restart Claude Desktop after config changes
4. Check Claude Desktop developer console for errors

### Claude hooks not working

1. Test manually with echo command (see Testing Hooks section)
2. Use `--verbose` flag to see debug output
3. Ensure hook command has execution permissions
4. Check Claude Code hook configuration

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

ISC

## Acknowledgments

Built with:
- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) - MCP implementation
- [node-notifier](https://www.npmjs.com/package/node-notifier) - Cross-platform notifications
- [commander](https://www.npmjs.com/package/commander) - CLI argument parsing
- TypeScript for type safety

---

**Note**: This tool requires appropriate permissions for desktop notifications and audio playback on your system. Make sure to grant necessary permissions when prompted.
