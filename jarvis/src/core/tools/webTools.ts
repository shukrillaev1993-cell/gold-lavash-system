import { z } from "zod";
import type { LocalToolDef } from "./definitions";

const MAX_RESULTS = 5;
const MAX_FETCH_CHARS = 4000;

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Только для Ollama-режима: у Anthropic для этого есть встроенные server-side web_search/web_fetch. */
export const webSearchDef: LocalToolDef<z.ZodObject<{ query: z.ZodString }>> = {
  name: "web_search",
  description: "Ищет информацию в интернете (через DuckDuckGo) и возвращает список результатов с заголовками, ссылками и краткими описаниями.",
  schema: z.object({
    query: z.string().describe("Поисковый запрос"),
  }),
  run: async ({ query }) => {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) JarvisAssistant/1.0" },
    });
    if (!res.ok) return `Ошибка поиска: HTTP ${res.status}`;
    const html = await res.text();

    const results: { title: string; url: string; snippet: string }[] = [];
    const linkRe = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    const snippetRe = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    const links: { href: string; title: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = linkRe.exec(html)) && links.length < MAX_RESULTS) {
      links.push({ href: m[1], title: stripHtml(m[2]) });
    }
    const snippets: string[] = [];
    while ((m = snippetRe.exec(html)) && snippets.length < MAX_RESULTS) {
      snippets.push(stripHtml(m[1]));
    }
    for (let i = 0; i < links.length; i++) {
      results.push({ title: links[i].title, url: links[i].href, snippet: snippets[i] || "" });
    }

    if (results.length === 0) return `По запросу "${query}" ничего не найдено.`;
    return results
      .map((r, i) => `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.snippet}`)
      .join("\n\n");
  },
};

export const webFetchDef: LocalToolDef<z.ZodObject<{ url: z.ZodString }>> = {
  name: "web_fetch",
  description: "Загружает страницу по URL и возвращает её текстовое содержимое (без HTML-разметки, обрезано до нескольких тысяч символов).",
  schema: z.object({
    url: z.string().describe("Полный URL страницы, включая https://"),
  }),
  run: async ({ url }) => {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) JarvisAssistant/1.0" },
    });
    if (!res.ok) return `Ошибка загрузки: HTTP ${res.status}`;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text") && !contentType.includes("html")) {
      return `Содержимое типа "${contentType}" не поддерживается для чтения.`;
    }
    const html = await res.text();
    const text = stripHtml(html);
    return text.length > MAX_FETCH_CHARS
      ? text.slice(0, MAX_FETCH_CHARS) + "…(обрезано)"
      : text;
  },
};

export const webToolDefs: LocalToolDef[] = [webSearchDef, webFetchDef];
