// ============================================================
// GOLD LAVASH — МОДУЛЬ СКЛАДОВ И ОСТАТКОВ
// Единая номенклатура (сырьё + готовая продукция).
// Архитектура складов:
//   - "Склад сырья" — центральный склад сырья (Завсклад сырья)
//   - "Склад ГП" — центральный склад готовой продукции (Завсклад ГП)
//   - "Линия X — Сырьё" — сырьё, перемещённое на линию (с подтверждением)
//   - "Линия X — Промежуточный" — фактический расход материалов за
//     смену/партию, списывается БЕЗ подтверждения Тестоделом/Упаковщицей
//     с "Линия X — Сырьё"; готовая продукция перемещается ОТСЮДА на
//     "Склад ГП" уже как обычное перемещение с подтверждением.
// ============================================================

var WH_RAW_MATERIALS = 'Склад сырья';
var WH_FINISHED_GOODS = 'Склад ГП';
var WH_LINE_RAW_SUFFIX = ' — Сырьё';
var WH_LINE_INTERIM_SUFFIX = ' — Промежуточный';

function whLineRaw(liniya)    { return liniya + WH_LINE_RAW_SUFFIX; }
function whLineInterim(liniya){ return liniya + WH_LINE_INTERIM_SUFFIX; }

// ============================================================
// ИНИЦИАЛИЗАЦИЯ ЛИСТОВ
// ============================================================
function ensureWarehouseSheets() {
  var ss = ensureProductionDB();

  // ── Остатки по складам: Склад | Товар | Кол-во ──
  if (!ss.getSheetByName('Остатки_складов')) {
    var shBal = ss.insertSheet('Остатки_складов');
    shBal.getRange(1,1,1,3).setValues([[
      'Склад', 'Товар', 'Кол-во'
    ]]);
    shBal.getRange(1,1,1,3).setFontWeight('bold').setBackground('#00695C').setFontColor('#fff');
    shBal.setFrozenRows(1);
  }

  // ── Заголовок накладных на перевод между складами ──
  if (!ss.getSheetByName('Накладные_перевода')) {
    var shTH = ss.insertSheet('Накладные_перевода');
    shTH.getRange(1,1,1,9).setValues([[
      'ID накладной', '№ накладной', 'Дата', 'Склад-отправитель', 'Склад-получатель',
      'Кто отправил', 'Статус', 'Получатель ФИО', 'Причина отклонения'
    ]]);
    shTH.getRange(1,1,1,9).setFontWeight('bold').setBackground('#4E342E').setFontColor('#fff');
    shTH.setFrozenRows(1);
    shTH.getRange(2, 3, shTH.getMaxRows()-1, 1).setNumberFormat('@');
  } else {
    fixSkladDateColumn(ss.getSheetByName('Накладные_перевода'), 3);
  }

  // ── Строки накладных на перевод: ID накладной | Товар | Кол-во ──
  if (!ss.getSheetByName('Накладные_перевода_строки')) {
    var shTL = ss.insertSheet('Накладные_перевода_строки');
    shTL.getRange(1,1,1,3).setValues([[
      'ID накладной', 'Товар', 'Кол-во'
    ]]);
    shTL.getRange(1,1,1,3).setFontWeight('bold').setBackground('#3E2723').setFontColor('#fff');
    shTL.setFrozenRows(1);
  }

  return ss;
}

// ─── Список всех складов: Склад сырья + Склад ГП + (Сырьё, Промежуточный) на каждую активную линию ──
function getAllWarehouses() {
  var warehouses = [WH_RAW_MATERIALS, WH_FINISHED_GOODS];
  var linesRes = adminGetLines({role: 'Администратор'}); // внутренний вызов, без проверки роли
  (linesRes.lines || []).forEach(function(l) {
    if (l.active) {
      warehouses.push(whLineRaw(l.name));
      warehouses.push(whLineInterim(l.name));
    }
  });
  return warehouses;
}

function warehouseGetList(user) {
  return {ok: true, warehouses: getAllWarehouses()};
}

// ─── Получить список пользователей, привязанных к конкретному складу ──
// Склад сырья → Завсклад сырья, Склад ГП → Завсклад ГП,
// Линия X → все пользователи с liniya === X (Бригадир, Тестодел, Упаковщица)
function warehouseGetWarehouseUsers(user, payload) {
  var warehouse = payload && payload.warehouse ? payload.warehouse : null;
  if (!warehouse) return {ok: true, users: []};

  var ss = getMainDB();
  var sh = ss.getSheetByName('Пользователи');
  var rows = sh.getDataRange().getValues();
  var users = [];

  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var active = rows[i][7] !== false && rows[i][7] !== 'FALSE';
    if (!active) continue;
    var role = rows[i][3], fio = rows[i][4], liniya = rows[i][5];

    var belongs = false;
    if (warehouse === WH_RAW_MATERIALS && role === ROLES.ZAV_SKLAD_S) belongs = true;
    if (warehouse === WH_FINISHED_GOODS && role === ROLES.ZAV_SKLAD_G) belongs = true;
    if ([ROLES.BRIGADIR, ROLES.TESTODEL, ROLES.UPAKOVSHCHITSA].indexOf(role) !== -1 && liniya &&
        (warehouse === whLineRaw(liniya) || warehouse === whLineInterim(liniya))) belongs = true;

    if (belongs) users.push({fio: fio, role: role});
  }
  return {ok: true, users: users};
}


// Использует существующую номенклатуру материалов (Sklad.gs) как
// единый список товаров для всех складов.
function getUnifiedNomenclature() {
  return getActiveMaterials(); // [{id, name, unit, price}]
}

// ============================================================
// ОСТАТКИ ПО СКЛАДАМ
// ============================================================

// ─── Получить остаток конкретного товара на конкретном складе ──
function getWarehouseBalance(ss, warehouse, product) {
  var sh = ss.getSheetByName('Остатки_складов');
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === warehouse && rows[i][1] === product) {
      return {rowIdx: i, qty: Number(rows[i][2]) || 0};
    }
  }
  return {rowIdx: -1, qty: 0};
}

