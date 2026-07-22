import { exec } from "child_process";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { requestConfirmation } from "../confirmationBroker";

const TIMEOUT_MS = 30_000;
const MAX_BUFFER = 1024 * 1024; // 1 MB

function execWithTimeout(command: string, cwd?: string): Promise<{ code: number; stdout: string; stderr: string }> {
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

export const runCommandTool = betaZodTool({
  name: "run_command",
  description:
    "Выполняет команду в системной оболочке (Windows PowerShell/cmd) на компьютере пользователя. " +
    "ВСЕГДА требует явного подтверждения пользователя перед выполнением — пользователь увидит точный текст команды и должен нажать 'Выполнить'. " +
    "Используй это для запуска программ, работы с файлами, диагностики системы и т.п. Не используй для действий, которые можно выполнить другим инструментом.",
  inputSchema: z.object({
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
});
