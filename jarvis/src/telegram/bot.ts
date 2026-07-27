import { Bot, InputFile, type Context } from "grammy";
import { getSettings } from "../core/store";
import { sendUserMessage } from "../core/chat";
import { transcribe } from "../core/voice";
import { synthesizeSpeechToOgg } from "../core/voiceReply";
import {
  isAwaitingPassword,
  handlePasswordAttempt,
  setupTelegramConfirmation,
} from "./telegramConfirmation";
import { startTelegramReminders } from "./telegramReminders";

const TELEGRAM_MAX_LEN = 3500; // с запасом от лимита Telegram в 4096 символов

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000;

function getOwnerChatId(): string {
  return getSettings().telegramOwnerChatId || "";
}

/**
 * Раз в ~2 минуты (и сразу при старте) сообщает облачному (Apps Script) резерву, что
 * локальный бот жив — чтобы тот не начинал сам опрашивать Telegram, пока ПК включён.
 * Тихо ничего не делает, если облачный резерв не настроен.
 */
function startHeartbeat(): () => void {
  const sendHeartbeat = () => {
    const { cloudBotUrl, cloudHeartbeatSecret } = getSettings();
    if (!cloudBotUrl || !cloudHeartbeatSecret) return;
    const ownerId = getOwnerChatId();
    const url = `${cloudBotUrl}?action=heartbeat&secret=${encodeURIComponent(cloudHeartbeatSecret)}&ownerChatId=${encodeURIComponent(ownerId)}`;
    fetch(url, { method: "POST" }).catch(() => {
      // Нет связи с облаком — не критично, просто пропускаем этот "удар сердца".
    });
  };
  sendHeartbeat(); // сразу, не дожидаясь первого интервала — иначе облако может счесть героя устаревшим
  const timer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
  return () => clearInterval(timer);
}

/** Уведомляет облачный резерв (если он настроен) о штатном завершении локального бота —
 *  ускоряет переход на облако вместо ожидания полного тайм-аута устаревания heartbeat. */
async function handOffToCloud(): Promise<void> {
  const { cloudBotUrl, cloudHeartbeatSecret } = getSettings();
  if (!cloudBotUrl || !cloudHeartbeatSecret) return;
  try {
    const url = `${cloudBotUrl}?action=goodbye&secret=${encodeURIComponent(cloudHeartbeatSecret)}`;
    await fetch(url, { method: "POST" });
    console.log("Уведомил облачный резерв о завершении работы.");
  } catch (err) {
    console.error("Не удалось уведомить облачный резерв о завершении работы:", err);
  }
}

async function sendLong(bot: Bot, chatId: number, text: string, editMessageId?: number): Promise<void> {
  const body = text || "(пустой ответ)";
  const chunks: string[] = [];
  for (let i = 0; i < body.length; i += TELEGRAM_MAX_LEN) {
    chunks.push(body.slice(i, i + TELEGRAM_MAX_LEN));
  }

  if (editMessageId) {
    try {
      await bot.api.editMessageText(chatId, editMessageId, chunks[0]);
    } catch {
      await bot.api.sendMessage(chatId, chunks[0]).catch(() => {});
    }
    for (const chunk of chunks.slice(1)) {
      await bot.api.sendMessage(chatId, chunk).catch(() => {});
    }
    return;
  }
  for (const chunk of chunks) {
    await bot.api.sendMessage(chatId, chunk).catch(() => {});
  }
}

/** Проверка доступа: раскрывает chat ID при первом обращении, иначе разрешает только владельцу. */
async function ensureAuthorized(ctx: Context, chatId: number): Promise<boolean> {
  const ownerChatId = getOwnerChatId();

  if (!ownerChatId) {
    console.log(`[Auth] ВНИМАНИЕ: Владелец не настроен. Раскрываю ID для чата: ${chatId}`);
    await ctx.reply(
      `Ваш chat ID: ${chatId}\n\n` +
        `Впишите его в настройках Jarvis (десктопное приложение) в поле "Chat ID владельца" ` +
        `и сохраните, чтобы разрешить доступ к боту.`
    );
    return false;
  }

  if (String(chatId) !== ownerChatId) {
    console.log(`[Auth] Отклонено: Получено сообщение от стороннего chat ID ${chatId} (Владелец: ${ownerChatId})`);
    await ctx.reply("Этот бот приватный.");
    return false;
  }

  console.log(`[Auth] Успешно: Сообщение от владельца ${chatId}`);
  return true;
}

