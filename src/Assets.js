// ============================================================
// GOLD LAVASH — ОСНОВНЫЕ СРЕДСТВА И ИНВЕНТАРЬ
// Реестр, приём, перемещения, списание, справочники
// Google Sheets ID: 1uEsehQE55lBcM0W2E1bIfsj4LB7MKqax47Ug-E__39M
// ============================================================

var ASSETS_SS_ID = '1uEsehQE55lBcM0W2E1bIfsj4LB7MKqax47Ug-E__39M';

function getAssetsSS() {
  return SpreadsheetApp.openById(ASSETS_SS_ID);
}

function assetsFullAccess(user) {
  return user.role === ROLES.ADMIN || user.role === ROLES.OS_BUKH;
}

function ensureAssetsSheets() {
  var ss = getAssetsSS();
  var need = [
    { name: 'База ОС', headers: ['№','Инвентарный номер','Наименование','ОС/Инвентар','Ответственный лицо','Размер','Рисунок','Вид','Категория','Дата поступление','Полезный срок службы','Дата вывода средств','Рыночный стоимость','Кол-во','Амортизация %','Адрес','Состояния','Подразделения','Ссылка на карточку','QR-код','Фото URL','Примечание'] },
    { name: 'Амортизация', headers: ['Инв. номер','Наименование','Год','Месяц','Стоимость нач.','Амортизация за месяц','Накопл. амортизация','Остаточная стоимость'] },
    { name: 'Перемещения', headers: ['Дата','Инв. номер','Наименование','Откуда','Куда','Ответств. лицо','Основание','Автор','Номер акта'] },
    { name: 'Списание', headers: ['Дата','Инв. номер','Наименование','Подразделение','Причина','Остаточная стоимость','Автор','Номер акта'] },
    { name: 'Подразделения', headers: ['Подразделение','Подподразделение','Описание','Активно'] },
    { name: 'Места хранения', headers: ['Подразделение','Место хранения','Описание','Активно'] },
    { name: 'Виды ОС', headers: ['Вид','Активно'] },
    { name: 'Инвентаризации', headers: ['№ инв-ции','Название','Дата начала','Дата закрытия','Подразделение','Статус','Создал','Итого объектов','Найдено','Не найдено'] },
    { name: 'Инв. результаты', headers: ['№ инв-ции','Инв. номер','Наименование','Подразделение','Ожидаемый адрес','Фактический адрес','Состояние факт.','Статус','Дата сканирования','Кто сканировал','Примечание'] },
  ];
  need.forEach(function(s) {
    var sh = ss.getSheetByName(s.name);
    if (!sh) {
      sh = ss.insertSheet(s.name);
      sh.getRange(1,1,1,s.headers.length).setValues([s.headers]);
      sh.getRange(1,1,1,s.headers.length).setFontWeight('bold').setBackground('#1a3a5c').setFontColor('#fff');
      sh.setFrozenRows(1);
    }
  });

  var shDept = ss.getSheetByName('Подразделения');
  if (shDept.getLastRow() < 2) {
    [
      ['Производство','Линия 1','Производственная линия 1',true],
      ['Производство','Линия 2','Производственная линия 2',true],
      ['Производство','Линия 3','Производственная линия 3',true],
      ['Производство','Тандыр','Тандырный цех',true],
      ['Производство','Склад','Склад сырья и готовой продукции',true],
      ['Завод СЭЗ','Цех СЭЗ','Основной цех',true],
      ['Завод СЭЗ','Склад СЭЗ','Склад завода',true],
      ['ОТП Самарканд','Магазин 1','Торговая точка 1',true],
      ['ОТП Самарканд','Магазин 2','Торговая точка 2',true],
      ['ОТП Тошкент','Магазин Т1','Торговая точка Тошкент 1',true],
      ['Офис','Бухгалтерия','Бухгалтерский отдел',true],
      ['Офис','HR','Отдел кадров',true],
      ['Офис','IT','Информационные технологии',true],
    ].forEach(function(r){ shDept.appendRow(r); });
  }

  var shStor = ss.getSheetByName('Места хранения');
  if (shStor.getLastRow() < 2) {
    [
      ['Производство','Цех Линия 1','Производственная линия 1',true],
      ['Производство','Цех Линия 2','Производственная линия 2',true],
      ['Производство','Цех Линия 3','Производственная линия 3',true],
      ['Производство','Цех Тандыр','Тандырный цех',true],
      ['Производство','Склад сырья','Склад сырья',true],
      ['Производство','Склад ГП','Склад готовой продукции',true],
      ['Завод СЭЗ','Цех СЭЗ основной','Основной цех',true],
      ['Завод СЭЗ','Склад СЭЗ','Склад завода',true],
      ['ОТП Самарканд','Магазин С1','Торговая точка 1',true],
      ['ОТП Самарканд','Магазин С2','Торговая точка 2',true],
      ['ОТП Тошкент','Магазин Т1','Торговая точка Тошкент 1',true],
      ['ОТП Тошкент','Магазин Т2','Торговая точка Тошкент 2',true],
      ['Офис','Кабинет бухгалтерии','Бухгалтерия',true],
      ['Офис','Кабинет директора','Руководство',true],
      ['Офис','Серверная','IT отдел',true],
    ].forEach(function(r){ shStor.appendRow(r); });
  }

  var shVid = ss.getSheetByName('Виды ОС');
  if (shVid.getLastRow() < 2) {
    [
      ['Ускуналар', true], ['Хоз. инвентар', true], ['Офис мебеллари', true], ['Инструмент', true],
      ['Падносы', true], ['Совутиш жихоз ва иншоотлари', true], ['Хисоблаш техникалари', true],
      ['Авто машина', true], ['Бино ва иншоатлар', true], ['Кузатув Мосламси', true], ['Комуникация линиялари', true],
    ].forEach(function(r){ shVid.appendRow(r); });
  }

  return ss;
}

function assetsSheetToObjects(sh) {
  if (!sh || sh.getLastRow() < 2) return [];
  var data = sh.getDataRange().getValues();
  var headers = data[0];
  var out = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    var hasData = false;
    for (var k = 0; k < r.length; k++) { if (r[k] !== '' && r[k] !== null) { hasData = true; break; } }
    if (!hasData) continue;
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      if (!headers[j]) continue;
      var val = r[j];
      if (val instanceof Date) val = Utilities.formatDate(val, 'Asia/Tashkent', 'yyyy-MM-dd');
      else if (val === null) val = '';
      else if (typeof val === 'object') val = '';
      obj[headers[j]] = val;
    }
    out.push(obj);
  }
  return out;
}

