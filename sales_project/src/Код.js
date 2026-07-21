/***************************************************************************
 *  СИСТЕМА ОНЛАЙН-ЗАКАЗОВ И ОТПРАВКИ ПРОДУКЦИИ  (хлебозавод)
 *  Файл: Code.gs  (серверная часть)
 *
 *  Возможности:
 *   1) Логин/пароль для каждого пользователя (роли: admin / orderer / shipper)
 *   2) Приём заказов от дилеров / филиалов / торговых сетей  -> "Архив заказа"
 *   3) Отправка товаров по ID заказа (+ внеплановые СКУ)      -> "Архив отправки"
 *   4) Дашборд (заказы и их исполнение) + печать заказа/отправки
 *
 *  Перед первым запуском: запустите функцию  setupSystem()  один раз.
 *  После любого изменения кода: Развернуть -> Управление развёртываниями ->
 *  создать новую ВЕРСИЮ (иначе /exec отдаёт старую сборку).
 ***************************************************************************/

/* ===================== КОНФИГУРАЦИЯ ===================== */

// Имена листов-источников (как в вашем файле "Онлайн заказ").
// Имя графика "График отправки". Поиск листов "нечёткий", так что небольшие
// отличия в названии (старое "График отпраки" и т.п.) не страшны.
var SHEET_PRICE = 'Цена образование';
// Имя графика теперь без опечатки: "График отправки".
// Поиск листов всё равно "нечёткий" (по началу имени "график"), так что
// небольшие отличия в названии не сломают работу.
var SHEET_SCHED = 'Логистика';
var SCHED_ALT   = ['Логистика','График отправки','График отпраки'];

// Листы, которые создаёт само приложение.
var SHEET_USERS  = 'Пользователи';
var SHEET_ORDERS = 'Архив заказа';
var SHEET_SHIP   = 'Архив отправки';
var SHEET_RETURN = 'Архив возврата';

var ORDER_HEADERS = ['№','ID заказа','Дата заказа','Дата отправки','Клиент','Класс','Товар',
                     'Кол-во','Объём ед','Объём итого','Цена за шт','Сумма','Статус','Логин','Время'];
var SHIP_HEADERS  = ['№','ID отправки','ID заказа','Дата отправки','Клиент','Класс','Товар',
                     'Заказано','Отправлено','Цена за шт','Сумма','Логин','Время','Комментарий'];
var USER_HEADERS  = ['Логин','Пароль','Имя','Роль','Клиенты','Активен','Доступ'];
// Журнал изменений (заказы, возвраты, отправки — единый журнал для админа/менеджера).
// «Тип документа» добавлен ПОСЛЕДНЕЙ колонкой (не вставлен в середину), чтобы не
// сдвинуть и не испортить уже накопленные старые записи.
var ORDERLOG_SHEET = 'Журнал заказов';
var ORDERLOG_HEADERS = ['Время','Действие','№ документа','Клиент','Кто','Роль',
  'Позиций было','Позиций стало','Кол-во было','Кол-во стало','Сумма было','Сумма стало','Что изменилось','Тип документа'];
