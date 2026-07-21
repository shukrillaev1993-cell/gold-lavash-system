/*****************************************************************************************
 *  GOLD LAVASH — Telegram-напоминания о дедлайне заказа
 *  Добавьте этот файл в ТОТ ЖЕ проект Apps Script (рядом с Code.gs).
 *  Он использует общие функции проекта: readSchedule_, shipInfoForClient_,
 *  readOrders_, norm, fmtDate, getSheetFuzzy, ss.
 *
 *  ── НАСТРОЙКА (один раз) ────────────────────────────────────────────────────────────
 *  1) В Telegram у @BotFather создайте бота → получите ТОКЕН.
 *  2) В редакторе Apps Script выполните:  tgSetToken('ВАШ_ТОКЕН')   (один раз)
 *  3) Выполните  tgSetup()  — создаст лист «Телеграм».
 *  4) Каждый дилер пишет вашему боту:  /start Регион Хоразм
 *     (текст после /start должен совпадать с названием региона в графике).
 *     Затем выполните  tgPullUpdates()  — бот привяжет чаты (или поставьте триггер, см. ниже).
 *  5) Поставьте триггеры по времени (Триггеры → Добавить триггер):
 *        • tgRunReminders  — каждые 30 минут
 *        • tgPullUpdates   — каждые 5–10 минут (для привязки новых чатов)
 *  6) Проверка:  tgTest('CHAT_ID', 'Привет')  или  tgRunRemindersNow().
 *
 *  Напоминания шлются ТОЛЬКО в день дедлайна и ТОЛЬКО тем, кто ещё не дал заказ:
 *  «день заказа» → за ~5 ч → за ~3 ч → за ~2 ч → финал (с голосовым сообщением).
 *  ВНИМАНИЕ: бот Telegram не умеет звонить голосом (ограничение Bot API), поэтому
 *  «звонок» — это срочное сообщение + голосовое сообщение, которое бот проговаривает.
 *****************************************************************************************/

var TG_SHEET = 'Телеграм';
var TG_HEADERS = ['Клиент/Регион','chat_id','Активен','Кто','Язык','Тип'];
// Код регистрации управляющего (получателя отчётов)
function tgMgrPin_(){ return PropertiesService.getScriptProperties().getProperty('TG_MGR_PIN') || ''; }
function tgSetManagerPin(pin){ PropertiesService.getScriptProperties().setProperty('TG_MGR_PIN', String(pin||'').trim()); return 'OK'; }
// Адрес приложения (страница-лончер). При смене развёртывания — впишите новый.
var TG_APP_URL = 'https://script.google.com/macros/s/AKfycbwQXZ_vJOp1zk99jBLqz2mpHrCAIY90vMi8s9SJ_M_Q3W8Yaq9RKzZlW2AbFAH1gUd3/exec?page=launch';
function tgAppBtn_(lang){ return { text:(lang==='uz'?'📲 Иловани очиш':'📲 Открыть приложение'), url:TG_APP_URL }; }

/* ─────────────── токен и базовые вызовы API ─────────────── */
function tgSetToken(token){ PropertiesService.getScriptProperties().setProperty('TG_TOKEN', String(token||'').trim()); return 'OK'; }
function tgToken_(){ return PropertiesService.getScriptProperties().getProperty('TG_TOKEN') || ''; }
// Секрет для webhook (чтобы принимать только запросы от нашего Telegram).
function tgSecret_(){
  var p=PropertiesService.getScriptProperties(); var s=p.getProperty('TG_SECRET');
  if(!s){ s=Utilities.getUuid().replace(/-/g,''); p.setProperty('TG_SECRET', s); }
  return s;
}

function tgApi_(method, payload){
  var token = tgToken_();
  if (!token) throw new Error('Не задан токен бота. Выполните tgSetToken("ТОКЕН").');
  var res = UrlFetchApp.fetch('https://api.telegram.org/bot'+token+'/'+method, {
    method:'post', contentType:'application/json',
    payload: JSON.stringify(payload||{}), muteHttpExceptions:true
  });
  try { return JSON.parse(res.getContentText()); } catch(e){ return { ok:false, raw:res.getContentText() }; }
}
function tgSend_(chatId, text){
  return tgApi_('sendMessage', { chat_id:String(chatId), text:text, parse_mode:'HTML', disable_web_page_preview:true });
}
// Голосовое сообщение через Google TTS (русский). Не критично: при сбое просто пропускаем.
function tgVoice_(chatId, text){
  try{
    var url='https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ru&q='+encodeURIComponent(String(text).slice(0,190));
    var r=UrlFetchApp.fetch(url,{muteHttpExceptions:true, headers:{'User-Agent':'Mozilla/5.0'}});
    if(r.getResponseCode()!==200) return false;
    var blob=r.getBlob().setName('reminder.mp3');
    var token=tgToken_();
    var send=UrlFetchApp.fetch('https://api.telegram.org/bot'+token+'/sendAudio',
      { method:'post', muteHttpExceptions:true, payload:{ chat_id:String(chatId), audio:blob, title:'Напоминание о заказе' } });
    return send.getResponseCode()===200;
  }catch(e){ return false; }
}

/* ─────────────── лист «Телеграм» и привязка чатов ─────────────── */
function tgSheet_(){
  var sh=getSheetFuzzy(TG_SHEET);
  if(!sh){ sh=ss().insertSheet(TG_SHEET); sh.getRange(1,1,1,TG_HEADERS.length).setValues([TG_HEADERS]).setFontWeight('bold'); sh.setFrozenRows(1); }
  if(String(sh.getRange(1,5,1,1).getValue()||'').trim()==='') sh.getRange(1,5,1,1).setValue('Язык');
  if(String(sh.getRange(1,6,1,1).getValue()||'').trim()==='') sh.getRange(1,6,1,1).setValue('Тип');
  return sh;
}
// Управляющие: пометить чат и проверить.
function tgSetType_(sh, chatId, type, who){
  var rows=tgChatRows_(sh);
  if(rows[String(chatId)]){ sh.getRange(rows[String(chatId)],6,1,1).setValue(type); if(who) sh.getRange(rows[String(chatId)],4,1,1).setValue(who); }
  else sh.appendRow(['УПРАВЛЯЮЩИЙ', String(chatId), 'ДА', who||'', 'ru', type]);
}
function tgIsManager_(sh, chatId){
  var v=sh.getDataRange().getValues();
  for(var r=1;r<v.length;r++){ if(String(v[r][1]||'').trim()===String(chatId)) return String(v[r][5]||'').trim().toLowerCase()==='manager'; }
  return false;
}
// Ожидание ввода (например, кода управляющего) по чату.
function tgPending_(chatId){ return PropertiesService.getScriptProperties().getProperty('TGPEND_'+chatId)||''; }
function tgSetPending_(chatId,v){ PropertiesService.getScriptProperties().setProperty('TGPEND_'+chatId, v); }
function tgClearPending_(chatId){ PropertiesService.getScriptProperties().deleteProperty('TGPEND_'+chatId); }
function tgMgrConfirm_(chatId){
  tgApi_('sendMessage',{chat_id:chatId, parse_mode:'HTML',
    text:'✅ Вы зарегистрированы как <b>управляющий</b>. Будете получать отчёты по заказам и отправкам.',
    reply_markup:{ inline_keyboard:[
      [{text:'📊 Отчёт сейчас',callback_data:'report'}],
      [{text:'💰 Дебиторка / Кредиторка',callback_data:'debtor'}],
      [{text:'🧾 Поступления сегодня',callback_data:'receipts'}]
    ] } });
}
function tgManagerChats_(sh){
  sh=sh||tgSheet_(); var out=[]; var v=sh.getDataRange().getValues();
  for(var r=1;r<v.length;r++){
    if(String(v[r][5]||'').trim().toLowerCase()==='manager' && String(v[r][2]||'ДА').toUpperCase()!=='НЕТ')
      out.push({ chatId:String(v[r][1]), lang:String(v[r][4]||'ru').toLowerCase() });
  }
  return out;
}
function tgSetup(){ tgSheet_(); return 'Лист «Телеграм» готов. Дилеры запускают бота и выбирают язык, затем регион.'; }

