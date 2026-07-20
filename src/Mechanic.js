// ============================================================
// GOLD LAVASH — МОДУЛЬ МЕХАНИК
// Управление оборудованием, секциями, заявки на ремонт
// Бригадир сигнализирует о поломке → Механик принимает и закрывает
// ============================================================

var MECHANIC_SS_ID_KEY = 'MECHANIC_SS_ID';
var MECHANIC_SS_ID_DEFAULT = '1KAcFZMz5CtHDFZfekKbkELHFqb_tYqNZ9JU_Ls4tuhU';

// ─── Получить ID таблицы механики ─────────────────────────────
function getMechanicSSId() {
  var id = PropertiesService.getScriptProperties().getProperty(MECHANIC_SS_ID_KEY);
  if (!id) id = MECHANIC_SS_ID_DEFAULT; // fallback — ID вшит напрямую
  if (!id) throw new Error('ID таблицы механики не задан.');
  return id;
}

// ─── Инициализация листов таблицы механики ────────────────────
function ensureMechanicSheets() {
  var id = getMechanicSSId();
  var ss = SpreadsheetApp.openById(id);

  // ── Оборудование: ID | Название | Линия | Описание | Активно ──
  if (!ss.getSheetByName('Оборудование')) {
    var sh = ss.insertSheet('Оборудование');
    sh.getRange(1,1,1,5).setValues([['ID','Название','Линия','Описание','Активно']]);
    sh.getRange(1,1,1,5).setFontWeight('bold').setBackground('#37474F').setFontColor('#fff');
    sh.setFrozenRows(1);
  }

  // ── Секции: ID | Оборудование_ID | Название | Иконка | Порядок ──
  if (!ss.getSheetByName('Секции')) {
    var sh2 = ss.insertSheet('Секции');
    sh2.getRange(1,1,1,5).setValues([['ID','Оборудование_ID','Название','Иконка','Порядок']]);
    sh2.getRange(1,1,1,5).setFontWeight('bold').setBackground('#4A148C').setFontColor('#fff');
    sh2.setFrozenRows(1);
  }

  // ── Заявки: ID | Секция_ID | Линия | Бригадир_ФИО | Время_подачи |
  //           Время_принятия | Время_закрытия | Комментарий_бригадира |
  //           Отчёт_механика | Статус | Механик_ФИО | Простой_мин ──
  if (!ss.getSheetByName('Заявки')) {
    var sh3 = ss.insertSheet('Заявки');
    sh3.getRange(1,1,1,12).setValues([[
      'ID','Секция_ID','Линия','Бригадир','Время_подачи',
      'Время_принятия','Время_закрытия','Комментарий',
      'Отчёт_механика','Статус','Механик','Простой_мин'
    ]]);
    sh3.getRange(1,1,1,12).setFontWeight('bold').setBackground('#B71C1C').setFontColor('#fff');
    sh3.setFrozenRows(1);
  }

  return ss;
}

// ─── CRUD: Оборудование ────────────────────────────────────────

function mechGetEquipment(user, payload) {
  requireRole(user, ['Механик','Бригадир','Зав.производством','Администратор']);
  var ss = ensureMechanicSheets();
  var sh = ss.getSheetByName('Оборудование');
  var rows = sh.getDataRange().getValues();
  var liniya = payload && payload.liniya ? payload.liniya : null;
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    if (liniya && rows[i][2] !== liniya) continue; // фильтр по линии для бригадира
    list.push({id:rows[i][0], name:rows[i][1], liniya:rows[i][2], desc:rows[i][3], active:rows[i][4]});
  }
  return {ok: true, equipment: list};
}

function mechSaveEquipment(user, payload) {
  requireRole(user, ['Механик','Администратор']);
  var ss = ensureMechanicSheets();
  var sh = ss.getSheetByName('Оборудование');
  var id = payload.id || Utilities.getUuid();
  var rows = sh.getDataRange().getValues();
  var rowIdx = -1;
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) { rowIdx = i + 1; break; }
  }
  var data = [id, payload.name||'', payload.liniya||'', payload.desc||'', payload.active!==false];
  if (rowIdx > 0) {
    sh.getRange(rowIdx, 1, 1, 5).setValues([data]);
  } else {
    sh.appendRow(data);
  }
  return {ok: true, id: id};
}

function mechDeleteEquipment(user, payload) {
  requireRole(user, ['Механик','Администратор']);
  var ss = ensureMechanicSheets();
  var sh = ss.getSheetByName('Оборудование');
  var rows = sh.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][0] === payload.id) { sh.deleteRow(i + 1); break; }
  }
  return {ok: true};
}

