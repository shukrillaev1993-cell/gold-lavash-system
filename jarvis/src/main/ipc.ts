import { ipcMain, BrowserWindow } from "electron";
import { sendUserMessage, isConfigured } from "../core/chat";
import { getSettings, setSettings, getHistory, getReminders, type Settings } from "../core/store";
import { resolveConfirmation } from "../core/confirmationBroker";
import { transcribe, isVoiceModelReady } from "../core/voice";

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
  ipcMain.handle("settings:save", (_event, settings: Partial<Settings>) => {
    setSettings(settings);
    return getSettings();
  });
  ipcMain.handle("settings:has-key", () => isConfigured());

  ipcMain.handle("history:get", () => getHistory());
  ipcMain.handle("reminders:get", () => getReminders());

  ipcMain.handle("voice:transcribe", async (_event, audioData: Float32Array) => {
    try {
      const modelWasReady = isVoiceModelReady();
      const text = await transcribe(audioData);
      return { ok: true as const, text, firstRun: !modelWasReady };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
    }
  });
}