function orderLogSheet_(){
  var sh = getSheetFuzzy(ORDERLOG_SHEET);
  if(!sh){ sh = ss().insertSheet(ORDERLOG_SHEET);
    sh.getRange(1,1,1,ORDERLOG_HEADERS.length).setValues([ORDERLOG_HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1); }
  // Миграция: если лист создан до появления колонки «Тип документа» — дописать её.
  var have = sh.getLastColumn();
  if (have < ORDERLOG_HEADERS.length){
    sh.getRange(1, have+1, 1, ORDERLOG_HEADERS.length-have).setValues([ORDERLOG_HEADERS.slice(have)]).setFontWeight('bold');
  }
  return sh;
}
// Записать строку в журнал. before/after: {pos,qty,sum}. docType: 'Заказ' | 'Возврат' | 'Отправка'.
function logOrderChange_(docType, action, docId, client, user, before, after, changesText){
  try{
    var sh = orderLogSheet_();
    sh.appendRow([ new Date(), action, String(docId), client, user.login, user.role,
      before.pos, after.pos, before.qty, after.qty, before.sum, after.sum, changesText||'', docType ]);
  }catch(e){ /* журнал не должен ломать основную операцию */ }
}
var SHEET_REQUESTS = 'Запросы доступа';
var REQ_HEADERS = ['Время','Логин','Имя','Функция','Статус','Решил'];

// Какие вкладки/функции доступны каждой роли по умолчанию (ключ -> роли).
var ROLE_TABS = {
  receipt:['admin','manager','viewer'],
  bank:['admin','manager'],
  kassa:['admin','manager'],
  order:['admin','orderer','manager'],
  'return':['admin','orderer','manager'],
  add:['admin','manager','orderer'],
  orderlog:['admin','manager'],
  ship:['admin','shipper'],
  rcheck:['admin','shipper','manager'],
  control:['admin','manager','viewer','logist'],
  logi:['admin','manager','viewer','orderer','logist'],
  akt:['orderer'],
  dash:['admin','orderer','manager','shipper','viewer','logist'],
  history:['admin','orderer','manager','shipper','viewer'],
  debtor:['admin','manager','viewer'],
  report:['admin','manager','viewer'],
  abc:['admin','manager','viewer'],
  users:['admin'],
  schededit:['admin','logist'],
  route:['admin','logist','manager'],
  logicost:['admin','logist','manager','viewer'],
  cubeprice:['admin','logist','manager','viewer']
};
// Есть ли у пользователя доступ к функции: роль по умолчанию ИЛИ персональная выдача, минус отзыв.
function can_(user, key){
  var def = ROLE_TABS[key] || [];
  var has = (def.indexOf(user.role) >= 0) || (user.grant && user.grant.indexOf(key) >= 0);
  if (user.revoke && user.revoke.indexOf(key) >= 0) has = false;
  return has;
}
function parseAccess_(s){
  var grant=[], revoke=[];
  String(s||'').split(',').forEach(function(tok){
    tok=tok.trim(); if(!tok) return;
    if(tok.charAt(0)==='-') revoke.push(tok.slice(1).trim());
    else grant.push(tok.replace(/^\+/,'').trim());
  });
  return { grant:grant, revoke:revoke };
}

var RETURN_HEADERS = ['№','ID возврата','Дата','Клиент','Класс','Товар','Кол-во','Причина','Где выявлено','Режим',
                      'Цена возврата','Сумма возврата','Комментарий','Статус','Логин','Проверил','Время'];
var RETURN_REASONS = ['Мағорлаган','Сақлаш муддати ўтган','Нотўғри қадоқланган','Саноғи кам',
                      'Ишлаб чиқариш стандарти бузилган','Ёпишган/Эзилган','Қадоқда қуриб қолган','Қадоқда шикастланган'];
var RETURN_PLACES  = ['Омборда','Логистика жараёнида','мижозда','Савдо тармоғида','HoReCa'];

var START_ORDER_ID = 100111;   // первый ID заказа (как на скриншоте)
var START_SHIP_ID  = 900001;   // первый ID отправки

function TZ_(){ return Session.getScriptTimeZone() || 'Asia/Tashkent'; }

/* ===================== ВЕБ-ТОЧКА ВХОДА ===================== */

function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) || '';
  if (page === 'launch') {
    return HtmlService.createHtmlOutputFromFile('launch')
      .setTitle('GOLD LAVASH · Установка')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
  }
  if (page === 'analytics') {
    return HtmlService.createTemplateFromFile('Analytics').evaluate()
      .setTitle('GOLD LAVASH · Аналитика продаж')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('GOLD LAVASH · Заказы')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ===================== УТИЛИТЫ ===================== */

// Нормализация строк: регистр, неразрывные пробелы, типичные латинские
// двойники кириллицы (защита от "омоглифов"), лишние пробелы.
function norm(s){
  s = String(s == null ? '' : s).toLowerCase().replace(/\u00A0/g,' ');
  var map = {a:'а',e:'е',o:'о',p:'р',c:'с',y:'у',x:'х',k:'к',m:'м',t:'т',h:'н',b:'в'};
  s = s.replace(/[aeopcyxkmthb]/g, function(ch){ return map[ch] || ch; });
  return s.replace(/\s+/g,' ').trim();
}

function ss(){ return SpreadsheetApp.getActiveSpreadsheet(); }

// "Нечёткий" поиск листа по началу нормализованного имени.
function getSheetFuzzy(name){
  var sheets = ss().getSheets();
  var want = norm(name);
  // точное совпадение
  for (var i=0;i<sheets.length;i++){ if (norm(sheets[i].getName()) === want) return sheets[i]; }
  // по началу
  var key = want.slice(0,6);
  for (var j=0;j<sheets.length;j++){ if (norm(sheets[j].getName()).indexOf(key) === 0) return sheets[j]; }
  return null;
}
// Лист логистики/графика (учитываем переименование «График отправки» → «Логистика»).
function schedSheet_(){
  for (var i=0;i<SCHED_ALT.length;i++){ var sh=getSheetFuzzy(SCHED_ALT[i]); if(sh) return sh; }
  throw new Error('Не найден лист логистики ("Логистика" или "График отправки").');
}

function getSheetOrThrow(name){
  var sh = getSheetFuzzy(name);
  if (!sh) throw new Error('Не найден лист: "' + name + '". Проверьте имя листа.');
  return sh;
}

function fmtDate(d){
  if (!d) return '';
  if (!(d instanceof Date)) { var t = new Date(d); if (isNaN(t)) return String(d); d = t; }
  return Utilities.formatDate(d, TZ_(), 'dd.MM.yyyy');
}
function fmtDateTime(d){
  if (!(d instanceof Date)) d = new Date();
  return Utilities.formatDate(d, TZ_(), 'dd.MM.yyyy HH:mm');
}
function toNum(v){ var n = parseFloat(String(v).replace(/\s/g,'').replace(',','.')); return isNaN(n)?0:n; }

// Следующий номер из последовательности (с блокировкой и авто-инициализацией).
function nextSeq(key, start, maxFromSheetFn){
  var lock = LockService.getScriptLock();
  var got=false;
  for(var i=0;i<5 && !got;i++){ got=lock.tryLock(2000); if(!got) Utilities.sleep(250); }
  if(!got) throw new Error('Сейчас идёт другое сохранение. Повторите через несколько секунд.');
  try{
    var p = PropertiesService.getScriptProperties();
    var cur = parseInt(p.getProperty(key),10);
    if (isNaN(cur)){
      var fromSheet = maxFromSheetFn ? maxFromSheetFn() : 0;
      cur = Math.max(start - 1, fromSheet);
    }
    cur += 1;
    p.setProperty(key, String(cur));
    return cur;
  } finally { try{ lock.releaseLock(); }catch(e){} }
}

/* ===================== УСТАНОВКА ===================== */

function setupSystem(){
  var book = ss();

  // Пользователи
  var u = book.getSheetByName(SHEET_USERS);
  if (!u){
    u = book.insertSheet(SHEET_USERS);
    u.getRange(1,1,1,USER_HEADERS.length).setValues([USER_HEADERS]).setFontWeight('bold');
    u.getRange(2,1,6,USER_HEADERS.length).setValues([
      ['admin','admin','Администратор','admin','*','ДА',''],
      ['zakaz','1234','Менеджер заказов','manager','*','ДА',''],
      ['otprav','1234','Кладовщик (отправка)','shipper','*','ДА',''],
      ['horazm','1234','Дилер Хоразм','orderer','Регион Хоразм','ДА',''],
      ['jizzax','1234','Дилер Жиззах','orderer','Регион Жиззах','ДА',''],
      ['otchet','1234','Просмотр отчётов','viewer','*','ДА','']
    ]);
    u.setFrozenRows(1);
    u.autoResizeColumns(1, USER_HEADERS.length);
  } else { ensureUserAccessColumn_(); }
  ensureRequestsSheet_();

  // Архив заказа
  var o = book.getSheetByName(SHEET_ORDERS);
  if (!o){
    o = book.insertSheet(SHEET_ORDERS);
    o.getRange(1,1,1,ORDER_HEADERS.length).setValues([ORDER_HEADERS]).setFontWeight('bold');
    o.setFrozenRows(1);
  }

  // Архив отправки
  var s = book.getSheetByName(SHEET_SHIP);
  if (!s){
    s = book.insertSheet(SHEET_SHIP);
    s.getRange(1,1,1,SHIP_HEADERS.length).setValues([SHIP_HEADERS]).setFontWeight('bold');
    s.setFrozenRows(1);
  }

  // Архив возврата
  ensureReturnSheet_();

  // Проверим источники
  var msg = 'Готово. Созданы листы: Пользователи, Архив заказа, Архив отправки.\n';
  msg += getSheetFuzzy(SHEET_PRICE) ? '✓ Найден "Цена образование"\n' : '✗ НЕ найден "Цена образование"\n';
  msg += getSheetFuzzy(SHEET_SCHED) ? '✓ Найден лист логистики\n'   : '✗ НЕ найден лист логистики ("Логистика")\n';
  msg += '\nЛогины по умолчанию:\n  admin / admin\n  zakaz / 1234\n  otprav / 1234\n  horazm / 1234';
  SpreadsheetApp.getUi().alert(msg);
}

/* ===================== ЧТЕНИЕ СПРАВОЧНИКОВ ===================== */

// Прайс: { products:[{cls,name,cube}], priceCol:{normClient->colIndex} }
// Лист "Цена образование" теперь содержит ДВЕ таблицы одна под другой:
//  верхняя  — цена продажи; нижняя — цена возврата (тот же набор столбцов-клиентов).
// Парсер находит обе таблицы по строкам-заголовкам (B = "Наименование").
var _priceCache = null;
function readPriceSheet_(){
  if (_priceCache) return _priceCache;
  var sh = getSheetOrThrow(SHEET_PRICE);
  var values = sh.getDataRange().getValues();
  var headerRows = [];
  for (var r=0;r<values.length;r++){ if (norm(values[r][1])==='наименование') headerRows.push(r); }
  if (!headerRows.length) headerRows = [0];
  function buildCols(hr){
    var header = values[hr], pc={};
    for (var c=3;c<header.length;c++){ var nm=String(header[c]||'').trim(); if(nm){ var k=norm(nm); if(!(k in pc)) pc[k]=c; } }
    return { header:header, priceCol:pc };
  }
  function readProducts(startRow){
    var out=[];
    for (var r=startRow;r<values.length;r++){
      var b = String(values[r][1]||'').trim();
      if (norm(b)==='наименование') break;   // начался следующий заголовок
      if (!b) break;                          // пустая строка — конец таблицы
      out.push({ cls:String(values[r][0]||'').trim(), name:b, cube:toNum(values[r][2]), _row:r, _raw:values[r] });
    }
    return out;
  }
  var c1 = buildCols(headerRows[0]);
  var sell = { products:readProducts(headerRows[0]+1), priceCol:c1.priceCol, header:c1.header, values:values };
  var ret = null;
  if (headerRows.length >= 2){
    var c2 = buildCols(headerRows[1]);
    ret = { products:readProducts(headerRows[1]+1), priceCol:c2.priceCol, header:c2.header, values:values };
  }
  _priceCache = { sell:sell, ret:ret };
  return _priceCache;
}
function readPrice_(){ return readPriceSheet_().sell; }                       // цены продажи
function readReturnPrice_(){ var p=readPriceSheet_(); return p.ret || p.sell; } // цены возврата (нижняя таблица)

// График: [{name, days:[7 bool Пн..Вс], rule, deadline}]
// Разбор листа "График отправки", где теперь ТРИ таблицы друг под другом:
//  1) График отправки  — дни как чекбоксы (boolean)
//  2) График логистика — дни как НАЗВАНИЯ машин (строки)
//  3) Грузовой машины   — машина | ед.из | объём (кубатура)
// Кэш на время одного выполнения, чтобы не читать лист многократно.
var _schedCache = null;
function readSchedSheet_(){
  if (_schedCache) return _schedCache;
  var sh = schedSheet_();
  var v = sh.getDataRange().getValues();
  var orders = [], logistics = [], trucks = {}, truckList = [], econ = {}, econTrucks = [];
  var inTrucks = false, inEcon = false, econHead = null;
  for (var r=0;r<v.length;r++){
    var a = String(v[r][0]==null?'':v[r][0]).trim();
    if (!a) continue;
    var na = norm(a);
    // ---- таблица «Юнит экономика логистики»: клиент × машина = стоимость рейса ----
    if (na.indexOf('юнит') === 0){ inEcon = true; inTrucks = false; econHead = null; continue; }
    // надёжное определение по строке-заголовку «Клиенти / Автомашины» (если баннер в объединённой ячейке)
    if (!inEcon && na.indexOf('клиент') === 0 && na.indexOf('автомашин') >= 0){
      inEcon = true; inTrucks = false; econHead = [];
      for (var eh=1; eh<v[r].length; eh++){ var t0=String(v[r][eh]==null?'':v[r][eh]).trim(); econHead.push(t0); if(t0) econTrucks.push(t0); }
      continue;
    }
    if (inEcon){
      if (!econHead){  // строка-заголовок: «Клиенти / Автомашины | машина1 | машина2 …»
        econHead = [];
        for (var hc=1;hc<v[r].length;hc++){ var tn=String(v[r][hc]==null?'':v[r][hc]).trim(); econHead.push(tn); if(tn) econTrucks.push(tn); }
        continue;
      }
      var costs = {};
      for (var ec=1;ec<v[r].length;ec++){ var tnm=econHead[ec-1]; if(!tnm) continue;
        var val=parseFloat(String(v[r][ec]).replace(/\s/g,'').replace(',','.'));
        if(!isNaN(val) && val>0) costs[norm(tnm)] = { cost:val, truck:tnm }; }
      econ[na] = { name:a, costs:costs };
      continue;
    }
    // ---- таблица «Грузовой машины»: машина | ед.из | объём ----
    if (na.indexOf('грузов') === 0){ inTrucks = true; continue; }
    if (inTrucks){
      var capC = parseFloat(String(v[r][2]).replace(/\s/g,'').replace(',','.'));
      if (isNaN(capC)){ for (var c2=1;c2<v[r].length;c2++){ var n=parseFloat(String(v[r][c2]).replace(',','.')); if(!isNaN(n)) capC=n; } }
      if (!isNaN(capC) && capC>0){ trucks[na] = capC; truckList.push({ name:a, cap:capC, key:na }); }
      continue;
    }
    if (na.indexOf('график') === 0) continue;      // баннер таблицы
    if (na === 'клиенти' || na === 'клиент') continue; // шапка
    // данные графика/логистики: тип строки определяем по содержимому дней B..H
    var hasBool=false, dayBool=[], dayStr=[];
    for (var d=1;d<=7;d++){
      var cell = v[r][d];
      if (typeof cell === 'boolean'){ hasBool=true; dayBool.push(cell); dayStr.push(''); }
      else { var s=String(cell==null?'':cell).trim(); dayBool.push(s!==''); dayStr.push(s); }
    }
    var rule = String(v[r][8]||'').trim(), deadline = String(v[r][9]||'').trim();
    if (hasBool) orders.push({ name:a, days:dayBool, rule:rule, deadline:deadline });
    else         logistics.push({ name:a, trucks:dayStr, rule:rule, deadline:deadline, _row:r+1 });
  }
  _schedCache = { orders:orders, logistics:logistics, trucks:trucks, truckList:truckList, econ:econ, econTrucks:econTrucks };
  return _schedCache;
}

// График отправки (чекбоксы) — с защитой от дублей клиентов.
function readSchedule_(){
  var data = readSchedSheet_();
  var seen = {}, out = [];
  data.orders.forEach(function(c){ var k=norm(c.name); if(seen[k]) return; seen[k]=1; out.push(c); });
  return out;
}

// Кубатура машины по её названию (с учётом сокращений/опечаток).
function truckCapacity_(trucks, name){
  if (!name) return null;
  var k = norm(name);
  if (trucks[k] != null) return trucks[k];
  for (var t in trucks){ if (t.indexOf(k)===0 || k.indexOf(t)===0) return trucks[t]; }
  return null;
}

// Машина и её кубатура для клиента на дату отправки (с запасными вариантами,
// чтобы лимит кубатуры не пропадал, если на конкретный день машина не проставлена).
function truckForClient_(client, shipDateVal){
  var data = readSchedSheet_();
  var ship = parseDmy_(shipDateVal);
  if (!ship){ var info = shipInfoForClient_(client); ship = info ? parseDmy_(info.shipDate) : null; }
  var idx = -1;
  if (ship){ var jd = ship.getDay(); idx = (jd===0)?6:(jd-1); }   // 0..6 -> Пн..Вс
  // строка клиента в таблице «График логистика» (точное, затем нестрогое совпадение имени)
  var lg = null;
  data.logistics.forEach(function(l){ if (norm(l.name)===norm(client)) lg=l; });
  if (!lg){ data.logistics.forEach(function(l){ if(!lg){ var a=norm(l.name), b=norm(client);
    if (a && b && (a.indexOf(b)===0 || b.indexOf(a)===0)) lg=l; } }); }
  var truck = '';
  if (lg && idx>=0) truck = String(lg.trucks[idx]||'').trim();          // машина на день отправки
  if (!truck && lg){ for (var i=0;i<lg.trucks.length;i++){             // запас: основная машина клиента
      var t=String(lg.trucks[i]||'').trim(); if(t){ truck=t; break; } } }
  var cap = truck ? truckCapacity_(data.trucks, truck) : null;
  if (cap==null){ var keys=Object.keys(data.trucks);                   // запас: единственная машина в справочнике
    if (keys.length===1){ truck = truck || keys[0]; cap = data.trucks[keys[0]]; } }
  return { truck:truck, capacity:cap, shipDate: ship?fmtDate(ship):'' };
}

// Полный справочник цен по клиентам (для разрешённых клиентов).
function buildPriceTable_(allowedNorm){
  var P = readPrice_();
  var sched = readSchedule_();
  var prices = {};        // clientName -> { productName -> price }
  var clientHasPrice = {};
  sched.forEach(function(cl){
    if (allowedNorm && allowedNorm !== '*' && allowedNorm.indexOf(norm(cl.name)) < 0) return;
    var col = P.priceCol[norm(cl.name)];
    var map = {};
    P.products.forEach(function(p){
      map[p.name] = (col != null) ? toNum(p._raw[col]) : 0;
    });
    prices[cl.name] = map;
    clientHasPrice[cl.name] = (col != null);
  });
  return { products:P.products.map(function(p){return {cls:p.cls,name:p.name,cube:p.cube};}),
           prices:prices, clientHasPrice:clientHasPrice };
}

/* ===================== АВТОРИЗАЦИЯ ===================== */

function readUsers_(){
  var sh = getSheetOrThrow(SHEET_USERS);
  var v = sh.getDataRange().getValues();
  var out = [];
  for (var r=1;r<v.length;r++){
    if (!String(v[r][0]||'').trim()) continue;
    var acc = parseAccess_(v[r][6]);
    out.push({
      login: String(v[r][0]).trim(),
      pass:  String(v[r][1]),
      name:  String(v[r][2]||'').trim(),
      role:  String(v[r][3]||'orderer').trim().toLowerCase(),
      clients: String(v[r][4]||'*').trim(),
      active: String(v[r][5]||'ДА').trim().toUpperCase() !== 'НЕТ',
      access: String(v[r][6]||'').trim(),
      grant: acc.grant, revoke: acc.revoke,
      _row: r+1
    });
  }
  return out;
}

// Возвращает список разрешённых клиентов пользователя (имена из графика).
function userClients_(user){
  var sched = readSchedule_().map(function(c){return c.name;});
  if (String(user.clients).trim() === '*') return sched;
  var wanted = String(user.clients).split(',').map(function(x){return norm(x);});
  return sched.filter(function(name){ return wanted.indexOf(norm(name)) >= 0; });
}

// Публичная: вход. Возвращает безопасный объект пользователя (без пароля).
function login(loginName, password){
  var users = readUsers_();
  var u = null;
  for (var i=0;i<users.length;i++){
    if (norm(users[i].login) === norm(loginName)){ u = users[i]; break; }
  }
  if (!u) return { ok:false, msg:'Пользователь не найден' };
  if (!u.active) return { ok:false, msg:'Пользователь отключён' };
  if (String(u.pass) !== String(password)) return { ok:false, msg:'Неверный пароль' };
  return { ok:true, user:{ login:u.login, name:u.name, role:u.role, clients:userClients_(u), grant:u.grant, revoke:u.revoke } };
}

// Серверная проверка прав: находим пользователя заново (клиент не может подделать роль).
function authUser_(loginName){
  var users = readUsers_();
  for (var i=0;i<users.length;i++){
    if (norm(users[i].login) === norm(loginName) && users[i].active){
      var u = users[i];
      return { login:u.login, name:u.name, role:u.role, clients:userClients_(u), grant:u.grant, revoke:u.revoke };
    }
  }
  throw new Error('Сессия недействительна. Войдите снова.');
}
function assertClientAllowed_(user, client){
  if (user.role === 'admin') return;
  if (user.clients.map(norm).indexOf(norm(client)) < 0)
    throw new Error('Нет доступа к клиенту: ' + client);
}

/* ===================== ГРАФИК / ДЕДЛАЙН ===================== */

// Возвращает по клиенту: ближайшую дату отправки, дедлайн заказа, просрочен ли.
function shipInfoForClient_(clientName){
  var sched = readSchedule_();
  var cl = null;
  for (var i=0;i<sched.length;i++){ if (norm(sched[i].name)===norm(clientName)){ cl = sched[i]; break; } }
  if (!cl) return null;
  var lead = /два/i.test(cl.rule) ? 2 : (/один/i.test(cl.rule) ? 1 : 1);
  // дедлайн время
  var hh=17, mm=0; var md = /([0-9]{1,2}):([0-9]{2})/.exec(cl.deadline||'');
  if (md){ hh=parseInt(md[1],10); mm=parseInt(md[2],10); }

  var now = new Date();
  // JS: getDay() Вс=0..Сб=6 ; наши days [Пн..Вс] индексы 0..6
  function isShipDay(dt){ var jd = dt.getDay(); var idx = (jd===0)?6:(jd-1); return cl.days[idx]; }

  // ищем ближайший день отправки в пределах 21 дня, где успеваем по дедлайну
  for (var add=0; add<=21; add++){
    var ship = new Date(now.getFullYear(), now.getMonth(), now.getDate()+add);
    if (!isShipDay(ship)) continue;
    var deadline = new Date(ship.getFullYear(), ship.getMonth(), ship.getDate()-lead, hh, mm, 0);
    if (deadline.getTime() >= now.getTime()){
      return { client:cl.name, shipDate:fmtDate(ship), deadline:fmtDateTime(deadline),
               rule:cl.rule, deadlineText:cl.deadline, overdue:false };
    }
  }
  // если ничего не успеваем — вернём первый день отправки как информацию
  for (var a2=0;a2<=21;a2++){
    var sh2 = new Date(now.getFullYear(), now.getMonth(), now.getDate()+a2);
    if (isShipDay(sh2)) return { client:cl.name, shipDate:fmtDate(sh2),
        deadline:'—', rule:cl.rule, deadlineText:cl.deadline, overdue:true };
  }
  return { client:cl.name, shipDate:'—', deadline:'—', rule:cl.rule, deadlineText:cl.deadline, overdue:true };
}

/* ===================== BOOTSTRAP (данные для интерфейса) ===================== */

function getBootstrap(loginName){
  var user = authUser_(loginName);
  var allowedNorm = (user.role==='admin') ? '*' : user.clients.map(norm);
  var tbl = buildPriceTable_(allowedNorm);
  var sched = readSchedule_();
  // расписание только по разрешённым клиентам
  var clients = sched.filter(function(c){
    return user.role==='admin' || user.clients.map(norm).indexOf(norm(c.name))>=0;
  }).map(function(c){
    var info = shipInfoForClient_(c.name);
    var ti = truckForClient_(c.name, info?info.shipDate:null);
    return { name:c.name, rule:c.rule, deadline:c.deadline,
             hasPrice: tbl.clientHasPrice[c.name]===true,
             nextShip: info?info.shipDate:'—', orderDeadline: info?info.deadline:'—',
             overdue: info?info.overdue:false,
             truck: ti.truck||'', capacity: (ti.capacity!=null?ti.capacity:null) };
  });
  return {
    user: user,
    clients: clients,
    products: tbl.products,
    prices: tbl.prices,
    schedVer: schedVer_(),
    execUrl: ScriptApp.getService().getUrl()
  };
}

/* ===================== ПРИЁМ ЗАКАЗА ===================== */

function maxOrderIdFromSheet_(){
  var sh = getSheetFuzzy(SHEET_ORDERS); if(!sh) return 0;
  var last = sh.getLastRow(); if (last<2) return 0;
  var ids = sh.getRange(2,2,last-1,1).getValues();
  var mx = 0; ids.forEach(function(r){ var n=parseInt(r[0],10); if(!isNaN(n)&&n>mx)mx=n; });
  return mx;
}

// payload: { login, client, shipDate, lines:[{name, qty}] }
// ===================== ШЛЮЗ ПО ДОЛГУ: лимит от недельного оборота =====================
function fmtSum_(n){ return String(Math.round(Number(n)||0)).replace(/\B(?=(\d{3})+(?!\d))/g,' '); }
function asDate_(v){ if(v instanceof Date) return v; var d=parseDmy_(String(v||'')); return d||null; }
function debtLimitWeeks_(){ var k=parseFloat(PropertiesService.getScriptProperties().getProperty('DEBT_LIMIT_WEEKS')); return (k>0)?k:1; }
function setDebtLimitWeeks(k){ PropertiesService.getScriptProperties().setProperty('DEBT_LIMIT_WEEKS', String(k)); return 'OK: лимит = '+k+' нед. оборота'; }
// Ручной лимит из листа «Лимиты долга» (Регион | Лимит) — если задан, перекрывает расчётный.
function debtLimitOverride_(client){
  var sh=getSheetFuzzy('Лимиты долга'); if(!sh) return 0;
  var v=sh.getDataRange().getValues();
  for(var i=1;i<v.length;i++){ if(norm(v[i][0])===norm(client)) return toNum(v[i][1]); }
  return 0;
}
// Карта ручных лимитов (один проход).
function debtLimitMap_(){
  var sh=getSheetFuzzy('Лимиты долга'); var m={}; if(!sh) return m;
  var v=sh.getDataRange().getValues();
  for(var i=1;i<v.length;i++){ var n=norm(v[i][0]); if(!n) continue; var lim=toNum(v[i][1]); if(lim>0) m[n]=lim; }
  return m;
}
// Долг/лимит по всем регионам/филиалам одним проходом (для отчётов).
function debtLimitsAll_(){
  var clients=readSchedule_().map(function(c){return c.name;});
  var saldo=readSaldo_(), ships=readShipments_(), receipts=readReceipts_(), returns=readReturns_();
  var openBy={}, realBy={}, recBy={}, retBy={}, minD={}, maxD={};
  saldo.forEach(function(s){ var k=norm(s.client); openBy[k]=(openBy[k]||0)+(s.debit-s.credit); });
  ships.forEach(function(s){ var k=norm(s.client); realBy[k]=(realBy[k]||0)+s.sum; var d=asDate_(s.shipDate); if(d){ if(!minD[k]||d<minD[k])minD[k]=d; if(!maxD[k]||d>maxD[k])maxD[k]=d; } });
  receipts.forEach(function(r){ var k=norm(r.client); recBy[k]=(recBy[k]||0)+r.sum; });
  returns.forEach(function(rt){ if(rt.status==='Принято'){ var k=norm(rt.client); retBy[k]=(retBy[k]||0)+rt.sum; } });
  var K=debtLimitWeeks_(), man=debtLimitMap_();
  return clients.map(function(name){
    var k=norm(name);
    var debt=(openBy[k]||0)+(realBy[k]||0)-(recBy[k]||0)-(retBy[k]||0);
    var weeks=(minD[k]&&maxD[k])?Math.max(1,(maxD[k]-minD[k])/86400000/7):1;
    var perWeek=(realBy[k]||0)/weeks;
    var limit=(man[k]>0)?man[k]:(perWeek*K);
    var pct=(limit>0)?Math.round(debt/limit*100):0;
    return { client:name, debt:Math.round(debt), limit:Math.round(limit), perWeek:Math.round(perWeek), pct:pct, hasLimit:limit>0 };
  });
}
// Проверка шлюза по долгу. Возвращает {over,blocked,debt,limit,perWeek}. Менеджер/админ не блокируются.
// Снимок долга/лимита по всем клиентам с кэшем (2 мин) — чтобы не читать архивы на каждый вызов.
function debtSnapshot_(){
  var cache=CacheService.getScriptCache();
  var c=cache.get('DEBT_SNAP');
  if(c){ try{ return JSON.parse(c); }catch(e){} }
  var map={};
  debtLimitsAll_().forEach(function(x){ map[norm(x.client)]={debt:x.debt,limit:x.limit,perWeek:x.perWeek}; });
  try{ cache.put('DEBT_SNAP', JSON.stringify(map), 120); }catch(e){}
  return map;
}
function debtGateCheck_(user, client){
  var m=debtSnapshot_()[norm(client)]||{debt:0,limit:0,perWeek:0};
  var over = (m.limit>0) && (m.debt > m.limit);
  var blocked = over && (['admin','manager'].indexOf(user.role) < 0);   // менеджер/админ могут разрешить
  return { over:over, blocked:blocked, debt:Math.round(m.debt), limit:Math.round(m.limit), perWeek:Math.round(m.perWeek) };
}
// Публичная: статус долга/лимита клиента (для показа на экране заказа).
function getDebtStatus(loginName, client){
  var user=authUser_(loginName);
  assertClientAllowed_(user, client);
  var g=debtGateCheck_(user, client);
  return { debt:g.debt, limit:g.limit, perWeek:g.perWeek, over:g.over, blocked:g.blocked, weeks:debtLimitWeeks_() };
}

function submitOrder(payload){
  var user = authUser_(payload.login);
  if (['admin','manager','orderer'].indexOf(user.role) < 0) throw new Error('Недостаточно прав для создания заказа.');
  var client = payload.client;
  if (!client) throw new Error('Не выбран клиент.');
  assertClientAllowed_(user, client);

  // Правило: для роли orderer — один заказ на клиента в течение календарного дня.
  if (user.role === 'orderer'){
    var g = orderBlockedForOrderer_(user, client);
    if (g.blocked) throw new Error(g.message);
  }
  // Шлюз по долгу считаем только для дилера (менеджер/админ не блокируются) — экономим тяжёлые чтения.
  if (user.role === 'orderer'){
    var dg = debtGateCheck_(user, client);
    if (dg.blocked){
      throw new Error('Заказ для «'+client+'» заблокирован по задолженности: долг '+fmtSum_(dg.debt)+
        ' сум превышает лимит '+fmtSum_(dg.limit)+' сум (≈ '+debtLimitWeeks_()+' нед. оборота, '+fmtSum_(dg.perWeek)+
        ' сум/нед). Оформление возможно после оплаты или с разрешения менеджера.');
    }
  }

  var P = readPrice_();
  var prodByName = {};
  P.products.forEach(function(p){ prodByName[norm(p.name)] = p; });
  var col = P.priceCol[norm(client)];

  var lines = (payload.lines||[]).filter(function(l){ return toNum(l.qty) > 0; });
  if (!lines.length) throw new Error('Нет позиций с количеством больше нуля.');

  var orderId = nextSeq('ORDER_SEQ', START_ORDER_ID, maxOrderIdFromSheet_);
  var sh = getSheetOrThrow(SHEET_ORDERS);
  var startNo = Math.max(0, sh.getLastRow()-1);
  var now = new Date();
  var shipDate = payload.shipDate ? payload.shipDate : '';

  var rows = [], totalQty=0, totalVol=0, totalSum=0;
  // Второй заказ за день = новый рейс (логист организует наёмный транспорт)
  var isSecond = readOrders_().some(function(o){ return norm(o.client)===norm(client) && sameDay_(o.orderDate, now); });
  var statusVal = isSecond ? '2-й рейс' : 'Новый';
  lines.forEach(function(l, i){
    var p = prodByName[norm(l.name)];
    if (!p) return;
    var qty = toNum(l.qty);
    var price = (col!=null) ? toNum(p._raw[col]) : 0;
    var volU = p.cube, volT = qty*volU, sum = qty*price;
    totalQty += qty; totalVol += volT; totalSum += sum;
    rows.push([ startNo+i+1, orderId, now, shipDate, client, p.cls, p.name,
                qty, volU, volT, price, sum, statusVal, user.login, now ]);
  });
  if (!rows.length) throw new Error('Позиции не распознаны в прайсе.');

  // Ограничение по кубатуре машины
  var ti_ = truckForClient_(client, shipDate);
  if (ti_.capacity != null && totalVol > ti_.capacity + 1e-6){
    throw new Error('Объём заказа '+(Math.round(totalVol*1000)/1000)+' м³ превышает кубатуру машины «'+
      ti_.truck+'» ('+ti_.capacity+' м³). Превышение '+(Math.round((totalVol-ti_.capacity)*1000)/1000)+
      ' м³. Уменьшите заказ или оформите дополнительный заказ на другой рейс.');
  }

  var lock = acquireLock_();
  try {
    sh.getRange(sh.getLastRow()+1, 1, rows.length, ORDER_HEADERS.length).setValues(rows);
  } finally { lock.releaseLock(); }

  var createChanges = rows.map(function(r){ return r[6]+': '+r[7]; }).join('; ');
  logOrderChange_('Заказ', isSecond?'Создание (2-й рейс)':'Создание', orderId, client, user,
    {pos:0,qty:0,sum:0}, {pos:rows.length,qty:totalQty,sum:totalSum}, createChanges);

  return { ok:true, orderId:orderId, lines:rows.length,
           totalQty:totalQty, totalVol:Math.round(totalVol*1000)/1000, totalSum:totalSum,
           client:client, date:fmtDate(now), shipDate:shipDate, second:isSecond };
}

/* ===================== ОТПРАВКА ПО ЗАКАЗУ ===================== */

// Все строки заказов в виде объектов.
function readOrders_(){
  var sh = getSheetOrThrow(SHEET_ORDERS);
  var last = sh.getLastRow(); if (last<2) return [];
  var v = sh.getRange(2,1,last-1,ORDER_HEADERS.length).getValues();
  return v.map(function(r,i){
    return { row:i+2, no:r[0], id:String(r[1]), orderDate:r[2], shipDate:r[3], client:r[4],
             cls:r[5], name:r[6], qty:toNum(r[7]), cube:toNum(r[8]), volT:toNum(r[9]),
             price:toNum(r[10]), sum:toNum(r[11]), status:String(r[12]||''), login:r[13] };
  });
}
function readShipments_(){
  var sh = getSheetFuzzy(SHEET_SHIP); if(!sh) return [];
  var last = sh.getLastRow(); if (last<2) return [];
  var v = sh.getRange(2,1,last-1,SHIP_HEADERS.length).getValues();
  return v.map(function(r,i){
    return { row:i+2, no:r[0], id:String(r[1]), orderId:String(r[2]), shipDate:r[3], client:r[4],
             cls:r[5], name:r[6], ordered:toNum(r[7]), shipped:toNum(r[8]),
             price:toNum(r[9]), sum:toNum(r[10]), login:r[11], ts:r[12], comment:String(r[13]||'') };
  });
}

// Журнал изменений заказов (для админа/менеджера). Возвращает последние записи.
function getOrderLog(loginName, filter){
  var user = authUser_(loginName);
  if (['admin','manager'].indexOf(user.role) < 0) throw new Error('Журнал доступен менеджеру или администратору.');
  var sh = orderLogSheet_();
  var last = sh.getLastRow(); if (last < 2) return [];
  var v = sh.getRange(2,1,last-1,ORDERLOG_HEADERS.length).getValues();
  var q = norm(String((filter&&filter.q)||''));
  var rows = v.map(function(r){
    return { time:fmtDateTime(r[0]), action:r[1], orderId:String(r[2]), client:r[3], who:r[4], role:r[5],
      posBefore:r[6], posAfter:r[7], qtyBefore:r[8], qtyAfter:r[9], sumBefore:r[10], sumAfter:r[11], changes:r[12],
      docType: String(r[13]||'Заказ') };
  });
  if (q) rows = rows.filter(function(x){
    return norm(x.orderId).indexOf(q)>=0 || norm(x.client).indexOf(q)>=0 || norm(x.who).indexOf(q)>=0;
  });
  return rows.reverse().slice(0, 200);   // новые сверху, максимум 200
}

// Документы пользователя: заказы и отправки по его клиентам (с позициями и суммами).
function getMyDocs(loginName){
  var u = authUser_(loginName);
  var seeAll = (['admin','manager','viewer'].indexOf(u.role) >= 0);
  var allow = {}; (u.clients||[]).forEach(function(c){ allow[norm(c)]=1; });
  function ok(client){ return seeAll || allow[norm(client)]; }

  var ordById={};
  readOrders_().forEach(function(o){
    if(!ok(o.client)) return;
    if(!ordById[o.id]) ordById[o.id]={ id:o.id, date:fmtDate(o.orderDate), shipDate:fmtDate(o.shipDate),
      client:o.client, status:o.status, qty:0, sum:0, lines:[] };
    ordById[o.id].lines.push({ cls:o.cls, name:o.name, qty:o.qty, price:o.price, sum:o.sum });
    ordById[o.id].qty+=o.qty; ordById[o.id].sum+=o.sum; ordById[o.id].status=o.status;
  });
  var orders=Object.keys(ordById).map(function(k){return ordById[k];})
    .sort(function(a,b){return parseInt(b.id)-parseInt(a.id);});

  var shById={};
  readShipments_().forEach(function(s){
    if(!ok(s.client)) return;
    if(!shById[s.id]) shById[s.id]={ id:s.id, orderId:s.orderId, date:fmtDate(s.shipDate),
      client:s.client, qty:0, sum:0, lines:[] };
    shById[s.id].lines.push({ cls:s.cls, name:s.name, ordered:s.ordered, shipped:s.shipped, price:s.price, sum:s.sum });
    shById[s.id].qty+=s.shipped; shById[s.id].sum+=s.sum;
  });
  var ships=Object.keys(shById).map(function(k){return shById[k];})
    .sort(function(a,b){return parseInt(b.id)-parseInt(a.id);});

  var retById={};
  readReturns_().forEach(function(rt){
    if(!ok(rt.client)) return;
    if(!retById[rt.id]) retById[rt.id]={ id:rt.id, date:fmtDate(rt.date), client:rt.client,
      mode:rt.mode, status:rt.status, comment:rt.comment, qty:0, sum:0, lines:[] };
    retById[rt.id].lines.push({ name:rt.name, qty:rt.qty, reason:rt.reason, place:rt.place, price:rt.price, sum:rt.sum });
    retById[rt.id].qty+=rt.qty; retById[rt.id].sum+=rt.sum;
    retById[rt.id].status=rt.status;
  });
  var returns=Object.keys(retById).map(function(k){return retById[k];})
    .sort(function(a,b){return parseInt(b.id)-parseInt(a.id);});

  return { orders:orders, shipments:ships, returns:returns };
}

/* ===================== ИЗМЕНЕНИЕ ЗАКАЗА (дилер до дедлайна / менеджер +24ч) ===================== */
// Полная замена состава заказа новыми количествами. payload:{login,orderId,lines:[{name,qty}]}
function editOrder(payload){
  var user = authUser_(payload.login);
  var role = user.role;
  var orderId = String(payload.orderId||'');
  var existing = readOrders_().filter(function(o){ return String(o.id)===orderId; });
  if (!existing.length) throw new Error('Заказ не найден: ' + orderId);
  var client = existing[0].client;
  assertClientAllowed_(user, client);
  if (existing.some(function(o){ return o.status==='Отправлен'; }))
    throw new Error('Заказ ' + orderId + ' уже отправлен — изменить нельзя.');

  var dl = orderDeadlineInfo_(client, existing[0].shipDate);
  if (role === 'orderer'){
    if (dl.passed) throw new Error('Дедлайн заказа для «'+client+'» прошёл ('+dl.text+'). После дедлайна изменения только через менеджера.');
  } else if (role==='manager' || role==='admin'){
    // менеджер и администратор могут менять заказ в любое время, пока он не отправлен
    // (проверено выше — существующая проверка status==='Отправлен')
  } else {
    throw new Error('Недостаточно прав для изменения заказа.');
  }

  var P = readPrice_();
  var prodByName = {}; P.products.forEach(function(p){ prodByName[norm(p.name)] = p; });
  var col = P.priceCol[norm(client)];
  var lines = (payload.lines||[]).filter(function(l){ return toNum(l.qty) > 0; });
  if (!lines.length) throw new Error('Оставьте хотя бы одну позицию. Для полной отмены заказа обратитесь к менеджеру.');

  // Ограничение по кубатуре машины (новый итог)
  var newVol=0; lines.forEach(function(l){ var p=prodByName[norm(l.name)]; if(p) newVol += toNum(l.qty)*p.cube; });
  var ti_ = truckForClient_(client, existing[0].shipDate);
  if (ti_.capacity != null && newVol > ti_.capacity + 1e-6){
    throw new Error('Объём заказа '+(Math.round(newVol*1000)/1000)+' м³ превышает кубатуру машины «'+
      ti_.truck+'» ('+ti_.capacity+' м³). Уменьшите количество.');
  }

  var orderDate = existing[0].orderDate, shipDate = existing[0].shipDate;
  var origLogin = existing[0].login, status = existing[0].status || 'Новый';

  var sh = getSheetOrThrow(SHEET_ORDERS);
  var lock = acquireLock_();
  try {
    // удалить старые строки этого заказа (снизу вверх)
    var last = sh.getLastRow();
    if (last > 1){
      var ids = sh.getRange(2,2,last-1,1).getValues();   // колонка 2 = «ID заказа»
      var del = [];
      for (var i=0;i<ids.length;i++){ if (String(ids[i][0])===orderId) del.push(i+2); }
      del.sort(function(a,b){ return b-a; }).forEach(function(r){ sh.deleteRow(r); });
    }
    // записать новый состав
    var startNo = Math.max(0, sh.getLastRow()-1);
    var now = new Date();
    var rows=[], tq=0, tv=0, ts=0;
    lines.forEach(function(l,i){
      var p = prodByName[norm(l.name)]; if(!p) return;
      var qty = toNum(l.qty); var price = (col!=null)?toNum(p._raw[col]):0;
      var volU=p.cube, volT=qty*volU, sum=qty*price;
      tq+=qty; tv+=volT; ts+=sum;
      rows.push([ startNo+i+1, orderId, orderDate, shipDate, client, p.cls, p.name,
                  qty, volU, volT, price, sum, status, origLogin, now ]);
    });
    if (rows.length) sh.getRange(sh.getLastRow()+1, 1, rows.length, ORDER_HEADERS.length).setValues(rows);

    // журнал изменений: было → стало по позициям
    var beforeByName={}; existing.forEach(function(o){ beforeByName[o.name]=(beforeByName[o.name]||0)+o.qty; });
    var afterByName={};  rows.forEach(function(r){ afterByName[r[6]]=(afterByName[r[6]]||0)+r[7]; });
    var allNames={}; Object.keys(beforeByName).forEach(function(n){allNames[n]=1;}); Object.keys(afterByName).forEach(function(n){allNames[n]=1;});
    var changes=[];
    Object.keys(allNames).forEach(function(n){
      var a=beforeByName[n]||0, b=afterByName[n]||0;
      if (a!==b) changes.push(n+': '+a+'→'+b);
    });
    var beforePos=Object.keys(beforeByName).length;
    var beforeQty=existing.reduce(function(s,o){return s+o.qty;},0);
    var beforeSum=existing.reduce(function(s,o){return s+o.sum;},0);
    logOrderChange_('Заказ', 'Изменение', orderId, client, user,
      {pos:beforePos,qty:beforeQty,sum:beforeSum}, {pos:rows.length,qty:tq,sum:ts},
      changes.length?changes.join('; '):'без изменений количеств');

    return { ok:true, orderId:orderId, client:client, by:user.login, lines:rows.length,
             totalQty:tq, totalVol:Math.round(tv*1000)/1000, totalSum:ts,
             date:fmtDate(orderDate), shipDate:fmtDate(shipDate) };
  } finally { lock.releaseLock(); }
}

// Неотправленные ID заказов для выбранного клиента.
function getUnshippedOrders(loginName, client){
  var user = authUser_(loginName);
  if (['admin','manager','shipper'].indexOf(user.role) < 0) throw new Error('Отправку выполняет кладовщик, менеджер или администратор.');
  assertClientAllowed_(user, client);

  // последняя дата отправки по каждому заказу (для окна «дополнительная отправка 3 дня»)
  var lastShip={};
  readShipments_().forEach(function(s){
    if(norm(s.client)!==norm(client)) return;
    var t = s.ts ? new Date(s.ts) : (s.shipDate ? new Date(s.shipDate) : null);
    if(!t || isNaN(t)) return;
    var k=String(s.orderId); if(!lastShip[k] || t>lastShip[k]) lastShip[k]=t;
  });
  var now=new Date(), WINDOW=3*86400000;

  var orders = readOrders_().filter(function(o){ return norm(o.client)===norm(client); });
  var byId = {};
  orders.forEach(function(o){
    var shipped = (String(o.status)==='Отправлен');
    if (shipped){
      var t=lastShip[String(o.id)];
      if(!t || (now.getTime()-t.getTime()) > WINDOW) return;   // прошло больше 3 дней — скрываем
    }
    if (!byId[o.id]) byId[o.id] = { orderId:o.id, orderDate:fmtDate(o.orderDate),
        shipDate:fmtDate(o.shipDate), lines:0, qty:0, sum:0, additional:shipped };
    byId[o.id].lines++; byId[o.id].qty += o.qty; byId[o.id].sum += o.sum;
  });
  return Object.keys(byId).map(function(k){return byId[k];})
    .sort(function(a,b){ return parseInt(a.orderId)-parseInt(b.orderId); });
}

// Позиции заказа по ID (для автозаполнения отправки/печати).
function getOrderById(loginName, orderId){
  authUser_(loginName);
  var rows = readOrders_().filter(function(o){ return String(o.id)===String(orderId); });
  if (!rows.length) throw new Error('Заказ не найден: ' + orderId);
  var ti = truckForClient_(rows[0].client, rows[0].shipDate);
  return {
    orderId:String(orderId), client:rows[0].client,
    orderDate:fmtDate(rows[0].orderDate), shipDate:fmtDate(rows[0].shipDate),
    status:rows[0].status, offSchedule: !isShipDayToday_(rows[0].client),
    truck: ti.truck||'', capacity:(ti.capacity!=null?ti.capacity:null),
    lines: rows.map(function(o){ return { cls:o.cls, name:o.name, qty:o.qty, price:o.price, cube:o.cube }; }),
    totalQty: rows.reduce(function(s,o){return s+o.qty;},0),
    totalSum: rows.reduce(function(s,o){return s+o.sum;},0),
    totalVol: Math.round(rows.reduce(function(s,o){return s+o.volT;},0)*1000)/1000
  };
}

function maxShipIdFromSheet_(){
  var sh = getSheetFuzzy(SHEET_SHIP); if(!sh) return 0;
  var last = sh.getLastRow(); if (last<2) return 0;
  var ids = sh.getRange(2,2,last-1,1).getValues();
  var mx=0; ids.forEach(function(r){var n=parseInt(r[0],10); if(!isNaN(n)&&n>mx)mx=n;});
  return mx;
}

// payload: { login, orderId, client, shipDate, lines:[{name,cls,ordered,shipped,price}] }
function submitShipment(payload){
  var user = authUser_(payload.login);
  if (['admin','manager','shipper'].indexOf(user.role) < 0) throw new Error('Недостаточно прав для отправки.');
  var client = payload.client; var orderId = String(payload.orderId||'');
  if (!orderId) throw new Error('Не выбран ID заказа.');
  assertClientAllowed_(user, client);

  // пишем строки, где заказано>0 (в т.ч. недопоставка shipped=0) ИЛИ отправлено>0 (внеплановый СКУ)
  var lines = (payload.lines||[]).filter(function(l){ return toNum(l.ordered)>0 || toNum(l.shipped)>0; });
  if (!lines.length) throw new Error('Нет позиций для отправки.');

  var shipId = nextSeq('SHIP_SEQ', START_SHIP_ID, maxShipIdFromSheet_);
  var sh = getSheetOrThrow(SHEET_SHIP);
  var startNo = Math.max(0, sh.getLastRow()-1);
  var now = new Date();
  var shipDate = payload.shipDate ? payload.shipDate : now;

  var rows = [], totOrd=0, totShip=0, totSum=0, totVol=0;
  var Pc = readPrice_(); var cubeBy = {}; Pc.products.forEach(function(p){ cubeBy[norm(p.name)] = p.cube; });
  lines.forEach(function(l){
    totOrd += toNum(l.ordered); totShip += toNum(l.shipped);
  });
  // Расхождение с заказом ИЛИ отправка не в день графика → обязателен комментарий
  var comment = String(payload.comment||'').trim();
  var mismatch = (totShip !== totOrd);
  var offSchedule = !isShipDayToday_(client);
  if ((mismatch || offSchedule) && !comment){
    var reason = mismatch
      ? ('Отправка не совпадает с заказом (заказано '+totOrd+' шт, отправлено '+totShip+' шт).')
      : ('Сегодня у клиента «'+client+'» нет отправки по графику.');
    throw new Error(reason+' Укажите комментарий кладовщика.');
  }
  totShip=0; totOrd=0;
  lines.forEach(function(l,i){
    var ordered = toNum(l.ordered), shipped = toNum(l.shipped), price = toNum(l.price);
    var sum = shipped*price;
    totOrd+=ordered; totShip+=shipped; totSum+=sum;
    totVol += shipped * (cubeBy[norm(l.name)]||0);
    rows.push([ startNo+i+1, shipId, orderId, shipDate, client, l.cls||'', l.name,
                ordered, shipped, price, sum, user.login, now, comment ]);
  });

  // Ограничение по кубатуре машины
  var ti_ = truckForClient_(client, shipDate);
  if (ti_.capacity != null && totVol > ti_.capacity + 1e-6){
    throw new Error('Отправляемый объём '+(Math.round(totVol*1000)/1000)+' м³ превышает кубатуру машины «'+
      ti_.truck+'» ('+ti_.capacity+' м³). Превышение '+(Math.round((totVol-ti_.capacity)*1000)/1000)+
      ' м³. Уменьшите количество или оформите отправку отдельным рейсом.');
  }

  var lock = acquireLock_();
  try {
    if(String(sh.getRange(1,14,1,1).getValue()||'').trim()==='') sh.getRange(1,14,1,1).setValue('Комментарий');
    sh.getRange(sh.getLastRow()+1,1,rows.length,SHIP_HEADERS.length).setValues(rows);
    // отметить заказ как отправленный
    var oSh = getSheetOrThrow(SHEET_ORDERS);
    var last = oSh.getLastRow();
    if (last>1){
      var idCol = oSh.getRange(2,2,last-1,1).getValues();   // ID заказа
      var stCol = oSh.getRange(2,13,last-1,1).getValues();  // Статус
      var changed=false;
      for (var r=0;r<idCol.length;r++){
        if (String(idCol[r][0])===orderId){ stCol[r][0]='Отправлен'; changed=true; }
      }
      if (changed) oSh.getRange(2,13,last-1,1).setValues(stCol);
    }
  } finally { lock.releaseLock(); }

  logOrderChange_('Отправка', 'Создание', shipId, client, user,
    {pos:0,qty:0,sum:0}, {pos:rows.length,qty:totShip,sum:totSum},
    'по заказу '+orderId+(comment?'; '+comment:''));

  return { ok:true, shipmentId:shipId, orderId:orderId, lines:rows.length,
           totalOrdered:totOrd, totalShipped:totShip, totalSum:totSum,
           mismatch:mismatch, offSchedule:offSchedule, comment:comment,
           client:client, shipDate:fmtDate(shipDate) };
}

// Изменить уже проведённую отправку (кладовщик/менеджер/админ).
// payload: { login, shipmentId, comment, lines:[{name,cls,ordered,shipped,price}] }
function editShipment(payload){
  var user = authUser_(payload.login);
  if (['admin','manager','shipper'].indexOf(user.role) < 0) throw new Error('Недостаточно прав для изменения отправки.');
  var shipId = String(payload.shipmentId||''); if(!shipId) throw new Error('Не указан ID отправки.');
  var all = readShipments_().filter(function(s){ return String(s.id)===shipId; });
  if (!all.length) throw new Error('Отправка не найдена: '+shipId);
  var client = all[0].client, orderId = all[0].orderId, shipDate = all[0].shipDate;
  assertClientAllowed_(user, client);

  var lines = (payload.lines||[]).filter(function(l){ return toNum(l.ordered)>0 || toNum(l.shipped)>0; });
  if (!lines.length) throw new Error('Нет позиций для отправки.');
  var comment = String(payload.comment||'').trim();

  var beforePos = all.length;
  var beforeQty = all.reduce(function(s,r){ return s+r.shipped; },0);
  var beforeSum = all.reduce(function(s,r){ return s+r.sum; },0);

  var sh = getSheetOrThrow(SHEET_SHIP);
  var lock = acquireLock_();
  var rows=[], totOrd=0, totShip=0, totSum=0;
  try{
    var rowsToDel = all.map(function(r){return r.row;}).sort(function(a,b){return b-a;});
    rowsToDel.forEach(function(rw){ sh.deleteRow(rw); });
    var startNo = Math.max(0, sh.getLastRow()-1);
    var now = new Date();
    lines.forEach(function(l,i){
      var ordered=toNum(l.ordered), shipped=toNum(l.shipped), price=toNum(l.price);
      var sum=shipped*price;
      totOrd+=ordered; totShip+=shipped; totSum+=sum;
      rows.push([ startNo+i+1, shipId, orderId, shipDate, client, l.cls||'', l.name,
                  ordered, shipped, price, sum, user.login, now, comment ]);
    });
    sh.getRange(sh.getLastRow()+1,1,rows.length,SHIP_HEADERS.length).setValues(rows);
  } finally { lock.releaseLock(); }

  logOrderChange_('Отправка', 'Изменение', shipId, client, user,
    {pos:beforePos,qty:beforeQty,sum:beforeSum}, {pos:rows.length,qty:totShip,sum:totSum}, comment);

  return { ok:true, shipmentId:shipId, orderId:orderId, lines:rows.length,
           totalOrdered:totOrd, totalShipped:totShip, totalSum:totSum,
           client:client, shipDate:fmtDate(shipDate) };
}

// Является ли сегодня днём отправки клиента по графику.
function isShipDayToday_(client){
  var cl=null; readSchedule_().forEach(function(c){ if(norm(c.name)===norm(client)) cl=c; });
  if(!cl || !cl.days) return true;   // нет данных — не требуем комментарий
  var jd=new Date().getDay(); var idx=(jd===0)?6:(jd-1);
  return !!cl.days[idx];
}

// Отправка по ID (для печати).
function getShipmentById(loginName, shipId){
  authUser_(loginName);
  var rows = readShipments_().filter(function(s){ return String(s.id)===String(shipId); });
  if (!rows.length) throw new Error('Отправка не найдена: ' + shipId);
  return {
    shipmentId:String(shipId), orderId:rows[0].orderId, client:rows[0].client,
    shipDate:fmtDate(rows[0].shipDate),
    lines: rows.map(function(s){ return {cls:s.cls,name:s.name,ordered:s.ordered,shipped:s.shipped,price:s.price,sum:s.sum};}),
    totalOrdered: rows.reduce(function(a,s){return a+s.ordered;},0),
    totalShipped: rows.reduce(function(a,s){return a+s.shipped;},0),
    totalSum: rows.reduce(function(a,s){return a+s.sum;},0)
  };
}

/* ===================== ДАШБОРД / ОТЧЁТЫ ===================== */

function getDashboard(loginName, filter){
  var user = authUser_(loginName);
  filter = filter || {};
  var allowed = (user.role==='admin') ? null : user.clients.map(norm);

  function clientOk(c){ return !allowed || allowed.indexOf(norm(c))>=0; }
  function dateOk(d){
    if (!filter.from && !filter.to) return true;
    var t = (d instanceof Date)? d : new Date(d);
    if (filter.from && t < new Date(filter.from)) return false;
    if (filter.to){ var to=new Date(filter.to); to.setHours(23,59,59); if (t>to) return false; }
    return true;
  }
  // для orderer показываем только его заказы (его login) — "свои заказы"
  function loginOk(l){ return user.role!=='orderer' || norm(l)===norm(user.login); }

  var orders = readOrders_().filter(function(o){ return clientOk(o.client) && dateOk(o.orderDate) && loginOk(o.login); });
  var ships  = readShipments_().filter(function(s){ return clientOk(s.client) && dateOk(s.shipDate); });

  // KPI
  var orderIds = {}; orders.forEach(function(o){orderIds[o.id]=1;});
  var shipIds  = {}; ships.forEach(function(s){shipIds[s.id]=1;});
  var totalOrders = Object.keys(orderIds).length;
  var totalOrderQty = orders.reduce(function(a,o){return a+o.qty;},0);
  var totalOrderSum = orders.reduce(function(a,o){return a+o.sum;},0);
  var totalVol      = Math.round(orders.reduce(function(a,o){return a+o.volT;},0)*1000)/1000;
  var totalShippedQty = ships.reduce(function(a,s){return a+s.shipped;},0);
  var totalShippedSum = ships.reduce(function(a,s){return a+s.sum;},0);
  var shippedOrders = {}; orders.forEach(function(o){ if(o.status==='Отправлен') shippedOrders[o.id]=1; });
  var fulfilled = Object.keys(shippedOrders).length;

  // по клиентам
  var byClient = {};
  orders.forEach(function(o){
    var k=o.client; if(!byClient[k]) byClient[k]={client:k,orderQty:0,orderSum:0,shipQty:0,vol:0};
    byClient[k].orderQty+=o.qty; byClient[k].orderSum+=o.sum; byClient[k].vol+=o.volT;
  });
  ships.forEach(function(s){
    var k=s.client; if(!byClient[k]) byClient[k]={client:k,orderQty:0,orderSum:0,shipQty:0,vol:0};
    byClient[k].shipQty+=s.shipped;
  });
  var clientsArr = Object.keys(byClient).map(function(k){var x=byClient[k];x.vol=Math.round(x.vol*1000)/1000;return x;})
                   .sort(function(a,b){return b.orderSum-a.orderSum;});

  // топ товаров
  var byProd = {};
  orders.forEach(function(o){ if(!byProd[o.name]) byProd[o.name]={name:o.name,qty:0,sum:0}; byProd[o.name].qty+=o.qty; byProd[o.name].sum+=o.sum; });
  var prodArr = Object.keys(byProd).map(function(k){return byProd[k];}).sort(function(a,b){return b.qty-a.qty;}).slice(0,10);

  // последние заказы (по ID) с исполнением
  var ordByIdMap = {};
  orders.forEach(function(o){
    if(!ordByIdMap[o.id]) ordByIdMap[o.id]={orderId:o.id,client:o.client,date:fmtDate(o.orderDate),
        shipDate:fmtDate(o.shipDate),qty:0,sum:0,status:o.status,shipped:0};
    ordByIdMap[o.id].qty+=o.qty; ordByIdMap[o.id].sum+=o.sum;
    if (o.status==='Отправлен') ordByIdMap[o.id].status='Отправлен';
  });
  ships.forEach(function(s){ if(ordByIdMap[s.orderId]) ordByIdMap[s.orderId].shipped+=s.shipped; });
  var recent = Object.keys(ordByIdMap).map(function(k){return ordByIdMap[k];})
               .sort(function(a,b){return parseInt(b.orderId)-parseInt(a.orderId);}).slice(0,50);

  return {
    role:user.role, name:user.name,
    kpi:{ orders:totalOrders, fulfilled:fulfilled,
          fulfillRate: totalOrders? Math.round(fulfilled/totalOrders*100):0,
          orderQty:totalOrderQty, orderSum:totalOrderSum, vol:totalVol,
          shippedQty:totalShippedQty, shippedSum:totalShippedSum },
    byClient: clientsArr, byProduct: prodArr, recent: recent
  };
}

/* ===================== АДМИН: пользователи ===================== */

function adminListUsers(loginName){
  var u = authUser_(loginName);
  if (u.role!=='admin') throw new Error('Доступ только для администратора.');
  return readUsers_().map(function(x){ return {login:x.login,name:x.name,role:x.role,clients:x.clients,active:x.active,access:x.access}; });
}
function ensureUserAccessColumn_(){
  var sh=getSheetOrThrow(SHEET_USERS);
  var hdr=sh.getRange(1,1,1,Math.max(sh.getLastColumn(),USER_HEADERS.length)).getValues()[0];
  var has=false; hdr.forEach(function(c){ if(norm(c)==='доступ') has=true; });
  if(!has) sh.getRange(1,7,1,1).setValue('Доступ');
}
function adminSaveUser(loginName, payload){
  var u = authUser_(loginName);
  if (u.role!=='admin') throw new Error('Доступ только для администратора.');
  ensureUserAccessColumn_();
  var sh = getSheetOrThrow(SHEET_USERS);
  var users = readUsers_();
  var existing = null;
  users.forEach(function(x){ if(norm(x.login)===norm(payload.login)) existing=x; });
  var access = (payload.access!=null) ? String(payload.access) : (existing?existing.access:'');
  var row = [payload.login, payload.pass||'1234', payload.name||'', (payload.role||'orderer'),
            payload.clients||'*', payload.active===false?'НЕТ':'ДА', access];
  if (existing){ sh.getRange(existing._row,1,1,USER_HEADERS.length).setValues([row]); }
  else { sh.getRange(sh.getLastRow()+1,1,1,USER_HEADERS.length).setValues([row]); }
  return { ok:true };
}

/* ===================== КОНСТРУКТОР ДОСТУПА: запросы ===================== */
function ensureRequestsSheet_(){
  var sh=getSheetFuzzy(SHEET_REQUESTS);
  if(!sh){ sh=ss().insertSheet(SHEET_REQUESTS); sh.getRange(1,1,1,REQ_HEADERS.length).setValues([REQ_HEADERS]).setFontWeight('bold'); sh.setFrozenRows(1); }
  return sh;
}
// Пользователь запрашивает доступ к функции.
function requestAccess(loginName, funcKey, comment){
  var user=authUser_(loginName);
  funcKey=String(funcKey||'').trim(); if(!funcKey) throw new Error('Не выбрана функция.');
  if(!ROLE_TABS[funcKey]) throw new Error('Неизвестная функция.');
  if(can_(user,funcKey)) return {ok:true, already:true, msg:'Доступ уже есть.'};
  var sh=ensureRequestsSheet_();
  // нет ли уже ожидающего запроса
  var data=sh.getDataRange().getValues();
  for(var r=1;r<data.length;r++){ if(norm(data[r][1])===norm(user.login) && norm(data[r][3])===norm(funcKey) && String(data[r][4])==='Ожидание') return {ok:true, already:true, msg:'Запрос уже отправлен.'}; }
  sh.appendRow([new Date(), user.login, user.name, funcKey, 'Ожидание', '']);
  return {ok:true, msg:'Запрос отправлен администратору.'};
}
// Админ: список ожидающих запросов.
function getAccessRequests(loginName){
  var u=authUser_(loginName);
  if(u.role!=='admin') throw new Error('Доступ только для администратора.');
  var sh=getSheetFuzzy(SHEET_REQUESTS); if(!sh) return [];
  var v=sh.getDataRange().getValues(); var out=[];
  for(var r=1;r<v.length;r++){
    if(!String(v[r][1]||'').trim()) continue;
    out.push({ row:r+1, time:fmtDateTime(v[r][0] instanceof Date?v[r][0]:new Date()), login:String(v[r][1]),
               name:String(v[r][2]||''), func:String(v[r][3]||''), status:String(v[r][4]||'') });
  }
  return out.filter(function(x){return x.status==='Ожидание';}).reverse();
}
// Выдать функцию пользователю (добавить +key, убрать -key).
function grantAccessTo_(targetLogin, key){
  ensureUserAccessColumn_();
  var sh=getSheetOrThrow(SHEET_USERS);
  var users=readUsers_(); var t=null;
  users.forEach(function(x){ if(norm(x.login)===norm(targetLogin)) t=x; });
  if(!t) throw new Error('Пользователь не найден: '+targetLogin);
  var acc=parseAccess_(t.access);
  acc.revoke=acc.revoke.filter(function(k){return k!==key;});
  if(acc.grant.indexOf(key)<0) acc.grant.push(key);
  var str=acc.grant.map(function(k){return '+'+k;}).concat(acc.revoke.map(function(k){return '-'+k;})).join(',');
  sh.getRange(t._row,7,1,1).setValue(str);
}
// Админ: решение по запросу.
function decideAccessRequest(loginName, rowIndex, approve){
  var u=authUser_(loginName);
  if(u.role!=='admin') throw new Error('Доступ только для администратора.');
  var sh=getSheetFuzzy(SHEET_REQUESTS); if(!sh) throw new Error('Нет запросов.');
  var row=parseInt(rowIndex,10); if(!(row>=2)) throw new Error('Неверный запрос.');
  var rec=sh.getRange(row,1,1,REQ_HEADERS.length).getValues()[0];
  var tgt=String(rec[1]||''), key=String(rec[3]||'');
  if(approve){ grantAccessTo_(tgt, key); sh.getRange(row,5,1,2).setValues([['Выдано', u.login]]); }
  else { sh.getRange(row,5,1,2).setValues([['Отклонено', u.login]]); }
  return { ok:true, status: approve?'Выдано':'Отклонено', login:tgt, func:key };
}

// Память таблицы для админа: лимит Google Таблиц — 10 млн ячеек на весь файл.
function getStorageInfo(loginName){
  var u = authUser_(loginName);
  if (u.role!=='admin') throw new Error('Доступно только администратору.');
  var LIMIT = 10000000;
  var sheets = ss().getSheets();
  var allocated = 0, filled = 0, per = [];
  sheets.forEach(function(sh){
    var rows = sh.getMaxRows(), cols = sh.getMaxColumns();
    var cells = rows * cols;                          // выделенные ячейки сетки — считаются в лимит
    var fill = sh.getLastRow() * sh.getLastColumn();  // фактически заполнено данными
    allocated += cells; filled += fill;
    per.push({ name: sh.getName(), rows: rows, cols: cols, cells: cells, filled: fill });
  });
  per.sort(function(a,b){ return b.cells - a.cells; });
  var free = LIMIT - allocated;
  return {
    limit: LIMIT,
    allocated: allocated,
    filled: filled,
    free: free,
    usedPct: Math.round(allocated / LIMIT * 10000)/100,
    freePct: Math.round((free<0?0:free) / LIMIT * 10000)/100,
    sheets: per
  };
}

/* ===================== ПРАВИЛО «ОДИН ЗАКАЗ В ДЕНЬ» ===================== */

function parseDmy_(s){
  if (s instanceof Date) return s;
  var m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(String(s||'').trim());
  if (!m) return null;
  return new Date(+m[3], +m[2]-1, +m[1]);
}
function sameDay_(a, b){
  a = (a instanceof Date) ? a : parseDmy_(a);
  if (!a) return false;
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
function clientSchedule_(client){
  var sched = readSchedule_();
  for (var i=0;i<sched.length;i++){ if (norm(sched[i].name)===norm(client)) return sched[i]; }
  return null;
}

// Дедлайн заказа по дате отправки заказа и графику клиента.
function orderDeadlineInfo_(client, shipDateVal){
  var cl = clientSchedule_(client);
  var lead = cl ? (/два/i.test(cl.rule)?2:1) : 1;
  var hh=17, mm=0;
  if (cl){ var md=/([0-9]{1,2}):([0-9]{2})/.exec(cl.deadline||''); if (md){ hh=+md[1]; mm=+md[2]; } }
  var ship = parseDmy_(shipDateVal);
  if (!ship){ var info = shipInfoForClient_(client); ship = info ? parseDmy_(info.shipDate) : null; }
  if (!ship) return { passed:false, text:'—', withinGrace:true };
  var deadline = new Date(ship.getFullYear(), ship.getMonth(), ship.getDate()-lead, hh, mm, 0);
  var now = (new Date()).getTime();
  var graceMs = deadline.getTime() + 24*3600*1000;   // менеджеру — ещё 24 часа после дедлайна
  return { passed: now > deadline.getTime(), text: fmtDateTime(deadline),
           shipDate: fmtDate(ship), withinGrace: now <= graceMs,
           graceText: fmtDateTime(new Date(graceMs)) };
}

// Заблокирован ли повторный заказ для дилера сегодня.
// Разрешаем второй заказ (новый рейс), если каждый существующий заказ заполнен ≥85% кубатуры машины.
function orderBlockedForOrderer_(user, client){
  var today = new Date();
  var todays = readOrders_().filter(function(o){ return norm(o.client)===norm(client) && sameDay_(o.orderDate, today); });
  if (!todays.length) return { blocked:false };

  var byId={}; todays.forEach(function(o){ if(!byId[o.id])byId[o.id]=0; byId[o.id]+=o.volT; });
  var ids=Object.keys(byId);
  var cap = truckForClient_(client, '').capacity;

  if (cap == null){   // кубатура не задана — прежнее правило: один заказ в день
    return { blocked:true, orderId:String(ids[0]),
      message:'На сегодня заказ для «'+client+'» уже оформлен (ID '+ids[0]+'). Повторный заказ запрещён. '+
              'Чтобы добавить позиции, обратитесь к менеджеру — он дополнит заказ по ID до дедлайна.' };
  }
  var threshold = cap*0.85;
  var allFull = ids.every(function(id){ return byId[id] >= threshold - 1e-6; });
  if (allFull) return { blocked:false, second:true };   // можно ещё один заказ (новый рейс)

  var lastId = ids[ids.length-1];
  var vol = Math.round(byId[lastId]*1000)/1000;
  var pct = Math.round(byId[lastId]/cap*100);
  return { blocked:true, orderId:String(lastId),
    message:'Заказ «'+client+'» (ID '+lastId+') заполнен на '+pct+'% кубатуры машины ('+vol+' из '+cap+' м³). '+
            'Второй заказ доступен только когда первый заполнен не менее 85%. '+
            'Дозаполните текущий заказ через менеджера («Дополнить»).' };
}

// Публичная проверка для интерфейса (вызывается при выборе клиента в форме заказа).
function orderGuard(loginName, client){
  var user = authUser_(loginName);
  if (user.role !== 'orderer') return { blocked:false };   // admin/manager/shipper не ограничены
  assertClientAllowed_(user, client);
  return orderBlockedForOrderer_(user, client);
}

/* ===================== ДОПОЛНЕНИЕ ЗАКАЗА (manager/admin) ===================== */

// Открытые (не отправленные) заказы клиента + статус дедлайна.
function getOpenOrdersForAdd(loginName, client){
  var user = authUser_(loginName);
  var role = user.role;
  if (['manager','admin','orderer'].indexOf(role) < 0)
    throw new Error('Недостаточно прав для изменения заказа.');
  assertClientAllowed_(user, client);
  var orders = readOrders_().filter(function(o){ return norm(o.client)===norm(client) && o.status!=='Отправлен'; });
  var byId = {};
  orders.forEach(function(o){
    if (!byId[o.id]) byId[o.id] = { orderId:o.id, orderDate:fmtDate(o.orderDate),
        shipDate:fmtDate(o.shipDate), lines:0, qty:0, sum:0, _ship:o.shipDate };
    byId[o.id].lines++; byId[o.id].qty+=o.qty; byId[o.id].sum+=o.sum;
  });
  return Object.keys(byId).map(function(k){
    var x = byId[k]; var dl = orderDeadlineInfo_(client, x._ship);
    // дилеру можно только до дедлайна; менеджеру/админу — в любое время, пока не отправлен
    var expired = (role==='orderer') ? dl.passed : false;
    var grace   = (role!=='orderer') && dl.passed;
    x.deadline = dl.text; x.expired = expired; x.grace = grace;
    x.graceText = dl.graceText || ''; delete x._ship; return x;
  }).sort(function(a,b){ return parseInt(a.orderId)-parseInt(b.orderId); });
}

// Добавить позиции к существующему заказу. payload:{login,orderId,lines:[{name,qty}]}
function addToOrder(payload){
  var user = authUser_(payload.login);
  if (user.role!=='manager' && user.role!=='admin')
    throw new Error('Дополнять заказы может только менеджер по заказам или администратор.');
  var orderId = String(payload.orderId||'');
  var existing = readOrders_().filter(function(o){ return String(o.id)===orderId; });
  if (!existing.length) throw new Error('Заказ не найден: ' + orderId);
  var client = existing[0].client;
  assertClientAllowed_(user, client);
  if (existing.some(function(o){ return o.status==='Отправлен'; }))
    throw new Error('Заказ ' + orderId + ' уже отправлен — дополнить нельзя.');

  // менеджер/админ могут дополнять заказ в любое время, пока он не отправлен (проверено выше)

  var P = readPrice_();
  var prodByName = {}; P.products.forEach(function(p){ prodByName[norm(p.name)] = p; });
  var col = P.priceCol[norm(client)];
  var lines = (payload.lines||[]).filter(function(l){ return toNum(l.qty) > 0; });
  if (!lines.length) throw new Error('Нет позиций для добавления.');

  var sh = getSheetOrThrow(SHEET_ORDERS);
  var startNo = Math.max(0, sh.getLastRow()-1);
  var origLogin = existing[0].login;       // оставляем заказ за дилером
  var orderDate = existing[0].orderDate;
  var shipDate  = existing[0].shipDate;
  var status    = existing[0].status || 'Новый';
  var now = new Date();

  var rows=[], tq=0, tv=0, ts=0;
  lines.forEach(function(l,i){
    var p = prodByName[norm(l.name)]; if (!p) return;
    var qty = toNum(l.qty); var price = (col!=null)?toNum(p._raw[col]):0;
    var volU=p.cube, volT=qty*volU, sum=qty*price;
    tq+=qty; tv+=volT; ts+=sum;
    rows.push([ startNo+i+1, orderId, orderDate, shipDate, client, p.cls, p.name,
                qty, volU, volT, price, sum, status, origLogin, now ]);
  });
  if (!rows.length) throw new Error('Позиции не распознаны в прайсе.');

  // Ограничение по кубатуре: текущий объём заказа + добавляемый
  var existVol = existing.reduce(function(s,o){ return s + o.volT; }, 0);
  var ti_ = truckForClient_(client, shipDate);
  if (ti_.capacity != null && (existVol + tv) > ti_.capacity + 1e-6){
    throw new Error('Итоговый объём заказа '+(Math.round((existVol+tv)*1000)/1000)+' м³ превысит кубатуру машины «'+
      ti_.truck+'» ('+ti_.capacity+' м³). Оформите дополнительный заказ на другой рейс.');
  }

  var lock = acquireLock_();
  try {
    sh.getRange(sh.getLastRow()+1, 1, rows.length, ORDER_HEADERS.length).setValues(rows);
  } finally { lock.releaseLock(); }

  var beforeQty = existing.reduce(function(s,o){return s+o.qty;},0);
  var beforeSum = existing.reduce(function(s,o){return s+o.sum;},0);
  logOrderChange_('Заказ', 'Дополнение', orderId, client, user,
    {pos:existing.length,qty:beforeQty,sum:beforeSum},
    {pos:existing.length+rows.length,qty:beforeQty+tq,sum:beforeSum+ts},
    rows.map(function(r){return r[6]+': +'+r[7];}).join('; '));

  return { ok:true, orderId:orderId, client:client, by:user.login, addedLines:rows.length,
           addedQty:tq, addedVol:Math.round(tv*1000)/1000, addedSum:ts };
}

/* ===================== КОНТРОЛЬ ГРАФИКА (кто дал / кто не дал) ===================== */

// Отчёт: по каждому клиенту — ближайшая отправка, дедлайн, дал ли заказ, машина, объём.
function getScheduleControl(loginName){
  var user = authUser_(loginName);
  if (!can_(user,'control'))
    throw new Error('Нет доступа к «Контроль графика». Запросите доступ у администратора.');
  var sched = readSchedule_();
  var allowed = (user.role==='manager') ? user.clients.map(norm) : null; // admin/viewer — все
  var orders = readOrders_();

  var rows = sched.filter(function(cl){
    return !allowed || allowed.indexOf(norm(cl.name)) >= 0;
  }).map(function(cl){
    var info = shipInfoForClient_(cl.name);
    var ship = info ? info.shipDate : '—';
    var dl = orderDeadlineInfo_(cl.name, ship);
    var ord = orders.filter(function(o){ return norm(o.client)===norm(cl.name) && fmtDate(o.shipDate)===ship; });
    var ids = {}, qty=0, vol=0, sum=0;
    ord.forEach(function(o){ ids[o.id]=1; qty+=o.qty; vol+=o.volT; sum+=o.sum; });
    var ti = truckForClient_(cl.name, ship);
    var given = ord.length > 0;
    return {
      client: cl.name, ship: ship, deadline: dl.text, deadlinePassed: dl.passed,
      given: given, orderId: Object.keys(ids).join(', '),
      qty: qty, vol: Math.round(vol*1000)/1000, sum: sum,
      truck: ti.truck||'—', capacity: (ti.capacity!=null?ti.capacity:null),
      over: (ti.capacity!=null && vol > ti.capacity + 1e-6)
    };
  });
  // сначала те, кто НЕ дал заказ
  rows.sort(function(a,b){ if (a.given!==b.given) return a.given?1:-1; return String(a.client).localeCompare(String(b.client)); });
  var notGiven = rows.filter(function(r){return !r.given;}).length;
  return { rows: rows, total: rows.length, notGiven: notGiven, given: rows.length-notGiven };
}

/* ===================== ОТЧЁТ ПО ВЫПОЛНЕНИЮ ЗАКАЗА ===================== */
// Доступ: admin / manager / viewer. Возвращает разбивки заказано/отправлено/
// не отправлено (нехватка)/сверх отправлено по итогу, группам, дилерам, СКУ.
function getReports(loginName, filter){
  var user = authUser_(loginName);
  if (!can_(user,'report'))
    throw new Error('Нет доступа к отчётам. Запросите доступ у администратора.');
  filter = filter || {};
  var allowed = (user.role==='manager') ? user.clients.map(norm) : null; // admin/viewer — все
  function clientOk(c){ return !allowed || allowed.indexOf(norm(c)) >= 0; }
  function inRange(d){
    if (!filter.from && !filter.to) return true;
    var t = (d instanceof Date) ? d : new Date(d);
    if (filter.from && t < new Date(filter.from)) return false;
    if (filter.to){ var to = new Date(filter.to); to.setHours(23,59,59); if (t > to) return false; }
    return true;
  }
  var orders = readOrders_().filter(function(o){ return clientOk(o.client) && inRange(o.orderDate); });
  var ships  = readShipments_().filter(function(s){ return clientOk(s.client) && inRange(s.shipDate); });

  // единица учёта: (клиент, СКУ)
  var units = {};
  function U(client, sku, cls){
    var k = client + '\u0001' + sku;
    if (!units[k]) units[k] = { client:client, sku:sku, cls:cls||'', oQty:0, oSum:0, sQty:0, sSum:0, price:0 };
    return units[k];
  }
  orders.forEach(function(o){ var u=U(o.client,o.name,o.cls); u.oQty+=o.qty; u.oSum+=o.sum; if(o.price) u.price=o.price; });
  ships.forEach(function(s){ var u=U(s.client,s.name,s.cls); u.sQty+=s.shipped; u.sSum+=s.sum;
                             if(!u.price && s.price) u.price=s.price; if(!u.cls && s.cls) u.cls=s.cls; });

  function blank(name, cls){ return {name:name, cls:cls||'', orderedQty:0, orderedSum:0, shippedQty:0, shippedSum:0, shortageSum:0, overSum:0}; }
  var total = blank('ИТОГО');
  var g={}, c={}, p={};
  Object.keys(units).forEach(function(k){
    var u = units[k];
    var sh = Math.max(0, u.oQty - u.sQty) * u.price;   // нехватка (в деньгах)
    var ov = Math.max(0, u.sQty - u.oQty) * u.price;   // сверх отправлено
    function add(row){ row.orderedQty+=u.oQty; row.orderedSum+=u.oSum; row.shippedQty+=u.sQty;
                       row.shippedSum+=u.sSum; row.shortageSum+=sh; row.overSum+=ov; }
    add(total);
    if(!g[u.cls]) g[u.cls]=blank(u.cls||'(без класса)'); add(g[u.cls]);
    if(!c[u.client]) c[u.client]=blank(u.client); add(c[u.client]);
    if(!p[u.sku]) p[u.sku]=blank(u.sku, u.cls); add(p[u.sku]); if(!p[u.sku].cls) p[u.sku].cls=u.cls;
  });
  function round(o){ ['orderedQty','orderedSum','shippedQty','shippedSum','shortageSum','overSum']
      .forEach(function(key){ o[key]=Math.round(o[key]*1000)/1000; }); return o; }
  function arr(obj, byOrdered){
    var a = Object.keys(obj).map(function(k){ return round(obj[k]); });
    a.sort(byOrdered ? function(x,y){return y.orderedSum-x.orderedSum;}
                     : function(x,y){return String(x.name).localeCompare(String(y.name));});
    return a;
  }
  return {
    currency:'UZS', generatedAt: fmtDate(new Date()),
    total: round(total),
    byGroup: arr(g,false),
    byClient: arr(c,true),
    bySKU: arr(p,true)
  };
}

/* ===================== ОТЧЁТ ДЛЯ ЛОГИСТИКИ (график отправки + машины) ===================== */
// Источник — лист "График отправки" (три таблицы: отправки, логистика, машины).
// Доступ: admin / manager / viewer.
function getLogisticsReport(loginName){
  var user = authUser_(loginName);
  if (!can_(user,'logi'))
    throw new Error('Нет доступа к «Логистике». Запросите доступ у администратора.');
  var data = readSchedSheet_();
  var dayNames = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  var allowed = (user.role==='manager' || user.role==='orderer') ? user.clients.map(norm) : null;

  var ordByName={}, logByName={};
  data.orders.forEach(function(o){ ordByName[norm(o.name)] = o; });
  data.logistics.forEach(function(l){ logByName[norm(l.name)] = l; });

  // порядок клиентов: сначала из графика отправки, затем добавочные из логистики
  var order=[], seen={};
  data.orders.forEach(function(o){ var k=norm(o.name); if(!seen[k]){seen[k]=1; order.push(o.name);} });
  data.logistics.forEach(function(l){ var k=norm(l.name); if(!seen[k]){seen[k]=1; order.push(l.name);} });

  function leadOf(rule){ return /два/i.test(rule||'') ? 2 : 1; }

  var rows=[];
  var byDay = dayNames.map(function(d){ return { day:d, items:[] }; });
  var truckAgg={};

  order.forEach(function(name){
    if (allowed && allowed.indexOf(norm(name)) < 0) return;
    var o = ordByName[norm(name)] || null;
    var l = logByName[norm(name)] || null;
    var rule = (o&&o.rule) || (l&&l.rule) || '';
    var deadline = (o&&o.deadline) || (l&&l.deadline) || '';
    var lead = leadOf(rule);
    var cells=[], trucks={}, shipDays=[], collect={};
    for (var d=0; d<7; d++){
      var truck = l ? String(l.trucks[d]||'').trim() : '';
      var ship  = o ? !!o.days[d] : false;
      if (truck) ship = true;               // есть машина в этот день -> едем
      cells.push({ ship:ship, truck:truck });
      if (ship){
        shipDays.push(dayNames[d]);
        var cap = truck ? truckCapacity_(data.trucks, truck) : null;
        if (truck) trucks[truck]=1;
        byDay[d].items.push({ client:name, truck:truck||'—', capacity:(cap!=null?cap:null) });
        if (truck){
          var tk = norm(truck);
          if (!truckAgg[tk]) truckAgg[tk] = { truck:truck, capacity:(cap!=null?cap:null), entries:[] };
          truckAgg[tk].entries.push({ day:dayNames[d], client:name });
        }
        var cd = ((d - lead) % 7 + 7) % 7;  // день сбора заказа = деньОтправки − запас
        collect[dayNames[cd]] = 1;
      }
    }
    rows.push({
      name:name, cells:cells, rule:rule, deadline:deadline,
      trucks:Object.keys(trucks), shipDays:shipDays,
      collectDays: dayNames.filter(function(dn){ return collect[dn]; })
    });
  });

  var byTruck = Object.keys(truckAgg).map(function(k){
    var t=truckAgg[k]; t.totalSlots=t.entries.length; return t;
  }).sort(function(a,b){ return (b.capacity||0)-(a.capacity||0); });

  return { days:dayNames, rows:rows, byDay:byDay, byTruck:byTruck };
}

/* ===================== ЛОГИСТИКА: график, расходы, маршруты ===================== */

// Версия графика — для уведомления всех пользователей об изменениях логистом.
function schedVer_(){
  var p=PropertiesService.getScriptProperties();
  return { ver:p.getProperty('SCHED_VER')||'0', by:p.getProperty('SCHED_BY')||'', at:p.getProperty('SCHED_AT')||'' };
}
function bumpSchedVer_(login){
  var p=PropertiesService.getScriptProperties();
  var n=String(Date.now());
  p.setProperty('SCHED_VER',n); p.setProperty('SCHED_BY',login||''); p.setProperty('SCHED_AT',fmtDateTime(new Date()));
  _schedCache=null;
  return n;
}
function getSchedVersion(loginName){ authUser_(loginName); return schedVer_(); }

// Список названий машин (оригинальные имена) из всех таблиц листа.
function truckNames_(data){
  var set={};
  (data.truckList||[]).forEach(function(t){ if(t.name) set[t.name]=1; });
  (data.econTrucks||[]).forEach(function(t){ if(t) set[t]=1; });
  data.logistics.forEach(function(l){ l.trucks.forEach(function(t){ if(t) set[t]=1; }); });
  return Object.keys(set).sort();
}

// Редактор графика (логист): строки клиентов × дни недели = назначенная машина.
function getScheduleGrid(loginName){
  var u=authUser_(loginName);
  if(!can_(u,'schededit')) throw new Error('Редактирование графика доступно логисту/админу. Запросите доступ.');
  var data=readSchedSheet_();
  var rows=data.logistics.map(function(l){ return { client:l.name, row:l._row, days:l.trucks.slice(0,7) }; });
  return { days:['Пн','Вт','Ср','Чт','Пт','Сб','Вс'], trucks:truckNames_(data), rows:rows, version:schedVer_() };
}
// Сохранить изменения графика и поднять версию (уведомление остальным).
function saveScheduleGrid(loginName, changes){
  var u=authUser_(loginName);
  if(!can_(u,'schededit')) throw new Error('Нет прав на изменение графика.');
  var sh=schedSheet_();
  var n=0;
  (changes||[]).forEach(function(ch){
    var row=parseInt(ch.row,10), day=parseInt(ch.day,10);
    if(!(row>=2) || !(day>=0&&day<=6)) return;
    sh.getRange(row, 2+day, 1, 1).setValue(String(ch.truck||''));
    n++;
  });
  var ver=bumpSchedVer_(u.login);
  return { ok:true, version:ver, count:n };
}

// Данные «Юнит экономики»: матрица клиент × машина (стоимость рейса и цена за м³).
function logiCostData_(){
  var data=readSchedSheet_();
  var trucks=(data.econTrucks||[]).map(function(t){ return { name:t, key:norm(t), cap:truckCapacity_(data.trucks,t) }; });
  var rows=Object.keys(data.econ).map(function(k){
    var e=data.econ[k];
    var cells=trucks.map(function(t){
      var c=e.costs[t.key]; var cost=c?c.cost:null;
      return { truck:t.name, cost:cost, perM3:(cost!=null && t.cap)?Math.round(cost/t.cap):null };
    });
    var best=null;
    cells.forEach(function(c){ if(c.perM3!=null && (best===null || c.perM3<best.perM3)) best={truck:c.truck, perM3:c.perM3, cost:c.cost}; });
    return { client:e.name, cells:cells, best:best };
  });
  return { trucks:trucks, rows:rows };
}
function getLogiCost(loginName){
  var u=authUser_(loginName);
  if(!can_(u,'logicost')) throw new Error('Отчёт по расходам логистики недоступен. Запросите доступ.');
  return logiCostData_();
}
function getCubePrice(loginName){
  var u=authUser_(loginName);
  if(!can_(u,'cubeprice')) throw new Error('Отчёт «Цена за м³» недоступен. Запросите доступ.');
  return logiCostData_();
}

// Маршруты по дням: какая машина какие регионы обслуживает, объём/кубатура, стоимость, цена за м³.
function getRoutes(loginName){
  var u=authUser_(loginName);
  if(!can_(u,'route')) throw new Error('Маршруты недоступны. Запросите доступ.');
  var data=readSchedSheet_();
  var days=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  var out=[];
  for(var d=0;d<7;d++){
    var byTruck={};
    data.logistics.forEach(function(l){
      var t=String(l.trucks[d]||'').trim(); if(!t) return;
      var tk=norm(t);
      if(!byTruck[tk]) byTruck[tk]={ truck:t, cap:truckCapacity_(data.trucks,t), clients:[], cost:0 };
      var e=data.econ[norm(l.name)];
      var cost=(e && e.costs[tk]) ? e.costs[tk].cost : 0;
      byTruck[tk].clients.push({ client:l.name, cost:cost });
      byTruck[tk].cost+=cost;
    });
    Object.keys(byTruck).forEach(function(tk){
      var b=byTruck[tk];
      out.push({ day:days[d], dayIdx:d, truck:b.truck, capacity:b.cap, clients:b.clients,
                 cost:b.cost, perM3:(b.cap?Math.round(b.cost/b.cap):null), count:b.clients.length });
    });
  }
  return { routes:out, days:days };
}

// Оптимизация: для клиента и объёма ранжируем машины по стоимости/вместимости.
function optimizeRoute(loginName, client, volume){
  var u=authUser_(loginName);
  if(!can_(u,'route')) throw new Error('Недостаточно прав.');
  var data=readSchedSheet_();
  var e=data.econ[norm(client)];
  if(!e) throw new Error('Нет данных по расходам для клиента: '+client);
  var vol=parseFloat(volume)||0;
  var opts=[];
  (data.econTrucks||[]).forEach(function(t){
    var tk=norm(t); var c=e.costs[tk]; if(!c) return;
    var cap=truckCapacity_(data.trucks,t);
    opts.push({ truck:t, cost:c.cost, capacity:cap, perM3:(cap?Math.round(c.cost/cap):null),
                fits:(cap!=null? vol<=cap+1e-6 : null) });
  });
  opts.sort(function(a,b){
    var af=(a.fits===false)?1:0, bf=(b.fits===false)?1:0;
    if(af!==bf) return af-bf;          // сначала те, что помещаются
    return a.cost-b.cost;              // затем дешевле по стоимости рейса
  });
  return { client:e.name, volume:vol, options:opts };
}

/* ===================== ДЕБИТОРКА (расчёты с контрагентами) ===================== */
// Источники: лист "Поступление" (оплаты) и "Сальдо" (остатки на начало),
// плюс "Архив отправки" (реализация). Доступ: admin / manager / viewer.

function toDate_(d){
  if (d instanceof Date) return d;
  if (d==null || d==='') return null;
  var p = parseDmy_(d); if (p) return p;
  var t = new Date(d); return isNaN(t) ? null : t;
}
function findHeaderRow_(values, mustHave){
  for (var r=0;r<Math.min(values.length,20);r++){
    var joined = values[r].map(function(c){return norm(c);}).join('|');
    var ok = true;
    for (var i=0;i<mustHave.length;i++){ if (joined.indexOf(mustHave[i])<0){ ok=false; break; } }
    if (ok) return r;
  }
  return -1;
}
function findCol_(header, keys){
  for (var i=0;i<header.length;i++){
    var n = norm(header[i]);
    for (var k=0;k<keys.length;k++){ if (n.indexOf(keys[k])>=0) return i; }
  }
  return -1;
}

function readReceipts_(){
  var sh = getSheetFuzzy('Поступление'); if (!sh) return [];
  var v = sh.getDataRange().getValues();
  var hr = findHeaderRow_(v, ['контрагент','сумма']); if (hr<0) return [];
  var H = v[hr];
  var cDate=findCol_(H,['дата']), cSum=findCol_(H,['сумма']), cType=findCol_(H,['тип']),
      cCp=findCol_(H,['контрагент']), cNote=findCol_(H,['примеч','примич']);
  var out=[];
  for (var r=hr+1;r<v.length;r++){
    var cp = cCp>=0 ? String(v[r][cCp]||'').trim() : '';
    var sum = cSum>=0 ? toNum(v[r][cSum]) : 0;
    if (!cp || !sum) continue;
    out.push({ date:(cDate>=0?v[r][cDate]:null), sum:sum, type:(cType>=0?String(v[r][cType]||'').trim():''),
               client:cp, note:(cNote>=0?String(v[r][cNote]||''):'') });
  }
  return out;
}

function readSaldo_(){
  var sh = getSheetFuzzy('Сальдо'); if (!sh) return [];
  var v = sh.getDataRange().getValues();
  var hr = findHeaderRow_(v, ['контрагент']); if (hr<0) return [];
  var H = v[hr];
  var cCp=findCol_(H,['контрагент']), cDeb=findCol_(H,['дебитор']), cCred=findCol_(H,['кредитор']), cDate=findCol_(H,['дата']);
  var out=[];
  for (var r=hr+1;r<v.length;r++){
    var cp = cCp>=0 ? String(v[r][cCp]||'').trim() : '';
    if (!cp) continue;
    var deb = cDeb>=0 ? toNum(v[r][cDeb]) : 0;
    var cred = cCred>=0 ? toNum(v[r][cCred]) : 0;
    if (!deb && !cred) continue;
    out.push({ client:cp, debit:deb, credit:cred, date:(cDate>=0?v[r][cDate]:null) });
  }
  return out;
}

function debtorAccess_(user){
  if (['admin','manager','viewer'].indexOf(user.role)<0)
    throw new Error('Дебиторка доступна администратору, менеджеру и просмотрщику отчётов.');
}
// Границы периода → местная полночь (иначе ISO-дата 'yyyy-mm-dd' трактуется как UTC и день «с» теряется).
function dayStart_(v){
  var d=toDate_(v); if(!d) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0,0,0);
}
function dayEnd_(v){
  var d=toDate_(v); if(!d) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23,59,59);
}
function rangeFilter_(filter){
  var from = filter.from ? dayStart_(filter.from) : null;
  var to   = filter.to   ? dayEnd_(filter.to)     : null;
  return function(d){
    if (!from && !to) return true;
    var t = toDate_(d); if (!t) return true;
    if (from && t < from) return false;
    if (to && t > to) return false;
    return true;
  };
}

