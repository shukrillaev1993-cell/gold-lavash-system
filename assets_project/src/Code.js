// ============================================================
//  GOLD LAVASH — Учёт ОС и Инвентаря
//  Code.gs — Этап 1 + Этап 2
//  Этап 2: Логин+Пароль авторизация, перемещения, списание, QR
// ============================================================

var SS_ID = '1uEsehQE55lBcM0W2E1bIfsj4LB7MKqax47Ug-E__39M';

// Эта функция нужна чтобы Apps Script включил Sheets scope в манифест
// Запускается автоматически при деплое
function authorizationHelper() {
  SpreadsheetApp.openById(SS_ID).getName();
  DriveApp.getRootFolder().getName();
}

// ============================================================
// РОУТЕР
// ============================================================
function doGet(e) {
  if ((e.parameter.page || '') === 'label') {
    var labelOut = HtmlService.createHtmlOutputFromFile('Label');
    labelOut.setTitle('Nakleiyki OS - GOLD LAVASH');
    labelOut.addMetaTag('viewport', 'width=device-width, initial-scale=1');
    labelOut.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    labelOut.setSandboxMode(HtmlService.SandboxMode.NATIVE);
    return labelOut;
  }
  // API endpoint — вернуть данные ОС как JSON
  if (page === 'data') {
    var dataInv = '';
    try {
      var qs2 = e.queryString || '';
      var parts2 = qs2.split('&');
      for (var pi2 = 0; pi2 < parts2.length; pi2++) {
        var eq2 = parts2[pi2].indexOf('=');
        if (eq2 > -1 && parts2[pi2].substring(0, eq2) === 'inv') {
          dataInv = decodeURIComponent(parts2[pi2].substring(eq2 + 1));
          break;
        }
      }
    } catch(ex2) {}
    var result = {inv: dataInv, os: null, amort: [], invs: []};
    if (dataInv) {
      result.os = getOSByInvPublic(dataInv);
      var am2 = getAmortHistoryPublic(dataInv);
      result.amort = (am2 && am2.data) ? am2.data : [];
      result.invs = getOpenInventoriesPublic() || [];
    }
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
  // Мобильная страница загрузки фото
  if ((e.parameter.page || '') === 'photo') {
    var photoOut = HtmlService.createHtmlOutputFromFile('Photo');
    photoOut.setTitle('Фото ОС - GOLD LAVASH');
    photoOut.addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0');
    photoOut.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    return photoOut;
  }
  var page = e.parameter.page || 'main';
  if (page === 'card') {
    // Получить инв. номер — Apps Script иногда теряет спецсимволы
    var inv = '';
    try {
      // Способ 1: стандартный
      inv = e.parameter.inv || '';
      // Способ 2: из queryString с ручным декодированием
      if (!inv && e.queryString) {
        var qs = e.queryString;
        var invIdx = qs.indexOf('inv=');
        if (invIdx !== -1) {
          var invRaw = qs.substring(invIdx + 4).split('&')[0];
          inv = decodeURIComponent(invRaw.replace(/\+/g, ' '));
        }
      }
      // Способ 3: parameters (множественное число)
      if (!inv && e.parameters && e.parameters.inv) {
        inv = e.parameters.inv[0] || '';
      }
      // Декодировать ~N~ обратно в №
      inv = inv.replace(/~N~/g, '№');
      Logger.log('inv param: [' + inv + '] queryString: ' + (e.queryString||''));
    } catch(ex) {
      Logger.log('inv error: ' + ex);
      inv = '';
    }
    var appData = {os: null, inv: inv, amort: [], invs: []};
    if (inv) {
      try {
        appData.os = getOSByInvPublic(inv);
        var amort = getAmortHistoryPublic(inv);
        appData.amort = (amort && amort.data) ? amort.data : [];
        appData.invs = getOpenInventoriesPublic() || [];
      } catch(err) {
        Logger.log('doGet error: ' + err.message);
      }
    }
    // Передать данные через инъекцию и отключить sandbox
    var cardHtml = HtmlService.createHtmlOutputFromFile('Card').getContent();
    cardHtml = cardHtml.replace('var _APP_DATA=null;//@@INJECT@@', 'var _APP_DATA=' + JSON.stringify(appData) + ';');
    Logger.log('marker found: ' + (cardHtml.indexOf('@@INJECT@@') === -1));
    var out = HtmlService.createHtmlOutput(cardHtml);
    out.setTitle('Kartochka OS');
    out.addMetaTag('viewport', 'width=device-width, initial-scale=1');
    out.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    out.setSandboxMode(HtmlService.SandboxMode.NATIVE);
    return out;
  }
  var mainPage = HtmlService.createTemplateFromFile('Index').evaluate();
  mainPage.setTitle('Uchet OS - GOLD LAVASH');
  mainPage.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  mainPage.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return mainPage;
}
function include(f) { return HtmlService.createHtmlOutputFromFile(f).getContent(); }

// ============================================================
// ХЕЛПЕРЫ
// ============================================================
function getSheet(name) { return SpreadsheetApp.openById(SS_ID).getSheetByName(name); }

function ensureSheets() {
  const ss = SpreadsheetApp.openById(SS_ID);
  const needed = [
    { name: 'База ОС', headers: ['№','Инвентарный номер','Наименование','ОС/Инвентар','Ответственный лицо','Размер','Рисунок','Вид','Категория','Дата поступление','Полезный срок службы','Дата вывода средств','Рыночный стоимость','Кол-во','Амортизация %','Адрес','Состояния','Подразделения','Ссылка на карточку','QR-код','Фото URL','Примечание'] },
    { name: 'Амортизация', headers: ['Инв. номер','Наименование','Год','Месяц','Стоимость нач.','Амортизация за месяц','Накопл. амортизация','Остаточная стоимость'] },
    { name: 'Перемещения', headers: ['Дата','Инв. номер','Наименование','Откуда','Куда','Ответств. лицо','Основание','Автор','Номер акта'] },
    { name: 'Списание', headers: ['Дата','Инв. номер','Наименование','Подразделение','Причина','Остаточная стоимость','Автор','Номер акта'] },
    { name: 'Пользователи', headers: ['Логин','Пароль','ФИО','Подразделение','Роль','Активен','Последний вход'] },
  ];
  needed.forEach(({ name, headers }) => {
    let sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
      sh.appendRow(headers);
      sh.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#1a3a5c').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
  });
  // Создать дефолтных пользователей если лист пустой
  const userSh = ss.getSheetByName('Пользователи');
  if (userSh && userSh.getLastRow() < 2) {
    const defaults = [
      ['admin',       'admin123',  'Администратор',        'Все',          'admin', true,  ''],
      ['proizvod',    'prod1111',  'Цех Производство',     'Производство', 'user',  true,  ''],
      ['zavod',       'sez2222',   'Завод СЭЗ',            'Завод СЭЗ',    'user',  true,  ''],
      ['otp_samar',   'otp3333',   'ОТП Самарканд',        'ОТП Самарканд','user',  true,  ''],
      ['otp_tosh',    'otp4444',   'ОТП Тошкент',          'ОТП Тошкент',  'user',  true,  ''],
      ['ofis',        'ofis5555',  'Офис Администрация',   'Офис Ад',      'user',  true,  ''],
    ];
    defaults.forEach(r => userSh.appendRow(r));
    userSh.getRange(2,2,defaults.length,1).setNumberFormat('@'); // пароль как текст
  }
}

function sheetToObjects(sh) {
  if (!sh || sh.getLastRow() < 2) return [];
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1)
    .filter(r => r.some(cell => cell !== '' && cell !== null)) // пропустить пустые строки
    .map(r => {
      const obj = {};
      headers.forEach((h,i) => {
        if (!h) return; // пропустить колонки без заголовка
        let val = r[i];
        if (val instanceof Date) val = Utilities.formatDate(val, 'Asia/Tashkent', 'yyyy-MM-dd');
        else if (val === null) val = '';
        // Если значение — объект (IMAGE и т.д.) — пропустить
        else if (typeof val === 'object' && val !== null) val = '';
        obj[h] = val;
      });
      return obj;
    });
}

