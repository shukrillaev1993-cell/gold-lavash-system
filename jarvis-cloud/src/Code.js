/**
 * Jarvis Cloud — облачный резерв личного ассистента Jarvis.
 * Отвечает в Telegram, пока локальный Jarvis (на ПК пользователя) не запущен.
 * Независим от sales_project — не трогает и не использует его код, только читает
 * ту же Google-таблицу Gold Lavash (только для чтения, тот же блок-лист листов).
 *
 * Настройка (Project Settings → Script Properties) выполняется одним вызовом
 * GET /exec?action=setup&tgToken=...&anthropicKey=...&heartbeatSecret=...&spreadsheetId=...
 * (см. handleSetup_) — сам вызывается один раз сразу после деплоя, дальше самоблокируется.
 * Значения:
 *   TG_TOKEN              — токен Telegram-бота Jarvis (от @BotFather)
 *   ANTHROPIC_API_KEY      — тот же ключ, что в десктопном Jarvis
 *   HEARTBEAT_SECRET       — произвольная строка, та же, что в настройках Jarvis
 *   SALES_SPREADSHEET_ID   — ID Google-таблицы Gold Lavash (из её URL)
 *   MODEL                  — опционально, по умолчанию claude-haiku-4-5
 *   OWNER_CHAT_ID           — заполняется автоматически после первого сообщения владельца
 *
 * Приём сообщений — НЕ через Telegram-webhook (реальная доставка не следует за 302,
 * который Apps Script всегда отдаёт первым хопом — см. комментарий у doPost), а через
 * pollIfLocalDown_(): time-driven триггер раз в минуту, который опрашивает Telegram
 * (getUpdates) САМ, но только если heartbeat от локального бота устарел (> HEARTBEAT_STALE_MS_).
 * Триггер устанавливается автоматически внутри handleSetup_.
 */

var BLOCKED_SHEETS_ = ["Пользователи", "Запросы доступа"];
var DEFAULT_MAX_ROWS_ = 200;
var MAX_OUTPUT_CHARS_ = 20000;
var MAX_HISTORY_MESSAGES_ = 10;
var HEARTBEAT_STALE_MS_ = 7 * 60 * 1000;

// Историческая база продаж до 04.07.2026 — отдельная таблица (тот же ID, что захардкожен
// в sales_project/src/Код.js как SALES_HIST_ID).
var HISTORY_SPREADSHEET_ID_ = "1CjDna4ghwlGU7Xh80UiJiQIu7OPp7vxP29C6626ykzg";
var HISTORY_SHEET_NAME_ = "Конструктор отчетов";
var HISTORY_ALIAS_ = "История продаж (до 04.07.2026, отдельная таблица)";

var TOOLS_ = [
  {
    name: "list_sales_sheets",
    description:
      "Возвращает список вкладок (листов) Google-таблицы системы учёта Gold Lavash, доступных для чтения.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "read_sales_sheet",
    description:
      "Читает данные с указанного листа Google-таблицы Gold Lavash (заказы, отправки, возвраты, цены, логистика, поступления). " +
      "Сначала вызови list_sales_sheets. По умолчанию возвращает последние " +
      DEFAULT_MAX_ROWS_ +
      " строк.",
    input_schema: {
      type: "object",
      properties: {
        sheetName: { type: "string", description: "Точное название листа (вкладки) таблицы" },
        maxRows: { type: "number", description: "Сколько последних строк вернуть" },
      },
      required: ["sheetName"],
    },
  },
];