// Главный отчёт по дебиторке.
function getDebtorReport(loginName, filter){
  var user = authUser_(loginName); if(!can_(user,'debtor')) throw new Error('Нет доступа к «Дебиторке». Запросите доступ у администратора.');
  filter = filter||{}; var inRange = rangeFilter_(filter);
  var allowed = (user.role==='manager') ? user.clients.map(norm) : null;
  function ok(c){ return !allowed || allowed.indexOf(norm(c))>=0; }

  var saldo=readSaldo_(), receipts=readReceipts_(), ships=readShipments_(), returns=readReturns_();
  var U={};
  function unit(name){ var k=norm(name); if(!U[k]) U[k]={name:name,opening:0,real:0,receipt:0,cash:0,bank:0,ret:0}; return U[k]; }
  saldo.forEach(function(s){ if(!ok(s.client))return; unit(s.client).opening += (s.debit - s.credit); });
  ships.forEach(function(s){ if(!ok(s.client))return; if(!inRange(s.shipDate))return; unit(s.client).real += s.sum; });
  receipts.forEach(function(r){ if(!ok(r.client))return; if(!inRange(r.date))return;
    var u=unit(r.client); u.receipt+=r.sum; if(/касс|нал/i.test(r.type)) u.cash+=r.sum; else u.bank+=r.sum; });
  returns.forEach(function(rt){ if(!ok(rt.client))return; if(rt.status!=='Принято')return; if(!inRange(rt.date))return; unit(rt.client).ret += rt.sum; });

  var rows=[], kpi={realization:0,receipts:0,cash:0,bank:0,debit:0,credit:0,returns:0,contractors:0};
  Object.keys(U).forEach(function(k){
    var u=U[k]; var bal=u.opening+u.real-u.receipt-u.ret;
    kpi.realization+=u.real; kpi.receipts+=u.receipt; kpi.cash+=u.cash; kpi.bank+=u.bank; kpi.returns+=u.ret;
    if(bal>0) kpi.debit+=bal; else kpi.credit+=(-bal);
    if(u.opening||u.real||u.receipt||u.ret) kpi.contractors++;
    rows.push({ name:u.name, opening:Math.round(u.opening), real:Math.round(u.real),
                receipt:Math.round(u.receipt), ret:Math.round(u.ret), balance:Math.round(bal) });
  });
  rows.sort(function(a,b){ return b.balance-a.balance; });
  ['realization','receipts','cash','bank','debit','credit','returns'].forEach(function(key){ kpi[key]=Math.round(kpi[key]); });
  return { currency:'UZS', generatedAt:fmtDate(new Date()),
           from:(filter.from||''), to:(filter.to||''),
           kpi:kpi, rows:rows,
           receiptsByType:[{type:'Касса (наличные)',sum:kpi.cash},{type:'Банк (безнал)',sum:kpi.bank}] };
}

