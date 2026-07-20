// ============================================================
// GOLD LAVASH — HR МОДУЛЬ
// Кадровый учёт: приём, увольнение, личные карточки, стаж,
// штатное расписание, организационная структура
// Google Sheets ID: 1KfdHfOeh9e4HUrUiMeW7PJjmJo_p-mEalYuWJKkgBZk
// ============================================================

var HR_SS_ID = '1KfdHfOeh9e4HUrUiMeW7PJjmJo_p-mEalYuWJKkgBZk';

var HR_SHEET_CURRENT   = '\u041d\u044b\u043d\u0435\u0448\u043d\u0438\u0435 \u0438\u043d\u0444\u043e';
var HR_SHEET_INTAKE    = '\u041f\u0440\u0438\u0435\u043c \u0440\u0430\u0431\u043e\u0442\u044b';
var HR_SHEET_FIRED     = '\u041e\u0442\u0447\u0435\u0442 \u043f\u043e \u0443\u0432\u043e\u043b\u0435\u043d\u043d\u044b\u043c';
var HR_SHEET_STAFFING  = '\u0428\u0442\u0430\u0442\u043d\u043e\u0435 \u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435';
var HR_SHEET_CONFIG    = '\u043a\u043e\u043d\u0444\u0438\u0433\u0440\u0430\u0442\u043e\u0440';

function getHRSS() {
  return SpreadsheetApp.openById(HR_SS_ID);
}

function ensureHRSheets() {
  var ss = getHRSS();
  if (!ss.getSheetByName(HR_SHEET_STAFFING)) {
    var sh = ss.insertSheet(HR_SHEET_STAFFING);
    // Колонки: Подразделение | Должность | Обозначение | Вид_оплаты |
    //          Оклад | Надбавка | Штат_ед | Учёт_категории | Примечание |
    //          Оклад_A | Оклад_B | Оклад_C
    sh.getRange(1,1,1,12).setValues([[
      '\u041f\u043e\u0434\u0440\u0430\u0437\u0434\u0435\u043b\u0435\u043d\u0438\u0435',
      '\u0414\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c',
      '\u041e\u0431\u043e\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435',
      '\u0412\u0438\u0434_\u043e\u043f\u043b\u0430\u0442\u044b',
      '\u041e\u043a\u043b\u0430\u0434',
      '\u041d\u0430\u0434\u0431\u0430\u0432\u043a\u0430',
      '\u0428\u0442\u0430\u0442_\u0435\u0434',
      '\u0423\u0447\u0451\u0442_\u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438',
      '\u041f\u0440\u0438\u043c\u0435\u0447\u0430\u043d\u0438\u0435',
      '\u041e\u043a\u043b\u0430\u0434_A',
      '\u041e\u043a\u043b\u0430\u0434_B',
      '\u041e\u043a\u043b\u0430\u0434_C'
    ]]);
    sh.getRange(1,1,1,12).setFontWeight('bold').setBackground('#1B5E20').setFontColor('#fff');
    sh.setFrozenRows(1);
  } else {
    // Миграция: добавляем недостающие колонки к уже существующему листу
    var sh2 = ss.getSheetByName(HR_SHEET_STAFFING);
    if (sh2.getLastColumn() < 12) {
      sh2.getRange(1,10,1,3).setValues([['\u041e\u043a\u043b\u0430\u0434_A','\u041e\u043a\u043b\u0430\u0434_B','\u041e\u043a\u043b\u0430\u0434_C']]);
      sh2.getRange(1,10,1,3).setFontWeight('bold').setBackground('#1B5E20').setFontColor('#fff');
    }
  }
  return ss;
}

function requireHR(user) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','HR \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
}

function hrFmtDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'dd.MM.yyyy');
  }
  return val.toString();
}

function calcSeniority(hireDate) {
  if (!hireDate) return '';
  try {
    var hire = hireDate instanceof Date ? hireDate : new Date(hireDate);
    var now  = new Date();
    var years  = now.getFullYear() - hire.getFullYear();
    var months = now.getMonth() - hire.getMonth();
    if (months < 0) { years--; months += 12; }
    if (now.getDate() < hire.getDate() && months > 0) months--;
    if (years < 0) return '< 1 мес.';
    return years + ' л. ' + months + ' мес.';
  } catch(e) { return ''; }
}