// ── Реестр ОС ──────────────────────────────────────────────────
function assetsGetAll(user, payload) {
  var ss = ensureAssetsSheets();
  var sh = ss.getSheetByName('База ОС');
  var all = assetsSheetToObjects(sh).filter(function(r){ return r['Инвентарный номер'] !== ''; });
  var full = assetsFullAccess(user);
  var filtered = full ? all : all.filter(function(o){ return o['Подразделения'] === user.osDept; });
  return {ok: true, data: filtered, full: full, dept: user.osDept || ''};
}

function assetsGetOne(user, payload) {
  var res = assetsGetAll(user, payload);
  if (!res.ok) return res;
  var found = null;
  for (var i = 0; i < res.data.length; i++) {
    if (res.data[i]['Инвентарный номер'] === payload.invNum) { found = res.data[i]; break; }
  }
  return {ok: true, data: found};
}

function assetsGetSummary(user) {
  var res = assetsGetAll(user, {});
  var all = res.data;
  var byDept = {};
  var totalCost = 0, osCount = 0, invCount = 0, activeCount = 0;
  all.forEach(function(o) {
    var d = o['Подразделения'] || '—';
    byDept[d] = (byDept[d] || 0) + 1;
    totalCost += parseFloat(o['Рыночный стоимость']) || 0;
    if (o['ОС/Инвентар'] === 'ОС') osCount++;
    if (o['ОС/Инвентар'] === 'ИНВ') invCount++;
    if (o['Состояния'] === 'Балансда') activeCount++;
  });
  return {ok: true, total: all.length, os: osCount, inv: invCount, active: activeCount,
    byDept: byDept, totalCost: totalCost, full: res.full};
}

function assetsGetNextInvNumber(user, payload) {
  var sh = ensureAssetsSheets().getSheetByName('База ОС');
  var data = sh.getDataRange().getValues();
  var maxNum = 0;
  for (var i = 1; i < data.length; i++) {
    var m = String(data[i][1] || '').match(/(\d+)$/);
    if (m) { var n = parseInt(m[1], 10); if (n > maxNum) maxNum = n; }
  }
  var padded = ('00000' + (maxNum + 1)).slice(-5);
  return {ok: true, invNum: 'ИНВ-' + padded};
}

// ── Приём ОС ───────────────────────────────────────────────────
function assetsAdd(user, payload) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  if (!payload.name)       return {ok: false, error: 'Укажите наименование'};
  if (!payload.department) return {ok: false, error: 'Укажите подразделение'};
  if (!payload.dateIn)     return {ok: false, error: 'Укажите дату поступления'};

  var ss = ensureAssetsSheets();
  var sh = ss.getSheetByName('База ОС');
  var nextRowNum = sh.getLastRow();
  var invNum = assetsGetNextInvNumber(user, {}).invNum;
  var appUrl = ScriptApp.getService().getUrl();
  var cardUrl = appUrl + '?page=os-card&inv=' + encodeURIComponent(invNum);
  var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(cardUrl);
  var cost = Number(payload.cost) || 0;
  var amortPct = Number(payload.amortPercent) || 0.20;
  var type = payload.type || 'ОС';

  sh.appendRow([
    nextRowNum, invNum, payload.name, type, payload.responsible || '',
    payload.size || '', false, payload.vid || '', payload.category || '',
    new Date(payload.dateIn), payload.lifespan || '', '', cost, 1,
    amortPct, payload.address || '', 'Балансда', payload.department,
    cardUrl, qrUrl, payload.photoUrl || '', payload.note || ''
  ]);

  if (type === 'ОС' && cost && amortPct) {
    assetsAddAmortRow(invNum, payload.name, payload.dateIn, cost, amortPct);
  }

  return {ok: true, invNum: invNum, cardUrl: cardUrl, message: payload.name + ' принят(о) на учёт (' + invNum + ')'};
}

function assetsAddAmortRow(invNum, name, dateIn, cost, amortPct) {
  var sh = ensureAssetsSheets().getSheetByName('Амортизация');
  var d = new Date(dateIn);
  var monthly = cost * amortPct / 12;
  sh.appendRow([invNum, name, d.getFullYear(), d.getMonth() + 1,
    cost, monthly.toFixed(2), monthly.toFixed(2), (cost - monthly).toFixed(2)]);
}

// ── Обновление поля (внутреннее + через действие) ───────────────
function assetsUpdateFieldInternal(invNum, field, value) {
  var sh = ensureAssetsSheets().getSheetByName('База ОС');
  var data = sh.getDataRange().getValues();
  var headers = data[0];
  var colIdx = headers.indexOf(field);
  if (colIdx === -1) return;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(invNum)) { sh.getRange(i + 1, colIdx + 1).setValue(value); return; }
  }
}

function assetsUpdateField(user, payload) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  if (!payload.invNum || !payload.field) return {ok: false, error: 'Не хватает параметров'};
  assetsUpdateFieldInternal(payload.invNum, payload.field, payload.value);
  return {ok: true};
}

// ── Перемещения ──────────────────────────────────────────────────
function assetsGetActNumber(sheetName, prefix) {
  var sh = ensureAssetsSheets().getSheetByName(sheetName);
  var count = sh ? Math.max(sh.getLastRow() - 1, 0) : 0;
  return prefix + ('0000' + (count + 1)).slice(-4);
}

function assetsAddMovement(user, payload) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  if (!payload.invNum) return {ok: false, error: 'Укажите инв. номер'};
  if (!payload.to)     return {ok: false, error: 'Укажите новое подразделение'};

  var osRes = assetsGetOne(user, {invNum: payload.invNum});
  var os = osRes.data;
  if (!os) return {ok: false, error: 'ОС не найден'};

  var sh = ensureAssetsSheets().getSheetByName('Перемещения');
  var actNum = assetsGetActNumber('Перемещения', 'АКТ-П-');
  var now = Utilities.formatDate(new Date(), 'Asia/Tashkent', 'yyyy-MM-dd');
  sh.appendRow([now, payload.invNum, os['Наименование'], os['Подразделения'], payload.to,
    payload.responsible || '', payload.reason || '', user.fio, actNum]);

  assetsUpdateFieldInternal(payload.invNum, 'Подразделения', payload.to);
  if (payload.responsible) assetsUpdateFieldInternal(payload.invNum, 'Ответственный лицо', payload.responsible);

  return {ok: true, actNum: actNum, message: 'Перемещение оформлено (' + actNum + ')'};
}

function assetsGetMovements(user, payload) {
  var rows = assetsSheetToObjects(ensureAssetsSheets().getSheetByName('Перемещения'));
  var invNum = payload && payload.invNum;
  if (invNum) rows = rows.filter(function(r){ return r['Инв. номер'] === invNum; });
  else if (!assetsFullAccess(user)) rows = rows.filter(function(r){ return r['Откуда'] === user.osDept || r['Куда'] === user.osDept; });
  rows.reverse();
  return {ok: true, data: rows};
}