// ============================================================
// АВТОРИЗАЦИЯ — ЛОГИН + ПАРОЛЬ
// ============================================================
function loginByCredentials(login, password) {
  try {
    ensureSheets();
    const sh = getSheet('Пользователи');
    const users = sheetToObjects(sh);
    const user = users.find(u =>
      String(u['Логин']).trim().toLowerCase() === String(login).trim().toLowerCase()
    );
    if (!user) return { ok: false, error: 'Пользователь не найден' };
    if (user['Активен'] === false || String(user['Активен']).toLowerCase() === 'false') return { ok: false, error: 'Учётная запись отключена' };
    if (String(user['Пароль']).trim() !== String(password).trim()) return { ok: false, error: 'Неверный пароль' };

    // Записать время последнего входа
    const data = sh.getDataRange().getValues();
    const headers = data[0];
    const loginCol = headers.indexOf('Логин');
    const lastCol  = headers.indexOf('Последний вход');
    if (lastCol !== -1) {
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][loginCol]).trim().toLowerCase() === String(login).trim().toLowerCase()) {
          sh.getRange(i+1, lastCol+1).setValue(Utilities.formatDate(new Date(),'Asia/Tashkent','yyyy-MM-dd HH:mm'));
          break;
        }
      }
    }

    const token = Utilities.getUuid();
    CacheService.getScriptCache().put('session_' + token, JSON.stringify({
      login: user['Логин'],
      fio:   user['ФИО'],
      dept:  user['Подразделение'],
      role:  user['Роль'],
    }), 21600); // 6 часов (максимум CacheService)
    return { ok: true, token, login: user['Логин'], fio: user['ФИО'], dept: user['Подразделение'], role: user['Роль'] };
  } catch(e) { return { ok: false, error: e.message }; }
}

// Оставляем loginByPin как обёртку для обратной совместимости — убираем
function checkSession(token) {
  if (!token) return null;
  const cache = CacheService.getScriptCache();
  const data = cache.get('session_' + token);
  if (!data) return null;
  // Продлить сессию при каждом обращении
  cache.put('session_' + token, data, 21600);
  return JSON.parse(data);
}

function logout(token) {
  if (token) CacheService.getScriptCache().remove('session_' + token);
}

// ---------- Управление пользователями (только admin) ----------
function getAllUsers(token) {
  const sess = checkSession(token);
  if (!sess || sess.role !== 'admin') return { ok: false, error: 'Нет прав' };
  const sh = getSheet('Пользователи');
  const users = sheetToObjects(sh).map(u => ({ ...u, Пароль: '••••••' })); // не отдавать пароль
  return { ok: true, users };
}

function createUser(token, data) {
  const sess = checkSession(token);
  if (!sess || sess.role !== 'admin') return { ok: false, error: 'Нет прав' };
  if (!data.login || !data.password || !data.dept) return { ok: false, error: 'Заполните все поля' };
  const sh = getSheet('Пользователи');
  const existing = sheetToObjects(sh);
  if (existing.find(u => String(u['Логин']).toLowerCase() === String(data.login).toLowerCase()))
    return { ok: false, error: 'Логин уже занят' };
  sh.appendRow([data.login, data.password, data.fio||data.login, data.dept, data.role||'user', true, '']);
  return { ok: true };
}

function updateUserPassword(token, login, newPassword) {
  const sess = checkSession(token);
  if (!sess || sess.role !== 'admin') return { ok: false, error: 'Нет прав' };
  if (!newPassword || newPassword.length < 4) return { ok: false, error: 'Пароль минимум 4 символа' };
  const sh = getSheet('Пользователи');
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const loginCol = headers.indexOf('Логин');
  const passCol  = headers.indexOf('Пароль');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][loginCol]).toLowerCase() === String(login).toLowerCase()) {
      sh.getRange(i+1, passCol+1).setValue(newPassword);
      return { ok: true };
    }
  }
  return { ok: false, error: 'Пользователь не найден' };
}

function toggleUserActive(token, login, active) {
  const sess = checkSession(token);
  if (!sess || sess.role !== 'admin') return { ok: false, error: 'Нет прав' };
  const sh = getSheet('Пользователи');
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const loginCol  = headers.indexOf('Логин');
  const activeCol = headers.indexOf('Активен');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][loginCol]).toLowerCase() === String(login).toLowerCase()) {
      sh.getRange(i+1, activeCol+1).setValue(active);
      return { ok: true };
    }
  }
  return { ok: false, error: 'Не найден' };
}

// Смена пароля самим пользователем
function changeOwnPassword(token, oldPassword, newPassword) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  if (!newPassword || newPassword.length < 4) return { ok: false, error: 'Новый пароль минимум 4 символа' };
  const sh = getSheet('Пользователи');
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const loginCol = headers.indexOf('Логин');
  const passCol  = headers.indexOf('Пароль');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][loginCol]).toLowerCase() === sess.login.toLowerCase()) {
      if (String(data[i][passCol]).trim() !== String(oldPassword).trim())
        return { ok: false, error: 'Текущий пароль неверен' };
      sh.getRange(i+1, passCol+1).setValue(newPassword);
      return { ok: true };
    }
  }
  return { ok: false, error: 'Пользователь не найден' };
}

// ============================================================
// РЕЕСТР ОС
// ============================================================
function getAllOS(token) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  const sh = getSheet('База ОС');
  if (!sh) return { ok: true, data: [] };
  const all = sheetToObjects(sh).filter(r => r['Инвентарный номер'] !== '');
  // Фильтр по подразделению для user-роли
  const filtered = sess.role === 'admin' ? all : all.filter(o => o['Подразделения'] === sess.dept);
  return { ok: true, data: filtered, role: sess.role, dept: sess.dept };
}

function getOSByInv(invNum, token) {
  const result = getAllOS(token);
  if (!result.ok) return null;
  return result.data.find(o => o['Инвентарный номер'] === invNum) || null;
}

// Публичная версия без токена — для Card.html (открывается по QR без логина)
function getOSByInvPublic(invNum) {
  try {
    var sh = getSheet('База ОС');
    if (!sh) { Logger.log('Лист не найден'); return null; }
    var data = sh.getDataRange().getValues();
    var headers = data[0];
    var invCol = headers.indexOf('Инвентарный номер');
    if (invCol === -1) { Logger.log('Колонка не найдена'); return null; }
    var searchInv = String(invNum).trim();
    // Логировать примеры
    var sample = [];
    for (var s = 1; s < Math.min(5, data.length); s++) {
      if (data[s][invCol]) sample.push(String(data[s][invCol]).trim());
    }
    Logger.log('Ищем: [' + searchInv + ']');
    Logger.log('Примеры в таблице: ' + JSON.stringify(sample));
    for (var i = 1; i < data.length; i++) {
      var rowInv = String(data[i][invCol] || '').trim();
      if (rowInv === searchInv) {
        var obj = {};
        headers.forEach(function(h, j) {
          if (!h) return;
          var val = data[i][j];
          if (val instanceof Date) val = Utilities.formatDate(val, 'Asia/Tashkent', 'yyyy-MM-dd');
          else if (val === null || (typeof val === 'object' && val !== null)) val = '';
          obj[h] = val;
        });
        // Найти фото из безымянной колонки
        for (var j = 0; j < headers.length; j++) {
          var v = String(data[i][j] || '');
          if (v.startsWith('https://drive.google.com') && !obj['Фото URL']) {
            obj['Фото URL'] = v;
          }
        }
        Logger.log('НАЙДЕН: ' + obj['Наименование']);
        return obj;
      }
    }
    Logger.log('НЕ НАЙДЕН: [' + searchInv + ']');
    return null;
  } catch(e) {
    Logger.log('getOSByInvPublic error: ' + e.message);
    return null;
  }
}

// Публичная история амортизации без токена — для Card.html
function getAmortHistoryPublic(invNum) {
  try {
    const sh = getSheet('Амортизация');
    if (!sh) return { ok: true, data: [] };
    const rows = sheetToObjects(sh).filter(r => r['Инв. номер'] === invNum);
    return { ok: true, data: rows };
  } catch(e) { return { ok: true, data: [] }; }
}

function getSummary(token) {
  const result = getAllOS(token);
  if (!result.ok) return result;
  const all = result.data;
  const byDept = {};
  all.forEach(function(o) { var d = o['Подразделения']||'—'; byDept[d] = (byDept[d]||0)+1; });
  const totalCost = all.reduce((s,o) => s + (parseFloat(o['Рыночный стоимость'])||0), 0);
  return {
    ok: true,
    total: all.length,
    os: all.filter(o => o['ОС/Инвентар']==='ОС').length,
    inv: all.filter(o => o['ОС/Инвентар']==='ИНВ').length,
    active: all.filter(o => o['Состояния']==='Балансда').length,
    byDept, totalCost,
    role: result.role, dept: result.dept
  };
}

// ============================================================
// ПРИХОД ОС
// ============================================================
function getNextInvNumber(type) {
  const sh = getSheet('База ОС');
  if (!sh) return type==='ОС' ? 'ИНВН00001' : 'ИНВ№ 00001';
  const data = sh.getDataRange().getValues();
  let maxNum = 0;
  data.slice(1).forEach(r => {
    const match = String(r[1]||'').match(/(\d+)$/);
    if (match) { var n=parseInt(match[1]); if(n>maxNum) maxNum=n; }
  });
  const padded = String(maxNum+1).padStart(5,'0');
  return type==='ОС' ? `ИНВН${padded}` : `ИНВ№ ${padded}`;
}

