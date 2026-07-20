// ============================================================
// GOLD LAVASH — PRODUCTION MODULE (Этап 2)
// Смены, перекличка, закрытие смены бригадиром
// ============================================================

const PROD_DB_NAME = 'GL_Production';

// Статусы смены
const SHIFT_STATUS = {
  OPEN:   'Открыта',
  CLOSED: 'Закрыта'
};

// ─── Коды должности в смене ────────────────────────────────
// Базовые коды — доступны на всех линиях
const POSITION_CODES_BASE = [
  {code: 'о',  label: 'Оператор'},
  {code: 'х',  label: 'Тестодел'},
  {code: 'у',  label: 'Упаковщица'},
  {code: 'ст', label: 'Стажёр'}
];
// Доп. коды — только для Линии №3
const POSITION_CODES_LINE3_EXTRA = [
  {code: 'по', label: 'Пом. оператора'},
  {code: 'пх', label: 'Пом. тестодела'},
  {code: 'бу', label: 'Гл. упаковщица'}
];

function getAvailablePositionCodes(liniya) {
  var num = extractLineNum(liniya);
  if (num === '3') {
    return POSITION_CODES_BASE.concat(POSITION_CODES_LINE3_EXTRA);
  }
  return POSITION_CODES_BASE;
}

function extractLineNum(str) {
  if (!str) return null;
  var m = str.toString().match(/(\d+)/);
  return m ? m[1] : null;
}

function isValidPositionCode(code, liniya) {
  var available = getAvailablePositionCodes(liniya);
  return available.some(function(c) { return c.code === code; });
}

// ─── ПОЛУЧИТЬ/СОЗДАТЬ ТАБЛИЦУ ПРОИЗВОДСТВО ────────────────────
function getProductionDB() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('PROD_DB_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch(e) { props.deleteProperty('PROD_DB_ID'); }
  }
  var files = DriveApp.getFilesByName(PROD_DB_NAME);
  while (files.hasNext()) {
    var f = files.next();
    try {
      var ss = SpreadsheetApp.open(f);
      props.setProperty('PROD_DB_ID', ss.getId());
      return ss;
    } catch(e) {}
  }
  return null;
}

function ensureProductionDB() {
  var ss = getProductionDB();
  if (ss) {
    // Миграция: если короткого списка нет (старая версия БД) — добавляем
    if (!ss.getSheetByName('Короткий_список')) {
      var shShort = ss.insertSheet('Короткий_список');
      shShort.getRange(1,1,1,5).setValues([[
        'Бригадир ID','ФИО','Должность','Подразделение','Последний раз отмечен'
      ]]);
      shShort.getRange(1,1,1,5).setFontWeight('bold').setBackground('#F57F17').setFontColor('#fff');
      shShort.setFrozenRows(1);
    }
    // Миграция: электронный табель
    if (!ss.getSheetByName('Электронный_табель')) {
      var shTab = ss.insertSheet('Электронный_табель');
      shTab.getRange(1,1,1,7).setValues([[
        'ID записи','Линия','Смена','ФИО','Дата','Код должности','ID смены'
      ]]);
      shTab.getRange(1,1,1,7).setFontWeight('bold').setBackground('#00695C').setFontColor('#fff');
      shTab.setFrozenRows(1);
      // Колонка "Дата" как обычный текст, чтобы Sheets не конвертировал в Date
      shTab.getRange(2, 5, shTab.getMaxRows()-1, 1).setNumberFormat('@');
    } else {
      // Миграция формата: даже если лист уже существует, форсируем текстовый формат колонки "Дата"
      var shTabExisting = ss.getSheetByName('Электронный_табель');
      shTabExisting.getRange(2, 5, shTabExisting.getMaxRows()-1, 1).setNumberFormat('@');
    }
    // Миграция: колонка "Перекличка зафиксирована" в Смены
    var shShiftsCheck = ss.getSheetByName('Смены');
    if (shShiftsCheck && shShiftsCheck.getLastColumn() < 15) {
      shShiftsCheck.getRange(1,15).setValue('Перекличка зафиксирована');
      shShiftsCheck.getRange(1,15).setFontWeight('bold').setBackground('#1B5E20').setFontColor('#fff');
    }
    return ss;
  }

  ss = SpreadsheetApp.create(PROD_DB_NAME);
  initProductionDB(ss);
  return ss;
}