// ─── Изменить остаток (delta может быть отрицательным) ──────
function adjustWarehouseBalance(ss, warehouse, product, delta) {
  var sh = ss.getSheetByName('Остатки_складов');
  var bal = getWarehouseBalance(ss, warehouse, product);
  var newQty = bal.qty + delta;

  if (bal.rowIdx === -1) {
    sh.appendRow([warehouse, product, newQty]);
  } else {
    sh.getRange(bal.rowIdx + 1, 3).setValue(newQty);
  }
  return newQty;
}

// ─── Получить остатки по всем товарам для одного склада (для отчёта) ──
function warehouseGetBalances(user, payload) {
  var ss = ensureWarehouseSheets();
  var warehouse = payload && payload.warehouse ? payload.warehouse : null;

  var materials = getUnifiedNomenclature();
  var balanceMap = {}; // product -> qty (для выбранного склада, либо сумма по всем)

  var sh = ss.getSheetByName('Остатки_складов');
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    if (warehouse && rows[i][0] !== warehouse) continue;
    var product = rows[i][1];
    balanceMap[product] = (balanceMap[product] || 0) + (Number(rows[i][2]) || 0);
  }

  var list = materials.map(function(m) {
    return {product: m.name, unit: m.unit, qty: balanceMap[m.name] || 0};
  });
  list.sort(function(a,b){ return a.product.localeCompare(b.product); });

  return {ok: true, warehouse: warehouse, balances: list};
}

// ─── Материальный отчёт по складу за период ──────────────────
// Показывает: остаток на начало | приход | расход | остаток на конец.
// Приход = принятые перемещения НА этот склад + (если склад сырья) прямой приход от поставщика.
// Расход = принятые перемещения С этого склада.
// Остаток на начало = текущий остаток - (приход за период) + (расход за период).
// Доступно всем; обычные роли видят только свой склад.
// ─── Список складов, которые пользователь может выбрать в отчёте движения ──
function warehouseGetReportableWarehouses(user) {
  if (user.role === ROLES.ADMIN) return getAllWarehouses();
  if (user.role === '\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442') return getAllWarehouses(); // финансовый обзор — видит все склады
  if (user.role === ROLES.ZAV_PROD) return getAllWarehouses(); // видит все линии и оба центральных склада
  if (user.role === ROLES.ZAV_SKLAD_S) return [WH_RAW_MATERIALS];
  if (user.role === ROLES.ZAV_SKLAD_G) return [WH_FINISHED_GOODS];
  if ([ROLES.BRIGADIR, ROLES.TESTODEL, ROLES.UPAKOVSHCHITSA].indexOf(user.role) !== -1 && user.liniya) {
    return [whLineRaw(user.liniya), whLineInterim(user.liniya)];
  }
  return [];
}

// ─── Номенклатура, релевантная для отчёта по конкретному складу ──
// (та же логика, что в инвентаризации: ГП — продукты, Промежуточный — сырьё+продукты, остальное — сырьё)
function getReportNomenclatureForWarehouse(user, warehouse) {
  var isFinishedGoods = warehouse === WH_FINISHED_GOODS;
  var isInterim = warehouse.indexOf(WH_LINE_INTERIM_SUFFIX) !== -1;

  if (isFinishedGoods) {
    var prodRes = getProducts(user);
    return (prodRes.products || []).map(function(p){ return {name: p.name, unit: p.unit || 'шт'}; });
  }
  if (isInterim) {
    var materials = getActiveMaterials().map(function(m){ return {name: m.name, unit: m.unit}; });
    var prodRes2 = getProducts(user);
    var products = (prodRes2.products || []).map(function(p){ return {name: p.name, unit: p.unit || 'шт'}; });
    return materials.concat(products);
  }
  return getActiveMaterials().map(function(m){ return {name: m.name, unit: m.unit}; });
}

