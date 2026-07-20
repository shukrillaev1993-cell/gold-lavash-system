// ============================================================
// GOLD LAVASH — МОБИЛЬНЫЙ PWA ИНТЕРФЕЙС
// Оптимизирован для iOS и Android
// URL: /exec?mobile=1
// ============================================================

function buildMobileSPA() {
  return getMobileSpaHtml();
}

function getMobileSpaHtml() {
  var lines = [];
  var DEPLOY_URL = ScriptApp.getService().getUrl();

  lines.push('<!DOCTYPE html>');
  lines.push('<html lang="ru">');
  lines.push('<head>');
  lines.push('<meta charset="UTF-8">');
  lines.push('<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">');
  lines.push('<meta name="apple-mobile-web-app-capable" content="yes">');
  lines.push('<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">');
  lines.push('<meta name="apple-mobile-web-app-title" content="GOLD LAVASH">');
  lines.push('<meta name="theme-color" content="#121212">');
  lines.push('<title>GOLD LAVASH</title>');

  // PWA manifest inline
  var manifest = JSON.stringify({
    name: 'GOLD LAVASH',
    short_name: 'GL',
    description: 'Производственная система GOLD LAVASH',
    start_url: DEPLOY_URL + '?mobile=1',
    display: 'standalone',
    background_color: '#121212',
    theme_color: '#F9A825',
    orientation: 'portrait',
    icons: [
      {src: 'https://via.placeholder.com/192x192/F9A825/000000?text=GL', sizes: '192x192', type: 'image/png'},
      {src: 'https://via.placeholder.com/512x512/F9A825/000000?text=GL', sizes: '512x512', type: 'image/png'}
    ]
  });
  lines.push('<link rel="manifest" href="data:application/json,' + encodeURIComponent(manifest) + '">');

  // iOS icons
  lines.push('<link rel="apple-touch-icon" href="https://via.placeholder.com/180x180/F9A825/000000?text=GL">');

  lines.push('<style>');
  getMobileStyles().forEach(function(s){ lines.push(s); });
  lines.push('</style>');
  lines.push('</head>');
  lines.push('<body>');

  // ── Экран логина ──
  lines.push('<div id="screenLogin" class="screen active">');
  lines.push('  <div class="login-bg"></div>');
  lines.push('  <div class="login-box">');
  lines.push('    <div class="login-logo">');
  lines.push('      <div class="login-ico">🫓</div>');
  lines.push('      <div class="login-title">GOLD LAVASH</div>');
  lines.push('      <div class="login-sub">ПРОИЗВОДСТВЕННАЯ СИСТЕМА</div>');
  lines.push('    </div>');
  lines.push('    <div class="login-card">');
  lines.push('      <input class="minput" id="iLogin" type="text" placeholder="Логин" autocomplete="username">');
  lines.push('      <input class="minput" id="iPass" type="password" placeholder="Пароль" autocomplete="current-password">');
  lines.push('      <div id="loginErr" class="merr" style="display:none"></div>');
  lines.push('      <button class="mbtn-primary" id="btnLogin">ВОЙТИ</button>');
  lines.push('    </div>');
  lines.push('    <div class="login-ver">GOLD LAVASH v1.3 · Mobile</div>');
  lines.push('  </div>');
  lines.push('</div>');

  // ── Главный экран приложения ──
  lines.push('<div id="screenApp" class="screen">');

  // Header
  lines.push('  <div class="mhdr" id="mhdr">');
  lines.push('    <div class="mhdr-title" id="mhdrTitle">GOLD LAVASH</div>');
  lines.push('    <div class="mhdr-user" id="mhdrUser"></div>');
  lines.push('  </div>');

  // Content area
  lines.push('  <div class="mcontent" id="mcontent">');
  lines.push('    <div class="mloader" id="mloader"><div class="mspin"></div></div>');
  lines.push('  </div>');

  // Bottom navigation
  lines.push('  <div class="mbnav" id="mbnav">');
  lines.push('    <div class="mbnav-item active" id="mbn-home" onclick="mnav(\'home\')">');
  lines.push('      <span class="mbn-ico">🏠</span>');
  lines.push('      <span class="mbn-lbl">Главная</span>');
  lines.push('    </div>');
  lines.push('    <div class="mbnav-item" id="mbn-work" onclick="mnav(\'work\')">');
  lines.push('      <span class="mbn-ico">🏭</span>');
  lines.push('      <span class="mbn-lbl">Работа</span>');
  lines.push('    </div>');
  lines.push('    <div class="mbnav-item" id="mbn-equip" onclick="mnav(\'equip\')">');
  lines.push('      <span class="mbn-ico" id="mbn-equip-ico">🔧</span>');
  lines.push('      <span class="mbn-lbl" id="mbn-equip-lbl">Оборудование</span>');
  lines.push('      <span class="mbn-badge" id="mbnBadge" style="display:none"></span>');
  lines.push('    </div>');
  lines.push('    <div class="mbnav-item" id="mbn-info" onclick="mnav(\'info\')">');
  lines.push('      <span class="mbn-ico">📋</span>');
  lines.push('      <span class="mbn-lbl">Инфо</span>');
  lines.push('    </div>');
  lines.push('  </div>');

  lines.push('</div>');

  // Toast
  lines.push('<div id="mtoast" class="mtoast"></div>');

  // Баннер тревоги для iOS — статичный, без анимации, большая кнопка
  lines.push('<div id="alarmBanner" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;background:rgba(0,0,0,0.85);display:none;align-items:center;justify-content:center;">');
  lines.push('  <div style="background:#B71C1C;border-radius:20px;padding:32px 24px;margin:24px;text-align:center;max-width:340px;width:100%;">');
  lines.push('    <div style="font-size:48px;margin-bottom:16px;">🚨</div>');
  lines.push('    <div style="color:#fff;font-size:22px;font-weight:700;margin-bottom:8px;">ПОЛОМКА!</div>');
  lines.push('    <div style="color:rgba(255,255,255,.8);font-size:15px;margin-bottom:24px;">Есть заявка от бригадира</div>');
  lines.push('    <button id="alarmSoundBtn" style="background:#fff;color:#B71C1C;border:none;border-radius:14px;padding:18px 32px;font-size:18px;font-weight:700;width:100%;cursor:pointer;">');
  lines.push('      🔔 Включить звук');
  lines.push('    </button>');
  lines.push('    <div style="color:rgba(255,255,255,.5);font-size:12px;margin-top:12px;">Нажмите кнопку для звукового сигнала</div>');
  lines.push('  </div>');
  lines.push('</div>');

  // Модалка поломки
  lines.push('<div id="mdlBreakMob" class="mob-modal" style="display:none">');
  lines.push('  <div class="mob-modal-box">');
  lines.push('    <div class="mob-modal-title">🚨 Сигнал о поломке</div>');
  lines.push('    <div id="mobBdSecName" class="mob-modal-sec"></div>');
  lines.push('    <textarea id="mobBdComment" class="mob-textarea" placeholder="Опишите проблему подробно..." rows="4"></textarea>');
  lines.push('    <button class="mbtn-danger" onclick="mobSubmitBreakdown()">🚨 Подать сигнал</button>');
  lines.push('    <button class="mbtn-ghost" onclick="closeMobMdl(\'mdlBreakMob\')">Отмена</button>');
  lines.push('  </div>');
  lines.push('</div>');

  // Модалка закрытия заявки (механик)
  lines.push('<div id="mdlCloseMob" class="mob-modal" style="display:none">');
  lines.push('  <div class="mob-modal-box">');
  lines.push('    <div class="mob-modal-title">✅ Закрыть заявку</div>');
  lines.push('    <div id="mobCtInfo" class="mob-modal-sec"></div>');
  lines.push('    <textarea id="mobCtReport" class="mob-textarea" placeholder="Причина и как устранили..." rows="4"></textarea>');
  lines.push('    <button class="mbtn-primary" onclick="mobSubmitClose()">✅ Закрыть</button>');
  lines.push('    <button class="mbtn-ghost" onclick="closeMobMdl(\'mdlCloseMob\')">Отмена</button>');
  lines.push('  </div>');
  lines.push('</div>');

  lines.push('<script>');
  getMobileJs().forEach(function(s){ lines.push(s); });
  lines.push('</script>');

  lines.push('</body>');
  lines.push('</html>');

  return lines.join('\n');
}