function initProductionDB(ss) {
  // ── Смены ──
  var shShifts = ss.getActiveSheet();
  shShifts.setName('Смены');
  shShifts.getRange(1,1,1,15).setValues([[
    'ID смены','Линия','Дата','Смена(День/Ночь)',
    'Бригадир ID','Бригадир ФИО',
    'Время открытия','Время закрытия','Статус',
    'Тестодел готов','Упаковщица готова',
    'Итог: брак теста (кг)','Итог: эффективность (%)','Примечание',
    'Перекличка зафиксирована'
  ]]);
  shShifts.getRange(1,1,1,15).setFontWeight('bold').setBackground('#1B5E20').setFontColor('#fff');
  shShifts.setFrozenRows(1);

  // ── Перекличка ──
  var shRoll = ss.insertSheet('Перекличка');
  shRoll.getRange(1,1,1,8).setValues([[
    'ID записи','ID смены','ФИО','Должность','Подразделение(своя/подработка)',
    'Статус(Пришёл/Не пришёл)','Добавлен вручную','Время отметки'
  ]]);
  shRoll.getRange(1,1,1,8).setFontWeight('bold').setBackground('#0D47A1').setFontColor('#fff');
  shRoll.setFrozenRows(1);

  // ── Расход сырья (Тестодел) ──
  var shDough = ss.insertSheet('Расход_сырья');
  shDough.getRange(1,1,1,9).setValues([[
    'ID записи','ID смены','Продукт','Кол-во муки(кг)','Кол-во соды(кг)',
    'Кол-во туза(кг)','Кол-во прочее(кг)','Расчётный выход (шт по норме)','Время ввода'
  ]]);
  shDough.getRange(1,1,1,9).setFontWeight('bold').setBackground('#6D4C41').setFontColor('#fff');
  shDough.setFrozenRows(1);

  // ── Готовая продукция (Упаковщица) ──
  var shPack = ss.insertSheet('Готовая_продукция');
  shPack.getRange(1,1,1,7).setValues([[
    'ID записи','ID смены','Продукт','Кол-во пачек(факт)','Кол-во пакетов использовано','Брак продукции(шт)','Время ввода'
  ]]);
  shPack.getRange(1,1,1,7).setFontWeight('bold').setBackground('#039BE5').setFontColor('#fff');
  shPack.setFrozenRows(1);

  // ── Брак теста ──
  var shBrak = ss.insertSheet('Брак_теста');
  shBrak.getRange(1,1,1,6).setValues([[
    'ID записи','ID смены','Кол-во(кг)','Причина','Кто ввёл','Время'
  ]]);
  shBrak.getRange(1,1,1,6).setFontWeight('bold').setBackground('#E53935').setFontColor('#fff');
  shBrak.setFrozenRows(1);

  // ── Итоговые отчёты смен ──
  var shReports = ss.insertSheet('Отчёты_смен');
  shReports.getRange(1,1,1,12).setValues([[
    'ID смены','Линия','Дата','Смена','Бригадир',
    'Время работы(мин)','Норматив времени(мин)','Эффективность(%)',
    'Выработка по норме(шт)','Выработка факт(шт)','Отклонение(шт)','Брак теста(кг)'
  ]]);
  shReports.getRange(1,1,1,12).setFontWeight('bold').setBackground('#4A148C').setFontColor('#fff');
  shReports.setFrozenRows(1);

  // ── Короткий список бригадира (личная память по сотрудникам) ──
  var shShort = ss.insertSheet('Короткий_список');
  shShort.getRange(1,1,1,5).setValues([[
    'Бригадир ID','ФИО','Должность','Подразделение','Последний раз отмечен'
  ]]);
  shShort.getRange(1,1,1,5).setFontWeight('bold').setBackground('#F57F17').setFontColor('#fff');
  shShort.setFrozenRows(1);

  // ── Электронный табель (месячный, по линиям) ──
  // Одна запись = (линия, смена, ФИО, дата) → код должности на этот день
  var shTab = ss.insertSheet('Электронный_табель');
  shTab.getRange(1,1,1,7).setValues([[
    'ID записи','Линия','Смена','ФИО','Дата','Код должности','ID смены'
  ]]);
  shTab.getRange(1,1,1,7).setFontWeight('bold').setBackground('#00695C').setFontColor('#fff');
  shTab.setFrozenRows(1);
  // Колонка "Дата" как обычный текст, чтобы Sheets не конвертировал в Date
  shTab.getRange(2, 5, shTab.getMaxRows()-1, 1).setNumberFormat('@');

  try {
    var blank = ss.getSheetByName('Sheet1');
    if (blank) ss.deleteSheet(blank);
  } catch(e) {}

  PropertiesService.getScriptProperties().setProperty('PROD_DB_ID', ss.getId());
  Logger.log('GL_Production создана: ' + ss.getUrl());
}