// Язык чата ('ru'/'uz') и его установка.
function tgGetLang_(sh, chatId){
  var v=sh.getDataRange().getValues();
  for(var r=1;r<v.length;r++){ if(String(v[r][1]||'').trim()===String(chatId)) return String(v[r][4]||'').trim().toLowerCase(); }
  return '';
}
function tgSetLang_(sh, chatId, lang){
  var rows=tgChatRows_(sh);
  if(rows[String(chatId)]) sh.getRange(rows[String(chatId)],5,1,1).setValue(lang);
  else sh.appendRow(['', String(chatId), 'ДА', '', lang]);
}
// Локализованные строки интерфейса бота.
function tgStr_(lang){
  var uz = (lang==='uz');
  return {
    langPrompt: '🌐 Суҳбат тилини танланг / Выберите язык общения:',
    pickRegion: uz ? 'Илтимос, ҳудудингизни (филиал/регион) танланг — буюртма дедлайни ҳақида эслатиб турамиз:'
                   : 'Чтобы привязать чат к вашему региону, выберите его из списка:',
    confirm: function(r){ return uz ? ('✅ Тайёр! Чат «'+r+'» ҳудудига боғланди. Буюртма дедлайнлари ҳақида эслатиб турамиз.')
                                     : ('✅ Готово! Чат привязан к региону «'+r+'». Будем напоминать о дедлайнах заказа.'); },
    already: function(r){ return uz ? ('Сиз аллақачон «'+r+'» ҳудудига боғлангансиз.')
                                     : ('Вы уже привязаны к региону «'+r+'».'); },
    changeRegion: uz ? '🔄 Ҳудудни ўзгартириш' : '🔄 Сменить регион',
    changeLang:  '🌐 Тил / Язык',
    saved: function(r){ return uz ? ('Сақланди: '+r) : ('Сохранено: '+r); }
  };
}
function tgLangPicker_(chatId){
  tgApi_('sendMessage', { chat_id:String(chatId),
    text: tgStr_('').langPrompt,
    reply_markup:{ inline_keyboard:[[ {text:'🇺🇿 Ўзбекча', callback_data:'setlang:uz'}, {text:'🇷🇺 Русский', callback_data:'setlang:ru'} ]] } });
}

function tgChatRows_(sh){
  var v=sh.getDataRange().getValues(); var map={};
  for(var r=1;r<v.length;r++){ var id=String(v[r][1]||'').trim(); if(id) map[id]=r+1; }
  return map;
}
// Карта: нормализованный регион → {chatId,row}. Только активные строки.
function tgChatMap_(){
  var sh=getSheetFuzzy(TG_SHEET); if(!sh) return {};
  var v=sh.getDataRange().getValues(); var map={};
  for(var r=1;r<v.length;r++){
    var cl=String(v[r][0]||'').trim(), id=String(v[r][1]||'').trim();
    var act=String(v[r][2]||'ДА').trim().toUpperCase()!=='НЕТ';
    if(cl && id && act) map[norm(cl)]={ chatId:id, row:r+1, lang:String(v[r][4]||'').trim().toLowerCase() };
  }
  return map;
}

// Забрать входящие: команды /start, текст и нажатия кнопок выбора региона.
function tgPullUpdates(){
  var p=PropertiesService.getScriptProperties();
  var offset=Number(p.getProperty('TG_OFFSET')||'0');
  var r=tgApi_('getUpdates', { offset: offset+1, timeout: 0, allowed_updates:['message','callback_query'] });
  if(!r.ok) return r;
  var sh=tgSheet_();
  var sched=readSchedule_();
  (r.result||[]).forEach(function(u){
    p.setProperty('TG_OFFSET', String(u.update_id));
    if(u.callback_query){ tgHandleCallback_(u.callback_query, sh, sched); return; }
    var msg=u.message||u.edited_message; if(!msg||!msg.chat) return;
    tgHandleMessage_(msg, sh, sched);
  });
  return { ok:true, processed:(r.result||[]).length };
}

// Рабочие часы опроса (минуты от полуночи). Меняйте при необходимости.
var TG_WORK_START = 8*60 + 30;   // 08:30
var TG_WORK_END   = 21*60 + 30;  // 21:30
function tgInWorkHours_(){
  var tz=Session.getScriptTimeZone();
  var hhmm=Utilities.formatDate(new Date(), tz, 'HH:mm');
  var cur=parseInt(hhmm.slice(0,2),10)*60 + parseInt(hhmm.slice(3,5),10);
  return cur >= TG_WORK_START && cur < TG_WORK_END;
}

// Быстрый опрос: крутится ~50 секунд, забирая сообщения почти мгновенно (long polling).
// Ставьте триггер на эту функцию каждую минуту — ответы будут приходить за 1–3 сек.
// Работает только в рабочие часы (8:30–21:30), вне их сразу выходит и не тратит квоту.
function tgPoll(){
  if(!tgInWorkHours_()) return;                   // вне рабочих часов — не опрашиваем
  // Отдельная защита от параллельного запуска (НЕ ScriptLock — он нужен приложению для сохранений)
  var props=PropertiesService.getScriptProperties();
  var busyUntil=Number(props.getProperty('TG_POLL_BUSY')||'0');
  if(Date.now() < busyUntil) return;              // другой экземпляр ещё работает
  props.setProperty('TG_POLL_BUSY', String(Date.now()+55000));
  try{
    var p=props;
    var sh=tgSheet_();
    var stop=Date.now()+50000;                    // работаем ~50 сек, потом триггер перезапустит
    while(Date.now()<stop && tgInWorkHours_()){
      var offset=Number(p.getProperty('TG_OFFSET')||'0');
      // long polling: Telegram держит запрос до 25 сек, отдаёт сразу как придёт сообщение
      var r=tgApi_('getUpdates', { offset: offset+1, timeout: 25, allowed_updates:['message','callback_query'] });
      if(!r || !r.ok){ Utilities.sleep(1000); continue; }
      var sched=readSchedule_();
      (r.result||[]).forEach(function(u){
        p.setProperty('TG_OFFSET', String(u.update_id));
        try{
          if(u.callback_query){ tgHandleCallback_(u.callback_query, sh, sched); return; }
          var msg=u.message||u.edited_message; if(!msg||!msg.chat) return;
          tgHandleMessage_(msg, sh, sched);
        }catch(e){}
      });
    }
  } finally { try{ props.deleteProperty('TG_POLL_BUSY'); }catch(e){} }
}