function warehouseGetMaterialReport(user, payload) {
  var ss = ensureWarehouseSheets();
  var reportable = warehouseGetReportableWarehouses(user);
  var canChoose = reportable.length > 1;

  var warehouse = (payload && payload.warehouse && reportable.indexOf(payload.warehouse) !== -1)
    ? payload.warehouse
    : reportable[0];
  if (!warehouse) return {ok: false, error: 'У вас нет доступных складов для отчёта'};

  var dateFrom = payload && payload.dateFrom ? payload.dateFrom : null;
  var dateTo   = payload && payload.dateTo   ? payload.dateTo   : null;

  var materials = getReportNomenclatureForWarehouse(user, warehouse);
  // product -> {unit, incoming, outgoing}
  var move = {};
  materials.forEach(function(m) { move[m.name] = {unit: m.unit, incoming: 0, outgoing: 0}; });

  // ── Если склад сырья: считаем приход от поставщиков ──
  if (warehouse === WH_RAW_MATERIALS) {
    var shIn = ss.getSheetByName('Приход_материалов');
    if (shIn) {
      var inRows = shIn.getDataRange().getValues();
      for (var i = 1; i < inRows.length; i++) {
        if (!inRows[i][0]) continue;
        var inDate = normalizeDateCell(inRows[i][1]);
        if (dateFrom && compareDates(inDate, dateFrom) < 0) continue;
        if (dateTo && compareDates(inDate, dateTo) > 0) continue;
        var mat = inRows[i][4];
        if (!move[mat]) move[mat] = {unit: '', incoming: 0, outgoing: 0};
        move[mat].incoming += Number(inRows[i][5]) || 0;
      }
    }
  }

  // ── Переводы: принятые НА этот склад (приход) и С этого склада (расход) ──
  var shTH = ss.getSheetByName('Накладные_перевода');
  var shTL = ss.getSheetByName('Накладные_перевода_строки');
  var thRows = shTH.getDataRange().getValues();
  var tlRows = shTL.getDataRange().getValues();

  var incomingIds = {}, outgoingIds = {};
  for (var h = 1; h < thRows.length; h++) {
    if (!thRows[h][0] || thRows[h][6] !== 'Принято') continue;
    var trDate = normalizeDateCell(thRows[h][2]);
    if (dateFrom && compareDates(trDate, dateFrom) < 0) continue;
    if (dateTo && compareDates(trDate, dateTo) > 0) continue;
    if (thRows[h][4] === warehouse) incomingIds[thRows[h][0]] = true;
    if (thRows[h][3] === warehouse) outgoingIds[thRows[h][0]] = true;
  }

  for (var j = 1; j < tlRows.length; j++) {
    if (!tlRows[j][0]) continue;
    var p = tlRows[j][1], qty = Number(tlRows[j][2]) || 0;
    if (!move[p]) move[p] = {unit: '', incoming: 0, outgoing: 0};
    if (incomingIds[tlRows[j][0]]) move[p].incoming += qty;
    if (outgoingIds[tlRows[j][0]]) move[p].outgoing += qty;
  }

  // ── Списания на промежуточный склад (Акты_списания) тоже считаются движением ──
  // Если это "Линия X — Промежуточный" — это приход (списано сюда из Сырья).
  // Если это "Линия X — Сырьё" — это расход (списано отсюда на Промежуточный).
  var liniyaFromInterim = warehouse.indexOf(WH_LINE_INTERIM_SUFFIX) !== -1 ? warehouse.replace(WH_LINE_INTERIM_SUFFIX, '') : null;
  var liniyaFromRaw = warehouse.indexOf(WH_LINE_RAW_SUFFIX) !== -1 ? warehouse.replace(WH_LINE_RAW_SUFFIX, '') : null;
  if (liniyaFromInterim || liniyaFromRaw) {
    var shSP = ss.getSheetByName('Акты_списания');
    if (shSP) {
      var spRows = shSP.getDataRange().getValues();
      for (var s = 1; s < spRows.length; s++) {
        if (!spRows[s][0]) continue;
        var spDate = normalizeDateCell(spRows[s][1]);
        if (dateFrom && compareDates(spDate, dateFrom) < 0) continue;
        if (dateTo && compareDates(spDate, dateTo) > 0) continue;
        if (liniyaFromInterim && spRows[s][2] === liniyaFromInterim) {
          var matI = spRows[s][5], qtyI = Number(spRows[s][6]) || 0;
          if (!move[matI]) move[matI] = {unit: '', incoming: 0, outgoing: 0};
          move[matI].incoming += qtyI;
        }
        if (liniyaFromRaw && spRows[s][2] === liniyaFromRaw) {
          var matR = spRows[s][5], qtyR = Number(spRows[s][6]) || 0;
          if (!move[matR]) move[matR] = {unit: '', incoming: 0, outgoing: 0};
          move[matR].outgoing += qtyR;
        }
      }
    }
  }

  // ── Текущий остаток по складу ──
  var shBal = ss.getSheetByName('Остатки_складов');
  var balRows = shBal.getDataRange().getValues();
  var currentBalance = {};
  for (var b = 1; b < balRows.length; b++) {
    if (!balRows[b][0] || balRows[b][0] !== warehouse) continue;
    currentBalance[balRows[b][1]] = Number(balRows[b][2]) || 0;
  }

  // Остаток на начало = текущий - приход за период + расход за период
  var list = materials.map(function(m) {
    var cur = currentBalance[m.name] || 0;
    var inc = move[m.name] ? move[m.name].incoming : 0;
    var out = move[m.name] ? move[m.name].outgoing : 0;
    var startBal = cur - inc + out;
    return {
      product: m.name, unit: m.unit,
      startBalance: startBal, incoming: inc, outgoing: out, endBalance: cur
    };
  }).filter(function(r) {
    return r.startBalance !== 0 || r.incoming !== 0 || r.outgoing !== 0 || r.endBalance !== 0;
  });

  list.sort(function(a,b){ return a.product.localeCompare(b.product); });
  return {ok: true, warehouse: warehouse, dateFrom: dateFrom, dateTo: dateTo, report: list, canChoose: canChoose, reportable: reportable};
}

// ============================================================
// ПЕРЕВОДЫ МЕЖДУ СКЛАДАМИ
// ============================================================

function getNextTransferInvoiceNo(ss) {
  var sh = ss.getSheetByName('Накладные_перевода');
  var rows = sh.getDataRange().getValues();
  var maxNo = 0;
  for (var i = 1; i < rows.length; i++) {
    var n = Number(rows[i][1]) || 0;
    if (n > maxNo) maxNo = n;
  }
  return maxNo + 1;
}

// ─── Создать накладную на перевод между складами ────────────
// payload = {fromWarehouse, toWarehouse, items: [{product, qty}, ...]}
// Остаток у отправителя НЕ списывается сразу — товар продолжает
// считаться остатком отправителя, пока получатель не подтвердит приём.
// Проверяем достаточность остатка на момент отправки (резервируем логически).
// ─── Проверка: имеет ли пользователь право работать (отправлять/принимать) с данным складом ──
// Администратор — со всеми. Завсклад сырья — со складом сырья. Завсклад ГП — со складом ГП.
// Бригадир, Тестодел, Зав.упаковщица — со складами своей линии:
// "Линия X — Сырьё" (получают сырьё) и "Линия X — Промежуточный"
// (списывают расход / откуда уходит готовая продукция на Склад ГП).
function userCanAccessWarehouse(user, warehouse) {
  if (user.role === ROLES.ADMIN) return true;
  if (user.role === ROLES.ZAV_SKLAD_S && warehouse === WH_RAW_MATERIALS) return true;
  if (user.role === ROLES.ZAV_SKLAD_G && warehouse === WH_FINISHED_GOODS) return true;
  if ([ROLES.BRIGADIR, ROLES.TESTODEL, ROLES.UPAKOVSHCHITSA].indexOf(user.role) !== -1 && user.liniya) {
    if (warehouse === whLineRaw(user.liniya) || warehouse === whLineInterim(user.liniya)) return true;
  }
  return false;
}

