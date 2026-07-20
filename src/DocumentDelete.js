// ============================================================
// GOLD LAVASH — УДАЛЕНИЕ ДОКУМЕНТОВ (только Администратор)
// Позволяет удалить неправильно оформленный документ из любого
// раздела системы. При удалении автоматически откатывается
// связанное движение остатков, чтобы склады остались корректными.
// ============================================================

// ─── Приход от поставщика (документ = группа строк с одинаковым ID документа) ──
// Откат: списывает с соответствующего склада то количество, которое было
// зачислено при приёме (т.е. снимает приход обратно).
function deleteIncomingDocument(user, payload) {
  requireRole(user, [ROLES.ADMIN]);
  var docId = payload && payload.docId;
  if (!docId) return {ok: false, error: 'Не указан документ'};

  var ss = ensureSkladSheets();
  var sh = ss.getSheetByName('Приход_материалов');
  var rows = sh.getDataRange().getValues();
  var wsss = ensureWarehouseSheets();

  var rowsToDelete = [];
  var itemsRolledBack = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var rowDocId = rows[i][9] || rows[i][0]; // fallback для старых записей без docId
    if (rowDocId !== docId) continue;
    rowsToDelete.push(i + 1);
    var material = rows[i][4], qty = Number(rows[i][5]) || 0;
    adjustWarehouseBalance(wsss, WH_RAW_MATERIALS, material, -qty);
    itemsRolledBack.push(material + ': -' + qty);
  }

  if (!rowsToDelete.length) return {ok: false, error: 'Документ не найден'};

  // Удаляем строки снизу вверх, чтобы не сбить индексы
  rowsToDelete.sort(function(a,b){ return b - a; }).forEach(function(r){ sh.deleteRow(r); });

  logProdAction(ss, user.fio, 'УДАЛЕНИЕ ПРИХОДА', docId + ' · откат: ' + itemsRolledBack.join(', '));
  return {ok: true, rolledBack: itemsRolledBack};
}

// ─── Перемещение между складами ──────────────────────────────
// Откат зависит от статуса:
//  - "В пути": ничего не двигалось по балансам — просто удаляем накладную
//  - "Принято": баланс уже изменён (списано у отправителя, зачислено получателю) — откатываем оба
//  - "Отклонено" / "Исправлено (см. №X)": баланс не менялся — просто удаляем
function deleteTransferDocument(user, payload) {
  requireRole(user, [ROLES.ADMIN]);
  var id = payload && payload.id;
  if (!id) return {ok: false, error: 'Не указан документ'};

  var ss = ensureWarehouseSheets();
  var shHeader = ss.getSheetByName('Накладные_перевода');
  var shLines  = ss.getSheetByName('Накладные_перевода_строки');
  var headerRows = shHeader.getDataRange().getValues();

  var rowIdx = -1, status = null, fromWarehouse = null, toWarehouse = null, invoiceNo = null;
  for (var i = 1; i < headerRows.length; i++) {
    if (headerRows[i][0] === id) {
      rowIdx = i; status = headerRows[i][6];
      fromWarehouse = headerRows[i][3]; toWarehouse = headerRows[i][4];
      invoiceNo = headerRows[i][1];
      break;
    }
  }
  if (rowIdx === -1) return {ok: false, error: 'Накладная не найдена'};

  var lineRows = shLines.getDataRange().getValues();
  var items = [];
  var lineRowsToDelete = [];
  for (var j = 1; j < lineRows.length; j++) {
    if (lineRows[j][0] !== id) continue;
    items.push({product: lineRows[j][1], qty: Number(lineRows[j][2]) || 0});
    lineRowsToDelete.push(j + 1);
  }

  var rolledBack = [];
  var wasAccepted = (status === 'Принято');
  if (wasAccepted) {
    items.forEach(function(it) {
      adjustWarehouseBalance(ss, fromWarehouse, it.product, it.qty);   // вернуть отправителю
      adjustWarehouseBalance(ss, toWarehouse, it.product, -it.qty);    // снять с получателя
      rolledBack.push(it.product + ': ' + it.qty);
    });
  }

  // Удаляем строки накладной (снизу вверх)
  lineRowsToDelete.sort(function(a,b){ return b - a; }).forEach(function(r){ shLines.deleteRow(r); });
  shHeader.deleteRow(rowIdx + 1);

  logProdAction(ss, user.fio, 'УДАЛЕНИЕ ПЕРЕМЕЩЕНИЯ', '\u2116' + invoiceNo + (wasAccepted ? ' · откат: ' + rolledBack.join(', ') : ' (баланс не менялся)'));
  return {ok: true, wasAccepted: wasAccepted, rolledBack: rolledBack};
}

