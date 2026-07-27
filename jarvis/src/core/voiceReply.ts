import { synthesizeSpeechToMp3 } from "./ttsEdge";
import { encodeAudioToOggOpus } from "./oggEncode";
import { sanitizeForSpeech } from "./sanitizeForSpeech";

/** Текст → OGG/OPUS-буфер голосового ответа (Edge Neural TTS + кодирование под Telegram sendVoice). */
export async function synthesizeSpeechToOgg(text: string): Promise<Buffer> {
  const mp3 = await synthesizeSpeechToMp3(sanitizeForSpeech(text));
  return encodeAudioToOggOpus(mp3, "mp3");
}