// ── Списание ──────────────────────────────────────────────────
function assetsWriteOff(user, payload) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  if (!payload.invNum) return {ok: false, error: 'Укажите инв. номер'};
  if (!payload.reason) return {ok: false, error: 'Укажите причину списания'};

  var osRes = assetsGetOne(user, {invNum: payload.invNum});
  var os = osRes.data;
  if (!os) return {ok: false, error: 'ОС не найден'};

  var ss = ensureAssetsSheets();
  var sh = ss.getSheetByName('Списание');
  var actNum = assetsGetActNumber('Списание', 'АКТ-С-');
  var now = Utilities.formatDate(new Date(), 'Asia/Tashkent', 'yyyy-MM-dd');

  var history = assetsSheetToObjects(ss.getSheetByName('Амортизация')).filter(function(r){ return r['Инв. номер'] === payload.invNum; });
  var lastH = history[history.length - 1];
  var residual = lastH ? (parseFloat(lastH['Остаточная стоимость']) || 0) : (parseFloat(os['Рыночный стоимость']) || 0);

  sh.appendRow([now, payload.invNum, os['Наименование'], os['Подразделения'], payload.reason, residual.toFixed(2), user.fio, actNum]);
  assetsUpdateFieldInternal(payload.invNum, 'Состояния', 'Списан');
  assetsUpdateFieldInternal(payload.invNum, 'Дата вывода средств', now);

  return {ok: true, actNum: actNum, residual: residual, message: 'Списание оформлено (' + actNum + ')'};
}

function assetsGetWriteOffs(user, payload) {
  var rows = assetsSheetToObjects(ensureAssetsSheets().getSheetByName('Списание'));
  if (!assetsFullAccess(user)) rows = rows.filter(function(r){ return r['Подразделение'] === user.osDept; });
  rows.reverse();
  return {ok: true, data: rows};
}

// ── Справочники ──────────────────────────────────────────────────
function assetsGetDirectories(user) {
  var vidy = assetsSheetToObjects(ensureAssetsSheets().getSheetByName('Виды ОС'))
    .filter(function(r){ return r['Активно'] !== false && String(r['Активно']).toLowerCase() !== 'false'; })
    .map(function(r){ return r['Вид']; });
  var deptStruct = assetsGetDepartmentStructure(user);
  var departments = Object.keys(deptStruct.structure);
  if (!departments.length) departments = OS_DEPARTMENTS;
  return {ok: true,
    vidy: vidy,
    departments: departments,
    reasons: ['Физический износ','Моральный износ','Авария/поломка','Кража/потеря',
      'Продажа','Передача другой организации','Стихийное бедствие','Иное'],
    states: ['Балансда','Захирада','Списан'],
    types: ['ОС','ИНВ']
  };
}

function assetsGetVidy(user) {
  var rows = assetsSheetToObjects(ensureAssetsSheets().getSheetByName('Виды ОС'))
    .filter(function(r){ return r['Активно'] !== false && String(r['Активно']).toLowerCase() !== 'false'; });
  return {ok: true, data: rows.map(function(r){ return r['Вид']; })};
}

function assetsAddVid(user, payload) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  if (!payload.vid) return {ok: false, error: 'Укажите вид ОС'};
  ensureAssetsSheets().getSheetByName('Виды ОС').appendRow([payload.vid, true]);
  return {ok: true};
}

function assetsDeactivateVid(user, payload) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  var sh = ensureAssetsSheets().getSheetByName('Виды ОС');
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === payload.vid) { sh.getRange(i + 1, 2).setValue(false); return {ok: true}; }
  }
  return {ok: false, error: 'Не найдено'};
}

// ── Список сотрудников (для выбора ответственного лица) ──────────
function assetsGetStaffNames(user) {
  var sh = SpreadsheetApp.openById(KADRY_SS_ID).getSheetByName('Нынешние инфо');
  if (!sh) return {ok: true, data: []};
  var rows = sh.getDataRange().getValues();
  var names = [];
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][2] && hrIsActiveState(rows[i][11])) names.push(rows[i][2]);
  }
  names.sort();
  return {ok: true, data: names};
}

function assetsGetDepartmentStructure(user) {
  var rows = assetsSheetToObjects(ensureAssetsSheets().getSheetByName('Подразделения'))
    .filter(function(r){ return r['Активно'] !== false && String(r['Активно']).toLowerCase() !== 'false'; });
  var structure = {};
  rows.forEach(function(r) {
    var dept = r['Подразделение'];
    if (!structure[dept]) structure[dept] = [];
    if (r['Подподразделение']) structure[dept].push({name: r['Подподразделение'], desc: r['Описание'] || ''});
  });
  return {ok: true, structure: structure, raw: rows};
}

function assetsAddDepartment(user, payload) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  if (!payload.dept) return {ok: false, error: 'Укажите подразделение'};
  ensureAssetsSheets().getSheetByName('Подразделения').appendRow([payload.dept, payload.subdept || '', payload.desc || '', true]);
  return {ok: true};
}

function assetsDeactivateDepartment(user, payload) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  var sh = ensureAssetsSheets().getSheetByName('Подразделения');
  var data = sh.getDataRange().getValues();
  var headers = data[0];
  var dCol = headers.indexOf('Подразделение'), sCol = headers.indexOf('Подподразделение'), aCol = headers.indexOf('Активно');
  for (var i = 1; i < data.length; i++) {
    if (data[i][dCol] === payload.dept && data[i][sCol] === payload.subdept) {
      sh.getRange(i + 1, aCol + 1).setValue(false);
      return {ok: true};
    }
  }
  return {ok: false, error: 'Не найдено'};
}

function assetsGetStorageLocations(user, payload) {
  var dept = payload && payload.dept;
  var rows = assetsSheetToObjects(ensureAssetsSheets().getSheetByName('Места хранения')).filter(function(r) {
    var active = r['Активно'] !== false && String(r['Активно']).toLowerCase() !== 'false';
    return active && (!dept || r['Подразделение'] === dept);
  });
  return {ok: true, data: rows};
}

function assetsAddStorageLocation(user, payload) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  if (!payload.dept || !payload.name) return {ok: false, error: 'Заполните подразделение и название'};
  ensureAssetsSheets().getSheetByName('Места хранения').appendRow([payload.dept, payload.name, payload.desc || '', true]);
  return {ok: true};
}

function assetsDeleteStorageLocation(user, payload) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  var sh = ensureAssetsSheets().getSheetByName('Места хранения');
  var data = sh.getDataRange().getValues();
  var headers = data[0];
  var dCol = headers.indexOf('Подразделение'), nCol = headers.indexOf('Место хранения'), aCol = headers.indexOf('Активно');
  for (var i = 1; i < data.length; i++) {
    if (data[i][dCol] === payload.dept && data[i][nCol] === payload.name) {
      sh.getRange(i + 1, aCol + 1).setValue(false);
      return {ok: true};
    }
  }
  return {ok: false, error: 'Не найдено'};
}

