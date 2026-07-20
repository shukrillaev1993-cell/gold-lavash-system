// ============================================================
// GOLD LAVASH — МОДУЛЬ ЗАВСКЛАД СЫРЬЯ
// Номенклатура материалов, приход от поставщиков, выдача в цеха,
// материальный отчёт (приход/расход/остаток)
// ============================================================

// ============================================================
// ИНИЦИАЛИЗАЦИЯ ЛИСТОВ
// ============================================================
function ensureSkladSheets() {
  var ss = ensureProductionDB();

  // ── Номенклатура материалов (создаёт/редактирует Администратор) ──
  if (!ss.getSheetByName('Номенклатура_материалов')) {
    var shNom = ss.insertSheet('Номенклатура_материалов');
    shNom.getRange(1,1,1,5).setValues([[
      'ID', 'Наименование', 'Ед. изм.', 'Цена', 'Активен'
    ]]);
    shNom.getRange(1,1,1,5).setFontWeight('bold').setBackground('#4527A0').setFontColor('#fff');
    shNom.setFrozenRows(1);
  }

  // ── Поставщики (создаёт/редактирует/удаляет Администратор) ──
  if (!ss.getSheetByName('Поставщики')) {
    var shSup = ss.insertSheet('Поставщики');
    shSup.getRange(1,1,1,2).setValues([[
      'ID', 'Наименование'
    ]]);
    shSup.getRange(1,1,1,2).setFontWeight('bold').setBackground('#37474F').setFontColor('#fff');
    shSup.setFrozenRows(1);
  }

  // ── Приход материалов от поставщиков ──
  if (!ss.getSheetByName('Приход_материалов')) {
    var shIn = ss.insertSheet('Приход_материалов');
    shIn.getRange(1,1,1,10).setValues([[
      'ID записи', 'Дата', 'Поставщик', '№ накладной', 'Материал',
      'Кол-во', 'Цена за ед.', 'Сумма', 'Кто принял', 'ID документа'
    ]]);
    shIn.getRange(1,1,1,10).setFontWeight('bold').setBackground('#2E7D32').setFontColor('#fff');
    shIn.setFrozenRows(1);
    shIn.getRange(2, 2, shIn.getMaxRows()-1, 1).setNumberFormat('@'); // дата как текст
  } else {
    fixSkladDateColumn(ss.getSheetByName('Приход_материалов'), 2);
  }

  // ── Накладные на выдачу в цеха (заголовок документа) ──
  if (!ss.getSheetByName('Накладные_выдачи')) {
    var shOutH = ss.insertSheet('Накладные_выдачи');
    shOutH.getRange(1,1,1,8).setValues([[
      'ID накладной', '№ накладной', 'Дата', 'Получатель ФИО', 'Получатель должность',
      'Кто выдал', 'Статус', 'Причина отказа'
    ]]);
    shOutH.getRange(1,1,1,8).setFontWeight('bold').setBackground('#AD1457').setFontColor('#fff');
    shOutH.setFrozenRows(1);
    shOutH.getRange(2, 3, shOutH.getMaxRows()-1, 1).setNumberFormat('@');
  } else {
    fixSkladDateColumn(ss.getSheetByName('Накладные_выдачи'), 3);
  }

  // ── Строки накладных на выдачу (материал + кол-во) ──
  if (!ss.getSheetByName('Накладные_выдачи_строки')) {
    var shOutL = ss.insertSheet('Накладные_выдачи_строки');
    shOutL.getRange(1,1,1,3).setValues([[
      'ID накладной', 'Материал', 'Кол-во'
    ]]);
    shOutL.getRange(1,1,1,3).setFontWeight('bold').setBackground('#880E4F').setFontColor('#fff');
    shOutL.setFrozenRows(1);
  }

  return ss;
}

function fixSkladDateColumn(sh, col) {
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return;
  var range = sh.getRange(2, col, lastRow - 1, 1);
  var values = range.getValues();
  var needsFix = values.some(function(v) { return v[0] instanceof Date; });
  if (!needsFix) return;

  for (var i = 0; i < values.length; i++) {
    if (values[i][0] instanceof Date) {
      values[i][0] = formatDateOnly(values[i][0]);
    }
  }
  range.setNumberFormat('@');
  range.setValues(values);
}