function addOS(data, token) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  // user может добавлять только в своё подразделение
  if (sess.role !== 'admin' && data.department !== sess.dept) return { ok: false, error: 'Нет прав добавлять в это подразделение' };
  try {
    ensureSheets();
    const sh = getSheet('База ОС');
    const nextNum = sh.getLastRow();
    const invNum = getNextInvNumber(data.type);
    const appUrl = ScriptApp.getService().getUrl();
    const cardUrl = appUrl + '?page=card&inv=' + encodeURIComponent(invNum);
    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(cardUrl);
    sh.appendRow([
      nextNum, invNum, data.name, data.type, data.responsible,
      data.size||'', data.photoUrl?true:false, data.vid, data.category||'',
      data.dateIn, data.lifespan||'', '', data.cost, 1,
      data.amortPercent||0.20, data.address||'', 'Балансда', data.department,
      cardUrl, qrUrl, data.photoUrl||'', data.note||''
    ]);
    if (data.type==='ОС' && data.cost && data.amortPercent) {
      _addAmortRow(invNum, data.name, data.dateIn, parseFloat(data.cost), parseFloat(data.amortPercent));
    }
    return { ok: true, invNum, cardUrl, qrUrl };
  } catch(e) { return { ok: false, error: e.message }; }
}

// ============================================================
// АМОРТИЗАЦИЯ
// ============================================================
function _addAmortRow(invNum, name, dateIn, cost, amortPct) {
  const sh = getSheet('Амортизация');
  if (!sh) return;
  const d = new Date(dateIn);
  const monthly = cost * amortPct / 12;
  sh.appendRow([invNum, name, d.getFullYear(), d.getMonth()+1,
    cost, monthly.toFixed(2), monthly.toFixed(2), (cost-monthly).toFixed(2)]);
}

function getAmortHistory(invNum, token) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  const sh = getSheet('Амортизация');
  if (!sh) return { ok: true, data: [] };
  const rows = sheetToObjects(sh).filter(r => r['Инв. номер'] === invNum);
  return { ok: true, data: rows };
}

function getAllAmort(token) {
  const result = getAllOS(token);
  if (!result.ok) return result;
  const depts = result.role === 'admin' ? null : [result.dept];
  const sh = getSheet('Амортизация');
  if (!sh) return { ok: true, data: [] };
  let rows = sheetToObjects(sh);
  if (depts) {
    // Фильтруем по инв. номерам разрешённого подразделения
    const allowed = new Set(result.data.map(o => o['Инвентарный номер']));
    rows = rows.filter(r => allowed.has(r['Инв. номер']));
  }
  return { ok: true, data: rows.slice(-200) }; // последние 200
}

function accrueMonthlyDepreciation(token) {
  const sess = checkSession(token);
  if (!sess || sess.role !== 'admin') return { ok: false, error: 'Только администратор' };
  const all = getAllOS(token);
  if (!all.ok) return all;
  const sh = getSheet('Амортизация');
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth()+1;
  let count = 0;
  all.data.forEach(os => {
    if (os['ОС/Инвентар']!=='ОС' || os['Состояния']!=='Балансда') return;
    const cost = parseFloat(os['Рыночный стоимость'])||0;
    const pct  = parseFloat(os['Амортизация %'])||0.20;
    if (!cost) return;
    const history = sheetToObjects(sh).filter(r => r['Инв. номер']===os['Инвентарный номер']);
    if (history.find(h => h['Год']==year && h['Месяц']==month)) return;
    const totalAccum = history.reduce((s,h)=>s+parseFloat(h['Амортизация за месяц']||0),0);
    if (totalAccum >= cost) return;
    const monthly = Math.min(cost*pct/12, cost-totalAccum);
    const newAccum = totalAccum+monthly;
    sh.appendRow([os['Инвентарный номер'],os['Наименование'],year,month,
      cost,monthly.toFixed(2),newAccum.toFixed(2),(cost-newAccum).toFixed(2)]);
    count++;
  });
  return { ok: true, count };
}

// ============================================================
// ПЕРЕМЕЩЕНИЯ
// ============================================================
function getActNumber(sheetName, prefix) {
  const sh = getSheet(sheetName);
  const count = sh ? Math.max(sh.getLastRow()-1, 0) : 0;
  return prefix + String(count+1).padStart(4,'0');
}

function addMovement(data, token) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  // user может инициировать только из своего подразделения
  if (sess.role !== 'admin' && data.from !== sess.dept) return { ok: false, error: 'Можно перемещать только из своего подразделения' };
  try {
    ensureSheets();
    const sh = getSheet('Перемещения');
    const actNum = getActNumber('Перемещения', 'АКТ-П-');
    const now = Utilities.formatDate(new Date(),'Asia/Tashkent','yyyy-MM-dd');
    sh.appendRow([now, data.invNum, data.name, data.from, data.to,
      data.responsible, data.reason||'', sess.dept, actNum]);
    // Обновить подразделение и ответственное лицо в базе ОС
    updateOSFieldInternal(data.invNum, 'Подразделения', data.to);
    if (data.responsible) updateOSFieldInternal(data.invNum, 'Ответственный лицо', data.responsible);
    return { ok: true, actNum };
  } catch(e) { return { ok: false, error: e.message }; }
}

function getMovements(token, invNum) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  const sh = getSheet('Перемещения');
  if (!sh) return { ok: true, data: [] };
  let rows = sheetToObjects(sh);
  if (invNum) rows = rows.filter(r => r['Инв. номер']===invNum);
  else if (sess.role !== 'admin') rows = rows.filter(r => r['Откуда']===sess.dept||r['Куда']===sess.dept);
  return { ok: true, data: rows.reverse() };
}

// ============================================================
// СПИСАНИЕ
// ============================================================
function writeOffOS(data, token) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  // Проверить что ОС принадлежит подразделению пользователя
  const os = getOSByInv(data.invNum, token);
  if (!os) return { ok: false, error: 'ОС не найден или нет доступа' };
  if (sess.role !== 'admin' && os['Подразделения'] !== sess.dept) return { ok: false, error: 'Нет прав' };
  try {
    ensureSheets();
    const sh = getSheet('Списание');
    const actNum = getActNumber('Списание', 'АКТ-С-');
    const now = Utilities.formatDate(new Date(),'Asia/Tashkent','yyyy-MM-dd');
    // Посчитать остаточную стоимость
    const amortSh = getSheet('Амортизация');
    const history = amortSh ? sheetToObjects(amortSh).filter(r=>r['Инв. номер']===data.invNum) : [];
    const lastH = history[history.length-1];
    const residual = lastH ? parseFloat(lastH['Остаточная стоимость'])||0 : parseFloat(os['Рыночный стоимость'])||0;
    sh.appendRow([now, data.invNum, os['Наименование'], os['Подразделения'],
      data.reason, residual.toFixed(2), sess.dept, actNum]);
    // Сменить статус в базе ОС
    updateOSFieldInternal(data.invNum, 'Состояния', 'Списан');
    updateOSFieldInternal(data.invNum, 'Дата вывода средств', now);
    return { ok: true, actNum, residual };
  } catch(e) { return { ok: false, error: e.message }; }
}

function getWriteOffs(token) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  const sh = getSheet('Списание');
  if (!sh) return { ok: true, data: [] };
  let rows = sheetToObjects(sh);
  if (sess.role !== 'admin') rows = rows.filter(r => r['Подразделение']===sess.dept);
  return { ok: true, data: rows.reverse() };
}

// ============================================================
// МАССОВАЯ ГЕНЕРАЦИЯ QR ДЛЯ СТАРЫХ ОС
// ============================================================
function generateQRForExisting(token, batchSize) {
  const sess = checkSession(token);
  if (!sess || sess.role !== 'admin') return { ok: false, error: 'Только администратор' };
  const sh = getSheet('База ОС');
  if (!sh) return { ok: false, error: 'Лист не найден' };
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const invCol  = headers.indexOf('Инвентарный номер');
  const qrCol   = headers.indexOf('QR-код');
  const cardCol = headers.indexOf('Ссылка на карточку');
  if (qrCol === -1 || invCol === -1) return { ok: false, error: 'Колонки не найдены' };
  const appUrl = ScriptApp.getService().getUrl();
  const limit = parseInt(batchSize)||50;
  let updated = 0;
  for (let i = 1; i < data.length && updated < limit; i++) {
    const inv = String(data[i][invCol]||'').trim();
    const existingQR = String(data[i][qrCol]||'').trim();
    if (!inv) continue;
    if (existingQR && existingQR.startsWith('http')) continue; // уже есть
    // Заменяем № на ~N~ для безопасной передачи через URL
    var safeInv = inv.replace(/№/g, '~N~');
    const cardUrl = appUrl + '?page=card&inv=' + encodeURIComponent(safeInv);
    const qrUrl   = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(cardUrl);
    if (cardCol !== -1) sh.getRange(i+1, cardCol+1).setValue(cardUrl);
    sh.getRange(i+1, qrCol+1).setValue(qrUrl);
    updated++;
  }
  // Сколько ещё без QR
  const remaining = data.slice(1).filter(r => {
    const inv = String(r[invCol]||'').trim();
    const qr  = String(r[qrCol]||'').trim();
    return inv && (!qr || !qr.startsWith('http'));
  }).length;
  return { ok: true, updated, remaining };
}

