interface JarvisSettings {
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

interface TranscribeResult {
  ok: boolean;
  text?: string;
  firstRun?: boolean;
  error?: string;
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
  transcribeAudio: (audioData: Float32Array) => Promise<TranscribeResult>;
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
const providerSelect = document.getElementById("providerSelect") as HTMLSelectElement;
const anthropicFields = document.getElementById("anthropicFields") as HTMLDivElement;
const geminiFields = document.getElementById("geminiFields") as HTMLDivElement;
const ollamaFields = document.getElementById("ollamaFields") as HTMLDivElement;
const apiKeyInput = document.getElementById("apiKeyInput") as HTMLInputElement;
const modelSelect = document.getElementById("modelSelect") as HTMLSelectElement;
const geminiApiKeyInput = document.getElementById("geminiApiKeyInput") as HTMLInputElement;
const geminiModelSelect = document.getElementById("geminiModelSelect") as HTMLSelectElement;
const ollamaModelInput = document.getElementById("ollamaModelInput") as HTMLInputElement;
const telegramBotTokenInput = document.getElementById("telegramBotTokenInput") as HTMLInputElement;
const telegramOwnerChatIdInput = document.getElementById("telegramOwnerChatIdInput") as HTMLInputElement;
const telegramCommandPasswordInput = document.getElementById(
  "telegramCommandPasswordInput"
) as HTMLInputElement;
const cloudBotUrlInput = document.getElementById("cloudBotUrlInput") as HTMLInputElement;
const cloudHeartbeatSecretInput = document.getElementById(
  "cloudHeartbeatSecretInput"
) as HTMLInputElement;
const voiceLanguageSelect = document.getElementById("voiceLanguageSelect") as HTMLSelectElement;

function updateProviderFieldsVisibility(): void {
  const provider = providerSelect.value;
  anthropicFields.classList.toggle("hidden", provider !== "anthropic");
  geminiFields.classList.toggle("hidden", provider !== "gemini");
  ollamaFields.classList.toggle("hidden", provider !== "ollama");
}

providerSelect.addEventListener("change", updateProviderFieldsVisibility);

const micBtn = document.getElementById("micBtn") as HTMLButtonElement;
const ttsToggleBtn = document.getElementById("ttsToggleBtn") as HTMLButtonElement;

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

  const configured = await window.jarvis.hasApiKey();
  if (!configured) {
    openSettings();
    addMessage("error", "Сначала настройте источник модели (API-ключ Anthropic или Ollama) в настройках.");
    return;
  }

  addMessage("user", text);
  chatInput.value = "";
  sendBtn.disabled = true;
  currentAssistantBubble = null;

  const result = await window.jarvis.sendMessage(text);
  if (!result.ok) {
    addMessage("error", `Ошибка: ${result.error}`);
  } else if (result.text) {
    speak(result.text);
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

// ---- Озвучка ответов (TTS) ----

// Дублирует core/sanitizeForSpeech.ts — рендерер выполняется как обычный
// браузерный скрипт (без require/nodeIntegration), поделиться модулем с main-процессом нельзя.
function sanitizeForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[ \t]*[-*+]\s+/gm, "")
    .replace(/^[ \t]*\d+\.\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

let ttsEnabled = false;

// Список голосов speechSynthesis грузится асинхронно — прогреваем заранее.
speechSynthesis.getVoices();
speechSynthesis.addEventListener("voiceschanged", () => speechSynthesis.getVoices());

function getRussianVoice(): SpeechSynthesisVoice | null {
  return speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("ru")) || null;
}

function speak(rawText: string): void {
  const text = sanitizeForSpeech(rawText);
  if (!ttsEnabled || !text) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const ruVoice = getRussianVoice();
  if (ruVoice) utterance.voice = ruVoice;
  speechSynthesis.speak(utterance);
}

ttsToggleBtn.addEventListener("click", () => {
  ttsEnabled = !ttsEnabled;
  ttsToggleBtn.textContent = ttsEnabled ? "🔊" : "🔇";
  ttsToggleBtn.setAttribute("aria-pressed", String(ttsEnabled));
  if (!ttsEnabled) speechSynthesis.cancel();
});

// ---- Голосовой ввод (push-to-talk + локальный Whisper) ----

let mediaRecorder: MediaRecorder | null = null;
let mediaStream: MediaStream | null = null;
let recordedChunks: Blob[] = [];

async function blobToFloat32Audio(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new AudioContext();
  try {
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);
    const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * 16000), 16000);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    return rendered.getChannelData(0);
  } finally {
    await audioCtx.close();
  }
}