// ─── Основной склад, к которому привязан текущий пользователь (для UI: куда по умолчанию ставить отправителя) ──
// Для линейных ролей по умолчанию используется "Линия X — Сырьё" (приём от центрального склада сырья).
// Для списания на промежуточный и отгрузки на ГП используются отдельные функции в ShiftProduction.gs.
function warehouseGetMyWarehouse(user) {
  if (user.role === ROLES.ZAV_SKLAD_S) return WH_RAW_MATERIALS;
  if (user.role === ROLES.ZAV_SKLAD_G) return WH_FINISHED_GOODS;
  if ([ROLES.BRIGADIR, ROLES.TESTODEL, ROLES.UPAKOVSHCHITSA].indexOf(user.role) !== -1 && user.liniya) return whLineRaw(user.liniya);
  return null;
}

function warehouseGetMy(user) {
  return {ok: true, warehouse: warehouseGetMyWarehouse(user)};
}

// ─── Список ВСЕХ складов, с которых пользователь может отправлять/которыми управляет ──
// Линейным ролям теперь доступны 2 склада: "Линия X — Сырьё" и "Линия X — Промежуточный".
function warehouseGetMyWarehouses(user) {
  if (user.role === ROLES.ZAV_SKLAD_S) return {ok: true, warehouses: [WH_RAW_MATERIALS]};
  if (user.role === ROLES.ZAV_SKLAD_G) return {ok: true, warehouses: [WH_FINISHED_GOODS]};
  if ([ROLES.BRIGADIR, ROLES.TESTODEL, ROLES.UPAKOVSHCHITSA].indexOf(user.role) !== -1 && user.liniya) {
    return {ok: true, warehouses: [whLineRaw(user.liniya), whLineInterim(user.liniya)]};
  }
  if (user.role === ROLES.ADMIN) return {ok: true, warehouses: getAllWarehouses()};
  return {ok: true, warehouses: []};
}

function warehouseCreateTransfer(user, payload) {
  var ss = ensureWarehouseSheets();
  var shHeader = ss.getSheetByName('Накладные_перевода');
  var shLines  = ss.getSheetByName('Накладные_перевода_строки');

  var items = payload.items || [];
  items = items.filter(function(it) { return it.product && Number(it.qty) > 0; });

  if (!items.length || !payload.fromWarehouse || !payload.toWarehouse) {
    return {ok: false, error: 'Укажите склад-отправитель, склад-получатель и хотя бы один товар'};
  }
  if (payload.fromWarehouse === payload.toWarehouse) {
    return {ok: false, error: 'Склад-отправитель и склад-получатель не могут совпадать'};
  }
  // Промежуточный склад линии разрешён получателем ТОЛЬКО когда отправитель —
  // склад "Сырьё" этой же линии (перенос сырья на промежуточный склад своей линии).
  // Промежуточные склады чужих линий получателем быть не могут никогда.
  if (payload.toWarehouse.indexOf(WH_LINE_INTERIM_SUFFIX) !== -1) {
    var expectedFrom = payload.toWarehouse.replace(WH_LINE_INTERIM_SUFFIX, WH_LINE_RAW_SUFFIX);
    if (payload.fromWarehouse !== expectedFrom) {
      return {ok: false, error: 'Промежуточный склад можно пополнить только перемещением со своего склада "Сырьё"'};
    }
  }
  if (!userCanAccessWarehouse(user, payload.fromWarehouse)) {
    return {ok: false, error: 'У вас нет прав отправлять с этого склада'};
  }

  // Проверка достаточности остатка у отправителя по каждой позиции.
  // Исключение: отгрузка готовой продукции с "Линия X — Промежуточный" на
  // "Склад ГП" — отрицательный остаток разрешён, т.к. Упаковщица может
  // зарегистрировать отгрузку до того, как Тестодел формально учтёт
  // соответствующий расход материалов (потом сойдётся при закрытии смены).
  var isInterimToGP = payload.fromWarehouse.indexOf(WH_LINE_INTERIM_SUFFIX) !== -1 && payload.toWarehouse === WH_FINISHED_GOODS;
  if (!isInterimToGP) {
    for (var k = 0; k < items.length; k++) {
      var bal = getWarehouseBalance(ss, payload.fromWarehouse, items[k].product);
      if (bal.qty < Number(items[k].qty)) {
        return {ok: false, error: 'Недостаточно остатка "' + items[k].product + '" на складе ' + payload.fromWarehouse + ' (доступно: ' + bal.qty + ')'};
      }
    }
  }

  if (!payload.receiverFio) {
    return {ok: false, error: 'Укажите получателя на складе-получателе'};
  }

  var dateStr = formatDateOnly(new Date());
  var invoiceNo = getNextTransferInvoiceNo(ss);
  var invoiceId = Utilities.getUuid();

  var newRow = shHeader.getLastRow() + 1;
  shHeader.getRange(newRow, 3).setNumberFormat('@');
  shHeader.getRange(newRow, 1, 1, 8).setValues([[
    invoiceId, invoiceNo, dateStr, payload.fromWarehouse, payload.toWarehouse,
    user.fio, 'В пути', payload.receiverFio
  ]]);

  items.forEach(function(it) {
    shLines.appendRow([invoiceId, it.product, Number(it.qty)]);
  });

  logProdAction(ss, user.fio, 'ПЕРЕМЕЩЕНИЕ', '\u2116' + invoiceNo + ': ' + payload.fromWarehouse + ' \u2192 ' + payload.toWarehouse + ' \u2192 ' + payload.receiverFio + ' (' + items.length + ' поз.)');
  return {ok: true, invoiceNo: invoiceNo};
}