function assetsGetResponsiblePersons(user, payload) {
  var dept = payload && payload.dept;
  var sh = ensureAssetsSheets().getSheetByName('База ОС');
  var persons = {};
  var data = sh.getDataRange().getValues();
  var headers = data[0];
  var respCol = headers.indexOf('Ответственный лицо');
  var deptCol = headers.indexOf('Подразделения');
  for (var i = 1; i < data.length; i++) {
    if (!dept || data[i][deptCol] === dept) {
      var p = String(data[i][respCol] || '').trim();
      if (p) persons[p] = true;
    }
  }
  return {ok: true, data: Object.keys(persons).sort()};
}

// ══════════════════════════════════════════════════════════════
// АМОРТИЗАЦИЯ
// ══════════════════════════════════════════════════════════════
function assetsGetAmortHistory(user, payload) {
  var rows = assetsSheetToObjects(ensureAssetsSheets().getSheetByName('Амортизация'))
    .filter(function(r){ return r['Инв. номер'] === payload.invNum; });
  return {ok: true, data: rows};
}

function assetsGetAllAmort(user, payload) {
  var allRes = assetsGetAll(user, {});
  var rows = assetsSheetToObjects(ensureAssetsSheets().getSheetByName('Амортизация'));
  if (!allRes.full) {
    var allowed = {};
    allRes.data.forEach(function(o){ allowed[o['Инвентарный номер']] = true; });
    rows = rows.filter(function(r){ return allowed[r['Инв. номер']]; });
  }
  return {ok: true, data: rows.slice(-200)};
}

function assetsAccrueMonthlyDepreciation(user) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  var ss = ensureAssetsSheets();
  var sh = ss.getSheetByName('Амортизация');
  var all = assetsGetAll(user, {}).data;
  var now = new Date();
  var year = now.getFullYear(), month = now.getMonth() + 1;
  var history = assetsSheetToObjects(sh);
  var count = 0;
  all.forEach(function(os) {
    if (os['ОС/Инвентар'] !== 'ОС' || os['Состояния'] !== 'Балансда') return;
    var cost = parseFloat(os['Рыночный стоимость']) || 0;
    var pct = parseFloat(os['Амортизация %']) || 0.20;
    if (!cost) return;
    var invHist = history.filter(function(r){ return r['Инв. номер'] === os['Инвентарный номер']; });
    if (invHist.some(function(h){ return h['Год'] == year && h['Месяц'] == month; })) return;
    var totalAccum = invHist.reduce(function(s, h){ return s + (parseFloat(h['Амортизация за месяц']) || 0); }, 0);
    if (totalAccum >= cost) return;
    var monthly = Math.min(cost * pct / 12, cost - totalAccum);
    var newAccum = totalAccum + monthly;
    sh.appendRow([os['Инвентарный номер'], os['Наименование'], year, month,
      cost, monthly.toFixed(2), newAccum.toFixed(2), (cost - newAccum).toFixed(2)]);
    count++;
  });
  return {ok: true, count: count};
}

// ══════════════════════════════════════════════════════════════
// АМОРТИЗАЦИЯ — ДОКУМЕНТЫ (ежемесячное закрытие, реестр)
// ══════════════════════════════════════════════════════════════
function ensureAmortDocSheets() {
  var ss = ensureAssetsSheets();
  if (!ss.getSheetByName('Амортизация_Документы')) {
    var sh = ss.insertSheet('Амортизация_Документы');
    sh.getRange(1,1,1,10).setValues([[
      'ID','Дата','Номер','Год','Месяц','Автор','Комментарий',
      'ИтогоБаланс','ИтогоНакоплено','ИтогоНачислено'
    ]]);
    sh.getRange(1,1,1,10).setFontWeight('bold').setBackground('#1a3a5c').setFontColor('#fff');
    sh.setFrozenRows(1);
  }
  var shA = ss.getSheetByName('Амортизация');
  if (shA.getLastColumn() < 9) {
    shA.getRange(1,9).setValue('DocID');
    shA.getRange(1,9).setFontWeight('bold').setBackground('#1a3a5c').setFontColor('#fff');
  }
  return ss;
}

function assetsAmortPreview(user, payload) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  var year = Number(payload.year), month = Number(payload.month);
  if (!year || !month) return {ok: false, error: 'Укажите период'};

  var ss = ensureAmortDocSheets();
  var docs = assetsSheetToObjects(ss.getSheetByName('Амортизация_Документы'));
  if (docs.some(function(d){ return Number(d['Год']) === year && Number(d['Месяц']) === month; })) {
    return {ok: false, error: 'Документ за ' + month + '.' + year + ' уже создан'};
  }

  var all = assetsGetAll(user, {}).data;
  var history = assetsSheetToObjects(ss.getSheetByName('Амортизация'));
  var histByInv = {};
  history.forEach(function(h) {
    var k = h['Инв. номер'];
    histByInv[k] = (histByInv[k] || 0) + (parseFloat(h['Амортизация за месяц']) || 0);
  });

  var items = [];
  all.forEach(function(os) {
    if (os['ОС/Инвентар'] !== 'ОС' || os['Состояния'] !== 'Балансда') return;
    var cost = parseFloat(os['Рыночный стоимость']) || 0;
    var pct = parseFloat(os['Амортизация %']) || 0.20;
    if (!cost) return;
    var totalAccum = histByInv[os['Инвентарный номер']] || 0;
    if (totalAccum >= cost) return;
    var monthly = Math.min(cost * pct / 12, cost - totalAccum);
    items.push({
      invNum: os['Инвентарный номер'], name: os['Наименование'], dept: os['Подразделения'],
      cost: cost, accumBefore: Math.round(totalAccum * 100) / 100,
      amount: Math.round(monthly * 100) / 100,
      residualAfter: Math.round((cost - totalAccum - monthly) * 100) / 100
    });
  });
  return {ok: true, items: items, year: year, month: month};
}

