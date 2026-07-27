import { Bot } from "grammy";
import { checkDueReminders } from "../core/reminderCheck";

const CHECK_INTERVAL_MS = 30_000;

export function startTelegramReminders(bot: Bot, getOwnerChatId: () => string): () => void {
  const timer = setInterval(() => {
    const ownerChatId = getOwnerChatId();
    if (!ownerChatId) return;
    checkDueReminders((reminder) => {
      bot.api.sendMessage(ownerChatId, `⏰ Напоминание: ${reminder.text}`).catch(() => {});
    });
  }, CHECK_INTERVAL_MS);

  return () => clearInterval(timer);
}
