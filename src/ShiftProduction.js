// ============================================================
// GOLD LAVASH — ПРОИЗВОДСТВЕННЫЙ УЧЁТ СМЕНЫ
// Архитектура складов на линии:
//   "Линия X — Сырьё"        — сырьё, полученное от центрального склада
//                               сырья через обычное перемещение (с подтверждением)
//   "Линия X — Промежуточный" — фактический расход материалов за смену/партию;
//                               Тестодел/Упаковщица списывают сюда материалы
//                               БЕЗ подтверждения (мгновенно)
//   "Склад ГП" (центральный)  — готовая продукция; Упаковщица перемещает сюда
//                               с "Линия X — Промежуточный" ОБЫЧНЫМ переводом
//                               (требует подтверждения Завсклада ГП)
//
// Нормы расходов (рецептуры), списание материалов, закрытие смены
// бригадиром с анализом план/факт и порогом отклонения 4%.
// ============================================================

var SP_DEVIATION_THRESHOLD_PCT = 4; // порог предупреждения об отклонении, %

// ============================================================
// ИНИЦИАЛИЗАЦИЯ ЛИСТОВ
// ============================================================
function ensureShiftProdSheets() {
  var ss = ensureProductionDB();

  // ── Нормы расходов (рецептуры): продукт → материал → кол-во на 1 ед. ──
  if (!ss.getSheetByName('Нормы_расходов')) {
    var shN = ss.insertSheet('Нормы_расходов');
    shN.getRange(1,1,1,5).setValues([['Продукт','Материал','Норма на 1 ед.','Расход на партию','Размер партии']]);
    shN.getRange(1,1,1,5).setFontWeight('bold').setBackground('#1A237E').setFontColor('#fff');
    shN.setFrozenRows(1);
  }

  // ── Акты списания материалов (Тестодел/Упаковщица в течение смены) ──
  // Списание идёт с "Линия X — Сырьё" на "Линия X — Промежуточный" БЕЗ подтверждения.
  if (!ss.getSheetByName('Акты_списания')) {
    var shA = ss.insertSheet('Акты_списания');
    shA.getRange(1,1,1,8).setValues([['ID','Дата','Линия','Смена','Кто списал','Материал','Кол-во','ID документа']]);
    shA.getRange(1,1,1,8).setFontWeight('bold').setBackground('#BF360C').setFontColor('#fff');
    shA.setFrozenRows(1);
    shA.getRange(2,2,shA.getMaxRows()-1,1).setNumberFormat('@');
  } else {
    fixSkladDateColumn(ss.getSheetByName('Акты_списания'), 2);
  }

  // ── Закрытые смены с итогами ──
  if (!ss.getSheetByName('Закрытые_смены')) {
    var shZ = ss.insertSheet('Закрытые_смены');
    shZ.getRange(1,1,1,5).setValues([['ID','Дата','Линия','Смена','Кто закрыл']]);
    shZ.getRange(1,1,1,5).setFontWeight('bold').setBackground('#212121').setFontColor('#fff');
    shZ.setFrozenRows(1);
    shZ.getRange(2,2,shZ.getMaxRows()-1,1).setNumberFormat('@');
  }

  return ss;
}

// ============================================================
// НОРМЫ РАСХОДОВ (Зав.производством)
// ============================================================

// ─── Получить все нормы расходов ──────────────────────────
function spGetNorms(user) {
  requireRole(user, [ROLES.ZAV_PROD, ROLES.ADMIN, ROLES.BRIGADIR]);
  var ss = ensureShiftProdSheets();
  var sh = ss.getSheetByName('Нормы_расходов');
  var rows = sh.getDataRange().getValues();
  // Колонки: [0]Продукт [1]Материал [2]Норма на 1 ед [3]Расход на партию [4]Размер партии
  var norms = {};
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var p = rows[i][0];
    if (!norms[p]) norms[p] = {lines: [], batchQty: Number(rows[i][4]) || 0};
    norms[p].lines.push({
      material: rows[i][1],
      qty: Number(rows[i][2]) || 0,          // норма на 1 ед.
      batchTotal: Number(rows[i][3]) || 0     // расход на партию
    });
    if (rows[i][4]) norms[p].batchQty = Number(rows[i][4]) || 0;
  }
  var list = Object.keys(norms).map(function(p){
    return {product: p, batchQty: norms[p].batchQty, lines: norms[p].lines};
  });
  list.sort(function(a,b){ return a.product.localeCompare(b.product); });
  return {ok: true, norms: list};
}

