import { z } from "zod";
import { getSettings, getHistory, appendHistory } from "./store";
import { localToolDefs, type LocalToolDef } from "./tools/definitions";
import { webToolDefs } from "./tools/webTools";

const MAX_STEPS = 8;
const allDefs: LocalToolDef[] = [...localToolDefs, ...webToolDefs];

function buildSystemPrompt(): string {
  return `Ты — Jarvis, персональный AI-ассистент пользователя на его личном компьютере (Windows), работающий как десктопное приложение через модель Gemini.

Возможности:
- Обычное общение и ответы на вопросы.
- Инструмент run_command — выполняет команды в системной оболочке. Пользователь ВСЕГДА видит точную команду и подтверждает или отклоняет её перед выполнением — не пытайся обойти это, не проси пользователя выполнить команду вручную вместо использования инструмента.
- Инструменты web_search и web_fetch — для поиска и чтения актуальной информации в интернете.
- Инструменты create_reminder / list_reminders / cancel_reminder — напоминания, которые сработают как нативные уведомления.
- Инструменты list_sales_sheets / read_sales_sheet — доступ к данным системы учёта продаж "Gold Lavash" (Google-таблица): заказы, отправки, возвраты, цены, логистика, поступления денег. Используй их для финансового/маркетингового/статистического/экономического анализа по запросу пользователя — сначала list_sales_sheets, затем read_sales_sheet по нужным листам. Некоторые листы недоступны намеренно (содержат логины/пароли) — если инструмент отказал, объясни это, не пытайся обойти запрет.

Текущая дата и время: ${new Date().toISOString()} (ISO 8601, UTC). Используй его как точку отсчёта для относительных дат ("через 30 минут" и т.п.).
Отвечай на языке, на котором пишет пользователь. Будь кратким и по делу.`;
}

function cleanSchema(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanSchema);
  }
  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    if (key === "additionalProperties" || key === "$schema" || key === "$id") {
      continue;
    }
    cleaned[key] = cleanSchema(obj[key]);
  }
  return cleaned;
}

function toGeminiTool(def: LocalToolDef) {
  const schema = (z as any).toJSONSchema(def.schema);
  const cleaned = cleanSchema(schema);
  return {
    name: def.name,
    description: def.description,
    parameters: cleaned,
  };
}

function getApiKey(): string {
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey) return envKey;
  return getSettings().geminiApiKey || "";
}

export function hasGeminiApiKey(): boolean {
  return Boolean(getApiKey());
}

export interface StreamCallbacks {
  onTextDelta: (chunk: string) => void;
  onToolUse?: (name: string) => void;
}

export async function sendUserMessageGemini(
  userText: string,
  callbacks: StreamCallbacks
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Не задан API-ключ Gemini. Откройте настройки и укажите ключ.");
  }

  const settings = getSettings();
  const model = settings.geminiModel || "gemini-3.5-flash";

  const tools = [
    {
      functionDeclarations: allDefs.map(toGeminiTool),
    },
  ];

  const history = getHistory();
  const contents: any[] = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    {
      role: "user",
      parts: [{ text: userText }],
    },
  ];

  const systemInstruction = {
    parts: [{ text: buildSystemPrompt() }],
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  for (let step = 0; step < MAX_STEPS; step++) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        tools,
        systemInstruction,
        toolConfig: {
          functionCallingConfig: {
            mode: "AUTO",
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Gemini API error ${response.status}: ${errorText || response.statusText}`);
    }

    const data = (await response.json()) as any;
    const candidate = data.candidates?.[0];
    if (!candidate) {
      throw new Error("Gemini вернула пустой ответ (нет кандидатов). Возможно, сработал фильтр безопасности.");
    }

    const content = candidate.content;
    if (!content) {
      throw new Error("Не удалось получить контент от Gemini.");
    }

    const parts = content.parts || [];
    const functionCalls = parts.filter((p: any) => p.functionCall);

    if (functionCalls.length > 0) {
      // Модель хочет вызвать один или несколько инструментов
      // 1. Добавляем ответ модели с вызовами инструментов в contents
      contents.push(content);

      // 2. Выполняем вызовы инструментов параллельно
      const responseParts: any[] = [];
      for (const part of functionCalls) {
        const fc = part.functionCall;
        callbacks.onToolUse?.(fc.name);

        const def = allDefs.find((d) => d.name === fc.name);
        let resultText: string;
        if (!def) {
          resultText = `Неизвестный инструмент: ${fc.name}`;
        } else {
          try {
            const parsedArgs = def.schema.parse(fc.args || {});
            resultText = await def.run(parsedArgs);
          } catch (err) {
            resultText = `Ошибка выполнения инструмента "${fc.name}": ${
              err instanceof Error ? err.message : String(err)
            }`;
          }
        }

        responseParts.push({
          functionResponse: {
            name: fc.name,
            response: { result: resultText },
          },
        });
      }

      // 3. Добавляем результаты выполнения инструментов в contents как следующий ход
      contents.push({
        role: "user",
        parts: responseParts,
      });

      // Переходим к следующему шагу в цикле
      continue;
    }

    // Если нет вызовов инструментов, это финальный текстовый ответ
    const textPart = parts.find((p: any) => p.text);
    const fullText = textPart ? textPart.text : "";

    callbacks.onTextDelta(fullText);
    appendHistory([
      { role: "user", content: userText },
      { role: "assistant", content: fullText },
    ]);
    return fullText;
  }

  throw new Error("Превышен лимит шагов агента Gemini (похоже, модель зациклилась на вызовах инструментов).");
}
