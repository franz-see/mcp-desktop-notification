import { ClaudeHookInput } from './types';
import { sendNotification } from './notification';
import path from 'path';

export interface NotificationContent {
  title: string;
  message: string;
  sound: string;
}

export function getNotificationContent(hookInput: ClaudeHookInput): NotificationContent {
  let title: string;
  let message: string;
  const sound = '@sound.mp3';

  switch (hookInput.hook_event_name) {
    case 'PreToolUse':
      title = `Claude Code: ${hookInput.tool_name}`;
      message = `Preparing to run ${hookInput.tool_name}`;

      if (hookInput.tool_input?.command) {
        message = `${message}: ${hookInput.tool_input.command}`;
      }
      break;

    case 'PostToolUse':
      title = `✓ ${hookInput.tool_name} Completed`;
      message = `${hookInput.tool_name} tool finished executing`;
      break;

    case 'UserPromptSubmit':
      title = 'Claude Code';
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
      title = 'Claude Code Notification';
      message = hookInput.message || 'Notification received';
      break;

    case 'Stop':
      title = 'Claude Code';
      message = hookInput.stop_hook_active
        ? 'Response completed (hook active)'
        : 'Response completed';
      break;

    case 'SubagentStop':
      title = 'Claude Code Subagent';
      message = hookInput.stop_hook_active
        ? 'Subagent task completed (hook active)'
        : 'Subagent task completed';
      break;

    case 'SessionStart':
      title = 'Claude Code Session';
      message = hookInput.source
        ? `Session started (${hookInput.source})`
        : 'Session started';
      break;

    case 'SessionEnd':
      title = 'Claude Code Session';
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
      title = 'Claude Code Hook';
      message = hookInput.hook_event_name
        ? `Event: ${hookInput.hook_event_name}`
        : 'Hook event triggered';

      if (hookInput.tool_name) {
        message = `${message} (Tool: ${hookInput.tool_name})`;
      }
  }

  return { title, message, sound };
}

export async function processClaudeHook(verbose: boolean = false): Promise<void> {
  const input = await readStdin();

  if (verbose) {
    console.debug(`[mcp-desktop-notification] Received hook input: ${input}`);
  }

  const hookInput: ClaudeHookInput = JSON.parse(input);

  if (verbose) {
    console.debug(`[mcp-desktop-notification] Parsed hook event: ${hookInput.hook_event_name}, Tool: ${hookInput.tool_name}`);
  }

  const { title, message, sound } = getNotificationContent(hookInput);

  if (verbose) {
    console.debug(`[mcp-desktop-notification] Sending notification: Title='${title}', Message='${message}', Sound='${sound}'`);
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