// ============================================================
// ВНУТРЕННИЙ АПДЕЙТ
// ============================================================
function updateOSFieldInternal(invNum, field, value) {
  const sh = getSheet('База ОС');
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const colIdx = headers.indexOf(field);
  if (colIdx === -1) return;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(invNum)) {
      sh.getRange(i+1, colIdx+1).setValue(value);
      return;
    }
  }
}

function updateOSField(invNum, field, value, token) {
  const sess = checkSession(token);
  if (!sess || sess.role !== 'admin') return { ok: false, error: 'Нет прав' };
  updateOSFieldInternal(invNum, field, value);
  return { ok: true };
}

// ============================================================
// СПРАВОЧНИКИ И СТРУКТУРА ПОДРАЗДЕЛЕНИЙ
// ============================================================

// Инициализация листа подразделений
function ensureDeptSheet() {
  const ss = SpreadsheetApp.openById(SS_ID);
  let sh = ss.getSheetByName('Подразделения');
  if (!sh) {
    sh = ss.insertSheet('Подразделения');
    sh.appendRow(['Подразделение','Подподразделение','Описание','Активно']);
    sh.getRange(1,1,1,4).setFontWeight('bold').setBackground('#1a3a5c').setFontColor('#fff');
    sh.setFrozenRows(1);
    // Заполнить дефолтную структуру
    const defaults = [
      ['Производство','Линия 1','Производственная линия 1',true],
      ['Производство','Линия 2','Производственная линия 2',true],
      ['Производство','Линия 3','Производственная линия 3',true],
      ['Производство','Тандыр','Тандырный цех',true],
      ['Производство','Склад','Склад сырья и готовой продукции',true],
      ['Завод СЭЗ','Цех СЭЗ','Основной цех',true],
      ['Завод СЭЗ','Склад СЭЗ','Склад завода',true],
      ['ОТП Самарканд','Магазин 1','Торговая точка 1',true],
      ['ОТП Самарканд','Магазин 2','Торговая точка 2',true],
      ['ОТП Тошкент','Магазин Т1','Торговая точка Тошкент 1',true],
      ['Офис Ад','Бухгалтерия','Бухгалтерский отдел',true],
      ['Офис Ад','HR','Отдел кадров',true],
      ['Офис Ад','IT','Информационные технологии',true],
    ];
    defaults.forEach(r => sh.appendRow(r));
  }
  return sh;
}

// Получить структуру подразделений
function getDepartmentStructure(token) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  ensureDeptSheet();
  const sh = SpreadsheetApp.openById(SS_ID).getSheetByName('Подразделения');
  const rows = sheetToObjects(sh).filter(r => r['Активно'] !== false && String(r['Активно']).toLowerCase() !== 'false');
  // Сгруппировать по подразделению
  const structure = {};
  rows.forEach(r => {
    const dept = r['Подразделение'];
    if (!structure[dept]) structure[dept] = [];
    if (r['Подподразделение']) structure[dept].push({ name: r['Подподразделение'], desc: r['Описание']||'' });
  });
  return { ok: true, structure, raw: rows };
}

// Добавить подразделение или подподразделение
function addDepartment(token, dept, subdept, desc) {
  const sess = checkSession(token);
  if (!sess || sess.role !== 'admin') return { ok: false, error: 'Нет прав' };
  ensureDeptSheet();
  const sh = SpreadsheetApp.openById(SS_ID).getSheetByName('Подразделения');
  sh.appendRow([dept, subdept||'', desc||'', true]);
  return { ok: true };
}

// Удалить/деактивировать подподразделение
function deactivateDepartment(token, dept, subdept) {
  const sess = checkSession(token);
  if (!sess || sess.role !== 'admin') return { ok: false, error: 'Нет прав' };
  const sh = SpreadsheetApp.openById(SS_ID).getSheetByName('Подразделения');
  if (!sh) return { ok: false, error: 'Лист не найден' };
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const dCol = headers.indexOf('Подразделение');
  const sCol = headers.indexOf('Подподразделение');
  const aCol = headers.indexOf('Активно');
  for (let i = 1; i < data.length; i++) {
    if (data[i][dCol] === dept && data[i][sCol] === subdept) {
      sh.getRange(i+1, aCol+1).setValue(false);
      return { ok: true };
    }
  }
  return { ok: false, error: 'Не найдено' };
}

function getDirectories() {
  return {
    vidy: ['Ускуналар','Хоз. инвентар','Офис мебеллари','Инструмент','Падносы',
      'Совутиш жихоз ва иншоотлари','Хисоблаш техникалари','Авто машина',
      'Бино ва иншоатлар','Кузатув Мосламси','Комуникация линиялари'],
    departments: ['Производство','Офис Ад','ОТП Самарканд','ОТП Тошкент','Завод СЭЗ'],
    responsible: ['Абдувахидов Шухрат','Механик','Шерзод Толиьовыч','Шукриллаев А.',
      'Эшонкулов Ф.','Касимов Ф.','Халиков Улмас','Азизов Мансурхон',
      'Сатторов Жасур','Мамиров Хуршед','Хаитбаев Ш.','Файзуллаев Ш.'],
    reasons: ['Физический износ','Моральный износ','Авария/поломка','Кража/потеря',
      'Продажа','Передача другой организации','Стихийное бедствие','Иное'],
    states: ['Балансда','Захирада','Списан'],
    types: ['ОС','ИНВ']
  };
}

// ============================================================
// ЭТАП 4 — УВЕДОМЛЕНИЯ, ОТЧЁТЫ, ДАШБОРД
// ============================================================

// --- Уведомления ---
function getAlerts(token) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  const result = getAllOS(token);
  if (!result.ok) return result;
  const all = result.data;
  const now = new Date();
  const alerts = [];

  all.forEach(os => {
    if (os['Состояния'] === 'Списан') return;
    const inv = os['Инвентарный номер'];
    const name = os['Наименование'];
    const dept = os['Подразделения'];
    const cost = parseFloat(os['Рыночный стоимость']) || 0;
    const pct  = parseFloat(os['Амортизация %']) || 0;
    const life = parseFloat(os['Полезный срок службы']) || 0;
    const dateIn = os['Дата поступление'] ? new Date(os['Дата поступление']) : null;

    // 1. Полностью амортизированные — проверяем по листу Амортизация
    if (os['ОС/Инвентар'] === 'ОС' && cost > 0) {
      const amortSh = getSheet('Амортизация');
      if (amortSh) {
        const hist = sheetToObjects(amortSh).filter(r => r['Инв. номер'] === inv);
        if (hist.length) {
          const lastH = hist[hist.length - 1];
          const residual = parseFloat(lastH['Остаточная стоимость']) || 0;
          if (residual <= 0 || residual < cost * 0.01) {
            alerts.push({ type: 'fully_amort', level: 'warning', inv, name, dept, msg: 'Полностью амортизирован (остаток: ' + residual.toFixed(0) + ' сум)' });
          }
        }
      }
    }

    // 2. Истёкший срок службы
    if (life > 0 && dateIn) {
      const expiryDate = new Date(dateIn);
      expiryDate.setFullYear(expiryDate.getFullYear() + life);
      if (expiryDate < now) {
        const yearsOver = Math.floor((now - expiryDate) / (365.25 * 24 * 3600 * 1000));
        alerts.push({ type: 'expired', level: 'danger', inv, name, dept, msg: 'Срок службы истёк ' + (yearsOver > 0 ? yearsOver + ' лет назад' : 'в этом году'), expiry: Utilities.formatDate(expiryDate, 'Asia/Tashkent', 'dd.MM.yyyy') });
      } else {
        // Предупреждение — истечёт в течение года
        const monthsLeft = Math.floor((expiryDate - now) / (30.5 * 24 * 3600 * 1000));
        if (monthsLeft <= 12) {
          alerts.push({ type: 'expiring_soon', level: 'info', inv, name, dept, msg: 'Срок службы истекает через ' + monthsLeft + ' мес.', expiry: Utilities.formatDate(expiryDate, 'Asia/Tashkent', 'dd.MM.yyyy') });
        }
      }
    }
  });

  return { ok: true, alerts, counts: {
    danger:  alerts.filter(a => a.level === 'danger').length,
    warning: alerts.filter(a => a.level === 'warning').length,
    info:    alerts.filter(a => a.level === 'info').length,
  }};
}

