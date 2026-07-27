import * as path from "path";
import * as os from "os";

/**
 * Директория userData — та же, что вернул бы Electron через app.getPath('userData')
 * (на Windows: %APPDATA%\jarvis, имя приложения не переопределяется). Вычисляется
 * вручную, без обращения к модулю "electron", чтобы одинаково работать и в
 * Electron-процессе (десктоп), и в обычном Node-процессе (Telegram-бот) — оба
 * должны указывать на один и тот же каталог.
 */
export function getUserDataDir(): string {
  const appDataDir = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
  return path.join(appDataDir, "jarvis");
}
