package main

import (
	"context"
	_ "embed"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"

	"github.com/gen2brain/beeep"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

//go:embed sound.mp3
var embeddedSound []byte

type NotificationRequest struct {
	Title   string `json:"title"`
	Message string `json:"message"`
	Icon    string `json:"icon,omitempty"`
	Sound   string `json:"sound,omitempty"`
}

// playSound plays a sound file or system beep without using oto/go-mp3
func playSound(sound string) error {
	if sound == "" {
		return nil
	}

	// Handle embedded sound
	if sound == "@sound.mp3" || sound == "sound.mp3" {
		// Create temporary file from embedded data
		tmpDir := os.TempDir()
		tmpFile := filepath.Join(tmpDir, "notification_sound.mp3")

		if err := os.WriteFile(tmpFile, embeddedSound, 0644); err != nil {
			return fmt.Errorf("failed to write temp sound file: %v", err)
		}

		// Clean up temp file after playing
		defer os.Remove(tmpFile)

		sound = tmpFile
	}

	// Check if it's a frequency beep (e.g., "beep:440" for 440Hz)
	if strings.HasPrefix(sound, "beep:") {
		freqStr := strings.TrimPrefix(sound, "beep:")
		freq, err := strconv.ParseFloat(freqStr, 64)
		if err != nil {
			return fmt.Errorf("invalid beep frequency: %v", err)
		}
		return beeep.Beep(freq, 500) // 500ms duration
	}

	// Check if it's a system beep
	if sound == "beep" || sound == "system" {
		return beeep.Beep(800.0, 300) // High pitch notification sound (800Hz, 300ms)
	}

	// For MP3 and other files, use system commands instead of oto
	switch runtime.GOOS {
	case "darwin": // macOS
		return exec.Command("afplay", sound).Run()
	case "linux":
		// Try multiple players
		for _, player := range []string{"paplay", "aplay", "mpg123", "ffplay"} {
			if _, err := exec.LookPath(player); err == nil {
				return exec.Command(player, sound).Run()
			}
		}
		return fmt.Errorf("no audio player found on Linux")
	case "windows":
		// Use PowerShell to play sound
		cmd := fmt.Sprintf(`(New-Object Media.SoundPlayer "%s").PlaySync()`, sound)
		return exec.Command("powershell", "-Command", cmd).Run()
	default:
		return fmt.Errorf("sound playback not supported on %s", runtime.GOOS)
	}
}

func main() {
	// Create MCP server
	s := server.NewMCPServer(
		"desktop-notification",
		"1.0.0",
		server.WithLogging(),
	)

	// Register notification tool (alias for notification with different styling)
	s.AddTool(mcp.Tool{
		Name:        "send_notification",
		Description: "Send a desktop alert notification (typically more urgent)",
		InputSchema: mcp.ToolInputSchema{
			Type: "object",
			Properties: map[string]interface{}{
				"title": map[string]interface{}{
					"type":        "string",
					"description": "The title of the alert",
				},
				"message": map[string]interface{}{
					"type":        "string",
					"description": "The alert message content",
				},
			},
			Required: []string{"title", "message"},
		},
	}, handleAlert)

	// Start the server on stdio
	if err := server.ServeStdio(s); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}

func handleAlert(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	var req NotificationRequest
	argBytes, err := json.Marshal(request.Params.Arguments)
	if err != nil {
		return &mcp.CallToolResult{
			IsError: true,
			Content: []mcp.Content{
				mcp.NewTextContent(fmt.Sprintf("Failed to parse arguments: %v", err)),
			},
		}, nil
	}

	if err := json.Unmarshal(argBytes, &req); err != nil {
		return &mcp.CallToolResult{
			IsError: true,
			Content: []mcp.Content{
				mcp.NewTextContent(fmt.Sprintf("Failed to parse alert request: %v", err)),
			},
		}, nil
	}

	// Send notification - using beeep.Notify without sound
	notifyErr := beeep.Notify(req.Title, req.Message, "")

	if notifyErr != nil {
		return &mcp.CallToolResult{
			IsError: true,
			Content: []mcp.Content{
				mcp.NewTextContent(fmt.Sprintf("Failed to send notification: %v", notifyErr)),
			},
		}, nil
	}

	// Play embedded sound with alerts
	if soundErr := playSound("@sound.mp3"); soundErr != nil {
		log.Printf("Warning: Failed to play sound: %v", soundErr)
	}

	return &mcp.CallToolResult{
		Content: []mcp.Content{
			mcp.NewTextContent(fmt.Sprintf("Successfully sent alert: '%s'", req.Title)),
		},
	}, nil
}