// ─── Категория по стажу ────────────────────────────────────────
// A = до 3 месяцев, B = 3 мес – 1 год, C = 1 год и выше
function calcCategory(hireDate) {
  if (!hireDate || !(hireDate instanceof Date)) return 'A';
  var months = (new Date() - hireDate) / (1000 * 3600 * 24 * 30.44);
  if (months < 3)  return 'A';
  if (months < 12) return 'B';
  return 'C';
}

// ─── Состояние сотрудника ───────────────────────────────────────
// Принимаем и старые, и новые формулировки — на случай ручных правок в таблице.
var HR_STATE_ACTIVE_VALUES = ['В штате', 'На штате'];
var HR_STATE_LEAVE_VALUES  = ['В отпуске', 'На отпуск'];
var HR_STATE_FIRED_VALUES  = ['Уволен(а)', 'Уволен', 'Уволена'];
var HR_STATE_DEFAULT_ACTIVE = HR_STATE_ACTIVE_VALUES[0]; // 'В штате' — записывается при новом приёме

function hrIsActiveState(state) {
  state = (state || '').toString().trim();
  return HR_STATE_ACTIVE_VALUES.indexOf(state) !== -1 || HR_STATE_LEAVE_VALUES.indexOf(state) !== -1;
}

function hrIsFiredState(state) {
  state = (state || '').toString().trim();
  return HR_STATE_FIRED_VALUES.indexOf(state) !== -1;
}

function hrNextId(ss) {
  var sh = ss.getSheetByName(HR_SHEET_CURRENT);
  var rows = sh.getDataRange().getValues();
  var maxId = 0;
  for (var i = 1; i < rows.length; i++) {
    var id = Number(rows[i][0]);
    if (!isNaN(id) && id > maxId) maxId = id;
  }
  return maxId + 1;
}

// ── Список сотрудников ────────────────────────────────────────
function hrGetEmployees(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','HR \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440','\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c','\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c \u0411\u0443\u043b\u043e\u0447\u043a\u0438']);
  var ss = getHRSS();
  var sh = ss.getSheetByName(HR_SHEET_CURRENT);
  var rows = sh.getDataRange().getValues();
  var filter = payload && payload.filter || 'active';
  var search = payload && payload.search || '';
  var dept   = payload && payload.dept   || '';
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[2]) continue;
    var state = (r[11]||'').toString().trim();
    if (filter === 'active' && !hrIsActiveState(state)) continue;
    if (filter === 'fired'  && !hrIsFiredState(state)) continue;
    if (dept && r[3] !== dept) continue;
    if (search) {
      var q = search.toLowerCase();
      if ((r[2]||'').toLowerCase().indexOf(q) === -1 &&
          (r[3]||'').toLowerCase().indexOf(q) === -1 &&
          (r[4]||'').toLowerCase().indexOf(q) === -1) continue;
    }
    list.push({
      id:r[0], hireDate:hrFmtDate(r[1]), fio:r[2], dept:r[3]||'',
      position:r[4]||'', status:r[5]||'', birthDate:hrFmtDate(r[6]),
      passport:r[7]||'', inps:String(r[8]||''), address:r[9]||'',
      phone:String(r[10]||''), state:state, stateActive:hrIsActiveState(state), fireReason:r[12]||'',
      tgLink:r[13]||'', probation:hrFmtDate(r[14]),
      salary:Number(r[15])||0, bonus:Number(r[16])||0,
      seniority:calcSeniority(r[1]), category:calcCategory(r[1]), rowIdx:i+1
    });
  }
  return {ok:true, employees:list};
}

