interface JarvisSettings {
  apiKey: string;
  model: string;
}

interface ChatSendResult {
  ok: boolean;
  text?: string;
  error?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Reminder {
  id: string;
  text: string;
  dueAt: string;
  notified: boolean;
}

interface ToolConfirmRequest {
  requestId: string;
  command: string;
  cwd?: string;
}

interface JarvisAPI {
  sendMessage: (text: string) => Promise<ChatSendResult>;
  onChatDelta: (callback: (chunk: string) => void) => void;
  onChatToolUse: (callback: (name: string) => void) => void;
  onToolConfirmRequest: (callback: (payload: ToolConfirmRequest) => void) => void;
  respondToolConfirm: (requestId: string, approved: boolean) => void;
  onReminderDue: (callback: (reminder: Reminder) => void) => void;
  getSettings: () => Promise<JarvisSettings>;
  saveSettings: (settings: Partial<JarvisSettings>) => Promise<JarvisSettings>;
  hasApiKey: () => Promise<boolean>;
  getHistory: () => Promise<ChatMessage[]>;
  getReminders: () => Promise<Reminder[]>;
}

interface Window {
  jarvis: JarvisAPI;
}

const messagesEl = document.getElementById("messages") as HTMLDivElement;
const chatForm = document.getElementById("chatForm") as HTMLFormElement;
const chatInput = document.getElementById("chatInput") as HTMLTextAreaElement;
const sendBtn = document.getElementById("sendBtn") as HTMLButtonElement;
const remindersList = document.getElementById("remindersList") as HTMLUListElement;

const settingsBtn = document.getElementById("settingsBtn") as HTMLButtonElement;
const settingsModal = document.getElementById("settingsModal") as HTMLDivElement;
const settingsClose = document.getElementById("settingsClose") as HTMLButtonElement;
const settingsSave = document.getElementById("settingsSave") as HTMLButtonElement;
const apiKeyInput = document.getElementById("apiKeyInput") as HTMLInputElement;
const modelSelect = document.getElementById("modelSelect") as HTMLSelectElement;

const confirmModal = document.getElementById("confirmModal") as HTMLDivElement;
const confirmCommand = document.getElementById("confirmCommand") as HTMLPreElement;
const confirmCwd = document.getElementById("confirmCwd") as HTMLParagraphElement;
const confirmApprove = document.getElementById("confirmApprove") as HTMLButtonElement;
const confirmDeny = document.getElementById("confirmDeny") as HTMLButtonElement;

function addMessage(role: "user" | "assistant" | "system" | "error", text: string): HTMLDivElement {
  const el = document.createElement("div");
  el.className = `msg ${role}`;
  el.textContent = text;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return el;
}

function renderReminders(reminders: Reminder[]): void {
  remindersList.innerHTML = "";
  if (reminders.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Нет напоминаний";
    remindersList.appendChild(li);
    return;
  }
  for (const r of reminders) {
    const li = document.createElement("li");
    const when = new Date(r.dueAt).toLocaleString("ru-RU");
    li.textContent = `${r.notified ? "✓ " : "⏰ "}${r.text} — ${when}`;
    remindersList.appendChild(li);
  }
}

async function refreshReminders(): Promise<void> {
  const reminders = await window.jarvis.getReminders();
  renderReminders(reminders);
}

async function loadHistory(): Promise<void> {
  const history = await window.jarvis.getHistory();
  for (const m of history) {
    addMessage(m.role, m.content);
  }
}

let currentAssistantBubble: HTMLDivElement | null = null;

window.jarvis.onChatDelta((chunk) => {
  if (!currentAssistantBubble) {
    currentAssistantBubble = addMessage("assistant", "");
  }
  currentAssistantBubble.textContent += chunk;
  messagesEl.scrollTop = messagesEl.scrollHeight;
});

window.jarvis.onChatToolUse((name) => {
  addMessage("system", `🔧 использует инструмент: ${name}`);
});

window.jarvis.onReminderDue((reminder) => {
  addMessage("system", `⏰ Напоминание: ${reminder.text}`);
  refreshReminders();
});

window.jarvis.onToolConfirmRequest((payload) => {
  confirmCommand.textContent = payload.command;
  confirmCwd.textContent = payload.cwd ? `Рабочая директория: ${payload.cwd}` : "";
  confirmModal.classList.remove("hidden");

  const onApprove = () => {
    window.jarvis.respondToolConfirm(payload.requestId, true);
    cleanup();
  };
  const onDeny = () => {
    window.jarvis.respondToolConfirm(payload.requestId, false);
    cleanup();
  };
  function cleanup() {
    confirmModal.classList.add("hidden");
    confirmApprove.removeEventListener("click", onApprove);
    confirmDeny.removeEventListener("click", onDeny);
  }
  confirmApprove.addEventListener("click", onApprove);
  confirmDeny.addEventListener("click", onDeny);
});

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  const hasKey = await window.jarvis.hasApiKey();
  if (!hasKey) {
    openSettings();
    addMessage("error", "Сначала укажите API-ключ Anthropic в настройках.");
    return;
  }

  addMessage("user", text);
  chatInput.value = "";
  sendBtn.disabled = true;
  currentAssistantBubble = null;

  const result = await window.jarvis.sendMessage(text);
  if (!result.ok) {
    addMessage("error", `Ошибка: ${result.error}`);
  }
  sendBtn.disabled = false;
  refreshReminders();
  chatInput.focus();
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.requestSubmit();
  }
});

function openSettings(): void {
  window.jarvis.getSettings().then((settings) => {
    apiKeyInput.value = settings.apiKey || "";
    modelSelect.value = settings.model || "claude-haiku-4-5";
    settingsModal.classList.remove("hidden");
  });
}

settingsBtn.addEventListener("click", openSettings);
settingsClose.addEventListener("click", () => settingsModal.classList.add("hidden"));
settingsSave.addEventListener("click", async () => {
  await window.jarvis.saveSettings({
    apiKey: apiKeyInput.value.trim(),
    model: modelSelect.value,
  });
  settingsModal.classList.add("hidden");
});

(async function init() {
  await loadHistory();
  await refreshReminders();
  const hasKey = await window.jarvis.hasApiKey();
  if (!hasKey) {
    openSettings();
  }
})();
