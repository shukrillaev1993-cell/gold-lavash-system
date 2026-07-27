import Store from "electron-store";
import * as dotenv from "dotenv";
import * as path from "path";
import { getUserDataDir } from "./paths";

// Загружаем переменные окружения из .env файла в корне папки jarvis
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Reminder {
  id: string;
  text: string;
  dueAt: string; // ISO 8601
  createdAt: string;
  notified: boolean;
}

export type Provider = "anthropic" | "ollama" | "gemini";

export interface Settings {
  provider: Provider;
  apiKey: string;
  model: string;
  ollamaModel: string;
  geminiApiKey: string;
  geminiModel: string;
  telegramBotToken: string;
  telegramOwnerChatId: string;
  telegramCommandPassword: string;
  cloudBotUrl: string;
  cloudHeartbeatSecret: string;
  voiceLanguage: "ru" | "uz" | "en";
}

interface JarvisSchema {
  settings: Settings;
  history: ChatMessage[];
  reminders: Reminder[];
}

const store = new Store<JarvisSchema>({
  name: "jarvis-data",
  // electron-store по умолчанию требует app.getPath('userData') из Electron-рантайма;
  // передаём путь явно, чтобы десктоп-приложение и Telegram-бот (обычный Node-процесс)
  // использовали один и тот же файл данных.
  cwd: getUserDataDir(),
  defaults: {
    settings: {
      provider: "anthropic",
      apiKey: "",
      model: "claude-3-5-haiku-20241022",
      ollamaModel: "llama3.1",
      geminiApiKey: "",
      geminiModel: "gemini-3.5-flash",
      telegramBotToken: "",
      telegramOwnerChatId: "",
      telegramCommandPassword: "",
      cloudBotUrl: "",
      cloudHeartbeatSecret: "",
      voiceLanguage: "ru",
    },
    history: [],
    reminders: [],
  },
});

const MAX_HISTORY = 50;

export function getSettings(): Settings {
  const localSettings = store.get("settings") || {};
  
  // Приоритет отдаем переменным окружения, если они заданы.
  // Это критично для headless/cloud развертываний вроде Hugging Face Spaces или Render,
  // где нет графического интерфейса и файлы во временной директории стираются.
  const provider = (process.env.PROVIDER as Provider) || localSettings.provider || "anthropic";
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.API_KEY || localSettings.apiKey || "";
  const model = process.env.MODEL || localSettings.model || "claude-3-5-haiku-20241022";
  const ollamaModel = process.env.OLLAMA_MODEL || localSettings.ollamaModel || "llama3.1";
  const geminiApiKey = process.env.GEMINI_API_KEY || localSettings.geminiApiKey || "";
  const geminiModel = process.env.GEMINI_MODEL || localSettings.geminiModel || "gemini-3.5-flash";
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || localSettings.telegramBotToken || "";
  const telegramOwnerChatId = process.env.TELEGRAM_OWNER_CHAT_ID || localSettings.telegramOwnerChatId || "";
  const telegramCommandPassword = process.env.TELEGRAM_COMMAND_PASSWORD || localSettings.telegramCommandPassword || "";
  const cloudBotUrl = process.env.CLOUD_BOT_URL || localSettings.cloudBotUrl || "";
  const cloudHeartbeatSecret = process.env.CLOUD_HEARTBEAT_SECRET || localSettings.cloudHeartbeatSecret || "";
  const voiceLanguage = (process.env.VOICE_LANGUAGE as "ru" | "uz" | "en") || localSettings.voiceLanguage || "ru";

  return {
    provider,
    apiKey,
    model,
    ollamaModel,
    geminiApiKey,
    geminiModel,
    telegramBotToken,
    telegramOwnerChatId,
    telegramCommandPassword,
    cloudBotUrl,
    cloudHeartbeatSecret,
    voiceLanguage,
  };
}

export function setSettings(settings: Partial<Settings>): void {
  store.set("settings", { ...store.get("settings"), ...settings });
}

export function getHistory(): ChatMessage[] {
  return store.get("history");
}

export function appendHistory(messages: ChatMessage[]): void {
  const updated = [...store.get("history"), ...messages].slice(-MAX_HISTORY);
  store.set("history", updated);
}

export function clearHistory(): void {
  store.set("history", []);
}

export function getReminders(): Reminder[] {
  return store.get("reminders");
}

export function addReminder(text: string, dueAt: string): Reminder {
  const reminder: Reminder = {
    id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    text,
    dueAt,
    createdAt: new Date().toISOString(),
    notified: false,
  };
  store.set("reminders", [...store.get("reminders"), reminder]);
  return reminder;
}

export function cancelReminder(id: string): boolean {
  const reminders = store.get("reminders");
  const filtered = reminders.filter((r) => r.id !== id);
  store.set("reminders", filtered);
  return filtered.length !== reminders.length;
}

export function markReminderNotified(id: string): void {
  const reminders = store.get("reminders").map((r) =>
    r.id === id ? { ...r, notified: true } : r
  );
  store.set("reminders", reminders);
}