// ── Личная карточка ───────────────────────────────────────────
function hrGetEmployee(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','HR \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440','\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c','\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c \u0411\u0443\u043b\u043e\u0447\u043a\u0438']);
  var ss = getHRSS();
  var sh = ss.getSheetByName(HR_SHEET_CURRENT);
  var rows = sh.getDataRange().getValues();
  var tid = String(payload.id);
  for (var i=1;i<rows.length;i++) {
    if (String(rows[i][0])!==tid) continue;
    var r=rows[i];
    return {ok:true, employee:{
      id:r[0], hireDate:hrFmtDate(r[1]), fio:r[2], dept:r[3]||'',
      position:r[4]||'', status:r[5]||'', birthDate:hrFmtDate(r[6]),
      passport:r[7]||'', inps:String(r[8]||''), address:r[9]||'',
      phone:String(r[10]||''), state:r[11]||'', stateActive:hrIsActiveState(r[11]), fireReason:r[12]||'',
      tgLink:r[13]||'', probation:hrFmtDate(r[14]),
      salary:Number(r[15])||0, bonus:Number(r[16])||0,
      seniority:calcSeniority(r[1]), category:calcCategory(r[1]), rowIdx:i+1
    }};
  }
  return {ok:false, error:'\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d'};
}

// ── Приём на работу ───────────────────────────────────────────
function hrHireEmployee(user, payload) {
  requireHR(user);
  if (!payload.fio)      return {ok:false,error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0424\u0418\u041e'};
  if (!payload.dept)     return {ok:false,error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043f\u043e\u0434\u0440\u0430\u0437\u0434\u0435\u043b\u0435\u043d\u0438\u0435'};
  if (!payload.position) return {ok:false,error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0434\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c'};
  if (!payload.hireDate) return {ok:false,error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0434\u0430\u0442\u0443 \u043f\u0440\u0438\u0451\u043c\u0430'};
  var ss = ensureHRSheets();
  var sh = ss.getSheetByName(HR_SHEET_CURRENT);
  var id = hrNextId(ss);
  var now = new Date();
  var hireDateParsed = new Date(payload.hireDate);
  var row = [
    id, hireDateParsed, payload.fio, payload.dept, payload.position,
    payload.status||'\u041d\u0435\u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u044b\u0439',
    payload.birthDate ? new Date(payload.birthDate) : '',
    payload.passport||'', payload.inps||'', payload.address||'',
    payload.phone||'', HR_STATE_DEFAULT_ACTIVE, '',
    payload.tgLink||'',
    payload.probation ? new Date(payload.probation) : '',
    Number(payload.salary)||0, Number(payload.bonus)||0
  ];
  sh.appendRow(row);
  // История приёма
  var shI = ss.getSheetByName(HR_SHEET_INTAKE);
  if (shI) {
    shI.appendRow([id, hireDateParsed, payload.fio, payload.dept,
      payload.position, payload.status||'', '', payload.passport||'',
      payload.inps||'', payload.address||'', payload.phone||'',
      HR_STATE_DEFAULT_ACTIVE, '',
      Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm'),
      user.fio]);
  }
  // Запись в общий журнал изменений (используется также при перемещении кадров)
  var shChg = ss.getSheetByName('Изменение Данные');
  if (shChg) {
    shChg.appendRow([id,
      Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm'),
      payload.fio, payload.dept, payload.position, payload.status||'', '', '', '', '', '',
      'Приём на работу', '', user.fio]);
  }
  return {ok:true, id:id, message:payload.fio+' \u043f\u0440\u0438\u043d\u044f\u0442(\u0430) \u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0443'};
}

// ── Обновление данных ─────────────────────────────────────────
function hrUpdateEmployee(user, payload) {
  requireHR(user);
  if (!payload.rowIdx) return {ok:false,error:'\u041d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d\u0430 \u0441\u0442\u0440\u043e\u043a\u0430'};
  var ss = getHRSS();
  var sh = ss.getSheetByName(HR_SHEET_CURRENT);
  var rowIdx = Number(payload.rowIdx);
  var colMap = {fio:3,dept:4,position:5,status:6,birthDate:7,passport:8,
    inps:9,address:10,phone:11,tgLink:14,probation:15,salary:16,bonus:17};
  Object.keys(colMap).forEach(function(field) {
    if (payload[field]===undefined) return;
    var val = payload[field];
    if (field==='birthDate'||field==='probation') val = val ? new Date(val) : '';
    if (field==='salary'||field==='bonus') val = Number(val)||0;
    sh.getRange(rowIdx, colMap[field]).setValue(val);
  });
  return {ok:true, message:'\u0414\u0430\u043d\u043d\u044b\u0435 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u044b'};
}

// ── Увольнение ────────────────────────────────────────────────
function hrFireEmployee(user, payload) {
  requireHR(user);
  if (!payload.rowIdx)   return {ok:false,error:'\u041d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d\u0430 \u0441\u0442\u0440\u043e\u043a\u0430'};
  if (!payload.reason)   return {ok:false,error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043f\u0440\u0438\u0447\u0438\u043d\u0443 \u0443\u0432\u043e\u043b\u044c\u043d\u0435\u043d\u0438\u044f'};
  var ss = getHRSS();
  var sh = ss.getSheetByName(HR_SHEET_CURRENT);
  var rowIdx = Number(payload.rowIdx);
  var row = sh.getRange(rowIdx,1,1,17).getValues()[0];
  sh.getRange(rowIdx,12).setValue('\u0423\u0432\u043e\u043b\u0435\u043d(\u0430)');
  sh.getRange(rowIdx,13).setValue(payload.reason);
  var shF = ss.getSheetByName(HR_SHEET_FIRED);
  if (shF) {
    shF.appendRow([row[0],row[2],row[3],'\u0423\u0432\u043e\u043b\u0435\u043d(\u0430)',
      calcSeniority(row[1]), payload.reason,
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd.MM.yyyy'),
      user.fio]);
  }
  return {ok:true, message:row[2]+' \u0443\u0432\u043e\u043b\u0435\u043d(\u0430)'};
}

// ── Стаж ─────────────────────────────────────────────────────
function hrGetSeniority(user) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','HR \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = getHRSS();
  var sh = ss.getSheetByName(HR_SHEET_CURRENT);
  var rows = sh.getDataRange().getValues();
  var now = new Date();
  var list = [];
  for (var i=1;i<rows.length;i++) {
    var r=rows[i];
    if (!r[2]||!hrIsActiveState(r[11])) continue;
    var senYears = r[1] instanceof Date ? (now-r[1])/(365.25*24*3600*1000) : 0;
    // Категории: A = до 3 мес, B = 3 мес – 1 год, C = 1 год и выше
    var senMonths = senYears * 12;
    var cat = senMonths < 3 ? 'A' : senMonths < 12 ? 'B' : 'C';
    list.push({id:r[0],fio:r[2],dept:r[3]||'',position:r[4]||'',
      hireDate:hrFmtDate(r[1]),seniority:calcSeniority(r[1]),category:cat,
      salary:Number(r[15])||0,bonus:Number(r[16])||0});
  }
  list.sort(function(a,b){return a.hireDate<b.hireDate?-1:1;});
  return {ok:true, seniority:list};
}

// ── Штатное расписание ────────────────────────────────────────
function hrGetStaffing(user) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440','\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442']);
  var ss = ensureHRSheets();
  var sh = ss.getSheetByName(HR_SHEET_STAFFING);
  var rows = sh.getDataRange().getValues();
  var shM = ss.getSheetByName(HR_SHEET_CURRENT);
  var mRows = shM.getDataRange().getValues();

  // Фактическое заполнение по должностям и ФИО сотрудников (+категория для расчёта их реального оклада)
  var actCount={}, actSal={}, actEmps={};
  for (var i=1;i<mRows.length;i++) {
    if (!mRows[i][2]||!hrIsActiveState(mRows[i][11])) continue;
    var k=(mRows[i][3]||'')+'|'+(mRows[i][4]||'');
    actCount[k]=(actCount[k]||0)+1;
    actSal[k]=(actSal[k]||0)+(Number(mRows[i][15])||0)+(Number(mRows[i][16])||0);
    if (!actEmps[k]) actEmps[k]=[];
    actEmps[k].push({
      fio:mRows[i][2],
      salary:(Number(mRows[i][15])||0)+(Number(mRows[i][16])||0),
      category:calcCategory(mRows[i][1])
    });
  }

  var list=[]; var totalFund=0;
  for (var j=1;j<rows.length;j++) {
    if (!rows[j][0]&&!rows[j][1]) continue;
    var dept=rows[j][0]||'',pos=rows[j][1]||'';
    var abbr=rows[j][2]||'';
    var payType=rows[j][3]||'\u041e\u043a\u043b\u0430\u0434';
    var sal=Number(rows[j][4])||0;
    var bonus=Number(rows[j][5])||0;
    var units=Number(rows[j][6])||1;
    var useCat=rows[j][7]===true||rows[j][7]==='TRUE'||rows[j][7]==='\u0434\u0430';
    var note=rows[j][8]||'';
    var salA=Number(rows[j][9])||0;
    var salB=Number(rows[j][10])||0;
    var salC=Number(rows[j][11])||0;
    var k2=dept+'|'+pos;
    var act=actCount[k2]||0;
    var asal=actSal[k2]||0;
    totalFund+=asal;
    // Плановый фонд: если учитываем категорию — берём среднее A/B/C * штат (ориентировочно)
    var planFund = useCat ? Math.round(((salA+salB+salC)/3)) * units : sal*units;
    list.push({
      dept:dept, position:pos, abbr:abbr, payType:payType,
      salary:sal, bonus:bonus, units:units, useCat:useCat, note:note,
      salaryA:salA, salaryB:salB, salaryC:salC,
      actual:act, actualSalary:asal,
      employees:actEmps[k2]||[],
      planFund:planFund, vacancy:Math.max(0,units-act), rowIdx:j+1
    });
  }
  var byDept={};
  list.forEach(function(r){if(!byDept[r.dept])byDept[r.dept]=[];byDept[r.dept].push(r);});
  return {ok:true,staffing:list,byDept:byDept,totalFund:totalFund};
}

// ── Получить оклад по категории для должности (используется при приёме) ──
function hrGetSalaryForPosition(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','HR \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = ensureHRSheets();
  var sh = ss.getSheetByName(HR_SHEET_STAFFING);
  var rows = sh.getDataRange().getValues();
  for (var i=1;i<rows.length;i++) {
    if (rows[i][0]===payload.dept && rows[i][1]===payload.position) {
      var useCat = rows[i][7]===true||rows[i][7]==='TRUE'||rows[i][7]==='\u0434\u0430';
      return {
        ok:true, useCat:useCat,
        salary:Number(rows[i][4])||0,
        salaryA:Number(rows[i][9])||0,
        salaryB:Number(rows[i][10])||0,
        salaryC:Number(rows[i][11])||0
      };
    }
  }
  return {ok:true, useCat:false, salary:0, salaryA:0, salaryB:0, salaryC:0};
}

function hrSaveStaffingRow(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss=ensureHRSheets();
  var sh=ss.getSheetByName(HR_SHEET_STAFFING);
  var row=[
    payload.dept||'', payload.position||'', payload.abbr||'',
    payload.payType||'\u041e\u043a\u043b\u0430\u0434',
    Number(payload.salary)||0, Number(payload.bonus)||0,
    Number(payload.units)||1,
    payload.useCat?'\u0434\u0430':'\u043d\u0435\u0442',
    payload.note||'',
    Number(payload.salaryA)||0,
    Number(payload.salaryB)||0,
    Number(payload.salaryC)||0
  ];
  if (payload.rowIdx) sh.getRange(Number(payload.rowIdx),1,1,12).setValues([row]);
  else sh.appendRow(row);
  return {ok:true};
}

function hrDeleteStaffingRow(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss=ensureHRSheets();
  var sh=ss.getSheetByName(HR_SHEET_STAFFING);
  if (payload.rowIdx) sh.deleteRow(Number(payload.rowIdx));
  return {ok:true};
}

// ── Справочники ───────────────────────────────────────────────
function hrGetConfig(user) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','HR \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440','\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c','\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c \u0411\u0443\u043b\u043e\u0447\u043a\u0438']);
  var ss=getHRSS();
  var sh=ss.getSheetByName(HR_SHEET_CONFIG);
  var rows=sh.getDataRange().getValues();
  var depts=[],positions=[],addresses=[],statuses=[];
  for (var i=1;i<rows.length;i++) {
    if (rows[i][1]) depts.push(rows[i][1]);
    if (rows[i][2]) positions.push(rows[i][2]);
    if (rows[i][3]) addresses.push(rows[i][3]);
    if (rows[i][4]) statuses.push(rows[i][4]);
  }
  return {ok:true,depts:depts,positions:positions,addresses:addresses,statuses:statuses};
}

// ── Org Chart ─────────────────────────────────────────────────
function hrGetOrgChart(user) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','HR \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440','\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c','\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c \u0411\u0443\u043b\u043e\u0447\u043a\u0438']);
  var ss=getHRSS();
  var sh=ss.getSheetByName(HR_SHEET_CURRENT);
  var rows=sh.getDataRange().getValues();
  var depts={};
  for (var i=1;i<rows.length;i++) {
    var r=rows[i];
    if (!r[2]||!hrIsActiveState(r[11])) continue;
    var dept=r[3]||'\u041f\u0440\u043e\u0447\u0435\u0435';
    if (!depts[dept]) depts[dept]=[];
    depts[dept].push({id:r[0],fio:r[2],position:r[4]||'',status:r[5]||'',
      phone:String(r[10]||''),seniority:calcSeniority(r[1])});
  }
  return {ok:true,departments:depts};
}

// ── Статистика ────────────────────────────────────────────────
function hrGetStats(user) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','HR \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440','\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c','\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c \u0411\u0443\u043b\u043e\u0447\u043a\u0438','\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442']);
  var ss=getHRSS();
  var sh=ss.getSheetByName(HR_SHEET_CURRENT);
  var rows=sh.getDataRange().getValues();
  var total=0,active=0,fired=0,official=0,unofficial=0,newThisMonth=0;
  var byDept={};
  var now=new Date();
  var senTotal=0,senCount=0;
  var totalFund=0;
  for (var i=1;i<rows.length;i++) {
    var r=rows[i];
    if (!r[2]) continue;
    total++;
    var state=(r[11]||'').toString();
    if (hrIsActiveState(state)) {
      active++;
      var st=(r[5]||'').toLowerCase();
      if (st.indexOf('\u043d\u0435\u043e\u0444')!==-1) unofficial++;
      else official++;
      var dept=r[3]||'\u041f\u0440\u043e\u0447\u0435\u0435';
      byDept[dept]=(byDept[dept]||0)+1;
      if (r[1] instanceof Date &&
          r[1].getMonth()===now.getMonth()&&r[1].getFullYear()===now.getFullYear()) newThisMonth++;
      if (r[1] instanceof Date){senTotal+=(now-r[1])/(365.25*24*3600*1000);senCount++;}
      totalFund+=(Number(r[15])||0)+(Number(r[16])||0);
    } else fired++;
  }
  return {ok:true,total:total,active:active,fired:fired,
    official:official,unofficial:unofficial,
    newThisMonth:newThisMonth,
    avgSeniority:senCount>0?(senTotal/senCount).toFixed(1):0,
    totalFund:totalFund,byDept:byDept};
}

