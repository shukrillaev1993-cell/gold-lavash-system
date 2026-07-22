import { BrowserWindow, Notification } from "electron";
import { getReminders, markReminderNotified } from "./store";

const CHECK_INTERVAL_MS = 30_000;

let mainWindow: BrowserWindow | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

export function registerMainWindow(win: BrowserWindow): void {
  mainWindow = win;
}

function checkReminders(): void {
  const now = Date.now();
  for (const reminder of getReminders()) {
    if (reminder.notified) continue;
    if (new Date(reminder.dueAt).getTime() > now) continue;

    markReminderNotified(reminder.id);

    if (Notification.isSupported()) {
      new Notification({
        title: "Jarvis — напоминание",
        body: reminder.text,
      }).show();
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("reminder:due", reminder);
    }
  }
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