// ============================================================
// ДЕЙСТВИЯ БРИГАДИРА
// ============================================================

// ─── Получить текущую открытую смену пользователя (если есть) ─
function brigGetCurrentShift(user) {
  requireRole(user, ['Бригадир']);
  var ss = ensureProductionDB();
  var sh = ss.getSheetByName('Смены');
  var rows = sh.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][4] === user.id && rows[i][8] === SHIFT_STATUS.OPEN) {
      return {
        ok: true,
        hasOpenShift: true,
        shift: rowToShiftObj(rows[i])
      };
    }
  }
  return {ok: true, hasOpenShift: false};
}

function rowToShiftObj(row) {
  return {
    id: row[0], liniya: row[1], date: row[2], smena: row[3],
    brigadirId: row[4], brigadirFio: row[5],
    openTime: row[6], closeTime: row[7], status: row[8],
    testodelReady: row[9], upakReady: row[10],
    brakTesta: row[11], efficiency: row[12], note: row[13]
  };
}

// ─── Открыть смену ──────────────────────────────────────────
function brigOpenShift(user) {
  requireRole(user, ['Бригадир']);

  // Проверка: нет ли уже открытой смены
  var current = brigGetCurrentShift(user);
  if (current.hasOpenShift) {
    return {ok: false, error: 'У вас уже есть открытая смена. Закройте её перед началом новой.'};
  }

  if (!user.liniya || !user.smena) {
    return {ok: false, error: 'Для вашего профиля не указана линия или смена. Обратитесь к администратору.'};
  }

  var ss = ensureProductionDB();
  var sh = ss.getSheetByName('Смены');
  var shiftId = Utilities.getUuid();
  var now = new Date();

  sh.appendRow([
    shiftId, user.liniya, formatDateOnly(now), user.smena,
    user.id, user.fio,
    now.toISOString(), '', SHIFT_STATUS.OPEN,
    false, false, 0, 0, ''
  ]);

  logProdAction(ss, user.fio, 'ОТКРЫТИЕ СМЕНЫ', user.liniya + ' / ' + user.smena);

  return {ok: true, shiftId: shiftId};
}

// ─── Короткий список бригадира: получить актуальный (не старше 6 дней) ───
function getBrigShortList(ss, brigadirId) {
  var sh = ss.getSheetByName('Короткий_список');
  var rows = sh.getDataRange().getValues();
  var cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);

  var list = [];
  var rowsToDelete = [];
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] !== brigadirId) continue;
    var lastSeen = new Date(rows[i][4]);
    if (lastSeen < cutoff) {
      rowsToDelete.push(i + 1); // запомним для удаления просроченных
      continue;
    }
    list.push({
      fio: rows[i][1], posCode: rows[i][2], podrazd: rows[i][3],
      lastSeen: rows[i][4]
    });
  }

  // Удаляем просроченные записи (снизу вверх чтобы не сбить индексы)
  rowsToDelete.sort(function(a,b){return b-a;});
  rowsToDelete.forEach(function(rowNum) { sh.deleteRow(rowNum); });

  return list;
}

// ─── Короткий список бригадира: добавить/обновить сотрудника ─────
function upsertBrigShortList(ss, brigadirId, fio, dolj, podrazd) {
  var sh = ss.getSheetByName('Короткий_список');
  var rows = sh.getDataRange().getValues();
  var now = new Date().toISOString();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === brigadirId && rows[i][1] === fio) {
      sh.getRange(i+1, 5).setValue(now);
      return;
    }
  }
  sh.appendRow([brigadirId, fio, dolj || '', podrazd || '', now]);
}

