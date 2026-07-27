import { z } from "zod";
import { getSettings, getHistory, appendHistory } from "./store";
import { localToolDefs, type LocalToolDef } from "./tools/definitions";
import { webToolDefs } from "./tools/webTools";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const MAX_STEPS = 8;

const allDefs: LocalToolDef[] = [...localToolDefs, ...webToolDefs];

function buildSystemPrompt(): string {
  return `Ты — Jarvis, персональный AI-ассистент пользователя на его личном компьютере (Windows), работающий как десктопное приложение через локальную модель (Ollama).

Возможности:
- Обычное общение и ответы на вопросы.
- Инструмент run_command — выполняет команды в системной оболочке. Пользователь ВСЕГДА видит точную команду и подтверждает или отклоняет её перед выполнением — не пытайся обойти это.
- Инструменты web_search и web_fetch — поиск и чтение страниц в интернете.
- Инструменты create_reminder / list_reminders / cancel_reminder — напоминания, которые сработают как нативные уведомления.
- Инструменты list_sales_sheets / read_sales_sheet — доступ к данным системы учёта продаж "Gold Lavash" (Google-таблица): заказы, отправки, возвраты, цены, логистика, поступления денег. Используй их для финансового/маркетингового/статистического/экономического анализа по запросу пользователя — сначала list_sales_sheets, затем read_sales_sheet по нужным листам. Некоторые листы недоступны намеренно (содержат логины/пароли) — если инструмент отказал, объясни это, не пытайся обойти запрет.

Текущая дата и время: ${new Date().toISOString()} (ISO 8601, UTC). Используй его как точку отсчёта для относительных дат ("через 30 минут" и т.п.).
Отвечай на языке, на котором пишет пользователь. Будь кратким и по делу.`;
}

function toOllamaTool(def: LocalToolDef) {
  return {
    type: "function" as const,
    function: {
      name: def.name,
      description: def.description,
      parameters: z.toJSONSchema(def.schema),
    },
  };
}

interface OllamaToolCall {
  function: { name: string; arguments: unknown };
}

interface OllamaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: OllamaToolCall[];
}

async function checkOllamaAvailable(model: string): Promise<void> {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/version`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    throw new Error(
      `Не удалось подключиться к Ollama на ${OLLAMA_HOST}. Установите Ollama с ollama.com, запустите её и выполните "ollama pull ${model}", затем повторите.`
    );
  }
}

async function ollamaChat(
  model: string,
  messages: OllamaMessage[],
  toolSchemas: ReturnType<typeof toOllamaTool>[]
): Promise<OllamaMessage> {
  const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, tools: toolSchemas, stream: false }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ollama вернула ошибку ${res.status}: ${text || res.statusText}`);
  }
  const data = (await res.json()) as { message: OllamaMessage };
  return data.message;
}

export interface StreamCallbacks {
  onTextDelta: (chunk: string) => void;
  onToolUse?: (name: string) => void;
}

export async function sendUserMessageOllama(
  userText: string,
  callbacks: StreamCallbacks
): Promise<string> {
  const settings = getSettings();
  const model = settings.ollamaModel || "llama3.1";
  await checkOllamaAvailable(model);

  const toolSchemas = allDefs.map(toOllamaTool);
  const history = getHistory();
  const messages: OllamaMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userText },
  ];

  for (let step = 0; step < MAX_STEPS; step++) {
    const message = await ollamaChat(model, messages, toolSchemas);
    messages.push(message);

    if (message.tool_calls && message.tool_calls.length > 0) {
      for (const call of message.tool_calls) {
        callbacks.onToolUse?.(call.function.name);
        const def = allDefs.find((d) => d.name === call.function.name);
        let resultText: string;
        if (!def) {
          resultText = `Неизвестный инструмент: ${call.function.name}`;
        } else {
          try {
            const rawArgs =
              typeof call.function.arguments === "string"
                ? JSON.parse(call.function.arguments || "{}")
                : call.function.arguments || {};
            const parsedArgs = def.schema.parse(rawArgs);
            resultText = await def.run(parsedArgs);
          } catch (err) {
            resultText = `Ошибка выполнения инструмента "${call.function.name}": ${
              err instanceof Error ? err.message : String(err)
            }`;
          }
        }
        messages.push({ role: "tool", content: resultText });
      }
      continue;
    }

    const fullText = message.content || "";
    callbacks.onTextDelta(fullText);
    appendHistory([
      { role: "user", content: userText },
      { role: "assistant", content: fullText },
    ]);
    return fullText;
  }

  throw new Error("Превышен лимит шагов агента (похоже, модель зациклилась на вызовах инструментов).");
}