// ─── Сохранить рецептуру продукта ───────────────────────────
// payload = {product, batchQty, lines: [{material, batchTotal}]}
function spSaveNorm(user, payload) {
  requireRole(user, [ROLES.ZAV_PROD, ROLES.ADMIN]);
  if (!payload.product || !Array.isArray(payload.lines) || !Number(payload.batchQty)) {
    return {ok: false, error: 'Не указан продукт, количество в партии или строки'};
  }
  var batchQty = Number(payload.batchQty);
  var ss = ensureShiftProdSheets();
  var sh = ss.getSheetByName('Нормы_расходов');
  var rows = sh.getDataRange().getValues();

  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][0] === payload.product) sh.deleteRow(i + 1);
  }

  payload.lines.filter(function(l){ return l.material && Number(l.batchTotal) > 0; })
    .forEach(function(l) {
      var normPer1 = Math.round(Number(l.batchTotal) / batchQty * 1000000) / 1000000;
      sh.appendRow([payload.product, l.material, normPer1, Number(l.batchTotal), batchQty]);
    });

  logProdAction(ss, user.fio, 'НОРМА РАСХОДА', payload.product + ' · партия ' + batchQty + ' ед. (' + payload.lines.length + ' поз.)');
  return {ok: true, batchQty: batchQty};
}

// ─── Получить нормы расходов + цена материала (FIFO) + итог по продукту ──
// Используется на странице "Нормы расходов" (показывает стоимость)
// и Финансистом для автозаполнения себестоимости продукта
function spGetNormsWithCost(user) {
  requireRole(user, [ROLES.ZAV_PROD, ROLES.ZAV_PROD_BULK, ROLES.ADMIN, ROLES.BRIGADIR, '\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442']);
  var ss = ensureShiftProdSheets();
  var sh = ss.getSheetByName('Нормы_расходов');
  var rows = sh.getDataRange().getValues();

  var norms = {};
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var p = rows[i][0];
    if (!norms[p]) norms[p] = {lines: [], batchQty: Number(rows[i][4]) || 0};
    norms[p].lines.push({
      material: rows[i][1],
      qty: Number(rows[i][2]) || 0,
      batchTotal: Number(rows[i][3]) || 0
    });
    if (rows[i][4]) norms[p].batchQty = Number(rows[i][4]) || 0;
  }

  // Кэшируем FIFO-цену на материал, чтобы не пересчитывать по многу раз для одного и того же материала
  var priceCache = {};
  function getPrice(material) {
    if (priceCache[material] === undefined) priceCache[material] = getMaterialFifoPrice(ss, material);
    return priceCache[material];
  }

  var list = Object.keys(norms).map(function(p) {
    var lines = norms[p].lines.map(function(l) {
      var price = getPrice(l.material);
      return {
        material: l.material, qty: l.qty, batchTotal: l.batchTotal,
        price: price, lineCost: Math.round(l.qty * price * 100) / 100
      };
    });
    var totalMaterialCost = Math.round(lines.reduce(function(s, l){ return s + l.lineCost; }, 0) * 100) / 100;
    return {product: p, batchQty: norms[p].batchQty, lines: lines, totalMaterialCost: totalMaterialCost};
  });
  list.sort(function(a,b){ return a.product.localeCompare(b.product); });
  return {ok: true, norms: list};
}

// ─── Материальная себестоимость ОДНОГО продукта (для автозаполнения) ──
function finGetMaterialCostForProduct(user, payload) {
  requireRole(user, ['\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442', '\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  if (!payload || !payload.product) return {ok:false, error:'\u041d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d \u043f\u0440\u043e\u0434\u0443\u043a\u0442'};
  var ss = ensureShiftProdSheets();
  var sh = ss.getSheetByName('Нормы_расходов');
  var rows = sh.getDataRange().getValues();
  var total = 0;
  var found = false;
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    if (rows[i][0] !== payload.product) continue;
    found = true;
    var qty = Number(rows[i][2]) || 0; // норма на 1 ед.
    var price = getMaterialFifoPrice(ss, rows[i][1]);
    total += qty * price;
  }
  if (!found) return {ok:true, cost:0, hasNorm:false};
  return {ok:true, cost: Math.round(total*100)/100, hasNorm:true};
}

// ─── Удалить рецептуру продукта ──────────────────────────
function spDeleteNorm(user, payload) {
  requireRole(user, [ROLES.ZAV_PROD, ROLES.ADMIN]);
  var ss = ensureShiftProdSheets();
  var sh = ss.getSheetByName('Нормы_расходов');
  var rows = sh.getDataRange().getValues();
  var deleted = 0;
  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][0] === payload.product) { sh.deleteRow(i + 1); deleted++; }
  }
  return {ok: true, deleted: deleted};
}

