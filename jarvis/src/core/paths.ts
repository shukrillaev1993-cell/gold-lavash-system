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
  const platform = process.platform;
  const homedir = os.homedir();

  if (platform === "win32") {
    const appDataDir = process.env.APPDATA || path.join(homedir, "AppData", "Roaming");
    return path.join(appDataDir, "jarvis");
  }

  if (platform === "darwin") {
    return path.join(homedir, "Library", "Application Support", "jarvis");
  }

  // Linux и другие платформы (Render, Hugging Face Spaces и т.д.)
  const configHome = process.env.XDG_CONFIG_HOME || path.join(homedir, ".config");
  return path.join(configHome, "jarvis");
}
