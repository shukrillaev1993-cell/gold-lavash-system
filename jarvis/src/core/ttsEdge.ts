import { EdgeTTS } from "edge-tts-universal";
import { getSettings } from "./store";

const VOICE_MAPPING: Record<string, string> = {
  ru: "ru-RU-SvetlanaNeural",
  uz: "uz-UZ-MadinaNeural",
  en: "en-US-AvaNeural",
};

/**
 * Синтезирует речь через Microsoft Edge Read Aloud (Neural TTS) без ключей и абсолютно бесплатно.
 * Возвращает MP3-буфер.
 */
export async function synthesizeSpeechToMp3(text: string, lang?: string): Promise<Buffer> {
  const currentLang = lang || getSettings().voiceLanguage || "ru";
  const voice = VOICE_MAPPING[currentLang] || VOICE_MAPPING.ru;
  
  console.log(`[EdgeTTS] Синтез текста на языке "${currentLang}" с использованием голоса "${voice}"...`);
  
  const tts = new EdgeTTS(text, voice);
  const result = await tts.synthesize();
  const arrayBuffer = await result.audio.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