// ══════════════════════════════════════════════════════════════
// ПЕРЕМЕЩЕНИЕ КАДРОВ
// Лист "Перемещения": ID | Дата | Сотрудник_ID | ФИО | Тип
//   | Старый_отдел | Старая_должность | Новый_отдел | Новая_должность
//   | Причина | Кто_подписал
// ══════════════════════════════════════════════════════════════

var HR_SHEET_MOVES = '\u041f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u044f';

function ensureMovesSheet(ss) {
  if (!ss.getSheetByName(HR_SHEET_MOVES)) {
    var sh = ss.insertSheet(HR_SHEET_MOVES);
    sh.getRange(1,1,1,11).setValues([[
      '\u2116','\u0414\u0430\u0442\u0430','\u0421\u043e\u0442\u0440.\u0418\u0414','\u0424\u0418\u041e','\u0422\u0438\u043f',
      '\u0421\u0442\u0430\u0440\u044b\u0439 \u043e\u0442\u0434\u0435\u043b','\u0421\u0442\u0430\u0440\u0430\u044f \u0434\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c',
      '\u041d\u043e\u0432\u044b\u0439 \u043e\u0442\u0434\u0435\u043b','\u041d\u043e\u0432\u0430\u044f \u0434\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c',
      '\u041f\u0440\u0438\u0447\u0438\u043d\u0430','\u041f\u043e\u0434\u043f\u0438\u0441\u0430\u043b'
    ]]);
    sh.getRange(1,1,1,11).setFontWeight('bold').setBackground('#1A237E').setFontColor('#fff');
    sh.setFrozenRows(1);
  }
  return ss;
}

