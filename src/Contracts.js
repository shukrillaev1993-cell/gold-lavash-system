// ============================================================
// GOLD LAVASH — ТРУДОВЫЕ ДОГОВОРЫ
// HR директор создаёт шаблоны по должностям
// При приёме/вручную → генерируется Word (.docx) на Google Drive
// Язык: узбекский
// ============================================================

var CONTRACT_SHEET   = '\u0428\u0430\u0431\u043b\u043e\u043d\u044b_\u0434\u043e\u0433\u043e\u0432\u043e\u0440\u043e\u0432'; // "Шаблоны_договоров"
var CONTRACT_LOG     = '\u0416\u0443\u0440\u043d\u0430\u043b_\u0434\u043e\u0433\u043e\u0432\u043e\u0440\u043e\u0432';   // "Журнал_договоров"
var CONTRACT_FOLDER  = 'GL_Contracts'; // имя папки на Google Drive

// ─── Инициализация листов ─────────────────────────────────────
function ensureContractSheets() {
  var ss = getHRSS();

  // Шаблоны: ID|Должность|Вид_оплаты|Срок|Обязанности|Права_сотр|Права_компании|Оплата_текст|Стандарты|Доп_условия|Создан|Автор
  if (!ss.getSheetByName(CONTRACT_SHEET)) {
    var sh = ss.insertSheet(CONTRACT_SHEET);
    sh.getRange(1,1,1,12).setValues([[
      'ID','\u0414\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c','\u0412\u0438\u0434_\u043e\u043f\u043b\u0430\u0442\u044b',
      '\u0421\u0440\u043e\u043a_\u0434\u043e\u0433\u043e\u0432\u043e\u0440\u0430',
      '\u041e\u0431\u044f\u0437\u0430\u043d\u043d\u043e\u0441\u0442\u0438',
      '\u041f\u0440\u0430\u0432\u0430_\u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0430',
      '\u041f\u0440\u0430\u0432\u0430_\u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438',
      '\u041e\u043f\u043b\u0430\u0442\u0430_\u0442\u0435\u043a\u0441\u0442',
      '\u0421\u0442\u0430\u043d\u0434\u0430\u0440\u0442\u044b',
      '\u0414\u043e\u043f_\u0443\u0441\u043b\u043e\u0432\u0438\u044f',
      '\u0421\u043e\u0437\u0434\u0430\u043d','\u0410\u0432\u0442\u043e\u0440'
    ]]);
    sh.getRange(1,1,1,12).setFontWeight('bold').setBackground('#1A237E').setFontColor('#fff');
    sh.setFrozenRows(1);
    sh.setColumnWidth(5, 300); sh.setColumnWidth(6, 300);
    sh.setColumnWidth(7, 300); sh.setColumnWidth(8, 250);
  }

  // Журнал: №|Дата|Сотрудник_ID|ФИО|Должность|Шаблон_ID|Дата_начала|Дата_конца|Статус|DriveURL|Подписан
  if (!ss.getSheetByName(CONTRACT_LOG)) {
    var sh2 = ss.insertSheet(CONTRACT_LOG);
    sh2.getRange(1,1,1,11).setValues([[
      '\u2116','\u0414\u0430\u0442\u0430','\u0421\u043e\u0442\u0440_\u0418\u0414',
      '\u0424\u0418\u041e','\u0414\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c',
      '\u0428\u0430\u0431\u043b\u043e\u043d_\u0418\u0414',
      '\u0414\u0430\u0442\u0430_\u043d\u0430\u0447\u0430\u043b\u0430',
      '\u0414\u0430\u0442\u0430_\u043e\u043a\u043e\u043d\u0447\u0430\u043d\u0438\u044f',
      '\u0421\u0442\u0430\u0442\u0443\u0441',
      'DriveURL','\u041f\u043e\u0434\u043f\u0438\u0441\u0430\u043d'
    ]]);
    sh2.getRange(1,1,1,11).setFontWeight('bold').setBackground('#880E4F').setFontColor('#fff');
    sh2.setFrozenRows(1);
  }
  return ss;
}

// ─── Папка на Drive ───────────────────────────────────────────
function getContractFolder() {
  var folders = DriveApp.getFoldersByName(CONTRACT_FOLDER);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(CONTRACT_FOLDER);
}

// ══════════════════════════════════════════════════════════════
// ШАБЛОНЫ
// ══════════════════════════════════════════════════════════════

function contractGetTemplates(user) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','HR \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = ensureContractSheets();
  var sh = ss.getSheetByName(CONTRACT_SHEET);
  var rows = sh.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    list.push({
      id:rows[i][0], position:rows[i][1], payType:rows[i][2],
      term:rows[i][3], duties:rows[i][4], empRights:rows[i][5],
      compRights:rows[i][6], payText:rows[i][7], standards:rows[i][8],
      extra:rows[i][9], created:hrFmtDate(rows[i][10]), author:rows[i][11],
      rowIdx:i+1
    });
  }
  return {ok:true, templates:list};
}