function assetsAmortCreateDocument(user, payload) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  var year = Number(payload.year), month = Number(payload.month);
  var items = (payload.items || []).filter(function(i){ return i.include; });
  if (!year || !month) return {ok: false, error: 'Укажите период'};
  if (!items.length) return {ok: false, error: 'Нет объектов для начисления'};

  // Лок нужен, т.к. повторный клик до ответа сервера иначе создаёт несколько
  // документов за один и тот же период (проверка "период уже занят" иначе
  // не успевает увидеть чужую ещё не сохранённую запись).
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (e) {
    return {ok: false, error: 'Идёт создание другого документа, повторите через несколько секунд'};
  }

  try {
    var ss = ensureAmortDocSheets();
    var shDoc = ss.getSheetByName('Амортизация_Документы');
    var shAmort = ss.getSheetByName('Амортизация');

    var docs = assetsSheetToObjects(shDoc);
    if (docs.some(function(d){ return Number(d['Год']) === year && Number(d['Месяц']) === month; })) {
      return {ok: false, error: 'Документ за этот период уже существует'};
    }

    var docId = Utilities.getUuid();
    var docNum = docs.length + 1;
    var now = new Date();
    var history = assetsSheetToObjects(shAmort);
    var histByInv = {};
    history.forEach(function(h) {
      var k = h['Инв. номер'];
      histByInv[k] = (histByInv[k] || 0) + (parseFloat(h['Амортизация за месяц']) || 0);
    });

    var totalBalance = 0, totalAccumAfter = 0, totalAccrued = 0;
    var newRows = [];
    items.forEach(function(it) {
      var totalAccum = histByInv[it.invNum] || 0;
      var amount = Number(it.amount) || 0;
      var newAccum = totalAccum + amount;
      newRows.push([it.invNum, it.name, year, month, it.cost, amount.toFixed(2), newAccum.toFixed(2), (it.cost - newAccum).toFixed(2), docId]);
      totalBalance += Number(it.cost) || 0;
      totalAccumAfter += newAccum;
      totalAccrued += amount;
    });

    // Одна пакетная запись вместо appendRow на каждый объект — основная причина медленной работы.
    if (newRows.length) {
      var startRow = shAmort.getLastRow() + 1;
      shAmort.getRange(startRow, 1, newRows.length, newRows[0].length).setValues(newRows);
    }

    shDoc.appendRow([docId, now, docNum, year, month, user.fio, payload.comment || '', totalBalance, totalAccumAfter, totalAccrued]);

    return {ok: true, id: docId, count: items.length};
  } finally {
    lock.releaseLock();
  }
}

function assetsAmortDeleteDocument(user, payload) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  var ss = ensureAmortDocSheets();
  var shDoc = ss.getSheetByName('Амортизация_Документы');
  var shAmort = ss.getSheetByName('Амортизация');

  var docData = shDoc.getDataRange().getValues();
  var docRowIdx = -1;
  for (var i = 1; i < docData.length; i++) {
    if (docData[i][0] === payload.id) { docRowIdx = i + 1; break; }
  }
  if (docRowIdx === -1) return {ok: false, error: 'Документ не найден'};
  shDoc.deleteRow(docRowIdx);

  var amortData = shAmort.getDataRange().getValues();
  var docIdCol = 8; // колонка 'DocID' (9-я, индекс 8)
  for (var j = amortData.length - 1; j >= 1; j--) {
    if (amortData[j][docIdCol] === payload.id) shAmort.deleteRow(j + 1);
  }
  return {ok: true};
}

function assetsAmortListDocuments(user) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  var rows = assetsSheetToObjects(ensureAmortDocSheets().getSheetByName('Амортизация_Документы'));
  rows.reverse();
  return {ok: true, data: rows};
}

function assetsAmortGetDocument(user, payload) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  var ss = ensureAmortDocSheets();
  var docs = assetsSheetToObjects(ss.getSheetByName('Амортизация_Документы'));
  var meta = docs.filter(function(d){ return d['ID'] === payload.id; })[0];
  if (!meta) return {ok: false, error: 'Документ не найден'};
  var rows = assetsSheetToObjects(ss.getSheetByName('Амортизация')).filter(function(r){ return r['DocID'] === payload.id; });
  return {ok: true, meta: meta, rows: rows};
}

// ══════════════════════════════════════════════════════════════
// УВЕДОМЛЕНИЯ
// ══════════════════════════════════════════════════════════════
function assetsGetAlerts(user) {
  var all = assetsGetAll(user, {}).data;
  var now = new Date();
  var alerts = [];
  var amortRows = assetsSheetToObjects(ensureAssetsSheets().getSheetByName('Амортизация'));

  all.forEach(function(os) {
    if (os['Состояния'] === 'Списан') return;
    var inv = os['Инвентарный номер'], name = os['Наименование'], dept = os['Подразделения'];
    var cost = parseFloat(os['Рыночный стоимость']) || 0;
    var life = parseFloat(os['Полезный срок службы']) || 0;
    var dateIn = os['Дата поступление'] ? new Date(os['Дата поступление']) : null;

    if (os['ОС/Инвентар'] === 'ОС' && cost > 0) {
      var hist = amortRows.filter(function(r){ return r['Инв. номер'] === inv; });
      if (hist.length) {
        var lastH = hist[hist.length - 1];
        var residual = parseFloat(lastH['Остаточная стоимость']) || 0;
        if (residual <= 0 || residual < cost * 0.01) {
          alerts.push({type: 'fully_amort', level: 'warning', inv: inv, name: name, dept: dept,
            msg: 'Полностью амортизирован (остаток: ' + residual.toFixed(0) + ' сум)'});
        }
      }
    }

    if (life > 0 && dateIn) {
      var expiryDate = new Date(dateIn);
      expiryDate.setFullYear(expiryDate.getFullYear() + life);
      if (expiryDate < now) {
        var yearsOver = Math.floor((now - expiryDate) / (365.25 * 24 * 3600 * 1000));
        alerts.push({type: 'expired', level: 'danger', inv: inv, name: name, dept: dept,
          msg: 'Срок службы истёк ' + (yearsOver > 0 ? yearsOver + ' лет назад' : 'в этом году'),
          expiry: Utilities.formatDate(expiryDate, 'Asia/Tashkent', 'dd.MM.yyyy')});
      } else {
        var monthsLeft = Math.floor((expiryDate - now) / (30.5 * 24 * 3600 * 1000));
        if (monthsLeft <= 12) {
          alerts.push({type: 'expiring_soon', level: 'info', inv: inv, name: name, dept: dept,
            msg: 'Срок службы истекает через ' + monthsLeft + ' мес.',
            expiry: Utilities.formatDate(expiryDate, 'Asia/Tashkent', 'dd.MM.yyyy')});
        }
      }
    }
  });

  return {ok: true, alerts: alerts, counts: {
    danger:  alerts.filter(function(a){ return a.level === 'danger'; }).length,
    warning: alerts.filter(function(a){ return a.level === 'warning'; }).length,
    info:    alerts.filter(function(a){ return a.level === 'info'; }).length
  }};
}

