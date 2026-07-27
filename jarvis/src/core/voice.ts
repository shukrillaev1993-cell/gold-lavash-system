import * as path from "path";
import * as os from "os";
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

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function pcmToWav(samples: Float32Array, sampleRate: number = 16000): Buffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return Buffer.from(buffer);
}

async function transcribeViaGemini(audioData: Float32Array): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || getSettings().geminiApiKey;
  if (!apiKey) {
    throw new Error("Не задан API-ключ Gemini для распознавания речи в облаке.");
  }

  const voiceLanguage = getSettings().voiceLanguage || "ru";
  const langPrompt =
    voiceLanguage === "uz" ? "O'zbekcha" : voiceLanguage === "en" ? "English" : "На русском языке";

  console.log(`[Gemini STT] Начинаю распознавание речи (язык: ${voiceLanguage}) через API...`);

  // Конвертируем Float32Array в стандартный WAV 16кГц
  const wavBuffer = pcmToWav(audioData, 16000);
  const base64Audio = wavBuffer.toString("base64");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "audio/wav",
                data: base64Audio,
              },
            },
            {
              text: `Это аудиофайл устной речи. Пожалуйста, распознай и запиши устную речь дословно.
Требования:
1. Выведи только распознанный текст без каких-либо вводных слов, пояснений или комментариев.
2. Язык распознавания: ${langPrompt}.
3. Если на аудио тишина или речь отсутствует, выведи пустую строку.`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini STT Error ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as any;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text.trim();
}

export async function transcribe(audioData: Float32Array): Promise<string> {
  const homedir = os.homedir();
  const isCloudOrDocker =
    process.env.RENDER === "true" ||
    process.env.PORT !== undefined ||
    homedir === "/" ||
    homedir === "/homeless-shelter" ||
    !homedir;

  // Если мы в облаке (например, Render) — используем облачный Gemini API,
  // чтобы избежать тяжелой локальной загрузки ONNX-модели Whisper и падения по OOM (RAM > 512MB).
  if (isCloudOrDocker) {
    try {
      return await transcribeViaGemini(audioData);
    } catch (err) {
      console.error("[Gemini STT Fallback Failed]", err);
      // Если API по какой-то причине недоступно, попробуем локальный Whisper как крайнее средство
    }
  }

  const transcriber = await getTranscriber();
  const voiceLanguage = getSettings().voiceLanguage || "ru";
  const language = WHISPER_LANG_MAPPING[voiceLanguage] || "russian";

  console.log(`[Whisper] Распознавание аудио. Выбранный язык: "${language}"...`);

  const output = await transcriber(audioData, { language });
  const result = Array.isArray(output) ? output[0] : output;
  return (result?.text ?? "").trim();
}
