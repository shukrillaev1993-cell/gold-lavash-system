import { execFile } from "child_process";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";

/**
 * Синтезирует речь через встроенный в Windows System.Speech (SAPI) и возвращает WAV-буфер.
 * Текст передаётся через файл, а не через аргументы командной строки/PowerShell-скрипт —
 * это исключает любые проблемы с экранированием/инъекцией символов из текста, сгенерированного LLM.
 */
export async function synthesizeSpeechToWav(text: string): Promise<Buffer> {
  const id = `jarvis-tts-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const tmpDir = os.tmpdir();
  const textFile = path.join(tmpDir, `${id}.txt`);
  const wavFile = path.join(tmpDir, `${id}.wav`);
  const scriptFile = path.join(tmpDir, `${id}.ps1`);

  const escapedTextPath = textFile.replace(/'/g, "''");
  const escapedWavPath = wavFile.replace(/'/g, "''");

  const script = [
    "Add-Type -AssemblyName System.Speech",
    "$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer",
    "try {",
    "  $ruVoice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -like 'ru*' } | Select-Object -First 1",
    "  if ($ruVoice) { $synth.SelectVoice($ruVoice.VoiceInfo.Name) }",
    "} catch {}",
    `$text = Get-Content -LiteralPath '${escapedTextPath}' -Raw -Encoding UTF8`,
    `$synth.SetOutputToWaveFile('${escapedWavPath}')`,
    "$synth.Speak($text)",
    "$synth.Dispose()",
  ].join("\r\n");

  await fs.writeFile(textFile, text, "utf8");
  await fs.writeFile(scriptFile, script, "utf8");

  try {
    await new Promise<void>((resolve, reject) => {
      execFile(
        "powershell.exe",
        ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", scriptFile],
        { timeout: 30_000 },
        (error) => (error ? reject(error) : resolve())
      );
    });
    return await fs.readFile(wavFile);
  } finally {
    await Promise.all([
      fs.unlink(textFile).catch(() => {}),
      fs.unlink(wavFile).catch(() => {}),
      fs.unlink(scriptFile).catch(() => {}),
    ]);
  }
}