// ─── Получить нормы как map: product -> {material -> qty на 1 ед.} ──
function getNormsMap(ss) {
  var sh = ss.getSheetByName('Нормы_расходов');
  var rows = sh.getDataRange().getValues();
  var map = {};
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    if (!map[rows[i][0]]) map[rows[i][0]] = {};
    map[rows[i][0]][rows[i][1]] = Number(rows[i][2]) || 0;
  }
  return map;
}

// ============================================================
// АКТЫ СПИСАНИЯ МАТЕРИАЛОВ (Тестодел / Зав.упаковщица)
// Списание БЕЗ подтверждения: "Линия X — Сырьё" → "Линия X — Промежуточный"
// ============================================================

// ─── Зафиксировать фактический расход материала ──────────
// payload = {items: [{material, qty}]}
function spWriteOff(user, payload) {
  requireRole(user, [ROLES.TESTODEL, ROLES.UPAKOVSHCHITSA, ROLES.BRIGADIR, ROLES.ADMIN]);
  if (!user.liniya) return {ok: false, error: 'Не задана линия в профиле'};

  var items = (payload.items || []).filter(function(it){ return it.material && Number(it.qty) > 0; });
  if (!items.length) return {ok: false, error: 'Укажите хотя бы один материал'};

  var ss = ensureShiftProdSheets();
  var shA = ss.getSheetByName('Акты_списания');
  var wsss = ensureWarehouseSheets();
  var dateStr = formatDateOnly(new Date());
  var fromWh = whLineRaw(user.liniya);
  var toWh = whLineInterim(user.liniya);

  // Проверка остатка сырья на линии перед списанием
  for (var k = 0; k < items.length; k++) {
    var bal = getWarehouseBalance(wsss, fromWh, items[k].material);
    if (bal.qty < Number(items[k].qty)) {
      return {ok: false, error: 'Недостаточно остатка "' + items[k].material + '" на складе ' + fromWh + ' (доступно: ' + bal.qty + ')'};
    }
  }

  var docId = Utilities.getUuid();
  items.forEach(function(it) {
    var id = Utilities.getUuid();
    var newRow = shA.getLastRow() + 1;
    shA.getRange(newRow, 2).setNumberFormat('@');
    shA.getRange(newRow, 1, 1, 8).setValues([[
      id, dateStr, user.liniya, user.smena || '', user.fio, it.material, Number(it.qty), docId
    ]]);
    // Списание без подтверждения: сразу с Сырья линии на Промежуточный склад линии
    adjustWarehouseBalance(wsss, fromWh, it.material, -Number(it.qty));
    adjustWarehouseBalance(wsss, toWh, it.material, Number(it.qty));
  });

  logProdAction(ss, user.fio, 'СПИСАНИЕ МАТЕРИАЛОВ', user.liniya + ' · ' + items.length + ' поз.');
  return {ok: true};
}

// ─── История списаний за смену на линии ───────────────────
function spGetWriteOffs(user, payload) {
  requireRole(user, [ROLES.TESTODEL, ROLES.UPAKOVSHCHITSA, ROLES.BRIGADIR, ROLES.ADMIN, ROLES.ZAV_PROD]);
  var ss = ensureShiftProdSheets();
  var sh = ss.getSheetByName('Акты_списания');
  var rows = sh.getDataRange().getValues();

  var liniya = payload && payload.liniya ? payload.liniya : user.liniya;
  var date   = payload && payload.date   ? payload.date   : formatDateOnly(new Date());

  // Группируем строки по ID документа (rows[i][7]); для старых записей без docId
  // (созданных до этого обновления) используем ID строки как fallback.
  var docsMap = {}; // docId -> {date, who, smena, items: []}
  var docOrder = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    if (rows[i][2] !== liniya || normalizeDateCell(rows[i][1]) !== date) continue;
    var docId = rows[i][7] || rows[i][0];
    if (!docsMap[docId]) {
      docsMap[docId] = {docId: docId, date: normalizeDateCell(rows[i][1]), who: rows[i][4], smena: rows[i][3], items: []};
      docOrder.push(docId);
    }
    docsMap[docId].items.push({material: rows[i][5], qty: rows[i][6]});
  }

  var list = docOrder.reverse().map(function(id){ return docsMap[id]; });
  return {ok: true, list: list, liniya: liniya, date: date};
}

// ============================================================
// ОТГРУЗКА ГОТОВОЙ ПРОДУКЦИИ — теперь это ОБЫЧНОЕ ПЕРЕМЕЩЕНИЕ
// "Линия X — Промежуточный" → "Склад ГП", требует подтверждения
// Завсклада ГП. Используется стандартная система warehouseCreateTransfer.
// ============================================================