async function startRecording(): Promise<void> {
  if (mediaRecorder) return;
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    addMessage("error", `Нет доступа к микрофону: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(mediaStream);
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };
  mediaRecorder.start();
  micBtn.classList.add("recording");
}

async function stopRecordingAndTranscribe(): Promise<void> {
  if (!mediaRecorder) return;
  const recorder = mediaRecorder;
  mediaRecorder = null;
  micBtn.classList.remove("recording");

  const stopped = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });
  recorder.stop();
  await stopped;
  mediaStream?.getTracks().forEach((t) => t.stop());
  mediaStream = null;

  if (recordedChunks.length === 0) return;
  const blob = new Blob(recordedChunks, { type: recorder.mimeType });
  recordedChunks = [];

  micBtn.disabled = true;
  const originalPlaceholder = chatInput.placeholder;
  chatInput.placeholder = "🎙 Распознаю речь… (при первом запуске может скачиваться модель — это займёт время)";

  try {
    const audioData = await blobToFloat32Audio(blob);
    const result = await window.jarvis.transcribeAudio(audioData);
    if (result.ok && result.text) {
      chatInput.value = chatInput.value ? `${chatInput.value} ${result.text}` : result.text;
      chatInput.focus();
    } else if (!result.ok) {
      addMessage("error", `Ошибка распознавания речи: ${result.error}`);
    }
  } catch (err) {
    addMessage("error", `Ошибка обработки записи: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    chatInput.placeholder = originalPlaceholder;
    micBtn.disabled = false;
  }
}

micBtn.addEventListener("mousedown", startRecording);
micBtn.addEventListener("mouseup", stopRecordingAndTranscribe);
micBtn.addEventListener("mouseleave", () => {
  if (mediaRecorder) stopRecordingAndTranscribe();
});
micBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startRecording();
});
micBtn.addEventListener("touchend", (e) => {
  e.preventDefault();
  stopRecordingAndTranscribe();
});

function openSettings(): void {
  window.jarvis.getSettings().then((settings) => {
    providerSelect.value = settings.provider || "anthropic";
    apiKeyInput.value = settings.apiKey || "";
    modelSelect.value = settings.model || "claude-3-5-haiku-20241022";
    geminiApiKeyInput.value = settings.geminiApiKey || "";
    geminiModelSelect.value = settings.geminiModel || "gemini-3.5-flash";
    ollamaModelInput.value = settings.ollamaModel || "llama3.1";
    telegramBotTokenInput.value = settings.telegramBotToken || "";
    telegramOwnerChatIdInput.value = settings.telegramOwnerChatId || "";
    telegramCommandPasswordInput.value = settings.telegramCommandPassword || "";
    cloudBotUrlInput.value = settings.cloudBotUrl || "";
    cloudHeartbeatSecretInput.value = settings.cloudHeartbeatSecret || "";
    voiceLanguageSelect.value = settings.voiceLanguage || "ru";
    updateProviderFieldsVisibility();
    settingsModal.classList.remove("hidden");
  });
}

settingsBtn.addEventListener("click", openSettings);
settingsClose.addEventListener("click", () => settingsModal.classList.add("hidden"));
settingsSave.addEventListener("click", async () => {
  await window.jarvis.saveSettings({
    provider: providerSelect.value as "anthropic" | "ollama" | "gemini",
    apiKey: apiKeyInput.value.trim(),
    model: modelSelect.value,
    geminiApiKey: geminiApiKeyInput.value.trim(),
    geminiModel: geminiModelSelect.value,
    ollamaModel: ollamaModelInput.value.trim() || "llama3.1",
    telegramBotToken: telegramBotTokenInput.value.trim(),
    telegramOwnerChatId: telegramOwnerChatIdInput.value.trim(),
    telegramCommandPassword: telegramCommandPasswordInput.value.trim(),
    cloudBotUrl: cloudBotUrlInput.value.trim(),
    cloudHeartbeatSecret: cloudHeartbeatSecretInput.value.trim(),
    voiceLanguage: voiceLanguageSelect.value as "ru" | "uz" | "en",
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
