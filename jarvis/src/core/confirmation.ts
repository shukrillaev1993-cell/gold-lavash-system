export type ConfirmHandler = (command: string, cwd?: string) => Promise<boolean>;

// Безопасный дефолт: если ни один канал (Electron/Telegram) не зарегистрировал
// свой обработчик, любая команда автоматически отклоняется.
let handler: ConfirmHandler = async () => false;

export function setConfirmHandler(fn: ConfirmHandler): void {
  handler = fn;
}

export function requestConfirmation(command: string, cwd?: string): Promise<boolean> {
  return handler(command, cwd);
}
