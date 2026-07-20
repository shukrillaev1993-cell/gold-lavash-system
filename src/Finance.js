// ============================================================
// GOLD LAVASH — ФИНАНСИСТ
// Универсальное согласование документов + плановая себестоимость SKU
// ============================================================

// ══════════════════════════════════════════════════════════════
// УНИВЕРСАЛЬНОЕ СОГЛАСОВАНИЕ ДОКУМЕНТОВ
// Любой тип документа (Штатное расписание и другие в будущем)
// может быть отправлен на согласование Финансисту.
// docType — строковый идентификатор типа ('Штатное_расписание', ...)
// refId   — ID конкретного документа этого типа (например ID из Штат_документы)
// ══════════════════════════════════════════════════════════════

var HR_SHEET_APPROVALS = '\u0421\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u044f';

function ensureApprovalSheet() {
  var ss = getHRSS();
  if (!ss.getSheetByName(HR_SHEET_APPROVALS)) {
    var sh = ss.insertSheet(HR_SHEET_APPROVALS);
    sh.getRange(1,1,1,10).setValues([[
      'ID','\u0422\u0438\u043f_\u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430','\u0421\u0441\u044b\u043b\u043a\u0430_ID','\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435',
      '\u0418\u043d\u0438\u0446\u0438\u0430\u0442\u043e\u0440','\u0414\u0430\u0442\u0430_\u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0438','\u0421\u0442\u0430\u0442\u0443\u0441',
      '\u0421\u043e\u0433\u043b\u0430\u0441\u0443\u044e\u0449\u0438\u0439','\u0414\u0430\u0442\u0430_\u0440\u0435\u0448\u0435\u043d\u0438\u044f','\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439'
    ]]);
    sh.getRange(1,1,1,10).setFontWeight('bold').setBackground('#0D47A1').setFontColor('#fff');
    sh.setFrozenRows(1);
  }
  return ss;
}

// ─── Отправить документ на согласование (вызывается из любого модуля) ──
function approvalSubmit(user, payload) {
  if (!payload.docType) return {ok:false, error:'\u041d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d \u0442\u0438\u043f \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430'};
  if (!payload.refId)   return {ok:false, error:'\u041d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d\u0430 \u0441\u0441\u044b\u043b\u043a\u0430 \u043d\u0430 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442'};
  var ss = ensureApprovalSheet();
  var sh = ss.getSheetByName(HR_SHEET_APPROVALS);
  var id = Utilities.getUuid();
  sh.appendRow([
    id, payload.docType, payload.refId, payload.title||'',
    user.fio, new Date(), '\u041d\u0430 \u0441\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u0438',
    '', '', ''
  ]);
  return {ok:true, id:id, message:'\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e \u043d\u0430 \u0441\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u0435'};
}

