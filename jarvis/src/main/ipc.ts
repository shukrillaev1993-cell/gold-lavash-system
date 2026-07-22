import { ipcMain, BrowserWindow } from "electron";
import { sendUserMessage, hasApiKey } from "../core/claude";
import { getSettings, setSettings, getHistory, getReminders } from "../core/store";
import { resolveConfirmation } from "../core/confirmationBroker";

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle("chat:send", async (_event, text: string) => {
    try {
      const fullText = await sendUserMessage(text, {
        onTextDelta: (chunk) => {
          if (!mainWindow.isDestroyed()) mainWindow.webContents.send("chat:delta", chunk);
        },
        onToolUse: (name) => {
          if (!mainWindow.isDestroyed()) mainWindow.webContents.send("chat:tool-use", name);
        },
      });
      return { ok: true as const, text: fullText };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
    }
  });

  ipcMain.on(
    "tool:confirm-response",
    (_event, payload: { requestId: string; approved: boolean }) => {
      resolveConfirmation(payload.requestId, payload.approved);
    }
  );

  ipcMain.handle("settings:get", () => getSettings());
  ipcMain.handle("settings:save", (_event, settings: { apiKey?: string; model?: string }) => {
    setSettings(settings);
    return getSettings();
  });
  ipcMain.handle("settings:has-key", () => hasApiKey());

  ipcMain.handle("history:get", () => getHistory());
  ipcMain.handle("reminders:get", () => getReminders());
}