// ─── Список накладных на перевод (видно отправителю и получателю) ──
function warehouseGetTransfers(user, payload) {
  var ss = ensureWarehouseSheets();
  var shHeader = ss.getSheetByName('Накладные_перевода');
  var shLines  = ss.getSheetByName('Накладные_перевода_строки');

  var headerRows = shHeader.getDataRange().getValues();
  var lineRows = shLines.getDataRange().getValues();

  var linesByInvoice = {};
  for (var j = 1; j < lineRows.length; j++) {
    if (!lineRows[j][0]) continue;
    var invId = lineRows[j][0];
    if (!linesByInvoice[invId]) linesByInvoice[invId] = [];
    linesByInvoice[invId].push({product: lineRows[j][1], qty: lineRows[j][2]});
  }

  var list = [];
  for (var i = headerRows.length - 1; i >= 1; i--) {
    if (!headerRows[i][0]) continue;
    var invId2 = headerRows[i][0];
    list.push({
      id: invId2, invoiceNo: headerRows[i][1], date: normalizeDateCell(headerRows[i][2]),
      fromWarehouse: headerRows[i][3], toWarehouse: headerRows[i][4],
      sentBy: headerRows[i][5], status: headerRows[i][6],
      receiverFio: headerRows[i][7] || '', reason: headerRows[i][8] || '',
      items: linesByInvoice[invId2] || []
    });
    if (list.length >= 150) break;
  }
  return {ok: true, list: list};
}

// ─── Список накладных "в пути" для конкретного пользователя ──
// Фильтруем по: склад-получатель = мой склад И получатель ФИО = моё ФИО.
// Только адресованный мне документ я вижу и могу принять/отклонить.
function warehouseGetIncomingTransfers(user, payload) {
  var ss = ensureWarehouseSheets();
  var shHeader = ss.getSheetByName('Накладные_перевода');
  var shLines  = ss.getSheetByName('Накладные_перевода_строки');

  var targetWarehouse = payload && payload.warehouse ? payload.warehouse : null;
  if (!targetWarehouse) return {ok: false, error: 'Не указан склад'};
  if (!userCanAccessWarehouse(user, targetWarehouse)) {
    return {ok: false, error: 'У вас нет прав просматривать этот склад'};
  }

  var headerRows = shHeader.getDataRange().getValues();
  var lineRows = shLines.getDataRange().getValues();

  var linesByInvoice = {};
  for (var j = 1; j < lineRows.length; j++) {
    if (!lineRows[j][0]) continue;
    var invId = lineRows[j][0];
    if (!linesByInvoice[invId]) linesByInvoice[invId] = [];
    linesByInvoice[invId].push({product: lineRows[j][1], qty: lineRows[j][2]});
  }

  var list = [];
  for (var i = 1; i < headerRows.length; i++) {
    if (!headerRows[i][0]) continue;
    if (headerRows[i][4] !== targetWarehouse) continue;
    if (headerRows[i][6] !== 'В пути') continue;
    var receiverFio = headerRows[i][7] || '';
    // Если ФИО получателя указано — показываем только ему.
    // Для Администратора показываем всё.
    if (receiverFio && user.role !== ROLES.ADMIN && receiverFio !== user.fio) continue;
    var invId2 = headerRows[i][0];
    list.push({
      id: invId2, invoiceNo: headerRows[i][1], date: normalizeDateCell(headerRows[i][2]),
      fromWarehouse: headerRows[i][3], sentBy: headerRows[i][5],
      receiverFio: receiverFio, items: linesByInvoice[invId2] || []
    });
  }
  return {ok: true, list: list};
}

// ─── Подтвердить приём перевода: списать у отправителя, начислить получателю ──
function warehouseConfirmTransfer(user, payload) {
  var ss = ensureWarehouseSheets();
  var shHeader = ss.getSheetByName('Накладные_перевода');
  var shLines  = ss.getSheetByName('Накладные_перевода_строки');

  var headerRows = shHeader.getDataRange().getValues();
  var rowIdx = -1;
  for (var i = 1; i < headerRows.length; i++) {
    if (headerRows[i][0] === payload.id) { rowIdx = i; break; }
  }
  if (rowIdx === -1) return {ok: false, error: 'Накладная не найдена'};
  if (headerRows[rowIdx][6] !== 'В пути') return {ok: false, error: 'Накладная уже обработана'};

  var fromWarehouse = headerRows[rowIdx][3];
  var toWarehouse = headerRows[rowIdx][4];
  var receiverFio = headerRows[rowIdx][7] || '';

  if (!userCanAccessWarehouse(user, toWarehouse)) {
    return {ok: false, error: 'У вас нет прав принимать на этот склад'};
  }
  // Если накладная адресована конкретному получателю — только он (или Администратор) может принять
  if (receiverFio && user.role !== ROLES.ADMIN && receiverFio !== user.fio) {
    return {ok: false, error: 'Эта накладная адресована ' + receiverFio};
  }

  var lineRows = shLines.getDataRange().getValues();
  var items = [];
  for (var j = 1; j < lineRows.length; j++) {
    if (lineRows[j][0] === payload.id) items.push({product: lineRows[j][1], qty: Number(lineRows[j][2])});
  }

  // Повторная проверка остатка на момент подтверждения (на случай если
  // отправитель уже потратил товар на другую накладную в промежутке).
  // Исключение: отгрузка с "Линия X — Промежуточный" на "Склад ГП" — минус разрешён.
  var isInterimToGPConfirm = fromWarehouse.indexOf(WH_LINE_INTERIM_SUFFIX) !== -1 && toWarehouse === WH_FINISHED_GOODS;
  if (!isInterimToGPConfirm) {
    for (var k = 0; k < items.length; k++) {
      var bal = getWarehouseBalance(ss, fromWarehouse, items[k].product);
      if (bal.qty < items[k].qty) {
        return {ok: false, error: 'Недостаточно остатка "' + items[k].product + '" на складе ' + fromWarehouse + ' для подтверждения (доступно: ' + bal.qty + ')'};
      }
    }
  }

  items.forEach(function(it) {
    adjustWarehouseBalance(ss, fromWarehouse, it.product, -it.qty);
    adjustWarehouseBalance(ss, toWarehouse, it.product, it.qty);
  });

  shHeader.getRange(rowIdx+1, 7).setValue('Принято');
  logProdAction(ss, user.fio, 'ПРИЁМ ПЕРЕВОДА', '\u2116' + headerRows[rowIdx][1] + ' \u2192 ' + toWarehouse);
  return {ok: true};
}