// Акт сверки по одному контрагенту.
function getReconciliation(loginName, client, filter){
  var user = authUser_(loginName);
  if (!(can_(user,'akt')||can_(user,'debtor')))
    throw new Error('Нет доступа к «Акту сверки». Запросите доступ у администратора.');
  if (!client) throw new Error('Не выбран контрагент.');
  filter = filter||{}; var inRange = rangeFilter_(filter);
  if ((user.role==='manager' || user.role==='orderer') && user.clients.map(norm).indexOf(norm(client))<0)
    throw new Error('Нет доступа к контрагенту: '+client);

  var opening=0;
  readSaldo_().forEach(function(s){ if(norm(s.client)===norm(client)) opening += (s.debit - s.credit); });

  // Сальдо на начало = сальдо из листа + все операции ДО даты «с»
  var fromD = filter.from ? dayStart_(filter.from) : null;
  function before(d){ var t=toDate_(d); return fromD && t && t < fromD; }
  if(fromD){
    readShipments_().forEach(function(s){ if(norm(s.client)===norm(client) && before(s.shipDate)) opening += s.sum; });
    readReceipts_().forEach(function(r){ if(norm(r.client)===norm(client) && before(r.date)) opening -= r.sum; });
    readReturns_().forEach(function(rt){ if(norm(rt.client)===norm(client) && rt.status==='Принято' && before(rt.date)) opening -= rt.sum; });
  }

  var ops=[];
  var byShip={};
  readShipments_().forEach(function(s){
    if(norm(s.client)!==norm(client) || !inRange(s.shipDate)) return;
    var k=String(s.id); if(!byShip[k]) byShip[k]={d:s.shipDate, id:s.id, sum:0}; byShip[k].sum+=s.sum;
  });
  Object.keys(byShip).forEach(function(k){ var x=byShip[k];
    ops.push({ d:toDate_(x.d), doc:'Отгрузка '+x.id, kind:'Реализация', id:x.id, debit:Math.round(x.sum), credit:0 }); });
  readReceipts_().forEach(function(r){
    if(norm(r.client)!==norm(client) || !inRange(r.date)) return;
    ops.push({ d:toDate_(r.date), doc:'Оплата'+(r.type?' ('+r.type+')':''), kind:'Поступление', debit:0, credit:Math.round(r.sum) }); });
  // принятые возвраты уменьшают долг клиента
  var byRet={};
  readReturns_().forEach(function(rt){
    if(norm(rt.client)!==norm(client) || rt.status!=='Принято' || !inRange(rt.date)) return;
    var isTara = /тара/i.test(rt.cls||'') || /ящик/i.test(rt.name||'');
    var k=String(rt.id)+(isTara?'#T':'#R');
    if(!byRet[k]) byRet[k]={d:rt.date, id:rt.id, reason:rt.reason, sum:0, tara:isTara};
    byRet[k].sum+=rt.sum;
  });
  Object.keys(byRet).forEach(function(k){ var x=byRet[k];
    if(x.tara) ops.push({ d:toDate_(x.d), doc:'Тара '+x.id, kind:'Тара', debit:0, credit:Math.round(x.sum) });
    else ops.push({ d:toDate_(x.d), doc:'Возврат '+x.id+(x.reason?' ('+x.reason+')':''), kind:'Возврат', debit:0, credit:Math.round(x.sum) }); });
  ops.sort(function(a,b){ var ta=a.d?a.d.getTime():0, tb=b.d?b.d.getTime():0; return ta-tb; });

  var run=opening, list=[], td=0, tc=0;
  ops.forEach(function(o){ run += o.debit - o.credit; td+=o.debit; tc+=o.credit;
    list.push({ date:fmtDate(o.d), doc:o.doc, kind:o.kind, id:o.id||null, debit:o.debit, credit:o.credit, balance:Math.round(run) }); });
  return { client:client, generatedAt:fmtDate(new Date()), opening:Math.round(opening),
           closing:Math.round(run), totalDebit:Math.round(td), totalCredit:Math.round(tc), ops:list };
}