// ─── CSS ──────────────────────────────────────────────────────
function getMobileStyles() {
  return [
    ':root{--bg:#121212;--s1:#1E1E1E;--s2:#2A2A2A;--bd:#333;--txt:#F5F5F5;--sub:#9E9E9E;--g:#F9A825;--ok:#66BB6A;--err:#EF5350;--warn:#FFA726;--bnav:60px;}',
    '*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}',
    'body{background:var(--bg);color:var(--txt);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:16px;overflow:hidden;height:100vh;height:100dvh;}',

    // Screens
    '.screen{position:fixed;inset:0;display:none;flex-direction:column;}',
    '.screen.active{display:flex;}',

    // Login
    '.login-bg{position:absolute;inset:0;background:linear-gradient(160deg,#1a1000 0%,#0d0d0d 100%);}',
    '.login-box{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:24px;}',
    '.login-logo{text-align:center;margin-bottom:40px;}',
    '.login-ico{font-size:64px;margin-bottom:12px;}',
    '.login-title{font-size:28px;font-weight:800;letter-spacing:3px;color:var(--g);}',
    '.login-sub{font-size:12px;color:var(--sub);margin-top:4px;letter-spacing:1px;}',
    '.login-card{width:100%;max-width:360px;display:flex;flex-direction:column;gap:12px;}',
    '.login-ver{margin-top:32px;font-size:12px;color:rgba(255,255,255,.2);}',

    // Inputs
    '.minput{width:100%;background:var(--s2);border:1.5px solid var(--bd);border-radius:14px;padding:16px 18px;color:var(--txt);font-size:17px;outline:none;transition:border-color .15s;}',
    '.minput:focus{border-color:var(--g);}',
    '.merr{background:rgba(239,83,80,.15);border:1px solid var(--err);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--err);}',

    // Buttons
    '.mbtn-primary{width:100%;background:linear-gradient(135deg,#F9A825,#F57F17);color:#000;border:none;border-radius:14px;padding:18px;font-size:17px;font-weight:700;letter-spacing:1px;cursor:pointer;transition:transform .1s,opacity .1s;}',
    '.mbtn-primary:active{transform:scale(.97);opacity:.9;}',
    '.mbtn-danger{width:100%;background:var(--err);color:#fff;border:none;border-radius:14px;padding:18px;font-size:17px;font-weight:700;cursor:pointer;margin-bottom:10px;}',
    '.mbtn-danger:active{opacity:.85;}',
    '.mbtn-ghost{width:100%;background:transparent;color:var(--sub);border:1.5px solid var(--bd);border-radius:14px;padding:16px;font-size:16px;cursor:pointer;}',
    '.mbtn-ghost:active{opacity:.7;}',
    '.mbtn-ok{background:var(--ok);color:#fff;border:none;border-radius:12px;padding:14px 24px;font-size:16px;font-weight:600;cursor:pointer;width:100%;}',
    '.mbtn-warn{background:var(--warn);color:#000;border:none;border-radius:12px;padding:14px 24px;font-size:16px;font-weight:600;cursor:pointer;width:100%;}',

    // Header
    '.mhdr{position:fixed;top:0;left:0;right:0;height:56px;background:var(--s1);border-bottom:1px solid var(--bd);display:flex;align-items:center;justify-content:space-between;padding:0 16px;z-index:100;padding-top:env(safe-area-inset-top);}',
    '.mhdr-title{font-size:18px;font-weight:700;color:var(--g);}',
    '.mhdr-user{font-size:13px;color:var(--sub);text-align:right;line-height:1.3;}',

    // Content
    '.mcontent{position:fixed;top:56px;left:0;right:0;bottom:calc(var(--bnav) + env(safe-area-inset-bottom));overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px;}',

    // Bottom nav
    '.mbnav{position:fixed;bottom:0;left:0;right:0;height:var(--bnav);background:var(--s1);border-top:1px solid var(--bd);display:flex;padding-bottom:env(safe-area-inset-bottom);z-index:100;}',
    '.mbnav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;position:relative;gap:2px;transition:opacity .1s;}',
    '.mbnav-item:active{opacity:.6;}',
    '.mbn-ico{font-size:22px;line-height:1;}',
    '.mbn-lbl{font-size:11px;color:var(--sub);transition:color .15s;}',
    '.mbnav-item.active .mbn-lbl{color:var(--g);}',
    '.mbnav-item.alert .mbn-ico{animation:mechPulse 1s infinite;}',
    '.mbnav-item.alert .mbn-lbl{color:var(--err) !important;}',
    '.mbn-badge{position:absolute;top:6px;right:calc(50% - 18px);background:var(--err);color:#fff;border-radius:10px;font-size:11px;font-weight:700;padding:1px 6px;min-width:18px;text-align:center;}',

    // Cards
    '.mcard{background:var(--s1);border-radius:16px;padding:16px;margin-bottom:12px;}',
    '.mcard-title{font-size:15px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px;}',
    '.mcard-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--bd);}',
    '.mcard-row:last-child{border-bottom:none;}',
    '.mcard-lbl{color:var(--sub);font-size:14px;}',
    '.mcard-val{font-size:14px;font-weight:600;}',

    // KPI
    '.mkpi-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}',
    '.mkpi{background:var(--s1);border-radius:14px;padding:14px;text-align:center;}',
    '.mkpi-val{font-size:26px;font-weight:700;}',
    '.mkpi-lbl{font-size:12px;color:var(--sub);margin-top:2px;}',

    // Section tiles
    '.msec-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}',
    '.msec-tile{background:var(--s1);border-radius:16px;padding:20px 12px;text-align:center;cursor:pointer;border:2px solid transparent;transition:all .15s;}',
    '.msec-tile:active{transform:scale(.96);}',
    '.msec-tile.green{border-color:rgba(102,187,106,.4);}',
    '.msec-tile.red{border-color:var(--err);background:rgba(239,83,80,.1);animation:mechPulse 1.2s infinite;}',
    '.msec-tile.yellow{border-color:var(--warn);background:rgba(255,167,38,.08);}',
    '.msec-ico{font-size:36px;margin-bottom:8px;}',
    '.msec-name{font-size:13px;font-weight:600;line-height:1.3;}',
    '.msec-status{font-size:20px;margin-top:8px;}',

    // Alerts
    '.malert{border-radius:16px;padding:16px;margin-bottom:12px;}',
    '.malert.new{background:rgba(239,83,80,.15);border:2px solid var(--err);}',
    '.malert.accepted{background:rgba(255,167,38,.1);border:2px solid var(--warn);}',
    '.malert-title{font-size:16px;font-weight:700;margin-bottom:6px;}',
    '.malert-meta{font-size:13px;color:var(--sub);margin-bottom:10px;}',
    '.malert-comment{font-size:14px;margin-bottom:14px;}',
    '.malert-btns{display:flex;gap:8px;}',
    '.malert-btns button{flex:1;}',

    // Modals
    '.mob-modal{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:200;display:flex;align-items:flex-end;}',
    '.mob-modal-box{width:100%;background:var(--s1);border-radius:24px 24px 0 0;padding:24px;padding-bottom:calc(24px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:12px;}',
    '.mob-modal-title{font-size:18px;font-weight:700;text-align:center;margin-bottom:4px;}',
    '.mob-modal-sec{font-size:15px;color:var(--warn);text-align:center;margin-bottom:4px;}',
    '.mob-textarea{background:var(--s2);border:1.5px solid var(--bd);border-radius:12px;padding:14px;color:var(--txt);font-size:16px;resize:none;font-family:inherit;width:100%;}',
    '.mob-textarea:focus{outline:none;border-color:var(--g);}',

    // History table
    '.mhist-item{background:var(--s1);border-radius:12px;padding:14px;margin-bottom:10px;}',
    '.mhist-head{display:flex;justify-content:space-between;margin-bottom:6px;}',
    '.mhist-status{font-size:12px;padding:3px 8px;border-radius:6px;font-weight:600;}',
    '.mhist-status.ok{background:rgba(102,187,106,.2);color:var(--ok);}',
    '.mhist-status.new{background:rgba(239,83,80,.2);color:var(--err);}',
    '.mhist-status.acc{background:rgba(255,167,38,.2);color:var(--warn);}',

    // Shift writeoff
    '.mwo-row{background:var(--s1);border-radius:12px;padding:14px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;}',
    '.mwo-name{font-size:14px;font-weight:600;flex:1;}',
    '.mwo-qty{display:flex;align-items:center;gap:8px;}',
    '.mwo-input{background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:8px 10px;color:var(--txt);font-size:16px;width:80px;text-align:center;}',

    // Loader
    '.mloader{display:flex;align-items:center;justify-content:center;height:200px;}',
    '.mspin{width:36px;height:36px;border:3px solid var(--bd);border-top-color:var(--g);border-radius:50%;animation:sp 0.7s linear infinite;}',
    '@keyframes sp{to{transform:rotate(360deg)}}',
    '@keyframes mechPulse{0%,100%{opacity:1}50%{opacity:.45}}',
    '@keyframes alarmFlash{0%,100%{background:#B71C1C}50%{background:#EF5350}}',

    // Toast
    '.mtoast{position:fixed;bottom:calc(var(--bnav) + 16px + env(safe-area-inset-bottom));left:16px;right:16px;padding:14px 18px;border-radius:14px;font-size:15px;font-weight:600;text-align:center;z-index:300;opacity:0;transition:opacity .2s;pointer-events:none;}',
    '.mtoast.show{opacity:1;}',
    '.mtoast.ok{background:#1B5E20;color:#A5D6A7;}',
    '.mtoast.err{background:#B71C1C;color:#FFCDD2;}',

    // Empty
    '.mempty{text-align:center;padding:60px 20px;color:var(--sub);}',
    '.mempty-ico{font-size:48px;margin-bottom:12px;}',
    '.mempty-t{font-size:16px;}',

    // Logout btn
    '.mlogout{display:flex;align-items:center;gap:8px;background:rgba(239,83,80,.1);border:1px solid rgba(239,83,80,.3);border-radius:12px;padding:14px 16px;cursor:pointer;color:var(--err);font-size:15px;font-weight:600;width:100%;justify-content:center;margin-top:8px;}',
  ];
}