// ─── Отклонить перевод (товар остаётся у отправителя, никаких изменений остатков) ──
// payload = {id, reason} — причина отклонения обязательна
function warehouseRejectTransfer(user, payload) {
  var ss = ensureWarehouseSheets();
  var shHeader = ss.getSheetByName('Накладные_перевода');
  var headerRows = shHeader.getDataRange().getValues();

  if (!payload.reason || !payload.reason.trim()) {
    return {ok: false, error: 'Укажите причину отклонения'};
  }

  for (var i = 1; i < headerRows.length; i++) {
    if (headerRows[i][0] === payload.id) {
      if (headerRows[i][6] !== 'В пути') return {ok: false, error: 'Накладная уже обработана'};
      if (!userCanAccessWarehouse(user, headerRows[i][4])) {
        return {ok: false, error: 'У вас нет прав отклонять перевод на этот склад'};
      }
      var recFio = headerRows[i][7] || '';
      if (recFio && user.role !== ROLES.ADMIN && recFio !== user.fio) {
        return {ok: false, error: 'Эта накладная адресована ' + recFio};
      }
      shHeader.getRange(i+1, 7).setValue('Отклонено');
      shHeader.getRange(i+1, 9).setValue(payload.reason.trim());
      logProdAction(ss, user.fio, 'ОТКЛОНЕНИЕ ПЕРЕМЕЩЕНИЯ', '\u2116' + headerRows[i][1] + ': ' + payload.reason.trim());
      return {ok: true};
    }
  }
  return {ok: false, error: 'Накладная не найдена'};
}

// ─── Получить отклонённые накладные, отправленные текущим пользователем со своего склада ──
// (чтобы можно было увидеть причину и исправить/отправить заново)
function warehouseGetRejectedTransfers(user) {
  var myWarehouse = warehouseGetMyWarehouse(user);
  if (!myWarehouse) return {ok: true, list: []};

  var ss = ensureWarehouseSheets();
  var shHeader = ss.getSheetByName('Накладные_перевода');
  var shLines  = ss.getSheetByName('Накладные_перевода_строки');
  var headerRows = shHeader.getDataRange().getValues();
  var lineRows = shLines.getDataRange().getValues();

  var linesByInvoice = {};
  for (var j = 1; j < lineRows.length; j++) {
    if (!lineRows[j][0]) continue;
    var invId = lineRows[j][0];
    if (!linesByInvoice[invId]) linesByInvoice[invId] = [];
    linesByInvoice[invId].push({product: lineRows[j][1], qty: lineRows[j][2]});
  }

  var list = [];
  for (var i = 1; i < headerRows.length; i++) {
    if (!headerRows[i][0]) continue;
    if (headerRows[i][3] !== myWarehouse) continue; // только мои отправленные
    if (headerRows[i][6] !== 'Отклонено') continue;
    var invId2 = headerRows[i][0];
    list.push({
      id: invId2, invoiceNo: headerRows[i][1], date: normalizeDateCell(headerRows[i][2]),
      toWarehouse: headerRows[i][4], receiverFio: headerRows[i][7] || '',
      reason: headerRows[i][8] || '', items: linesByInvoice[invId2] || []
    });
  }
  list.sort(function(a,b){ return b.invoiceNo - a.invoiceNo; });
  return {ok: true, list: list};
}

// ─── Исправить и отправить заново отклонённую накладную ──────
// Создаёт новый документ "В пути" с теми же или изменёнными позициями,
// затем помечает старую отклонённую как "Исправлено" чтобы не висела в списке.
// payload = {oldId, toWarehouse, receiverFio, items}
function warehouseResendTransfer(user, payload) {
  var ss = ensureWarehouseSheets();
  var shHeader = ss.getSheetByName('Накладные_перевода');
  var headerRows = shHeader.getDataRange().getValues();

  var oldRowIdx = -1;
  for (var i = 1; i < headerRows.length; i++) {
    if (headerRows[i][0] === payload.oldId) { oldRowIdx = i; break; }
  }
  if (oldRowIdx === -1) return {ok: false, error: 'Исходная накладная не найдена'};
  if (headerRows[oldRowIdx][6] !== 'Отклонено') return {ok: false, error: 'Можно исправлять только отклонённые накладные'};

  var fromWarehouse = headerRows[oldRowIdx][3];
  if (!userCanAccessWarehouse(user, fromWarehouse)) {
    return {ok: false, error: 'У вас нет прав на этот склад'};
  }

  // Создаём новую накладную через стандартную функцию (включает проверку остатка и прав)
  var createResult = warehouseCreateTransfer(user, {
    fromWarehouse: fromWarehouse,
    toWarehouse: payload.toWarehouse || headerRows[oldRowIdx][4],
    receiverFio: payload.receiverFio || headerRows[oldRowIdx][7],
    items: payload.items
  });

  if (!createResult.ok) return createResult;

  // Помечаем старую отклонённую накладную как обработанную (исправлена и переотправлена)
  shHeader.getRange(oldRowIdx+1, 7).setValue('Исправлено (см. №' + createResult.invoiceNo + ')');
  logProdAction(ss, user.fio, 'ПОВТОРНАЯ ОТПРАВКА', 'старая №' + headerRows[oldRowIdx][1] + ' → новая №' + createResult.invoiceNo);

  return {ok: true, invoiceNo: createResult.invoiceNo};
}

