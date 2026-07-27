import { z } from "zod";
import type { LocalToolDef } from "./definitions";
import { getSettings } from "../store";

const DEFAULT_MAX_ROWS = 200;

// Данные продаж Gold Lavash читаются не напрямую (нет своего сервис-аккаунта у локального
// Jarvis), а через уже настроенный и проверенный облачный резерв (jarvis-cloud, Apps Script) —
// он читает таблицы от имени владельца скрипта, без отдельной настройки доступа. Блок-лист
// защищённых листов ("Пользователи" и т.п.) применяется на стороне Code.js.
async function callCloudSheets(params: Record<string, string>): Promise<string> {
  const { cloudBotUrl, cloudHeartbeatSecret } = getSettings();
  if (!cloudBotUrl || !cloudHeartbeatSecret) {
    return "Доступ к данным продаж не настроен: в настройках Jarvis не заданы URL облачного резерва и секрет.";
  }
  const url = new URL(cloudBotUrl);
  url.searchParams.set("action", "sheets");
  url.searchParams.set("secret", cloudHeartbeatSecret);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const res = await fetch(url.toString());
  return (await res.text()).trim();
}

export const listSalesSheetsDef: LocalToolDef<z.ZodObject<Record<string, never>>> = {
  name: "list_sales_sheets",
  description:
    "Возвращает список вкладок (листов) Google-таблицы системы учёта Gold Lavash, доступных для чтения. " +
    "Вызывай перед read_sales_sheet, чтобы узнать точные названия листов.",
  schema: z.object({}),
  run: async () => {
    try {
      return await callCloudSheets({ op: "list" });
    } catch (err) {
      return `Ошибка доступа к данным продаж: ${err instanceof Error ? err.message : String(err)}`;
    }
  },
};

export const readSalesSheetDef: LocalToolDef<
  z.ZodObject<{ sheetName: z.ZodString; maxRows: z.ZodOptional<z.ZodNumber> }>
> = {
  name: "read_sales_sheet",
  description:
    "Читает данные с указанного листа Google-таблицы системы учёта Gold Lavash " +
    "(заказы, отправки, возвраты, цены, логистика, поступления и т.п.). " +
    "Сначала вызови list_sales_sheets, чтобы узнать точные названия листов. " +
    `По умолчанию возвращает последние ${DEFAULT_MAX_ROWS} строк (+ заголовок) — самые свежие данные; ` +
    "для более старых данных запроси больший maxRows.",
  schema: z.object({
    sheetName: z.string().describe("Точное название листа (вкладки) таблицы"),
    maxRows: z
      .number()
      .optional()
      .describe(`Сколько последних строк вернуть (по умолчанию ${DEFAULT_MAX_ROWS})`),
  }),
  run: async ({ sheetName, maxRows }) => {
    try {
      const params: Record<string, string> = { op: "read", sheetName };
      if (maxRows) params.maxRows = String(maxRows);
      return await callCloudSheets(params);
    } catch (err) {
      return `Ошибка чтения листа "${sheetName}": ${err instanceof Error ? err.message : String(err)}`;
    }
  },
};

export const salesSheetDefs: LocalToolDef[] = [listSalesSheetsDef, readSalesSheetDef];