// ─── CRUD: Секции ──────────────────────────────────────────────

function mechGetSections(user, payload) {
  requireRole(user, ['Механик','Бригадир','Зав.производством','Администратор']);
  var ss = ensureMechanicSheets();
  var sh = ss.getSheetByName('Секции');
  var rows = sh.getDataRange().getValues();
  var equipId = payload && payload.equipId;
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    if (equipId && rows[i][1] !== equipId) continue;
    list.push({id:rows[i][0], equipId:rows[i][1], name:rows[i][2], icon:rows[i][3]||'⚙️', order:rows[i][4]||i});
  }
  list.sort(function(a,b){ return (a.order||0) - (b.order||0); });
  return {ok: true, sections: list};
}

function mechSaveSection(user, payload) {
  requireRole(user, ['Механик','Администратор']);
  var ss = ensureMechanicSheets();
  var sh = ss.getSheetByName('Секции');
  var id = payload.id || Utilities.getUuid();
  var rows = sh.getDataRange().getValues();
  var rowIdx = -1;
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) { rowIdx = i + 1; break; }
  }
  var data = [id, payload.equipId||'', payload.name||'', payload.icon||'⚙️', payload.order||99];
  if (rowIdx > 0) {
    sh.getRange(rowIdx, 1, 1, 5).setValues([data]);
  } else {
    sh.appendRow(data);
  }
  return {ok: true, id: id};
}

function mechDeleteSection(user, payload) {
  requireRole(user, ['Механик','Администратор']);
  var ss = ensureMechanicSheets();
  var sh = ss.getSheetByName('Секции');
  var rows = sh.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][0] === payload.id) { sh.deleteRow(i + 1); break; }
  }
  return {ok: true};
}

// ─── Заявки: подача сигнала (Бригадир) ────────────────────────

function mechCreateTicket(user, payload) {
  requireRole(user, ['Бригадир','Администратор']);
  if (!payload.sectionId) return {ok: false, error: 'Укажите секцию'};
  if (!payload.comment)   return {ok: false, error: 'Опишите проблему'};

  var ss = ensureMechanicSheets();
  // Проверяем: нет ли уже открытой заявки на эту секцию
  var shT = ss.getSheetByName('Заявки');
  var rows = shT.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === payload.sectionId && (rows[i][9] === 'Новая' || rows[i][9] === 'Принята')) {
      return {ok: false, error: 'По этой секции уже есть открытая заявка'};
    }
  }

  var id = Utilities.getUuid();
  var now = new Date();
  var nowStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm');

  shT.appendRow([
    id, payload.sectionId, user.liniya||'', user.fio,
    nowStr, '', '', payload.comment,
    '', 'Новая', '', ''
  ]);

  return {ok: true, ticketId: id};
}

// ─── Заявки: принятие (Механик) ───────────────────────────────

function mechAcceptTicket(user, payload) {
  requireRole(user, ['Механик','Администратор']);
  var ss = ensureMechanicSheets();
  var sh = ss.getSheetByName('Заявки');
  var rows = sh.getDataRange().getValues();
  var now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm');
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] !== payload.ticketId) continue;
    if (rows[i][9] !== 'Новая') return {ok: false, error: 'Заявка уже принята или закрыта'};
    sh.getRange(i+1, 6).setValue(now);   // Время принятия
    sh.getRange(i+1, 10).setValue('Принята');
    sh.getRange(i+1, 11).setValue(user.fio);
    return {ok: true};
  }
  return {ok: false, error: 'Заявка не найдена'};
}

// ─── Заявки: закрытие + отчёт (Механик) ──────────────────────