// ============================================================
// НОМЕНКЛАТУРА МАТЕРИАЛОВ (Администратор)
// ============================================================

function adminGetMaterials(user) {
  requireRole(user, [ROLES.ADMIN]);
  var ss = ensureSkladSheets();
  var sh = ss.getSheetByName('Номенклатура_материалов');
  var rows = sh.getDataRange().getValues();
  var materials = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    materials.push({
      id: rows[i][0], name: rows[i][1], unit: rows[i][2],
      price: Number(rows[i][3]) || 0, active: rows[i][4] !== false && rows[i][4] !== 'FALSE'
    });
  }
  return {ok: true, materials: materials};
}

function adminSaveMaterial(user, payload) {
  requireRole(user, [ROLES.ADMIN]);
  var ss = ensureSkladSheets();
  var sh = ss.getSheetByName('Номенклатура_материалов');
  var rows = sh.getDataRange().getValues();

  if (payload.id) {
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === payload.id) {
        sh.getRange(i+1, 2, 1, 4).setValues([[
          payload.name, payload.unit, Number(payload.price)||0, payload.active !== false
        ]]);
        return {ok: true};
      }
    }
    return {ok: false, error: 'Материал не найден'};
  }

  var id = Utilities.getUuid();
  sh.appendRow([id, payload.name, payload.unit, Number(payload.price)||0, true]);
  return {ok: true, id: id};
}

function adminDeleteMaterial(user, payload) {
  requireRole(user, [ROLES.ADMIN]);
  var ss = ensureSkladSheets();
  var sh = ss.getSheetByName('Номенклатура_материалов');
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === payload.id) {
      sh.deleteRow(i+1);
      return {ok: true};
    }
  }
  return {ok: false, error: 'Материал не найден'};
}

// Список активных материалов — используется складом сырья при приходе/выдаче
function getActiveMaterials() {
  var ss = ensureSkladSheets();
  var sh = ss.getSheetByName('Номенклатура_материалов');
  var rows = sh.getDataRange().getValues();
  var materials = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var active = rows[i][4] !== false && rows[i][4] !== 'FALSE';
    if (!active) continue;
    materials.push({id: rows[i][0], name: rows[i][1], unit: rows[i][2], price: Number(rows[i][3])||0});
  }
  return materials;
}

function skladGetMaterials(user) {
  requireRole(user, [ROLES.ZAV_SKLAD_S, ROLES.ADMIN, ROLES.ZAV_PROD, ROLES.BRIGADIR, ROLES.TESTODEL, ROLES.UPAKOVSHCHITSA]);
  return {ok: true, materials: getActiveMaterials()};
}

// ─── Список сотрудников цеха (для выбора получателя при выдаче) ──
function skladGetCellWorkers(user) {
  requireRole(user, [ROLES.ZAV_SKLAD_S, ROLES.ADMIN]);
  var ss = getMainDB();
  var sh = ss.getSheetByName('Пользователи');
  var rows = sh.getDataRange().getValues();
  var workers = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var role = rows[i][3];
    if ([ROLES.TESTODEL, ROLES.UPAKOVSHCHITSA, ROLES.BRIGADIR].indexOf(role) === -1) continue;
    if (rows[i][7] === false || rows[i][7] === 'FALSE') continue; // только активные
    workers.push({fio: rows[i][4], role: role});
  }
  return {ok: true, workers: workers};
}

// ============================================================
// ПОСТАВЩИКИ (Администратор)
// ============================================================

function adminGetSuppliers(user) {
  requireRole(user, [ROLES.ADMIN]);
  var ss = ensureSkladSheets();
  var sh = ss.getSheetByName('Поставщики');
  var rows = sh.getDataRange().getValues();
  var suppliers = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    suppliers.push({id: rows[i][0], name: rows[i][1]});
  }
  return {ok: true, suppliers: suppliers};
}

