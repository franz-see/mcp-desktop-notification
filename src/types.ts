export interface NotificationRequest {
  title: string;
  message: string;
  icon?: string;
  sound?: string;
}

export interface ClaudeHookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  hook_event_name: string;
  tool_name?: string;
  tool_input?: any;
  tool_response?: any;
  message?: string;
  prompt?: string;
  trigger?: string;
  source?: string;
  reason?: string;
  stop_hook_active?: boolean;
  custom_instructions?: string;
}