// ─── Приход от поставщика теперь сразу зачисляется на Склад сырья ──
// Вызывается из Sklad.gs (skladAddIncoming) после записи в Приход_материалов.
function warehouseReceiveFromSupplier(material, qty) {
  var ss = ensureWarehouseSheets();
  adjustWarehouseBalance(ss, WH_RAW_MATERIALS, material, qty);
}

// ─── Пересчёт всех остатков с нуля по истории данных ──────────
// Вызывается Администратором если остатки расходятся с реальностью
// (например после первичного импорта данных или при сбоях).
// Алгоритм: обнуляет Остатки_складов и пересобирает из:
//   1) Приход_материалов → зачисляется на Склад сырья
//   2) Накладные_перевода (статус Принято) → списать с отправителя, зачислить получателю
function warehouseRecalculateBalances(user) {
  requireRole(user, [ROLES.ADMIN]);
  var ss = ensureWarehouseSheets();
  ensureShiftProdSheets(); // гарантируем наличие листа "Акты_списания"

  // 1. Очистить текущие остатки
  var shBal = ss.getSheetByName('Остатки_складов');
  var lastRow = shBal.getLastRow();
  if (lastRow > 1) {
    shBal.deleteRows(2, lastRow - 1);
  }

  // Временный map: 'склад||товар' -> qty
  var balMap = {};
  function addBal(warehouse, product, qty) {
    var key = warehouse + '||' + product;
    balMap[key] = (balMap[key] || 0) + qty;
  }

  // 2. Приходы от поставщиков → Склад сырья
  var shIn = ss.getSheetByName('Приход_материалов');
  if (shIn) {
    var inRows = shIn.getDataRange().getValues();
    for (var i = 1; i < inRows.length; i++) {
      if (!inRows[i][0]) continue;
      addBal(WH_RAW_MATERIALS, inRows[i][4], Number(inRows[i][5]) || 0);
    }
  }

  // 3. Принятые перемещения → списать у отправителя, зачислить получателю
  var shTH = ss.getSheetByName('Накладные_перевода');
  var shTL = ss.getSheetByName('Накладные_перевода_строки');
  if (shTH && shTL) {
    var thRows = shTH.getDataRange().getValues();
    var tlRows = shTL.getDataRange().getValues();

    var acceptedFrom = {}, acceptedTo = {};
    for (var h = 1; h < thRows.length; h++) {
      if (!thRows[h][0] || thRows[h][6] !== 'Принято') continue;
      acceptedFrom[thRows[h][0]] = thRows[h][3]; // ID -> склад-отправитель
      acceptedTo[thRows[h][0]]   = thRows[h][4]; // ID -> склад-получатель
    }

    for (var j = 1; j < tlRows.length; j++) {
      if (!tlRows[j][0]) continue;
      var invId = tlRows[j][0];
      if (!acceptedFrom[invId]) continue;
      var qty = Number(tlRows[j][2]) || 0;
      addBal(acceptedFrom[invId], tlRows[j][1], -qty);
      addBal(acceptedTo[invId],   tlRows[j][1],  qty);
    }
  }

  // 4. Акты списания (Тестодел/Упаковщица): Линия X — Сырьё → Линия X — Промежуточный
  // Эти списания происходят без накладной, поэтому учитываются отдельно.
  var shSP = ss.getSheetByName('Акты_списания');
  if (shSP) {
    var spRows = shSP.getDataRange().getValues();
    for (var s = 1; s < spRows.length; s++) {
      if (!spRows[s][0]) continue;
      var liniya = spRows[s][2];
      var material = spRows[s][5];
      var qtyWO = Number(spRows[s][6]) || 0;
      addBal(whLineRaw(liniya), material, -qtyWO);
      addBal(whLineInterim(liniya), material, qtyWO);
    }
  }

  // 5. Записать пересчитанные остатки обратно в лист
  var rowsToWrite = [];
  Object.keys(balMap).forEach(function(key) {
    var parts = key.split('||');
    if (balMap[key] !== 0) {
      rowsToWrite.push([parts[0], parts[1], balMap[key]]);
    }
  });

  if (rowsToWrite.length > 0) {
    shBal.getRange(2, 1, rowsToWrite.length, 3).setValues(rowsToWrite);
  }

  logProdAction(ss, user.fio, 'ПЕРЕСЧЁТ ОСТАТКОВ', 'пересчитано позиций: ' + rowsToWrite.length);
  return {ok: true, recalculated: rowsToWrite.length};
}

// ============================================================
// ИНВЕНТАРИЗАЦИЯ (Администратор) — ручная корректировка остатков
// ============================================================

// ── Лист истории корректировок (создаётся при первом обращении) ──
function ensureInventorySheet() {
  var ss = ensureWarehouseSheets();
  if (!ss.getSheetByName('Инвентаризация')) {
    var sh = ss.insertSheet('Инвентаризация');
    sh.getRange(1,1,1,7).setValues([[
      'Дата', 'Склад', 'Товар', 'Было', 'Стало', 'Разница', 'Кто провёл'
    ]]);
    sh.getRange(1,1,1,7).setFontWeight('bold').setBackground('#5D4037').setFontColor('#fff');
    sh.setFrozenRows(1);
    sh.getRange(2, 1, sh.getMaxRows()-1, 1).setNumberFormat('@');
  } else {
    fixSkladDateColumn(ss.getSheetByName('Инвентаризация'), 1);
  }
  return ss;
}

