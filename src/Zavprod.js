// ============================================================
// GOLD LAVASH — МОДУЛЬ ЗАВ.ПРОИЗВОДСТВОМ (Этап 3)
// График работы, приоритеты продуктов, распределение заказов
// ============================================================

// ID внешней таблицы с заказами от дилеров
var ORDERS_SS_ID = '1orbIxV350XcLVxQZayLWpEHP4zj77uCFIZkz-tfQXhU'; // единая таблица заказов

// ─── Какие классы продуктов читает эта роль ───────────────────
// Колонка F (индекс 5) в Архив заказа — "Класс": Лаваш / Булочка / Хлеб
function getAllowedClasses(user) {
  if (user && user.role === 'Зав.производством Булочки') {
    return ['Булочка', 'Хлеб']; // цех булочек/хлеба
  }
  return ['Лаваш']; // лавашный цех по умолчанию
}

// ─── Определить тип цеха по роли ─────────────────────────────
function getCehType(user) {
  if (user && user.role === 'Зав.производством Булочки') return 'Булочки';
  return 'Лаваш';
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ ЛИСТОВ ДЛЯ ЗАВ.ПРОИЗВОДСТВОМ
// ============================================================
function ensureZavProdSheets() {
  var ss = ensureProductionDB();

  // ── График работы (часы работы по линии/смене на каждый день) ──
  if (!ss.getSheetByName('График_работы')) {
    var shSched = ss.insertSheet('График_работы');
    shSched.getRange(1,1,1,5).setValues([[
      'ID записи','Линия','Смена','Дата','Часы работы'
    ]]);
    shSched.getRange(1,1,1,5).setFontWeight('bold').setBackground('#283593').setFontColor('#fff');
    shSched.setFrozenRows(1);
    shSched.getRange(2, 4, shSched.getMaxRows()-1, 1).setNumberFormat('@'); // дата как текст
  } else {
    fixScheduleDateColumn(ss.getSheetByName('График_работы'));
  }

  // ── Приоритеты продуктов по линиям ──
  if (!ss.getSheetByName('Приоритеты_продуктов')) {
    var shPrio = ss.insertSheet('Приоритеты_продуктов');
    shPrio.getRange(1,1,1,4).setValues([[
      'Наименование продукта','Основная линия','Вспомогательная 1','Вспомогательная 2'
    ]]);
    shPrio.getRange(1,1,1,4).setFontWeight('bold').setBackground('#6A1B9A').setFontColor('#fff');
    shPrio.setFrozenRows(1);
  }

  // ── Распределение заказов (черновик + утверждённое) ──
  if (!ss.getSheetByName('Распределение_заказов')) {
    var shDist = ss.insertSheet('Распределение_заказов');
    shDist.getRange(1,1,1,10).setValues([[
      'ID записи','Дата распределения','Продукт','Линия','Смена',
      'Кол-во из заказов','Кол-во утверждено','Статус','Кто утвердил','Время утверждения'
    ]]);
    shDist.getRange(1,1,1,10).setFontWeight('bold').setBackground('#00838F').setFontColor('#fff');
    shDist.setFrozenRows(1);
    shDist.getRange(2, 2, shDist.getMaxRows()-1, 1).setNumberFormat('@');
  }

  // ── Скорость линий ПО ТОВАРУ (шт/час) — ввод вручную Зав.производством.
  // Структура: Продукт | Линия | Скорость (шт/час). Разные товары на одной
  // линии имеют разную скорость (зависит от диаметра/времени цикла) ──
  if (!ss.getSheetByName('Скорость_линий_по_товару')) {
    var shSpeed = ss.insertSheet('Скорость_линий_по_товару');
    shSpeed.getRange(1,1,1,3).setValues([[
      'Продукт','Линия','Скорость (шт/час)'
    ]]);
    shSpeed.getRange(1,1,1,3).setFontWeight('bold').setBackground('#37474F').setFontColor('#fff');
    shSpeed.setFrozenRows(1);
  }

  return ss;
}

function fixScheduleDateColumn(sh) {
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return;
  var range = sh.getRange(2, 4, lastRow - 1, 1);
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
// ГРАФИК РАБОТЫ
// ============================================================

// ─── Получить график на месяц (по всем линиям) ────────────
function zpGetSchedule(user, payload) {
  requireRole(user, ['Зав.производством', 'Зав.производством Булочки', 'Администратор']);
  var ss = ensureZavProdSheets();
  var sh = ss.getSheetByName('График_работы');
  var rows = sh.getDataRange().getValues();

  var monthStr = (payload && payload.month) ? payload.month :
    Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Tashkent', 'MM.yyyy');

  // Линии (фиксированный список + Тандырная)
  var linesRes = adminGetLines(user);
  var lines = linesRes.lines || [];

  // Собираем: { "Линия|Смена" -> { dateStr -> hours } }
  var grid = {};
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var liniya = rows[i][1], smena = rows[i][2];
    var dateStr = normalizeDateCell(rows[i][3]);
    var dateMonthPart = dateStr.split('.').slice(1).join('.');
    if (dateMonthPart !== monthStr) continue;

    var key = liniya + '|' + smena;
    if (!grid[key]) grid[key] = {};
    grid[key][dateStr] = rows[i][4];
  }

  // Формируем список строк линия+смена (День/Ночь для каждой активной линии)
  var rowDefs = [];
  lines.filter(function(l){return l.active;}).forEach(function(l) {
    rowDefs.push({liniya: l.name, smena: 'День'});
    rowDefs.push({liniya: l.name, smena: 'Ночь'});
  });

  var daysInMonth = getDaysInMonthFromStr(monthStr);

  return {
    ok: true,
    month: monthStr,
    rowDefs: rowDefs,
    grid: grid,
    daysInMonth: daysInMonth,
    today: formatDateOnly(new Date())
  };
}

function getDaysInMonthFromStr(monthStr) {
  var parts = monthStr.split('.');
  var month = parseInt(parts[0], 10);
  var year = parseInt(parts[1], 10);
  return new Date(year, month, 0).getDate();
}

// ─── Установить часы работы на конкретный день ────────────
function zpSetScheduleHours(user, payload) {
  requireRole(user, ['Зав.производством', 'Зав.производством Булочки', 'Администратор']);
  var liniya = payload.liniya;
  var smena  = payload.smena;
  var dateStr = payload.date; // dd.MM.yyyy
  var hours  = Number(payload.hours) || 0;

  // Запрет редактирования прошлых дней
  var todayStr = formatDateOnly(new Date());
  if (compareDates(dateStr, todayStr) < 0) {
    return {ok: false, error: 'Нельзя изменить прошедший день'};
  }

  var ss = ensureZavProdSheets();
  var sh = ss.getSheetByName('График_работы');
  var rows = sh.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === liniya && rows[i][2] === smena &&
        normalizeDateCell(rows[i][3]) === dateStr) {
      sh.getRange(i+1, 5).setValue(hours);
      return {ok: true};
    }
  }

  var newRow = sh.getLastRow() + 1;
  sh.getRange(newRow, 4).setNumberFormat('@'); // форсируем текст ПЕРЕД записью значения
  sh.getRange(newRow, 1, 1, 5).setValues([[Utilities.getUuid(), liniya, smena, dateStr, hours]]);
  return {ok: true};
}