// ══════════════════════════════════════════════════════════════
// ДАШБОРД
// ══════════════════════════════════════════════════════════════
function assetsGetDashboardCharts(user) {
  var res = assetsGetAll(user, {});
  var all = res.data.filter(function(o){ return o['Состояния'] !== 'Списан'; });

  var byCost = {};
  all.forEach(function(o) {
    var d = o['Подразделения'] || '—';
    byCost[d] = (byCost[d] || 0) + (parseFloat(o['Рыночный стоимость']) || 0);
  });

  var byVid = {};
  all.forEach(function(o) {
    var v = o['Вид'] || '—';
    byVid[v] = (byVid[v] || 0) + (parseFloat(o['Рыночный стоимость']) || 0);
  });

  var amortRows = assetsSheetToObjects(ensureAssetsSheets().getSheetByName('Амортизация'));
  var lastByInv = {};
  amortRows.forEach(function(r){ lastByInv[r['Инв. номер']] = r; });
  var totalOriginal = 0, totalAccum = 0, totalResidual = 0;
  Object.keys(lastByInv).forEach(function(k) {
    var r = lastByInv[k];
    totalOriginal += parseFloat(r['Стоимость нач.']) || 0;
    totalAccum    += parseFloat(r['Накопл. амортизация']) || 0;
    totalResidual += parseFloat(r['Остаточная стоимость']) || 0;
  });

  var osCount = 0, invCount = 0, osCost = 0;
  all.forEach(function(o) {
    if (o['ОС/Инвентар'] === 'ОС') { osCount++; osCost += parseFloat(o['Рыночный стоимость']) || 0; }
    if (o['ОС/Инвентар'] === 'ИНВ') invCount++;
  });

  function sortedEntries(obj) {
    return Object.keys(obj).map(function(k){ return [k, obj[k]]; }).sort(function(a,b){ return b[1]-a[1]; });
  }

  return {ok: true,
    byCost: sortedEntries(byCost),
    byVid: sortedEntries(byVid).slice(0, 8),
    amort: {totalOriginal: totalOriginal, totalAccum: totalAccum, totalResidual: totalResidual},
    types: {osCount: osCount, invCount: invCount, osCost: osCost}
  };
}

// ══════════════════════════════════════════════════════════════
// ОТЧЁТЫ
// ══════════════════════════════════════════════════════════════
function assetsGetReportByDept(user, payload) {
  var res = assetsGetAll(user, {});
  var dept = payload && payload.dept;
  var all = dept ? res.data.filter(function(o){ return o['Подразделения'] === dept; }) : res.data;

  var amortRows = assetsSheetToObjects(ensureAssetsSheets().getSheetByName('Амортизация'));
  var lastAmort = {};
  amortRows.forEach(function(r){ lastAmort[r['Инв. номер']] = r; });

  var totalCost = 0, totalAccum = 0, totalResidual = 0;
  var enriched = all.map(function(os) {
    var am = lastAmort[os['Инвентарный номер']];
    var accum = am ? (parseFloat(am['Накопл. амортизация']) || 0) : 0;
    var residual = am ? (parseFloat(am['Остаточная стоимость']) || 0) : (parseFloat(os['Рыночный стоимость']) || 0);
    totalCost += parseFloat(os['Рыночный стоимость']) || 0;
    totalAccum += accum;
    totalResidual += residual;
    var copy = {};
    Object.keys(os).forEach(function(k){ copy[k] = os[k]; });
    copy['накоплено'] = accum;
    copy['остаток'] = residual;
    return copy;
  });

  return {ok: true, data: enriched, dept: dept || 'Все', totalCost: totalCost, totalAccum: totalAccum, totalResidual: totalResidual};
}

function assetsGetAmortReport(user, payload) {
  var rows = assetsSheetToObjects(ensureAssetsSheets().getSheetByName('Амортизация'));
  if (!assetsFullAccess(user)) {
    var allowed = {};
    assetsGetAll(user, {}).data.forEach(function(o){ allowed[o['Инвентарный номер']] = true; });
    rows = rows.filter(function(r){ return allowed[r['Инв. номер']]; });
  }
  var yearFrom = payload && payload.yearFrom, yearTo = payload && payload.yearTo;
  if (yearFrom) rows = rows.filter(function(r){ return parseInt(r['Год'], 10) >= parseInt(yearFrom, 10); });
  if (yearTo)   rows = rows.filter(function(r){ return parseInt(r['Год'], 10) <= parseInt(yearTo, 10); });
  var totalMonth = rows.reduce(function(s, r){ return s + (parseFloat(r['Амортизация за месяц']) || 0); }, 0);
  return {ok: true, data: rows, totalMonth: totalMonth};
}

function assetsGetReportByStorage(user, payload) {
  var res = assetsGetAll(user, {});
  var dept = payload && payload.dept;
  var all = dept ? res.data.filter(function(o){ return o['Подразделения'] === dept; }) : res.data;
  var byStorage = {};
  var totalCost = 0;
  all.forEach(function(o) {
    var loc = o['Адрес'] || '— Не указано —';
    if (!byStorage[loc]) byStorage[loc] = [];
    byStorage[loc].push(o);
    totalCost += parseFloat(o['Рыночный стоимость']) || 0;
  });
  return {ok: true, data: all, byStorage: byStorage, dept: dept || 'Все', totalCost: totalCost};
}

function assetsGetReportByResponsible(user, payload) {
  var res = assetsGetAll(user, {});
  var dept = payload && payload.dept;
  var all = dept ? res.data.filter(function(o){ return o['Подразделения'] === dept; }) : res.data;
  var byResp = {};
  var totalCost = 0;
  all.forEach(function(o) {
    var r = o['Ответственный лицо'] || '— Не указано —';
    if (!byResp[r]) byResp[r] = [];
    byResp[r].push(o);
    totalCost += parseFloat(o['Рыночный стоимость']) || 0;
  });
  return {ok: true, data: all, byResp: byResp, dept: dept || 'Все', totalCost: totalCost};
}

// ══════════════════════════════════════════════════════════════
// ИНВЕНТАРИЗАЦИЯ
// ══════════════════════════════════════════════════════════════
function assetsCreateInventory(user, payload) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  if (!payload.name) return {ok: false, error: 'Укажите название инвентаризации'};
  var ss = ensureAssetsSheets();
  var sh = ss.getSheetByName('Инвентаризации');
  var num = sh.getLastRow();
  var invNum = 'ИНВЗ-' + ('0000' + num).slice(-4);
  var now = Utilities.formatDate(new Date(), 'Asia/Tashkent', 'yyyy-MM-dd');

  var dept = payload.dept || '';
  var allOS = assetsGetAll(user, {}).data;
  var filtered = dept
    ? allOS.filter(function(o){ return o['Подразделения'] === dept && o['Состояния'] === 'Балансда'; })
    : allOS.filter(function(o){ return o['Состояния'] === 'Балансда'; });

  sh.appendRow([invNum, payload.name, now, '', dept || 'Все', 'Открыта', user.fio, filtered.length, 0, filtered.length]);

  var resSh = ss.getSheetByName('Инв. результаты');
  filtered.forEach(function(os) {
    resSh.appendRow([invNum, os['Инвентарный номер'], os['Наименование'], os['Подразделения'],
      os['Адрес'] || '', '', '', 'Ожидается', '', '', '']);
  });

  return {ok: true, invNum: invNum, total: filtered.length};
}