// --- Данные для графиков дашборда ---
function getDashboardCharts(token) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  const result = getAllOS(token);
  if (!result.ok) return result;
  const all = result.data.filter(o => o['Состояния'] !== 'Списан');

  // 1. Стоимость по подразделениям
  const byCost = {};
  all.forEach(o => {
    const d = o['Подразделения'] || '—';
    byCost[d] = (byCost[d] || 0) + (parseFloat(o['Рыночный стоимость']) || 0);
  });

  // 2. Стоимость по видам
  const byVid = {};
  all.forEach(o => {
    const v = o['Вид'] || '—';
    byVid[v] = (byVid[v] || 0) + (parseFloat(o['Рыночный стоимость']) || 0);
  });

  // 3. Поступления по годам (кол-во объектов)
  const byYear = {};
  all.forEach(o => {
    const d = o['Дата поступление'];
    if (!d) return;
    const yr = String(d).substring(0, 4);
    if (!yr || isNaN(parseInt(yr))) return;
    byYear[yr] = (byYear[yr] || 0) + 1;
  });

  // 4. Амортизация — накоплено vs остаток
  const amortSh = getSheet('Амортизация');
  let totalOriginal = 0, totalResidual = 0, totalAccum = 0;
  if (amortSh) {
    const amortRows = sheetToObjects(amortSh);
    // Для каждого ОС берём только последнюю запись
    const lastByInv = {};
    amortRows.forEach(function(r) { lastByInv[r['Инв. номер']] = r; });
    Object.values(lastByInv).forEach(r => {
      totalOriginal += parseFloat(r['Стоимость нач.']) || 0;
      totalAccum    += parseFloat(r['Накопл. амортизация']) || 0;
      totalResidual += parseFloat(r['Остаточная стоимость']) || 0;
    });
  }

  // 5. По типу ОС/ИНВ — кол-во и стоимость
  const osCount  = all.filter(o => o['ОС/Инвентар'] === 'ОС').length;
  const invCount = all.filter(o => o['ОС/Инвентар'] === 'ИНВ').length;
  const osCost   = all.filter(o => o['ОС/Инвентар'] === 'ОС').reduce((s,o) => s+(parseFloat(o['Рыночный стоимость'])||0), 0);

  return {
    ok: true,
    byCost: Object.entries(byCost).sort((a,b) => b[1]-a[1]),
    byVid:  Object.entries(byVid).sort((a,b) => b[1]-a[1]).slice(0, 8),
    byYear: Object.entries(byYear).sort((a,b) => a[0].localeCompare(b[0])),
    amort: { totalOriginal, totalAccum, totalResidual },
    types: { osCount, invCount, osCost },
  };
}

// --- Отчёты ---
// Сводный отчёт по подразделению
function getReportByDept(token, dept) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  const result = getAllOS(token);
  if (!result.ok) return result;
  const all = dept ? result.data.filter(o => o['Подразделения'] === dept) : result.data;

  const amortSh = getSheet('Амортизация');
  const lastAmort = {};
  if (amortSh) {
    sheetToObjects(amortSh).forEach(function(r) { lastAmort[r['Инв. номер']] = r; });
  }

  const enriched = all.map(os => {
    const am = lastAmort[os['Инвентарный номер']];
    return {
      ...os,
      накоплено: am ? parseFloat(am['Накопл. амортизация'])||0 : 0,
      остаток:   am ? parseFloat(am['Остаточная стоимость'])||0 : parseFloat(os['Рыночный стоимость'])||0,
    };
  });

  const totalCost     = enriched.reduce((s,o) => s+(parseFloat(o['Рыночный стоимость'])||0), 0);
  const totalAccum    = enriched.reduce((s,o) => s+o.накоплено, 0);
  const totalResidual = enriched.reduce((s,o) => s+o.остаток, 0);

  return { ok: true, data: enriched, dept: dept||'Все', totalCost, totalAccum, totalResidual, role: sess.role };
}

// Отчёт по амортизации за период
function getAmortReport(token, yearFrom, yearTo) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  const amortSh = getSheet('Амортизация');
  if (!amortSh) return { ok: true, data: [] };
  let rows = sheetToObjects(amortSh);
  // Фильтр по подразделению для user
  if (sess.role !== 'admin') {
    const osResult = getAllOS(token);
    const allowed = new Set(osResult.ok ? osResult.data.map(o => o['Инвентарный номер']) : []);
    rows = rows.filter(r => allowed.has(r['Инв. номер']));
  }
  if (yearFrom) rows = rows.filter(r => parseInt(r['Год']) >= parseInt(yearFrom));
  if (yearTo)   rows = rows.filter(r => parseInt(r['Год']) <= parseInt(yearTo));
  const totalMonth = rows.reduce((s,r) => s+(parseFloat(r['Амортизация за месяц'])||0), 0);
  return { ok: true, data: rows, totalMonth };
}

// ============================================================
// ЭТАП 3 — ИНВЕНТАРИЗАЦИЯ
// ============================================================

// ---------- Инициализация листов инвентаризации ----------
function ensureInventorySheets() {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheets = [
    { name: 'Инвентаризации', headers: ['№ инв-ции','Название','Дата начала','Дата закрытия','Подразделение','Статус','Создал','Итого объектов','Найдено','Не найдено'] },
    { name: 'Инв. результаты', headers: ['№ инв-ции','Инв. номер','Наименование','Подразделение','Ожидаемый адрес','Фактический адрес','Состояние факт.','Статус','Дата сканирования','Кто сканировал','Примечание'] },
  ];
  sheets.forEach(({ name, headers }) => {
    let sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
      sh.appendRow(headers);
      sh.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#1a3a5c').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
  });
}

// ---------- Создать новую инвентаризацию ----------
function createInventory(token, data) {
  const sess = checkSession(token);
  if (!sess || sess.role !== 'admin') return { ok: false, error: 'Только администратор может создавать инвентаризацию' };
  try {
    ensureInventorySheets();
    const sh = getSheet('Инвентаризации');
    const num = sh.getLastRow(); // включая заголовок
    const invNum = 'ИНВ-' + String(num).padStart(4, '0');
    const now = Utilities.formatDate(new Date(), 'Asia/Tashkent', 'yyyy-MM-dd');
    // Посчитать сколько объектов попадает в инвентаризацию
    const allOS = getAllOS(token);
    const dept = data.dept || '';
    const filtered = dept
      ? allOS.data.filter(o => o['Подразделения'] === dept && o['Состояния'] === 'Балансда')
      : allOS.data.filter(o => o['Состояния'] === 'Балансда');
    sh.appendRow([invNum, data.name, now, '', dept || 'Все', 'Открыта', sess.fio || sess.login, filtered.length, 0, filtered.length]);
    // Записать ожидаемые объекты в результаты
    const resSh = getSheet('Инв. результаты');
    filtered.forEach(os => {
      resSh.appendRow([invNum, os['Инвентарный номер'], os['Наименование'], os['Подразделения'],
        os['Адрес'] || '', '', '', 'Ожидается', '', '', '']);
    });
    return { ok: true, invNum, total: filtered.length };
  } catch(e) { return { ok: false, error: e.message }; }
}

// ---------- Список инвентаризаций ----------
function getInventories(token) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  ensureInventorySheets();
  const sh = getSheet('Инвентаризации');
  const rows = sheetToObjects(sh);
  // user видит только свои подразделения
  const visible = sess.role === 'admin' ? rows : rows.filter(r => r['Подразделение'] === sess.dept || r['Подразделение'] === 'Все');
  return { ok: true, data: visible.reverse() };
}

// ---------- Детали одной инвентаризации ----------
function getInventoryDetail(token, invNum) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  const sh = getSheet('Инв. результаты');
  if (!sh) return { ok: true, data: [] };
  const rows = sheetToObjects(sh).filter(r => r['№ инв-ции'] === invNum);
  return { ok: true, data: rows };
}

// ---------- Подтвердить наличие (из карточки при сканировании) ----------
// Вызывается без токена — публичная функция для сканирования QR
function confirmPresencePublic(invNum, osInvNum, factAddr, condition, note) {
  try {
    ensureInventorySheets();
    // Проверить что инвентаризация открыта
    const invSh = getSheet('Инвентаризации');
    const invRows = sheetToObjects(invSh);
    const inv = invRows.find(r => r['№ инв-ции'] === invNum);
    if (!inv) return { ok: false, error: 'Инвентаризация не найдена' };
    if (inv['Статус'] === 'Закрыта') return { ok: false, error: 'Инвентаризация уже закрыта' };

    const resSh = getSheet('Инв. результаты');
    const data = resSh.getDataRange().getValues();
    const headers = data[0];
    const invCol    = headers.indexOf('№ инв-ции');
    const osCol     = headers.indexOf('Инв. номер');
    const factACol  = headers.indexOf('Фактический адрес');
    const condCol   = headers.indexOf('Состояние факт.');
    const statCol   = headers.indexOf('Статус');
    const dateCol   = headers.indexOf('Дата сканирования');
    const noteCol   = headers.indexOf('Примечание');

    const now = Utilities.formatDate(new Date(), 'Asia/Tashkent', 'yyyy-MM-dd HH:mm');
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][invCol] === invNum && data[i][osCol] === osInvNum) {
        resSh.getRange(i+1, factACol+1).setValue(factAddr || '');
        resSh.getRange(i+1, condCol+1).setValue(condition || '');
        resSh.getRange(i+1, statCol+1).setValue('Найдено');
        resSh.getRange(i+1, dateCol+1).setValue(now);
        resSh.getRange(i+1, noteCol+1).setValue(note || '');
        found = true;
        break;
      }
    }
    // Если объект не был в списке — добавить как излишек
    if (!found) {
      const os = getAllOS({ ok:true, data:[] }); // fallback
      resSh.appendRow([invNum, osInvNum, '', '', '', factAddr||'', condition||'', 'Излишек', now, '', note||'']);
    }
    // Обновить счётчики в шапке инвентаризации
    _updateInventoryCounts(invNum);
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
}

