import { Bot, InlineKeyboard } from "grammy";
import { setConfirmHandler } from "../core/confirmation";
import { getSettings } from "../core/store";

const TIMEOUT_MS = 5 * 60 * 1000;
const MAX_PASSWORD_ATTEMPTS = 3;

interface PendingConfirmation {
  resolve: (approved: boolean) => void;
  command: string;
  timeout: ReturnType<typeof setTimeout>;
}

const pending = new Map<string, PendingConfirmation>();
// chatId -> какой requestId сейчас ожидает ввода пароля в этом чате
const awaitingPassword = new Map<number, { requestId: string; attemptsLeft: number }>();

function codeBlock(text: string): string {
  return "```\n" + text.replace(/`/g, "'") + "\n```";
}

function finish(requestId: string, approved: boolean): void {
  const entry = pending.get(requestId);
  if (!entry) return;
  clearTimeout(entry.timeout);
  pending.delete(requestId);
  entry.resolve(approved);
}

function requestTelegramConfirmation(
  bot: Bot,
  getOwnerChatId: () => string,
  command: string,
  cwd?: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const ownerChatId = getOwnerChatId();
    if (!ownerChatId) {
      resolve(false);
      return;
    }

    const requestId = `tg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const timeout = setTimeout(() => {
      for (const [chatId, state] of awaitingPassword) {
        if (state.requestId === requestId) awaitingPassword.delete(chatId);
      }
      finish(requestId, false);
      bot.api
        .sendMessage(ownerChatId, "⏱ Время ожидания подтверждения истекло — команда отклонена.")
        .catch(() => {});
    }, TIMEOUT_MS);

    pending.set(requestId, { resolve, command, timeout });

    const keyboard = new InlineKeyboard()
      .text("✅ Подтвердить", `confirm_approve:${requestId}`)
      .text("❌ Отклонить", `confirm_deny:${requestId}`);

    const cwdLine = cwd ? `\nРабочая директория: ${cwd}` : "";
    bot.api
      .sendMessage(
        ownerChatId,
        `⚠️ Jarvis хочет выполнить команду:\n${codeBlock(command)}${cwdLine}`,
        { parse_mode: "Markdown", reply_markup: keyboard }
      )
      .catch(() => finish(requestId, false));
  });
}

export function isAwaitingPassword(chatId: number): boolean {
  return awaitingPassword.has(chatId);
}

export async function handlePasswordAttempt(
  bot: Bot,
  chatId: number,
  text: string
): Promise<void> {
  const state = awaitingPassword.get(chatId);
  if (!state) return;
  const entry = pending.get(state.requestId);
  if (!entry) {
    awaitingPassword.delete(chatId);
    return;
  }

  const correctPassword = getSettings().telegramCommandPassword;
  if (correctPassword && text === correctPassword) {
    awaitingPassword.delete(chatId);
    await bot.api.sendMessage(chatId, "✅ Пароль верный, выполняю команду…");
    finish(state.requestId, true);
    return;
  }

  state.attemptsLeft -= 1;
  if (state.attemptsLeft <= 0) {
    awaitingPassword.delete(chatId);
    await bot.api.sendMessage(chatId, "❌ Неверный пароль. Попытки исчерпаны — команда отклонена.");
    finish(state.requestId, false);
    return;
  }
  await bot.api.sendMessage(chatId, `❌ Неверный пароль. Осталось попыток: ${state.attemptsLeft}.`);
}

export function setupTelegramConfirmation(bot: Bot, getOwnerChatId: () => string): void {
  bot.callbackQuery(/^confirm_(approve|deny):(.+)$/, async (ctx) => {
    const match = ctx.match as RegExpMatchArray;
    const action = match[1];
    const requestId = match[2];
    const entry = pending.get(requestId);

    if (!entry) {
      await ctx.answerCallbackQuery({ text: "Запрос уже неактуален." });
      return;
    }
    await ctx.answerCallbackQuery();

    if (action === "deny") {
      await ctx.editMessageText(`❌ Отклонено:\n${codeBlock(entry.command)}`, {
        parse_mode: "Markdown",
      });
      finish(requestId, false);
      return;
    }

    const password = getSettings().telegramCommandPassword;
    if (!password) {
      await ctx.editMessageText(
        "❌ Пароль для подтверждения команд не задан в настройках Jarvis (десктопное приложение). Выполнение отклонено."
      );
      finish(requestId, false);
      return;
    }

    const chatId = ctx.chat?.id;
    if (!chatId) {
      finish(requestId, false);
      return;
    }
    awaitingPassword.set(chatId, { requestId, attemptsLeft: MAX_PASSWORD_ATTEMPTS });
    await ctx.editMessageText(`${codeBlock(entry.command)}\n\n🔑 Введите пароль для подтверждения:`, {
      parse_mode: "Markdown",
    });
  });

  setConfirmHandler((command, cwd) =>
    requestTelegramConfirmation(bot, getOwnerChatId, command, cwd)
  );
}