function assetsGetInventories(user) {
  var rows = assetsSheetToObjects(ensureAssetsSheets().getSheetByName('Инвентаризации'));
  var full = assetsFullAccess(user);
  var visible = full ? rows : rows.filter(function(r){ return r['Подразделение'] === user.osDept || r['Подразделение'] === 'Все'; });
  visible.reverse();
  return {ok: true, data: visible};
}

function assetsGetInventoryDetail(user, payload) {
  var rows = assetsSheetToObjects(ensureAssetsSheets().getSheetByName('Инв. результаты'))
    .filter(function(r){ return r['№ инв-ции'] === payload.invNum; });
  if (!assetsFullAccess(user)) rows = rows.filter(function(r){ return r['Подразделение'] === user.osDept; });
  return {ok: true, data: rows};
}

function assetsConfirmPresence(user, payload) {
  var ss = ensureAssetsSheets();
  var invSh = ss.getSheetByName('Инвентаризации');
  var invRows = assetsSheetToObjects(invSh);
  var inv = invRows.filter(function(r){ return r['№ инв-ции'] === payload.invNum; })[0];
  if (!inv) return {ok: false, error: 'Инвентаризация не найдена'};
  if (inv['Статус'] === 'Закрыта') return {ok: false, error: 'Инвентаризация уже закрыта'};
  if (!assetsFullAccess(user) && inv['Подразделение'] !== user.osDept && inv['Подразделение'] !== 'Все') {
    return {ok: false, error: 'Нет доступа к этой инвентаризации'};
  }

  var resSh = ss.getSheetByName('Инв. результаты');
  var data = resSh.getDataRange().getValues();
  var headers = data[0];
  var invCol = headers.indexOf('№ инв-ции'), osCol = headers.indexOf('Инв. номер'),
      factACol = headers.indexOf('Фактический адрес'), condCol = headers.indexOf('Состояние факт.'),
      statCol = headers.indexOf('Статус'), dateCol = headers.indexOf('Дата сканирования'),
      whoCol = headers.indexOf('Кто сканировал'), noteCol = headers.indexOf('Примечание');

  var now = Utilities.formatDate(new Date(), 'Asia/Tashkent', 'yyyy-MM-dd HH:mm');
  var found = false;
  for (var i = 1; i < data.length; i++) {
    if (data[i][invCol] === payload.invNum && data[i][osCol] === payload.osInvNum) {
      resSh.getRange(i + 1, factACol + 1).setValue(payload.factAddr || '');
      resSh.getRange(i + 1, condCol + 1).setValue(payload.condition || '');
      resSh.getRange(i + 1, statCol + 1).setValue('Найдено');
      resSh.getRange(i + 1, dateCol + 1).setValue(now);
      resSh.getRange(i + 1, whoCol + 1).setValue(user.fio);
      resSh.getRange(i + 1, noteCol + 1).setValue(payload.note || '');
      found = true;
      break;
    }
  }
  if (!found) {
    resSh.appendRow([payload.invNum, payload.osInvNum, payload.osName || '', user.osDept || '',
      '', payload.factAddr || '', payload.condition || '', 'Излишек', now, user.fio, payload.note || '']);
  }
  assetsUpdateInventoryCounts(payload.invNum);
  return {ok: true};
}

function assetsUpdateInventoryCounts(invNum) {
  var ss = ensureAssetsSheets();
  var resSh = ss.getSheetByName('Инв. результаты');
  var invSh = ss.getSheetByName('Инвентаризации');
  var rows = assetsSheetToObjects(resSh).filter(function(r){ return r['№ инв-ции'] === invNum; });
  var found = rows.filter(function(r){ return r['Статус'] === 'Найдено' || r['Статус'] === 'Излишек'; }).length;
  var missed = rows.filter(function(r){ return r['Статус'] === 'Ожидается'; }).length;

  var data = invSh.getDataRange().getValues();
  var headers = data[0];
  var numCol = headers.indexOf('№ инв-ции'), foundCol = headers.indexOf('Найдено'), missedCol = headers.indexOf('Не найдено');
  for (var i = 1; i < data.length; i++) {
    if (data[i][numCol] === invNum) {
      invSh.getRange(i + 1, foundCol + 1).setValue(found);
      invSh.getRange(i + 1, missedCol + 1).setValue(missed);
      break;
    }
  }
}

function assetsCloseInventory(user, payload) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  var sh = ensureAssetsSheets().getSheetByName('Инвентаризации');
  var data = sh.getDataRange().getValues();
  var headers = data[0];
  var numCol = headers.indexOf('№ инв-ции'), statusCol = headers.indexOf('Статус'), closeCol = headers.indexOf('Дата закрытия');
  var now = Utilities.formatDate(new Date(), 'Asia/Tashkent', 'yyyy-MM-dd');
  for (var i = 1; i < data.length; i++) {
    if (data[i][numCol] === payload.invNum) {
      sh.getRange(i + 1, statusCol + 1).setValue('Закрыта');
      sh.getRange(i + 1, closeCol + 1).setValue(now);
      return {ok: true};
    }
  }
  return {ok: false, error: 'Не найдено'};
}

function assetsGetInventoryReport(user, payload) {
  var ss = ensureAssetsSheets();
  var invRows = assetsSheetToObjects(ss.getSheetByName('Инвентаризации'));
  var inv = invRows.filter(function(r){ return r['№ инв-ции'] === payload.invNum; })[0];
  if (!inv) return {ok: false, error: 'Инвентаризация не найдена'};
  var rows = assetsSheetToObjects(ss.getSheetByName('Инв. результаты')).filter(function(r){ return r['№ инв-ции'] === payload.invNum; });
  return {ok: true, inv: inv,
    found: rows.filter(function(r){ return r['Статус'] === 'Найдено'; }),
    missed: rows.filter(function(r){ return r['Статус'] === 'Ожидается'; }),
    surplus: rows.filter(function(r){ return r['Статус'] === 'Излишек'; })};
}

// ══════════════════════════════════════════════════════════════
// ПУБЛИЧНЫЕ ФУНКЦИИ (без логина) — для QR-карточки/наклеек/фото
// Вызываются напрямую через google.script.run из AssetsCard/AssetsLabel/AssetsPhoto,
// НЕ через handleAction — поэтому доступны без токена/сессии.
// ══════════════════════════════════════════════════════════════
function assetsGetByInvPublic(invNum) {
  try {
    var sh = ensureAssetsSheets().getSheetByName('База ОС');
    if (!sh) return null;
    var data = sh.getDataRange().getValues();
    var headers = data[0];
    var invCol = headers.indexOf('Инвентарный номер');
    if (invCol === -1) return null;
    var searchInv = String(invNum).trim();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][invCol] || '').trim() === searchInv) {
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
          if (!headers[j]) continue;
          var val = data[i][j];
          if (val instanceof Date) val = Utilities.formatDate(val, 'Asia/Tashkent', 'yyyy-MM-dd');
          else if (val === null || typeof val === 'object') val = '';
          obj[headers[j]] = val;
        }
        return obj;
      }
    }
    return null;
  } catch (e) { return null; }
}