/* ===================== ВОЗВРАТ ТОВАРОВ ===================== */
// Дилер (orderer) оформляет возврат по СКУ -> статус "Ожидание".
// Кладовщик (shipper) проверяет: "Принято" или "Отклонено".
// Отклонённый возврат дилер может изменить и отправить заново.
// Принятый возврат учитывается в акте сверки и в дебиторке.

function ensureReturnSheet_(){
  var book = ss(); var s = book.getSheetByName(SHEET_RETURN);
  if (!s){
    s = book.insertSheet(SHEET_RETURN);
    s.getRange(1,1,1,RETURN_HEADERS.length).setValues([RETURN_HEADERS]).setFontWeight('bold');
    s.setFrozenRows(1);
  }
  return s;
}
function readReturns_(){
  var sh = getSheetFuzzy(SHEET_RETURN); if (!sh) return [];
  var last = sh.getLastRow(); if (last<2) return [];
  var v = sh.getRange(2,1,last-1,RETURN_HEADERS.length).getValues();
  return v.map(function(r,i){
    return { row:i+2, no:r[0], id:String(r[1]), date:r[2], client:r[3], cls:r[4], name:r[5],
             qty:toNum(r[6]), reason:String(r[7]||''), place:String(r[8]||''), mode:String(r[9]||''), price:toNum(r[10]),
             sum:toNum(r[11]), comment:String(r[12]||''), status:String(r[13]||''), login:String(r[14]||''),
             checkedBy:String(r[15]||''), ts:r[16] };
  });
}