function tgWho_(chat){
  if(!chat) return '';
  var who=[chat.first_name,chat.last_name].filter(Boolean).join(' ') || chat.title || '';
  if(chat.username) who+=(who?' ':'')+'@'+chat.username;
  return who;
}
function tgMatchRegion_(sched, s){
  var found='';
  sched.forEach(function(c){ if(norm(c.name)===norm(s)) found=c.name; });
  return found;
}
function tgBindChat_(sh, chatId, region, who){
  var rows=tgChatRows_(sh);
  if(rows[String(chatId)]){
    var row=rows[String(chatId)];
    if(region) sh.getRange(row,1,1,1).setValue(region);
    sh.getRange(row,3,1,1).setValue('ДА');
    if(who) sh.getRange(row,4,1,1).setValue(who);
  } else {
    sh.appendRow([region||'', String(chatId), 'ДА', who||'']);
  }
}
// Прислать список регионов кнопками (inline-клавиатура).
function tgRegionPicker_(chatId, sched, lang){
  sched = sched || readSchedule_();
  var kb = sched.map(function(c,i){ return [{ text:c.name, callback_data:'reg:'+i }]; });
  tgApi_('sendMessage', { chat_id:String(chatId), text: tgStr_(lang).pickRegion, reply_markup:{ inline_keyboard: kb } });
}
// Найти регион, к которому уже привязан чат (или '').
function tgFindRegion_(sh, chatId){
  var v=sh.getDataRange().getValues();
  for(var r=1;r<v.length;r++){ if(String(v[r][1]||'').trim()===String(chatId)) return String(v[r][0]||'').trim(); }
  return '';
}
function tgConfirm_(chatId, region, lang){
  var S=tgStr_(lang);
  tgApi_('sendMessage', { chat_id:chatId, parse_mode:'HTML', text:S.confirm(region),
    reply_markup:{ inline_keyboard:[
      [ tgAppBtn_(lang) ],
      [ {text:S.changeRegion, callback_data:'change'} ],
      [ {text:S.changeLang, callback_data:'lang'} ]
    ] } });
}
function tgAlready_(chatId, region, lang){
  var S=tgStr_(lang);
  tgApi_('sendMessage', { chat_id:chatId, parse_mode:'HTML', text:S.already(region),
    reply_markup:{ inline_keyboard:[
      [ tgAppBtn_(lang) ],
      [ {text:S.changeRegion, callback_data:'change'} ],
      [ {text:S.changeLang, callback_data:'lang'} ]
    ] } });
}

function tgHandleMessage_(msg, sh, sched){
  var chatId=String(msg.chat.id);
  var who=tgWho_(msg.chat);
  var text=String(msg.text||'').trim();
  var lang=tgGetLang_(sh, chatId);
  // Если ждём код управляющего — следующий ввод считаем паролем
  if(tgPending_(chatId)==='mgr' && text && text.charAt(0)!=='/'){
    tgClearPending_(chatId);
    var pin0=tgMgrPin_();
    if(pin0 && text.trim()===pin0){ tgSetType_(sh, chatId, 'manager', who); tgMgrConfirm_(chatId); }
    else tgApi_('sendMessage',{chat_id:chatId,text:'Неверный код. Чтобы попробовать снова, нажмите /manager'});
    return;
  }
  // Регистрация управляющего: /manager (спросит код) или /manager КОД
  var mMgr=/^\/manager(?:\s+(.+))?$/i.exec(text);
  if(mMgr){
    var pin=tgMgrPin_();
    if(!pin){ tgApi_('sendMessage',{chat_id:chatId,text:'Регистрация управляющего не настроена. Обратитесь к администратору.'}); return; }
    var arg=(mMgr[1]||'').trim();
    if(arg){
      if(arg===pin){ tgSetType_(sh, chatId, 'manager', who); tgMgrConfirm_(chatId); }
      else tgApi_('sendMessage',{chat_id:chatId,text:'Неверный код. Формат: /manager КОД'});
    } else {
      tgSetPending_(chatId,'mgr');
      tgApi_('sendMessage',{chat_id:chatId,text:'🔐 Введите код управляющего:'});
    }
    return;
  }
  // Отчёт по запросу (только управляющему)
  if(/^\/report\b/i.test(text) || text==='📊 Отчёт'){
    if(tgIsManager_(sh, chatId)) tgSendReportTo_(chatId);
    else tgApi_('sendMessage',{chat_id:chatId,text:'Отчёты доступны только управляющему. Регистрация: /manager КОД'});
    return;
  }
  if(/^\/debtor\b/i.test(text)){
    if(tgIsManager_(sh, chatId)) tgApi_('sendMessage',{chat_id:chatId,parse_mode:'HTML',text:tgBuildDebtorReport_()});
    else tgApi_('sendMessage',{chat_id:chatId,text:'Доступно только управляющему. Регистрация: /manager КОД'});
    return;
  }
  if(/^\/receipts\b/i.test(text)){
    if(tgIsManager_(sh, chatId)) tgApi_('sendMessage',{chat_id:chatId,parse_mode:'HTML',text:tgBuildReceiptsToday_()});
    else tgApi_('sendMessage',{chat_id:chatId,text:'Доступно только управляющему. Регистрация: /manager КОД'});
    return;
  }
  if(/^\/sku\b/i.test(text)){
    if(tgIsManager_(sh, chatId)) tgApi_('sendMessage',{chat_id:chatId,parse_mode:'HTML',text:tgBuildSkuReport_()});
    else tgApi_('sendMessage',{chat_id:chatId,text:'Доступно только управляющему. Регистрация: /manager КОД'});
    return;
  }
  if(/^\/shipsku\b/i.test(text)){
    if(tgIsManager_(sh, chatId)) tgApi_('sendMessage',{chat_id:chatId,parse_mode:'HTML',text:tgBuildShipSkuReport_()});
    else tgApi_('sendMessage',{chat_id:chatId,text:'Доступно только управляющему. Регистрация: /manager КОД'});
    return;
  }
  if(/^\/limits\b/i.test(text)){
    if(tgIsManager_(sh, chatId)) tgApi_('sendMessage',{chat_id:chatId,parse_mode:'HTML',text:tgBuildLimitsReport_()});
    else tgApi_('sendMessage',{chat_id:chatId,text:'Доступно только управляющему. Регистрация: /manager КОД'});
    return;
  }
  // команда «Открыть приложение»
  if(/^\/app\b/i.test(text) || text==='📲 Открыть приложение' || text==='📲 Иловани очиш'){
    var L=(lang||'ru');
    tgApi_('sendMessage', { chat_id:chatId,
      text:(L==='uz'?'Иловани очиш учун тугмани босинг:':'Нажмите кнопку, чтобы открыть приложение:'),
      reply_markup:{ inline_keyboard:[[ tgAppBtn_(L) ]] } });
    return;
  }
  var existing=tgFindRegion_(sh, chatId);
  var m=/^\/start(?:\s+(.+))?$/i.exec(text);
  var wantsPicker = (text==='📋 Выбрать регион' || text.toLowerCase()==='начало' || text.toLowerCase()==='меню' || text.toLowerCase()==='til');
  // явный регион (в /start или присланный текстом)
  var directReg='';
  if(m && m[1]) directReg=tgMatchRegion_(sched, m[1]);
  else if(!m && !wantsPicker && text && text.charAt(0)!=='/') directReg=tgMatchRegion_(sched, text);
  if(directReg){ tgBindChat_(sh, chatId, directReg, who); tgConfirm_(chatId, directReg, lang||'ru'); return; }
  // /start без региона / «Начало» / «Выбрать регион»
  if(m || wantsPicker){
    if(!lang){ tgLangPicker_(chatId); return; }       // сначала выбор языка
    if(existing) tgAlready_(chatId, existing, lang);    // уже в базе — не навязываем
    else tgRegionPicker_(chatId, sched, lang);
    return;
  }
  // прочий текст
  if(!lang){ tgLangPicker_(chatId); return; }
  if(existing) tgAlready_(chatId, existing, lang);
  else tgRegionPicker_(chatId, sched, lang);
}
function tgHandleCallback_(cq, sh, sched){
  var data=String(cq.data||'');
  var chatId=(cq.message && cq.message.chat) ? String(cq.message.chat.id) : (cq.from?String(cq.from.id):'');
  if(data==='report'){ tgApi_('answerCallbackQuery',{ callback_query_id:cq.id }); if(tgIsManager_(sh, chatId)) tgSendReportTo_(chatId); return; }
  if(data==='debtor'){ tgApi_('answerCallbackQuery',{ callback_query_id:cq.id }); if(tgIsManager_(sh, chatId)) tgApi_('sendMessage',{chat_id:chatId,parse_mode:'HTML',text:tgBuildDebtorReport_()}); return; }
  if(data==='receipts'){ tgApi_('answerCallbackQuery',{ callback_query_id:cq.id }); if(tgIsManager_(sh, chatId)) tgApi_('sendMessage',{chat_id:chatId,parse_mode:'HTML',text:tgBuildReceiptsToday_()}); return; }
  if(data==='sku'){ tgApi_('answerCallbackQuery',{ callback_query_id:cq.id }); if(tgIsManager_(sh, chatId)) tgApi_('sendMessage',{chat_id:chatId,parse_mode:'HTML',text:tgBuildSkuReport_()}); return; }
  if(data==='shipsku'){ tgApi_('answerCallbackQuery',{ callback_query_id:cq.id }); if(tgIsManager_(sh, chatId)) tgApi_('sendMessage',{chat_id:chatId,parse_mode:'HTML',text:tgBuildShipSkuReport_()}); return; }
  if(data==='limits'){ tgApi_('answerCallbackQuery',{ callback_query_id:cq.id }); if(tgIsManager_(sh, chatId)) tgApi_('sendMessage',{chat_id:chatId,parse_mode:'HTML',text:tgBuildLimitsReport_()}); return; }
  // комментарий кладовщика по неполной отправке
  var sm=/^sc:(.+)$/.exec(data);
  if(sm){
    tgApi_('answerCallbackQuery',{ callback_query_id:cq.id });
    if(tgIsManager_(sh, chatId)) tgSendShipComment_(chatId, sm[1]);
    return;
  }
  // выбор/смена языка
  if(data==='lang'){ tgApi_('answerCallbackQuery',{ callback_query_id:cq.id }); tgLangPicker_(chatId); return; }
  var lm=/^setlang:(ru|uz)$/.exec(data);
  if(lm && chatId){
    tgSetLang_(sh, chatId, lm[1]);
    tgApi_('answerCallbackQuery',{ callback_query_id:cq.id });
    var reg0=tgFindRegion_(sh, chatId);
    if(reg0) tgAlready_(chatId, reg0, lm[1]); else tgRegionPicker_(chatId, sched, lm[1]);
    return;
  }
  var lang=tgGetLang_(sh, chatId)||'ru';
  if(data==='change'){ tgApi_('answerCallbackQuery',{ callback_query_id:cq.id }); tgRegionPicker_(chatId, sched, lang); return; }
  var mm=/^reg:(\d+)$/.exec(data);
  if(mm && chatId){
    var region=(sched[+mm[1]] ? sched[+mm[1]].name : '');
    if(region){
      tgBindChat_(sh, chatId, region, tgWho_(cq.from));
      tgApi_('answerCallbackQuery', { callback_query_id:cq.id, text: tgStr_(lang).saved(region) });
      tgConfirm_(chatId, region, lang);
      return;
    }
  }
  tgApi_('answerCallbackQuery', { callback_query_id:cq.id });
}