// ---------- Подтвердить наличие с токеном (из главного приложения) ----------
function confirmPresence(token, invNum, osInvNum, factAddr, condition, note) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  return confirmPresencePublic(invNum, osInvNum, factAddr, condition, sess.fio || sess.login);
}

// ---------- Обновить счётчики инвентаризации ----------
function _updateInventoryCounts(invNum) {
  const resSh = getSheet('Инв. результаты');
  const invSh  = getSheet('Инвентаризации');
  if (!resSh || !invSh) return;
  const rows = sheetToObjects(resSh).filter(r => r['№ инв-ции'] === invNum);
  const found  = rows.filter(r => r['Статус'] === 'Найдено' || r['Статус'] === 'Излишек').length;
  const missed = rows.filter(r => r['Статус'] === 'Ожидается').length;

  const invData = invSh.getDataRange().getValues();
  const invHeaders = invData[0];
  const numCol     = invHeaders.indexOf('№ инв-ции');
  const foundCol   = invHeaders.indexOf('Найдено');
  const missedCol  = invHeaders.indexOf('Не найдено');
  for (let i = 1; i < invData.length; i++) {
    if (invData[i][numCol] === invNum) {
      invSh.getRange(i+1, foundCol+1).setValue(found);
      invSh.getRange(i+1, missedCol+1).setValue(missed);
      break;
    }
  }
}

// ---------- Закрыть инвентаризацию ----------
function closeInventory(token, invNum) {
  const sess = checkSession(token);
  if (!sess || sess.role !== 'admin') return { ok: false, error: 'Нет прав' };
  try {
    const sh = getSheet('Инвентаризации');
    const data = sh.getDataRange().getValues();
    const headers = data[0];
    const numCol    = headers.indexOf('№ инв-ции');
    const statusCol = headers.indexOf('Статус');
    const closeCol  = headers.indexOf('Дата закрытия');
    const now = Utilities.formatDate(new Date(), 'Asia/Tashkent', 'yyyy-MM-dd');
    for (let i = 1; i < data.length; i++) {
      if (data[i][numCol] === invNum) {
        sh.getRange(i+1, statusCol+1).setValue('Закрыта');
        sh.getRange(i+1, closeCol+1).setValue(now);
        return { ok: true };
      }
    }
    return { ok: false, error: 'Не найдено' };
  } catch(e) { return { ok: false, error: e.message }; }
}

// ---------- Получить сводку для отчёта ----------
function getInventoryReport(token, invNum) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  ensureInventorySheets();
  // Шапка инвентаризации
  const invSh  = getSheet('Инвентаризации');
  const invRows = sheetToObjects(invSh);
  const inv = invRows.find(r => r['№ инв-ции'] === invNum);
  if (!inv) return { ok: false, error: 'Инвентаризация не найдена' };
  // Результаты
  const resSh = getSheet('Инв. результаты');
  const rows = sheetToObjects(resSh).filter(r => r['№ инв-ции'] === invNum);
  const found   = rows.filter(r => r['Статус'] === 'Найдено');
  const missed  = rows.filter(r => r['Статус'] === 'Ожидается');
  const surplus = rows.filter(r => r['Статус'] === 'Излишек');
  return { ok: true, inv, rows, found, missed, surplus };
}

// ---------- Получить открытые инвентаризации (для Card.html без токена) ----------
function getOpenInventoriesPublic() {
  try {
    ensureInventorySheets();
    const sh = getSheet('Инвентаризации');
    const rows = sheetToObjects(sh).filter(r => r['Статус'] === 'Открыта');
    return rows.map(r => ({ num: r['№ инв-ции'], name: r['Название'], dept: r['Подразделение'] }));
  } catch(e) { return []; }
}

// ============================================================
// ФОТО — ЗАГРУЗКА В GOOGLE DRIVE
// ============================================================

// ID корневой папки для фото ОС (создаётся автоматически)
var PHOTO_ROOT_NAME = 'GOLD LAVASH — Фото ОС';

function getOrCreateFolder(parentFolder, name) {
  const folders = parentFolder.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return parentFolder.createFolder(name);
}

function getPhotoFolder(dept) {
  const root = DriveApp.getRootFolder();
  const rootFolder = getOrCreateFolder(root, PHOTO_ROOT_NAME);
  if (!dept) return rootFolder;
  return getOrCreateFolder(rootFolder, dept);
}