// Сравнение дат в формате dd.MM.yyyy: -1 если a<b, 0 если равны, 1 если a>b
function compareDates(a, b) {
  var pa = a.split('.'), pb = b.split('.');
  var da = new Date(pa[2], pa[1]-1, pa[0]);
  var db = new Date(pb[2], pb[1]-1, pb[0]);
  if (da < db) return -1;
  if (da > db) return 1;
  return 0;
}

// ============================================================
// ПРИОРИТЕТЫ ПРОДУКТОВ ПО ЛИНИЯМ
// ============================================================

// ══════════════════════════════════════════════════════════════
// ИСТОРИЯ РАСПРЕДЕЛЕНИЯ — план/факт по датам за период
// ══════════════════════════════════════════════════════════════

function zpGetDistributionHistory(user, payload) {
  requireRole(user, ['Зав.производством', 'Зав.производством Булочки', 'Администратор']);
  var dateFrom = payload && payload.dateFrom;
  var dateTo   = payload && payload.dateTo;
  if (!dateFrom || !dateTo) return {ok:false, error:'Укажите период'};

  var prodSS = ensureZavProdSheets();
  var sh = prodSS.getSheetByName('Распределение_заказов');
  if (!sh) return {ok:true, days:[]};
  var rows = sh.getDataRange().getValues();

  // Фильтруем по классу продукта (Лаваш / Булочки+Хлеб) — как и везде в этом модуле
  var allowedProducts = getProductsByClass(user);
  var allowedSet = {};
  allowedProducts.forEach(function(p){ allowedSet[p] = true; });

  // Собираем записи распределения в диапазоне дат
  var byDate = {};
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var date = normalizeDateCell(rows[i][1]);
    if (date < dateFrom || date > dateTo) continue;
    var product = rows[i][2];
    if (user.role !== 'Администратор' && !allowedSet[product]) continue;
    var liniya = rows[i][3];
    var smena  = rows[i][4] || '';
    // Скорректировано (кол.6), если задано — иначе исходный План_кол (кол.5)
    var plan = (rows[i][6] !== '' && rows[i][6] !== null && rows[i][6] !== undefined)
      ? Number(rows[i][6]) : Number(rows[i][5]);
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push({product:product, liniya:liniya, smena:smena, plan:plan||0});
  }

  // Для каждой даты подтягиваем факт (принятые отгрузки на Склад ГП по линии)
  var days = [];
  Object.keys(byDate).sort().reverse().forEach(function(date) {
    var entries = byDate[date];
    var linesInDay = {};
    entries.forEach(function(e){ linesInDay[e.liniya] = true; });

    var factMaps = {};
    Object.keys(linesInDay).forEach(function(lin) {
      factMaps[lin] = getAcceptedShipmentsToGP(prodSS, lin, date);
    });

    var items = entries.map(function(e) {
      var fact = (factMaps[e.liniya] && factMaps[e.liniya][e.product]) || 0;
      var pct = e.plan > 0 ? Math.round((fact/e.plan)*1000)/10 : 0;
      return {product:e.product, liniya:e.liniya, smena:e.smena, plan:e.plan, fact:fact, pct:pct};
    });

    var totalPlan = items.reduce(function(s,it){return s+it.plan;}, 0);
    var totalFact = items.reduce(function(s,it){return s+it.fact;}, 0);
    var totalPct  = totalPlan > 0 ? Math.round((totalFact/totalPlan)*1000)/10 : 0;

    days.push({date:date, items:items, totalPlan:totalPlan, totalFact:totalFact, totalPct:totalPct});
  });

  return {ok:true, days:days};
}

// ─── Список уникальных продуктов по классу из таблицы заказов ─
// Используется для фильтрации Приоритетов и Скорости по цеху
function getProductsByClass(user) {
  try {
    var ordersSS = SpreadsheetApp.openById(ORDERS_SS_ID);
    var sh = ordersSS.getSheetByName('Архив заказа');
    var rows = sh.getDataRange().getValues();
    var allowedClasses = getAllowedClasses(user);
    var seen = {}, products = [];
    for (var i = 1; i < rows.length; i++) {
      var klass = (rows[i][5] || '').toString().trim();
      var product = (rows[i][6] || '').toString().trim();
      if (!product) continue;
      if (allowedClasses.indexOf(klass) === -1) continue;
      if (!seen[product]) { seen[product] = true; products.push(product); }
    }
    return products.sort();
  } catch(e) {
    return [];
  }
}