/* ─────────────── WEBHOOK: мгновенные ответы (1–3 секунды) ─────────────── */
// Защита от повторной доставки одного и того же обновления Telegram.
function tgSeen_(id){
  if(id==null) return false;
  var p=PropertiesService.getScriptProperties();
  var raw=p.getProperty('TG_SEEN'); var arr=raw?JSON.parse(raw):[];
  if(arr.indexOf(id)>=0) return true;
  arr.push(id); if(arr.length>100) arr=arr.slice(-100);
  p.setProperty('TG_SEEN', JSON.stringify(arr));
  return false;
}
// Telegram вызывает этот адрес при каждом сообщении. Подключается через tgInstallWebhook().
function doPost(e){
  try{
    if(!e || !e.parameter || e.parameter.tg !== tgSecret_()) return ContentService.createTextOutput('forbidden');
    var u = JSON.parse(e.postData.contents);
    if(!tgSeen_(u.update_id)){                       // защита от повторной доставки
      var sh = tgSheet_(), sched = readSchedule_();
      if(u.callback_query) tgHandleCallback_(u.callback_query, sh, sched);
      else { var msg = u.message || u.edited_message; if(msg && msg.chat) tgHandleMessage_(msg, sh, sched); }
    }
  }catch(err){ /* всегда отвечаем 200 */ }
  return ContentService.createTextOutput('ok');
}
// Подключить webhook. url — ваш АДРЕС РАЗВЁРТЫВАНИЯ (…/exec). Доступ деплоя должен быть «Все».
function tgSetWebhook(url){
  url = String(url||'').trim().replace(/\/+$/,'');   // убрать хвостовые слэши/пробелы
  if(url.indexOf('/exec') < 0)
    throw new Error('Запустите функцию tgInstallWebhook (в неё уже вписан URL). Прямой запуск tgSetWebhook без аргумента не работает.');
  var hook = url + '?tg=' + tgSecret_();
  var r = tgApi_('setWebhook', { url:hook, drop_pending_updates:true, allowed_updates:['message','callback_query'] });
  Logger.log(JSON.stringify(r));
  return r;
}
// ▶ ЗАПУСКАЙТЕ ЭТУ ФУНКЦИЮ. Если URL развёртывания изменится — впишите новый ниже.
function tgInstallWebhook(){
  var URL = 'https://script.google.com/macros/s/AKfycbwQXZ_vJOp1zk99jBLqz2mpHrCAIY90vMi8s9SJ_M_Q3W8Yaq9RKzZlW2AbFAH1gUd3/exec';
  return tgSetWebhook(URL);
}
function tgWebhookInfo(){ var r=tgApi_('getWebhookInfo'); Logger.log(JSON.stringify(r)); return r; }
// Убрать webhook (нужно для перехода на опрос getUpdates).
function tgDeleteWebhook(){ var r=tgApi_('deleteWebhook', { drop_pending_updates:true }); Logger.log(JSON.stringify(r)); return r; }
// Переключиться на опрос: убрать webhook. Дальше поставьте триггер на tgPullUpdates каждую минуту.
function tgUsePolling(){
  tgDeleteWebhook();
  var r=tgPullUpdates();
  Logger.log('Webhook удалён. Теперь поставьте триггер по времени на tgPullUpdates (каждую минуту). Проверка getUpdates: '+JSON.stringify(r));
  return r;
}
// Зарегистрировать команды в меню бота (необязательно, для удобства).
function tgSetCommands(){
  return tgApi_('setMyCommands', { commands:[
    { command:'start',   description:'Бошлаш / Начало' },
    { command:'app',     description:'Иловани очиш / Открыть приложение' },
    { command:'manager', description:'Регистрация управляющего' },
    { command:'report',  description:'Отчёт (для управляющего)' },
    { command:'debtor',  description:'Дебиторка / кредиторка' },
    { command:'receipts',description:'Поступления сегодня' },
    { command:'sku',     description:'Заказы по SKU (Лаваши/Булочки/Хлеб)' },
    { command:'shipsku', description:'Отправка по SKU (заказано/отправлено %)' },
    { command:'limits',  description:'Лимиты долга (превышения и близкие)' }
  ]});
}