function adminSaveSupplier(user, payload) {
  requireRole(user, [ROLES.ADMIN]);
  var ss = ensureSkladSheets();
  var sh = ss.getSheetByName('Поставщики');
  var rows = sh.getDataRange().getValues();

  if (payload.id) {
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === payload.id) {
        sh.getRange(i+1, 2).setValue(payload.name);
        return {ok: true};
      }
    }
    return {ok: false, error: 'Поставщик не найден'};
  }

  var id = Utilities.getUuid();
  sh.appendRow([id, payload.name]);
  return {ok: true, id: id};
}

function adminDeleteSupplier(user, payload) {
  requireRole(user, [ROLES.ADMIN]);
  var ss = ensureSkladSheets();
  var sh = ss.getSheetByName('Поставщики');
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === payload.id) {
      sh.deleteRow(i+1);
      return {ok: true};
    }
  }
  return {ok: false, error: 'Поставщик не найден'};
}

// Список поставщиков — для Завсклад сырья при оформлении прихода
function skladGetSuppliers(user) {
  requireRole(user, [ROLES.ZAV_SKLAD_S, ROLES.ADMIN]);
  var ss = ensureSkladSheets();
  var sh = ss.getSheetByName('Поставщики');
  var rows = sh.getDataRange().getValues();
  var suppliers = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    suppliers.push({id: rows[i][0], name: rows[i][1]});
  }
  return {ok: true, suppliers: suppliers};
}

// ============================================================
// ПРИХОД МАТЕРИАЛОВ ОТ ПОСТАВЩИКОВ (Завсклад сырья)
// ============================================================

// payload = {date, supplier, invoiceNo, items: [{material, qty, price}]}
// Для обратной совместимости также поддерживается старый формат:
// payload = {date, supplier, invoiceNo, material, qty, price}
function skladAddIncoming(user, payload) {
  requireRole(user, [ROLES.ZAV_SKLAD_S, ROLES.ADMIN]);
  var ss = ensureSkladSheets();
  var sh = ss.getSheetByName('Приход_материалов');

  var dateStr = payload.date || formatDateOnly(new Date());

  var items = Array.isArray(payload.items) ? payload.items.slice() : [];
  if (!items.length && payload.material) {
    items.push({material: payload.material, qty: payload.qty, price: payload.price});
  }
  items = items.filter(function(it){ return it.material && Number(it.qty) > 0; });

  if (!items.length) {
    return {ok: false, error: 'Укажите хотя бы один материал и количество'};
  }

  var docId = Utilities.getUuid();
  items.forEach(function(it) {
    var qty = Number(it.qty) || 0;
    var price = Number(it.price) || 0;
    var newRow = sh.getLastRow() + 1;
    sh.getRange(newRow, 2).setNumberFormat('@');
    sh.getRange(newRow, 1, 1, 10).setValues([[
      Utilities.getUuid(), dateStr, payload.supplier || '', payload.invoiceNo || '',
      it.material, qty, price, qty * price, user.fio, docId
    ]]);
    warehouseReceiveFromSupplier(it.material, qty);
  });

  logProdAction(ss, user.fio, 'ПРИХОД МАТЕРИАЛОВ', items.length + ' поз. (накл. ' + (payload.invoiceNo||'-') + ')');
  return {ok: true};
}

function skladGetIncoming(user, payload) {
  requireRole(user, [ROLES.ZAV_SKLAD_S, ROLES.ADMIN]);
  var ss = ensureSkladSheets();
  var sh = ss.getSheetByName('Приход_материалов');
  var rows = sh.getDataRange().getValues();

  // Группируем строки по ID документа (rows[i][9]); для старых записей без docId
  // (созданных до этого обновления) используем ID строки как fallback — каждая
  // такая запись останется отдельным документом из одной позиции.
  var docsMap = {};
  var docOrder = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var docId = rows[i][9] || rows[i][0];
    if (!docsMap[docId]) {
      docsMap[docId] = {
        docId: docId, date: normalizeDateCell(rows[i][1]), supplier: rows[i][2],
        invoiceNo: rows[i][3], receivedBy: rows[i][8], items: [], sum: 0
      };
      docOrder.push(docId);
    }
    var qty = Number(rows[i][5]) || 0, price = Number(rows[i][6]) || 0, sum = Number(rows[i][7]) || 0;
    docsMap[docId].items.push({material: rows[i][4], qty: qty, price: price, sum: sum});
    docsMap[docId].sum += sum;
  }

  var list = docOrder.map(function(id){ return docsMap[id]; }).reverse();
  if (list.length > 100) list = list.slice(0, 100); // последние 100 документов
  return {ok: true, list: list};
}