function zpGetPriorities(user) {
  requireRole(user, ['Зав.производством', 'Зав.производством Булочки', 'Администратор']);
  var ss = ensureZavProdSheets();
  var sh = ss.getSheetByName('Приоритеты_продуктов');
  var rows = sh.getDataRange().getValues();

  // Фильтруем продукты по классу цеха
  var allowedProducts = getProductsByClass(user);
  var allowedSet = {};
  allowedProducts.forEach(function(p){ allowedSet[p] = true; });

  var list = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    // Администратор видит всё, остальные только свой класс
    if (user.role !== 'Администратор' && !allowedSet[rows[i][0]]) continue;
    list.push({
      product: rows[i][0],
      main: rows[i][1] || '',
      alt1: rows[i][2] || '',
      alt2: rows[i][3] || ''
    });
  }

  // Добавляем продукты из заказов у которых ещё нет приоритетов
  var existingProducts = {};
  list.forEach(function(l){ existingProducts[l.product] = true; });
  allowedProducts.forEach(function(p) {
    if (!existingProducts[p]) {
      list.push({product: p, main: '', alt1: '', alt2: ''});
    }
  });

  return {ok: true, priorities: list};
}

function zpSavePriority(user, payload) {
  requireRole(user, ['Зав.производством', 'Зав.производством Булочки', 'Администратор']);
  var ss = ensureZavProdSheets();
  var sh = ss.getSheetByName('Приоритеты_продуктов');
  var rows = sh.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === payload.product) {
      sh.getRange(i+1, 2, 1, 3).setValues([[payload.main||'', payload.alt1||'', payload.alt2||'']]);
      return {ok: true};
    }
  }
  sh.appendRow([payload.product, payload.main||'', payload.alt1||'', payload.alt2||'']);
  return {ok: true};
}

// ============================================================
// СКОРОСТЬ ЛИНИЙ (на основе истории эффективности смен)
// ============================================================

// ─── Средняя скорость линии (шт/час) по последним закрытым сменам ──
// ─── Скорость конкретного товара на конкретной линии (шт/час) ─────
// Источник — таблица "Скорость_линий_по_товару", вводится вручную
// Зав.производством (диаметр/время цикла разные у разных товаров).
function getProductSpeedOnLine(ss, product, liniya) {
  var sh = ss.getSheetByName('Скорость_линий_по_товару');
  if (!sh) return 0;
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === product && rows[i][1] === liniya) {
      return Number(rows[i][2]) || 0;
    }
  }
  return 0;
}

// ─── Получить всю матрицу скоростей (товар × линия) для UI ────────
function zpGetSpeedMatrix(user) {
  requireRole(user, ['Зав.производством', 'Зав.производством Булочки', 'Администратор']);
  var ss = ensureZavProdSheets();
  var sh = ss.getSheetByName('Скорость_линий_по_товару');
  var rows = sh.getDataRange().getValues();

  // Получаем разрешённые продукты и линии для этого цеха
  var allowedProducts = getProductsByClass(user);
  var allowedSet = {};
  allowedProducts.forEach(function(p){ allowedSet[p] = true; });

  var linesRes = adminGetLines(user); // уже фильтрует линии по цеху
  var allowedLines = {};
  (linesRes.lines || []).forEach(function(l){ allowedLines[l.name] = true; });

  // { product -> { liniya -> speed } }
  var matrix = {};
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var product = rows[i][0], liniya = rows[i][1];
    // Администратор видит всё
    if (user.role !== 'Администратор') {
      if (!allowedSet[product]) continue;
      if (liniya && !allowedLines[liniya]) continue;
    }
    if (!matrix[product]) matrix[product] = {};
    matrix[product][liniya] = Number(rows[i][2]) || 0;
  }

  // Список продуктов — только своего класса
  var products = user.role === 'Администратор'
    ? (getProducts(user).products || []).map(function(p){return p.name;})
    : allowedProducts;

  return {ok: true, matrix: matrix, products: products};
}

// ─── Сохранить скорость товара на линии ───────────────────────
function zpSaveProductSpeed(user, payload) {
  requireRole(user, ['Зав.производством', 'Зав.производством Булочки', 'Администратор']);
  var ss = ensureZavProdSheets();
  var sh = ss.getSheetByName('Скорость_линий_по_товару');
  var rows = sh.getDataRange().getValues();
  var speed = Number(payload.speed) || 0;

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === payload.product && rows[i][1] === payload.liniya) {
      if (speed <= 0) { sh.deleteRow(i+1); return {ok: true}; }
      sh.getRange(i+1, 3).setValue(speed);
      return {ok: true};
    }
  }
  if (speed > 0) {
    sh.appendRow([payload.product, payload.liniya, speed]);
  }
  return {ok: true};
}

// ─── Часы работы линии/смены на дату (без учёта скорости) ─────
function getScheduleHours(ss, liniya, smena, dateStr) {
  var sh = ss.getSheetByName('График_работы');
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === liniya && rows[i][2] === smena &&
        normalizeDateCell(rows[i][3]) === dateStr) {
      return Number(rows[i][4]) || 0;
    }
  }
  return 0;
}

// ============================================================
// ЗАКАЗЫ ОТ ДИЛЕРОВ — ЧТЕНИЕ И РАСПРЕДЕЛЕНИЕ
// ============================================================

// ─── Получить активные (невыполненные) заказы из внешней таблицы ──
// ─── Читает лист «Логистика» из таблицы заказов и строит карту:
// client -> {days: [0-6 bool], rule: 'Два дня перед'|'Один день перед', deadline: 'До 17:00'}
function getLogisticsMap() {
  try {
    var ss = SpreadsheetApp.openById(ORDERS_SS_ID);
    var sh = ss.getSheetByName('Логистика');
    if (!sh) return {};
    var rows = sh.getDataRange().getValues();
    // Заголовки строка 1: Клиенты | Пн | Вт | Ср | Чт | Пт | Сб | Вс | Правила заказа | Дедлайн
    var map = {};
    for (var i = 1; i < rows.length; i++) {
      var client = rows[i][0];
      if (!client) continue;
      // Пн=1, Вт=2, Ср=3, Чт=4, Пт=5, Сб=6, Вс=0 (JS getDay())
      var dayMap = {1: rows[i][1], 2: rows[i][2], 3: rows[i][3], 4: rows[i][4], 5: rows[i][5], 6: rows[i][6], 0: rows[i][7]};
      var rule = rows[i][8] || 'Два дня перед';
      var deadlineStr = rows[i][9] || 'До 17:00';
      // Извлечь час дедлайна из строки вида "До 17:00"
      var deadlineHour = 17;
      var dm = deadlineStr.match(/(\d{1,2}):/);
      if (dm) deadlineHour = parseInt(dm[1]);
      map[client] = {dayMap: dayMap, rule: rule, deadlineHour: deadlineHour};
    }
    return map;
  } catch(e) {
    return {};
  }
}