function mechCloseTicket(user, payload) {
  requireRole(user, ['Механик','Администратор']);
  if (!payload.report) return {ok: false, error: 'Напишите отчёт о причине и устранении'};
  var ss = ensureMechanicSheets();
  var sh = ss.getSheetByName('Заявки');
  var rows = sh.getDataRange().getValues();
  var now = new Date();
  var nowStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm');
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] !== payload.ticketId) continue;
    if (rows[i][9] === 'Закрыта') return {ok: false, error: 'Заявка уже закрыта'};
    // Считаем время простоя (от подачи до закрытия)
    var startStr = rows[i][4];
    var downtimeMin = 0;
    if (startStr) {
      try {
        var parts = startStr.split(' ');
        var dp = parts[0].split('.');
        var tp = parts[1].split(':');
        var startDate = new Date(dp[2], dp[1]-1, dp[0], tp[0], tp[1]);
        downtimeMin = Math.round((now - startDate) / 60000);
      } catch(e) {}
    }
    sh.getRange(i+1, 7).setValue(nowStr);
    sh.getRange(i+1, 9).setValue(payload.report);
    sh.getRange(i+1, 10).setValue('Закрыта');
    sh.getRange(i+1, 12).setValue(downtimeMin);
    if (!rows[i][10]) sh.getRange(i+1, 11).setValue(user.fio);
    return {ok: true, downtimeMin: downtimeMin};
  }
  return {ok: false, error: 'Заявка не найдена'};
}

// ─── Список заявок (для обоих ролей) ─────────────────────────

function mechGetTickets(user, payload) {
  requireRole(user, ['Механик','Бригадир','Зав.производством','Администратор']);
  var ss = ensureMechanicSheets();
  var sh = ss.getSheetByName('Заявки');
  var rows = sh.getDataRange().getValues();
  var onlyOpen   = payload && payload.onlyOpen;
  var liniya     = payload && payload.liniya;
  var sectionId  = payload && payload.sectionId;

  var list = [];
  for (var i = rows.length - 1; i >= 1; i--) {
    if (!rows[i][0]) continue;
    if (liniya    && rows[i][2] !== liniya)    continue;
    if (sectionId && rows[i][1] !== sectionId) continue;
    if (onlyOpen  && rows[i][9] === 'Закрыта') continue;
    list.push({
      id: rows[i][0], sectionId: rows[i][1], liniya: rows[i][2],
      brigadir: rows[i][3], timeOpen: rows[i][4], timeAccepted: rows[i][5],
      timeClosed: rows[i][6], comment: rows[i][7], report: rows[i][8],
      status: rows[i][9], mechanic: rows[i][10], downtimeMin: rows[i][11]
    });
    if (list.length >= 200) break;
  }
  return {ok: true, tickets: list};
}

// ─── Статистика простоев (дашборд) ────────────────────────────

function mechGetStats(user, payload) {
  requireRole(user, ['Механик','Зав.производством','Администратор']);
  var ss = ensureMechanicSheets();
  var sh = ss.getSheetByName('Заявки');
  var rows = sh.getDataRange().getValues();

  var totalTickets = 0, openTickets = 0, totalDowntime = 0;
  var byLiniya = {}, bySection = {};
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd.MM.yyyy');

  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    // Фильтр за период если задан
    if (payload && payload.dateFrom) {
      var d = (rows[i][4]||'').split(' ')[0];
      if (d < payload.dateFrom || d > (payload.dateTo||today)) continue;
    }
    totalTickets++;
    var status = rows[i][9];
    var liniya = rows[i][2] || 'Неизвестно';
    var secId  = rows[i][1] || '';
    var dt = Number(rows[i][11]) || 0;

    if (status !== 'Закрыта') openTickets++;
    totalDowntime += dt;

    if (!byLiniya[liniya]) byLiniya[liniya] = {tickets:0, downtime:0};
    byLiniya[liniya].tickets++;
    byLiniya[liniya].downtime += dt;

    if (secId) {
      if (!bySection[secId]) bySection[secId] = {tickets:0, downtime:0};
      bySection[secId].tickets++;
      bySection[secId].downtime += dt;
    }
  }

  return {
    ok: true,
    totalTickets: totalTickets, openTickets: openTickets,
    totalDowntimeMin: totalDowntime,
    byLiniya: byLiniya, bySection: bySection
  };
}

// ─── Активные заявки для уведомлений (polling) ────────────────
// Возвращает открытые заявки для линии бригадира или все для механика

function mechGetActiveAlerts(user) {
  requireRole(user, ['Механик','Бригадир','Зав.производством','Администратор']);
  var ss = ensureMechanicSheets();
  var sh = ss.getSheetByName('Заявки');
  var rows = sh.getDataRange().getValues();
  var alerts = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    if (rows[i][9] === 'Закрыта') continue;
    if (user.role === 'Бригадир' && rows[i][2] !== user.liniya) continue;
    alerts.push({
      id: rows[i][0], sectionId: rows[i][1], liniya: rows[i][2],
      comment: rows[i][7], status: rows[i][9], timeOpen: rows[i][4]
    });
  }
  return {ok: true, alerts: alerts};
}