import { getReminders, markReminderNotified, type Reminder } from "./store";

/** Без зависимости от Electron — переиспользуется десктоп-планировщиком и Telegram-ботом. */
export function checkDueReminders(onDue: (reminder: Reminder) => void): void {
  const now = Date.now();
  for (const reminder of getReminders()) {
    if (reminder.notified) continue;
    if (new Date(reminder.dueAt).getTime() > now) continue;

    markReminderNotified(reminder.id);
    onDue(reminder);
  }
}
