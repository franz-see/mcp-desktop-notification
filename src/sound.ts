import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

const EMBEDDED_SOUND_PATH = join(__dirname, '../assets/sound.mp3');

export async function playSound(sound: string): Promise<void> {
  if (!sound) return;

  if (sound === '@sound.mp3' || sound === 'sound.mp3') {
    const embeddedPath = EMBEDDED_SOUND_PATH;
    
    if (!existsSync(embeddedPath)) {
      return playSystemBeep();
    }
    
    try {
      await playAudioFile(embeddedPath);
    } catch {
      return playSystemBeep();
    }
    return;
  }

  if (sound.startsWith('beep:')) {
    const freq = parseFloat(sound.substring(5));
    if (isNaN(freq)) throw new Error(`Invalid beep frequency: ${sound}`);
    return playSystemBeep();
  }

  if (sound === 'beep' || sound === 'system') {
    return playSystemBeep();
  }

  await playAudioFile(sound);
}

async function playAudioFile(filePath: string): Promise<void> {
  const platform = process.platform;
  
  switch (platform) {
    case 'darwin':
      await execAsync(`afplay "${filePath}"`);
      break;
    case 'linux':
      const players = ['paplay', 'aplay', 'mpg123', 'ffplay'];
      let played = false;
      
      for (const player of players) {
        try {
          await execAsync(`which ${player}`);
          await execAsync(`${player} "${filePath}"`);
          played = true;
          break;
        } catch {
          continue;
        }
      }
      
      if (!played) {
        throw new Error('No audio player found on Linux');
      }
      break;
    case 'win32':
      await execAsync(`powershell -Command "(New-Object Media.SoundPlayer '${filePath}').PlaySync()"`);
      break;
    default:
      throw new Error(`Sound playback not supported on ${platform}`);
  }
}

async function playSystemBeep(): Promise<void> {
  const platform = process.platform;
  
  switch (platform) {
    case 'darwin':
      await execAsync('afplay /System/Library/Sounds/Glass.aiff');
      break;
    case 'linux':
      await execAsync('paplay /usr/share/sounds/alsa/Front_Left.wav || echo -e "\\\\a"');
      break;
    case 'win32':
      await execAsync('powershell -Command "[console]::beep(800,300)"');
      break;
  }
}