// ─── Вычислить ближайшую дату отгрузки для клиента начиная с даты заказа ──
// Учитывает правило «Два дня перед» / «Один день перед» и время дедлайна.
// daysBefore = 2 или 1 (из rule).
// Возвращает строку DD.MM.YYYY — ближайший день отгрузки клиента,
// до которого ещё не истёк дедлайн на момент orderDate+orderHour.
function calcShipDate(orderDateStr, orderHour, logisticsEntry) {
  if (!logisticsEntry) return orderDateStr;
  var rule = logisticsEntry.rule || 'Два дня перед';
  var daysBefore = rule.indexOf('Один') !== -1 ? 1 : 2;
  var deadlineHour = logisticsEntry.deadlineHour || 17;
  var dayMap = logisticsEntry.dayMap || {};

  // Стартуем с даты заказа и ищем следующий день отгрузки клиента
  // Заказ принят в orderHour, дедлайн в deadlineHour
  // Если час заказа >= deadlineHour — дедлайн уже закрыт, начинаем со следующего дня
  var p = orderDateStr.split('.');
  var orderDate = new Date(parseInt(p[2]), parseInt(p[1])-1, parseInt(p[0]), orderHour || 12, 0);

  // Ищем до 14 дней вперёд
  for (var d = 0; d < 14; d++) {
    var candidate = new Date(orderDate);
    candidate.setDate(candidate.getDate() + d);
    var shipDay = candidate.getDay(); // 0=Вс, 1=Пн,...
    if (!dayMap[shipDay]) continue; // клиент не отгружает в этот день

    // Дата дедлайна = candidate - daysBefore дней в deadlineHour
    var deadlineDate = new Date(candidate);
    deadlineDate.setDate(deadlineDate.getDate() - daysBefore);
    deadlineDate.setHours(deadlineHour, 0, 0, 0);

    if (orderDate <= deadlineDate) {
      // Дедлайн ещё не истёк — эта дата отгрузки валидна
      var dd = ('0' + candidate.getDate()).slice(-2);
      var mm = ('0' + (candidate.getMonth()+1)).slice(-2);
      var yyyy = candidate.getFullYear();
      return dd + '.' + mm + '.' + yyyy;
    }
  }
  // Fallback: вернуть дату из заказа
  return orderDateStr;
}

function getActiveOrders(user) {
  var ordersSS = SpreadsheetApp.openById(ORDERS_SS_ID);
  var sh = ordersSS.getSheetByName('Архив заказа');
  var rows = sh.getDataRange().getValues();
  // Заголовки: №(0), ID заказа(1), Дата заказа(2), Дата отправки(3), Клиент(4),
  //            Класс(5), Товар(6), Кол-во(7), Объём ед(8), Объём итого(9),
  //            Цена за шт(10), Сумма(11), Статус(12), Логин(13), Время(14)

  var allowedClasses = getAllowedClasses(user);
  var logMap = getLogisticsMap();
  var now = new Date();
  var orders = [];

  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][6]) continue; // нет товара
    var status = rows[i][12];
    if (status === 'Отправлен') continue; // уже выполнен

    // ── Фильтр по классу продукта ──
    var klass = (rows[i][5] || '').toString().trim();
    if (allowedClasses.indexOf(klass) === -1) continue;

    var client = rows[i][4];
    var orderDateRaw = rows[i][2];
    var shipDateRaw = rows[i][3];

    var orderDateStr = orderDateRaw instanceof Date ? formatDateOnly(orderDateRaw) : (orderDateRaw ? orderDateRaw.toString() : formatDateOnly(now));
    var orderHour = 12;
    var timeVal = rows[i][14];
    if (timeVal) {
      var tm = timeVal.toString().match(/(\d{1,2}):/);
      if (tm) orderHour = parseInt(tm[1]);
    }

    var logEntry = logMap[client];
    var computedShipDate;
    if (logEntry) {
      computedShipDate = calcShipDate(orderDateStr, orderHour, logEntry);
    } else {
      computedShipDate = shipDateRaw instanceof Date ? formatDateOnly(shipDateRaw) : (shipDateRaw ? shipDateRaw.toString() : '');
    }

    orders.push({
      orderId: rows[i][1],
      client: client,
      product: rows[i][6],
      qty: Number(rows[i][7]) || 0,
      klass: klass,
      status: status || '',
      shipDate: computedShipDate,
      rule: logEntry ? logEntry.rule : '',
      deadline: logEntry ? logEntry.deadlineHour + ':00' : ''
    });
  }
  return orders;
}

// ─── Сгруппировать заказы по товару, сохраняя самую раннюю дату отгрузки ──
// Возвращает массив [{product, qty, earliestShipDate}], отсортированный
// по earliestShipDate (ближайшие сроки — первыми).
function groupOrdersByProductWithDeadline(orders) {
  var grouped = {};
  orders.forEach(function(o) {
    if (!grouped[o.product]) {
      grouped[o.product] = {product: o.product, qty: 0, earliestShipDate: o.shipDate};
    }
    grouped[o.product].qty += o.qty;
    if (o.shipDate && (!grouped[o.product].earliestShipDate ||
        compareDates(o.shipDate, grouped[o.product].earliestShipDate) < 0)) {
      grouped[o.product].earliestShipDate = o.shipDate;
    }
  });

  var list = Object.keys(grouped).map(function(k) { return grouped[k]; });
  list.sort(function(a, b) {
    if (!a.earliestShipDate) return 1;
    if (!b.earliestShipDate) return -1;
    return compareDates(a.earliestShipDate, b.earliestShipDate);
  });
  return list;
}

// ─── Добавить N дней к дате dd.MM.yyyy ─────────────────────────
function addDaysToDate(dateStr, n) {
  var p = dateStr.split('.');
  var d = new Date(p[2], p[1]-1, p[0]);
  d.setDate(d.getDate() + n);
  return formatDateOnly(d);
}