var SYSTEM_PROMPT_ =
  "Ты — Jarvis, персональный AI-ассистент пользователя. Сейчас ты работаешь в ОБЛАЧНОМ РЕЗЕРВНОМ РЕЖИМЕ " +
  "(через Google Apps Script), потому что компьютер пользователя выключен или локальный Jarvis не запущен.\n\n" +
  "В этом режиме тебе НЕДОСТУПНЫ: выполнение команд на компьютере (run_command), голосовой ввод/вывод, локальная модель Ollama. " +
  "Если пользователь просит это — вежливо объясни, что это заработает, когда он включит ПК и запустит Jarvis локально. " +
  "Не пытайся притвориться, что выполнил такую просьбу.\n\n" +
  "Доступны: обычный текстовый чат и инструменты list_sales_sheets/read_sales_sheet — данные системы учёта продаж Gold Lavash " +
  "(заказы, отправки, возвраты, цены, логистика, поступления). Используй их для финансового/маркетингового/статистического/" +
  "экономического анализа по запросу пользователя.\n\n" +
  "Отвечай на языке, на котором пишет пользователь. Будь кратким и по делу.";

// ---------- Разовая настройка через браузер (self-locking) ----------

/**
 * Вызывается один раз сразу после деплоя: /exec?action=setup&tgToken=...&anthropicKey=...&
 * heartbeatSecret=...&spreadsheetId=...&model=... — записывает Script Properties и сразу
 * ставит вебхук + триггер. После первого успешного вызова блокируется навсегда (SETUP_DONE),
 * чтобы никто посторонний, узнав /exec URL, не мог подменить токен/ключ.
 */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === "setup") return handleSetup_(p);
  if (p.action === "migrate") return handleMigrate_(p);
  if (p.action === "sheets") return handleSheets_(p);
  if (p.action === "heartbeat") return handleHeartbeat_(e);
  if (p.action === "goodbye") return handleGoodbye_(e);
  return ContentService.createTextOutput("Jarvis Cloud is running.");
}

/** Позволяет ЛОКАЛЬНОМУ Jarvis читать данные Gold Lavash через уже настроенный здесь доступ
 *  (без отдельного сервис-аккаунта на стороне десктопа/бота). Защищено тем же HEARTBEAT_SECRET. */
function handleSheets_(p) {
  var secret = PropertiesService.getScriptProperties().getProperty("HEARTBEAT_SECRET");
  if (!secret || p.secret !== secret) return ContentService.createTextOutput("forbidden");
  if (p.op === "list") return ContentService.createTextOutput(listSalesSheets_());
  if (p.op === "read") {
    var maxRows = p.maxRows ? Number(p.maxRows) : undefined;
    return ContentService.createTextOutput(readSalesSheet_(p.sheetName, maxRows));
  }
  return ContentService.createTextOutput("unknown op");
}

/** Разовая миграция для проектов, где setup уже был выполнен под старую (webhook-based)
 *  схему: снимает вебхук и ставит poll-триггер. Защищена тем же HEARTBEAT_SECRET. */
function handleMigrate_(p) {
  var secret = PropertiesService.getScriptProperties().getProperty("HEARTBEAT_SECRET");
  if (!secret || p.secret !== secret) return ContentService.createTextOutput("forbidden");
  tgApi_("deleteWebhook", { drop_pending_updates: true });
  setupPollTrigger();
  return ContentService.createTextOutput("Migrated to poll mode.");
}

function handleSetup_(p) {
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty("SETUP_DONE") === "1") {
    return ContentService.createTextOutput("Setup already completed — this endpoint is now locked.");
  }
  var required = ["tgToken", "anthropicKey", "heartbeatSecret", "spreadsheetId"];
  for (var i = 0; i < required.length; i++) {
    if (!p[required[i]]) {
      return ContentService.createTextOutput("Missing required param: " + required[i]);
    }
  }
  props.setProperty("TG_TOKEN", p.tgToken);
  props.setProperty("ANTHROPIC_API_KEY", p.anthropicKey);
  props.setProperty("HEARTBEAT_SECRET", p.heartbeatSecret);
  props.setProperty("SALES_SPREADSHEET_ID", p.spreadsheetId);
  if (p.model) props.setProperty("MODEL", p.model);
  props.setProperty("SETUP_DONE", "1");
  // Считаем, что локальный бот только что был активен — не даём поллеру сразу же
  // забрать управление до того, как локальный бот пришлёт свой первый heartbeat.
  props.setProperty("LAST_HEARTBEAT", String(Date.now()));

  tgApi_("deleteWebhook", { drop_pending_updates: true });
  setupPollTrigger();

  return ContentService.createTextOutput("Setup complete. Poll trigger installed, webhook cleared.");
}

