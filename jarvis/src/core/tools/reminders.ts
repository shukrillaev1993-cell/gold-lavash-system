import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { addReminder, cancelReminder, getReminders } from "../store";

export const createReminderTool = betaZodTool({
  name: "create_reminder",
  description:
    "Создаёт напоминание, которое сработает в указанное время (нативное уведомление). " +
    "Обязательно вычисли dueAt как АБСОЛЮТНУЮ дату-время в формате ISO 8601, отталкиваясь от текущей даты/времени, указанных в системном промпте. " +
    "Например, если сейчас 2026-07-21T10:00:00 и пользователь просит напомнить 'через 30 минут', dueAt должен быть 2026-07-21T10:30:00.",
  inputSchema: z.object({
    text: z.string().describe("Текст напоминания"),
    dueAt: z.string().describe("Абсолютное время срабатывания в формате ISO 8601"),
  }),
  run: async ({ text, dueAt }) => {
    const parsed = new Date(dueAt);
    if (Number.isNaN(parsed.getTime())) {
      return `Ошибка: dueAt "${dueAt}" не является корректной датой в формате ISO 8601.`;
    }
    const reminder = addReminder(text, parsed.toISOString());
    return `Напоминание создано (id: ${reminder.id}): "${text}" на ${parsed.toISOString()}.`;
  },
});

export const listRemindersTool = betaZodTool({
  name: "list_reminders",
  description: "Возвращает список всех активных напоминаний пользователя.",
  inputSchema: z.object({}),
  run: async () => {
    const reminders = getReminders();
    if (reminders.length === 0) return "Активных напоминаний нет.";
    return reminders
      .map((r) => `- [${r.id}] ${r.text} — ${r.dueAt}${r.notified ? " (уже сработало)" : ""}`)
      .join("\n");
  },
});

export const cancelReminderTool = betaZodTool({
  name: "cancel_reminder",
  description: "Отменяет напоминание по его id (см. list_reminders).",
  inputSchema: z.object({
    id: z.string().describe("id напоминания"),
  }),
  run: async ({ id }) => {
    const ok = cancelReminder(id);
    return ok ? `Напоминание ${id} отменено.` : `Напоминание с id ${id} не найдено.`;
  },
});
