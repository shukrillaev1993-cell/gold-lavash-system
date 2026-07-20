// ============================================================
// GOLD LAVASH — ЗАРПЛАТА (сдельная оплата производственных линий)
// ============================================================
// ЛОГИКА:
// 1. У каждой производственной линии есть "фонд линии" — сумма окладов
//    (оклад+надбавка) всех сотрудников, чьи HR-отделы привязаны к этой линии.
// 2. Месяц = 26 дней (фиксировано для всех производственных цехов).
//    Дневной фонд = Месячный фонд / 26.
// 3. За каждый день берём:
//      План  — сумма кол-ва из "Распределение_заказов" по этой линии за дату
//      Факт  — сумма кол-ва принятых отгрузок на Склад ГП по этой линии за дату
//               (используется существующая getAcceptedShipmentsToGP)
// 4. Расценка за 1 шт = Дневной фонд / План (шт). Если план = 0 — расценка 0.
// 5. Дневная выплата линии = Расценка × Факт (шт).
// 6. За период (месяц) суммируем дневные выплаты → общая выплата линии.
// 7. Общая выплата линии делится между сотрудниками ПРОПОРЦИОНАЛЬНО их
//    текущему окладу (оклад+надбавка) относительно фонда линии.
// ============================================================

var PAYROLL_MONTH_DAYS = 26;
var HR_SHEET_PAYROLL_MAP = '\u0424\u041e\u0422_\u041b\u0438\u043d\u0438\u0438'; // "ФОТ_Линии"

// ─── Инициализация листа привязки HR-отдел → системная линия ─
function ensurePayrollSheets() {
  var ss = getHRSS();
  if (!ss.getSheetByName(HR_SHEET_PAYROLL_MAP)) {
    var sh = ss.insertSheet(HR_SHEET_PAYROLL_MAP);
    sh.getRange(1,1,1,2).setValues([[
      '\u041e\u0442\u0434\u0435\u043b_HR', '\u041b\u0438\u043d\u0438\u044f_\u0441\u0438\u0441\u0442\u0435\u043c\u0430'
    ]]);
    sh.getRange(1,1,1,2).setFontWeight('bold').setBackground('#B71C1C').setFontColor('#fff');
    sh.setFrozenRows(1);
  }
  return ss;
}

// ══════════════════════════════════════════════════════════════
// НАСТРОЙКА: привязка HR-отделов к системным линиям
// ══════════════════════════════════════════════════════════════

function payrollGetMapping(user) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = ensurePayrollSheets();
  var sh = ss.getSheetByName(HR_SHEET_PAYROLL_MAP);
  var rows = sh.getDataRange().getValues();
  var list = [];
  for (var i=1;i<rows.length;i++) {
    if (!rows[i][0]) continue;
    list.push({dept:rows[i][0], liniya:rows[i][1], rowIdx:i+1});
  }
  return {ok:true, mapping:list};
}