// ─── Получить список сотрудников для переклички ──────────────
// Логика: показываем персональный "короткий список" бригадира (если есть).
// Если короткого списка нет — перекличка пустая, бригадир добавляет
// сотрудников вручную через поиск по общему списку Кадры GL.
function brigGetRollCallList(user, payload) {
  requireRole(user, ['Бригадир']);
  var shiftId = payload.shiftId;
  var ss = ensureProductionDB();

  // 1. Берём персональный короткий список бригадира
  var shortList = getBrigShortList(ss, user.id);

  // 2. Проверяем уже отмеченных в текущей смене
  var shRoll = ss.getSheetByName('Перекличка');
  var rollRows = shRoll.getDataRange().getValues();
  var marked = {};
  for (var j = 1; j < rollRows.length; j++) {
    if (rollRows[j][1] === shiftId) {
      marked[rollRows[j][2]] = {
        id: rollRows[j][0],
        status: rollRows[j][5],
        posCode: rollRows[j][3],
        podrazd: rollRows[j][4]
      };
    }
  }

  // 3. Собираем итоговый список: короткий список + уже отмеченные в этой смене
  var list = [];
  var seen = {};

  shortList.forEach(function(w) {
    var m = marked[w.fio];
    list.push({
      fio: w.fio, podrazd: w.podrazd,
      posCode: m ? m.posCode : null,
      status: m ? m.status : null,
      recordId: m ? m.id : null
    });
    seen[w.fio] = true;
  });

  // Добавляем тех кто отмечен в этой смене, но не входит в короткий список
  // (например, добавлены только что в первый раз)
  Object.keys(marked).forEach(function(fio) {
    if (seen[fio]) return;
    list.push({
      fio: fio, podrazd: marked[fio].podrazd,
      posCode: marked[fio].posCode,
      status: marked[fio].status, recordId: marked[fio].id
    });
  });

  return {
    ok: true,
    workers: list,
    availableCodes: getAvailablePositionCodes(user.liniya),
    locked: isRollCallLocked(ss, shiftId)
  };
}

// ─── Поиск работника для добавления (по ВСЕМ сотрудникам, без фильтра) ───
// Структура листа "Стаж рабочих": [0]№ [1]Ф.И.О. [2]Подразделение [3]Состояние [4]Стаж работы [5]Категория
function brigSearchWorker(user, payload) {
  requireRole(user, ['Бригадир']);
  var query = (payload.query || '').toLowerCase();
  if (query.length < 2) return {ok: true, workers: []};

  try {
    var kadry = SpreadsheetApp.openById(KADRY_SS_ID);
    var sh = kadry.getSheetByName('Стаж рабочих');
    var rows = sh.getDataRange().getValues();
    var found = [];
    for (var i = 1; i < rows.length && found.length < 20; i++) {
      if (!rows[i][1]) continue;
      var fio = rows[i][1].toString();
      if (fio.toLowerCase().indexOf(query) !== -1) {
        found.push({
          fio: fio,
          podrazd: rows[i][2] || '',
          dolj: '' // в таблице Кадры GL нет отдельной колонки "Должность"
        });
      }
    }
    return {ok: true, workers: found};
  } catch(e) {
    return {ok: false, error: 'Ошибка поиска: ' + e.message};
  }
}

// ─── Отметить сотрудника в перекличке + назначить должность (черновик) ───
// Выбор кода должности = автоматически "Пришёл". Запись в табель — отдельным действием.
function brigMarkAttendance(user, payload) {
  requireRole(user, ['Бригадир']);
  var shiftId  = payload.shiftId;
  var fio      = payload.fio;
  var podrazd  = payload.podrazd || '';
  var posCode  = payload.posCode || '';   // код должности: о/х/у/по/пх/бу/ст
  var manual   = !!payload.manual;

  var status = posCode ? 'Пришёл' : 'Не пришёл';
  var dolj   = posCode; // должность в перекличке = выбранный код

  if (posCode && !isValidPositionCode(posCode, user.liniya)) {
    return {ok: false, error: 'Недопустимый код должности для вашей линии: ' + posCode};
  }

  var ss = ensureProductionDB();

  if (isRollCallLocked(ss, shiftId)) {
    return {ok: false, error: 'Перекличка зафиксирована. Нажмите "Изменить" чтобы редактировать.'};
  }

  var sh = ss.getSheetByName('Перекличка');
  var rows = sh.getDataRange().getValues();

  // Если выбрали должность (значит пришёл) — обновляем короткий список бригадира
  if (posCode) {
    upsertBrigShortList(ss, user.id, fio, dolj, podrazd);
  }

  // Если уже есть запись переклички — обновляем
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === shiftId && rows[i][2] === fio) {
      sh.getRange(i+1, 4).setValue(dolj);
      sh.getRange(i+1, 6).setValue(status);
      sh.getRange(i+1, 8).setValue(new Date().toISOString());
      return {ok: true};
    }
  }

  // Новая запись
  var recId = Utilities.getUuid();
  sh.appendRow([recId, shiftId, fio, dolj, podrazd, status, manual, new Date().toISOString()]);
  return {ok: true, recordId: recId};
}