// ---------- Heartbeat от локального бота (единственный сигнал "кто сейчас главный") ----------
//
// Telegram-webhook НЕ используется: реальная доставка webhook от Telegram не следует за
// редиректом 302, который Apps Script всегда отдаёт на первом хопе (script.google.com →
// script.googleusercontent.com) — подтверждено вживую через getWebhookInfo (растущий
// pending_update_count + "Wrong response from the webhook: 302 Found"), причём то же самое
// воспроизводится и на уже существующем /exec URL sales_project. Поэтому вместо push-вебхука
// используется pull-опрос по таймеру (pollIfLocalDown_), включающийся только когда локальный
// бот, судя по heartbeat, не работает.

function doPost(e) {
  try {
    var action = e && e.parameter && e.parameter.action;
    if (action === "heartbeat") return handleHeartbeat_(e);
    if (action === "goodbye") return handleGoodbye_(e);
  } catch (err) {
    Logger.log("doPost error: " + err);
  }
  return ContentService.createTextOutput("ok");
}

function handleHeartbeat_(e) {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty("HEARTBEAT_SECRET");
  var param = (e && e.parameter) || {};
  if (secret && param.secret === secret) {
    props.setProperty("LAST_HEARTBEAT", String(Date.now()));
    if (param.ownerChatId) {
      props.setProperty("OWNER_CHAT_ID", String(param.ownerChatId));
    }
  }
  return ContentService.createTextOutput("ok");
}

/** Локальный бот вызывает это при штатном завершении — ускоряет переход на облако
 *  вместо ожидания полного HEARTBEAT_STALE_MS_. */
function handleGoodbye_(e) {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty("HEARTBEAT_SECRET");
  var param = (e && e.parameter) || {};
  if (secret && param.secret === secret) {
    props.setProperty("LAST_HEARTBEAT", "0");
  }
  return ContentService.createTextOutput("ok");
}

function isDuplicateUpdate_(updateId) {
  var cache = CacheService.getScriptCache();
  var key = "upd_" + updateId;
  if (cache.get(key)) return true;
  cache.put(key, "1", 21600); // 6 часов
  return false;
}

function handleTelegramMessage_(message) {
  var chatId = message.chat.id;
  if (message.voice || message.audio) {
    tgApi_("sendMessage", {
      chat_id: chatId,
      text: "Голосовые сообщения работают только когда включён и запущен локальный Jarvis на ПК. Пока напишите текстом, пожалуйста.",
    });
    return;
  }
  var text = message.text;
  if (!text) return;
  handleMessage_(chatId, text);
}

function handleMessage_(chatId, text) {
  var props = PropertiesService.getScriptProperties();
  var ownerChatId = props.getProperty("OWNER_CHAT_ID") || "";

  if (!ownerChatId) {
    tgApi_("sendMessage", {
      chat_id: chatId,
      text:
        "Ваш chat ID: " +
        chatId +
        '\n\nВпишите его в настройках Jarvis (десктопное приложение) в поле "Chat ID владельца" и сохраните, чтобы разрешить доступ.',
    });
    return;
  }
  if (String(chatId) !== String(ownerChatId)) {
    tgApi_("sendMessage", { chat_id: chatId, text: "Этот бот приватный." });
    return;
  }

  var history = loadHistory_();
  history.push({ role: "user", content: text });
  var reply = runClaudeLoop_(history);
  history.push({ role: "assistant", content: reply });
  saveHistory_(history);

  sendLongMessage_(chatId, reply);
}

function sendLongMessage_(chatId, text) {
  var MAX_LEN = 3500;
  var body = text || "(пустой ответ)";
  for (var i = 0; i < body.length; i += MAX_LEN) {
    tgApi_("sendMessage", { chat_id: chatId, text: body.substring(i, i + MAX_LEN) });
  }
}