// ─── Построить многодневное расписание распределения заказов ──────
// Алгоритм:
// 1. Берём все активные заказы, группируем по товару с самой ранней датой отгрузки
// 2. Сортируем товары по срочности (ближайший срок — первый)
// 3. Горизонт планирования: от завтра до самой дальней даты отгрузки
// 4. Для каждого товара (в порядке срочности) находим линию-кандидата по приоритету,
//    размещаем начиная с ближайшей доступной смены (от завтра), используя остаток
//    мощности; если не хватает — переносим остаток на следующую смену той же линии,
//    либо пробуем следующую линию-кандидата.
function zpBuildDistribution(user, payload) {
  requireRole(user, ['Зав.производством', 'Зав.производством Булочки', 'Администратор']);
  try {
  var ss = ensureZavProdSheets();

  var orders;
  try {
    orders = getActiveOrders(user);
  } catch(e) {
    return {ok: false, error: 'Нет доступа к таблице заказов: ' + e.message};
  }

  if (!orders.length) {
    // Нет заказов — возвращаем продукты с нормами и остатками ГП,
    // чтобы Зав.производством мог сформировать план вручную
    var gpStock = getGPStock(user);
    var batchSizes = getBatchSizes(ss);
    return {ok: true, items: [], unassigned: [], horizon: [], capacityByLine: {},
            noOrders: true, gpStock: gpStock, batchSizes: batchSizes,
            kpi: {planCompletionPct:0, totalPlanned:0, totalDemand:0, totalUnassigned:0, horizonDays:0, skuCount:0}};
  }

  var grouped = groupOrdersByProductWithDeadline(orders);

  var prioritiesRes = zpGetPriorities(user);
  var priorities = {};
  prioritiesRes.priorities.forEach(function(p) { priorities[p.product] = p; });

  var linesRes = adminGetLines(user);
  var lines = (linesRes.lines || []).filter(function(l){return l.active;});

  // Горизонт планирования: от СЕГОДНЯ (если ещё остались доступные смены)
  // до самой дальней даты отгрузки среди заказов
  var startDay = formatDateOnly(new Date());
  var farthest = startDay;
  grouped.forEach(function(g) {
    if (g.earliestShipDate && compareDates(g.earliestShipDate, farthest) > 0) {
      farthest = g.earliestShipDate;
    }
  });
  var horizonDays = [];
  var cursor = startDay;
  var guard = 0;
  while (compareDates(cursor, farthest) <= 0 && guard < 60) {
    horizonDays.push(cursor);
    cursor = addDaysToDate(cursor, 1);
    guard++;
  }

  // Строим сетку доступных ЧАСОВ работы (не штук — теперь мощность считается
  // в часах, т.к. скорость зависит от конкретного товара): {liniya|smena|date -> {totalHours, usedHours}}
  var slotCapacity = {};
  lines.forEach(function(l) {
    horizonDays.forEach(function(dateStr) {
      ['День', 'Ночь'].forEach(function(smena) {
        var hours = getScheduleHours(ss, l.name, smena, dateStr);
        var key = l.name + '|' + smena + '|' + dateStr;
        slotCapacity[key] = {totalHours: hours, usedHours: 0, liniya: l.name, smena: smena, date: dateStr};
      });
    });
  });

  var items = []; // {product, qty, hours, liniya, smena, date, overloaded}
  var unassigned = [];

  grouped.forEach(function(g) {
    var prio = priorities[g.product];
    var candidates = [];
    if (prio) {
      if (prio.main) candidates.push(prio.main);
      if (prio.alt1) candidates.push(prio.alt1);
      if (prio.alt2) candidates.push(prio.alt2);
    }

    if (!candidates.length) {
      unassigned.push({product: g.product, qty: g.qty, reason: 'нет приоритета'});
      return;
    }

    // Проверяем что хотя бы для одной линии-кандидата задана скорость товара
    var hasAnySpeed = candidates.some(function(ln) { return getProductSpeedOnLine(ss, g.product, ln) > 0; });
    if (!hasAnySpeed) {
      unassigned.push({product: g.product, qty: g.qty, reason: 'нет скорости на линии'});
      return;
    }

    var remainingQty = g.qty;

    // ─── Алгоритм распределения ────────────────────────────────────────
    // Для каждого дня горизонта перебираем смены (Ночь→День),
    // внутри каждой смены — линии по приоритету (основная → alt1 → alt2).
    // Остаток, не вместившийся на основную линию, переходит на alt1,
    // затем на alt2. Если одной даты не хватает — переходим к следующему дню.
    // Остаток между сменами одного дня НЕ теряется (используем var, не forEach).
    for (var di = 0; di < horizonDays.length && remainingQty > 0; di++) {
      var dateStr = horizonDays[di];
      var smenaCandidates = ['Ночь', 'День'];
      for (var si = 0; si < smenaCandidates.length && remainingQty > 0; si++) {
        var smena = smenaCandidates[si];
        // Для этой даты+смены проходим линии по приоритету
        for (var ci = 0; ci < candidates.length && remainingQty > 0; ci++) {
          var lineName = candidates[ci];
          var speed = getProductSpeedOnLine(ss, g.product, lineName);
          if (speed <= 0) continue; // товар не производится на этой линии

          var key = lineName + '|' + smena + '|' + dateStr;
          var slot = slotCapacity[key];
          if (!slot || slot.totalHours <= 0) continue; // смена не работает

          var freeHours = slot.totalHours - slot.usedHours;
          if (freeHours <= 0) continue; // смена полностью занята

          var maxQtyInFreeHours = Math.floor(freeHours * speed);
          if (maxQtyInFreeHours <= 0) continue;

          var take = Math.min(maxQtyInFreeHours, remainingQty);
          var hoursNeeded = take / speed;
          slot.usedHours += hoursNeeded;
          remainingQty -= take;

          // Добавляем к уже существующей записи для этого слота, если она есть
          var existingItem = null;
          for (var ei = 0; ei < items.length; ei++) {
            if (items[ei].product === g.product && items[ei].liniya === lineName &&
                items[ei].smena === smena && items[ei].date === dateStr && !items[ei].overloaded) {
              existingItem = items[ei];
              break;
            }
          }
          if (existingItem) {
            existingItem.qty += take;
            existingItem.hours += hoursNeeded;
          } else {
            items.push({
              product: g.product, qty: take, hours: hoursNeeded,
              liniya: lineName, smena: smena, date: dateStr, speed: speed,
              overloaded: false
            });
          }
        }
      }
    }

    // Если после всего горизонта остался излишек — кидаем его на последний день/линию
    // с отметкой "перегрузка", чтобы Зав.производством видел проблему явно.
    if (remainingQty > 0) {
      var fallbackLine = candidates.filter(function(ln){return getProductSpeedOnLine(ss, g.product, ln) > 0;})[0] || candidates[0];
      var fallbackSpeed = getProductSpeedOnLine(ss, g.product, fallbackLine) || 1;
      var fallbackDate = horizonDays.length ? horizonDays[horizonDays.length-1] : startDay;
      items.push({
        product: g.product, qty: remainingQty, hours: remainingQty / fallbackSpeed,
        liniya: fallbackLine, smena: 'День', date: fallbackDate, speed: fallbackSpeed,
        overloaded: true
      });
    }
  });

  // ── Диагностика незагруженных линий ──────────────────────────
  var lineDiag = {};
  lines.forEach(function(l) {
    var lineName = l.name;
    var hasHours = horizonDays.some(function(d) {
      return ['Ночь','День'].some(function(sm) {
        var slot = slotCapacity[lineName + '|' + sm + '|' + d];
        return slot && slot.totalHours > 0;
      });
    });
    if (!hasHours) return;
    var isUsed = items.some(function(it){ return it.liniya === lineName && !it.overloaded; });
    if (isUsed) return;
    var notInPriority = [], noSpeed = [];
    grouped.forEach(function(g) {
      var prio = priorities[g.product];
      var cands = prio ? [prio.main, prio.alt1, prio.alt2].filter(Boolean) : [];
      var inPrio = cands.indexOf(lineName) !== -1;
      if (!inPrio) { notInPriority.push(g.product); return; }
      var spd = getProductSpeedOnLine(ss, g.product, lineName);
      if (!spd || spd <= 0) noSpeed.push(g.product);
    });
    var reasons = [];
    if (notInPriority.length > 0 && notInPriority.length === grouped.length) {
      reasons.push('ни один товар не назначен на эту линию');
    } else if (notInPriority.length > 0) {
      reasons.push('не в приоритетах: ' + notInPriority.slice(0,3).join(', ') + (notInPriority.length>3?' (+' + (notInPriority.length-3) + ')':''));
    }
    if (noSpeed.length > 0) {
      reasons.push('нет скорости: ' + noSpeed.slice(0,3).join(', ') + (noSpeed.length>3?' (+' + (noSpeed.length-3) + ')':''));
    }
    if (!reasons.length) reasons.push('все заказы распределены по другим линиям');
    lineDiag[lineName] = reasons;
  });

  // ── KPI: проверка дедлайнов — для каждого товара смотрим самую позднюю дату
  // среди его items и сравниваем с earliestShipDate заказа ──
  var deadlineIssues = [];
  grouped.forEach(function(g) {
    if (!g.earliestShipDate) return;
    var productItems = items.filter(function(it){return it.product===g.product;});
    if (!productItems.length) return;
    var latestPlanDate = productItems.reduce(function(max, it) {
      return compareDates(it.date, max) > 0 ? it.date : max;
    }, productItems[0].date);
    if (compareDates(latestPlanDate, g.earliestShipDate) > 0) {
      deadlineIssues.push({
        product: g.product, shipDate: g.earliestShipDate, planDate: latestPlanDate
      });
    }
  });

  // ── KPI: общие показатели ──
  var totalDemand = grouped.reduce(function(s,g){return s+g.qty;}, 0);
  var totalPlanned = items.reduce(function(s,it){return s+it.qty;}, 0);
  var totalUnassigned = unassigned.reduce(function(s,u){return s+u.qty;}, 0);
  var totalHoursUsed = 0, totalHoursAvail = 0;
  Object.keys(slotCapacity).forEach(function(k) {
    var slot = slotCapacity[k];
    if (slot.totalHours > 0) {
      totalHoursAvail += slot.totalHours;
      totalHoursUsed  += Math.min(slot.usedHours, slot.totalHours);
    }
  });
  var planCompletionPct = totalDemand > 0 ? Math.round((totalPlanned - getOverloadedQty(items)) / totalDemand * 100) : 0;

  // ── SKU-отчёт: по каждому товару — заказано, остаток ГП, распределено ──
  var gpStockMap = getGPStock(user);
  var skuReport = grouped.map(function(g) {
    var planned = items.filter(function(it){ return it.product === g.product && !it.overloaded; })
                       .reduce(function(s, it){ return s + it.qty; }, 0);
    var overloaded = items.filter(function(it){ return it.product === g.product && it.overloaded; })
                          .reduce(function(s, it){ return s + it.qty; }, 0);
    var stock = gpStockMap[g.product] || 0;
    var need = Math.max(0, g.qty - stock); // сколько реально нужно произвести
    return {
      product: g.product,
      ordered: g.qty,           // заказано клиентами
      gpStock: stock,           // остаток на Складе ГП
      needToProduce: need,      // нужно произвести = заказано - остаток
      planned: planned,         // распределено по сменам (без перегрузки)
      overloaded: overloaded,   // распределено с превышением мощности
      shipDate: g.earliestShipDate,
      shortfall: Math.max(0, need - planned) // нехватка производственных мощностей
    };
  });

  return {
    ok: true,
    items: items,
    unassigned: unassigned,
    horizon: horizonDays,
    capacityByLine: slotCapacity,
    deadlineIssues: deadlineIssues,
    skuReport: skuReport,
    gpStock: gpStockMap,
    batchSizes: getBatchSizes(ss),
    lineDiag: lineDiag,
    kpi: {
      totalDemand: totalDemand,
      totalPlanned: totalPlanned,
      totalUnassigned: totalUnassigned,
      planCompletionPct: Math.max(0, Math.min(100, planCompletionPct)),
      skuCount: grouped.length,
      horizonDays: horizonDays.length,
      totalHoursUsed: Math.round(totalHoursUsed * 10) / 10,
      totalHoursAvail: Math.round(totalHoursAvail * 10) / 10
    }
  };
  } catch(e) {
    return {ok: false, error: 'Ошибка расчёта распределения: ' + e.message};
  }
}