// ─── Акт списания материалов (документ = группа строк с одинаковым ID документа) ──
// Откат: возвращает сырьё на "Линия X — Сырьё" и снимает с "Линия X — Промежуточный".
function deleteWriteOffDocument(user, payload) {
  requireRole(user, [ROLES.ADMIN]);
  var docId = payload && payload.docId;
  if (!docId) return {ok: false, error: 'Не указан документ'};

  var ss = ensureShiftProdSheets();
  var sh = ss.getSheetByName('Акты_списания');
  var rows = sh.getDataRange().getValues();
  var wsss = ensureWarehouseSheets();

  var rowsToDelete = [];
  var rolledBack = [];
  var liniya = null;
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var rowDocId = rows[i][7] || rows[i][0]; // fallback для старых записей без docId
    if (rowDocId !== docId) continue;
    liniya = rows[i][2];
    rowsToDelete.push(i + 1);
    var material = rows[i][5], qty = Number(rows[i][6]) || 0;
    adjustWarehouseBalance(wsss, whLineRaw(liniya), material, qty);       // вернуть на Сырьё
    adjustWarehouseBalance(wsss, whLineInterim(liniya), material, -qty);  // снять с Промежуточного
    rolledBack.push(material + ': ' + qty);
  }

  if (!rowsToDelete.length) return {ok: false, error: 'Документ не найден'};

  rowsToDelete.sort(function(a,b){ return b - a; }).forEach(function(r){ sh.deleteRow(r); });

  logProdAction(ss, user.fio, 'УДАЛЕНИЕ СПИСАНИЯ', docId + ' · ' + liniya + ' · откат: ' + rolledBack.join(', '));
  return {ok: true, rolledBack: rolledBack};
}

// ─── Запись инвентаризации (одна строка истории) ─────────────
// Откат: возвращает остаток к значению "Было" (отменяет корректировку).
function deleteInventoryRecord(user, payload) {
  requireRole(user, [ROLES.ADMIN]);
  var warehouse = payload && payload.warehouse;
  var product = payload && payload.product;
  var date = payload && payload.date;
  var who = payload && payload.who;
  if (!warehouse || !product || !date) return {ok: false, error: 'Не указаны параметры записи'};

  var ss = ensureInventorySheet();
  var sh = ss.getSheetByName('Инвентаризация');
  var rows = sh.getDataRange().getValues();

  var rowIdx = -1, diff = 0;
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    if (normalizeDateCell(rows[i][0]) === date && rows[i][1] === warehouse && rows[i][2] === product && (!who || rows[i][6] === who)) {
      rowIdx = i; diff = Number(rows[i][5]) || 0;
      break;
    }
  }
  if (rowIdx === -1) return {ok: false, error: 'Запись не найдена'};

  // Откатываем корректировку (вычитаем ту же разницу, что была применена)
  if (diff !== 0) adjustWarehouseBalance(ss, warehouse, product, -diff);

  sh.deleteRow(rowIdx + 1);

  logProdAction(ss, user.fio, 'УДАЛЕНИЕ ИНВЕНТАРИЗАЦИИ', warehouse + ' · ' + product + ' · откат: ' + (-diff));
  return {ok: true, rolledBack: -diff};
}

// ─── Закрытая смена (запись о закрытии) ───────────────────────
// ВНИМАНИЕ: НЕ откатывает производственное начисление (зачисление продукции /
// списание сырья на промежуточном складе) — это движение реализовано через
// adjustWarehouseBalance с тем же материалами/количествами, что и обычные
// акты списания и перемещения, поэтому отдельного отката тут не требуется:
// смена просто помечается как "не закрытая" и Бригадир может закрыть её заново
// (при повторном закрытии расчёт будет произведён по актуальным данным заново).
function deleteClosedShift(user, payload) {
  requireRole(user, [ROLES.ADMIN]);
  var liniya = payload && payload.liniya;
  var date = payload && payload.date;
  if (!liniya || !date) return {ok: false, error: 'Не указаны линия и дата'};

  var ss = ensureShiftProdSheets();
  var sh = ss.getSheetByName('Закрытые_смены');
  var rows = sh.getDataRange().getValues();

  var rowIdx = -1;
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][2] === liniya && normalizeDateCell(rows[i][1]) === date) { rowIdx = i; break; }
  }
  if (rowIdx === -1) return {ok: false, error: 'Запись о закрытии не найдена'};

  sh.deleteRow(rowIdx + 1);
  logProdAction(ss, user.fio, 'ОТМЕНА ЗАКРЫТИЯ СМЕНЫ', liniya + ' · ' + date);
  return {ok: true};
}