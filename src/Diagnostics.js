// ============================================================
// GOLD LAVASH — ДИАГНОСТИКА ИСПОЛЬЗОВАНИЯ ПАМЯТИ ТАБЛИЦ
// Показывает Администратору сколько ячеек занято/свободно
// в каждой Google-таблице системы (лимит Google Sheets: 10 млн ячеек на файл)
// ============================================================

var SHEETS_CELL_LIMIT = 10000000; // лимит Google Sheets на один файл (ячеек)

// ─── Собрать статистику по одной таблице: лист за листом ──────
function analyzeSpreadsheetUsage(ss, label) {
  var sheets = ss.getSheets();
  var sheetStats = [];
  var totalUsedCells = 0;
  var totalMaxCells = 0;

  sheets.forEach(function(sh) {
    var maxRows = sh.getMaxRows();
    var maxCols = sh.getMaxColumns();
    var lastRow = sh.getLastRow();
    var lastCol = sh.getLastColumn();

    var maxCells  = maxRows * maxCols;       // сколько ячеек физически создано (включая пустые)
    var usedCells = lastRow * lastCol;       // сколько занято данными (приблизительно, по прямоугольнику)

    totalMaxCells  += maxCells;
    totalUsedCells += usedCells;

    sheetStats.push({
      name: sh.getName(),
      rows: lastRow, cols: lastCol,
      maxRows: maxRows, maxCols: maxCols,
      usedCells: usedCells, maxCells: maxCells,
      usedPct: maxCells > 0 ? Math.round(usedCells / maxCells * 1000) / 10 : 0
    });
  });

  sheetStats.sort(function(a, b) { return b.usedCells - a.usedCells; });

  return {
    label: label,
    url: ss.getUrl(),
    id: ss.getId(),
    sheetCount: sheets.length,
    totalUsedCells: totalUsedCells,
    totalMaxCells: totalMaxCells,
    limitPct: Math.round(totalUsedCells / SHEETS_CELL_LIMIT * 1000) / 10,
    remainingCells: SHEETS_CELL_LIMIT - totalUsedCells,
    sheets: sheetStats
  };
}

// ─── Главная функция: собрать статистику по ВСЕМ таблицам системы ──
function adminGetStorageUsage(user) {
  requireRole(user, [ROLES.ADMIN]);

  var results = [];
  var errors = [];

  // ── GL_MainDB (основная база: пользователи, продукты, сессии) ──
  try {
    var mainDb = getMainDB();
    if (mainDb) results.push(analyzeSpreadsheetUsage(mainDb, 'GL_MainDB (основная база)'));
  } catch(e) { errors.push('GL_MainDB: ' + e.message); }

  // ── GL_Production (производство, склад, графики, распределение) ──
  try {
    var prodDb = getProductionDB();
    if (prodDb) results.push(analyzeSpreadsheetUsage(prodDb, 'GL_Production (производство и склад)'));
  } catch(e) { errors.push('GL_Production: ' + e.message); }

  // ── Внешние таблицы ──
  var external = [
    {id: KADRY_SS_ID,  label: 'Кадры GL (внешняя)'},
    {id: NORMA_SS_ID,  label: 'Норма расхода (внешняя)'},
    {id: FORMA_SS_ID,  label: 'Учёт форм (внешняя)'},
    {id: ORDERS_SS_ID, label: 'Онлайн заказ (внешняя)'}
  ];

  external.forEach(function(ext) {
    try {
      var ss = SpreadsheetApp.openById(ext.id);
      results.push(analyzeSpreadsheetUsage(ss, ext.label));
    } catch(e) {
      errors.push(ext.label + ': нет доступа или таблица удалена');
    }
  });

  return {ok: true, tables: results, errors: errors};
}