// ─── Электронный табель: добавить/обновить запись на СЕГОДНЯ ─────
function upsertTimesheetEntry(ss, user, fio, posCode, shiftId) {
  var sh = ss.getSheetByName('Электронный_табель');
  var rows = sh.getDataRange().getValues();
  var today = formatDateOnly(new Date());

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === user.liniya && rows[i][2] === user.smena &&
        rows[i][3] === fio && normalizeDateCell(rows[i][4]) === today) {
      sh.getRange(i+1, 6).setValue(posCode);
      sh.getRange(i+1, 7).setValue(shiftId);
      return;
    }
  }
  sh.appendRow([Utilities.getUuid(), user.liniya, user.smena, fio, today, posCode, shiftId]);
}

// ─── Электронный табель: убрать запись на сегодня (если отметили "не пришёл") ──
function removeTimesheetEntry(ss, user, fio) {
  var sh = ss.getSheetByName('Электронный_табель');
  var rows = sh.getDataRange().getValues();
  var today = formatDateOnly(new Date());

  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][1] === user.liniya && rows[i][2] === user.smena &&
        rows[i][3] === fio && normalizeDateCell(rows[i][4]) === today) {
      sh.deleteRow(i + 1);
      return;
    }
  }
}

// ─── Перенести перекличку (черновик) в электронный табель ────────
// Берём все записи переклички текущей смены со статусом "Пришёл" и записываем
// их в табель на сегодня. Также помечаем перекличку как "зафиксированную".
function brigTransferToTimesheet(user, payload) {
  requireRole(user, ['Бригадир']);
  var shiftId = payload.shiftId;
  var ss = ensureProductionDB();

  var shRoll = ss.getSheetByName('Перекличка');
  var rollRows = shRoll.getDataRange().getValues();

  var transferred = 0;
  var skippedNoCode = [];

  for (var i = 1; i < rollRows.length; i++) {
    if (rollRows[i][1] !== shiftId) continue;
    var fio    = rollRows[i][2];
    var posCode = rollRows[i][3];
    var status  = rollRows[i][5];

    if (status === 'Пришёл' && posCode) {
      upsertTimesheetEntry(ss, user, fio, posCode, shiftId);
      transferred++;
    } else if (status !== 'Не пришёл') {
      // Отмечен в списке, но должность не выбрана
      skippedNoCode.push(fio);
    }
  }

  if (transferred === 0 && skippedNoCode.length === 0) {
    return {ok: false, error: 'Нет сотрудников с выбранной должностью для переноса'};
  }

  markShiftRollCallLocked(ss, shiftId, true);

  return {
    ok: true,
    transferred: transferred,
    skippedNoCode: skippedNoCode
  };
}

// ─── Снять блокировку (разрешить редактировать перекличку повторно) ──
function brigUnlockRollCall(user, payload) {
  requireRole(user, ['Бригадир']);
  var shiftId = payload.shiftId;
  var ss = ensureProductionDB();
  markShiftRollCallLocked(ss, shiftId, false);
  return {ok: true};
}

function markShiftRollCallLocked(ss, shiftId, locked) {
  var sh = ss.getSheetByName('Смены');
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === shiftId) {
      sh.getRange(i+1, 15).setValue(locked ? 'LOCKED' : '');
      return;
    }
  }
}

function isRollCallLocked(ss, shiftId) {
  var sh = ss.getSheetByName('Смены');
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === shiftId) {
      return rows[i][14] === 'LOCKED';
    }
  }
  return false;
}