// ─── Получить отгрузки (= принятые перемещения на Склад ГП) за дату для линии ──
// Используется для отчёта плана/факта при закрытии смены.
function getAcceptedShipmentsToGP(ss, liniya, date) {
  var shTH = ss.getSheetByName('Накладные_перевода');
  var shTL = ss.getSheetByName('Накладные_перевода_строки');
  if (!shTH || !shTL) return {};

  var fromWh = whLineInterim(liniya);
  var thRows = shTH.getDataRange().getValues();
  var tlRows = shTL.getDataRange().getValues();

  var acceptedIds = {};
  for (var h = 1; h < thRows.length; h++) {
    if (!thRows[h][0]) continue;
    if (thRows[h][3] !== fromWh) continue;          // отправитель — промежуточный склад этой линии
    if (thRows[h][4] !== WH_FINISHED_GOODS) continue; // получатель — Склад ГП
    if (thRows[h][6] !== 'Принято') continue;
    var trDate = normalizeDateCell(thRows[h][2]);
    if (trDate !== date) continue;
    acceptedIds[thRows[h][0]] = true;
  }

  var shipped = {}; // product -> qty
  for (var j = 1; j < tlRows.length; j++) {
    if (!tlRows[j][0] || !acceptedIds[tlRows[j][0]]) continue;
    var p = tlRows[j][1];
    shipped[p] = (shipped[p] || 0) + (Number(tlRows[j][2]) || 0);
  }
  return shipped;
}

// ============================================================
// ЗАКРЫТИЕ СМЕНЫ (Бригадир) — план vs факт + порог отклонения
// ============================================================

// ─── Рассчитать план vs факт для текущей смены/дня линии ──
// Алгоритм:
//   1. Берём принятые перемещения "Промежуточный → Склад ГП" за дату (факт продукции)
//   2. По норме расходов считаем ПЛАН расхода материалов
//   3. Берём ФАКТ — акты списания на промежуточный склад за тот же день
//   4. Считаем отклонение по каждому материалу (кг и %), флагуем превышение порога
// ─── Общий расчёт данных смены: что отгружено (продукция) и что списано (сырьё) ──
// Используется и в отчёте (spGetShiftReport), и при закрытии (spCloseShift),
// чтобы оба места считали одинаково.
function calcShiftFacts(ss, liniya, date) {
  var shippedMap = getAcceptedShipmentsToGP(ss, liniya, date); // product -> qty (факт продукции)

  var shA = ss.getSheetByName('Акты_списания');
  var aRows = shA.getDataRange().getValues();
  var factByMaterial = {}; // material -> qty (факт расхода сырья)
  for (var j = 1; j < aRows.length; j++) {
    if (!aRows[j][0]) continue;
    if (aRows[j][2] !== liniya || normalizeDateCell(aRows[j][1]) !== date) continue;
    var mat = aRows[j][5];
    factByMaterial[mat] = (factByMaterial[mat] || 0) + (Number(aRows[j][6]) || 0);
  }

  return {shippedMap: shippedMap, factByMaterial: factByMaterial};
}