/* ─────────────── вспомогательное ─────────────── */
function tgParseDeadline_(s){
  var m=/(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})/.exec(String(s||''));
  if(!m) return null;
  return new Date(+m[3], +m[2]-1, +m[1], +m[4], +m[5], 0);
}
function tgSameDate_(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function tgOrdered_(client, shipDate){
  return readOrders_().some(function(o){ return norm(o.client)===norm(client) && fmtDate(o.shipDate)===shipDate; });
}
function tgStateKey_(client, ship){ return 'TGS:'+norm(client)+':'+ship; }
function tgGetState_(client, ship){ var s=PropertiesService.getScriptProperties().getProperty(tgStateKey_(client,ship)); return s?s.split(','):[]; }
function tgAddState_(client, ship, stage){
  var a=tgGetState_(client,ship); if(a.indexOf(stage)<0) a.push(stage);
  PropertiesService.getScriptProperties().setProperty(tgStateKey_(client,ship), a.join(','));
}

// Тексты напоминаний по этапам.
function tgMsg_(stage, client, hhmm, lang){
  if(lang==='uz'){
    switch(stage){
      case 'day':  return '🛎 Ҳурматли дилер «'+client+'»!\nБугун — <b>буюртма куни</b>. Илтимос, иловада буюртма беринг.\nДедлайн бугун соат <b>'+hhmm+'</b>да.';
      case 'h5':   return '⏳ «'+client+'»: буюртма дедлайнигача тахминан <b>5 соат</b> қолди.\nИлтимос, буюртма беринг — дедлайн соат <b>'+hhmm+'</b>да.';
      case 'h3':   return '⏳ «'+client+'»: дедлайнгача тахминан <b>3 соат</b> қолди (<b>'+hhmm+'</b>).\nИлтимос, буюртма беринг.';
      case 'h2':   return '⚠️ «'+client+'»: дедлайнгача тахминан <b>2 соат</b> қолди (<b>'+hhmm+'</b>)!\nБуюртма беринг, акс ҳолда муддатни ўтказиб юборасиз.';
      case 'final':return '📞 Ҳурматли дилеримиз «'+client+'»!\nБуюртма беринг — буюртма дедлайнингиз тугаяпти.\nДедлайн тугаш вақти — соат <b>'+hhmm+'</b>.';
    }
    return '';
  }
  switch(stage){
    case 'day':  return '🛎 Уважаемый дилер «'+client+'»!\nСегодня <b>день заказа</b>. Пожалуйста, отправьте заказ в приложении.\nДедлайн сегодня в <b>'+hhmm+'</b>.';
    case 'h5':   return '⏳ «'+client+'»: до дедлайна заказа осталось около <b>5 часов</b>.\nОтправьте заказ — дедлайн в <b>'+hhmm+'</b>.';
    case 'h3':   return '⏳ «'+client+'»: осталось около <b>3 часов</b> до дедлайна (<b>'+hhmm+'</b>).\nПожалуйста, отправьте заказ.';
    case 'h2':   return '⚠️ «'+client+'»: осталось около <b>2 часов</b> до дедлайна (<b>'+hhmm+'</b>)!\nОтправьте заказ, иначе упустите окно.';
    case 'final':return '📞 Уважаемый наш дилер «'+client+'»!\nОтправьте заказ — ваш дедлайн по заказу заканчивается.\nВремя окончания дедлайна — <b>'+hhmm+'</b>.';
  }
  return '';
}

/* ─────────────── основной запуск (ставится на триггер каждые 30 мин) ─────────────── */
function tgRunReminders(){
  if(!tgToken_()) return { ok:false, msg:'нет токена' };
  var map=tgChatMap_();
  var sched=readSchedule_();
  var allOrders=readOrders_();
  function orderedFast(client, ship){ for(var i=0;i<allOrders.length;i++){ if(norm(allOrders[i].client)===norm(client) && fmtDate(allOrders[i].shipDate)===ship) return true; } return false; }
  var now=new Date();
  var tz=Session.getScriptTimeZone();
  var report=[];
  Object.keys(map).forEach(function(nk){
    var cl=null; sched.forEach(function(c){ if(norm(c.name)===nk) cl=c; });
    if(!cl) return;
    var info=shipInfoForClient_(cl.name);
    if(!info || info.overdue || info.deadline==='—') return;
    var dl=tgParseDeadline_(info.deadline); if(!dl) return;
    if(!tgSameDate_(dl, now)) return;                 // только в день дедлайна
    if(orderedFast(cl.name, info.shipDate)) return;    // уже заказал — не беспокоим
    var hoursLeft=(dl.getTime()-now.getTime())/3600000;
    if(hoursLeft < -0.5) return;                       // дедлайн давно прошёл
    var stage = hoursLeft<=0.5 ? 'final' : hoursLeft<=2 ? 'h2' : hoursLeft<=3 ? 'h3' : hoursLeft<=5 ? 'h5' : 'day';
    var sent=tgGetState_(cl.name, info.shipDate);
    if(sent.indexOf(stage)>=0) return;
    var hhmm=Utilities.formatDate(dl, tz, 'HH:mm');
    var lang=map[nk].lang||'ru';
    tgSend_(map[nk].chatId, tgMsg_(stage, cl.name, hhmm, lang));
    if(stage==='final'){
      var vtext = (lang==='uz')
        ? ('Ҳурматли дилер '+cl.name+'. Илтимос буюртма беринг. Дедлайнингиз соат '+hhmm+' да тугайди.')
        : ('Уважаемый дилер '+cl.name+'. Отправьте заказ. Ваш дедлайн заканчивается в '+hhmm);
      tgVoice_(map[nk].chatId, vtext);
    }
    tgAddState_(cl.name, info.shipDate, stage);
    report.push(cl.name+' → '+stage+' ('+hhmm+', '+lang+')');
  });
  return { ok:true, sent:report };
}

/* ─────────────── ручные помощники для проверки ─────────────── */
function tgRunRemindersNow(){ var r=tgRunReminders(); Logger.log(JSON.stringify(r)); return r; }

/* ─────────────── ОТЧЁТЫ УПРАВЛЯЮЩЕМУ ─────────────── */
function tgMoney_(n){ n=Math.round(Number(n)||0); return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' '); }
// Собрать текст отчёта: заказы (сегодня/не дали/завтра) + отправки (выполнение).
function tgBuildReport_(){
  var tz=Session.getScriptTimeZone();
  var now=new Date();
  var today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  var tomorrow=new Date(today.getTime()+86400000);
  var todayStr=fmtDate(today);
  var sched=readSchedule_();
  var orders=readOrders_();
  var ships=readShipments_();

  function ordSum(client, shipDate){ var q=0,s=0; orders.forEach(function(o){ if(norm(o.client)===norm(client) && fmtDate(o.shipDate)===shipDate){ q+=o.qty; s+=o.sum; } }); return {qty:q,sum:s}; }
  // День заказа = дата дедлайна по календарю (даже если время уже прошло сегодня).
  function orderDayInfo(cl, target){
    var lead = /два/i.test(cl.rule) ? 2 : 1;
    var hh=17, mm=0; var md=/([0-9]{1,2}):([0-9]{2})/.exec(cl.deadline||''); if(md){ hh=+md[1]; mm=+md[2]; }
    for(var add=0; add<=9; add++){
      var ship=new Date(now.getFullYear(), now.getMonth(), now.getDate()+add);
      var jd=ship.getDay(); var idx=(jd===0)?6:(jd-1);
      if(!cl.days || !cl.days[idx]) continue;
      var dl=new Date(ship.getFullYear(), ship.getMonth(), ship.getDate()-lead);
      if(dl.getFullYear()===target.getFullYear() && dl.getMonth()===target.getMonth() && dl.getDate()===target.getDate()){
        return { isDay:true, shipDate:fmtDate(ship),
                 deadline:fmtDateTime(new Date(ship.getFullYear(),ship.getMonth(),ship.getDate()-lead,hh,mm)) };
      }
    }
    return { isDay:false };
  }

  var todayL=[], tomoL=[];
  sched.forEach(function(c){
    var t=orderDayInfo(c, today);
    if(t.isDay){ var os=ordSum(c.name, t.shipDate);
      todayL.push({ name:c.name, sum:os.sum, qty:os.qty, gave:os.qty>0, dl:t.deadline, ship:t.shipDate }); return; }
    var tm=orderDayInfo(c, tomorrow);
    if(tm.isDay){ var os2=ordSum(c.name, tm.shipDate);
      tomoL.push({ name:c.name, sum:os2.sum, qty:os2.qty, gave:os2.qty>0, dl:tm.deadline, ship:tm.shipDate }); }
  });

  // отправки сегодня: заказано vs отправлено
  var ord={}, shp={};
  orders.forEach(function(o){ if(fmtDate(o.shipDate)===todayStr){ var k=norm(o.client); (ord[k]=ord[k]||{name:o.client,qty:0,sum:0}); ord[k].qty+=o.qty; ord[k].sum+=o.sum; } });
  ships.forEach(function(s){ if(fmtDate(s.shipDate)===todayStr){ var k=norm(s.client); (shp[k]=shp[k]||{qty:0,sum:0,comment:'',name:s.client}); shp[k].qty+=s.shipped; shp[k].sum+=s.sum; if(s.comment) shp[k].comment=s.comment; } });

  var L=[];
  L.push('📊 <b>Отчёт · '+Utilities.formatDate(now, tz, 'dd.MM.yyyy HH:mm')+'</b>');

  // ── Заказы: дедлайн сегодня ──
  L.push('');
  L.push('📦 <b>ЗАКАЗЫ — дедлайн сегодня</b>');
  if(!todayL.length){
    L.push('Сегодня клиентов с дедлайном нет.');
  } else {
    var gaveT=todayL.filter(function(x){return x.gave;}).sort(function(a,b){return b.sum-a.sum;});
    var noT  =todayL.filter(function(x){return !x.gave;});
    if(gaveT.length){ var tot=0; L.push('✅ Дали заказ:'); gaveT.forEach(function(p){ tot+=p.sum; L.push('• '+p.name+' — <b>'+tgMoney_(p.sum)+'</b> сум ('+p.qty+' шт)'); }); L.push('Итого: '+gaveT.length+' клиент(ов), <b>'+tgMoney_(tot)+'</b> сум'); }
    else L.push('✅ Дали заказ: —');
    if(noT.length){ L.push('⛔️ Не дали заказ ('+noT.length+'):'); noT.forEach(function(p){ L.push('• '+p.name+' (дедлайн '+p.dl+')'); }); }
    else L.push('⛔️ Не дали заказ: —');
  }

  // ── Завтра: кто уже дал / ещё не дал ──
  L.push('');
  L.push('🗓 <b>Завтра — дедлайн завтра</b>');
  if(!tomoL.length){
    L.push('На завтра клиентов с дедлайном нет.');
  } else {
    var gaveTm=tomoL.filter(function(x){return x.gave;}).sort(function(a,b){return b.sum-a.sum;});
    var noTm  =tomoL.filter(function(x){return !x.gave;});
    if(gaveTm.length){ var tot2=0; L.push('✅ Уже дали заказ:'); gaveTm.forEach(function(p){ tot2+=p.sum; L.push('• '+p.name+' — <b>'+tgMoney_(p.sum)+'</b> сум ('+p.qty+' шт)'); }); L.push('Итого: '+gaveTm.length+' клиент(ов), <b>'+tgMoney_(tot2)+'</b> сум'); }
    else L.push('✅ Уже дали заказ: —');
    if(noTm.length){ L.push('⏳ Ещё не дали (должны дать до дедлайна):'); noTm.forEach(function(p){ L.push('• '+p.name+' (дедлайн '+p.dl+')'); }); }
    else L.push('⏳ Ещё не дали: —');
  }

  // ── Отправки сегодня ──
  L.push('');
  L.push('🚚 <b>ОТПРАВКИ сегодня (выполнение)</b>');
  var allK={}; Object.keys(ord).forEach(function(k){allK[k]=1;}); Object.keys(shp).forEach(function(k){allK[k]=1;});
  var keys=Object.keys(allK);
  var shOrdSum=0, shShpSum=0, shOrdQty=0, shShpQty=0;
  var incomplete=[];   // отправки с комментарием кладовщика (недопоставка / внеплан)
  if(keys.length){
    keys.forEach(function(k){
      var o=ord[k]||{qty:0,sum:0}, s=shp[k]||{qty:0,sum:0,comment:''};
      var name=(ord[k]&&ord[k].name)||(shp[k]&&shp[k].name)||k;
      var planned=o.qty>0;
      var pct = planned ? Math.round(s.qty/o.qty*100) : (s.qty>0?100:0);
      var mark = !planned ? (s.qty>0?'📦':'⛔️') : (pct>=100?'✅':(pct>0?'🟡':'⛔️'));
      var label = planned ? (pct+'%') : (s.qty>0?'внепланово':'0%');
      shOrdSum+=o.sum; shShpSum+=s.sum; shOrdQty+=o.qty; shShpQty+=s.qty;
      var note = s.comment ? ' 📝' : '';
      L.push(mark+' '+name+' — <b>'+label+'</b> (заказ '+tgMoney_(o.sum)+' / отпр. '+tgMoney_(s.sum)+' сум)'+note);
      if(s.comment) incomplete.push(name);
    });
    var pctAll = shOrdQty>0?Math.round(shShpQty/shOrdQty*100):0;
    L.push('Итого отправки: <b>'+pctAll+'%</b> · отправлено '+tgMoney_(shShpSum)+' из '+tgMoney_(shOrdSum)+' сум');
    if(incomplete.length) L.push('📝 — есть комментарий кладовщика (нажмите кнопку ниже).');
  } else L.push('• на сегодня отправок нет');

  // ── Общий итог за день ──
  var allGave = todayL.filter(function(x){return x.gave;}).concat(tomoL.filter(function(x){return x.gave;}));
  var daySum=0, dayQty=0; allGave.forEach(function(x){ daySum+=x.sum; dayQty+=x.qty; });
  var waiting = todayL.filter(function(x){return !x.gave;}).length + tomoL.filter(function(x){return !x.gave;}).length;
  L.push('');
  L.push('━━━━━━━━━━━━━');
  L.push('📈 <b>ИТОГО ЗА ДЕНЬ</b>');
  L.push('Дали заказ: <b>'+allGave.length+'</b> клиент(ов) на <b>'+tgMoney_(daySum)+'</b> сум ('+tgMoney_(dayQty)+' шт)');
  L.push('Ещё ждём заказ: <b>'+waiting+'</b> клиент(ов)');

  return { text:L.join('\n'), incomplete:incomplete };
}
// Кнопки для неполных отправок (по одной на клиента, если имя влезает в callback_data).
function tgReportButtons_(incomplete){
  var kb=[
    [{ text:'💰 Дебиторка / Кредиторка', callback_data:'debtor' }],
    [{ text:'🧾 Поступления сегодня', callback_data:'receipts' }],
    [{ text:'🥖 Заказы по SKU', callback_data:'sku' }],
    [{ text:'🚚 Отправка по SKU', callback_data:'shipsku' }],
    [{ text:'⚠️ Лимиты долга', callback_data:'limits' }]
  ];
  (incomplete||[]).forEach(function(name){
    var data='sc:'+name;
    if(tgBytes_(data)<=64) kb.push([{ text:'📝 Комментарий: '+name, callback_data:data }]);
  });
  return { inline_keyboard:kb };
}
function tgBytes_(s){ return encodeURIComponent(s).replace(/%[0-9A-F]{2}/g,'x').length; }
function tgSendReportTo_(chatId){
  var r=tgBuildReport_();
  var kb=tgReportButtons_(r.incomplete);
  var opt={ chat_id:String(chatId), parse_mode:'HTML', text:r.text };
  if(kb) opt.reply_markup=kb;
  return tgApi_('sendMessage', opt);
}
// Разослать отчёт всем управляющим (для триггера по времени).
function tgSendManagerReports(){
  var sh=tgSheet_(); var mgrs=tgManagerChats_(sh);
  if(!mgrs.length) return { ok:true, sent:0, note:'нет зарегистрированных управляющих' };
  mgrs.forEach(function(m){ tgSendReportTo_(m.chatId); });
  return { ok:true, sent:mgrs.length };
}
function tgReportNow(){ var r=tgSendManagerReports(); Logger.log(JSON.stringify(r)); return r; }