// Загрузить фото из base64 и вернуть прямую ссылку
function uploadPhoto(token, base64Data, fileName, dept) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  try {
    // Убрать data:image/...;base64, префикс
    const clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const decoded = Utilities.base64Decode(clean);
    const blob = Utilities.newBlob(decoded, 'image/jpeg', fileName || ('photo_' + new Date().getTime() + '.jpg'));

    const folder = getPhotoFolder(dept || sess.dept || '');
    const file = folder.createFile(blob);
    // Открыть доступ по ссылке
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    // Прямая ссылка для отображения в браузере
    const directUrl = 'https://lh3.googleusercontent.com/d/' + fileId;
    // Ссылка на Drive (запасная)
    const driveUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;

    return { ok: true, fileId, directUrl, driveUrl, url: directUrl };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// Создать папки для всех подразделений заранее
function initPhotoFolders(token) {
  const sess = checkSession(token);
  if (!sess || sess.role !== 'admin') return { ok: false, error: 'Нет прав' };
  const depts = ['Производство','Завод СЭЗ','ОТП Самарканд','ОТП Тошкент','Офис Ад'];
  const created = [];
  depts.forEach(d => {
    getPhotoFolder(d);
    created.push(d);
  });
  return { ok: true, created };
}

// Пересоздать ссылки на карточку и QR для всех ОС (запустить вручную один раз)
// ВАЖНО: вставь свой /exec URL в переменную EXEC_URL ниже
function rebuildAllCardLinks() {
  // Получить URL автоматически — работает только при вызове через /exec
  let appUrl = ScriptApp.getService().getUrl();
  // Если возвращает /dev — заменить на /exec принудительно
  appUrl = appUrl.replace('/dev', '/exec');
  Logger.log('Используемый URL: ' + appUrl);

  const sh = getSheet('База ОС');
  if (!sh) { Logger.log('Лист не найден'); return; }
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const invCol  = headers.indexOf('Инвентарный номер');
  const qrCol   = headers.indexOf('QR-код');
  const cardCol = headers.indexOf('Ссылка на карточку');
  if (invCol === -1) { Logger.log('Колонка не найдена'); return; }
  let count = 0;
  for (let i = 1; i < data.length; i++) {
    const inv = String(data[i][invCol] || '').trim();
    if (!inv) continue;
    // Заменяем № на ~N~ для безопасной передачи через URL
    var safeInv = inv.replace(/№/g, '~N~');
    const cardUrl = appUrl + '?page=card&inv=' + encodeURIComponent(safeInv);
    const qrUrl   = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(cardUrl);
    if (cardCol !== -1) sh.getRange(i+1, cardCol+1).setValue(cardUrl);
    if (qrCol   !== -1) sh.getRange(i+1, qrCol+1).setValue(qrUrl);
    count++;
    // Пауза каждые 50 записей чтобы не превысить лимит
    if (count % 50 === 0) Utilities.sleep(100);
  }
  Logger.log('Готово! Обновлено: ' + count + ' объектов');
  Logger.log('Пример карточки: ' + appUrl + '?page=card&inv=' + encodeURIComponent(String(data[1][invCol]).trim()));
}

// Версия с ручным указанием URL — используй если rebuildAllCardLinks не работает
function rebuildAllCardLinksManual() {
  // ↓↓↓ ВСТАВЬ СВОЙ /exec URL СЮДА ↓↓↓
  const appUrl = 'https://script.google.com/macros/s/AKfycbxQZNF8WNn6s3iuhqFfA38njltkSexqwDxMqd6ujTLjg2zro0WWhWArUk4QXlQQTrbi/exec';
  // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

  const sh = getSheet('База ОС');
  if (!sh) { Logger.log('Лист не найден'); return; }
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const invCol  = headers.indexOf('Инвентарный номер');
  const qrCol   = headers.indexOf('QR-код');
  const cardCol = headers.indexOf('Ссылка на карточку');
  if (invCol === -1) { Logger.log('Колонка не найдена'); return; }
  let count = 0;
  for (let i = 1; i < data.length; i++) {
    const inv = String(data[i][invCol] || '').trim();
    if (!inv) continue;
    // Заменяем № на ~N~ для безопасной передачи через URL
    var safeInv = inv.replace(/№/g, '~N~');
    const cardUrl = appUrl + '?page=card&inv=' + encodeURIComponent(safeInv);
    const qrUrl   = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(cardUrl);
    if (cardCol !== -1) sh.getRange(i+1, cardCol+1).setValue(cardUrl);
    if (qrCol   !== -1) sh.getRange(i+1, qrCol+1).setValue(qrUrl);
    count++;
    if (count % 50 === 0) Utilities.sleep(100);
  }
  Logger.log('Готово! Обновлено: ' + count + ' объектов');
  Logger.log('Пример: ' + appUrl + '?page=card&inv=' + encodeURIComponent(String(data[1][invCol]).trim()));
}

// Диагностика — запусти в Apps Script редакторе чтобы проверить данные
function debugCardLoad() {
  const sh = getSheet('База ОС');
  if (!sh) { Logger.log('Лист не найден'); return; }
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const invCol = headers.indexOf('Инвентарный номер');
  Logger.log('Колонка инв. номера: ' + invCol);

  // Найти первую непустую строку с инв. номером
  let firstRow = null;
  for (let i = 1; i < data.length; i++) {
    if (data[i][invCol] && String(data[i][invCol]).trim()) {
      firstRow = { idx: i, val: data[i][invCol] };
      break;
    }
  }
  if (!firstRow) { Logger.log('Нет данных!'); return; }

  const raw = firstRow.val;
  Logger.log('Первый инв. номер (raw): [' + raw + ']');
  Logger.log('Тип: ' + typeof raw);
  Logger.log('Длина строки: ' + String(raw).length);
  Logger.log('Char codes: ' + Array.from(String(raw)).map(c => c.charCodeAt(0)).join(','));

  // Попробовать найти
  const trimmed = String(raw).trim();
  Logger.log('После trim: [' + trimmed + ']');
  const result = getOSByInvPublic(trimmed);
  Logger.log('Результат поиска: ' + (result ? 'НАЙДЕН — ' + result['Наименование'] : 'НЕ НАЙДЕН'));

  // URL карточки
  const appUrl = ScriptApp.getService().getUrl();
  Logger.log('App URL (/exec): ' + appUrl);
  Logger.log('Card URL: ' + appUrl + '?page=card&inv=' + encodeURIComponent(trimmed));
}

// Тест прямого доступа к таблице — запусти и проверь журнал
function testDirectAccess() {
  const id = '1uEsehQE55lBcM0W2E1bIfsj4LB7MKqax47Ug-E__39M';
  try {
    const ss = SpreadsheetApp.openById(id);
    Logger.log('Таблица найдена: ' + ss.getName());
    const sh = ss.getSheetByName('База ОС');
    if (!sh) { Logger.log('Лист "База ОС" НЕ НАЙДЕН'); Logger.log('Все листы: ' + ss.getSheets().map(s=>s.getName()).join(', ')); return; }
    Logger.log('Лист найден, строк: ' + sh.getLastRow());
    const row2 = sh.getRange(2, 1, 1, 5).getValues()[0];
    Logger.log('Строка 2: ' + JSON.stringify(row2));
    const row3 = sh.getRange(3, 1, 1, 5).getValues()[0];
    Logger.log('Строка 3: ' + JSON.stringify(row3));
  } catch(e) {
    Logger.log('ОШИБКА: ' + e.message);
  }
}

// Запусти эту функцию чтобы принудительно запросить все разрешения
function forceReauth() {
  // Запрашиваем все сервисы которые используем
  const ss = SpreadsheetApp.openById('1uEsehQE55lBcM0W2E1bIfsj4LB7MKqax47Ug-E__39M');
  Logger.log('Sheets OK: ' + ss.getName());
  
  const cache = CacheService.getScriptCache();
  cache.put('test', 'ok', 10);
  Logger.log('Cache OK');
  
  const url = ScriptApp.getService().getUrl();
  Logger.log('Script URL: ' + url);
  
  Logger.log('Все разрешения получены! Теперь карточка должна работать.');
}

// Запусти ОДИН РАЗ — заменит все "ИНВ№ 0001" на "ИНВ-0001" в таблице
function renameInvNumbers() {
  var sh = getSheet('База ОС');
  if (!sh) { Logger.log('Лист не найден'); return; }
  var data = sh.getDataRange().getValues();
  var headers = data[0];
  var invCol  = headers.indexOf('Инвентарный номер');
  var cardCol = headers.indexOf('Ссылка на карточку');
  var qrCol   = headers.indexOf('QR-код');
  var appUrl  = 'https://script.google.com/macros/s/AKfycbxQZNF8WNn6s3iuhqFfA38njltkSexqwDxMqd6ujTLjg2zro0WWhWArUk4QXlQQTrbi/exec';
  var count = 0;
  for (var i = 1; i < data.length; i++) {
    var oldInv = String(data[i][invCol] || '').trim();
    if (!oldInv) continue;
    // Заменить № на - и убрать лишние пробелы
    var newInv = oldInv
      .replace(/№/g, '-')   // № -> -
      .replace(/\s+/g, '')       // убрать пробелы: ИНВ- 0001 -> ИНВ-0001
      .replace('--', '-');       // на случай двойного тире
    if (newInv === oldInv) continue; // уже нормальный
    // Обновить инв. номер
    sh.getRange(i+1, invCol+1).setValue(newInv);
    // Обновить ссылки
    var cardUrl = appUrl + '?page=card&inv=' + encodeURIComponent(newInv);
    var qrUrl   = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(cardUrl);
    if (cardCol !== -1) sh.getRange(i+1, cardCol+1).setValue(cardUrl);
    if (qrCol   !== -1) sh.getRange(i+1, qrCol+1).setValue(qrUrl);
    count++;
    if (count % 50 === 0) Utilities.sleep(200);
  }
  Logger.log('Готово! Переименовано: ' + count + ' объектов');
  Logger.log('Пример: ' + appUrl + '?page=card&inv=ИНВ-0001');
}

// Временная диагностика - замени doGet на эту функцию чтобы увидеть что приходит
function diagDoGet(e) {
  Logger.log('=== ДИАГНОСТИКА doGet ===');
  Logger.log('queryString: ' + e.queryString);
  Logger.log('parameter.inv: [' + (e.parameter.inv || 'ПУСТО') + ']');
  Logger.log('parameter.page: [' + (e.parameter.page || 'ПУСТО') + ']');
  if (e.parameters) {
    Logger.log('parameters.inv: ' + JSON.stringify(e.parameters.inv));
  }
  // Ручное чтение queryString
  var inv = '';
  if (e.queryString) {
    var parts = e.queryString.split('&');
    for (var i = 0; i < parts.length; i++) {
      var eq = parts[i].indexOf('=');
      if (eq > -1) {
        var key = parts[i].substring(0, eq);
        var val = parts[i].substring(eq + 1);
        Logger.log('key=[' + key + '] raw val=[' + val + ']');
        if (key === 'inv') {
          try { inv = decodeURIComponent(val); } catch(ex) { inv = val; }
          Logger.log('decoded inv=[' + inv + '] length=' + inv.length);
        }
      }
    }
  }
  return HtmlService.createHtmlOutput('<h2>inv=[' + inv + ']</h2><p>queryString=' + e.queryString + '</p>');
}

// Публичная функция — все ОС без авторизации (для страницы наклеек)
function getAllOSPublic() {
  var sh = getSheet('База ОС');
  if (!sh) return [];
  var data = sh.getDataRange().getValues();
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[1]) continue; // нет инв. номера
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      if (!headers[j]) continue;
      var val = row[j];
      if (val instanceof Date) val = Utilities.formatDate(val, 'Asia/Tashkent', 'yyyy-MM-dd');
      else if (val === null || (typeof val === 'object' && val !== null)) val = '';
      obj[headers[j]] = val;
    }
    if (obj['Состояния'] !== 'Списан') result.push(obj);
  }
  return result;
}