function tgApi_(method, payload) {
  var token = PropertiesService.getScriptProperties().getProperty("TG_TOKEN");
  var res = UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/" + method, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload || {}),
    muteHttpExceptions: true,
  });
  try {
    return JSON.parse(res.getContentText());
  } catch (e) {
    return { ok: false, raw: res.getContentText() };
  }
}

// ---------- История чата (короткая, скользящая) ----------

function loadHistory_() {
  var raw = PropertiesService.getScriptProperties().getProperty("CHAT_HISTORY");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveHistory_(history) {
  var trimmed =
    history.length > MAX_HISTORY_MESSAGES_ ? history.slice(history.length - MAX_HISTORY_MESSAGES_) : history;
  PropertiesService.getScriptProperties().setProperty("CHAT_HISTORY", JSON.stringify(trimmed));
}

// ---------- Claude API (raw HTTP через UrlFetchApp — в Apps Script нет npm/SDK) ----------

function callClaudeApi_(messages) {
  var props = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return { content: [{ type: "text", text: "Не задан ANTHROPIC_API_KEY в свойствах скрипта." }], stop_reason: "end_turn" };
  }
  var payload = {
    model: props.getProperty("MODEL") || "claude-3-5-haiku-20241022",
    max_tokens: 2048,
    system: SYSTEM_PROMPT_,
    tools: TOOLS_,
    messages: messages,
  };
  var res = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", {
    method: "post",
    contentType: "application/json",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  var code = res.getResponseCode();
  var body;
  try {
    body = JSON.parse(res.getContentText());
  } catch (e) {
    return { content: [{ type: "text", text: "Некорректный ответ Claude API." }], stop_reason: "end_turn" };
  }
  if (code !== 200) {
    var msg = (body.error && body.error.message) || res.getContentText();
    Logger.log("Claude API error " + code + ": " + msg);
    return { content: [{ type: "text", text: "Ошибка Claude API (" + code + "): " + msg }], stop_reason: "end_turn" };
  }
  return body;
}

function runClaudeLoop_(messages) {
  var MAX_ITERATIONS = 6;
  for (var i = 0; i < MAX_ITERATIONS; i++) {
    var resp = callClaudeApi_(messages);
    if (!resp || !resp.content) return "Ошибка обращения к Claude API.";

    if (resp.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: resp.content });
      var toolResults = [];
      for (var j = 0; j < resp.content.length; j++) {
        var block = resp.content[j];
        if (block.type === "tool_use") {
          var result = executeTool_(block.name, block.input || {});
          toolResults.push({ type: "tool_result", tool_use_id: block.id, content: String(result) });
        }
      }
      messages.push({ role: "user", content: toolResults });
      continue;
    }

    var textParts = [];
    for (var k = 0; k < resp.content.length; k++) {
      if (resp.content[k].type === "text") textParts.push(resp.content[k].text);
    }
    return textParts.join("\n") || "(пустой ответ)";
  }
  return "Превышен лимит шагов обработки — попробуйте переформулировать запрос.";
}

function executeTool_(name, input) {
  if (name === "list_sales_sheets") return listSalesSheets_();
  if (name === "read_sales_sheet") return readSalesSheet_(input.sheetName, input.maxRows);
  return "Неизвестный инструмент: " + name;
}

// ---------- Данные Gold Lavash (только чтение, тот же блок-лист, что в локальном Jarvis) ----------

function isBlockedSheet_(name) {
  var lower = String(name).trim().toLowerCase();
  for (var i = 0; i < BLOCKED_SHEETS_.length; i++) {
    if (BLOCKED_SHEETS_[i].toLowerCase() === lower) return true;
  }
  return false;
}

function getSalesSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty("SALES_SPREADSHEET_ID");
  if (!id) throw new Error("Не задан SALES_SPREADSHEET_ID в свойствах скрипта.");
  return SpreadsheetApp.openById(id);
}