// ─── Получить месячный табель линии (для просмотра) ────────────
function brigGetTimesheet(user, payload) {
  requireRole(user, ['Бригадир']);
  var ss = ensureProductionDB();
  var sh = ss.getSheetByName('Электронный_табель');
  var rows = sh.getDataRange().getValues();

  // Определяем месяц/год для фильтрации (по умолчанию текущий месяц)
  var now = new Date();
  var monthStr = Utilities.formatDate(now, Session.getScriptTimeZone() || 'Asia/Tashkent', 'MM.yyyy');

  // Собираем: { fio -> { dateStr -> code } }
  var byWorker = {};
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] !== user.liniya || rows[i][2] !== user.smena) continue;
    var dateStr = normalizeDateCell(rows[i][4]); // всегда строка dd.MM.yyyy
    var dateMonthPart = dateStr.split('.').slice(1).join('.'); // MM.yyyy
    if (dateMonthPart !== monthStr) continue;

    var fio = rows[i][3];
    if (!byWorker[fio]) byWorker[fio] = {};
    byWorker[fio][dateStr] = rows[i][5];
  }

  var today = formatDateOnly(now);

  return {
    ok: true,
    liniya: user.liniya, smena: user.smena,
    today: today,
    data: byWorker,
    availableCodes: getAvailablePositionCodes(user.liniya)
  };
}

// ─── Привести значение ячейки даты к строке dd.MM.yyyy ────────────
// Google Sheets может вернуть дату как строку ИЛИ как объект Date
// в зависимости от автоформатирования ячейки.
function normalizeDateCell(value) {
  if (value instanceof Date) {
    return formatDateOnly(value);
  }
  return value.toString();
}

// ─── Проверка готовности Тестодела и Упаковщицы ───────────────
function brigCheckShiftReadiness(user, payload) {
  requireRole(user, ['Бригадир']);
  var shiftId = payload.shiftId;
  var ss = ensureProductionDB();

  var shShifts = ss.getSheetByName('Смены');
  var rows = shShifts.getDataRange().getValues();
  var shiftRow = -1;
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === shiftId) { shiftRow = i; break; }
  }
  if (shiftRow === -1) return {ok: false, error: 'Смена не найдена'};

  var testodelReady = rows[shiftRow][9];
  var upakReady      = rows[shiftRow][10];

  return {
    ok: true,
    testodelReady: !!testodelReady,
    upakReady: !!upakReady,
    canClose: !!testodelReady && !!upakReady
  };
}

// ─── Получить данные расхода/выработки для отчёта (превью) ───
function brigGetShiftSummary(user, payload) {
  requireRole(user, ['Бригадир']);
  var shiftId = payload.shiftId;
  var ss = ensureProductionDB();

  // Расход сырья
  var shDough = ss.getSheetByName('Расход_сырья');
  var doughRows = shDough.getDataRange().getValues();
  var totalNormOutput = 0;
  var doughItems = [];
  for (var i = 1; i < doughRows.length; i++) {
    if (doughRows[i][1] === shiftId) {
      totalNormOutput += Number(doughRows[i][7]) || 0;
      doughItems.push({
        product: doughRows[i][2],
        flour: doughRows[i][3],
        normOutput: doughRows[i][7]
      });
    }
  }

  // Готовая продукция (факт)
  var shPack = ss.getSheetByName('Готовая_продукция');
  var packRows = shPack.getDataRange().getValues();
  var totalFactOutput = 0;
  var totalPackBrak = 0;
  var packItems = [];
  for (var j = 1; j < packRows.length; j++) {
    if (packRows[j][1] === shiftId) {
      totalFactOutput += Number(packRows[j][3]) || 0;
      totalPackBrak    += Number(packRows[j][5]) || 0;
      packItems.push({
        product: packRows[j][2],
        factPacks: packRows[j][3],
        brak: packRows[j][5]
      });
    }
  }

  return {
    ok: true,
    doughItems: doughItems,
    packItems: packItems,
    totalNormOutput: totalNormOutput,
    totalFactOutput: totalFactOutput,
    totalPackBrak: totalPackBrak,
    deviation: totalFactOutput - totalNormOutput
  };
}