// ============================================================
// ФИНАЛЬНАЯ ФУНКЦИЯ — запусти один раз чтобы всё заработало
// Переименует номера ИНВ№ -> ИНВ- и перепишет все ссылки
// ============================================================
function SETUP_ALL() {
  var EXEC_URL = 'https://script.google.com/macros/s/AKfycbxQZNF8WNn6s3iuhqFfA38njltkSexqwDxMqd6ujTLjg2zro0WWhWArUk4QXlQQTrbi/exec';
  var sh = getSheet('База ОС');
  if (!sh) { Logger.log('Лист не найден'); return; }
  var data = sh.getDataRange().getValues();
  var headers = data[0];
  var invCol  = headers.indexOf('Инвентарный номер');
  var cardCol = headers.indexOf('Ссылка на карточку');
  var qrCol   = headers.indexOf('QR-код');
  if (invCol === -1) { Logger.log('Колонка не найдена'); return; }
  var count = 0, renamed = 0;
  for (var i = 1; i < data.length; i++) {
    var raw = String(data[i][invCol] || '').trim();
    if (!raw) continue;
    // Привести номер к виду ИНВ-ХXXX
    var clean = raw
      .replace(/\u2116/g, '-')  // № -> -
      .replace(/\s+/g, '')       // убрать пробелы
      .replace(/--/g, '-');
    if (clean !== raw) {
      sh.getRange(i+1, invCol+1).setValue(clean);
      renamed++;
    }
    // Записать ссылку и QR с чистым номером
    var cardUrl = EXEC_URL + '?page=card&inv=' + encodeURIComponent(clean);
    var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(cardUrl);
    if (cardCol !== -1) sh.getRange(i+1, cardCol+1).setValue(cardUrl);
    if (qrCol   !== -1) sh.getRange(i+1, qrCol+1).setValue(qrUrl);
    count++;
    if (count % 50 === 0) Utilities.sleep(100);
  }
  Logger.log('=== ГОТОВО ===');
  Logger.log('Всего обновлено: ' + count + ' объектов');
  Logger.log('Переименовано номеров: ' + renamed);
  Logger.log('Пример карточки: ' + EXEC_URL + '?page=card&inv=ИНВ-0001');
  Logger.log('Откройте эту ссылку — карточка должна работать!');
}

// Публичная загрузка фото (без токена) — для мобильной страницы Photo.html
function uploadPhotoPublic(base64Data, fileName, dept, invNum) {
  try {
    var clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    var decoded = Utilities.base64Decode(clean);
    var blob = Utilities.newBlob(decoded, 'image/jpeg', fileName || ('photo_' + new Date().getTime() + '.jpg'));
    var folder = getPhotoFolder(dept || '');
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var fileId = file.getId();
    var url = 'https://drive.google.com/uc?export=view&id=' + fileId;
    // Обновить поле фото в таблице
    if (invNum) updateOSFieldPublic(invNum, 'Фото URL', url);
    return { ok: true, fileId: fileId, url: url };
  } catch(e) {
    Logger.log('uploadPhotoPublic error: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// Публичное обновление поля ОС (без токена) — только для Фото URL
function updateOSFieldPublic(invNum, field, value) {
  try {
    // Разрешаем только безопасные поля
    var allowed = ['Фото URL', 'QR-код', 'Ссылка на карточку'];
    if (allowed.indexOf(field) === -1) return { ok: false, error: 'Поле не разрешено' };
    updateOSFieldInternal(invNum, field, value);
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
}

// ============================================================
// МЕСТА ХРАНЕНИЯ И ОТВЕТСТВЕННЫЕ ЛИЦА
// ============================================================

function ensureStorageSheet() {
  const ss = SpreadsheetApp.openById(SS_ID);
  let sh = ss.getSheetByName('Места хранения');
  if (!sh) {
    sh = ss.insertSheet('Места хранения');
    sh.appendRow(['Подразделение','Место хранения','Описание','Активно']);
    sh.getRange(1,1,1,4).setFontWeight('bold').setBackground('#1a3a5c').setFontColor('#fff');
    sh.setFrozenRows(1);
    const defaults = [
      ['Производство','Цех Линия 1','Производственная линия 1',true],
      ['Производство','Цех Линия 2','Производственная линия 2',true],
      ['Производство','Цех Линия 3','Производственная линия 3',true],
      ['Производство','Цех Тандыр','Тандырный цех',true],
      ['Производство','Склад сырья','Склад сырья',true],
      ['Производство','Склад ГП','Склад готовой продукции',true],
      ['Завод СЭЗ','Цех СЭЗ основной','Основной цех',true],
      ['Завод СЭЗ','Склад СЭЗ','Склад завода',true],
      ['ОТП Самарканд','Магазин С1','Торговая точка 1',true],
      ['ОТП Самарканд','Магазин С2','Торговая точка 2',true],
      ['ОТП Тошкент','Магазин Т1','Торговая точка Тошкент 1',true],
      ['ОТП Тошкент','Магазин Т2','Торговая точка Тошкент 2',true],
      ['Офис Ад','Кабинет бухгалтерии','Бухгалтерия',true],
      ['Офис Ад','Кабинет директора','Руководство',true],
      ['Офис Ад','Серверная','IT отдел',true],
    ];
    defaults.forEach(r => sh.appendRow(r));
  }
  return sh;
}

// Получить места хранения по подразделению
function getStorageLocations(token, dept) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  ensureStorageSheet();
  const sh = SpreadsheetApp.openById(SS_ID).getSheetByName('Места хранения');
  const rows = sheetToObjects(sh).filter(r =>
    r['Активно'] !== false &&
    String(r['Активно']).toLowerCase() !== 'false' &&
    (!dept || r['Подразделение'] === dept)
  );
  return { ok: true, data: rows };
}

// Все места хранения
function getAllStorageLocations(token) {
  return getStorageLocations(token, null);
}

// Добавить место хранения
function addStorageLocation(token, dept, name, desc) {
  const sess = checkSession(token);
  if (!sess || sess.role !== 'admin') return { ok: false, error: 'Нет прав' };
  ensureStorageSheet();
  const sh = SpreadsheetApp.openById(SS_ID).getSheetByName('Места хранения');
  sh.appendRow([dept, name, desc||'', true]);
  return { ok: true };
}

// Удалить место хранения
function deleteStorageLocation(token, dept, name) {
  const sess = checkSession(token);
  if (!sess || sess.role !== 'admin') return { ok: false, error: 'Нет прав' };
  const sh = SpreadsheetApp.openById(SS_ID).getSheetByName('Места хранения');
  if (!sh) return { ok: false, error: 'Лист не найден' };
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const dCol = headers.indexOf('Подразделение');
  const nCol = headers.indexOf('Место хранения');
  const aCol = headers.indexOf('Активно');
  for (let i = 1; i < data.length; i++) {
    if (data[i][dCol] === dept && data[i][nCol] === name) {
      sh.getRange(i+1, aCol+1).setValue(false);
      return { ok: true };
    }
  }
  return { ok: false, error: 'Не найдено' };
}

// Получить список ответственных лиц
function getResponsiblePersons(token, dept) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  // Читать из листа Пользователи + из базы ОС (уникальные)
  const sh = getSheet('База ОС');
  const persons = new Set();
  if (sh) {
    const data = sh.getDataRange().getValues();
    const headers = data[0];
    const respCol = headers.indexOf('Ответственный лицо');
    const deptCol = headers.indexOf('Подразделения');
    data.slice(1).forEach(r => {
      if (!dept || r[deptCol] === dept) {
        const p = String(r[respCol]||'').trim();
        if (p) persons.add(p);
      }
    });
  }
  // Добавить из листа Пользователи (ФИО)
  const userSh = getSheet('Пользователи');
  if (userSh) {
    sheetToObjects(userSh).forEach(u => {
      if (u['ФИО'] && u['ФИО'] !== u['Логин']) persons.add(u['ФИО']);
    });
  }
  return { ok: true, data: Array.from(persons).sort() };
}

// Обновить ответственного и место хранения существующего ОС
function updateOSResponsible(token, invNum, responsible, storageLocation) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  // Проверить доступ по подразделению
  const os = getOSByInv(invNum, token);
  if (!os) return { ok: false, error: 'ОС не найден или нет доступа' };
  try {
    if (responsible) updateOSFieldInternal(invNum, 'Ответственный лицо', responsible);
    if (storageLocation) updateOSFieldInternal(invNum, 'Адрес', storageLocation);
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
}

// Отчёт по местам хранения
function getReportByStorage(token, dept) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  const result = getAllOS(token);
  if (!result.ok) return result;
  const all = dept ? result.data.filter(o => o['Подразделения'] === dept) : result.data;
  // Группировать по месту хранения
  const byStorage = {};
  all.forEach(o => {
    const loc = o['Адрес'] || '— Не указано —';
    if (!byStorage[loc]) byStorage[loc] = [];
    byStorage[loc].push(o);
  });
  const totalCost = all.reduce((s,o) => s+(parseFloat(o['Рыночный стоимость'])||0), 0);
  return { ok: true, data: all, byStorage, dept: dept||'Все', totalCost };
}

// Отчёт по ответственным лицам
function getReportByResponsible(token, dept) {
  const sess = checkSession(token);
  if (!sess) return { ok: false, error: 'Сессия истекла' };
  const result = getAllOS(token);
  if (!result.ok) return result;
  const all = dept ? result.data.filter(o => o['Подразделения'] === dept) : result.data;
  const byResp = {};
  all.forEach(o => {
    const r = o['Ответственный лицо'] || '— Не указано —';
    if (!byResp[r]) byResp[r] = [];
    byResp[r].push(o);
  });
  const totalCost = all.reduce((s,o) => s+(parseFloat(o['Рыночный стоимость'])||0), 0);
  return { ok: true, data: all, byResp, dept: dept||'Все', totalCost };
}