function listSalesSheets_() {
  try {
    var sheets = getSalesSpreadsheet_().getSheets();
    var names = [];
    for (var i = 0; i < sheets.length; i++) {
      var name = sheets[i].getName();
      if (!isBlockedSheet_(name)) names.push(name);
    }
    names.push(HISTORY_ALIAS_);
    if (names.length === 0) return "Нет доступных листов (проверьте SALES_SPREADSHEET_ID и права доступа).";
    return names
      .map(function (n) {
        return "- " + n;
      })
      .join("\n");
  } catch (e) {
    return "Ошибка доступа к таблице: " + e.message;
  }
}

function readSalesSheet_(sheetName, maxRows) {
  if (isBlockedSheet_(sheetName)) {
    return 'Доступ к листу "' + sheetName + '" запрещён (содержит служебные/чувствительные данные).';
  }
  var isHistory = String(sheetName).trim().toLowerCase() === HISTORY_ALIAS_.toLowerCase();
  try {
    var sheet = isHistory
      ? SpreadsheetApp.openById(HISTORY_SPREADSHEET_ID_).getSheetByName(HISTORY_SHEET_NAME_)
      : getSalesSpreadsheet_().getSheetByName(sheetName);
    if (!sheet) return 'Лист "' + sheetName + '" не найден.';
    var values = sheet.getDataRange().getValues();
    if (values.length === 0) return "(лист пуст)";

    var header = values[0];
    var data = values.slice(1);
    var limit = maxRows || DEFAULT_MAX_ROWS_;
    var tail = data.length > limit ? data.slice(data.length - limit) : data;

    var lines = [header.join(" | ")];
    for (var i = 0; i < tail.length; i++) lines.push(tail[i].join(" | "));
    var text = lines.join("\n");
    if (data.length > limit) {
      text = "(показаны последние " + tail.length + " из " + data.length + " строк)\n" + text;
    }
    if (text.length > MAX_OUTPUT_CHARS_) {
      text = text.substring(0, MAX_OUTPUT_CHARS_) + "\n…(обрезано, слишком много данных)";
    }
    return text;
  } catch (e) {
    return 'Ошибка чтения листа "' + sheetName + '": ' + e.message;
  }
}

// ---------- Приём сообщений: опрос Telegram по таймеру, только пока локальный бот молчит ----------

var TG_UPDATE_OFFSET_PROP_ = "TG_UPDATE_OFFSET";

/** Time-driven триггер каждую минуту. Если heartbeat свежий — локальный бот жив и сам
 *  держит long polling, ничего не делаем (иначе будет конфликт 409 на getUpdates). */
function pollIfLocalDown_() {
  var props = PropertiesService.getScriptProperties();
  var lastHeartbeat = Number(props.getProperty("LAST_HEARTBEAT") || "0");
  if (Date.now() - lastHeartbeat < HEARTBEAT_STALE_MS_) return;

  var offset = Number(props.getProperty(TG_UPDATE_OFFSET_PROP_) || "0");
  var result = tgApi_("getUpdates", { offset: offset, timeout: 0, allowed_updates: ["message"] });
  if (!result || !result.ok || !result.result || !result.result.length) return;

  var updates = result.result;
  for (var i = 0; i < updates.length; i++) {
    var u = updates[i];
    offset = u.update_id + 1;
    if (!isDuplicateUpdate_(u.update_id) && u.message) {
      handleTelegramMessage_(u.message);
    }
  }
  props.setProperty(TG_UPDATE_OFFSET_PROP_, String(offset));
}

/** Вызвать один раз вручную из редактора Apps Script (или через setup-эндпоинт), чтобы создать
 *  time-driven триггер опроса. */
function setupPollTrigger() {
  // Удаляем ВСЕ триггеры проекта (а не только одноимённые) — иначе триггеры от старых версий
  // кода (например, снятый webhook-механизм reclaimWebhookIfStale) остаются висеть и продолжают
  // сами себя вызывать, воюя за вебхук/офсет с новым кодом. У этого проекта нет других задач,
  // кроме единственного poll-триггера, так что полная очистка безопасна.
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  ScriptApp.newTrigger("pollIfLocalDown_").timeBased().everyMinutes(1).create();
  Logger.log("Триггер установлен: pollIfLocalDown_ каждую минуту (старые триггеры удалены).");
}
