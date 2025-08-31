const notifier = require('node-notifier');
import { playSound } from './sound';

export async function sendNotification(
  title: string,
  message: string,
  icon?: string,
  sound?: string
): Promise<void> {
  const soundToPlay = sound || '@sound.mp3';

  if (sound && sound !== '@sound.mp3') {
    console.log(`[mcp-desktop-notification] Using custom sound: ${sound}`);
  }

  const soundPromise = playSound(soundToPlay).catch((err) => {
    console.warn(`[mcp-desktop-notification] Warning: Failed to play sound: ${err}`);
  });

  const notificationPromise = new Promise<void>((resolve, reject) => {
    notifier.notify({
      title,
      message,
      icon,
      sound: false,
    }, (err: Error | null) => {
      if (err) reject(err);
      else resolve();
    });
  });

  await Promise.all([soundPromise, notificationPromise]);
}