// ─── Финансист: очередь документов на согласование ──────────
function approvalGetPending(user, payload) {
  requireRole(user, ['\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = ensureApprovalSheet();
  var sh = ss.getSheetByName(HR_SHEET_APPROVALS);
  var rows = sh.getDataRange().getValues();
  var docType = payload && payload.docType;
  var list = [];
  for (var i=1;i<rows.length;i++) {
    if (!rows[i][0]) continue;
    if (rows[i][6] !== '\u041d\u0430 \u0441\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u0438') continue;
    if (docType && rows[i][1] !== docType) continue;
    list.push({
      id:rows[i][0], docType:rows[i][1], refId:rows[i][2], title:rows[i][3],
      initiator:rows[i][4], dateSent:hrFmtDate(rows[i][5]), status:rows[i][6]
    });
  }
  list.sort(function(a,b){ return a.dateSent < b.dateSent ? 1 : -1; });
  return {ok:true, items:list};
}

// ─── История согласований по конкретному документу (для инициатора) ──
function approvalGetHistory(user, payload) {
  var ss = ensureApprovalSheet();
  var sh = ss.getSheetByName(HR_SHEET_APPROVALS);
  var rows = sh.getDataRange().getValues();
  var list = [];
  for (var i=rows.length-1;i>=1;i--) {
    if (!rows[i][0]) continue;
    if (rows[i][1] !== payload.docType) continue;
    if (rows[i][2] !== payload.refId) continue;
    list.push({
      id:rows[i][0], status:rows[i][6], initiator:rows[i][4],
      dateSent:hrFmtDate(rows[i][5]), approver:rows[i][7],
      dateDecided:hrFmtDate(rows[i][8]), comment:rows[i][9]
    });
  }
  return {ok:true, history:list};
}

// ─── Все согласования (журнал для Финансиста — включая решённые) ──
function approvalGetAll(user, payload) {
  requireRole(user, ['\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = ensureApprovalSheet();
  var sh = ss.getSheetByName(HR_SHEET_APPROVALS);
  var rows = sh.getDataRange().getValues();
  var list = [];
  for (var i=rows.length-1;i>=1;i--) {
    if (!rows[i][0]) continue;
    list.push({
      id:rows[i][0], docType:rows[i][1], refId:rows[i][2], title:rows[i][3],
      initiator:rows[i][4], dateSent:hrFmtDate(rows[i][5]), status:rows[i][6],
      approver:rows[i][7], dateDecided:hrFmtDate(rows[i][8]), comment:rows[i][9]
    });
    if (list.length >= 200) break;
  }
  return {ok:true, items:list};
}

// ─── Утвердить ────────────────────────────────────────────────
function approvalApprove(user, payload) {
  requireRole(user, ['\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = ensureApprovalSheet();
  var sh = ss.getSheetByName(HR_SHEET_APPROVALS);
  var rows = sh.getDataRange().getValues();
  for (var i=1;i<rows.length;i++) {
    if (rows[i][0] === payload.id) {
      sh.getRange(i+1,7).setValue('\u0423\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u043e');
      sh.getRange(i+1,8).setValue(user.fio);
      sh.getRange(i+1,9).setValue(new Date());
      return {ok:true, message:'\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u0443\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d'};
    }
  }
  return {ok:false, error:'\u041d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e'};
}

// ─── Отклонить с комментарием ──────────────────────────────────
function approvalReject(user, payload) {
  requireRole(user, ['\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  if (!payload.comment) return {ok:false, error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043f\u0440\u0438\u0447\u0438\u043d\u0443 \u043e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u0438\u044f'};
  var ss = ensureApprovalSheet();
  var sh = ss.getSheetByName(HR_SHEET_APPROVALS);
  var rows = sh.getDataRange().getValues();
  for (var i=1;i<rows.length;i++) {
    if (rows[i][0] === payload.id) {
      sh.getRange(i+1,7).setValue('\u041e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u043e');
      sh.getRange(i+1,8).setValue(user.fio);
      sh.getRange(i+1,9).setValue(new Date());
      sh.getRange(i+1,10).setValue(payload.comment);
      return {ok:true, message:'\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u043e\u0442\u043a\u043b\u043e\u043d\u0451\u043d'};
    }
  }
  return {ok:false, error:'\u041d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e'};
}

// ─── Массово: последний статус согласования для ВСЕХ документов типа ──
// (без ограничения роли — нужно любому, кто инициирует документы этого типа)
function approvalGetHistoryBulk(user, payload) {
  if (!payload || !payload.docType) return {ok:false, error:'\u041d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d \u0442\u0438\u043f \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430'};
  var ss = ensureApprovalSheet();
  var sh = ss.getSheetByName(HR_SHEET_APPROVALS);
  var rows = sh.getDataRange().getValues();
  var latestByRef = {}; // refId -> последняя запись (самая свежая по дате отправки)
  for (var i=1;i<rows.length;i++) {
    if (!rows[i][0]) continue;
    if (rows[i][1] !== payload.docType) continue;
    var refId = rows[i][2];
    var entry = {
      id:rows[i][0], status:rows[i][6], initiator:rows[i][4],
      dateSent:hrFmtDate(rows[i][5]), approver:rows[i][7],
      dateDecided:hrFmtDate(rows[i][8]), comment:rows[i][9]
    };
    // Строки идут по порядку добавления — последняя встреченная всегда самая свежая
    latestByRef[refId] = entry;
  }
  return {ok:true, byRef:latestByRef};
}

// ══════════════════════════════════════════════════════════════
// ПЛАНОВАЯ СЕБЕСТОИМОСТЬ ПО SKU
// Материалы + Труд + Прочие расходы = Итого плановая себестоимость
// ══════════════════════════════════════════════════════════════

var HR_SHEET_SKUCOST = '\u0421\u0435\u0431\u0435\u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c_SKU';

function ensureSkuCostSheet() {
  var ss = getHRSS();
  if (!ss.getSheetByName(HR_SHEET_SKUCOST)) {
    var sh = ss.insertSheet(HR_SHEET_SKUCOST);
    sh.getRange(1,1,1,6).setValues([[
      '\u041f\u0440\u043e\u0434\u0443\u043a\u0442','\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044b','\u0422\u0440\u0443\u0434',
      '\u041f\u0440\u043e\u0447\u0438\u0435_\u0440\u0430\u0441\u0445\u043e\u0434\u044b','\u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u043e','\u0410\u0432\u0442\u043e\u0440'
    ]]);
    sh.getRange(1,1,1,6).setFontWeight('bold').setBackground('#004D40').setFontColor('#fff');
    sh.setFrozenRows(1);
  }
  return ss;
}

function finGetSkuCosts(user) {
  requireRole(user, ['\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = ensureSkuCostSheet();
  var sh = ss.getSheetByName(HR_SHEET_SKUCOST);
  var rows = sh.getDataRange().getValues();
  var list = [];
  for (var i=1;i<rows.length;i++) {
    if (!rows[i][0]) continue;
    var mat = Number(rows[i][1])||0, labor = Number(rows[i][2])||0, other = Number(rows[i][3])||0;
    list.push({
      product:rows[i][0], materials:mat, labor:labor, other:other,
      total: mat+labor+other, updated:hrFmtDate(rows[i][4]), author:rows[i][5],
      rowIdx:i+1
    });
  }
  return {ok:true, costs:list};
}

function finSaveSkuCost(user, payload) {
  requireRole(user, ['\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  if (!payload.product) return {ok:false, error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043f\u0440\u043e\u0434\u0443\u043a\u0442'};
  var ss = ensureSkuCostSheet();
  var sh = ss.getSheetByName(HR_SHEET_SKUCOST);
  var rows = sh.getDataRange().getValues();
  var row = [
    payload.product, Number(payload.materials)||0, Number(payload.labor)||0,
    Number(payload.other)||0, new Date(), user.fio
  ];
  for (var i=1;i<rows.length;i++) {
    if (rows[i][0] === payload.product) {
      sh.getRange(i+1,1,1,6).setValues([row]);
      return {ok:true, message:'\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e'};
    }
  }
  sh.appendRow(row);
  return {ok:true, message:'\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e'};
}

function finDeleteSkuCost(user, payload) {
  requireRole(user, ['\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = ensureSkuCostSheet();
  var sh = ss.getSheetByName(HR_SHEET_SKUCOST);
  if (payload.rowIdx) sh.deleteRow(Number(payload.rowIdx));
  return {ok:true};
}

// ─── Список продуктов (для выпадающего списка в форме себестоимости) ──
// Переиспользуем существующий getProducts() из Code.gs — доступен всем ролям через отдельный маршрут
function finGetProductNames(user) {
  requireRole(user, ['\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var res = getProducts(user);
  if (!res.ok) return {ok:true, names:[]};
  return {ok:true, names:res.products.map(function(p){return p.name;})};
}