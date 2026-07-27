import * as path from "path";
import { getUserDataDir } from "./paths";
import { getSettings } from "./store";

const MODEL = "Xenova/whisper-tiny";

const WHISPER_LANG_MAPPING: Record<string, string> = {
  ru: "russian",
  uz: "uzbek",
  en: "english",
};

// @huggingface/transformers — ESM-only пакет; проект на CommonJS, поэтому
// подключаем его через динамический import(), который Node поддерживает и из CJS.
let transcriberPromise: ReturnType<typeof loadTranscriber> | null = null;

async function loadTranscriber() {
  const { pipeline, env } = await import("@huggingface/transformers");
  env.cacheDir = path.join(getUserDataDir(), "models");
  return pipeline("automatic-speech-recognition", MODEL);
}

function getTranscriber() {
  if (!transcriberPromise) {
    transcriberPromise = loadTranscriber();
  }
  return transcriberPromise;
}

/** true, если модель уже скачана и инициализация не потребует ожидания загрузки. */
export function isVoiceModelReady(): boolean {
  return transcriberPromise !== null;
}

export async function transcribe(audioData: Float32Array): Promise<string> {
  const transcriber = await getTranscriber();
  
  const voiceLanguage = getSettings().voiceLanguage || "ru";
  const language = WHISPER_LANG_MAPPING[voiceLanguage] || "russian";
  
  console.log(`[Whisper] Распознавание аудио. Выбранный язык: "${language}"...`);
  
  const output = await transcriber(audioData, { language });
  const result = Array.isArray(output) ? output[0] : output;
  return (result?.text ?? "").trim();
}
