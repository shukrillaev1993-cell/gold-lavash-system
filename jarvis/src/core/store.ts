import Store from "electron-store";

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

export interface Settings {
  apiKey: string;
  model: string;
}

interface JarvisSchema {
  settings: Settings;
  history: ChatMessage[];
  reminders: Reminder[];
}

const store = new Store<JarvisSchema>({
  name: "jarvis-data",
  defaults: {
    settings: { apiKey: "", model: "claude-haiku-4-5" },
    history: [],
    reminders: [],
  },
});

const MAX_HISTORY = 50;

export function getSettings(): Settings {
  return store.get("settings");
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