// Отчёт: кто вышел за лимит долга и кто близко к лимиту.
function tgBuildLimitsReport_(){
  var rows=debtLimitsAll_().filter(function(x){ return x.hasLimit; });
  var over=rows.filter(function(x){ return x.pct>100; }).sort(function(a,b){ return b.pct-a.pct; });
  var near=rows.filter(function(x){ return x.pct>=85 && x.pct<=100; }).sort(function(a,b){ return b.pct-a.pct; });
  var L=['⚠️ <b>Контроль лимитов долга</b> · '+fmtDate(new Date())];
  L.push('');
  L.push('🔴 <b>Вышли за лимит:</b>');
  if(over.length) over.forEach(function(x){ L.push('• '+x.client+' — <b>'+x.pct+'%</b> (долг '+tgMoney_(x.debt)+' / лимит '+tgMoney_(x.limit)+')'); });
  else L.push('— нет');
  L.push('');
  L.push('🟠 <b>Близко к лимиту (85–100%):</b>');
  if(near.length) near.forEach(function(x){ L.push('• '+x.client+' — <b>'+x.pct+'%</b> (долг '+tgMoney_(x.debt)+' / лимит '+tgMoney_(x.limit)+')'); });
  else L.push('— нет');
  var noLimit=debtLimitsAll_().filter(function(x){ return !x.hasLimit; }).map(function(x){return x.client;});
  if(noLimit.length){ L.push(''); L.push('<i>Без лимита (не задан): '+noLimit.join(', ')+'</i>'); }
  return L.join('\n');
}