// ─── JS ───────────────────────────────────────────────────────
function getMobileJs() {
  var js = [];

  js.push('var TOKEN = null, USER = null;');
  js.push('var mobCurrentSection = null, mobCurrentTicketId = null;');
  js.push('var mobAudioCtx = null, mobAlarmInterval = null;');
  js.push('var mobAlertTimer = null;');
  js.push('');

  // ── srv helper ──
  js.push('function srv(action, data, cb) {');
  js.push('  if (!data) data = {};');
  js.push('  data.action = action;');
  js.push('  if (TOKEN) data.token = TOKEN;');
  js.push('  google.script.run');
  js.push('    .withSuccessHandler(function(raw) {');
  js.push('      try { var r = typeof raw==="string" ? JSON.parse(raw) : raw; if(cb) cb(r); }');
  js.push('      catch(e) { if(cb) cb({ok:false,error:"Parse error: "+e.message}); }');
  js.push('    })');
  js.push('    .withFailureHandler(function(e){ if(cb) cb({ok:false,error:e.message}); })');
  js.push('    .handleAction(JSON.stringify(data));');
  js.push('}');
  js.push('');

  // ── Toast ──
  js.push('function mtoast(msg, type) {');
  js.push('  var el = document.getElementById("mtoast");');
  js.push('  el.textContent = msg; el.className = "mtoast " + (type||"ok") + " show";');
  js.push('  setTimeout(function(){ el.classList.remove("show"); }, 3000);');
  js.push('}');
  js.push('');

  // ── Screen ──
  js.push('function mshowScreen(id) {');
  js.push('  document.querySelectorAll(".screen").forEach(function(s){ s.classList.remove("active"); });');
  js.push('  document.getElementById(id).classList.add("active");');
  js.push('}');
  js.push('');

  // ── Login ──
  js.push('document.addEventListener("DOMContentLoaded", function() {');
  js.push('  document.getElementById("btnLogin").addEventListener("click", mDoLogin);');
  js.push('  ["iLogin","iPass"].forEach(function(id) {');
  js.push('    document.getElementById(id).addEventListener("keydown", function(e){ if(e.key==="Enter") mDoLogin(); });');
  js.push('  });');
  js.push('  // Кнопка звука в баннере тревоги — addEventListener надёжнее onclick на iOS');
  js.push('  var btn = document.getElementById("alarmSoundBtn");');
  js.push('  if (btn) {');
  js.push('    btn.addEventListener("touchend", function(e){ e.preventDefault(); onAlarmBannerTap(); });');
  js.push('    btn.addEventListener("click", onAlarmBannerTap);');
  js.push('  }');
  js.push('  document.addEventListener("touchstart", unlockMobAudio, {once:true, passive:true});');
  js.push('  document.addEventListener("click", unlockMobAudio, {once:true});');
  js.push('});');
  js.push('');

  js.push('function mDoLogin() {');
  js.push('  var login = document.getElementById("iLogin").value.trim();');
  js.push('  var pass  = document.getElementById("iPass").value;');
  js.push('  if (!login || !pass) { mshowErr("Введите логин и пароль"); return; }');
  js.push('  var btn = document.getElementById("btnLogin");');
  js.push('  btn.disabled = true; btn.textContent = "Вход...";');
  js.push('  document.getElementById("loginErr").style.display = "none";');
  js.push('  var payload = JSON.stringify({action:"login", login:login, password:pass});');
  js.push('  google.script.run');
  js.push('    .withSuccessHandler(function(raw) {');
  js.push('      btn.disabled = false; btn.textContent = "ВОЙТИ";');
  js.push('      try {');
  js.push('        var r = typeof raw === "string" ? JSON.parse(raw) : raw;');
  js.push('        if (!r.ok) { mshowErr(r.error || "Неверный логин или пароль"); return; }');
  js.push('        TOKEN = r.token; USER = r.user;');
  js.push('        mInitApp();');
  js.push('      } catch(pe) { mshowErr("Ошибка разбора ответа: " + pe.message); }');
  js.push('    })');
  js.push('    .withFailureHandler(function(e) {');
  js.push('      btn.disabled = false; btn.textContent = "ВОЙТИ";');
  js.push('      mshowErr("Сервер: " + (e.message || JSON.stringify(e)));');
  js.push('    })');
  js.push('    .handleAction(payload);');
  js.push('}');
  js.push('');

  js.push('function mshowErr(msg) {');
  js.push('  var el = document.getElementById("loginErr");');
  js.push('  el.textContent = msg; el.style.display = "block";');
  js.push('}');
  js.push('');

  // ── App init ──
  js.push('function mInitApp() {');
  js.push('  document.getElementById("mhdrUser").innerHTML =');
  js.push('    "<b>" + USER.fio + "</b><br>" + USER.role + (USER.liniya ? " · " + USER.liniya : "");');
  js.push('  mshowScreen("screenApp");');
  js.push('  mBuildNav();');
  js.push('  mnav("home");');
  js.push('  if (USER.role === "Механик" || USER.role === "Бригадир") {');
  js.push('    startMobPolling();');
  js.push('  }');
  js.push('}');
  js.push('');

  // ── Bottom nav ──
  js.push('function mBuildNav() {');
  js.push('  var role = USER.role;');
  js.push('  // Настраиваем видимость вкладок по роли');
  js.push('  var workTab = document.getElementById("mbn-work");');
  js.push('  var equipTab = document.getElementById("mbn-equip");');
  js.push('  var mechRoles = ["Механик","Бригадир","Зав.производством","Администратор"];');
  js.push('  if (mechRoles.indexOf(role) === -1) equipTab.style.display = "none";');
  js.push('  // Для механика переименуем вкладки');
  js.push('  if (role === "Механик") {');
  js.push('    document.getElementById("mbn-equip-lbl").textContent = "Заявки";');
  js.push('    document.getElementById("mbn-equip-ico").textContent = "🚨";');
  js.push('    workTab.style.display = "none";');
  js.push('  }');
  js.push('}');
  js.push('');

  js.push('function mnav(page) {');
  js.push('  document.querySelectorAll(".mbnav-item").forEach(function(el){ el.classList.remove("active"); });');
  js.push('  var tab = document.getElementById("mbn-" + page);');
  js.push('  if (tab) tab.classList.add("active");');
  js.push('  var titles = {home:"Главная", work:"Смена", equip: USER && USER.role==="Механик" ? "Заявки" : "Оборудование", info:"Информация"};');
  js.push('  document.getElementById("mhdrTitle").textContent = titles[page] || "GOLD LAVASH";');
  js.push('  var el = document.getElementById("mcontent");');
  js.push('  el.innerHTML = "<div class=\\"mloader\\"><div class=\\"mspin\\"></div></div>";');
  js.push('  if (page === "home")  loadMobHome();');
  js.push('  if (page === "work")  loadMobWork();');
  js.push('  if (page === "equip") loadMobEquip();');
  js.push('  if (page === "info")  loadMobInfo();');
  js.push('}');
  js.push('');

  // ── HOME ──
  js.push('function loadMobHome() {');
  js.push('  srv("getDashboardData", {}, function(res) {');
  js.push('    var el = document.getElementById("mcontent");');
  js.push('    if (!res.ok) { el.innerHTML = "<div class=\\"mempty\\"><div class=\\"mempty-ico\\">⚠️</div><div class=\\"mempty-t\\">" + (res.error||"Ошибка") + "</div></div>"; return; }');
  js.push('    var d = res.data, h = "";');
  js.push('    // Приветствие');
  js.push('    h += "<div class=\\"mcard\\">";');
  js.push('    h += "<div style=\\"font-size:18px;font-weight:700\\">👋 " + USER.fio + "</div>";');
  js.push('    h += "<div style=\\"color:var(--sub);font-size:14px;margin-top:4px\\">" + USER.role;');
  js.push('    if (USER.liniya) h += " · " + USER.liniya;');
  js.push('    if (USER.smena)  h += " · " + USER.smena + " смена";');
  js.push('    h += "</div></div>";');
  js.push('    // KPI');
  js.push('    if (d.stats) {');
  js.push('      h += "<div class=\\"mkpi-grid\\">";');
  js.push('      h += "<div class=\\"mkpi\\"><div class=\\"mkpi-val\\" style=\\"color:var(--g)\\">" + d.stats.activeUsers + "</div><div class=\\"mkpi-lbl\\">Активных</div></div>";');
  js.push('      h += "<div class=\\"mkpi\\"><div class=\\"mkpi-val\\">" + d.stats.totalUsers + "</div><div class=\\"mkpi-lbl\\">Всего польз.</div></div>";');
  js.push('      h += "</div>";');
  js.push('    }');
  js.push('    // Линии');
  js.push('    if (d.lines && d.lines.length) {');
  js.push('      h += "<div class=\\"mcard\\"><div class=\\"mcard-title\\">🏭 Линии</div>";');
  js.push('      d.lines.forEach(function(l) {');
  js.push('        h += "<div class=\\"mcard-row\\">";');
  js.push('        h += "<span class=\\"mcard-lbl\\">" + l.name + "</span>";');
  js.push('        h += "<span style=\\"color:" + (l.active?"var(--ok)":"var(--sub)") + ";font-weight:600\\">" + (l.active?"● Активна":"○ Неактивна") + "</span>";');
  js.push('        h += "</div>";');
  js.push('      });');
  js.push('      h += "</div>";');
  js.push('    }');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── WORK (Бригадир/Тестодел) ──
  js.push('function loadMobWork() {');
  js.push('  var el = document.getElementById("mcontent");');
  js.push('  var role = USER.role;');
  js.push('  if (role === "Бригадир") { loadMobShift(); return; }');
  js.push('  if (role === "Тестодел" || role === "Зав.упаковщица") { loadMobWriteoff(); return; }');
  js.push('  if (role === "Зав.производством" || role === "Администратор") { loadMobDistrib(); return; }');
  js.push('  el.innerHTML = "<div class=\\"mempty\\"><div class=\\"mempty-t\\">Нет раздела для вашей роли</div></div>";');
  js.push('}');
  js.push('');

  // Смена бригадира
  js.push('function loadMobShift() {');
  js.push('  srv("getShiftStatus", {payload:{liniya:USER.liniya, smena:USER.smena}}, function(res) {');
  js.push('    var el = document.getElementById("mcontent");');
  js.push('    var h = "";');
  js.push('    if (res.ok && res.shift) {');
  js.push('      var s = res.shift;');
  js.push('      h += "<div class=\\"mcard\\"><div class=\\"mcard-title\\">🏭 Текущая смена</div>";');
  js.push('      h += "<div class=\\"mcard-row\\"><span class=\\"mcard-lbl\\">Линия</span><span class=\\"mcard-val\\">" + s.liniya + "</span></div>";');
  js.push('      h += "<div class=\\"mcard-row\\"><span class=\\"mcard-lbl\\">Смена</span><span class=\\"mcard-val\\">" + s.smena + "</span></div>";');
  js.push('      h += "<div class=\\"mcard-row\\"><span class=\\"mcard-lbl\\">Дата</span><span class=\\"mcard-val\\">" + s.date + "</span></div>";');
  js.push('      h += "</div>";');
  js.push('    }');
  js.push('    h += "<div class=\\"mcard\\"><div class=\\"mcard-title\\">⚡ Действия</div>";');
  js.push('    h += "<div style=\\"display:flex;flex-direction:column;gap:10px\\">";');
  js.push('    h += "<button class=\\"mbtn-ok\\" onclick=\\"mnav(\'equip\')\\">🔧 Оборудование</button>";');
  js.push('    h += "<button class=\\"mbtn-warn\\" onclick=\\"mnav(\'info\')\\">📋 История смен</button>";');
  js.push('    h += "</div></div>";');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── EQUIP (Бригадир видит секции, Механик видит заявки) ──
  js.push('function loadMobEquip() {');
  js.push('  if (USER.role === "Механик") { loadMobAlerts(); return; }');
  js.push('  loadMobEquipSections();');
  js.push('}');
  js.push('');

  js.push('function loadMobEquipSections() {');
  js.push('  srv("mechGetEquipment", {payload:{liniya:USER.liniya}}, function(res) {');
  js.push('    var el = document.getElementById("mcontent");');
  js.push('    if (!res.ok || !res.equipment.length) {');
  js.push('      el.innerHTML = "<div class=\\"mempty\\"><div class=\\"mempty-ico\\">🔧</div><div class=\\"mempty-t\\">Оборудование не найдено</div></div>"; return;');
  js.push('    }');
  js.push('    srv("mechGetSections", {payload:{}}, function(sRes) {');
  js.push('      srv("mechGetActiveAlerts", {}, function(aRes) {');
  js.push('        var openSecs = {};');
  js.push('        if (aRes.ok) aRes.alerts.forEach(function(a){ openSecs[a.sectionId]=a; });');
  js.push('        var sections = sRes.ok ? sRes.sections : [];');
  js.push('        var h = "";');
  js.push('        res.equipment.forEach(function(eq) {');
  js.push('          var eqSecs = sections.filter(function(s){ return s.equipId===eq.id; });');
  js.push('          h += "<div class=\\"mcard\\">";');
  js.push('          h += "<div class=\\"mcard-title\\">🔧 " + eq.name + "</div>";');
  js.push('          if (!eqSecs.length) { h += "<div style=\\"color:var(--sub);font-size:14px\\">Секции не заданы</div>"; }');
  js.push('          else {');
  js.push('            h += "<div class=\\"msec-grid\\">";');
  js.push('            eqSecs.forEach(function(sec) {');
  js.push('              var openAlert = openSecs[sec.id];');
  js.push('              var cls = openAlert ? (alert.status==="Новая"?"red":"yellow") : "green";');
  js.push('              var statusIco = cls==="red"?"🔴":cls==="yellow"?"🟡":"🟢";');
  js.push('              var clickFn = (!openAlert) ? ("onclick=\\"mobOpenBreakdown(this)\\" data-secid=\\""+sec.id+"\\" data-secname=\\""+sec.name.replace(/"/g,"&quot;")+"\\"") : "";');
  js.push('              h += "<div class=\\"msec-tile " + cls + "\\" " + clickFn + ">";');
  js.push('              h += "<div class=\\"msec-ico\\">" + sec.icon + "</div>";');
  js.push('              h += "<div class=\\"msec-name\\">" + sec.name + "</div>";');
  js.push('              h += "<div class=\\"msec-status\\">" + statusIco + "</div>";');
  js.push('              if (openAlert) h += "<div style=\\"font-size:11px;color:var(--sub);margin-top:4px\\">" + openAlert.status + "</div>";');
  js.push('              else h += "<div style=\\"font-size:11px;color:var(--sub);margin-top:4px\\">нажмите для сигнала</div>";');
  js.push('              h += "</div>";');
  js.push('            });');
  js.push('            h += "</div>";');
  js.push('          }');
  js.push('          h += "</div>";');
  js.push('        });');
  js.push('        el.innerHTML = h;');
  js.push('      });');
  js.push('    });');
  js.push('  });');
  js.push('}');
  js.push('');

  // Механик — активные заявки
  js.push('function loadMobAlerts() {');
  js.push('  srv("mechGetActiveAlerts", {}, function(res) {');
  js.push('    var el = document.getElementById("mcontent");');
  js.push('    if (!res.ok) { el.innerHTML = "<div class=\\"mempty\\"><div class=\\"mempty-t\\">" + res.error + "</div></div>"; return; }');
  js.push('    mobUpdateBadge(res.alerts.length);');
  js.push('    if (!res.alerts.length) {');
  js.push('      el.innerHTML = "<div class=\\"mempty\\"><div class=\\"mempty-ico\\">✅</div><div class=\\"mempty-t\\">Активных заявок нет</div></div>"; return;');
  js.push('    }');
  js.push('    var h = "";');
  js.push('    res.alerts.forEach(function(a) {');
  js.push('      var cls = a.status==="Новая" ? "new" : "accepted";');
  js.push('      h += "<div class=\\"malert " + cls + "\\">";');
  js.push('      h += "<div class=\\"malert-title\\">🔧 " + (a.sectionId||"Секция") + "</div>";');
  js.push('      h += "<div class=\\"malert-meta\\">Линия: " + a.liniya + " · " + a.timeOpen + "</div>";');
  js.push('      h += "<div class=\\"malert-comment\\">" + a.comment + "</div>";');
  js.push('      h += "<div class=\\"malert-btns\\">";');
  js.push('      if (a.status === "Новая") {');
  js.push('        h += "<button class=\\"mbtn-warn\\" onclick=\\"mobAccept(\'" + a.id + "\')\\">▶ Принять</button>";');
  js.push('      }');
  js.push('      if (a.status === "Принята") {');
  js.push('        h += "<button class=\\"mbtn-ok\\" onclick=\\"mobOpenClose(this)\\" data-tid=\\""+a.id+"\\" data-sec=\\""+((a.sectionId||"").replace(/"/g,"&quot;"))+"\\">\u2705 \u0417\u0430\u043a\u0440\u044b\u0442\u044c</button>";');
  js.push('      }');
  js.push('      h += "</div></div>";');
  js.push('    });');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  // INFO
  js.push('function loadMobInfo() {');
  js.push('  var h = "";');
  js.push('  h += "<div class=\\"mcard\\">";');
  js.push('  h += "<div class=\\"mcard-title\\">👤 Профиль</div>";');
  js.push('  h += "<div class=\\"mcard-row\\"><span class=\\"mcard-lbl\\">ФИО</span><span class=\\"mcard-val\\">" + USER.fio + "</span></div>";');
  js.push('  h += "<div class=\\"mcard-row\\"><span class=\\"mcard-lbl\\">Роль</span><span class=\\"mcard-val\\">" + USER.role + "</span></div>";');
  js.push('  if (USER.liniya) h += "<div class=\\"mcard-row\\"><span class=\\"mcard-lbl\\">Линия</span><span class=\\"mcard-val\\">" + USER.liniya + "</span></div>";');
  js.push('  if (USER.smena) h += "<div class=\\"mcard-row\\"><span class=\\"mcard-lbl\\">Смена</span><span class=\\"mcard-val\\">" + USER.smena + "</span></div>";');
  js.push('  h += "</div>";');
  js.push('  if (USER.role === "Механик") {');
  js.push('    h += "<div class=\\"mcard\\">";');
  js.push('    h += "<div class=\\"mcard-title\\">📊 Быстрая статистика</div>";');
  js.push('    srv("mechGetStats", {payload:{}}, function(res) {');
  js.push('      if (!res.ok) return;');
  js.push('      var el = document.getElementById("mcontent");');
  js.push('      var extra = "<div class=\\"mkpi-grid\\">";');
  js.push('      extra += "<div class=\\"mkpi\\"><div class=\\"mkpi-val\\" style=\\"color:var(--err)\\">" + res.totalTickets + "</div><div class=\\"mkpi-lbl\\">Всего заявок</div></div>";');
  js.push('      extra += "<div class=\\"mkpi\\"><div class=\\"mkpi-val\\" style=\\"color:var(--warn)\\">" + res.openTickets + "</div><div class=\\"mkpi-lbl\\">Открытых</div></div>";');
  js.push('      var totalH = Math.floor(res.totalDowntimeMin/60), totalM = res.totalDowntimeMin%60;');
  js.push('      extra += "<div class=\\"mkpi\\" style=\\"grid-column:span 2\\"><div class=\\"mkpi-val\\" style=\\"color:var(--err)\\">" + (totalH?totalH+"ч ":"") + totalM + "м</div><div class=\\"mkpi-lbl\\">Общий простой</div></div>";');
  js.push('      extra += "</div></div>";');
  js.push('      el.innerHTML = el.innerHTML.replace("</div></div>","") + extra;');
  js.push('    });');
  js.push('  }');
  js.push('  h += "</div>";');
  js.push('  h += "<button class=\\"mlogout\\" onclick=\\"mobLogout()\\">⬅ Выйти</button>";');
  js.push('  document.getElementById("mcontent").innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('function mobLogout() {');
  js.push('  stopMobAlarm();');
  js.push('  if (mobAlertTimer) { clearInterval(mobAlertTimer); mobAlertTimer=null; }');
  js.push('  srv("logout", {}, function() {');
  js.push('    TOKEN=null; USER=null;');
  js.push('    document.getElementById("iLogin").value="";');
  js.push('    document.getElementById("iPass").value="";');
  js.push('    mshowScreen("screenLogin");');
  js.push('  });');
  js.push('}');
  js.push('');

  // Breakdown modal
  js.push('function mobOpenBreakdown(el) {');
  js.push('  var secId = el.dataset ? el.dataset.secid : el;');
  js.push('  var secName = el.dataset ? el.dataset.secname : "";');
  js.push('  mobCurrentSection = secId;');
  js.push('  document.getElementById("mobBdSecName").textContent = "🔧 " + secName;');
  js.push('  document.getElementById("mobBdComment").value = "";');
  js.push('  document.getElementById("mdlBreakMob").style.display = "flex";');
  js.push('  setTimeout(function(){ document.getElementById("mobBdComment").focus(); }, 100);');
  js.push('}');
  js.push('function closeMobMdl(id) { document.getElementById(id).style.display = "none"; }');
  js.push('');

  js.push('function mobSubmitBreakdown() {');
  js.push('  var comment = document.getElementById("mobBdComment").value.trim();');
  js.push('  if (!comment) { mtoast("Опишите проблему", "err"); return; }');
  js.push('  srv("mechCreateTicket", {payload:{sectionId:mobCurrentSection, comment:comment}}, function(res) {');
  js.push('    if (res.ok) {');
  js.push('      startMobAlarm();');
  js.push('      closeMobMdl("mdlBreakMob");');
  js.push('      mtoast("Сигнал подан! Механик уведомлён.", "ok");');
  js.push('      loadMobEquipSections();');
  js.push('    } else mtoast(res.error, "err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // Accept/close
  js.push('function mobAccept(el) {');
  js.push('  var ticketId = el.dataset ? el.dataset.tid : el;');
  js.push('  srv("mechAcceptTicket", {payload:{ticketId:ticketId}}, function(res) {');
  js.push('    if (res.ok) { stopMobAlarm(); mtoast("Заявка принята", "ok"); loadMobAlerts(); }');
  js.push('    else mtoast(res.error, "err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function mobOpenClose(el) {');
  js.push('  var ticketId = el.dataset ? el.dataset.tid : el;');
  js.push('  var secName = el.dataset ? el.dataset.sec : "";');
  js.push('  mobCurrentTicketId = ticketId;'); // ticketId from data attr
  js.push('  document.getElementById("mobCtInfo").textContent = secName;');
  js.push('  document.getElementById("mobCtReport").value = "";');
  js.push('  document.getElementById("mdlCloseMob").style.display = "flex";');
  js.push('  setTimeout(function(){ document.getElementById("mobCtReport").focus(); }, 100);');
  js.push('}');
  js.push('');

  js.push('function mobSubmitClose() {');
  js.push('  var report = document.getElementById("mobCtReport").value.trim();');
  js.push('  if (!report) { mtoast("Напишите отчёт", "err"); return; }');
  js.push('  srv("mechCloseTicket", {payload:{ticketId:mobCurrentTicketId, report:report}}, function(res) {');
  js.push('    if (res.ok) {');
  js.push('      var m = res.downtimeMin || 0;');
  js.push('      closeMobMdl("mdlCloseMob");');
  js.push('      mtoast("Закрыто. Простой: " + Math.floor(m/60) + "ч " + (m%60) + "м", "ok");');
  js.push('      loadMobAlerts();');
  js.push('    } else mtoast(res.error, "err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // Badge
  js.push('function mobUpdateBadge(count) {');
  js.push('  var badge = document.getElementById("mbnBadge");');
  js.push('  var item  = document.getElementById("mbn-equip");');
  js.push('  if (count > 0) {');
  js.push('    badge.textContent = count; badge.style.display = "block";');
  js.push('    item.classList.add("alert");');
  js.push('  } else {');
  js.push('    badge.style.display = "none";');
  js.push('    item.classList.remove("alert");');
  js.push('  }');
  js.push('}');
  js.push('');

  // Polling
  js.push('function startMobPolling() {');
  js.push('  if (mobAlertTimer) clearInterval(mobAlertTimer);');
  js.push('  // Немедленная проверка при входе');
  js.push('  srv("mechGetActiveAlerts", {}, function(res) {');
  js.push('    if (!res.ok) return;');
  js.push('    mobUpdateBadge(res.alerts.length);');
  js.push('    if (USER.role === "Механик") {');
  js.push('      var hasNew = res.alerts.some(function(a){ return a.status === "Новая"; });');
  js.push('      if (hasNew) startMobAlarm();');
  js.push('    }');
  js.push('  });');
  js.push('  mobAlertTimer = setInterval(function() {');
  js.push('    srv("mechGetActiveAlerts", {}, function(res) {');
  js.push('      if (!res.ok) return;');
  js.push('      mobUpdateBadge(res.alerts.length);');
  js.push('      if (USER.role === "Механик") {');
  js.push('        var hasNew = res.alerts.some(function(a){ return a.status === "Новая"; });');
  js.push('        if (hasNew) startMobAlarm(); else stopMobAlarm();');
  js.push('      }');
  js.push('      var cur = document.querySelector(".mbnav-item.active");');
  js.push('      if (cur && cur.id === "mbn-equip") {');
  js.push('        if (USER.role === "Механик") loadMobAlerts();');
  js.push('        else loadMobEquipSections();');
  js.push('      }');
  js.push('    });');
  js.push('  }, 15000);');
  js.push('}');
  js.push('');

  // Audio
  js.push('function unlockMobAudio() {');
  js.push('  mobAudioUnlocked = true;');
  js.push('  if (mobAudioCtx) return;');
  js.push('  try {');
  js.push('    mobAudioCtx = new (window.AudioContext || window.webkitAudioContext)();');
  js.push('    var buf = mobAudioCtx.createBuffer(1,1,22050);');
  js.push('    var src = mobAudioCtx.createBufferSource();');
  js.push('    src.buffer = buf; src.connect(mobAudioCtx.destination); src.start(0);');
  js.push('  } catch(e) {}');
  js.push('}');
  js.push('');

  js.push('function playMobAlarm() {');
  js.push('  try {');
  js.push('    var ctx = mobAudioCtx || new (window.AudioContext || window.webkitAudioContext)();');
  js.push('    if (!mobAudioCtx) mobAudioCtx = ctx;');
  js.push('    if (ctx.state === "suspended") ctx.resume();');
  js.push('    [0, 0.35, 0.7].forEach(function(t) {');
  js.push('      var o = ctx.createOscillator(), g = ctx.createGain();');
  js.push('      o.connect(g); g.connect(ctx.destination);');
  js.push('      o.type = "square";');
  js.push('      o.frequency.setValueAtTime(880, ctx.currentTime+t);');
  js.push('      o.frequency.setValueAtTime(660, ctx.currentTime+t+0.12);');
  js.push('      g.gain.setValueAtTime(0.8, ctx.currentTime+t);');
  js.push('      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+t+0.28);');
  js.push('      o.start(ctx.currentTime+t); o.stop(ctx.currentTime+t+0.28);');
  js.push('    });');
  js.push('  } catch(e) {}');
  js.push('}');
  js.push('');

  js.push('var mobAudioUnlocked = false; // был ли AudioContext разблокирован тапом');
  js.push('');

  js.push('function startMobAlarm() {');
  js.push('  var banner = document.getElementById("alarmBanner");');
  js.push('  if (banner) banner.style.display = "flex";');
  js.push('  if (mobAlarmInterval) return;');
  js.push('  if (mobAudioUnlocked) {');
  js.push('    playMobAlarm();');
  js.push('    mobAlarmInterval = setInterval(playMobAlarm, 3000);');
  js.push('  }');
  js.push('}');
  js.push('');

  js.push('function stopMobAlarm() {');
  js.push('  if (mobAlarmInterval) { clearInterval(mobAlarmInterval); mobAlarmInterval = null; }');
  js.push('  var banner = document.getElementById("alarmBanner");');
  js.push('  if (banner) banner.style.display = "none";');
  js.push('}');
  js.push('');

  js.push('function onAlarmBannerTap() {');
  js.push('  mobAudioUnlocked = true;');
  js.push('  unlockMobAudio();');
  js.push('  // Скрываем баннер');
  js.push('  var banner = document.getElementById("alarmBanner");');
  js.push('  if (banner) banner.style.display = "none";');
  js.push('  // Запускаем непрерывный сигнал');
  js.push('  if (!mobAlarmInterval) {');
  js.push('    playMobAlarm();');
  js.push('    mobAlarmInterval = setInterval(playMobAlarm, 3000);');
  js.push('  }');
  js.push('}');

  return js;
}