// ─── Закрыть смену ──────────────────────────────────────────
function brigCloseShift(user, payload) {
  requireRole(user, ['Бригадир']);
  var shiftId    = payload.shiftId;
  var brakTesta  = Number(payload.brakTesta) || 0;
  var brakReason = payload.brakReason || '';
  var note       = payload.note || '';

  var ss = ensureProductionDB();

  // Проверка готовности
  var readiness = brigCheckShiftReadiness(user, {shiftId: shiftId});
  if (!readiness.ok) return readiness;
  if (!readiness.canClose) {
    var missing = [];
    if (!readiness.testodelReady) missing.push('Тестодел');
    if (!readiness.upakReady)     missing.push('Упаковщица');
    return {ok: false, error: 'Невозможно закрыть смену. Не ввели данные: ' + missing.join(', ')};
  }

  var shShifts = ss.getSheetByName('Смены');
  var rows = shShifts.getDataRange().getValues();
  var shiftRow = -1;
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === shiftId) { shiftRow = i; break; }
  }
  if (shiftRow === -1) return {ok: false, error: 'Смена не найдена'};
  if (rows[shiftRow][8] === SHIFT_STATUS.CLOSED) return {ok: false, error: 'Смена уже закрыта'};

  var openTime  = new Date(rows[shiftRow][6]);
  var closeTime = new Date();
  var workedMinutes = Math.round((closeTime - openTime) / 60000);

  // Получаем сводку по выработке
  var summary = brigGetShiftSummary(user, {shiftId: shiftId});

  // Норматив времени = (норма выработки шт) / (производительность линии шт/мин)
  // Берём усреднённую производительность линии: используем количество фактически произведённых единиц
  // как базу для норматива (упрощённая модель — нормативное время = время на норму при той же скорости)
  var normOutput = summary.totalNormOutput || 0;
  var factOutput = summary.totalFactOutput || 0;

  // Нормативное время считаем пропорционально: если норма выработки = X шт,
  // и за workedMinutes произведено factOutput шт, то нормативное время на normOutput шт:
  var normMinutes = 0;
  var efficiency  = 0;
  if (factOutput > 0 && normOutput > 0) {
    var minutesPerUnit = workedMinutes / factOutput;
    normMinutes = Math.round(minutesPerUnit * normOutput);
    efficiency  = Math.round((normMinutes / workedMinutes) * 100);
  }

  // Записываем брак теста
  if (brakTesta > 0) {
    var shBrak = ss.getSheetByName('Брак_теста');
    shBrak.appendRow([
      Utilities.getUuid(), shiftId, brakTesta, brakReason, user.fio, new Date().toISOString()
    ]);
  }

  // Обновляем смену
  shShifts.getRange(shiftRow+1, 8).setValue(closeTime.toISOString());
  shShifts.getRange(shiftRow+1, 9).setValue(SHIFT_STATUS.CLOSED);
  shShifts.getRange(shiftRow+1, 12).setValue(brakTesta);
  shShifts.getRange(shiftRow+1, 13).setValue(efficiency);
  shShifts.getRange(shiftRow+1, 14).setValue(note);

  // Записываем итоговый отчёт
  var shReports = ss.getSheetByName('Отчёты_смен');
  shReports.appendRow([
    shiftId, rows[shiftRow][1], rows[shiftRow][2], rows[shiftRow][3], user.fio,
    workedMinutes, normMinutes, efficiency,
    normOutput, factOutput, summary.deviation, brakTesta
  ]);

  logProdAction(ss, user.fio, 'ЗАКРЫТИЕ СМЕНЫ', 'Эффективность: ' + efficiency + '%');

  return {
    ok: true,
    report: {
      workedMinutes: workedMinutes,
      normMinutes: normMinutes,
      efficiency: efficiency,
      normOutput: normOutput,
      factOutput: factOutput,
      deviation: summary.deviation,
      brakTesta: brakTesta,
      packBrak: summary.totalPackBrak
    }
  };
}