// ─── Вспомогательные: остатки Склада ГП и размеры партий из норм ──
function getGPStock(user) {
  var wsss = ensureWarehouseSheets();
  var shBal = wsss.getSheetByName('Остатки_складов');
  var rows = shBal.getDataRange().getValues();
  var stock = {};
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0] || rows[i][0] !== WH_FINISHED_GOODS) continue;
    stock[rows[i][1]] = (stock[rows[i][1]] || 0) + (Number(rows[i][2]) || 0);
  }
  return stock;
}

function getBatchSizes(ss) {
  var sh = ss.getSheetByName('Нормы_расходов');
  if (!sh) return {};
  var rows = sh.getDataRange().getValues();
  var batches = {};
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0] || !rows[i][4]) continue;
    batches[rows[i][0]] = Number(rows[i][4]) || 0;
  }
  return batches;
}

function getOverloadedQty(items) {
  return items.filter(function(it){return it.overloaded;}).reduce(function(s,it){return s+it.qty;}, 0);
}

// ─── Утвердить распределение (сохранить в лист, видно бригадиру) ──
// ─── Построить распределение по ручному плану (без заказов из системы) ──
// payload = {items: [{product, qty}]}
// Работает так же как zpBuildDistribution, но вместо getActiveOrders() использует
// items из payload как «спрос». Остатки Склада ГП уже учтены клиентом при вводе.
function zpBuildDistributionManual(user, payload) {
  requireRole(user, ['Зав.производством', 'Зав.производством Булочки', 'Администратор']);
  try {
  var ss = ensureZavProdSheets();

  var items = (payload && payload.items) || [];
  if (!items.length) return {ok: false, error: 'Укажите хотя бы один продукт'};

  // Формируем «заказы» в том же формате, что и getActiveOrders
  var fakeDate = addDaysToDate(formatDateOnly(new Date()), 7);
  var grouped = items.filter(function(it){ return it.qty > 0; }).map(function(it) {
    return {product: it.product, qty: it.qty, earliestShipDate: fakeDate};
  });

  if (!grouped.length) return {ok: false, error: 'Нет позиций с количеством > 0'};

  // Дальше — та же логика что в zpBuildDistribution, начиная с priorities
  var prioritiesRes = zpGetPriorities(user);
  var priorities = {};
  prioritiesRes.priorities.forEach(function(p) { priorities[p.product] = p; });

  var linesRes = adminGetLines(user);
  var lines = (linesRes.lines || []).filter(function(l){return l.active;});

  var today = formatDateOnly(new Date());
  var maxDate = addDaysToDate(today, 30);
  var horizonDays = [];
  var d = addDaysToDate(today, 0);
  while (compareDates(d, maxDate) <= 0 && horizonDays.length < 30) {
    horizonDays.push(d);
    d = addDaysToDate(d, 1);
  }

  // Строим capacityByLine и slotCapacity по той же логике
  var slotCapacity = {};
  lines.forEach(function(line) {
    ['Утренняя', 'Вечерняя'].forEach(function(smena) {
      horizonDays.forEach(function(day) {
        var hours = getScheduleHours(ss, line.name, smena, day);
        if (hours <= 0) return;
        var key = line.name + '|' + smena + '|' + day;
        slotCapacity[key] = {liniya: line.name, smena: smena, date: day, totalHours: hours, usedHours: 0};
      });
    });
  });

  var planItems = [];
  var unassigned = [];
  var totalDemand = 0, totalPlanned = 0;

  grouped.forEach(function(demand) {
    var product = demand.product;
    var remaining = demand.qty;
    totalDemand += remaining;

    var pr = priorities[product];
    var linePriority = pr ? [pr.main, pr.alt1, pr.alt2].filter(Boolean) : lines.map(function(l){return l.name;});

    // Алгоритм: дни → смены (Ночь→День) → линии по приоритету
    for (var di = 0; di < horizonDays.length && remaining > 0; di++) {
      var dateStr = horizonDays[di];
      var smenaCandidates = ['Ночь', 'День'];
      for (var si = 0; si < smenaCandidates.length && remaining > 0; si++) {
        var smena = smenaCandidates[si];
        for (var li = 0; li < linePriority.length && remaining > 0; li++) {
          var lineName = linePriority[li];
          var speed = getProductSpeedOnLine(ss, product, lineName);
          if (!speed || speed <= 0) continue;
          var key = lineName + '|' + smena + '|' + dateStr;
          var slot = slotCapacity[key];
          if (!slot || slot.totalHours <= 0) continue;
          var availHours = slot.totalHours - slot.usedHours;
          if (availHours <= 0) continue;
          var canProduce = Math.floor(availHours * speed);
          if (canProduce <= 0) continue;
          var qty = Math.min(canProduce, remaining);
          slot.usedHours += qty / speed;
          remaining -= qty;
          totalPlanned += qty;
          var found = false;
          for (var pi = 0; pi < planItems.length; pi++) {
            if (planItems[pi].product===product && planItems[pi].liniya===lineName && planItems[pi].smena===smena && planItems[pi].date===dateStr && !planItems[pi].overloaded) {
              planItems[pi].qty += qty; found = true; break;
            }
          }
          if (!found) planItems.push({product:product, qty:qty, liniya:lineName, smena:smena, date:dateStr, deadline:demand.earliestShipDate, overloaded:false});
        }
      }
    }
    if (remaining > 0) unassigned.push({product:product, qty:remaining, deadline:demand.earliestShipDate});
  });

  var planCompletionPct = totalDemand > 0 ? Math.round(totalPlanned / totalDemand * 100) : 0;
  var gpStockMap2 = getGPStock(user);
  var skuReport2 = grouped.map(function(g) {
    var planned = planItems.filter(function(it){ return it.product===g.product; }).reduce(function(s,it){return s+it.qty;},0);
    var stock = gpStockMap2[g.product] || 0;
    return {product:g.product, ordered:g.qty, gpStock:stock, needToProduce:Math.max(0,g.qty-stock), planned:planned, overloaded:0, shipDate:g.earliestShipDate, shortfall:Math.max(0,Math.max(0,g.qty-stock)-planned)};
  });

  return {
    ok: true,
    items: planItems,
    unassigned: unassigned,
    horizon: horizonDays,
    capacityByLine: slotCapacity,
    skuReport: skuReport2,
    gpStock: gpStockMap2,
    batchSizes: getBatchSizes(ss),
    deadlineIssues: [],
    kpi: {
      totalDemand: totalDemand, totalPlanned: totalPlanned,
      totalUnassigned: unassigned.reduce(function(s,it){return s+it.qty;},0),
      planCompletionPct: Math.max(0, Math.min(100, planCompletionPct)),
      skuCount: grouped.length, horizonDays: horizonDays.length,
      totalHoursUsed: 0, totalHoursAvail: 0
    }
  };
  } catch(e) {
    return {ok: false, error: 'Ошибка расчёта: ' + e.message + (e.stack ? ' | ' + e.stack.split('\n')[1] : '')};
  }
}

