// ============================================================
// GOLD LAVASH — UI v1.3 (Single Page App)
// ============================================================

// Единственная функция-точка входа для doGet
function buildSPA() {
  return getSpaHtml();
}

// Обратная совместимость (на случай если где-то вызывается)
function buildLoginPage()         { return getSpaHtml(); }
function buildAppShell(user, tok) { return getSpaHtml(); }

function getSpaHtml() {
  var lines = [];

  lines.push('<!DOCTYPE html>');
  lines.push('<html lang="ru">');
  lines.push('<head>');
  lines.push('<meta charset="UTF-8">');
  lines.push('<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=5.0">');
  lines.push('<title>GOLD LAVASH</title>');
  lines.push(getSpaCss());
  lines.push('</head>');
  lines.push('<body>');

  // ── ЭКРАН ВХОДА ──
  lines.push('<div id="screenLogin" class="screen">');
  lines.push('  <div class="login-author">&#1057;&#1086;&#1079;&#1076;&#1072;&#1090;&#1077;&#1083;&#1100;: Alimardone Shukrillayev</div>');
  lines.push('  <div class="login-wrap">');
  lines.push('    <div class="logo">');
  lines.push('      <div class="logo-icon"><img src="data:image/png;base64,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" alt="GOLD LAVASH" style="width:100%;height:100%;object-fit:contain"></div>');
  lines.push('      <div class="logo-title">GOLD LAVASH</div>');
  lines.push('      <div class="logo-sub">&#1055;&#1056;&#1054;&#1048;&#1047;&#1042;&#1054;&#1044;&#1057;&#1058;&#1042;&#1045;&#1053;&#1053;&#1040;&#1071; &#1057;&#1048;&#1057;&#1058;&#1045;&#1052;&#1040;</div>');
  lines.push('    </div>');
  lines.push('    <div class="card">');
  lines.push('      <div class="card-title">&#1042;&#1086;&#1081;&#1076;&#1080;&#1090;&#1077; &#1074; &#1089;&#1080;&#1089;&#1090;&#1077;&#1084;&#1091;</div>');
  lines.push('      <div class="field">');
  lines.push('        <label>&#1051;&#1054;&#1043;&#1048;&#1053;</label>');
  lines.push('        <input type="text" id="iLogin" autocomplete="username" placeholder="&#1042;&#1074;&#1077;&#1076;&#1080;&#1090;&#1077; &#1083;&#1086;&#1075;&#1080;&#1085;">');
  lines.push('      </div>');
  lines.push('      <div class="field">');
  lines.push('        <label>&#1055;&#1040;&#1056;&#1054;&#1051;&#1068;</label>');
  lines.push('        <input type="password" id="iPass" autocomplete="current-password" placeholder="&#1042;&#1074;&#1077;&#1076;&#1080;&#1090;&#1077; &#1087;&#1072;&#1088;&#1086;&#1083;&#1100;">');
  lines.push('      </div>');
  lines.push('      <button class="btn-login" id="btnLogin">&#1042;&#1054;&#1049;&#1058;&#1048;</button>');
  lines.push('      <div class="err-box" id="loginErr"></div>');
  lines.push('    </div>');
  lines.push('    <div class="ver">GOLD LAVASH v1.3 &copy; 2025</div>');
  lines.push('    <div id="setupLnk" style="text-align:center;margin-top:12px;display:none">');
  lines.push('      <a href="#" onclick="doSetup()" style="color:#F9A825;font-size:12px">&#9881; &#1048;&#1085;&#1080;&#1094;&#1080;&#1072;&#1083;&#1080;&#1079;&#1080;&#1088;&#1086;&#1074;&#1072;&#1090;&#1100; &#1089;&#1080;&#1089;&#1090;&#1077;&#1084;&#1091;</a>');
  lines.push('    </div>');
  lines.push('  </div>');
  lines.push('</div>');

  // ── ЗАГРУЗОЧНЫЙ ЭКРАН ──
  lines.push('<div id="screenLoading" class="screen" style="display:none">');
  lines.push('  <div style="display:flex;flex-direction:column;align-items:center;gap:16px;color:#9E9E9E">');
  lines.push('    <div class="spin" style="width:40px;height:40px;border-width:3px"></div>');
  lines.push('    <div style="font-size:14px">&#1047;&#1072;&#1075;&#1088;&#1091;&#1079;&#1082;&#1072;...</div>');
  lines.push('  </div>');
  lines.push('</div>');

  // ── ГЛАВНОЕ ПРИЛОЖЕНИЕ ──
  lines.push('<div id="screenApp" class="screen" style="display:none">');

  // Simulation banner (только видна когда Администратор симулирует другую роль)
  lines.push('  <div id="simBanner" style="display:none;background:linear-gradient(90deg,#F57C00,#FB8C00);color:#000;padding:10px 16px;align-items:center;justify-content:space-between;font-weight:600;font-size:13px;gap:10px">');
  lines.push('    <span id="simBannerText">👁️ \u0412\u044b \u0441\u043c\u043e\u0442\u0440\u0438\u0442\u0435 \u043a\u0430\u043a ...</span>');
  lines.push('    <button class="btn bs" style="padding:5px 14px;font-size:12px;background:#000;color:#fff" onclick="stopSimulation()">↩ \u0412\u0435\u0440\u043d\u0443\u0442\u044c\u0441\u044f \u043a \u0441\u0435\u0431\u0435</button>');
  lines.push('  </div>');

  // Header
  lines.push('  <div class="hdr">');
  lines.push('    <button class="menu-btn" onclick="toggleSB()">&#9776;</button>');
  lines.push('    <div class="hdr-logo">&#x1F953; GOLD<span>LAVASH</span></div>');
  lines.push('    <div class="hdr-title" id="hTitle"></div>');
  lines.push('    <div id="hdrAvatar" class="avatar" style="margin-left:auto"></div>');
  lines.push('  </div>');

  // Overlay
  lines.push('  <div class="overlay" id="overlay" onclick="closeSB()"></div>');

  // Sidebar
  lines.push('  <div class="sidebar" id="sidebar">');
  lines.push('    <div class="sb-hdr">');
  lines.push('      <span style="font-size:22px">&#x1F953;</span>');
  lines.push('      <div class="sb-logo">GOLD LAVASH</div>');
  lines.push('    </div>');
  lines.push('    <div class="sb-user" id="sbUser"></div>');
  lines.push('    <div id="navItems"></div>');
  lines.push('    <div class="sb-footer">');
  lines.push('      <button class="btn-logout" id="sbSimulateBtn" style="display:none;background:rgba(251,140,0,.15);color:#FB8C00;margin-bottom:8px" onclick="openSimulateMdl()">👁️ \u0412\u043e\u0439\u0442\u0438 \u043a\u0430\u043a \u0434\u0440\u0443\u0433\u0430\u044f \u0440\u043e\u043b\u044c</button>');
  lines.push('      <button class="btn-logout" onclick="doLogout()">&#128682; &#1042;&#1099;&#1081;&#1090;&#1080;</button>');
  lines.push('    </div>');
  lines.push('  </div>');

  // Main content
  lines.push('  <div class="main-content">');

  // Pages
  lines.push('    <div class="page active" id="pg-dashboard">');
  lines.push('      <div class="ph"><div><h1>&#128075; &#1044;&#1086;&#1073;&#1088;&#1086; &#1087;&#1086;&#1078;&#1072;&#1083;&#1086;&#1074;&#1072;&#1090;&#1100;!</h1>');
  lines.push('        <p>GOLD LAVASH &mdash; &#1055;&#1088;&#1086;&#1080;&#1079;&#1074;&#1086;&#1076;&#1089;&#1090;&#1074;&#1077;&#1085;&#1085;&#1072;&#1103; &#1089;&#1080;&#1089;&#1090;&#1077;&#1084;&#1072;</p></div></div>');
  lines.push('      <div id="dashContent"><div class="loader"><div class="spin"></div></div></div>');
  lines.push('    </div>');

  lines.push('    <div class="page" id="pg-users">');
  lines.push('      <div class="ph"><div><h1>&#128101; &#1055;&#1086;&#1083;&#1100;&#1079;&#1086;&#1074;&#1072;&#1090;&#1077;&#1083;&#1080;</h1>');
  lines.push('        <p>&#1059;&#1087;&#1088;&#1072;&#1074;&#1083;&#1077;&#1085;&#1080;&#1077; &#1076;&#1086;&#1089;&#1090;&#1091;&#1087;&#1086;&#1084;</p></div>');
  lines.push('        <button class="btn bp" onclick="openUserMdl()">+ &#1044;&#1086;&#1073;&#1072;&#1074;&#1080;&#1090;&#1100;</button></div>');
  lines.push('      <div class="srch"><span class="srch-ic">&#128269;</span>');
  lines.push('        <input type="text" id="usrSrch" oninput="filterUsrs()" placeholder="&#1055;&#1086;&#1080;&#1089;&#1082;..."></div>');
  lines.push('      <div class="card"><div id="usrTbl"><div class="loader"><div class="spin"></div></div></div></div>');
  lines.push('    </div>');

  lines.push('    <div class="page" id="pg-equipment">');
  lines.push('      <div class="ph"><div><h1>&#128295; &#1054;&#1073;&#1086;&#1088;&#1091;&#1076;&#1086;&#1074;&#1072;&#1085;&#1080;&#1077;</h1>');
  lines.push('        <p>&#1056;&#1077;&#1077;&#1089;&#1090;&#1088; &#1087;&#1086; &#1080;&#1085;&#1074;&#1077;&#1085;&#1090;&#1072;&#1088;&#1085;&#1099;&#1084; &#1085;&#1086;&#1084;&#1077;&#1088;&#1072;&#1084;</p></div>');
  lines.push('        <button class="btn bp" onclick="openEqMdl()">+ &#1044;&#1086;&#1073;&#1072;&#1074;&#1080;&#1090;&#1100;</button></div>');
  lines.push('      <div class="srch"><span class="srch-ic">&#128269;</span>');
  lines.push('        <input type="text" id="eqSrch" oninput="filterEq()" placeholder="&#1055;&#1086;&#1080;&#1089;&#1082;..."></div>');
  lines.push('      <div class="card"><div id="eqTbl"><div class="loader"><div class="spin"></div></div></div></div>');
  lines.push('    </div>');

  lines.push('    <div class="page" id="pg-lines">');
  lines.push('      <div class="ph"><div><h1>&#127981; &#1051;&#1080;&#1085;&#1080;&#1080;</h1>');
  lines.push('        <p>&#1055;&#1088;&#1086;&#1080;&#1079;&#1074;&#1086;&#1076;&#1089;&#1090;&#1074;&#1077;&#1085;&#1085;&#1099;&#1077; &#1083;&#1080;&#1085;&#1080;&#1080;</p></div>');
  lines.push('        <button class="btn bp" onclick="openLineMdl()">+ &#1044;&#1086;&#1073;&#1072;&#1074;&#1080;&#1090;&#1100;</button></div>');
  lines.push('      <div class="card" id="linesCont"><div class="loader"><div class="spin"></div></div></div>');
  lines.push('    </div>');

  // ── БРИГАДИР: СМЕНА (главный экран) ──
  lines.push('    <div class="page" id="pg-shift">');
  lines.push('      <div id="shiftContent"><div class="loader"><div class="spin"></div></div></div>');
  lines.push('    </div>');

  // ── БРИГАДИР: ИСТОРИЯ СМЕН ──
  lines.push('    <div class="page" id="pg-shifthistory">');
  lines.push('      <div class="ph"><div><h1>&#128203; &#1048;&#1089;&#1090;&#1086;&#1088;&#1080;&#1103; &#1089;&#1084;&#1077;&#1085;</h1>');
  lines.push('        <p>&#1056;&#1077;&#1079;&#1091;&#1083;&#1100;&#1090;&#1072;&#1090;&#1099; &#1087;&#1086; \u0437\u0430\u043a\u0440\u044b\u0442\u044b\u043c \u0441\u043c\u0435\u043d\u0430\u043c</p></div></div>');
  lines.push('      <div class="card" id="histCont"><div class="loader"><div class="spin"></div></div></div>');
  lines.push('    </div>');

  // ── БРИГАДИР: ЭЛЕКТРОННЫЙ ТАБЕЛЬ (просмотр месяца) ──
  lines.push('    <div class="page" id="pg-timesheet">');
  lines.push('      <div class="ph"><div><h1>&#128197; \u044d\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u043d\u044b\u0439 \u0442\u0430\u0431\u0435\u043b\u044c</h1>');
  lines.push('        <p>\u0442\u0435\u043a\u0443\u0449\u0438\u0439 \u043c\u0435\u0441\u044f\u0446, \u0432\u0430\u0448\u0430 \u043b\u0438\u043d\u0438\u044f/\u0441\u043c\u0435\u043d\u0430</p></div></div>');
  lines.push('      <div class="card"><div id="timesheetCont"><div class="loader"><div class="spin"></div></div></div></div>');
  lines.push('    </div>');

  // ── МЕХАНИК: АКТИВНЫЕ ЗАЯВКИ ──
  lines.push('    <div class="page" id="pg-mech-alerts">');
  lines.push('      <div class="ph"><div><h1>🚨 \u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0435 \u0437\u0430\u044f\u0432\u043a\u0438</h1>');
  lines.push('        <p>\u043f\u043e\u043b\u043e\u043c\u043a\u0438 \u0432 \u043e\u0436\u0438\u0434\u0430\u043d\u0438\u0438 \u0438 \u0432 \u0440\u0430\u0431\u043e\u0442\u0435</p></div>');
  lines.push('        <button class="btn bp" onclick="loadMechAlerts()">🔄 \u041e\u0431\u043d\u043e\u0432\u0438\u0442\u044c</button></div>');
  lines.push('      <div id="mechAlertsCont"><div class="loader"><div class="spin"></div></div></div>');
  lines.push('    </div>');

  // ── МЕХАНИК / БРИГАДИР: ОБОРУДОВАНИЕ ──
  lines.push('    <div class="page" id="pg-mech-equipment">');
  lines.push('      <div class="ph"><div><h1>🔧 \u041e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435</h1>');
  lines.push('        <p>\u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435 \u043b\u0438\u043d\u0438\u0439 \u2014 \u0441\u0435\u043a\u0446\u0438\u0438 \u0438 \u0441\u0442\u0430\u0442\u0443\u0441</p></div></div>');
  lines.push('      <div id="mechEquipCont"><div class="loader"><div class="spin"></div></div></div>');
  lines.push('    </div>');

  // ── МЕХАНИК: УПРАВЛЕНИЕ ОБОРУДОВАНИЕМ ──
  lines.push('    <div class="page" id="pg-mech-manage">');
  lines.push('      <div class="ph"><div><h1>⚙️ \u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430 \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044f</h1>');
  lines.push('        <p>\u0441\u043f\u0438\u0441\u043e\u043a \u043c\u0430\u0448\u0438\u043d \u0438 \u0441\u0435\u043a\u0446\u0438\u0439</p></div>');
  lines.push('        <button class="btn bp" onclick="openAddEquipMdl()">+ \u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043c\u0430\u0448\u0438\u043d\u0443</button></div>');
  lines.push('      <div id="mechManageCont"><div class="loader"><div class="spin"></div></div></div>');
  lines.push('    </div>');

  // ── МЕХАНИК: ИСТОРИЯ ЗАЯВОК ──
  lines.push('    <div class="page" id="pg-mech-history">');
  lines.push('      <div class="ph"><div><h1>📋 \u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0437\u0430\u044f\u0432\u043e\u043a</h1>');
  lines.push('        <p>\u0432\u0441\u0435 \u0437\u0430\u043a\u0440\u044b\u0442\u044b\u0435 \u0438 \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u0435 \u0437\u0430\u044f\u0432\u043a\u0438</p></div></div>');
  lines.push('      <div id="mechHistCont"><div class="loader"><div class="spin"></div></div></div>');
  lines.push('    </div>');

  // ── МЕХАНИК: СТАТИСТИКА ПРОСТОЕВ ──
  lines.push('    <div class="page" id="pg-mech-stats">');
  lines.push('      <div class="ph"><div><h1>📊 \u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430 \u043f\u0440\u043e\u0441\u0442\u043e\u044f</h1>');
  lines.push('        <p>\u0432\u0440\u0435\u043c\u044f \u043f\u0440\u043e\u0441\u0442\u043e\u044f \u043f\u043e \u043b\u0438\u043d\u0438\u044f\u043c \u0438 \u0441\u0435\u043a\u0446\u0438\u044f\u043c</p></div></div>');
  lines.push('      <div id="mechStatsCont"><div class="loader"><div class="spin"></div></div></div>');
  lines.push('    </div>');


  // ══ HR СТРАНИЦЫ ══
  lines.push('    <div class="page" id="pg-hr-dashboard">');
  lines.push('      <div class="ph"><div><h1>\uD83D\uDCCA HR \u0414\u0430\u0448\u0431\u043e\u0440\u0434</h1><p>\u043e\u0431\u0449\u0430\u044f \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430 \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u0430</p></div></div>');
  lines.push('      <div id="hrDashCont"></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-hr-employees">');
  lines.push('      <div class="ph">');
  lines.push('        <div><h1>\uD83D\uDC64 \u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0438</h1><p>\u0441\u043f\u0438\u0441\u043e\u043a \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u0430</p></div>');
  lines.push('        <button class="btn bp" onclick="openHireForm()">+ \u041f\u0440\u0438\u043d\u044f\u0442\u044c</button>');
  lines.push('      </div>');
  lines.push('      <div class="card" style="margin-bottom:12px">');
  lines.push('        <div style="display:flex;gap:8px;flex-wrap:wrap">');
  lines.push('          <input class="fi" id="hrSearch" placeholder="\u041f\u043e\u0438\u0441\u043a \u043f\u043e \u0424\u0418\u041e, \u043e\u0442\u0434\u0435\u043b\u0443..." style="flex:1;min-width:200px" oninput="hrSearchEmployees(this.value)">');
  lines.push('          <select class="fs" id="hrFilterState" onchange="loadHREmployees()" style="width:140px">');
  lines.push('            <option value="">\u0412\u0441\u0435 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u044f</option>');
  lines.push('            <option value="active">В штате</option>');
  lines.push('            <option value="fired">Уволенные</option>');
  lines.push('          </select>');
  lines.push('          <select class="fs" id="hrFilterDept" onchange="loadHREmployees()" style="width:160px">');
  lines.push('            <option value="">\u0412\u0441\u0435 \u043e\u0442\u0434\u0435\u043b\u044b</option>');
  lines.push('          </select>');
  lines.push('        </div>');
  lines.push('      </div>');
  lines.push('      <div id="hrEmpCont"></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-hr-hire">');
  lines.push('      <div class="ph"><div><h1>\u2795 \u041f\u0440\u0438\u0451\u043c \u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0443</h1><p>\u043e\u0444\u043e\u0440\u043c\u043b\u0435\u043d\u0438\u0435 \u043d\u043e\u0432\u043e\u0433\u043e \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0430</p></div></div>');
  lines.push('      <div class="card"><div id="hrHireCont"></div></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-hr-leaves">');
  lines.push('      <div class="ph"><div><h1>\uD83C\uDFD6 \u041e\u0442\u043f\u0443\u0441\u043a\u0430 / \u0411\u043e\u043b\u044c\u043d\u0438\u0447\u043d\u044b\u0435</h1><p>\u0443\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u044f\u043c\u0438</p></div>');
  lines.push('        <button class="btn bp" onclick="openLeaveMdl()">+ \u041e\u0444\u043e\u0440\u043c\u0438\u0442\u044c</button></div>');
  lines.push('      <div id="hrLeavesCont"><div class="loader"><div class="spin"></div></div></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-hr-fired">');
  lines.push('      <div class="ph"><div><h1>Уволенные</h1><p>история увольнений</p></div>');
  lines.push('        <button class="btn" style="background:var(--err);color:#fff" onclick="openFireFormMdl()">Уволить сотрудника</button></div>');
  lines.push('      <div id="hrFiredCont"></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-hr-contracts">');
  lines.push('      <div class="ph"><div><h1>Трудовые договоры</h1><p>шаблоны по должностям</p></div>');
  lines.push('        <button class="btn bp" onclick="openContractTplMdl()">новый шаблон</button></div>');
  lines.push('      <div id="hrContractsCont"></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-hr-contlog">');
  lines.push('      <div class="ph"><div><h1>Журнал договоров</h1><p>выданные договоры</p></div>');
  lines.push('        <button class="btn bp" onclick="openGenerateMdl()">Создать договор</button></div>');
  lines.push('      <div id="hrContLogCont"></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-hr-movements">');
  lines.push('      <div class="ph"><div><h1>Перемещения кадров</h1><p>переводы между отделами и должностями</p></div>');
  lines.push('        <button class="btn bp" onclick="openMoveMdl()">Добавить</button></div>');
  lines.push('      <div id="hrMovesCont"></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-hr-staff">');
  lines.push('      <div class="ph"><div><h1>Штатное расписание</h1><p>сотрудники по отделам</p></div>');
  lines.push('        <button class="btn bp" onclick="openStaffMdl()">+ Добавить</button></div>');
  lines.push('      <div id="hrStaffCont"></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-hr-staffdoc">');
  lines.push('      <div class="ph"><div><h1>Штат жадвали</h1><p>конструктор документов</p></div>');
  lines.push('        <button class="btn bp" onclick="openStaffDocMdl()">Создать документ</button></div>');
  lines.push('      <div id="hrStaffDocCont"></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-hr-payroll">');
  lines.push('      <div class="ph"><div><h1>\uD83D\uDCC8 \u0417\u0430\u0440\u043f\u043b\u0430\u0442\u0430</h1><p>\u0441\u0434\u0435\u043b\u044c\u043d\u0430\u044f \u043e\u043f\u043b\u0430\u0442\u0430 \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0445 \u043b\u0438\u043d\u0438\u0439</p></div>');
  lines.push('        <button class="btn bs" onclick="openPayrollMappingMdl()">\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430 \u043f\u0440\u0438\u0432\u044f\u0437\u043a\u0438</button></div>');
  lines.push('      <div id="hrPayrollCont"></div>');
  lines.push('    </div>');

  lines.push('    <div class="page" id="pg-assets-list">');
  lines.push('      <div class="ph"><div><h1>🏷️ Реестр ОС</h1><p>основные средства и инвентарь</p></div></div>');
  lines.push('      <div class="card" style="margin-bottom:12px">');
  lines.push('        <div style="display:flex;gap:8px;flex-wrap:wrap">');
  lines.push('          <input class="fi" id="assetsSearch" placeholder="Поиск по инв. №, названию..." style="flex:1;min-width:200px" oninput="assetsRenderFiltered()">');
  lines.push('          <select class="fs" id="assetsFilterState" onchange="assetsRenderFiltered()" style="width:160px">');
  lines.push('            <option value="">Все состояния</option>');
  lines.push('            <option>Балансда</option><option>Захирада</option><option>Списан</option>');
  lines.push('          </select>');
  lines.push('        </div>');
  lines.push('      </div>');
  lines.push('      <div id="assetsListCont"></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-assets-add">');
  lines.push('      <div class="ph"><div><h1>➕ Приём ОС</h1><p>постановка на учёт</p></div></div>');
  lines.push('      <div class="card"><div id="assetsAddCont"></div></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-assets-movements">');
  lines.push('      <div class="ph"><div><h1>🔄 Перемещения ОС</h1><p>история перемещений между подразделениями</p></div></div>');
  lines.push('      <div id="assetsMovesCont"></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-assets-writeoffs">');
  lines.push('      <div class="ph"><div><h1>🗑️ Списание ОС</h1><p>история списания</p></div></div>');
  lines.push('      <div id="assetsWriteOffsCont"></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-assets-manage">');
  lines.push('      <div class="ph"><div><h1>⚙️ Управление ОС</h1><p>подразделения, места хранения, виды ОС</p></div></div>');
  lines.push('      <div class="card"><div class="card-t">Подразделения</div><div id="assetsMgmtDeptCont"></div>');
  lines.push('        <button class="btn bs" style="margin-top:10px" onclick="assetsAddDeptPrompt()">+ Добавить подподразделение</button></div>');
  lines.push('      <div class="card"><div class="card-t">Места хранения</div><div id="assetsMgmtStorCont"></div>');
  lines.push('        <button class="btn bs" style="margin-top:10px" onclick="assetsAddStorPrompt()">+ Добавить место хранения</button></div>');
  lines.push('      <div class="card"><div class="card-t">Виды ОС</div><div id="assetsMgmtVidCont"></div>');
  lines.push('        <button class="btn bs" style="margin-top:10px" onclick="assetsAddVidPrompt()">+ Добавить вид</button></div>');
  lines.push('      <div class="card"><div class="card-t">QR-коды и наклейки</div>');
  lines.push('        <div style="font-size:13px;color:var(--sub);margin-bottom:10px">Перегенерировать ссылки на карточку и QR-коды для всех ОС (например, после переноса на новый адрес приложения)</div>');
  lines.push('        <button class="btn bp" id="assetsQrBtn" onclick="assetsRegenerateQR()">Перегенерировать QR для всех ОС</button>');
  lines.push('        <div style="margin-top:10px;display:flex;gap:8px">');
  lines.push('          <button class="btn bs" onclick="window.open(APP_URL+\'?page=os-label\',\'_blank\')">🖨️ Печать наклеек</button>');
  lines.push('          <button class="btn bs" onclick="window.open(APP_URL+\'?page=os-photo\',\'_blank\')">📷 Загрузить фото</button>');
  lines.push('        </div></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-assets-dashboard">');
  lines.push('      <div class="ph"><div><h1>📊 Дашборд ОС</h1><p>основные средства и инвентарь</p></div></div>');
  lines.push('      <div id="assetsDashCont"></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-assets-amort">');
  lines.push('      <div class="ph"><div><h1>📉 Амортизация</h1><p>реестр документов начисления</p></div>');
  lines.push('        <button class="btn bp" onclick="openAmortCreateMdl()">+ Создать документ</button></div>');
  lines.push('      <div id="assetsAmortCont"></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-assets-alerts">');
  lines.push('      <div class="ph"><div><h1>🚨 Уведомления</h1><p>амортизация и сроки службы</p></div></div>');
  lines.push('      <div id="assetsAlertsCont"></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-assets-reports">');
  lines.push('      <div class="ph"><div><h1>📋 Отчёты</h1><p>по подразделению, амортизации, местам хранения, ответственным</p></div></div>');
  lines.push('      <div class="card">');
  lines.push('        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">');
  lines.push('          <div class="fr" style="margin:0"><label class="fl">Отчёт</label><select class="fs" id="arType">');
  lines.push('            <option value="dept">По подразделению</option>');
  lines.push('            <option value="amort">Амортизация за период</option>');
  lines.push('            <option value="storage">По местам хранения</option>');
  lines.push('            <option value="resp">По ответственным лицам</option>');
  lines.push('          </select></div>');
  lines.push('          <button class="btn bp" onclick="assetsRunReport()">Показать</button>');
  lines.push('          <button class="btn bs" onclick="assetsPrintReport()">Печать</button>');
  lines.push('        </div>');
  lines.push('      </div>');
  lines.push('      <div id="assetsReportCont"></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-assets-inventory">');
  lines.push('      <div class="ph"><div><h1>📐 Инвентаризация</h1><p>сверка фактического наличия ОС</p></div>');
  lines.push('        <button class="btn bp" id="assetsInvCreateBtn" style="display:none" onclick="openInventoryCreateMdl()">+ Создать</button></div>');
  lines.push('      <div id="assetsInventoryCont"></div>');
  lines.push('    </div>');

  // ── НОМЕНКЛАТУРА ТОВАРОВ (Продукты) ──
  lines.push('    <div class="page" id="pg-products">');
  lines.push('      <div class="ph">');
  lines.push('        <div><h1>📦 \u041d\u043e\u043c\u0435\u043d\u043a\u043b\u0430\u0442\u0443\u0440\u0430 \u0442\u043e\u0432\u0430\u0440\u043e\u0432</h1>');
  lines.push('        <p>\u0433\u043e\u0442\u043e\u0432\u0430\u044f \u043f\u0440\u043e\u0434\u0443\u043a\u0446\u0438\u044f \u2014 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u0438 \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435</p></div>');
  lines.push('        <button class="btn bp" onclick="openProductMdl()">+ \u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c</button>');
  lines.push('      </div>');
  lines.push('      <div class="card"><div id="productsCont"><div class="loader"><div class="spin"></div></div></div></div>');
  lines.push('    </div>');

  // ── ЗАВ.ПРОИЗВОДСТВОМ: ГРАФИК РАБОТЫ ──
  lines.push('    <div class="page" id="pg-schedule">');
  lines.push('      <div class="ph"><div><h1>📅 \u0433\u0440\u0430\u0444\u0438\u043a \u0440\u0430\u0431\u043e\u0442\u044b</h1>');
  lines.push('        <p>\u0447\u0430\u0441\u044b \u0440\u0430\u0431\u043e\u0442\u044b \u043b\u0438\u043d\u0438\u0439 \u043d\u0430 \u0442\u0435\u043a\u0443\u0449\u0438\u0439 \u043c\u0435\u0441\u044f\u0446</p></div></div>');
  lines.push('      <div class="card"><div id="scheduleCont"><div class="loader"><div class="spin"></div></div></div></div>');
  lines.push('    </div>');

  // ── ЗАВ.ПРОИЗВОДСТВОМ: ПРИОРИТЕТЫ ПРОДУКТОВ ──
  lines.push('    <div class="page" id="pg-priorities">');
  lines.push('      <div class="ph"><div><h1>🎯 \u043f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u044b \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u043e\u0432</h1>');
  lines.push('        <p>\u043a\u0430\u043a\u0430\u044f \u043b\u0438\u043d\u0438\u044f \u0434\u0435\u043b\u0430\u0435\u0442 \u043a\u0430\u043a\u043e\u0439 \u0442\u043e\u0432\u0430\u0440 (\u043e\u0441\u043d\u043e\u0432\u043d\u0430\u044f / \u0432\u0441\u043f\u043e\u043c\u043e\u0433\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0435)</p></div>');
  lines.push('        <button class="btn bp" onclick="openPriorityMdl()">+ \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c</button></div>');
  lines.push('      <div class="card"><div id="prioritiesCont"><div class="loader"><div class="spin"></div></div></div></div>');
  lines.push('    </div>');

  // ── ЗАВ.ПРОИЗВОДСТВОМ: СКОРОСТЬ ЛИНИЙ ПО ТОВАРУ ──
  lines.push('    <div class="page" id="pg-speedmatrix">');
  lines.push('      <div class="ph"><div><h1>⚡ \u0441\u043a\u043e\u0440\u043e\u0441\u0442\u044c \u043b\u0438\u043d\u0438\u0439</h1>');
  lines.push('        <p>\u0448\u0442/\u0447\u0430\u0441 \u043a\u0430\u0436\u0434\u043e\u0433\u043e \u0442\u043e\u0432\u0430\u0440\u0430 \u043d\u0430 \u043a\u0430\u0436\u0434\u043e\u0439 \u043b\u0438\u043d\u0438\u0438 (\u0432\u0432\u043e\u0434\u0438\u0442\u0441\u044f \u0432\u0440\u0443\u0447\u043d\u0443\u044e)</p></div></div>');
  lines.push('      <div class="card"><div id="speedMatrixCont"><div class="loader"><div class="spin"></div></div></div></div>');
  lines.push('    </div>');

  // ── ЗАВ.ПРОИЗВОДСТВОМ: РАСПРЕДЕЛЕНИЕ ЗАКАЗОВ ──
  lines.push('    <div class="page" id="pg-distribution">');
  lines.push('      <div class="ph"><div><h1>📦 \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u0437\u0430\u043a\u0430\u0437\u043e\u0432</h1>');
  lines.push('        <p>\u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0435 \u0437\u0430\u043a\u0430\u0437\u044b \u0434\u0438\u043b\u0435\u0440\u043e\u0432 \u043f\u043e \u043b\u0438\u043d\u0438\u044f\u043c</p></div>');
  lines.push('        <button class="btn bp" onclick="buildDistribution()">🔄 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c</button></div>');
  lines.push('      <div class="card"><div id="distributionCont"><div class="empty"><div class="empty-ico">📦</div><div class="empty-t">\u043d\u0430\u0436\u043c\u0438\u0442\u0435 "\u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c"</div></div></div></div>');
  lines.push('    </div>');

  // ── ЗАВ.ПРОИЗВОДСТВОМ: ИСТОРИЯ РАСПРЕДЕЛЕНИЯ (план/факт) ──
  lines.push('    <div class="page" id="pg-disthistory">');
  lines.push('      <div class="ph"><div><h1>📊 \u0438\u0441\u0442\u043e\u0440\u0438\u044f \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u044f</h1>');
  lines.push('        <p>\u043f\u043b\u0430\u043d \u0438 \u0444\u0430\u043a\u0442 \u043f\u043e \u0434\u043d\u044f\u043c</p></div></div>');
  lines.push('      <div class="card" style="margin-bottom:14px">');
  lines.push('        <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end">');
  lines.push('          <div><label style="font-size:12px;color:var(--sub);display:block;margin-bottom:4px">\u0421 \u0434\u0430\u0442\u044b</label><input type="date" class="fi" id="dhFrom"></div>');
  lines.push('          <div><label style="font-size:12px;color:var(--sub);display:block;margin-bottom:4px">\u041f\u043e \u0434\u0430\u0442\u0443</label><input type="date" class="fi" id="dhTo"></div>');
  lines.push('          <button class="btn bp" onclick="loadDistHistory()">\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c</button>');
  lines.push('        </div>');
  lines.push('      </div>');
  lines.push('      <div id="distHistoryCont"></div>');
  lines.push('    </div>');

  // ── ФИНАНСИСТ: ОЧЕРЕДЬ НА СОГЛАСОВАНИЕ ──
  lines.push('    <div class="page" id="pg-fin-approvals">');
  lines.push('      <div class="ph"><div><h1>✅ \u041d\u0430 \u0441\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u0438</h1>');
  lines.push('        <p>\u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b, \u043e\u0436\u0438\u0434\u0430\u044e\u0449\u0438\u0435 \u0432\u0430\u0448\u0435\u0433\u043e \u0440\u0435\u0448\u0435\u043d\u0438\u044f</p></div></div>');
  lines.push('      <div id="finApprovalsCont"></div>');
  lines.push('    </div>');

  // ── ФИНАНСИСТ: ЖУРНАЛ ВСЕХ СОГЛАСОВАНИЙ ──
  lines.push('    <div class="page" id="pg-fin-appallhist">');
  lines.push('      <div class="ph"><div><h1>📜 \u0416\u0443\u0440\u043d\u0430\u043b \u0441\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u0439</h1>');
  lines.push('        <p>\u0432\u0441\u0435 \u0440\u0435\u0448\u0451\u043d\u043d\u044b\u0435 \u0438 \u043e\u0436\u0438\u0434\u0430\u044e\u0449\u0438\u0435 \u0437\u0430\u043f\u0440\u043e\u0441\u044b</p></div></div>');
  lines.push('      <div id="finApprovalHistCont"></div>');
  lines.push('    </div>');

  // ── ФИНАНСИСТ: СЕБЕСТОИМОСТЬ SKU ──
  lines.push('    <div class="page" id="pg-fin-skucost">');
  lines.push('      <div class="ph"><div><h1>💰 \u0421\u0435\u0431\u0435\u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c SKU</h1>');
  lines.push('        <p>\u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044b + \u0442\u0440\u0443\u0434 + \u043f\u0440\u043e\u0447\u0438\u0435 \u0440\u0430\u0441\u0445\u043e\u0434\u044b \u043d\u0430 \u0435\u0434\u0438\u043d\u0438\u0446\u0443 \u043f\u0440\u043e\u0434\u0443\u043a\u0446\u0438\u0438</p></div>');
  lines.push('        <button class="btn bp" onclick="openSkuCostMdl()">+ \u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c/\u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c</button></div>');
  lines.push('      <div id="finSkuCostCont"></div>');
  lines.push('    </div>');
  lines.push('    <div class="page" id="pg-productionplan">');
  lines.push('      <div class="ph"><div><h1>📦 \u043f\u043b\u0430\u043d \u043d\u0430 \u0441\u0435\u0433\u043e\u0434\u043d\u044f</h1>');
  lines.push('        <p>\u0443\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d\u043d\u043e\u0435 \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u0434\u043b\u044f \u0432\u0430\u0448\u0435\u0439 \u043b\u0438\u043d\u0438\u0438</p></div></div>');
  lines.push('      <div class="card"><div id="prodPlanCont"><div class="loader"><div class="spin"></div></div></div></div>');
  lines.push('    </div>');

  // ── АДМИНИСТРАТОР: НОМЕНКЛАТУРА МАТЕРИАЛОВ ──
  lines.push('    <div class="page" id="pg-materials">');
  lines.push('      <div class="ph"><div><h1>🧱 \u043d\u043e\u043c\u0435\u043d\u043a\u043b\u0430\u0442\u0443\u0440\u0430 \u0441\u044b\u0440\u044c\u044f</h1>');
  lines.push('        <p>\u043d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435, \u0435\u0434\u0438\u043d\u0438\u0446\u0430 \u0438\u0437\u043c\u0435\u0440\u0435\u043d\u0438\u044f, \u0446\u0435\u043d\u0430</p></div>');
  lines.push('        <button class="btn bp" onclick="openMaterialMdl()">+ \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c</button></div>');
  lines.push('      <div class="card"><div id="materialsCont"><div class="loader"><div class="spin"></div></div></div></div>');
  lines.push('    </div>');

  // ── АДМИНИСТРАТОР: ПОСТАВЩИКИ ──
  lines.push('    <div class="page" id="pg-suppliers">');
  lines.push('      <div class="ph"><div><h1>🚚 \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u0438</h1>');
  lines.push('        <p>\u0441\u043f\u0440\u0430\u0432\u043e\u0447\u043d\u0438\u043a \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u043e\u0432 \u0441\u044b\u0440\u044c\u044f</p></div>');
  lines.push('        <button class="btn bp" onclick="openSupplierMdl()">+ \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c</button></div>');
  lines.push('      <div class="card"><div id="suppliersCont"><div class="loader"><div class="spin"></div></div></div></div>');
  lines.push('    </div>');

  // ── АДМИНИСТРАТОР: ПАМЯТЬ ТАБЛИЦ ──
  lines.push('    <div class="page" id="pg-storage">');
  lines.push('      <div class="ph"><div><h1>💾 \u043f\u0430\u043c\u044f\u0442\u044c \u0442\u0430\u0431\u043b\u0438\u0446</h1>');
  lines.push('        <p>\u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u0435 \u044f\u0447\u0435\u0435\u043a Google Sheets \u043f\u043e \u0432\u0441\u0435\u043c \u0442\u0430\u0431\u043b\u0438\u0446\u0430\u043c \u0441\u0438\u0441\u0442\u0435\u043c\u044b</p></div>');
  lines.push('        <button class="btn bp" onclick="loadStorageUsage()">↻ \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c</button></div>');
  lines.push('      <div class="card"><div id="storageCont"><div class="loader"><div class="spin"></div></div></div></div>');
  lines.push('    </div>');

  // ── ЗАВСКЛАД СЫРЬЯ: ПРИХОД ОТ ПОСТАВЩИКА ──
  lines.push('    <div class="page" id="pg-skladincoming">');
  lines.push('      <div class="ph"><div><h1>📥 \u043f\u0440\u0438\u0445\u043e\u0434 \u043e\u0442 \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u0430</h1>');
  lines.push('        <p>\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f \u043f\u043e\u0441\u0442\u0443\u043f\u043b\u0435\u043d\u0438\u044f \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u043e\u0432 \u043f\u043e \u043d\u0430\u043a\u043b\u0430\u0434\u043d\u043e\u0439</p></div>');
  lines.push('        <button class="btn bp" onclick="openIncomingMdl()">+ \u043f\u0440\u0438\u043d\u044f\u0442\u044c</button></div>');
  lines.push('      <div class="card"><div id="incomingCont"><div class="loader"><div class="spin"></div></div></div></div>');
  lines.push('    </div>');

  // ── ЗАВСКЛАД СЫРЬЯ: ОТЧЁТ ДВИЖЕНИЯ СКЛАДА СЫРЬЯ ──
  lines.push('    <div class="page" id="pg-skladreport">');
  lines.push('      <div class="ph"><div><h1>📊 \u043e\u0442\u0447\u0451\u0442 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u044f</h1>');
  lines.push('        <p>\u043f\u0440\u0438\u0445\u043e\u0434 / \u0440\u0430\u0441\u0445\u043e\u0434 \u043f\u043e \u043a\u0430\u0436\u0434\u043e\u043c\u0443 \u0442\u043e\u0432\u0430\u0440\u0443 \u0437\u0430 \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0439 \u043f\u0435\u0440\u0438\u043e\u0434</p></div></div>');
  lines.push('      <div class="card">');
  lines.push('        <div style="display:flex;gap:10px;align-items:end;flex-wrap:wrap;margin-bottom:14px">');
  lines.push('          <div><label class="fl">\u0441 \u0434\u0430\u0442\u044b</label><input type="date" class="fi" id="repDateFrom" style="width:auto"></div>');
  lines.push('          <div><label class="fl">\u043f\u043e \u0434\u0430\u0442\u0443</label><input type="date" class="fi" id="repDateTo" style="width:auto"></div>');
  lines.push('          <button class="btn bp" onclick="loadMaterialReport()">\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c</button>');
  lines.push('        </div>');
  lines.push('        <div id="materialReportCont"><div class="loader"><div class="spin"></div></div></div>');
  lines.push('      </div>');
  lines.push('    </div>');

  // ── ОСТАТКИ СКЛАДОВ (видно ВСЕМ ролям) ──
  lines.push('    <div class="page" id="pg-warehousebalances">');
  lines.push('      <div class="ph"><div><h1>📦 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044c\u043d\u044b\u0439 \u043e\u0442\u0447\u0451\u0442</h1>');
  lines.push('        <p>\u043e\u0441\u0442\u0430\u0442\u043a\u0438 \u0438 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u0435 \u043f\u043e \u0441\u043a\u043b\u0430\u0434\u0443 \u0437\u0430 \u043f\u0435\u0440\u0438\u043e\u0434</p></div></div>');
  lines.push('      <div id="recalcBannerWrap" style="display:none;margin:0 0 14px 0">');
  lines.push('        <div style="background:rgba(249,168,37,.12);border:1px solid var(--warn);border-radius:8px;padding:12px 16px;display:flex;align-items:center;gap:12px">');
  lines.push('          <div style="flex:1;font-size:13px">\u26a0\ufe0f \u0415\u0441\u043b\u0438 \u043e\u0441\u0442\u0430\u0442\u043a\u0438 \u043d\u0435\u0432\u0435\u0440\u043d\u044b\u0435 \u2014 \u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0439\u0442\u0435 \u043f\u043e \u0438\u0441\u0442\u043e\u0440\u0438\u0438 (\u043f\u0440\u0438\u0445\u043e\u0434\u044b + \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u044f).</div>');
  lines.push('          <button class="btn bp" onclick="recalcBalances()">🔄 \u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u043e\u0441\u0442\u0430\u0442\u043a\u0438</button>');
  lines.push('        </div>');
  lines.push('      </div>');
  lines.push('      <div class="card">');
  lines.push('        <div style="display:flex;gap:10px;align-items:end;flex-wrap:wrap;margin-bottom:14px" id="whReportFilters">');
  lines.push('          <div id="whSelectWrap" style="display:none"><label class="fl">\u0421\u043a\u043b\u0430\u0434</label><select class="fs" id="whWarehouseSel" style="width:auto;min-width:180px" onchange="loadWarehouseBalances()"><option value="">\u2014</option></select></div>');
  lines.push('          <div><label class="fl">\u0441 \u0434\u0430\u0442\u044b</label><input type="date" class="fi" id="whDateFrom" style="width:auto"></div>');
  lines.push('          <div><label class="fl">\u043f\u043e \u0434\u0430\u0442\u0443</label><input type="date" class="fi" id="whDateTo" style="width:auto"></div>');
  lines.push('          <button class="btn bp" onclick="loadWarehouseBalances()">\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c</button>');
  lines.push('        </div>');
  lines.push('        <div id="warehouseBalancesCont"><div class="loader"><div class="spin"></div></div></div>');
  lines.push('      </div>');
  lines.push('    </div>');

  // ── ПЕРЕМЕЩЕНИЕ МЕЖДУ СКЛАДАМИ ──
  lines.push('    <div class="page" id="pg-warehousetransfer">');
  lines.push('      <div class="ph"><div><h1>🔄 \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0435</h1>');
  lines.push('        <p>\u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0430 \u0442\u043e\u0432\u0430\u0440\u0430 \u0441\u043e \u0441\u0432\u043e\u0435\u0433\u043e \u0441\u043a\u043b\u0430\u0434\u0430 \u043d\u0430 \u043b\u044e\u0431\u043e\u0439 \u0434\u0440\u0443\u0433\u043e\u0439</p></div>');
  lines.push('        <button class="btn bp" onclick="openTransferMdl()">+ \u043d\u043e\u0432\u043e\u0435 \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0435</button></div>');
  lines.push('      <div class="card">');
  lines.push('        <div class="card-t">📨 \u043e\u0436\u0438\u0434\u0430\u044e\u0442 \u043c\u043e\u0435\u0433\u043e \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f</div>');
  lines.push('        <div id="incomingTransfersCont"><div class="loader"><div class="spin"></div></div></div>');
  lines.push('      </div>');
  lines.push('      <div class="card" id="rejectedTransfersCard">');
  lines.push('        <div class="card-t">❌ \u041c\u043e\u0438 \u043e\u0442\u043a\u043b\u043e\u043d\u0451\u043d\u043d\u044b\u0435 \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u044f</div>');
  lines.push('        <div id="rejectedTransfersCont"><div class="loader"><div class="spin"></div></div></div>');
  lines.push('      </div>');
  lines.push('      <div class="card">');
  lines.push('        <div class="card-t">📜 \u0432\u0441\u0435 \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u044f</div>');
  lines.push('        <div id="allTransfersCont"><div class="loader"><div class="spin"></div></div></div>');
  lines.push('      </div>');
  lines.push('    </div>');

  // ── ИНВЕНТАРИЗАЦИЯ (Администратор) ──
  lines.push('    <div class="page" id="pg-inventory">');
  lines.push('      <div class="ph"><div><h1>📐 \u0438\u043d\u0432\u0435\u043d\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044f</h1>');
  lines.push('        <p>\u0432\u0432\u043e\u0434 \u0444\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0433\u043e \u043e\u0441\u0442\u0430\u0442\u043a\u0430 \u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u0441\u043a\u043b\u0430\u0434\u043e\u0432</p></div></div>');
  lines.push('      <div class="card">');
  lines.push('        <div style="display:flex;gap:10px;align-items:end;flex-wrap:wrap;margin-bottom:14px">');
  lines.push('          <div style="flex:1;min-width:220px"><label class="fl">\u0421\u043a\u043b\u0430\u0434</label><select class="fs" id="invWarehouseSel" onchange="loadInventoryBalances()"><option value="">\u2014 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u043a\u043b\u0430\u0434 \u2014</option></select></div>');
  lines.push('          <div style="min-width:160px"><label class="fl">\u0414\u0430\u0442\u0430 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430</label><input type="date" class="fi" id="invDocDate"></div>');
  lines.push('          <input class="fi" id="invSearchInput" placeholder="\u043f\u043e\u0438\u0441\u043a \u043f\u043e \u0442\u043e\u0432\u0430\u0440\u0443..." style="flex:1;min-width:200px" oninput="filterInventoryRows()">');
  lines.push('        </div>');
  lines.push('        <div id="inventoryBalancesCont"><div class="empty"><div class="empty-t">\u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u043a\u043b\u0430\u0434 \u0434\u043b\u044f \u043d\u0430\u0447\u0430\u043b\u0430 \u0438\u043d\u0432\u0435\u043d\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u0438</div></div></div>');
  lines.push('        <div id="invSaveBarWrap" style="display:none;margin-top:14px;position:sticky;bottom:0;background:var(--s1);padding:12px 0">');
  lines.push('          <button class="btn bp" style="width:100%" onclick="saveInventoryChanges()">💾 \u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f (<span id="invChangedCount">0</span>)</button>');
  lines.push('        </div>');
  lines.push('      </div>');
  lines.push('      <div class="card">');
  lines.push('        <div class="card-t">📜 \u0418\u0441\u0442\u043e\u0440\u0438\u044f \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a</div>');
  lines.push('        <div id="inventoryHistoryCont"><div class="loader"><div class="spin"></div></div></div>');
  lines.push('      </div>');
  lines.push('    </div>');

  // ── НОРМЫ РАСХОДОВ (Зав.производством) ──
  lines.push('    <div class="page" id="pg-spnorms">');
  lines.push('      <div class="ph"><div><h1>📋 \u043d\u043e\u0440\u043c\u044b \u0440\u0430\u0441\u0445\u043e\u0434\u043e\u0432</h1>');
  lines.push('        <p>\u0440\u0435\u0446\u0435\u043f\u0442\u0443\u0440\u0430: \u0441\u043e\u0441\u0442\u0430\u0432 \u0441\u044b\u0440\u044c\u044f \u043d\u0430 1 \u0435\u0434. \u043f\u0440\u043e\u0434\u0443\u043a\u0446\u0438\u0438</p></div>');
  lines.push('        <button class="btn bp" onclick="openNormMdl()">+ \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c / \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c</button></div>');
  lines.push('      <div class="card"><div id="normsCont"><div class="loader"><div class="spin"></div></div></div></div>');
  lines.push('    </div>');

  // ── СПИСАНИЕ МАТЕРИАЛОВ (Тестодел) ──
  lines.push('    <div class="page" id="pg-spwriteoff">');
  lines.push('      <div class="ph"><div><h1>📝 \u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u043e\u0432</h1>');
  lines.push('        <p>\u0444\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u0440\u0430\u0441\u0445\u043e\u0434 \u0441\u044b\u0440\u044c\u044f \u0437\u0430 \u0441\u043c\u0435\u043d\u0443</p></div>');
  lines.push('        <button class="btn bp" onclick="openWriteOffMdl()">+ \u0441\u043f\u0438\u0441\u0430\u0442\u044c</button></div>');
  lines.push('      <div class="card"><div id="writeOffCont"><div class="loader"><div class="spin"></div></div></div></div>');
  lines.push('    </div>');

  // ── ЗАКРЫТИЕ СМЕНЫ (Бригадир) ──
  lines.push('    <div class="page" id="pg-spcloseshift">');
  lines.push('      <div class="ph"><div><h1>🔒 \u0437\u0430\u043a\u0440\u044b\u0442\u0438\u0435 \u0441\u043c\u0435\u043d\u044b</h1>');
  lines.push('        <p>\u043f\u043b\u0430\u043d vs \u0444\u0430\u043a\u0442 + \u0437\u0430\u043a\u0440\u044b\u0442\u0438\u0435</p></div>');
  lines.push('        <button class="btn bp" onclick="loadShiftReport()">\u041e\u0431\u043d\u043e\u0432\u0438\u0442\u044c</button></div>');
  lines.push('      <div class="card"><div id="shiftReportCont"><div class="loader"><div class="spin"></div></div></div></div>');
  lines.push('    </div>');

  lines.push('  </div>'); // /main-content
  lines.push('</div>'); // /screenApp

  // Modals
  lines.push(getModalsHtml());

  // Toast
  lines.push('<div id="toastWrap" style="position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px"></div>');

  // Script
  lines.push('<script>');
  lines.push(getSpaJs());
  lines.push('</script>');
  lines.push('</body>');
  lines.push('</html>');

  return lines.join('\n');
}

// ─── CSS ──────────────────────────────────────────────────────
function getSpaCss() {
  var css = [
    '<style>',
    '*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }',
    ':root {',
    '  --g: #F9A825; --bg: #0F0F0F; --s1: #1A1A1A; --s2: #242424; --s3: #2E2E2E;',
    '  --txt: #F5F5F5; --sub: #9E9E9E; --bd: #2E2E2E;',
    '  --err: #EF5350; --ok: #66BB6A; --info: #42A5F5;',
    '  --nw: 240px; --hh: 56px;',
    '}',
    'body { background: var(--bg); color: var(--txt); font-family: "Segoe UI", Arial, sans-serif; min-height: 100vh; }',

    // Screens
    '.screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; }',
    '#screenLogin { position: relative; overflow: hidden;',
    '  background-image: url("data:image/png;base64,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");',
    '  background-size: cover; background-position: center; background-repeat: no-repeat; }',
    '#screenLogin::before { content:""; position:absolute; inset:0;',
    '  background: rgba(5,15,30,.55); z-index:0; }',
    '.login-author { position: absolute; bottom: 18px; right: 22px;',
    '  font-size: 11px; color: rgba(249,168,37,.8); font-style: italic;',
    '  letter-spacing: 0.5px; pointer-events: none; z-index:2;',
    '  text-shadow: 0 1px 4px rgba(0,0,0,.8); }',

    // Login
    '.login-wrap { width: 100%; max-width: 400px; padding: 16px;',
    '  position: relative; z-index: 2; }',
    '.logo { text-align: center; margin-bottom: 32px; }',
    '.logo-icon { width: 80px; height: 80px; border-radius: 20px; overflow: hidden;',
    '  display: flex; align-items: center; justify-content: center;',
    '  margin: 0 auto 16px; box-shadow: 0 8px 32px rgba(249,168,37,.3); }',
    '.logo-title { font-size: 28px; font-weight: 700; letter-spacing: 2px; color: #F9A825; }',
    '.logo-sub { font-size: 13px; color: #9E9E9E; margin-top: 4px; }',
    '.card { background: rgba(20,20,30,.85); border: 1px solid rgba(249,168,37,.25); border-radius: 12px; padding: 32px;',
    '  backdrop-filter: blur(12px); box-shadow: 0 8px 40px rgba(0,0,0,.5); }',
    '.card-title { font-size: 18px; font-weight: 600; margin-bottom: 24px; color: #9E9E9E; }',
    '.field { margin-bottom: 16px; }',
    '.field label { display: block; font-size: 12px; color: #9E9E9E; margin-bottom: 6px; text-transform: uppercase; }',
    '.field input { width: 100%; background: #2A2A2A; border: 1px solid #333; border-radius: 8px;',
    '  padding: 12px 16px; color: #fff; font-size: 16px; outline: none;',
    '  transition: border-color 0.15s ease, box-shadow 0.15s ease; }',
    '.field input:focus { border-color: #F9A825; box-shadow: 0 0 0 3px rgba(249,168,37,.15); }',
    '.btn-login { width: 100%; background: linear-gradient(135deg, #F9A825, #F57F17); color: #000;',
    '  border: none; border-radius: 8px; padding: 14px; font-size: 16px; font-weight: 700;',
    '  cursor: pointer; letter-spacing: 1px;',
    '  transition: transform 0.08s ease, box-shadow 0.08s ease, filter 0.08s ease;',
    '  box-shadow: 0 4px 12px rgba(249,168,37,.35); }',
    '.btn-login:hover:not(:disabled) { filter: brightness(1.08); box-shadow: 0 6px 18px rgba(249,168,37,.45); }',
    '.btn-login:active:not(:disabled) { transform: scale(0.96) translateY(2px); box-shadow: 0 2px 6px rgba(249,168,37,.25); filter: brightness(0.92); }',
    '.btn-login:disabled { opacity: .5; cursor: default; }',
    '.err-box { background: rgba(239,83,80,.15); border: 1px solid #EF5350; border-radius: 8px;',
    '  padding: 10px 14px; font-size: 14px; color: #EF5350; margin-top: 12px; display: none; }',
    '.ver { text-align: center; color: #9E9E9E; font-size: 11px; margin-top: 24px; }',

    // Header
    '.hdr { position: fixed; top: 0; left: 0; right: 0; height: var(--hh); background: var(--s1);',
    '  border-bottom: 1px solid var(--bd); display: flex; align-items: center; padding: 0 16px; z-index: 100; gap: 12px; }',
    '.hdr-logo { font-size: 18px; font-weight: 800; color: var(--g); flex-shrink: 0; }',
    '.hdr-logo span { color: var(--sub); font-weight: 400; }',
    '.hdr-title { flex: 1; font-size: 15px; font-weight: 600; padding-left: 8px; border-left: 2px solid var(--bd); }',
    '.avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center;',
    '  justify-content: center; font-weight: 700; font-size: 14px; color: #fff; flex-shrink: 0; }',
    '.menu-btn { background: none; border: none; color: var(--txt); font-size: 22px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }',
    '.menu-btn:hover { background: var(--s2); }',
    '@media(min-width:900px) { .menu-btn { display: none; } .hdr-logo { display: none; } .hdr-title { border: none; padding-left: 0; } }',

    // Sidebar
    '.overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 150; }',
    '.overlay.show { display: block; }',
    '.sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: var(--nw); background: var(--s1);',
    '  border-right: 1px solid var(--bd); z-index: 200; display: flex; flex-direction: column;',
    '  transform: translateX(-100%); transition: transform .25s; overflow-y: auto; }',
    '.sidebar.open { transform: translateX(0); }',
    '@media(min-width:900px) { .sidebar { transform: translateX(0); } .overlay { display: none !important; } }',
    '.sb-hdr { padding: 16px; border-bottom: 1px solid var(--bd); display: flex; align-items: center; gap: 10px; }',
    '.sb-logo { font-size: 16px; font-weight: 800; color: var(--g); }',
    '.sb-user { padding: 16px; border-bottom: 1px solid var(--bd); }',
    '.nav-sec { padding: 8px 8px 0; }',
    '.nav-sec-t { font-size: 10px; color: var(--sub); text-transform: uppercase; letter-spacing: 1px; padding: 8px 8px 4px; font-weight: 600; }',
    '.nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px;',
    '  cursor: pointer; font-size: 14px; color: var(--sub); margin-bottom: 2px; transition: all .15s; }',
    '.nav-item:hover { background: var(--s2); color: var(--txt); }',
    '.nav-item.active { background: rgba(249,168,37,.15); color: var(--g); font-weight: 600; }',
    '.sb-footer { margin-top: auto; padding: 12px; border-top: 1px solid var(--bd); }',
    '.btn-logout { width: 100%; background: none; border: 1px solid var(--bd); border-radius: 8px;',
    '  color: var(--err); padding: 10px; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }',
    '.btn-logout:hover { background: rgba(239,83,80,.1); }',

    // Main
    '.main-content { padding-top: var(--hh); min-height: 100vh; }',
    '@media(min-width:900px) { .main-content { margin-left: var(--nw); } }',
    '.page { display: none; padding: 20px 16px; max-width: 1200px; overflow-x: hidden; }',
    '.page.active { display: block; }',
    '@media(min-width:900px) { .page { padding: 24px; } }',
    '.card { background: var(--s1); border: 1px solid var(--bd); border-radius: 12px; padding: 20px; margin-bottom: 16px; }',
    '.card-t { font-size: 16px; font-weight: 700; margin-bottom: 16px; }',
    '.sg { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 16px; }',
    '.sc { background: var(--s2); border-radius: 10px; padding: 16px; text-align: center; }',
    '.sv { font-size: 28px; font-weight: 800; color: var(--g); }',
    '.sl { font-size: 12px; color: var(--sub); margin-top: 4px; }',
    '.sg-lg { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 20px; }',
    '.sc-lg { background: var(--s2); border-radius: 12px; padding: 22px 18px; text-align: center; }',
    '.sc-lg .sv { font-size: 34px; }',
    '.sc-lg .sl { font-size: 13px; margin-top: 6px; }',
    '.dash-cols { display: grid; grid-template-columns: 1fr; gap: 16px; align-items: start; }',
    '@media(min-width:1000px) { .dash-cols { grid-template-columns: 2fr 1fr; } }',
    '.dash-side .card { padding: 16px; }',
    '.tw { overflow-x: auto; max-width: 100%; }',
    'table { width: 100%; border-collapse: collapse; font-size: 14px; }',
    'th { background: var(--s2); padding: 10px 12px; text-align: left; font-size: 12px; color: var(--sub); white-space: nowrap; }',
    'td { padding: 10px 12px; border-bottom: 1px solid var(--bd); vertical-align: middle; }',
    'tr:hover td { background: var(--s2); }',
    '.badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }',
    '.bg { background: rgba(102,187,106,.15); color: #66BB6A; }',
    '.br { background: rgba(239,83,80,.15); color: #EF5350; }',
    '.bb { background: rgba(66,165,245,.15); color: #42A5F5; }',
    '.by { background: rgba(249,168,37,.15); color: #F9A825; }',
    '.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; }',
    '.bp { background: var(--g); color: #000; }',
    '.bs { background: var(--s2); color: var(--txt); border: 1px solid var(--bd); }',
    '.bd { background: rgba(239,83,80,.15); color: var(--err); border: 1px solid var(--err); }',
    '.btn:disabled { opacity: .4; cursor: not-allowed; }',
    '.mbg { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 500; align-items: center; justify-content: center; padding: 16px; }',
    '.mbg.show { display: flex; }',
    '.mdl { background: var(--s1); border: 1px solid var(--bd); border-radius: 12px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; }',
    '.mh { padding: 16px 20px; border-bottom: 1px solid var(--bd); display: flex; align-items: center; justify-content: space-between; }',
    '.mt { font-size: 16px; font-weight: 700; }',
    '.mc { background: none; border: none; color: var(--sub); font-size: 20px; cursor: pointer; }',
    '.mb { padding: 20px; }',
    '.mf { padding: 16px 20px; border-top: 1px solid var(--bd); display: flex; gap: 8px; justify-content: flex-end; }',
    '.fr { margin-bottom: 14px; }',
    '.fl { display: block; font-size: 12px; color: var(--sub); margin-bottom: 5px; text-transform: uppercase; }',
    '.fi, .fs, .fta { width: 100%; background: var(--s2); border: 1px solid var(--bd); border-radius: 8px; padding: 10px 14px; color: var(--txt); font-size: 14px; outline: none; font-family: inherit; }',
    '.fi:focus, .fs:focus, .fta:focus { border-color: var(--g); }',
    '.fta { resize: vertical; min-height: 80px; }',
    '.fr2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }',
    '.tgl { position: relative; width: 44px; height: 24px; }',
    '.tgl input { display: none; }',
    '.tsl { position: absolute; inset: 0; background: var(--s3); border-radius: 12px; cursor: pointer; }',
    '.tsl::before { content: ""; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; background: #fff; border-radius: 50%; transition: transform .2s; }',
    '.tgl input:checked + .tsl { background: var(--ok); }',
    '.tgl input:checked + .tsl::before { transform: translateX(20px); }',
    '.srch { position: relative; margin-bottom: 16px; }',
    '.srch input { width: 100%; background: var(--s2); border: 1px solid var(--bd); border-radius: 8px; padding: 10px 14px 10px 38px; color: var(--txt); font-size: 14px; outline: none; }',
    '.srch input:focus { border-color: var(--g); }',
    '.srch-ic { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--sub); }',
    '.ph { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }',
    '.ph h1 { font-size: 20px; font-weight: 800; }',
    '.ph p { font-size: 13px; color: var(--sub); margin-top: 2px; }',
    '.loader { display: flex; align-items: center; justify-content: center; padding: 40px; }',
    '.spin { width: 24px; height: 24px; border: 2px solid var(--bd); border-top-color: var(--g); border-radius: 50%; animation: sp .8s linear infinite; }',
    '@keyframes sp { to { transform: rotate(360deg); } }',
    '@keyframes mechPulse { 0%,100%{opacity:1;} 50%{opacity:.5;} }',
    '.empty { text-align: center; padding: 40px; color: var(--sub); }',
    '.empty-ico { font-size: 40px; margin-bottom: 12px; }',
    '.empty-t { font-size: 16px; font-weight: 600; color: var(--txt); }',
    '.toast { background: var(--s1); border: 1px solid var(--bd); border-radius: 10px; padding: 12px 16px;',
    '  font-size: 14px; display: flex; align-items: center; gap: 8px; max-width: 320px;',
    '  box-shadow: 0 4px 20px rgba(0,0,0,.4); }',
    '.tok { border-left: 3px solid var(--ok); }',
    '.terr { border-left: 3px solid var(--err); }',
    '</style>'
  ];
  return css.join('\n');
}

// ─── MODALS ───────────────────────────────────────────────────
function getModalsHtml() {
  var h = [];

  // User modal
  h.push('<div class="mbg" id="mdlUser">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt" id="mdlUserTitle">&#1053;&#1086;&#1074;&#1099;&#1081; &#1087;&#1086;&#1083;&#1100;&#1079;&#1086;&#1074;&#1072;&#1090;&#1077;&#1083;&#1100;</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlUser\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<input type="hidden" id="uId">');
  h.push('<div class="fr"><label class="fl">&#1060;&#1048;&#1054; *</label><input class="fi" id="uFio" placeholder="&#1060;&#1072;&#1084;&#1080;&#1083;&#1080;&#1103; &#1048;&#1084;&#1103; &#1054;&#1090;&#1095;&#1077;&#1089;&#1090;&#1074;&#1086;"></div>');
  h.push('<div class="fr2">');
  h.push('<div class="fr" style="margin:0"><label class="fl">&#1051;&#1086;&#1075;&#1080;&#1085; *</label><input class="fi" id="uLogin"></div>');
  h.push('<div class="fr" style="margin:0"><label class="fl">&#1055;&#1072;&#1088;&#1086;&#1083;&#1100;</label><input class="fi" type="password" id="uPass"></div>');
  h.push('</div>');
  h.push('<div class="fr"><label class="fl">&#1056;&#1086;&#1083;&#1100; *</label>');
  h.push('<select class="fs" id="uRole" onchange="onRoleChg()">');
  h.push('<option value="">\u2014 \u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u2014</option>');
  h.push('<option>\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440</option>');
  h.push('<option value="\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c">\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c (\u041b\u0430\u0432\u0430\u0448)</option>');
  h.push('<option value="\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c \u0411\u0443\u043b\u043e\u0447\u043a\u0438">\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c (\u0411\u0443\u043b\u043e\u0447\u043a\u0438/\u0425\u043b\u0435\u0431)</option>');
  h.push('<option>\u0417\u0430\u0432\u0441\u043a\u043b\u0430\u0434 \u0441\u044b\u0440\u044c\u044f</option>');
  h.push('<option>\u0417\u0430\u0432\u0441\u043a\u043b\u0430\u0434 \u0413\u041f</option>');
  h.push('<option>\u0411\u0440\u0438\u0433\u0430\u0434\u0438\u0440</option>');
  h.push('<option>\u0422\u0435\u0441\u0442\u043e\u0434\u0435\u043b</option>');
  h.push('<option>\u0417\u0430\u0432.\u0443\u043f\u0430\u043a\u043e\u0432\u0449\u0438\u0446\u0430</option>');
  h.push('<option>\u041c\u0435\u0445\u0430\u043d\u0438\u043a</option>');
  h.push('<option value="HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440">HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440</option>');
  h.push('<option value="HR \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440">HR \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440</option>');
  h.push('<option value="\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442">\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442</option>');
  h.push('<option>HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440</option>');
  h.push('<option>HR \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440</option>');
  h.push('<option>\u0411\u0443\u0445\u0433\u0430\u043b\u0442\u0435\u0440 \u041e\u0421</option>');
  h.push('</select></div>');
  h.push('<div class="fr2" id="uLineRow" style="display:none">');
  h.push('<div class="fr" style="margin:0"><label class="fl">&#1051;&#1080;&#1085;&#1080;&#1103;</label>');
  h.push('<select class="fs" id="uLine"><option value="">&#8212; &#1042;&#1089;&#1077; &#8212;</option></select></div>');
  h.push('<div class="fr" style="margin:0"><label class="fl">&#1057;&#1084;&#1077;&#1085;&#1072;</label>');
  h.push('<select class="fs" id="uSmena"><option value="">&#8212;</option><option>&#1044;&#1077;&#1085;&#1100;</option><option>&#1053;&#1086;&#1095;&#1100;</option></select></div>');
  h.push('</div>');
  h.push('<div class="fr"><label class="fl">Подразделение (для ОС/инвентаря)</label>');
  h.push('<select class="fs" id="uOsDept"><option value="">— не указано —</option>');
  h.push('<option>Производство</option><option>Завод СЭЗ</option><option>ОТП Самарканд</option>');
  h.push('<option>ОТП Тошкент</option><option>Офис</option></select></div>');
  h.push('<div class="fr" style="display:flex;align-items:center;justify-content:space-between">');
  h.push('<label class="fl" style="margin:0">&#1040;&#1082;&#1090;&#1080;&#1074;&#1077;&#1085;</label>');
  h.push('<label class="tgl"><input type="checkbox" id="uActive" checked><span class="tsl"></span></label>');
  h.push('</div></div>');
  h.push('<div class="mf">');
  h.push('<button class="btn bs" onclick="closeMdl(\'mdlUser\')">&#1054;&#1090;&#1084;&#1077;&#1085;&#1072;</button>');
  h.push('<button class="btn bp" id="uSaveBtn" onclick="saveUser()">&#1057;&#1086;&#1093;&#1088;&#1072;&#1085;&#1080;&#1090;&#1100;</button>');
  h.push('</div></div></div>');

  // Equipment modal
  h.push('<div class="mbg" id="mdlEq">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt" id="mdlEqTitle">&#1053;&#1086;&#1074;&#1086;&#1077; &#1086;&#1073;&#1086;&#1088;&#1091;&#1076;&#1086;&#1074;&#1072;&#1085;&#1080;&#1077;</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlEq\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<input type="hidden" id="eId">');
  h.push('<div class="fr2">');
  h.push('<div class="fr" style="margin:0"><label class="fl">&#1048;&#1085;&#1074;. &#8470; *</label><input class="fi" id="eInv" placeholder="GL-L1-001"></div>');
  h.push('<div class="fr" style="margin:0"><label class="fl">&#1058;&#1080;&#1087;</label>');
  h.push('<select class="fs" id="eType"><option>&#1055;&#1077;&#1095;&#1100;</option><option>&#1052;&#1080;&#1082;&#1089;&#1077;&#1088;</option><option>&#1050;&#1086;&#1085;&#1074;&#1077;&#1081;&#1077;&#1088;</option><option>&#1059;&#1087;&#1072;&#1082;&#1086;&#1074;&#1097;&#1080;&#1082;</option><option>&#1055;&#1088;&#1086;&#1095;&#1077;&#1077;</option></select>');
  h.push('</div></div>');
  h.push('<div class="fr"><label class="fl">&#1053;&#1072;&#1079;&#1074;&#1072;&#1085;&#1080;&#1077; *</label><input class="fi" id="eName"></div>');
  h.push('<div class="fr"><label class="fl">&#1051;&#1080;&#1085;&#1080;&#1103;</label><select class="fs" id="eLine"><option value="">&#8212; &#1054;&#1073;&#1097;&#1077;&#1077; &#8212;</option></select></div>');
  h.push('<div class="fr"><label class="fl">&#1055;&#1088;&#1080;&#1084;&#1077;&#1095;&#1072;&#1085;&#1080;&#1077;</label><textarea class="fta" id="eNote"></textarea></div>');
  h.push('<div class="fr" style="display:flex;align-items:center;justify-content:space-between">');
  h.push('<label class="fl" style="margin:0">&#1040;&#1082;&#1090;&#1080;&#1074;&#1085;&#1086;</label>');
  h.push('<label class="tgl"><input type="checkbox" id="eActive" checked><span class="tsl"></span></label>');
  h.push('</div></div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlEq\')">&#1054;&#1090;&#1084;&#1077;&#1085;&#1072;</button>');
  h.push('<button class="btn bp" onclick="saveEq()">&#1057;&#1086;&#1093;&#1088;&#1072;&#1085;&#1080;&#1090;&#1100;</button></div>');
  h.push('</div></div>');

  // Line modal
  h.push('<div class="mbg" id="mdlLine">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt">&#1051;&#1080;&#1085;&#1080;&#1103;</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlLine\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<input type="hidden" id="lId">');
  h.push('<div class="fr"><label class="fl">&#1053;&#1072;&#1079;&#1074;&#1072;&#1085;&#1080;&#1077; *</label><input class="fi" id="lName"></div>');
  h.push('<div class="fr"><label class="fl">&#1058;&#1080;&#1087;</label>');
  h.push('<select class="fs" id="lType"><option>\u041b\u0430\u0432\u0430\u0448</option><option>\u0422\u0430\u043d\u0434\u044b\u0440</option><option>\u0411\u0443\u043b\u043e\u0447\u043a\u0438</option><option>\u0425\u043b\u0435\u0431</option><option>\u041f\u0440\u043e\u0447\u0435\u0435</option></select></div>');
  h.push('<div class="fr"><label class="fl">&#1055;&#1088;&#1080;&#1084;&#1077;&#1095;&#1072;&#1085;&#1080;&#1077;</label><input class="fi" id="lNote"></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlLine\')">&#1054;&#1090;&#1084;&#1077;&#1085;&#1072;</button>');
  h.push('<button class="btn bp" onclick="saveLine()">&#1057;&#1086;&#1093;&#1088;&#1072;&#1085;&#1080;&#1090;&#1100;</button></div>');
  h.push('</div></div>');

  // ── Add worker modal (Бригадир: подработка) ──
  h.push('<div class="mbg" id="mdlAddWorker">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt">&#1044;&#1086;&#1073;&#1072;&#1074;&#1080;&#1090;&#1100; &#1095;&#1077;&#1083;&#1086;&#1074;&#1077;&#1082;&#1072;</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlAddWorker\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div class="fr"><label class="fl">&#1048;&#1084;&#1103; &#1080;&#1083;&#1080; &#1090;&#1072;&#1073;&#1077;&#1083;&#1100; &#1085;&#1086;&#1084;&#1077;&#1088;</label>');
  h.push('<input class="fi" id="awSearch" placeholder="\u041d\u0430\u0447\u043d\u0438\u0442\u0435 \u0432\u0432\u043e\u0434\u0438\u0442\u044c \u0438\u043c\u044f..." oninput="searchWorkerDebounced()"></div>');
  h.push('<div id="awResults" style="max-height:300px;overflow-y:auto"></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlAddWorker\')">&#1054;&#1090;&#1084;&#1077;&#1085;&#1072;</button></div>');
  h.push('</div></div>');

  // ── Close shift modal (Бригадир) ──
  h.push('<div class="mbg" id="mdlCloseShift">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt">&#1057;&#1432;\u043e\u0434\u043a\u0430 \u043f\u0435\u0440\u0435\u0434 \u0437\u0430\u043a\u0440\u044b\u0442\u0438\u0435\u043c</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlCloseShift\')">&#10005;</button></div>');
  h.push('<div class="mb" id="closeShiftBody"></div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlCloseShift\')">&#1054;&#1090;&#1084;&#1077;&#1085;&#1072;</button>');
  h.push('<button class="btn bd" id="btnConfirmClose" onclick="confirmCloseShift()">\u0437\u0430\u043a\u0440\u044b\u0442\u044c \u0441\u043c\u0435\u043d\u0443</button></div>');
  h.push('</div></div>');

  // ── Priority modal (Зав.производством) ──
  h.push('<div class="mbg" id="mdlPriority">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt">\u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442 \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u0430</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlPriority\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div class="fr"><label class="fl">\u041d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435 \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u0430 *</label><select class="fs" id="prProduct"><option value="">\u2014 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u043e\u0432\u0430\u0440 \u2014</option></select></div>');
  h.push('<div class="fr"><label class="fl">\u041e\u0441\u043d\u043e\u0432\u043d\u0430\u044f \u043b\u0438\u043d\u0438\u044f</label><select class="fs" id="prMain"><option value="">\u2014</option></select></div>');
  h.push('<div class="fr"><label class="fl">\u0412\u0441\u043f\u043e\u043c\u043e\u0433\u0430\u0442\u0435\u043b\u044c\u043d\u0430\u044f 1</label><select class="fs" id="prAlt1"><option value="">\u2014</option></select></div>');
  h.push('<div class="fr"><label class="fl">\u0412\u0441\u043f\u043e\u043c\u043e\u0433\u0430\u0442\u0435\u043b\u044c\u043d\u0430\u044f 2</label><select class="fs" id="prAlt2"><option value="">\u2014</option></select></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlPriority\')">\u041e\u0442\u043c\u0435\u043d\u0430</button>');
  h.push('<button class="btn bp" onclick="savePriority()">\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button></div>');
  h.push('</div></div>');

  // ── Material modal (Администратор) ──
  h.push('<div class="mbg" id="mdlMaterial">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt">\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlMaterial\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div class="fr"><label class="fl">\u041d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435 *</label><input class="fi" id="matName" placeholder="\u041c\u0443\u043a\u0430"></div>');
  h.push('<div class="fr"><label class="fl">\u0415\u0434. \u0438\u0437\u043c. *</label><input class="fi" id="matUnit" placeholder="\u043a\u0433"></div>');
  h.push('<div class="fr"><label class="fl">\u0426\u0435\u043d\u0430</label><input type="number" class="fi" id="matPrice" placeholder="0"></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlMaterial\')">\u041e\u0442\u043c\u0435\u043d\u0430</button>');
  h.push('<button class="btn bp" onclick="saveMaterial()">\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button></div>');
  h.push('</div></div>');

  // ── Supplier modal (Администратор) ──
  h.push('<div class="mbg" id="mdlSupplier">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt">\u041f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlSupplier\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div class="fr"><label class="fl">\u041d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435 *</label><input class="fi" id="supName" placeholder="\u041d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435 \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u0430"></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlSupplier\')">\u041e\u0442\u043c\u0435\u043d\u0430</button>');
  h.push('<button class="btn bp" onclick="saveSupplier()">\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button></div>');
  h.push('</div></div>');

  // ── Incoming material modal (Завсклад сырья) ──
  h.push('<div class="mbg" id="mdlIncoming">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt">\u041f\u0440\u0438\u0451\u043c \u043e\u0442 \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u0430</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlIncoming\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div class="fr"><label class="fl">\u0414\u0430\u0442\u0430</label><input type="date" class="fi" id="inDate"></div>');
  h.push('<div class="fr"><label class="fl">\u041f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a</label><select class="fs" id="inSupplier"><option value="">\u2014 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u2014</option></select></div>');
  h.push('<div class="fr"><label class="fl">№ \u043d\u0430\u043a\u043b\u0430\u0434\u043d\u043e\u0439</label><input class="fi" id="inInvoice" placeholder="0000"></div>');
  h.push('<div class="fr"><label class="fl">\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044b *</label></div>');
  h.push('<div id="inItemsRows"></div>');
  h.push('<button class="btn bs" style="margin-top:6px" onclick="addInItemRow()">+ \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b</button>');
  h.push('<div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:14px;border-top:1px solid var(--bd)">');
  h.push('<span style="color:var(--sub);font-size:14px">\u041e\u0431\u0449\u0430\u044f \u0441\u0443\u043c\u043c\u0430 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430</span>');
  h.push('<span id="inTotalSum" style="font-weight:700;font-size:18px;color:var(--g)">0</span>');
  h.push('</div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlIncoming\')">\u041e\u0442\u043c\u0435\u043d\u0430</button>');
  h.push('<button class="btn bp" onclick="saveIncoming()">\u041f\u0440\u0438\u043d\u044f\u0442\u044c</button></div>');
  h.push('</div></div>');

  // ── \u0421\u0438\u043c\u0443\u043b\u044f\u0446\u0438\u044f \u0440\u043e\u043b\u0438 (\u0442\u043e\u043b\u044c\u043a\u043e \u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440) ──
  h.push('<div class="mbg" id="mdlSimulate">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt">👁️ \u0412\u043e\u0439\u0442\u0438 \u043a\u0430\u043a \u0434\u0440\u0443\u0433\u0430\u044f \u0440\u043e\u043b\u044c</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlSimulate\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div style="font-size:13px;color:var(--sub);margin-bottom:14px">\u0412\u044b \u0443\u0432\u0438\u0434\u0438\u0442\u0435 \u0438\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441 \u0442\u0430\u043a, \u043a\u0430\u043a \u0435\u0433\u043e \u0432\u0438\u0434\u0438\u0442 \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u0430\u044f \u0440\u043e\u043b\u044c, \u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u0435 \u043f\u0440\u0430\u0432\u0430 \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u0430 \u043d\u0430 \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u0435/\u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u043e\u0432.</div>');
  h.push('<div class="fr"><label class="fl">\u0420\u043e\u043b\u044c</label><select class="fs" id="simRoleSel" onchange="onSimRoleChange()">');
  h.push('<option value="">\u2014 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u2014</option>');
  h.push('<option value="\u0411\u0440\u0438\u0433\u0430\u0434\u0438\u0440">\u0411\u0440\u0438\u0433\u0430\u0434\u0438\u0440</option>');
  h.push('<option value="\u0422\u0435\u0441\u0442\u043e\u0434\u0435\u043b">\u0422\u0435\u0441\u0442\u043e\u0434\u0435\u043b</option>');
  h.push('<option value="\u0417\u0430\u0432.\u0443\u043f\u0430\u043a\u043e\u0432\u0449\u0438\u0446\u0430">\u0417\u0430\u0432.\u0443\u043f\u0430\u043a\u043e\u0432\u0449\u0438\u0446\u0430</option>');
  h.push('<option value="\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c">\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c (\u041b\u0430\u0432\u0430\u0448)</option>');
  h.push('<option value="\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c \u0411\u0443\u043b\u043e\u0447\u043a\u0438">\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c (\u0411\u0443\u043b\u043e\u0447\u043a\u0438/\u0425\u043b\u0435\u0431)</option>');
  h.push('<option value="\u0417\u0430\u0432\u0441\u043a\u043b\u0430\u0434 \u0441\u044b\u0440\u044c\u044f">\u0417\u0430\u0432\u0441\u043a\u043b\u0430\u0434 \u0441\u044b\u0440\u044c\u044f</option>');
  h.push('<option value="\u0417\u0430\u0432\u0441\u043a\u043b\u0430\u0434 \u0413\u041f">\u0417\u0430\u0432\u0441\u043a\u043b\u0430\u0434 \u0413\u041f</option>');
  h.push('</select></div>');
  h.push('<div class="fr" id="simLiniyaWrap" style="display:none"><label class="fl">\u041b\u0438\u043d\u0438\u044f</label><select class="fs" id="simLiniyaSel"><option value="">\u2014 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u2014</option></select></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlSimulate\')">\u041e\u0442\u043c\u0435\u043d\u0430</button>');
  h.push('<button class="btn bp" onclick="confirmStartSimulation()">👁️ \u0412\u043e\u0439\u0442\u0438</button></div>');
  h.push('</div></div>');

  // ── Добавить SKU вручную в список распределения ──

  // ══ HR МОДАЛКИ ══

  // Личная карточка сотрудника
  h.push('<div class="mbg" id="mdlHRCard">');
  h.push('<div class="mdl" style="max-width:560px">');
  h.push('<div class="mh"><div class="mt">\uD83D\uDC64 \u041b\u0438\u0447\u043d\u0430\u044f \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0430</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlHRCard\')">&#10005;</button></div>');
  h.push('<div class="mb" id="hrCardCont" style="max-height:75vh;overflow-y:auto"></div>');
  h.push('</div></div>');

  // Отпуск / Больничный
  h.push('<div class="mbg" id="mdlLeave">');
  h.push('<div class="mdl" style="max-width:400px">');
  h.push('<div class="mh"><div class="mt">\uD83C\uDFD6 \u041e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlLeave\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div id="leaveEmpName" style="font-weight:700;margin-bottom:12px;font-size:15px"></div>');
  h.push('<div class="fr"><label class="fl">\u0422\u0438\u043f</label><select class="fs" id="leaveType"><option>\u041e\u0442\u043f\u0443\u0441\u043a</option><option>\u0411\u043e\u043b\u044c\u043d\u0438\u0447\u043d\u044b\u0439</option><option>\u0411\u0435\u0437 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f</option></select></div>');
  h.push('<div class="fr"><label class="fl">\u0414\u0430\u0442\u0430 \u043d\u0430\u0447\u0430\u043b\u0430 *</label><input type="date" class="fi" id="leaveStart"></div>');
  h.push('<div class="fr"><label class="fl">\u0414\u0430\u0442\u0430 \u043e\u043a\u043e\u043d\u0447\u0430\u043d\u0438\u044f *</label><input type="date" class="fi" id="leaveEnd"></div>');
  h.push('<div class="fr"><label class="fl">\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439</label><input class="fi" id="leaveCmt"></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlLeave\')">\u041e\u0442\u043c\u0435\u043d\u0430</button><button class="btn bp" onclick="submitLeave()">\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button></div>');
  h.push('</div></div>');

  // Увольнение
  h.push('<div class="mbg" id="mdlFire">');
  h.push('<div class="mdl" style="max-width:480px">');
  h.push('<div class="mh"><div class="mt">Увольнение сотрудника</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlFire\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div id="fireEmpInfo" style="background:rgba(239,83,80,.1);border:1px solid var(--err);border-radius:10px;padding:12px 14px;margin-bottom:14px;display:none">');
  h.push('<div style="font-weight:700;font-size:15px" id="fireEmpName"></div>');
  h.push('<div style="font-size:13px;color:var(--sub);margin-top:2px" id="fireEmpDept"></div>');
  h.push('</div>');
  h.push('<div class="fr" id="fireSearchRow"><label class="fl">Сотрудник *</label>');
  h.push('<input class="fi" id="fireSearch" placeholder="Начните вводить ФИО..." oninput="fireSearchEmp(this.value)">');
  h.push('<div id="fireSearchResults" style="background:var(--s2);border:1px solid var(--bd);border-radius:8px;max-height:180px;overflow-y:auto;display:none"></div></div>');
  h.push('<div class="fr"><label class="fl">Дата увольнения</label><input type="date" class="fi" id="fireDate"></div>');
  h.push('<div class="fr"><label class="fl">Причина *</label>');
  h.push('<select class="fs" id="fireReason">');
  h.push('<option>По собственному желанию</option>');
  h.push('<option>По инициативе работодателя</option>');
  h.push('<option>Истечение срока договора</option>');
  h.push('<option>Нарушение трудовой дисциплины</option>');
  h.push('<option>Сокращение штата</option>');
  h.push('<option>Другое</option>');
  h.push('</select></div>');
  h.push('<div class="fr"><label class="fl">Примечание</label><input class="fi" id="fireNote" placeholder="необязательно"></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlFire\')">\u041e\u0442\u043c\u0435\u043d\u0430</button><button class="btn" style="background:var(--err);color:#fff" onclick="submitFire()">Уволить</button></div>');
  h.push('</div></div>');


  // ── Перемещение кадров ──
  h.push('<div class="mbg" id="mdlMove">');
  h.push('<div class="mdl" style="max-width:480px">');
  h.push('<div class="mh"><div class="mt">Перемещение сотрудника</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlMove\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div id="moveEmpInfo" style="font-weight:700;font-size:15px;margin-bottom:16px;color:var(--g)"></div>');
  h.push('<div class="fr"><label class="fl">Дата перемещения</label><input type="date" class="fi" id="moveDate"></div>');
  h.push('<div class="fr"><label class="fl">Новый отдел</label><select class="fs" id="moveNewDept"><option value="">— без изменений —</option></select></div>');
  h.push('<div class="fr"><label class="fl">Новая должность</label><select class="fs" id="moveNewPos"><option value="">— без изменений —</option></select></div>');
  h.push('<div class="fr"><label class="fl">Причина</label><input class="fi" id="moveReason" placeholder="необязательно"></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlMove\')">Отмена</button><button class="btn bp" onclick="submitMove()">Переместить</button></div>');
  h.push('</div></div>');

  // Штатная позиция
  h.push('<div class="mbg" id="mdlStaff">');
  h.push('<div class="mdl" style="max-width:520px">');
  h.push('<div class="mh"><div class="mt" id="mdlStaffTitle">Штатная позиция</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlStaff\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<input type="hidden" id="staffRowIdx">');
  h.push('<div class="fr"><label class="fl">Отдел *</label><select class="fs" id="staffDept"><option value="">—</option></select></div>');
  h.push('<div class="fr"><label class="fl">Должность *</label><select class="fs" id="staffPos"><option value="">—</option></select></div>');
  h.push('<div class="fr"><label class="fl">Обозначение</label><input class="fi" id="staffAbbr" placeholder="напр: оп, х, пк..." style="width:120px"></div>');
  h.push('<div class="fr"><label class="fl">Вид оплаты *</label><select class="fs" id="staffPayType"><option>Оклад</option><option>Часовой</option><option>По выработке</option><option>Оклад+KPI</option></select></div>');
  h.push('<div class="fr"><label class="fl">Учесть категорию</label><select class="fs" id="staffUseCat" onchange="toggleStaffCatFields()"><option value="нет">Нет</option><option value="да">Да (A/B/C)</option></select></div>');
  h.push('<div class="fr" id="staffSalaryRow"><label class="fl">Оклад (сум)</label><input type="number" class="fi" id="staffSalary" min="0" placeholder="0"></div>');
  h.push('<div id="staffCatRow" style="display:none">');
  h.push('<div class="fr"><label class="fl" style="color:var(--err)">Оклад категория A (0–3 мес)</label><input type="number" class="fi" id="staffSalaryA" min="0" placeholder="напр: 3500000"></div>');
  h.push('<div class="fr"><label class="fl" style="color:var(--warn)">Оклад категория B (3 мес–1 год)</label><input type="number" class="fi" id="staffSalaryB" min="0" placeholder="напр: 3800000"></div>');
  h.push('<div class="fr"><label class="fl" style="color:var(--ok)">Оклад категория C (1 год+)</label><input type="number" class="fi" id="staffSalaryC" min="0" placeholder="напр: 4300000"></div>');
  h.push('</div>');
  h.push('<div class="fr"><label class="fl">Надбавка (макс)</label><input type="number" class="fi" id="staffBonus" min="0" placeholder="0"></div>');
  h.push('<div class="fr"><label class="fl">Кол-во ставок</label><input type="number" class="fi" id="staffCount" min="1" value="1"></div>');
  h.push('<div class="fr"><label class="fl">Примечание</label><input class="fi" id="staffNote" placeholder="необязательно"></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlStaff\')">Отмена</button><button class="btn bp" onclick="saveStaffPos()">Сохранить</button></div>');
  h.push('</div></div>');


  h.push('<div class="mbg" id="mdlAddSku">');
  h.push('<div class="mdl" style="max-width:380px">');
  h.push('<div class="mh"><div class="mt">+ \u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c SKU</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlAddSku\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div class="fr"><label class="fl">\u041f\u0440\u043e\u0434\u0443\u043a\u0442</label>');
  h.push('<input class="fi" id="addSkuSearch" placeholder="\u043d\u0430\u0447\u043d\u0438\u0442\u0435 \u0432\u0432\u043e\u0434\u0438\u0442\u044c \u0434\u043b\u044f \u043f\u043e\u0438\u0441\u043a\u0430..." oninput="filterAddSkuList(this.value)" autocomplete="off">');
  h.push('<div id="addSkuDropdown" style="max-height:200px;overflow-y:auto;background:var(--s2);border:1px solid var(--bd);border-top:none;border-radius:0 0 8px 8px;display:none"></div>');
  h.push('<input type="hidden" id="addSkuName">');
  h.push('</div>');
  h.push('<div class="fr"><label class="fl">\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e (\u0448\u0442)</label><input type="number" class="fi" id="addSkuQty" placeholder="0" min="1"></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlAddSku\')">\u041e\u0442\u043c\u0435\u043d\u0430</button>');
  h.push('<button class="btn bp" onclick="confirmAddSku()">\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c</button></div>');
  h.push('</div></div>');

  // ── Transfer between warehouses modal ──

  // ── МЕХАНИК: Подача заявки о поломке (Бригадир) ──
  h.push('<div class="mbg" id="mdlBreakdown">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt">🚨 \u0421\u0438\u0433\u043d\u0430\u043b \u043e \u043f\u043e\u043b\u043e\u043c\u043a\u0435</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlBreakdown\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div id="bdSectionName" style="font-weight:700;font-size:16px;margin-bottom:12px;color:var(--err)"></div>');
  h.push('<div class="fr"><label class="fl">\u041e\u043f\u0438\u0448\u0438\u0442\u0435 \u043f\u0440\u043e\u0431\u043b\u0435\u043c\u0443 *</label>');
  h.push('<textarea class="fi" id="bdComment" rows="4" placeholder="\u0427\u0442\u043e \u0441\u043b\u0443\u0447\u0438\u043b\u043e\u0441\u044c? \u041e\u043f\u0438\u0448\u0438\u0442\u0435 \u043f\u043e\u0434\u0440\u043e\u0431\u043d\u043e..." style="resize:vertical"></textarea></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlBreakdown\')">\u041e\u0442\u043c\u0435\u043d\u0430</button>');
  h.push('<button class="btn" style="background:var(--err);color:#fff" onclick="submitBreakdown()">🚨 \u041f\u043e\u0434\u0430\u0442\u044c \u0441\u0438\u0433\u043d\u0430\u043b</button></div>');
  h.push('</div></div>');

  // ── МЕХАНИК: Закрытие заявки (отчёт) ──
  h.push('<div class="mbg" id="mdlCloseTicket">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt">✅ \u0417\u0430\u043a\u0440\u044b\u0442\u044c \u0437\u0430\u044f\u0432\u043a\u0443</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlCloseTicket\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div id="ctTicketInfo" style="font-size:13px;color:var(--sub);margin-bottom:12px"></div>');
  h.push('<div class="fr"><label class="fl">\u041e\u0442\u0447\u0451\u0442: \u043f\u0440\u0438\u0447\u0438\u043d\u0430 \u0438 \u0443\u0441\u0442\u0440\u0430\u043d\u0435\u043d\u0438\u0435 *</label>');
  h.push('<textarea class="fi" id="ctReport" rows="4" placeholder="\u0427\u0442\u043e \u0441\u043b\u043e\u043c\u0430\u043b\u043e\u0441\u044c, \u043a\u0430\u043a \u0443\u0441\u0442\u0440\u0430\u043d\u0438\u043b..." style="resize:vertical"></textarea></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlCloseTicket\')">\u041e\u0442\u043c\u0435\u043d\u0430</button>');
  h.push('<button class="btn bp" onclick="submitCloseTicket()">✅ \u0417\u0430\u043a\u0440\u044b\u0442\u044c</button></div>');
  h.push('</div></div>');

  // ── МЕХАНИК: Добавить/редактировать машину ──
  h.push('<div class="mbg" id="mdlAddEquip">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt" id="addEquipTitle">\u041c\u0430\u0448\u0438\u043d\u0430</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlAddEquip\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<input type="hidden" id="equipEditId">');
  h.push('<div class="fr"><label class="fl">\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043c\u0430\u0448\u0438\u043d\u044b *</label><input class="fi" id="equipName" placeholder="\u043d\u0430\u043f\u0440\u0438\u043c\u0435\u0440: \u041b\u0430\u0432\u0430\u0448\u043d\u0430\u044f \u043b\u0438\u043d\u0438\u044f \u21161"></div>');
  h.push('<div class="fr"><label class="fl">\u041b\u0438\u043d\u0438\u044f</label><select class="fs" id="equipLiniya"><option value="">\u2014</option></select></div>');
  h.push('<div class="fr"><label class="fl">\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435</label><input class="fi" id="equipDesc" placeholder="\u043d\u0435\u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e"></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlAddEquip\')">\u041e\u0442\u043c\u0435\u043d\u0430</button>');
  h.push('<button class="btn bp" onclick="saveEquipment()">\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button></div>');
  h.push('</div></div>');

  // ── МЕХАНИК: Добавить секцию ──
  h.push('<div class="mbg" id="mdlAddSection">');
  h.push('<div class="mdl" style="max-width:380px">');
  h.push('<div class="mh"><div class="mt">\u0421\u0435\u043a\u0446\u0438\u044f</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlAddSection\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<input type="hidden" id="sectionEditId">');
  h.push('<input type="hidden" id="sectionEquipId">');
  h.push('<div class="fr"><label class="fl">\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0441\u0435\u043a\u0446\u0438\u0438 *</label><input class="fi" id="sectionName" placeholder="\u043d\u0430\u043f\u0440\u0438\u043c\u0435\u0440: \u0421\u0435\u043a\u0446\u0438\u044f \u043f\u0435\u0447\u0438"></div>');
  h.push('<div class="fr"><label class="fl">\u0418\u043a\u043e\u043d\u043a\u0430 (emoji)</label><input class="fi" id="sectionIcon" placeholder="⚙️" style="width:80px"></div>');
  h.push('<div class="fr"><label class="fl">\u041f\u043e\u0440\u044f\u0434\u043e\u043a</label><input type="number" class="fi" id="sectionOrder" placeholder="1" style="width:80px"></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlAddSection\')">\u041e\u0442\u043c\u0435\u043d\u0430</button>');
  h.push('<button class="btn bp" onclick="saveSection()">\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button></div>');
  h.push('</div></div>');



  // ── Модалка: Шаблон договора ──
  h.push('<div class="mbg" id="mdlContractTpl">');
  h.push('<div class="mdl" style="max-width:700px;max-height:90vh;overflow-y:auto">');
  h.push('<div class="mh"><div class="mt" id="mdlContractTplTitle">\u0428\u0430\u0431\u043b\u043e\u043d \u0434\u043e\u0433\u043e\u0432\u043e\u0440\u0430</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlContractTpl\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<input type="hidden" id="ctplId">');
  h.push('<div class="fr"><label class="fl">\u0414\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c *</label><select class="fs" id="ctplPos"><option value="">\u2014</option></select></div>');
  h.push('<div class="fr"><label class="fl">\u0412\u0438\u0434 \u043e\u043f\u043b\u0430\u0442\u044b</label><select class="fs" id="ctplPayType"><option>\u041f\u043e \u0448\u0442\u0430\u0442\u043d\u043e\u043c\u0443 \u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u044e</option><option>\u041a\u043e\u043d\u0442\u0440\u0430\u043a\u0442\u043d\u044b\u0439</option><option>\u041f\u043e \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044e KPI</option><option>\u0412\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u0438\u0439</option></select></div>');
  h.push('<div class="fr"><label class="fl">\u0421\u0440\u043e\u043a \u0434\u043e\u0433\u043e\u0432\u043e\u0440\u0430</label><select class="fs" id="ctplTerm"><option>\u0411\u0435\u0441\u0441\u0440\u043e\u0447\u043d\u044b\u0439</option><option>1 \u0433\u043e\u0434</option><option>2 \u0433\u043e\u0434\u0430</option><option>3 \u0433\u043e\u0434\u0430</option></select></div>');
  h.push('<div class="fr"><label class="fl">\u041e\u0431\u044f\u0437\u0430\u043d\u043d\u043e\u0441\u0442\u0438 \u0445\u043e\u0434\u0438\u043c\u0430</label><textarea class="fi" id="ctplDuties" rows="4" placeholder="\u041c\u0430\u0436\u0431\u0443\u0440\u0438\u044f\u0442\u043b\u0430\u0440\u0438 \u0440\u043e\u0439\u0445\u0430\u0442\u0438..." style="resize:vertical"></textarea></div>');
  h.push('<div class="fr"><label class="fl">\u041f\u0440\u0430\u0432\u0430 \u0445\u043e\u0434\u0438\u043c\u0430</label><textarea class="fi" id="ctplEmpRights" rows="3" style="resize:vertical"></textarea></div>');
  h.push('<div class="fr"><label class="fl">\u041f\u0440\u0430\u0432\u0430 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438</label><textarea class="fi" id="ctplCompRights" rows="3" style="resize:vertical"></textarea></div>');
  h.push('<div class="fr"><label class="fl">\u041e\u043f\u043b\u0430\u0442\u0430 (\u0442\u0435\u043a\u0441\u0442)</label><textarea class="fi" id="ctplPayText" rows="3" placeholder="\u041e\u043f\u043b\u0430\u0442\u0430 \u0448\u0430\u0440\u0442\u0438 ..." style="resize:vertical"></textarea></div>');
  h.push('<div class="fr"><label class="fl">\u0412\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u0438\u0435 \u0441\u0442\u0430\u043d\u0434\u0430\u0440\u0442\u044b</label><textarea class="fi" id="ctplStandards" rows="3" style="resize:vertical"></textarea></div>');
  h.push('<div class="fr"><label class="fl">\u0414\u043e\u043f. \u0443\u0441\u043b\u043e\u0432\u0438\u044f</label><textarea class="fi" id="ctplExtra" rows="2" style="resize:vertical"></textarea></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlContractTpl\')">\u041e\u0442\u043c\u0435\u043d\u0430</button><button class="btn bp" onclick="saveContractTpl()">\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button></div>');
  h.push('</div></div>');

  // ── Модалка: Создать договор ──
  h.push('<div class="mbg" id="mdlGenContract">');
  h.push('<div class="mdl" style="max-width:500px">');
  h.push('<div class="mh"><div class="mt">\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0434\u043e\u0433\u043e\u0432\u043e\u0440</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlGenContract\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div class="fr"><label class="fl">\u0428\u0430\u0431\u043b\u043e\u043d *</label><select class="fs" id="genTplId"><option value="">\u2014</option></select></div>');
  h.push('<div class="fr"><label class="fl">\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a *</label>');
  h.push('<input class="fi" id="genEmpSearch" placeholder="\u041d\u0430\u0447\u043d\u0438\u0442\u0435 \u0432\u0432\u043e\u0434\u0438\u0442\u044c \u0424\u0418\u041e..." oninput="genSearchEmp(this.value)">');
  h.push('<div id="genEmpResults" style="background:var(--s2);border:1px solid var(--bd);border-radius:8px;max-height:160px;overflow-y:auto;display:none"></div>');
  h.push('<div id="genEmpInfo" style="font-size:13px;color:var(--ok);margin-top:4px;display:none"></div>');
  h.push('</div>');
  h.push('<input type="hidden" id="genEmpId">');
  h.push('<div class="fr"><label class="fl">\u0414\u0430\u0442\u0430 \u043d\u0430\u0447\u0430\u043b\u0430</label><input type="date" class="fi" id="genStartDate"></div>');
  h.push('<div class="fr"><label class="fl">\u0414\u0430\u0442\u0430 \u043e\u043a\u043e\u043d\u0447\u0430\u043d\u0438\u044f</label><input type="date" class="fi" id="genEndDate" placeholder="\u0434\u043b\u044f \u0431\u0435\u0441\u0441\u0440\u043e\u0447\u043d\u043e\u0433\u043e"></div>');
  h.push('<div class="fr"><label class="fl">\u041e\u043a\u043b\u0430\u0434 (\u0441\u0443\u043c)</label><input type="number" class="fi" id="genSalary" placeholder="0"></div>');
  h.push('<div class="fr"><label class="fl">\u041c\u0435\u0441\u0442\u043e \u0440\u0430\u0431\u043e\u0442\u044b</label><input class="fi" id="genCity" value="\u0421\u0430\u043c\u0430\u0440\u049b\u0430\u043d\u0434"></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlGenContract\')">\u041e\u0442\u043c\u0435\u043d\u0430</button><button class="btn bp" id="genContractBtn" onclick="generateContract()">\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0438 \u0441\u043a\u0430\u0447\u0430\u0442\u044c</button></div>');
  h.push('</div></div>');

  // ── Модалка: Добавить/редактировать товар ──

  // ── Модалка: Конструктор штатного расписания ──
  // ── Модалка: Настройка привязки HR-отделов к линиям ──
  // ── Модалка: Решение по согласованию (Утвердить/Отклонить) ──
  h.push('<div class="mbg" id="mdlApprovalDecision">');
  h.push('<div class="mdl" style="max-width:480px">');
  h.push('<div class="mh"><div class="mt">\u0420\u0435\u0448\u0435\u043d\u0438\u0435 \u043f\u043e \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0443</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlApprovalDecision\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div id="apDecTitle" style="font-weight:700;font-size:15px;margin-bottom:4px"></div>');
  h.push('<div id="apDecMeta" style="font-size:13px;color:var(--sub);margin-bottom:14px"></div>');
  h.push('<div class="fr"><label class="fl">\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439 (\u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u0435\u043d \u043f\u0440\u0438 \u043e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u0438\u0438)</label><textarea class="fi" id="apDecComment" rows="3" placeholder="\u041f\u0440\u0438\u0447\u0438\u043d\u0430, \u0447\u0442\u043e \u0438\u0441\u043f\u0440\u0430\u0432\u0438\u0442\u044c..." style="resize:vertical"></textarea></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn" style="background:var(--err);color:#fff" onclick="submitApprovalDecision(false)">\u2716 \u041e\u0442\u043a\u043b\u043e\u043d\u0438\u0442\u044c</button><button class="btn" style="background:var(--ok);color:#fff" onclick="submitApprovalDecision(true)">\u2714 \u0423\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c</button></div>');
  h.push('</div></div>');

  // ── Модалка: Себестоимость SKU ──
  h.push('<div class="mbg" id="mdlSkuCost">');
  h.push('<div class="mdl" style="max-width:460px">');
  h.push('<div class="mh"><div class="mt">\u0421\u0435\u0431\u0435\u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u0430</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlSkuCost\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div class="fr"><label class="fl">\u041f\u0440\u043e\u0434\u0443\u043a\u0442 (SKU) *</label><select class="fs" id="skcProduct"><option value="">\u2014</option></select></div>');
  h.push('<div class="fr"><label class="fl">\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044b (\u0441\u0443\u043c/\u0448\u0442)</label><input type="number" class="fi" id="skcMaterials" min="0" placeholder="0"><div id="skcMatHint" style="font-size:12px;color:var(--sub);margin-top:4px"></div></div>');
  h.push('<div class="fr"><label class="fl">\u0422\u0440\u0443\u0434 (\u0441\u0443\u043c/\u0448\u0442)</label><input type="number" class="fi" id="skcLabor" min="0" placeholder="0"></div>');
  h.push('<div class="fr"><label class="fl">\u041f\u0440\u043e\u0447\u0438\u0435 \u0440\u0430\u0441\u0445\u043e\u0434\u044b (\u0441\u0443\u043c/\u0448\u0442)</label><input type="number" class="fi" id="skcOther" min="0" placeholder="0"></div>');
  h.push('<div style="background:var(--s2);border-radius:8px;padding:10px 14px;font-size:14px;display:flex;justify-content:space-between"><span style="color:var(--sub)">\u0418\u0442\u043e\u0433\u043e:</span><b id="skcTotal" style="color:var(--g)">0</b></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlSkuCost\')">\u041e\u0442\u043c\u0435\u043d\u0430</button><button class="btn bp" onclick="saveSkuCost()">\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button></div>');
  h.push('</div></div>');

  h.push('<div class="mbg" id="mdlPayrollMap">');
  h.push('<div class="mdl" style="max-width:600px;max-height:88vh;overflow-y:auto">');
  h.push('<div class="mh"><div class="mt">\u041f\u0440\u0438\u0432\u044f\u0437\u043a\u0430 \u043e\u0442\u0434\u0435\u043b\u043e\u0432 \u043a \u043b\u0438\u043d\u0438\u044f\u043c</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlPayrollMap\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div style="font-size:13px;color:var(--sub);margin-bottom:14px">\u041a\u0430\u0436\u0434\u044b\u0439 HR-\u043e\u0442\u0434\u0435\u043b (\u043d\u0430\u043f\u0440: "\u0426\u0435\u0445 \u041b\u0438\u043d\u0438\u044f 1 \u0434\u0435\u043d\u044c") \u043f\u0440\u0438\u0432\u044f\u0437\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u043a \u0441\u0438\u0441\u0442\u0435\u043c\u043d\u043e\u0439 \u043b\u0438\u043d\u0438\u0438. \u0414\u0435\u043d\u044c \u0438 \u043d\u043e\u0447\u044c \u043e\u0434\u043d\u043e\u0439 \u043b\u0438\u043d\u0438\u0438 \u043c\u043e\u0436\u043d\u043e \u043f\u0440\u0438\u0432\u044f\u0437\u0430\u0442\u044c \u043a \u043e\u0434\u043d\u043e\u0439 \u0438 \u0442\u043e\u0439 \u0436\u0435 \u043b\u0438\u043d\u0438\u0438 \u2014 \u0438\u0445 \u0444\u043e\u043d\u0434\u044b \u0441\u043b\u043e\u0436\u0430\u0442\u0441\u044f.</div>');
  h.push('<div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-bottom:14px">');
  h.push('<select class="fs" id="pmDept"><option value="">\u2014 \u043e\u0442\u0434\u0435\u043b HR \u2014</option></select>');
  h.push('<select class="fs" id="pmLiniya"><option value="">\u2014 \u043b\u0438\u043d\u0438\u044f \u2014</option></select>');
  h.push('<button class="btn bp" onclick="savePayrollMapping()">+</button>');
  h.push('</div>');
  h.push('<div id="pmListCont"></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlPayrollMap\')">\u0417\u0430\u043a\u0440\u044b\u0442\u044c</button></div>');
  h.push('</div></div>');


  h.push('<div class="mbg" id="mdlStaffDoc">');
  h.push('<div class="mdl" style="max-width:95vw;width:1100px;max-height:90vh;overflow-y:auto">');
  h.push('<div class="mh"><div class="mt">Штат жадвали — конструктор</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlStaffDoc\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div class="fr"><label class="fl">Отдел / заголовок документа *</label><input class="fi" id="sdDept" list="sdDeptList" placeholder="Напр: ТЕХНИК БЪЛИМИ" oninput="syncStaffDocDept()"><datalist id="sdDeptList"></datalist></div>');
  h.push('<div id="sdBuilderArea" style="margin-top:8px"></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlStaffDoc\')">Отмена</button><button class="btn bp" onclick="saveStaffDocBuilder()">Сохранить</button></div>');
  h.push('</div></div>');

  h.push('<div class="mbg" id="mdlAssetMove">');
  h.push('<div class="mdl" style="max-width:480px">');
  h.push('<div class="mh"><div class="mt">Переместить ОС</div><button class="mc" onclick="closeMdl(\'mdlAssetMove\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div id="amInfo" style="font-weight:700;margin-bottom:14px;color:var(--g)"></div>');
  h.push('<input type="hidden" id="amInvNum">');
  h.push('<div class="fr"><label class="fl">Новое подразделение *</label><select class="fs" id="amTo"><option value="">—</option></select></div>');
  h.push('<div class="fr"><label class="fl">Ответственное лицо</label><input class="fi" id="amResponsible"></div>');
  h.push('<div class="fr"><label class="fl">Основание</label><input class="fi" id="amReason" placeholder="необязательно"></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlAssetMove\')">Отмена</button><button class="btn bp" onclick="saveAssetMove()">Переместить</button></div>');
  h.push('</div></div>');

  h.push('<div class="mbg" id="mdlAssetWriteOff">');
  h.push('<div class="mdl" style="max-width:480px">');
  h.push('<div class="mh"><div class="mt">Списать ОС</div><button class="mc" onclick="closeMdl(\'mdlAssetWriteOff\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div id="awInfo" style="font-weight:700;margin-bottom:14px;color:var(--g)"></div>');
  h.push('<input type="hidden" id="awInvNum">');
  h.push('<div class="fr"><label class="fl">Причина *</label><select class="fs" id="awReason"><option value="">—</option></select></div>');
  h.push('<div class="fr"><label class="fl">Примечание</label><input class="fi" id="awNote" placeholder="необязательно"></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlAssetWriteOff\')">Отмена</button><button class="btn" style="background:var(--err);color:#fff" onclick="saveAssetWriteOff()">Списать</button></div>');
  h.push('</div></div>');

  h.push('<div class="mbg" id="mdlAmortCreate">');
  h.push('<div class="mdl" style="max-width:700px">');
  h.push('<div class="mh"><div class="mt">Создать документ амортизации</div><button class="mc" onclick="closeMdl(\'mdlAmortCreate\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div class="fr2">');
  h.push('<div class="fr" style="margin:0"><label class="fl">Год</label><input type="number" class="fi" id="amcYear"></div>');
  h.push('<div class="fr" style="margin:0"><label class="fl">Месяц</label><select class="fs" id="amcMonth">');
  h.push('<option value="1">Январь</option><option value="2">Февраль</option><option value="3">Март</option>');
  h.push('<option value="4">Апрель</option><option value="5">Май</option><option value="6">Июнь</option>');
  h.push('<option value="7">Июль</option><option value="8">Август</option><option value="9">Сентябрь</option>');
  h.push('<option value="10">Октябрь</option><option value="11">Ноябрь</option><option value="12">Декабрь</option>');
  h.push('</select></div>');
  h.push('</div>');
  h.push('<button class="btn bs" style="margin-bottom:14px" onclick="amortLoadPreview()">Показать объекты</button>');
  h.push('<div id="amcPreviewArea"></div>');
  h.push('<div class="fr" style="margin-top:14px"><label class="fl">Комментарий</label><input class="fi" id="amcComment" placeholder="необязательно"></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlAmortCreate\')">Отмена</button><button class="btn bp" id="amcSaveBtn" onclick="amortSaveDocument()">Записать</button></div>');
  h.push('</div></div>');

  h.push('<div class="mbg" id="mdlAmortDetail">');
  h.push('<div class="mdl" style="max-width:800px">');
  h.push('<div class="mh"><div class="mt">Документ амортизации</div><button class="mc" onclick="closeMdl(\'mdlAmortDetail\')">&#10005;</button></div>');
  h.push('<div class="mb"><div id="amdBody"></div></div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlAmortDetail\')">Закрыть</button></div>');
  h.push('</div></div>');

  h.push('<div class="mbg" id="mdlInventoryCreate">');
  h.push('<div class="mdl" style="max-width:480px">');
  h.push('<div class="mh"><div class="mt">Новая инвентаризация</div><button class="mc" onclick="closeMdl(\'mdlInventoryCreate\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div class="fr"><label class="fl">Название *</label><input class="fi" id="icName" placeholder="Например: Инвентаризация июль 2026"></div>');
  h.push('<div class="fr"><label class="fl">Подразделение</label><select class="fs" id="icDept"><option value="">Все подразделения</option></select></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlInventoryCreate\')">Отмена</button><button class="btn bp" onclick="saveInventoryCreate()">Создать</button></div>');
  h.push('</div></div>');

  h.push('<div class="mbg" id="mdlInventoryDetail">');
  h.push('<div class="mdl" style="max-width:800px">');
  h.push('<div class="mh"><div class="mt">Инвентаризация</div><button class="mc" onclick="closeMdl(\'mdlInventoryDetail\')">&#10005;</button></div>');
  h.push('<div class="mb"><div id="idBody"></div></div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlInventoryDetail\')">Закрыть окно</button><button class="btn" id="idCloseBtn" style="display:none;background:var(--err);color:#fff" onclick="assetsCloseInventoryNow()">Закрыть инвентаризацию</button></div>');
  h.push('</div></div>');



  h.push('<div class="mbg" id="mdlProduct">');
  h.push('<div class="mdl" style="max-width:440px">');
  h.push('<div class="mh"><div class="mt" id="mdlProductTitle">\u0422\u043e\u0432\u0430\u0440</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlProduct\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<input type="hidden" id="prdId">');
  h.push('<div class="fr"><label class="fl">\u0413\u0440\u0443\u043f\u043f\u0430 *</label><select class="fs" id="prdKlass"><option value="\u041b\u0430\u0432\u0430\u0448">\uD83E\uDD6B \u041b\u0430\u0432\u0430\u0448</option><option value="\u0411\u0443\u043b\u043e\u0447\u043a\u0430">\uD83C\uDF5E \u0411\u0443\u043b\u043e\u0447\u043a\u0430</option><option value="\u0425\u043b\u0435\u0431">\uD83C\uDF5F \u0425\u043b\u0435\u0431</option></select></div>');
  h.push('<div class="fr"><label class="fl">\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 *</label><input class="fi" id="prdName" placeholder="\u043d\u0430\u043f\u0440\u0438\u043c\u0435\u0440: \u041b\u0430\u0432\u0430\u0448 \u0421\u0422\u0410\u041d\u0414\u0410\u0420\u0422 \u043f\u043e 20 \u0448\u0442"></div>');
  h.push('<div class="fr"><label class="fl">\u0415\u0434. \u0438\u0437\u043c\u0435\u0440\u0435\u043d\u0438\u044f</label><input class="fi" id="prdUnit" placeholder="\u0448\u0442" style="width:120px"></div>');
  h.push('<div class="fr"><label class="fl">\u0424\u0430\u0441\u043e\u0432\u043a\u0430</label><input type="number" class="fi" id="prdPack" placeholder="1" min="1" style="width:120px"></div>');
  h.push('<div class="fr"><label class="fl">\u041b\u0438\u043d\u0438\u044f</label><select class="fs" id="prdLine"><option value="">\u2014 \u043d\u0435 \u043f\u0440\u0438\u0432\u044f\u0437\u0430\u043d\u0430 \u2014</option></select></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlProduct\')">\u041e\u0442\u043c\u0435\u043d\u0430</button>');
  h.push('<button class="btn bp" onclick="saveProductItem()">\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button></div>');
  h.push('</div></div>');

  // ── Transfer between warehouses modal ──
  h.push('<div class="mbg" id="mdlTransfer">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt">\u041d\u043e\u0432\u043e\u0435 \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0435</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlTransfer\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div class="fr"><label class="fl">\u0421\u043a\u043b\u0430\u0434-\u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u0435\u043b\u044c *</label><select class="fs" id="trFrom" onchange="onTrFromChange()"><option value="">\u2014 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0430... \u2014</option></select></div>');
  h.push('<div class="fr"><label class="fl">\u0421\u043a\u043b\u0430\u0434-\u043f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u044c *</label><select class="fs" id="trTo" onchange="onTrToChange()"><option value="">\u2014 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u2014</option></select></div>');
  h.push('<div class="fr"><label class="fl">\u041f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u044c *</label><select class="fs" id="trReceiver"><option value="">\u2014 \u0441\u043d\u0430\u0447\u0430\u043b\u0430 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u043a\u043b\u0430\u0434 \u2014</option></select></div>');
  h.push('<div class="fr"><label class="fl">\u0422\u043e\u0432\u0430\u0440\u044b *</label></div>');
  h.push('<div id="transferItemsRows"></div>');
  h.push('<button class="btn bs" style="margin-top:6px" onclick="addTransferItemRow()">+ \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0442\u043e\u0432\u0430\u0440</button>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlTransfer\')">\u041e\u0442\u043c\u0435\u043d\u0430</button>');
  h.push('<button class="btn bp" onclick="saveTransfer()">\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c</button></div>');
  h.push('</div></div>');

  // ── Причина отклонения перемещения ──
  h.push('<div class="mbg" id="mdlRejectTransfer">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt">\u041f\u0440\u0438\u0447\u0438\u043d\u0430 \u043e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u0438\u044f</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlRejectTransfer\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div class="fr"><label class="fl">\u041f\u0440\u0438\u0447\u0438\u043d\u0430 *</label><textarea class="fi" id="rejectReasonInput" rows="3" placeholder="\u041d\u0430\u043f\u0440\u0438\u043c\u0435\u0440: \u043d\u0435\u0432\u0435\u0440\u043d\u043e\u0435 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e, \u043d\u0435 \u0442\u043e\u0442 \u0442\u043e\u0432\u0430\u0440"></textarea></div>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlRejectTransfer\')">\u041e\u0442\u043c\u0435\u043d\u0430</button>');
  h.push('<button class="btn bd" onclick="confirmRejectTransfer()">\u041e\u0442\u043a\u043b\u043e\u043d\u0438\u0442\u044c</button></div>');
  h.push('</div></div>');

  // ── Исправить и переотправить отклонённое перемещение ──
  h.push('<div class="mbg" id="mdlResendTransfer">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt">\u0418\u0441\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0438 \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u043d\u043e\u0432\u043e</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlResendTransfer\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div id="resendTrInfo" style="margin-bottom:12px;padding:10px;background:rgba(239,83,80,.1);border-radius:8px;font-size:13px"></div>');
  h.push('<div class="fr"><label class="fl">\u0421\u043a\u043b\u0430\u0434-\u043f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u044c</label><input class="fi" id="resendTrTo" disabled></div>');
  h.push('<div class="fr"><label class="fl">\u041f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u044c *</label><select class="fs" id="resendTrReceiver"><option value="">\u2014 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u2014</option></select></div>');
  h.push('<div class="fr"><label class="fl">\u0422\u043e\u0432\u0430\u0440\u044b *</label></div>');
  h.push('<div id="resendTrItemsRows"></div>');
  h.push('<button class="btn bs" style="margin-top:6px" onclick="addResendTrItemRow()">+ \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0442\u043e\u0432\u0430\u0440</button>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlResendTransfer\')">\u041e\u0442\u043c\u0435\u043d\u0430</button>');
  h.push('<button class="btn bp" onclick="saveResendTransfer()">\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u043d\u043e\u0432\u043e</button></div>');
  h.push('</div></div>');

  // ── Норма расходов — модалка редактирования рецептуры ──
  h.push('<div class="mbg" id="mdlNorm">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt">\u041d\u043e\u0440\u043c\u0430 \u0440\u0430\u0441\u0445\u043e\u0434\u043e\u0432</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlNorm\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div class="fr"><label class="fl">\u041f\u0440\u043e\u0434\u0443\u043a\u0442 *</label><select class="fs" id="normProduct"><option value="">\u2014 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u2014</option></select></div>');
  h.push('<div class="fr"><label class="fl">\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0432 \u043f\u0430\u0440\u0442\u0438\u0438 (\u0435\u0434.) *</label><input type="number" class="fi" id="normBatchQty" placeholder="\u043d\u0430\u043f\u0440\u0438\u043c\u0435\u0440: 1110" oninput="document.getElementById(\'normLinesRows\').querySelectorAll(\'input\').forEach(function(i){updateNormHint(i)})"></div>');
  h.push('<div class="fr"><label class="fl">\u0421\u043e\u0441\u0442\u0430\u0432 (\u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b — \u0440\u0430\u0441\u0445\u043e\u0434 \u043d\u0430 \u0432\u0441\u044e \u043f\u0430\u0440\u0442\u0438\u044e) *</label></div>');
  h.push('<div id="normLinesRows"></div>');
  h.push('<button class="btn bs" style="margin-top:6px" onclick="addNormLineRow()">+ \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c</button>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlNorm\')">\u041e\u0442\u043c\u0435\u043d\u0430</button>');
  h.push('<button class="btn bp" onclick="saveNorm()">\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button></div>');
  h.push('</div></div>');

  // ── Акт списания материалов ──
  h.push('<div class="mbg" id="mdlWriteOff">');
  h.push('<div class="mdl">');
  h.push('<div class="mh"><div class="mt">\u0421\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u043e\u0432</div>');
  h.push('<button class="mc" onclick="closeMdl(\'mdlWriteOff\')">&#10005;</button></div>');
  h.push('<div class="mb">');
  h.push('<div id="writeOffRows"></div>');
  h.push('<button class="btn bs" style="margin-top:6px" onclick="addWriteOffRow()">+ \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c</button>');
  h.push('</div>');
  h.push('<div class="mf"><button class="btn bs" onclick="closeMdl(\'mdlWriteOff\')">\u041e\u0442\u043c\u0435\u043d\u0430</button>');
  h.push('<button class="btn bp" onclick="saveWriteOff()">\u0421\u043f\u0438\u0441\u0430\u0442\u044c</button></div>');
  h.push('</div></div>');

  return h.join('\n');
}

// ─── ВЕСЬ КЛИЕНТСКИЙ JS ───────────────────────────────────────
function getSpaJs() {
  var js = [];

  js.push('// ── State ──');
  js.push('var APP_URL = "' + ScriptApp.getService().getUrl().replace('/dev', '/exec') + '";');
  js.push('var TOKEN = null;');
  js.push('var USER  = null;');
  js.push('var REAL_USER = null; // \u0440\u0435\u0430\u043b\u044c\u043d\u044b\u0439 \u0430\u0434\u043c\u0438\u043d, \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u0435\u0442\u0441\u044f \u043f\u0440\u0438 \u0432\u0445\u043e\u0434\u0435 \u0432 \u0440\u0435\u0436\u0438\u043c \u0441\u0438\u043c\u0443\u043b\u044f\u0446\u0438\u0438');
  js.push('var SIM_ROLE = null;   // \u0440\u043e\u043b\u044c, \u043a\u043e\u0442\u043e\u0440\u0443\u044e \u0441\u0435\u0439\u0447\u0430\u0441 \u0441\u0438\u043c\u0443\u043b\u0438\u0440\u0443\u0435\u0442 \u0430\u0434\u043c\u0438\u043d (null = \u0440\u0435\u0436\u0438\u043c \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d)');
  js.push('var SIM_LINIYA = null;');
  js.push('var allUsers = [], allEq = [], allLines = [];');
  js.push('');

  js.push('// ── Init ──');
  js.push('document.addEventListener("DOMContentLoaded", function() {');
  js.push('  document.getElementById("btnLogin").addEventListener("click", doLogin);');
  js.push('  document.getElementById("iPass").addEventListener("keydown", function(e) {');
  js.push('    if (e.key === "Enter") doLogin();');
  js.push('  });');
  js.push('  document.getElementById("iLogin").addEventListener("keydown", function(e) {');
  js.push('    if (e.key === "Enter") doLogin();');
  js.push('  });');
  js.push('  // Разблокировка AudioContext при первом тапе (iOS Safari требует этого)');
  js.push('  document.addEventListener("touchstart", unlockAudio, {once: true, passive: true});');
  js.push('  document.addEventListener("click", unlockAudio, {once: true});');
  js.push('  // Закрытие модалок по клику на фон');
  js.push('  document.querySelectorAll(".mbg").forEach(function(b) {');
  js.push('    b.addEventListener("click", function(e) { if (e.target === b) b.classList.remove("show"); });');
  js.push('  });');
  js.push('  // Закрываем dropdown поиска SKU при потере фокуса');
  js.push('  document.addEventListener("click", function(e) {');
  js.push('    var dd = document.getElementById("addSkuDropdown");');
  js.push('    var inp = document.getElementById("addSkuSearch");');
  js.push('    if (dd && inp && !inp.contains(e.target) && !dd.contains(e.target)) dd.style.display = "none";');
  js.push('  });');
  js.push('});');
  js.push('');

  js.push('// ── LOGIN ──');
  js.push('function doLogin() {');
  js.push('  var login = document.getElementById("iLogin").value.trim();');
  js.push('  var pass  = document.getElementById("iPass").value;');
  js.push('  if (!login || !pass) { showLoginErr("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043b\u043e\u0433\u0438\u043d \u0438 \u043f\u0430\u0440\u043e\u043b\u044c"); return; }');
  js.push('  var btn = document.getElementById("btnLogin");');
  js.push('  btn.disabled = true;');
  js.push('  btn.textContent = "\u0412\u0445\u043e\u0434\u0438\u043c...";');
  js.push('  btn.style.opacity = "0.7";');
  js.push('  showScreen("screenLoading");');
  js.push('  srv("login", {login: login, password: pass}, function(res) {');
  js.push('    if (res.ok) {');
  js.push('      TOKEN = res.token;');
  js.push('      USER  = res.user;');
  js.push('      initApp();');
  js.push('    } else {');
  js.push('      showScreen("screenLogin");');
  js.push('      btn.disabled = false;');
  js.push('      btn.textContent = "\u0412\u041e\u0419\u0422\u0418";');
  js.push('      btn.style.opacity = "";');
  js.push('      showLoginErr(res.error || "\u041e\u0448\u0438\u0431\u043a\u0430 \u0432\u0445\u043e\u0434\u0430");');
  js.push('      if (res.needSetup) document.getElementById("setupLnk").style.display = "block";');
  js.push('    }');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function doSetup() {');
  js.push('  if (!confirm("Инициализировать систему?")) return;');
  js.push('  srv("setup", {}, function(res) {');
  js.push('    if (res.ok || res.url) { alert("Готово! Логин: admin  Пароль: admin123"); location.reload(); }');
  js.push('    else alert("Ошибка: " + res.error);');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function showLoginErr(msg) {');
  js.push('  var el = document.getElementById("loginErr");');
  js.push('  el.textContent = msg; el.style.display = "block";');
  js.push('}');
  js.push('');

  js.push('// ── APP INIT ──');
  js.push('function initApp() {');
  js.push('  // Устанавливаем цвет роли');
  js.push('  var rc = rColor(USER.role);');
  js.push('  document.documentElement.style.setProperty("--rc", rc);');
  js.push('  // Аватар в шапке');
  js.push('  var av = document.getElementById("hdrAvatar");');
  js.push('  av.textContent = initials(USER.fio);');
  js.push('  av.style.background = rc;');
  js.push('  // Инфо в сайдбаре');
  js.push('  var ini = initials(USER.fio);');
  js.push('  var lineInfo = USER.liniya ? ("\\n" + USER.liniya + (USER.smena ? " · " + USER.smena : "")) : "";');
  js.push('  document.getElementById("sbUser").innerHTML =');
  js.push('    "<div class=\\"avatar\\" style=\\"width:40px;height:40px;font-size:16px;background:" + rc + "\\">" + ini + "</div>" +');
  js.push('    "<div style=\\"margin-top:8px;font-weight:600\\">" + USER.fio + "</div>" +');
  js.push('    "<div style=\\"font-size:11px;color:" + rc + ";font-weight:600;margin-top:2px;text-transform:uppercase\\">" + USER.role + "</div>" +');
  js.push('    (USER.liniya ? "<div style=\\"font-size:11px;color:var(--sub);margin-top:2px\\">" + USER.liniya + (USER.smena ? " · " + USER.smena : "") + "</div>" : "");');
  js.push('  // Навигация');
  js.push('  buildNav();');
  js.push('  // Кнопка \u00abвойти как другая роль\u00bb видна только реальному \u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u0443, не во время симуляции');
  js.push('  var simBtn = document.getElementById("sbSimulateBtn");');
  js.push('  if (simBtn) simBtn.style.display = (USER.role === "\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440" && !REAL_USER) ? "block" : "none";');
  js.push('  // Показываем приложение');
  js.push('  showScreen("screenApp");');
  js.push('  // Запускаем polling заявок для Механика и Бригадира');
  js.push('  if (USER.role === "\\u041c\u0435\u0445\u0430\u043d\u0438\u043a" || USER.role === "\\u0411\u0440\u0438\u0433\u0430\u0434\u0438\u0440") {');
  js.push('    startMechPolling();');
  js.push('    // Немедленная проверка при входе — не ждём 15 сек');
  js.push('    srv("mechGetActiveAlerts", {}, function(res) {');
  js.push('      if (!res.ok) return;');
  js.push('      mechLastAlertIds = res.alerts.map(function(a){return a.id;});');
  js.push('      updateMechBadge(res.alerts.length);');
  js.push('      // Механик: если есть "Новые" заявки — сразу непрерывный сигнал');
  js.push('      if (USER.role === "\\u041c\u0435\u0445\u0430\u043d\u0438\u043a") {');
  js.push('        var hasNew = res.alerts.some(function(a){ return a.status === "\\u041d\u043e\u0432\u0430\u044f"; });');
  js.push('        if (hasNew) startAlarmLoop();');
  js.push('      }');
  js.push('    });');
  js.push('  }');
  js.push('  // Загружаем данные в зависимости от роли');
  js.push('  if (USER.role === "\u0411\u0440\u0438\u0433\u0430\u0434\u0438\u0440") {');
  js.push('    nav("shift");');
  js.push('  } else if (USER.role === "\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c") {');
  js.push('    nav("schedule");');
  js.push('  } else if (USER.role === "\u0417\u0430\u0432\u0441\u043a\u043b\u0430\u0434 \u0441\u044b\u0440\u044c\u044f" || USER.role === "\u0417\u0430\u0432\u0441\u043a\u043b\u0430\u0434 \u0413\u041f") {');
  js.push('    nav("warehousebalances");');
  js.push('  } else if (USER.role === "\u0422\u0435\u0441\u0442\u043e\u0434\u0435\u043b" || USER.role === "\u0417\u0430\u0432.\u0443\u043f\u0430\u043a\u043e\u0432\u0449\u0438\u0446\u0430") {');
  js.push('    nav("warehousebalances");');
  js.push('  } else {');
  js.push('    loadLines();');
  js.push('    loadDashboard();');
  js.push('    setPageTitle("\u0413\u043b\u0430\u0432\u043d\u0430\u044f");');
  js.push('  }');
  js.push('}');
  js.push('');

  js.push('// ── \u0420\u0415\u0416\u0418\u041c \u0421\u0418\u041c\u0423\u041b\u042f\u0426\u0418\u0418 \u0420\u041e\u041b\u0418 (\u0442\u043e\u043b\u044c\u043a\u043e \u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440) ──');
  js.push('function startSimulation(role, liniya) {');
  js.push('  if (!role) { toast("\u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u043e\u043b\u044c","err"); return; }');
  js.push('  var needsLiniya = ["\u0411\u0440\u0438\u0433\u0430\u0434\u0438\u0440","\u0422\u0435\u0441\u0442\u043e\u0434\u0435\u043b","\u0417\u0430\u0432.\u0443\u043f\u0430\u043a\u043e\u0432\u0449\u0438\u0446\u0430"].indexOf(role) !== -1;');
  js.push('  if (needsLiniya && !liniya) { toast("\u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043b\u0438\u043d\u0438\u044e \u0434\u043b\u044f \u044d\u0442\u043e\u0439 \u0440\u043e\u043b\u0438","err"); return; }');
  js.push('  REAL_USER = USER;');
  js.push('  SIM_ROLE = role;');
  js.push('  SIM_LINIYA = needsLiniya ? liniya : null;');
  js.push('  USER = {fio: REAL_USER.fio, role: role, liniya: SIM_LINIYA, smena: REAL_USER.smena || "", isAdminSimulating: true};');
  js.push('  document.getElementById("simBanner").style.display = "flex";');
  js.push('  document.getElementById("simBannerText").textContent = "\u0412\u044b \u0441\u043c\u043e\u0442\u0440\u0438\u0442\u0435 \u043a\u0430\u043a " + role + (SIM_LINIYA ? " (" + SIM_LINIYA + ")" : "");');
  js.push('  closeMdl("mdlSimulate");');
  js.push('  initApp();');
  js.push('}');
  js.push('');

  js.push('function stopSimulation() {');
  js.push('  if (!REAL_USER) return;');
  js.push('  USER = REAL_USER;');
  js.push('  REAL_USER = null;');
  js.push('  SIM_ROLE = null;');
  js.push('  SIM_LINIYA = null;');
  js.push('  document.getElementById("simBanner").style.display = "none";');
  js.push('  initApp();');
  js.push('}');
  js.push('');

  js.push('function openSimulateMdl() {');
  js.push('  document.getElementById("simRoleSel").value = "";');
  js.push('  document.getElementById("simLiniyaWrap").style.display = "none";');
  js.push('  var liniyaSel = document.getElementById("simLiniyaSel");');
  js.push('  liniyaSel.innerHTML = "<option value=\\"\\">\u2014 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u2014</option>";');
  js.push('  (allLines || []).forEach(function(l){ if (l.active) { var o=document.createElement("option"); o.value=l.name; o.textContent=l.name; liniyaSel.appendChild(o); } });');
  js.push('  showMdl("mdlSimulate");');
  js.push('}');
  js.push('');

  js.push('function onSimRoleChange() {');
  js.push('  var role = document.getElementById("simRoleSel").value;');
  js.push('  var needsLiniya = ["\u0411\u0440\u0438\u0433\u0430\u0434\u0438\u0440","\u0422\u0435\u0441\u0442\u043e\u0434\u0435\u043b","\u0417\u0430\u0432.\u0443\u043f\u0430\u043a\u043e\u0432\u0449\u0438\u0446\u0430"].indexOf(role) !== -1;');
  js.push('  document.getElementById("simLiniyaWrap").style.display = needsLiniya ? "block" : "none";');
  js.push('}');
  js.push('');

  js.push('function confirmStartSimulation() {');
  js.push('  var role = document.getElementById("simRoleSel").value;');
  js.push('  var liniya = document.getElementById("simLiniyaSel").value;');
  js.push('  startSimulation(role, liniya);');
  js.push('}');
  js.push('');

  js.push('function showScreen(id) {');
  js.push('  document.getElementById("screenLogin").style.display   = "none";');
  js.push('  document.getElementById("screenLoading").style.display = "none";');
  js.push('  document.getElementById("screenApp").style.display     = "none";');
  js.push('  document.getElementById(id).style.display = "flex";');
  js.push('}');
  js.push('');

  js.push('// ── NAV ──');
  js.push('function buildNav() {');
  js.push('  var navMap = {');
  js.push('    "\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440": [');
  js.push('      {sec:"\u0413\u043b\u0430\u0432\u043d\u043e\u0435", items:[{id:"dashboard",ico:"🏠",lbl:"\u0414\u0430\u0448\u0431\u043e\u0440\u0434"}]},');
  js.push('      {sec:"\u0421\u043a\u043b\u0430\u0434\u044b", items:[');
  js.push('        {id:"warehousebalances", ico:"📦", lbl:"\u041e\u0441\u0442\u0430\u0442\u043a\u0438 \u0441\u043a\u043b\u0430\u0434\u043e\u0432"},');
  js.push('        {id:"warehousetransfer", ico:"🔄", lbl:"\u041f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0435"},');
  js.push('        {id:"inventory", ico:"📐", lbl:"\u0418\u043d\u0432\u0435\u043d\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044f"}');
  js.push('      ]},');
  js.push('      {sec:"\u0423\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435", items:[');
  js.push('        {id:"users",     ico:"👥", lbl:"\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438"},');
  js.push('        {id:"lines",     ico:"🏭", lbl:"\u041b\u0438\u043d\u0438\u0438"},');
  js.push('        {id:"equipment", ico:"🔧", lbl:"\u041e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435"},');
  js.push('        {id:"materials", ico:"🧱", lbl:"\u041d\u043e\u043c\u0435\u043d\u043a\u043b\u0430\u0442\u0443\u0440\u0430 \u0441\u044b\u0440\u044c\u044f"},');
  js.push('        {id:"products",  ico:"📦", lbl:"\u041d\u043e\u043c\u0435\u043d\u043a\u043b\u0430\u0442\u0443\u0440\u0430 \u0442\u043e\u0432\u0430\u0440\u043e\u0432"},');
  js.push('        {id:"suppliers", ico:"🚚", lbl:"\u041f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u0438"}');
  js.push('      ]},');
  js.push('      {sec:"\u0421\u043a\u043e\u0440\u043e", items:[');
  js.push('        {id:"salary",  ico:"💰", lbl:"\u0417\u0430\u0440\u043f\u043b\u0430\u0442\u0430", soon:true},');
  js.push('        {id:"reports", ico:"📊", lbl:"\u041e\u0442\u0447\u0451\u0442\u044b",  soon:true},');
  js.push('        {id:"storage", ico:"💾", lbl:"\u041f\u0430\u043c\u044f\u0442\u044c \u0442\u0430\u0431\u043b\u0438\u0446"}');
  js.push('      ]}');
  js.push('    ],');
  js.push('    "\u0411\u0440\u0438\u0433\u0430\u0434\u0438\u0440": [');
  js.push('      {sec:"\u0421\u043c\u0435\u043d\u0430", items:[{id:"shift",ico:"🏭",lbl:"\u0421\u043c\u0435\u043d\u0430"},{id:"productionplan",ico:"📦",lbl:"\u041f\u043b\u0430\u043d \u043d\u0430 \u0441\u043c\u0435\u043d\u0443"},{id:"spcloseshift",ico:"🔒",lbl:"\u0417\u0430\u043a\u0440\u044b\u0442\u044c \u0441\u043c\u0435\u043d\u0443"}]},');
  js.push('      {sec:"\u041e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435", items:[{id:"mech-equipment",ico:"🔧",lbl:"\u041e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435"}]},');
  js.push('      {sec:"\u0421\u043a\u043b\u0430\u0434", items:[');
  js.push('        {id:"warehousebalances", ico:"📦", lbl:"\u041e\u0441\u0442\u0430\u0442\u043a\u0438 \u0441\u043a\u043b\u0430\u0434\u043e\u0432"},');
  js.push('        {id:"warehousetransfer", ico:"🔄", lbl:"\u041f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0435"}');
  js.push('      ]},');
  js.push('      {sec:"\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f", items:[{id:"shifthistory",ico:"📋",lbl:"\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0441\u043c\u0435\u043d"},{id:"timesheet",ico:"📅",lbl:"\u0442\u0430\u0431\u0435\u043b\u044c"}]}');
  js.push('    ],');
  js.push('    "\u041c\u0435\u0445\u0430\u043d\u0438\u043a": [');
  js.push('      {sec:"\u0420\u0430\u0431\u043e\u0447\u0438\u0439 \u0441\u0442\u043e\u043b", items:[');
  js.push('        {id:"mech-alerts",    ico:"🚨", lbl:"\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0435 \u0437\u0430\u044f\u0432\u043a\u0438"},');
  js.push('        {id:"mech-equipment", ico:"🔧", lbl:"\u041e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435"}');
  js.push('      ]},');
  js.push('      {sec:"\u0423\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435", items:[');
  js.push('        {id:"mech-manage",    ico:"⚙️", lbl:"\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430 \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044f"},');
  js.push('        {id:"mech-history",   ico:"📋", lbl:"\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0437\u0430\u044f\u0432\u043e\u043a"},');
  js.push('        {id:"mech-stats",     ico:"📊", lbl:"\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430 \u043f\u0440\u043e\u0441\u0442\u043e\u044f"}');
  js.push('      ]}');
  js.push('    ],');
  js.push('    "HR \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440": [');
  js.push('      {sec:"\u041f\u0435\u0440\u0441\u043e\u043d\u0430\u043b", items:[');
  js.push('        {id:"hr-dashboard",  ico:"📊", lbl:"\u0414\u0430\u0448\u0431\u043e\u0440\u0434 HR"},');
  js.push('        {id:"hr-employees",  ico:"👤", lbl:"\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0438"},');
  js.push('        {id:"hr-hire",       ico:"➕", lbl:"\u041f\u0440\u0438\u0451\u043c \u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0443"},');
  js.push('        {id:"hr-fired",      ico:"🚪", lbl:"\u0423\u0432\u043e\u043b\u044c\u043d\u0435\u043d\u043d\u044b\u0435"},');
  js.push('        {id:"hr-movements",  ico:"🔄", lbl:"\u041f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u044f \u043a\u0430\u0434\u0440\u043e\u0432"}');
  js.push('      ]},');
  js.push('      {sec:"\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b", items:[');
  js.push('        {id:"hr-contracts",  ico:"📄", lbl:"\u0422\u0440\u0443\u0434\u043e\u0432\u044b\u0435 \u0434\u043e\u0433\u043e\u0432\u043e\u0440\u044b"},');
  js.push('        {id:"hr-contlog",    ico:"📋", lbl:"\u0416\u0443\u0440\u043d\u0430\u043b \u0434\u043e\u0433\u043e\u0432\u043e\u0440\u043e\u0432"}');
  js.push('      ]},');
  js.push('      {sec:"\u041e\u043f\u043b\u0430\u0442\u0430", items:[');
  js.push('        {id:"hr-staff",    ico:"📋", lbl:"\u0428\u0442\u0430\u0442\u043d\u043e\u0435 \u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435"},');
  js.push('        {id:"hr-staffdoc", ico:"📄", lbl:"\u0428\u0442\u0430\u0442 \u0436\u0430\u0434\u0432\u0430\u043b\u0438 (Word)"},');
  js.push('        {id:"hr-payroll",  ico:"📈", lbl:"\u0417\u0430\u0440\u043f\u043b\u0430\u0442\u0430 (\u0440\u0430\u0441\u0447\u0451\u0442)"}');
  js.push('      ]}');
  js.push('    ],');
  js.push('    "HR \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440": [');
  js.push('      {sec:"\u041f\u0435\u0440\u0441\u043e\u043d\u0430\u043b", items:[');
  js.push('        {id:"hr-dashboard",  ico:"📊", lbl:"\u0414\u0430\u0448\u0431\u043e\u0440\u0434 HR"},');
  js.push('        {id:"hr-employees",  ico:"👤", lbl:"\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0438"},');
  js.push('        {id:"hr-hire",       ico:"➕", lbl:"\u041f\u0440\u0438\u0451\u043c \u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0443"},');
  js.push('        {id:"hr-fired",      ico:"🚪", lbl:"\u0423\u0432\u043e\u043b\u044c\u043d\u0435\u043d\u043d\u044b\u0435"},');
  js.push('        {id:"hr-movements",  ico:"🔄", lbl:"\u041f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u044f \u043a\u0430\u0434\u0440\u043e\u0432"}');
  js.push('      ]}');
  js.push('    ],');
  js.push('    "\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442": [');
  js.push('      {sec:"\u0421\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u0435", items:[');
  js.push('        {id:"fin-approvals", ico:"✅", lbl:"\u041d\u0430 \u0441\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u0438"},');
  js.push('        {id:"fin-appallhist",ico:"📜", lbl:"\u0416\u0443\u0440\u043d\u0430\u043b \u0441\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u0439"}');
  js.push('      ]},');
  js.push('      {sec:"\u041f\u043b\u0430\u043d\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435", items:[');
  js.push('        {id:"fin-skucost",   ico:"💰", lbl:"\u0421\u0435\u0431\u0435\u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c SKU"}');
  js.push('      ]},');
  js.push('      {sec:"\u041e\u0442\u0447\u0451\u0442\u044b", items:[');
  js.push('        {id:"hr-staff",         ico:"📋", lbl:"\u0428\u0442\u0430\u0442\u043d\u043e\u0435 \u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435"},');
  js.push('        {id:"hr-payroll",       ico:"📈", lbl:"\u0424\u043e\u043d\u0434 \u0437\u0430\u0440\u043f\u043b\u0430\u0442\u044b"},');
  js.push('        {id:"warehousebalances",ico:"📦", lbl:"\u041e\u0441\u0442\u0430\u0442\u043a\u0438 \u0441\u043a\u043b\u0430\u0434\u043e\u0432"}');
  js.push('      ]}');
  js.push('    ],');
  js.push('    "\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c": [');
  js.push('      {sec:"Планирование", items:[');
  js.push('        {id:"schedule",    ico:"📅", lbl:"\u0433\u0440\u0430\u0444\u0438\u043a \u0440\u0430\u0431\u043e\u0442\u044b"},');
  js.push('        {id:"priorities",  ico:"🎯", lbl:"\u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u044b"},');
  js.push('        {id:"speedmatrix", ico:"⚡", lbl:"\u0441\u043a\u043e\u0440\u043e\u0441\u0442\u044c \u043b\u0438\u043d\u0438\u0439"},');
  js.push('        {id:"distribution",ico:"📦", lbl:"\u0420\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u0437\u0430\u043a\u0430\u0437\u043e\u0432"},');
  js.push('        {id:"disthistory", ico:"📊", lbl:"\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u044f"},');
  js.push('        {id:"spnorms",     ico:"📋", lbl:"\u041d\u043e\u0440\u043c\u044b \u0440\u0430\u0441\u0445\u043e\u0434\u043e\u0432"}');
  js.push('      ]},');
  js.push('      {sec:"\u0421\u043a\u043b\u0430\u0434", items:[{id:"warehousebalances", ico:"📦", lbl:"\u041e\u0441\u0442\u0430\u0442\u043a\u0438 \u0441\u043a\u043b\u0430\u0434\u043e\u0432"}]}');
  js.push('    ],');
  js.push('    "\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c \u0411\u0443\u043b\u043e\u0447\u043a\u0438": [');
  js.push('      {sec:"🍞 \u0426\u0435\u0445 \u0411\u0443\u043b\u043e\u0447\u0435\u043a/\u0425\u043b\u0435\u0431\u0430", items:[');
  js.push('        {id:"schedule",    ico:"📅", lbl:"\u0413\u0440\u0430\u0444\u0438\u043a \u0440\u0430\u0431\u043e\u0442\u044b"},');
  js.push('        {id:"priorities",  ico:"🎯", lbl:"\u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u044b"},');
  js.push('        {id:"speedmatrix", ico:"⚡", lbl:"\u0421\u043a\u043e\u0440\u043e\u0441\u0442\u044c \u043b\u0438\u043d\u0438\u0439"},');
  js.push('        {id:"distribution",ico:"🍞", lbl:"\u0420\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u0437\u0430\u043a\u0430\u0437\u043e\u0432"},');
  js.push('        {id:"disthistory", ico:"📊", lbl:"\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u044f"},');
  js.push('        {id:"spnorms",     ico:"📋", lbl:"\u041d\u043e\u0440\u043c\u044b \u0440\u0430\u0441\u0445\u043e\u0434\u043e\u0432"}');
  js.push('      ]},');
  js.push('      {sec:"\u0421\u043a\u043b\u0430\u0434", items:[{id:"warehousebalances", ico:"📦", lbl:"\u041e\u0441\u0442\u0430\u0442\u043a\u0438 \u0441\u043a\u043b\u0430\u0434\u043e\u0432"}]}');
  js.push('    ],');
  js.push('    "\u0417\u0430\u0432\u0441\u043a\u043b\u0430\u0434 \u0441\u044b\u0440\u044c\u044f": [');
  js.push('      {sec:"\u0421\u043a\u043b\u0430\u0434 \u0441\u044b\u0440\u044c\u044f", items:[');
  js.push('        {id:"skladincoming",ico:"📥", lbl:"\u041f\u0440\u0438\u0445\u043e\u0434 \u043e\u0442 \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u0430"},');
  js.push('        {id:"skladreport",  ico:"📊", lbl:"\u041e\u0442\u0447\u0451\u0442 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u044f"}');
  js.push('      ]},');
  js.push('      {sec:"\u0421\u043a\u043b\u0430\u0434\u044b", items:[');
  js.push('        {id:"warehousebalances", ico:"📦", lbl:"\u041e\u0441\u0442\u0430\u0442\u043a\u0438 \u0441\u043a\u043b\u0430\u0434\u043e\u0432"},');
  js.push('        {id:"warehousetransfer", ico:"🔄", lbl:"\u041f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0435"}');
  js.push('      ]}');
  js.push('    ],');
  js.push('    "\u0417\u0430\u0432\u0441\u043a\u043b\u0430\u0434 \u0413\u041f": [');
  js.push('      {sec:"\u0421\u043a\u043b\u0430\u0434\u044b", items:[');
  js.push('        {id:"warehousebalances", ico:"📦", lbl:"\u041e\u0441\u0442\u0430\u0442\u043a\u0438 \u0441\u043a\u043b\u0430\u0434\u043e\u0432"},');
  js.push('        {id:"warehousetransfer", ico:"🔄", lbl:"\u041f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0435"}');
  js.push('      ]}');
  js.push('    ],');
  js.push('    "\u0422\u0435\u0441\u0442\u043e\u0434\u0435\u043b": [');
  js.push('      {sec:"\u0421\u043c\u0435\u043d\u0430", items:[{id:"spwriteoff",ico:"📝",lbl:"\u0421\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u043e\u0432"}]},');
  js.push('      {sec:"\u0421\u043a\u043b\u0430\u0434", items:[');
  js.push('        {id:"warehousebalances", ico:"📦", lbl:"\u041e\u0441\u0442\u0430\u0442\u043a\u0438 \u0441\u043a\u043b\u0430\u0434\u043e\u0432"},');
  js.push('        {id:"warehousetransfer", ico:"🔄", lbl:"\u041f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0435"}');
  js.push('      ]}');
  js.push('    ],');
  js.push('    "\u0417\u0430\u0432.\u0443\u043f\u0430\u043a\u043e\u0432\u0449\u0438\u0446\u0430": [');
  js.push('      {sec:"\u0421\u043c\u0435\u043d\u0430", items:[{id:"spwriteoff",ico:"📝",lbl:"\u0421\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u043e\u0432"}]},');
  js.push('      {sec:"\u0421\u043a\u043b\u0430\u0434", items:[');
  js.push('        {id:"warehousebalances", ico:"📦", lbl:"\u041e\u0441\u0442\u0430\u0442\u043a\u0438 \u0441\u043a\u043b\u0430\u0434\u043e\u0432"},');
  js.push('        {id:"warehousetransfer", ico:"🔄", lbl:"\u041f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0435"}');
  js.push('      ]}');
  js.push('    ]');
  js.push('  };');
  js.push('  var cfg = navMap[USER.role] || [{sec:"\u0413\u043b\u0430\u0432\u043d\u043e\u0435",items:[{id:"dashboard",ico:"🏠",lbl:"\u0414\u0430\u0448\u0431\u043e\u0440\u0434"}]}];');
  js.push('  var assetsFullNav = (USER.role === "Администратор" || USER.role === "Бухгалтер ОС");');
  js.push('  var assetsNavItems = [{id:"assets-dashboard", ico:"📊", lbl:"Дашборд ОС"},{id:"assets-list", ico:"🏷️", lbl:"Реестр ОС"}];');
  js.push('  if (assetsFullNav) assetsNavItems.push({id:"assets-add", ico:"➕", lbl:"Приём ОС"});');
  js.push('  assetsNavItems.push({id:"assets-movements", ico:"🔄", lbl:"Перемещения ОС"});');
  js.push('  assetsNavItems.push({id:"assets-writeoffs", ico:"🗑️", lbl:"Списание ОС"});');
  js.push('  if (assetsFullNav) assetsNavItems.push({id:"assets-amort", ico:"📉", lbl:"Амортизация"});');
  js.push('  assetsNavItems.push({id:"assets-alerts", ico:"🚨", lbl:"Уведомления"});');
  js.push('  assetsNavItems.push({id:"assets-reports", ico:"📋", lbl:"Отчёты"});');
  js.push('  assetsNavItems.push({id:"assets-inventory", ico:"📐", lbl:"Инвентаризация"});');
  js.push('  if (assetsFullNav) assetsNavItems.push({id:"assets-manage", ico:"⚙️", lbl:"Управление ОС"});');
  js.push('  cfg = cfg.concat([{sec:"Основные средства", items: assetsNavItems}]);');
  js.push('  var h = "";');
  js.push('  cfg.forEach(function(sec) {');
  js.push('    h += "<div class=\\"nav-sec\\"><div class=\\"nav-sec-t\\">" + sec.sec + "</div>";');
  js.push('    sec.items.forEach(function(it) {');
  js.push('      var dis = it.soon ? " style=\\"opacity:.4\\"" : "";');
  js.push('      var oc  = it.soon ? "" : " onclick=\\"nav(\'" + it.id + "\')\\"";');
  js.push('      var sn  = it.soon ? "<span style=\\"font-size:10px;color:var(--sub);margin-left:auto\\">\u0441\u043a\u043e\u0440\u043e</span>" : "";');
  js.push('      var badge = "";');
  js.push('      if (it.id === "mech-alerts") badge = "<span id=\\"mechNavBadge\\" style=\\"display:none;background:var(--err);color:#fff;border-radius:10px;font-size:11px;font-weight:700;padding:1px 6px;margin-left:auto\\"></span>";');
  js.push('      if (it.id === "assets-alerts") badge = "<span id=\\"assetsAlertsBadge\\" style=\\"display:none;background:var(--err);color:#fff;border-radius:10px;font-size:11px;font-weight:700;padding:1px 6px;margin-left:auto\\"></span>";');
  js.push('      h += "<div class=\\"nav-item\\" id=\\"ni-" + it.id + "\\"" + oc + dis + ">" +');
  js.push('           "<span style=\\"font-size:18px;width:24px;text-align:center\\">" + it.ico + "</span>" +');
  js.push('           "<span>" + it.lbl + "</span>" + sn + badge + "</div>";');
  js.push('    });');
  js.push('    h += "</div>";');
  js.push('  });');
  js.push('  document.getElementById("navItems").innerHTML = h;');
  js.push('  // Активируем дашборд');
  js.push('  var ni = document.getElementById("ni-dashboard");');
  js.push('  if (ni) ni.classList.add("active");');
  js.push('}');
  js.push('');

  js.push('function nav(pid) {');
  js.push('  document.querySelectorAll(".mbg.show").forEach(function(m){ m.classList.remove("show"); });');
  js.push('  document.querySelectorAll(".nav-item").forEach(function(e){e.classList.remove("active");});');
  js.push('  document.querySelectorAll(".page").forEach(function(e){e.classList.remove("active");});');
  js.push('  var ni = document.getElementById("ni-"+pid); if(ni) ni.classList.add("active");');
  js.push('  var pg = document.getElementById("pg-"+pid); if(pg) pg.classList.add("active");');
  js.push('  closeSB();');
  js.push('  var t = {dashboard:"\u0413\u043b\u0430\u0432\u043d\u0430\u044f",users:"\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438",equipment:"\u041e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435",lines:"\u041b\u0438\u043d\u0438\u0438",shift:"\u0421\u043c\u0435\u043d\u0430",shifthistory:"\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0441\u043c\u0435\u043d",timesheet:"\u0442\u0430\u0431\u0435\u043b\u044c",schedule:"\u0433\u0440\u0430\u0444\u0438\u043a \u0440\u0430\u0431\u043e\u0442\u044b",priorities:"\u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u044b",speedmatrix:"\u0441\u043a\u043e\u0440\u043e\u0441\u0442\u044c \u043b\u0438\u043d\u0438\u0439",distribution:"\u0420\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u0437\u0430\u043a\u0430\u0437\u043e\u0432",disthistory:"\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u044f",productionplan:"\u041f\u043b\u0430\u043d \u043d\u0430 \u0441\u043c\u0435\u043d\u0443",materials:"\u041d\u043e\u043c\u0435\u043d\u043a\u043b\u0430\u0442\u0443\u0440\u0430",suppliers:"\u041f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u0438",skladincoming:"\u041f\u0440\u0438\u0445\u043e\u0434 \u043e\u0442 \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u0430",skladreport:"\u041e\u0442\u0447\u0451\u0442 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u044f",storage:"\u041f\u0430\u043c\u044f\u0442\u044c \u0442\u0430\u0431\u043b\u0438\u0446",warehousebalances:"\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044c\u043d\u044b\u0439 \u043e\u0442\u0447\u0451\u0442",warehousetransfer:"\u041f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0435",spnorms:"\u041d\u043e\u0440\u043c\u044b \u0440\u0430\u0441\u0445\u043e\u0434\u043e\u0432",spwriteoff:"\u0421\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u043e\u0432",spshipgp:"\u041e\u0442\u0433\u0440\u0443\u0437\u043a\u0430 \u0413\u041f",spcloseshift:"\u0417\u0430\u043a\u0440\u044b\u0442\u0438\u0435 \u0441\u043c\u0435\u043d\u044b",inventory:"\u0418\u043d\u0432\u0435\u043d\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044f","mech-alerts":"\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0435 \u0437\u0430\u044f\u0432\u043a\u0438","mech-equipment":"\u041e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435","mech-manage":"\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430 \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044f","mech-history":"\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0437\u0430\u044f\u0432\u043e\u043a","mech-stats":"\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430 \u043f\u0440\u043e\u0441\u0442\u043e\u044f","products":"\u041d\u043e\u043c\u0435\u043d\u043a\u043b\u0430\u0442\u0443\u0440\u0430 \u0442\u043e\u0432\u0430\u0440\u043e\u0432","hr-dashboard":"HR \u0414\u0430\u0448\u0431\u043e\u0440\u0434","hr-employees":"\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0438","hr-hire":"\u041f\u0440\u0438\u0451\u043c \u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0443","hr-leaves":"\u041e\u0442\u043f\u0443\u0441\u043a\u0430 / \u0411\u043e\u043b\u044c\u043d\u0438\u0447\u043d\u044b\u0435","hr-movements":"\u0414\u0432\u0438\u0436\u0435\u043d\u0438\u0435 \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u0430","hr-staff":"\u0428\u0442\u0430\u0442\u043d\u043e\u0435 \u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435","hr-fired":"\u0423\u0432\u043e\u043b\u044c\u043d\u0435\u043d\u043d\u044b\u0435","hr-movements":"\u041f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u044f \u043a\u0430\u0434\u0440\u043e\u0432","hr-payroll":"\u0417\u0430\u0440\u043f\u043b\u0430\u0442\u0430 (\u0440\u0430\u0441\u0447\u0451\u0442)","fin-approvals":"\u041d\u0430 \u0441\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u0438","fin-appallhist":"\u0416\u0443\u0440\u043d\u0430\u043b \u0441\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u0439","fin-skucost":"Себестоимость SKU","assets-list":"Реестр ОС","assets-add":"Приём ОС","assets-movements":"Перемещения ОС","assets-writeoffs":"Списание ОС","assets-manage":"Управление ОС","assets-dashboard":"Дашборд ОС","assets-amort":"Амортизация","assets-alerts":"Уведомления","assets-reports":"Отчёты","assets-inventory":"Инвентаризация"};');
  js.push('  setPageTitle(t[pid] || pid);');
  js.push('  if (pid==="users")         loadUsers();');
  js.push('  if (pid==="equipment")     loadEq();');
  js.push('  if (pid==="lines")         loadLinesPage();');
  js.push('  if (pid==="shift")         loadShiftPage();');
  js.push('  if (pid==="shifthistory")  loadShiftHistory();');
  js.push('  if (pid==="timesheet")     loadTimesheet();');
  js.push('  if (pid==="schedule")      loadSchedule();');
  js.push('  if (pid==="priorities")    loadPriorities();');
  js.push('  if (pid==="speedmatrix")   loadSpeedMatrix();');
  js.push('  if (pid==="distribution")  {}');
  js.push('  if (pid==="disthistory")   loadDistHistory();');
  js.push('  if (pid==="fin-approvals")  loadFinApprovals();');
  js.push('  if (pid==="fin-appallhist") loadFinApprovalHistory();');
  js.push('  if (pid==="fin-skucost")    loadFinSkuCosts();');
  js.push('  if (pid==="assets-list")      loadAssetsList();');
  js.push('  if (pid==="assets-add")       loadAssetsAddForm();');
  js.push('  if (pid==="assets-movements") loadAssetsMovements();');
  js.push('  if (pid==="assets-writeoffs") loadAssetsWriteOffs();');
  js.push('  if (pid==="assets-dashboard") loadAssetsDashboard();');
  js.push('  if (pid==="assets-amort")     loadAssetsAmort();');
  js.push('  if (pid==="assets-alerts")    loadAssetsAlerts();');
  js.push('  if (pid==="assets-reports")   loadAssetsReports();');
  js.push('  if (pid==="assets-inventory") loadAssetsInventory();');
  js.push('  if (pid==="assets-manage")    loadAssetsManage();');
  js.push('  if (pid==="productionplan") loadProductionPlan();');
  js.push('  if (pid==="materials")     loadMaterials();');
  js.push('  if (pid==="products")      loadProductsPage();');
  js.push('  if (pid==="suppliers")     loadSuppliers();');
  js.push('  if (pid==="skladincoming") loadIncoming();');
  js.push('  if (pid==="skladreport")   loadMaterialReport();');
  js.push('  if (pid==="storage")       loadStorageUsage();');
  js.push('  if (pid==="warehousebalances") loadWarehouseBalances();');
  js.push('  if (pid==="warehousetransfer") { loadIncomingTransfers(); loadAllTransfers(); loadRejectedTransfers(); }');
  js.push('  if (pid==="spnorms")       loadNorms();');
  js.push('  if (pid==="spwriteoff")    loadWriteOffs();');
  js.push('  if (pid==="spcloseshift")  loadShiftReport();');
  js.push('  if (pid==="inventory")     loadInventoryWarehouseList();');
  js.push('  // Механик / Бригадир — страницы оборудования');
  js.push('  if (pid==="mech-alerts")   initMechAlerts();');
  js.push('  if (pid==="mech-equipment") initMechEquip();');
  js.push('  if (pid==="mech-manage")   initMechManage();');
  js.push('  if (pid==="mech-history")  initMechHistory();');
  js.push('  if (pid==="mech-stats")    initMechStats();');
  js.push('  // HR система');
  js.push('  if (pid==="hr-dashboard")  loadHRDashboard();');
  js.push('  if (pid==="hr-employees")  loadHREmployees();');
  js.push('  if (pid==="hr-hire")       loadHireForm();');
  js.push('  if (pid==="hr-fired")      loadHRFired();');
  js.push('  if (pid==="hr-leaves")     loadHRLeaves();');
  js.push('  if (pid==="hr-movements")  loadHRMovements();');
  js.push('  if (pid==="hr-contracts")  loadHRContracts();');
  js.push('  if (pid==="hr-contlog")    loadHRContLog();');
  js.push('  if (pid==="hr-staff")      loadHRStaff();');
  js.push('  if (pid==="hr-staffdoc")   loadHRStaffDoc();');
  js.push('  if (pid==="hr-seniority")  loadHRSeniority();');
  js.push('  if (pid==="hr-orgchart")   loadHROrgChart();');
  js.push('  if (pid==="hr-payroll")    loadHRPayroll();');
  js.push('}');
  js.push('');

  js.push('function setPageTitle(t) { document.getElementById("hTitle").textContent = t; }');
  js.push('function toggleSB() { document.getElementById("sidebar").classList.toggle("open"); document.getElementById("overlay").classList.toggle("show"); }');
  js.push('function closeSB()  { document.getElementById("sidebar").classList.remove("open"); document.getElementById("overlay").classList.remove("show"); }');
  js.push('');

  js.push('// ── DASHBOARD ──');
  js.push('function loadDashboard() {');
  js.push('  srv("getDashboardData", {}, function(res) {');
  js.push('    var el = document.getElementById("dashContent");');
  js.push('    if (!res.ok) { el.innerHTML = "<div class=\'empty\'><div class=\'empty-ico\'>&#9888;</div><div>" + (res.error||"") + "</div></div>"; return; }');
  js.push('    var d = res.data, h = "";');
  js.push('    if (d.stats) {');
  js.push('      h += "<div class=\'sg\'>" +');
  js.push('        "<div class=\'sc\'><div class=\'sv\'>" + d.stats.activeUsers + "</div><div class=\'sl\'>\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0445 \u043f\u043e\u043b\u044c\u0437.</div></div>" +');
  js.push('        "<div class=\'sc\'><div class=\'sv\'>" + d.stats.totalUsers  + "</div><div class=\'sl\'>\u0412\u0441\u0435\u0433\u043e \u043f\u043e\u043b\u044c\u0437.</div></div>" +');
  js.push('        "<div class=\'sc\'><div class=\'sv\'>" + d.stats.totalEquipment + "</div><div class=\'sl\'>\u041e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044f</div></div>" +');
  js.push('        "</div>";');
  js.push('    }');
  js.push('    if (d.lines && d.lines.length) {');
  js.push('      h += "<div class=\'card\'><div class=\'card-t\'>&#127981; \u041b\u0438\u043d\u0438\u0438</div><div style=\'display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px\'>";');
  js.push('      d.lines.forEach(function(l) {');
  js.push('        h += "<div style=\'background:var(--s2);border-radius:10px;padding:14px\'>" +');
  js.push('          "<div style=\'font-weight:700\'>" + l.name + "</div>" +');
  js.push('          "<div style=\'font-size:12px;color:var(--sub)\'>" + l.type + "</div>" +');
  js.push('          "<div style=\'margin-top:8px\'><span class=\'badge " + (l.active?"bg":"br") + "\'>" + (l.active?"\u2713":"\u2717") + "</span></div></div>";');
  js.push('      });');
  js.push('      h += "</div></div>";');
  js.push('    }');
  js.push('    h += "<div class=\'card\'><div class=\'card-t\'>&#8505; \u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f</div>" +');
  js.push('      "<div style=\'display:grid;gap:8px;font-size:14px\'>" +');
  js.push('      "<div style=\'display:flex;justify-content:space-between\'><span style=\'color:var(--sub)\'>\u0420\u043e\u043b\u044c</span><span style=\'color:var(--g)\'>" + USER.role + "</span></div>" +');
  js.push('      "<div style=\'display:flex;justify-content:space-between\'><span style=\'color:var(--sub)\'>\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c</span><span>" + USER.fio + "</span></div>" +');
  js.push('      "<div style=\'display:flex;justify-content:space-between\'><span style=\'color:var(--sub)\'>\u0412\u0435\u0440\u0441\u0438\u044f</span><span>1.3</span></div>" +');
  js.push('      "</div></div>";');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('// ── USERS ──');
  js.push('function loadUsers() {');
  js.push('  document.getElementById("usrTbl").innerHTML = "<div class=\'loader\'><div class=\'spin\'></div></div>";');
  js.push('  srv("getUsers", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    allUsers = res.users; renderUsers(allUsers); fillLineSels();');
  js.push('  });');
  js.push('}');
  js.push('function filterUsrs() {');
  js.push('  var q = document.getElementById("usrSrch").value.toLowerCase();');
  js.push('  renderUsers(allUsers.filter(function(u){return(u.fio+u.login+u.role).toLowerCase().indexOf(q)>=0;}));');
  js.push('}');
  js.push('function renderUsers(list) {');
  js.push('  if (!list.length) { document.getElementById("usrTbl").innerHTML="<div class=\'empty\'><div class=\'empty-ico\'>&#128101;</div><div class=\'empty-t\'>\u041d\u0435\u0442 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u0439</div></div>"; return; }');
  js.push('  var h = "<div class=\'tw\'><table><thead><tr><th>\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c</th><th>\u0420\u043e\u043b\u044c</th><th>\u041b\u0438\u043d\u0438\u044f</th><th>\u0421\u0442\u0430\u0442\u0443\u0441</th><th></th></tr></thead><tbody>";');
  js.push('  list.forEach(function(u) {');
  js.push('    var ini = initials(u.fio), rc = rColor(u.role);');
  js.push('    var li = (u.liniya||"—") + (u.smena?" · "+u.smena:"");');
  js.push('    var fioE = u.fio.replace(/"/g, "&quot;");');
  js.push('    h += "<tr><td><div style=\'display:flex;align-items:center;gap:10px\'>" +');
  js.push('      "<div style=\'width:32px;height:32px;background:"+rc+";border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff\'>"+ini+"</div>" +');
  js.push('      "<div><div style=\'font-weight:600\'>"+u.fio+"</div><div style=\'font-size:12px;color:var(--sub)\'>@"+u.login+"</div></div></div></td>" +');
  js.push('      "<td><span class=\'badge bb\'>"+u.role+"</span></td>" +');
  js.push('      "<td style=\'font-size:13px;color:var(--sub)\'>"+li+"</td>" +');
  js.push('      "<td><span class=\'badge "+(u.active?"bg":"br")+"\'>"+( u.active?"\u0410\u043a\u0442\u0438\u0432\u0435\u043d":"\u041e\u0442\u043a\u043b.")+"</span></td>" +');
  js.push('      "<td><div style=\'display:flex;gap:6px\'>" +');
  js.push('      "<button class=\'btn bs\' style=\'padding:6px 10px\' onclick=\'editUser(\\\""+u.id+"\\\")\'>&#9998;</button>" +');
  js.push('      "<button class=\'btn bd\' style=\'padding:6px 10px\' onclick=\'resetPw(\\\""+u.id+"\\\",\\\""+fioE+"\\\")\'>&#128273;</button>" +');
  js.push('      "<button class=\'btn bd\' style=\'padding:6px 10px\' onclick=\'togUser(\\\""+u.id+"\\\",\\\""+fioE+"\\\","+u.active+")\'>"+(u.active?"&#128683;":"&#9989;")+"</button>" +');
  js.push('      "</div></td></tr>";');
  js.push('  });');
  js.push('  h += "</tbody></table></div>";');
  js.push('  document.getElementById("usrTbl").innerHTML = h;');
  js.push('}');
  js.push('function openUserMdl() {');
  js.push('  ["uId","uFio","uLogin","uPass","uLine","uSmena","uOsDept"].forEach(function(id){document.getElementById(id).value="";});');
  js.push('  document.getElementById("uRole").value=""; document.getElementById("uActive").checked=true;');
  js.push('  document.getElementById("uPass").placeholder="\u041f\u0430\u0440\u043e\u043b\u044c (\u0443\u043c\u043e\u043b\u0447. gl1234)";');
  js.push('  document.getElementById("mdlUserTitle").textContent="\u041d\u043e\u0432\u044b\u0439 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c";');
  js.push('  document.getElementById("uLineRow").style.display="none"; showMdl("mdlUser");');
  js.push('}');
  js.push('function editUser(id) {');
  js.push('  var u=allUsers.filter(function(x){return x.id===id;})[0]; if(!u)return;');
  js.push('  document.getElementById("uId").value=u.id; document.getElementById("uFio").value=u.fio;');
  js.push('  document.getElementById("uLogin").value=u.login; document.getElementById("uPass").value="";');
  js.push('  document.getElementById("uPass").placeholder="\u041e\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u043f\u0443\u0441\u0442\u044b\u043c \u2014 \u0431\u0435\u0437 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439";');
  js.push('  document.getElementById("uRole").value=u.role; document.getElementById("uLine").value=u.liniya||"";');
  js.push('  document.getElementById("uSmena").value=u.smena||""; document.getElementById("uActive").checked=u.active;');
  js.push('  document.getElementById("uOsDept").value=u.osDept||"";');
  js.push('  document.getElementById("mdlUserTitle").textContent="\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c: "+u.fio;');
  js.push('  onRoleChg(); showMdl("mdlUser");');
  js.push('}');
  js.push('function onRoleChg() {');
  js.push('  var wl=["\u0411\u0440\u0438\u0433\u0430\u0434\u0438\u0440","\u0422\u0435\u0441\u0442\u043e\u0434\u0435\u043b","\u0417\u0430\u0432.\u0443\u043f\u0430\u043a\u043e\u0432\u0449\u0438\u0446\u0430","\u041c\u0435\u0445\u0430\u043d\u0438\u043a"];');
  js.push('  document.getElementById("uLineRow").style.display=(wl.indexOf(document.getElementById("uRole").value)>=0)?"grid":"none";');
  js.push('}');
  js.push('function saveUser() {');
  js.push('  var p={id:document.getElementById("uId").value||null,fio:document.getElementById("uFio").value.trim(),');
  js.push('    login:document.getElementById("uLogin").value.trim(),role:document.getElementById("uRole").value,');
  js.push('    liniya:document.getElementById("uLine").value,smena:document.getElementById("uSmena").value,');
  js.push('    osDept:document.getElementById("uOsDept").value,');
  js.push('    active:document.getElementById("uActive").checked};');
  js.push('  var pw=document.getElementById("uPass").value;');
  js.push('  if(pw){if(p.id)p.newPassword=pw;else p.password=pw;}');
  js.push('  if(!p.fio||!p.login||!p.role){toast("\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0435 \u043f\u043e\u043b\u044f","err");return;}');
  js.push('  var btn=document.getElementById("uSaveBtn");btn.disabled=true;');
  js.push('  srv("saveUser",{payload:p},function(res){');
  js.push('    btn.disabled=false;');
  js.push('    if(res.ok){toast("\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e!","ok");closeMdl("mdlUser");loadUsers();}');
  js.push('    else toast(res.error,"err");});');
  js.push('}');
  js.push('function togUser(id,fio,active){');
  js.push('  if(!confirm((active?"\u041e\u0442\u043a\u043b\u044e\u0447\u0438\u0442\u044c":"\u0410\u043a\u0442\u0438\u0432\u0438\u0440\u043e\u0432\u0430\u0442\u044c")+" \\""+fio+"\\"?"))return;');
  js.push('  srv("saveUser",{payload:{id:id,active:!active}},function(res){if(res.ok){toast("\u0413\u043e\u0442\u043e\u0432\u043e!","ok");loadUsers();}else toast(res.error,"err");});');
  js.push('}');
  js.push('function resetPw(id,fio){');
  js.push('  var np=prompt("\u041d\u043e\u0432\u044b\u0439 \u043f\u0430\u0440\u043e\u043b\u044c \u0434\u043b\u044f \\""+fio+"\\":", "gl1234");if(!np)return;');
  js.push('  srv("resetPassword",{payload:{id:id,password:np}},function(res){if(res.ok)toast("\u041f\u0430\u0440\u043e\u043b\u044c: "+np,"ok");else toast(res.error,"err");});');
  js.push('}');
  js.push('');

  js.push('// ── EQUIPMENT ──');
  js.push('function loadEq(){');
  js.push('  document.getElementById("eqTbl").innerHTML="<div class=\'loader\'><div class=\'spin\'></div></div>";');
  js.push('  srv("getEquipment",{},function(res){if(!res.ok){toast(res.error,"err");return;}allEq=res.equipment;renderEq(allEq);});');
  js.push('}');
  js.push('function filterEq(){var q=document.getElementById("eqSrch").value.toLowerCase();renderEq(allEq.filter(function(e){return(e.invNum+e.name+(e.liniya||"")).toLowerCase().indexOf(q)>=0;}));}');
  js.push('function renderEq(list){');
  js.push('  if(!list.length){document.getElementById("eqTbl").innerHTML="<div class=\'empty\'><div class=\'empty-ico\'>&#128295;</div><div class=\'empty-t\'>\u041d\u0435\u0442 \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044f</div></div>";return;}');
  js.push('  var h="<div class=\'tw\'><table><thead><tr><th>\u0418\u043d\u0432. \u2116</th><th>\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435</th><th>\u0422\u0438\u043f</th><th>\u041b\u0438\u043d\u0438\u044f</th><th>\u0421\u0442\u0430\u0442\u0443\u0441</th><th></th></tr></thead><tbody>";');
  js.push('  list.forEach(function(e){');
  js.push('    h+="<tr><td><b style=\'font-family:monospace;color:var(--g)\'>"+e.invNum+"</b></td>" +');
  js.push('      "<td style=\'font-weight:600\'>"+e.name+"</td>" +');
  js.push('      "<td style=\'color:var(--sub);font-size:13px\'>"+(e.type||"—")+"</td>" +');
  js.push('      "<td style=\'font-size:13px\'>"+(e.liniya||"\u041e\u0431\u0449\u0435\u0435")+"</td>" +');
  js.push('      "<td><span class=\'badge "+(e.active?"bg":"br")+"\'>"+( e.active?"\u0410\u043a\u0442\u0438\u0432\u043d\u043e":"\u041d\u0435\u0442")+"</span></td>" +');
  js.push('      "<td><div style=\'display:flex;gap:6px\'>" +');
  js.push('      "<button class=\'btn bs\' style=\'padding:6px 10px\' onclick=\'editEq(\\\""+e.id+"\\\")\'>&#9998;</button>" +');
  js.push('      "<button class=\'btn bd\' style=\'padding:6px 10px\' onclick=\'togEq(\\\""+e.id+"\\\","+e.active+")\'>"+(e.active?"&#128683;":"&#9989;")+"</button>" +');
  js.push('      "</div></td></tr>";');
  js.push('  });');
  js.push('  h+="</tbody></table></div>";');
  js.push('  document.getElementById("eqTbl").innerHTML=h;');
  js.push('}');
  js.push('function openEqMdl(){["eId","eInv","eName","eNote"].forEach(function(id){document.getElementById(id).value="";});document.getElementById("eLine").value="";document.getElementById("eActive").checked=true;document.getElementById("mdlEqTitle").textContent="\u041d\u043e\u0432\u043e\u0435 \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435";showMdl("mdlEq");}');
  js.push('function editEq(id){var e=allEq.filter(function(x){return x.id===id;})[0];if(!e)return;document.getElementById("eId").value=e.id;document.getElementById("eInv").value=e.invNum;document.getElementById("eName").value=e.name;document.getElementById("eType").value=e.type||"\u041f\u0440\u043e\u0447\u0435\u0435";document.getElementById("eLine").value=e.liniya||"";document.getElementById("eNote").value=e.note||"";document.getElementById("eActive").checked=e.active;document.getElementById("mdlEqTitle").textContent="\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c: "+e.invNum;showMdl("mdlEq");}');
  js.push('function saveEq(){var p={id:document.getElementById("eId").value||null,invNum:document.getElementById("eInv").value.trim(),name:document.getElementById("eName").value.trim(),type:document.getElementById("eType").value,liniya:document.getElementById("eLine").value,note:document.getElementById("eNote").value.trim(),active:document.getElementById("eActive").checked};if(!p.invNum||!p.name){toast("\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u043f\u043e\u043b\u044f","err");return;}srv("saveEquipment",{payload:p},function(res){if(res.ok){toast("\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e!","ok");closeMdl("mdlEq");loadEq();}else toast(res.error,"err");});}');
  js.push('function togEq(id,active){srv("saveEquipment",{payload:{id:id,active:!active}},function(res){if(res.ok)loadEq();});}');
  js.push('');

  js.push('// ── LINES ──');
  js.push('function loadLines(){srv("getLines",{},function(res){if(res.ok){allLines=res.lines;fillLineSels();}});}');
  js.push('function loadLinesPage(){');
  js.push('  srv("getLines",{},function(res){');
  js.push('    if(res.ok){allLines=res.lines;fillLineSels();}');
  js.push('    var el=document.getElementById("linesCont");');
  js.push('    if(!allLines.length){el.innerHTML="<div class=\'empty\'><div class=\'empty-ico\'>&#127981;</div><div class=\'empty-t\'>\u041d\u0435\u0442 \u043b\u0438\u043d\u0438\u0439</div></div>";return;}');
  js.push('    var h="<div style=\'display:grid;gap:10px\'>";');
  js.push('    allLines.forEach(function(l){');
  js.push('      var nt=l.note?"<div style=\'font-size:12px;color:var(--sub);margin-top:2px\'>"+l.note+"</div>":"";');
  js.push('      h+="<div style=\'display:flex;align-items:center;gap:12px;padding:12px;background:var(--s2);border-radius:10px\'>" +');
  js.push('        "<div style=\'font-size:24px\'>&#127981;</div>" +');
  js.push('        "<div style=\'flex:1\'><div style=\'font-weight:700\'>"+l.name+"</div><div style=\'font-size:12px;color:var(--sub)\'>"+l.type+"</div>"+nt+"</div>" +');
  js.push('        "<span class=\'badge "+(l.active?"bg":"br")+"\'>"+( l.active?"\u0410\u043a\u0442\u0438\u0432\u043d\u0430":"\u041d\u0435\u0442")+"</span>" +');
  js.push('        "<button class=\'btn bs\' style=\'padding:6px 10px\' onclick=\'editLine(\\\""+l.id+"\\\")\'>&#9998;</button>" +');
  js.push('        "</div>";');
  js.push('    });');
  js.push('    h+="</div>"; el.innerHTML=h;');
  js.push('  });');
  js.push('}');
  js.push('function fillLineSels(){["uLine","eLine"].forEach(function(sid){var sel=document.getElementById(sid);if(!sel)return;var cur=sel.value;while(sel.options.length>1)sel.remove(1);allLines.filter(function(l){return l.active;}).forEach(function(l){var o=document.createElement("option");o.value=l.name;o.textContent=l.name;sel.appendChild(o);});sel.value=cur;});}');
  js.push('function openLineMdl(){["lId","lName","lNote"].forEach(function(id){document.getElementById(id).value="";});document.getElementById("lType").value="\u041b\u0430\u0432\u0430\u0448";showMdl("mdlLine");}');
  js.push('function editLine(id){var l=allLines.filter(function(x){return x.id===id;})[0];if(!l)return;document.getElementById("lId").value=l.id;document.getElementById("lName").value=l.name;document.getElementById("lType").value=l.type;document.getElementById("lNote").value=l.note||"";showMdl("mdlLine");}');
  js.push('function saveLine(){var p={id:document.getElementById("lId").value||null,name:document.getElementById("lName").value.trim(),type:document.getElementById("lType").value,note:document.getElementById("lNote").value.trim(),active:true};if(!p.name){toast("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435","err");return;}srv("saveLine",{payload:p},function(res){if(res.ok){toast("\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e!","ok");closeMdl("mdlLine");loadLinesPage();}else toast(res.error,"err");});}');
  js.push('');

  js.push('');

  js.push('// ════════════ \u0411\u0420\u0418\u0413\u0410\u0414\u0418\u0420: \u0421\u0421\u0421\u041c\u0435\u041d\u0410 ════════════');
  js.push('var currentShift = null;');
  js.push('var rollCallList = [];');
  js.push('var availableCodes = [];');
  js.push('var rollCallLocked = false;');
  js.push('var awSearchTimer = null;');
  js.push('');

  js.push('function loadShiftPage() {');
  js.push('  document.getElementById("shiftContent").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("brigGetCurrentShift", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    if (res.hasOpenShift) {');
  js.push('      currentShift = res.shift;');
  js.push('      renderOpenShift();');
  js.push('    } else {');
  js.push('      currentShift = null;');
  js.push('      renderNoShift();');
  js.push('    }');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderNoShift() {');
  js.push('  var h = "<div class=\\"ph\\"><div><h1>🏭 \u0421\u043c\u0435\u043d\u0430</h1>" +');
  js.push('    "<p>\u0443 \u0432\u0430\u0441 \u043d\u0435\u0442 \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u0445 \u0441\u043c\u0435\u043d</p></div></div>" +');
  js.push('    "<div class=\\"card\\" style=\\"text-align:center;padding:40px\\">" +');
  js.push('    "<div style=\\"font-size:48px;margin-bottom:16px\\">🏭</div>" +');
  js.push('    "<div style=\\"font-size:16px;margin-bottom:20px;color:var(--sub)\\">\u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u043a\u043d\u043e\u043f\u043a\u0443 \u043d\u0438\u0436\u0435 \u0434\u043b\u044f \u043e\u0442\u043a\u0440\u044b\u0442\u0438\u044f \u0441\u043c\u0435\u043d\u044b</div>" +');
  js.push('    "<button class=\\"btn bp\\" style=\\"padding:16px 32px;font-size:16px\\" onclick=\\"openNewShift()\\">▶ \u043d\u0430\u0447\u0430\u0442\u044c \u0441\u043c\u0435\u043d\u0443</button>" +');
  js.push('    "</div>";');
  js.push('  document.getElementById("shiftContent").innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('function openNewShift() {');
  js.push('  if (!confirm("\u043e\u0442\u043a\u0440\u044b\u0442\u044c \u043d\u043e\u0432\u0443\u044e \u0441\u043c\u0435\u043d\u0443?")) return;');
  js.push('  srv("brigOpenShift", {}, function(res) {');
  js.push('    if (res.ok) { toast("\u0441\u043c\u0435\u043d\u0430 \u043e\u0442\u043a\u0440\u044b\u0442\u0430!","ok"); loadShiftPage(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderOpenShift() {');
  js.push('  var s = currentShift;');
  js.push('  var openD = new Date(s.openTime);');
  js.push('  var h = "<div class=\\"ph\\"><div><h1>🏭 " + s.liniya + "</h1>" +');
  js.push('    "<p>\u0441\u043c\u0435\u043d\u0430: " + s.smena + " \u00b7 \u043e\u0442\u043a\u0440\u044b\u0442\u0430 " + openD.toLocaleString("ru-RU") + "</p></div></div>";');
  js.push('  h += "<div class=\\"card\\">" +');
  js.push('    "<div class=\\"card-t\\">👥 \u041f\u0435\u0440\u0435\u043a\u043b\u0438\u0447\u043a\u0430</div>" +');
  js.push('    "<div id=\\"rollCallLockBanner\\"></div>" +');
  js.push('    "<div id=\\"rollCallList\\"><div class=\\"loader\\"><div class=\\"spin\\"></div></div></div>" +');
  js.push('    "<div id=\\"rollCallActions\\"></div>" +');
  js.push('    "</div>";');
  js.push('  h += "<div style=\\"display:flex;gap:10px;margin-top:8px\\">" +');
  js.push('    "<button class=\\"btn bd\\" style=\\"flex:1;padding:14px\\" onclick=\\"openCloseShiftMdl()\\">🔒 \u0437\u0430\u043a\u0440\u044b\u0442\u044c \u0441\u043c\u0435\u043d\u0443</button>" +');
  js.push('    "</div>";');
  js.push('  document.getElementById("shiftContent").innerHTML = h;');
  js.push('  loadRollCall();');
  js.push('}');
  js.push('');

  js.push('function loadRollCall() {');
  js.push('  srv("brigGetRollCallList", {payload:{shiftId: currentShift.id}}, function(res) {');
  js.push('    if (!res.ok) {');
  js.push('      toast(res.error,"err");');
  js.push('      var el = document.getElementById("rollCallList");');
  js.push('      if (el) el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">" + res.error + "</div></div>";');
  js.push('      return;');
  js.push('    }');
  js.push('    rollCallList = res.workers;');
  js.push('    availableCodes = res.availableCodes || [];');
  js.push('    rollCallLocked = !!res.locked;');
  js.push('    renderRollCall();');
  js.push('    renderRollCallActions();');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderRollCallActions() {');
  js.push('  var bannerEl = document.getElementById("rollCallLockBanner");');
  js.push('  var actEl = document.getElementById("rollCallActions");');
  js.push('  if (!bannerEl || !actEl) return;');
  js.push('  if (rollCallLocked) {');
  js.push('    bannerEl.innerHTML = "<div style=\\"background:rgba(102,187,106,.15);border-radius:8px;padding:10px;margin-bottom:12px;color:var(--ok);font-size:13px\\">✓ \u043f\u0435\u0440\u0435\u043d\u0435\u0441\u0435\u043d\u043e \u0432 \u0442\u0430\u0431\u0435\u043b\u044c, \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u0437\u0430\u043a\u0440\u044b\u0442\u043e</div>";');
  js.push('    actEl.innerHTML = "<button class=\\"btn bs\\" style=\\"width:100%;margin-top:8px\\" onclick=\\"unlockRollCall()\\">✏️ \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c</button>";');
  js.push('  } else {');
  js.push('    bannerEl.innerHTML = "";');
  js.push('    actEl.innerHTML = "<button class=\\"btn bs\\" style=\\"width:100%;margin-top:12px\\" onclick=\\"openAddWorkerMdl()\\">+ \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0440\u0430\u0431\u043e\u0442\u043d\u0438\u043a\u0430</button>" +');
  js.push('      "<button class=\\"btn bp\\" style=\\"width:100%;margin-top:8px\\" onclick=\\"transferToTimesheet()\\">📋 \u043f\u0435\u0440\u0435\u043d\u0435\u0441\u0442\u0438 \u0432 \u0442\u0430\u0431\u0435\u043b\u044c</button>";');
  js.push('  }');
  js.push('}');
  js.push('');

  js.push('function transferToTimesheet() {');
  js.push('  if (!confirm("\u043f\u0435\u0440\u0435\u043d\u0435\u0441\u0442\u0438 \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u0432 \u0442\u0430\u0431\u0435\u043b\u044c?")) return;');
  js.push('  srv("brigTransferToTimesheet", {payload:{shiftId: currentShift.id}}, function(res) {');
  js.push('    if (res.ok) {');
  js.push('      toast("\u043f\u0435\u0440\u0435\u043d\u0435\u0441\u0435\u043d\u043e: " + res.transferred + "","ok");');
  js.push('      if (res.skippedNoCode && res.skippedNoCode.length) {');
  js.push('        toast("\u0431\u0435\u0437 \u0434\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u0438: " + res.skippedNoCode.join(", "), "err");');
  js.push('      }');
  js.push('      loadRollCall();');
  js.push('    } else {');
  js.push('      toast(res.error,"err");');
  js.push('    }');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function unlockRollCall() {');
  js.push('  if (!confirm("\u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u044c \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0435\u0440\u0435\u043a\u043b\u0438\u0447\u043a\u0443?")) return;');
  js.push('  srv("brigUnlockRollCall", {payload:{shiftId: currentShift.id}}, function(res) {');
  js.push('    if (res.ok) { toast("\u0440\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d\u043e","ok"); loadRollCall(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderRollCall() {');
  js.push('  var el = document.getElementById("rollCallList");');
  js.push('  if (!rollCallList.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">👥</div><div class=\\"empty-t\\">\u0441\u043f\u0438\u0441\u043e\u043a \u043f\u0443\u0441\u0442</div><div style=\\"font-size:12px;color:var(--sub);margin-top:6px\\">\u0434\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0440\u0430\u0431\u043e\u0442\u043d\u0438\u043a\u043e\u0432 \u043a\u043d\u043e\u043f\u043a\u043e\u0439 \u043d\u0438\u0436\u0435</div></div>"; return; }');
  js.push('  var h = "";');
  js.push('  rollCallList.forEach(function(w, idx) {');
  js.push('    var came = w.status === "\u041f\u0440\u0438\u0448\u0451\u043b";');
  js.push('    var codeLabel = "";');
  js.push('    if (came && w.posCode) {');
  js.push('      var found = availableCodes.filter(function(c){return c.code===w.posCode;})[0];');
  js.push('      codeLabel = found ? found.label : w.posCode;');
  js.push('    }');
  js.push('    var optsHtml = "<option value=\\"\\">\u2014 \u043d\u0435 \u043f\u0440\u0438\u0448\u0451\u043b \u2014</option>";');
  js.push('    availableCodes.forEach(function(c) {');
  js.push('      var sel = (w.posCode === c.code) ? " selected" : "";');
  js.push('      optsHtml += "<option value=\\"" + c.code + "\\"" + sel + ">" + c.label + " (" + c.code + ")</option>";');
  js.push('    });');
  js.push('    h += "<div style=\\"display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid var(--bd)\\">" +');
  js.push('      "<div style=\\"flex:1;min-width:0\\"><div style=\\"font-weight:600\\">" + w.fio + "</div>" +');
  js.push('      "<div style=\\"font-size:12px;color:" + (came?"var(--ok)":"var(--sub)") + "\\">" + (came ? ("✓ " + codeLabel) : "\u043d\u0435 \u043e\u0442\u043c\u0435\u0447\u0435\u043d") + "</div></div>" +');
  js.push('      "<select class=\\"fs\\" " + (rollCallLocked?"disabled":"") + " style=\\"width:auto;min-width:160px;padding:8px 10px;font-size:13px;" + (rollCallLocked?"opacity:.6":"") + "\\" onchange=\\"setPosCode(" + idx + ",this.value)\\">" + optsHtml + "</select>" +');
  js.push('      "</div>";');
  js.push('  });');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('function setPosCode(idx, code) {');
  js.push('  var w = rollCallList[idx];');
  js.push('  w.posCode = code || null;');
  js.push('  w.status = code ? "\u041f\u0440\u0438\u0448\u0451\u043b" : "\u041d\u0435 \u043f\u0440\u0438\u0448\u0451\u043b";');
  js.push('  renderRollCall();');
  js.push('  srv("brigMarkAttendance", {payload:{');
  js.push('    shiftId: currentShift.id, fio: w.fio, podrazd: w.podrazd, posCode: code, manual: w.manual');
  js.push('  }}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); loadRollCall(); }');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function openAddWorkerMdl() {');
  js.push('  document.getElementById("awSearch").value = "";');
  js.push('  document.getElementById("awResults").innerHTML = "";');
  js.push('  showMdl("mdlAddWorker");');
  js.push('}');
  js.push('');

  js.push('function searchWorkerDebounced() {');
  js.push('  clearTimeout(awSearchTimer);');
  js.push('  awSearchTimer = setTimeout(doSearchWorker, 400);');
  js.push('}');
  js.push('');

  js.push('var searchResults = [];');
  js.push('');

  js.push('function doSearchWorker() {');
  js.push('  var q = document.getElementById("awSearch").value.trim();');
  js.push('  if (q.length < 2) { document.getElementById("awResults").innerHTML = ""; return; }');
  js.push('  srv("brigSearchWorker", {payload:{query:q}}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    searchResults = res.workers;');
  js.push('    var h = "";');
  js.push('    if (!searchResults.length) h = "<div style=\\"padding:12px;color:var(--sub)\\">\u043d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e</div>";');
  js.push('    searchResults.forEach(function(w, idx) {');
  js.push('      h += "<div style=\\"padding:10px;border-bottom:1px solid var(--bd);cursor:pointer\\" onclick=\\"pickSearchResult(" + idx + ")\\">" +');
  js.push('        "<div style=\\"font-weight:600\\">" + w.fio + "</div>" +');
  js.push('        "<div style=\\"font-size:12px;color:var(--sub)\\">" + (w.podrazd||"") + "</div></div>";');
  js.push('    });');
  js.push('    document.getElementById("awResults").innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function pickSearchResult(idx) {');
  js.push('  var w = searchResults[idx];');
  js.push('  if (!w) return;');
  js.push('  addWorkerToShift(w.fio, w.podrazd);');
  js.push('}');
  js.push('');

  js.push('function addWorkerToShift(fio, podrazd) {');
  js.push('  var exists = rollCallList.some(function(w){return w.fio===fio;});');
  js.push('  if (exists) { toast("\u0443\u0436\u0435 \u0432 \u0441\u043f\u0438\u0441\u043a\u0435","err"); closeMdl("mdlAddWorker"); return; }');
  js.push('  rollCallList.push({fio:fio, podrazd:podrazd, posCode:null, status:null, manual:true});');
  js.push('  closeMdl("mdlAddWorker");');
  js.push('  renderRollCall();');
  js.push('  toast("\u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d! \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c","ok");');
  js.push('}');
  js.push('');

  js.push('function openCloseShiftMdl() {');
  js.push('  document.getElementById("closeShiftBody").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  showMdl("mdlCloseShift");');
  js.push('  srv("brigCheckShiftReadiness", {payload:{shiftId: currentShift.id}}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    renderCloseShiftForm(res);');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderCloseShiftForm(readiness) {');
  js.push('  var h = "";');
  js.push('  if (!readiness.canClose) {');
  js.push('    var missing = [];');
  js.push('    if (!readiness.testodelReady) missing.push("\u0442\u0435\u0441\u0442\u043e\u0434\u0435\u043b");');
  js.push('    if (!readiness.upakReady) missing.push("\u0443\u043f\u0430\u043a\u043e\u0432\u0449\u0438\u0446\u0430");');
  js.push('    h += "<div class=\\"err-box\\" style=\\"display:block;margin-bottom:16px\\">⚠ \u043e\u0436\u0438\u0434\u0430\u0435\u043c \u0434\u0430\u043d\u043d\u044b\u0435 \u043e\u0442: " + missing.join(", ") + "</div>";');
  js.push('  } else {');
  js.push('    h += "<div style=\\"background:rgba(102,187,106,.15);border-radius:8px;padding:10px;margin-bottom:16px;color:var(--ok)\\">✓ \u0432\u0441\u0435 \u0434\u0430\u043d\u043d\u044b\u0435 \u0432\u0432\u0435\u0434\u0435\u043d\u044b, \u043c\u043e\u0436\u043d\u043e \u0437\u0430\u043a\u0440\u044b\u0432\u0430\u0442\u044c \u0441\u043c\u0435\u043d\u0443</div>";');
  js.push('  }');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">\u0431\u0440\u0430\u043a \u0442\u0435\u0441\u0442\u0430 (\u043a\u0433)</label>" +');
  js.push('    "<input class=\\"fi\\" type=\\"number\\" id=\\"brakTesta\\" value=\\"0\\" step=\\"0.1\\"></div>";');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">\u043f\u0440\u0438\u0447\u0438\u043d\u0430 \u0431\u0440\u0430\u043a\u0430 (\u0435\u0441\u043b\u0438 \u0435\u0441\u0442\u044c)</label>" +');
  js.push('    "<input class=\\"fi\\" id=\\"brakReason\\" placeholder=\\"\u043f\u0440\u0438\u0447\u0438\u043d\u0430...\\"></div>";');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">\u043f\u0440\u0438\u043c\u0435\u0447\u0430\u043d\u0438\u0435 \u043a \u0441\u043c\u0435\u043d\u0435</label>" +');
  js.push('    "<textarea class=\\"fta\\" id=\\"shiftNote\\" placeholder=\\"\u0434\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0435 \u0437\u0430\u043c\u0435\u0442\u043a\u0438...\\"></textarea></div>";');
  js.push('  document.getElementById("closeShiftBody").innerHTML = h;');
  js.push('  document.getElementById("btnConfirmClose").disabled = !readiness.canClose;');
  js.push('}');
  js.push('');

  js.push('function confirmCloseShift() {');
  js.push('  var brakTesta = parseFloat(document.getElementById("brakTesta").value) || 0;');
  js.push('  var brakReason = document.getElementById("brakReason").value.trim();');
  js.push('  var note = document.getElementById("shiftNote").value.trim();');
  js.push('  if (!confirm("\u0437\u0430\u043a\u0440\u044b\u0442\u044c \u0441\u043c\u0435\u043d\u0443? \u044d\u0442\u043e \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043d\u0435\u043b\u044c\u0437\u044f \u043e\u0442\u043c\u0435\u043d\u0438\u0442\u044c.")) return;');
  js.push('  var btn = document.getElementById("btnConfirmClose"); btn.disabled = true;');
  js.push('  srv("brigCloseShift", {payload:{');
  js.push('    shiftId: currentShift.id, brakTesta: brakTesta, brakReason: brakReason, note: note');
  js.push('  }}, function(res) {');
  js.push('    btn.disabled = false;');
  js.push('    if (res.ok) { closeMdl("mdlCloseShift"); renderShiftReport(res.report); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderShiftReport(r) {');
  js.push('  var effColor = r.efficiency >= 90 ? "var(--ok)" : (r.efficiency >= 70 ? "var(--g)" : "var(--err)");');
  js.push('  var devColor = r.deviation >= 0 ? "var(--ok)" : "var(--err)";');
  js.push('  var h = "<div class=\\"ph\\"><div><h1>✅ \u0421\u043c\u0435\u043d\u0430 \u0437\u0430\u043a\u0440\u044b\u0442\u0430</h1>" +');
  js.push('    "<p>\u0438\u0442\u043e\u0433\u043e\u0432\u044b\u0439 \u043e\u0442\u0447\u0451\u0442</p></div></div>";');
  js.push('  h += "<div class=\\"sg\\">" +');
  js.push('    "<div class=\\"sc\\"><div class=\\"sv\\" style=\\"color:" + effColor + "\\">" + r.efficiency + "%</div><div class=\\"sl\\">\u044d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c</div></div>" +');
  js.push('    "<div class=\\"sc\\"><div class=\\"sv\\">" + r.factOutput + "</div><div class=\\"sl\\">\u0432\u044b\u0440\u0430\u0431\u043e\u0442\u043a\u0430 (\u0444\u0430\u043a\u0442)</div></div>" +');
  js.push('    "<div class=\\"sc\\"><div class=\\"sv\\" style=\\"color:" + devColor + "\\">" + (r.deviation>=0?"+":"") + r.deviation + "</div><div class=\\"sl\\">\u043e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u0438\u0435</div></div>" +');
  js.push('    "</div>";');
  js.push('  h += "<div class=\\"card\\"><div class=\\"card-t\\">📊 \u0434\u0435\u0442\u0430\u043b\u0438</div>" +');
  js.push('    "<div style=\\"display:grid;gap:8px;font-size:14px\\">" +');
  js.push('    "<div style=\\"display:flex;justify-content:space-between\\"><span style=\\"color:var(--sub)\\">\u043e\u0442\u0440\u0430\u0431\u043e\u0442\u0430\u043d\u043e \u0432\u0440\u0435\u043c\u044f</span><span>" + r.workedMinutes + " \u043c\u0438\u043d</span></div>" +');
  js.push('    "<div style=\\"display:flex;justify-content:space-between\\"><span style=\\"color:var(--sub)\\">\u043d\u043e\u0440\u043c\u0430\u0442\u0438\u0432 \u0432\u0440\u0435\u043c\u0435\u043d\u0438</span><span>" + r.normMinutes + " \u043c\u0438\u043d</span></div>" +');
  js.push('    "<div style=\\"display:flex;justify-content:space-between\\"><span style=\\"color:var(--sub)\\">\u0432\u044b\u0440\u0430\u0431\u043e\u0442\u043a\u0430 \u043f\u043e \u043d\u043e\u0440\u043c\u0435</span><span>" + r.normOutput + "</span></div>" +');
  js.push('    "<div style=\\"display:flex;justify-content:space-between\\"><span style=\\"color:var(--sub)\\">\u0431\u0440\u0430\u043a \u0442\u0435\u0441\u0442\u0430</span><span>" + r.brakTesta + " \u043a\u0433</span></div>" +');
  js.push('    "<div style=\\"display:flex;justify-content:space-between\\"><span style=\\"color:var(--sub)\\">\u0431\u0440\u0430\u043a \u043f\u0440\u043e\u0434\u0443\u043a\u0446\u0438\u0438</span><span>" + r.packBrak + " \u0448\u0442</span></div>" +');
  js.push('    "</div></div>";');
  js.push('  h += "<button class=\\"btn bp\\" style=\\"width:100%;padding:14px\\" onclick=\\"loadShiftPage()\\">▶ \u043d\u0430\u0447\u0430\u0442\u044c \u043d\u043e\u0432\u0443\u044e \u0441\u043c\u0435\u043d\u0443</button>";');
  js.push('  document.getElementById("shiftContent").innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('function loadShiftHistory() {');
  js.push('  document.getElementById("histCont").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("brigGetShiftHistory", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    if (!res.history.length) {');
  js.push('      document.getElementById("histCont").innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">📋</div><div class=\\"empty-t\\">\u043d\u0435\u0442 \u0438\u0441\u0442\u043e\u0440\u0438\u0438</div></div>";');
  js.push('      return;');
  js.push('    }');
  js.push('    var h = "<div class=\\"tw\\"><table><thead><tr><th>\u0434\u0430\u0442\u0430</th><th>\u043b\u0438\u043d\u0438\u044f</th><th>\u044d\u0444\u0444.</th><th>\u0432\u044b\u0440\u0430\u0431\u043e\u0442\u043a\u0430</th><th>\u043e\u0442\u043a\u043b.</th><th>\u0431\u0440\u0430\u043a</th></tr></thead><tbody>";');
  js.push('    res.history.forEach(function(r) {');
  js.push('      var effColor = r.efficiency >= 90 ? "bg" : (r.efficiency >= 70 ? "bb" : "br");');
  js.push('      h += "<tr><td>" + r.date + " (" + r.smena + ")</td>" +');
  js.push('        "<td>" + r.liniya + "</td>" +');
  js.push('        "<td><span class=\\"badge " + effColor + "\\">" + r.efficiency + "%</span></td>" +');
  js.push('        "<td>" + r.factOutput + "</td>" +');
  js.push('        "<td>" + (r.deviation>=0?"+":"") + r.deviation + "</td>" +');
  js.push('        "<td>" + r.brakTesta + " \u043a\u0433</td></tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    document.getElementById("histCont").innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('// ── \u042d\u041b\u0415\u041a\u0422\u0420\u041e\u041d\u041d\u042b\u0419 \u0422\u0410\u0411\u0415\u041b\u042c ──');
  js.push('function loadTimesheet() {');
  js.push('  document.getElementById("timesheetCont").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("brigGetTimesheet", {}, function(res) {');
  js.push('    if (!res.ok) {');
  js.push('      toast(res.error,"err");');
  js.push('      document.getElementById("timesheetCont").innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">⚠️</div><div class=\\"empty-t\\">" + (res.error||"\u043e\u0448\u0438\u0431\u043a\u0430") + "</div></div>";');
  js.push('      return;');
  js.push('    }');
  js.push('    renderTimesheet(res);');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderTimesheet(res) {');
  js.push('  var workers = Object.keys(res.data);');
  js.push('  if (!workers.length) {');
  js.push('    document.getElementById("timesheetCont").innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">📅</div><div class=\\"empty-t\\">\u043d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445 \u0437\u0430 \u044d\u0442\u043e\u0442 \u043c\u0435\u0441\u044f\u0446</div></div>";');
  js.push('    return;');
  js.push('  }');
  js.push('  var todayParts = res.today.split(".");');
  js.push('  var todayDay = parseInt(todayParts[0],10);');
  js.push('  var monthPart = todayParts[1] + "." + todayParts[2];');
  js.push('  var dates = [];');
  js.push('  for (var d=1; d<=todayDay; d++) {');
  js.push('    var dd = (d<10?"0":"")+d;');
  js.push('    dates.push(dd+"."+monthPart);');
  js.push('  }');
  js.push('  var h = "<div class=\\"tw\\"><table><thead><tr><th style=\\"position:sticky;left:0;background:var(--s2)\\">\u0444\u0438\u043e</th>";');
  js.push('  dates.forEach(function(dt) { h += "<th style=\\"text-align:center\\">" + dt.split(".")[0] + "</th>"; });');
  js.push('  h += "</tr></thead><tbody>";');
  js.push('  workers.sort().forEach(function(fio) {');
  js.push('    h += "<tr><td style=\\"position:sticky;left:0;background:var(--s1);font-weight:600;white-space:nowrap\\">" + fio + "</td>";');
  js.push('    dates.forEach(function(dt) {');
  js.push('      var code = res.data[fio][dt] || "";');
  js.push('      var isToday = dt === res.today;');
  js.push('      var bg = isToday ? "background:rgba(249,168,37,.15)" : "";');
  js.push('      h += "<td style=\\"text-align:center;" + bg + "\\">" + (code || "\u2014") + "</td>";');
  js.push('    });');
  js.push('    h += "</tr>";');
  js.push('  });');
  js.push('  h += "</tbody></table></div>";');
  js.push('  h += "<div style=\\"margin-top:12px;font-size:12px;color:var(--sub)\\">";');
  js.push('  res.availableCodes.forEach(function(c) { h += c.code + " \u2014 " + c.label + "&nbsp;&nbsp;&nbsp;"; });');
  js.push('  h += "</div>";');
  js.push('  document.getElementById("timesheetCont").innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('');
  js.push('// ════════════ \u0417\u0410\u0412.\u041f\u0420\u041e\u0418\u0417\u0412\u041e\u0414\u0421\u0442\u0412\u041e\u041c ════════════');
  js.push('var scheduleData = null;');
  js.push('var prioritiesList = [];');
  js.push('var distributionDraft = null;');
  js.push('');

  js.push('// ── \u0413\u0440\u0430\u0444\u0438\u043a \u0440\u0430\u0431\u043e\u0442\u044b ──');
  js.push('function loadSchedule() {');
  js.push('  document.getElementById("scheduleCont").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("zpGetSchedule", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); document.getElementById("scheduleCont").innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">" + res.error + "</div></div>"; return; }');
  js.push('    scheduleData = res;');
  js.push('    renderSchedule();');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('// ── \u0421\u043a\u043e\u0440\u043e\u0441\u0442\u044c \u043b\u0438\u043d\u0438\u0439 \u043f\u043e \u0442\u043e\u0432\u0430\u0440\u0443 (\u043c\u0430\u0442\u0440\u0438\u0446\u0430) ──');
  js.push('var speedMatrixData = null;');
  js.push('function loadSpeedMatrix() {');
  js.push('  document.getElementById("speedMatrixCont").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("getLines", {}, function(linesRes) {');
  js.push('    if (!linesRes.ok) { toast(linesRes.error,"err"); return; }');
  js.push('    srv("zpGetSpeedMatrix", {}, function(res) {');
  js.push('      if (!res.ok) { toast(res.error,"err"); document.getElementById("speedMatrixCont").innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">" + res.error + "</div></div>"; return; }');
  js.push('      speedMatrixData = res;');
  js.push('      speedMatrixData.lines = linesRes.lines.filter(function(l){return l.active;});');
  js.push('      renderSpeedMatrix();');
  js.push('    });');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderSpeedMatrix() {');
  js.push('  var res = speedMatrixData;');
  js.push('  var el = document.getElementById("speedMatrixCont");');
  js.push('  if (!res.products.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">\u043d\u0435\u0442 \u0442\u043e\u0432\u0430\u0440\u043e\u0432 \u0432 \u0441\u043f\u0440\u0430\u0432\u043e\u0447\u043d\u0438\u043a\u0435</div></div>"; return; }');
  js.push('  var h = "<div class=\\"tw\\"><table><thead><tr><th style=\\"position:sticky;left:0;background:var(--s2);z-index:2\\">\u041d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435</th>";');
  js.push('  res.lines.forEach(function(l) { h += "<th style=\\"text-align:center;min-width:120px\\">" + l.name + "</th>"; });');
  js.push('  h += "</tr></thead><tbody>";');
  js.push('  res.products.forEach(function(product) {');
  js.push('    h += "<tr><td style=\\"position:sticky;left:0;background:var(--s1);font-weight:600;white-space:nowrap;z-index:1\\">" + product + "</td>";');
  js.push('    res.lines.forEach(function(l) {');
  js.push('      var val = (res.matrix[product] && res.matrix[product][l.name]) ? res.matrix[product][l.name] : "";');
  js.push('      h += "<td style=\\"padding:4px\\"><input type=\\"number\\" min=\\"0\\" placeholder=\\"\u043d\u0435\u0442\\" value=\\"" + val + "\\" style=\\"width:75px;text-align:center;background:var(--s2);border:1px solid var(--bd);border-radius:4px;color:var(--txt);padding:6px\\" onchange=\\"saveProductSpeed(\'" + product.replace(/\'/g,"\\\\\'") + "\',\'" + l.name.replace(/\'/g,"\\\\\'") + "\',this.value)\\"></td>";');
  js.push('    });');
  js.push('    h += "</tr>";');
  js.push('  });');
  js.push('  h += "</tbody></table></div>";');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('function saveProductSpeed(product, liniya, value) {');
  js.push('  var speed = parseFloat(value) || 0;');
  js.push('  srv("zpSaveProductSpeed", {payload:{product:product, liniya:liniya, speed:speed}}, function(res) {');
  js.push('    if (!res.ok) toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderSchedule() {');
  js.push('  var res = scheduleData;');
  js.push('  var todayDay = parseInt(res.today.split(".")[0], 10);');
  js.push('  var todayMonthPart = res.today.split(".").slice(1).join(".");');
  js.push('  var isCurrentMonth = (todayMonthPart === res.month);');
  js.push('  var h = "<div class=\\"tw\\"><table><thead><tr><th style=\\"position:sticky;left:0;background:var(--s2)\\">\u041b\u0438\u043d\u0438\u044f / \u0441\u043c\u0435\u043d\u0430</th>";');
  js.push('  for (var d=1; d<=res.daysInMonth; d++) {');
  js.push('    var dd = (d<10?"0":"")+d;');
  js.push('    var isToday = isCurrentMonth && d === todayDay;');
  js.push('    h += "<th style=\\"text-align:center;" + (isToday?"background:rgba(249,168,37,.25)":"") + "\\">" + dd + "</th>";');
  js.push('  }');
  js.push('  h += "</tr></thead><tbody>";');
  js.push('  res.rowDefs.forEach(function(rd, ridx) {');
  js.push('    var key = rd.liniya + "|" + rd.smena;');
  js.push('    h += "<tr><td style=\\"position:sticky;left:0;background:var(--s1);font-weight:600;white-space:nowrap\\">" + rd.liniya + " / " + rd.smena + "</td>";');
  js.push('    for (var d=1; d<=res.daysInMonth; d++) {');
  js.push('      var dd = (d<10?"0":"")+d;');
  js.push('      var dateStr = dd + "." + res.month;');
  js.push('      var hours = (res.grid[key] && res.grid[key][dateStr] !== undefined) ? res.grid[key][dateStr] : "";');
  js.push('      var isPast = isCurrentMonth && d < todayDay;');
  js.push('      var isToday = isCurrentMonth && d === todayDay;');
  js.push('      var bg = isToday ? "background:rgba(249,168,37,.12)" : "";');
  js.push('      if (isPast) {');
  js.push('        h += "<td style=\\"text-align:center;color:var(--sub);" + bg + "\\">" + (hours!==""?hours:"\u2014") + "</td>";');
  js.push('      } else {');
  js.push('        h += "<td style=\\"padding:2px;" + bg + "\\"><input type=\\"number\\" min=\\"0\\" max=\\"24\\" value=\\"" + hours + "\\" style=\\"width:48px;text-align:center;background:var(--s2);border:1px solid var(--bd);border-radius:4px;color:var(--txt);padding:4px\\" onchange=\\"setScheduleHours(\'" + rd.liniya.replace(/\'/g,"\\\\\'") + "\',\'" + rd.smena + "\',\'" + dateStr + "\',this.value)\\"></td>";');
  js.push('      }');
  js.push('    }');
  js.push('    h += "</tr>";');
  js.push('  });');
  js.push('  h += "</tbody></table></div>";');
  js.push('  document.getElementById("scheduleCont").innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('function setScheduleHours(liniya, smena, dateStr, value) {');
  js.push('  var hours = parseInt(value, 10) || 0;');
  js.push('  srv("zpSetScheduleHours", {payload:{liniya:liniya, smena:smena, date:dateStr, hours:hours}}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); loadSchedule(); }');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('// ── \u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u044b \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u043e\u0432 ──');
  js.push('function loadPriorities() {');
  js.push('  document.getElementById("prioritiesCont").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("zpGetPriorities", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    prioritiesList = res.priorities;');
  js.push('    renderPriorities();');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderPriorities() {');
  js.push('  var el = document.getElementById("prioritiesCont");');
  js.push('  if (!prioritiesList.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">🎯</div><div class=\\"empty-t\\">\u0441\u043f\u0438\u0441\u043e\u043a \u043f\u0443\u0441\u0442</div></div>"; return; }');
  js.push('  var h = "<div class=\\"tw\\"><table><thead><tr><th>\u041f\u0440\u043e\u0434\u0443\u043a\u0442</th><th>\u041e\u0441\u043d\u043e\u0432\u043d\u0430\u044f</th><th>\u0412\u0441\u043f.1</th><th>\u0412\u0441\u043f.2</th><th></th></tr></thead><tbody>";');
  js.push('  prioritiesList.forEach(function(p, idx) {');
  js.push('    h += "<tr><td style=\\"font-weight:600\\">" + p.product + "</td>" +');
  js.push('      "<td><span class=\\"badge bg\\">" + (p.main||"—") + "</span></td>" +');
  js.push('      "<td><span class=\\"badge bb\\">" + (p.alt1||"—") + "</span></td>" +');
  js.push('      "<td><span class=\\"badge bb\\">" + (p.alt2||"—") + "</span></td>" +');
  js.push('      "<td><button class=\\"btn bs\\" style=\\"padding:6px 10px\\" onclick=\\"editPriority(" + idx + ")\\">✏️</button></td></tr>";');
  js.push('  });');
  js.push('  h += "</tbody></table></div>";');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('function fillLineSelectsForPriority() {');
  js.push('  ["prMain","prAlt1","prAlt2"].forEach(function(sid) {');
  js.push('    var sel = document.getElementById(sid);');
  js.push('    var cur = sel.value;');
  js.push('    while (sel.options.length>1) sel.remove(1);');
  js.push('    allLines.filter(function(l){return l.active;}).forEach(function(l) {');
  js.push('      var o = document.createElement("option"); o.value=l.name; o.textContent=l.name; sel.appendChild(o);');
  js.push('    });');
  js.push('    sel.value = cur;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function fillProductSelectForPriority(excludeUsed) {');
  js.push('  srv("getProducts", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    var sel = document.getElementById("prProduct");');
  js.push('    while (sel.options.length>1) sel.remove(1);');
  js.push('    var usedProducts = prioritiesList.map(function(p){return p.product;});');
  js.push('    res.products.forEach(function(pr) {');
  js.push('      if (excludeUsed && usedProducts.indexOf(pr.name) >= 0) return;');
  js.push('      var o = document.createElement("option"); o.value=pr.name; o.textContent=pr.name; sel.appendChild(o);');
  js.push('    });');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function openPriorityMdl() {');
  js.push('  document.getElementById("prProduct").disabled = false;');
  js.push('  document.getElementById("prMain").value = "";');
  js.push('  document.getElementById("prAlt1").value = "";');
  js.push('  document.getElementById("prAlt2").value = "";');
  js.push('  fillProductSelectForPriority(true);');
  js.push('  document.getElementById("prProduct").value = "";');
  js.push('  srv("getLines", {}, function(res){ if(res.ok){ allLines=res.lines; fillLineSelectsForPriority(); } });');
  js.push('  showMdl("mdlPriority");');
  js.push('}');
  js.push('');

  js.push('function editPriority(idx) {');
  js.push('  var p = prioritiesList[idx];');
  js.push('  document.getElementById("prProduct").disabled = true;');
  js.push('  fillProductSelectForPriority(false);');
  js.push('  document.getElementById("prProduct").value = p.product;');
  js.push('  srv("getLines", {}, function(res){');
  js.push('    if(res.ok){ allLines=res.lines; fillLineSelectsForPriority(); }');
  js.push('    document.getElementById("prMain").value = p.main||"";');
  js.push('    document.getElementById("prAlt1").value = p.alt1||"";');
  js.push('    document.getElementById("prAlt2").value = p.alt2||"";');
  js.push('  });');
  js.push('  showMdl("mdlPriority");');
  js.push('}');
  js.push('');

  js.push('function savePriority() {');
  js.push('  var p = {');
  js.push('    product: document.getElementById("prProduct").value,');
  js.push('    main: document.getElementById("prMain").value,');
  js.push('    alt1: document.getElementById("prAlt1").value,');
  js.push('    alt2: document.getElementById("prAlt2").value');
  js.push('  };');
  js.push('  if (!p.product) { toast("\u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u043e\u0432\u0430\u0440","err"); return; }');
  js.push('  srv("zpSavePriority", {payload:p}, function(res) {');
  js.push('    if (res.ok) { toast("\u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e!","ok"); closeMdl("mdlPriority"); loadPriorities(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('// ── \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u0437\u0430\u043a\u0430\u0437\u043e\u0432 ──');
  js.push('function buildDistribution() {');
  js.push('  document.getElementById("distributionCont").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("zpBuildDistribution", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); document.getElementById("distributionCont").innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">" + res.error + "</div></div>"; return; }');
  js.push('    distributionDraft = res;');
  js.push('    distFilterLine = "";');
  js.push('    renderDistribution();');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── История распределения: план/факт по датам ──
  js.push('var distHistOpen = {}; // date -> true/false (развёрнута ли карточка дня)');
  js.push('');
  js.push('function loadDistHistory() {');
  js.push('  var fromEl = document.getElementById("dhFrom");');
  js.push('  var toEl   = document.getElementById("dhTo");');
  js.push('  if (!fromEl.value || !toEl.value) {');
  js.push('    var d = new Date(); var dd=("0"+d.getDate()).slice(-2), mm=("0"+(d.getMonth()+1)).slice(-2);');
  js.push('    var weekAgo = new Date(d); weekAgo.setDate(d.getDate()-6);');
  js.push('    var wdd=("0"+weekAgo.getDate()).slice(-2), wmm=("0"+(weekAgo.getMonth()+1)).slice(-2);');
  js.push('    if (!fromEl.value) fromEl.value = weekAgo.getFullYear()+"-"+wmm+"-"+wdd;');
  js.push('    if (!toEl.value)   toEl.value   = d.getFullYear()+"-"+mm+"-"+dd;');
  js.push('  }');
  js.push('  function isoToRu(s){ var p=s.split("-"); return p.length===3?p[2]+"."+p[1]+"."+p[0]:s; }');
  js.push('  var dateFrom = isoToRu(fromEl.value), dateTo = isoToRu(toEl.value);');
  js.push('  var el = document.getElementById("distHistoryCont");');
  js.push('  el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("zpGetDistributionHistory", {payload:{dateFrom:dateFrom, dateTo:dateTo}}, function(res) {');
  js.push('    if (!res.ok) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">" + (res.error||"\u041e\u0448\u0438\u0431\u043a\u0430") + "</div></div>"; return; }');
  js.push('    renderDistHistory(res.days);');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderDistHistory(days) {');
  js.push('  var el = document.getElementById("distHistoryCont");');
  js.push('  if (!days.length) {');
  js.push('    el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">📊</div><div class=\\"empty-t\\">\u0417\u0430 \u044d\u0442\u043e\u0442 \u043f\u0435\u0440\u0438\u043e\u0434 \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0439 \u043d\u0435\u0442</div></div>";');
  js.push('    return;');
  js.push('  }');
  js.push('  var h = "";');
  js.push('  days.forEach(function(day, di) {');
  js.push('    var isOpen = distHistOpen[day.date] !== false; // по умолчанию развёрнуто');
  js.push('    var pctColor = day.totalPct>=100 ? "var(--ok)" : day.totalPct>=80 ? "var(--warn)" : "var(--err)";');
  js.push('    h += "<div style=\\"margin-bottom:10px;border:1px solid var(--bd);border-radius:12px;overflow:hidden\\">";');
  js.push('    h += "<div style=\\"display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:var(--s2);cursor:pointer\\" onclick=\\"toggleDistHistDay(\'" + day.date + "\')\\">";');
  js.push('    h += "<div style=\\"font-weight:700;font-size:15px\\">" + day.date + "</div>";');
  js.push('    h += "<div style=\\"display:flex;align-items:center;gap:14px\\">";');
  js.push('    h += "<span style=\\"font-size:13px;color:var(--sub)\\">\u041f\u043b\u0430\u043d: <b>" + day.totalPlan.toLocaleString() + "</b> \u0448\u0442</span>";');
  js.push('    h += "<span style=\\"font-size:13px;color:var(--sub)\\">\u0424\u0430\u043a\u0442: <b style=\\"color:var(--ok)\\">" + day.totalFact.toLocaleString() + "</b> \u0448\u0442</span>";');
  js.push('    h += "<span style=\\"font-size:14px;font-weight:700;color:" + pctColor + "\\">" + day.totalPct + "%</span>";');
  js.push('    h += "<span style=\\"font-size:16px;color:var(--sub);min-width:18px;text-align:center\\">" + (isOpen?"\\u25B2":"\\u25BC") + "</span>";');
  js.push('    h += "</div></div>";');
  js.push('    h += "<div id=\\"dh_" + day.date.replace(/\\./g,"_") + "\\" style=\\"display:" + (isOpen?"block":"none") + "\\">";');
  js.push('    h += "<table style=\\"width:100%;border-collapse:collapse\\"><thead><tr style=\\"background:rgba(255,255,255,.03)\\">";');
  js.push('    h += "<th style=\\"padding:7px 12px;text-align:left;font-size:12px;color:var(--sub)\\">\u041b\u0438\u043d\u0438\u044f</th>";');
  js.push('    h += "<th style=\\"padding:7px;text-align:left;font-size:12px;color:var(--sub)\\">\u0421\u043c\u0435\u043d\u0430</th>";');
  js.push('    h += "<th style=\\"padding:7px;text-align:left;font-size:12px;color:var(--sub)\\">\u0422\u043e\u0432\u0430\u0440</th>";');
  js.push('    h += "<th style=\\"padding:7px;text-align:center;font-size:12px;color:var(--sub)\\">\u041f\u043b\u0430\u043d</th>";');
  js.push('    h += "<th style=\\"padding:7px;text-align:center;font-size:12px;color:var(--sub)\\">\u0424\u0430\u043a\u0442</th>";');
  js.push('    h += "<th style=\\"padding:7px;text-align:center;font-size:12px;color:var(--sub)\\">%</th>";');
  js.push('    h += "</tr></thead><tbody>";');
  js.push('    day.items.forEach(function(it) {');
  js.push('      var ic = it.pct>=100 ? "var(--ok)" : it.pct>=80 ? "var(--warn)" : "var(--err)";');
  js.push('      h += "<tr style=\\"border-top:1px solid var(--bd)\\">";');
  js.push('      h += "<td style=\\"padding:8px 12px;font-weight:600\\">" + it.liniya + "</td>";');
  js.push('      h += "<td style=\\"padding:8px;color:var(--sub);font-size:13px\\">" + (it.smena||"\\u2014") + "</td>";');
  js.push('      h += "<td style=\\"padding:8px\\">" + it.product + "</td>";');
  js.push('      h += "<td style=\\"padding:8px;text-align:center\\">" + it.plan.toLocaleString() + "</td>";');
  js.push('      h += "<td style=\\"padding:8px;text-align:center;color:var(--ok)\\">" + it.fact.toLocaleString() + "</td>";');
  js.push('      h += "<td style=\\"padding:8px;text-align:center;font-weight:700;color:" + ic + "\\">" + it.pct + "%</td>";');
  js.push('      h += "</tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div></div>";');
  js.push('  });');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('function toggleDistHistDay(date) {');
  js.push('  distHistOpen[date] = (distHistOpen[date] === false); // инвертируем (по умолчанию считался открытым)');
  js.push('  var box = document.getElementById("dh_" + date.replace(/\\./g,"_"));');
  js.push('  if (box) box.style.display = (distHistOpen[date] ? "block" : "none");');
  js.push('  var arrow = box ? box.previousElementSibling.querySelector("span:last-child") : null;');
  js.push('  if (arrow) arrow.textContent = distHistOpen[date] ? "\\u25B2" : "\\u25BC";');
  js.push('}');
  js.push('');

  js.push('var distFilterLine = "";');
  js.push('var manualOrderItems = {}; // product -> qty (ручной план)');
  js.push('');

  // ── Ручная форма формирования плана (когда нет заказов) ──
  js.push('function renderManualOrderForm(el, res) {');
  js.push('  var gpStock = res.gpStock || {};');
  js.push('  var batchSizes = res.batchSizes || {};');
  js.push('  var products = Object.keys(batchSizes).sort();');
  js.push('  if (!products.length) {');
  js.push('    el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">📦</div><div class=\\"empty-t\\">\u043d\u0435\u0442 \u0437\u0430\u043a\u0430\u0437\u043e\u0432. \u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u0437\u0430\u0434\u0430\u0439\u0442\u0435 \u043d\u043e\u0440\u043c\u044b \u0440\u0430\u0441\u0445\u043e\u0434\u043e\u0432</div></div>"; return;');
  js.push('  }');
  js.push('  var h = "<div style=\\"background:rgba(249,168,37,.08);border:1px solid var(--warn);border-radius:8px;padding:12px 14px;margin-bottom:14px;font-size:13px\\">\u0417\u0430\u043a\u0430\u0437\u043e\u0432 \u043d\u0435\u0442 \u2014 \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043f\u043b\u0430\u043d \u0432\u044b\u043f\u0443\u0441\u043a\u0430 \u0432\u0440\u0443\u0447\u043d\u0443\u044e. \u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0437\u0430\u043e\u043a\u0440\u0443\u0433\u043b\u044f\u0435\u0442\u0441\u044f \u0434\u043e \u0446\u0435\u043b\u043e\u0439 \u043f\u0430\u0440\u0442\u0438\u0438, \u043e\u0441\u0442\u0430\u0442\u043e\u043a \u0421\u043a\u043b\u0430\u0434\u0430 \u0413\u041f \u0443\u0447\u0438\u0442\u044b\u0432\u0430\u0435\u0442\u0441\u044f.</div>";');
  js.push('  h += "<div class=\\"tw\\"><table><thead><tr>" +');
  js.push('    "<th>\u041f\u0440\u043e\u0434\u0443\u043a\u0442</th>" +');
  js.push('    "<th style=\\"text-align:right\\">\u041f\u0430\u0440\u0442\u0438\u044f, \u0448\u0442</th>" +');
  js.push('    "<th style=\\"text-align:right;color:var(--ok)\\">\u041e\u0441\u0442\u0430\u0442\u043e\u043a \u0413\u041f</th>" +');
  js.push('    "<th style=\\"text-align:center\\">\u041f\u043b\u0430\u043d (\u0448\u0442)</th>" +');
  js.push('    "<th style=\\"text-align:center\\">\u041f\u0430\u0440\u0442\u0438\u0439</th>" +');
  js.push('    "</tr></thead><tbody>";');
  js.push('  products.forEach(function(product) {');
  js.push('    var batch = batchSizes[product] || 0;');
  js.push('    var stock = gpStock[product] || 0;');
  js.push('    var initQty = manualOrderItems[product] || 0;');
  js.push('    var batches = batch > 0 ? Math.round(initQty / batch) : 0;');
  js.push('    var safeId = "mo_" + product.replace(/[^a-zA-Z0-9]/g,"_");');
  js.push('    h += "<tr>" +');
  js.push('      "<td style=\\"font-weight:600\\">" + product + "</td>" +');
  js.push('      "<td style=\\"text-align:right;color:var(--sub)\\">" + batch + "</td>" +');
  js.push('      "<td style=\\"text-align:right;color:var(--ok)\\">" + stock + "</td>" +');
  js.push('      "<td style=\\"text-align:center\\">" +');
  js.push('        "<input type=\\"number\\" min=\\"0\\" step=\\"" + batch + "\\" value=\\"" + initQty + "\\" class=\\"fi\\" style=\\"width:90px;text-align:center;padding:5px\\"" +');
  js.push('          " id=\\"" + safeId + "\\" oninput=\\"onManualQtyInput(this,\'" + product.replace(/\'/g,\'\\\\\\\'\') + "\',"+batch+")\\">" +');
  js.push('      "</td>" +');
  js.push('      "<td style=\\"text-align:center;color:var(--sub)\\" id=\\"" + safeId + "_batches\\">" + (batches || "\u2014") + "</td>" +');
  js.push('      "</tr>";');
  js.push('  });');
  js.push('  h += "</tbody></table></div>";');
  js.push('  h += "<div style=\\"margin-top:14px;display:flex;gap:10px\\">" +');
  js.push('    "<button class=\\"btn bs\\" onclick=\\"clearManualPlan()\\">✕ \u041e\u0447\u0438\u0441\u0442\u0438\u0442\u044c</button>" +');
  js.push('    "<button class=\\"btn bp\\" onclick=\\"applyManualPlan()\\">\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441 \u0440\u0443\u0447\u043d\u044b\u043c \u043f\u043b\u0430\u043d\u043e\u043c</button>" +');
  js.push('    "</div>";');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('function onManualQtyInput(inp, product, batchSize) {');
  js.push('  var qty = parseFloat(inp.value) || 0;');
  js.push('  var stock = (distributionDraft.gpStock || {})[product] || 0;');
  js.push('  // Ограничиваем: нельзя планировать меньше 0');
  js.push('  if (qty < 0) { qty = 0; inp.value = 0; }');
  js.push('  // Выравниваем к целому числу партий');
  js.push('  var batches = batchSize > 0 ? Math.ceil(qty / batchSize) : 0;');
  js.push('  var aligned = batches * batchSize;');
  js.push('  manualOrderItems[product] = aligned;');
  js.push('  // Подсказка: показываем сколько партий');
  js.push('  var safeId = "mo_" + product.replace(/[^a-zA-Z0-9]/g,"_");');
  js.push('  var batchCell = document.getElementById(safeId + "_batches");');
  js.push('  if (batchCell) batchCell.textContent = batches || "\u2014";');
  js.push('  // Предупреждение если остаток ГП уже покрывает количество');
  js.push('  inp.style.borderColor = stock >= aligned && aligned > 0 ? "var(--warn)" : "";');
  js.push('}');
  js.push('');

  js.push('function clearManualPlan() {');
  js.push('  manualOrderItems = {};');
  js.push('  renderDistribution();');
  js.push('}');
  js.push('');

  js.push('function applyManualPlan() {');
  js.push('  var items = Object.keys(manualOrderItems).filter(function(p){ return manualOrderItems[p] > 0; });');
  js.push('  if (!items.length) { toast("\u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0434\u043b\u044f \u0445\u043e\u0442\u044f \u0431\u044b \u043e\u0434\u043d\u043e\u0433\u043e \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u0430","err"); return; }');
  js.push('  var gpStock = distributionDraft.gpStock || {};');
  js.push('  var warnings = [];');
  js.push('  items.forEach(function(p) {');
  js.push('    var stock = gpStock[p] || 0;');
  js.push('    var planned = manualOrderItems[p];');
  js.push('    if (stock >= planned) warnings.push(p + ": \u043e\u0441\u0442\u0430\u0442\u043e\u043a \u0413\u041f (" + stock + ") \u043f\u043e\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u043f\u043b\u0430\u043d (" + planned + ")");');
  js.push('  });');
  js.push('  if (warnings.length) {');
  js.push('    if (!confirm("\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435: \u0434\u043b\u044f \u043d\u0435\u043a\u043e\u0442\u043e\u0440\u044b\u0445 \u043f\u043e\u0437\u0438\u0446\u0438\u0439 \u043e\u0441\u0442\u0430\u0442\u043e\u043a \u043d\u0430 \u0421\u043a\u043b\u0430\u0434\u0435 \u0413\u041f \u0443\u0436\u0435 \u043f\u043e\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u043f\u043b\u0430\u043d:\\n" + warnings.join("\\n") + "\\n\\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c?")) return;');
  js.push('  }');
  js.push('  document.getElementById("distributionCont").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  var manual = items.map(function(p){ return {product:p, qty:manualOrderItems[p]}; });');
  js.push('  srv("zpBuildDistributionManual", {payload:{items:manual}}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    distributionDraft = res;');
  js.push('    distFilterLine = "";');
  js.push('    renderDistribution();');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderDistribution() {');
  js.push('  var res = distributionDraft;');
  js.push('  var el = document.getElementById("distributionCont");');
  js.push('  // Если нет заказов — показываем ручную форму');
  js.push('  if (res.noOrders || (!res.items.length && !res.unassigned.length)) {');
  js.push('    renderManualOrderForm(el, res);');
  js.push('    return;');
  js.push('  }');
  js.push('  if (!res.horizon.length) {');
  js.push('    el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">\u043d\u0435\u0442 \u0434\u0430\u0442\u044b \u043e\u0442\u0433\u0440\u0443\u0437\u043a\u0438 \u0432 \u0437\u0430\u043a\u0430\u0437\u0430\u0445</div></div>"; return;');
  js.push('  }');
  js.push('  // \u0441\u0442\u0440\u043e\u043a\u0438: \u0432\u0441\u0435 \u0443\u043d\u0438\u043a\u0430\u043b\u044c\u043d\u044b\u0435 \u043b\u0438\u043d\u0438\u044f+\u0441\u043c\u0435\u043d\u0430, \u0432\u0441\u0442\u0440\u0435\u0442\u0438\u0432\u0448\u0438\u0435\u0441\u044f \u0432 \u0440\u0430\u0441\u0447\u0451\u0442\u0435');
  js.push('  var rowKeys = [];');
  js.push('  var rowSeen = {};');
  js.push('  var lineNames = [];');
  js.push('  Object.keys(res.capacityByLine).forEach(function(k) {');
  js.push('    var slot = res.capacityByLine[k];');
  js.push('    var rk = slot.liniya + "|" + slot.smena;');
  js.push('    if (!rowSeen[rk]) { rowSeen[rk] = true; rowKeys.push({liniya:slot.liniya, smena:slot.smena}); }');
  js.push('    if (lineNames.indexOf(slot.liniya)<0) lineNames.push(slot.liniya);');
  js.push('  });');
  js.push('  rowKeys.sort(function(a,b){ return (a.liniya+a.smena).localeCompare(b.liniya+b.smena); });');
  js.push('  lineNames.sort();');
  js.push('  if (distFilterLine) rowKeys = rowKeys.filter(function(rk){return rk.liniya===distFilterLine;});');
  js.push('');
  js.push('  var k = res.kpi;');
  js.push('  var h = "<div style=\\"display:flex;gap:10px;margin-bottom:14px;align-items:center;flex-wrap:wrap\\">" +');
  js.push('    "<select class=\\"fs\\" style=\\"width:auto;padding:8px 12px\\" onchange=\\"distFilterLine=this.value;renderDistribution()\\">" +');
  js.push('    "<option value=\\"\\"" + (distFilterLine===""?" selected":"") + ">\u0432\u0441\u0435 \u043b\u0438\u043d\u0438\u0438</option>";');
  js.push('  lineNames.forEach(function(ln) { h += "<option value=\\"" + ln + "\\"" + (distFilterLine===ln?" selected":"") + ">" + ln + "</option>"; });');
  js.push('  h += "</select></div>";');
  js.push('');
  js.push('  h += "<div style=\\"display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap\\">" +');
  js.push('    "<div style=\\"flex:1;min-width:140px;background:var(--s2);border-radius:8px;padding:12px\\"><div style=\\"font-size:11px;color:var(--sub);text-transform:uppercase\\">\u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u0435 \u043f\u043b\u0430\u043d\u0430</div><div style=\\"font-size:22px;font-weight:700;margin-top:4px;color:" + (k.planCompletionPct>=80?"var(--ok)":k.planCompletionPct>=50?"var(--warn)":"var(--err)") + "\\">" + k.planCompletionPct + "%</div><div style=\\"font-size:11px;color:var(--sub);margin-top:2px\\">" + k.totalPlanned + " / " + k.totalDemand + " \u0448\u0442</div></div>" +');
  js.push('    "<div style=\\"flex:1;min-width:140px;background:var(--s2);border-radius:8px;padding:12px\\"><div style=\\"font-size:11px;color:var(--sub);text-transform:uppercase\\">\u043d\u0435 \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u043e</div><div style=\\"font-size:22px;font-weight:700;margin-top:4px;color:" + (k.totalUnassigned?"var(--err)":"var(--txt)") + "\\">" + k.totalUnassigned + "</div><div style=\\"font-size:11px;color:var(--sub);margin-top:2px\\">\u0448\u0442 \u043e\u0441\u0442\u0430\u0442\u043e\u043a</div></div>" +');
  js.push('    "<div style=\\"flex:1;min-width:140px;background:var(--s2);border-radius:8px;padding:12px\\"><div style=\\"font-size:11px;color:var(--sub);text-transform:uppercase\\">\u0433\u043e\u0440\u0438\u0437\u043e\u043d\u0442</div><div style=\\"font-size:22px;font-weight:700;margin-top:4px\\">" + k.horizonDays + " \u0434\u043d.</div><div style=\\"font-size:11px;color:var(--sub);margin-top:2px\\">\u0434\u043e \u0431\u043b\u0438\u0436\u043d\u0435\u0439 \u043e\u0442\u0433\u0440\u0443\u0437\u043a\u0438</div></div>" +');
  js.push('    "<div style=\\"flex:1;min-width:140px;background:var(--s2);border-radius:8px;padding:12px\\"><div style=\\"font-size:11px;color:var(--sub);text-transform:uppercase\\">SKU \u0432 \u043f\u043b\u0430\u043d\u0435</div><div style=\\"font-size:22px;font-weight:700;margin-top:4px\\">" + k.skuCount + "</div><div style=\\"font-size:11px;color:var(--sub);margin-top:2px\\">\u043d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0439</div></div>" +');
  js.push('    "</div>";');
  js.push('');
  js.push('  // ── SKU-отчёт: сводная таблица по каждому товару ──');
  js.push('  var skuReport = res.skuReport || [];');
  js.push('  if (skuReport.length) {');
  js.push('    h += "<div style=\\"margin-bottom:20px\\" id=\\"skuReportBlock\\">";');
  js.push('    h += "<div style=\\"display:flex;justify-content:space-between;align-items:center;margin-bottom:10px\\">" +');
  js.push('      "<div style=\\"font-weight:700;font-size:15px\\">📊 \u0421\u0432\u043e\u0434\u043a\u0430 \u043f\u043e SKU</div>" +');
  js.push('      "<button class=\\"btn bs\\" style=\\"padding:5px 12px;font-size:13px\\" onclick=\\"openAddSkuMdl()\\">+ \u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c SKU</button>" +');
  js.push('      "</div>";');
  js.push('    h += "<div class=\\"tw\\"><table><thead><tr>" +');
  js.push('        "<th>\u0422\u043e\u0432\u0430\u0440</th>" +');
  js.push('        "<th style=\\"text-align:center\\">\u041e\u0442\u0433\u0440\u0443\u0437\u043a\u0430</th>" +');
  js.push('        "<th style=\\"text-align:right\\">\u0417\u0430\u043a\u0430\u0437\u0430\u043d\u043e</th>" +');
  js.push('        "<th style=\\"text-align:right;color:var(--ok)\\">\u041e\u0441\u0442\u0430\u0442\u043e\u043a \u0413\u041f</th>" +');
  js.push('        "<th style=\\"text-align:right\\">\u041d\u0443\u0436\u043d\u043e \u043f\u0440\u043e\u0438\u0437\u0432.</th>" +');
  js.push('        "<th style=\\"text-align:right\\">\u0420\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u043e</th>" +');
  js.push('        "<th style=\\"text-align:center\\">\u041d\u0435\u0445\u0432\u0430\u0442\u043a\u0430</th>" +');
  js.push('        "<th style=\\"text-align:center\\">\u041a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f \u043f\u0440\u043e\u0438\u0437\u0432.</th>" +');
  js.push('        "<th></th>" +');
  js.push('      "</tr></thead><tbody id=\\"skuTbody\\">";');
  js.push('    skuReport.forEach(function(s) {');
  js.push('      h += renderSkuRow(s);');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    h += "<div style=\\"display:flex;gap:10px;margin-top:10px\\">" +');
  js.push('      "<button class=\\"btn bs\\" onclick=\\"resetSkuAdjustments()\\">\u21ba \u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c</button>" +');
  js.push('      "<button class=\\"btn bp\\" style=\\"flex:1\\" onclick=\\"recalcWithAdjustments()\\">🔄 \u041f\u0435\u0440\u0435\u0440\u0430\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441 \u043f\u043e\u043f\u0440\u0430\u0432\u043a\u043e\u0439</button>" +');
  js.push('      "</div>";');
  js.push('    h += "</div>";');
  js.push('  }');
  js.push('');
  js.push('  if (res.deadlineIssues && res.deadlineIssues.length) {');
  js.push('    h += "<div style=\\"margin-bottom:16px;padding:12px;background:rgba(239,83,80,.1);border-radius:8px\\">" +');
  js.push('      "<div style=\\"font-weight:600;color:var(--err);margin-bottom:6px\\">⏰ \u043d\u0435 \u0443\u0441\u043f\u0435\u0432\u0430\u0435\u043c \u043a \u0434\u0435\u0434\u043b\u0430\u0439\u043d\u0443</div>";');
  js.push('    res.deadlineIssues.forEach(function(d) { h += "<div style=\\"font-size:13px\\">" + d.product + " — \u043d\u0443\u0436\u043d\u043e \u043a " + d.shipDate + ", \u0433\u043e\u0442\u043e\u0432\u043e \u0431\u0443\u0434\u0435\u0442 \u043b\u0438\u0448\u044c " + d.planDate + "</div>"; });');
  js.push('    h += "</div>";');
  js.push('  }');
  js.push('');
  js.push('  h += "<div class=\\"tw\\"><table><thead><tr><th style=\\"position:sticky;left:0;background:var(--s2);z-index:2\\">\u041b\u0438\u043d\u0438\u044f / \u0441\u043c\u0435\u043d\u0430</th>";');
  js.push('  res.horizon.forEach(function(d) { h += "<th style=\\"text-align:center;min-width:160px\\">" + d + "</th>"; });');
  js.push('  h += "</tr></thead><tbody>";');
  js.push('');
  js.push('  rowKeys.forEach(function(rk) {');
  js.push('    h += "<tr><td style=\\"position:sticky;left:0;background:var(--s1);font-weight:600;white-space:nowrap;z-index:1\\">" + rk.liniya + " / " + rk.smena + "</td>";');
  js.push('    res.horizon.forEach(function(dateStr) {');
  js.push('      var key = rk.liniya + "|" + rk.smena + "|" + dateStr;');
  js.push('      var slot = res.capacityByLine[key];');
  js.push('      var cellItems = res.items.filter(function(it){ return it.liniya===rk.liniya && it.smena===rk.smena && it.date===dateStr; });');
  js.push('      var usedHours = slot ? slot.usedHours : 0;');
  js.push('      var totalHours = slot ? slot.totalHours : 0;');
  js.push('      var pct = totalHours>0 ? Math.round(usedHours/totalHours*100) : 0;');
  js.push('      var hasOverload = cellItems.some(function(it){return it.overloaded;});');
  js.push('      var cellBg = "rgba(255,255,255,.02)";');
  js.push('      if (totalHours===0) cellBg = "rgba(255,255,255,.03)";');
  js.push('      else if (hasOverload || pct>100) cellBg = "rgba(239,83,80,.12)";');
  js.push('      else if (pct>=80) cellBg = "rgba(102,187,106,.12)";');
  js.push('      else if (pct>0) cellBg = "rgba(249,168,37,.10)";');
  js.push('      h += "<td style=\\"vertical-align:top;background:" + cellBg + ";padding:8px;font-size:12px\\">";');
  js.push('      if (totalHours===0) {');
  js.push('        h += "<div style=\\"color:var(--sub);text-align:center\\">\u043d\u0435 \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442</div>";');
  js.push('      } else {');
  js.push('        var cellId = "cell_" + rk.liniya.replace(/[^a-zA-Z0-9]/g,"_") + "_" + rk.smena + "_" + dateStr.replace(/\\./g,"_");');
  js.push('        h += "<div class=\\"dist-cell-hours\\" id=\\"" + cellId + "_hours\\" style=\\"font-weight:600;margin-bottom:4px;" + (hasOverload?"color:var(--err)":"") + "\\">" + usedHours.toFixed(1) + " / " + totalHours.toFixed(1) + " \u0447 (" + pct + "%)</div>";');
  js.push('        h += "<div class=\\"dist-cell-load\\" id=\\"" + cellId + "_bar\\" style=\\"height:3px;border-radius:2px;margin-bottom:6px;background:rgba(255,255,255,.08);overflow:hidden\\"><div style=\\"height:100%;width:" + pct + "%;background:" + (pct>=100?"var(--err)":pct>75?"var(--warn)":"var(--ok)") + "\\"></div></div>";');
  js.push('        if (cellItems.length === 0 && pct === 0 && res.lineDiag && res.lineDiag[rk.liniya]) {');
  js.push('          h += "<div style=\\"font-size:11px;color:var(--warn);margin-top:2px\\">⚠ " + res.lineDiag[rk.liniya].join(" · ") + "</div>";');
  js.push('        }');
  js.push('        cellItems.forEach(function(it, iti) {');
  js.push('          var inpId = "dinp_" + it.liniya.replace(/[^a-zA-Z0-9]/g,"_") + "_" + it.smena + "_" + it.date.replace(/\\./g,"_") + "_" + it.product.replace(/[^a-zA-Z0-9]/g,"_");');
  js.push('          var hoursId = inpId + "_h";');
  js.push('          h += "<div style=\\"display:flex;justify-content:space-between;align-items:center;gap:4px;padding:2px 0;" + (it.overloaded?"color:var(--err)":"") + "\\">" +');
  js.push('            "<span style=\\"flex:1;font-size:12px\\">" + it.product + "</span>" +');
  js.push('            "<input type=\\"number\\" id=\\"" + inpId + "\\" value=\\"" + it.qty + "\\" min=\\"0\\"" +');
  js.push('              " data-speed=\\"" + (it.speed||0) + "\\" data-liniya=\\"" + it.liniya + "\\" data-smena=\\"" + it.smena + "\\" data-date=\\"" + it.date + "\\" data-product=\\"" + it.product.replace(/"/g,"&quot;") + "\\"" +');
  js.push('              " style=\\"width:64px;text-align:right;padding:2px 4px;font-size:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:4px;color:inherit\\"" +');
  js.push('              " oninput=\\"onDistQtyChange(this)\\" onblur=\\"onDistQtyChange(this)\\">" +');
  js.push('            "<button onclick=\\"removeDistItem(\'" + it.liniya.replace(/\'/g,\'\\\\\\\'\') + "\',\'" + it.smena + "\',\'" + it.date + "\',\'" + it.product.replace(/\'/g,\'\\\\\\\'\') + "\')\\"' +
            ' style=\\"padding:1px 5px;font-size:11px;border-radius:3px;background:rgba(239,83,80,.2);border:none;color:var(--err);cursor:pointer\\">✕</button>" +');
  js.push('            "<span id=\\"" + hoursId + "\\" style=\\"font-size:11px;color:var(--sub);min-width:34px;text-align:right\\">(" + it.hours.toFixed(1) + "\u0447)</span>" +');
  js.push('            "</div>";');
  js.push('        });');
  js.push('        // Кнопка "+ добавить продукт" в ячейке (только для рабочих смен)');
  js.push('        var cellAddId = "celladd_" + rk.liniya.replace(/[^a-zA-Z0-9]/g,"_") + "_" + rk.smena + "_" + dateStr.replace(/\\./g,"_");');
  js.push('        var freeH = totalHours > 0 ? Math.max(0, totalHours - usedHours) : 0;');
  js.push('        var escapedLiniya = rk.liniya.replace(/"/g,"&quot;");');
  js.push('        h += "<div id=\\"" + cellAddId + "_form\\" style=\\"display:none;margin-top:6px;border-top:1px dashed rgba(255,255,255,.1);padding-top:6px\\">";');
  js.push('        h += "<input id=\\"" + cellAddId + "_search\\" class=\\"fi\\" placeholder=\\"\u043f\u043e\u0438\u0441\u043a \u0442\u043e\u0432\u0430\u0440\u0430...\\" style=\\"padding:3px 6px;font-size:12px;margin-bottom:4px;width:100%;box-sizing:border-box\\" oninput=\\"filterCellProduct(this,\'" + cellAddId + "\')\\">";');
  js.push('        h += "<div id=\\"" + cellAddId + "_dd\\" style=\\"max-height:120px;overflow-y:auto;background:var(--s1);border:1px solid var(--bd);border-radius:4px;display:none;margin-bottom:4px\\"></div>";');
  js.push('        h += "<input type=\\"hidden\\" id=\\"" + cellAddId + "_prod\\">";');
  js.push('        h += "<div style=\\"display:flex;gap:4px\\">";');
  js.push('        h += "<input type=\\"number\\" id=\\"" + cellAddId + "_qty\\" placeholder=\\"\u043a\u043e\u043b-\u0432\u043e\\" min=\\"1\\" style=\\"flex:1;padding:3px 6px;font-size:12px\\" data-liniya=\\"" + escapedLiniya + "\\" data-smena=\\"" + rk.smena + "\\" data-date=\\"" + dateStr + "\\" data-avail=\\"" + freeH.toFixed(2) + "\\">";');
  js.push('        h += "<button class=\\"btn bp\\" style=\\"padding:3px 10px;font-size:12px\\" onclick=\\"confirmCellAdd(\'" + cellAddId + "\')\\">\u0414\u043e\u0431</button>";');
  js.push('        h += "<button class=\\"btn bs\\" style=\\"padding:3px 8px;font-size:12px\\" onclick=\\"openCellAdd(\'" + cellAddId + "\')\\">\u2715</button>";');
  js.push('        h += "</div></div>";');
  js.push('        h += "<button onclick=\\"openCellAdd(\'" + cellAddId + "\')\\" style=\\"margin-top:5px;width:100%;padding:4px;font-size:11px;background:rgba(249,168,37,.1);border:1px dashed rgba(249,168,37,.4);border-radius:4px;color:var(--g);cursor:pointer\\">+ \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043f\u0440\u043e\u0434\u0443\u043a\u0442</button>";');
  js.push('      }');
  js.push('      h += "</td>";');
  js.push('    });');
  js.push('    h += "</tr>";');
  js.push('  });');
  js.push('  h += "</tbody></table></div>";');
  js.push('');
  js.push('  if (res.unassigned.length) {');
  js.push('    h += "<div style=\\"margin-top:16px;padding:12px;background:rgba(239,83,80,.1);border-radius:8px\\">" +');
  js.push('      "<div style=\\"font-weight:600;color:var(--err);margin-bottom:6px\\">⚠ \u043d\u0435 \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u043e</div>";');
  js.push('    res.unassigned.forEach(function(u) {');
  js.push('      var hint = "";');
  js.push('      if (u.reason === "\u043d\u0435\u0442 \u043f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u0430") hint = " \u2014 \u0437\u0430\u0434\u0430\u0439\u0442\u0435 \u043f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442 \u043b\u0438\u043d\u0438\u0439 \u0432 \u00ab\u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u044b\u00bb";');
  js.push('      if (u.reason === "\u043d\u0435\u0442 \u0441\u043a\u043e\u0440\u043e\u0441\u0442\u0438 \u043d\u0430 \u043b\u0438\u043d\u0438\u0438") hint = " \u2014 \u0437\u0430\u0434\u0430\u0439\u0442\u0435 \u0441\u043a\u043e\u0440\u043e\u0441\u0442\u044c \u0432 \u00ab\u0421\u043a\u043e\u0440\u043e\u0441\u0442\u044c \u043b\u0438\u043d\u0438\u0439\u00bb";');
  js.push('      h += "<div style=\\"font-size:13px\\"><b>" + u.product + "</b> \u2014 " + u.qty + " \u0448\u0442 (" + u.reason + hint + ")</div>";');
  js.push('    });');
  js.push('    h += "</div>";');
  js.push('  }');
  js.push('');
  js.push('  h += "<button class=\\"btn bp\\" style=\\"width:100%;margin-top:16px;padding:14px\\" onclick=\\"approveDistribution()\\">✓ \u0443\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c \u0432\u0441\u0451</button>";');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('// ─── Редактирование кол-ва прямо в ячейке распределения — мгновенный пересчёт часов и загрузки');
  js.push('// ─── Добавление/удаление продукта прямо в ячейке ───────────');
  js.push('function openCellAdd(cellId) {');
  js.push('  var form = document.getElementById(cellId+"_form");');
  js.push('  var btn  = document.getElementById(cellId+"_btn");');
  js.push('  if (!form) return;');
  js.push('  var isOpen = form.style.display !== "none";');
  js.push('  form.style.display = isOpen ? "none" : "block";');
  js.push('  if (!isOpen) {');
  js.push('    var si = document.getElementById(cellId+"_search");');
  js.push('    if (si) { si.value=""; si.focus(); }');
  js.push('    document.getElementById(cellId+"_prod").value = "";');
  js.push('    var qi = document.getElementById(cellId+"_qty");');
  js.push('    if (qi) qi.value = "";');
  js.push('    // Загружаем список продуктов если ещё нет');
  js.push('    if (!addSkuAllProducts.length) {');
  js.push('      srv("spGetNorms", {}, function(res) {');
  js.push('        if (res.ok && res.norms) addSkuAllProducts = res.norms.map(function(n){ return n.product; }).sort();');
  js.push('      });');
  js.push('    }');
  js.push('  }');
  js.push('}');
  js.push('');

  js.push('function filterCellProduct(inp, cellId) {');
  js.push('  var dd = document.getElementById(cellId+"_dd");');
  js.push('  document.getElementById(cellId+"_prod").value = "";');
  js.push('  var q = inp.value.toLowerCase();');
  js.push('  if (!q) { dd.style.display = "none"; return; }');
  js.push('  var filtered = addSkuAllProducts.filter(function(p){ return p.toLowerCase().indexOf(q) !== -1; });');
  js.push('  if (!filtered.length) { dd.innerHTML = "<div style=\\"padding:6px 10px;font-size:12px;color:var(--sub)\\">\u043d\u0438\u0447\u0435\u0433\u043e</div>"; dd.style.display="block"; return; }');
  js.push('  dd.innerHTML = filtered.slice(0,8).map(function(p){');
  js.push('    return "<div style=\\"padding:5px 10px;cursor:pointer;font-size:12px\\"" +');
  js.push('      " onmousedown=\\"selectCellProduct(\'" + p.replace(/\'/g,\'\\\\\\\'\') + "\',\'" + cellId + "\')\\"" +');
  js.push('      " onmouseover=\\"this.style.background=\'var(--s2)\'\\" onmouseout=\\"this.style.background=\'\'\\\">" + p + "</div>";');
  js.push('  }).join("");');
  js.push('  dd.style.display = "block";');
  js.push('}');
  js.push('');

  js.push('function selectCellProduct(product, cellId) {');
  js.push('  document.getElementById(cellId+"_search").value = product;');
  js.push('  document.getElementById(cellId+"_prod").value = product;');
  js.push('  document.getElementById(cellId+"_dd").style.display = "none";');
  js.push('  var qi = document.getElementById(cellId+"_qty");');
  js.push('  if (qi) qi.focus();');
  js.push('}');
  js.push('');

  js.push('var cellSpeedCache = {}; // liniya|product -> speed, заполняется при первом запросе');
  js.push('');
  js.push('function confirmCellAdd(cellId) {');
  js.push('  // Берём продукт из скрытого поля (выбор из списка) или из поля поиска (прямой ввод)');
  js.push('  var hiddenProd = document.getElementById(cellId+"_prod");');
  js.push('  var searchInp  = document.getElementById(cellId+"_search");');
  js.push('  var product = ((hiddenProd && hiddenProd.value) || (searchInp && searchInp.value) || "").trim();');
  js.push('  var qtyEl   = document.getElementById(cellId+"_qty");');
  js.push('  var qty     = parseInt(qtyEl.value) || 0;');
  js.push('  if (!product) { toast("\u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u0440\u043e\u0434\u0443\u043a\u0442 \u0438\u0437 \u0441\u043f\u0438\u0441\u043a\u0430","err"); return; }');
  js.push('  if (qty <= 0)  { toast("\u0443\u043a\u0430\u0436\u0438\u0442\u0435 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e > 0","err"); return; }');
  js.push('  var qd = qtyEl.dataset;');
  js.push('  var liniya = qd.liniya, smena = qd.smena, date = qd.date;');
  js.push('  var availH = parseFloat(qd.avail) || 0;');
  js.push('  // Берём скорость из уже распределённых items (если такой продукт+линия уже был)');
  js.push('  var speed = 0;');
  js.push('  var cacheKey = liniya + "|" + product;');
  js.push('  if (cellSpeedCache[cacheKey]) {');
  js.push('    speed = cellSpeedCache[cacheKey];');
  js.push('    doAddToCell(product, qty, speed, liniya, smena, date, availH, cellId);');
  js.push('  } else {');
  js.push('    // Ищем скорость в уже существующих items');
  js.push('    for (var i=0; i<distributionDraft.items.length; i++) {');
  js.push('      var it = distributionDraft.items[i];');
  js.push('      if (it.liniya === liniya && it.product === product && it.speed > 0) {');
  js.push('        speed = it.speed; break;');
  js.push('      }');
  js.push('    }');
  js.push('    if (speed > 0) {');
  js.push('      cellSpeedCache[cacheKey] = speed;');
  js.push('      doAddToCell(product, qty, speed, liniya, smena, date, availH, cellId);');
  js.push('    } else {');
  js.push('      // Запрашиваем скорость с сервера один раз и кэшируем');
  js.push('      srv("getProductSpeed", {payload:{product:product, liniya:liniya}}, function(res) {');
  js.push('        var spd = (res && res.speed) || 0;');
  js.push('        if (spd > 0) cellSpeedCache[cacheKey] = spd;');
  js.push('        doAddToCell(product, qty, spd, liniya, smena, date, availH, cellId);');
  js.push('      });');
  js.push('    }');
  js.push('  }');
  js.push('}');
  js.push('');

  js.push('function doAddToCell(product, qty, speed, liniya, smena, date, availH, cellId) {');
  js.push('  var hours = speed > 0 ? Math.round(qty / speed * 100) / 100 : 0;');
  js.push('  var key = liniya+"|"+smena+"|"+date;');
  js.push('  // Добавляем или обновляем в distributionDraft.items');
  js.push('  var found = false;');
  js.push('  for (var i=0; i<distributionDraft.items.length; i++) {');
  js.push('    var it = distributionDraft.items[i];');
  js.push('    if (it.liniya===liniya && it.smena===smena && it.date===date && it.product===product) {');
  js.push('      it.qty += qty; it.hours += hours; found = true; break;');
  js.push('    }');
  js.push('  }');
  js.push('  if (!found) {');
  js.push('    distributionDraft.items.push({product:product, qty:qty, hours:hours, liniya:liniya, smena:smena, date:date, speed:speed, overloaded:false});');
  js.push('  }');
  js.push('  // Обновляем usedHours в capacityByLine');
  js.push('  if (!distributionDraft.capacityByLine) distributionDraft.capacityByLine = {};');
  js.push('  if (!distributionDraft.capacityByLine[key]) {');
  js.push('    distributionDraft.capacityByLine[key] = {totalHours:availH, usedHours:0, liniya:liniya, smena:smena, date:date};');
  js.push('  }');
  js.push('  distributionDraft.capacityByLine[key].usedHours += hours;');
  js.push('  // Перерисовываем таблицу');
  js.push('  renderDistribution();');
  js.push('  toast(product + " \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d (" + qty + " \u0448\u0442)", "ok");');
  js.push('}');
  js.push('');

  js.push('function removeDistItem(liniya, smena, date, product) {');
  js.push('  if (!distributionDraft || !distributionDraft.items) return;');
  js.push('  var removed = null;');
  js.push('  distributionDraft.items = distributionDraft.items.filter(function(it){');
  js.push('    if (it.liniya===liniya&&it.smena===smena&&it.date===date&&it.product===product){removed=it;return false;}');
  js.push('    return true;');
  js.push('  });');
  js.push('  if (removed) {');
  js.push('    var key = liniya+"|"+smena+"|"+date;');
  js.push('    var cap = distributionDraft.capacityByLine && distributionDraft.capacityByLine[key];');
  js.push('    if (cap) cap.usedHours = Math.max(0, cap.usedHours - (removed.hours||0));');
  js.push('    renderDistribution();');
  js.push('    toast(product + " \u0443\u0434\u0430\u043b\u0451\u043d","ok");');
  js.push('  }');
  js.push('}');
  js.push('');

  js.push('function onDistQtyChange(inp) {');
  js.push('  var qty = Math.max(0, parseInt(inp.value) || 0); inp.value = qty;');
  js.push('  var speed = parseFloat(inp.dataset.speed) || 0;');
  js.push('  var liniya = inp.dataset.liniya, smena = inp.dataset.smena, date = inp.dataset.date, product = inp.dataset.product;');
  js.push('  if (!liniya || !smena || !date || !product) return;');
  js.push('  var newHours = speed > 0 ? qty / speed : 0;');
  js.push('  // Обновляем distributionDraft');
  js.push('  for (var i = 0; i < distributionDraft.items.length; i++) {');
  js.push('    var it = distributionDraft.items[i];');
  js.push('    if (it.liniya===liniya && it.smena===smena && it.date===date && it.product===product) { it.qty=qty; it.hours=newHours; break; }');
  js.push('  }');
  js.push('  // Обновляем часы рядом с полем');
  js.push('  var hoursEl = document.getElementById(inp.id + "_h"); if (hoursEl) hoursEl.textContent = "(" + newHours.toFixed(1) + "\u0447)";');
  js.push('  // Пересчитываем загрузку ячейки');
  js.push('  var cellItems = distributionDraft.items.filter(function(it){ return it.liniya===liniya && it.smena===smena && it.date===date; });');
  js.push('  var usedH = cellItems.reduce(function(s,it){ return s + (it.speed>0 ? it.qty/it.speed : it.hours||0); }, 0);');
  js.push('  var cap = distributionDraft.capacityByLine && distributionDraft.capacityByLine[liniya+"|"+smena+"|"+date];');
  js.push('  var totalH = cap ? cap.totalHours : 0;');
  js.push('  var pct = totalH > 0 ? Math.round(usedH / totalH * 100) : 0;');
  js.push('  var cellId = "cell_" + liniya.replace(/[^a-zA-Z0-9]/g,"_") + "_" + smena + "_" + date.replace(/\\./g,"_");');
  js.push('  var hDiv = document.getElementById(cellId+"_hours");');
  js.push('  if (hDiv) { hDiv.textContent = usedH.toFixed(1)+" / "+totalH.toFixed(1)+" \u0447 ("+pct+"%)"; hDiv.style.color = pct>100?"var(--err)":""; }');
  js.push('  var bEl = document.getElementById(cellId+"_bar");');
  js.push('  if (bEl) { var c=pct>=100?"var(--err)":pct>75?"var(--warn)":"var(--ok)"; bEl.innerHTML="<div style=\\"height:100%;width:"+Math.min(100,pct)+"%;background:"+c+"\\">"; }');
  js.push('  inp.style.borderColor = pct>100?"var(--err)":pct>0?"var(--ok)":"";');
  js.push('}');
  js.push('');

  js.push('// ── Хелпер: сгенерировать HTML строки SKU для tbody ──────');
  js.push('function renderSkuRow(s) {');
  js.push('  var shortColor = s.shortfall > 0 ? "color:var(--err);font-weight:700" : "color:var(--sub)";');
  js.push('  var rowBg = s.shortfall > 0 ? "background:rgba(239,83,80,.06)" : "";');
  js.push('  var safeId = "sku_" + s.product.replace(/[^a-zA-Z0-9]/g,"_");');
  js.push('  return "<tr id=\\"skurow_" + safeId + "\\" style=\\"" + rowBg + "\\">" +');
  js.push('    "<td style=\\"font-weight:600\\">" + s.product + "</td>" +');
  js.push('    "<td style=\\"text-align:center;font-size:12px;color:var(--sub)\\">" + (s.shipDate||"\u2014") + "</td>" +');
  js.push('    "<td style=\\"text-align:right\\">" + s.ordered + "</td>" +');
  js.push('    "<td style=\\"text-align:right;color:var(--ok)\\">" + s.gpStock + "</td>" +');
  js.push('    "<td style=\\"text-align:right;color:var(--warn)\\">" + s.needToProduce + "</td>" +');
  js.push('    "<td style=\\"text-align:right;color:var(--ok)\\">" + s.planned + (s.overloaded>0?"<span style=\\"color:var(--err);font-size:11px\\"> +"+s.overloaded+"⚠</span>":"") + "</td>" +');
  js.push('    "<td style=\\"text-align:center;" + shortColor + "\\">" + (s.shortfall>0?"\u2212"+s.shortfall:"\u2714") + "</td>" +');
  js.push('    "<td style=\\"text-align:center\\">" +');
  js.push('      "<div style=\\"display:flex;gap:4px;justify-content:center;align-items:center\\">" +');
  js.push('        "<button class=\\"btn bs\\" style=\\"padding:2px 8px;font-size:16px;line-height:1\\" onclick=\\"adjustSkuQty(\'" + safeId + "\',-1)\\">−</button>" +');
  js.push('        "<input type=\\"number\\" id=\\"" + safeId + "\\" class=\\"fi\\" value=\\"" + s.needToProduce + "\\"" +');
  js.push('          " style=\\"width:80px;text-align:center;padding:4px\\" min=\\"0\\">" +');
  js.push('        "<button class=\\"btn bs\\" style=\\"padding:2px 8px;font-size:16px;line-height:1\\" onclick=\\"adjustSkuQty(\'" + safeId + "\',1)\\">+</button>" +');
  js.push('      "</div></td>" +');
  js.push('    "<td style=\\"text-align:center\\">" +');
  js.push('      "<button class=\\"btn bd\\" style=\\"padding:2px 8px;font-size:12px\\" onclick=\\"removeSkuRow(\'" + s.product.replace(/\'/g,\'\\\\\\\'\') + "\')\\">✕</button>" +');
  js.push('    "</td></tr>";');
  js.push('}');
  js.push('');

  js.push('function removeSkuRow(product) {');
  js.push('  // Удаляем из skuReport в distributionDraft');
  js.push('  if (distributionDraft && distributionDraft.skuReport) {');
  js.push('    distributionDraft.skuReport = distributionDraft.skuReport.filter(function(s){ return s.product !== product; });');
  js.push('  }');
  js.push('  var safeId = "sku_" + product.replace(/[^a-zA-Z0-9]/g,"_");');
  js.push('  var row = document.getElementById("skurow_" + safeId);');
  js.push('  if (row) row.remove();');
  js.push('}');
  js.push('');

  js.push('var addSkuAllProducts = [];');
  js.push('function openAddSkuMdl() {');
  js.push('  document.getElementById("addSkuSearch").value = "";');
  js.push('  document.getElementById("addSkuName").value = "";');
  js.push('  document.getElementById("addSkuQty").value = "";');
  js.push('  document.getElementById("addSkuDropdown").style.display = "none";');
  js.push('  if (addSkuAllProducts.length) { showMdl("mdlAddSku"); return; }');
  js.push('  srv("spGetNorms", {}, function(res) {');
  js.push('    if (res.ok && res.norms) addSkuAllProducts = res.norms.map(function(n){ return n.product; }).sort();');
  js.push('    showMdl("mdlAddSku");');
  js.push('  });');
  js.push('}');
  js.push('function filterAddSkuList(query) {');
  js.push('  var dd = document.getElementById("addSkuDropdown");');
  js.push('  document.getElementById("addSkuName").value = "";');
  js.push('  if (!query.trim()) { dd.style.display = "none"; return; }');
  js.push('  var q = query.toLowerCase();');
  js.push('  var used = (distributionDraft && distributionDraft.skuReport) ? distributionDraft.skuReport.map(function(s){return s.product;}) : [];');
  js.push('  var filtered = addSkuAllProducts.filter(function(p){ return p.toLowerCase().indexOf(q) !== -1 && used.indexOf(p) === -1; });');
  js.push('  if (!filtered.length) {');
  js.push('    dd.innerHTML = "<div style=\\\"padding:10px;color:var(--sub);font-size:13px\\\">\u043d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e</div>";');
  js.push('    dd.style.display = "block"; return;');
  js.push('  }');
  js.push('  var rows = "";');
  js.push('  filtered.forEach(function(p) {');
  js.push('    rows += "<div class=\\\"sku-opt\\\" onclick=\\\"selectAddSkuProduct(this.textContent)\\\" style=\\\"padding:9px 14px;cursor:pointer;font-size:14px\\\">" + p + "</div>";');
  js.push('  });');
  js.push('  dd.innerHTML = rows;');
  js.push('  dd.style.display = "block";');
  js.push('}');
  js.push('function selectAddSkuProduct(product) {');
  js.push('  document.getElementById("addSkuSearch").value = product;');
  js.push('  document.getElementById("addSkuName").value = product;');
  js.push('  document.getElementById("addSkuDropdown").style.display = "none";');
  js.push('  document.getElementById("addSkuQty").focus();');
  js.push('}');
  js.push('');

  js.push('function confirmAddSku() {');
  js.push('  var product = (document.getElementById("addSkuName").value||"").trim();');
  js.push('  var qty = parseInt(document.getElementById("addSkuQty").value)||0;');
  js.push('  if (!product) { toast("\u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0442\u043e\u0432\u0430\u0440\u0430","err"); return; }');
  js.push('  if (qty <= 0) { toast("\u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e > 0","err"); return; }');
  js.push('  // Проверим нет ли уже такого SKU');
  js.push('  var existing = distributionDraft.skuReport && distributionDraft.skuReport.find(function(s){ return s.product===product; });');
  js.push('  if (existing) { toast("\u0442\u043e\u0432\u0430\u0440 \u0443\u0436\u0435 \u0435\u0441\u0442\u044c \u0432 \u0441\u043f\u0438\u0441\u043a\u0435","err"); return; }');
  js.push('  var gpStock = (distributionDraft.gpStock||{})[product]||0;');
  js.push('  var newItem = {product:product, ordered:qty, gpStock:gpStock, needToProduce:Math.max(0,qty-gpStock), planned:0, overloaded:0, shipDate:null, shortfall:Math.max(0,qty-gpStock)};');
  js.push('  if (!distributionDraft.skuReport) distributionDraft.skuReport = [];');
  js.push('  distributionDraft.skuReport.push(newItem);');
  js.push('  // Добавляем строку в tbody');
  js.push('  var tbody = document.getElementById("skuTbody");');
  js.push('  if (tbody) { var tr = document.createElement("tbody"); tr.innerHTML = renderSkuRow(newItem); tbody.appendChild(tr.firstChild); }');
  js.push('  closeMdl("mdlAddSku");');
  js.push('  toast("\u0442\u043e\u0432\u0430\u0440 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d","ok");');
  js.push('}');
  js.push('');

  js.push('function adjustSkuQty(safeId, delta) {');
  js.push('  var inp = document.getElementById(safeId);');
  js.push('  if (!inp) return;');
  js.push('  var val = Math.max(0, (parseInt(inp.value) || 0) + delta);');
  js.push('  inp.value = val;');
  js.push('  inp.style.borderColor = "var(--warn)";');
  js.push('}');
  js.push('');

  js.push('function resetSkuAdjustments() {');
  js.push('  var skuReport = distributionDraft && distributionDraft.skuReport || [];');
  js.push('  skuReport.forEach(function(s) {');
  js.push('    var safeId = "sku_" + s.product.replace(/[^a-zA-Z0-9]/g,"_");');
  js.push('    var inp = document.getElementById(safeId);');
  js.push('    if (inp) { inp.value = s.needToProduce; inp.style.borderColor = ""; }');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function recalcWithAdjustments() {');
  js.push('  var skuReport = distributionDraft && distributionDraft.skuReport || [];');
  js.push('  var adjustedItems = [];');
  js.push('  skuReport.forEach(function(s) {');
  js.push('    var safeId = "sku_" + s.product.replace(/[^a-zA-Z0-9]/g,"_");');
  js.push('    var inp = document.getElementById(safeId);');
  js.push('    var qty = inp ? (parseInt(inp.value) || 0) : s.needToProduce;');
  js.push('    if (qty > 0) adjustedItems.push({product: s.product, qty: qty});');
  js.push('  });');
  js.push('  if (!adjustedItems.length) { toast("\u043d\u0435\u0442 \u043f\u043e\u0437\u0438\u0446\u0438\u0439 \u0434\u043b\u044f \u0440\u0430\u0441\u0447\u0451\u0442\u0430","err"); return; }');
  js.push('  document.getElementById("distributionCont").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("zpBuildDistributionManual", {payload:{items:adjustedItems}}, function(res) {');
  js.push('    if (!res || !res.ok) {');
  js.push('      var errMsg = (res && res.error) || "\u041d\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043d\u0430\u044f \u043e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430";');
  js.push('      document.getElementById("distributionCont").innerHTML =');
  js.push('        "<div style=\\"padding:20px;background:rgba(239,83,80,.1);border-radius:8px\\">" +');
  js.push('        "<div style=\\"font-weight:700;color:var(--err);margin-bottom:8px\\">❌ \u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0435\u0440\u0435\u0440\u0430\u0441\u0447\u0451\u0442\u0430</div>" +');
  js.push('        "<div style=\\"font-size:14px\\">" + errMsg + "</div>" +');
  js.push('        "<button class=\\"btn bs\\" style=\\"margin-top:12px\\" onclick=\\"renderDistribution()\\">\u2190 \u0412\u0435\u0440\u043d\u0443\u0442\u044c\u0441\u044f</button>" +');
  js.push('        "</div>";');
  js.push('      toast(errMsg, "err");');
  js.push('      return;');
  js.push('    }');
  js.push('    distributionDraft = res;');
  js.push('    distFilterLine = "";');
  js.push('    renderDistribution();');
  js.push('    toast("\u043f\u0435\u0440\u0435\u0440\u0430\u0441\u0447\u0438\u0442\u0430\u043d\u043e \u0441 \u043f\u043e\u043f\u0440\u0430\u0432\u043a\u043e\u0439","ok");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function approveDistribution() {');
  js.push('  if (!confirm("\u0443\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u043d\u043e\u0435 \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u043d\u0430 \u0432\u0435\u0441\u044c \u0433\u043e\u0440\u0438\u0437\u043e\u043d\u0442?")) return;');
  js.push('  var items = distributionDraft.items.map(function(d) { return {product:d.product, qty:d.qty, liniya:d.liniya, smena:d.smena, date:d.date}; });');
  js.push('  srv("zpApproveDistribution", {payload:{items:items}}, function(res) {');
  js.push('    if (res.ok) { toast("\u0443\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u043e: " + res.count,"ok"); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('// ── \u0431\u0440\u0438\u0433\u0430\u0434\u0438\u0440: \u043f\u043b\u0430\u043d \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u0430 \u043d\u0430 \u0441\u043c\u0435\u043d\u0443 ──');
  js.push('function loadProductionPlan() {');
  js.push('  document.getElementById("prodPlanCont").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("brigGetProductionPlan", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); document.getElementById("prodPlanCont").innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">" + res.error + "</div></div>"; return; }');
  js.push('    var el = document.getElementById("prodPlanCont");');
  js.push('    if (!res.plan.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">📦</div><div class=\\"empty-t\\">\u043f\u043b\u0430\u043d \u0435\u0449\u0451 \u043d\u0435 \u0443\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d</div></div>"; return; }');
  js.push('    var h = "<div class=\\"tw\\"><table><thead><tr><th>\u041f\u0440\u043e\u0434\u0443\u043a\u0442</th><th>\u041a\u043e\u043b-\u0432\u043e</th></tr></thead><tbody>";');
  js.push('    res.plan.forEach(function(p) { h += "<tr><td style=\\"font-weight:600\\">" + p.product + "</td><td>" + p.qty + " \u0448\u0442</td></tr>"; });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('');
  js.push('// ════════════ \u0417\u0410\u0412\u0421\u041a\u041b\u0410\u0414 \u0421\u044b\u0440\u044c\u044f ════════════');
  js.push('var materialsList = [];');
  js.push('var activeMaterialsList = [];');
  js.push('');

  js.push('// ── \u0410\u0434\u043c\u0438\u043d: \u043d\u043e\u043c\u0435\u043d\u043a\u043b\u0430\u0442\u0443\u0440\u0430 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u043e\u0432 ──');
  js.push('function loadMaterials() {');
  js.push('  document.getElementById("materialsCont").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("adminGetMaterials", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    materialsList = res.materials;');
  js.push('    renderMaterials();');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderMaterials() {');
  js.push('  var el = document.getElementById("materialsCont");');
  js.push('  if (!materialsList.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">🧱</div><div class=\\"empty-t\\">\u0441\u043f\u0438\u0441\u043e\u043a \u043f\u0443\u0441\u0442</div></div>"; return; }');
  js.push('  var h = "<div class=\\"tw\\"><table><thead><tr><th>\u041d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435</th><th>\u0415\u0434.\u0438\u0437\u043c.</th><th>\u0426\u0435\u043d\u0430</th><th>\u0421\u0442\u0430\u0442\u0443\u0441</th><th></th></tr></thead><tbody>";');
  js.push('  materialsList.forEach(function(m, idx) {');
  js.push('    h += "<tr><td style=\\"font-weight:600\\">" + m.name + "</td><td>" + m.unit + "</td><td>" + m.price + "</td>" +');
  js.push('      "<td><span class=\\"badge " + (m.active?"bg":"br") + "\\">" + (m.active?"\u0430\u043a\u0442\u0438\u0432\u0435\u043d":"\u043e\u0442\u043a\u043b\u044e\u0447\u0435\u043d") + "</span></td>" +');
  js.push('      "<td><button class=\\"btn bs\\" style=\\"padding:6px 10px\\" onclick=\\"editMaterial(" + idx + ")\\">✏️</button> <button class=\\"btn bs\\" style=\\"padding:6px 10px\\" onclick=\\"deleteMaterial(\'" + m.id + "\')\\">🗑️</button></td></tr>";');
  js.push('  });');
  js.push('  h += "</tbody></table></div>";');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('function openMaterialMdl() {');
  js.push('  document.getElementById("matName").value = "";');
  js.push('  document.getElementById("matUnit").value = "";');
  js.push('  document.getElementById("matPrice").value = "";');
  js.push('  document.getElementById("matName").dataset.id = "";');
  js.push('  showMdl("mdlMaterial");');
  js.push('}');
  js.push('');

  js.push('function editMaterial(idx) {');
  js.push('  var m = materialsList[idx];');
  js.push('  document.getElementById("matName").value = m.name;');
  js.push('  document.getElementById("matUnit").value = m.unit;');
  js.push('  document.getElementById("matPrice").value = m.price;');
  js.push('  document.getElementById("matName").dataset.id = m.id;');
  js.push('  showMdl("mdlMaterial");');
  js.push('}');
  js.push('');

  js.push('function saveMaterial() {');
  js.push('  var id = document.getElementById("matName").dataset.id || "";');
  js.push('  var p = {id:id, name:document.getElementById("matName").value.trim(), unit:document.getElementById("matUnit").value.trim(), price:document.getElementById("matPrice").value, active:true};');
  js.push('  if (!p.name || !p.unit) { toast("\u0437\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u043d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435 \u0438 \u0435\u0434.\u0438\u0437\u043c.","err"); return; }');
  js.push('  srv("adminSaveMaterial", {payload:p}, function(res) {');
  js.push('    if (res.ok) { toast("\u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e!","ok"); closeMdl("mdlMaterial"); loadMaterials(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function deleteMaterial(id) {');
  js.push('  if (!confirm("\u0443\u0434\u0430\u043b\u0438\u0442\u044c \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b?")) return;');
  js.push('  srv("adminDeleteMaterial", {payload:{id:id}}, function(res) {');
  js.push('    if (res.ok) { toast("\u0443\u0434\u0430\u043b\u0435\u043d\u043e","ok"); loadMaterials(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('// ── \u0410\u0434\u043c\u0438\u043d: \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u0438 ──');
  js.push('var suppliersList = [];');
  js.push('function loadSuppliers() {');
  js.push('  document.getElementById("suppliersCont").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("adminGetSuppliers", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    suppliersList = res.suppliers;');
  js.push('    renderSuppliers();');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderSuppliers() {');
  js.push('  var el = document.getElementById("suppliersCont");');
  js.push('  if (!suppliersList.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">🚚</div><div class=\\"empty-t\\">\u0441\u043f\u0438\u0441\u043e\u043a \u043f\u0443\u0441\u0442</div></div>"; return; }');
  js.push('  var h = "<div class=\\"tw\\"><table><thead><tr><th>\u041d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435</th><th></th></tr></thead><tbody>";');
  js.push('  suppliersList.forEach(function(s, idx) {');
  js.push('    h += "<tr><td style=\\"font-weight:600\\">" + s.name + "</td>" +');
  js.push('      "<td><button class=\\"btn bs\\" style=\\"padding:6px 10px\\" onclick=\\"editSupplier(" + idx + ")\\">✏️</button> <button class=\\"btn bs\\" style=\\"padding:6px 10px\\" onclick=\\"deleteSupplier(\'" + s.id + "\')\\">🗑️</button></td></tr>";');
  js.push('  });');
  js.push('  h += "</tbody></table></div>";');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('function openSupplierMdl() {');
  js.push('  document.getElementById("supName").value = "";');
  js.push('  document.getElementById("supName").dataset.id = "";');
  js.push('  showMdl("mdlSupplier");');
  js.push('}');
  js.push('');

  js.push('function editSupplier(idx) {');
  js.push('  var s = suppliersList[idx];');
  js.push('  document.getElementById("supName").value = s.name;');
  js.push('  document.getElementById("supName").dataset.id = s.id;');
  js.push('  showMdl("mdlSupplier");');
  js.push('}');
  js.push('');

  js.push('function saveSupplier() {');
  js.push('  var id = document.getElementById("supName").dataset.id || "";');
  js.push('  var name = document.getElementById("supName").value.trim();');
  js.push('  if (!name) { toast("\u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435","err"); return; }');
  js.push('  srv("adminSaveSupplier", {payload:{id:id, name:name}}, function(res) {');
  js.push('    if (res.ok) { toast("\u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e!","ok"); closeMdl("mdlSupplier"); loadSuppliers(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function deleteSupplier(id) {');
  js.push('  if (!confirm("\u0443\u0434\u0430\u043b\u0438\u0442\u044c \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u0430?")) return;');
  js.push('  srv("adminDeleteSupplier", {payload:{id:id}}, function(res) {');
  js.push('    if (res.ok) { toast("\u0443\u0434\u0430\u043b\u0435\u043d\u043e","ok"); loadSuppliers(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('// ── \u0437\u0430\u0432\u0441\u043a\u043b\u0430\u0434 \u0441\u044b\u0440\u044c\u044f: \u043f\u0440\u0438\u0445\u043e\u0434 \u043e\u0442 \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u0430 ──');
  js.push('function loadIncoming() {');
  js.push('  document.getElementById("incomingCont").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("skladGetIncoming", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    var el = document.getElementById("incomingCont");');
  js.push('    if (!res.list.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">📥</div><div class=\\"empty-t\\">\u043f\u043e\u043a\u0430 \u043d\u0435\u0442 \u043f\u0440\u0438\u0445\u043e\u0434\u043e\u0432</div></div>"; return; }');
  js.push('    var h = "";');
  js.push('    var groupId = "inDoc";');
  js.push('    res.list.forEach(function(doc, idx) {');
  js.push('      var itemId = groupId + "-" + idx;');
  js.push('      var itemsHtml = doc.items.map(function(it){');
  js.push('        return "<div style=\\"display:flex;justify-content:space-between;padding:4px 0;font-size:13px\\">" +');
  js.push('          "<span>" + it.material + "</span>" +');
  js.push('          "<span style=\\"color:var(--sub)\\">" + it.qty + (it.price ? (" \u00d7 " + it.price + " = " + it.sum) : "") + "</span></div>";');
  js.push('      }).join("");');
  js.push('      h += "<div style=\\"background:var(--s2);border-radius:8px;margin-bottom:8px;overflow:hidden\\">" +');
  js.push('        "<div style=\\"display:flex;justify-content:space-between;align-items:center;padding:12px 14px;cursor:pointer\\" onclick=\\"toggleAcc(\'" + groupId + "\',\'" + itemId + "\')\\">" +');
  js.push('          "<div style=\\"display:flex;gap:10px;align-items:center;flex-wrap:wrap\\">" +');
  js.push('            "<span style=\\"color:var(--sub);font-size:13px\\">" + doc.date + "</span>" +');
  js.push('            "<span style=\\"font-weight:700\\">" + doc.items.length + " \u043f\u043e\u0437.</span>" +');
  js.push('            "<span style=\\"font-size:13px\\">" + (doc.supplier||"\u2014") + "</span>" +');
  js.push('            "<span style=\\"font-size:12px;color:var(--sub)\\">\u043d\u0430\u043a\u043b. " + (doc.invoiceNo||"\u2014") + "</span>" +');
  js.push('            "<span style=\\"font-weight:600\\">" + doc.sum + "</span></div>" +');
  js.push('          "<span id=\\"" + itemId + "-ico\\" data-accico=\\"" + groupId + "\\" style=\\"font-size:20px;color:var(--sub);font-weight:300;min-width:20px;text-align:center\\">+</span></div>" +');
  js.push('        "<div id=\\"" + itemId + "-body\\" data-accgroup=\\"" + groupId + "\\" style=\\"display:none;padding:0 14px 14px 14px;border-top:1px solid var(--bd)\\">" +');
  js.push('          "<div style=\\"margin-top:10px\\">" + itemsHtml + "</div>" +');
  js.push('          "<div style=\\"font-size:12px;color:var(--sub);margin-top:8px\\">\u043f\u0440\u0438\u043d\u044f\u043b: " + doc.receivedBy + "</div>" +');
  js.push('          (canDeleteDocs() ? "<button class=\\"btn bd\\" style=\\"width:100%;margin-top:10px;padding:8px\\" onclick=\\"event.stopPropagation();deleteIncomingDoc(\'" + doc.docId + "\')\\">🗑️ \u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442</button>" : "") +');
  js.push('          "</div></div>";');
  js.push('    });');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function deleteIncomingDoc(docId) {');
  js.push('  if (!confirm("\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u044d\u0442\u043e\u0442 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u043f\u0440\u0438\u0445\u043e\u0434\u0430? \u041e\u0441\u0442\u0430\u0442\u043a\u0438 \u0441\u043a\u043b\u0430\u0434\u0430 \u0441\u044b\u0440\u044c\u044f \u0431\u0443\u0434\u0443\u0442 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438 \u043e\u0442\u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u044b.")) return;');
  js.push('  srv("deleteIncomingDocument", {payload:{docId:docId}}, function(res) {');
  js.push('    if (res.ok) { toast("\u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u0443\u0434\u0430\u043b\u0451\u043d","ok"); loadIncoming(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('var inItemRowSeq = 0;');
  js.push('function openIncomingMdl() {');
  js.push('  document.getElementById("inInvoice").value = "";');
  js.push('  document.getElementById("inDate").value = new Date().toISOString().slice(0,10);');
  js.push('  document.getElementById("inItemsRows").innerHTML = "";');
  js.push('  var totalEl = document.getElementById("inTotalSum"); if (totalEl) totalEl.textContent = "0";');
  js.push('  inItemRowSeq = 0;');
  js.push('  srv("skladGetMaterials", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    activeMaterialsList = res.materials;');
  js.push('    addInItemRow();');
  js.push('  });');
  js.push('  srv("skladGetSuppliers", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    var sel = document.getElementById("inSupplier");');
  js.push('    while (sel.options.length>1) sel.remove(1);');
  js.push('    res.suppliers.forEach(function(s) { var o=document.createElement("option"); o.value=s.name; o.textContent=s.name; sel.appendChild(o); });');
  js.push('  });');
  js.push('  showMdl("mdlIncoming");');
  js.push('}');
  js.push('');

  js.push('function addInItemRow() {');
  js.push('  inItemRowSeq++;');
  js.push('  var rid = "inRow" + inItemRowSeq;');
  js.push('  var opts = "<option value=\\"\\">— \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b —</option>";');
  js.push('  activeMaterialsList.forEach(function(m) { opts += "<option value=\\"" + m.name + "\\">" + m.name + " (" + m.unit + ")</option>"; });');
  js.push('  var row = document.createElement("div");');
  js.push('  row.id = rid;');
  js.push('  row.style.display = "flex"; row.style.gap = "8px"; row.style.marginBottom = "8px"; row.style.alignItems = "center";');
  js.push('  row.innerHTML = "<select class=\\"fs\\" style=\\"flex:2\\">" + opts + "</select>" +');
  js.push('    "<input type=\\"number\\" class=\\"fi\\" placeholder=\\"\u043a\u043e\u043b-\u0432\u043e\\" style=\\"flex:1\\" oninput=\\"updateInRowSum(\'" + rid + "\')\\">" +');
  js.push('    "<input type=\\"number\\" class=\\"fi\\" placeholder=\\"\u0446\u0435\u043d\u0430\\" style=\\"flex:1\\" oninput=\\"updateInRowSum(\'" + rid + "\')\\">" +');
  js.push('    "<span style=\\"flex:0 0 90px;text-align:right;font-size:13px;color:var(--sub)\\" id=\\"" + rid + "-sum\\">0</span>" +');
  js.push('    "<button class=\\"btn bs\\" onclick=\\"removeInItemRow(\'" + rid + "\')\\">✕</button>";');
  js.push('  document.getElementById("inItemsRows").appendChild(row);');
  js.push('}');
  js.push('');

  js.push('function updateInRowSum(rid) {');
  js.push('  var row = document.getElementById(rid);');
  js.push('  var inps = row.querySelectorAll("input");');
  js.push('  var qty = parseFloat(inps[0].value) || 0;');
  js.push('  var price = parseFloat(inps[1].value) || 0;');
  js.push('  var sum = Math.round(qty * price * 100) / 100;');
  js.push('  document.getElementById(rid + "-sum").textContent = sum;');
  js.push('  updateInTotalSum();');
  js.push('}');
  js.push('');

  js.push('function updateInTotalSum() {');
  js.push('  var total = 0;');
  js.push('  document.getElementById("inItemsRows").childNodes.forEach(function(row) {');
  js.push('    var inps = row.querySelectorAll("input");');
  js.push('    var qty = parseFloat(inps[0].value) || 0;');
  js.push('    var price = parseFloat(inps[1].value) || 0;');
  js.push('    total += qty * price;');
  js.push('  });');
  js.push('  total = Math.round(total * 100) / 100;');
  js.push('  var totalEl = document.getElementById("inTotalSum");');
  js.push('  if (totalEl) totalEl.textContent = total;');
  js.push('}');
  js.push('');

  js.push('function removeInItemRow(rid) { var r=document.getElementById(rid); if(r) r.remove(); updateInTotalSum(); }');
  js.push('');

  js.push('function saveIncoming() {');
  js.push('  var dateInp = document.getElementById("inDate");');
  js.push('  var ruDate = null;');
  js.push('  if (dateInp.value) { var pd = dateInp.value.split("-"); ruDate = pd[2]+"."+pd[1]+"."+pd[0]; }');
  js.push('  var items = [];');
  js.push('  document.getElementById("inItemsRows").childNodes.forEach(function(row) {');
  js.push('    var sels = row.querySelectorAll("select"), inps = row.querySelectorAll("input");');
  js.push('    var material = sels[0].value, qty = inps[0].value, price = inps[1].value;');
  js.push('    if (material && qty) items.push({material:material, qty:qty, price:price||0});');
  js.push('  });');
  js.push('  if (!items.length) { toast("\u0434\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0445\u043e\u0442\u044f \u0431\u044b \u043e\u0434\u0438\u043d \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b \u0441 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e\u043c","err"); return; }');
  js.push('  var p = {');
  js.push('    date: ruDate,');
  js.push('    supplier: document.getElementById("inSupplier").value,');
  js.push('    invoiceNo: document.getElementById("inInvoice").value.trim(),');
  js.push('    items: items');
  js.push('  };');
  js.push('  srv("skladAddIncoming", {payload:p}, function(res) {');
  js.push('    if (res.ok) { toast("\u043f\u0440\u0438\u043d\u044f\u0442\u043e!","ok"); closeMdl("mdlIncoming"); loadIncoming(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');


  js.push('// ── \u0437\u0430\u0432\u0441\u043a\u043b\u0430\u0434 \u0441\u044b\u0440\u044c\u044f: \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044c\u043d\u044b\u0439 \u043e\u0442\u0447\u0451\u0442 ──');
  js.push('function loadMaterialReport() {');
  js.push('  document.getElementById("materialReportCont").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  var fromEl = document.getElementById("repDateFrom");');
  js.push('  var toEl = document.getElementById("repDateTo");');
  js.push('  if (!fromEl.value && !toEl.value) {');
  js.push('    var now = new Date();');
  js.push('    var monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate()-30);');
  js.push('    toEl.value = now.toISOString().slice(0,10);');
  js.push('    fromEl.value = monthAgo.toISOString().slice(0,10);');
  js.push('  }');
  js.push('  var payload = {dateFrom: toRuDate(fromEl.value), dateTo: toRuDate(toEl.value)};');
  js.push('  srv("skladGetMaterialReport", {payload:payload}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    var el = document.getElementById("materialReportCont");');
  js.push('    if (!res.report.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">\u043d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445 \u0437\u0430 \u044d\u0442\u043e\u0442 \u043f\u0435\u0440\u0438\u043e\u0434</div></div>"; return; }');
  js.push('    var h = "<div class=\\"tw\\"><table><thead><tr><th>\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b</th><th>\u0415\u0434.</th><th>\u041f\u0440\u0438\u0445\u043e\u0434</th><th>\u0420\u0430\u0441\u0445\u043e\u0434</th><th>\u0418\u0442\u043e\u0433 \u0437\u0430 \u043f\u0435\u0440\u0438\u043e\u0434</th></tr></thead><tbody>";');
  js.push('    res.report.forEach(function(r) {');
  js.push('      h += "<tr><td style=\\"font-weight:600\\">" + r.material + "</td><td>" + r.unit + "</td><td>" + r.incoming + "</td><td>" + r.outgoing + "</td><td style=\\"font-weight:600;" + (r.balance<0?"color:var(--err)":"") + "\\">" + r.balance + "</td></tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('// ════════════ \u0421\u041a\u041b\u0410\u0414\u0410: \u041e\u0421\u0442\u0410\u0442\u041a\u0418 \u0438 \u041f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0435 ════════════');
  // ════════════ ИНВЕНТАРИЗАЦИЯ (Администратор) ════════════
  js.push('var invCurrentWarehouse = "";');
  js.push('var invChanges = {}; // product -> actualQty');
  js.push('var invOriginalBalances = []; // [{product, unit, qty}]');
  js.push('');

  js.push('function loadInventoryWarehouseList() {');
  js.push('  var sel = document.getElementById("invWarehouseSel");');
  js.push('  srv("warehouseGetList", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    while (sel.options.length>1) sel.remove(1);');
  js.push('    res.warehouses.forEach(function(w) { var o=document.createElement("option"); o.value=w; o.textContent=w; sel.appendChild(o); });');
  js.push('  });');
  js.push('  var dateInp = document.getElementById("invDocDate");');
  js.push('  if (dateInp && !dateInp.value) dateInp.value = new Date().toISOString().slice(0,10);');
  js.push('  loadInventoryHistory();');
  js.push('}');
  js.push('');

  js.push('function loadInventoryBalances() {');
  js.push('  var warehouse = document.getElementById("invWarehouseSel").value;');
  js.push('  var cont = document.getElementById("inventoryBalancesCont");');
  js.push('  invCurrentWarehouse = warehouse;');
  js.push('  invChanges = {};');
  js.push('  updateInvSaveBar();');
  js.push('  if (!warehouse) { cont.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">\u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u043a\u043b\u0430\u0434 \u0434\u043b\u044f \u043d\u0430\u0447\u0430\u043b\u0430 \u0438\u043d\u0432\u0435\u043d\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u0438</div></div>"; return; }');
  js.push('  cont.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("invGetWarehouseBalances", {payload:{warehouse:warehouse}}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); cont.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">" + res.error + "</div></div>"; return; }');
  js.push('    invOriginalBalances = res.balances;');
  js.push('    renderInventoryRows(res.balances);');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderInventoryRows(balances) {');
  js.push('  var cont = document.getElementById("inventoryBalancesCont");');
  js.push('  if (!balances.length) { cont.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">\u043d\u0435\u0442 \u043f\u043e\u0437\u0438\u0446\u0438\u0439</div></div>"; return; }');
  js.push('  var h = "<div class=\\"tw\\"><table><thead><tr><th>\u0422\u043e\u0432\u0430\u0440</th><th style=\\"text-align:right\\">\u0421\u0438\u0441\u0442\u0435\u043c\u0430</th><th style=\\"text-align:right\\">\u0424\u0430\u043a\u0442</th><th style=\\"text-align:right\\">\u0420\u0430\u0437\u043d\u0438\u0446\u0430</th></tr></thead><tbody id=\\"invRowsBody\\">";');
  js.push('  balances.forEach(function(b, idx) {');
  js.push('    h += "<tr data-product=\\"" + b.product.replace(/\\"/g,"&quot;") + "\\" class=\\"inv-row\\">" +');
  js.push('      "<td>" + b.product + " <span style=\\"color:var(--sub);font-size:11px\\">(" + b.unit + ")</span></td>" +');
  js.push('      "<td style=\\"text-align:right;color:var(--sub)\\">" + b.qty + "</td>" +');
  js.push('      "<td style=\\"text-align:right\\"><input type=\\"number\\" class=\\"fi\\" style=\\"width:110px;text-align:right;padding:6px 8px\\" placeholder=\\"" + b.qty + "\\" data-system=\\"" + b.qty + "\\" oninput=\\"onInvInputChange(this, \'" + b.product.replace(/\'/g,"\\\\\'") + "\')\\"></td>" +');
  js.push('      "<td style=\\"text-align:right\\" class=\\"inv-diff\\">\u2014</td></tr>";');
  js.push('  });');
  js.push('  h += "</tbody></table></div>";');
  js.push('  cont.innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('function onInvInputChange(inp, product) {');
  js.push('  var row = inp.closest("tr");');
  js.push('  var diffCell = row.querySelector(".inv-diff");');
  js.push('  var systemQty = parseFloat(inp.dataset.system);');
  js.push('  if (inp.value === "") { delete invChanges[product]; diffCell.textContent = "\u2014"; diffCell.style.color = ""; row.style.background = ""; updateInvSaveBar(); return; }');
  js.push('  var actualQty = parseFloat(inp.value);');
  js.push('  if (isNaN(actualQty)) return;');
  js.push('  var diff = Math.round((actualQty - systemQty) * 1000) / 1000;');
  js.push('  if (diff === 0) { delete invChanges[product]; diffCell.textContent = "0"; diffCell.style.color = ""; row.style.background = ""; updateInvSaveBar(); return; }');
  js.push('  invChanges[product] = actualQty;');
  js.push('  diffCell.textContent = (diff>0?"+":"") + diff;');
  js.push('  diffCell.style.color = diff > 0 ? "var(--ok)" : "var(--err)";');
  js.push('  row.style.background = "rgba(249,168,37,.08)";');
  js.push('  updateInvSaveBar();');
  js.push('}');
  js.push('');

  js.push('function updateInvSaveBar() {');
  js.push('  var wrap = document.getElementById("invSaveBarWrap");');
  js.push('  var count = Object.keys(invChanges).length;');
  js.push('  document.getElementById("invChangedCount").textContent = count;');
  js.push('  wrap.style.display = count > 0 ? "block" : "none";');
  js.push('}');
  js.push('');

  js.push('function filterInventoryRows() {');
  js.push('  var q = document.getElementById("invSearchInput").value.toLowerCase();');
  js.push('  document.querySelectorAll(".inv-row").forEach(function(row) {');
  js.push('    var product = (row.dataset.product || "").toLowerCase();');
  js.push('    row.style.display = product.indexOf(q) === -1 ? "none" : "";');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function saveInventoryChanges() {');
  js.push('  var items = Object.keys(invChanges).map(function(p){ return {product:p, actualQty:invChanges[p]}; });');
  js.push('  if (!items.length) { toast("\u043d\u0435\u0442 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439","err"); return; }');
  js.push('  var dateInp = document.getElementById("invDocDate");');
  js.push('  if (!dateInp.value) { toast("\u0443\u043a\u0430\u0436\u0438\u0442\u0435 \u0434\u0430\u0442\u0443 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430","err"); return; }');
  js.push('  var p = dateInp.value.split("-"); var ruDate = p[2]+"."+p[1]+"."+p[0];');
  js.push('  if (!confirm("\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c " + items.length + " \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439 \u043f\u043e \u0441\u043a\u043b\u0430\u0434\u0443 \\"" + invCurrentWarehouse + "\\" \u0434\u0430\u0442\u043e\u0439 " + ruDate + "?")) return;');
  js.push('  srv("invSetBalanceBulk", {payload:{warehouse:invCurrentWarehouse, date:ruDate, items:items}}, function(res) {');
  js.push('    if (res.ok) { toast("\u043e\u0441\u0442\u0430\u0442\u043a\u0438 \u0441\u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u044b!","ok"); loadInventoryBalances(); loadInventoryHistory(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function loadInventoryHistory() {');
  js.push('  var cont = document.getElementById("inventoryHistoryCont");');
  js.push('  if (!cont) return;');
  js.push('  cont.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("invGetHistory", {payload:{}}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    if (!res.list.length) { cont.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">\u0438\u0441\u0442\u043e\u0440\u0438\u044f \u043f\u0443\u0441\u0442\u0430</div></div>"; return; }');
  js.push('    // \u0413\u0440\u0443\u043f\u043f\u0438\u0440\u0443\u0435\u043c \u043f\u043e\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0435 \u0437\u0430\u043f\u0438\u0441\u0438 \u0441 \u043e\u0434\u0438\u043d\u0430\u043a\u043e\u0432\u043e\u0439 \u0434\u0430\u0442\u043e\u0439+\u0441\u043a\u043b\u0430\u0434\u043e\u043c+\u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u0435\u043c \u0432 \u043e\u0434\u0438\u043d \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442');
  js.push('    var docs = [];');
  js.push('    res.list.forEach(function(r) {');
  js.push('      var last = docs[docs.length - 1];');
  js.push('      if (last && last.date === r.date && last.warehouse === r.warehouse && last.who === r.who) {');
  js.push('        last.items.push(r);');
  js.push('      } else {');
  js.push('        docs.push({date:r.date, warehouse:r.warehouse, who:r.who, items:[r]});');
  js.push('      }');
  js.push('    });');
  js.push('    var h = "";');
  js.push('    var groupId = "invH";');
  js.push('    docs.forEach(function(doc, idx) {');
  js.push('      var itemId = groupId + "-" + idx;');
  js.push('      var itemsHtml = doc.items.map(function(r){');
  js.push('        var diffColor = r.diff > 0 ? "color:var(--ok)" : (r.diff < 0 ? "color:var(--err)" : "");');
  js.push('        var delBtn = canDeleteDocs() ? "<button class=\\"btn bd\\" style=\\"padding:3px 8px;font-size:11px;margin-left:8px\\" onclick=\\"event.stopPropagation();deleteInventoryRec(\'" + doc.warehouse.replace(/\'/g,"\\\\\'") + "\',\'" + r.product.replace(/\'/g,"\\\\\'") + "\',\'" + doc.date + "\',\'" + doc.who.replace(/\'/g,"\\\\\'") + "\')\\">✕</button>" : "";');
  js.push('        return "<div style=\\"display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:13px\\">" + "<span>" + r.product + "</span>" + "<span style=\\"display:flex;align-items:center\\"><span style=\\"color:var(--sub)\\">" + r.before + " \u2192 </span>" + r.after + " <span style=\\"" + diffColor + "\\">(" + (r.diff>0?"+":"") + r.diff + ")</span>" + delBtn + "</span></div>";');
  js.push('      }).join("");');
  js.push('      h += "<div style=\\"background:var(--s2);border-radius:8px;margin-bottom:8px;overflow:hidden\\">" +');
  js.push('        "<div style=\\"display:flex;justify-content:space-between;align-items:center;padding:12px 14px;cursor:pointer\\" onclick=\\"toggleAcc(\'" + groupId + "\',\'" + itemId + "\')\\">" +');
  js.push('          "<div style=\\"display:flex;gap:10px;align-items:center;flex-wrap:wrap\\">" +');
  js.push('            "<span style=\\"color:var(--sub);font-size:13px\\">" + doc.date + "</span>" +');
  js.push('            "<span style=\\"font-weight:700\\">" + doc.warehouse + "</span>" +');
  js.push('            "<span style=\\"color:var(--sub);font-size:13px\\">" + doc.items.length + " \u043f\u043e\u0437. \u00b7 " + doc.who + "</span></div>" +');
  js.push('          "<span id=\\"" + itemId + "-ico\\" data-accico=\\"" + groupId + "\\" style=\\"font-size:20px;color:var(--sub);font-weight:300;min-width:20px;text-align:center\\">+</span></div>" +');
  js.push('        "<div id=\\"" + itemId + "-body\\" data-accgroup=\\"" + groupId + "\\" style=\\"display:none;padding:0 14px 14px 14px;border-top:1px solid var(--bd)\\">" +');
  js.push('          "<div style=\\"margin-top:10px\\">" + itemsHtml + "</div></div></div>";');
  js.push('    });');
  js.push('    cont.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function deleteInventoryRec(warehouse, product, date, who) {');
  js.push('  if (!confirm("\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u044d\u0442\u0443 \u0437\u0430\u043f\u0438\u0441\u044c \u0438\u043d\u0432\u0435\u043d\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u0438? \u041e\u0441\u0442\u0430\u0442\u043e\u043a \u0431\u0443\u0434\u0435\u0442 \u0432\u043e\u0437\u0432\u0440\u0430\u0449\u0451\u043d \u043a \u043f\u0440\u0435\u0436\u043d\u0435\u043c\u0443 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044e.")) return;');
  js.push('  srv("deleteInventoryRecord", {payload:{warehouse:warehouse, product:product, date:date, who:who}}, function(res) {');
  js.push('    if (res.ok) { toast("\u0437\u0430\u043f\u0438\u0441\u044c \u0443\u0434\u0430\u043b\u0435\u043d\u0430","ok"); loadInventoryHistory(); loadInventoryBalances(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // ════════════ ПРОИЗВОДСТВЕННЫЙ УЧЁТ СМЕНЫ ════════════

  // ── НОРМЫ РАСХОДОВ (Зав.производством) ──
  js.push('var normsMaterialsList = [];');
  js.push('function loadNorms() {');
  js.push('  document.getElementById("normsCont").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("spGetNormsWithCost", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    var el = document.getElementById("normsCont");');
  js.push('    if (!res.norms.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">📋</div><div class=\\"empty-t\\">\u043d\u043e\u0440\u043c \u0435\u0449\u0451 \u043d\u0435\u0442</div></div>"; return; }');
  js.push('    var h = "";');
  js.push('    var groupId = "norms";');
  js.push('    res.norms.forEach(function(n, idx) {');
  js.push('      var itemId = groupId + "-" + idx;');
  js.push('      var rows = n.lines.map(function(l) {');
  js.push('        return "<tr><td>" + l.material + "</td><td style=\\"text-align:right\\">" + (l.batchTotal||"\u2014") + "</td><td style=\\"text-align:right;color:var(--sub)\\">" + l.qty + "</td><td style=\\"text-align:right;color:var(--sub)\\">" + (l.price?l.price.toLocaleString():"\u2014") + "</td><td style=\\"text-align:right;font-weight:600\\">" + l.lineCost.toLocaleString() + "</td></tr>";');
  js.push('      }).join("");');
  js.push('      h += "<div style=\\"background:var(--s2);border-radius:8px;margin-bottom:8px;overflow:hidden\\">" +');
  js.push('        "<div style=\\"display:flex;justify-content:space-between;align-items:center;padding:12px 14px;cursor:pointer\\" onclick=\\"toggleAcc(\'" + groupId + "\',\'" + itemId + "\')\\">" +');
  js.push('          "<div style=\\"display:flex;flex-direction:column;gap:2px\\">" +');
  js.push('            "<span style=\\"font-weight:700;font-size:15px\\">" + n.product + "</span>" +');
  js.push('            (n.batchQty ? "<span style=\\"font-size:12px;color:var(--sub)\\">\u041f\u0430\u0440\u0442\u0438\u044f: " + n.batchQty + " \u0435\u0434. \u00b7 " + n.lines.length + " \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u043e\u0432 \u00b7 <b style=\\"color:var(--g)\\">" + n.totalMaterialCost.toLocaleString() + " \u0441\u0443\u043c/\u0448\u0442</b></span>" : "") +');
  js.push('          "</div>" +');
  js.push('          "<div style=\\"display:flex;align-items:center;gap:10px\\">" +');
  js.push('            "<button class=\\"btn bs\\" style=\\"padding:5px 10px\\" onclick=\\"event.stopPropagation();editNorm(\'" + n.product.replace(/\'/g,\'\\\\\\\'\') + "\')\\">✏️</button>" +');
  js.push('            "<button class=\\"btn bs\\" style=\\"padding:5px 10px\\" onclick=\\"event.stopPropagation();deleteNorm(\'" + n.product.replace(/\'/g,\'\\\\\\\'\') + "\')\\">🗑️</button>" +');
  js.push('            "<span id=\\"" + itemId + "-ico\\" data-accico=\\"" + groupId + "\\" style=\\"font-size:20px;color:var(--sub);font-weight:300;min-width:20px;text-align:center\\">+</span>" +');
  js.push('          "</div></div>" +');
  js.push('        "<div id=\\"" + itemId + "-body\\" data-accgroup=\\"" + groupId + "\\" style=\\"display:none;padding:0 14px 14px 14px;border-top:1px solid var(--bd)\\">" +');
  js.push('          "<div class=\\"tw\\" style=\\"margin-top:10px\\"><table><thead><tr><th style=\\"font-size:12px\\">\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b</th><th style=\\"text-align:right;font-size:12px\\">\u041d\u0430 \u043f\u0430\u0440\u0442\u0438\u044e</th><th style=\\"text-align:right;font-size:12px\\">\u041d\u0430 1 \u0435\u0434.</th><th style=\\"text-align:right;font-size:12px\\">\u0426\u0435\u043d\u0430 (FIFO)</th><th style=\\"text-align:right;font-size:12px\\">\u0421\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c</th></tr></thead><tbody>" +');
  js.push('          rows + "</tbody></table></div></div></div>";');
  js.push('    });');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('var normRowSeq = 0;');
  js.push('var normsMaterialsList = [];');
  js.push('function openNormMdl(presetProduct, presetBatchQty, presetLines) {');
  js.push('  document.getElementById("normProduct").value = presetProduct || "";');
  js.push('  document.getElementById("normBatchQty").value = presetBatchQty || "";');
  js.push('  document.getElementById("normLinesRows").innerHTML = "";');
  js.push('  normRowSeq = 0;');
  js.push('  srv("skladGetMaterials", {}, function(res) {');
  js.push('    normsMaterialsList = res.ok ? res.materials : [];');
  js.push('    if (presetLines && presetLines.length) {');
  js.push('      presetLines.forEach(function(l){ addNormLineRow(l.material, l.batchTotal); });');
  js.push('    } else { addNormLineRow(); }');
  js.push('  });');
  js.push('  srv("getProducts", {}, function(res) {');
  js.push('    var sel = document.getElementById("normProduct");');
  js.push('    while (sel.options.length>1) sel.remove(1);');
  js.push('    if (res.products) res.products.forEach(function(p){ var o=document.createElement("option"); o.value=p.name; o.textContent=p.name; sel.appendChild(o); });');
  js.push('    if (presetProduct) sel.value = presetProduct;');
  js.push('  });');
  js.push('  showMdl("mdlNorm");');
  js.push('}');
  js.push('');

  js.push('function editNorm(product) {');
  js.push('  srv("spGetNorms", {}, function(res) {');
  js.push('    var norm = (res.norms || []).find(function(n){ return n.product === product; });');
  js.push('    openNormMdl(product, norm ? norm.batchQty : "", norm ? norm.lines : []);');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function addNormLineRow(presetMat, presetBatchTotal) {');
  js.push('  normRowSeq++;');
  js.push('  var rid = "normRow" + normRowSeq;');
  js.push('  var opts = "<option value=\\"\\">— \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b —</option>";');
  js.push('  normsMaterialsList.forEach(function(m){ opts += "<option value=\\"" + m.name + "\\"" + (m.name===presetMat?" selected":"") + ">" + m.name + " (" + m.unit + ")</option>"; });');
  js.push('  var row = document.createElement("div");');
  js.push('  row.id = rid; row.style.display="flex"; row.style.gap="8px"; row.style.marginBottom="8px"; row.style.alignItems="center";');
  js.push('  row.innerHTML = "<select class=\\"fs\\" style=\\"flex:2\\">" + opts + "</select>" +');
  js.push('    "<div style=\\"flex:1\\"><input type=\\"number\\" class=\\"fi\\" placeholder=\\"\u043d\u0430 \u043f\u0430\u0440\u0442\u0438\u044e\\" step=\\"0.001\\" style=\\"width:100%\\" value=\\"" + (presetBatchTotal||"") + "\\" oninput=\\"updateNormHint(this)\\"></div>" +');
  js.push('    "<div class=\\"norm-hint\\" style=\\"flex:0.8;font-size:11px;color:var(--sub);text-align:right\\">\u2014 \u043d\u0430 1 \u0435\u0434.</div>" +');
  js.push('    "<button class=\\"btn bs\\" onclick=\\"removeNormRow(\'" + rid + "\')\\">✕</button>";');
  js.push('  document.getElementById("normLinesRows").appendChild(row);');
  js.push('  if (presetBatchTotal) updateNormHint(row.querySelector("input"));');
  js.push('}');
  js.push('');

  js.push('function updateNormHint(inp) {');
  js.push('  var batchQty = parseFloat(document.getElementById("normBatchQty").value) || 0;');
  js.push('  var batchTotal = parseFloat(inp.value) || 0;');
  js.push('  var hint = inp.parentNode.nextElementSibling;');
  js.push('  if (batchQty > 0 && batchTotal > 0) {');
  js.push('    var per1 = Math.round(batchTotal / batchQty * 1000000) / 1000000;');
  js.push('    hint.textContent = "= " + per1 + " \u043d\u0430 1 \u0435\u0434.";');
  js.push('    hint.style.color = "var(--ok)";');
  js.push('  } else { hint.textContent = "\u2014 \u043d\u0430 1 \u0435\u0434."; hint.style.color = "var(--sub)"; }');
  js.push('}');
  js.push('');

  js.push('function removeNormRow(rid){ var r=document.getElementById(rid); if(r) r.remove(); }');
  js.push('');

  js.push('function saveNorm() {');
  js.push('  var product = document.getElementById("normProduct").value;');
  js.push('  var batchQty = parseFloat(document.getElementById("normBatchQty").value);');
  js.push('  if (!product) { toast("\u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u0440\u043e\u0434\u0443\u043a\u0442","err"); return; }');
  js.push('  if (!batchQty || batchQty <= 0) { toast("\u0443\u043a\u0430\u0436\u0438\u0442\u0435 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0432 \u043f\u0430\u0440\u0442\u0438\u0438","err"); return; }');
  js.push('  var lines = [];');
  js.push('  document.getElementById("normLinesRows").childNodes.forEach(function(row){');
  js.push('    var sel=row.querySelector("select"), inp=row.querySelector("input");');
  js.push('    if (sel.value && inp.value) lines.push({material:sel.value, batchTotal:parseFloat(inp.value)});');
  js.push('  });');
  js.push('  if (!lines.length) { toast("\u0434\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0445\u043e\u0442\u044f \u0431\u044b \u043e\u0434\u0438\u043d \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b","err"); return; }');
  js.push('  srv("spSaveNorm", {payload:{product:product, batchQty:batchQty, lines:lines}}, function(res){');
  js.push('    if (res.ok) { toast("\u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e! \u043d\u043e\u0440\u043c\u0430 = \u0440\u0430\u0441\u0445\u043e\u0434 / " + batchQty,"ok"); closeMdl("mdlNorm"); loadNorms(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function deleteNorm(product) {');
  js.push('  if (!confirm("\u0443\u0434\u0430\u043b\u0438\u0442\u044c \u043d\u043e\u0440\u043c\u0443 \u0434\u043b\u044f " + product + "?")) return;');
  js.push('  srv("spDeleteNorm", {payload:{product:product}}, function(res){');
  js.push('    if (res.ok) { toast("\u0443\u0434\u0430\u043b\u0435\u043d\u043e","ok"); loadNorms(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── СПИСАНИЕ МАТЕРИАЛОВ (Тестодел) ──
  js.push('var writeOffMaterialsList = [];');
  js.push('var writeOffRowSeq = 0;');
  js.push('function loadWriteOffs() {');
  js.push('  var el = document.getElementById("writeOffCont");');
  js.push('  el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("spGetWriteOffs", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    if (!res.list.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">📝</div><div class=\\"empty-t\\">\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0439 \u0435\u0449\u0451 \u043d\u0435\u0442</div></div>"; return; }');
  js.push('    var h = "";');
  js.push('    var groupId = "wo";');
  js.push('    res.list.forEach(function(doc, idx) {');
  js.push('      var itemId = groupId + "-" + idx;');
  js.push('      var itemsHtml = doc.items.map(function(it){ return "<div style=\\"display:flex;justify-content:space-between;padding:4px 0\\"><span>" + it.material + "</span><span style=\\"font-weight:600\\">" + it.qty + "</span></div>"; }).join("");');
  js.push('      h += "<div style=\\"background:var(--s2);border-radius:8px;margin-bottom:8px;overflow:hidden\\">" +');
  js.push('        "<div style=\\"display:flex;justify-content:space-between;align-items:center;padding:12px 14px;cursor:pointer\\" onclick=\\"toggleAcc(\'" + groupId + "\',\'" + itemId + "\')\\">" +');
  js.push('          "<div style=\\"display:flex;gap:10px;align-items:center;flex-wrap:wrap\\">" +');
  js.push('            "<span style=\\"font-weight:700\\">" + doc.items.length + " \u043f\u043e\u0437.</span>" +');
  js.push('            "<span style=\\"color:var(--sub);font-size:13px\\">" + doc.who + "</span></div>" +');
  js.push('          "<span id=\\"" + itemId + "-ico\\" data-accico=\\"" + groupId + "\\" style=\\"font-size:20px;color:var(--sub);font-weight:300;min-width:20px;text-align:center\\">+</span></div>" +');
  js.push('        "<div id=\\"" + itemId + "-body\\" data-accgroup=\\"" + groupId + "\\" style=\\"display:none;padding:0 14px 14px 14px;border-top:1px solid var(--bd)\\">" +');
  js.push('          "<div style=\\"margin-top:10px\\">" + itemsHtml + "</div>" +');
  js.push('          (canDeleteDocs() ? "<button class=\\"btn bd\\" style=\\"width:100%;margin-top:10px;padding:8px\\" onclick=\\"event.stopPropagation();deleteWriteOffDoc(\'" + doc.docId + "\')\\">🗑️ \u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442</button>" : "") +');
  js.push('          "</div></div>";');
  js.push('    });');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function deleteWriteOffDoc(docId) {');
  js.push('  if (!confirm("\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u044d\u0442\u043e\u0442 \u0430\u043a\u0442 \u0441\u043f\u0438\u0441\u0430\u043d\u0438\u044f? \u041e\u0441\u0442\u0430\u0442\u043a\u0438 \u0441\u043a\u043b\u0430\u0434\u043e\u0432 \u0431\u0443\u0434\u0443\u0442 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438 \u043e\u0442\u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u044b.")) return;');
  js.push('  srv("deleteWriteOffDocument", {payload:{docId:docId}}, function(res) {');
  js.push('    if (res.ok) { toast("\u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u0443\u0434\u0430\u043b\u0451\u043d","ok"); loadWriteOffs(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function openWriteOffMdl() {');
  js.push('  document.getElementById("writeOffRows").innerHTML = "";');
  js.push('  writeOffRowSeq = 0;');
  js.push('  srv("skladGetMaterials", {}, function(res){ writeOffMaterialsList = res.ok ? res.materials : []; addWriteOffRow(); });');
  js.push('  showMdl("mdlWriteOff");');
  js.push('}');
  js.push('function addWriteOffRow() {');
  js.push('  writeOffRowSeq++;');
  js.push('  var rid = "woRow" + writeOffRowSeq;');
  js.push('  var opts = "<option value=\\"\\">— \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b —</option>";');
  js.push('  writeOffMaterialsList.forEach(function(m){ opts += "<option value=\\"" + m.name + "\\">" + m.name + " (" + m.unit + ")</option>"; });');
  js.push('  var row = document.createElement("div");');
  js.push('  row.id = rid; row.style.display="flex"; row.style.gap="8px"; row.style.marginBottom="8px";');
  js.push('  row.innerHTML = "<select class=\\"fs\\" style=\\"flex:2\\">" + opts + "</select>" +');
  js.push('    "<input type=\\"number\\" class=\\"fi\\" placeholder=\\"\u043a\u043e\u043b-\u0432\u043e\\" style=\\"flex:1\\"><button class=\\"btn bs\\" onclick=\\"removeWoRow(\'" + rid + "\')\\">✕</button>";');
  js.push('  document.getElementById("writeOffRows").appendChild(row);');
  js.push('}');
  js.push('function removeWoRow(rid){ var r=document.getElementById(rid); if(r) r.remove(); }');
  js.push('function saveWriteOff() {');
  js.push('  var items = [];');
  js.push('  document.getElementById("writeOffRows").childNodes.forEach(function(row){');
  js.push('    var sel=row.querySelector("select"), inp=row.querySelector("input");');
  js.push('    if (sel.value && inp.value) items.push({material:sel.value, qty:parseFloat(inp.value)});');
  js.push('  });');
  js.push('  if (!items.length) { toast("\u0434\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b","err"); return; }');
  js.push('  srv("spWriteOff", {payload:{items:items}}, function(res){');
  js.push('    if (res.ok) { toast("\u0441\u043f\u0438\u0441\u0430\u043d\u043e!","ok"); closeMdl("mdlWriteOff"); loadWriteOffs(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── ЗАКРЫТИЕ СМЕНЫ (Бригадир) — план vs факт ──
  js.push('function loadShiftReport() {');
  js.push('  var el = document.getElementById("shiftReportCont");');
  js.push('  el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("spGetShiftReport", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">" + res.error + "</div></div>"; return; }');
  js.push('    var h = "";');
  js.push('    if (res.isAlreadyClosed) {');
  js.push('      h += "<div style=\\"background:rgba(102,187,106,.12);border-radius:8px;padding:10px 14px;margin-bottom:14px;color:var(--ok);display:flex;justify-content:space-between;align-items:center\\">" +');
  js.push('        "<span>✓ \u0421\u043c\u0435\u043d\u0430 \u0443\u0436\u0435 \u0437\u0430\u043a\u0440\u044b\u0442\u0430</span>" +');
  js.push('        (canDeleteDocs() ? "<button class=\\"btn bd\\" style=\\"padding:4px 10px;font-size:12px\\" onclick=\\"undoCloseShift(\'" + res.liniya.replace(/\'/g,"\\\\\'") + "\',\'" + res.date + "\')\\">🔓 \u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c \u0437\u0430\u043a\u0440\u044b\u0442\u0438\u0435</button>" : "") +');
  js.push('        "</div>";');
  js.push('    }');
  js.push('    if (!res.isAlreadyClosed && res.hasWarning) {');
  js.push('      h += "<div style=\\"background:rgba(239,83,80,.12);border:1px solid var(--err);border-radius:8px;padding:12px 16px;margin-bottom:14px\\">" +');
  js.push('        "<div style=\\"font-weight:700;color:var(--err);margin-bottom:4px\\">\u26a0\ufe0f \u041e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u0438\u0435 \u043f\u0440\u0435\u0432\u044b\u0448\u0430\u0435\u0442 " + res.thresholdPct + "%</div>" +');
  js.push('        "<div style=\\"font-size:13px\\">\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0432\u044b\u0434\u0435\u043b\u0435\u043d\u043d\u044b\u0435 \u043f\u043e\u0437\u0438\u0446\u0438\u0438 \u043d\u0438\u0436\u0435 \u043f\u0435\u0440\u0435\u0434 \u0437\u0430\u043a\u0440\u044b\u0442\u0438\u0435\u043c \u0441\u043c\u0435\u043d\u044b.</div></div>";');
  js.push('    }');
  js.push('    if (res.shipped.length) {');
  js.push('      h += "<div class=\\"card-t\\">\u041e\u0442\u0433\u0440\u0443\u0436\u0435\u043d\u043e \u043d\u0430 \u0421\u043a\u043b\u0430\u0434 \u0413\u041f \u0437\u0430 \u0434\u0435\u043d\u044c</div>";');
  js.push('      h += "<div class=\\"tw\\" style=\\"margin-bottom:16px\\"><table><thead><tr><th>\u041f\u0440\u043e\u0434\u0443\u043a\u0442</th><th>\u041a\u043e\u043b-\u0432\u043e</th></tr></thead><tbody>";');
  js.push('      res.shipped.forEach(function(s){ h += "<tr><td style=\\"font-weight:600\\">"+s.product+"</td><td>"+s.qty+"</td></tr>"; });');
  js.push('      h += "</tbody></table></div>";');
  js.push('    } else h += "<div class=\\"empty\\"><div class=\\"empty-t\\">\u043d\u0435\u0442 \u043f\u0440\u0438\u043d\u044f\u0442\u044b\u0445 \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0439 \u043d\u0430 \u0421\u043a\u043b\u0430\u0434 \u0413\u041f \u0437\u0430 \u0441\u0435\u0433\u043e\u0434\u043d\u044f</div></div>";');
  js.push('    if (res.comparison.length) {');
  js.push('      h += "<div class=\\"card-t\\">\u041f\u043b\u0430\u043d vs \u0424\u0430\u043a\u0442 (\u043f\u043e \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0430\u043c)</div>";');
  js.push('      h += "<div class=\\"tw\\"><table><thead><tr><th>\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b</th><th style=\\"text-align:right\\">\u041f\u043b\u0430\u043d</th><th style=\\"text-align:right\\">\u0424\u0430\u043a\u0442</th><th style=\\"text-align:right\\">\u041e\u0442\u043a\u043b, \u0435\u0434.</th><th style=\\"text-align:right\\">\u041e\u0442\u043a\u043b, %</th></tr></thead><tbody>";');
  js.push('      res.comparison.forEach(function(c){');
  js.push('        var diffColor = c.diffKg > 0 ? "color:var(--err)" : (c.diffKg < 0 ? "color:var(--ok)" : "");');
  js.push('        var rowStyle = c.isWarning ? "background:rgba(239,83,80,.10)" : "";');
  js.push('        var warnIcon = c.isWarning ? " ⚠️" : "";');
  js.push('        h += "<tr style=\\"" + rowStyle + "\\"><td style=\\"font-weight:600\\">"+c.material+warnIcon+"</td><td style=\\"text-align:right\\">"+c.plan+"</td><td style=\\"text-align:right\\">"+c.fact+"</td>" +');
  js.push('          "<td style=\\"text-align:right;" + diffColor + "\\">" + (c.diffKg>0?"+":"") + c.diffKg + "</td>" +');
  js.push('          "<td style=\\"text-align:right;" + diffColor + "\\">" + (c.diffPct!==null?(c.diffPct>0?"+":"")+c.diffPct+"%":"\u2014") + "</td></tr>";');
  js.push('      });');
  js.push('      h += "</tbody></table></div>";');
  js.push('    }');
  js.push('    if (res.interimBalance && res.interimBalance.length) {');
  js.push('      h += "<div class=\\"card-t\\" style=\\"margin-top:16px\\">\u041d\u0430 \u043f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u043e\u043c \u0441\u043a\u043b\u0430\u0434\u0435 \u0432\u0441\u0451 \u0435\u0449\u0451 \u0432\u0438\u0441\u0438\u0442</div>";');
  js.push('      h += "<div class=\\"tw\\"><table><thead><tr><th>\u0422\u043e\u0432\u0430\u0440</th><th style=\\"text-align:right\\">\u041e\u0441\u0442\u0430\u0442\u043e\u043a</th></tr></thead><tbody>";');
  js.push('      res.interimBalance.forEach(function(b){ h += "<tr><td>"+b.product+"</td><td style=\\"text-align:right\\">"+b.qty+"</td></tr>"; });');
  js.push('      h += "</tbody></table></div>";');
  js.push('    }');
  js.push('    if (!res.isAlreadyClosed && res.shipped.length) {');
  js.push('      if (res.hasWarning) {');
  js.push('        h += "<div style=\\"margin-top:16px;display:flex;gap:10px\\">" +');
  js.push('          "<button class=\\"btn bs\\" style=\\"flex:1\\" onclick=\\"loadShiftReport()\\">🔄 \u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0437\u0430\u043d\u043e\u0432\u043e</button>" +');
  js.push('          "<button class=\\"btn bd\\" style=\\"flex:1\\" onclick=\\"closeShift()\\">✓ \u0412\u0441\u0451 \u0432\u0435\u0440\u043d\u043e — \u0437\u0430\u043a\u0440\u044b\u0442\u044c</button></div>";');
  js.push('      } else {');
  js.push('        h += "<div style=\\"margin-top:16px\\"><button class=\\"btn bp\\" style=\\"width:100%\\" onclick=\\"closeShift()\\">🔒 \u0417\u0430\u043a\u0440\u044b\u0442\u044c \u0441\u043c\u0435\u043d\u0443</button></div>";');
  js.push('      }');
  js.push('    }');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('function closeShift() {');
  js.push('  if (!confirm("\u0417\u0430\u043a\u0440\u044b\u0442\u044c \u0441\u043c\u0435\u043d\u0443? \u042d\u0442\u043e \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043d\u0435\u043b\u044c\u0437\u044f \u043e\u0442\u043c\u0435\u043d\u0438\u0442\u044c.")) return;');
  js.push('  srv("spCloseShift", {}, function(res){');
  js.push('    if (res.ok) { toast("\u0441\u043c\u0435\u043d\u0430 \u0437\u0430\u043a\u0440\u044b\u0442\u0430!","ok"); loadShiftReport(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function undoCloseShift(liniya, date) {');
  js.push('  if (!confirm("\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c \u0437\u0430\u043a\u0440\u044b\u0442\u0438\u0435 \u0441\u043c\u0435\u043d\u044b? \u0411\u0440\u0438\u0433\u0430\u0434\u0438\u0440 \u0441\u043c\u043e\u0436\u0435\u0442 \u0437\u0430\u043a\u0440\u044b\u0442\u044c \u0435\u0451 \u0437\u0430\u043d\u043e\u0432\u043e.")) return;');
  js.push('  srv("deleteClosedShift", {payload:{liniya:liniya, date:date}}, function(res){');
  js.push('    if (res.ok) { toast("\u0437\u0430\u043a\u0440\u044b\u0442\u0438\u0435 \u043e\u0442\u043c\u0435\u043d\u0435\u043d\u043e","ok"); loadShiftReport(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // ════════════════════════════════════════════════════════
  // МОДУЛЬ МЕХАНИК
  // ════════════════════════════════════════════════════════

  js.push('var mechCurrentSectionId = null; // секция для которой открыта модалка поломки');
  js.push('var mechCurrentTicketId  = null; // заявка для закрытия');
  js.push('var mechEquipList = [];          // кэш оборудования');
  js.push('var mechSectionMap = {};         // sectionId -> section obj');
  js.push('var mechAlertTimer = null;       // polling таймер активных заявок');
  js.push('');

  // ── Инициализация страниц ──
  js.push('function initMechAlerts()    { loadMechAlerts(); startMechPolling(); }');
  js.push('function initMechEquip()     { loadMechEquipPage(); }');
  js.push('function initMechManage()    { loadMechManage(); }');
  js.push('function initMechHistory()   { loadMechHistory(); }');
  js.push('function initMechStats()     { loadMechStats(); }');
  js.push('');

  // ── Polling: обновляем заявки каждые 20 сек (для бригадира — мигающие сигналы) ──
  js.push('var mechLastAlertIds = [];');
  js.push('var mechAlarmInterval = null;');
  js.push('var mechAudioCtx = null; // единый AudioContext — создаётся один раз при первом тапе');
  js.push('');

  js.push('// ── Разблокировка AudioContext при первом тапе (iOS/Android) ──');
  js.push('function unlockAudio() {');
  js.push('  if (mechAudioCtx) return;');
  js.push('  try {');
  js.push('    mechAudioCtx = new (window.AudioContext || window.webkitAudioContext)();');
  js.push('    // Играем тихий пустой буфер — это разблокирует AudioContext на iOS');
  js.push('    var buf = mechAudioCtx.createBuffer(1, 1, 22050);');
  js.push('    var src = mechAudioCtx.createBufferSource();');
  js.push('    src.buffer = buf;');
  js.push('    src.connect(mechAudioCtx.destination);');
  js.push('    src.start(0);');
  js.push('  } catch(e) {}');
  js.push('}');
  js.push('');

  js.push('// ── Звуковой сигнал тревоги ──');
  js.push('function playMechAlarm() {');
  js.push('  try {');
  js.push('    var ctx = mechAudioCtx || new (window.AudioContext || window.webkitAudioContext)();');
  js.push('    if (!mechAudioCtx) mechAudioCtx = ctx;');
  js.push('    // Если контекст заблокирован — пробуем разблокировать');
  js.push('    if (ctx.state === "suspended") { ctx.resume(); }');
  js.push('    [0, 0.35, 0.7].forEach(function(offset) {');
  js.push('      var osc = ctx.createOscillator();');
  js.push('      var gain = ctx.createGain();');
  js.push('      osc.connect(gain); gain.connect(ctx.destination);');
  js.push('      osc.type = "square";');
  js.push('      osc.frequency.setValueAtTime(880, ctx.currentTime + offset);');
  js.push('      osc.frequency.setValueAtTime(660, ctx.currentTime + offset + 0.12);');
  js.push('      gain.gain.setValueAtTime(0.8, ctx.currentTime + offset);');
  js.push('      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + offset + 0.28);');
  js.push('      osc.start(ctx.currentTime + offset);');
  js.push('      osc.stop(ctx.currentTime + offset + 0.28);');
  js.push('    });');
  js.push('  } catch(e) {}');
  js.push('}');
  js.push('');

  js.push('function startAlarmLoop() {');
  js.push('  if (mechAlarmInterval) return;');
  js.push('  playMechAlarm();');
  js.push('  mechAlarmInterval = setInterval(playMechAlarm, 3000);');
  js.push('}');
  js.push('');

  js.push('function stopAlarmLoop() {');
  js.push('  if (mechAlarmInterval) { clearInterval(mechAlarmInterval); mechAlarmInterval = null; }');
  js.push('}');
  js.push('');

  js.push('function startMechPolling() {');
  js.push('  stopMechPolling();');
  js.push('  mechAlertTimer = setInterval(function() {');
  js.push('    srv("mechGetActiveAlerts", {}, function(res) {');
  js.push('      if (!res.ok) return;');
  js.push('      var hasNew = res.alerts.some(function(a){ return a.status === "\\u041d\u043e\u0432\u0430\u044f"; });');
  js.push('      // Механик: непрерывный сигнал пока есть "Новые" заявки');
  js.push('      if (USER.role === "\\u041c\u0435\u0445\u0430\u043d\u0438\u043a") {');
  js.push('        if (hasNew) startAlarmLoop(); else stopAlarmLoop();');
  js.push('      }');
  js.push('      mechLastAlertIds = res.alerts.map(function(a){return a.id;});');
  js.push('      updateMechBadge(res.alerts.length);');
  js.push('      if (document.getElementById("mechAlertsCont")) renderMechAlerts(res.alerts);');
  js.push('    });');
  js.push('  }, 15000);');
  js.push('}');
  js.push('function stopMechPolling() { if (mechAlertTimer) { clearInterval(mechAlertTimer); mechAlertTimer=null; } stopAlarmLoop(); }');
  js.push('');

  js.push('function updateMechBadge(count) {');
  js.push('  // Бейдж на пункте "Активные заявки"');
  js.push('  var badge = document.getElementById("mechNavBadge");');
  js.push('  if (badge) { badge.textContent = count > 0 ? count : ""; badge.style.display = count > 0 ? "inline-flex" : "none"; }');
  js.push('  // Красный пульс на пункте "Оборудование" для Бригадира');
  js.push('  var equipItem = document.getElementById("ni-mech-equipment");');
  js.push('  if (equipItem) {');
  js.push('    if (count > 0) {');
  js.push('      equipItem.style.color = "var(--err)";');
  js.push('      equipItem.style.animation = "mechPulse 1.2s infinite";');
  js.push('      equipItem.style.fontWeight = "700";');
  js.push('      // Красный фон секции в сайдбаре');
  js.push('      var secTitle = equipItem.previousElementSibling;');
  js.push('      if (secTitle && secTitle.classList.contains("nav-sec-t")) {');
  js.push('        secTitle.style.color = "var(--err)";');
  js.push('        secTitle.textContent = "🚨 \\u041e\u0411\u041e\u0420\u0423\u0414\u041e\u0412\u0410\u041d\u0418\u0415";');
  js.push('      }');
  js.push('    } else {');
  js.push('      equipItem.style.color = "";');
  js.push('      equipItem.style.animation = "";');
  js.push('      equipItem.style.fontWeight = "";');
  js.push('      var secTitle2 = equipItem.previousElementSibling;');
  js.push('      if (secTitle2 && secTitle2.classList.contains("nav-sec-t")) {');
  js.push('        secTitle2.style.color = "";');
  js.push('        secTitle2.textContent = "\\u041e\u0411\u041e\u0420\u0423\u0414\u041e\u0412\u0410\u041d\u0418\u0415";');
  js.push('      }');
  js.push('    }');
  js.push('  }');
  js.push('}');
  js.push('');

  // ── Активные заявки (Механик + Бригадир) ──
  js.push('function loadMechAlerts() {');
  js.push('  var el = document.getElementById("mechAlertsCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("mechGetActiveAlerts", {}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div style=\\"padding:16px;color:var(--err)\\">\u26a0 "+(res.error||"")+"</div>"; toast(res.error,"err"); return; }');
  js.push('    updateMechBadge(res.alerts.length);');
  js.push('    renderMechAlerts(res.alerts);');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderMechAlerts(alerts) {');
  js.push('  var el = document.getElementById("mechAlertsCont");');
  js.push('  if (!el) return;');
  js.push('  if (!alerts.length) {');
  js.push('    el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">✅</div><div class=\\"empty-t\\">\\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0445 \u0437\u0430\u044f\u0432\u043e\u043a \u043d\u0435\u0442</div></div>"; return;');
  js.push('  }');
  js.push('  var h = "";');
  js.push('  alerts.forEach(function(a) {');
  js.push('    var isNew = a.status === "\\u041d\u043e\u0432\u0430\u044f";');
  js.push('    var bg = isNew ? "background:rgba(239,83,80,.15);border:2px solid var(--err);animation:mechPulse 1.5s infinite" : "background:rgba(249,168,37,.12);border:2px solid var(--warn)";');
  js.push('    var secName = (mechSectionMap[a.sectionId] && mechSectionMap[a.sectionId].name) || a.sectionId;');
  js.push('    var ico = (mechSectionMap[a.sectionId] && mechSectionMap[a.sectionId].icon) || "⚙️";');
  js.push('    h += "<div style=\\"" + bg + ";border-radius:12px;padding:16px;margin-bottom:12px\\">";');
  js.push('    h += "<div style=\\"display:flex;justify-content:space-between;align-items:flex-start;gap:12px\\">";');
  js.push('    h += "<div style=\\"flex:1\\">";');
  js.push('    h += "<div style=\\"font-size:22px\\">" + ico + " <span style=\\"font-weight:700;font-size:16px\\">" + secName + "</span></div>";');
  js.push('    h += "<div style=\\"font-size:13px;color:var(--sub);margin-top:4px\\">\\u041b\u0438\u043d\u0438\u044f: <b>" + a.liniya + "</b> \u00b7 " + a.timeOpen + "</div>";');
  js.push('    h += "<div style=\\"margin-top:8px;font-size:14px\\">" + a.comment + "</div>";');
  js.push('    h += "</div>";');
  js.push('    h += "<div style=\\"display:flex;flex-direction:column;gap:6px;min-width:110px\\">";');
  js.push('    if (isNew && USER.role === "\\u041c\u0435\u0445\u0430\u043d\u0438\u043a") {');
  js.push('      h += "<button class=\\"btn\\" style=\\"background:var(--warn);color:#000;padding:8px 12px\\" onclick=\\"mechAccept(\'" + a.id + "\')\\">\\u203a\\u203a \\u041f\\u0440\u0438\u043d\u044f\u0442\u044c</button>";');
  js.push('    }');
  js.push('    if (a.status === "\\u041f\u0440\u0438\u043d\u044f\u0442\u0430" && USER.role === "\\u041c\u0435\u0445\u0430\u043d\u0438\u043a") {');
  js.push('      h += "<button class=\\"btn bp\\" style=\\"padding:8px 12px\\" onclick=\\"openCloseTicketMdl(\'" + a.id + "\',\'" + secName.replace(/\'/g,\'\\\\\\\'\') + "\')\\">\\u2714 \\u0417\u0430\u043a\u0440\u044b\u0442\u044c</button>";');
  js.push('    }');
  js.push('    h += "<span style=\\"text-align:center;font-size:12px;padding:4px 8px;border-radius:6px;background:rgba(255,255,255,.08)\\">" + a.status + "</span>";');
  js.push('    h += "</div></div></div>";');
  js.push('  });');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');

  // ── Страница оборудования (Бригадир видит только свою линию) ──
  js.push('function loadMechEquipPage() {');
  js.push('  var el = document.getElementById("mechEquipCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  var filter = (USER.role === "\\u0411\u0440\u0438\u0433\u0430\u0434\u0438\u0440") ? {liniya: USER.liniya} : {};');
  js.push('  srv("mechGetEquipment", {payload:filter}, function(res) {');
  js.push('    if (!res.ok) { var eq=document.getElementById("mechEquipCont"); if(eq) eq.innerHTML="<div style=\\"padding:16px;color:var(--err)\\">\u26a0 "+(res.error||"")+"</div>"; toast(res.error,"err"); return; }');
  js.push('    mechEquipList = res.equipment;');
  js.push('    // Загружаем все секции для этих машин');
  js.push('    var equipIds = res.equipment.map(function(e){return e.id;});');
  js.push('    if (!equipIds.length) {');
  js.push('      document.getElementById("mechEquipCont").innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">\\u041e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044f \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b</div></div>"; return;');
  js.push('    }');
  js.push('    srv("mechGetSections", {payload:{}}, function(sRes) {');
  js.push('      if (sRes.ok) {');
  js.push('        mechSectionMap = {};');
  js.push('        sRes.sections.forEach(function(s){ mechSectionMap[s.id] = s; });');
  js.push('      }');
  js.push('      renderMechEquipPage(res.equipment, sRes.sections||[]);');
  js.push('    });');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderMechEquipPage(equipList, allSections) {');
  js.push('  var el = document.getElementById("mechEquipCont");');
  js.push('  if (!el) return;');
  js.push('  // Сначала загружаем активные заявки чтобы знать статус секций');
  js.push('  srv("mechGetActiveAlerts", {}, function(alertRes) {');
  js.push('    var openSections = {};');
  js.push('    if (alertRes.ok) alertRes.alerts.forEach(function(a){ openSections[a.sectionId] = a; });');
  js.push('    var h = "";');
  js.push('    equipList.forEach(function(equip) {');
  js.push('      var sections = allSections.filter(function(s){ return s.equipId === equip.id; });');
  js.push('      h += "<div style=\\"background:var(--s2);border-radius:12px;padding:16px;margin-bottom:16px\\">";');
  js.push('      h += "<div style=\\"font-weight:700;font-size:16px;margin-bottom:4px\\">🔧 " + equip.name + "</div>";');
  js.push('      h += "<div style=\\"font-size:12px;color:var(--sub);margin-bottom:14px\\">\\u041b\u0438\u043d\u0438\u044f: " + equip.liniya + (equip.desc ? " \u00b7 " + equip.desc : "") + "</div>";');
  js.push('      if (!sections.length) {');
  js.push('        h += "<div style=\\"color:var(--sub);font-size:13px\\">\\u0421\u0435\u043a\u0446\u0438\u0438 \u043d\u0435 \u0437\u0430\u0434\u0430\u043d\u044b</div>";');
  js.push('      } else {');
  js.push('        h += "<div style=\\"display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px\\">";');
  js.push('        sections.forEach(function(sec) {');
  js.push('          var alert = openSections[sec.id];');
  js.push('          var isNew      = alert && alert.status === "\\u041d\u043e\u0432\u0430\u044f";');
  js.push('          var isAccepted = alert && alert.status === "\\u041f\u0440\u0438\u043d\u044f\u0442\u0430";');
  js.push('          var bg    = isNew ? "background:rgba(239,83,80,.2);border:2px solid var(--err)" : isAccepted ? "background:rgba(249,168,37,.2);border:2px solid var(--warn)" : "background:var(--s1);border:2px solid var(--bd)";');
  js.push('          var pulse = isNew ? ";animation:mechPulse 1.2s infinite" : "";');
  js.push('          var statusIco = isNew ? "🔴" : isAccepted ? "🟡" : "🟢";');
  js.push('          var clickFn = (USER.role === "\\u0411\u0440\u0438\u0433\u0430\u0434\u0438\u0440" && !alert)');
  js.push('            ? "onclick=\\"openBreakdownMdl(\'" + sec.id + "\',\'" + sec.name.replace(/\'/g,\'\\\\\\\'\') + "\')\\""');
  js.push('            : (USER.role === "\\u041c\u0435\u0445\u0430\u043d\u0438\u043a" && alert && alert.status==="\\u041f\u0440\u0438\u043d\u044f\u0442\u0430")');
  js.push('              ? "onclick=\\"openCloseTicketMdl(\'" + alert.id + "\',\'" + sec.name.replace(/\'/g,\'\\\\\\\'\') + "\')\\""');
  js.push('              : (USER.role === "\\u041c\u0435\u0445\u0430\u043d\u0438\u043a" && alert && alert.status==="\\u041d\u043e\u0432\u0430\u044f")');
  js.push('              ? "onclick=\\"mechAccept(\'" + alert.id + "\')\\""');
  js.push('              : "";');
  js.push('          var cursor = clickFn ? "cursor:pointer" : "";');
  js.push('          h += "<div style=\\"" + bg + pulse + ";border-radius:10px;padding:14px;text-align:center;" + cursor + "\\" " + clickFn + ">";');
  js.push('          h += "<div style=\\"font-size:28px;margin-bottom:6px\\">" + sec.icon + "</div>";');
  js.push('          h += "<div style=\\"font-size:13px;font-weight:600;line-height:1.3\\">" + sec.name + "</div>";');
  js.push('          h += "<div style=\\"font-size:18px;margin-top:6px\\">" + statusIco + "</div>";');
  js.push('          if (alert) h += "<div style=\\"font-size:11px;color:var(--sub);margin-top:4px\\">" + alert.status + "</div>";');
  js.push('          else if (USER.role === "\\u0411\u0440\u0438\u0433\u0430\u0434\u0438\u0440") h += "<div style=\\"font-size:11px;color:var(--sub);margin-top:4px\\">\\u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u0434\u043b\u044f \u0441\u0438\u0433\u043d\u0430\u043b\u0430</div>";');
  js.push('          h += "</div>";');
  js.push('        });');
  js.push('        h += "</div>";');
  js.push('      }');
  js.push('      h += "</div>";');
  js.push('    });');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── Подача сигнала о поломке (Бригадир) ──
  js.push('function openBreakdownMdl(sectionId, sectionName) {');
  js.push('  mechCurrentSectionId = sectionId;');
  js.push('  document.getElementById("bdSectionName").textContent = "🚨 " + sectionName;');
  js.push('  document.getElementById("bdComment").value = "";');
  js.push('  showMdl("mdlBreakdown");');
  js.push('}');
  js.push('function submitBreakdown() {');
  js.push('  var comment = document.getElementById("bdComment").value.trim();');
  js.push('  if (!comment) { toast("\\u041e\u043f\u0438\u0448\u0438\u0442\u0435 \u043f\u0440\u043e\u0431\u043b\u0435\u043c\u0443","err"); return; }');
  js.push('  srv("mechCreateTicket", {payload:{sectionId:mechCurrentSectionId, comment:comment}}, function(res) {');
  js.push('    if (res.ok) {');
  js.push('      startAlarmLoop(); // непрерывный сигнал — остановится когда механик примет');
  js.push('      srv("mechGetActiveAlerts", {}, function(ar) {');
  js.push('        if (ar.ok) { mechLastAlertIds = ar.alerts.map(function(a){return a.id;}); updateMechBadge(ar.alerts.length); }');
  js.push('      });');
  js.push('      toast("\\u0421\u0438\u0433\u043d\u0430\u043b \u043f\u043e\u0434\u0430\u043d! \u041c\u0435\u0445\u0430\u043d\u0438\u043a \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0451\u043d.","ok");');
  js.push('      closeMdl("mdlBreakdown");');
  js.push('      loadMechEquipPage();');
  js.push('    } else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── Принятие заявки (Механик) ──
  js.push('function mechAccept(ticketId) {');
  js.push('  if (!confirm("\\u041f\u0440\u0438\u043d\u044f\u0442\u044c \u0437\u0430\u044f\u0432\u043a\u0443 \u0432 \u0440\u0430\u0431\u043e\u0442\u0443?")) return;');
  js.push('  srv("mechAcceptTicket", {payload:{ticketId:ticketId}}, function(res) {');
  js.push('    if (res.ok) {');
  js.push('      stopAlarmLoop(); // сигнал выключается при принятии заявки');
  js.push('      toast("\\u0417\u0430\u044f\u0432\u043a\u0430 \u043f\u0440\u0438\u043d\u044f\u0442\u0430","ok");');
  js.push('      loadMechAlerts();');
  js.push('      if (document.getElementById("mechEquipCont")) loadMechEquipPage();');
  js.push('    } else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── Закрытие заявки (Механик) ──
  js.push('function openCloseTicketMdl(ticketId, secName) {');
  js.push('  mechCurrentTicketId = ticketId;');
  js.push('  document.getElementById("ctTicketInfo").textContent = "\\u0421\u0435\u043a\u0446\u0438\u044f: " + secName;');
  js.push('  document.getElementById("ctReport").value = "";');
  js.push('  showMdl("mdlCloseTicket");');
  js.push('}');
  js.push('function submitCloseTicket() {');
  js.push('  var report = document.getElementById("ctReport").value.trim();');
  js.push('  if (!report) { toast("\\u041d\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u043e\u0442\u0447\u0451\u0442","err"); return; }');
  js.push('  srv("mechCloseTicket", {payload:{ticketId:mechCurrentTicketId, report:report}}, function(res) {');
  js.push('    if (res.ok) {');
  js.push('      var min = res.downtimeMin || 0;');
  js.push('      var hrs = Math.floor(min/60), mins = min%60;');
  js.push('      toast("\\u0417\u0430\u044f\u0432\u043a\u0430 \u0437\u0430\u043a\u0440\u044b\u0442\u0430. \\u041f\u0440\u043e\u0441\u0442\u043e\u0439: " + (hrs?""+hrs+"\\u0447 ":"") + mins + "\\u043c\u0438\u043d","ok");');
  js.push('      closeMdl("mdlCloseTicket");');
  js.push('      loadMechAlerts();');
  js.push('      if (document.getElementById("mechEquipCont")) loadMechEquipPage();');
  js.push('    } else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── Управление оборудованием (Механик) ──
  js.push('function loadMechManage() {');
  js.push('  var el = document.getElementById("mechManageCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("mechGetEquipment", {payload:{}}, function(res) {');
  js.push('    if (!res.ok) {');
  js.push('      if (el) el.innerHTML = "<div style=\\"padding:20px;background:rgba(239,83,80,.1);border-radius:8px;color:var(--err)\\">" +');
  js.push('        "<b>\\u041e\u0448\u0438\u0431\u043a\u0430:</b> " + (res.error||"\\u041d\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043d\u0430\u044f \u043e\u0448\u0438\u0431\u043a\u0430") +');
  js.push('        "<br><br><span style=\\"color:var(--sub);font-size:13px\\">\\u0423\u0431\u0435\u0434\u0438\u0442\u0435\u0441\u044c \u0447\u0442\u043e \u043a\u043b\u044e\u0447 MECHANIC_SS_ID \u0437\u0430\u0434\u0430\u043d \u0432 Script Properties.</span></div>";');
  js.push('      toast(res.error,"err"); return;');
  js.push('    }');
  js.push('    srv("mechGetSections", {payload:{}}, function(sRes) {');
  js.push('      var sections = sRes.ok ? sRes.sections : [];');
  js.push('      var h = "";');
  js.push('      if (!res.equipment.length) {');
  js.push('        h = "<div class=\\"empty\\"><div class=\\"empty-t\\">\\u041c\u0430\u0448\u0438\u043d \u0435\u0449\u0451 \u043d\u0435\u0442 \u2014 \u0434\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u043f\u0435\u0440\u0432\u0443\u044e</div></div>";');
  js.push('      }');
  js.push('      res.equipment.forEach(function(eq) {');
  js.push('        var eqSecs = sections.filter(function(s){return s.equipId===eq.id;});');
  js.push('        h += "<div style=\\"background:var(--s2);border-radius:10px;margin-bottom:14px;overflow:hidden\\">";');
  js.push('        h += "<div style=\\"display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid var(--bd)\\">";');
  js.push('        h += "<div style=\\"font-weight:700\\">🔧 " + eq.name + " <span style=\\"color:var(--sub);font-weight:400;font-size:13px\\">(" + eq.liniya + ")</span></div>";');
  js.push('        h += "<div style=\\"display:flex;gap:6px\\">";');
  js.push('        h += "<button class=\\"btn bs\\" style=\\"padding:4px 10px;font-size:12px\\" onclick=\\"openAddSectionMdl(\'" + eq.id + "\')\\">+ \\u0441\u0435\u043a\u0446\u0438\u044f</button>";');
  js.push('        h += "<button class=\\"btn bs\\" style=\\"padding:4px 10px;font-size:12px\\" onclick=\\"openEditEquipMdl(\'" + eq.id + "\',\'" + eq.name.replace(/\'/g,\'\\\\\\\'\') + "\',\'" + eq.liniya + "\',\'" + (eq.desc||"").replace(/\'/g,\'\\\\\\\'\') + "\')\\">✏️</button>";');
  js.push('        h += "<button class=\\"btn bd\\" style=\\"padding:4px 10px;font-size:12px\\" onclick=\\"deleteEquipment(\'" + eq.id + "\')\\">🗑️</button>";');
  js.push('        h += "</div></div>";');
  js.push('        h += "<div style=\\"padding:10px 14px;display:flex;flex-wrap:wrap;gap:8px\\">";');
  js.push('        eqSecs.forEach(function(s) {');
  js.push('          h += "<div style=\\"display:flex;align-items:center;gap:6px;background:var(--s1);border-radius:8px;padding:6px 10px\\">";');
  js.push('          h += "<span>" + s.icon + " " + s.name + "</span>";');
  js.push('          h += "<button class=\\"btn bd\\" style=\\"padding:1px 6px;font-size:11px\\" onclick=\\"deleteSection(\'" + s.id + "\')\\">✕</button>";');
  js.push('          h += "</div>";');
  js.push('        });');
  js.push('        if (!eqSecs.length) h += "<span style=\\"color:var(--sub);font-size:13px\\">\\u0421\u0435\u043a\u0446\u0438\u0439 \u0435\u0449\u0451 \u043d\u0435\u0442</span>";');
  js.push('        h += "</div></div>";');
  js.push('      });');
  js.push('      document.getElementById("mechManageCont").innerHTML = h;');
  js.push('    });');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function openAddEquipMdl() {');
  js.push('  document.getElementById("addEquipTitle").textContent = "+ \\u041d\u043e\u0432\u0430\u044f \u043c\u0430\u0448\u0438\u043d\u0430";');
  js.push('  document.getElementById("equipEditId").value = "";');
  js.push('  document.getElementById("equipName").value = "";');
  js.push('  document.getElementById("equipDesc").value = "";');
  js.push('  // Заполняем список линий');
  js.push('  var sel = document.getElementById("equipLiniya");');
  js.push('  sel.innerHTML = "<option value=\\"\\">\\u2014</option>";');
  js.push('  (allLines||[]).forEach(function(l){ if(l.active){var o=document.createElement("option");o.value=l.name;o.textContent=l.name;sel.appendChild(o);} });');
  js.push('  showMdl("mdlAddEquip");');
  js.push('}');
  js.push('function openEditEquipMdl(id, name, liniya, desc) {');
  js.push('  openAddEquipMdl();');
  js.push('  document.getElementById("addEquipTitle").textContent = "✏️ \\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043c\u0430\u0448\u0438\u043d\u0443";');
  js.push('  document.getElementById("equipEditId").value = id;');
  js.push('  document.getElementById("equipName").value = name;');
  js.push('  document.getElementById("equipDesc").value = desc;');
  js.push('  setTimeout(function(){ document.getElementById("equipLiniya").value = liniya; }, 50);');
  js.push('}');
  js.push('function saveEquipment() {');
  js.push('  var name = document.getElementById("equipName").value.trim();');
  js.push('  if (!name) { toast("\\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435","err"); return; }');
  js.push('  var payload = {');
  js.push('    id: document.getElementById("equipEditId").value || undefined,');
  js.push('    name: name,');
  js.push('    liniya: document.getElementById("equipLiniya").value,');
  js.push('    desc: document.getElementById("equipDesc").value.trim(),');
  js.push('    active: true');
  js.push('  };');
  js.push('  srv("mechSaveEquipment", {payload:payload}, function(res) {');
  js.push('    if (res.ok) { toast("\\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e","ok"); closeMdl("mdlAddEquip"); loadMechManage(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('function deleteEquipment(id) {');
  js.push('  if (!confirm("\\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043c\u0430\u0448\u0438\u043d\u0443?")) return;');
  js.push('  srv("mechDeleteEquipment", {payload:{id:id}}, function(res) {');
  js.push('    if (res.ok) { toast("\\u0423\u0434\u0430\u043b\u0435\u043d\u043e","ok"); loadMechManage(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('function openAddSectionMdl(equipId) {');
  js.push('  document.getElementById("sectionEditId").value = "";');
  js.push('  document.getElementById("sectionEquipId").value = equipId;');
  js.push('  document.getElementById("sectionName").value = "";');
  js.push('  document.getElementById("sectionIcon").value = "⚙️";');
  js.push('  document.getElementById("sectionOrder").value = "";');
  js.push('  showMdl("mdlAddSection");');
  js.push('}');
  js.push('function saveSection() {');
  js.push('  var name = document.getElementById("sectionName").value.trim();');
  js.push('  if (!name) { toast("\\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435","err"); return; }');
  js.push('  var payload = {');
  js.push('    id: document.getElementById("sectionEditId").value || undefined,');
  js.push('    equipId: document.getElementById("sectionEquipId").value,');
  js.push('    name: name,');
  js.push('    icon: document.getElementById("sectionIcon").value.trim() || "⚙️",');
  js.push('    order: parseInt(document.getElementById("sectionOrder").value)||99');
  js.push('  };');
  js.push('  srv("mechSaveSection", {payload:payload}, function(res) {');
  js.push('    if (res.ok) { toast("\\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e","ok"); closeMdl("mdlAddSection"); loadMechManage(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('function deleteSection(id) {');
  js.push('  if (!confirm("\\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0441\u0435\u043a\u0446\u0438\u044e?")) return;');
  js.push('  srv("mechDeleteSection", {payload:{id:id}}, function(res) {');
  js.push('    if (res.ok) { toast("\\u0423\u0434\u0430\u043b\u0435\u043d\u043e","ok"); loadMechManage(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── История заявок ──
  js.push('function loadMechHistory() {');
  js.push('  var el = document.getElementById("mechHistCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("mechGetTickets", {payload:{onlyOpen:false}}, function(res) {');
  js.push('    if (!res.ok) { var hh=document.getElementById("mechHistCont"); if(hh) hh.innerHTML="<div style=\\"padding:16px;color:var(--err)\\">\u26a0 "+(res.error||"")+"</div>"; toast(res.error,"err"); return; }');
  js.push('    if (!res.tickets.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">\\u0418\u0441\u0442\u043e\u0440\u0438\u0438 \u043d\u0435\u0442</div></div>"; return; }');
  js.push('    var h = "<div class=\\"tw\\"><table><thead><tr>" +');
  js.push('      "<th>\\u0414\u0430\u0442\u0430</th><th>\\u041b\u0438\u043d\u0438\u044f</th><th>\\u0421\u0435\u043a\u0446\u0438\u044f</th>" +');
  js.push('      "<th>\\u041f\u0440\u043e\u0431\u043b\u0435\u043c\u0430</th><th>\\u041f\u0440\u043e\u0441\u0442\u043e\u0439</th>" +');
  js.push('      "<th>\\u0421\u0442\u0430\u0442\u0443\u0441</th></tr></thead><tbody>";');
  js.push('    res.tickets.forEach(function(t) {');
  js.push('      var secName = (mechSectionMap[t.sectionId] && mechSectionMap[t.sectionId].name) || t.sectionId;');
  js.push('      var min = Number(t.downtimeMin)||0;');
  js.push('      var dtStr = min>0 ? (Math.floor(min/60)?""+Math.floor(min/60)+"\\u0447 ":"")+(min%60)+"\\u043c" : "\\u2014";');
  js.push('      var statusColor = t.status==="\\u0417\u0430\u043a\u0440\u044b\u0442\u0430" ? "color:var(--ok)" : t.status==="\\u041d\u043e\u0432\u0430\u044f" ? "color:var(--err)" : "color:var(--warn)";');
  js.push('      h += "<tr><td>" + t.timeOpen + "</td><td>" + t.liniya + "</td><td>" + secName + "</td>" +');
  js.push('        "<td style=\\"max-width:200px;white-space:normal;font-size:12px\\">" + t.comment + "</td>" +');
  js.push('        "<td style=\\"text-align:center\\">" + dtStr + "</td>" +');
  js.push('        "<td style=\\"" + statusColor + "\\">" + t.status + "</td></tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── Статистика простоев ──
  js.push('function loadMechStats() {');
  js.push('  var el = document.getElementById("mechStatsCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("mechGetStats", {payload:{}}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div style=\\"padding:16px;color:var(--err)\\">⚠ "+(res.error||"")+"</div>"; toast(res.error,"err"); return; }');
  js.push('    var totalH = Math.floor(res.totalDowntimeMin/60), totalM = res.totalDowntimeMin%60;');
  js.push('    var h = "<div style=\\"display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:20px\\">";');
  js.push('    h += "<div class=\\"card\\" style=\\"text-align:center\\"><div style=\\"font-size:28px;font-weight:700;color:var(--err)\\">" + res.totalTickets + "</div><div style=\\"color:var(--sub);font-size:13px\\">\\u0432\u0441\u0435\u0433\u043e \u0437\u0430\u044f\u0432\u043e\u043a</div></div>";');
  js.push('    h += "<div class=\\"card\\" style=\\"text-align:center\\"><div style=\\"font-size:28px;font-weight:700;color:var(--warn)\\">" + res.openTickets + "</div><div style=\\"color:var(--sub);font-size:13px\\">\\u043e\u0442\u043a\u0440\u044b\u0442\u043e</div></div>";');
  js.push('    h += "<div class=\\"card\\" style=\\"text-align:center\\"><div style=\\"font-size:28px;font-weight:700;color:var(--err)\\">" + (totalH?""+totalH+"\\u0447 ":"") + totalM + "\\u043c</div><div style=\\"color:var(--sub);font-size:13px\\">\\u043e\u0431\u0449\u0438\u0439 \u043f\u0440\u043e\u0441\u0442\u043e\u0439</div></div>";');
  js.push('    h += "</div>";');
  js.push('    h += "<div class=\\"card\\"><div style=\\"font-weight:700;margin-bottom:12px\\">\\u041f\u043e \u043b\u0438\u043d\u0438\u044f\u043c</div>";');
  js.push('    Object.keys(res.byLiniya).forEach(function(lin) {');
  js.push('      var d = res.byLiniya[lin];');
  js.push('      var dH = Math.floor(d.downtime/60), dM = d.downtime%60;');
  js.push('      h += "<div style=\\"display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bd)\\">" +');
  js.push('        "<span>" + lin + "</span>" +');
  js.push('        "<span style=\\"color:var(--sub)\\">" + d.tickets + " \u0437\u0430\u044f\u0432. \u00b7 " + (dH?""+dH+"\\u0447 ":"") + dM + "\\u043c \u043f\u0440\u043e\u0441\u0442\u043e\u044f</span>" +');
  js.push('        "</div>";');
  js.push('    });');
  js.push('    h += "</div>";');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  // ════════════════════════════════════════════════════════
  // НОМЕНКЛАТУРА ТОВАРОВ (Продукты)
  // ════════════════════════════════════════════════════════
  js.push('var productsList = [];');
  js.push('');

  js.push('function loadProductsPage() {');
  js.push('  var el = document.getElementById("productsCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("getProducts", {}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">" + (res.error||"Ошибка") + "</div></div>"; return; }');
  js.push('    productsList = res.products;');
  js.push('    renderProductsPage(res.products);');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('var prodGroupState = {"\\u041b\u0430\u0432\u0430\u0448":true,"\\u0411\u0443\u043b\u043e\u0447\u043a\u0430":true,"\\u0425\u043b\u0435\u0431":true}; // открыт ли аккордеон');
  js.push('');

  js.push('function renderProductsPage(list) {');
  js.push('  var el = document.getElementById("productsCont");');
  js.push('  if (!el) return;');
  js.push('  if (!list.length) {');
  js.push('    el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">📦</div><div class=\\"empty-t\\">\\u0422\u043e\u0432\u0430\u0440\u044b \u0435\u0449\u0451 \u043d\u0435 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u044b</div></div>"; return;');
  js.push('  }');
  js.push('  // Группируем по классу');
  js.push('  var groups = {"\\u041b\u0430\u0432\u0430\u0448":[], "\\u0411\u0443\u043b\u043e\u0447\u043a\u0430":[], "\\u0425\u043b\u0435\u0431":[]};');
  js.push('  list.forEach(function(p) {');
  js.push('    var k = p.klass || "\\u041b\u0430\u0432\u0430\u0448";');
  js.push('    if (!groups[k]) groups[k] = [];');
  js.push('    groups[k].push(p);');
  js.push('  });');
  js.push('  var groupIcos = {"\\u041b\u0430\u0432\u0430\u0448":"\\uD83E\\uDD6B", "\\u0411\u0443\u043b\u043e\u0447\u043a\u0430":"\\uD83C\\uDF5E", "\\u0425\u043b\u0435\u0431":"\\uD83C\\uDF5F"};');
  js.push('  var h = "";');
  js.push('  ["\\u041b\u0430\u0432\u0430\u0448","\\u0411\u0443\u043b\u043e\u0447\u043a\u0430","\\u0425\u043b\u0435\u0431"].forEach(function(grp) {');
  js.push('    var items = groups[grp] || [];');
  js.push('    var gid = "pgrp_" + grp.replace(/[^a-z]/gi,"_");');
  js.push('    var isOpen = prodGroupState[grp] !== false;');
  js.push('    var ico = groupIcos[grp] || "\\uD83D\\uDCE6";');
  js.push('    h += "<div style=\\"margin-bottom:12px;border:1px solid var(--bd);border-radius:10px;overflow:hidden\\">";');
  js.push('    // Заголовок группы — кнопка свернуть/развернуть');
  js.push('    h += "<div onclick=\\"toggleProdGroup(\'" + grp + "\')\\""');
  js.push('       + " style=\\"display:flex;justify-content:space-between;align-items:center;padding:12px 16px;"');
  js.push('       + "background:var(--s2);cursor:pointer;user-select:none;\\">";');
  js.push('    h += "<div style=\\"font-weight:700;font-size:15px\\">" + ico + " " + grp');
  js.push('       + " <span style=\\"font-weight:400;font-size:13px;color:var(--sub)\\">(" + items.length + ")</span></div>";');
  js.push('    h += "<div style=\\"display:flex;gap:8px;align-items:center\\">";');
  js.push('    h += "<button onclick=\\"event.stopPropagation();openProductMdlInGroup(\'" + grp + "\')\\""');
  js.push('       + " class=\\"btn bp\\" style=\\"padding:4px 12px;font-size:12px\\">+ \\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c</button>";');
  js.push('    h += "<span style=\\"font-size:18px;color:var(--sub);width:20px;text-align:center\\">" + (isOpen?"\\u25B2":"\\u25BC") + "</span>";');
  js.push('    h += "</div></div>";');
  js.push('    // Тело группы');
  js.push('    h += "<div id=\\"" + gid + "\\" style=\\"display:" + (isOpen?"block":"none") + "\\">";');
  js.push('    if (!items.length) {');
  js.push('      h += "<div style=\\"padding:14px 16px;color:var(--sub);font-size:14px\\">\\u0422\u043e\u0432\u0430\u0440\u043e\u0432 \u043d\u0435\u0442 \u2014 \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u00ab+ \u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c\u00bb</div>";');
  js.push('    } else {');
  js.push('      h += "<table style=\\"width:100%;border-collapse:collapse\\"><thead><tr style=\\"background:rgba(255,255,255,.03)\\">"');
  js.push('         + "<th style=\\"padding:8px 14px;text-align:left;font-size:13px;color:var(--sub)\\">\\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435</th>"');
  js.push('         + "<th style=\\"padding:8px;text-align:center;font-size:13px;color:var(--sub)\\">\\u0415\u0434.</th>"');
  js.push('         + "<th style=\\"padding:8px;text-align:center;font-size:13px;color:var(--sub)\\">\\u0424\u0430\u0441\u043e\u0432\u043a\u0430</th>"');
  js.push('         + "<th style=\\"padding:8px;text-align:left;font-size:13px;color:var(--sub)\\">\\u041b\u0438\u043d\u0438\u044f</th>"');
  js.push('         + "<th></th></tr></thead><tbody>";');
  js.push('      items.forEach(function(p) {');
  js.push('        var safeName = p.name.replace(/\'/g,"\\\\\'");');
  js.push('        h += "<tr style=\\"border-top:1px solid var(--bd)\\">"');
  js.push('           + "<td style=\\"padding:9px 14px;font-weight:600\\">" + p.name + "</td>"');
  js.push('           + "<td style=\\"padding:9px 8px;text-align:center;color:var(--sub)\\">" + (p.unit||"\\u0448\\u0442") + "</td>"');
  js.push('           + "<td style=\\"padding:9px 8px;text-align:center\\">" + (p.pack||1) + "</td>"');
  js.push('           + "<td style=\\"padding:9px 8px;color:var(--sub);font-size:13px\\">" + (p.liniya||"\\u2014") + "</td>"');
  js.push('           + "<td style=\\"padding:9px 10px;text-align:right;white-space:nowrap\\">"');
  js.push('           + "<button class=\\\"btn bs\\\" data-pid=\\\""+p.id+"\\\" style=\\\"padding:3px 10px;font-size:12px;margin-right:4px\\\" onclick=\\\"editPrd(this)\\\">ред.</button>"'  );
  js.push('           + "<button class=\\\"btn bd\\\" data-pid=\\\""+p.id+"\\\" style=\\\"padding:3px 10px;font-size:12px\\\" onclick=\\\"delPrd(this)\\\">уд.</button>"'  );
  js.push('           + "</td></tr>";');
  js.push('      });');
  js.push('      h += "</tbody></table>";');
  js.push('    }');
  js.push('    h += "</div></div>";');
  js.push('  });');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('function toggleProdGroup(grp) {');
  js.push('  prodGroupState[grp] = !prodGroupState[grp];');
  js.push('  renderProductsPage(productsList);');
  js.push('}');
  js.push('');

  js.push('function openProductMdlInGroup(grp) {');
  js.push('  openProductMdl();');
  js.push('  // Предустанавливаем класс');
  js.push('  setTimeout(function() {');
  js.push('    var sel = document.getElementById("prdKlass");');
  js.push('    if (sel) sel.value = grp;');
  js.push('  }, 50);');
  js.push('}');
  js.push('');

  js.push('function openProductMdl() {');
  js.push('  document.getElementById("mdlProductTitle").textContent = "+ \\u041d\u043e\u0432\u044b\u0439 \u0442\u043e\u0432\u0430\u0440";');
  js.push('  document.getElementById("prdId").value = "";');
  js.push('  document.getElementById("prdKlass").value = "\\u041b\u0430\u0432\u0430\u0448";');
  js.push('  document.getElementById("prdName").value = "";');
  js.push('  document.getElementById("prdUnit").value = "\\u0448\\u0442";');
  js.push('  document.getElementById("prdPack").value = "1";');
  js.push('  var sel = document.getElementById("prdLine");');
  js.push('  sel.innerHTML = "<option value=\\"\\">\\u2014 \\u043d\\u0435 \\u043f\\u0440\\u0438\\u0432\\u044f\\u0437\\u0430\\u043d\\u0430 \\u2014</option>";');
  js.push('  (allLines||[]).forEach(function(l){ if(l.active){var o=document.createElement("option");o.value=l.name;o.textContent=l.name;sel.appendChild(o);} });');
  js.push('  showMdl("mdlProduct");');
  js.push('}');
  js.push('');

  js.push('function editPrd(btn) { editProductItem(btn.dataset.pid); }');
  js.push('function delPrd(btn) {');
  js.push('  var id = btn.dataset.pid;');
  js.push('  var p = productsList.filter(function(x){return x.id===id;})[0];');
  js.push('  if (p) deleteProductItem(id, p.name);');
  js.push('}');
  js.push('');

  js.push('function editProductItem(id) {');
  js.push('  var p = productsList.filter(function(x){ return x.id===id; })[0];');
  js.push('  if (!p) return;');
  js.push('  openProductMdl();');
  js.push('  document.getElementById("mdlProductTitle").textContent = "\\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0442\u043e\u0432\u0430\u0440";');
  js.push('  document.getElementById("prdId").value = p.id;');
  js.push('  document.getElementById("prdName").value = p.name;');
  js.push('  document.getElementById("prdUnit").value = p.unit||"\\u0448\\u0442";');
  js.push('  document.getElementById("prdPack").value = p.pack||1;');
  js.push('  setTimeout(function() {');
  js.push('    document.getElementById("prdKlass").value = p.klass||"\\u041b\u0430\u0432\u0430\u0448";');
  js.push('    document.getElementById("prdLine").value = p.liniya||"";');
  js.push('  }, 50);');
  js.push('}');
  js.push('');

  js.push('function saveProductItem() {');
  js.push('  var name = document.getElementById("prdName").value.trim();');
  js.push('  if (!name) { toast("\\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435","err"); return; }');
  js.push('  var payload = {');
  js.push('    id:     document.getElementById("prdId").value || undefined,');
  js.push('    name:   name,');
  js.push('    klass:  document.getElementById("prdKlass").value || "\\u041b\u0430\u0432\u0430\u0448",');
  js.push('    unit:   document.getElementById("prdUnit").value.trim() || "\\u0448\\u0442",');
  js.push('    pack:   parseInt(document.getElementById("prdPack").value) || 1,');
  js.push('    liniya: document.getElementById("prdLine").value');
  js.push('  };');
  js.push('  srv("saveProduct", {payload:payload}, function(res) {');
  js.push('    if (res.ok) { toast("\\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e","ok"); closeMdl("mdlProduct"); loadProductsPage(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function deleteProductItem(id, name) {');
  js.push('  if (!confirm("\\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u00ab" + name + "\\u00bb?")) return;');
  js.push('  srv("deleteProduct", {payload:{id:id}}, function(res) {');
  js.push('    if (res.ok) { toast("\\u0423\u0434\u0430\u043b\u0435\u043d\u043e","ok"); loadProductsPage(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // ════════════════════════════════════════════════════════
  // HR СИСТЕМА — CLIENT JS
  // ════════════════════════════════════════════════════════
  js.push('var hrDicts = null; // кэш справочников');
  js.push('var hrCurrentEmpId = null;');
  js.push('');

  // ── Дашборд ──
  js.push('function loadHRDashboard() {');
  js.push('  var el = document.getElementById("hrDashCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("hrGetStats", {}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    srv("hrGetStaffing", {}, function(staffRes) { renderHRDashboard(res, staffRes.ok ? staffRes : null); });');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderHRDashboard(res, staffRes) {');
  js.push('  var el = document.getElementById("hrDashCont");');
  js.push('  if (!el) return;');
  js.push('  var h = "";');
  js.push('  h += "<div class=\\"sg-lg\\">";');
  js.push('  h += "<div class=\\"sc-lg\\"><div class=\\"sv\\" style=\\"color:var(--g)\\">" + res.active + "</div><div class=\\"sl\\">на штате</div></div>";');
  js.push('  h += "<div class=\\"sc-lg\\"><div class=\\"sv\\" style=\\"color:var(--err)\\">" + res.fired + "</div><div class=\\"sl\\">уволено</div></div>";');
  js.push('  h += "<div class=\\"sc-lg\\"><div class=\\"sv\\">" + res.official + "</div><div class=\\"sl\\">официальных</div></div>";');
  js.push('  h += "<div class=\\"sc-lg\\"><div class=\\"sv\\" style=\\"color:var(--warn)\\">" + res.unofficial + "</div><div class=\\"sl\\">неофициальных</div></div>";');
  js.push('  h += "<div class=\\"sc-lg\\"><div class=\\"sv\\" style=\\"color:var(--ok)\\">" + res.newThisMonth + "</div><div class=\\"sl\\">новых за месяц</div></div>";');
  js.push('  h += "<div class=\\"sc-lg\\"><div class=\\"sv\\">" + res.avgSeniority + "</div><div class=\\"sl\\">средний стаж, лет</div></div>";');
  js.push('  h += "</div>";');

  js.push('  h += "<div class=\\"dash-cols\\">";');
  js.push('  h += "<div class=\\"dash-main\\">";');
  js.push('  h += "<div class=\\"card\\" style=\\"background:rgba(249,168,37,.1);border:1px solid var(--g)\\">";');
  js.push('  h += "<div style=\\"font-size:13px;color:var(--sub)\\">Фонд зарплаты (активные)</div>";');
  js.push('  h += "<div style=\\"font-size:24px;font-weight:700;color:var(--g)\\">" + res.totalFund.toLocaleString() + " сум</div></div>";');
  js.push('  if (res.byDept) {');
  js.push('    var deptKeys = Object.keys(res.byDept);');
  js.push('    if (deptKeys.length) {');
  js.push('      h += "<div class=\\"card\\"><div class=\\"card-t\\">Численность по отделам</div>";');
  js.push('      deptKeys.sort(function(a,b){return res.byDept[b]-res.byDept[a];}).forEach(function(d) {');
  js.push('        var cnt = res.byDept[d];');
  js.push('        var pct = res.active>0 ? Math.round(cnt/res.active*100) : 0;');
  js.push('        h += "<div style=\\"padding:6px 0;border-bottom:1px solid var(--bd)\\">";');
  js.push('        h += "<div style=\\"display:flex;justify-content:space-between;margin-bottom:4px\\"><span style=\\"font-size:14px\\">" + d + "</span><span style=\\"font-weight:700;color:var(--g)\\">" + cnt + " чел.</span></div>";');
  js.push('        h += "<div style=\\"height:6px;border-radius:3px;background:rgba(255,255,255,.08)\\"><div style=\\"height:100%;width:" + Math.min(pct,100) + "%;background:var(--g);border-radius:3px\\"></div></div>";');
  js.push('        h += "</div>";');
  js.push('      });');
  js.push('      h += "</div>";');
  js.push('    }');
  js.push('  }');
  js.push('  h += "</div>";');

  js.push('  h += "<div class=\\"dash-side\\">";');
  js.push('  if (staffRes && staffRes.byDept) {');
  js.push('    var sDeptKeys = Object.keys(staffRes.byDept);');
  js.push('    h += "<div class=\\"card\\"><div class=\\"card-t\\">Штат план / факт</div>";');
  js.push('    if (!sDeptKeys.length) {');
  js.push('      h += "<div style=\\"font-size:13px;color:var(--sub)\\">Нет данных штатного расписания</div>";');
  js.push('    } else {');
  js.push('      sDeptKeys.forEach(function(d) {');
  js.push('        var rows = staffRes.byDept[d];');
  js.push('        var plan = rows.reduce(function(s,r){return s+(r.units||0);},0);');
  js.push('        var fact = rows.reduce(function(s,r){return s+(r.actual||0);},0);');
  js.push('        var gap  = plan - fact;');
  js.push('        var gapColor = gap>0 ? "var(--err)" : "var(--ok)";');
  js.push('        h += "<div style=\\"display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--bd)\\">";');
  js.push('        h += "<span style=\\"font-size:13px\\">" + d + "</span>";');
  js.push('        h += "<span style=\\"font-size:13px\\"><b>" + fact + "</b> / " + plan + (gap>0 ? " <span style=\\"color:"+gapColor+";font-weight:700\\">(−"+gap+")</span>" : "") + "</span>";');
  js.push('        h += "</div>";');
  js.push('      });');
  js.push('    }');
  js.push('    h += "</div>";');

  js.push('    var vacRows = (staffRes.staffing||[]).filter(function(r){ return (r.vacancy||0) > 0; });');
  js.push('    vacRows.sort(function(a,b){ return (b.vacancy||0)-(a.vacancy||0); });');
  js.push('    h += "<div class=\\"card\\"><div class=\\"card-t\\">⚠️ Вакансии (надо нанять)</div>";');
  js.push('    if (!vacRows.length) {');
  js.push('      h += "<div style=\\"font-size:13px;color:var(--ok)\\">✔ Все ставки закрыты</div>";');
  js.push('    } else {');
  js.push('      vacRows.forEach(function(r) {');
  js.push('        h += "<div style=\\"padding:7px 0;border-bottom:1px solid var(--bd)\\">";');
  js.push('        h += "<div style=\\"font-size:13px;font-weight:600\\">" + r.position + "</div>";');
  js.push('        h += "<div style=\\"display:flex;justify-content:space-between;font-size:12px;color:var(--sub)\\"><span>" + r.dept + "</span><span style=\\"color:var(--err);font-weight:700\\">не хватает: " + r.vacancy + "</span></div>";');
  js.push('        h += "</div>";');
  js.push('      });');
  js.push('    }');
  js.push('    h += "</div>";');
  js.push('  }');
  js.push('  h += "</div>";');
  js.push('  h += "</div>";');

  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');

  // ── Список сотрудников ──
  js.push('var hrAllEmployees = []; // кэш для клиентского поиска/фильтрации');
  js.push('');

  js.push('function loadHREmployees() {');
  js.push('  var el = document.getElementById("hrEmpCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  var filter = document.getElementById("hrFilterState") ? (document.getElementById("hrFilterState").value||"active") : "active";');
  js.push('  srv("hrGetEmployees", {payload:{filter:filter}}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    hrAllEmployees = res.employees;');
  js.push('    // Заполняем фильтр отделов');
  js.push('    var dSel = document.getElementById("hrFilterDept");');
  js.push('    if (dSel && dSel.options.length <= 1) {');
  js.push('      var seenDepts = {};');
  js.push('      res.employees.forEach(function(e){ if(e.dept) seenDepts[e.dept]=true; });');
  js.push('      Object.keys(seenDepts).sort().forEach(function(d){');
  js.push('        var o = document.createElement("option"); o.value=d; o.textContent=d; dSel.appendChild(o);');
  js.push('      });');
  js.push('    }');
  js.push('    hrRenderFiltered();');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function hrRenderFiltered() {');
  js.push('  var q    = (document.getElementById("hrSearch")    ? document.getElementById("hrSearch").value    : "").toLowerCase().trim();');
  js.push('  var dept = (document.getElementById("hrFilterDept") ? document.getElementById("hrFilterDept").value : "").trim();');
  js.push('  var list = hrAllEmployees.filter(function(e) {');
  js.push('    if (dept && e.dept !== dept) return false;');
  js.push('    if (q && (e.fio||"").toLowerCase().indexOf(q)===-1 && (e.dept||"").toLowerCase().indexOf(q)===-1 && (e.position||"").toLowerCase().indexOf(q)===-1) return false;');
  js.push('    return true;');
  js.push('  });');
  js.push('  renderHREmpList(list, hrAllEmployees.length);');
  js.push('}');
  js.push('');

  js.push('function renderHREmpList(list, total) {');
  js.push('  var el = document.getElementById("hrEmpCont");');
  js.push('  if (!el) return;');
  js.push('  if (!list.length) { el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-ico\\">\\uD83D\\uDC64</div><div class=\\"empty-t\\">\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0438 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b</div></div>"; return; }');
  js.push('  var h = "<div style=\\"font-size:13px;color:var(--sub);margin-bottom:8px\\">\u041d\u0430\u0439\u0434\u0435\u043d\u043e: " + list.length + " \u0438\u0437 " + total + "</div>";');
  js.push('  h += "<div class=\\"tw\\"><table><thead><tr>";');
  js.push('  h += "<th>\u0424\u0418\u041e</th><th>\u041e\u0442\u0434\u0435\u043b</th><th>\u0414\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c</th>";');
  js.push('  h += "<th>\u0421\u0442\u0430\u0436</th><th>\u041a\u0430\u0442.</th><th>\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435</th><th></th></tr></thead><tbody>";');
  js.push('  list.forEach(function(e) {');
  js.push('    var stateColor = e.stateActive ? "color:var(--ok)" : "color:var(--err)";');
  js.push('    var catColor = e.category==="C" ? "background:rgba(102,187,106,.2);color:var(--ok)" : e.category==="B" ? "background:rgba(249,168,37,.2);color:var(--g)" : "background:rgba(239,83,80,.15);color:var(--err)";');
  js.push('    h += "<tr style=\\"cursor:pointer\\" onclick=\\"openHRCard(\'" + e.id + "\')\\">";');
  js.push('    h += "<td style=\\"font-weight:600\\">" + e.fio + "</td>";');
  js.push('    h += "<td style=\\"font-size:13px\\">" + (e.dept||"\u2014") + "</td>";');
  js.push('    h += "<td style=\\"font-size:13px;color:var(--sub)\\">" + (e.position||"\u2014") + "</td>";');
  js.push('    h += "<td style=\\"font-size:13px\\">" + (e.seniority||"\u2014") + "</td>";');
  js.push('    h += "<td><span style=\\"font-size:12px;font-weight:700;padding:2px 8px;border-radius:6px;" + catColor + "\\">" + (e.category||"A") + "</span></td>";');
  js.push('    h += "<td style=\\"" + stateColor + ";font-size:13px\\">" + e.state + "</td>";');
  js.push('    h += "<td><button class=\\"btn bs\\" style=\\"padding:3px 10px;font-size:12px\\" onclick=\\"event.stopPropagation();openHRCard(\'" + e.id + "\')\\">\u041a\u0430\u0440\u0442\u0430</button></td>";');
  js.push('    h += "</tr>";');
  js.push('  });');
  js.push('  h += "</tbody></table></div>";');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('function hrSearchEmployees(q) { hrRenderFiltered(); }');
  js.push('');

  // ── Личная карточка ──
  js.push('function openHRCard(id) {');
  js.push('  hrCurrentEmpId = id;');
  js.push('  srv("hrGetEmployee", {payload:{id:id}}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    renderHRCard(res.employee);');
  js.push('    showMdl("mdlHRCard");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderHRCard(e) {');
  js.push('  var el = document.getElementById("hrCardCont");');
  js.push('  if (!el) return;');
  js.push('  var stateColor = e.stateActive ? "var(--ok)" : "var(--err)";');
  js.push('  var h = "<div style=\\"display:flex;align-items:flex-start;gap:14px;margin-bottom:16px\\">";');
  js.push('  h += "<div style=\\"width:56px;height:56px;border-radius:50%;background:var(--g);color:#000;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;flex-shrink:0\\">" + (e.fio||"?")[0] + "</div>";');
  js.push('  h += "<div><div style=\\"font-size:17px;font-weight:700\\">" + e.fio + "</div>";');
  js.push('  h += "<div style=\\"font-size:13px;color:var(--sub);margin-top:2px\\">" + (e.dept||"") + " · " + (e.position||"") + "</div>";');
  js.push('  h += "<div style=\\"margin-top:4px;display:flex;gap:6px;align-items:center\\">";');
  js.push('  h += "<span style=\\"font-size:12px;padding:2px 10px;border-radius:6px;background:rgba(255,255,255,.1);color:" + stateColor + "\\">" + e.state + "</span>";');
  js.push('  var catColor = e.category==="C" ? "#66BB6A" : e.category==="B" ? "var(--g)" : "var(--err)";');
  js.push('  var catLabel = e.category==="C" ? "\u041a\u0430\u0442. C (\u043e\u043f\u044b\u0442\u043d\u044b\u0439)" : e.category==="B" ? "\u041a\u0430\u0442. B (\u0440\u0430\u0437\u0432\u0438\u0432\u0430\u044e\u0449\u0438\u0439\u0441\u044f)" : "\u041a\u0430\u0442. A (\u043d\u043e\u0432\u0438\u0447\u043e\u043a)";');
  js.push('  h += "<span style=\\"font-size:12px;padding:2px 10px;border-radius:6px;font-weight:700;background:rgba(255,255,255,.08);color:" + catColor + "\\">" + catLabel + "</span>";');
  js.push('  h += "</div></div></div>";');
  // Поля карточки — используем правильные имена полей
  js.push('  var fields = [');
  js.push('    ["\u041e\u0442\u0434\u0435\u043b", e.dept],');
  js.push('    ["\u0414\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c", e.position],');
  js.push('    ["\u0414\u0430\u0442\u0430 \u043f\u0440\u0438\u0451\u043c\u0430", e.hireDate],');
  js.push('    ["\u0421\u0442\u0430\u0436", e.seniority],');
  js.push('    ["\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f", e.category ? e.category + (e.category==="A" ? " (\u0434\u043e 3 \u043c\u0435\u0441.)" : e.category==="B" ? " (3 \u043c\u0435\u0441. \u2013 1 \u0433\u043e\u0434)" : " (1 \u0433\u043e\u0434 \u0438 \u0432\u044b\u0448\u0435)") : ""],');
  js.push('    ["\u0414\u0430\u0442\u0430 \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f", e.birthDate],');
  js.push('    ["\u0422\u0435\u043b\u0435\u0444\u043e\u043d", e.phone],');
  js.push('    ["\u0410\u0434\u0440\u0435\u0441", e.address],');
  js.push('    ["\u041f\u0430\u0441\u043f\u043e\u0440\u0442", e.passport],');
  js.push('    ["\u0418\u041d\u041f\u0421", e.inps],');
  js.push('    ["\u0421\u0442\u0430\u0442\u0443\u0441", e.status],');
  js.push('    ["\u041e\u043a\u043b\u0430\u0434", e.salary ? e.salary.toLocaleString()+" \u0441\u0443\u043c" : ""],');
  js.push('    ["\u041d\u0430\u0434\u0431\u0430\u0432\u043a\u0430", e.bonus ? e.bonus.toLocaleString()+" \u0441\u0443\u043c" : ""],');
  js.push('    ["\u0418\u0441\u043f\u044b\u0442. \u0441\u0440\u043e\u043a \u0434\u043e", e.probation]');
  js.push('  ];');
  js.push('  h += "<div style=\\"display:grid;gap:2px\\">";');
  js.push('  fields.forEach(function(f) {');
  js.push('    if (!f[1]) return;');
  js.push('    h += "<div style=\\"display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--bd)\\"><span style=\\"color:var(--sub);font-size:13px\\">" + f[0] + "</span><span style=\\"font-size:13px;text-align:right;max-width:65%\\">" + f[1] + "</span></div>";');
  js.push('  });');
  js.push('  h += "</div>";');
  // Кнопки действий
  js.push('  h += "<div style=\\"display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px\\">";');
  js.push('  if (e.stateActive) {');
  js.push('    h += "<button class=\\"btn bs\\" data-id=\\""+e.id+"\\" data-fio=\\""+e.fio.replace(/"/g,"&quot;")+"\\" onclick=\\"hrOpenMove(this)\\">\u041f\u0435\u0440\u0435\u043c\u0435\u0441\u0442\u0438\u0442\u044c</button>";');
  js.push('    h += "<button class=\\"btn bs\\" data-id=\\""+e.id+"\\" data-fio=\\""+e.fio.replace(/"/g,"&quot;")+"\\" onclick=\\"hrOpenLeave(this)\\">\u041e\u0442\u043f\u0443\u0441\u043a</button>";');
  js.push('    h += "<button class=\\"btn bs\\" data-id=\\""+e.id+"\\" data-fio=\\""+e.fio.replace(/"/g,"&quot;")+"\\" onclick=\\"hrOpenSick(this)\\">\u0411\u043e\u043b\u044c\u043d\u0438\u0447\u043d\u044b\u0439</button>";');
  js.push('    h += "<button class=\\"btn bd\\" data-id=\\""+e.id+"\\" data-fio=\\""+e.fio.replace(/"/g,"&quot;")+"\\" onclick=\\"hrOpenFire(this)\\">\u0423\u0432\u043e\u043b\u0438\u0442\u044c</button>";');
  js.push('    if (e.probation) {');
  js.push('      h += "<button class=\\"btn bp\\" style=\\"grid-column:span 2\\" data-id=\\""+e.id+"\\" data-fio=\\""+e.fio.replace(/"/g,"&quot;")+"\\" onclick=\\"hrDoEndTrial(this)\\">\u0417\u0430\u0447\u0438\u0441\u043b\u0438\u0442\u044c \u043f\u043e\u0441\u0442\u043e\u044f\u043d\u043d\u043e</button>";');
  js.push('    }');
  js.push('  }');
  js.push('  h += "</div>";');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');

  // ── Форма приёма ──
  js.push('var hrDicts = null;');
  js.push('function loadHireForm() {');
  js.push('  var el = document.getElementById("hrHireCont");');
  js.push('  if (!el) return;');
  js.push('  if (hrDicts) { renderHireForm(el); return; }');
  js.push('  srv("hrGetConfig", {}, function(res) {');
  js.push('    hrDicts = res.ok ? res : {depts:[], positions:[], statuses:[]};');
  js.push('    renderHireForm(el);');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function openHireForm() { nav("hr-hire"); }');
  js.push('');

  js.push('function renderHireForm(el) {');
  js.push('  var depts = (hrDicts && hrDicts.depts) || [];');
  js.push('  var positions = (hrDicts && hrDicts.positions) || [];');
  js.push('  var h = "<div style=\\"display:grid;gap:14px\\"><h3 style=\\"font-size:16px\\">\u0414\u0430\u043d\u043d\u044b\u0435 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0430</h3>";');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">\u0424\u0418\u041e *</label><input class=\\"fi\\" id=\\"eFio\\" placeholder=\\"\u0424\u0430\u043c\u0438\u043b\u0438\u044f \u0418\u043c\u044f \u041e\u0442\u0447\u0435\u0441\u0442\u0432\u043e\\"></div>";');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">\u041e\u0442\u0434\u0435\u043b *</label><select class=\\"fs\\" id=\\"eDept\\" onchange=\\"checkPositionSalary()\\"><option value=\\"\\">\u2014</option>" + depts.map(function(d){return "<option>"+d+"</option>";}).join("") + "</select></div>";');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">\u0414\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c *</label><select class=\\"fs\\" id=\\"ePos\\" onchange=\\"checkPositionSalary()\\"><option value=\\"\\">\u2014</option>" + positions.map(function(p){return "<option>"+p+"</option>";}).join("") + "</select></div>";');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">\u0414\u0430\u0442\u0430 \u043f\u0440\u0438\u0451\u043c\u0430 *</label><input type=\\"date\\" class=\\"fi\\" id=\\"eDateHire\\"></div>";');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">\u0414\u0430\u0442\u0430 \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f</label><input type=\\"date\\" class=\\"fi\\" id=\\"eBirth\\"></div>";');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">\u0422\u0435\u043b\u0435\u0444\u043e\u043d</label><input class=\\"fi\\" id=\\"ePhone\\" placeholder=\\"+998 90 000 00 00\\"></div>";');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">\u041f\u0430\u0441\u043f\u043e\u0440\u0442</label><input class=\\"fi\\" id=\\"ePassport\\" placeholder=\\"AB 1234567\\"></div>";');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">\u0410\u0434\u0440\u0435\u0441</label><input class=\\"fi\\" id=\\"eAddress\\"></div>";');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">\u0421\u0442\u0430\u0442\u0443\u0441</label><select class=\\"fs\\" id=\\"eStatus\\"><option>\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u0439</option><option>\u041d\u0435\u043e\u0444\u0438\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u0439</option></select></div>";');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">\u0422\u0438\u043f \u043f\u0440\u0438\u0451\u043c\u0430</label><select class=\\"fs\\" id=\\"eHireType\\" onchange=\\"toggleTrialDate()\\"><option value=\\"\u041f\u043e\u0441\u0442\u043e\u044f\u043d\u043d\u044b\u0439\\">\u041f\u043e\u0441\u0442\u043e\u044f\u043d\u043d\u044b\u0439</option><option value=\\"\u0418\u0441\u043f\u044b\u0442\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0439\\">\u0418\u0441\u043f\u044b\u0442\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0441\u0440\u043e\u043a</option></select></div>";');
  js.push('  h += "<div class=\\"fr\\" id=\\"trialDateRow\\" style=\\"display:none\\"><label class=\\"fl\\">\u041e\u043a\u043e\u043d\u0447\u0430\u043d\u0438\u0435 \u0438\u0441\u043f\u044b\u0442\u0430\u0442\u0435\u043b\u044c\u043d\u043e\u0433\u043e</label><input type=\\"date\\" class=\\"fi\\" id=\\"eTrialEnd\\"></div>";');
  js.push('  h += "<div class=\\"fr\\" id=\\"eSalaryRow\\"><label class=\\"fl\\">\u041e\u043a\u043b\u0430\u0434 (\u0441\u0443\u043c)</label><input type=\\"number\\" class=\\"fi\\" id=\\"eSalary\\" placeholder=\\"0\\" min=\\"0\\"></div>";');
  js.push('  h += "<div class=\\"fr\\" id=\\"eCatInfoRow\\" style=\\"display:none\\">";');
  js.push('  h += "<label class=\\"fl\\">\u041e\u043a\u043b\u0430\u0434 \u043f\u043e \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438</label>";');
  js.push('  h += "<div style=\\"background:rgba(102,187,106,.1);border:1px solid var(--ok);border-radius:10px;padding:12px 14px\\">";');
  js.push('  h += "<div style=\\"font-size:13px;color:var(--sub);margin-bottom:6px\\">\u041d\u043e\u0432\u044b\u0439 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a \u043d\u0430\u0447\u0438\u043d\u0430\u0435\u0442 \u0441 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438 A. \u041e\u043a\u043b\u0430\u0434 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438 \u0432\u044b\u0440\u0430\u0441\u0442\u0451\u0442 \u043f\u043e \u0441\u0442\u0430\u0436\u0443.</div>";');
  js.push('  h += "<div id=\\"eCatInfoText\\" style=\\"font-size:14px;line-height:1.8\\"></div>";');
  js.push('  h += "</div></div>";');
  js.push('  h += "<input type=\\"hidden\\" id=\\"eSalaryFromCat\\">";');
  js.push('  h += "<button class=\\"btn bp\\" style=\\"width:100%;padding:16px;margin-top:8px\\" onclick=\\"saveHireForm()\\">\u2714 \u0417\u0430\u043f\u0438\u0441\u0430\u0442\u044c \u043f\u0440\u0438\u0451\u043c</button>";');
  js.push('  h += "</div>";');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('function toggleTrialDate() {');
  js.push('  var sel = document.getElementById("eHireType");');
  js.push('  var row = document.getElementById("trialDateRow");');
  js.push('  if (row) row.style.display = sel && sel.value==="\u0418\u0441\u043f\u044b\u0442\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0439" ? "grid" : "none";');
  js.push('}');
  js.push('');

  js.push('function checkPositionSalary() {');
  js.push('  var dept = (document.getElementById("eDept")||{}).value||"";');
  js.push('  var pos  = (document.getElementById("ePos")||{}).value||"";');
  js.push('  if (!dept||!pos) return;');
  js.push('  srv("hrGetSalaryForPosition",{payload:{dept:dept,position:pos}},function(res){');
  js.push('    if (!res.ok) return;');
  js.push('    var salRow = document.getElementById("eSalaryRow");');
  js.push('    var catRow = document.getElementById("eCatInfoRow");');
  js.push('    if (res.useCat) {');
  js.push('      salRow.style.display = "none";');
  js.push('      catRow.style.display = "";');
  js.push('      document.getElementById("eSalaryFromCat").value = res.salaryA||0;');
  js.push('      document.getElementById("eCatInfoText").innerHTML =');
  js.push('        "<span style=\\"color:var(--err)\\">\u041a\u0430\u0442. A (\u043f\u0440\u0438 \u043f\u0440\u0438\u0451\u043c\u0435): <b>"+(res.salaryA||0).toLocaleString()+"</b> \u0441\u0443\u043c</span><br>" +');
  js.push('        "<span style=\\"color:var(--warn)\\">\u041a\u0430\u0442. B (3\u201312 \u043c\u0435\u0441.): "+(res.salaryB||0).toLocaleString()+" \u0441\u0443\u043c</span><br>" +');
  js.push('        "<span style=\\"color:var(--ok)\\">\u041a\u0430\u0442. C (\u0447\u0435\u0440\u0435\u0437 1 \u0433\u043e\u0434): "+(res.salaryC||0).toLocaleString()+" \u0441\u0443\u043c</span>";');
  js.push('    } else {');
  js.push('      salRow.style.display = "";');
  js.push('      catRow.style.display = "none";');
  js.push('      document.getElementById("eSalaryFromCat").value = "";');
  js.push('      if (res.salary) document.getElementById("eSalary").value = res.salary;');
  js.push('    }');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function saveHireForm() {');
  js.push('  var fio = (document.getElementById("eFio")||{}).value||"";');
  js.push('  var dept = (document.getElementById("eDept")||{}).value||"";');
  js.push('  var pos  = (document.getElementById("ePos")||{}).value||"";');
  js.push('  var dateHire = (document.getElementById("eDateHire")||{}).value||"";');
  js.push('  if (!fio||!dept||!pos||!dateHire) { toast("\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0435 \u043f\u043e\u043b\u044f","err"); return; }');
  js.push('  var fromCat = (document.getElementById("eSalaryFromCat")||{}).value;');
  js.push('  var salary = fromCat ? (parseInt(fromCat)||0) : (parseInt((document.getElementById("eSalary")||{}).value)||0);');
  js.push('  var payload = {');
  js.push('    fio:fio, dept:dept, position:pos,');
  js.push('    hireDate: dateHire,');
  js.push('    birthDate: (document.getElementById("eBirth")||{}).value||"",');
  js.push('    phone: (document.getElementById("ePhone")||{}).value||"",');
  js.push('    passport: (document.getElementById("ePassport")||{}).value||"",');
  js.push('    address: (document.getElementById("eAddress")||{}).value||"",');
  js.push('    status: (document.getElementById("eStatus")||{}).value||"\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u0439",');
  js.push('    probation: (document.getElementById("eHireType")||{}).value==="\u0418\u0441\u043f\u044b\u0442\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0439" ? ((document.getElementById("eTrialEnd")||{}).value||"") : "",');
  js.push('    salary: salary');
  js.push('  };');
  js.push('  srv("hrHireEmployee", {payload:payload}, function(res) {');
  js.push('    if (res.ok) { toast(res.message||"\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a \u0437\u0430\u043f\u0438\u0441\u0430\u043d","ok"); nav("hr-employees"); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── Отпуск / Больничный ──
  js.push('function openLeaveMdlFor(id, fio) { hrCurrentEmpId=id; document.getElementById("leaveEmpName").textContent=fio; document.getElementById("leaveType").value="\\u041e\\u0442\\u043f\\u0443\\u0441\\u043a"; showMdl("mdlLeave"); }');
  js.push('function openSickMdlFor(id, fio)  { hrCurrentEmpId=id; document.getElementById("leaveEmpName").textContent=fio; document.getElementById("leaveType").value="\\u0411\\u043e\\u043b\\u044c\\u043d\\u0438\\u0447\\u043d\\u044b\\u0439"; showMdl("mdlLeave"); }');
  js.push('function hrOpenLeave(btn) { openLeaveMdlFor(btn.dataset.id, btn.dataset.fio); }');
  js.push('function hrOpenSick(btn)  { openSickMdlFor(btn.dataset.id, btn.dataset.fio); }');
  js.push('function hrGoToList()     { nav("hr-employees"); }');
  js.push('function openLeaveMdl() { hrCurrentEmpId=null; document.getElementById("leaveEmpName").textContent=""; showMdl("mdlLeave"); }');
  js.push('');

  js.push('function submitLeave() {');
  js.push('  var ds = document.getElementById("leaveStart").value;');
  js.push('  var de = document.getElementById("leaveEnd").value;');
  js.push('  var lt = document.getElementById("leaveType").value;');
  js.push('  if (!hrCurrentEmpId || !ds || !de) { toast("\\u0417\\u0430\\u043f\\u043e\\u043b\\u043d\\u0438\\u0442\\u0435 \\u0432\\u0441\\u0435 \\u043f\\u043e\\u043b\\u044f","err"); return; }');
  js.push('  function isoToRu(s){ var p=s.split("-"); return p.length===3?p[2]+"."+p[1]+"."+p[0]:s; }');
  js.push('  srv("hrAddLeave", {payload:{empId:hrCurrentEmpId, leaveType:lt, dateStart:isoToRu(ds), dateEnd:isoToRu(de), comment:(document.getElementById("leaveCmt")||{}).value||""}}, function(res) {');
  js.push('    if (res.ok) { toast("\\u0417\\u0430\\u043f\\u0438\\u0441\\u0430\\u043d\\u043e","ok"); closeMdl("mdlLeave"); loadHRLeaves(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function loadHRLeaves() {');
  js.push('  var el = document.getElementById("hrLeavesCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("hrGetLeaves", {payload:{}}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    if (!res.leaves.length) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">\u0417\u0430\u043f\u0438\u0441\u0435\u0439 \u043d\u0435\u0442</div></div>"; return; }');
  js.push('    var h = "<div class=\\"tw\\"><table><thead><tr><th>\u0422\u0438\u043f</th><th>\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a</th><th>\u041d\u0430\u0447\u0430\u043b\u043e</th><th>\u041e\u043a\u043e\u043d\u0447\u0430\u043d\u0438\u0435</th><th>\u041a\u043e\u043c\u043c\u0435\u043d\u0442</th></tr></thead><tbody>";');
  js.push('    res.leaves.forEach(function(m) {');
  js.push('      var c = m.type==="\u0411\u043e\u043b\u044c\u043d\u0438\u0447\u043d\u044b\u0439" ? "color:var(--err)" : "color:var(--warn)";');
  js.push('      h += "<tr><td style=\\"" + c + "\\">" + m.type + "</td><td>" + m.fio + "</td><td>" + (m.dateStart||"") + "</td><td>" + (m.dateEnd||"") + "</td><td style=\\"font-size:12px;color:var(--sub)\\">" + (m.comment||"") + "</td></tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    if (el) el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── Увольнение ──
  js.push('function hrOpenFire(btn) { openFireMdlFor(btn.dataset.id, btn.dataset.fio); }');
  js.push('');

  // ── Перевод на постоянный ──
  js.push('function hrDoEndTrial(btn) { hrEndTrial(btn.dataset.id, btn.dataset.fio); }');
  js.push('function hrEndTrial(id, fio) {');
  js.push('  if (!confirm(fio + " \u2014 \u0437\u0430\u0447\u0438\u0441\u043b\u0438\u0442\u044c \u043d\u0430 \u043f\u043e\u0441\u0442\u043e\u044f\u043d\u043d\u0443\u044e?")) return;');
  js.push('  srv("hrGetEmployee", {payload:{id:id}}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    srv("hrUpdateEmployee", {payload:{rowIdx:res.employee.rowIdx, probation:""}}, function(r) {');
  js.push('      if (r.ok) { toast("\u041f\u0435\u0440\u0435\u0432\u0435\u0434\u0451\u043d(\u0430) \u043d\u0430 \u043f\u043e\u0441\u0442\u043e\u044f\u043d\u043d\u0443\u044e","ok"); closeMdl("mdlHRCard"); loadHREmployees(); }');
  js.push('      else toast(r.error,"err");');
  js.push('    });');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── История движения ──
  js.push('var hrMoveCurrentEmpId = null;');
  js.push('');

  // ── Уволенные + форма увольнения ──
  js.push('var fireCurrentEmpId = null;');
  js.push('var fireEmpCache = [];');
  js.push('');

  js.push('function loadHRFired() {');
  js.push('  var el = document.getElementById("hrFiredCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("hrGetEmployees", {payload:{filter:"fired"}}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    if (!res.employees.length) {');
  js.push('      if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-ico\\">\u2705</div><div class=\\"empty-t\\">\u0423\u0432\u043e\u043b\u0435\u043d\u043d\u044b\u0445 \u043d\u0435\u0442</div></div>"; return;');
  js.push('    }');
  js.push('    var h = "<div style=\\"font-size:13px;color:var(--sub);margin-bottom:10px\\">\u0423\u0432\u043e\u043b\u0435\u043d\u043e: <b>" + res.employees.length + "</b> \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u043e\u0432</div>";');
  js.push('    h += "<div class=\\"tw\\"><table><thead><tr>";');
  js.push('    h += "<th>\u0424\u0418\u041e</th><th>\u041e\u0442\u0434\u0435\u043b</th><th>\u0414\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c</th>";');
  js.push('    h += "<th>\u0414\u0430\u0442\u0430 \u043f\u0440\u0438\u0451\u043c\u0430</th><th>\u0421\u0442\u0430\u0436</th><th>\u041f\u0440\u0438\u0447\u0438\u043d\u0430 \u0443\u0432\u043e\u043b\u044c\u043d\u0435\u043d\u0438\u044f</th></tr></thead><tbody>";');
  js.push('    res.employees.forEach(function(e) {');
  js.push('      h += "<tr>";');
  js.push('      h += "<td style=\\"font-weight:600\\">" + e.fio + "</td>";');
  js.push('      h += "<td style=\\"font-size:13px;color:var(--sub)\\">" + (e.dept||"\u2014") + "</td>";');
  js.push('      h += "<td style=\\"font-size:13px;color:var(--sub)\\">" + (e.position||"\u2014") + "</td>";');
  js.push('      h += "<td style=\\"font-size:12px\\">" + (e.hireDate||"\u2014") + "</td>";');
  js.push('      h += "<td style=\\"font-size:13px\\">" + (e.seniority||"\u2014") + "</td>";');
  js.push('      h += "<td style=\\"font-size:12px;color:var(--err)\\">" + (e.fireReason||"\u2014") + "</td>";');
  js.push('      h += "</tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    if (el) el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  // Открыть форму увольнения
  js.push('function openFireFormMdl() {');
  js.push('  fireCurrentEmpId = null;');
  js.push('  document.getElementById("fireEmpInfo").style.display = "none";');
  js.push('  document.getElementById("fireSearchRow").style.display = "";');
  js.push('  document.getElementById("fireSearch").value = "";');
  js.push('  document.getElementById("fireSearchResults").style.display = "none";');
  js.push('  document.getElementById("fireSearchResults").innerHTML = "";');
  js.push('  document.getElementById("fireNote").value = "";');
  // Дата — сегодня
  js.push('  var d=new Date(); var dd=("0"+d.getDate()).slice(-2); var mm=("0"+(d.getMonth()+1)).slice(-2);');
  js.push('  document.getElementById("fireDate").value = d.getFullYear()+"-"+mm+"-"+dd;');
  // Предзагрузить список активных
  js.push('  if (!fireEmpCache.length) {');
  js.push('    srv("hrGetEmployees", {payload:{filter:"active"}}, function(res) {');
  js.push('      if (res.ok) fireEmpCache = res.employees;');
  js.push('    });');
  js.push('  }');
  js.push('  showMdl("mdlFire");');
  js.push('}');
  js.push('');

  // Поиск сотрудника в форме увольнения
  js.push('function fireSearchEmp(q) {');
  js.push('  var res = document.getElementById("fireSearchResults");');
  js.push('  if (!q || q.length < 2) { res.style.display="none"; return; }');
  js.push('  var matches = fireEmpCache.filter(function(e) {');
  js.push('    return (e.fio||"").toLowerCase().indexOf(q.toLowerCase()) !== -1;');
  js.push('  }).slice(0, 8);');
  js.push('  if (!matches.length) { res.style.display="none"; return; }');
  js.push('  var h = "";');
  js.push('  matches.forEach(function(e) {');
  js.push('    h += "<div style=\\"padding:10px 12px;cursor:pointer;border-bottom:1px solid var(--bd)\\" onclick=\\"selectFireEmp(\'" + e.id + "\')\\">";');
  js.push('    h += "<div style=\\"font-weight:600\\">" + e.fio + "</div>";');
  js.push('    h += "<div style=\\"font-size:12px;color:var(--sub)\\">" + (e.dept||"") + " · " + (e.position||"") + " · \u0441\u0442\u0430\u0436: " + (e.seniority||"") + "</div>";');
  js.push('    h += "</div>";');
  js.push('  });');
  js.push('  res.innerHTML = h;');
  js.push('  res.style.display = "block";');
  js.push('}');
  js.push('');

  // Выбрать сотрудника
  js.push('function selectFireEmp(id) {');
  js.push('  var e = fireEmpCache.filter(function(x){ return String(x.id)===String(id); })[0];');
  js.push('  if (!e) return;');
  js.push('  fireCurrentEmpId = e.id;');
  js.push('  document.getElementById("fireEmpName").textContent = e.fio;');
  js.push('  document.getElementById("fireEmpDept").textContent = (e.dept||"") + " · " + (e.position||"") + " · " + (e.seniority||"");');
  js.push('  document.getElementById("fireEmpInfo").style.display = "block";');
  js.push('  document.getElementById("fireSearchResults").style.display = "none";');
  js.push('  document.getElementById("fireSearch").value = e.fio;');
  js.push('}');
  js.push('');

  // Открыть из карточки (уже есть id)
  js.push('function openFireMdlFor(id, fio) {');
  js.push('  openFireFormMdl();');
  js.push('  // Найти в кэше или создать минимальный объект');
  js.push('  var e = fireEmpCache.filter(function(x){ return String(x.id)===String(id); })[0];');
  js.push('  if (e) { selectFireEmp(id); }');
  js.push('  else {');
  js.push('    fireCurrentEmpId = id;');
  js.push('    document.getElementById("fireEmpName").textContent = fio;');
  js.push('    document.getElementById("fireEmpDept").textContent = "";');
  js.push('    document.getElementById("fireEmpInfo").style.display = "block";');
  js.push('    document.getElementById("fireSearch").value = fio;');
  js.push('  }');
  js.push('}');
  js.push('');

  // Отправить увольнение
  js.push('function submitFire() {');
  js.push('  if (!fireCurrentEmpId) { toast("\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0430","err"); return; }');
  js.push('  var reason = document.getElementById("fireReason").value;');
  js.push('  var note   = document.getElementById("fireNote").value.trim();');
  js.push('  var date   = document.getElementById("fireDate").value;');
  js.push('  if (note) reason = reason + " (\u043f\u0440\u0438\u043c.: " + note + ")";');
  // Найти rowIdx через сервер
  js.push('  srv("hrGetEmployee", {payload:{id:fireCurrentEmpId}}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    var payload = {rowIdx:res.employee.rowIdx, reason:reason, fireDate:date};');
  js.push('    srv("hrFireEmployee", {payload:payload}, function(r) {');
  js.push('      if (r.ok) {');
  js.push('        toast(r.message,"ok");');
  js.push('        closeMdl("mdlFire");');
  js.push('        closeMdl("mdlHRCard");');
  js.push('        fireEmpCache = []; // сбросить кэш');
  js.push('        loadHRFired();');
  js.push('        if (document.getElementById("hrEmpCont")) loadHREmployees();');
  js.push('      } else toast(r.error,"err");');
  js.push('    });');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function loadHRMovements() {');
  js.push('  var el = document.getElementById("hrMovesCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("hrGetMoves", {payload:{}}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    if (!res.moves.length) {');
  js.push('      if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-ico\\">\\uD83D\\uDCC4</div><div class=\\"empty-t\\">\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0439 \u043f\u0443\u0441\u0442\u0430</div></div>"; return;');
  js.push('    }');
  js.push('    var h = "<div class=\\"tw\\"><table><thead><tr>";');
  js.push('    h += "<th>\u0414\u0430\u0442\u0430</th><th>\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a</th><th>\u0422\u0438\u043f</th>";');
  js.push('    h += "<th>\u0421\u0442\u0430\u0440\u044b\u0439 \u043e\u0442\u0434\u0435\u043b</th><th>\u041d\u043e\u0432\u044b\u0439 \u043e\u0442\u0434\u0435\u043b</th>";');
  js.push('    h += "<th>\u0421\u0442\u0430\u0440\u0430\u044f \u0434\u043e\u043b\u0436\u043d.</th><th>\u041d\u043e\u0432\u0430\u044f \u0434\u043e\u043b\u0436\u043d.</th>";');
  js.push('    h += "<th>\u041f\u0440\u0438\u0447\u0438\u043d\u0430</th><th>\u041a\u0442\u043e</th></tr></thead><tbody>";');
  js.push('    res.moves.forEach(function(m) {');
  js.push('      var typeColor = "color:var(--ok)";');
  js.push('      h += "<tr>";');
  js.push('      h += "<td style=\\"font-size:12px\\">" + m.date + "</td>";');
  js.push('      h += "<td style=\\"font-weight:600\\">" + m.fio + "</td>";');
  js.push('      h += "<td style=\\"" + typeColor + ";font-size:13px\\">" + m.type + "</td>";');
  js.push('      h += "<td style=\\"font-size:12px;color:var(--sub)\\">" + (m.oldDept||"\u2014") + "</td>";');
  js.push('      h += "<td style=\\"font-size:12px\\">" + (m.newDept||"\u2014") + "</td>";');
  js.push('      h += "<td style=\\"font-size:12px;color:var(--sub)\\">" + (m.oldPos||"\u2014") + "</td>";');
  js.push('      h += "<td style=\\"font-size:12px\\">" + (m.newPos||"\u2014") + "</td>";');
  js.push('      h += "<td style=\\"font-size:12px;color:var(--sub)\\">" + (m.reason||"\u2014") + "</td>";');
  js.push('      h += "<td style=\\"font-size:12px;color:var(--sub)\\">" + (m.signedBy||"") + "</td>";');
  js.push('      h += "</tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    if (el) el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function openMoveMdl(empId, fio) {');
  js.push('  hrMoveCurrentEmpId = empId || null;');
  js.push('  document.getElementById("moveEmpInfo").textContent = fio ? fio : "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0430 \u0438\u0437 \u0441\u043f\u0438\u0441\u043a\u0430";');
  js.push('  // Дата по умолчанию — сегодня');
  js.push('  var today = new Date(); var dd=("0"+(today.getDate())).slice(-2); var mm=("0"+(today.getMonth()+1)).slice(-2);');
  js.push('  document.getElementById("moveDate").value = today.getFullYear()+"-"+mm+"-"+dd;');
  js.push('  document.getElementById("moveReason").value = "";');
  js.push('  // Заполняем отделы и должности из конфига');
  js.push('  srv("hrGetConfig", {}, function(cfg) {');
  js.push('    if (!cfg.ok) return;');
  js.push('    var dSel = document.getElementById("moveNewDept");');
  js.push('    var pSel = document.getElementById("moveNewPos");');
  js.push('    dSel.innerHTML = "<option value=\\"\\">\\u2014 \u0431\u0435\u0437 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439 \u2014</option>";');
  js.push('    pSel.innerHTML = "<option value=\\"\\">\\u2014 \u0431\u0435\u0437 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439 \u2014</option>";');
  js.push('    cfg.depts.forEach(function(d){var o=document.createElement("option");o.value=d;o.textContent=d;dSel.appendChild(o);});');
  js.push('    cfg.positions.forEach(function(p){var o=document.createElement("option");o.value=p;o.textContent=p;pSel.appendChild(o);});');
  js.push('  });');
  js.push('  showMdl("mdlMove");');
  js.push('}');
  js.push('');

  js.push('function submitMove() {');
  js.push('  if (!hrMoveCurrentEmpId) { toast("\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0430","err"); return; }');
  js.push('  var newDept = document.getElementById("moveNewDept").value;');
  js.push('  var newPos  = document.getElementById("moveNewPos").value;');
  js.push('  if (!newDept && !newPos) { toast("\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043d\u043e\u0432\u044b\u0439 \u043e\u0442\u0434\u0435\u043b \u0438\u043b\u0438 \u0434\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c","err"); return; }');
  js.push('  var payload = {');
  js.push('    empId:  hrMoveCurrentEmpId,');
  js.push('    date:   document.getElementById("moveDate").value,');
  js.push('    newDept: newDept || undefined,');
  js.push('    newPos:  newPos  || undefined,');
  js.push('    reason:  document.getElementById("moveReason").value.trim()');
  js.push('  };');
  js.push('  srv("hrCreateMove", {payload:payload}, function(res) {');
  js.push('    if (res.ok) {');
  js.push('      toast(res.message,"ok");');
  js.push('      closeMdl("mdlMove");');
  js.push('      loadHRMovements();');
  js.push('      // Обновляем список сотрудников если открыт');
  js.push('      if (hrAllEmployees.length) loadHREmployees();');
  js.push('    } else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('// Кнопка "Переместить" в карточке сотрудника');
  js.push('function hrOpenMove(btn) {');
  js.push('  var id  = btn.dataset.id;');
  js.push('  var fio = btn.dataset.fio;');
  js.push('  hrMoveCurrentEmpId = id;');
  js.push('  openMoveMdl(id, fio);');
  js.push('}');
  js.push('');


  // ════════════════════════════════════════════════════════
  // ШТАТНОЕ РАСПИСАНИЕ — АККОРДЕОН + ФОРМА ДОКУМЕНТА
  // ════════════════════════════════════════════════════════
  js.push('var staffGroupState = {}; // dept -> open/closed');
  js.push('var staffDataCache  = null;');
  js.push('');

  js.push('function loadHRStaff() {');
  js.push('  var el = document.getElementById("hrStaffCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("hrGetStaffing", {}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    staffDataCache = res;');
  js.push('    renderStaffPage(res);');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderStaffPage(res) {');
  js.push('  var el = document.getElementById("hrStaffCont");');
  js.push('  if (!el) return;');
  js.push('  if (!res.staffing.length) {');
  js.push('    el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">📋</div><div class=\\"empty-t\\">\\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445. \u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u043e\u0442\u0434\u0435\u043b.</div></div>";');
  js.push('    return;');
  js.push('  }');
  js.push('  var payColors = {"\\u041e\\u043a\\u043b\\u0430\\u0434":"var(--ok)","\\u0427\\u0430\\u0441\\u043e\\u0432\\u043e\\u0439":"#42A5F5","\\u041f\\u043e \\u0432\\u044b\\u0440\\u0430\\u0431\\u043e\\u0442\\u043a\\u0435":"var(--warn)","\\u041e\\u043a\\u043b\\u0430\\u0434+KPI":"#AB47BC"};');
  // Итого
  js.push('  var h = "<div style=\\"display:flex;justify-content:space-between;align-items:center;background:rgba(249,168,37,.1);border:1px solid var(--g);border-radius:10px;padding:12px 18px;margin-bottom:14px\\">";');
  js.push('  h += "<span style=\\"color:var(--sub);font-size:14px\\">\\u041e\\u0431\\u0449\\u0438\\u0439 \\u0424\\u041e\\u0422 (\\u0444\\u0430\\u043a\\u0442):</span>";');
  js.push('  h += "<div style=\\"display:flex;gap:12px;align-items:center\\">";');
  js.push('  h += "<b style=\\"font-size:20px;color:var(--g)\\">"+(res.totalFund||0).toLocaleString()+" \\u0441\\u0443\\u043c</b>";');
  js.push('  h += "<button class=\\"btn bs\\" onclick=\\"printStaffing()\\">\\u0420\\u0430\\u0441\\u043f\\u0435\\u0447\\u0430\\u0442\\u0430\\u0442\\u044c</button>";');
  js.push('  h += "</div></div>";');
  // Аккордеон по отделам
  js.push('  var depts = Object.keys(res.byDept);');
  js.push('  depts.forEach(function(dept) {');
  js.push('    var rows = res.byDept[dept];');
  js.push('    if (staffGroupState[dept] === undefined) staffGroupState[dept] = true;');
  js.push('    var isOpen = staffGroupState[dept];');
  js.push('    var dTotal = rows.reduce(function(s,r){return s+(r.actualSalary||0);},0);');
  js.push('    var dUnits = rows.reduce(function(s,r){return s+(r.units||0);},0);');
  js.push('    var payType = rows[0] ? (rows[0].payType||"") : "";');
  js.push('    var payC = payColors[payType]||"var(--sub)";');
  js.push('    var gid = "sg_"+dept.replace(/[^a-zA-Z0-9]/g,"_");');
  // Заголовок группы
  js.push('    h += "<div style=\\"margin-bottom:10px;border:1px solid var(--bd);border-radius:12px;overflow:hidden\\">";');
  js.push('    h += "<div style=\\"display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:var(--s2);cursor:pointer\\" onclick=\\"toggleStaffGroup(\'" + dept.replace(/\'/g,\'\\\\\\\'\') + "\')\\">";');
  js.push('    h += "<div style=\\"display:flex;align-items:center;gap:10px\\">";');
  js.push('    h += "<span style=\\"font-weight:700;font-size:15px\\">" + dept + "</span>";');
  js.push('    h += "<span style=\\"font-size:12px;padding:2px 8px;border-radius:6px;background:rgba(255,255,255,.08);color:" + payC + "\\">" + payType + "</span>";');
  js.push('    h += "</div>";');
  js.push('    h += "<div style=\\"display:flex;align-items:center;gap:12px\\">";');
  js.push('    h += "<span style=\\"font-size:13px;color:var(--sub)\\">\\u0428\\u0442\\u0430\\u0442: <b>" + dUnits + "</b> &middot; \\u0424\\u041e\\u0422: <b>" + dTotal.toLocaleString() + "</b></span>";');
  js.push('    h += "<button class=\\"btn bp\\" style=\\"padding:3px 12px;font-size:12px\\" onclick=\\"event.stopPropagation();openStaffRowMdl(\'" + dept.replace(/\'/g,\'\\\\\\\'\') + "\')\\" >+ \\u0414\\u043e\\u0431\\u0430\\u0432\\u0438\\u0442\\u044c</button>";');
  js.push('    h += "<span style=\\"font-size:18px;color:var(--sub);min-width:20px;text-align:center\\">" + (isOpen?"\\u25B2":"\\u25BC") + "</span>";');
  js.push('    h += "</div></div>";');
  // Тело группы
  js.push('    h += "<div id=\\"" + gid + "\\" style=\\"display:" + (isOpen?"block":"none") + "\\">";');
  js.push('    if (!rows.length) {');
  js.push('      h += "<div style=\\"padding:14px 16px;color:var(--sub);font-size:14px\\">\\u0421\\u0442\\u0430\\u0432\\u043e\\u043a \\u043d\\u0435\\u0442</div>";');
  js.push('    } else {');
  js.push('      h += "<table style=\\"width:100%;border-collapse:collapse\\"><thead><tr style=\\"background:rgba(255,255,255,.03)\\">";');
  js.push('      h += "<th style=\\"padding:7px 12px;text-align:left;font-size:12px;color:var(--sub)\\">\\u2116</th>";');
  js.push('      h += "<th style=\\"padding:7px;text-align:left;font-size:12px;color:var(--sub)\\">\\u0414\\u043e\\u043b\\u0436\\u043d\\u043e\\u0441\\u0442\\u044c</th>";');
  js.push('      h += "<th style=\\"padding:7px;text-align:center;font-size:12px;color:var(--sub)\\">\\u041e\\u0431\\u043e\\u0437\\u043d.</th>";');
  js.push('      h += "<th style=\\"padding:7px;text-align:center;font-size:12px;color:var(--sub)\\">\\u0428\\u0442\\u0430\\u0442</th>";');
  js.push('      h += "<th style=\\"padding:7px;text-align:center;font-size:12px;color:var(--sub)\\">\\u0424\\u0430\\u043a\\u0442</th>";');
  js.push('      h += "<th style=\\"padding:7px;text-align:center;font-size:12px;color:var(--sub)\\">\\u0412\\u0430\\u043a.</th>";');
  js.push('      h += "<th style=\\"padding:7px;text-align:right;font-size:12px;color:var(--sub)\\">\\u041e\\u043a\\u043b\\u0430\\u0434</th>";');
  js.push('      h += "<th style=\\"padding:7px;text-align:center;font-size:12px;color:var(--sub)\\">\\u041a\\u0430\\u0442.</th>";');
  js.push('      h += "<th></th></tr></thead><tbody>";');
  js.push('      var num = 1;');
  js.push('      rows.forEach(function(s) {');
  js.push('        var vacS = s.vacancy>0?"color:var(--err);font-weight:700":"color:var(--ok)";');
  js.push('        h += "<tr style=\\"border-top:1px solid var(--bd)\\">";');
  js.push('        h += "<td style=\\"padding:8px 12px;color:var(--sub);font-size:13px\\">" + (num++) + "</td>";');
  js.push('        h += "<td style=\\"padding:8px 12px;font-weight:600\\">" + s.position + "</td>";');
  js.push('        h += "<td style=\\"padding:8px;text-align:center;color:var(--sub);font-size:13px\\">" + (s.abbr||"\\u2014") + "</td>";');
  js.push('        h += "<td style=\\"padding:8px;text-align:center\\">" + s.units + "</td>";');
  js.push('        h += "<td style=\\"padding:8px;text-align:center;color:var(--ok)\\">" + s.actual + "</td>";');
  js.push('        h += "<td style=\\"padding:8px;text-align:center;" + vacS + "\\">" + s.vacancy + "</td>";');
  js.push('        if (s.useCat) {');
  js.push('          h += "<td style=\\"padding:6px 8px;text-align:right;font-size:11px;line-height:1.5\\">";');
  js.push('          h += "<span style=\\"color:var(--err)\\">A: " + (s.salaryA||0).toLocaleString() + "</span><br>";');
  js.push('          h += "<span style=\\"color:var(--warn)\\">B: " + (s.salaryB||0).toLocaleString() + "</span><br>";');
  js.push('          h += "<span style=\\"color:var(--ok)\\">C: " + (s.salaryC||0).toLocaleString() + "</span>";');
  js.push('          h += "</td>";');
  js.push('        } else {');
  js.push('          h += "<td style=\\"padding:8px;text-align:right\\">" + (s.salary||0).toLocaleString() + "</td>";');
  js.push('        }');
  js.push('        h += "<td style=\\"padding:8px;text-align:center;font-size:13px\\">" + (s.useCat?"A/B/C":"\\u2014") + "</td>";');
  js.push('        h += "<td style=\\"padding:8px;white-space:nowrap\\">";');
  js.push('        h += "<button class=\\"btn bs\\" style=\\"padding:2px 8px;font-size:12px;margin-right:4px\\" data-ridx=\\""+s.rowIdx+"\\" onclick=\\"editStaffRow(this)\\">\\u0440\\u0435\\u0434.</button>";');
  js.push('        h += "<button class=\\"btn bd\\" style=\\"padding:2px 8px;font-size:12px\\" data-ridx=\\""+s.rowIdx+"\\" onclick=\\"delStaffRow(this)\\">\\u0443\\u0434.</button>";');
  js.push('        h += "</td></tr>";');
  js.push('      });');
  // Итог строки
  js.push('      var dPlan = rows.reduce(function(s,r){return s+(r.planFund||0);},0);');
  js.push('      h += "<tr style=\\"background:rgba(255,255,255,.04);border-top:2px solid var(--bd);\\">";');
  js.push('      h += "<td colspan=\\"3\\" style=\\"padding:8px 12px;font-weight:700;font-size:13px\\">\\u0418\\u0442\\u043e\\u0433</td>";');
  js.push('      h += "<td style=\\"padding:8px;text-align:center;font-weight:700\\">" + dUnits + "</td>";');
  js.push('      h += "<td colspan=\\"4\\" style=\\"padding:8px;text-align:right;font-weight:700;color:var(--g)\\">" + dTotal.toLocaleString() + " \\u0441\\u0443\\u043c</td>";');
  js.push('      h += "<td></td></tr>";');
  js.push('      h += "</tbody></table>";');
  js.push('    }');
  js.push('    h += "</div></div>";');
  js.push('  });');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('function toggleStaffGroup(dept) {');
  js.push('  staffGroupState[dept] = !staffGroupState[dept];');
  js.push('  if (staffDataCache) renderStaffPage(staffDataCache);');
  js.push('}');
  js.push('');

  // ── Модалка — добавить/редактировать должность ──
  js.push('function toggleStaffCatFields() {');
  js.push('  var isCat = document.getElementById("staffUseCat").value === "\\u0434\\u0430";');
  js.push('  document.getElementById("staffSalaryRow").style.display = isCat ? "none" : "";');
  js.push('  document.getElementById("staffCatRow").style.display = isCat ? "block" : "none";');
  js.push('}');
  js.push('');

  js.push('function openStaffRowMdl(dept, row) {');
  js.push('  document.getElementById("mdlStaffTitle").textContent = row ? "\\u0420\\u0435\\u0434\\u0430\\u043a\\u0442\\u0438\\u0440\\u043e\\u0432\\u0430\\u0442\\u044c \\u0441\\u0442\\u0430\\u0432\\u043a\\u0443" : "\\u041d\\u043e\\u0432\\u0430\\u044f \\u0441\\u0442\\u0430\\u0432\\u043a\\u0430";');
  js.push('  document.getElementById("staffRowIdx").value  = row ? row.rowIdx : "";');
  js.push('  document.getElementById("staffSalary").value  = row ? (row.salary||"") : "";');
  js.push('  document.getElementById("staffSalaryA").value = row ? (row.salaryA||"") : "";');
  js.push('  document.getElementById("staffSalaryB").value = row ? (row.salaryB||"") : "";');
  js.push('  document.getElementById("staffSalaryC").value = row ? (row.salaryC||"") : "";');
  js.push('  document.getElementById("staffBonus").value   = row ? (row.bonus||"") : "";');
  js.push('  document.getElementById("staffCount").value   = row ? (row.units||1) : 1;');
  js.push('  document.getElementById("staffNote").value    = row ? (row.note||"") : "";');
  // Заполняем справочники
  js.push('  var fillFn = function() {');
  js.push('    var dSel  = document.getElementById("staffDept");');
  js.push('    var pSel  = document.getElementById("staffPos");');
  js.push('    var ptSel = document.getElementById("staffPayType");');
  js.push('    var ucSel = document.getElementById("staffUseCat");');
  js.push('    var abSel = document.getElementById("staffAbbr");');
  js.push('    dSel.innerHTML  = "<option value=\\"\\">\\u2014</option>" + (hrDicts.depts||[]).map(function(d){return "<option>"+d+"</option>";}).join("");');
  js.push('    pSel.innerHTML  = "<option value=\\"\\">\\u2014</option>" + (hrDicts.positions||[]).map(function(p){return "<option>"+p+"</option>";}).join("");');
  js.push('    setTimeout(function() {');
  js.push('      dSel.value  = dept || (row ? row.dept : "") || "";');
  js.push('      pSel.value  = row ? (row.position||"") : "";');
  js.push('      ptSel.value = row ? (row.payType||"\\u041e\\u043a\\u043b\\u0430\\u0434") : "\\u041e\\u043a\\u043b\\u0430\\u0434";');
  js.push('      ucSel.value = (row && row.useCat) ? "\\u0434\\u0430" : "\\u043d\\u0435\\u0442";');
  js.push('      abSel.value = row ? (row.abbr||"") : "";');
  js.push('      toggleStaffCatFields();');
  js.push('    }, 50);');
  js.push('  };');
  js.push('  if (!hrDicts) { srv("hrGetConfig",{},function(r){hrDicts=r.ok?r:{depts:[],positions:[]};fillFn();}); }');
  js.push('  else fillFn();');
  js.push('  showMdl("mdlStaff");');
  js.push('}');
  js.push('');

  // Открыть для нового отдела (кнопка + Добавить отдел)
  js.push('function openStaffMdl(row) { openStaffRowMdl(null, row||null); }');
  js.push('');

  js.push('function editStaffRow(btn) {');
  js.push('  var ridx = btn.dataset.ridx;');
  js.push('  if (!staffDataCache) { loadHRStaff(); return; }');
  js.push('  var row = staffDataCache.staffing.filter(function(r){ return String(r.rowIdx)===String(ridx); })[0];');
  js.push('  if (row) openStaffRowMdl(row.dept, row);');
  js.push('}');
  js.push('');

  js.push('function delStaffRow(btn) {');
  js.push('  if (!confirm("\\u0423\\u0434\\u0430\\u043b\\u0438\\u0442\\u044c \\u0441\\u0442\\u0440\\u043e\\u043a\\u0443?")) return;');
  js.push('  srv("hrDeleteStaffingRow",{payload:{rowIdx:btn.dataset.ridx}},function(res){');
  js.push('    if(res.ok){staffDataCache=null;toast("\\u0423\\u0434\\u0430\\u043b\\u0435\\u043d\\u043e","ok");loadHRStaff();}else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function fillStaffMdlSelects(row) {}'); // compat stub

  js.push('function saveStaffPos() {');
  js.push('  var dept    = document.getElementById("staffDept").value;');
  js.push('  var pos     = document.getElementById("staffPos").value;');
  js.push('  var payType = document.getElementById("staffPayType").value;');
  js.push('  var useCat  = document.getElementById("staffUseCat").value === "\\u0434\\u0430";');
  js.push('  if (!dept) { toast("\\u0412\\u044b\\u0431\\u0435\\u0440\\u0438\\u0442\\u0435 \\u043e\\u0442\\u0434\\u0435\\u043b","err"); return; }');
  js.push('  if (!pos)  { toast("\\u0412\\u044b\\u0431\\u0435\\u0440\\u0438\\u0442\\u0435 \\u0434\\u043e\\u043b\\u0436\\u043d\\u043e\\u0441\\u0442\\u044c","err"); return; }');
  js.push('  if (useCat) {');
  js.push('    var a=document.getElementById("staffSalaryA").value, b=document.getElementById("staffSalaryB").value, c=document.getElementById("staffSalaryC").value;');
  js.push('    if (!a||!b||!c) { toast("\\u0417\\u0430\\u043f\\u043e\\u043b\\u043d\\u0438\\u0442\\u0435 \\u043e\\u043a\\u043b\\u0430\\u0434 \\u0434\\u043b\\u044f \\u0432\\u0441\\u0435\\u0445 3 \\u043a\\u0430\\u0442\\u0435\\u0433\\u043e\\u0440\\u0438\\u0439","err"); return; }');
  js.push('  }');
  js.push('  var payload = {');
  js.push('    rowIdx:  document.getElementById("staffRowIdx").value || undefined,');
  js.push('    dept:    dept, position: pos,');
  js.push('    abbr:    document.getElementById("staffAbbr").value.trim(),');
  js.push('    payType: payType,');
  js.push('    salary:  parseInt(document.getElementById("staffSalary").value)||0,');
  js.push('    salaryA: parseInt(document.getElementById("staffSalaryA").value)||0,');
  js.push('    salaryB: parseInt(document.getElementById("staffSalaryB").value)||0,');
  js.push('    salaryC: parseInt(document.getElementById("staffSalaryC").value)||0,');
  js.push('    bonus:   parseInt(document.getElementById("staffBonus").value)||0,');
  js.push('    units:   parseInt(document.getElementById("staffCount").value)||1,');
  js.push('    useCat:  useCat,');
  js.push('    note:    document.getElementById("staffNote").value.trim()');
  js.push('  };');
  js.push('  srv("hrSaveStaffingRow", {payload:payload}, function(res) {');
  js.push('    if (res.ok) {');
  js.push('      staffDataCache = null;');
  js.push('      toast("\\u0421\\u043e\\u0445\\u0440\\u0430\\u043d\\u0435\\u043d\\u043e","ok");');
  js.push('      closeMdl("mdlStaff");');
  js.push('      loadHRStaff();');
  js.push('    } else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function printStaffing() {');
  js.push('  toast("\u0414\u043b\u044f \u043f\u0435\u0447\u0430\u0442\u043d\u043e\u0433\u043e \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0439\u0442\u0435 \u0440\u0430\u0437\u0434\u0435\u043b \u00ab\u0428\u0442\u0430\u0442 \u0436\u0430\u0434\u0432\u0430\u043b\u0438 (Word)\u00bb","ok");');
  js.push('  nav("hr-staffdoc");');
  js.push('}');
  js.push('');

  // ── Фонд зарплаты ──
  // ════════════════════════════════════════════════════════
  // ЗАРПЛАТА — сдельная оплата производственных линий
  // ════════════════════════════════════════════════════════
  js.push('var payrollLinesCache = [];');
  js.push('var payrollMapCache   = [];');
  js.push('');

  // ── Главная страница: выбор линии + периода + расчёт ──
  js.push('function loadHRPayroll() {');
  js.push('  var el = document.getElementById("hrPayrollCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("payrollGetLines", {}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    payrollLinesCache = res.lines||[];');
  js.push('    renderPayrollForm();');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderPayrollForm() {');
  js.push('  var el = document.getElementById("hrPayrollCont");');
  js.push('  if (!el) return;');
  js.push('  var now = new Date();');
  js.push('  var firstDay = "01."+("0"+(now.getMonth()+1)).slice(-2)+"."+now.getFullYear();');
  js.push('  var dd=("0"+now.getDate()).slice(-2), mm=("0"+(now.getMonth()+1)).slice(-2);');
  js.push('  var today = dd+"."+mm+"."+now.getFullYear();');
  js.push('  var h = "<div class=\\"card\\" style=\\"margin-bottom:16px\\">";');
  js.push('  h += "<div style=\\"display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:10px;align-items:end\\">";');
  js.push('  h += "<div><label style=\\"font-size:12px;color:var(--sub);display:block;margin-bottom:4px\\">\u041b\u0438\u043d\u0438\u044f</label><select class=\\"fs\\" id=\\"pcLiniya\\">";');
  js.push('  h += "<option value=\\"\\">\u2014 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u2014</option>";');
  js.push('  payrollLinesCache.forEach(function(l){ if(l.active) h += "<option>"+l.name+"</option>"; });');
  js.push('  h += "</select></div>";');
  js.push('  h += "<div><label style=\\"font-size:12px;color:var(--sub);display:block;margin-bottom:4px\\">\u0421 \u0434\u0430\u0442\u044b</label><input type=\\"date\\" class=\\"fi\\" id=\\"pcFrom\\" value=\\""+isoFromRu(firstDay)+"\\"></div>";');
  js.push('  h += "<div><label style=\\"font-size:12px;color:var(--sub);display:block;margin-bottom:4px\\">\u041f\u043e \u0434\u0430\u0442\u0443</label><input type=\\"date\\" class=\\"fi\\" id=\\"pcTo\\" value=\\""+isoFromRu(today)+"\\"></div>";');
  js.push('  h += "<button class=\\"btn bp\\" onclick=\\"calcPayroll()\\">\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c</button>";');
  js.push('  h += "</div></div>";');
  js.push('  h += "<div id=\\"payrollResultCont\\"></div>";');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('function isoFromRu(s){ var p=s.split("."); return p.length===3 ? p[2]+"-"+p[1]+"-"+p[0] : ""; }');
  js.push('function ruFromIso(s){ var p=s.split("-"); return p.length===3 ? p[2]+"."+p[1]+"."+p[0] : ""; }');
  js.push('');

  js.push('function calcPayroll() {');
  js.push('  var liniya = document.getElementById("pcLiniya").value;');
  js.push('  var from   = ruFromIso(document.getElementById("pcFrom").value);');
  js.push('  var to     = ruFromIso(document.getElementById("pcTo").value);');
  js.push('  if (!liniya) { toast("\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043b\u0438\u043d\u0438\u044e","err"); return; }');
  js.push('  if (!from||!to) { toast("\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043f\u0435\u0440\u0438\u043e\u0434","err"); return; }');
  js.push('  var el = document.getElementById("payrollResultCont");');
  js.push('  el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("payrollCalculate", {payload:{liniya:liniya, dateFrom:from, dateTo:to}}, function(res) {');
  js.push('    if (!res.ok) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"\u041e\u0448\u0438\u0431\u043a\u0430")+"</div></div>"; return; }');
  js.push('    renderPayrollResult(res);');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderPayrollResult(res) {');
  js.push('  var el = document.getElementById("payrollResultCont");');
  js.push('  var h = "";');
  // KPI cards
  js.push('  h += "<div style=\\"display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:16px\\">";');
  js.push('  h += "<div class=\\"card\\" style=\\"text-align:center\\"><div style=\\"font-size:20px;font-weight:700\\">" + res.totalPlan.toLocaleString() + "</div><div style=\\"font-size:12px;color:var(--sub)\\">\u041f\u043b\u0430\u043d, \u0448\u0442</div></div>";');
  js.push('  h += "<div class=\\"card\\" style=\\"text-align:center\\"><div style=\\"font-size:20px;font-weight:700;color:var(--ok)\\">" + res.totalFact.toLocaleString() + "</div><div style=\\"font-size:12px;color:var(--sub)\\">\u0424\u0430\u043a\u0442, \u0448\u0442</div></div>";');
  js.push('  var pctColor = res.avgPercent>=100 ? "var(--ok)" : res.avgPercent>=80 ? "var(--warn)" : "var(--err)";');
  js.push('  h += "<div class=\\"card\\" style=\\"text-align:center\\"><div style=\\"font-size:20px;font-weight:700;color:"+pctColor+"\\">" + res.avgPercent + "%</div><div style=\\"font-size:12px;color:var(--sub)\\">\u0412\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u0435</div></div>";');
  js.push('  h += "<div class=\\"card\\" style=\\"text-align:center\\"><div style=\\"font-size:20px;font-weight:700\\">" + res.dailyFund.toLocaleString() + "</div><div style=\\"font-size:12px;color:var(--sub)\\">\u0414\u043d\u0435\u0432\u043d\u043e\u0439 \u0444\u043e\u043d\u0434 (/26)</div></div>";');
  js.push('  h += "<div class=\\"card\\" style=\\"text-align:center;background:rgba(102,187,106,.1);border:1px solid var(--ok)\\"><div style=\\"font-size:22px;font-weight:700;color:var(--ok)\\">" + res.totalPay.toLocaleString() + "</div><div style=\\"font-size:12px;color:var(--sub)\\">\u0418\u0442\u043e\u0433\u043e \u043a \u0432\u044b\u043f\u043b\u0430\u0442\u0435</div></div>";');
  js.push('  h += "</div>";');
  // Employees table
  js.push('  h += "<div class=\\"card\\" style=\\"margin-bottom:14px\\"><div style=\\"font-weight:700;margin-bottom:10px\\">\u0420\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u043c\u0435\u0436\u0434\u0443 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0430\u043c\u0438</div>";');
  js.push('  h += "<div class=\\"tw\\"><table><thead><tr><th>\u0424\u0418\u041e</th><th>\u041e\u0442\u0434\u0435\u043b</th><th>\u0414\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c</th><th style=\\"text-align:right\\">\u041e\u043a\u043b\u0430\u0434</th><th style=\\"text-align:center\\">\u0414\u043e\u043b\u044f</th><th style=\\"text-align:right\\">\u041a \u0432\u044b\u043f\u043b\u0430\u0442\u0435</th></tr></thead><tbody>";');
  js.push('  res.employees.forEach(function(e) {');
  js.push('    h += "<tr><td style=\\"font-weight:600\\">" + e.fio + "</td>";');
  js.push('    h += "<td style=\\"font-size:12px;color:var(--sub)\\">" + e.dept + "</td>";');
  js.push('    h += "<td style=\\"font-size:12px;color:var(--sub)\\">" + e.position + "</td>";');
  js.push('    h += "<td style=\\"text-align:right\\">" + e.oklad.toLocaleString() + "</td>";');
  js.push('    h += "<td style=\\"text-align:center;color:var(--sub)\\">" + e.sharePct + "%</td>";');
  js.push('    h += "<td style=\\"text-align:right;font-weight:700;color:var(--g)\\">" + e.pay.toLocaleString() + "</td></tr>";');
  js.push('  });');
  js.push('  h += "</tbody></table></div></div>";');
  // Daily breakdown (collapsible)
  js.push('  h += "<div class=\\"card\\">";');
  js.push('  h += "<div style=\\"font-weight:700;margin-bottom:10px;cursor:pointer\\" onclick=\\"togglePayrollDays()\\">\u041f\u043e \u0434\u043d\u044f\u043c <span id=\\"pdArrow\\">\u25BC</span></div>";');
  js.push('  h += "<div id=\\"payrollDaysCont\\" style=\\"display:none\\"><div class=\\"tw\\"><table><thead><tr><th>\u0414\u0430\u0442\u0430</th><th style=\\"text-align:center\\">\u041f\u043b\u0430\u043d</th><th style=\\"text-align:center\\">\u0424\u0430\u043a\u0442</th><th style=\\"text-align:right\\">\u0420\u0430\u0441\u0446\u0435\u043d\u043a\u0430/\u0448\u0442</th><th style=\\"text-align:right\\">\u0412\u044b\u043f\u043b\u0430\u0442\u0430</th></tr></thead><tbody>";');
  js.push('  res.byDay.forEach(function(d) {');
  js.push('    h += "<tr><td style=\\"font-size:12px\\">" + d.date + "</td>";');
  js.push('    h += "<td style=\\"text-align:center\\">" + d.plan + "</td>";');
  js.push('    h += "<td style=\\"text-align:center;color:var(--ok)\\">" + d.fact + "</td>";');
  js.push('    h += "<td style=\\"text-align:right;color:var(--sub)\\">" + d.rate.toLocaleString() + "</td>";');
  js.push('    h += "<td style=\\"text-align:right;font-weight:600\\">" + d.pay.toLocaleString() + "</td></tr>";');
  js.push('  });');
  js.push('  h += "</tbody></table></div></div></div>";');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('function togglePayrollDays() {');
  js.push('  var c = document.getElementById("payrollDaysCont");');
  js.push('  var a = document.getElementById("pdArrow");');
  js.push('  var open = c.style.display !== "none";');
  js.push('  c.style.display = open ? "none" : "block";');
  js.push('  a.textContent = open ? "\u25BC" : "\u25B2";');
  js.push('}');
  js.push('');

  // ── Настройка привязки HR-отделов к линиям ──
  js.push('function openPayrollMappingMdl() {');
  js.push('  showMdl("mdlPayrollMap");');
  js.push('  var dSel = document.getElementById("pmDept");');
  js.push('  var lSel = document.getElementById("pmLiniya");');
  js.push('  dSel.innerHTML = "<option value=\\"\\">\u2014 \u043e\u0442\u0434\u0435\u043b HR \u2014</option>";');
  js.push('  lSel.innerHTML = "<option value=\\"\\">\u2014 \u043b\u0438\u043d\u0438\u044f \u2014</option>";');
  js.push('  var fillDepts = function() {');
  js.push('    (hrDicts.depts||[]).forEach(function(d){ var o=document.createElement("option"); o.value=d; o.textContent=d; dSel.appendChild(o); });');
  js.push('  };');
  js.push('  var fillLines = function() {');
  js.push('    payrollLinesCache.forEach(function(l){ if(l.active){ var o=document.createElement("option"); o.value=l.name; o.textContent=l.name; lSel.appendChild(o); } });');
  js.push('  };');
  js.push('  if (!hrDicts) { srv("hrGetConfig",{},function(r){ hrDicts=r.ok?r:{depts:[]}; fillDepts(); }); } else fillDepts();');
  js.push('  if (!payrollLinesCache.length) { srv("payrollGetLines",{},function(r){ if(r.ok) payrollLinesCache=r.lines; fillLines(); }); } else fillLines();');
  js.push('  loadPayrollMappingList();');
  js.push('}');
  js.push('');

  js.push('function loadPayrollMappingList() {');
  js.push('  var el = document.getElementById("pmListCont");');
  js.push('  el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("payrollGetMapping", {}, function(res) {');
  js.push('    if (!res.ok) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    payrollMapCache = res.mapping;');
  js.push('    if (!res.mapping.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">\u041f\u0440\u0438\u0432\u044f\u0437\u043e\u043a \u0435\u0449\u0451 \u043d\u0435\u0442</div></div>"; return; }');
  js.push('    var h = "<div style=\\"display:grid;gap:6px\\">";');
  js.push('    res.mapping.forEach(function(m) {');
  js.push('      h += "<div style=\\"display:flex;justify-content:space-between;align-items:center;background:var(--s2);border-radius:8px;padding:8px 12px\\">";');
  js.push('      h += "<div style=\\"font-size:13px\\"><b>" + m.dept + "</b> \u2192 " + m.liniya + "</div>";');
  js.push('      h += "<button class=\\"btn bd\\" style=\\"padding:2px 8px;font-size:12px\\" data-ridx=\\""+m.rowIdx+"\\" onclick=\\"deletePayrollMapping(this)\\">\u0443\u0434.</button>";');
  js.push('      h += "</div>";');
  js.push('    });');
  js.push('    h += "</div>";');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function savePayrollMapping() {');
  js.push('  var dept = document.getElementById("pmDept").value;');
  js.push('  var liniya = document.getElementById("pmLiniya").value;');
  js.push('  if (!dept||!liniya) { toast("\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043e\u0442\u0434\u0435\u043b \u0438 \u043b\u0438\u043d\u0438\u044e","err"); return; }');
  js.push('  srv("payrollSaveMapping", {payload:{dept:dept, liniya:liniya}}, function(res) {');
  js.push('    if (res.ok) { toast("\u0421\u0432\u044f\u0437\u0430\u043d\u043e","ok"); loadPayrollMappingList(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function deletePayrollMapping(btn) {');
  js.push('  if (!confirm("\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043f\u0440\u0438\u0432\u044f\u0437\u043a\u0443?")) return;');
  js.push('  srv("payrollDeleteMapping", {payload:{rowIdx:btn.dataset.ridx}}, function(res) {');
  js.push('    if (res.ok) { toast("\u0423\u0434\u0430\u043b\u0435\u043d\u043e","ok"); loadPayrollMappingList(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');


  // ════════════════════════════════════════════════════════
  // ТРУДОВЫЕ ДОГОВОРЫ
  // ════════════════════════════════════════════════════════
  js.push('var contractTplCache = [];');
  js.push('var contractEmpCache2 = [];');
  js.push('');

  // ── Шаблоны ──
  js.push('function loadHRContracts() {');
  js.push('  var el = document.getElementById("hrContractsCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("contractGetTemplates", {}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    contractTplCache = res.templates;');
  js.push('    if (!res.templates.length) {');
  js.push('      if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-ico\\">📄</div><div class=\\"empty-t\\">\u0428\u0430\u0431\u043b\u043e\u043d\u043e\u0432 \u043d\u0435\u0442. \u0421\u043e\u0437\u0434\u0430\u0439\u0442\u0435 \u043f\u0435\u0440\u0432\u044b\u0439.</div></div>";');
  js.push('      return;');
  js.push('    }');
  js.push('    var payColors = {"\u041f\u043e \u0448\u0442\u0430\u0442\u043d\u043e\u043c\u0443 \u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u044e":"var(--ok)","\u041a\u043e\u043d\u0442\u0440\u0430\u043a\u0442\u043d\u044b\u0439":"#42A5F5","\u041f\u043e \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044e KPI":"var(--warn)","\u0412\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u0438\u0439":"#AB47BC"};');
  js.push('    var h = "<div class=\\"tw\\"><table><thead><tr>";');
  js.push('    h += "<th>\u0414\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c</th><th>\u0412\u0438\u0434 \u043e\u043f\u043b\u0430\u0442\u044b</th><th>\u0421\u0440\u043e\u043a</th><th>\u0421\u043e\u0437\u0434\u0430\u043d</th><th></th></tr></thead><tbody>";');
  js.push('    res.templates.forEach(function(t) {');
  js.push('      var pc = payColors[t.payType]||"var(--sub)";');
  js.push('      h += "<tr>";');
  js.push('      h += "<td style=\\"font-weight:600\\">" + t.position + "</td>";');
  js.push('      h += "<td style=\\"color:" + pc + ";font-weight:600;font-size:13px\\">" + t.payType + "</td>";');
  js.push('      h += "<td style=\\"font-size:13px;color:var(--sub)\\">" + (t.term||"\u2014") + "</td>";');
  js.push('      h += "<td style=\\"font-size:12px;color:var(--sub)\\">" + (t.author||"") + " " + (t.created||"") + "</td>";');
  js.push('      h += "<td style=\\"white-space:nowrap\\">";');
  js.push('      h += "<button class=\\"btn bp\\" style=\\"padding:3px 10px;font-size:12px;margin-right:4px\\" data-tid=\\""+t.id+"\\" onclick=\\"openContractTplMdl(this)\\">\\u0440\\u0435\\u0434.</button>";');
  js.push('      h += "<button class=\\"btn bs\\" style=\\"padding:3px 10px;font-size:12px;margin-right:4px\\" data-tid=\\""+t.id+"\\" onclick=\\"openGenerateMdl(this)\\">\\u0432\\u044b\\u0434\\u0430\\u0442\\u044c</button>";');
  js.push('      h += "<button class=\\"btn bd\\" style=\\"padding:3px 10px;font-size:12px\\" data-tid=\\""+t.id+"\\" onclick=\\"deleteContractTpl(this)\\">\\u0443\\u0434.</button>";');
  js.push('      h += "</td></tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    if (el) el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  // Открыть модалку шаблона
  js.push('function openContractTplMdl(btn) {');
  js.push('  var tpl = null;');
  js.push('  if (btn && btn.dataset && btn.dataset.tid) {');
  js.push('    tpl = contractTplCache.filter(function(t){return t.id===btn.dataset.tid;})[0]||null;');
  js.push('  }');
  js.push('  document.getElementById("mdlContractTplTitle").textContent = tpl ? "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0448\u0430\u0431\u043b\u043e\u043d" : "\u041d\u043e\u0432\u044b\u0439 \u0448\u0430\u0431\u043b\u043e\u043d";');
  js.push('  document.getElementById("ctplId").value         = tpl ? tpl.id : "";');
  js.push('  document.getElementById("ctplDuties").value     = tpl ? (tpl.duties||"") : "";');
  js.push('  document.getElementById("ctplEmpRights").value  = tpl ? (tpl.empRights||"") : "";');
  js.push('  document.getElementById("ctplCompRights").value = tpl ? (tpl.compRights||"") : "";');
  js.push('  document.getElementById("ctplPayText").value    = tpl ? (tpl.payText||"") : "";');
  js.push('  document.getElementById("ctplStandards").value  = tpl ? (tpl.standards||"") : "";');
  js.push('  document.getElementById("ctplExtra").value      = tpl ? (tpl.extra||"") : "";');
  // Заполнить должности
  js.push('  var pSel = document.getElementById("ctplPos");');
  js.push('  if (!hrDicts) {');
  js.push('    srv("hrGetConfig",{},function(r){');
  js.push('      hrDicts=r.ok?r:{positions:[]};');
  js.push('      pSel.innerHTML="<option value=\\"\\">\\u2014</option>"+(hrDicts.positions||[]).map(function(p){return "<option>"+p+"</option>";}).join("");');
  js.push('      if(tpl) setTimeout(function(){pSel.value=tpl.position||""; document.getElementById("ctplPayType").value=tpl.payType||""; document.getElementById("ctplTerm").value=tpl.term||"\\u0411\\u0435\\u0441\\u0441\\u0440\\u043e\\u0447\\u043d\\u044b\\u0439";},50);');
  js.push('    });');
  js.push('  } else {');
  js.push('    pSel.innerHTML="<option value=\\"\\">\\u2014</option>"+(hrDicts.positions||[]).map(function(p){return "<option>"+p+"</option>";}).join("");');
  js.push('    if(tpl) setTimeout(function(){pSel.value=tpl.position||""; document.getElementById("ctplPayType").value=tpl.payType||""; document.getElementById("ctplTerm").value=tpl.term||"\\u0411\\u0435\\u0441\\u0441\\u0440\\u043e\\u0447\\u043d\\u044b\\u0439";},50);');
  js.push('  }');
  js.push('  showMdl("mdlContractTpl");');
  js.push('}');
  js.push('');

  js.push('function saveContractTpl() {');
  js.push('  var pos = document.getElementById("ctplPos").value;');
  js.push('  if (!pos) { toast("\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c","err"); return; }');
  js.push('  var payload = {');
  js.push('    id:         document.getElementById("ctplId").value || undefined,');
  js.push('    position:   pos,');
  js.push('    payType:    document.getElementById("ctplPayType").value,');
  js.push('    term:       document.getElementById("ctplTerm").value,');
  js.push('    duties:     document.getElementById("ctplDuties").value.trim(),');
  js.push('    empRights:  document.getElementById("ctplEmpRights").value.trim(),');
  js.push('    compRights: document.getElementById("ctplCompRights").value.trim(),');
  js.push('    payText:    document.getElementById("ctplPayText").value.trim(),');
  js.push('    standards:  document.getElementById("ctplStandards").value.trim(),');
  js.push('    extra:      document.getElementById("ctplExtra").value.trim()');
  js.push('  };');
  js.push('  srv("contractSaveTemplate",{payload:payload},function(res){');
  js.push('    if(res.ok){toast("\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e","ok");closeMdl("mdlContractTpl");loadHRContracts();}');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function deleteContractTpl(btn) {');
  js.push('  if(!confirm("\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0448\u0430\u0431\u043b\u043e\u043d?")) return;');
  js.push('  srv("contractDeleteTemplate",{payload:{id:btn.dataset.tid}},function(res){');
  js.push('    if(res.ok){toast("\u0423\u0434\u0430\u043b\u0435\u043d\u043e","ok");loadHRContracts();}else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── Создать договор ──
  js.push('function openGenerateMdl(btn) {');
  js.push('  var preselTid = btn && btn.dataset ? btn.dataset.tid : null;');
  js.push('  // Загрузить шаблоны в select');
  js.push('  var tplSel = document.getElementById("genTplId");');
  js.push('  if (contractTplCache.length) {');
  js.push('    tplSel.innerHTML = "<option value=\\"\\">\\u2014</option>" + contractTplCache.map(function(t){return "<option value=\\""+t.id+"\\">"+t.position+" \u2014 "+t.payType+"</option>";}).join("");');
  js.push('  } else {');
  js.push('    srv("contractGetTemplates",{},function(r){');
  js.push('      if(r.ok){contractTplCache=r.templates;tplSel.innerHTML="<option value=\\"\\">\\u2014</option>"+r.templates.map(function(t){return "<option value=\\""+t.id+"\\">"+t.position+" \u2014 "+t.payType+"</option>";}).join("");}');
  js.push('    });');
  js.push('  }');
  js.push('  if(preselTid) setTimeout(function(){tplSel.value=preselTid;},100);');
  // Сброс полей
  js.push('  document.getElementById("genEmpSearch").value = "";');
  js.push('  document.getElementById("genEmpId").value = "";');
  js.push('  document.getElementById("genEmpInfo").style.display = "none";');
  js.push('  document.getElementById("genEmpResults").style.display = "none";');
  js.push('  document.getElementById("genSalary").value = "";');
  js.push('  var d=new Date(); var dd=("0"+d.getDate()).slice(-2); var mm=("0"+(d.getMonth()+1)).slice(-2);');
  js.push('  document.getElementById("genStartDate").value = d.getFullYear()+"-"+mm+"-"+dd;');
  js.push('  document.getElementById("genEndDate").value = "";');
  js.push('  showMdl("mdlGenContract");');
  js.push('}');
  js.push('');

  js.push('function genSearchEmp(q) {');
  js.push('  var res = document.getElementById("genEmpResults");');
  js.push('  if (!q||q.length<2) { res.style.display="none"; return; }');
  js.push('  var src = hrAllEmployees.length ? hrAllEmployees : (fireEmpCache.length ? fireEmpCache : []);');
  js.push('  if (!src.length) {');
  js.push('    srv("hrGetEmployees",{payload:{filter:"active"}},function(r){');
  js.push('      if(r.ok){fireEmpCache=r.employees;genSearchEmp(q);}');
  js.push('    });');
  js.push('    return;');
  js.push('  }');
  js.push('  var matches = src.filter(function(e){return (e.fio||"").toLowerCase().indexOf(q.toLowerCase())!==-1;}).slice(0,8);');
  js.push('  if (!matches.length) { res.style.display="none"; return; }');
  js.push('  var h = "";');
  js.push('  matches.forEach(function(e) {');
  js.push('    h += "<div style=\\"padding:10px 12px;cursor:pointer;border-bottom:1px solid var(--bd)\\" onclick=\\"selectGenEmp(\'" + e.id + "\')\\">";');
  js.push('    h += "<div style=\\"font-weight:600\\">" + e.fio + "</div>";');
  js.push('    h += "<div style=\\"font-size:12px;color:var(--sub)\\">" + (e.dept||"") + " \u00b7 " + (e.position||"") + "</div>";');
  js.push('    h += "</div>";');
  js.push('  });');
  js.push('  res.innerHTML = h; res.style.display = "block";');
  js.push('}');
  js.push('');

  js.push('function selectGenEmp(id) {');
  js.push('  var src = hrAllEmployees.length ? hrAllEmployees : fireEmpCache;');
  js.push('  var e = src.filter(function(x){return String(x.id)===String(id);})[0];');
  js.push('  if (!e) return;');
  js.push('  document.getElementById("genEmpId").value = e.id;');
  js.push('  document.getElementById("genEmpSearch").value = e.fio;');
  js.push('  document.getElementById("genEmpInfo").textContent = e.dept+" \u00b7 "+e.position+" \u00b7 "+e.seniority;');
  js.push('  document.getElementById("genEmpInfo").style.display = "block";');
  js.push('  document.getElementById("genEmpResults").style.display = "none";');
  js.push('}');
  js.push('');

  js.push('function generateContract() {');
  js.push('  var tplId = document.getElementById("genTplId").value;');
  js.push('  var empId = document.getElementById("genEmpId").value;');
  js.push('  if (!tplId) { toast("\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0448\u0430\u0431\u043b\u043e\u043d","err"); return; }');
  js.push('  if (!empId) { toast("\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0430","err"); return; }');
  js.push('  var btn = document.getElementById("genContractBtn");');
  js.push('  btn.disabled = true; btn.textContent = "\u0421\u043e\u0437\u0434\u0430\u0451\u0442\u0441\u044f...";');
  js.push('  var payload = {');
  js.push('    templateId: tplId, empId: empId,');
  js.push('    startDate:  document.getElementById("genStartDate").value,');
  js.push('    endDate:    document.getElementById("genEndDate").value,');
  js.push('    salary:     document.getElementById("genSalary").value,');
  js.push('    city:       document.getElementById("genCity").value');
  js.push('  };');
  js.push('  srv("contractGenerate",{payload:payload},function(res){');
  js.push('    btn.disabled=false; btn.textContent="\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0438 \u0441\u043a\u0430\u0447\u0430\u0442\u044c";');
  js.push('    if (res.ok) {');
  js.push('      toast("\u0414\u043e\u0433\u043e\u0432\u043e\u0440 №"+res.contractNum+" \u0441\u043e\u0437\u0434\u0430\u043d \u0434\u043b\u044f "+res.fio,"ok");');
  js.push('      closeMdl("mdlGenContract");');
  js.push('      if (res.url) window.open(res.url,"_blank");');
  js.push('      loadHRContLog();');
  js.push('    } else toast(res.error||"\u041e\u0448\u0438\u0431\u043a\u0430","err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── Журнал договоров ──
  js.push('function loadHRContLog() {');
  js.push('  var el = document.getElementById("hrContLogCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("contractGetLog",{payload:{}},function(res){');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    if (!res.contracts.length) {');
  js.push('      if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-ico\\">📋</div><div class=\\"empty-t\\">\u0414\u043e\u0433\u043e\u0432\u043e\u0440\u043e\u0432 \u043d\u0435\u0442</div></div>";');
  js.push('      return;');
  js.push('    }');
  js.push('    var h = "<div class=\\"tw\\"><table><thead><tr>";');
  js.push('    h += "<th>\\u2116</th><th>\\u0414\\u0430\\u0442\\u0430</th><th>\\u0424\\u0418\\u041e</th><th>\\u0414\\u043e\\u043b\\u0436\\u043d\\u043e\\u0441\\u0442\\u044c</th><th>\\u041d\\u0430\\u0447\\u0430\\u043b\\u043e</th><th>\\u041e\\u043a\\u043e\\u043d\\u0447\\u0430\\u043d\\u0438\\u0435</th><th>\\u0421\\u0442\\u0430\\u0442\\u0443\\u0441</th><th>\\u041f\\u043e\\u0434\\u043f\\u0438\\u0441\\u0430\\u043d</th><th></th></tr></thead><tbody>";');
  js.push('    res.contracts.forEach(function(c) {');
  js.push('      var signedColor = c.signed==="\u041f\u043e\u0434\u043f\u0438\u0441\u0430\u043d" ? "color:var(--ok)" : "color:var(--warn)";');
  js.push('      h += "<tr>";');
  js.push('      h += "<td style=\\"color:var(--sub)\\">" + c.num + "</td>";');
  js.push('      h += "<td style=\\"font-size:12px\\">" + (c.date||"") + "</td>";');
  js.push('      h += "<td style=\\"font-weight:600\\">" + c.fio + "</td>";');
  js.push('      h += "<td style=\\"font-size:13px;color:var(--sub)\\">" + (c.position||"") + "</td>";');
  js.push('      h += "<td style=\\"font-size:12px\\">" + (c.startDate||"") + "</td>";');
  js.push('      h += "<td style=\\"font-size:12px;color:var(--sub)\\">" + (c.endDate||"\u0431\u0435\u0441\u0441\u0440\u043e\u0447\u043d\u044b\u0439") + "</td>";');
  js.push('      h += "<td style=\\"font-size:13px;color:var(--ok)\\">" + (c.status||"") + "</td>";');
  js.push('      h += "<td style=\\"font-size:13px;" + signedColor + "\\">" + (c.signed||"\u041d\u0435\u0442") + "</td>";');
  js.push('      h += "<td style=\\"white-space:nowrap\\">";');
  js.push('      if (c.url) h += "<a href=\\""+c.url+"\\" target=\\"_blank\\" class=\\"btn bs\\" style=\\"padding:3px 10px;font-size:12px;margin-right:4px\\">\\u0441\\u043a\\u0430\\u0447\\u0430\\u0442\\u044c</a>";');
  js.push('      h += "<button class=\\"btn bp\\" style=\\"padding:3px 10px;font-size:12px\\" data-num=\\""+c.num+"\\" onclick=\\"markSigned(this)\\">подписан</button>";');
  js.push('      h += "</td></tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    if (el) el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function markSigned(btn) {');
  js.push('  srv("contractMarkSigned",{payload:{num:btn.dataset.num}},function(res){');
  js.push('    if(res.ok){toast("\u041e\u0442\u043c\u0435\u0447\u0435\u043d\u043e \u043a\u0430\u043a \u043f\u043e\u0434\u043f\u0438\u0441\u0430\u043d\u043d\u044b\u0439","ok");loadHRContLog();}');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // ════════════════════════════════════════════════════════
  // ШТА ЖАДВАЛИ — КОНСТРУКТОР ДОКУМЕНТОВ
  // ════════════════════════════════════════════════════════
  js.push('var sdCurrentId = null;');
  js.push('var sdCols = [];  // текущие колонки');
  js.push('var sdRows = [];  // текущие строки');
  js.push('var sdPositions = []; // справочник должностей для выпадающего списка');
  js.push('var sdEmpNames  = []; // список ФИО активных сотрудников для выпадающего списка');
  js.push('');

  // Подгружает справочники перед открытием конструктора
  js.push('function ensureStaffDocLists(cb) {');
  js.push('  var tasks = [];');
  js.push('  if (!sdPositions.length || !hrDicts || !hrDicts.depts || !hrDicts.depts.length) {');
  js.push('    tasks.push(function(next) {');
  js.push('      if (hrDicts && hrDicts.positions && hrDicts.positions.length && hrDicts.depts && hrDicts.depts.length) { sdPositions = hrDicts.positions; next(); return; }');
  js.push('      srv("hrGetConfig", {}, function(r) { if (r.ok) { hrDicts = r; sdPositions = r.positions||[]; } next(); });');
  js.push('    });');
  js.push('  }');
  js.push('  if (!sdEmpNames.length) {');
  js.push('    tasks.push(function(next) {');
  js.push('      srv("hrGetEmployees", {payload:{filter:"active"}}, function(r) {');
  js.push('        if (r.ok) sdEmpNames = r.employees.map(function(e){return e.fio;}).sort();');
  js.push('        next();');
  js.push('      });');
  js.push('    });');
  js.push('  }');
  js.push('  if (!tasks.length) { cb(); return; }');
  js.push('  var remaining = tasks.length;');
  js.push('  tasks.forEach(function(t){ t(function(){ remaining--; if (remaining<=0) cb(); }); });');
  js.push('}');
  js.push('');

  // Заполнить выпадающий список отделов в шапке документа
  js.push('function populateSdDeptList() {');
  js.push('  var dl = document.getElementById("sdDeptList");');
  js.push('  if (!dl) return;');
  js.push('  var depts = (hrDicts && hrDicts.depts) || [];');
  js.push('  dl.innerHTML = depts.map(function(d){ return "<option value=\\""+d.replace(/"/g,"&quot;")+"\\">"; }).join("");');
  js.push('}');
  js.push('');

  // ── Список документов ──
  js.push('function loadHRStaffDoc() {');
  js.push('  var el=document.getElementById("hrStaffDocCont");');
  js.push('  if(el) el.innerHTML="<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("staffDocList",{},function(res){');
  js.push('    if(!res.ok){if(el)el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>";return;}');
  js.push('    if(!res.docs.length){');
  js.push('      if(el)el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-ico\\">📄</div><div class=\\"empty-t\\">\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u043e\u0432 \u043d\u0435\u0442. \u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u00ab\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u00bb</div></div>";return;');
  js.push('    }');
  js.push('    srv("approvalGetHistoryBulk", {payload:{docType:"\u0428\u0442\u0430\u0442\u043d\u043e\u0435_\u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435"}}, function(apRes) {');
  js.push('      var byRef = (apRes.ok && apRes.byRef) || {};');
  js.push('      var h="<div class=\\"tw\\"><table><thead><tr><th>\u041e\u0442\u0434\u0435\u043b</th><th>\u0414\u0430\u0442\u0430</th><th>\u0410\u0432\u0442\u043e\u0440</th><th>\u0421\u0442\u0430\u0442\u0443\u0441 \u0441\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u044f</th><th></th></tr></thead><tbody>";');
  js.push('      res.docs.forEach(function(d){');
  js.push('        var ap = byRef[d.id];');
  js.push('        var statusHtml = "<span style=\\"color:var(--sub);font-size:12px\\">\u0447\u0435\u0440\u043d\u043e\u0432\u0438\u043a</span>";');
  js.push('        if (ap) {');
  js.push('          if (ap.status==="\u041d\u0430 \u0441\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u0438") statusHtml = "<span style=\\"color:var(--warn);font-weight:600;font-size:13px\\">\u23f3 \u041d\u0430 \u0441\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u0438</span>";');
  js.push('          else if (ap.status==="\u0423\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u043e") statusHtml = "<span style=\\"color:var(--ok);font-weight:600;font-size:13px\\">\u2714 \u0423\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u043e</span>";');
  js.push('          else if (ap.status==="\u041e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u043e") statusHtml = "<span style=\\"color:var(--err);font-weight:600;font-size:13px\\">\u2716 \u041e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u043e</span><br><span style=\\"font-size:11px;color:var(--sub)\\">"+(ap.comment||"")+"</span>";');
  js.push('        }');
  js.push('        h+="<tr>";');
  js.push('        h+="<td style=\\"font-weight:600\\">"+d.dept+"</td>";');
  js.push('        h+="<td style=\\"font-size:13px;color:var(--sub)\\">"+d.date+"</td>";');
  js.push('        h+="<td style=\\"font-size:12px;color:var(--sub)\\">"+d.author+"</td>";');
  js.push('        h+="<td>"+statusHtml+"</td>";');
  js.push('        h+="<td style=\\"white-space:nowrap\\">";');
  js.push('        h+="<button class=\\"btn bp\\" style=\\"padding:3px 10px;font-size:12px;margin-right:4px\\" data-sdid=\\""+d.id+"\\" onclick=\\"editStaffDoc(this)\\">\u0440\u0435\u0434.</button>";');
  js.push('        if(d.url) h+="<a href=\\""+d.url+"\\" target=\\"_blank\\" class=\\"btn bs\\" style=\\"padding:3px 10px;font-size:12px;margin-right:4px\\">\u0441\u043a\u0430\u0447\u0430\u0442\u044c</a>";');
  js.push('        h+="<button class=\\"btn bs\\" style=\\"padding:3px 10px;font-size:12px;margin-right:4px;background:var(--ok)\\" data-sdid=\\""+d.id+"\\" onclick=\\"generateStaffDoc(this)\\">Word</button>";');
  js.push('        if (!ap || ap.status==="\u041e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u043e") {');
  js.push('          h+="<button class=\\"btn\\" style=\\"padding:3px 10px;font-size:12px;margin-right:4px;background:var(--warn);color:#000\\" data-sdid=\\""+d.id+"\\" data-dept=\\""+d.dept.replace(/"/g,"&quot;")+"\\" onclick=\\"sendStaffDocApproval(this)\\">\u041d\u0430 \u0441\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u0435</button>";');
  js.push('        }');
  js.push('        h+="<button class=\\"btn bd\\" style=\\"padding:3px 10px;font-size:12px\\" data-sdid=\\""+d.id+"\\" onclick=\\"deleteStaffDoc(this)\\">\u0443\u0434.</button>";');
  js.push('        h+="</td></tr>";');
  js.push('      });');
  js.push('      h+="</tbody></table></div>";');
  js.push('      if(el) el.innerHTML=h;');
  js.push('    });');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function sendStaffDocApproval(btn) {');
  js.push('  submitForApproval("\u0428\u0442\u0430\u0442\u043d\u043e\u0435_\u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435", btn.dataset.sdid, btn.dataset.dept + " \u2014 \u0428\u0442\u0430\u0442 \u0436\u0430\u0434\u0432\u0430\u043b\u0438");');
  js.push('}');
  js.push('');

  // ── Открыть конструктор — новый документ ──
  js.push('function openStaffDocMdl() {');
  js.push('  sdCurrentId = null;');
  js.push('  sdCols = [');
  js.push('    {key:"subDept",  label:"\u0411\u045e\u043b\u0438\u043d\u043c\u0430",  width:900,  align:"left"},');
  js.push('    {key:"position", label:"\u041b\u0430\u0432\u043e\u0437\u0438\u043c", width:1400, align:"left"},');
  js.push('    {key:"fio",      label:"\u0424\u0418\u041e",      width:2000, align:"left"},');
  js.push('    {key:"salary",   label:"\u041e\u043a\u043b\u0430\u0434",    width:1200, align:"center"}');
  js.push('  ];');
  js.push('  sdRows = [');
  js.push('    ["","","",""],');
  js.push('    ["","","",""],');
  js.push('    ["","","",""],');
  js.push('    ["","","",""]');
  js.push('  ];');
  js.push('  document.getElementById("sdDept").value = "";');
  js.push('  ensureStaffDocLists(function() {');
  js.push('    populateSdDeptList();');
  js.push('    renderStaffDocBuilder();');
  js.push('    showMdl("mdlStaffDoc");');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── Редактировать существующий ──
  js.push('function editStaffDoc(btn) {');
  js.push('  srv("staffDocGet",{payload:{id:btn.dataset.sdid}},function(res){');
  js.push('    if(!res.ok){toast(res.error,"err");return;}');
  js.push('    sdCurrentId = res.meta.id;');
  js.push('    sdCols = res.cols;');
  js.push('    sdRows = res.rows;');
  js.push('    document.getElementById("sdDept").value = res.meta.dept||"";');
  js.push('    ensureStaffDocLists(function() {');
  js.push('      populateSdDeptList();');
  js.push('      renderStaffDocBuilder();');
  js.push('      showMdl("mdlStaffDoc");');
  js.push('    });');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── Отрисовка конструктора ──
  js.push('function renderStaffDocBuilder() {');
  js.push('  var el = document.getElementById("sdBuilderArea");');
  js.push('  if (!el) return;');
  // Панель управления колонками
  js.push('  var h = "<div style=\\"margin-bottom:10px\\">";');
  js.push('  h += "<div style=\\"font-weight:600;margin-bottom:6px;font-size:13px\\">\u041a\u043e\u043b\u043e\u043d\u043a\u0438:</div>";');
  js.push('  h += "<div id=\\"sdColsList\\" style=\\"display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px\\">";');
  js.push('  sdCols.forEach(function(c,ci){');
  js.push('    h += "<div style=\\"background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:6px 10px;display:flex;align-items:center;gap:6px\\">";');
  js.push('    h += "<span style=\\"font-size:13px\\">" + c.label + "</span>";');
  js.push('    h += "<span style=\\"font-size:11px;color:var(--sub)\\">[" + c.width + "]</span>";');
  js.push('    h += "<button onclick=\\"editCol("+ci+")\\" style=\\"background:none;border:none;color:var(--g);cursor:pointer;font-size:12px\\">✏️</button>";');
  js.push('    h += "<button onclick=\\"removeCol("+ci+")\\" style=\\"background:none;border:none;color:var(--err);cursor:pointer;font-size:14px\\">✕</button>";');
  js.push('    h += "</div>";');
  js.push('  });');
  js.push('  h += "</div>";');
  js.push('  h += "<button class=\\"btn bs\\" style=\\"font-size:12px;padding:4px 12px\\" onclick=\\"addCol()\\">+ \u041a\u043e\u043b\u043e\u043d\u043a\u0430</button>";');
  js.push('  h += "</div>";');
  // Таблица данных
  js.push('  h += "<div style=\\"overflow-x:auto\\">";');
  js.push('  h += "<table style=\\"border-collapse:collapse;min-width:100%\\">";');
  // Заголовок
  js.push('  h += "<thead><tr>";');
  js.push('  sdCols.forEach(function(c){');
  js.push('    h += "<th style=\\"border:1px solid var(--bd);padding:6px 8px;background:var(--s2);font-size:12px;min-width:"+(c.width/15)+"px\\">" + c.label + "</th>";');
  js.push('  });');
  js.push('  h += "<th style=\\"border:1px solid var(--bd);padding:4px;background:var(--s2);width:40px\\"></th>";');
  js.push('  h += "</tr></thead><tbody>";');
  // Строки
  js.push('  sdRows.forEach(function(row,ri){');
  js.push('    h += "<tr>";');
  js.push('    sdCols.forEach(function(c,ci){');
  js.push('      var val = row[ci]||"";');
  js.push('      if (c.key === "subDept") {');
  // Бўлинма — автоматически из шапки документа, не редактируется вручную
  js.push('        var deptVal = (document.getElementById("sdDept")||{}).value || "";');
  js.push('        row[ci] = deptVal;');
  js.push('        h += "<td style=\\"border:1px solid var(--bd);padding:6px 8px;color:var(--sub);font-style:italic;background:rgba(255,255,255,.02);min-width:"+(c.width/15)+"px\\">" + (deptVal||"\u2014") + "</td>";');
  js.push('      } else if (c.key === "position") {');
  // Лавозим — выпадающий список из справочника должностей
  js.push('        h += "<td style=\\"border:1px solid var(--bd);padding:2px\\">";');
  js.push('        h += "<select style=\\"width:100%;background:var(--s2);border:none;color:var(--txt);padding:4px 6px;font-size:12px;font-family:inherit;min-width:"+(c.width/15)+"px\\" onchange=\\"sdRows["+ri+"]["+ci+"]=this.value\\">";');
  js.push('        h += "<option value=\\"\\">\u2014</option>";');
  js.push('        sdPositions.forEach(function(p){ h += "<option"+(val===p?" selected":"")+">"+p+"</option>"; });');
  js.push('        h += "</select></td>";');
  js.push('      } else if (c.key === "fio") {');
  // ФИО — выпадающий список активных сотрудников
  js.push('        h += "<td style=\\"border:1px solid var(--bd);padding:2px\\">";');
  js.push('        h += "<select style=\\"width:100%;background:var(--s2);border:none;color:var(--txt);padding:4px 6px;font-size:12px;font-family:inherit;min-width:"+(c.width/15)+"px\\" onchange=\\"sdRows["+ri+"]["+ci+"]=this.value\\">";');
  js.push('        h += "<option value=\\"\\">\u2014</option>";');
  js.push('        sdEmpNames.forEach(function(f){ h += "<option"+(val===f?" selected":"")+">"+f+"</option>"; });');
  js.push('        h += "</select></td>";');
  js.push('      } else {');
  // Остальные (в т.ч. Оклад) — обычный текст/число, вводится вручную
  js.push('        h += "<td style=\\"border:1px solid var(--bd);padding:2px\\">";');
  js.push('        h += "<input style=\\"width:100%;background:transparent;border:none;color:var(--txt);padding:4px 6px;font-size:12px;font-family:inherit;min-width:"+(c.width/15)+"px\\"";');
  js.push('        h += " value=\\""+val.replace(/"/g,"&quot;")+"\\"";');
  js.push('        h += " oninput=\\"sdRows["+ri+"]["+ci+"]=this.value\\"";');
  js.push('        h += ">";');
  js.push('        h += "</td>";');
  js.push('      }');
  js.push('    });');
  js.push('    h += "<td style=\\"border:1px solid var(--bd);text-align:center;padding:2px\\">";');
  js.push('    h += "<button onclick=\\"removeRow("+ri+")\\" style=\\"background:none;border:none;color:var(--err);cursor:pointer;font-size:14px\\">✕</button>";');
  js.push('    h += "</td></tr>";');
  js.push('  });');
  js.push('  h += "</tbody></table></div>";');
  js.push('  h += "<button class=\\"btn bs\\" style=\\"margin-top:8px;font-size:12px;padding:4px 14px\\" onclick=\\"addRow()\\">+ \u0421\u0442\u0440\u043e\u043a\u0430</button>";');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');

  // Управление колонками
  js.push('function syncStaffDocDept() {');
  js.push('  var deptVal = (document.getElementById("sdDept")||{}).value || "";');
  js.push('  var subDeptCi = sdCols.findIndex(function(c){ return c.key==="subDept"; });');
  js.push('  if (subDeptCi === -1) return;');
  js.push('  sdRows.forEach(function(row, ri) {');
  js.push('    row[subDeptCi] = deptVal;');
  js.push('    var cells = document.querySelectorAll("#sdBuilderArea tbody tr");');
  js.push('    if (cells[ri] && cells[ri].children[subDeptCi]) {');
  js.push('      cells[ri].children[subDeptCi].textContent = deptVal || "\u2014";');
  js.push('    }');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function addCol() {');
  js.push('  var label = prompt("\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043a\u043e\u043b\u043e\u043d\u043a\u0438:");');
  js.push('  if (!label) return;');
  js.push('  var width = parseInt(prompt("\u0428\u0438\u0440\u0438\u043d\u0430 (1000-3000):", "1200"))||1200;');
  js.push('  var align = confirm("\u0426\u0435\u043d\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c?") ? "center" : "left";');
  js.push('  var key = "col" + Date.now();');
  js.push('  sdCols.push({key:key, label:label, width:width, align:align});');
  js.push('  sdRows.forEach(function(r){ r.push(""); });');
  js.push('  renderStaffDocBuilder();');
  js.push('}');
  js.push('function editCol(ci) {');
  js.push('  var c = sdCols[ci];');
  js.push('  var label = prompt("\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435:", c.label);');
  js.push('  if (label===null) return;');
  js.push('  var width = parseInt(prompt("\u0428\u0438\u0440\u0438\u043d\u0430:", c.width))||c.width;');
  js.push('  sdCols[ci] = {key:c.key, label:label||c.label, width:width, align:c.align};');
  js.push('  renderStaffDocBuilder();');
  js.push('}');
  js.push('function removeCol(ci) {');
  js.push('  if (!confirm("\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043a\u043e\u043b\u043e\u043d\u043a\u0443?")) return;');
  js.push('  sdCols.splice(ci,1);');
  js.push('  sdRows.forEach(function(r){ r.splice(ci,1); });');
  js.push('  renderStaffDocBuilder();');
  js.push('}');
  js.push('function addRow() {');
  js.push('  sdRows.push(new Array(sdCols.length).fill(""));');
  js.push('  renderStaffDocBuilder();');
  js.push('}');
  js.push('function removeRow(ri) {');
  js.push('  sdRows.splice(ri,1);');
  js.push('  renderStaffDocBuilder();');
  js.push('}');
  js.push('');

  // Сохранить
  js.push('function saveStaffDocBuilder() {');
  js.push('  var dept = document.getElementById("sdDept").value.trim();');
  js.push('  if (!dept) { toast("\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043e\u0442\u0434\u0435\u043b","err"); return; }');
  // Гарантированно проставляем Бўлинма из шапки во все строки перед сохранением
  js.push('  var subDeptCi = sdCols.findIndex(function(c){ return c.key==="subDept"; });');
  js.push('  if (subDeptCi !== -1) { sdRows.forEach(function(row){ row[subDeptCi] = dept; }); }');
  js.push('  var payload = {dept:dept, cols:sdCols, rows:sdRows};');
  js.push('  var action = sdCurrentId ? "staffDocUpdate" : "staffDocCreate";');
  js.push('  if (sdCurrentId) payload.id = sdCurrentId;');
  js.push('  srv(action,{payload:payload},function(res){');
  js.push('    if(res.ok){');
  js.push('      toast("\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e","ok");');
  js.push('      closeMdl("mdlStaffDoc");');
  js.push('      loadHRStaffDoc();');
  js.push('    } else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // Генерация Word
  js.push('function generateStaffDoc(btn) {');
  js.push('  var id = btn.dataset.sdid;');
  js.push('  var dateStr = prompt("\u0414\u0430\u0442\u0430 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430 (\u043d\u0430\u043f\u0440: \u201c01\u201d  \u0418\u044e\u043b\u044c 2026 \u0439\u0438\u043b):","");');
  js.push('  btn.textContent = "\u0413\u0435\u043d..."; btn.disabled = true;');
  js.push('  srv("staffDocGenerate",{payload:{id:id, date:dateStr}},function(res){');
  js.push('    btn.textContent="Word"; btn.disabled=false;');
  js.push('    if(res.ok){');
  js.push('      toast("\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u0441\u043e\u0437\u0434\u0430\u043d","ok");');
  js.push('      if(res.url) window.open(res.url,"_blank");');
  js.push('      loadHRStaffDoc();');
  js.push('    } else toast(res.error||"\u041e\u0448\u0438\u0431\u043a\u0430","err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // Удалить
  js.push('function deleteStaffDoc(btn) {');
  js.push('  if(!confirm("\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442?")) return;');
  js.push('  srv("staffDocDelete",{payload:{id:btn.dataset.sdid}},function(res){');
  js.push('    if(res.ok){toast("\u0423\u0434\u0430\u043b\u0435\u043d\u043e","ok");loadHRStaffDoc();}');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // ════════════════════════════════════════════════════════
  // ФИНАНСИСТ — СОГЛАСОВАНИЯ + СЕБЕСТОИМОСТЬ SKU
  // ════════════════════════════════════════════════════════
  js.push('var apDecCurrentId = null;');
  js.push('var skuCostCache = [];');
  js.push('');

  // ── Универсальная функция: отправить любой документ на согласование ──
  // (вызывается из других модулей: submitForApproval("Штатное_расписание", docId, "Название"))
  js.push('function submitForApproval(docType, refId, title) {');
  js.push('  srv("approvalSubmit", {payload:{docType:docType, refId:refId, title:title}}, function(res) {');
  js.push('    if (res.ok) { toast(res.message,"ok"); if (typeof loadHRStaffDoc==="function") loadHRStaffDoc(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── Очередь на согласование (Финансист) ──
  js.push('function loadFinApprovals() {');
  js.push('  var el = document.getElementById("finApprovalsCont");');
  js.push('  el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("approvalGetPending", {payload:{}}, function(res) {');
  js.push('    if (!res.ok) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    if (!res.items.length) {');
  js.push('      el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">✅</div><div class=\\"empty-t\\">\u041d\u0435\u0442 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u043e\u0432 \u043d\u0430 \u0441\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u0438</div></div>";');
  js.push('      return;');
  js.push('    }');
  js.push('    var h = "";');
  js.push('    res.items.forEach(function(it) {');
  js.push('      h += "<div class=\\"card\\" style=\\"margin-bottom:12px;border:1px solid var(--warn)\\">";');
  js.push('      h += "<div style=\\"display:flex;justify-content:space-between;align-items:center\\">";');
  js.push('      h += "<div><div style=\\"font-weight:700;font-size:15px\\">" + it.title + "</div>";');
  js.push('      h += "<div style=\\"font-size:13px;color:var(--sub);margin-top:4px\\">" + it.docType + " \u00b7 \u043e\u0442 " + it.initiator + " \u00b7 " + it.dateSent + "</div></div>";');
  js.push('      h += "<button class=\\"btn bp\\" data-id=\\""+it.id+"\\" data-title=\\""+it.title.replace(/"/g,"&quot;")+"\\" onclick=\\"openApprovalDecisionMdl(this)\\">\u0420\u0430\u0441\u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c</button>";');
  js.push('      h += "</div></div>";');
  js.push('    });');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function openApprovalDecisionMdl(btn) {');
  js.push('  apDecCurrentId = btn.dataset.id;');
  js.push('  document.getElementById("apDecTitle").textContent = btn.dataset.title;');
  js.push('  document.getElementById("apDecMeta").textContent = "";');
  js.push('  document.getElementById("apDecComment").value = "";');
  js.push('  showMdl("mdlApprovalDecision");');
  js.push('}');
  js.push('');

  js.push('function submitApprovalDecision(approve) {');
  js.push('  if (!apDecCurrentId) return;');
  js.push('  if (approve) {');
  js.push('    srv("approvalApprove", {payload:{id:apDecCurrentId}}, function(res) {');
  js.push('      if (res.ok) { toast(res.message,"ok"); closeMdl("mdlApprovalDecision"); loadFinApprovals(); }');
  js.push('      else toast(res.error,"err");');
  js.push('    });');
  js.push('  } else {');
  js.push('    var comment = document.getElementById("apDecComment").value.trim();');
  js.push('    if (!comment) { toast("\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043f\u0440\u0438\u0447\u0438\u043d\u0443 \u043e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u0438\u044f","err"); return; }');
  js.push('    srv("approvalReject", {payload:{id:apDecCurrentId, comment:comment}}, function(res) {');
  js.push('      if (res.ok) { toast(res.message,"ok"); closeMdl("mdlApprovalDecision"); loadFinApprovals(); }');
  js.push('      else toast(res.error,"err");');
  js.push('    });');
  js.push('  }');
  js.push('}');
  js.push('');

  // ── Журнал всех согласований ──
  js.push('function loadFinApprovalHistory() {');
  js.push('  var el = document.getElementById("finApprovalHistCont");');
  js.push('  el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("approvalGetAll", {payload:{}}, function(res) {');
  js.push('    if (!res.ok) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    if (!res.items.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">\u041f\u0443\u0441\u0442\u043e</div></div>"; return; }');
  js.push('    var h = "<div class=\\"tw\\"><table><thead><tr><th>\u0414\u0430\u0442\u0430</th><th>\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442</th><th>\u0418\u043d\u0438\u0446\u0438\u0430\u0442\u043e\u0440</th><th>\u0421\u0442\u0430\u0442\u0443\u0441</th><th>\u041a\u0442\u043e \u0440\u0435\u0448\u0438\u043b</th><th>\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439</th></tr></thead><tbody>";');
  js.push('    res.items.forEach(function(it) {');
  js.push('      var sc = it.status==="\u0423\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u043e" ? "color:var(--ok)" : it.status==="\u041e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u043e" ? "color:var(--err)" : "color:var(--warn)";');
  js.push('      h += "<tr><td style=\\"font-size:12px\\">" + it.dateSent + "</td>";');
  js.push('      h += "<td style=\\"font-weight:600\\">" + it.title + "</td>";');
  js.push('      h += "<td style=\\"font-size:13px;color:var(--sub)\\">" + it.initiator + "</td>";');
  js.push('      h += "<td style=\\"" + sc + "\\">" + it.status + "</td>";');
  js.push('      h += "<td style=\\"font-size:13px;color:var(--sub)\\">" + (it.approver||"\u2014") + "</td>";');
  js.push('      h += "<td style=\\"font-size:12px;color:var(--sub)\\">" + (it.comment||"") + "</td></tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  // ── Себестоимость SKU ──
  js.push('function loadFinSkuCosts() {');
  js.push('  var el = document.getElementById("finSkuCostCont");');
  js.push('  el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("finGetSkuCosts", {}, function(res) {');
  js.push('    if (!res.ok) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    skuCostCache = res.costs;');
  js.push('    if (!res.costs.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">💰</div><div class=\\"empty-t\\">\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445. \u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u00ab+ \u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c\u00bb</div></div>"; return; }');
  js.push('    var h = "<div class=\\"tw\\"><table><thead><tr><th>\u041f\u0440\u043e\u0434\u0443\u043a\u0442</th><th>\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044b</th><th>\u0422\u0440\u0443\u0434</th><th>\u041f\u0440\u043e\u0447\u0438\u0435</th><th>\u0418\u0442\u043e\u0433\u043e</th><th></th></tr></thead><tbody>";');
  js.push('    res.costs.forEach(function(c) {');
  js.push('      h += "<tr><td style=\\"font-weight:600\\">" + c.product + "</td>";');
  js.push('      h += "<td style=\\"text-align:right\\">" + c.materials.toLocaleString() + "</td>";');
  js.push('      h += "<td style=\\"text-align:right\\">" + c.labor.toLocaleString() + "</td>";');
  js.push('      h += "<td style=\\"text-align:right\\">" + c.other.toLocaleString() + "</td>";');
  js.push('      h += "<td style=\\"text-align:right;font-weight:700;color:var(--g)\\">" + c.total.toLocaleString() + "</td>";');
  js.push('      h += "<td style=\\"white-space:nowrap\\"><button class=\\"btn bs\\" style=\\"padding:3px 10px;font-size:12px;margin-right:4px\\" data-p=\\""+c.product+"\\" onclick=\\"editSkuCost(this)\\">\u0440\u0435\u0434.</button>";');
  js.push('      h += "<button class=\\"btn bd\\" style=\\"padding:3px 10px;font-size:12px\\" data-ridx=\\""+c.rowIdx+"\\" onclick=\\"deleteSkuCost(this)\\">\u0443\u0434.</button></td></tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function openSkuCostMdl() {');
  js.push('  document.getElementById("skcProduct").disabled = false;');
  js.push('  document.getElementById("skcProduct").value = "";');
  js.push('  document.getElementById("skcMaterials").value = "";');
  js.push('  document.getElementById("skcLabor").value = "";');
  js.push('  document.getElementById("skcOther").value = "";');
  js.push('  document.getElementById("skcTotal").textContent = "0";');
  js.push('  document.getElementById("skcMatHint").textContent = "";');
  js.push('  var sel = document.getElementById("skcProduct");');
  js.push('  srv("finGetProductNames", {}, function(res) {');
  js.push('    sel.innerHTML = "<option value=\\"\\">\\u2014</option>";');
  js.push('    (res.names||[]).forEach(function(n){ var o=document.createElement("option"); o.value=n; o.textContent=n; sel.appendChild(o); });');
  js.push('  });');
  js.push('  sel.onchange = fetchMaterialCostForSku;');
  js.push('  ["skcMaterials","skcLabor","skcOther"].forEach(function(id) {');
  js.push('    document.getElementById(id).oninput = updateSkuCostTotal;');
  js.push('  });');
  js.push('  showMdl("mdlSkuCost");');
  js.push('}');
  js.push('');

  // ── Автоподстановка материальной себестоимости из "Норм расходов" (цена по FIFO) ──
  js.push('function fetchMaterialCostForSku() {');
  js.push('  var product = document.getElementById("skcProduct").value;');
  js.push('  var hint = document.getElementById("skcMatHint");');
  js.push('  if (!product) { hint.textContent = ""; return; }');
  js.push('  hint.textContent = "\u0440\u0430\u0441\u0447\u0451\u0442...";');
  js.push('  srv("finGetMaterialCostForProduct", {payload:{product:product}}, function(res) {');
  js.push('    if (!res.ok) { hint.textContent = ""; return; }');
  js.push('    if (!res.hasNorm) { hint.textContent = "\u043d\u0435\u0442 \u043d\u043e\u0440\u043c\u044b \u0440\u0430\u0441\u0445\u043e\u0434\u0430 \u0434\u043b\u044f \u044d\u0442\u043e\u0433\u043e \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u0430"; return; }');
  js.push('    document.getElementById("skcMaterials").value = res.cost;');
  js.push('    hint.textContent = "\u0430\u0432\u0442\u043e: " + res.cost.toLocaleString() + " \u0441\u0443\u043c/\u0448\u0442 \u0438\u0437 \u043d\u043e\u0440\u043c \u0440\u0430\u0441\u0445\u043e\u0434\u0430 \u00d7 \u0446\u0435\u043d\u0430 FIFO";');
  js.push('    updateSkuCostTotal();');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function updateSkuCostTotal() {');
  js.push('  var m = parseFloat(document.getElementById("skcMaterials").value)||0;');
  js.push('  var l = parseFloat(document.getElementById("skcLabor").value)||0;');
  js.push('  var o = parseFloat(document.getElementById("skcOther").value)||0;');
  js.push('  document.getElementById("skcTotal").textContent = (m+l+o).toLocaleString();');
  js.push('}');
  js.push('');

  js.push('function editSkuCost(btn) {');
  js.push('  var c = skuCostCache.filter(function(x){return x.product===btn.dataset.p;})[0];');
  js.push('  if (!c) return;');
  js.push('  openSkuCostMdl();');
  js.push('  setTimeout(function() {');
  js.push('    document.getElementById("skcProduct").value = c.product;');
  js.push('    document.getElementById("skcProduct").disabled = true;');
  js.push('    document.getElementById("skcMaterials").value = c.materials;');
  js.push('    document.getElementById("skcLabor").value = c.labor;');
  js.push('    document.getElementById("skcOther").value = c.other;');
  js.push('    updateSkuCostTotal();');
  js.push('  }, 100);');
  js.push('}');
  js.push('');

  js.push('function saveSkuCost() {');
  js.push('  var product = document.getElementById("skcProduct").value;');
  js.push('  if (!product) { toast("\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u0440\u043e\u0434\u0443\u043a\u0442","err"); return; }');
  js.push('  var payload = {');
  js.push('    product: product,');
  js.push('    materials: parseFloat(document.getElementById("skcMaterials").value)||0,');
  js.push('    labor:     parseFloat(document.getElementById("skcLabor").value)||0,');
  js.push('    other:     parseFloat(document.getElementById("skcOther").value)||0');
  js.push('  };');
  js.push('  srv("finSaveSkuCost", {payload:payload}, function(res) {');
  js.push('    if (res.ok) { toast(res.message,"ok"); closeMdl("mdlSkuCost"); loadFinSkuCosts(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function deleteSkuCost(btn) {');
  js.push('  if (!confirm("\u0423\u0434\u0430\u043b\u0438\u0442\u044c?")) return;');
  js.push('  srv("finDeleteSkuCost", {payload:{rowIdx:btn.dataset.ridx}}, function(res) {');
  js.push('    if (res.ok) { toast("\u0423\u0434\u0430\u043b\u0435\u043d\u043e","ok"); loadFinSkuCosts(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function recalcBalances() {');
  js.push('  if (!confirm("\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0432\u0441\u0435 \u043e\u0441\u0442\u0430\u0442\u043a\u0438 \u043f\u043e \u0438\u0441\u0442\u043e\u0440\u0438\u0438 \u043f\u0440\u0438\u0445\u043e\u0434\u043e\u0432 \u0438 \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0439?")) return;');
  js.push('  srv("warehouseRecalculateBalances", {}, function(res) {');
  js.push('    if (res.ok) {');
  js.push('      toast("\u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u043d\u043e \u043f\u043e\u0437\u0438\u0446\u0438\u0439: " + res.recalculated, "ok");');
  js.push('      loadWarehouseBalances();');
  js.push('    } else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function loadWarehouseBalances() {');
  js.push('  var el = document.getElementById("warehouseBalancesCont");');
  js.push('  el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  var banner = document.getElementById("recalcBannerWrap");');
  js.push('  if (banner && USER.role === "\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440") banner.style.display = "block";');
  js.push('  var fromEl = document.getElementById("whDateFrom");');
  js.push('  var toEl = document.getElementById("whDateTo");');
  js.push('  if (!fromEl.value && !toEl.value) {');
  js.push('    var now = new Date(), ago = new Date(); ago.setDate(ago.getDate()-30);');
  js.push('    toEl.value = now.toISOString().slice(0,10);');
  js.push('    fromEl.value = ago.toISOString().slice(0,10);');
  js.push('  }');
  js.push('  var selEl = document.getElementById("whWarehouseSel");');
  js.push('  var payload = {dateFrom: toRuDate(fromEl.value), dateTo: toRuDate(toEl.value), warehouse: selEl.value || null};');
  js.push('  srv("warehouseGetMaterialReport", {payload: payload}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">" + res.error + "</div></div>"; return; }');
  js.push('    if (res.canChoose) {');
  js.push('      var wrap = document.getElementById("whSelectWrap");');
  js.push('      wrap.style.display = "block";');
  js.push('      if (selEl.options.length <= 1) {');
  js.push('        while (selEl.options.length>1) selEl.remove(1);');
  js.push('        (res.reportable || []).forEach(function(w){ var o=document.createElement("option"); o.value=w; o.textContent=w; selEl.appendChild(o); });');
  js.push('        if (res.warehouse) selEl.value = res.warehouse;');
  js.push('      } else if (res.warehouse) { selEl.value = res.warehouse; }');
  js.push('    }');
  js.push('    if (!res.report || !res.report.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">\u043d\u0435\u0442 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u044f \u0437\u0430 \u044d\u0442\u043e\u0442 \u043f\u0435\u0440\u0438\u043e\u0434</div></div>"; return; }');
  js.push('    var h = "<div style=\\"margin-bottom:10px;font-size:13px;color:var(--sub)\\">\u0421\u043a\u043b\u0430\u0434: <b style=\\"color:var(--txt)\\">" + res.warehouse + "</b></div>";');
  js.push('    h += "<div class=\\"tw\\"><table><thead><tr><th>\u041d\u043e\u043c\u0435\u043d\u043a\u043b\u0430\u0442\u0443\u0440\u0430</th><th style=\\"text-align:right\\">\u041d\u0430\u0447\u0430\u043b\u043e</th><th style=\\"text-align:right\\">\u041f\u0440\u0438\u0445\u043e\u0434</th><th style=\\"text-align:right\\">\u0420\u0430\u0441\u0445\u043e\u0434</th><th style=\\"text-align:right\\">\u041e\u0441\u0442\u0430\u0442\u043e\u043a</th></tr></thead><tbody>";');
  js.push('    res.report.forEach(function(r) {');
  js.push('      var endBold = r.endBalance > 0 ? "font-weight:700" : "color:var(--sub)";');
  js.push('      h += "<tr><td>" + r.product + " <span style=\\"color:var(--sub);font-size:11px\\">(" + r.unit + ")</span></td>" +');
  js.push('        "<td style=\\"text-align:right\\">" + r.startBalance + "</td>" +');
  js.push('        "<td style=\\"text-align:right;" + (r.incoming>0?"color:var(--ok)":"") + "\\">" + r.incoming + "</td>" +');
  js.push('        "<td style=\\"text-align:right;" + (r.outgoing>0?"color:var(--err)":"") + "\\">" + r.outgoing + "</td>" +');
  js.push('        "<td style=\\"text-align:right;" + endBold + "\\">" + r.endBalance + "</td></tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('var transferWarehousesList = [];');
  js.push('var transferProductsList = [];');
  js.push('var transferRowSeq = 0;');
  js.push('var transferItemsCache = []; // {name, unit} — текущий список товаров в строках');
  js.push('function loadTransferItems(fromWarehouse, toWarehouse, cb) {');
  js.push('  var isToGP = toWarehouse === "\u0421\u043a\u043b\u0430\u0434 \u0413\u041f";');
  js.push('  if (isToGP) {');
  js.push('    srv("getProducts", {}, function(res) {');
  js.push('      transferItemsCache = (res.products || []).map(function(p){ return {name:p.name, unit:p.unit||"\u0435\u0434."}; });');
  js.push('      if (cb) cb();');
  js.push('    });');
  js.push('  } else {');
  js.push('    srv("skladGetMaterials", {}, function(res) {');
  js.push('      transferItemsCache = (res.ok ? res.materials : []).map(function(m){ return {name:m.name, unit:m.unit}; });');
  js.push('      if (cb) cb();');
  js.push('    });');
  js.push('  }');
  js.push('}');
  js.push('');

  js.push('function openTransferMdl() {');
  js.push('  var fromEl = document.getElementById("trFrom");');
  js.push('  fromEl.innerHTML = "<option value=\\"\\">\u2014 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0430... \u2014</option>";');
  js.push('  document.getElementById("trTo").innerHTML = "<option value=\\"\\">\u2014 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u2014</option>";');
  js.push('  document.getElementById("trReceiver").innerHTML = "<option value=\\"\\">\u2014 \u0441\u043d\u0430\u0447\u0430\u043b\u0430 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u043a\u043b\u0430\u0434 \u2014</option>";');
  js.push('  document.getElementById("transferItemsRows").innerHTML = "";');
  js.push('  transferRowSeq = 0;');
  js.push('  transferItemsCache = [];');
  js.push('  srv("warehouseGetMyWarehouses", {}, function(myRes) {');
  js.push('    if (!myRes.ok || !myRes.warehouses.length) { toast("\u0432\u0430\u0448\u0430 \u0440\u043e\u043b\u044c \u043d\u0435 \u043f\u0440\u0438\u0432\u044f\u0437\u0430\u043d\u0430 \u043a \u0441\u043a\u043b\u0430\u0434\u0443","err"); return; }');
  js.push('    fromEl.innerHTML = "";');
  js.push('    myRes.warehouses.forEach(function(w) { var o=document.createElement("option"); o.value=w; o.textContent=w; fromEl.appendChild(o); });');
  js.push('    fromEl.value = myRes.warehouses[0];');
  js.push('    onTrFromChange();');
  js.push('  });');
  js.push('  showMdl("mdlTransfer");');
  js.push('}');
  js.push('');

  js.push('function onTrFromChange() {');
  js.push('  var fromWarehouse = document.getElementById("trFrom").value;');
  js.push('  var sel = document.getElementById("trTo");');
  js.push('  sel.innerHTML = "<option value=\\"\\">\u2014 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u2014</option>";');
  js.push('  if (!fromWarehouse) return;');
  js.push('  srv("warehouseGetList", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    transferWarehousesList = res.warehouses;');
  js.push('    while (sel.options.length>1) sel.remove(1);');
  js.push('    // \u041f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u044b\u0435 \u0441\u043a\u043b\u0430\u0434\u044b \u0434\u0440\u0443\u0433\u0438\u0445 \u043b\u0438\u043d\u0438\u0439 \u0438\u0441\u043a\u043b\u044e\u0447\u0430\u044e\u0442\u0441\u044f \u0432\u0441\u0435\u0433\u0434\u0430.');
  js.push('    // \u0421\u0432\u043e\u0439 \u0436\u0435 \u043f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u044b\u0439 \u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d \u0422\u041e\u041b\u042c\u041a\u041e \u043a\u043e\u0433\u0434\u0430 \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u0435\u043b\u044c = \u0441\u0432\u043e\u0451 \u0436\u0435 \u00ab... — \u0421\u044b\u0440\u044c\u0451\u00bb (\u043f\u0435\u0440\u0435\u043d\u043e\u0441 \u0441\u044b\u0440\u044c\u044f \u043d\u0430 \u043f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u044b\u0439 \u0441\u043a\u043b\u0430\u0434 \u0441\u0432\u043e\u0435\u0439 \u043b\u0438\u043d\u0438\u0438).');
  js.push('    var ownInterim = fromWarehouse.indexOf("\u2014 \u0421\u044b\u0440\u044c\u0451") !== -1 ? fromWarehouse.replace("\u2014 \u0421\u044b\u0440\u044c\u0451", "\u2014 \u041f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u044b\u0439") : null;');
  js.push('    res.warehouses.filter(function(w){');
  js.push('      if (w === fromWarehouse) return false;');
  js.push('      if (w.indexOf("\u2014 \u041f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u044b\u0439") !== -1) return w === ownInterim;');
  js.push('      return true;');
  js.push('    }).forEach(function(w) { var o=document.createElement("option"); o.value=w; o.textContent=w; sel.appendChild(o); });');
  js.push('  });');
  js.push('  document.getElementById("transferItemsRows").innerHTML = "";');
  js.push('  transferRowSeq = 0;');
  js.push('  loadTransferItems(fromWarehouse, "", function(){ addTransferItemRow(); });');
  js.push('}');
  js.push('');

  js.push('function onTrToChange() {');
  js.push('  var toWarehouse = document.getElementById("trTo").value;');
  js.push('  var fromWarehouse = document.getElementById("trFrom").value;');
  js.push('  // Обновляем список получателей');
  js.push('  var sel = document.getElementById("trReceiver");');
  js.push('  sel.innerHTML = "<option value=\\"\\">\u2014 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0430... \u2014</option>";');
  js.push('  if (!toWarehouse) { sel.innerHTML = "<option value=\\"\\">\u2014 \u0441\u043d\u0430\u0447\u0430\u043b\u0430 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u043a\u043b\u0430\u0434 \u2014</option>"; return; }');
  js.push('  srv("warehouseGetWarehouseUsers", {payload:{warehouse:toWarehouse}}, function(res) {');
  js.push('    sel.innerHTML = "<option value=\\"\\">\u2014 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u2014</option>";');
  js.push('    if (!res.ok || !res.users.length) { sel.innerHTML += "<option disabled>\u043d\u0435\u0442 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u0439</option>"; return; }');
  js.push('    res.users.forEach(function(u) { var o=document.createElement("option"); o.value=u.fio; o.textContent=u.fio+" ("+u.role+")"; sel.appendChild(o); });');
  js.push('  });');
  js.push('  // Обновляем список товаров в зависимости от направления');
  js.push('  var prevRows = document.getElementById("transferItemsRows").childNodes.length;');
  js.push('  loadTransferItems(fromWarehouse, toWarehouse, function() {');
  js.push('    document.getElementById("transferItemsRows").innerHTML = "";');
  js.push('    transferRowSeq = 0;');
  js.push('    var count = prevRows > 0 ? prevRows : 1;');
  js.push('    for (var i = 0; i < count; i++) addTransferItemRow();');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function addTransferItemRow() {');
  js.push('  transferRowSeq++;');
  js.push('  var rid = "trRow" + transferRowSeq;');
  js.push('  var opts = "<option value=\\"\\">— \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 —</option>";');
  js.push('  transferItemsCache.forEach(function(m) { opts += "<option value=\\"" + m.name + "\\">" + m.name + " (" + m.unit + ")</option>"; });');
  js.push('  var row = document.createElement("div");');
  js.push('  row.id = rid;');
  js.push('  row.style.display = "flex"; row.style.gap = "8px"; row.style.marginBottom = "8px";');
  js.push('  row.innerHTML = "<select class=\\"fs\\" style=\\"flex:2\\">" + opts + "</select>" +');
  js.push('    "<input type=\\"number\\" class=\\"fi\\" placeholder=\\"\u043a\u043e\u043b-\u0432\u043e\\" style=\\"flex:1\\">" +');
  js.push('    "<button class=\\"btn bs\\" onclick=\\"removeTransferItemRow(\'" + rid + "\')\\">✕</button>";');
  js.push('  document.getElementById("transferItemsRows").appendChild(row);');
  js.push('}');
  js.push('');

  js.push('function removeTransferItemRow(rid) {');
  js.push('  var row = document.getElementById(rid);');
  js.push('  if (row) row.remove();');
  js.push('}');
  js.push('');

  js.push('function saveTransfer() {');
  js.push('  var fromWarehouse = document.getElementById("trFrom").value;');
  js.push('  var toWarehouse = document.getElementById("trTo").value;');
  js.push('  var receiverFio = document.getElementById("trReceiver").value;');
  js.push('  var items = [];');
  js.push('  document.getElementById("transferItemsRows").childNodes.forEach(function(row) {');
  js.push('    var sel = row.querySelector("select");');
  js.push('    var inp = row.querySelector("input");');
  js.push('    if (sel.value && inp.value) items.push({product: sel.value, qty: inp.value});');
  js.push('  });');
  js.push('  if (!fromWarehouse) { toast("\u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u043a\u043b\u0430\u0434-\u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u0435\u043b\u044f","err"); return; }');
  js.push('  if (!toWarehouse) { toast("\u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u043a\u043b\u0430\u0434-\u043f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u044f","err"); return; }');
  js.push('  if (!receiverFio) { toast("\u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u044f","err"); return; }');
  js.push('  if (!items.length) { toast("\u0434\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0445\u043e\u0442\u044f \u0431\u044b \u043e\u0434\u0438\u043d \u0442\u043e\u0432\u0430\u0440","err"); return; }');
  js.push('  srv("warehouseCreateTransfer", {payload:{fromWarehouse:fromWarehouse, toWarehouse:toWarehouse, receiverFio:receiverFio, items:items}}, function(res) {');
  js.push('    if (res.ok) { toast("\u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0435 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e! \u2116" + res.invoiceNo,"ok"); closeMdl("mdlTransfer"); loadAllTransfers(); loadIncomingTransfers(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function loadIncomingTransfers() {');
  js.push('  var el = document.getElementById("incomingTransfersCont");');
  js.push('  el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("warehouseGetMyWarehouses", {}, function(myRes) {');
  js.push('    if (!myRes.ok || !myRes.warehouses.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">\u0432\u0430\u0448\u0430 \u0440\u043e\u043b\u044c \u043d\u0435 \u0441\u0432\u044f\u0437\u0430\u043d\u0430 \u0441\u043e \u0441\u043a\u043b\u0430\u0434\u043e\u043c</div></div>"; return; }');
  js.push('    var allItems = [];');
  js.push('    var pending = myRes.warehouses.length;');
  js.push('    myRes.warehouses.forEach(function(w) {');
  js.push('      srv("warehouseGetIncomingTransfers", {payload:{warehouse:w}}, function(res) {');
  js.push('        pending--;');
  js.push('        if (res.ok) allItems = allItems.concat(res.list);');
  js.push('        if (pending === 0) renderIncomingTransfers(allItems);');
  js.push('      });');
  js.push('    });');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderIncomingTransfers(list) {');
  js.push('  var el = document.getElementById("incomingTransfersCont");');
  js.push('  if (!list.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">\u043d\u0435\u0442 \u043e\u0436\u0438\u0434\u0430\u044e\u0449\u0438\u0445 \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0439</div></div>"; return; }');
  js.push('  var h = "";');
  js.push('  list.forEach(function(r) {');
  js.push('    var itemsHtml = r.items.map(function(it){ return "<div style=\\"display:flex;justify-content:space-between\\"><span>" + it.product + "</span><span>" + it.qty + "</span></div>"; }).join("");');
  js.push('    h += "<div style=\\"background:var(--s2);border-radius:8px;padding:12px;margin-bottom:10px\\">" +');
  js.push('      "<div style=\\"font-weight:600;margin-bottom:6px\\">\u2116" + r.invoiceNo + " \u00b7 \u043e\u0442 " + r.fromWarehouse + "</div>" +');
  js.push('      "<div style=\\"font-size:13px;margin-bottom:8px\\">" + itemsHtml + "</div>" +');
  js.push('      "<div style=\\"font-size:12px;color:var(--sub);margin-bottom:8px\\">\u0434\u0430\u0442\u0430: " + r.date + " \u00b7 \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u043b: " + r.sentBy + "</div>" +');
  js.push('      "<div style=\\"display:flex;gap:8px\\"><button class=\\"btn bp\\" style=\\"flex:1;padding:8px\\" onclick=\\"confirmTransfer(\'" + r.id + "\')\\">✓ \u041f\u0440\u0438\u043d\u044f\u0442\u044c</button>" +');
  js.push('      "<button class=\\"btn bd\\" style=\\"flex:1;padding:8px\\" onclick=\\"rejectTransfer(\'" + r.id + "\')\\">✗ \u041e\u0442\u043a\u043b\u043e\u043d\u0438\u0442\u044c</button></div></div>";');
  js.push('  });');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('function confirmTransfer(id) {');
  js.push('  srv("warehouseConfirmTransfer", {payload:{id:id}}, function(res) {');
  js.push('    if (res.ok) { toast("\u043f\u0440\u0438\u043d\u044f\u0442\u043e!","ok"); loadIncomingTransfers(); loadAllTransfers(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('var rejectTransferId = "";');
  js.push('function rejectTransfer(id) {');
  js.push('  rejectTransferId = id;');
  js.push('  document.getElementById("rejectReasonInput").value = "";');
  js.push('  showMdl("mdlRejectTransfer");');
  js.push('}');
  js.push('');

  js.push('function confirmRejectTransfer() {');
  js.push('  var reason = document.getElementById("rejectReasonInput").value;');
  js.push('  if (!reason || !reason.trim()) { toast("\u0443\u043a\u0430\u0436\u0438\u0442\u0435 \u043f\u0440\u0438\u0447\u0438\u043d\u0443 \u043e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u0438\u044f","err"); return; }');
  js.push('  srv("warehouseRejectTransfer", {payload:{id:rejectTransferId, reason:reason.trim()}}, function(res) {');
  js.push('    if (res.ok) { toast("\u043e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u043e","ok"); closeMdl("mdlRejectTransfer"); loadIncomingTransfers(); loadAllTransfers(); if (document.getElementById("rejectedTransfersCont")) loadRejectedTransfers(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function loadAllTransfers() {');
  js.push('  document.getElementById("allTransfersCont").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("warehouseGetTransfers", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    var el = document.getElementById("allTransfersCont");');
  js.push('    if (!res.list.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">\u043f\u043e\u043a\u0430 \u043d\u0435\u0442 \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0439</div></div>"; return; }');
  js.push('    var h = "";');
  js.push('    var groupId = "allTr";');
  js.push('    res.list.forEach(function(r, idx) {');
  js.push('      var badgeCls = r.status==="\u041f\u0440\u0438\u043d\u044f\u0442\u043e"?"bg":(r.status==="\u041e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u043e"?"br":"by");');
  js.push('      var itemId = groupId + "-" + idx;');
  js.push('      var itemsHtml = r.items.map(function(it){ return "<div style=\\"display:flex;justify-content:space-between;padding:4px 0\\"><span>" + it.product + "</span><span style=\\"font-weight:600\\">" + it.qty + "</span></div>"; }).join("");');
  js.push('      var reasonHtml = (r.status==="\u041e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u043e" && r.reason) ? "<div style=\\"font-size:12px;color:var(--err);margin-top:6px\\">\u2716 \u043f\u0440\u0438\u0447\u0438\u043d\u0430: " + r.reason + "</div>" : "";');
  js.push('      h += "<div style=\\"background:var(--s2);border-radius:8px;margin-bottom:8px;overflow:hidden\\">" +');
  js.push('        "<div style=\\"display:flex;justify-content:space-between;align-items:center;padding:12px 14px;cursor:pointer\\" onclick=\\"toggleAcc(\'" + groupId + "\',\'" + itemId + "\')\\">" +');
  js.push('          "<div style=\\"display:flex;gap:10px;align-items:center;flex-wrap:wrap\\">" +');
  js.push('            "<span style=\\"font-weight:700\\">\u2116" + r.invoiceNo + "</span>" +');
  js.push('            "<span style=\\"color:var(--sub);font-size:13px\\">" + r.date + "</span>" +');
  js.push('            "<span style=\\"font-size:13px\\">" + r.fromWarehouse + " → " + r.toWarehouse + "</span>" +');
  js.push('            "<span class=\\"badge " + badgeCls + "\\">" + r.status + "</span></div>" +');
  js.push('          "<span id=\\"" + itemId + "-ico\\" data-accico=\\"" + groupId + "\\" style=\\"font-size:20px;color:var(--sub);font-weight:300;min-width:20px;text-align:center\\">+</span></div>" +');
  js.push('        "<div id=\\"" + itemId + "-body\\" data-accgroup=\\"" + groupId + "\\" style=\\"display:none;padding:0 14px 14px 14px;border-top:1px solid var(--bd)\\">" +');
  js.push('          "<div style=\\"font-size:12px;color:var(--sub);margin:10px 0 6px 0\\">\u041f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u044c: " + (r.receiverFio||"\u2014") + " \u00b7 \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u043b: " + (r.sentBy||"\u2014") + "</div>" +');
  js.push('          itemsHtml + reasonHtml +');
  js.push('          (canDeleteDocs() ? "<button class=\\"btn bd\\" style=\\"width:100%;margin-top:10px;padding:8px\\" onclick=\\"event.stopPropagation();deleteTransferDoc(\'" + r.id + "\')\\">🗑️ \u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442</button>" : "") +');
  js.push('          "</div></div>";');
  js.push('    });');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function deleteTransferDoc(id) {');
  js.push('  if (!confirm("\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u044d\u0442\u043e \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u0435? \u0415\u0441\u043b\u0438 \u043e\u043d\u043e \u0431\u044b\u043b\u043e \u043f\u0440\u0438\u043d\u044f\u0442\u043e \u2014 \u043e\u0441\u0442\u0430\u0442\u043a\u0438 \u0441\u043a\u043b\u0430\u0434\u043e\u0432 \u0431\u0443\u0434\u0443\u0442 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438 \u043e\u0442\u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u044b.")) return;');
  js.push('  srv("deleteTransferDocument", {payload:{id:id}}, function(res) {');
  js.push('    if (res.ok) { toast("\u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u0443\u0434\u0430\u043b\u0451\u043d","ok"); loadAllTransfers(); loadIncomingTransfers(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function loadRejectedTransfers() {');
  js.push('  var card = document.getElementById("rejectedTransfersCard");');
  js.push('  var el = document.getElementById("rejectedTransfersCont");');
  js.push('  el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("warehouseGetRejectedTransfers", {}, function(res) {');
  js.push('    if (!res.ok) { if (card) card.style.display = "none"; return; }');
  js.push('    if (!res.list.length) { if (card) card.style.display = "none"; return; }');
  js.push('    if (card) card.style.display = "block";');
  js.push('    var h = "";');
  js.push('    var groupId = "rejTr";');
  js.push('    res.list.forEach(function(r, idx) {');
  js.push('      var itemId = groupId + "-" + idx;');
  js.push('      var itemsHtml = r.items.map(function(it){ return "<div style=\\"display:flex;justify-content:space-between;padding:4px 0\\"><span>" + it.product + "</span><span style=\\"font-weight:600\\">" + it.qty + "</span></div>"; }).join("");');
  js.push('      h += "<div style=\\"background:var(--s2);border-left:3px solid var(--err);border-radius:8px;margin-bottom:10px;overflow:hidden\\">" +');
  js.push('        "<div style=\\"display:flex;justify-content:space-between;align-items:center;padding:12px 14px;cursor:pointer\\" onclick=\\"toggleAcc(\'" + groupId + "\',\'" + itemId + "\')\\">" +');
  js.push('          "<div style=\\"font-weight:600\\">\u2116" + r.invoiceNo + " \u00b7 \u043a " + r.toWarehouse + " (" + r.receiverFio + ")</div>" +');
  js.push('          "<span id=\\"" + itemId + "-ico\\" data-accico=\\"" + groupId + "\\" style=\\"font-size:20px;color:var(--sub);font-weight:300;min-width:20px;text-align:center\\">+</span></div>" +');
  js.push('        "<div id=\\"" + itemId + "-body\\" data-accgroup=\\"" + groupId + "\\" style=\\"display:none;padding:0 14px 14px 14px\\">" +');
  js.push('          "<div style=\\"font-size:13px;margin-bottom:8px\\">" + itemsHtml + "</div>" +');
  js.push('          "<div style=\\"font-size:12px;color:var(--err);margin-bottom:10px\\">\u2716 \u043f\u0440\u0438\u0447\u0438\u043d\u0430: " + r.reason + "</div>" +');
  js.push('          "<button class=\\"btn bp\\" style=\\"width:100%;padding:8px\\" onclick=\\"event.stopPropagation();openResendTransferMdl(\'" + r.id + "\')\\">✏️ \u0418\u0441\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0438 \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u043d\u043e\u0432\u043e</button></div></div>";');
  js.push('    });');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('var resendTrRowSeq = 0;');
  js.push('var resendTrOldId = "";');
  js.push('function openResendTransferMdl(oldId) {');
  js.push('  srv("warehouseGetRejectedTransfers", {}, function(res) {');
  js.push('    var rec = (res.list || []).find(function(r){ return r.id === oldId; });');
  js.push('    if (!rec) { toast("\u043d\u0430\u043a\u043b\u0430\u0434\u043d\u0430\u044f \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430","err"); return; }');
  js.push('    resendTrOldId = oldId;');
  js.push('    document.getElementById("resendTrInfo").innerHTML = "✖ \u041f\u0440\u0438\u0447\u0438\u043d\u0430 \u043e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u0438\u044f: <b>" + rec.reason + "</b>";');
  js.push('    document.getElementById("resendTrTo").value = rec.toWarehouse;');
  js.push('    document.getElementById("resendTrItemsRows").innerHTML = "";');
  js.push('    resendTrRowSeq = 0;');
  js.push('    loadTransferItems("", rec.toWarehouse, function() {');
  js.push('      rec.items.forEach(function(it){ addResendTrItemRow(it.product, it.qty); });');
  js.push('    });');
  js.push('    srv("warehouseGetWarehouseUsers", {payload:{warehouse:rec.toWarehouse}}, function(ur) {');
  js.push('      var sel = document.getElementById("resendTrReceiver");');
  js.push('      sel.innerHTML = "<option value=\\"\\">\u2014 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u2014</option>";');
  js.push('      (ur.users || []).forEach(function(u){ var o=document.createElement("option"); o.value=u.fio; o.textContent=u.fio+" ("+u.role+")"; sel.appendChild(o); });');
  js.push('      sel.value = rec.receiverFio;');
  js.push('    });');
  js.push('  });');
  js.push('  showMdl("mdlResendTransfer");');
  js.push('}');
  js.push('');

  js.push('function addResendTrItemRow(presetProduct, presetQty) {');
  js.push('  resendTrRowSeq++;');
  js.push('  var rid = "resendTrRow" + resendTrRowSeq;');
  js.push('  var opts = "<option value=\\"\\">— \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 —</option>";');
  js.push('  transferItemsCache.forEach(function(m) { opts += "<option value=\\"" + m.name + "\\"" + (m.name===presetProduct?" selected":"") + ">" + m.name + " (" + m.unit + ")</option>"; });');
  js.push('  var row = document.createElement("div");');
  js.push('  row.id = rid;');
  js.push('  row.style.display = "flex"; row.style.gap = "8px"; row.style.marginBottom = "8px";');
  js.push('  row.innerHTML = "<select class=\\"fs\\" style=\\"flex:2\\">" + opts + "</select>" +');
  js.push('    "<input type=\\"number\\" class=\\"fi\\" placeholder=\\"\u043a\u043e\u043b-\u0432\u043e\\" style=\\"flex:1\\" value=\\"" + (presetQty||"") + "\\">" +');
  js.push('    "<button class=\\"btn bs\\" onclick=\\"removeResendTrItemRow(\'" + rid + "\')\\">✕</button>";');
  js.push('  document.getElementById("resendTrItemsRows").appendChild(row);');
  js.push('}');
  js.push('function removeResendTrItemRow(rid) { var r=document.getElementById(rid); if(r) r.remove(); }');
  js.push('');

  js.push('function saveResendTransfer() {');
  js.push('  var toWarehouse = document.getElementById("resendTrTo").value;');
  js.push('  var receiverFio = document.getElementById("resendTrReceiver").value;');
  js.push('  var items = [];');
  js.push('  document.getElementById("resendTrItemsRows").childNodes.forEach(function(row) {');
  js.push('    var sel = row.querySelector("select"), inp = row.querySelector("input");');
  js.push('    if (sel.value && inp.value) items.push({product: sel.value, qty: inp.value});');
  js.push('  });');
  js.push('  if (!receiverFio) { toast("\u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u044f","err"); return; }');
  js.push('  if (!items.length) { toast("\u0434\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0445\u043e\u0442\u044f \u0431\u044b \u043e\u0434\u0438\u043d \u0442\u043e\u0432\u0430\u0440","err"); return; }');
  js.push('  srv("warehouseResendTransfer", {payload:{oldId:resendTrOldId, toWarehouse:toWarehouse, receiverFio:receiverFio, items:items}}, function(res) {');
  js.push('    if (res.ok) { toast("\u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e \u0437\u0430\u043d\u043e\u0432\u043e! \u2116" + res.invoiceNo,"ok"); closeMdl("mdlResendTransfer"); loadRejectedTransfers(); loadAllTransfers(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('// ── \u0410\u0434\u043c\u0438\u043d: \u043f\u0430\u043c\u044f\u0442\u044c \u0442\u0430\u0431\u043b\u0438\u0446 ──');
  js.push('var storageExpanded = {};');
  js.push('function loadStorageUsage() {');
  js.push('  document.getElementById("storageCont").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("adminGetStorageUsage", {}, function(res) {');
  js.push('    if (!res.ok) { toast(res.error,"err"); return; }');
  js.push('    renderStorageUsage(res);');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function renderStorageUsage(res) {');
  js.push('  var el = document.getElementById("storageCont");');
  js.push('  var h = "";');
  js.push('  if (res.errors && res.errors.length) {');
  js.push('    h += "<div style=\\"margin-bottom:16px;padding:12px;background:rgba(239,83,80,.1);border-radius:8px\\">" +');
  js.push('      "<div style=\\"font-weight:600;color:var(--err);margin-bottom:6px\\">⚠ \u043e\u0448\u0438\u0431\u043a\u0438 \u0434\u043e\u0441\u0442\u0443\u043f\u0430</div>";');
  js.push('    res.errors.forEach(function(e) { h += "<div style=\\"font-size:13px\\">" + e + "</div>"; });');
  js.push('    h += "</div>";');
  js.push('  }');
  js.push('  res.tables.forEach(function(t, idx) {');
  js.push('    var pctColor = t.limitPct>=80?"var(--err)":(t.limitPct>=50?"var(--warn)":"var(--ok)");');
  js.push('    h += "<div style=\\"background:var(--s2);border-radius:10px;padding:16px;margin-bottom:14px\\">";');
  js.push('    h += "<div style=\\"display:flex;justify-content:space-between;align-items:start;margin-bottom:10px\\">" +');
  js.push('      "<div><div style=\\"font-weight:700;font-size:15px\\">" + t.label + "</div>" +');
  js.push('      "<div style=\\"font-size:12px;color:var(--sub);margin-top:2px\\">" + t.sheetCount + " \u043b\u0438\u0441\u0442\u043e\u0432 · <a href=\\"" + t.url + "\\" target=\\"_blank\\" style=\\"color:var(--bb)\\">\u043e\u0442\u043a\u0440\u044b\u0442\u044c \u0432 Sheets</a></div></div>" +');
  js.push('      "<div style=\\"text-align:right\\"><div style=\\"font-size:20px;font-weight:700;color:" + pctColor + "\\">" + t.limitPct + "%</div>" +');
  js.push('      "<div style=\\"font-size:11px;color:var(--sub)\\">\u043e\u0442 \u043b\u0438\u043c\u0438\u0442\u0430 Sheets</div></div></div>";');
  js.push('    h += "<div style=\\"background:var(--s1);border-radius:6px;height:8px;overflow:hidden;margin-bottom:10px\\">" +');
  js.push('      "<div style=\\"background:" + pctColor + ";height:100%;width:" + Math.min(t.limitPct,100) + "%\\"></div></div>";');
  js.push('    h += "<div style=\\"display:flex;gap:16px;font-size:13px;color:var(--sub);margin-bottom:10px\\">" +');
  js.push('      "<span>\u0437\u0430\u043d\u044f\u0442\u043e: <b style=\\"color:var(--txt)\\">" + t.totalUsedCells.toLocaleString() + "</b> \u044f\u0447.</span>" +');
  js.push('      "<span>\u043e\u0441\u0442\u0430\u043b\u043e\u0441\u044c: <b style=\\"color:var(--txt)\\">" + t.remainingCells.toLocaleString() + "</b> \u044f\u0447.</span></div>";');
  js.push('    h += "<button class=\\"btn bs\\" style=\\"padding:6px 12px;font-size:12px\\" onclick=\\"toggleStorageDetail(" + idx + ")\\">" + (storageExpanded[idx]?"\u0441\u043a\u0440\u044b\u0442\u044c \u043b\u0438\u0441\u0442\u044b":"\u043f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u043b\u0438\u0441\u0442\u044b") + "</button>";');
  js.push('    h += "<div id=\\"storageDetail" + idx + "\\" style=\\"display:" + (storageExpanded[idx]?"block":"none") + ";margin-top:12px\\">";');
  js.push('    h += "<div class=\\"tw\\"><table><thead><tr><th>\u041b\u0438\u0441\u0442</th><th>\u0421\u0442\u0440\u043e\u043a/\u0441\u0442\u043e\u043b\u0431.</th><th>\u0417\u0430\u043d\u044f\u0442\u043e \u044f\u0447.</th><th>\u0412\u0441\u0435\u0433\u043e \u044f\u0447.</th><th>%</th></tr></thead><tbody>";');
  js.push('    t.sheets.forEach(function(s) {');
  js.push('      h += "<tr><td style=\\"font-weight:600\\">" + s.name + "</td><td>" + s.rows + "×" + s.cols + "</td><td>" + s.usedCells.toLocaleString() + "</td><td>" + s.maxCells.toLocaleString() + "</td><td>" + s.usedPct + "%</td></tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div></div>";');
  js.push('    h += "</div>";');
  js.push('  });');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');

  js.push('function toggleStorageDetail(idx) {');
  js.push('  storageExpanded[idx] = !storageExpanded[idx];');
  js.push('  var d = document.getElementById("storageDetail"+idx);');
  js.push('  d.style.display = storageExpanded[idx] ? "block" : "none";');
  js.push('  var btn = d.previousElementSibling;');
  js.push('  if (btn) btn.textContent = storageExpanded[idx] ? "\u0441\u043a\u0440\u044b\u0442\u044c \u043b\u0438\u0441\u0442\u044b" : "\u043f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u043b\u0438\u0441\u0442\u044b";');
  js.push('}');
  js.push('');

  js.push('// ── MODALS ──');
  js.push('function showMdl(id){document.getElementById(id).classList.add("show");}');
  js.push('function closeMdl(id){document.getElementById(id).classList.remove("show");}');
  js.push('');

  js.push('// ── \u0410\u041a\u041a\u041e\u0420\u0414\u0415\u041e\u041d (\u0440\u0430\u0441\u043a\u0440\u044b\u0432\u0430\u044e\u0449\u0438\u0435\u0441\u044f \u0431\u043b\u043e\u043a\u0438 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u043e\u0432: \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0438\u044f, \u0441\u043f\u0438\u0441\u0430\u043d\u0438\u044f \u0438 \u0442.\u0434.) ──');
  js.push('// \u041e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442/\u0437\u0430\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u043e\u0434\u0438\u043d \u0431\u043b\u043e\u043a \u0432\u043d\u0443\u0442\u0440\u0438 \u0433\u0440\u0443\u043f\u043f\u044b groupId; \u043e\u0441\u0442\u0430\u043b\u044c\u043d\u044b\u0435 \u0431\u043b\u043e\u043a\u0438 \u0442\u043e\u0439 \u0436\u0435 \u0433\u0440\u0443\u043f\u043f\u044b \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438 \u0437\u0430\u043a\u0440\u044b\u0432\u0430\u044e\u0442\u0441\u044f.');
  js.push('function toggleAcc(groupId, itemId) {');
  js.push('  var body = document.getElementById(itemId + "-body");');
  js.push('  var ico = document.getElementById(itemId + "-ico");');
  js.push('  if (!body) return;');
  js.push('  var isOpen = body.style.display === "block";');
  js.push('  document.querySelectorAll("[data-accgroup=\\"" + groupId + "\\"]").forEach(function(el) {');
  js.push('    el.style.display = "none";');
  js.push('  });');
  js.push('  document.querySelectorAll("[data-accico=\\"" + groupId + "\\"]").forEach(function(el) {');
  js.push('    el.textContent = "+";');
  js.push('  });');
  js.push('  if (!isOpen) {');
  js.push('    body.style.display = "block";');
  js.push('    if (ico) ico.textContent = "\u2212";');
  js.push('  }');
  js.push('}');
  js.push('');

  js.push('// ── TOAST ──');
  js.push('function toast(msg,type){');
  js.push('  var c=document.getElementById("toastWrap");');
  js.push('  var t=document.createElement("div");');
  js.push('  t.className="toast "+(type==="ok"?"tok":"terr");');
  js.push('  t.innerHTML=(type==="ok"?"&#9989;":"&#10060;")+" "+msg;');
  js.push('  c.appendChild(t);setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t);},3500);');
  js.push('}');
  js.push('');

  js.push('// ── LOGOUT ──');
  js.push('function doLogout(){');
  js.push('  if(!confirm("\u0412\u044b\u0439\u0442\u0438 \u0438\u0437 \u0441\u0438\u0441\u0442\u0435\u043c\u044b?"))return;');
  js.push('  srv("logout",{},function(){TOKEN=null;USER=null;showScreen("screenLogin");document.getElementById("iLogin").value="";document.getElementById("iPass").value="";document.getElementById("loginErr").style.display="none";});');
  js.push('}');
  js.push('');

  js.push('// ── SERVER CALL ──');
  js.push('function srv(action, extra, callback) {');
  js.push('  var data = extra || {};');
  js.push('  data.action = action;');
  js.push('  if (TOKEN) data.token = TOKEN;');
  js.push('  if (SIM_ROLE) { data.simulateRole = SIM_ROLE; data.simulateLiniya = SIM_LINIYA; }');
  js.push('  console.log("[GL] srv:", action);');
  js.push('  if (typeof google === "undefined" || !google.script) {');
  js.push('    console.error("[GL] google.script не доступен");');
  js.push('    if (callback) callback({ok:false, error:"google.script не доступен"});');
  js.push('    return;');
  js.push('  }');
  js.push('  google.script.run');
  js.push('    .withSuccessHandler(function(r) {');
  js.push('      var p; try{p=JSON.parse(r);}catch(e){p={ok:false,error:"Parse error: "+String(r).slice(0,100)};}');
  js.push('      if (p && p.error === "SESSION_EXPIRED") { TOKEN=null; showScreen("screenLogin"); return; }');
  js.push('      if (callback) callback(p);');
  js.push('    })');
  js.push('    .withFailureHandler(function(err) {');
  js.push('      if (callback) callback({ok:false, error: err.message || "Server error"});');
  js.push('    })');
  js.push('    .handleAction(JSON.stringify(data));');
  js.push('}');
  js.push('');

  js.push('// ── HELPERS ──');
  js.push('// \u0420\u0435\u0430\u043b\u044c\u043d\u044b\u0439 \u0438\u043b\u0438 \u0441\u0438\u043c\u0443\u043b\u0438\u0440\u0443\u044e\u0449\u0438\u0439 \u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440 \u2014 \u0432\u0438\u0434\u0438\u0442 \u043a\u043d\u043e\u043f\u043a\u0438 \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u044f \u0432\u0435\u0437\u0434\u0435.');
  js.push('function canDeleteDocs(){ return USER.role === "\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440" || !!USER.isAdminSimulating; }');
  js.push('function toRuDate(iso) { if (!iso) return null; var p=iso.split("-"); return p[2]+"."+p[1]+"."+p[0]; }');
  js.push('function initials(fio){if(!fio)return"?";return fio.split(" ").map(function(w){return w[0]||"";}).join("").toUpperCase().slice(0,2);}');
  js.push('function rColor(r){var m={"\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440":"#E53935","\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c":"#8E24AA","\u0417\u0430\u0432\u0441\u043a\u043b\u0430\u0434 \u0441\u044b\u0440\u044c\u044f":"#1E88E5","\u0417\u0430\u0432\u0441\u043a\u043b\u0430\u0434 \u0413\u041f":"#00897B","\u0411\u0440\u0438\u0433\u0430\u0434\u0438\u0440":"#F4511E","\u0422\u0435\u0441\u0442\u043e\u0434\u0435\u043b":"#6D4C41","\u0417\u0430\u0432.\u0443\u043f\u0430\u043a\u043e\u0432\u0449\u0438\u0446\u0430":"#039BE5","\u041c\u0435\u0445\u0430\u043d\u0438\u043a":"#43A047","\u0417\u0430\u0432.\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c \u0411\u0443\u043b\u043e\u0447\u043a\u0438":"#F57F17"};return m[r]||"#757575";}');


  // ════════════════════════════════════════════════════════
  // ОСНОВНЫЕ СРЕДСТВА И ИНВЕНТАРЬ
  // ════════════════════════════════════════════════════════
  js.push('var assetsAllData = [];');
  js.push('var assetsDicts = null;');
  js.push('var assetsFullFlag = false;');
  js.push('');
  js.push('function assetsLoadDicts(cb) {');
  js.push('  if (assetsDicts) { cb(); return; }');
  js.push('  srv("assetsGetDirectories", {}, function(res) {');
  js.push('    assetsDicts = res.ok ? res : {vidy:[], departments:[], reasons:[], states:[], types:["ОС","ИНВ"]};');
  js.push('    cb();');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function loadAssetsList() {');
  js.push('  var el = document.getElementById("assetsListCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("assetsGetAll", {payload:{}}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    assetsAllData = res.data;');
  js.push('    assetsFullFlag = res.full;');
  js.push('    assetsRenderFiltered();');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsRenderFiltered() {');
  js.push('  var q = ((document.getElementById("assetsSearch")||{}).value||"").toLowerCase().trim();');
  js.push('  var state = (document.getElementById("assetsFilterState")||{}).value||"";');
  js.push('  var list = assetsAllData.filter(function(o) {');
  js.push('    if (state && o["Состояния"] !== state) return false;');
  js.push('    if (q) {');
  js.push('      var hay = ((o["Инвентарный номер"]||"")+" "+(o["Наименование"]||"")+" "+(o["Ответственный лицо"]||"")).toLowerCase();');
  js.push('      if (hay.indexOf(q) === -1) return false;');
  js.push('    }');
  js.push('    return true;');
  js.push('  });');
  js.push('  assetsRenderList(list);');
  js.push('}');
  js.push('');
  js.push('function assetsRenderList(list) {');
  js.push('  var el = document.getElementById("assetsListCont");');
  js.push('  if (!el) return;');
  js.push('  if (!list.length) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-ico\\">🏷️</div><div class=\\"empty-t\\">Ничего не найдено</div></div>"; return; }');
  js.push('  var h = "<div style=\\"font-size:13px;color:var(--sub);margin-bottom:8px\\">Найдено: " + list.length + "</div>";');
  js.push('  h += "<div class=\\"tw\\"><table><thead><tr>";');
  js.push('  h += "<th>Инв. №</th><th>Наименование</th><th>Подразделение</th><th>Ответственный</th><th>Состояние</th><th>Стоимость</th><th></th></tr></thead><tbody>";');
  js.push('  list.forEach(function(o) {');
  js.push('    var stC = o["Состояния"]==="Балансда" ? "color:var(--ok)" : o["Состояния"]==="Списан" ? "color:var(--err)" : "color:var(--warn)";');
  js.push('    var inv = o["Инвентарный номер"]||"";');
  js.push('    var dept = o["Подразделения"]||"";');
  js.push('    h += "<tr>";');
  js.push('    h += "<td style=\\"font-family:monospace;font-weight:600;color:var(--g)\\">" + inv + "</td>";');
  js.push('    h += "<td style=\\"font-weight:600\\">" + (o["Наименование"]||"") + "</td>";');
  js.push('    h += "<td style=\\"font-size:13px;color:var(--sub)\\">" + (dept||"—") + "</td>";');
  js.push('    h += "<td style=\\"font-size:13px\\">" + (o["Ответственный лицо"]||"—") + "</td>";');
  js.push('    h += "<td style=\\"" + stC + "\\">" + (o["Состояния"]||"") + "</td>";');
  js.push('    h += "<td style=\\"text-align:right\\">" + (Number(o["Рыночный стоимость"])||0).toLocaleString() + " сум</td>";');
  js.push('    h += "<td style=\\"white-space:nowrap\\">";');
  js.push('    h += "<button class=\\"btn bs\\" style=\\"padding:3px 8px;font-size:12px;margin-right:4px\\" onclick=\\"window.open(APP_URL+\'?page=os-card&inv=\'+encodeURIComponent(\'"+inv.replace(/"/g,"&quot;")+"\'),\'_blank\')\\">🪪 Карточка</button>";');
  js.push('    h += "<button class=\\"btn bs\\" style=\\"padding:3px 8px;font-size:12px;margin-right:4px\\" onclick=\\"window.open(APP_URL+\'?page=os-photo&inv=\'+encodeURIComponent(\'"+inv.replace(/"/g,"&quot;")+"\'),\'_blank\')\\">📷 Фото</button>";');
  js.push('    if (assetsFullFlag && o["Состояния"] !== "Списан") {');
  js.push('      h += "<button class=\\"btn bs\\" style=\\"padding:3px 8px;font-size:12px;margin-right:4px\\" data-inv=\\""+inv.replace(/"/g,"&quot;")+"\\" data-dept=\\""+dept.replace(/"/g,"&quot;")+"\\" onclick=\\"openAssetMoveMdl(this)\\">Переместить</button>";');
  js.push('      h += "<button class=\\"btn bd\\" style=\\"padding:3px 8px;font-size:12px\\" data-inv=\\""+inv.replace(/"/g,"&quot;")+"\\" onclick=\\"openAssetWriteOffMdl(this)\\">Списать</button>";');
  js.push('    }');
  js.push('    h += "</td></tr>";');
  js.push('  });');
  js.push('  h += "</tbody></table></div>";');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');
  js.push('var assetsStaffNames = [];');
  js.push('function loadAssetsAddForm() {');
  js.push('  var el = document.getElementById("assetsAddCont");');
  js.push('  if (!el) return;');
  js.push('  assetsLoadDicts(function() {');
  js.push('    srv("assetsGetStaffNames", {}, function(res) {');
  js.push('      assetsStaffNames = res.ok ? res.data : [];');
  js.push('      assetsRenderAddForm(el);');
  js.push('    });');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsRenderAddForm(el) {');
  js.push('  var d = assetsDicts || {vidy:[],departments:[],types:["ОС","ИНВ"]};');
  js.push('  var h = "<div style=\\"display:grid;gap:14px\\">";');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">Наименование *</label><input class=\\"fi\\" id=\\"aName\\"></div>";');
  js.push('  h += "<div class=\\"fr2\\">";');
  js.push('  h += "<div class=\\"fr\\" style=\\"margin:0\\"><label class=\\"fl\\">Тип</label><select class=\\"fs\\" id=\\"aType\\">" + d.types.map(function(t){return "<option>"+t+"</option>";}).join("") + "</select></div>";');
  js.push('  h += "<div class=\\"fr\\" style=\\"margin:0\\"><label class=\\"fl\\">Вид</label><select class=\\"fs\\" id=\\"aVid\\"><option value=\\"\\">—</option>" + d.vidy.map(function(v){return "<option>"+v+"</option>";}).join("") + "</select></div>";');
  js.push('  h += "</div>";');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">Подразделение *</label><select class=\\"fs\\" id=\\"aDept\\" onchange=\\"assetsRefreshStorageOptions()\\"><option value=\\"\\">—</option>" + d.departments.map(function(dp){return "<option>"+dp+"</option>";}).join("") + "</select></div>";');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">Ответственное лицо</label><select class=\\"fs\\" id=\\"aResponsible\\"><option value=\\"\\">—</option>" + assetsStaffNames.map(function(n){return "<option>"+n+"</option>";}).join("") + "</select></div>";');
  js.push('  h += "<div class=\\"fr2\\">";');
  js.push('  h += "<div class=\\"fr\\" style=\\"margin:0\\"><label class=\\"fl\\">Дата поступления *</label><input type=\\"date\\" class=\\"fi\\" id=\\"aDateIn\\"></div>";');
  js.push('  h += "<div class=\\"fr\\" style=\\"margin:0\\"><label class=\\"fl\\">Полезный срок службы (лет)</label><input type=\\"number\\" class=\\"fi\\" id=\\"aLifespan\\" min=\\"0\\"></div>";');
  js.push('  h += "</div>";');
  js.push('  h += "<div class=\\"fr2\\">";');
  js.push('  h += "<div class=\\"fr\\" style=\\"margin:0\\"><label class=\\"fl\\">Рыночная стоимость (сум)</label><input type=\\"number\\" class=\\"fi\\" id=\\"aCost\\" min=\\"0\\"></div>";');
  js.push('  h += "<div class=\\"fr\\" style=\\"margin:0\\"><label class=\\"fl\\">Амортизация % в год</label><input type=\\"number\\" class=\\"fi\\" id=\\"aAmortPct\\" step=\\"0.01\\" value=\\"0.20\\"></div>";');
  js.push('  h += "</div>";');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">Адрес / место хранения</label><select class=\\"fs\\" id=\\"aAddress\\"><option value=\\"\\">—</option></select></div>";');
  js.push('  h += "<div class=\\"fr\\"><label class=\\"fl\\">Примечание</label><input class=\\"fi\\" id=\\"aNote\\"></div>";');
  js.push('  h += "<button class=\\"btn bp\\" style=\\"width:100%;padding:16px\\" onclick=\\"saveAssetAdd()\\">✔ Принять на учёт</button>";');
  js.push('  h += "</div>";');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');
  js.push('function saveAssetAdd() {');
  js.push('  var payload = {');
  js.push('    name: (document.getElementById("aName")||{}).value||"",');
  js.push('    type: (document.getElementById("aType")||{}).value||"ОС",');
  js.push('    vid: (document.getElementById("aVid")||{}).value||"",');
  js.push('    department: (document.getElementById("aDept")||{}).value||"",');
  js.push('    responsible: (document.getElementById("aResponsible")||{}).value||"",');
  js.push('    dateIn: (document.getElementById("aDateIn")||{}).value||"",');
  js.push('    lifespan: (document.getElementById("aLifespan")||{}).value||"",');
  js.push('    cost: (document.getElementById("aCost")||{}).value||0,');
  js.push('    amortPercent: (document.getElementById("aAmortPct")||{}).value||0.20,');
  js.push('    address: (document.getElementById("aAddress")||{}).value||"",');
  js.push('    note: (document.getElementById("aNote")||{}).value||""');
  js.push('  };');
  js.push('  if (!payload.name||!payload.department||!payload.dateIn) { toast("Заполните обязательные поля","err"); return; }');
  js.push('  srv("assetsAdd", {payload:payload}, function(res) {');
  js.push('    if (res.ok) { toast(res.message||"Принято на учёт","ok"); nav("assets-list"); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsRefreshStorageOptions() {');
  js.push('  var dept = (document.getElementById("aDept")||{}).value || "";');
  js.push('  var sel = document.getElementById("aAddress");');
  js.push('  if (!sel) return;');
  js.push('  if (!dept) { sel.innerHTML = "<option value=\\"\\">—</option>"; return; }');
  js.push('  srv("assetsGetStorageLocations", {payload:{dept:dept}}, function(res) {');
  js.push('    var opts = res.ok ? res.data : [];');
  js.push('    sel.innerHTML = "<option value=\\"\\">—</option>" + opts.map(function(o){ return "<option>"+o["Место хранения"]+"</option>"; }).join("");');
  js.push('  });');
  js.push('}');
  js.push('');

  js.push('function loadAssetsDashboard() {');
  js.push('  var el = document.getElementById("assetsDashCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("assetsGetSummary", {}, function(sumRes) {');
  js.push('    if (!sumRes.ok) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">"+(sumRes.error||"")+"</div></div>"; return; }');
  js.push('    srv("assetsGetDashboardCharts", {}, function(chartRes) {');
  js.push('      assetsRenderDashboard(sumRes, chartRes.ok ? chartRes : null);');
  js.push('    });');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsRenderDashboard(res, charts) {');
  js.push('  var el = document.getElementById("assetsDashCont");');
  js.push('  if (!el) return;');
  js.push('  var h = "";');
  js.push('  h += "<div class=\\"sg-lg\\">";');
  js.push('  h += "<div class=\\"sc-lg\\"><div class=\\"sv\\">" + res.total + "</div><div class=\\"sl\\">всего объектов</div></div>";');
  js.push('  h += "<div class=\\"sc-lg\\"><div class=\\"sv\\" style=\\"color:var(--ok)\\">" + res.active + "</div><div class=\\"sl\\">на балансе</div></div>";');
  js.push('  h += "<div class=\\"sc-lg\\"><div class=\\"sv\\">" + res.os + "</div><div class=\\"sl\\">ОС</div></div>";');
  js.push('  h += "<div class=\\"sc-lg\\"><div class=\\"sv\\">" + res.inv + "</div><div class=\\"sl\\">Инвентарь</div></div>";');
  js.push('  h += "</div>";');
  js.push('  h += "<div class=\\"card\\" style=\\"background:rgba(249,168,37,.1);border:1px solid var(--g)\\">";');
  js.push('  h += "<div style=\\"font-size:13px;color:var(--sub)\\">Общая стоимость</div>";');
  js.push('  h += "<div style=\\"font-size:24px;font-weight:700;color:var(--g)\\">" + (res.totalCost||0).toLocaleString() + " сум</div></div>";');
  js.push('  h += "<div class=\\"card\\"><div class=\\"card-t\\">Численность по подразделениям</div>";');
  js.push('  var deptKeys = Object.keys(res.byDept||{});');
  js.push('  var maxCnt = Math.max.apply(null, deptKeys.map(function(k){return res.byDept[k];}).concat([1]));');
  js.push('  deptKeys.sort(function(a,b){return res.byDept[b]-res.byDept[a];}).forEach(function(d) {');
  js.push('    var cnt = res.byDept[d];');
  js.push('    var pct = Math.round(cnt/maxCnt*100);');
  js.push('    h += "<div style=\\"padding:6px 0;border-bottom:1px solid var(--bd)\\">";');
  js.push('    h += "<div style=\\"display:flex;justify-content:space-between;margin-bottom:4px\\"><span style=\\"font-size:14px\\">"+d+"</span><span style=\\"font-weight:700;color:var(--g)\\">"+cnt+" шт.</span></div>";');
  js.push('    h += "<div style=\\"height:6px;border-radius:3px;background:rgba(255,255,255,.08)\\"><div style=\\"height:100%;width:"+pct+"%;background:var(--g);border-radius:3px\\"></div></div>";');
  js.push('    h += "</div>";');
  js.push('  });');
  js.push('  h += "</div>";');
  js.push('  if (charts) {');
  js.push('    h += "<div class=\\"card\\"><div class=\\"card-t\\">Стоимость по видам ОС</div>";');
  js.push('    var maxVid = Math.max.apply(null, charts.byVid.map(function(v){return v[1];}).concat([1]));');
  js.push('    charts.byVid.forEach(function(v) {');
  js.push('      var pct = Math.round(v[1]/maxVid*100);');
  js.push('      h += "<div style=\\"padding:6px 0;border-bottom:1px solid var(--bd)\\">";');
  js.push('      h += "<div style=\\"display:flex;justify-content:space-between;margin-bottom:4px\\"><span style=\\"font-size:13px\\">"+v[0]+"</span><span style=\\"font-weight:700;color:var(--g)\\">"+v[1].toLocaleString()+" сум</span></div>";');
  js.push('      h += "<div style=\\"height:6px;border-radius:3px;background:rgba(255,255,255,.08)\\"><div style=\\"height:100%;width:"+pct+"%;background:#42A5F5;border-radius:3px\\"></div></div>";');
  js.push('      h += "</div>";');
  js.push('    });');
  js.push('    h += "</div>";');
  js.push('    h += "<div class=\\"card\\"><div class=\\"card-t\\">Амортизация</div>";');
  js.push('    h += "<div style=\\"display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;text-align:center\\">";');
  js.push('    h += "<div><div style=\\"font-size:18px;font-weight:700\\">"+(charts.amort.totalOriginal||0).toLocaleString()+"</div><div style=\\"font-size:12px;color:var(--sub)\\">Первонач. стоимость</div></div>";');
  js.push('    h += "<div><div style=\\"font-size:18px;font-weight:700;color:var(--warn)\\">"+(charts.amort.totalAccum||0).toLocaleString()+"</div><div style=\\"font-size:12px;color:var(--sub)\\">Накоплено</div></div>";');
  js.push('    h += "<div><div style=\\"font-size:18px;font-weight:700;color:var(--ok)\\">"+(charts.amort.totalResidual||0).toLocaleString()+"</div><div style=\\"font-size:12px;color:var(--sub)\\">Остаток</div></div>";');
  js.push('    h += "</div></div>";');
  js.push('  }');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');
  js.push('function loadAssetsAmort() {');
  js.push('  var el = document.getElementById("assetsAmortCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("assetsAmortListDocuments", {}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    if (!res.data.length) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-ico\\">📉</div><div class=\\"empty-t\\">Документов ещё нет. Нажмите «Создать документ»</div></div>"; return; }');
  js.push('    var months = ["","Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];');
  js.push('    var canDel = assetsIsFull();');
  js.push('    var h = "<div class=\\"tw\\"><table><thead><tr><th>№</th><th>Период</th><th>Дата</th><th>Баланс</th><th>Накоплено</th><th>Начислено</th><th>Автор</th>"+(canDel?"<th></th>":"")+"</tr></thead><tbody>";');
  js.push('    res.data.forEach(function(d) {');
  js.push('      h += "<tr>";');
  js.push('      h += "<td style=\\"cursor:pointer\\" onclick=\\"openAmortDetailMdl(\'"+d["ID"]+"\')\\">"+d["Номер"]+"</td>";');
  js.push('      h += "<td style=\\"cursor:pointer\\" onclick=\\"openAmortDetailMdl(\'"+d["ID"]+"\')\\">"+(months[Number(d["Месяц"])]||d["Месяц"])+" "+d["Год"]+"</td>";');
  js.push('      h += "<td style=\\"font-size:12px;color:var(--sub)\\">"+(d["Дата"]||"")+"</td>";');
  js.push('      h += "<td style=\\"text-align:right\\">"+(Number(d["ИтогоБаланс"])||0).toLocaleString()+"</td>";');
  js.push('      h += "<td style=\\"text-align:right\\">"+(Number(d["ИтогоНакоплено"])||0).toLocaleString()+"</td>";');
  js.push('      h += "<td style=\\"text-align:right;color:var(--g);font-weight:700\\">"+(Number(d["ИтогоНачислено"])||0).toLocaleString()+"</td>";');
  js.push('      h += "<td style=\\"font-size:13px\\">"+(d["Автор"]||"")+"</td>";');
  js.push('      if (canDel) h += "<td><button class=\\"btn bd\\" style=\\"padding:2px 8px;font-size:12px\\" data-id=\\""+d["ID"]+"\\" onclick=\\"event.stopPropagation();assetsAmortDeleteDoc(this)\\">удалить</button></td>";');
  js.push('      h += "</tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    if (el) el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsAmortDeleteDoc(btn) {');
  js.push('  var id = btn.dataset.id;');
  js.push('  if (!confirm("Удалить документ и все его записи начисления? Действие необратимо.")) return;');
  js.push('  srv("assetsAmortDeleteDocument", {payload:{id:id}}, function(res) {');
  js.push('    if (res.ok) { toast("Удалено","ok"); loadAssetsAmort(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('var assetsAmortPreviewItems = [];');
  js.push('function openAmortCreateMdl() {');
  js.push('  var now = new Date();');
  js.push('  document.getElementById("amcYear").value = now.getFullYear();');
  js.push('  document.getElementById("amcMonth").value = now.getMonth()+1;');
  js.push('  document.getElementById("amcComment").value = "";');
  js.push('  document.getElementById("amcPreviewArea").innerHTML = "";');
  js.push('  assetsAmortPreviewItems = [];');
  js.push('  showMdl("mdlAmortCreate");');
  js.push('}');
  js.push('');
  js.push('function amortLoadPreview() {');
  js.push('  var year = parseInt(document.getElementById("amcYear").value)||0;');
  js.push('  var month = parseInt(document.getElementById("amcMonth").value)||0;');
  js.push('  var area = document.getElementById("amcPreviewArea");');
  js.push('  area.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("assetsAmortPreview", {payload:{year:year, month:month}}, function(res) {');
  js.push('    if (!res.ok) { area.innerHTML = "<div style=\\"color:var(--err);font-size:13px\\">"+res.error+"</div>"; return; }');
  js.push('    assetsAmortPreviewItems = res.items;');
  js.push('    if (!res.items.length) { area.innerHTML = "<div style=\\"color:var(--sub);font-size:13px\\">Нет объектов для начисления за этот период</div>"; return; }');
  js.push('    var h = "<div class=\\"tw\\" style=\\"max-height:320px;overflow-y:auto\\"><table><thead><tr><th></th><th>Инв. №</th><th>Наименование</th><th>Баланс</th><th>Накоплено</th><th>Начислить</th></tr></thead><tbody>";');
  js.push('    res.items.forEach(function(it, i) {');
  js.push('      h += "<tr><td><input type=\\"checkbox\\" checked data-idx=\\""+i+"\\" onchange=\\"assetsAmortPreviewItems["+i+"].include=this.checked;amortUpdatePreviewTotal()\\"></td>";');
  js.push('      h += "<td style=\\"font-family:monospace;color:var(--g)\\">"+it.invNum+"</td><td>"+it.name+"</td>";');
  js.push('      h += "<td style=\\"text-align:right\\">"+it.cost.toLocaleString()+"</td><td style=\\"text-align:right\\">"+it.accumBefore.toLocaleString()+"</td>";');
  js.push('      h += "<td style=\\"text-align:right;font-weight:700\\">"+it.amount.toLocaleString()+"</td></tr>";');
  js.push('      it.include = true;');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    h += "<div id=\\"amcTotal\\" style=\\"margin-top:10px;font-size:14px;text-align:right\\"></div>";');
  js.push('    area.innerHTML = h;');
  js.push('    amortUpdatePreviewTotal();');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function amortUpdatePreviewTotal() {');
  js.push('  var total = assetsAmortPreviewItems.filter(function(i){return i.include;}).reduce(function(s,i){return s+i.amount;},0);');
  js.push('  var el = document.getElementById("amcTotal");');
  js.push('  if (el) el.innerHTML = "Итого к начислению: <b style=\\"color:var(--g)\\">"+total.toLocaleString()+" сум</b>";');
  js.push('}');
  js.push('');
  js.push('function amortSaveDocument() {');
  js.push('  if (!assetsAmortPreviewItems.length) { toast("Сначала постройте предпросмотр","err"); return; }');
  js.push('  var btn = document.getElementById("amcSaveBtn");');
  js.push('  if (btn.disabled) return;');
  js.push('  btn.disabled = true; var oldTxt = btn.textContent; btn.textContent = "Сохранение...";');
  js.push('  var year = parseInt(document.getElementById("amcYear").value)||0;');
  js.push('  var month = parseInt(document.getElementById("amcMonth").value)||0;');
  js.push('  var comment = document.getElementById("amcComment").value||"";');
  js.push('  srv("assetsAmortCreateDocument", {payload:{year:year, month:month, comment:comment, items:assetsAmortPreviewItems}}, function(res) {');
  js.push('    if (res.ok) { toast("Документ создан, начислений: "+res.count,"ok"); closeMdl("mdlAmortCreate"); loadAssetsAmort(); }');
  js.push('    else { toast(res.error,"err"); btn.disabled = false; btn.textContent = oldTxt; }');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function openAmortDetailMdl(id) {');
  js.push('  document.getElementById("amdBody").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  showMdl("mdlAmortDetail");');
  js.push('  srv("assetsAmortGetDocument", {payload:{id:id}}, function(res) {');
  js.push('    var el = document.getElementById("amdBody");');
  js.push('    if (!res.ok) { el.innerHTML = "<div style=\\"color:var(--err)\\">"+res.error+"</div>"; return; }');
  js.push('    var months = ["","Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];');
  js.push('    var m = res.meta;');
  js.push('    var h = "<div style=\\"margin-bottom:12px\\"><b>"+(months[Number(m["Месяц"])]||m["Месяц"])+" "+m["Год"]+"</b> · документ №"+m["Номер"]+" · "+(m["Автор"]||"")+"</div>";');
  js.push('    if (m["Комментарий"]) h += "<div style=\\"font-size:13px;color:var(--sub);margin-bottom:12px\\">"+m["Комментарий"]+"</div>";');
  js.push('    h += "<div class=\\"tw\\"><table><thead><tr><th>Инв. №</th><th>Наименование</th><th>Баланс</th><th>Накоплено</th><th>Начислено</th><th>Остаток</th></tr></thead><tbody>";');
  js.push('    res.rows.forEach(function(r) {');
  js.push('      h += "<tr><td style=\\"font-family:monospace;color:var(--g)\\">"+(r["Инв. номер"]||"")+"</td><td>"+(r["Наименование"]||"")+"</td>";');
  js.push('      h += "<td style=\\"text-align:right\\">"+(Number(r["Стоимость нач."])||0).toLocaleString()+"</td>";');
  js.push('      h += "<td style=\\"text-align:right\\">"+(Number(r["Накопл. амортизация"])||0).toLocaleString()+"</td>";');
  js.push('      h += "<td style=\\"text-align:right;font-weight:700;color:var(--g)\\">"+(Number(r["Амортизация за месяц"])||0).toLocaleString()+"</td>";');
  js.push('      h += "<td style=\\"text-align:right\\">"+(Number(r["Остаточная стоимость"])||0).toLocaleString()+"</td></tr>";');
  js.push('    });');
  js.push('    h += "<tr style=\\"background:rgba(255,255,255,.04);border-top:2px solid var(--bd)\\"><td colspan=\\"2\\" style=\\"font-weight:700\\">Итого</td>";');
  js.push('    h += "<td style=\\"text-align:right;font-weight:700\\">"+(Number(m["ИтогоБаланс"])||0).toLocaleString()+"</td><td></td>";');
  js.push('    h += "<td style=\\"text-align:right;font-weight:700;color:var(--g)\\">"+(Number(m["ИтогоНачислено"])||0).toLocaleString()+"</td><td></td></tr>";');
  js.push('    h += "</tbody></table></div>";');
  js.push('    el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function loadAssetsAlerts() {');
  js.push('  var el = document.getElementById("assetsAlertsCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("assetsGetAlerts", {}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    assetsUpdateAlertsBadge(res.counts);');
  js.push('    if (!res.alerts.length) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-ico\\">✅</div><div class=\\"empty-t\\">Уведомлений нет</div></div>"; return; }');
  js.push('    var colors = {danger:"var(--err)", warning:"var(--warn)", info:"#42A5F5"};');
  js.push('    var h = "";');
  js.push('    res.alerts.forEach(function(a) {');
  js.push('      h += "<div class=\\"card\\" style=\\"border-left:3px solid "+(colors[a.level]||"var(--sub)")+"\\">";');
  js.push('      h += "<div style=\\"display:flex;justify-content:space-between\\"><b>"+a.name+"</b><span style=\\"font-family:monospace;color:var(--g);font-size:12px\\">"+a.inv+"</span></div>";');
  js.push('      h += "<div style=\\"font-size:13px;color:var(--sub);margin-top:4px\\">"+a.dept+" · "+a.msg+"</div>";');
  js.push('      h += "</div>";');
  js.push('    });');
  js.push('    if (el) el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsUpdateAlertsBadge(counts) {');
  js.push('  var badge = document.getElementById("assetsAlertsBadge");');
  js.push('  if (!badge) return;');
  js.push('  var total = (counts.danger||0)+(counts.warning||0);');
  js.push('  if (total > 0) { badge.textContent = total; badge.style.display = ""; }');
  js.push('  else badge.style.display = "none";');
  js.push('}');
  js.push('');
  js.push('var assetsLastReport = null;');
  js.push('function assetsRunReport() {');
  js.push('  var type = document.getElementById("arType").value;');
  js.push('  var el = document.getElementById("assetsReportCont");');
  js.push('  el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  var actionMap = {dept:"assetsGetReportByDept", amort:"assetsGetAmortReport", storage:"assetsGetReportByStorage", resp:"assetsGetReportByResponsible"};');
  js.push('  srv(actionMap[type], {payload:{}}, function(res) {');
  js.push('    if (!res.ok) { el.innerHTML = "<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    assetsLastReport = res;');
  js.push('    assetsRenderReport(type, res, el);');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsRenderReport(type, res, el) {');
  js.push('  var h = "";');
  js.push('  if (type === "dept") {');
  js.push('    h += "<div style=\\"margin-bottom:10px;font-size:14px\\">Итого стоимость: <b style=\\"color:var(--g)\\">"+(res.totalCost||0).toLocaleString()+" сум</b>, накоплено: <b>"+(res.totalAccum||0).toLocaleString()+"</b>, остаток: <b>"+(res.totalResidual||0).toLocaleString()+"</b></div>";');
  js.push('    h += "<div class=\\"tw\\"><table><thead><tr><th>Инв. №</th><th>Наименование</th><th>Подразделение</th><th>Стоимость</th><th>Накоплено</th><th>Остаток</th></tr></thead><tbody>";');
  js.push('    res.data.forEach(function(o) {');
  js.push('      h += "<tr><td style=\\"font-family:monospace;color:var(--g)\\">"+(o["Инвентарный номер"]||"")+"</td><td>"+(o["Наименование"]||"")+"</td>";');
  js.push('      h += "<td style=\\"font-size:13px\\">"+(o["Подразделения"]||"")+"</td><td style=\\"text-align:right\\">"+(Number(o["Рыночный стоимость"])||0).toLocaleString()+"</td>";');
  js.push('      h += "<td style=\\"text-align:right\\">"+(Number(o["накоплено"])||0).toLocaleString()+"</td><td style=\\"text-align:right\\">"+(Number(o["остаток"])||0).toLocaleString()+"</td></tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('  } else if (type === "amort") {');
  js.push('    h += "<div style=\\"margin-bottom:10px;font-size:14px\\">Сумма за месяц (все записи): <b style=\\"color:var(--g)\\">"+(res.totalMonth||0).toLocaleString()+" сум</b></div>";');
  js.push('    h += "<div class=\\"tw\\"><table><thead><tr><th>Инв. №</th><th>Наименование</th><th>Год</th><th>Месяц</th><th>За месяц</th></tr></thead><tbody>";');
  js.push('    res.data.forEach(function(r) {');
  js.push('      h += "<tr><td style=\\"font-family:monospace;color:var(--g)\\">"+(r["Инв. номер"]||"")+"</td><td>"+(r["Наименование"]||"")+"</td><td>"+(r["Год"]||"")+"</td><td>"+(r["Месяц"]||"")+"</td><td style=\\"text-align:right\\">"+(Number(r["Амортизация за месяц"])||0).toLocaleString()+"</td></tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('  } else if (type === "storage") {');
  js.push('    h += "<div style=\\"margin-bottom:10px;font-size:14px\\">Итого стоимость: <b style=\\"color:var(--g)\\">"+(res.totalCost||0).toLocaleString()+" сум</b></div>";');
  js.push('    Object.keys(res.byStorage).forEach(function(loc) {');
  js.push('      var items = res.byStorage[loc];');
  js.push('      h += "<div class=\\"card\\"><div class=\\"card-t\\">"+loc+" ("+items.length+")</div>";');
  js.push('      h += "<div class=\\"tw\\"><table><thead><tr><th>Инв. №</th><th>Наименование</th><th>Стоимость</th></tr></thead><tbody>";');
  js.push('      items.forEach(function(o) {');
  js.push('        h += "<tr><td style=\\"font-family:monospace;color:var(--g)\\">"+(o["Инвентарный номер"]||"")+"</td><td>"+(o["Наименование"]||"")+"</td><td style=\\"text-align:right\\">"+(Number(o["Рыночный стоимость"])||0).toLocaleString()+"</td></tr>";');
  js.push('      });');
  js.push('      h += "</tbody></table></div></div>";');
  js.push('    });');
  js.push('  } else if (type === "resp") {');
  js.push('    h += "<div style=\\"margin-bottom:10px;font-size:14px\\">Итого стоимость: <b style=\\"color:var(--g)\\">"+(res.totalCost||0).toLocaleString()+" сум</b></div>";');
  js.push('    Object.keys(res.byResp).forEach(function(person) {');
  js.push('      var items = res.byResp[person];');
  js.push('      h += "<div class=\\"card\\"><div class=\\"card-t\\">"+person+" ("+items.length+")</div>";');
  js.push('      h += "<div class=\\"tw\\"><table><thead><tr><th>Инв. №</th><th>Наименование</th><th>Подразделение</th></tr></thead><tbody>";');
  js.push('      items.forEach(function(o) {');
  js.push('        h += "<tr><td style=\\"font-family:monospace;color:var(--g)\\">"+(o["Инвентарный номер"]||"")+"</td><td>"+(o["Наименование"]||"")+"</td><td style=\\"font-size:13px\\">"+(o["Подразделения"]||"")+"</td></tr>";');
  js.push('      });');
  js.push('      h += "</tbody></table></div></div>";');
  js.push('    });');
  js.push('  }');
  js.push('  el.innerHTML = h;');
  js.push('}');
  js.push('');
  js.push('function assetsPrintReport() {');
  js.push('  var el = document.getElementById("assetsReportCont");');
  js.push('  if (!el || !el.innerHTML.trim()) { toast("Сначала постройте отчёт","err"); return; }');
  js.push('  var w = window.open("", "_blank");');
  js.push('  w.document.write("<html><head><title>Отчёт ОС</title><style>body{font-family:Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;font-size:13px}th{background:#eee}</style></head><body>" + el.innerHTML + "</body></html>");');
  js.push('  w.document.close();');
  js.push('  w.print();');
  js.push('}');
  js.push('');
  js.push('function loadAssetsManage() {');
  js.push('  assetsRenderMgmtDepts();');
  js.push('  assetsRenderMgmtStorage();');
  js.push('  assetsRenderMgmtVidy();');
  js.push('}');
  js.push('');
  js.push('function assetsRenderMgmtDepts() {');
  js.push('  var el = document.getElementById("assetsMgmtDeptCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("assetsGetDepartmentStructure", {}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div style=\\"color:var(--sub);font-size:13px\\">"+(res.error||"")+"</div>"; return; }');
  js.push('    var h = "";');
  js.push('    Object.keys(res.structure).forEach(function(dept) {');
  js.push('      h += "<div style=\\"margin-bottom:10px\\"><b>" + dept + "</b>";');
  js.push('      var subs = res.structure[dept];');
  js.push('      if (subs.length) {');
  js.push('        h += "<div style=\\"padding-left:14px;margin-top:4px\\">";');
  js.push('        subs.forEach(function(s) {');
  js.push('          h += "<div style=\\"display:flex;justify-content:space-between;padding:3px 0;font-size:13px\\">";');
  js.push('          h += "<span>" + s.name + (s.desc?" — "+s.desc:"") + "</span>";');
  js.push('          h += "<button class=\\"btn bd\\" style=\\"padding:1px 6px;font-size:11px\\" data-dept=\\""+dept.replace(/"/g,"&quot;")+"\\" data-sub=\\""+s.name.replace(/"/g,"&quot;")+"\\" onclick=\\"assetsDeactivateDeptAction(this)\\">убрать</button>";');
  js.push('          h += "</div>";');
  js.push('        });');
  js.push('        h += "</div>";');
  js.push('      }');
  js.push('      h += "</div>";');
  js.push('    });');
  js.push('    if (el) el.innerHTML = h || "<div style=\\"color:var(--sub);font-size:13px\\">Нет подразделений</div>";');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsAddDeptPrompt() {');
  js.push('  var dept = prompt("Подразделение (например: Производство):");');
  js.push('  if (!dept) return;');
  js.push('  var subdept = prompt("Подподразделение (например: Линия 4), необязательно:") || "";');
  js.push('  var desc = prompt("Описание, необязательно:") || "";');
  js.push('  srv("assetsAddDepartment", {payload:{dept:dept, subdept:subdept, desc:desc}}, function(res) {');
  js.push('    if (res.ok) { toast("Добавлено","ok"); assetsRenderMgmtDepts(); assetsDicts=null; }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsDeactivateDeptAction(btn) {');
  js.push('  var dept = btn.dataset.dept, sub = btn.dataset.sub;');
  js.push('  if (!confirm("Убрать \\""+sub+"\\"?")) return;');
  js.push('  srv("assetsDeactivateDepartment", {payload:{dept:dept, subdept:sub}}, function(res) {');
  js.push('    if (res.ok) { toast("Готово","ok"); assetsRenderMgmtDepts(); } else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsRenderMgmtStorage() {');
  js.push('  var el = document.getElementById("assetsMgmtStorCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("assetsGetStorageLocations", {payload:{}}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div style=\\"color:var(--sub);font-size:13px\\">"+(res.error||"")+"</div>"; return; }');
  js.push('    if (!res.data.length) { if(el) el.innerHTML="<div style=\\"color:var(--sub);font-size:13px\\">Нет адресов</div>"; return; }');
  js.push('    var h = "<div class=\\"tw\\"><table><thead><tr><th>Подразделение</th><th>Место хранения</th><th></th></tr></thead><tbody>";');
  js.push('    res.data.forEach(function(s) {');
  js.push('      h += "<tr><td style=\\"font-size:13px\\">"+s["Подразделение"]+"</td><td style=\\"font-size:13px\\">"+s["Место хранения"]+"</td>";');
  js.push('      h += "<td><button class=\\"btn bd\\" style=\\"padding:2px 8px;font-size:12px\\" data-dept=\\""+String(s["Подразделение"]).replace(/"/g,"&quot;")+"\\" data-name=\\""+String(s["Место хранения"]).replace(/"/g,"&quot;")+"\\" onclick=\\"assetsDeleteStorAction(this)\\">убрать</button></td></tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    if (el) el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsAddStorPrompt() {');
  js.push('  var dept = prompt("Подразделение:");');
  js.push('  if (!dept) return;');
  js.push('  var name = prompt("Название места хранения:");');
  js.push('  if (!name) return;');
  js.push('  var desc = prompt("Описание, необязательно:") || "";');
  js.push('  srv("assetsAddStorageLocation", {payload:{dept:dept, name:name, desc:desc}}, function(res) {');
  js.push('    if (res.ok) { toast("Добавлено","ok"); assetsRenderMgmtStorage(); assetsDicts=null; }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsDeleteStorAction(btn) {');
  js.push('  var dept = btn.dataset.dept, name = btn.dataset.name;');
  js.push('  if (!confirm("Убрать \\""+name+"\\"?")) return;');
  js.push('  srv("assetsDeleteStorageLocation", {payload:{dept:dept, name:name}}, function(res) {');
  js.push('    if (res.ok) { toast("Готово","ok"); assetsRenderMgmtStorage(); } else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsRenderMgmtVidy() {');
  js.push('  var el = document.getElementById("assetsMgmtVidCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("assetsGetVidy", {}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div style=\\"color:var(--sub);font-size:13px\\">"+(res.error||"")+"</div>"; return; }');
  js.push('    if (!res.data.length) { if(el) el.innerHTML="<div style=\\"color:var(--sub);font-size:13px\\">Нет видов</div>"; return; }');
  js.push('    var h = "";');
  js.push('    res.data.forEach(function(v) {');
  js.push('      h += "<div style=\\"display:flex;justify-content:space-between;padding:4px 0;font-size:13px;border-bottom:1px solid var(--bd)\\">";');
  js.push('      h += "<span>"+v+"</span><button class=\\"btn bd\\" style=\\"padding:1px 6px;font-size:11px\\" data-vid=\\""+String(v).replace(/"/g,"&quot;")+"\\" onclick=\\"assetsDeactivateVidAction(this)\\">убрать</button></div>";');
  js.push('    });');
  js.push('    if (el) el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsAddVidPrompt() {');
  js.push('  var vid = prompt("Название вида ОС:");');
  js.push('  if (!vid) return;');
  js.push('  srv("assetsAddVid", {payload:{vid:vid}}, function(res) {');
  js.push('    if (res.ok) { toast("Добавлено","ok"); assetsRenderMgmtVidy(); assetsDicts=null; }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsDeactivateVidAction(btn) {');
  js.push('  var vid = btn.dataset.vid;');
  js.push('  if (!confirm("Убрать \\""+vid+"\\"?")) return;');
  js.push('  srv("assetsDeactivateVid", {payload:{vid:vid}}, function(res) {');
  js.push('    if (res.ok) { toast("Готово","ok"); assetsRenderMgmtVidy(); } else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsRegenerateQR() {');
  js.push('  if (!confirm("Перегенерировать QR-коды и ссылки для ВСЕХ ОС? Старые распечатанные наклейки перестанут вести на новую систему, если она отличается от текущей.")) return;');
  js.push('  var btn = document.getElementById("assetsQrBtn");');
  js.push('  btn.disabled = true; var old = btn.textContent; btn.textContent = "Обновление...";');
  js.push('  srv("assetsGenerateQRForExisting", {}, function(res) {');
  js.push('    btn.disabled = false; btn.textContent = old;');
  js.push('    if (res.ok) toast("Обновлено объектов: "+res.updated,"ok");');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function loadAssetsMovements() {');
  js.push('  var el = document.getElementById("assetsMovesCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("assetsGetMovements", {payload:{}}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    if (!res.data.length) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">Перемещений нет</div></div>"; return; }');
  js.push('    var h = "<div class=\\"tw\\"><table><thead><tr><th>Дата</th><th>Инв. №</th><th>Наименование</th><th>Откуда</th><th>Куда</th><th>Ответственный</th><th>Акт</th></tr></thead><tbody>";');
  js.push('    res.data.forEach(function(m) {');
  js.push('      h += "<tr><td>"+(m["Дата"]||"")+"</td><td style=\\"font-family:monospace;color:var(--g)\\">"+(m["Инв. номер"]||"")+"</td>";');
  js.push('      h += "<td>"+(m["Наименование"]||"")+"</td><td style=\\"font-size:13px;color:var(--sub)\\">"+(m["Откуда"]||"")+"</td>";');
  js.push('      h += "<td style=\\"font-size:13px\\">"+(m["Куда"]||"")+"</td><td style=\\"font-size:13px\\">"+(m["Ответств. лицо"]||"—")+"</td>";');
  js.push('      h += "<td style=\\"font-size:12px;color:var(--sub)\\">"+(m["Номер акта"]||"")+"</td></tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    if (el) el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function openAssetMoveMdl(btn) {');
  js.push('  var inv = btn.dataset.inv, dept = btn.dataset.dept;');
  js.push('  document.getElementById("amInvNum").value = inv;');
  js.push('  document.getElementById("amInfo").textContent = inv + " (сейчас: " + dept + ")";');
  js.push('  assetsLoadDicts(function() {');
  js.push('    var sel = document.getElementById("amTo");');
  js.push('    sel.innerHTML = "<option value=\\"\\">—</option>" + (assetsDicts.departments||[]).filter(function(d){return d!==dept;}).map(function(d){return "<option>"+d+"</option>";}).join("");');
  js.push('  });');
  js.push('  document.getElementById("amResponsible").value = "";');
  js.push('  document.getElementById("amReason").value = "";');
  js.push('  showMdl("mdlAssetMove");');
  js.push('}');
  js.push('');
  js.push('function saveAssetMove() {');
  js.push('  var payload = {');
  js.push('    invNum: document.getElementById("amInvNum").value,');
  js.push('    to: document.getElementById("amTo").value,');
  js.push('    responsible: document.getElementById("amResponsible").value,');
  js.push('    reason: document.getElementById("amReason").value');
  js.push('  };');
  js.push('  if (!payload.to) { toast("Выберите новое подразделение","err"); return; }');
  js.push('  srv("assetsAddMovement", {payload:payload}, function(res) {');
  js.push('    if (res.ok) { toast(res.message||"Готово","ok"); closeMdl("mdlAssetMove"); loadAssetsList(); loadAssetsMovements(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function loadAssetsWriteOffs() {');
  js.push('  var el = document.getElementById("assetsWriteOffsCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("assetsGetWriteOffs", {payload:{}}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    if (!res.data.length) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">Списаний нет</div></div>"; return; }');
  js.push('    var h = "<div class=\\"tw\\"><table><thead><tr><th>Дата</th><th>Инв. №</th><th>Наименование</th><th>Подразделение</th><th>Причина</th><th>Остаточная стоимость</th><th>Акт</th></tr></thead><tbody>";');
  js.push('    res.data.forEach(function(w) {');
  js.push('      h += "<tr><td>"+(w["Дата"]||"")+"</td><td style=\\"font-family:monospace;color:var(--g)\\">"+(w["Инв. номер"]||"")+"</td>";');
  js.push('      h += "<td>"+(w["Наименование"]||"")+"</td><td style=\\"font-size:13px;color:var(--sub)\\">"+(w["Подразделение"]||"")+"</td>";');
  js.push('      h += "<td style=\\"font-size:13px\\">"+(w["Причина"]||"")+"</td><td style=\\"text-align:right\\">"+(Number(w["Остаточная стоимость"])||0).toLocaleString()+" сум</td>";');
  js.push('      h += "<td style=\\"font-size:12px;color:var(--sub)\\">"+(w["Номер акта"]||"")+"</td></tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    if (el) el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function openAssetWriteOffMdl(btn) {');
  js.push('  var inv = btn.dataset.inv;');
  js.push('  document.getElementById("awInvNum").value = inv;');
  js.push('  document.getElementById("awInfo").textContent = inv;');
  js.push('  assetsLoadDicts(function() {');
  js.push('    var sel = document.getElementById("awReason");');
  js.push('    sel.innerHTML = "<option value=\\"\\">—</option>" + (assetsDicts.reasons||[]).map(function(r){return "<option>"+r+"</option>";}).join("");');
  js.push('  });');
  js.push('  document.getElementById("awNote").value = "";');
  js.push('  showMdl("mdlAssetWriteOff");');
  js.push('}');
  js.push('');
  js.push('function saveAssetWriteOff() {');
  js.push('  var payload = {');
  js.push('    invNum: document.getElementById("awInvNum").value,');
  js.push('    reason: document.getElementById("awReason").value,');
  js.push('    note: document.getElementById("awNote").value');
  js.push('  };');
  js.push('  if (!payload.reason) { toast("Укажите причину","err"); return; }');
  js.push('  if (!confirm("Списать "+payload.invNum+"? Действие необратимо.")) return;');
  js.push('  srv("assetsWriteOff", {payload:payload}, function(res) {');
  js.push('    if (res.ok) { toast(res.message||"Готово","ok"); closeMdl("mdlAssetWriteOff"); loadAssetsList(); loadAssetsWriteOffs(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');


  // ════════════════════════════════════════════════════════
  // ИНВЕНТАРИЗАЦИЯ
  // ════════════════════════════════════════════════════════
  js.push('function assetsIsFull() { return USER.role === "Администратор" || USER.role === "Бухгалтер ОС"; }');
  js.push('');
  js.push('function loadAssetsInventory() {');
  js.push('  var btn = document.getElementById("assetsInvCreateBtn"); if (btn) btn.style.display = assetsIsFull() ? "" : "none";');
  js.push('  var el = document.getElementById("assetsInventoryCont");');
  js.push('  if (el) el.innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  srv("assetsGetInventories", {}, function(res) {');
  js.push('    if (!res.ok) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-t\\">"+(res.error||"")+"</div></div>"; return; }');
  js.push('    if (!res.data.length) { if(el) el.innerHTML="<div class=\\"empty\\"><div class=\\"empty-ico\\">📐</div><div class=\\"empty-t\\">Инвентаризаций нет</div></div>"; return; }');
  js.push('    var h = "<div class=\\"tw\\"><table><thead><tr><th>№</th><th>Название</th><th>Подразделение</th><th>Статус</th><th>Начало</th><th>Найдено/Всего</th><th></th></tr></thead><tbody>";');
  js.push('    res.data.forEach(function(inv) {');
  js.push('      var stColor = inv["Статус"]==="Открыта" ? "color:var(--warn)" : "color:var(--ok)";');
  js.push('      h += "<tr><td style=\\"font-family:monospace;color:var(--g)\\">"+inv["№ инв-ции"]+"</td><td style=\\"font-weight:600\\">"+inv["Название"]+"</td>";');
  js.push('      h += "<td style=\\"font-size:13px\\">"+inv["Подразделение"]+"</td><td style=\\""+stColor+"\\">"+inv["Статус"]+"</td>";');
  js.push('      h += "<td style=\\"font-size:12px;color:var(--sub)\\">"+(inv["Дата начала"]||"")+"</td>";');
  js.push('      h += "<td>"+(inv["Найдено"]||0)+" / "+(inv["Итого объектов"]||0)+"</td>";');
  js.push('      h += "<td><button class=\\"btn bs\\" style=\\"padding:3px 10px;font-size:12px\\" data-inv=\\""+inv["№ инв-ции"]+"\\" onclick=\\"openInventoryDetailMdl(this)\\">Открыть</button></td></tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    if (el) el.innerHTML = h;');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function openInventoryCreateMdl() {');
  js.push('  document.getElementById("icName").value = "";');
  js.push('  assetsLoadDicts(function() {');
  js.push('    var sel = document.getElementById("icDept");');
  js.push('    sel.innerHTML = "<option value=\\"\\">Все подразделения</option>" + (assetsDicts.departments||[]).map(function(d){return "<option>"+d+"</option>";}).join("");');
  js.push('  });');
  js.push('  showMdl("mdlInventoryCreate");');
  js.push('}');
  js.push('');
  js.push('function saveInventoryCreate() {');
  js.push('  var payload = {name: document.getElementById("icName").value, dept: document.getElementById("icDept").value};');
  js.push('  if (!payload.name) { toast("Укажите название","err"); return; }');
  js.push('  srv("assetsCreateInventory", {payload:payload}, function(res) {');
  js.push('    if (res.ok) { toast("Создано, объектов: "+res.total,"ok"); closeMdl("mdlInventoryCreate"); loadAssetsInventory(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('var assetsCurrentInvNum = null;');
  js.push('function openInventoryDetailMdl(btn) {');
  js.push('  assetsCurrentInvNum = btn.dataset.inv;');
  js.push('  document.getElementById("idBody").innerHTML = "<div class=\\"loader\\"><div class=\\"spin\\"></div></div>";');
  js.push('  showMdl("mdlInventoryDetail");');
  js.push('  assetsRefreshInventoryDetail();');
  js.push('}');
  js.push('');
  js.push('function assetsRefreshInventoryDetail() {');
  js.push('  srv("assetsGetInventoryReport", {payload:{invNum: assetsCurrentInvNum}}, function(res) {');
  js.push('    var el = document.getElementById("idBody");');
  js.push('    if (!res.ok) { el.innerHTML = "<div style=\\"color:var(--err)\\">"+res.error+"</div>"; return; }');
  js.push('    var inv = res.inv;');
  js.push('    var isOpen = inv["Статус"] === "Открыта";');
  js.push('    var h = "<div style=\\"margin-bottom:12px\\"><b>"+inv["Название"]+"</b> · "+inv["Подразделение"]+" · <span style=\\""+(isOpen?"color:var(--warn)":"color:var(--ok)")+"\\">"+inv["Статус"]+"</span></div>";');
  js.push('    h += "<div style=\\"display:flex;gap:16px;margin-bottom:14px;font-size:13px\\">";');
  js.push('    h += "<span>Найдено: <b style=\\"color:var(--ok)\\">"+res.found.length+"</b></span>";');
  js.push('    h += "<span>Не найдено: <b style=\\"color:var(--err)\\">"+res.missed.length+"</b></span>";');
  js.push('    h += "<span>Излишки: <b style=\\"color:var(--warn)\\">"+res.surplus.length+"</b></span>";');
  js.push('    h += "</div>";');
  js.push('    var all = res.found.concat(res.missed).concat(res.surplus);');
  js.push('    h += "<div class=\\"tw\\" style=\\"max-height:340px;overflow-y:auto\\"><table><thead><tr><th>Инв. №</th><th>Наименование</th><th>Ожид. адрес</th><th>Статус</th>"+(isOpen?"<th></th>":"")+"</tr></thead><tbody>";');
  js.push('    all.forEach(function(r) {');
  js.push('      var stColor = r["Статус"]==="Найдено" ? "color:var(--ok)" : r["Статус"]==="Излишек" ? "color:var(--warn)" : "color:var(--err)";');
  js.push('      h += "<tr><td style=\\"font-family:monospace;color:var(--g)\\">"+(r["Инв. номер"]||"")+"</td><td>"+(r["Наименование"]||"")+"</td>";');
  js.push('      h += "<td style=\\"font-size:12px;color:var(--sub)\\">"+(r["Ожидаемый адрес"]||"")+"</td><td style=\\""+stColor+"\\">"+r["Статус"]+"</td>";');
  js.push('      if (isOpen) {');
  js.push('        if (r["Статус"] !== "Найдено") {');
  js.push('          h += "<td><button class=\\"btn bs\\" style=\\"padding:2px 8px;font-size:12px\\" data-inv=\\""+(r["Инв. номер"]||"")+"\\" data-name=\\""+String(r["Наименование"]||"").replace(/\\"/g,"&quot;")+"\\" onclick=\\"assetsConfirmItemPresence(this)\\">Подтвердить</button></td>";');
  js.push('        } else h += "<td></td>";');
  js.push('      }');
  js.push('      h += "</tr>";');
  js.push('    });');
  js.push('    h += "</tbody></table></div>";');
  js.push('    el.innerHTML = h;');
  js.push('    var closeBtn = document.getElementById("idCloseBtn");');
  js.push('    if (closeBtn) closeBtn.style.display = (isOpen && assetsIsFull()) ? "" : "none";');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsConfirmItemPresence(btn) {');
  js.push('  var inv = btn.dataset.inv, name = btn.dataset.name;');
  js.push('  var factAddr = prompt("Фактический адрес (где найден):", "") || "";');
  js.push('  var condition = prompt("Состояние (например: Хорошее / Требует ремонта):", "Хорошее") || "";');
  js.push('  srv("assetsConfirmPresence", {payload:{invNum: assetsCurrentInvNum, osInvNum: inv, osName: name, factAddr: factAddr, condition: condition}}, function(res) {');
  js.push('    if (res.ok) { toast("Подтверждено","ok"); assetsRefreshInventoryDetail(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');
  js.push('function assetsCloseInventoryNow() {');
  js.push('  if (!confirm("Закрыть инвентаризацию? После закрытия подтверждение станет недоступно.")) return;');
  js.push('  srv("assetsCloseInventory", {payload:{invNum: assetsCurrentInvNum}}, function(res) {');
  js.push('    if (res.ok) { toast("Закрыта","ok"); assetsRefreshInventoryDetail(); loadAssetsInventory(); }');
  js.push('    else toast(res.error,"err");');
  js.push('  });');
  js.push('}');
  js.push('');

  return js.join('\n');
}

/* ─── SERVER HELPERS ─────────────────────────────────────────── */
function getRoleColor(role) { return '#F9A825'; } // не используется в v1.3
function getInitials(fio) {
  if (!fio) return '?';
  return fio.split(' ').map(function(w){return w[0]||'';}).join('').toUpperCase().slice(0,2);
}
function escHtml(str) {
  if (!str) return '';
  return str.toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}