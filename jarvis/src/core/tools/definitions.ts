import { exec } from "child_process";
import { z } from "zod";
import { requestConfirmation } from "../confirmation";
import { addReminder, cancelReminder, getReminders } from "../store";
import { salesSheetDefs } from "./salesSheet";

export interface LocalToolDef<S extends z.ZodType = z.ZodType> {
  name: string;
  description: string;
  schema: S;
  run: (args: z.infer<S>) => Promise<string>;
}

const TIMEOUT_MS = 30_000;
const MAX_BUFFER = 1024 * 1024; // 1 MB

function execWithTimeout(
  command: string,
  cwd?: string
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    exec(
      command,
      { cwd, timeout: TIMEOUT_MS, maxBuffer: MAX_BUFFER, windowsHide: true },
      (error, stdout, stderr) => {
        resolve({
          code: error && typeof error.code === "number" ? error.code : error ? 1 : 0,
          stdout: stdout.toString(),
          stderr: stderr.toString() + (error && !stderr ? String(error.message) : ""),
        });
      }
    );
  });
}

export const runCommandDef: LocalToolDef<
  z.ZodObject<{ command: z.ZodString; cwd: z.ZodOptional<z.ZodString> }>
> = {
  name: "run_command",
  description:
    "Выполняет команду в системной оболочке (Windows PowerShell/cmd) на компьютере пользователя. " +
    "ВСЕГДА требует явного подтверждения пользователя перед выполнением — пользователь увидит точный текст команды и должен нажать 'Выполнить'. " +
    "Используй это для запуска программ, работы с файлами, диагностики системы и т.п. Не используй для действий, которые можно выполнить другим инструментом.",
  schema: z.object({
    command: z.string().describe("Точная команда для выполнения в shell"),
    cwd: z.string().optional().describe("Рабочая директория (опционально)"),
  }),
  run: async ({ command, cwd }) => {
    const approved = await requestConfirmation(command, cwd);
    if (!approved) {
      return "Пользователь отклонил выполнение этой команды. Не пытайся выполнить её снова без явной новой просьбы пользователя.";
    }
    const { code, stdout, stderr } = await execWithTimeout(command, cwd);
    return `exit code: ${code}\nstdout:\n${stdout || "(пусто)"}\nstderr:\n${stderr || "(пусто)"}`;
  },
};

export const createReminderDef: LocalToolDef<
  z.ZodObject<{ text: z.ZodString; dueAt: z.ZodString }>
> = {
  name: "create_reminder",
  description:
    "Создаёт напоминание, которое сработает в указанное время (нативное уведомление). " +
    "Обязательно вычисли dueAt как АБСОЛЮТНУЮ дату-время в формате ISO 8601, отталкиваясь от текущей даты/времени, указанных в системном промпте. " +
    "Например, если сейчас 2026-07-21T10:00:00 и пользователь просит напомнить 'через 30 минут', dueAt должен быть 2026-07-21T10:30:00.",
  schema: z.object({
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
};

export const listRemindersDef: LocalToolDef<z.ZodObject<Record<string, never>>> = {
  name: "list_reminders",
  description: "Возвращает список всех активных напоминаний пользователя.",
  schema: z.object({}),
  run: async () => {
    const reminders = getReminders();
    if (reminders.length === 0) return "Активных напоминаний нет.";
    return reminders
      .map((r) => `- [${r.id}] ${r.text} — ${r.dueAt}${r.notified ? " (уже сработало)" : ""}`)
      .join("\n");
  },
};

export const cancelReminderDef: LocalToolDef<z.ZodObject<{ id: z.ZodString }>> = {
  name: "cancel_reminder",
  description: "Отменяет напоминание по его id (см. list_reminders).",
  schema: z.object({
    id: z.string().describe("id напоминания"),
  }),
  run: async ({ id }) => {
    const ok = cancelReminder(id);
    return ok ? `Напоминание ${id} отменено.` : `Напоминание с id ${id} не найдено.`;
  },
};

/** Общие для обоих провайдеров (Anthropic и Ollama) локальные инструменты — единый источник правды. */
export const localToolDefs: LocalToolDef[] = [
  runCommandDef,
  createReminderDef,
  listRemindersDef,
  cancelReminderDef,
  ...salesSheetDefs,
];