/** Общая обработка: отправка текста в Claude/Ollama, ответ текстом и (опционально) голосом. */
async function handleUserText(
  bot: Bot,
  chatId: number,
  text: string,
  options: { alsoSendVoice?: boolean; placeholderMessageId?: number } = {}
): Promise<void> {
  const settings = getSettings();
  console.log(`[LLM] Начинаю обработку запроса через провайдер: "${settings.provider}"...`);

  const placeholder =
    options.placeholderMessageId !== undefined
      ? { message_id: options.placeholderMessageId }
      : await bot.api.sendMessage(chatId, "⏳ Печатает…");

  let buffer = "";
  try {
    const fullText = await sendUserMessage(text, {
      onTextDelta: (chunk) => {
        buffer += chunk;
      },
      onToolUse: (name) => {
        console.log(`[Tool] Агент использует инструмент: "${name}"`);
        bot.api.sendMessage(chatId, `🔧 использует инструмент: ${name}`).catch(() => {});
      },
    });
    const replyText = fullText || buffer;
    console.log(`[LLM] Получен успешный ответ длиной ${replyText.length} симв.`);
    await sendLong(bot, chatId, replyText, placeholder.message_id);

    if (options.alsoSendVoice && replyText.trim()) {
      try {
        const ogg = await synthesizeSpeechToOgg(replyText);
        await bot.api.sendVoice(chatId, new InputFile(ogg, "jarvis.ogg"));
      } catch (err) {
        console.error("Ошибка синтеза голосового ответа:", err);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[LLM] Ошибка при генерации ответа:`, err);
    await sendLong(bot, chatId, `Ошибка: ${message}`, placeholder.message_id);
  }
}

/** Простой понижающий ресемплинг до 16кГц (усреднением) — этого достаточно для распознавания речи. */
function downsampleTo16k(input: Float32Array, inputSampleRate: number): Float32Array {
  if (inputSampleRate === 16000) return input;
  const ratio = inputSampleRate / 16000;
  const outLength = Math.floor(input.length / ratio);
  const output = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.floor((i + 1) * ratio);
    let sum = 0;
    let count = 0;
    for (let j = start; j < end && j < input.length; j++) {
      sum += input[j];
      count++;
    }
    output[i] = count > 0 ? sum / count : 0;
  }
  return output;
}

async function main(): Promise<void> {
  const token = getSettings().telegramBotToken;
  if (!token) {
    console.error(
      "Не задан токен Telegram-бота. Откройте Jarvis (десктопное приложение) → Настройки → " +
        "впишите токен от @BotFather в поле 'Токен бота' и сохраните, затем запустите `npm run bot` снова."
    );
    process.exit(1);
  }

  const bot = new Bot(token);

  bot.catch((err) => {
    console.error("Ошибка в обработчике Telegram-бота:", err);
  });

  setupTelegramConfirmation(bot, getOwnerChatId);

  bot.on("message:text", async (ctx) => {
    const chatId = ctx.chat.id;
    const text = ctx.message.text;
    console.log(`[Telegram] Получено текстовое сообщение от chat ID ${chatId}: "${text}"`);

    if (isAwaitingPassword(chatId)) {
      await handlePasswordAttempt(bot, chatId, text);
      return;
    }
    if (!(await ensureAuthorized(ctx, chatId))) return;

    await handleUserText(bot, chatId, text);
  });

  bot.on("message:voice", async (ctx) => {
    const chatId = ctx.chat.id;
    console.log(`[Telegram] Получено голосовое сообщение от chat ID ${chatId}`);

    if (isAwaitingPassword(chatId)) {
      await ctx.reply("Пожалуйста, введите пароль текстовым сообщением.");
      return;
    }
    if (!(await ensureAuthorized(ctx, chatId))) return;

    const statusMsg = await ctx.reply("🎙 Распознаю голосовое сообщение…");
    try {
      const file = await ctx.getFile();
      const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error(`Не удалось скачать голосовое сообщение (HTTP ${res.status})`);
      const oggBuffer = new Uint8Array(await res.arrayBuffer());

      const { OggOpusDecoder } = await import("ogg-opus-decoder");
      const decoder = new OggOpusDecoder();
      await decoder.ready;
      const { channelData, sampleRate } = await decoder.decodeFile(oggBuffer);
      decoder.free();

      const audioData = downsampleTo16k(channelData[0], sampleRate);
      const text = await transcribe(audioData);

      if (!text.trim()) {
        await bot.api.editMessageText(chatId, statusMsg.message_id, "Не удалось распознать речь — попробуйте ещё раз.");
        return;
      }

      await bot.api.editMessageText(chatId, statusMsg.message_id, `📝 Распознано: «${text}»`);
      await handleUserText(bot, chatId, text, { alsoSendVoice: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await bot.api
        .editMessageText(chatId, statusMsg.message_id, `Ошибка распознавания голоса: ${message}`)
        .catch(() => {});
    }
  });

  const stopReminders = startTelegramReminders(bot, getOwnerChatId);
  const stopHeartbeat = startHeartbeat();

  let shuttingDown = false;
  async function shutdown(): Promise<void> {
    if (shuttingDown) return;
    shuttingDown = true;
    stopReminders();
    stopHeartbeat();
    await handOffToCloud();
    await bot.stop();
    process.exit(0);
  }
  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());

  // На случай, если вебхук всё же где-то остался выставлен (например, вручную) — иначе
  // long polling ниже не заработает: Telegram не отдаёт getUpdates, пока активен вебхук.
  await bot.api.deleteWebhook();

  // Запуск микро-веб-сервера (требуется для облачных платформ вроде Hugging Face Spaces / Render)
  const http = await import("http");
  const PORT = process.env.PORT || 7860;
  http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Jarvis Telegram Bot is running 24/7 on Hugging Face Spaces!");
  }).listen(PORT, () => {
    console.log(`[Web] Микро-веб-сервер запущен на порту ${PORT}`);
  });

  const botInfo = await bot.api.getMe();
  console.log(`Jarvis Telegram-бот @${botInfo.username} запущен (long polling)...`);
  await bot.start();
}

main().catch((err) => {
  console.error("Не удалось запустить Telegram-бота:", err);
  process.exit(1);
});