// Группа SKU: Лаваши / Булочки / Хлеб (по классу товара, с запасным разбором по названию).
function tgSkuGroup_(cls, name){
  var c=norm(cls);
  if(c.indexOf('лаваш')>=0) return 'Лаваши';
  if(c.indexOf('булоч')>=0) return 'Булочки';
  if(c.indexOf('хлеб')>=0)  return 'Хлеб';
  var n=norm(name);
  if(/лаваш|тортил/.test(n)) return 'Лаваши';
  if(/булоч|хот|лонгер|батон|бургер|биг|классик/.test(n)) return 'Булочки';
  if(/хлеб|пита|тостов/.test(n)) return 'Хлеб';
  return 'Прочее';
}
// Отчёт: заказано vs отправлено по SKU (коэффициент отправки), сгруппировано по группам. За сегодня.
function tgBuildShipSkuReport_(){
  var todayStr=fmtDate(new Date());
  var bySku={};  // name -> {ord, shp, cls}
  readOrders_().forEach(function(o){ if(fmtDate(o.shipDate)!==todayStr) return; var k=norm(o.name);
    (bySku[k]=bySku[k]||{name:o.name,cls:o.cls,ord:0,shp:0}); bySku[k].ord+=o.qty; });
  readShipments_().forEach(function(s){ if(fmtDate(s.shipDate)!==todayStr) return; var k=norm(s.name);
    (bySku[k]=bySku[k]||{name:s.name,cls:s.cls,ord:0,shp:0}); bySku[k].shp+=s.shipped; });

  var groups={'Лаваши':[],'Булочки':[],'Хлеб':[],'Прочее':[]};
  Object.keys(bySku).forEach(function(k){ var it=bySku[k]; groups[tgSkuGroup_(it.cls,it.name)].push(it); });

  var icon={'Лаваши':'🥙','Булочки':'🥐','Хлеб':'🍞','Прочее':'📦'};
  var L=['🚚 <b>Отправка по заказам · SKU · '+todayStr+'</b>'];
  var gOrd=0,gShp=0, any=false;
  ['Лаваши','Булочки','Хлеб','Прочее'].forEach(function(g){
    var arr=groups[g]; if(!arr.length) return;
    arr.sort(function(a,b){return b.ord-a.ord;});
    var so=0,ss=0;
    L.push(''); L.push(icon[g]+' <b>'+g.toUpperCase()+'</b>');
    arr.forEach(function(it){ so+=it.ord; ss+=it.shp; var pct=it.ord>0?Math.round(it.shp/it.ord*100):(it.shp>0?100:0);
      var mk=pct>=100?'✅':(pct>0?'🟡':'⛔️');
      L.push(mk+' '+it.name+' — заказ '+it.ord+' / отпр '+it.shp+' <b>('+pct+'%)</b>'); });
    var gp=so>0?Math.round(ss/so*100):0;
    L.push('Итого '+g+': заказ '+so+' / отпр '+ss+' <b>('+gp+'%)</b>');
    gOrd+=so; gShp+=ss; any=true;
  });
  if(!any){ L.push(''); L.push('На сегодня заказов/отправок нет.'); }
  else { var tp=gOrd>0?Math.round(gShp/gOrd*100):0; L.push(''); L.push('━━━━━━━━━━━━━'); L.push('ИТОГО: заказ '+gOrd+' / отпр '+gShp+' <b>('+tp+'%)</b>'); }
  return L.join('\n');
}

// Отчёт по заказам в разрезе SKU, сгруппированный в 3 группы. За сегодня (по дате оформления).
function tgBuildSkuReport_(){
  var todayStr=fmtDate(new Date());
  var orders=readOrders_().filter(function(o){ return fmtDate(o.orderDate)===todayStr; });
  var groups={'Лаваши':{},'Булочки':{},'Хлеб':{},'Прочее':{}};
  var gtot={'Лаваши':0,'Булочки':0,'Хлеб':0,'Прочее':0};
  orders.forEach(function(o){
    var g=tgSkuGroup_(o.cls,o.name);
    if(!groups[g][o.name]) groups[g][o.name]=0;
    groups[g][o.name]+=o.qty; gtot[g]+=o.qty;
  });
  var icon={'Лаваши':'🥙','Булочки':'🥐','Хлеб':'🍞','Прочее':'📦'};
  var L=['🥖 <b>Заказы по SKU · '+todayStr+'</b>','<i>(заказы, оформленные сегодня)</i>'];
  var grand=0;
  ['Лаваши','Булочки','Хлеб','Прочее'].forEach(function(g){
    var names=Object.keys(groups[g]); if(!names.length) return;
    grand+=gtot[g];
    L.push(''); L.push(icon[g]+' <b>'+g.toUpperCase()+'</b> — итого '+gtot[g]+' шт');
    names.map(function(n){return {n:n,q:groups[g][n]};}).sort(function(a,b){return b.q-a.q;})
      .forEach(function(x){ L.push('• '+x.n+' — <b>'+x.q+'</b> шт'); });
  });
  if(grand===0){ L.push(''); L.push('Сегодня заказов нет.'); }
  else { L.push(''); L.push('━━━━━━━━━━━━━'); L.push('ИТОГО: <b>'+grand+'</b> шт'); }
  return L.join('\n');
}