// Данные для формы возврата (дилер): клиенты, товары, цены возврата, причины.
function getReturnInit(loginName){
  var user = authUser_(loginName);
  if (!can_(user,'return')) throw new Error('Нет доступа к «Возврату». Запросите доступ у администратора.');
  var sched = readSchedule_();
  var clients = sched.filter(function(c){
    return user.role!=='orderer' || user.clients.map(norm).indexOf(norm(c.name))>=0;
  }).map(function(c){ return c.name; });
  var RP = readReturnPrice_();
  var bonusMap = returnBonusMap_();
  var prices = {};
  clients.forEach(function(cl){
    var col = RP.priceCol[norm(cl)]; var pct = bonusMap[norm(cl)] || 0; var m={};
    RP.products.forEach(function(p){ m[p.name] = applyReturnBonus_((col!=null)?toNum(p._raw[col]):0, pct); });
    prices[cl]=m;
  });
  return { clients:clients, products:RP.products.map(function(p){return {cls:p.cls,name:p.name};}),
           prices:prices, reasons:RETURN_REASONS, places:RETURN_PLACES };
}

function maxReturnIdFromSheet_(){
  var sh=getSheetFuzzy(SHEET_RETURN); if(!sh) return 0;
  var last=sh.getLastRow(); if(last<2) return 0;
  var ids=sh.getRange(2,2,last-1,1).getValues(); var mx=0;
  ids.forEach(function(r){ var n=parseInt(r[0],10); if(!isNaN(n)&&n>mx)mx=n; });
  return mx;
}

// Бонус возврата по клиентам (лист «Бонус возврата»: Клиент | Бонус, %).
var RETBONUS_SHEET = 'Бонус возврата';
var RETBONUS_HEADERS = ['Клиент','Бонус, %'];
function returnBonusMap_(){
  var sh=getSheetFuzzy(RETBONUS_SHEET); if(!sh) return {};
  var last=sh.getLastRow(); if(last<2) return {};
  var v=sh.getRange(2,1,last-1,2).getValues(); var m={};
  v.forEach(function(r){ var n=norm(r[0]); if(!n) return; var pct=toNum(r[1]); if(pct) m[n]=pct; });
  return m;
}
// Цена возврата с бонусом (округление до целых сум).
function applyReturnBonus_(price, pct){ return pct ? Math.round(price*(1+pct/100)) : price; }
// Создать/подготовить лист бонусов (с примером «Корзинка» = 12%).
function setupReturnBonus(){
  var sh=getSheetFuzzy(RETBONUS_SHEET);
  if(!sh){ sh=ss().insertSheet(RETBONUS_SHEET);
    sh.getRange(1,1,1,2).setValues([RETBONUS_HEADERS]).setFontWeight('bold'); sh.setFrozenRows(1);
    sh.getRange(2,1,1,2).setValues([['Корзинка',12]]); }
  return 'Лист «Бонус возврата» готов. Укажите клиентов и их % бонуса.';
}

// Дата возврата "задним числом" — принимает 'dd.MM.yyyy' или 'yyyy-MM-dd' (input[type=date]).
function parseReturnDate_(s){
  if (!s) return null;
  var d = parseDmy_(String(s));
  if (!d){ var t = new Date(s); if (!isNaN(t)) d = t; }
  if (!d || isNaN(d)) return null;
  return d;
}

function buildReturnRows_(user, client, mode, comment, lines, returnId, status, customDate){
  var RP = readReturnPrice_();
  var byName={}; RP.products.forEach(function(p){ byName[norm(p.name)]=p; });
  var col = RP.priceCol[norm(client)];
  var bonusPct = returnBonusMap_()[norm(client)] || 0;   // % бонуса для клиента
  var factor = (String(mode)==='50') ? 0.5 : 1.0;
  var realNow = new Date();
  // "Дата" возврата — обычно сейчас, но admin/manager могут указать прошедшую дату;
  // "Время" (последняя колонка) — всегда настоящий момент записи, для честного аудита.
  var businessDate = (customDate instanceof Date && !isNaN(customDate)) ? customDate : realNow;
  var rows=[], totQty=0, totSum=0;
  (lines||[]).forEach(function(l){
    var qty=toNum(l.qty); if(qty<=0) return;
    var p=byName[norm(l.name)]; if(!p) return;
    var isTara = /тара/i.test(p.cls||'') || /ящик/i.test(p.name||'');   // тара: причина не нужна, режим пуст
    var reason=String(l.reason||'').trim();
    var place=String(l.place||'').trim();
    if(!isTara && !reason) throw new Error('У позиции «'+p.name+'» не указана причина возврата.');
    var price=(col!=null)?toNum(p._raw[col]):0;
    if(!isTara) price=applyReturnBonus_(price, bonusPct);   // бонус только на продукцию, не на тару
    var lineFactor = isTara ? 1.0 : factor;
    var sum=qty*price*lineFactor;
    var modeText = isTara ? '' : (factor===0.5?'50%':'100%');
    totQty+=qty; totSum+=sum;
    rows.push([0, returnId, businessDate, client, p.cls, p.name, qty, (isTara?'':reason), place, modeText,
               price, Math.round(sum), comment||'', status, user.login, '', realNow]);
  });
  return { rows:rows, totQty:totQty, totSum:Math.round(totSum) };
}

// Создать возврат (дилер/менеджер/админ). payload {login,client,reason,mode,comment,lines:[{name,qty}],date}
// date — только для admin/manager, для возврата задним числом ('dd.MM.yyyy' или 'yyyy-MM-dd').
function submitReturn(payload){
  var user = authUser_(payload.login);
  if (['admin','manager','orderer'].indexOf(user.role) < 0) throw new Error('Возврат оформляет дилер, менеджер или администратор.');
  var client = payload.client; if(!client) throw new Error('Не выбран клиент.');
  if (user.role==='orderer' && user.clients.map(norm).indexOf(norm(client))<0) throw new Error('Нет доступа к клиенту: '+client);
  var isPriv = (user.role==='admin' || user.role==='manager');
  var customDate = null;
  if (isPriv && payload.date){
    customDate = parseReturnDate_(payload.date);
    if (!customDate) throw new Error('Некорректная дата возврата: '+payload.date);
  }
  var built = buildReturnRows_(user, client, payload.mode, payload.comment, payload.lines, 0, 'Ожидание', customDate);
  if (!built.rows.length) throw new Error('Нет позиций для возврата.');
  var returnId = nextSeq('RETURN_SEQ', 700001, maxReturnIdFromSheet_);
  built.rows.forEach(function(r){ r[1]=returnId; });
  var sh = ensureReturnSheet_();
  var lock=acquireLock_();
  try{
    var startNo = Math.max(0, sh.getLastRow()-1);
    built.rows.forEach(function(r,i){ r[0]=startNo+i+1; });
    sh.getRange(sh.getLastRow()+1,1,built.rows.length,RETURN_HEADERS.length).setValues(built.rows);
  } finally { lock.releaseLock(); }
  logOrderChange_('Возврат', 'Создание', returnId, client, user,
    {pos:0,qty:0,sum:0}, {pos:built.rows.length,qty:built.totQty,sum:built.totSum}, '');
  return { ok:true, returnId:returnId, client:client, lines:built.rows.length, totalQty:built.totQty, totalSum:built.totSum, status:'Ожидание' };
}

// Изменить возврат. Дилер — только свой и только отклонённый; admin/manager — заказ в статусе
// «Ожидание» или «Отклонено» (в любом статусе, кроме уже принятого — его менять нельзя никому),
// и могут указать дату задним числом через payload.date.
function updateReturn(payload){
  var user = authUser_(payload.login);
  var returnId = String(payload.returnId||''); if(!returnId) throw new Error('Не указан ID возврата.');
  var all = readReturns_().filter(function(r){ return String(r.id)===returnId; });
  if (!all.length) throw new Error('Возврат не найден: '+returnId);
  var isPriv = (user.role==='admin' || user.role==='manager');
  if (user.role==='orderer' && norm(all[0].login)!==norm(user.login)) throw new Error('Можно изменять только свои возвраты.');
  if (all[0].status==='Принято') throw new Error('Принятый возврат изменить нельзя.');
  if (!isPriv && all[0].status!=='Отклонено') throw new Error('Изменять можно только отклонённый возврат.');
  var client = all[0].client;
  var customDate = null;
  if (isPriv && payload.date){
    customDate = parseReturnDate_(payload.date);
    if (!customDate) throw new Error('Некорректная дата возврата: '+payload.date);
  }
  var beforePos = all.length;
  var beforeQty = all.reduce(function(s,r){ return s+r.qty; },0);
  var beforeSum = all.reduce(function(s,r){ return s+r.sum; },0);
  var built = buildReturnRows_(user, client, payload.mode, payload.comment, payload.lines, returnId, 'Ожидание', customDate);
  if (!built.rows.length) throw new Error('Нет позиций для возврата.');

  var sh = ensureReturnSheet_();
  var lock=acquireLock_();
  try{
    // удалить старые строки этого ID (снизу вверх)
    var rowsToDel = all.map(function(r){return r.row;}).sort(function(a,b){return b-a;});
    rowsToDel.forEach(function(rw){ sh.deleteRow(rw); });
    var startNo = Math.max(0, sh.getLastRow()-1);
    built.rows.forEach(function(r,i){ r[0]=startNo+i+1; });
    sh.getRange(sh.getLastRow()+1,1,built.rows.length,RETURN_HEADERS.length).setValues(built.rows);
  } finally { lock.releaseLock(); }
  logOrderChange_('Возврат', 'Изменение', returnId, client, user,
    {pos:beforePos,qty:beforeQty,sum:beforeSum}, {pos:built.rows.length,qty:built.totQty,sum:built.totSum}, '');
  return { ok:true, returnId:returnId, status:'Ожидание', lines:built.rows.length, totalSum:built.totSum };
}

// Сгруппировать строки возвратов по ID.
function groupReturns_(rows){
  var by={};
  rows.forEach(function(r){
    if(!by[r.id]) by[r.id]={ returnId:r.id, date:fmtDate(r.date), client:r.client, reason:'',
        mode:r.mode, comment:r.comment, status:r.status, login:r.login, checkedBy:r.checkedBy,
        lines:[], qty:0, sum:0, _reasons:{} };
    by[r.id].lines.push({ cls:r.cls, name:r.name, qty:r.qty, price:r.price, sum:r.sum, reason:r.reason, place:r.place });
    by[r.id].qty+=r.qty; by[r.id].sum+=r.sum;
    by[r.id].status=r.status;
    if(r.reason) by[r.id]._reasons[r.reason]=1;
  });
  return Object.keys(by).map(function(k){ var g=by[k]; g.reason=Object.keys(g._reasons).join(', '); delete g._reasons; return g; })
    .sort(function(a,b){return parseInt(b.returnId)-parseInt(a.returnId);});
}

// Возвраты дилера (все статусы).
function getOrdererReturns(loginName){
  var user = authUser_(loginName);
  var rows = readReturns_().filter(function(r){
    if (user.role==='orderer') return norm(r.login)===norm(user.login);
    if (user.role==='manager') return user.clients.map(norm).indexOf(norm(r.client))>=0;
    return true; // admin
  });
  return groupReturns_(rows);
}

// Возвраты на проверку (для кладовщика/админа) — статус "Ожидание".
function getPendingReturns(loginName){
  var user = authUser_(loginName);
  if (!can_(user,'rcheck')) throw new Error('Нет доступа к проверке возвратов. Запросите доступ у администратора.');
  var rows = readReturns_().filter(function(r){
    if (user.role==='manager') return user.clients.map(norm).indexOf(norm(r.client))>=0;
    return true;
  });
  var all = groupReturns_(rows);
  return { pending: all.filter(function(g){return g.status==='Ожидание';}),
           recent: all.filter(function(g){return g.status!=='Ожидание';}).slice(0,30) };
}

