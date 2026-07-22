import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import * as path from "path";
import { getSettings, getHistory, appendHistory } from "./store";
import { tools } from "./tools";

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const STATIC_SYSTEM_PROMPT = `Ты — Jarvis, персональный AI-ассистент пользователя на его личном компьютере (Windows), работающий как десктопное приложение.

Возможности:
- Обычное общение и ответы на вопросы.
- Инструмент run_command — выполняет команды в системной оболочке. Пользователь ВСЕГДА видит точную команду и подтверждает или отклоняет её перед выполнением — не пытайся обойти это, не проси пользователя выполнить команду вручную вместо использования инструмента.
- Инструменты web_search и web_fetch — для поиска и чтения актуальной информации в интернете.
- Инструменты create_reminder / list_reminders / cancel_reminder — напоминания, которые сработают как нативные уведомления.

Отвечай на языке, на котором пишет пользователь. Будь кратким и по делу, без лишних вступлений.`;

function buildSystemPrompt() {
  return [
    {
      type: "text" as const,
      text: STATIC_SYSTEM_PROMPT,
      cache_control: { type: "ephemeral" as const },
    },
    {
      type: "text" as const,
      text: `Текущая дата и время: ${new Date().toISOString()} (ISO 8601, UTC).`,
    },
  ];
}

function getApiKey(): string {
  const envKey = process.env.ANTHROPIC_API_KEY;
  if (envKey) return envKey;
  return getSettings().apiKey;
}

export function hasApiKey(): boolean {
  return Boolean(getApiKey());
}

export interface StreamCallbacks {
  onTextDelta: (chunk: string) => void;
  onToolUse?: (name: string) => void;
}

export async function sendUserMessage(
  userText: string,
  callbacks: StreamCallbacks
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Не задан API-ключ Anthropic. Откройте настройки и укажите ключ.");
  }
  const settings = getSettings();
  const client = new Anthropic({ apiKey });

  const history = getHistory();
  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: userText },
  ];

  const runner = client.beta.messages.toolRunner({
    model: settings.model || "claude-haiku-4-5",
    max_tokens: 16000,
    system: buildSystemPrompt(),
    tools,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    messages,
    stream: true,
  });

  let fullText = "";
  for await (const stream of runner) {
    for await (const event of stream) {
      if (event.type === "content_block_start") {
        const block = event.content_block;
        if (block.type === "tool_use" || block.type === "server_tool_use") {
          callbacks.onToolUse?.(block.name);
        }
      } else if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        fullText += event.delta.text;
        callbacks.onTextDelta(event.delta.text);
      }
    }
  }

  appendHistory([
    { role: "user", content: userText },
    { role: "assistant", content: fullText },
  ]);

  return fullText;
}