function contractSaveTemplate(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  if (!payload.position) return {ok:false, error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0434\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c'};
  var ss = ensureContractSheets();
  var sh = ss.getSheetByName(CONTRACT_SHEET);
  var id = payload.id || Utilities.getUuid();
  var now = new Date();
  var row = [
    id, payload.position, payload.payType||'\u041f\u043e \u0448\u0442\u0430\u0442\u043d\u043e\u043c\u0443 \u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u044e',
    payload.term||'\u0411\u0435\u0441\u0441\u0440\u043e\u0447\u043d\u044b\u0439',
    payload.duties||'', payload.empRights||'', payload.compRights||'',
    payload.payText||'', payload.standards||'', payload.extra||'',
    now, user.fio
  ];
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) { sh.getRange(i+1,1,1,12).setValues([row]); return {ok:true,id:id}; }
  }
  sh.appendRow(row);
  return {ok:true, id:id};
}

function contractDeleteTemplate(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = ensureContractSheets();
  var sh = ss.getSheetByName(CONTRACT_SHEET);
  var rows = sh.getDataRange().getValues();
  for (var i = rows.length-1; i >= 1; i--) {
    if (rows[i][0] === payload.id) { sh.deleteRow(i+1); return {ok:true}; }
  }
  return {ok:false, error:'\u041d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e'};
}

// ══════════════════════════════════════════════════════════════
// ГЕНЕРАЦИЯ ДОГОВОРА (Word .docx через Apps Script)
// ══════════════════════════════════════════════════════════════

