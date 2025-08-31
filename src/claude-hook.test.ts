import { getNotificationContent } from './claude-hook';
import { ClaudeHookInput } from './types';

describe('getNotificationContent', () => {
  it('should handle PreToolUse event', () => {
    const input: ClaudeHookInput = {
      session_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      transcript_path: '/path/to/transcript',
      cwd: '/current/dir',
      hook_event_name: 'PreToolUse',
      tool_name: 'Bash',
    };

    const result = getNotificationContent(input);

    expect(result.title).toBe('[PreToolUse] Claude Code: Bash');
    expect(result.message).toBe('Preparing to run Bash\n\ncwd: /current/dir');
    expect(result.sound).toBe('@sound.mp3');
  });

  it('should handle PostToolUse event', () => {
    const input: ClaudeHookInput = {
      session_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      transcript_path: '/path/to/transcript',
      cwd: '/current/dir',
      hook_event_name: 'PostToolUse',
      tool_name: 'Edit',
    };

    const result = getNotificationContent(input);

    expect(result.title).toBe('[PostToolUse] ✓ Edit Completed');
    expect(result.message).toBe('Edit tool finished executing\n\ncwd: /current/dir');
    expect(result.sound).toBe('@sound.mp3');
  });

  it('should handle PostToolUse event with tool_input and tool_response', () => {
    const input: ClaudeHookInput = {
      session_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      transcript_path: '/Users/mcp-desktop-notification/main/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl',
      cwd: '/Users/mcp-desktop-notification/main',
      hook_event_name: 'PostToolUse',
      tool_name: 'Write',
      tool_input: {
        file_path: '/path/to/file.txt',
        content: 'file content'
      },
      tool_response: {
        filePath: '/path/to/file.txt',
        success: true
      }
    };

    const result = getNotificationContent(input);

    expect(result.title).toBe('[PostToolUse] ✓ Write Completed');
    expect(result.message).toBe('Write tool finished executing\n\ncwd: /Users/mcp-desktop-notification/main');
    expect(result.sound).toBe('@sound.mp3');
  });

  it('should handle UserPromptSubmit with short prompt', () => {
    const input: ClaudeHookInput = {
      session_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      transcript_path: '/Users/mcp-desktop-notification/main/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl',
      cwd: '/Users/mcp-desktop-notification/main',
      hook_event_name: 'UserPromptSubmit',
      prompt: 'Write a function to calculate the factorial of a number',
    };

    const result = getNotificationContent(input);

    expect(result.title).toBe('[UserPromptSubmit] Claude Code');
    expect(result.message).toBe('Processing: Write a function to calculate the factorial of a n...\n\ncwd: /Users/mcp-desktop-notification/main');
    expect(result.sound).toBe('@sound.mp3');
  });

  it('should handle UserPromptSubmit with long prompt', () => {
    const input: ClaudeHookInput = {
      session_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      transcript_path: '/path/to/transcript',
      cwd: '/current/dir',
      hook_event_name: 'UserPromptSubmit',
      prompt: 'This is a very long prompt that exceeds fifty characters and should be truncated',
    };

    const result = getNotificationContent(input);

    expect(result.title).toBe('[UserPromptSubmit] Claude Code');
    expect(result.message).toBe('Processing: This is a very long prompt that exceeds fifty char...\n\ncwd: /current/dir');
    expect(result.sound).toBe('@sound.mp3');
  });

  it('should handle UserPromptSubmit without prompt', () => {
    const input: ClaudeHookInput = {
      session_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      transcript_path: '/path/to/transcript',
      cwd: '/current/dir',
      hook_event_name: 'UserPromptSubmit',
    };

    const result = getNotificationContent(input);

    expect(result.title).toBe('[UserPromptSubmit] Claude Code');
    expect(result.message).toBe('Processing your request...\n\ncwd: /current/dir');
    expect(result.sound).toBe('@sound.mp3');
  });

  it('should handle Notification event with message', () => {
    const input: ClaudeHookInput = {
      session_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      transcript_path: '/Users/mcp-desktop-notification/main/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl',
      cwd: '/Users/mcp-desktop-notification/main',
      hook_event_name: 'Notification',
      message: 'Task completed successfully',
    };

    const result = getNotificationContent(input);

    expect(result.title).toBe('[Notification] Claude Code Notification');
    expect(result.message).toBe('Task completed successfully\n\ncwd: /Users/mcp-desktop-notification/main');
    expect(result.sound).toBe('@sound.mp3');
  });

  it('should handle Notification event without message', () => {
    const input: ClaudeHookInput = {
      session_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      transcript_path: '/path/to/transcript',
      cwd: '/current/dir',
      hook_event_name: 'Notification',
    };

    const result = getNotificationContent(input);

    expect(result.title).toBe('[Notification] Claude Code Notification');
    expect(result.message).toBe('Notification received\n\ncwd: /current/dir');
    expect(result.sound).toBe('@sound.mp3');
  });

  it('should handle Stop event with hook active', () => {
    const input: ClaudeHookInput = {
      session_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      transcript_path: '~/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl',
      cwd: '/Users/mcp-desktop-notification/main',
      hook_event_name: 'Stop',
      stop_hook_active: true,
    };

    const result = getNotificationContent(input);

    expect(result.title).toBe('[Stop] Claude Code');
    expect(result.message).toBe('Response completed (hook active)\n\ncwd: /Users/mcp-desktop-notification/main');
    expect(result.sound).toBe('@sound.mp3');
  });

  it('should handle Stop event without hook active', () => {
    const input: ClaudeHookInput = {
      session_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      transcript_path: '/path/to/transcript',
      cwd: '/current/dir',
      hook_event_name: 'Stop',
      stop_hook_active: false,
    };

    const result = getNotificationContent(input);

    expect(result.title).toBe('[Stop] Claude Code');
    expect(result.message).toBe('Response completed\n\ncwd: /current/dir');
    expect(result.sound).toBe('@sound.mp3');
  });

  it('should handle SessionStart with source', () => {
    const input: ClaudeHookInput = {
      session_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      transcript_path: '~/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl',
      cwd: '/Users/mcp-desktop-notification/main',
      hook_event_name: 'SessionStart',
      source: 'startup',
    };

    const result = getNotificationContent(input);

    expect(result.title).toBe('[SessionStart] Claude Code Session');
    expect(result.message).toBe('Session started (startup)\n\ncwd: /Users/mcp-desktop-notification/main');
    expect(result.sound).toBe('@sound.mp3');
  });

  it('should handle SessionEnd with reason', () => {
    const input: ClaudeHookInput = {
      session_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      transcript_path: '~/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl',
      cwd: '/Users/mcp-desktop-notification/main',
      hook_event_name: 'SessionEnd',
      reason: 'exit',
    };

    const result = getNotificationContent(input);

    expect(result.title).toBe('[SessionEnd] Claude Code Session');
    expect(result.message).toBe('Session ended: exit\n\ncwd: /Users/mcp-desktop-notification/main');
    expect(result.sound).toBe('@sound.mp3');
  });

  it('should handle PreCompact with trigger and custom instructions', () => {
    const input: ClaudeHookInput = {
      session_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      transcript_path: '~/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl',
      cwd: '/Users/mcp-desktop-notification/main',
      hook_event_name: 'PreCompact',
      trigger: 'manual',
      custom_instructions: '',
    };

    const result = getNotificationContent(input);

    expect(result.title).toBe('Claude Code');
    expect(result.message).toBe('Starting compact (manual)\n\ncwd: /Users/mcp-desktop-notification/main');
    expect(result.sound).toBe('@sound.mp3');
  });

  it('should handle PreCompact with long custom instructions', () => {
    const input: ClaudeHookInput = {
      session_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      transcript_path: '/path/to/transcript',
      cwd: '/current/dir',
      hook_event_name: 'PreCompact',
      custom_instructions: 'This is a very long custom instruction that should be truncated',
    };

    const result = getNotificationContent(input);

    expect(result.title).toBe('Claude Code');
    expect(result.message).toBe('Starting context compaction: This is a very long custom ins...\n\ncwd: /current/dir');
    expect(result.sound).toBe('@sound.mp3');
  });

  it('should handle unknown event with tool name', () => {
    const input: ClaudeHookInput = {
      session_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      transcript_path: '/path/to/transcript',
      cwd: '/current/dir',
      hook_event_name: 'UnknownEvent',
      tool_name: 'CustomTool',
    };

    const result = getNotificationContent(input);

    expect(result.title).toBe('UnknownEvent Claude Code Hook');
    expect(result.message).toBe('Event: UnknownEvent (Tool: CustomTool)\n\ncwd: /current/dir');
    expect(result.sound).toBe('@sound.mp3');
  });

  it('should handle completely unknown event', () => {
    const input: ClaudeHookInput = {
      session_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      transcript_path: '/path/to/transcript',
      cwd: '/current/dir',
      hook_event_name: '',
    };

    const result = getNotificationContent(input);

    expect(result.title).toBe(' Claude Code Hook');
    expect(result.message).toBe('Hook event triggered\n\ncwd: /current/dir');
    expect(result.sound).toBe('@sound.mp3');
  });
});