// Сальдо по контрагентам (дебиторка/кредиторка) для бота.
function tgBuildDebtorReport_(){
  var saldo=readSaldo_(), receipts=readReceipts_(), ships=readShipments_(), returns=readReturns_();
  var U={};
  function unit(n){ var k=norm(n); if(!U[k])U[k]={name:n,opening:0,real:0,receipt:0,ret:0}; return U[k]; }
  saldo.forEach(function(s){ unit(s.client).opening += (s.debit - s.credit); });
  ships.forEach(function(s){ unit(s.client).real += s.sum; });
  receipts.forEach(function(r){ unit(r.client).receipt += r.sum; });
  returns.forEach(function(rt){ if(rt.status!=='Принято')return; unit(rt.client).ret += rt.sum; });
  var rows=[], deb=0, cred=0;
  Object.keys(U).forEach(function(k){ var u=U[k]; var bal=u.opening+u.real-u.receipt-u.ret;
    if(bal>0) deb+=bal; else cred+=(-bal);
    if(Math.round(bal)!==0) rows.push({name:u.name, bal:Math.round(bal)});
  });
  rows.sort(function(a,b){ return b.bal-a.bal; });
  var L=[];
  L.push('💰 <b>Сальдо по контрагентам</b> · '+fmtDate(new Date()));
  L.push('🔴 Дебиторка (нам должны): <b>'+tgMoney_(deb)+'</b> сум');
  L.push('🟢 Кредиторка (мы должны): <b>'+tgMoney_(cred)+'</b> сум');
  var debtors=rows.filter(function(r){return r.bal>0;});
  var creds=rows.filter(function(r){return r.bal<0;});
  L.push('');
  L.push('<b>🔴 Дебиторы:</b>');
  if(debtors.length) debtors.forEach(function(r){ L.push('• '+r.name+' — '+tgMoney_(r.bal)); });
  else L.push('—');
  if(creds.length){ L.push(''); L.push('<b>🟢 Кредиторы (мы должны):</b>'); creds.forEach(function(r){ L.push('• '+r.name+' — '+tgMoney_(-r.bal)); }); }
  return L.join('\n');
}

// Поступления за сегодня для бота.
function tgBuildReceiptsToday_(){
  var todayStr=fmtDate(new Date());
  var receipts=readReceipts_().filter(function(r){ return fmtDate(r.date)===todayStr; });
  var by={}, cash=0, bank=0, tot=0;
  receipts.forEach(function(r){ var k=norm(r.client); (by[k]=by[k]||{name:r.client,sum:0,cash:0,bank:0}); by[k].sum+=r.sum; tot+=r.sum;
    if(/касс|нал/i.test(r.type)){ by[k].cash+=r.sum; cash+=r.sum; } else { by[k].bank+=r.sum; bank+=r.sum; } });
  var L=[];
  L.push('🧾 <b>Поступления сегодня</b> · '+todayStr);
  var keys=Object.keys(by);
  if(!keys.length){ L.push('Сегодня поступлений нет.'); return L.join('\n'); }
  keys.map(function(k){return by[k];}).sort(function(a,b){return b.sum-a.sum;}).forEach(function(c){
    var det = (c.cash&&c.bank) ? (' (нал '+tgMoney_(c.cash)+' / банк '+tgMoney_(c.bank)+')')
            : (c.cash ? ' (наличные)' : ' (банк)');
    L.push('• '+c.name+' — <b>'+tgMoney_(c.sum)+'</b> сум'+det);
  });
  L.push('');
  L.push('Итого: <b>'+tgMoney_(tot)+'</b> сум · наличные '+tgMoney_(cash)+' · банк '+tgMoney_(bank));
  return L.join('\n');
}
// Прислать комментарий кладовщика + список позиций с расхождением по сегодняшней отправке клиента.
function tgSendShipComment_(chatId, client){
  var todayStr=fmtDate(new Date());
  var diffs=[], comment='', ordTot=0, shipTot=0, sumTot=0;
  readShipments_().forEach(function(s){
    if(norm(s.client)===norm(client) && fmtDate(s.shipDate)===todayStr){
      ordTot+=s.ordered; shipTot+=s.shipped; sumTot+=s.sum;
      if(s.comment) comment=s.comment;
      if(s.ordered!==s.shipped) diffs.push(s);
    }
  });
  var pct = ordTot>0 ? Math.round(shipTot/ordTot*100) : (shipTot>0?100:0);
  var L=[];
  L.push('📝 <b>Комментарий по отправке «'+client+'»</b>');
  L.push('Выполнение: <b>'+pct+'%</b> (заказ '+ordTot+' шт / отпр. '+shipTot+' шт · '+tgMoney_(sumTot)+' сум)');
  if(diffs.length){
    L.push('');
    L.push('<b>Расхождения по позициям:</b>');
    diffs.forEach(function(s){
      var d=s.shipped-s.ordered;
      var tag = (s.ordered===0) ? 'внепланово' : (d>0 ? ('больше на '+d) : ('меньше на '+(-d)));
      L.push('• '+s.name+': заказ '+s.ordered+' → отпр. '+s.shipped+' <b>('+tag+')</b>');
    });
  } else {
    L.push('');
    L.push('Количество совпадает с заказом (расхождений по позициям нет).');
  }
  L.push('');
  L.push('💬 '+(comment || 'Комментарий не заполнен.'));
  tgApi_('sendMessage', { chat_id:String(chatId), parse_mode:'HTML', text:L.join('\n') });
}

// Подробная диагностика напоминаний: почему отправляется/не отправляется.
function tgDiagReminders(){
  var out=[];
  var tz=Session.getScriptTimeZone();
  var now=new Date();
  out.push('Часовой пояс проекта: '+tz);
  out.push('Сейчас (по этому поясу): '+Utilities.formatDate(now, tz, 'dd.MM.yyyy HH:mm EEE'));
  out.push('Токен задан: '+(!!tgToken_()));
  var map=tgChatMap_();
  var keys=Object.keys(map);
  out.push('Привязанных чатов: '+keys.length+(keys.length?(' → '+keys.join(', ')):''));
  var sched=readSchedule_();
  if(!keys.length) out.push('⚠ Ни один регион не привязан к чату — напоминать некому. Дилеры должны нажать Start и выбрать регион.');
  keys.forEach(function(nk){
    var cl=null; sched.forEach(function(c){ if(norm(c.name)===nk) cl=c; });
    if(!cl){ out.push('• '+nk+': нет такого региона в графике'); return; }
    var info=shipInfoForClient_(cl.name);
    if(!info){ out.push('• '+cl.name+': shipInfo=null (нет в расписании)'); return; }
    var dl=tgParseDeadline_(info.deadline);
    var hLeft = dl ? Math.round((dl.getTime()-now.getTime())/360000)/10 : null;
    var stage = (dl && hLeft!=null) ? (hLeft<=0.5?'final':hLeft<=2?'h2':hLeft<=3?'h3':hLeft<=5?'h5':'day') : '—';
    var sameDay = dl ? tgSameDate_(dl, now) : false;
    var ordered = tgOrdered_(cl.name, info.shipDate);
    var sent = tgGetState_(cl.name, info.shipDate);
    var why='';
    if(info.overdue || info.deadline==='—') why='нет активного окна (overdue)';
    else if(!dl) why='не распознан дедлайн';
    else if(!sameDay) why='дедлайн НЕ сегодня (см. часовой пояс!)';
    else if(ordered) why='заказ уже сделан';
    else if(hLeft<-0.5) why='дедлайн уже прошёл';
    else if(sent.indexOf(stage)>=0) why='этап «'+stage+'» уже отправлялся';
    else why='✅ ОТПРАВИТ этап «'+stage+'»';
    out.push('• '+cl.name+' | дедлайн="'+info.deadline+'" | сегодня='+sameDay+
             ' | заказал='+ordered+' | осталось='+hLeft+'ч | этап='+stage+
             ' | отправлено='+JSON.stringify(sent)+' → '+why);
  });
  var msg=out.join('\n');
  Logger.log(msg);
  return msg;
}

function tgTest(chatId, text){ return tgSend_(chatId, text||'Тест: бот GOLD LAVASH на связи ✅'); }
// Разослать произвольный текст всем привязанным дилерам.
function tgBroadcast(text){
  var map=tgChatMap_(), n=0;
  Object.keys(map).forEach(function(k){ tgSend_(map[k].chatId, text); n++; });
  return { sent:n };
}
// Сбросить «память» отправленных этапов (если нужно проверить заново).
function tgResetState(){
  var p=PropertiesService.getScriptProperties(), all=p.getProperties(), n=0;
  Object.keys(all).forEach(function(k){ if(k.indexOf('TGS:')===0){ p.deleteProperty(k); n++; } });
  return { cleared:n };
}