import { contextBridge, ipcRenderer } from "electron";

export interface JarvisSettings {
  provider: "anthropic" | "ollama" | "gemini";
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

contextBridge.exposeInMainWorld("jarvis", {
  sendMessage: (text: string) => ipcRenderer.invoke("chat:send", text),
  onChatDelta: (callback: (chunk: string) => void) => {
    ipcRenderer.on("chat:delta", (_event, chunk: string) => callback(chunk));
  },
  onChatToolUse: (callback: (name: string) => void) => {
    ipcRenderer.on("chat:tool-use", (_event, name: string) => callback(name));
  },

  onToolConfirmRequest: (
    callback: (payload: { requestId: string; command: string; cwd?: string }) => void
  ) => {
    ipcRenderer.on("tool:confirm-request", (_event, payload) => callback(payload));
  },
  respondToolConfirm: (requestId: string, approved: boolean) => {
    ipcRenderer.send("tool:confirm-response", { requestId, approved });
  },

  onReminderDue: (callback: (reminder: { text: string; dueAt: string }) => void) => {
    ipcRenderer.on("reminder:due", (_event, reminder) => callback(reminder));
  },

  getSettings: (): Promise<JarvisSettings> => ipcRenderer.invoke("settings:get"),
  saveSettings: (settings: Partial<JarvisSettings>): Promise<JarvisSettings> =>
    ipcRenderer.invoke("settings:save", settings),
  hasApiKey: (): Promise<boolean> => ipcRenderer.invoke("settings:has-key"),

  getHistory: () => ipcRenderer.invoke("history:get"),
  getReminders: () => ipcRenderer.invoke("reminders:get"),

  transcribeAudio: (
    audioData: Float32Array
  ): Promise<{ ok: boolean; text?: string; firstRun?: boolean; error?: string }> =>
    ipcRenderer.invoke("voice:transcribe", audioData),
});
