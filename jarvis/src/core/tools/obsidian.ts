import { z } from "zod";
import { getSettings } from "../store";
import { type LocalToolDef } from "./definitions";

export const saveToObsidianDef: LocalToolDef<
  z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    folder: z.ZodOptional<z.ZodString>;
    append: z.ZodOptional<z.ZodBoolean>;
  }>
> = {
  name: "save_to_obsidian",
  description:
    "Сохраняет заметку (мысль, дело, отчет) в базу Obsidian (через API приватного репозитория GitHub). " +
    "Обязательно используй понятный и краткий заголовок title (он станет именем файла .md). " +
    "Если указан параметр append: true и заметка с таким именем уже существует, новый контент будет добавлен " +
    "в конец существующей заметки с новой строки. Если append: false или не указан — заметка перезапишется.",
  schema: z.object({
    title: z
      .string()
      .describe(
        "Название заметки (имя файла без расширения, например: 'Идеи по бизнесу' или '2026-07-27')"
      ),
    content: z.string().describe("Содержимое заметки в формате Markdown"),
    folder: z
      .string()
      .optional()
      .describe(
        "Папка в Obsidian, куда поместить файл (например: 'Inbox', 'Drafts', или 'Journal/2026'). Опционально."
      ),
    append: z
      .boolean()
      .optional()
      .describe(
        "Если true — дописать в конец файла. Если false или не указано — перезаписать файл. Опционально."
      ),
  }),
  run: async ({ title, content, folder, append }) => {
    const { githubToken, obsidianRepo, obsidianBranch } = getSettings();

    if (!githubToken) {
      return "Ошибка: Не настроен токен GitHub (переменная GITHUB_TOKEN). Настройте его на Render или в приложении.";
    }
    if (!obsidianRepo) {
      return "Ошибка: Не настроен репозиторий Obsidian (переменная OBSIDIAN_REPO, например: 'user/my-vault').";
    }

    // Формируем чистый путь к файлу
    let cleanTitle = title.trim();
    if (cleanTitle.toLowerCase().endsWith(".md")) {
      cleanTitle = cleanTitle.slice(0, -3);
    }

    let filePath = `${cleanTitle}.md`;
    if (folder) {
      const cleanFolder = folder.replace(/^\/+|\/+$/g, ""); // Убираем слэши по краям
      filePath = `${cleanFolder}/${cleanTitle}.md`;
    }

    const branch = obsidianBranch || "main";
    const [owner, repo] = obsidianRepo.split("/");
    if (!owner || !repo) {
      return `Ошибка: Некорректный формат OBSIDIAN_REPO ("${obsidianRepo}"). Должен быть в формате 'логин/репозиторий'.`;
    }

    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${branch}`;
    const headers: Record<string, string> = {
      Authorization: `token ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Jarvis-Assistant",
    };

    let existingSha: string | null = null;
    let finalContent = content;

    try {
      console.log(`[Obsidian] Проверяю наличие файла: ${filePath}...`);
      const getRes = await fetch(getUrl, { headers });
      if (getRes.status === 200) {
        const fileData = (await getRes.json()) as any;
        existingSha = fileData.sha;

        if (append) {
          // Если режим добавления, декодируем существующий файл и прибавляем новый текст
          const base64Content = fileData.content.replace(/\s/g, "");
          const decodedText = Buffer.from(base64Content, "base64").toString("utf-8");
          finalContent = `${decodedText}\n\n${content}`;
          console.log(`[Obsidian] Найдена существующая заметка. Будет произведено добавление текста.`);
        } else {
          console.log(`[Obsidian] Файл существует и будет перезаписан.`);
        }
      } else if (getRes.status !== 404) {
        const errText = await getRes.text().catch(() => "");
        return `Ошибка GitHub API при проверке файла (${getRes.status}): ${errText}`;
      }
    } catch (err) {
      return `Ошибка подключения к GitHub API при проверке: ${err instanceof Error ? err.message : String(err)}`;
    }

    // Сохраняем/обновляем файл через PUT
    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`;
    const putBody: any = {
      message: `Updated via Jarvis AI: ${cleanTitle}`,
      content: Buffer.from(finalContent, "utf-8").toString("base64"),
      branch,
    };
    if (existingSha) {
      putBody.sha = existingSha;
    }

    try {
      console.log(`[Obsidian] Сохраняю заметку на GitHub: ${filePath}...`);
      const putRes = await fetch(putUrl, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(putBody),
      });

      if (!putRes.ok) {
        const errText = await putRes.text().catch(() => "");
        return `Ошибка GitHub API при сохранении (${putRes.status}): ${errText}`;
      }

      const actionText = existingSha ? (append ? "дополнен" : "обновлен") : "создан";
      return `Успешно! Файл "${filePath}" в вашем Obsidian-репозитории на GitHub был ${actionText}.`;
    } catch (err) {
      return `Ошибка отправки коммита в GitHub: ${err instanceof Error ? err.message : String(err)}`;
    }
  },
};