function contractGenerate(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','HR \u043c\u0435\u043d\u0435\u0436\u0435\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  if (!payload.templateId) return {ok:false, error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0448\u0430\u0431\u043b\u043e\u043d'};
  if (!payload.empId)      return {ok:false, error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0430'};

  var ss = ensureContractSheets();

  // Найти шаблон
  var shTpl = ss.getSheetByName(CONTRACT_SHEET);
  var tplRows = shTpl.getDataRange().getValues();
  var tpl = null;
  for (var i=1;i<tplRows.length;i++) {
    if (tplRows[i][0]===payload.templateId) {
      tpl = {
        id:tplRows[i][0], position:tplRows[i][1], payType:tplRows[i][2],
        term:tplRows[i][3], duties:tplRows[i][4], empRights:tplRows[i][5],
        compRights:tplRows[i][6], payText:tplRows[i][7], standards:tplRows[i][8],
        extra:tplRows[i][9]
      };
      break;
    }
  }
  if (!tpl) return {ok:false, error:'\u0428\u0430\u0431\u043b\u043e\u043d \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d'};

  // Найти сотрудника
  var shMain = ss.getSheetByName(HR_SHEET_CURRENT);
  var empRows = shMain.getDataRange().getValues();
  var emp = null;
  for (var j=1;j<empRows.length;j++) {
    if (String(empRows[j][0])===String(payload.empId)) {
      emp = {
        id:empRows[j][0], fio:empRows[j][2], dept:empRows[j][3],
        position:empRows[j][4], passport:empRows[j][7]||'',
        address:empRows[j][9]||'', phone:String(empRows[j][10]||''),
        hireDate:hrFmtDate(empRows[j][1])
      };
      break;
    }
  }
  if (!emp) return {ok:false, error:'\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d'};

  // Дата начала/окончания
  var startDate = payload.startDate || hrFmtDate(new Date());
  var endDate   = payload.endDate   || '';
  var today     = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd.MM.yyyy');

  // Номер договора
  var shLog = ss.getSheetByName(CONTRACT_LOG);
  var logRows = shLog.getDataRange().getValues();
  var contractNum = logRows.length; // включая заголовок

  // Генерируем Google Doc (HTML → Doc → экспорт .docx)
  var docContent = buildContractHtml(contractNum, today, startDate, endDate, emp, tpl, payload);
  var doc = DocumentApp.create('Договор №' + contractNum + ' — ' + emp.fio);
  doc.getBody().clear();

  // Заполняем документ
  buildGoogleDoc(doc, contractNum, today, startDate, endDate, emp, tpl, payload);
  doc.saveAndClose();

  // Экспортируем как .docx и сохраняем в папку
  var folder = getContractFolder();
  var docId = doc.getId();
  var exportUrl = 'https://docs.google.com/document/d/' + docId + '/export?format=docx';
  var blob = UrlFetchApp.fetch(exportUrl, {
    headers: {Authorization: 'Bearer ' + ScriptApp.getOAuthToken()}
  }).getBlob().setName('Договор_' + contractNum + '_' + emp.fio.replace(/\s/g,'_') + '.docx');

  var file = folder.createFile(blob);
  var fileUrl = file.getUrl();

  // Удаляем исходный Google Doc (оставляем только .docx)
  DriveApp.getFileById(docId).setTrashed(true);

  // Записываем в журнал
  shLog.appendRow([
    contractNum, new Date(), emp.id, emp.fio, emp.position,
    tpl.id, startDate, endDate||tpl.term,
    '\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0439', fileUrl, '\u041d\u0435\u0442'
  ]);

  return {ok:true, contractNum:contractNum, url:fileUrl, fio:emp.fio};
}

// ── Журнал договоров ──────────────────────────────────────────
function contractGetLog(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','HR \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = ensureContractSheets();
  var sh = ss.getSheetByName(CONTRACT_LOG);
  var rows = sh.getDataRange().getValues();
  var empId = payload && payload.empId ? String(payload.empId) : '';
  var list = [];
  for (var i=rows.length-1;i>=1;i--) {
    if (!rows[i][0]) continue;
    if (empId && String(rows[i][2])!==empId) continue;
    list.push({
      num:rows[i][0], date:hrFmtDate(rows[i][1]),
      empId:rows[i][2], fio:rows[i][3], position:rows[i][4],
      templateId:rows[i][5], startDate:rows[i][6], endDate:rows[i][7],
      status:rows[i][8], url:rows[i][9], signed:rows[i][10]
    });
    if (list.length>=100) break;
  }
  return {ok:true, contracts:list};
}

function contractMarkSigned(user, payload) {
  requireHR(user);
  var ss = ensureContractSheets();
  var sh = ss.getSheetByName(CONTRACT_LOG);
  var rows = sh.getDataRange().getValues();
  for (var i=1;i<rows.length;i++) {
    if (String(rows[i][0])===String(payload.num)) {
      sh.getRange(i+1,11).setValue('\u041f\u043e\u0434\u043f\u0438\u0441\u0430\u043d');
      return {ok:true};
    }
  }
  return {ok:false, error:'\u041d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e'};
}

// ══════════════════════════════════════════════════════════════
// ПОСТРОЕНИЕ GOOGLE DOC (Узбекский язык)
// ══════════════════════════════════════════════════════════════

function buildGoogleDoc(doc, num, today, startDate, endDate, emp, tpl, payload) {
  var body = doc.getBody();
  var tz   = Session.getScriptTimeZone();

  // Стили
  var hStyle = {};
  hStyle[DocumentApp.Attribute.FONT_FAMILY] = 'Times New Roman';
  hStyle[DocumentApp.Attribute.FONT_SIZE]   = 12;
  hStyle[DocumentApp.Attribute.BOLD]        = true;

  var nStyle = {};
  nStyle[DocumentApp.Attribute.FONT_FAMILY] = 'Times New Roman';
  nStyle[DocumentApp.Attribute.FONT_SIZE]   = 12;
  nStyle[DocumentApp.Attribute.BOLD]        = false;

  function addPara(text, bold, center) {
    var p = body.appendParagraph(text||'');
    p.setAttributes(bold ? hStyle : nStyle);
    if (center) p.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    return p;
  }
  function addBlank() { return addPara('', false, false); }

  // ── ШАПКА ──
  addPara('\u00ab\u0422\u0410\u0421\u0414\u0418\u049a\u041b\u0410\u0419\u041c\u0410\u041d\u00bb', true, true);
  addPara('\u041c\u0427\u0416 \u00abGold Lavash\u00bb', true, true);
  addPara('\u0422\u0430\u044a\u0441\u0438\u0441\u0447\u0438\u0441\u0438: \u0421\u0430\u0434\u0438\u043a\u043e\u0432 \u0416.\u041c.', false, true);
  addPara('"____" ________________ ' + new Date().getFullYear() + ' \u0439\u0438\u043b', false, true);
  addBlank();

  // ── ЗАГОЛОВОК ──
  addPara('\u041c\u0415\u0425\u041d\u0410\u0422 \u0428\u0410\u0420\u0422\u041d\u041e\u041c\u0410\u0421\u0418', true, true);
  addPara('\u2116 ' + num, true, true);
  addBlank();

  // ── ПРЕАМБУЛА ──
  var city = payload.city || '\u0421\u0430\u043c\u0430\u0440\u049b\u0430\u043d\u0434';
  addPara('\u0421\u0430\u043d\u0430: ' + city + ' \u0448\u0430\u04b3\u0440\u0438', false, false);
  addPara('\u0421\u0430\u043d\u0430: ' + today, false, false);
  addBlank();

  var preamble = '\u041c\u0427\u0416 \u00abGold Lavash\u00bb (\u043a\u0435\u0439\u0438\u043d\u0447\u0430 \u2014 \u00ab\u0418\u0448 \u0431\u0435\u0440\u0443\u0432\u0447\u0438\u00bb), \u0432\u0430\u043a\u0438\u043b\u043b\u0438\u043a \u0442\u043e\u043c\u043e\u043d\u0438\u0434\u0430\u043d \u0421\u0430\u0434\u0438\u043a\u043e\u0432 \u0416.\u041c., \u0431\u0438\u0440 \u0442\u043e\u043c\u043e\u043d\u0434\u0430\u043d \u2014 ' + (emp.fio) + ' (\u043a\u0435\u0439\u0438\u043d\u0447\u0430 \u2014 \u00ab\u0425\u043e\u0434\u0438\u043c\u00bb), \u0431\u0438\u043b \u0442\u043e\u043c\u043e\u043d\u0434\u0430\u043d \u0443\u0448\u0431\u0443 \u043c\u0435\u0445\u043d\u0430\u0442 \u0448\u0430\u0440\u0442\u043d\u043e\u043c\u0430\u0441\u0438\u043d\u0438 \u0442\u0443\u0437\u0434\u0438\u043b\u0430\u0440:';
  addPara(preamble, false, false);
  addBlank();

  // ── СТАТЬИ ──
  var sections = [
    {title:'1. \u0428\u0410\u0420\u0422\u041d\u041e\u041c\u0410 \u041c\u0410\u0412\u0417\u0423\u0421\u0418',
     text: '1.1. \u0425\u043e\u0434\u0438\u043c ' + (emp.fio) + ' \u0438\u0448 \u0436\u043e\u0439\u0438\u0434\u0430 \u043f\u0440\u0438\u043d\u044f\u0442 \u049b\u0438\u043b\u0438\u043d\u0430\u0434\u0438: ' + (emp.dept||'') + ', \u043b\u0430\u0432\u043e\u0437\u0438\u043c: ' + (tpl.position||emp.position||'') + '.\n1.2. \u0418\u0448 \u0431\u043e\u0448\u043b\u0430\u043d\u0438\u0448 \u0441\u0430\u043d\u0430\u0441\u0438: ' + startDate + '.\n1.3. \u0418\u0448 \u043c\u0430\u043d\u0437\u0438\u043b\u0438: ' + (city) + ', \u041c\u0427\u0416 \u00abGold Lavash\u00bb \u0438\u0448\u043b\u0430\u0431 \u0447\u0438\u049b\u0430\u0440\u0438\u0448 \u0436\u043e\u0439\u043b\u0430\u0448\u0433\u0430\u043d \u043c\u0430\u043d\u0437\u0438\u043b.'},
    {title:'2. \u0428\u0410\u0420\u0422\u041d\u041e\u041c\u0410 \u041c\u0423\u0414\u0414\u0410\u0422\u0418',
     text: '2.1. \u0428\u0430\u0440\u0442\u043d\u043e\u043c\u0430 ' + (tpl.term==='Бессрочный'?'\u043c\u0443\u0434\u0434\u0430\u0442\u0441\u0438\u0437 \u0442\u0443\u0437\u0438\u043b\u0430\u0434\u0438':'\u043c\u0443\u0434\u0434\u0430\u0442\u043b\u0438 \u0442\u0443\u0437\u0438\u043b\u0430\u0434\u0438, \u0441\u0430\u043d\u0430: ' + startDate + ' \u0434\u0430\u043d ' + (endDate||'\u2014') + ' \u0433\u0430\u0447\u0430') + '.\n2.2. \u0421\u0438\u043d\u043e\u0432 \u0434\u0430\u0432\u0440 \u043c\u0443\u0434\u0434\u0430\u0442\u0438 ' + tpl.term + '.'},
    {title:'3. \u0425\u041e\u0414\u0418\u041c\u041d\u0418\u041d\u0413 \u041c\u0410\u0414\u0414\u0418\u0419 \u0412\u0410 \u0411\u0423\u0420\u0427\u041b\u0418\u041a\u041b\u0410\u0420\u0418',
     text: tpl.duties||'3.1. \u0425\u043e\u0434\u0438\u043c \u0443\u0437 \u043b\u0430\u0432\u043e\u0437\u0438\u043c \u0431\u045e\u0439\u0438\u0447\u0430 \u0432\u0430\u0437\u0438\u0444\u0430\u043b\u0430\u0440\u0438\u043d\u0438 \u0441\u0430\u043c\u0430\u0440\u0430\u043b\u0438 \u0431\u0430\u0436\u0430\u0440\u0438\u0448\u0433\u0430 \u043c\u0430\u0436\u0431\u0443\u0440.'},
    {title:'4. \u0425\u041e\u0414\u0418\u041c\u041d\u0418\u041d\u0413 \u04b2\u0423\u049a\u0423\u049a\u041b\u0410\u0420\u0418',
     text: tpl.empRights||'4.1. \u0425\u043e\u0434\u0438\u043c \u043e\u04b3\u0438\u0441\u0442\u0438\u0439 \u043c\u0435\u04b3\u043d\u0430\u0442 \u0432\u0430 \u044f\u0448\u043e\u0432 \u0448\u0430\u0440\u043e\u0438\u0442\u0438\u0433\u0430 \u04b3\u0430\u049b\u043b\u0438 \u044d\u043c\u0430\u0441.'},
    {title:'5. \u0418\u0428 \u0411\u0415\u0420\u0423\u0412\u0427\u0418\u041d\u0418\u041d\u0413 \u04b2\u0423\u049a\u0423\u049a\u041b\u0410\u0420\u0418',
     text: tpl.compRights||'5.1. \u0418\u0448 \u0431\u0435\u0440\u0443\u0432\u0447\u0438 \u0438\u0448 \u0444\u0430\u043e\u043b\u0438\u044f\u0442\u0438\u043d\u0438 \u043d\u0430\u0437\u043e\u0440\u0430\u0442 \u049b\u0438\u043b\u0438\u0448\u0433\u0430 \u04b3\u0430\u049b\u043b\u0438.'},
    {title:'6. \u041c\u0415\u04b2\u041d\u0410\u0422 \u04b0\u049a\u0418',
     text: buildPayText(tpl, payload)},
    {title:'7. \u0418\u0427\u041a\u0418 \u0418\u041d\u0422\u0418\u0417\u041e\u041c',
     text: tpl.standards||'7.1. \u0425\u043e\u0434\u0438\u043c \u043a\u043e\u0440\u0445\u043e\u043d\u0430 \u0442\u0430\u0440\u0442\u0438\u0431\u0438 \u0432\u0430 \u0438\u0448 \u0438\u043d\u0442\u0438\u0437\u043e\u043c\u0438\u0433\u0430 \u0440\u0438\u043e\u044f \u049b\u0438\u043b\u0438\u0448\u0433\u0430 \u043c\u0430\u0436\u0431\u0443\u0440.\n7.2. \u0425\u043e\u0434\u0438\u043c \u043c\u0430\u0445\u0444\u0438\u044f\u0442\u043d\u0438\u043d\u0433 \u0438\u0447\u043a\u0438 \u0442\u0430\u0440\u0442\u0438\u0431\u043b\u0430\u0440\u0438\u0433\u0430 \u0440\u0438\u043e\u044f \u049b\u0438\u043b\u0438\u0448\u0433\u0430 \u043c\u0430\u0436\u0431\u0443\u0440.'},
    {title:'8. \u049a\u04ee\u0428\u0418\u041c\u0427\u0410 \u0428\u0410\u0420\u041e\u0418\u0422\u041b\u0410\u0420',
     text: (tpl.extra||'8.1. \u0423\u0448\u0431\u0443 \u0448\u0430\u0440\u0442\u043d\u043e\u043c\u0430 \u043e\u049b\u0438\u043b\u043e\u043d\u0430 \u043a\u0438\u0440\u0438\u0442\u0438\u043b\u0433\u0430\u043d \u043f\u0430\u0439\u0442\u0434\u0430\u043d \u043a\u0443\u0447\u0433\u0430 \u043a\u0438\u0440\u0430\u0434\u0438.')}
  ];

  sections.forEach(function(sec) {
    addPara(sec.title, true, false);
    (sec.text||'').split('\n').forEach(function(line) {
      addPara(line, false, false);
    });
    addBlank();
  });

  // ── ПОДПИСИ ──
  addPara('9. \u0422\u0410\u0420\u0410\u0424\u041b\u0410\u0420\u041d\u0418\u041d\u0413 \u0420\u0415\u041a\u0412\u0418\u0417\u0418\u0422\u041b\u0410\u0420\u0418', true, false);
  addBlank();

  var tbl = body.appendTable([
    ['\u0418\u0428 \u0411\u0415\u0420\u0423\u0412\u0427\u0418:', '\u0425\u041e\u0414\u0418\u041c:'],
    ['\u041c\u0427\u0416 \u00abGold Lavash\u00bb', emp.fio],
    ['\u0421\u0430\u0434\u0438\u043a\u043e\u0432 \u0416.\u041c.', '\u041f\u0430\u0441\u043f\u043e\u0440\u0442: ' + (emp.passport||'__________')],
    ['\u0418\u043c\u0437\u043e: __________________', '\u0418\u043c\u0437\u043e: __________________'],
    ['\u0421\u0430\u043d\u0430: ' + today, '\u0421\u0430\u043d\u0430: ' + today]
  ]);
  tbl.setAttributes(nStyle);
}

function buildPayText(tpl, payload) {
  var base = '\u041c\u0435\u04b3\u043d\u0430\u0442 \u0442\u04fa\u043b\u043e\u0432 \u0442\u0443\u0440\u0438:';
  if (tpl.payType === '\u041a\u043e\u043d\u0442\u0440\u0430\u043a\u0442\u043d\u044b\u0439') {
    return base + '\n6.1. \u041a\u043e\u043d\u0442\u0440\u0430\u043a\u0442 \u0431\u04ee\u0439\u0438\u0447\u0430 \u043a\u0435\u043b\u0438\u0448\u0438\u043b\u0433\u0430\u043d \u043c\u0438\u049b\u0434\u043e\u0440\u0434\u0430: ' + (payload.salary||'___________') + ' \u0441\u045e\u043c.';
  }
  if (tpl.payType === '\u041f\u043e \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044e KPI') {
    return base + '\n6.1. \u0411\u043e\u0437 \u043c\u0430\u043e\u0448: ' + (payload.baseSalary||'___________') + ' \u0441\u045e\u043c.\n6.2. KPI \u043c\u0443\u043a\u043e\u0444\u043e\u0442\u0438 \u0430\u0441\u043e\u0441\u0438\u0434\u0430 \u049b\u04ef\u0448\u0438\u043c\u0447\u0430 \u04b3\u0430\u049b (\u0431\u043e\u043d\u0443\u0441): ' + (payload.kpi||'___________') + ' \u0441\u045e\u043c.';
  }
  if (tpl.payType === '\u041f\u043e \u0448\u0442\u0430\u0442\u043d\u043e\u043c\u0443 \u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u044e') {
    return base + '\n6.1. \u0428\u0442\u0430\u0442 \u0436\u0430\u0434\u0432\u0430\u043b\u0438\u0433\u0430 \u043c\u0443\u0432\u043e\u0444\u0438\u049b \u043e\u0439\u043b\u0438\u043a \u043c\u0430\u043e\u0448 \u0431\u04ee\u0439\u0438\u0447\u0430 \u0442\u04ee\u043b\u0430\u043d\u0430\u0434\u0438.\n6.2. \u041c\u0430\u043e\u0448 \u043c\u0438\u049b\u0434\u043e\u0440\u0438: ' + (payload.salary||'___________') + ' \u0441\u045e\u043c.';
  }
  return base + '\n' + (tpl.payText||'6.1. \u0418\u0447\u043a\u0438 \u0442\u043e\u043c\u043e\u043d\u043b\u0430\u0440 \u043a\u0435\u043b\u0438\u0448\u0443\u0432 \u0431\u0435\u043b\u0433\u0438\u043b\u0430\u043d\u0430\u0434\u0438.');
}

function buildContractHtml(num, today, start, end, emp, tpl, payload) {
  return ''; // not used
}

// ══════════════════════════════════════════════════════════════
// КОНСТРУКТОР ШТАТНОГО РАСПИСАНИЯ
// Каждый отдел имеет свою структуру колонок
// ══════════════════════════════════════════════════════════════

var STAFF_DOCS_SHEET   = '\u0428\u0442\u0430\u0442_\u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b';   // "Штат_документы"
var STAFF_COLS_SHEET   = '\u0428\u0442\u0430\u0442_\u043a\u043e\u043b\u043e\u043d\u043a\u0438';              // "Штат_колонки"
var STAFF_ROWS_SHEET   = '\u0428\u0442\u0430\u0442_\u0441\u0442\u0440\u043e\u043a\u0438';                   // "Штат_строки"
var STAFF_DOC_FOLDER   = 'GL_StaffDocs';

function ensureStaffDocSheets() {
  var ss = getHRSS();
  // Документы: ID | Отдел | Дата | DriveURL | Создан | Автор
  if (!ss.getSheetByName(STAFF_DOCS_SHEET)) {
    var sh = ss.insertSheet(STAFF_DOCS_SHEET);
    sh.getRange(1,1,1,6).setValues([['ID','\u041e\u0442\u0434\u0435\u043b','\u0414\u0430\u0442\u0430','DriveURL','\u0421\u043e\u0437\u0434\u0430\u043d','\u0410\u0432\u0442\u043e\u0440']]);
    sh.getRange(1,1,1,6).setFontWeight('bold').setBackground('#4A148C').setFontColor('#fff');
    sh.setFrozenRows(1);
  }
  // Колонки: DocID | Порядок | Ключ | Заголовок | Ширина | Выравнивание
  if (!ss.getSheetByName(STAFF_COLS_SHEET)) {
    var sh2 = ss.insertSheet(STAFF_COLS_SHEET);
    sh2.getRange(1,1,1,6).setValues([['DocID','\u041f\u043e\u0440\u044f\u0434\u043e\u043a','\u041a\u043b\u044e\u0447','\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a','\u0428\u0438\u0440\u0438\u043d\u0430','\u0412\u044b\u0440\u0430\u0432\u043d\u0438\u0432\u0430\u043d\u0438\u0435']]);
    sh2.getRange(1,1,1,6).setFontWeight('bold').setBackground('#4A148C').setFontColor('#fff');
    sh2.setFrozenRows(1);
  }
  // Строки: DocID | Порядок | col1 | col2 | col3 | col4 | col5 | col6 | col7 | col8
  if (!ss.getSheetByName(STAFF_ROWS_SHEET)) {
    var sh3 = ss.insertSheet(STAFF_ROWS_SHEET);
    sh3.getRange(1,1,1,10).setValues([['DocID','\u041f\u043e\u0440\u044f\u0434\u043e\u043a','col1','col2','col3','col4','col5','col6','col7','col8']]);
    sh3.getRange(1,1,1,10).setFontWeight('bold').setBackground('#4A148C').setFontColor('#fff');
    sh3.setFrozenRows(1);
  }
  return ss;
}

function staffDocGetFolder() {
  var folders = DriveApp.getFoldersByName(STAFF_DOC_FOLDER);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(STAFF_DOC_FOLDER);
}

// ── CRUD для документов штатного расписания ──────────────────

function staffDocList(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = ensureStaffDocSheets();
  var rows = ss.getSheetByName(STAFF_DOCS_SHEET).getDataRange().getValues();
  var list = [];
  for (var i=1;i<rows.length;i++) {
    if (!rows[i][0]) continue;
    list.push({id:rows[i][0],dept:rows[i][1],date:hrFmtDate(rows[i][2]),url:rows[i][3],created:hrFmtDate(rows[i][4]),author:rows[i][5]});
  }
  return {ok:true, docs:list};
}

function staffDocCreate(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  if (!payload.dept) return {ok:false,error:'\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043e\u0442\u0434\u0435\u043b'};
  var ss = ensureStaffDocSheets();
  var id = Utilities.getUuid();
  var sh = ss.getSheetByName(STAFF_DOCS_SHEET);
  sh.appendRow([id, payload.dept, new Date(), '', new Date(), user.fio]);

  // Сохраняем колонки
  var shCols = ss.getSheetByName(STAFF_COLS_SHEET);
  var cols = payload.cols || [];
  cols.forEach(function(c,i) {
    shCols.appendRow([id, i+1, c.key||'col'+(i+1), c.label||'', Number(c.width)||1200, c.align||'left']);
  });

  // Сохраняем строки
  var shRows = ss.getSheetByName(STAFF_ROWS_SHEET);
  var dataRows = payload.rows || [];
  dataRows.forEach(function(r,i) {
    shRows.appendRow([id, i+1, r[0]||'', r[1]||'', r[2]||'', r[3]||'', r[4]||'', r[5]||'', r[6]||'', r[7]||'']);
  });

  return {ok:true, id:id};
}

function staffDocGet(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = ensureStaffDocSheets();
  var id = payload.id;
  // Мета
  var docRows = ss.getSheetByName(STAFF_DOCS_SHEET).getDataRange().getValues();
  var meta = null;
  for (var i=1;i<docRows.length;i++) {
    if (docRows[i][0]===id) { meta={id:id,dept:docRows[i][1],date:hrFmtDate(docRows[i][2]),url:docRows[i][3]}; break; }
  }
  if (!meta) return {ok:false,error:'\u041d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e'};
  // Колонки
  var colRows = ss.getSheetByName(STAFF_COLS_SHEET).getDataRange().getValues();
  var cols = colRows.filter(function(r){return r[0]===id&&r[1];}).sort(function(a,b){return a[1]-b[1];})
    .map(function(r){return {key:r[2],label:r[3],width:Number(r[4])||1200,align:r[5]||'left'};});
  // Строки
  var rowRows = ss.getSheetByName(STAFF_ROWS_SHEET).getDataRange().getValues();
  var rows = rowRows.filter(function(r){return r[0]===id&&r[1];}).sort(function(a,b){return a[1]-b[1];})
    .map(function(r){return [r[2],r[3],r[4],r[5],r[6],r[7],r[8],r[9]];});
  return {ok:true, meta:meta, cols:cols, rows:rows};
}

function staffDocUpdate(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = ensureStaffDocSheets();
  var id = payload.id;
  // Удаляем старые колонки и строки
  var shCols = ss.getSheetByName(STAFF_COLS_SHEET);
  var shRows = ss.getSheetByName(STAFF_ROWS_SHEET);
  [shCols, shRows].forEach(function(sh) {
    var r = sh.getDataRange().getValues();
    for (var i=r.length-1;i>=1;i--) { if (r[i][0]===id) sh.deleteRow(i+1); }
  });
  // Записываем новые
  (payload.cols||[]).forEach(function(c,i) {
    shCols.appendRow([id,i+1,c.key||'col'+(i+1),c.label||'',Number(c.width)||1200,c.align||'left']);
  });
  (payload.rows||[]).forEach(function(r,i) {
    shRows.appendRow([id,i+1,r[0]||'',r[1]||'',r[2]||'',r[3]||'',r[4]||'',r[5]||'',r[6]||'',r[7]||'']);
  });
  return {ok:true};
}

function staffDocDelete(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);
  var ss = ensureStaffDocSheets();
  var id = payload.id;
  [STAFF_DOCS_SHEET, STAFF_COLS_SHEET, STAFF_ROWS_SHEET].forEach(function(shName) {
    var sh = ss.getSheetByName(shName);
    var r = sh.getDataRange().getValues();
    for (var i=r.length-1;i>=1;i--) { if (r[i][0]===id) sh.deleteRow(i+1); }
  });
  return {ok:true};
}

// ── Генерация Word документа ──────────────────────────────────
function staffDocGenerate(user, payload) {
  requireRole(user, ['HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440','\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440']);

  var res = staffDocGet(user, {id:payload.id});
  if (!res.ok) return res;

  var meta = res.meta, cols = res.cols, rows = res.rows;
  var dateStr = payload.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), '"dd"  MMMM yyyy');
  var yearStr = dateStr + ' \u0439\u0438\u043b';

  // Строим Google Doc
  var docTitle = meta.dept + ' \u2014 \u0428\u0442\u0430\u0442 \u0436\u0430\u0434\u0432\u0430\u043b\u0438';
  var doc = DocumentApp.create(docTitle);
  var body = doc.getBody();
  body.setPageWidth(595 * 2.835); // примерно A4

  var TNR = 'Times New Roman';

  function addPara(text, opts) {
    opts = opts || {};
    var p = body.appendParagraph(text || '');
    p.setFontFamily(TNR);
    p.setFontSize(opts.size || 12);
    p.setBold(opts.bold || false);
    if (opts.align === 'center') p.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    else if (opts.align === 'right') p.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    else p.setAlignment(DocumentApp.HorizontalAlignment.LEFT);
    if (opts.spacing) p.setSpacingAfter(opts.spacing);
    return p;
  }

  // Шапка
  addPara('\u00ab\u0422\u0410\u0421\u0414\u0418\u049a\u041b\u0410\u0419\u041c\u0410\u041d\u00bb', {size:12, bold:true, align:'right'});
  addPara('\u041c\u0427\u0416 \u00abGold Lavash\u00bb', {size:12, align:'right'});
  addPara('\u0422\u0430\u044a\u0441\u0438\u0441\u0447\u0438\u0441\u0438: \u0421\u0430\u0434\u0438\u043a\u043e\u0432 \u0416.\u041c.', {size:12, align:'right'});
  addPara(yearStr, {size:12, align:'right', spacing:20});

  // Заголовок
  addPara(meta.dept + ' \u0431\u045e\u043b\u0438\u043c\u0438\u043d\u0438\u043d\u0433', {size:14, bold:true, align:'center'});
  addPara('\u0428\u0442\u0430\u0442 \u0436\u0430\u0434\u0432\u0430\u043b\u0438', {size:14, bold:true, align:'center', spacing:16});

  // Таблица
  var numCols = cols.length;
  var tbl = body.appendTable();

  // Заголовок таблицы
  var hdr = tbl.appendTableRow();
  cols.forEach(function(c) {
    var cell = hdr.appendTableCell(c.label || '');
    cell.setFontFamily(TNR);
    cell.setFontSize(11);
    cell.setBold(true);
    var attr = {}; attr[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = DocumentApp.HorizontalAlignment.CENTER;
    cell.getChild(0).setAttributes(attr);
  });

  // Строки данных
  rows.forEach(function(rowData) {
    var tr = tbl.appendTableRow();
    for (var ci=0; ci<numCols; ci++) {
      var val = rowData[ci] || '';
      var c = cols[ci];
      var tc = tr.appendTableCell(val);
      tc.setFontFamily(TNR);
      tc.setFontSize(11);
      var ha = c.align === 'center' ? DocumentApp.HorizontalAlignment.CENTER : DocumentApp.HorizontalAlignment.LEFT;
      var attr2 = {}; attr2[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = ha;
      tc.getChild(0).setAttributes(attr2);
    }
  });

  doc.saveAndClose();

  // Экспорт .docx
  var folder = staffDocGetFolder();
  var blob = UrlFetchApp.fetch(
    'https://docs.google.com/document/d/' + doc.getId() + '/export?format=docx',
    { headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()} }
  ).getBlob().setName(meta.dept.replace(/\s/g,'_') + '_Shtat.docx');

  var file = folder.createFile(blob);
  DriveApp.getFileById(doc.getId()).setTrashed(true);

  // Сохраняем URL
  var ss = getHRSS();
  var shDocs = ss.getSheetByName(STAFF_DOCS_SHEET);
  var docRows = shDocs.getDataRange().getValues();
  for (var i=1;i<docRows.length;i++) {
    if (docRows[i][0]===payload.id) { shDocs.getRange(i+1,4).setValue(file.getUrl()); break; }
  }

  return {ok:true, url:file.getUrl()};
}