// ============================================================
// ОТЧЁТ ПО ДВИЖЕНИЮ СКЛАДА СЫРЬЯ ЗА ПЕРИОД (приход / расход)
// Расход теперь — это переводы СО склада сырья на другие склады,
// подтверждённые получателем (статус "Принято" в Накладные_перевода).
// ============================================================

function skladGetMaterialReport(user, payload) {
  requireRole(user, [ROLES.ZAV_SKLAD_S, ROLES.ADMIN]);
  ensureSkladSheets();
  var ss = ensureWarehouseSheets();

  var dateFrom = payload && payload.dateFrom ? payload.dateFrom : null;
  var dateTo   = payload && payload.dateTo   ? payload.dateTo   : null;

  var materials = getActiveMaterials();
  var report = {}; // material -> {unit, incoming, outgoing, balance}
  materials.forEach(function(m) {
    report[m.name] = {unit: m.unit, incoming: 0, outgoing: 0, balance: 0};
  });

  var shIn = ss.getSheetByName('Приход_материалов');
  var inRows = shIn.getDataRange().getValues();
  for (var i = 1; i < inRows.length; i++) {
    if (!inRows[i][0]) continue;
    var inDate = normalizeDateCell(inRows[i][1]);
    if (dateFrom && compareDates(inDate, dateFrom) < 0) continue;
    if (dateTo && compareDates(inDate, dateTo) > 0) continue;
    var mat = inRows[i][4];
    if (!report[mat]) report[mat] = {unit: '', incoming: 0, outgoing: 0, balance: 0};
    report[mat].incoming += Number(inRows[i][5]) || 0;
  }

  var shTH = ss.getSheetByName('Накладные_перевода');
  var shTL = ss.getSheetByName('Накладные_перевода_строки');
  var thRows = shTH.getDataRange().getValues();

  // Карта ID накладной -> учитывать ли (перевод СО склада сырья, принят, в нужном периоде)
  var acceptedFromRaw = {};
  for (var h = 1; h < thRows.length; h++) {
    if (!thRows[h][0]) continue;
    if (thRows[h][3] !== WH_RAW_MATERIALS) continue; // только переводы со склада сырья
    if (thRows[h][6] !== 'Принято') continue;
    var trDate = normalizeDateCell(thRows[h][2]);
    if (dateFrom && compareDates(trDate, dateFrom) < 0) continue;
    if (dateTo && compareDates(trDate, dateTo) > 0) continue;
    acceptedFromRaw[thRows[h][0]] = true;
  }

  var tlRows = shTL.getDataRange().getValues();
  for (var j = 1; j < tlRows.length; j++) {
    if (!tlRows[j][0]) continue;
    if (!acceptedFromRaw[tlRows[j][0]]) continue;
    var mat2 = tlRows[j][1];
    if (!report[mat2]) report[mat2] = {unit: '', incoming: 0, outgoing: 0, balance: 0};
    report[mat2].outgoing += Number(tlRows[j][2]) || 0;
  }

  var list = Object.keys(report).map(function(name) {
    var r = report[name];
    r.balance = r.incoming - r.outgoing;
    return {material: name, unit: r.unit, incoming: r.incoming, outgoing: r.outgoing, balance: r.balance};
  });
  list.sort(function(a,b){ return a.material.localeCompare(b.material); });

  return {ok: true, report: list, dateFrom: dateFrom, dateTo: dateTo};
}