// ─── История смен бригадира ────────────────────────────────
function brigGetShiftHistory(user) {
  requireRole(user, ['Бригадир']);
  var ss = ensureProductionDB();
  var sh = ss.getSheetByName('Отчёты_смен');
  var rows = sh.getDataRange().getValues();
  var history = [];
  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][4] === user.fio) {
      history.push({
        shiftId: rows[i][0], liniya: rows[i][1], date: rows[i][2], smena: rows[i][3],
        workedMinutes: rows[i][5], normMinutes: rows[i][6], efficiency: rows[i][7],
        normOutput: rows[i][8], factOutput: rows[i][9], deviation: rows[i][10], brakTesta: rows[i][11]
      });
      if (history.length >= 20) break;
    }
  }
  return {ok: true, history: history};
}

// ============================================================
// HELPERS
// ============================================================
function formatDateOnly(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone() || 'Asia/Tashkent', 'dd.MM.yyyy');
}

// ════════════════════════════════════════════════════════════
// ЦЕНА МАТЕРИАЛА ПО МЕТОДУ FIFO
// Берём все партии прихода материала (дата, кол-во, цена), сортируем
// от старой к новой. Вычитаем из них суммарный расход материала
// (Акты_списания). Партия, на которой остаток заканчивается —
// это "текущая" FIFO-партия. Её цена и есть текущая цена по FIFO.
// ════════════════════════════════════════════════════════════
function getMaterialFifoPrice(ss, material) {
  // 1. Все партии прихода этого материала, от старой к новой
  var shIn = ss.getSheetByName('Приход_материалов');
  if (!shIn) return 0;
  var inRows = shIn.getDataRange().getValues();
  var batches = [];
  for (var i = 1; i < inRows.length; i++) {
    if (!inRows[i][0]) continue;
    if (inRows[i][4] !== material) continue; // колонка Материал
    var dateVal = inRows[i][1] instanceof Date ? inRows[i][1] : new Date(inRows[i][1]);
    batches.push({
      date: dateVal,
      qty: Number(inRows[i][5]) || 0,
      price: Number(inRows[i][6]) || 0
    });
  }
  if (!batches.length) return 0;
  batches.sort(function(a, b){ return a.date - b.date; }); // старые сначала

  // 2. Суммарный расход этого материала (Акты_списания)
  var shOut = ss.getSheetByName('Акты_списания');
  var consumed = 0;
  if (shOut) {
    var outRows = shOut.getDataRange().getValues();
    for (var j = 1; j < outRows.length; j++) {
      if (!outRows[j][0]) continue;
      if (outRows[j][5] !== material) continue; // колонка Материал
      consumed += Number(outRows[j][6]) || 0;    // колонка Кол-во
    }
  }

  // 3. Проходим партии от старой к новой, вычитая расход —
  //    находим партию, на которой остаток не закончился
  var remaining = consumed;
  for (var k = 0; k < batches.length; k++) {
    if (remaining >= batches[k].qty) {
      remaining -= batches[k].qty;
    } else {
      return batches[k].price; // текущая FIFO-партия
    }
  }
  // Расход превышает весь зафиксированный приход (или остаток исчерпан) —
  // берём цену последней (самой новой) партии как разумный запасной вариант
  return batches[batches.length - 1].price;
}

function logProdAction(ss, fio, action, details) {
  try {
    var sh = ss.getSheetByName('Лог');
    if (!sh) {
      sh = ss.insertSheet('Лог');
      sh.getRange(1,1,1,4).setValues([['Дата','ФИО','Действие','Детали']]);
    }
    sh.appendRow([new Date(), fio, action, details]);
  } catch(e) {}
}

// ─── РАЗОВАЯ МИГРАЦИЯ: исправить уже сохранённые Date-объекты в табеле ───
// Запустите вручную в редакторе один раз, если в "Электронный_табель"
// колонка "Дата" уже хранит реальные Date-объекты (а не текст).
function fixTimesheetDateColumn() {
  var ss = ensureProductionDB();
  var sh = ss.getSheetByName('Электронный_табель');
  var lastRow = sh.getLastRow();
  if (lastRow < 2) { Logger.log('Нет данных для исправления'); return; }

  var range = sh.getRange(2, 5, lastRow - 1, 1); // колонка E, строки 2..last
  var values = range.getValues();
  var fixed = 0;

  for (var i = 0; i < values.length; i++) {
    if (values[i][0] instanceof Date) {
      values[i][0] = formatDateOnly(values[i][0]);
      fixed++;
    }
  }

  range.setNumberFormat('@'); // текстовый формат
  range.setValues(values);
  Logger.log('Исправлено ячеек: ' + fixed);
}