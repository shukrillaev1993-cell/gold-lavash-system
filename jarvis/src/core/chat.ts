import { getSettings } from "./store";
import { sendUserMessage as sendUserMessageClaude, hasApiKey } from "./claude";
import { sendUserMessageOllama, type StreamCallbacks } from "./ollama";
import { sendUserMessageGemini, hasGeminiApiKey } from "./gemini";

export type { StreamCallbacks };

/** Anthropic и Gemini требуют сохранённый API-ключ; Ollama проверяется на месте (сервер может быть не запущен). */
export function isConfigured(): boolean {
  const settings = getSettings();
  if (settings.provider === "ollama") return true;
  if (settings.provider === "gemini") return hasGeminiApiKey();
  return hasApiKey();
}

export async function sendUserMessage(
  userText: string,
  callbacks: StreamCallbacks
): Promise<string> {
  const settings = getSettings();
  if (settings.provider === "ollama") {
    return sendUserMessageOllama(userText, callbacks);
  }
  if (settings.provider === "gemini") {
    return sendUserMessageGemini(userText, callbacks);
  }
  return sendUserMessageClaude(userText, callbacks);
}
