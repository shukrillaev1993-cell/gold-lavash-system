import { BrowserWindow } from "electron";

interface PendingConfirmation {
  resolve: (approved: boolean) => void;
}

const pending = new Map<string, PendingConfirmation>();

let mainWindow: BrowserWindow | null = null;

export function registerMainWindow(win: BrowserWindow): void {
  mainWindow = win;
}

export function resolveConfirmation(requestId: string, approved: boolean): void {
  const entry = pending.get(requestId);
  if (!entry) return;
  pending.delete(requestId);
  entry.resolve(approved);
}

export function requestConfirmationElectron(command: string, cwd?: string): Promise<boolean> {
  return new Promise((resolve) => {
    const requestId = `confirm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    pending.set(requestId, { resolve });

    if (!mainWindow || mainWindow.isDestroyed()) {
      // Нет открытого окна — безопасный дефолт: отклонить
      pending.delete(requestId);
      resolve(false);
      return;
    }

    mainWindow.webContents.send("tool:confirm-request", { requestId, command, cwd });

    // Не оставляем запрос висеть вечно, если пользователь не отреагировал
    setTimeout(() => {
      if (pending.has(requestId)) {
        pending.delete(requestId);
        resolve(false);
      }
    }, 5 * 60 * 1000);
  });
}