function payrollSaveMapping(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  if (!payload.dept)   return {ok:false, error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043e\u0442\u0434\u0435\u043b HR'};
  if (!payload.liniya) return {ok:false, error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043b\u0438\u043d\u0438\u044e'};
  var ss = ensurePayrollSheets();
  var sh = ss.getSheetByName(HR_SHEET_PAYROLL_MAP);
  var rows = sh.getDataRange().getValues();
  // Не даём привязать один HR-отдел дважды
  for (var i=1;i<rows.length;i++) {
    if (rows[i][0] === payload.dept) {
      sh.getRange(i+1,1,1,2).setValues([[payload.dept, payload.liniya]]);
      return {ok:true};
    }
  }
  sh.appendRow([payload.dept, payload.liniya]);
  return {ok:true};
}

function payrollDeleteMapping(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = ensurePayrollSheets();
  var sh = ss.getSheetByName(HR_SHEET_PAYROLL_MAP);
  if (payload.rowIdx) sh.deleteRow(Number(payload.rowIdx));
  return {ok:true};
}

// ══════════════════════════════════════════════════════════════
// РАСЧЁТ ЗАРПЛАТЫ ЗА ПЕРИОД ДЛЯ ЛИНИИ
// ══════════════════════════════════════════════════════════════

// ─── Получить сумму плана по линии за дату из Распределение_заказов ──
function payrollGetPlanQty(prodSS, liniya, date) {
  var sh = prodSS.getSheetByName('\u0420\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0435_\u0437\u0430\u043a\u0430\u0437\u043e\u0432');
  if (!sh) return 0;
  var rows = sh.getDataRange().getValues();
  var total = 0;
  for (var i=1;i<rows.length;i++) {
    if (!rows[i][0]) continue;
    if (rows[i][3] !== liniya) continue;
    if (normalizeDateCell(rows[i][1]) !== date) continue;
    // Колонка 6 — "Скорректировано" (финальный план), если пусто — берём колонку 5 (исходный)
    var q = (rows[i][6] !== '' && rows[i][6] !== null && rows[i][6] !== undefined) ? Number(rows[i][6]) : Number(rows[i][5]);
    total += (q || 0);
  }
  return total;
}

// ─── Получить сумму факта (отгрузка на Склад ГП) по линии за дату ────
function payrollGetFactQty(prodSS, liniya, date) {
  var shippedMap = getAcceptedShipmentsToGP(prodSS, liniya, date); // {product: qty}
  var total = 0;
  Object.keys(shippedMap).forEach(function(p) { total += Number(shippedMap[p]) || 0; });
  return total;
}

// ─── Список дат между двумя датами (dd.MM.yyyy) включительно ─────────
function payrollDateRange(dateFrom, dateTo) {
  function parse(s) { var p=s.split('.'); return new Date(p[2],p[1]-1,p[0]); }
  var from = parse(dateFrom), to = parse(dateTo);
  var dates = [];
  var cur = new Date(from);
  while (cur <= to) {
    dates.push(formatDateOnly(cur));
    cur.setDate(cur.getDate()+1);
  }
  return dates;
}

// ─── Главный расчёт: план/факт/выплата по линии за период ────────────
function payrollCalculate(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440','\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442']);
  var liniya   = payload.liniya;
  var dateFrom = payload.dateFrom;
  var dateTo   = payload.dateTo;
  if (!liniya)   return {ok:false, error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043b\u0438\u043d\u0438\u044e'};
  if (!dateFrom || !dateTo) return {ok:false, error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043f\u0435\u0440\u0438\u043e\u0434'};

  var hrSS = getHRSS();

  // 1. Находим HR-отделы, привязанные к этой линии
  var mapSh = ensurePayrollSheets().getSheetByName(HR_SHEET_PAYROLL_MAP);
  var mapRows = mapSh.getDataRange().getValues();
  var linkedDepts = {};
  for (var i=1;i<mapRows.length;i++) {
    if (mapRows[i][1] === liniya) linkedDepts[mapRows[i][0]] = true;
  }
  if (!Object.keys(linkedDepts).length) {
    return {ok:false, error:'\u0414\u043b\u044f \u044d\u0442\u043e\u0439 \u043b\u0438\u043d\u0438\u0438 \u043d\u0435 \u043f\u0440\u0438\u0432\u044f\u0437\u0430\u043d \u043d\u0438 \u043e\u0434\u0438\u043d HR-\u043e\u0442\u0434\u0435\u043b. \u041d\u0430\u0441\u0442\u0440\u043e\u0439\u0442\u0435 \u043f\u0440\u0438\u0432\u044f\u0437\u043a\u0443.'};
  }

  // 2. Собираем активных сотрудников этих отделов + их оклад
  var mainSh = hrSS.getSheetByName(HR_SHEET_CURRENT);
  var mainRows = mainSh.getDataRange().getValues();
  var employees = [];
  var totalLineOklad = 0;
  for (var j=1;j<mainRows.length;j++) {
    var r = mainRows[j];
    if (!r[2] || !hrIsActiveState(r[11])) continue;
    if (!linkedDepts[r[3]]) continue;
    var oklad = (Number(r[15])||0) + (Number(r[16])||0);
    totalLineOklad += oklad;
    employees.push({id:r[0], fio:r[2], dept:r[3], position:r[4], oklad:oklad});
  }
  if (!employees.length) {
    return {ok:false, error:'\u041d\u0435\u0442 \u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0445 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u043e\u0432 \u0432 \u043f\u0440\u0438\u0432\u044f\u0437\u0430\u043d\u043d\u044b\u0445 \u043e\u0442\u0434\u0435\u043b\u0430\u0445'};
  }

  var dailyFund = totalLineOklad / PAYROLL_MONTH_DAYS;

  // 3. Проходим по всем дням периода — план/факт/выплата
  var prodSS = ensureProductionDB();
  var dates = payrollDateRange(dateFrom, dateTo);
  var byDay = [];
  var totalPlan = 0, totalFact = 0, totalPay = 0;

  dates.forEach(function(date) {
    var plan = payrollGetPlanQty(prodSS, liniya, date);
    var fact = payrollGetFactQty(prodSS, liniya, date);
    var rate = plan > 0 ? (dailyFund / plan) : 0;
    var pay  = rate * fact;
    totalPlan += plan;
    totalFact += fact;
    totalPay  += pay;
    byDay.push({date:date, plan:plan, fact:fact, rate:Math.round(rate), pay:Math.round(pay)});
  });

  // 4. Распределяем totalPay между сотрудниками пропорционально окладу
  var empResults = employees.map(function(e) {
    var share = totalLineOklad > 0 ? (e.oklad / totalLineOklad) : 0;
    return {
      id:e.id, fio:e.fio, dept:e.dept, position:e.position,
      oklad:e.oklad, sharePct: Math.round(share*1000)/10,
      pay: Math.round(share * totalPay)
    };
  });
  empResults.sort(function(a,b){ return b.pay - a.pay; });

  var avgPercent = totalPlan > 0 ? Math.round((totalFact/totalPlan)*1000)/10 : 0;

  return {
    ok:true,
    liniya:liniya, dateFrom:dateFrom, dateTo:dateTo,
    totalLineOklad:totalLineOklad, dailyFund:Math.round(dailyFund),
    totalPlan:totalPlan, totalFact:totalFact, avgPercent:avgPercent,
    totalPay:Math.round(totalPay),
    employees:empResults, byDay:byDay
  };
}

// ─── Список системных линий (для выпадающего списка настройки) ──────
function payrollGetLines(user) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440','\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442']);
  return adminGetLines(user);
}