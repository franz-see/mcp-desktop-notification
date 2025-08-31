#!/usr/bin/env node

import { Command } from 'commander';
import { sendNotification } from './notification';
import { processClaudeHook } from './claude-hook';
import { runMCPServer } from './mcp-server';

const program = new Command();

program
  .name('mcp-desktop-notification')
  .description('Desktop Notification Tool')
  .version('1.0.0');

program
  .option('-t, --title <title>', 'Title of the notification')
  .option('-m, --message <message>', 'Message content of the notification')
  .option('-i, --icon <icon>', 'Path to icon file (optional)')
  .option('-s, --sound <sound>', 'Sound to play: "beep", "system", "beep:frequency", or path to audio file')
  .option('--server', 'Run as MCP server on stdio')
  .option('--claude-hook', 'Run as Claude Code hook processor (reads JSON from stdin)')
  .option('--verbose', 'Show verbose output for debugging');

program.parse();

const options = program.opts();

async function main() {
  try {
    if (options.claudeHook) {
      await processClaudeHook(options.verbose);
      return;
    }

    if (options.server) {
      await runMCPServer();
      return;
    }

    if (!options.title || !options.message) {
      console.error('[mcp-desktop-notification] Error: Both --title and --message are required for CLI mode');
      console.error('[mcp-desktop-notification] Use --help for usage information');
      process.exit(1);
    }

    const sound = options.sound || '@sound.mp3';
    await sendNotification(options.title, options.message, options.icon, sound);
    console.log(`[mcp-desktop-notification] Notification sent successfully: '${options.title}'`);
    
  } catch (error) {
    console.error(`[mcp-desktop-notification] Error: ${error}`);
    process.exit(1);
  }
}

main();