function spGetShiftReport(user, payload) {
  requireRole(user, [ROLES.BRIGADIR, ROLES.ADMIN, ROLES.ZAV_PROD]);
  var ss = ensureShiftProdSheets();
  ensureWarehouseSheets();

  var liniya = payload && payload.liniya ? payload.liniya : user.liniya;
  var date   = payload && payload.date   ? payload.date   : formatDateOnly(new Date());

  if (!liniya) return {ok: false, error: 'Не задана линия'};

  var facts = calcShiftFacts(ss, liniya, date);
  var shippedMap = facts.shippedMap;
  var factByMaterial = facts.factByMaterial;

  // 2. Нормы расходов
  var normsMap = getNormsMap(ss);

  // 3. Плановый расход по материалам
  var planByMaterial = {};
  var productBreakdown = [];

  Object.keys(shippedMap).forEach(function(product) {
    var shippedQty = shippedMap[product];
    var productNorm = normsMap[product] || {};
    var matList = [];

    Object.keys(productNorm).forEach(function(material) {
      var norm = productNorm[material];
      var planQty = Math.round(norm * shippedQty * 1000) / 1000;
      planByMaterial[material] = (planByMaterial[material] || 0) + planQty;
      matList.push({material: material, norm: norm, planQty: planQty});
    });

    productBreakdown.push({product: product, qty: shippedQty, materials: matList});
  });

  // 5. Сводная таблица план vs факт + флаг превышения порога
  var allMaterials = {};
  Object.keys(planByMaterial).forEach(function(m){ allMaterials[m] = true; });
  Object.keys(factByMaterial).forEach(function(m){ allMaterials[m] = true; });

  var hasWarning = false;
  var comparison = Object.keys(allMaterials).map(function(material) {
    var plan = Math.round((planByMaterial[material] || 0) * 1000) / 1000;
    var fact = Math.round((factByMaterial[material] || 0) * 1000) / 1000;
    var diffKg = Math.round((fact - plan) * 1000) / 1000;
    var diffPct = plan > 0 ? Math.round(diffKg / plan * 1000) / 10 : null;
    var isWarning = diffPct !== null && Math.abs(diffPct) > SP_DEVIATION_THRESHOLD_PCT;
    if (isWarning) hasWarning = true;
    return {material: material, plan: plan, fact: fact, diffKg: diffKg, diffPct: diffPct, isWarning: isWarning};
  });
  comparison.sort(function(a,b){ return a.material.localeCompare(b.material); });

  // 6. Текущий остаток промежуточного склада (что осталось висеть, не отгружено)
  var interimWh = whLineInterim(liniya);
  var interimBalRes = warehouseGetBalances(user, {warehouse: interimWh});
  var interimBalance = (interimBalRes.balances || []).filter(function(b){ return b.qty !== 0; });

  return {
    ok: true, liniya: liniya, date: date,
    shipped: productBreakdown,
    comparison: comparison,
    hasWarning: hasWarning,
    thresholdPct: SP_DEVIATION_THRESHOLD_PCT,
    interimBalance: interimBalance,
    isAlreadyClosed: isShiftClosed(ss, liniya, date)
  };
}

// ─── Проверить, закрыта ли смена (по линии+дате) ──────────
function isShiftClosed(ss, liniya, date) {
  var sh = ss.getSheetByName('Закрытые_смены');
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][2] === liniya && normalizeDateCell(rows[i][1]) === date) return true;
  }
  return false;
}

// ─── Закрыть смену: «производственное начисление» + фиксация закрытия ──
// При закрытии система засчитывает фактически произведённую продукцию
// (закрывает минус по готовой продукции на промежуточном складе, образовавшийся
// после отгрузки на Склад ГП) и списывает фактически израсходованное сырьё
// (закрывает остаток по сырью, накопленный актами списания за смену).
// Если факт продукции/сырья не совпадает с тем, что реально лежало на складе
// (например, отгрузили больше нормы) — небольшой остаток может сохраниться,
// это и есть видимое расхождение для контроля.
function spCloseShift(user, payload) {
  requireRole(user, [ROLES.BRIGADIR, ROLES.ADMIN]);
  var ss = ensureShiftProdSheets();
  var wsss = ensureWarehouseSheets();

  var liniya = payload && payload.liniya ? payload.liniya : user.liniya;
  var date   = payload && payload.date   ? payload.date   : formatDateOnly(new Date());

  if (!liniya) return {ok: false, error: 'Не задана линия'};
  if (isShiftClosed(ss, liniya, date)) {
    return {ok: false, error: 'Смена уже закрыта'};
  }

  var interimWh = whLineInterim(liniya);
  var facts = calcShiftFacts(ss, liniya, date);

  // 1. Засчитать произведённую продукцию — закрыть минус, образованный отгрузкой на Склад ГП.
  //    (Перемещение уже списало это количество с Промежуточного при отгрузке; здесь его
  //    «начисляют обратно» как факт производства, приводя остаток по продукции к 0.)
  Object.keys(facts.shippedMap).forEach(function(product) {
    var qty = facts.shippedMap[product];
    if (qty > 0) adjustWarehouseBalance(wsss, interimWh, product, qty);
  });

  // 2. Списать фактически израсходованное сырьё — закрыть остаток, накопленный
  //    приходом от Сырья при списании актами в течение смены, приводя его к 0.
  Object.keys(facts.factByMaterial).forEach(function(material) {
    var qty = facts.factByMaterial[material];
    if (qty > 0) adjustWarehouseBalance(wsss, interimWh, material, -qty);
  });

  var sh = ss.getSheetByName('Закрытые_смены');
  var newRow = sh.getLastRow() + 1;
  sh.getRange(newRow, 2).setNumberFormat('@');
  sh.getRange(newRow, 1, 1, 5).setValues([[
    Utilities.getUuid(), date, liniya, user.smena || '', user.fio
  ]]);

  logProdAction(ss, user.fio, 'ЗАКРЫТИЕ СМЕНЫ', liniya + ' · ' + date);
  return {ok: true};
}