function getReturnById(loginName, returnId){
  authUser_(loginName);
  var rows = readReturns_().filter(function(r){ return String(r.id)===String(returnId); });
  if (!rows.length) throw new Error('Возврат не найден: '+returnId);
  return groupReturns_(rows)[0];
}

// Решение кладовщика. payload {login, returnId, decision:'accept'|'reject', note}
function decideReturn(payload){
  var user = authUser_(payload.login);
  if (['admin','manager','shipper'].indexOf(user.role) < 0) throw new Error('Решение принимает кладовщик/менеджер/админ.');
  var returnId = String(payload.returnId||''); if(!returnId) throw new Error('Не указан ID возврата.');
  var sh = getSheetOrThrow(SHEET_RETURN);
  var last = sh.getLastRow(); if(last<2) throw new Error('Возврат не найден.');
  var stColNo = RETURN_HEADERS.indexOf('Статус')+1;
  var chColNo = RETURN_HEADERS.indexOf('Проверил')+1;
  var idCol = sh.getRange(2,2,last-1,1).getValues();
  var stCol = sh.getRange(2,stColNo,last-1,1).getValues();
  var chCol = sh.getRange(2,chColNo,last-1,1).getValues();
  var newStatus = (payload.decision==='accept') ? 'Принято' : 'Отклонено';
  var found=false;
  for (var r=0;r<idCol.length;r++){
    if (String(idCol[r][0])===returnId){
      if (String(stCol[r][0])!=='Ожидание') throw new Error('Возврат уже обработан (статус: '+stCol[r][0]+').');
      stCol[r][0]=newStatus; chCol[r][0]=user.login + (payload.note?(' · '+payload.note):''); found=true;
    }
  }
  if(!found) throw new Error('Возврат не найден: '+returnId);
  var lock=acquireLock_();
  try{
    sh.getRange(2,stColNo,last-1,1).setValues(stCol);
    sh.getRange(2,chColNo,last-1,1).setValues(chCol);
  } finally { lock.releaseLock(); }
  return { ok:true, returnId:returnId, status:newStatus };
}

/* ===================== ПОСТУПЛЕНИЯ: ввод и отчёт ===================== */
function parseInputDate_(s){
  if(!s) return new Date();
  var m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(s));
  if(m) return new Date(+m[1], +m[2]-1, +m[3]);
  var p=parseDmy_(s); if(p) return p;
  var t=new Date(s); return isNaN(t)?new Date():t;
}

// Менеджер/админ добавляет поступление прямо в лист "Поступление".
function addReceipt(payload){
  var user=authUser_(payload.login);
  if(['admin','manager'].indexOf(user.role)<0) throw new Error('Поступления вводит менеджер по заказам или администратор.');
  var client=String(payload.client||'').trim(); if(!client) throw new Error('Не выбран контрагент.');
  assertClientAllowed_(user, client);
  var sum=toNum(payload.sum); if(!(sum>0)) throw new Error('Сумма должна быть больше нуля.');
  var type=String(payload.type||'').trim() || 'Касса';
  var note=String(payload.note||'').trim();
  var date=parseInputDate_(payload.date);

  var sh=getSheetFuzzy('Поступление'); if(!sh) throw new Error('Лист «Поступление» не найден.');
  var values=sh.getDataRange().getValues();
  var hr=findHeaderRow_(values,['контрагент','сумма']); if(hr<0) hr=0;
  var H=values[hr];
  var cNo=findCol_(H,['№','no']), cDate=findCol_(H,['дата']), cSum=findCol_(H,['сумма']),
      cType=findCol_(H,['тип']), cCp=findCol_(H,['контрагент']), cNote=findCol_(H,['примеч','примич']);
  var maxNo=0; for(var r=hr+1;r<values.length;r++){ var n=parseInt(values[r][cNo>=0?cNo:0],10); if(!isNaN(n)&&n>maxNo)maxNo=n; }
  var width=Math.max(H.length,6);
  var row=[]; for(var i=0;i<width;i++) row.push('');
  if(cNo>=0)   row[cNo]=maxNo+1;
  if(cDate>=0) row[cDate]=date;
  if(cSum>=0)  row[cSum]=sum;
  if(cType>=0) row[cType]=type;
  if(cCp>=0)   row[cCp]=client;
  if(cNote>=0) row[cNote]=note;

  var lock=acquireLock_();
  try{ sh.getRange(sh.getLastRow()+1,1,1,width).setValues([row]); } finally{ lock.releaseLock(); }
  return { ok:true, no:maxNo+1, date:fmtDate(date), sum:Math.round(sum), type:type, client:client };
}

// ===================== БАНКОВСКАЯ ВЫПИСКА: авторазноска по регионам/филиалам =====================
// Маппинг ИНН → регион/филиал из листа «Контракты» (ИНН | Клиент | Регион/Филиал).
function readContractsMap_(){
  var sh=getSheetFuzzy('Контракты'); if(!sh) return { byInn:{}, regions:[] };
  var v=sh.getDataRange().getValues(); if(v.length<2) return { byInn:{}, regions:[] };
  var H=v[0];
  var cInn=findCol_(H,['инн']), cCli=findCol_(H,['клиент','наимен','контрагент']), cReg=findCol_(H,['регион','филиал']);
  if(cInn<0) cInn=0; if(cReg<0) cReg=H.length-1;
  var byInn={}, regSet={};
  for(var r=1;r<v.length;r++){
    var inn=String(v[r][cInn]||'').replace(/\D/g,''); if(!inn) continue;
    var reg=String(v[r][cReg]||'').trim(); if(!reg) continue;
    var cli=cCli>=0?String(v[r][cCli]||'').trim():'';
    byInn[inn]={ region:reg, client:cli };
    regSet[reg]=1;
  }
  return { byInn:byInn, regions:Object.keys(regSet).sort() };
}
// Создать лист «Лимиты долга» и заполнить стартовыми значениями из акта сверки.
function setupDebtLimits(){
  var data=[
    ['Регион','Лимит'],
    ['Регион Хоразм',224604270],
    ['Регион Бухоро',110124916],
    ['Регион Нукус',109054096],
    ['Регион Карши',108050552],
    ['Регион Навои',48334526],
    ['Регион Шахрисабз',34760809],
    ['Регион Термез',32800630],
    ['Регион Жиззах',18256432],
    ['Регион Фаргона',8045567],
    ['Регион Гиждувон',3225957],
    ['Филиал Тошкент',''],
    ['Филиал Самарканд','']
  ];
  var sh=getSheetFuzzy('Лимиты долга');
  if(!sh) sh=ss().insertSheet('Лимиты долга');
  sh.clear();
  sh.getRange(1,1,data.length,2).setValues(data);
  sh.getRange(1,1,1,2).setFontWeight('bold'); sh.setFrozenRows(1);
  return 'Лист «Лимиты долга» создан и заполнен. Впишите лимиты для филиалов при необходимости.';
}

function setupContractsSheet(){
  var sh=getSheetFuzzy('Контракты');
  if(!sh){ sh=ss().insertSheet('Контракты');
    sh.getRange(1,1,1,3).setValues([['ИНН','Клиент','Регион/Филиал']]).setFontWeight('bold'); sh.setFrozenRows(1); }
  return 'Лист «Контракты» готов. Вставьте данные: ИНН | Клиент | Регион/Филиал.';
}
// ===================== КАССА: приходы от филиалов/регионов из внешней таблицы =====================
var KASSA_ID    = '1-nEwpj5DG2v5IAnJYWrLpYASXkllhAQpWdByCQOW02Q';
var KASSA_SHEET = 'Приходная касса';
var KASSA_FROM  = new Date(2026,6,4);   // с 04.07.2026

// Сопоставить «Источник» из кассы с нашим регионом/филиалом.
function kassaRegion_(source, regions){
  var s=norm(String(source||'').replace(/филиал[ья]/ig,'Филиал'));
  if(!s) return '';
  for(var i=0;i<regions.length;i++){ if(norm(regions[i])===s) return regions[i]; }
  for(var j=0;j<regions.length;j++){ var r=norm(regions[j]); if(s.indexOf(r)>=0 || r.indexOf(s)>=0) return regions[j]; }
  return '';
}
function kassaKey_(p){
  if(p.no!=null && String(p.no).trim()!=='') return 'C:'+String(p.no).trim();
  return 'C:'+String(p.date||'')+'|'+norm(p.source||'')+'|'+Math.round(toNum(p.amount))+'|'+String(p.doc||'');
}
// Старый формат ключа (без №) — для распознавания ранее сохранённых приходов.
function kassaKeyLegacy_(p){
  return 'C:'+String(p.date||'')+'|'+norm(p.source||'')+'|'+Math.round(toNum(p.amount))+'|'+String(p.doc||'');
}
// Прочитать приходы кассы (филиалы/регионы) с даты KASSA_FROM, пометить дубли.
function getKassaReceipts(loginName){
  var user=authUser_(loginName);
  if(['admin','manager'].indexOf(user.role)<0) throw new Error('Загрузка кассы доступна менеджеру или администратору.');
  var ext;
  try { ext=SpreadsheetApp.openById(KASSA_ID).getSheetByName(KASSA_SHEET); }
  catch(e){ throw new Error('Нет доступа к таблице кассы. Откройте доступ этому аккаунту. '+e.message); }
  if(!ext) throw new Error('Лист «'+KASSA_SHEET+'» не найден в таблице кассы.');
  var v=ext.getDataRange().getValues();
  // список наших регионов/филиалов
  var regions=readSchedule_().map(function(c){return c.name;});
  var cmap=readContractsMap_(); cmap.regions.forEach(function(r){ if(regions.indexOf(r)<0) regions.push(r); });
  var seen=existingBankKeys_();
  var rows=[];
  for(var i=0;i<v.length;i++){
    var r=v[i];
    var d=r[1];                      // Дата
    if(!(d instanceof Date)) continue;
    if(d.getTime() < KASSA_FROM.getTime()) continue;
    var amount=toNum(r[2]);          // сумма (сўмда)
    if(!(amount>0)) continue;
    var source=String(r[6]||'').trim();     // Источник
    var region=kassaRegion_(source, regions);
    if(!region) continue;            // берём только филиалы/регионы
    var stat=String(r[5]||'').trim();       // Статя приходов
    var doc=String(r[7]||'').trim();         // Договор/Документ
    var p={ no:String(r[0]||'').trim(), date:fmtDate(d), source:source, region:region, amount:amount, doc:doc, stat:stat };
    p.dup = !!(seen[kassaKey_(p)] || seen[kassaKeyLegacy_(p)]);
    rows.push(p);
  }
  return { rows:rows, regions:regions };
}
// Сохранить кассовые приходы в «Поступление» (тип «касса»), с защитой от дублей.
function saveKassaReceipts(loginName, rows){
  var user=authUser_(loginName);
  if(['admin','manager'].indexOf(user.role)<0) throw new Error('Доступно менеджеру или администратору.');
  var sh=getSheetFuzzy('Поступление'); if(!sh) throw new Error('Лист «Поступление» не найден.');
  var values=sh.getDataRange().getValues();
  var hr=findHeaderRow_(values,['контрагент','сумма']); if(hr<0) hr=0;
  var H=values[hr];
  var cNo=findCol_(H,['№','no']), cDate=findCol_(H,['дата']), cSum=findCol_(H,['сумма']),
      cType=findCol_(H,['тип']), cCp=findCol_(H,['контрагент']), cNote=findCol_(H,['примеч','примич']);
  var maxNo=0; for(var r=hr+1;r<values.length;r++){ var n=parseInt(values[r][cNo>=0?cNo:0],10); if(!isNaN(n)&&n>maxNo)maxNo=n; }
  var width=Math.max(H.length,6);
  var seen=keysFromValues_(values, cNote), batch={}, toWrite=[], cnt=0, tot=0, skipped=0;
  (rows||[]).forEach(function(p){
    var region=String(p.region||'').trim(); var sum=toNum(p.amount);
    if(!region || !(sum>0)) return;
    var key=kassaKey_(p);
    if(seen[key] || seen[kassaKeyLegacy_(p)] || batch[key]){ skipped++; return; }
    batch[key]=1;
    var note='Касса: '+String(p.source||'')+(p.doc?(' · '+p.doc):'')+(p.stat?(' · '+p.stat):'')+' #K:'+key;
    var row=[]; for(var i=0;i<width;i++) row.push('');
    if(cNo>=0)   row[cNo]=(++maxNo);
    if(cDate>=0) row[cDate]=parseInputDate_(p.date);
    if(cSum>=0)  row[cSum]=sum;
    if(cType>=0) row[cType]='касса';
    if(cCp>=0)   row[cCp]=region;
    if(cNote>=0) row[cNote]=note;
    toWrite.push(row); cnt++; tot+=sum;
  });
  if(!toWrite.length) return { ok:true, saved:0, total:0, skipped:skipped };
  var lock=acquireLock_();
  try{ sh.getRange(sh.getLastRow()+1,1,toWrite.length,width).setValues(toWrite); } finally{ try{lock.releaseLock();}catch(e){} }
  return { ok:true, saved:cnt, total:Math.round(tot), skipped:skipped };
}

// Автоимпорт кассы (для триггера по времени). Выполняется от владельца, без входа.
function kassaAutoImport(){
  var ext;
  try { ext=SpreadsheetApp.openById(KASSA_ID).getSheetByName(KASSA_SHEET); }
  catch(e){ Logger.log('Касса: нет доступа — '+e.message); return { ok:false, error:String(e.message) }; }
  if(!ext){ Logger.log('Касса: лист не найден'); return { ok:false }; }
  var v=ext.getDataRange().getValues();
  var regions=readSchedule_().map(function(c){return c.name;});
  var cmap=readContractsMap_(); cmap.regions.forEach(function(r){ if(regions.indexOf(r)<0) regions.push(r); });

  var sh=getSheetFuzzy('Поступление'); if(!sh){ Logger.log('Касса: лист «Поступление» не найден'); return { ok:false }; }
  var values=sh.getDataRange().getValues();
  var hr=findHeaderRow_(values,['контрагент','сумма']); if(hr<0) hr=0;
  var H=values[hr];
  var cNo=findCol_(H,['№','no']), cDate=findCol_(H,['дата']), cSum=findCol_(H,['сумма']),
      cType=findCol_(H,['тип']), cCp=findCol_(H,['контрагент']), cNote=findCol_(H,['примеч','примич']);
  var maxNo=0; for(var r=hr+1;r<values.length;r++){ var n=parseInt(values[r][cNo>=0?cNo:0],10); if(!isNaN(n)&&n>maxNo)maxNo=n; }
  var width=Math.max(H.length,6);
  var seen=keysFromValues_(values, cNote), batch={};
  var toWrite=[], cnt=0, tot=0, dup=0, noReg=0;

  for(var i=0;i<v.length;i++){
    var row=v[i]; var d=row[1];
    if(!(d instanceof Date)) continue;
    if(d.getTime() < KASSA_FROM.getTime()) continue;
    var amount=toNum(row[2]); if(!(amount>0)) continue;
    var source=String(row[6]||'').trim();
    var region=kassaRegion_(source, regions);
    if(!region){ noReg++; continue; }
    var p={ no:String(row[0]||'').trim(), date:fmtDate(d), source:source, region:region, amount:amount,
            doc:String(row[7]||'').trim(), stat:String(row[5]||'').trim() };
    var key=kassaKey_(p);
    if(seen[key] || seen[kassaKeyLegacy_(p)] || batch[key]){ dup++; continue; }
    batch[key]=1;
    var note='Касса: '+p.source+(p.doc?(' · '+p.doc):'')+(p.stat?(' · '+p.stat):'')+' #K:'+key;
    var wr=[]; for(var c=0;c<width;c++) wr.push('');
    if(cNo>=0)   wr[cNo]=(++maxNo);
    if(cDate>=0) wr[cDate]=parseInputDate_(p.date);
    if(cSum>=0)  wr[cSum]=amount;
    if(cType>=0) wr[cType]='касса';
    if(cCp>=0)   wr[cCp]=region;
    if(cNote>=0) wr[cNote]=note;
    toWrite.push(wr); cnt++; tot+=amount;
  }
  if(toWrite.length){
    var lock=LockService.getScriptLock(); var got=false;
    for(var t=0;t<6 && !got;t++){ got=lock.tryLock(5000); if(!got) Utilities.sleep(600); }
    if(!got){ Logger.log('Касса: занято, повтор при следующем запуске'); return { ok:false, busy:true }; }
    try{ sh.getRange(sh.getLastRow()+1,1,toWrite.length,width).setValues(toWrite); } finally{ try{lock.releaseLock();}catch(e){} }
  }
  Logger.log('Касса автоимпорт: добавлено '+cnt+' на '+Math.round(tot)+' сум · дублей '+dup+' · без региона '+noReg);
  return { ok:true, saved:cnt, total:Math.round(tot), skipped:dup, unmatched:noReg };
}

// Взять блокировку с несколькими попытками (мягко переживает одновременные сохранения).
function acquireLock_(){
  var lock=LockService.getScriptLock();
  for(var i=0;i<4;i++){ if(lock.tryLock(2500)) return lock; Utilities.sleep(300); }
  throw new Error('Сейчас идёт другое сохранение. Повторите через несколько секунд.');
}

