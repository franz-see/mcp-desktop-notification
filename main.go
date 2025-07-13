package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
	"runtime"
	"strconv"
	"strings"

	"github.com/gen2brain/beeep"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

type NotificationRequest struct {
	Title   string `json:"title"`
	Message string `json:"message"`
	Icon    string `json:"icon,omitempty"`
	Sound   string `json:"sound,omitempty"`
}

// playSound plays a sound file or system beep
func playSound(sound string) error {
	if sound == "" {
		return nil
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
		return beeep.Beep(beeep.DefaultFreq, 200)
	}

	// Try to play as a sound file using system commands
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

	// Register notification tool
	s.AddTool(mcp.Tool{
		Name:        "send_notification",
		Description: "Send a desktop notification",
		InputSchema: mcp.ToolInputSchema{
			Type: "object",
			Properties: map[string]interface{}{
				"title": map[string]interface{}{
					"type":        "string",
					"description": "The title of the notification",
				},
				"message": map[string]interface{}{
					"type":        "string",
					"description": "The message content of the notification",
				},
				"icon": map[string]interface{}{
					"type":        "string",
					"description": "Path to an icon file (optional)",
				},
				"sound": map[string]interface{}{
					"type":        "string",
					"description": "Path to a sound file to play with the notification (optional)",
				},
			},
			Required: []string{"title", "message"},
		},
	}, handleNotification)

	// Register alert tool (alias for notification with different styling)
	s.AddTool(mcp.Tool{
		Name:        "send_alert",
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
				"icon": map[string]interface{}{
					"type":        "string",
					"description": "Path to an icon file (optional)",
				},
				"sound": map[string]interface{}{
					"type":        "string",
					"description": "Path to a sound file to play with the alert (optional)",
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

func handleNotification(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
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
				mcp.NewTextContent(fmt.Sprintf("Failed to parse notification request: %v", err)),
			},
		}, nil
	}

	// Send notification
	var notifyErr error
	if req.Icon != "" {
		notifyErr = beeep.Notify(req.Title, req.Message, req.Icon)
	} else {
		notifyErr = beeep.Notify(req.Title, req.Message, "")
	}

	if notifyErr != nil {
		return &mcp.CallToolResult{
			IsError: true,
			Content: []mcp.Content{
				mcp.NewTextContent(fmt.Sprintf("Failed to send notification: %v", notifyErr)),
			},
		}, nil
	}

	// Play sound if specified
	if req.Sound != "" {
		if soundErr := playSound(req.Sound); soundErr != nil {
			log.Printf("Warning: Failed to play sound '%s': %v", req.Sound, soundErr)
		}
	}

	return &mcp.CallToolResult{
		Content: []mcp.Content{
			mcp.NewTextContent(fmt.Sprintf("Successfully sent notification: '%s'", req.Title)),
		},
	}, nil
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

	// Send alert - using beeep.Alert for more prominent notification
	var alertErr error
	if req.Icon != "" {
		alertErr = beeep.Alert(req.Title, req.Message, req.Icon)
	} else {
		alertErr = beeep.Alert(req.Title, req.Message, "")
	}

	if alertErr != nil {
		return &mcp.CallToolResult{
			IsError: true,
			Content: []mcp.Content{
				mcp.NewTextContent(fmt.Sprintf("Failed to send alert: %v", alertErr)),
			},
		}, nil
	}

	// Play sound if specified (for alerts, default to system beep if no sound specified)
	soundToPlay := req.Sound
	if soundToPlay == "" {
		soundToPlay = "beep" // Default sound for alerts
	}
	if soundErr := playSound(soundToPlay); soundErr != nil {
		log.Printf("Warning: Failed to play sound '%s': %v", soundToPlay, soundErr)
	}

	return &mcp.CallToolResult{
		Content: []mcp.Content{
			mcp.NewTextContent(fmt.Sprintf("Successfully sent alert: '%s'", req.Title)),
		},
	}, nil
}