// ─── Мобильный дашборд ────────────────────────────────────────
function getDashboardData(user) {
  requireRole(user, ['Бригадир','Механик','Тестодел','Зав.упаковщица',
                     'Зав.производством','Завсклад сырья','Завсклад ГП','Администратор']);
  var ss = getMainDB();
  // Линии
  var linesRes = adminGetLines(user);
  var lines = (linesRes.ok ? linesRes.lines : []).map(function(l){
    return {name:l.name, type:l.type, active:l.active};
  });
  // Пользователи — только статистика
  var usersSh = ss.getSheetByName('Пользователи');
  var totalUsers = 0, activeUsers = 0;
  if (usersSh) {
    var rows = usersSh.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      totalUsers++;
      if (rows[i][5]) activeUsers++; // колонка Активен
    }
  }
  return {ok: true, data: {
    lines: lines,
    stats: {totalUsers: totalUsers, activeUsers: activeUsers}
  }};
}

function getShiftStatus(user, payload) {
  requireRole(user, ['Бригадир','Зав.производством','Администратор']);
  var liniya = (payload && payload.liniya) || user.liniya;
  var smena  = (payload && payload.smena)  || user.smena;
  var today  = formatDateOnly(new Date());
  return {ok: true, shift: {liniya: liniya, smena: smena, date: today}};
}