// Уникальный ключ банковской транзакции (защита от повторной загрузки).
function bankKey_(p){
  var amt=Math.round(toNum(p.amount));
  var doc=String(p.doc||'').trim();
  var inn=String(p.inn||'').replace(/\D/g,'');
  var d=String(p.date||'').trim();
  return (doc||d)+'|'+inn+'|'+amt;
}
// Ключи уже сохранённых банковских платежей (из примечаний в «Поступление»).
function existingBankKeys_(){
  var set={};
  readReceipts_().forEach(function(r){
    var m=String(r.note||'').match(/#K:([^\s]+)/);
    if(m) set[m[1]]=1;
  });
  return set;
}
// Ключи из уже прочитанного массива значений (чтобы не читать лист дважды).
function keysFromValues_(values, cNote){
  var set={};
  if(cNote<0) return set;
  for(var i=0;i<values.length;i++){
    var m=String(values[i][cNote]||'').match(/#K:([^\s]+)/);
    if(m) set[m[1]]=1;
  }
  return set;
}
// Сопоставить платежи с регионами по ИНН + пометить дубли. payments:[{date,doc,inn,name,purpose,amount}]
function getBankMatch(loginName, payments){
  var user=authUser_(loginName);
  if(['admin','manager'].indexOf(user.role)<0) throw new Error('Разнос выписки доступен менеджеру или администратору.');
  var map=readContractsMap_();
  var seen=existingBankKeys_();
  var rows=(payments||[]).map(function(p){
    var inn=String(p.inn||'').replace(/\D/g,'');
    var m=map.byInn[inn];
    var key=bankKey_(p);
    return { date:String(p.date||''), doc:String(p.doc||''), name:String(p.name||''), inn:inn,
             purpose:String(p.purpose||''), amount:toNum(p.amount),
             region:(m?m.region:''), matched:!!m, dup:!!seen[key] };
  });
  return { rows:rows, regions:map.regions };
}
// Сохранить платежи в «Поступление» (зачисление на регион/филиал, плательщик — в примечании).
function saveBankReceipts(loginName, rows){
  var user=authUser_(loginName);
  if(['admin','manager'].indexOf(user.role)<0) throw new Error('Разнос выписки доступен менеджеру или администратору.');
  var sh=getSheetFuzzy('Поступление'); if(!sh) throw new Error('Лист «Поступление» не найден.');
  var values=sh.getDataRange().getValues();
  var hr=findHeaderRow_(values,['контрагент','сумма']); if(hr<0) hr=0;
  var H=values[hr];
  var cNo=findCol_(H,['№','no']), cDate=findCol_(H,['дата']), cSum=findCol_(H,['сумма']),
      cType=findCol_(H,['тип']), cCp=findCol_(H,['контрагент']), cNote=findCol_(H,['примеч','примич']);
  var maxNo=0; for(var r=hr+1;r<values.length;r++){ var n=parseInt(values[r][cNo>=0?cNo:0],10); if(!isNaN(n)&&n>maxNo)maxNo=n; }
  var width=Math.max(H.length,6);
  var seen=keysFromValues_(values, cNote);               // уже сохранённые ключи (из тех же данных)
  var batch={};                               // защита от дублей внутри одной загрузки
  var toWrite=[], cnt=0, tot=0, skipped=0;
  (rows||[]).forEach(function(p){
    var region=String(p.region||'').trim(); var sum=toNum(p.amount);
    if(!region || !(sum>0)) return;
    var key=bankKey_(p);
    if(seen[key] || batch[key]){ skipped++; return; }   // уже загружали — пропускаем
    batch[key]=1;
    var note='Банк: '+String(p.name||'')+(p.inn?(' (ИНН '+p.inn+')'):'')+(p.purpose?(' · '+p.purpose):'')+' #K:'+key;
    var row=[]; for(var i=0;i<width;i++) row.push('');
    if(cNo>=0)   row[cNo]=(++maxNo);
    if(cDate>=0) row[cDate]=parseInputDate_(p.date);
    if(cSum>=0)  row[cSum]=sum;
    if(cType>=0) row[cType]='банк';
    if(cCp>=0)   row[cCp]=region;
    if(cNote>=0) row[cNote]=note;
    toWrite.push(row); cnt++; tot+=sum;
  });
  if(!toWrite.length) return { ok:true, saved:0, total:0, skipped:skipped };
  var lock=acquireLock_();
  try{ sh.getRange(sh.getLastRow()+1,1,toWrite.length,width).setValues(toWrite); } finally{ try{lock.releaseLock();}catch(e){} }
  return { ok:true, saved:cnt, total:Math.round(tot), skipped:skipped };
}

// Отчёт по поступлениям (admin / manager / viewer).
function getReceiptsReport(loginName, filter){
  var user=authUser_(loginName);
  if(!can_(user,'receipt')) throw new Error('Нет доступа к поступлениям. Запросите доступ у администратора.');
  filter=filter||{}; var inRange=rangeFilter_(filter);
  var allowed=(user.role==='manager')?user.clients.map(norm):null;
  function ok(c){ return !allowed || allowed.indexOf(norm(c))>=0; }
  var rec=readReceipts_().filter(function(r){ return ok(r.client) && inRange(r.date); });

  var total=0, byTypeMap={}, byClientMap={}, list=[];
  rec.forEach(function(r){
    total+=r.sum;
    var t=r.type||'—'; byTypeMap[t]=(byTypeMap[t]||0)+r.sum;
    byClientMap[r.client]=(byClientMap[r.client]||0)+r.sum;
    list.push({ date:fmtDate(r.date), client:r.client, type:t, sum:Math.round(r.sum), note:r.note, _d:toDate_(r.date) });
  });
  list.sort(function(a,b){ var ta=a._d?a._d.getTime():0, tb=b._d?b._d.getTime():0; return tb-ta; });
  list.forEach(function(x){ delete x._d; });
  function cashOf(rx){ var s=0; Object.keys(byTypeMap).forEach(function(k){ if(rx.test(norm(k))) s+=byTypeMap[k]; }); return Math.round(s); }
  var byType=Object.keys(byTypeMap).map(function(k){ return {type:k, sum:Math.round(byTypeMap[k])}; }).sort(function(a,b){return b.sum-a.sum;});
  var byClient=Object.keys(byClientMap).map(function(k){ return {name:k, sum:Math.round(byClientMap[k])}; }).sort(function(a,b){return b.sum-a.sum;});
  return { currency:'UZS', generatedAt:fmtDate(new Date()), total:Math.round(total), count:rec.length,
           cash:cashOf(/касс|нал/), bank:cashOf(/банк/), card:cashOf(/пластик|карт/),
           byType:byType, byClient:byClient, recent:list.slice(0,200) };
}

/* ===================== АНАЛИТИКА ПРОДАЖ (отдельное окно ?page=analytics) ===================== */
// Историческая база до 04.07.2026 — ОТДЕЛЬНАЯ таблица. Впишите её ID:
var SALES_HIST_ID   = '1CjDna4ghwlGU7Xh80UiJiQIu7OPp7vxP29C6626ykzg';
var SALES_HIST_SHEET= 'Конструктор отчетов';
var SALES_CUTOVER   = new Date(2026,6,4);   // 04.07.2026 — с этой даты берём данные из приложения

function include(name){ return HtmlService.createHtmlOutputFromFile(name).getContent(); }

function saNormDate_(v){
  if(v instanceof Date && !isNaN(v)) return v;
  var s=String(v==null?'':v).trim();
  var m=/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/.exec(s);
  if(m) return new Date(+m[3],+m[2]-1,+m[1]);
  var d=new Date(s); return isNaN(d)?null:d;
}
function saNum_(v){
  if(typeof v==='number') return isNaN(v)?0:v;
  var s=String(v==null?'':v).replace(/\u00a0/g,'').replace(/\s/g,'').replace(/,/g,'.').replace(/[^\d.\-]/g,'');
  var n=parseFloat(s); return isNaN(n)?0:n;
}
function saGroup_(name){
  var n=String(name).toLowerCase();
  if(/лаваш|тортил|чудо/.test(n)) return 'Лаваши';
  if(/булоч|хот|лонгер|батон|бургер|биг|классик|мини/.test(n)) return 'Булочки';
  if(/хлеб|пита|тостов/.test(n)) return 'Хлеб';
  return 'Прочее';
}
function saYm_(d){ return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2); }

// Справочник товаров из листа «SKU»: Наименование → { Группа, Канал продаж }.
function readSkuMap_(){
  var sh=getSheetFuzzy('SKU'); var by={}, groups={}, channels={};
  if(!sh) return { by:by, groups:[], channels:[] };
  var v=sh.getDataRange().getValues(); if(v.length<2) return { by:by, groups:[], channels:[] };
  var H=v[0];
  var cCh=findCol_(H,['канал']), cG=findCol_(H,['группа','групп']), cN=findCol_(H,['наимен','товар','sku','ску']);
  if(cCh<0) cCh=0; if(cG<0) cG=1; if(cN<0) cN=2;
  for(var i=1;i<v.length;i++){
    var nm=norm(v[i][cN]); if(!nm) continue;
    var g=String(v[i][cG]||'').trim(), ch=String(v[i][cCh]||'').trim();
    by[nm]={ group:g||'Прочее', channel:ch||'' };
    if(g) groups[g]=1; if(ch) channels[ch]=1;
  }
  return { by:by, groups:Object.keys(groups).sort(), channels:Object.keys(channels).sort() };
}

// Единый источник строк продаж: история (до cutover) + приложение (с cutover).
function saRows_(){
  var rows=[];
  // 1) История из отдельной таблицы
  try{
    if(SALES_HIST_ID && SALES_HIST_ID.indexOf('ВСТАВЬТЕ')<0){
      var hsh=SpreadsheetApp.openById(SALES_HIST_ID).getSheetByName(SALES_HIST_SHEET);
      if(hsh){
        var last=hsh.getLastRow();
        if(last>1){
          var v=hsh.getRange(2,1,last-1,7).getValues();
          for(var i=0;i<v.length;i++){
            var d=saNormDate_(v[i][0]); if(!d) continue;
            if(d.getTime()>=SALES_CUTOVER.getTime()) continue;   // после cutover берём из приложения
            rows.push({ date:d, client:String(v[i][1]||'').trim(), sku:String(v[i][2]||'').trim(),
              amount:saNum_(v[i][6]), qty:saNum_(v[i][4]) });
          }
        }
      }
    }
  }catch(e){ /* нет доступа к истории — покажем только свежие данные */ }

  // 2) Свежие данные из приложения: отгрузки − принятые возвраты (с cutover)
  readShipments_().forEach(function(s){
    var d=saNormDate_(s.shipDate); if(!d || d.getTime()<SALES_CUTOVER.getTime()) return;
    rows.push({ date:d, client:s.client, sku:s.name, amount:s.sum, qty:s.shipped });
  });
  readReturns_().forEach(function(rt){
    if(rt.status!=='Принято') return;
    var d=saNormDate_(rt.date); if(!d || d.getTime()<SALES_CUTOVER.getTime()) return;
    rows.push({ date:d, client:rt.client, sku:rt.name, amount:-Math.abs(rt.sum), qty:-Math.abs(rt.qty) });
  });
  return rows;
}

// Данные для дашборда (нормализация и агрегация на сервере).
function analyticsPin_(){ return PropertiesService.getScriptProperties().getProperty('ANALYTICS_PIN')||''; }
function setAnalyticsPin(pin){ PropertiesService.getScriptProperties().setProperty('ANALYTICS_PIN', String(pin||'')); return 'OK: пароль аналитики установлен'; }
function checkAnalyticsPin(pin){ var p=analyticsPin_(); return { ok: (!p || String(pin)===p), required: !!p }; }

function getSalesAnalytics(filter){
  filter=filter||{};
  var pin=analyticsPin_();
  if(pin && String(filter.pin||'')!==pin) throw new Error('Неверный пароль для аналитики.');
  var from=filter.from?saNormDate_(filter.from):null;
  var to=filter.to?saNormDate_(filter.to):null;
  if(to) to=new Date(to.getFullYear(),to.getMonth(),to.getDate(),23,59,59);
  var fc=filter.client?String(filter.client):'';
  var fg=filter.group?String(filter.group):'';
  var fs=filter.sku?String(filter.sku):'';
  var fch=filter.channel?String(filter.channel):'';

  var SM=readSkuMap_();
  function grp(name){ var m=SM.by[norm(name)]; return m?m.group:saGroup_(name); }
  function chan(name){ var m=SM.by[norm(name)]; return m?m.channel:''; }

  // Исключаем из анализа возвратную тару (ящики), это не продукция
  function isExcluded_(sku){ return /ящик/i.test(sku); }

  var all=saRows_().filter(function(r){ return !isExcluded_(r.sku); });
  var clientsAll={}, groupsAll={}, skuAll={};
  all.forEach(function(r){ clientsAll[r.client]=1; groupsAll[grp(r.sku)]=1; skuAll[r.sku]=1; });

  var rows=all.filter(function(r){
    if(from && r.date<from) return false;
    if(to && r.date>to) return false;
    if(fc && r.client!==fc) return false;
    if(fg && grp(r.sku)!==fg) return false;
    if(fs && r.sku!==fs) return false;
    if(fch && chan(r.sku)!==fch) return false;
    return true;
  });

  var sales=0, ret=0, monthly={}, byClient={}, retByClient={}, bySku={}, skuQty={}, byGroup={}, retBySku={}, retQtyBySku={};
  var wd=[0,0,0,0,0,0,0], wdc=[0,0,0,0,0,0,0], clientsSet={}, skuSet={};
  var skuMonth={}, groupMonth={};
  rows.forEach(function(r){
    clientsSet[r.client]=1; skuSet[r.sku]=1;
    if(r.amount>=0) sales+=r.amount; else ret+=r.amount;
    var m=saYm_(r.date); monthly[m]=monthly[m]||{sales:0,ret:0};
    if(r.amount>=0) monthly[m].sales+=r.amount; else monthly[m].ret+=r.amount;
    byClient[r.client]=(byClient[r.client]||0)+r.amount;
    if(r.amount<0) retByClient[r.client]=(retByClient[r.client]||0)+Math.abs(r.amount);
    bySku[r.sku]=(bySku[r.sku]||0)+r.amount;
    if(r.amount>=0) skuQty[r.sku]=(skuQty[r.sku]||0)+r.qty;
    var g=grp(r.sku);
    byGroup[g]=(byGroup[g]||0)+r.amount;
    // помесячно по SKU и по группе (продажи / возвраты отдельно)
    (skuMonth[r.sku]=skuMonth[r.sku]||{}); (skuMonth[r.sku][m]=skuMonth[r.sku][m]||{s:0,r:0});
    (groupMonth[g]=groupMonth[g]||{});   (groupMonth[g][m]=groupMonth[g][m]||{s:0,r:0});
    if(r.amount>=0){ skuMonth[r.sku][m].s+=r.amount; groupMonth[g][m].s+=r.amount; }
    else { skuMonth[r.sku][m].r+=Math.abs(r.amount); groupMonth[g][m].r+=Math.abs(r.amount); }
    var wi=(r.date.getDay()+6)%7; wd[wi]+=r.amount; wdc[wi]+=1;
    if(r.amount<0) retBySku[r.sku]=(retBySku[r.sku]||0)+Math.abs(r.amount);
    if(r.amount<0) retQtyBySku[r.sku]=(retQtyBySku[r.sku]||0)+Math.abs(r.qty);
  });

  var net=sales+ret;
  var months=Object.keys(monthly).sort();
  var monthlyArr=months.map(function(m){ return {ym:m,sales:Math.round(monthly[m].sales),ret:Math.round(monthly[m].ret),net:Math.round(monthly[m].sales+monthly[m].ret)}; });
  function topArr(o,n){ return Object.keys(o).map(function(k){return {name:k,val:Math.round(o[k])};}).sort(function(a,b){return b.val-a.val;}).slice(0,n||10); }
  var topClients=topArr(byClient,10);
  var topSku=Object.keys(bySku).map(function(k){return {name:k,val:Math.round(bySku[k]),qty:Math.round(skuQty[k]||0)};}).sort(function(a,b){return b.val-a.val;}).slice(0,12);
  var groups=topArr(byGroup,10);

  var allSku=Object.keys(bySku).map(function(k){return {name:k,val:bySku[k]};}).filter(function(x){return x.val>0;}).sort(function(a,b){return b.val-a.val;});
  var tot=allSku.reduce(function(s,x){return s+x.val;},0)||1, cum=0;
  var abc=allSku.map(function(x){ cum+=x.val; var cp=cum/tot*100; return {name:x.name,val:Math.round(x.val),share:Math.round(x.val/tot*1000)/10,cum:Math.round(cp*10)/10,cls:cp<=80?'A':(cp<=95?'B':'C')}; });
  var abcSum={A:{n:0,val:0},B:{n:0,val:0},C:{n:0,val:0}}; abc.forEach(function(x){ abcSum[x.cls].n++; abcSum[x.cls].val+=x.val; });

  // ABC по клиентам
  var allCli=Object.keys(byClient).map(function(k){return {name:k,val:byClient[k]};}).filter(function(x){return x.val>0;}).sort(function(a,b){return b.val-a.val;});
  var totC=allCli.reduce(function(s,x){return s+x.val;},0)||1, cumC=0;
  var clientAbc=allCli.map(function(x){ cumC+=x.val; var cp=cumC/totC*100; return {name:x.name,val:Math.round(x.val),share:Math.round(x.val/totC*1000)/10,cum:Math.round(cp*10)/10,cls:cp<=80?'A':(cp<=95?'B':'C')}; });
  var clientAbcSum={A:{n:0,val:0},B:{n:0,val:0},C:{n:0,val:0}}; clientAbc.forEach(function(x){ clientAbcSum[x.cls].n++; clientAbcSum[x.cls].val+=x.val; });

  var wn=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  var weekday=wn.map(function(nm,i){ return {day:nm,avg:Math.round(wdc[i]?wd[i]/wdc[i]:0),total:Math.round(wd[i])}; });
  var returnsTop=topArr(retBySku,10);
  var returnsTopQty=Object.keys(retQtyBySku).map(function(k){return {name:k,val:Math.round(retQtyBySku[k])};}).sort(function(a,b){return b.val-a.val;}).slice(0,10);
  var forecastNext=saForecast_(monthlyArr.map(function(m){return m.net;}),3);
  var trendPct=0;
  if(monthlyArr.length>=2){ var a2=monthlyArr[monthlyArr.length-2].net, b2=monthlyArr[monthlyArr.length-1].net; trendPct=a2?Math.round((b2-a2)/a2*1000)/10:0; }

  // ---- Динамика: последний месяц vs предыдущий ----
  var last=months[months.length-1]||null, prev=months[months.length-2]||null;
  function chg(cur,prv){ if(!prv || prv<=0) return cur>0?100:0; return Math.round((cur-prv)/prv*1000)/10; }
  var skuDyn=Object.keys(skuMonth).map(function(sku){
    var L=skuMonth[sku][last]||{s:0,r:0}, P=prev?(skuMonth[sku][prev]||{s:0,r:0}):{s:0,r:0};
    return { name:sku, salesLast:Math.round(L.s), salesPrev:Math.round(P.s), salesChg:chg(L.s,P.s),
             retLast:Math.round(L.r), retPrev:Math.round(P.r), retChg:chg(L.r,P.r) };
  });
  var skuRisers = skuDyn.filter(function(x){return x.salesLast>0;}).slice().sort(function(a,b){return b.salesChg-a.salesChg;}).slice(0,8);
  var skuFallers= skuDyn.filter(function(x){return x.salesPrev>0;}).slice().sort(function(a,b){return a.salesChg-b.salesChg;}).slice(0,8);
  var retRisers = skuDyn.filter(function(x){return x.retLast>0;}).slice().sort(function(a,b){return b.retChg-a.retChg;}).slice(0,8);

  var groupNames=Object.keys(groupMonth);
  var groupSeries=months.map(function(mm){
    var row={ ym:mm };
    groupNames.forEach(function(g){ var c=groupMonth[g][mm]||{s:0,r:0}; row[g]=Math.round(c.s-c.r); });
    return row;
  });
  var groupDyn=groupNames.map(function(g){
    var L=groupMonth[g][last]||{s:0,r:0}, P=prev?(groupMonth[g][prev]||{s:0,r:0}):{s:0,r:0};
    return { name:g, salesLast:Math.round(L.s), salesChg:chg(L.s,P.s), retLast:Math.round(L.r), retChg:chg(L.r,P.r) };
  }).sort(function(a,b){return b.salesLast-a.salesLast;});

  return {
    kpi:{ net:Math.round(net), sales:Math.round(sales), returns:Math.round(ret),
      returnPct: sales>0?Math.round(Math.abs(ret)/sales*1000)/10:0,
      clients:Object.keys(clientsSet).length, skus:Object.keys(skuSet).length,
      months:months.length, avgMonth: months.length?Math.round(net/months.length):0, rows:rows.length,
      transactions:rows.length, avgTx: rows.length?Math.round(net/rows.length):0, trendPct:trendPct },
    monthly:monthlyArr, topClients:topClients, topSku:topSku, groups:groups,
    abc:abc, abcSummary:abcSum, clientAbc:clientAbc, clientAbcSummary:clientAbcSum,
    weekday:weekday, returnsTop:returnsTop, returnsTopQty:returnsTopQty,
    forecast:{ history:monthlyArr.map(function(m){return {ym:m.ym,net:m.net};}), next:forecastNext },
    dynamics:{ lastMonth:last, prevMonth:prev, groupNames:groupNames, groupSeries:groupSeries,
               groupDyn:groupDyn, skuRisers:skuRisers, skuFallers:skuFallers, retRisers:retRisers },
    returnsByClient: topArr(retByClient,10),
    clientsList:Object.keys(clientsAll).sort(),
    groupsList:(SM.groups.length?SM.groups:Object.keys(groupsAll).sort()),
    channelsList:SM.channels,
    skuList:Object.keys(skuAll).sort()
  };
}
function saForecast_(series,k){
  var n=series.length;
  if(n<2){ var last=series[n-1]||0,r=[]; for(var i=0;i<k;i++)r.push(last); return r; }
  var sx=0,sy=0,sxx=0,sxy=0;
  for(var i=0;i<n;i++){ sx+=i; sy+=series[i]; sxx+=i*i; sxy+=i*series[i]; }
  var b=(n*sxy-sx*sy)/(n*sxx-sx*sx||1), a=(sy-b*sx)/n, out=[];
  for(var j=0;j<k;j++) out.push(Math.max(0,Math.round(a+b*(n+j))));
  return out;
}