// ─── Получить остатки конкретного склада для инвентаризации (с нулевыми тоже) ──
function invGetWarehouseBalances(user, payload) {
  requireRole(user, [ROLES.ADMIN]);
  var warehouse = payload && payload.warehouse ? payload.warehouse : null;
  if (!warehouse) return {ok: false, error: 'Не указан склад'};

  var ss = ensureWarehouseSheets();

  // Определяем номенклатуру по типу склада:
  // - Склад ГП и "Линия X — Промежуточный" могут содержать готовую продукцию
  //   (промежуточный — и сырьё, и потенциально продукцию, поэтому объединяем оба списка)
  // - Склад сырья и "Линия X — Сырьё" — только сырьё
  var isFinishedGoods = warehouse === WH_FINISHED_GOODS;
  var isInterim = warehouse.indexOf(WH_LINE_INTERIM_SUFFIX) !== -1;

  var nomenclature;
  if (isFinishedGoods) {
    var prodRes = getProducts(user);
    nomenclature = (prodRes.products || []).map(function(p){ return {name: p.name, unit: p.unit || 'шт'}; });
  } else if (isInterim) {
    var materials = getActiveMaterials().map(function(m){ return {name: m.name, unit: m.unit}; });
    var prodRes2 = getProducts(user);
    var products = (prodRes2.products || []).map(function(p){ return {name: p.name, unit: p.unit || 'шт'}; });
    nomenclature = materials.concat(products);
  } else {
    nomenclature = getActiveMaterials().map(function(m){ return {name: m.name, unit: m.unit}; });
  }

  var shBal = ss.getSheetByName('Остатки_складов');
  var rows = shBal.getDataRange().getValues();
  var balanceMap = {};
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0] || rows[i][0] !== warehouse) continue;
    balanceMap[rows[i][1]] = (balanceMap[rows[i][1]] || 0) + (Number(rows[i][2]) || 0);
  }

  var list = nomenclature.map(function(m) {
    return {product: m.name, unit: m.unit, qty: balanceMap[m.name] || 0};
  });
  list.sort(function(a,b){ return a.product.localeCompare(b.product); });

  return {ok: true, warehouse: warehouse, balances: list};
}

// ─── Установить фактический остаток (ввод сальдо) для товара на складе ──
// payload = {warehouse, product, actualQty}
// Система сама вычисляет разницу (actualQty - текущий остаток) и корректирует баланс,
// сохраняя запись в истории инвентаризаций.
function invSetBalance(user, payload) {
  requireRole(user, [ROLES.ADMIN]);
  var warehouse = payload && payload.warehouse;
  var product = payload && payload.product;
  var actualQty = payload ? Number(payload.actualQty) : NaN;

  if (!warehouse || !product || isNaN(actualQty)) {
    return {ok: false, error: 'Укажите склад, товар и фактическое количество'};
  }

  var ss = ensureInventorySheet();
  var before = getWarehouseBalance(ss, warehouse, product).qty;
  var diff = Math.round((actualQty - before) * 1000) / 1000;

  if (diff !== 0) {
    adjustWarehouseBalance(ss, warehouse, product, diff);
  }

  var sh = ss.getSheetByName('Инвентаризация');
  var newRow = sh.getLastRow() + 1;
  var dateStr = (payload && payload.date) ? payload.date : formatDateOnly(new Date());
  sh.getRange(newRow, 1).setNumberFormat('@');
  sh.getRange(newRow, 1, 1, 7).setValues([[
    dateStr, warehouse, product, before, actualQty, diff, user.fio
  ]]);

  logProdAction(ss, user.fio, 'ИНВЕНТАРИЗАЦИЯ', warehouse + ' · ' + product + ': ' + before + ' → ' + actualQty + ' (' + (diff>0?'+':'') + diff + ')');
  return {ok: true, before: before, after: actualQty, diff: diff};
}

// ─── Массовая инвентаризация: несколько товаров за один раз ──────
// payload = {warehouse, date, items: [{product, actualQty}]}
function invSetBalanceBulk(user, payload) {
  requireRole(user, [ROLES.ADMIN]);
  var warehouse = payload && payload.warehouse;
  var items = (payload && payload.items) || [];
  if (!warehouse || !items.length) {
    return {ok: false, error: 'Укажите склад и хотя бы одну позицию'};
  }

  var ss = ensureInventorySheet();
  var sh = ss.getSheetByName('Инвентаризация');
  var dateStr = (payload && payload.date) ? payload.date : formatDateOnly(new Date());
  var results = [];

  items.forEach(function(it) {
    if (!it.product || it.actualQty === '' || it.actualQty === null || it.actualQty === undefined) return;
    var actualQty = Number(it.actualQty);
    if (isNaN(actualQty)) return;

    var before = getWarehouseBalance(ss, warehouse, it.product).qty;
    var diff = Math.round((actualQty - before) * 1000) / 1000;
    if (diff !== 0) {
      adjustWarehouseBalance(ss, warehouse, it.product, diff);
    }
    var newRow = sh.getLastRow() + 1;
    sh.getRange(newRow, 1).setNumberFormat('@');
    sh.getRange(newRow, 1, 1, 7).setValues([[
      dateStr, warehouse, it.product, before, actualQty, diff, user.fio
    ]]);
    results.push({product: it.product, before: before, after: actualQty, diff: diff});
  });

  logProdAction(ss, user.fio, 'ИНВЕНТАРИЗАЦИЯ (массовая)', warehouse + ' · ' + results.length + ' поз.');
  return {ok: true, results: results};
}

// ─── История инвентаризаций (с фильтром по складу, опционально) ──
function invGetHistory(user, payload) {
  requireRole(user, [ROLES.ADMIN]);
  var ss = ensureInventorySheet();
  var sh = ss.getSheetByName('Инвентаризация');
  var rows = sh.getDataRange().getValues();
  var warehouse = payload && payload.warehouse ? payload.warehouse : null;

  var list = [];
  for (var i = rows.length - 1; i >= 1; i--) {
    if (!rows[i][0]) continue;
    if (warehouse && rows[i][1] !== warehouse) continue;
    list.push({
      date: normalizeDateCell(rows[i][0]), warehouse: rows[i][1], product: rows[i][2],
      before: rows[i][3], after: rows[i][4], diff: rows[i][5], who: rows[i][6]
    });
    if (list.length >= 200) break;
  }
  return {ok: true, list: list};
}