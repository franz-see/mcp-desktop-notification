import { ClaudeHookInput } from './types';
import { sendNotification } from './notification';
import path from 'path';

export interface NotificationContent {
  title: string;
  message: string;
  sound: string | null;
}

export function getNotificationContent(hookInput: ClaudeHookInput, noSound: boolean = false): NotificationContent {
  let title: string;
  let message: string;
  const sound = noSound ? null : '@sound.mp3';

  // Format CWD for display
  const formatCwd = (cwd: string): string => {
    if (cwd.length > 50) {
      return `...${cwd.slice(-50)}`;
    }
    return cwd;
  };

  switch (hookInput.hook_event_name) {
    case 'PreToolUse':
      title = `[PreToolUse] Claude Code: ${hookInput.tool_name}`;
      message = `Preparing to run ${hookInput.tool_name}`;

      if (hookInput.tool_input?.command) {
        message = `${message}: ${hookInput.tool_input.command}`;
      }
      break;

    case 'PostToolUse':
      title = `[PostToolUse] ✓ ${hookInput.tool_name} Completed`;
      message = `${hookInput.tool_name} tool finished executing`;

      if (hookInput.tool_input?.command) {
        message = `${message}: ${hookInput.tool_input.command}`;
      }
      break;

    case 'UserPromptSubmit':
      title = '[UserPromptSubmit] Claude Code';
      message = 'Processing your request...';

      if (hookInput.prompt) {
        if (hookInput.prompt.length > 50) {
          message = `Processing: ${hookInput.prompt.substring(0, 50)}...`;
        } else {
          message = `Processing: ${hookInput.prompt}`;
        }
      }
      break;

    case 'Notification':
      title = '[Notification] Claude Code Notification';
      message = hookInput.message || 'Notification received';

      if (hookInput.tool_input?.command) {
        message = `${message}: ${hookInput.tool_input.command}`;
      }
      break;

    case 'Stop':
      title = '[Stop] Claude Code';
      message = hookInput.stop_hook_active
        ? 'Response completed (hook active)'
        : 'Response completed';
      break;

    case 'SubagentStop':
      title = '[SubAgentStop] Claude Code Subagent';
      message = hookInput.stop_hook_active
        ? 'Subagent task completed (hook active)'
        : 'Subagent task completed';
      break;

    case 'SessionStart':
      title = '[SessionStart] Claude Code Session';
      message = hookInput.source
        ? `Session started (${hookInput.source})`
        : 'Session started';
      break;

    case 'SessionEnd':
      title = '[SessionEnd] Claude Code Session';
      message = hookInput.reason
        ? `Session ended: ${hookInput.reason}`
        : 'Session ended';
      break;

    case 'PreCompact':
      title = 'Claude Code';
      message = hookInput.trigger
        ? `Starting compact (${hookInput.trigger})`
        : 'Starting context compaction';

      if (hookInput.custom_instructions) {
        const instructions = hookInput.custom_instructions.length > 30
          ? `${hookInput.custom_instructions.substring(0, 30)}...`
          : hookInput.custom_instructions;
        message = `${message}: ${instructions}`;
      }
      break;

    default:
      title = `${hookInput.hook_event_name} Claude Code Hook`;
      message = hookInput.hook_event_name
        ? `Event: ${hookInput.hook_event_name}`
        : 'Hook event triggered';

      if (hookInput.tool_name) {
        message = `${message} (Tool: ${hookInput.tool_name})`;
      }
  }

  // Append CWD to all messages
  if (hookInput.cwd) {
    const formattedCwd = formatCwd(hookInput.cwd);
    message = `${message}\n\ncwd: ${formattedCwd}`;
  }

  return { title, message, sound };
}

export async function processClaudeHook(verbose: boolean = false, noSound: boolean = false): Promise<void> {
  const input = await readStdin();

  if (verbose) {
    console.debug(`[mcp-desktop-notification] Received hook input: ${input}`);
  }

  let hookInput: ClaudeHookInput;
  try {
    hookInput = JSON.parse(input);
  } catch (error) {
    console.error(`[mcp-desktop-notification] Error: ${error}. input = ${input}`)
    throw error
  }

  if (verbose) {
    console.debug(`[mcp-desktop-notification] Parsed hook event: ${hookInput.hook_event_name}, Tool: ${hookInput.tool_name}`);
  }

  const { title, message, sound } = getNotificationContent(hookInput, noSound);

  if (verbose) {
    console.debug(`[mcp-desktop-notification] Sending notification: Title='${title}', Message='${message}', Sound='${sound === null ? 'DISABLED' : sound}'`);
  }

  await sendNotification(title, message, '', sound);

  if (verbose) {
    console.debug('[mcp-desktop-notification] Notification sent successfully');
  }
}

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => resolve(data));
  });
}
