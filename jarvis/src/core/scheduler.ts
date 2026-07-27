import { BrowserWindow, Notification } from "electron";
import { checkDueReminders } from "./reminderCheck";

const CHECK_INTERVAL_MS = 30_000;

let mainWindow: BrowserWindow | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

export function registerMainWindow(win: BrowserWindow): void {
  mainWindow = win;
}

function checkReminders(): void {
  checkDueReminders((reminder) => {
    if (Notification.isSupported()) {
      new Notification({
        title: "Jarvis — напоминание",
        body: reminder.text,
      }).show();
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("reminder:due", reminder);
    }
  });
}

export function startScheduler(): void {
  if (timer) return;
  timer = setInterval(checkReminders, CHECK_INTERVAL_MS);
  checkReminders();
}

export function stopScheduler(): void {
  if (timer) clearInterval(timer);
  timer = null;
}