// ── Список перемещений ────────────────────────────────────────
function hrGetMoves(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','HR \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = getHRSS();
  ensureMovesSheet(ss);
  var sh = ss.getSheetByName(HR_SHEET_MOVES);
  var rows = sh.getDataRange().getValues();
  var empId = payload && payload.empId ? String(payload.empId) : '';
  var list = [];
  for (var i = rows.length-1; i >= 1; i--) {
    if (!rows[i][0]) continue;
    if (empId && String(rows[i][2]) !== empId) continue;
    list.push({
      num:      rows[i][0],
      date:     hrFmtDate(rows[i][1]),
      empId:    rows[i][2],
      fio:      rows[i][3],
      type:     rows[i][4],
      oldDept:  rows[i][5],
      oldPos:   rows[i][6],
      newDept:  rows[i][7],
      newPos:   rows[i][8],
      reason:   rows[i][9],
      signedBy: rows[i][10]
    });
    if (list.length >= 100) break;
  }
  return {ok:true, moves:list};
}

// ── Создать перемещение ───────────────────────────────────────
function hrCreateMove(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','HR \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  if (!payload.empId)  return {ok:false,error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0430'};
  if (!payload.newDept && !payload.newPos) return {ok:false,error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043d\u043e\u0432\u044b\u0439 \u043e\u0442\u0434\u0435\u043b \u0438\u043b\u0438 \u0434\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c'};

  var ss = getHRSS();
  ensureMovesSheet(ss);

  // Найти сотрудника
  var shM = ss.getSheetByName(HR_SHEET_CURRENT);
  var mRows = shM.getDataRange().getValues();
  var empRow = null, empRowIdx = -1;
  for (var i=1; i<mRows.length; i++) {
    if (String(mRows[i][0]) === String(payload.empId)) {
      empRow = mRows[i]; empRowIdx = i+1; break;
    }
  }
  if (!empRow) return {ok:false, error:'\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d'};

  var oldDept = empRow[3]||'', oldPos = empRow[4]||'';
  var newDept = payload.newDept || oldDept;
  var newPos  = payload.newPos  || oldPos;
  var moveDate = payload.date ? new Date(payload.date) : new Date();

  // Определяем тип перемещения
  var moveType = '';
  if (newDept !== oldDept && newPos !== oldPos) moveType = '\u041f\u0435\u0440\u0435\u0432\u043e\u0434';
  else if (newDept !== oldDept) moveType = '\u041f\u0435\u0440\u0435\u0432\u043e\u0434 \u043c\u0435\u0436\u0434\u0443 \u043e\u0442\u0434\u0435\u043b\u0430\u043c\u0438';
  else moveType = '\u041f\u043e\u0432\u044b\u0448\u0435\u043d\u0438\u0435/\u043f\u043e\u043d\u0438\u0436\u0435\u043d\u0438\u0435';

  // Записать в лист Перемещения
  var shMoves = ss.getSheetByName(HR_SHEET_MOVES);
  var moveRows = shMoves.getDataRange().getValues();
  var nextNum = moveRows.length; // включая заголовок
  shMoves.appendRow([
    nextNum, moveDate, payload.empId, empRow[2], moveType,
    oldDept, oldPos, newDept, newPos,
    payload.reason||'', user.fio
  ]);

  // Обновить данные сотрудника в основном реестре
  if (newDept !== oldDept) shM.getRange(empRowIdx, 4).setValue(newDept);
  if (newPos  !== oldPos)  shM.getRange(empRowIdx, 5).setValue(newPos);

  // Записать в "Изменение Данные"
  var shChg = ss.getSheetByName('\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435 \u0414\u0430\u043d\u043d\u044b\u0435');
  if (shChg) {
    shChg.appendRow([payload.empId,
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm'),
      empRow[2], newDept, newPos, empRow[5], '', '', '', '', '',
      moveType + ': ' + oldDept+'/'+oldPos+' → '+newDept+'/'+newPos, '', user.fio]);
  }

  return {ok:true, message:empRow[2]+': '+moveType+' \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043e'};
}

// ══════════════════════════════════════════════════════════════
// ОТПУСК / БОЛЬНИЧНЫЙ — простой журнал записей
// ══════════════════════════════════════════════════════════════

var HR_SHEET_LEAVES = '\u041e\u0442\u043f\u0443\u0441\u043a\u0430_\u0411\u043e\u043b\u044c\u043d\u0438\u0447\u043d\u044b\u0435';

function ensureLeavesSheet(ss) {
  if (!ss.getSheetByName(HR_SHEET_LEAVES)) {
    var sh = ss.insertSheet(HR_SHEET_LEAVES);
    sh.getRange(1,1,1,8).setValues([[
      'ID','\u0421\u043e\u0442\u0440_\u0418\u0414','\u0424\u0418\u041e','\u0422\u0438\u043f',
      '\u0414\u0430\u0442\u0430_\u043d\u0430\u0447\u0430\u043b\u0430','\u0414\u0430\u0442\u0430_\u043e\u043a\u043e\u043d\u0447\u0430\u043d\u0438\u044f',
      '\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439','\u0410\u0432\u0442\u043e\u0440'
    ]]);
    sh.getRange(1,1,1,8).setFontWeight('bold').setBackground('#00695C').setFontColor('#fff');
    sh.setFrozenRows(1);
  }
  return ss;
}

function hrAddLeave(user, payload) {
  requireHR(user);
  if (!payload.empId)     return {ok:false, error:'\u041d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a'};
  if (!payload.dateStart) return {ok:false, error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0434\u0430\u0442\u0443 \u043d\u0430\u0447\u0430\u043b\u0430'};
  if (!payload.dateEnd)   return {ok:false, error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0434\u0430\u0442\u0443 \u043e\u043a\u043e\u043d\u0447\u0430\u043d\u0438\u044f'};

  var ss = getHRSS();
  ensureLeavesSheet(ss);

  // Найти ФИО сотрудника
  var mainSh = ss.getSheetByName(HR_SHEET_CURRENT);
  var mainRows = mainSh.getDataRange().getValues();
  var fio = '';
  for (var i=1;i<mainRows.length;i++) {
    if (String(mainRows[i][0]) === String(payload.empId)) { fio = mainRows[i][2]; break; }
  }
  if (!fio) return {ok:false, error:'\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d'};

  var sh = ss.getSheetByName(HR_SHEET_LEAVES);
  sh.appendRow([
    Utilities.getUuid(), payload.empId, fio, payload.leaveType||'\u041e\u0442\u043f\u0443\u0441\u043a',
    new Date(payload.dateStart), new Date(payload.dateEnd),
    payload.comment||'', user.fio
  ]);
  return {ok:true, message:fio+': \u0437\u0430\u043f\u0438\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430'};
}

function hrGetLeaves(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','HR \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = getHRSS();
  ensureLeavesSheet(ss);
  var sh = ss.getSheetByName(HR_SHEET_LEAVES);
  var rows = sh.getDataRange().getValues();
  var typeFilter = payload && payload.type;
  var list = [];
  for (var i=rows.length-1;i>=1;i--) {
    if (!rows[i][0]) continue;
    if (typeFilter && rows[i][3] !== typeFilter) continue;
    list.push({
      id:rows[i][0], empId:rows[i][1], fio:rows[i][2], type:rows[i][3],
      dateStart:hrFmtDate(rows[i][4]), dateEnd:hrFmtDate(rows[i][5]),
      comment:rows[i][6], author:rows[i][7],
      date:hrFmtDate(rows[i][4]) // для сортировки по дате начала
    });
    if (list.length>=200) break;
  }
  return {ok:true, leaves:list};
}