function assetsGetAmortHistoryPublic(invNum) {
  try {
    var rows = assetsSheetToObjects(ensureAssetsSheets().getSheetByName('Амортизация'))
      .filter(function(r){ return r['Инв. номер'] === invNum; });
    return {ok: true, data: rows};
  } catch (e) { return {ok: true, data: []}; }
}

function assetsGetOpenInventoriesPublic() {
  try {
    var rows = assetsSheetToObjects(ensureAssetsSheets().getSheetByName('Инвентаризации'))
      .filter(function(r){ return r['Статус'] === 'Открыта'; });
    return rows.map(function(r){ return {num: r['№ инв-ции'], name: r['Название'], dept: r['Подразделение']}; });
  } catch (e) { return []; }
}

function assetsConfirmPresencePublic(invNum, osInvNum, osName, factAddr, condition, note) {
  try {
    var ss = ensureAssetsSheets();
    var invRows = assetsSheetToObjects(ss.getSheetByName('Инвентаризации'));
    var inv = invRows.filter(function(r){ return r['№ инв-ции'] === invNum; })[0];
    if (!inv) return {ok: false, error: 'Инвентаризация не найдена'};
    if (inv['Статус'] === 'Закрыта') return {ok: false, error: 'Инвентаризация уже закрыта'};

    var resSh = ss.getSheetByName('Инв. результаты');
    var data = resSh.getDataRange().getValues();
    var headers = data[0];
    var invCol = headers.indexOf('№ инв-ции'), osCol = headers.indexOf('Инв. номер'),
        factACol = headers.indexOf('Фактический адрес'), condCol = headers.indexOf('Состояние факт.'),
        statCol = headers.indexOf('Статус'), dateCol = headers.indexOf('Дата сканирования'),
        whoCol = headers.indexOf('Кто сканировал'), noteCol = headers.indexOf('Примечание');
    var now = Utilities.formatDate(new Date(), 'Asia/Tashkent', 'yyyy-MM-dd HH:mm');
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (data[i][invCol] === invNum && data[i][osCol] === osInvNum) {
        resSh.getRange(i + 1, factACol + 1).setValue(factAddr || '');
        resSh.getRange(i + 1, condCol + 1).setValue(condition || '');
        resSh.getRange(i + 1, statCol + 1).setValue('Найдено');
        resSh.getRange(i + 1, dateCol + 1).setValue(now);
        resSh.getRange(i + 1, whoCol + 1).setValue('QR-скан');
        resSh.getRange(i + 1, noteCol + 1).setValue(note || '');
        found = true;
        break;
      }
    }
    if (!found) {
      resSh.appendRow([invNum, osInvNum, osName || '', '', '', factAddr || '', condition || '', 'Излишек', now, 'QR-скан', note || '']);
    }
    assetsUpdateInventoryCounts(invNum);
    return {ok: true};
  } catch (e) { return {ok: false, error: e.message}; }
}

function assetsGetAllPublic() {
  try {
    var rows = assetsSheetToObjects(ensureAssetsSheets().getSheetByName('База ОС'));
    return rows.filter(function(r){ return r['Состояния'] !== 'Списан'; });
  } catch (e) { return []; }
}

var ASSETS_PHOTO_ROOT_NAME = 'GOLD LAVASH — Фото ОС';

function assetsGetOrCreateFolder(parentFolder, name) {
  var folders = parentFolder.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return parentFolder.createFolder(name);
}

function assetsGetPhotoFolder(dept) {
  var root = DriveApp.getRootFolder();
  var rootFolder = assetsGetOrCreateFolder(root, ASSETS_PHOTO_ROOT_NAME);
  if (!dept) return rootFolder;
  return assetsGetOrCreateFolder(rootFolder, dept);
}

function assetsUploadPhotoPublic(base64Data, fileName, dept, invNum) {
  try {
    var clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    var decoded = Utilities.base64Decode(clean);
    var blob = Utilities.newBlob(decoded, 'image/jpeg', fileName || ('photo_' + new Date().getTime() + '.jpg'));
    var folder = assetsGetPhotoFolder(dept || '');
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var fileId = file.getId();
    // uc?export=view часто не отдаёт саму картинку в <img> (Google подменяет
    // предупреждением) — thumbnail-эндпоинт отдаёт байты картинки надёжно.
    var url = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1000';
    if (invNum) assetsUpdateFieldPublic(invNum, 'Фото URL', url);
    return {ok: true, fileId: fileId, url: url};
  } catch (e) {
    return {ok: false, error: e.message};
  }
}

function assetsUpdateFieldPublic(invNum, field, value) {
  try {
    var allowed = ['Фото URL', 'QR-код', 'Ссылка на карточку'];
    if (allowed.indexOf(field) === -1) return {ok: false, error: 'Поле не разрешено'};
    assetsUpdateFieldInternal(invNum, field, value);
    return {ok: true};
  } catch (e) { return {ok: false, error: e.message}; }
}

// ══════════════════════════════════════════════════════════════
// МАССОВАЯ ГЕНЕРАЦИЯ QR/ССЫЛОК (на текущий домен приложения)
// ══════════════════════════════════════════════════════════════
function assetsGenerateQRForExisting(user) {
  requireRole(user, [ROLES.ADMIN, ROLES.OS_BUKH]);
  var sh = ensureAssetsSheets().getSheetByName('База ОС');
  var data = sh.getDataRange().getValues();
  var headers = data[0];
  var invCol = headers.indexOf('Инвентарный номер');
  var qrCol = headers.indexOf('QR-код');
  var cardCol = headers.indexOf('Ссылка на карточку');
  if (invCol === -1) return {ok: false, error: 'Колонка не найдена'};

  var appUrl = ScriptApp.getService().getUrl().replace('/dev', '/exec');
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var inv = String(data[i][invCol] || '').trim();
    if (!inv) { rows.push(null); continue; }
    var cardUrl = appUrl + '?page=os-card&inv=' + encodeURIComponent(inv);
    var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(cardUrl);
    rows.push([cardUrl, qrUrl]);
  }
  var updated = 0;
  for (var k = 0; k < rows.length; k++) {
    if (!rows[k]) continue;
    if (cardCol !== -1) sh.getRange(k + 2, cardCol + 1).setValue(rows[k][0]);
    sh.getRange(k + 2, qrCol + 1).setValue(rows[k][1]);
    updated++;
  }
  return {ok: true, updated: updated};
}