function zpGetProductSpeed(user, payload) {
  requireRole(user, ['Зав.производством', 'Зав.производством Булочки', 'Администратор']);
  var ss = ensureZavProdSheets();
  var product = payload && payload.product;
  var liniya  = payload && payload.liniya;
  if (!product || !liniya) return {ok: true, speed: 0};
  var speed = getProductSpeedOnLine(ss, product, liniya);
  return {ok: true, speed: speed || 0};
}

function zpApproveDistribution(user, payload) {
  requireRole(user, ['Зав.производством', 'Зав.производством Булочки', 'Администратор']);
  var items = payload.items; // [{product, qty, liniya, smena, date}]

  if (!items || !items.length) return {ok: false, error: 'Нет данных для утверждения'};

  var ss = ensureZavProdSheets();
  var sh = ss.getSheetByName('Распределение_заказов');
  var rows = sh.getDataRange().getValues();

  // Удаляем старые записи на даты, которые присутствуют в новом наборе (переутверждение)
  var datesInPayload = {};
  items.forEach(function(it) { datesInPayload[it.date] = true; });

  for (var i = rows.length - 1; i >= 1; i--) {
    if (datesInPayload[normalizeDateCell(rows[i][1])]) {
      sh.deleteRow(i + 1);
    }
  }

  var now = new Date().toISOString();
  items.forEach(function(item) {
    sh.appendRow([
      Utilities.getUuid(), item.date, item.product, item.liniya, item.smena || 'День',
      item.qty, item.qty, 'Утверждено', user.fio, now
    ]);
  });

  logProdAction(ss, user.fio, 'УТВЕРЖДЕНО РАСПРЕДЕЛЕНИЕ', items.length + ' позиций на ' + Object.keys(datesInPayload).length + ' дн.');

  return {ok: true, count: items.length};
}

// ─── Получить план производства на смену (для Бригадира) ──────
function brigGetProductionPlan(user) {
  requireRole(user, ['Бригадир']);
  var ss = ensureZavProdSheets();
  var sh = ss.getSheetByName('Распределение_заказов');
  var rows = sh.getDataRange().getValues();

  var today = formatDateOnly(new Date());
  var plan = [];
  for (var i = 1; i < rows.length; i++) {
    if (normalizeDateCell(rows[i][1]) !== today) continue;
    if (rows[i][3] !== user.liniya) continue;
    if (rows[i][4] !== user.smena) continue;
    plan.push({
      product: rows[i][2],
      qty: rows[i][6],
      status: rows[i][7]
    });
  }

  return {ok: true, date: today, plan: plan};
}

// ─── ДИАГНОСТИКА: проверить формат данных в Графике_работы ───
function testScheduleData() {
  var ss = ensureZavProdSheets();
  var sh = ss.getSheetByName('График_работы');
  var rows = sh.getDataRange().getValues();
  Logger.log('Всего строк: ' + rows.length);
  for (var i = 1; i < Math.min(rows.length, 15); i++) {
    var cell = rows[i][3];
    var isDate = cell instanceof Date;
    Logger.log('Строка ' + i + ': liniya=' + rows[i][1] + ' smena=' + rows[i][2] +
      ' date=' + cell + ' (isDate=' + isDate + ', typeof=' + typeof cell + ') hours=' + rows[i][4]);
  }

  // Тест: ищем конкретно Линия №1 / День на 17.06.2026
  var today = formatDateOnly(new Date());
  var tomorrow = addDaysToDate(today, 1);
  Logger.log('Сегодня: ' + today + ', завтра: ' + tomorrow);

  var hours = getScheduleHours(ss, 'Линия №1', 'День', tomorrow);
  Logger.log('getScheduleHours("Линия №1","День","' + tomorrow + '") = ' + hours);
}