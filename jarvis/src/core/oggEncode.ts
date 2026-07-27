import { execFile } from "child_process";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import ffmpegPath from "ffmpeg-static";

/**
 * Кодирует аудио-буфер (например, WAV или MP3) в OGG/OPUS — формат, который Telegram
 * принимает для настоящих голосовых сообщений (sendVoice).
 * Использует статически собранный бинарник ffmpeg (без установки на машине пользователя).
 */
export async function encodeAudioToOggOpus(audioBuffer: Buffer, ext: string = "wav"): Promise<Buffer> {
  if (!ffmpegPath) throw new Error("ffmpeg-static: бинарник ffmpeg не найден");

  const id = `jarvis-ogg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const tmpDir = os.tmpdir();
  const audioFile = path.join(tmpDir, `${id}.${ext}`);
  const oggFile = path.join(tmpDir, `${id}.ogg`);

  await fs.writeFile(audioFile, audioBuffer);
  try {
    await new Promise<void>((resolve, reject) => {
      execFile(
        ffmpegPath as string,
        [
          "-y",
          "-i", audioFile,
          "-c:a", "libopus",
          "-b:a", "32k",
          "-ar", "48000",
          "-ac", "1",
          "-f", "ogg",
          oggFile,
        ],
        { timeout: 30_000 },
        (error) => (error ? reject(error) : resolve())
      );
    });
    return await fs.readFile(oggFile);
  } finally {
    await Promise.all([fs.unlink(audioFile).catch(() => {}), fs.unlink(oggFile).catch(() => {})]);
  }
}

export function encodeWavToOggOpus(wavBuffer: Buffer): Promise<Buffer> {
  return encodeAudioToOggOpus(wavBuffer, "wav");
}
