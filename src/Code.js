// ============================================================
// GOLD LAVASH — ПРОИЗВОДСТВЕННАЯ СИСТЕМА v1.1
// ============================================================

var MAIN_DB_NAME = 'GL_MainDB';
var SESSION_TTL  = 8 * 3600;

var KADRY_SS_ID = '1KfdHfOeh9e4HUrUiMeW7PJjmJo_p-mEalYuWJKkgBZk';
var NORMA_SS_ID = '1pZ9xo8zd3mthajIAECk0m8a1J9SfOpBHdV-jayRG_7c';
var FORMA_SS_ID = '1r6vd60mdo57PgLZAoy7PijR8snD0h63zwezD8UocavY';

var ROLES = {
  ADMIN:           'Администратор',
  ZAV_PROD:        'Зав.производством',
  ZAV_PROD_BULK:   'Зав.производством Булочки',
  HR_DIR:          'HR директор',
  HR_MGR:          'HR менеджер',
  ZAV_SKLAD_S:     'Завсклад сырья',
  ZAV_SKLAD_G:     'Завсклад ГП',
  BRIGADIR:        'Бригадир',
  TESTODEL:        'Тестодел',
  UPAKOVSHCHITSA:  'Зав.упаковщица',
  MEKHANIK:        'Механик',
  FINANSIST:       'Финансист',
  OS_BUKH:         'Бухгалтер ОС',
};

var OS_DEPARTMENTS = ['Производство', 'Завод СЭЗ', 'ОТП Самарканд', 'ОТП Тошкент', 'Офис'];

// ─── WEB APP ENTRY ───────────────────────────────────────────
function doGet(e) {
  try {
    // Публичные страницы ОС/инвентаря — доступны по QR без входа в систему
    var page = e && e.parameter && e.parameter.page;
    if (page === 'os-card') {
      var cardTmpl = HtmlService.createTemplateFromFile('AssetsCard');
      cardTmpl.invParam = (e && e.parameter && e.parameter.inv) || '';
      cardTmpl.appUrl = ScriptApp.getService().getUrl().replace('/dev', '/exec');
      return cardTmpl.evaluate()
        .setTitle('Карточка ОС — GOLD LAVASH')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .setSandboxMode(HtmlService.SandboxMode.NATIVE);
    }
    if (page === 'os-label') {
      return HtmlService.createHtmlOutputFromFile('AssetsLabel')
        .setTitle('Наклейки ОС — GOLD LAVASH')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .setSandboxMode(HtmlService.SandboxMode.NATIVE);
    }
    if (page === 'os-photo') {
      var photoTmpl = HtmlService.createTemplateFromFile('AssetsPhoto');
      photoTmpl.invParam = (e && e.parameter && e.parameter.inv) || '';
      return photoTmpl.evaluate()
        .setTitle('Фото ОС — GOLD LAVASH')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .setSandboxMode(HtmlService.SandboxMode.NATIVE);
    }

    // Определяем устройство по параметру или User-Agent
    var isMobile = (e && e.parameter && e.parameter.mobile === '1');
    var html = isMobile ? buildMobileSPA() : buildSPA();
    return HtmlService.createHtmlOutput(html)
      .setTitle('GOLD LAVASH')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch(err) {
    var errHtml = '<h2 style="color:red;font-family:Arial;padding:20px">Ошибка: ' +
      err.message + '</h2><pre style="padding:20px">' + (err.stack||'') + '</pre>';
    return HtmlService.createHtmlOutput(errHtml).setTitle('GOLD LAVASH');
  }
}

// ─── ГЛАВНАЯ ФУНКЦИЯ — вызывается через google.script.run ────
function handleAction(dataStr) {
  try {
    var data = (typeof dataStr === 'string') ? JSON.parse(dataStr) : dataStr;
    var action = data.action;

    // Публичные (без авторизации)
    if (action === 'login') return JSON.stringify(actionLogin(data));
    if (action === 'setup') return JSON.stringify(actionSetup(data));
    if (action === 'ping')  return JSON.stringify({ok: true, msg: 'pong'});
    if (action === 'checkDB') return JSON.stringify(actionCheckDB());

    // Авторизованные
    var user = getSessionUser(data.token);
    if (!user) return JSON.stringify({ok: false, error: 'SESSION_EXPIRED'});

    // ── РЕЖИМ СИМУЛЯЦИИ РОЛИ (только для Администратора) ──
    // Позволяет администратору временно увидеть систему глазами другой роли
    // (и выбранной линии для линейных ролей), сохраняя при этом полные права
    // на удаление документов. Реальная личность администратора сохраняется
    // в user.realFio / user.realRole для журнала действий и проверок удаления.
    if (data.simulateRole && user.role === ROLES.ADMIN) {
      var simRole = data.simulateRole;
      var simLiniya = data.simulateLiniya || null;
      var validRoles = [ROLES.BRIGADIR, ROLES.TESTODEL, ROLES.UPAKOVSHCHITSA, ROLES.ZAV_PROD, ROLES.ZAV_SKLAD_S, ROLES.ZAV_SKLAD_G];
      if (validRoles.indexOf(simRole) !== -1) {
        user = {
          fio: user.fio, role: simRole, liniya: simLiniya, smena: user.smena || '',
          isAdminSimulating: true, realFio: user.fio, realRole: ROLES.ADMIN
        };
      }
    }

    var result;
    switch (action) {
      case 'logout':           result = actionLogout(data.token);                    break;
      case 'getMyProfile':     result = {ok: true, user: user};                      break;
      case 'getDashboardData': result = actionGetDashboard(user);                    break;
      case 'getUsers':         result = adminGetUsers(user);                         break;
      case 'saveUser':         result = adminSaveUser(user, data.payload);           break;
      case 'deleteUser':       result = adminDeleteUser(user, data.payload);         break;
      case 'resetPassword':    result = adminResetPassword(user, data.payload);      break;
      case 'getEquipment':     result = adminGetEquipment(user);                     break;
      case 'saveEquipment':    result = adminSaveEquipment(user, data.payload);      break;
      case 'deleteEquipment':  result = adminDeleteEquipment(user, data.payload);    break;
      case 'getLines':         result = adminGetLines(user);                         break;
      case 'saveLine':         result = adminSaveLine(user, data.payload);           break;
      case 'getProducts':      result = getProducts(user);                           break;
      case 'saveProduct':      result = saveProduct(user, data.payload);             break;
      case 'deleteProduct':    result = deleteProduct(user, data.payload);           break;
      case 'getWorkers':       result = getWorkers(user);                            break;

      // ── БРИГАДИР (Этап 2) ──
      case 'brigGetCurrentShift':   result = brigGetCurrentShift(user);                       break;
      case 'brigOpenShift':         result = brigOpenShift(user);                             break;
      case 'brigGetRollCallList':   result = brigGetRollCallList(user, data.payload);          break;
      case 'brigSearchWorker':      result = brigSearchWorker(user, data.payload);             break;
      case 'brigMarkAttendance':    result = brigMarkAttendance(user, data.payload);           break;
      case 'brigCheckShiftReadiness': result = brigCheckShiftReadiness(user, data.payload);    break;
      case 'brigGetShiftSummary':   result = brigGetShiftSummary(user, data.payload);          break;
      case 'brigCloseShift':        result = brigCloseShift(user, data.payload);               break;
      case 'brigGetShiftHistory':   result = brigGetShiftHistory(user);                        break;
      case 'brigGetTimesheet':      result = brigGetTimesheet(user, data.payload);             break;
      case 'brigTransferToTimesheet': result = brigTransferToTimesheet(user, data.payload);     break;
      case 'brigUnlockRollCall':    result = brigUnlockRollCall(user, data.payload);             break;

      // ── ЗАВ.ПРОИЗВОДСТВОМ (Этап 3) ──
      case 'zpGetSchedule':         result = zpGetSchedule(user, data.payload);                 break;
      case 'zpSetScheduleHours':    result = zpSetScheduleHours(user, data.payload);            break;
      case 'zpGetPriorities':       result = zpGetPriorities(user);                             break;
      case 'zpSavePriority':        result = zpSavePriority(user, data.payload);                break;
      case 'zpGetSpeedMatrix':      result = zpGetSpeedMatrix(user);                            break;
      case 'zpSaveProductSpeed':    result = zpSaveProductSpeed(user, data.payload);            break;
      case 'zpBuildDistribution':        result = zpBuildDistribution(user, data.payload);        break;
      case 'zpBuildDistributionManual':  result = zpBuildDistributionManual(user, data.payload);  break;
      case 'getProductSpeed':            result = zpGetProductSpeed(user, data.payload);           break;
      case 'getDashboardData':           result = getDashboardData(user);                          break;
      case 'zpGetDistributionHistory':   result = zpGetDistributionHistory(user, data.payload);    break;

      // ── Финансист: согласование документов + себестоимость SKU ──
      case 'approvalSubmit':      result = approvalSubmit(user, data.payload);      break;
      case 'approvalGetPending':  result = approvalGetPending(user, data.payload);  break;
      case 'approvalGetHistory':  result = approvalGetHistory(user, data.payload);  break;
      case 'approvalGetHistoryBulk': result = approvalGetHistoryBulk(user, data.payload); break;
      case 'approvalGetAll':      result = approvalGetAll(user, data.payload);      break;
      case 'approvalApprove':     result = approvalApprove(user, data.payload);     break;
      case 'approvalReject':      result = approvalReject(user, data.payload);      break;
      case 'finGetSkuCosts':      result = finGetSkuCosts(user);                    break;
      case 'finSaveSkuCost':      result = finSaveSkuCost(user, data.payload);      break;
      case 'finDeleteSkuCost':    result = finDeleteSkuCost(user, data.payload);    break;
      case 'finGetProductNames':  result = finGetProductNames(user);                break;
      case 'spGetNormsWithCost':          result = spGetNormsWithCost(user);                 break;
      case 'finGetMaterialCostForProduct':result = finGetMaterialCostForProduct(user, data.payload); break;
      case 'getShiftStatus':             result = getShiftStatus(user, data.payload);              break;
      case 'zpApproveDistribution': result = zpApproveDistribution(user, data.payload);          break;
      case 'brigGetProductionPlan': result = brigGetProductionPlan(user);                        break;

      // ── ПРОИЗВОДСТВЕННЫЙ УЧЁТ СМЕНЫ ──
      case 'spGetNorms':            result = spGetNorms(user);                                    break;
      case 'spSaveNorm':            result = spSaveNorm(user, data.payload);                      break;
      case 'spDeleteNorm':          result = spDeleteNorm(user, data.payload);                    break;
      case 'spWriteOff':            result = spWriteOff(user, data.payload);                      break;
      case 'spGetWriteOffs':        result = spGetWriteOffs(user, data.payload);                  break;
      case 'spGetShiftReport':      result = spGetShiftReport(user, data.payload);                break;
      case 'spCloseShift':          result = spCloseShift(user, data.payload);                    break;

      // ── ЗАВСКЛАД СЫРЬЯ ──
      case 'adminGetMaterials':     result = adminGetMaterials(user);                           break;
      case 'adminSaveMaterial':     result = adminSaveMaterial(user, data.payload);             break;
      case 'adminDeleteMaterial':   result = adminDeleteMaterial(user, data.payload);           break;
      case 'adminGetSuppliers':     result = adminGetSuppliers(user);                           break;
      case 'adminSaveSupplier':     result = adminSaveSupplier(user, data.payload);             break;
      case 'adminDeleteSupplier':   result = adminDeleteSupplier(user, data.payload);           break;
      case 'skladGetSuppliers':     result = skladGetSuppliers(user);                           break;
      case 'skladGetMaterials':     result = skladGetMaterials(user);                           break;
      case 'skladAddIncoming':      result = skladAddIncoming(user, data.payload);              break;
      case 'skladGetIncoming':      result = skladGetIncoming(user, data.payload);              break;
      case 'skladGetMaterialReport':    result = skladGetMaterialReport(user, data.payload);    break;
      case 'adminGetStorageUsage':  result = adminGetStorageUsage(user);                        break;

      // ── СКЛАДЫ И ПЕРЕВОДЫ (доступно всем авторизованным) ──
      case 'warehouseGetList':            result = warehouseGetList(user);                            break;
      case 'warehouseGetMy':               result = warehouseGetMy(user);                              break;
      case 'warehouseGetMyWarehouses':     result = warehouseGetMyWarehouses(user);                    break;
      case 'warehouseGetWarehouseUsers':   result = warehouseGetWarehouseUsers(user, data.payload);   break;
      case 'warehouseGetBalances':        result = warehouseGetBalances(user, data.payload);          break;
      case 'warehouseGetMaterialReport':   result = warehouseGetMaterialReport(user, data.payload);    break;
      case 'warehouseRecalculateBalances':  result = warehouseRecalculateBalances(user);               break;

      // ── ИНВЕНТАРИЗАЦИЯ (Администратор) ──
      case 'invGetWarehouseBalances':      result = invGetWarehouseBalances(user, data.payload);       break;
      case 'invSetBalance':                result = invSetBalance(user, data.payload);                 break;
      case 'invSetBalanceBulk':            result = invSetBalanceBulk(user, data.payload);             break;
      case 'invGetHistory':                result = invGetHistory(user, data.payload);                 break;

      // ── УДАЛЕНИЕ ДОКУМЕНТОВ (Администратор) ──
      case 'deleteIncomingDocument':       result = deleteIncomingDocument(user, data.payload);        break;
      case 'deleteTransferDocument':       result = deleteTransferDocument(user, data.payload);        break;
      case 'deleteWriteOffDocument':       result = deleteWriteOffDocument(user, data.payload);        break;
      case 'deleteInventoryRecord':        result = deleteInventoryRecord(user, data.payload);         break;
      case 'deleteClosedShift':            result = deleteClosedShift(user, data.payload);             break;

      // ── МЕХАНИК: оборудование и заявки ──
      case 'mechGetEquipment':   result = mechGetEquipment(user, data.payload);   break;
      case 'mechSaveEquipment':  result = mechSaveEquipment(user, data.payload);  break;
      case 'mechDeleteEquipment':result = mechDeleteEquipment(user, data.payload);break;
      case 'mechGetSections':    result = mechGetSections(user, data.payload);    break;
      case 'mechSaveSection':    result = mechSaveSection(user, data.payload);    break;
      case 'mechDeleteSection':  result = mechDeleteSection(user, data.payload);  break;
      case 'mechCreateTicket':   result = mechCreateTicket(user, data.payload);   break;
      case 'mechAcceptTicket':   result = mechAcceptTicket(user, data.payload);   break;
      case 'mechCloseTicket':    result = mechCloseTicket(user, data.payload);    break;
      case 'mechGetTickets':     result = mechGetTickets(user, data.payload);     break;
      case 'mechGetStats':       result = mechGetStats(user, data.payload);       break;
      case 'mechGetActiveAlerts':result = mechGetActiveAlerts(user);              break;

      // ── HR: кадровый учёт ──
      case 'hrGetEmployees':     result = hrGetEmployees(user, data.payload);     break;
      case 'hrGetEmployee':      result = hrGetEmployee(user, data.payload);      break;
      case 'hrHireEmployee':     result = hrHireEmployee(user, data.payload);     break;
      case 'hrUpdateEmployee':   result = hrUpdateEmployee(user, data.payload);   break;
      case 'hrFireEmployee':     result = hrFireEmployee(user, data.payload);     break;
      case 'hrGetSeniority':     result = hrGetSeniority(user);                  break;
      case 'hrGetStaffing':      result = hrGetStaffing(user);                   break;
      case 'hrGetSalaryForPosition': result = hrGetSalaryForPosition(user, data.payload); break;
      case 'hrSaveStaffingRow':  result = hrSaveStaffingRow(user, data.payload); break;
      case 'hrDeleteStaffingRow':result = hrDeleteStaffingRow(user, data.payload);break;
      case 'hrGetConfig':        result = hrGetConfig(user);                     break;
      case 'hrGetOrgChart':      result = hrGetOrgChart(user);                   break;
      case 'hrGetStats':         result = hrGetStats(user);                      break;
      case 'hrAddLeave':         result = hrAddLeave(user, data.payload);        break;
      case 'hrGetLeaves':        result = hrGetLeaves(user, data.payload);       break;
      case 'hrGetMoves':         result = hrGetMoves(user, data.payload);        break;
      case 'hrCreateMove':       result = hrCreateMove(user, data.payload);      break;

      // ── Трудовые договоры ──
      case 'contractGetTemplates':  result = contractGetTemplates(user);                    break;
      case 'contractSaveTemplate':  result = contractSaveTemplate(user, data.payload);      break;
      case 'contractDeleteTemplate':result = contractDeleteTemplate(user, data.payload);    break;
      case 'contractGenerate':      result = contractGenerate(user, data.payload);          break;
      case 'contractGetLog':        result = contractGetLog(user, data.payload);            break;
      case 'contractMarkSigned':    result = contractMarkSigned(user, data.payload);        break;

      // ── Конструктор штатного расписания ──
      case 'staffDocList':     result = staffDocList(user, data.payload);     break;
      case 'staffDocCreate':   result = staffDocCreate(user, data.payload);   break;
      case 'staffDocGet':      result = staffDocGet(user, data.payload);      break;
      case 'staffDocUpdate':   result = staffDocUpdate(user, data.payload);   break;
      case 'staffDocDelete':   result = staffDocDelete(user, data.payload);   break;
      case 'staffDocGenerate': result = staffDocGenerate(user, data.payload); break;

      // ── Зарплата (сдельная оплата производственных линий) ──
      case 'payrollGetMapping':    result = payrollGetMapping(user);                break;
      case 'payrollSaveMapping':   result = payrollSaveMapping(user, data.payload); break;
      case 'payrollDeleteMapping': result = payrollDeleteMapping(user, data.payload);break;
      case 'payrollCalculate':     result = payrollCalculate(user, data.payload);   break;
      case 'payrollGetLines':      result = payrollGetLines(user);                  break;
      case 'warehouseCreateTransfer':     result = warehouseCreateTransfer(user, data.payload);       break;
      case 'warehouseGetTransfers':        result = warehouseGetTransfers(user, data.payload);         break;
      case 'warehouseGetIncomingTransfers': result = warehouseGetIncomingTransfers(user, data.payload); break;
      case 'warehouseConfirmTransfer':     result = warehouseConfirmTransfer(user, data.payload);      break;
      case 'warehouseRejectTransfer':      result = warehouseRejectTransfer(user, data.payload);       break;
      case 'warehouseGetRejectedTransfers': result = warehouseGetRejectedTransfers(user);              break;
      case 'warehouseResendTransfer':      result = warehouseResendTransfer(user, data.payload);       break;

      // ── Основные средства и инвентарь ──
      case 'assetsGetAll':               result = assetsGetAll(user, data.payload);               break;
      case 'assetsGetOne':               result = assetsGetOne(user, data.payload);               break;
      case 'assetsGetSummary':           result = assetsGetSummary(user);                         break;
      case 'assetsGetNextInvNumber':     result = assetsGetNextInvNumber(user, data.payload);     break;
      case 'assetsAdd':                  result = assetsAdd(user, data.payload);                  break;
      case 'assetsUpdateField':          result = assetsUpdateField(user, data.payload);          break;
      case 'assetsAddMovement':          result = assetsAddMovement(user, data.payload);          break;
      case 'assetsGetMovements':         result = assetsGetMovements(user, data.payload);         break;
      case 'assetsWriteOff':             result = assetsWriteOff(user, data.payload);             break;
      case 'assetsGetWriteOffs':         result = assetsGetWriteOffs(user, data.payload);         break;
      case 'assetsGetDirectories':       result = assetsGetDirectories(user);                     break;
      case 'assetsGetDepartmentStructure': result = assetsGetDepartmentStructure(user);           break;
      case 'assetsAddDepartment':        result = assetsAddDepartment(user, data.payload);        break;
      case 'assetsDeactivateDepartment': result = assetsDeactivateDepartment(user, data.payload); break;
      case 'assetsGetStorageLocations':  result = assetsGetStorageLocations(user, data.payload);  break;
      case 'assetsAddStorageLocation':   result = assetsAddStorageLocation(user, data.payload);   break;
      case 'assetsDeleteStorageLocation':result = assetsDeleteStorageLocation(user, data.payload);break;
      case 'assetsGetResponsiblePersons':result = assetsGetResponsiblePersons(user, data.payload);break;
      case 'assetsGetVidy':              result = assetsGetVidy(user);                            break;
      case 'assetsAddVid':               result = assetsAddVid(user, data.payload);               break;
      case 'assetsDeactivateVid':        result = assetsDeactivateVid(user, data.payload);        break;
      case 'assetsGetStaffNames':        result = assetsGetStaffNames(user);                      break;
      case 'assetsGetAmortHistory':      result = assetsGetAmortHistory(user, data.payload);      break;
      case 'assetsGetAllAmort':          result = assetsGetAllAmort(user, data.payload);          break;
      case 'assetsAccrueMonthlyDepreciation': result = assetsAccrueMonthlyDepreciation(user);      break;
      case 'assetsAmortPreview':         result = assetsAmortPreview(user, data.payload);         break;
      case 'assetsAmortCreateDocument':  result = assetsAmortCreateDocument(user, data.payload);  break;
      case 'assetsAmortListDocuments':   result = assetsAmortListDocuments(user);                 break;
      case 'assetsAmortGetDocument':     result = assetsAmortGetDocument(user, data.payload);     break;
      case 'assetsAmortDeleteDocument':  result = assetsAmortDeleteDocument(user, data.payload);  break;
      case 'assetsGetAlerts':            result = assetsGetAlerts(user);                          break;
      case 'assetsGetDashboardCharts':   result = assetsGetDashboardCharts(user);                 break;
      case 'assetsGetReportByDept':      result = assetsGetReportByDept(user, data.payload);      break;
      case 'assetsGetAmortReport':       result = assetsGetAmortReport(user, data.payload);       break;
      case 'assetsGetReportByStorage':   result = assetsGetReportByStorage(user, data.payload);   break;
      case 'assetsGetReportByResponsible': result = assetsGetReportByResponsible(user, data.payload); break;
      case 'assetsCreateInventory':      result = assetsCreateInventory(user, data.payload);      break;
      case 'assetsGetInventories':       result = assetsGetInventories(user);                     break;
      case 'assetsGetInventoryDetail':   result = assetsGetInventoryDetail(user, data.payload);   break;
      case 'assetsConfirmPresence':      result = assetsConfirmPresence(user, data.payload);      break;
      case 'assetsCloseInventory':       result = assetsCloseInventory(user, data.payload);       break;
      case 'assetsGetInventoryReport':   result = assetsGetInventoryReport(user, data.payload);   break;
      case 'assetsGenerateQRForExisting':result = assetsGenerateQRForExisting(user);              break;

      default:                 result = {ok: false, error: 'UNKNOWN_ACTION: ' + action};
    }
    return JSON.stringify(result);

  } catch (err) {
    return JSON.stringify({ok: false, error: err.message, stack: err.stack});
  }
}

// ─── ДИАГНОСТИКА ─────────────────────────────────────────────
function actionCheckDB() {
  var props = PropertiesService.getScriptProperties();
  var savedId = props.getProperty('MAIN_DB_ID');
  var ss = getMainDB();
  return {
    ok: true,
    savedId: savedId || 'НЕ ЗАДАН',
    dbFound: !!ss,
    dbName: ss ? ss.getName() : 'не найдена',
    dbUrl: ss ? ss.getUrl() : null,
  };
}

// ─── ИНИЦИАЛИЗАЦИЯ ───────────────────────────────────────────
function actionSetup(data) {
  // Если уже есть — вернуть info
  var existing = getMainDB();
  if (existing) {
    return {
      ok: false,
      error: 'Система уже инициализирована',
      url: existing.getUrl(),
      id: existing.getId()
    };
  }
  var ss = SpreadsheetApp.create(MAIN_DB_NAME);
  initMainDB(ss);
  return {ok: true, url: ss.getUrl(), id: ss.getId()};
}

function initMainDB(ss) {
  // ── Пользователи ──
  var shU = ss.getActiveSheet();
  shU.setName('Пользователи');
  shU.getRange(1,1,1,10).setValues([[
    'ID','Логин','Хеш','Роль','ФИО','Линия','Смена','Активен','Создан','Подразделение_ОС'
  ]]);
  shU.getRange(1,1,1,10).setFontWeight('bold').setBackground('#1B5E20').setFontColor('#fff');
  shU.setFrozenRows(1);

  var adminId = Utilities.getUuid();
  shU.getRange(2,1,1,10).setValues([[
    adminId, 'admin', hashPassword('admin123'),
    'Администратор', 'Администратор системы', '', '', true,
    new Date().toISOString(), ''
  ]]);

  // ── Сессии ──
  var shS = ss.insertSheet('Сессии');
  shS.getRange(1,1,1,4).setValues([['Токен','UserID','Роль','Истекает']]);
  shS.getRange(1,1,1,4).setFontWeight('bold').setBackground('#0D47A1').setFontColor('#fff');

  // ── Линии ──
  var shL = ss.insertSheet('Линии');
  shL.getRange(1,1,1,5).setValues([['ID','Название','Тип','Активна','Примечание']]);
  shL.getRange(1,1,1,5).setFontWeight('bold').setBackground('#4A148C').setFontColor('#fff');
  shL.setFrozenRows(1);
  var linesData = [
    [Utilities.getUuid(),'Линия №1','Лаваш',true,''],
    [Utilities.getUuid(),'Линия №2','Лаваш',true,''],
    [Utilities.getUuid(),'Линия №3','Лаваш',true,''],
    [Utilities.getUuid(),'Тандырная линия','Тандыр',true,''],
  ];
  shL.getRange(2,1,linesData.length,5).setValues(linesData);

  // ── Продукты ──
  var shP = ss.insertSheet('Продукты');
  shP.getRange(1,1,1,6).setValues([['ID','Название','Единица','Упаковка','Линия','Активен']]);
  shP.getRange(1,1,1,6).setFontWeight('bold').setBackground('#E65100').setFontColor('#fff');
  shP.setFrozenRows(1);
  var products = [
    ['Овал большой 20 шт','шт',20,'Линия №1,Линия №2',true],
    ['Стандарт 20 шт','шт',20,'Линия №1,Линия №2',true],
    ['Тонкий 20 шт','шт',20,'Линия №1,Линия №2',true],
    ['Тортилья 10 шт','шт',10,'Линия №1,Линия №2',true],
    ['Мега 3 шт','шт',3,'Линия №1,Линия №2',true],
    ['Чудо 5 шт','шт',5,'Линия №1,Линия №2',true],
    ['Армянский тонкий 5 шт','шт',5,'Линия №1,Линия №2',true],
    ['Овал Мини по 10 шт 52 гр','шт',10,'Линия №1,Линия №2',true],
    ['Лава-Лаваш по 10 шт','шт',10,'Линия №1,Линия №2',true],
    ['Лаваш СТАНДАРТ тонкий','шт',1,'Линия №1,Линия №2',true],
    ['Прямоугольный лаваш 55х40 по 20 шт','шт',20,'Линия №3',true],
    ['Лаваш 5 талик','шт',5,'Тандырная линия',true],
    ['Лаваш 20 талик','шт',20,'Тандырная линия',true],
    ['Овал тандырный по 20 шт','шт',20,'Тандырная линия',true],
  ];
  var prodRows = products.map(function(p) { return [Utilities.getUuid()].concat(p); });
  shP.getRange(2,1,prodRows.length,6).setValues(prodRows);

  // ── Оборудование ──
  var shE = ss.insertSheet('Оборудование');
  shE.getRange(1,1,1,7).setValues([['ID','Инв.номер','Название','Линия','Тип','Активно','Примечание']]);
  shE.getRange(1,1,1,7).setFontWeight('bold').setBackground('#37474F').setFontColor('#fff');
  shE.setFrozenRows(1);

  // ── Настройки ──
  var shSet = ss.insertSheet('Настройки');
  shSet.getRange(1,1,1,2).setValues([['Ключ','Значение']]);
  shSet.getRange(1,1,1,2).setFontWeight('bold').setBackground('#880E4F').setFontColor('#fff');
  var settings = [
    ['AVANSO_MAX_PERCENT','35'],
    ['SESSION_TTL_HOURS','8'],
    ['MEKHANIK_FULL_ACCESS','false'],
    ['INITIALIZED', new Date().toISOString()],
  ];
  shSet.getRange(2,1,settings.length,2).setValues(settings);

  // ── Лог ──
  var shLog = ss.insertSheet('Лог');
  shLog.getRange(1,1,1,5).setValues([['Дата','Пользователь','Роль','Действие','Детали']]);
  shLog.getRange(1,1,1,5).setFontWeight('bold').setBackground('#212121').setFontColor('#fff');

  // Сохраняем ID
  PropertiesService.getScriptProperties().setProperty('MAIN_DB_ID', ss.getId());
  Logger.log('GL_MainDB создана: ' + ss.getUrl());
}

// ─── АУТЕНТИФИКАЦИЯ ──────────────────────────────────────────
function actionLogin(data) {
  var login    = data.login    || '';
  var password = data.password || '';
  if (!login || !password) return {ok: false, error: 'Введите логин и пароль'};

  var ss = getMainDB();
  if (!ss) return {
    ok: false,
    error: 'База данных не найдена. Нажмите "Инициализировать систему" ниже.',
    needSetup: true
  };

  var sh   = ss.getSheetByName('Пользователи');
  var rows = sh.getDataRange().getValues();
  var hash = hashPassword(password);

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    // [0]=ID [1]=Логин [2]=Хеш [3]=Роль [4]=ФИО [5]=Линия [6]=Смена [7]=Активен
    if (!row[7]) continue; // не активен
    if (row[1].toString().toLowerCase() === login.toLowerCase()) {
      if (row[2] === hash) {
        var token = createSession(row[0], row[3], ss);
        logAction(ss, row[4], row[3], 'ВХОД', login);
        return {
          ok: true,
          token: token,
          user: {id: row[0], login: row[1], role: row[3], fio: row[4], liniya: row[5], smena: row[6], osDept: row[9] || ''}
        };
      } else {
        return {ok: false, error: 'Неверный пароль'};
      }
    }
  }
  return {ok: false, error: 'Пользователь "' + login + '" не найден'};
}

function actionLogout(token) {
  var ss = getMainDB();
  if (!ss) return {ok: true};
  var sh   = ss.getSheetByName('Сессии');
  var rows = sh.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][0] === token) { sh.deleteRow(i + 1); break; }
  }
  CacheService.getScriptCache().remove('sess_' + token);
  return {ok: true};
}

function createSession(userId, role, ss) {
  var token   = Utilities.getUuid();
  var expires = new Date(Date.now() + SESSION_TTL * 1000).toISOString();
  ss.getSheetByName('Сессии').appendRow([token, userId, role, expires]);
  return token;
}

function getSessionUser(token) {
  if (!token) return null;

  var cache  = CacheService.getScriptCache();
  var cached = cache.get('sess_' + token);
  if (cached) {
    try { return JSON.parse(cached); } catch(e) {}
  }

  var ss = getMainDB();
  if (!ss) return null;

  var shSess   = ss.getSheetByName('Сессии');
  var sessRows = shSess.getDataRange().getValues();
  var userId   = null;

  for (var i = 1; i < sessRows.length; i++) {
    if (sessRows[i][0] === token) {
      if (new Date(sessRows[i][3]) < new Date()) {
        shSess.deleteRow(i + 1);
        return null;
      }
      userId = sessRows[i][1];
      break;
    }
  }
  if (!userId) return null;

  var shU    = ss.getSheetByName('Пользователи');
  var uRows  = shU.getDataRange().getValues();
  for (var j = 1; j < uRows.length; j++) {
    if (uRows[j][0] === userId && uRows[j][7]) {
      var user = {
        id: uRows[j][0], login: uRows[j][1],
        role: uRows[j][3], fio: uRows[j][4],
        liniya: uRows[j][5], smena: uRows[j][6],
        osDept: uRows[j][9] || ''
      };
      cache.put('sess_' + token, JSON.stringify(user), SESSION_TTL);
      return user;
    }
  }
  return null;
}

// ─── ПОЛЬЗОВАТЕЛИ ────────────────────────────────────────────
function ensureUserDeptColumn(sh) {
  if (sh.getLastColumn() < 10) {
    sh.getRange(1,10).setValue('Подразделение_ОС');
    sh.getRange(1,10).setFontWeight('bold').setBackground('#1B5E20').setFontColor('#fff');
  }
}

function adminGetUsers(user) {
  requireRole(user, ['Администратор']);
  var ss   = getMainDB();
  var sh   = ss.getSheetByName('Пользователи');
  ensureUserDeptColumn(sh);
  var rows = sh.getDataRange().getValues();
  var users = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    users.push({
      id: rows[i][0], login: rows[i][1], role: rows[i][3],
      fio: rows[i][4], liniya: rows[i][5], smena: rows[i][6],
      active: rows[i][7], created: rows[i][8], osDept: rows[i][9] || ''
    });
  }
  return {ok: true, users: users, osDepartments: OS_DEPARTMENTS};
}

function adminSaveUser(user, payload) {
  requireRole(user, ['Администратор']);
  var ss   = getMainDB();
  var sh   = ss.getSheetByName('Пользователи');
  ensureUserDeptColumn(sh);
  var rows = sh.getDataRange().getValues();

  if (payload.id) {
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === payload.id) {
        if (payload.login !== undefined) sh.getRange(i+1,2).setValue(payload.login);
        if (payload.role   !== undefined) sh.getRange(i+1,4).setValue(payload.role);
        if (payload.fio    !== undefined) sh.getRange(i+1,5).setValue(payload.fio);
        if (payload.liniya !== undefined) sh.getRange(i+1,6).setValue(payload.liniya || '');
        if (payload.smena  !== undefined) sh.getRange(i+1,7).setValue(payload.smena  || '');
        if (payload.active !== undefined) sh.getRange(i+1,8).setValue(payload.active);
        if (payload.osDept !== undefined) sh.getRange(i+1,10).setValue(payload.osDept || '');
        if (payload.newPassword) sh.getRange(i+1,3).setValue(hashPassword(payload.newPassword));
        CacheService.getScriptCache().remove('sess_' + payload.id);
        logAction(ss, user.fio, user.role, 'РЕДАКТ.ПОЛЬЗ.', payload.fio || rows[i][4]);
        return {ok: true};
      }
    }
    return {ok: false, error: 'Пользователь не найден'};
  } else {
    // Проверка уникальности логина
    for (var k = 1; k < rows.length; k++) {
      if (rows[k][1] && rows[k][1].toString().toLowerCase() === (payload.login||'').toLowerCase()) {
        return {ok: false, error: 'Логин "' + payload.login + '" уже занят'};
      }
    }
    var newId = Utilities.getUuid();
    sh.appendRow([
      newId, payload.login, hashPassword(payload.password || 'gl1234'),
      payload.role, payload.fio, payload.liniya || '', payload.smena || '',
      true, new Date().toISOString(), payload.osDept || ''
    ]);
    logAction(ss, user.fio, user.role, 'СОЗДАН ПОЛЬЗ.', payload.fio + ' (' + payload.role + ')');
    return {ok: true, id: newId};
  }
}

function adminDeleteUser(user, payload) {
  requireRole(user, ['Администратор']);
  if (payload.id === user.id) return {ok: false, error: 'Нельзя удалить себя'};
  return adminSaveUser(user, {id: payload.id, active: false});
}

function adminResetPassword(user, payload) {
  requireRole(user, ['Администратор']);
  var ss   = getMainDB();
  var sh   = ss.getSheetByName('Пользователи');
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === payload.id) {
      sh.getRange(i+1,3).setValue(hashPassword(payload.password));
      logAction(ss, user.fio, user.role, 'СБРОС ПАРОЛЯ', rows[i][4]);
      return {ok: true};
    }
  }
  return {ok: false, error: 'Не найден'};
}

// ─── ОБОРУДОВАНИЕ ────────────────────────────────────────────
function adminGetEquipment(user) {
  var ss   = getMainDB();
  var sh   = ss.getSheetByName('Оборудование');
  var rows = sh.getDataRange().getValues();
  var eq   = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    eq.push({id:rows[i][0],invNum:rows[i][1],name:rows[i][2],
             liniya:rows[i][3],type:rows[i][4],active:rows[i][5],note:rows[i][6]});
  }
  return {ok: true, equipment: eq};
}

function adminSaveEquipment(user, payload) {
  requireRole(user, ['Администратор']);
  var ss   = getMainDB();
  var sh   = ss.getSheetByName('Оборудование');
  var rows = sh.getDataRange().getValues();

  if (payload.id) {
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === payload.id) {
        sh.getRange(i+1,2,1,6).setValues([[
          payload.invNum || rows[i][1],
          payload.name   || rows[i][2],
          payload.liniya !== undefined ? payload.liniya : rows[i][3],
          payload.type   || rows[i][4],
          payload.active !== undefined ? payload.active : rows[i][5],
          payload.note   !== undefined ? payload.note   : rows[i][6]
        ]]);
        return {ok: true};
      }
    }
    return {ok: false, error: 'Не найдено'};
  } else {
    for (var k = 1; k < rows.length; k++) {
      if (rows[k][1] && rows[k][1].toString() === (payload.invNum||'').toString()) {
        return {ok: false, error: 'Инв. номер "' + payload.invNum + '" уже существует'};
      }
    }
    var newId = Utilities.getUuid();
    sh.appendRow([newId, payload.invNum, payload.name,
                  payload.liniya||'', payload.type||'', true, payload.note||'']);
    return {ok: true, id: newId};
  }
}

function adminDeleteEquipment(user, payload) {
  requireRole(user, ['Администратор']);
  return adminSaveEquipment(user, {id: payload.id, active: false});
}

// ─── ЛИНИИ ───────────────────────────────────────────────────
function adminGetLines(user) {
  var ss   = getMainDB();
  var sh   = ss.getSheetByName('Линии');
  var rows = sh.getDataRange().getValues();
  var lines = [];
  // Определяем какой тип линий показывать
  // Зав.производством Булочки — только линии типа 'Булочки' или 'Хлеб'
  // Зав.производством — только линии типа 'Лаваш' или без типа
  // Остальные (Бригадир, Администратор и т.д.) — все линии
  var role = user && user.role;
  var cehFilter = null;
  if (role === 'Зав.производством Булочки') cehFilter = 'bulk';
  else if (role === 'Зав.производством') cehFilter = 'lavash';

  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var lineType = (rows[i][2] || '').toString().toLowerCase();
    var isBulk = lineType.indexOf('булоч') !== -1 || lineType.indexOf('хлеб') !== -1 || lineType.indexOf('bulk') !== -1;

    if (cehFilter === 'bulk'   && !isBulk) continue;
    if (cehFilter === 'lavash' &&  isBulk) continue;

    lines.push({id:rows[i][0], name:rows[i][1], type:rows[i][2], active:rows[i][3], note:rows[i][4]});
  }
  return {ok: true, lines: lines};
}

function adminSaveLine(user, payload) {
  requireRole(user, ['Администратор']);
  var ss   = getMainDB();
  var sh   = ss.getSheetByName('Линии');
  var rows = sh.getDataRange().getValues();
  if (payload.id) {
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === payload.id) {
        sh.getRange(i+1,2,1,4).setValues([[
          payload.name || rows[i][1],
          payload.type || rows[i][2],
          payload.active !== undefined ? payload.active : rows[i][3],
          payload.note  !== undefined ? payload.note  : rows[i][4]
        ]]);
        return {ok: true};
      }
    }
    return {ok: false, error: 'Не найдено'};
  } else {
    sh.appendRow([Utilities.getUuid(), payload.name, payload.type||'Лаваш', true, payload.note||'']);
    return {ok: true};
  }
}

// ─── ДАШБОРД ─────────────────────────────────────────────────
function actionGetDashboard(user) {
  var ss   = getMainDB();
  var data = {role: user.role, fio: user.fio};

  if (user.role === 'Администратор') {
    var shU    = ss.getSheetByName('Пользователи');
    var uRows  = shU.getDataRange().getValues();
    var total  = 0, active = 0;
    for (var i = 1; i < uRows.length; i++) {
      if (uRows[i][0]) { total++; if (uRows[i][7]) active++; }
    }
    var shE   = ss.getSheetByName('Оборудование');
    var eRows = shE.getDataRange().getValues();
    var eqCnt = 0;
    for (var j = 1; j < eRows.length; j++) {
      if (eRows[j][0] && eRows[j][5]) eqCnt++;
    }
    data.stats = {totalUsers: total, activeUsers: active, totalEquipment: eqCnt};
  }

  var linesRes = adminGetLines(user);
  data.lines   = linesRes.lines || [];
  return {ok: true, data: data};
}

// ─── СПРАВОЧНИКИ ─────────────────────────────────────────────
function getProducts(user) {
  var ss   = getMainDB();
  var sh   = ss.getSheetByName('Продукты');
  if (!sh) return {ok: false, error: 'Лист "Продукты" не найден'};
  var rows = sh.getDataRange().getValues();
  var products = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    products.push({
      id:     rows[i][0],
      name:   rows[i][1],
      unit:   rows[i][2] || 'шт',
      pack:   rows[i][3] || 1,
      liniya: rows[i][4] || '',
      active: rows[i][5] !== false && rows[i][5] !== 0 && rows[i][5] !== '',
      klass:  rows[i][6] || 'Лаваш'  // колонка G: Лаваш / Булочка / Хлеб
    });
  }
  return {ok: true, products: products};
}

function saveProduct(user, payload) {
  requireRole(user, ['Администратор']);
  var ss = getMainDB();
  var sh = ss.getSheetByName('Продукты');
  if (!sh) return {ok: false, error: 'Лист "Продукты" не найден'};
  if (!payload.name) return {ok: false, error: 'Укажите название'};

  var id = payload.id || Utilities.getUuid();
  var row = [id, payload.name, payload.unit||'шт', payload.pack||1, payload.liniya||'', true, payload.klass||'Лаваш'];
  var rows = sh.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      sh.getRange(i+1, 1, 1, 7).setValues([row]);
      return {ok: true, id: id};
    }
  }
  sh.appendRow(row);
  return {ok: true, id: id};
}

function deleteProduct(user, payload) {
  requireRole(user, ['Администратор']);
  var ss = getMainDB();
  var sh = ss.getSheetByName('Продукты');
  if (!sh) return {ok: false, error: 'Лист "Продукты" не найден'};
  var rows = sh.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][0] === payload.id) {
      sh.deleteRow(i + 1);
      return {ok: true};
    }
  }
  return {ok: false, error: 'Продукт не найден'};
}

function getWorkers(user) {
  try {
    var kadry = SpreadsheetApp.openById(KADRY_SS_ID);
    var sh    = kadry.getSheetByName('Стаж рабочих');
    if (!sh) return {ok: false, error: 'Лист "Стаж рабочих" не найден'};
    var rows    = sh.getDataRange().getValues();
    var workers = [];
    // Структура: [0]№ [1]Ф.И.О. [2]Подразделение [3]Состояние [4]Стаж работы [5]Категория
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][1]) continue;
      workers.push({fio: rows[i][1], podrazd: rows[i][2], sostoyanie: rows[i][3], stazh: rows[i][4]});
    }
    return {ok: true, workers: workers};
  } catch(e) {
    return {ok: false, error: 'Нет доступа к Кадры GL: ' + e.message};
  }
}

// ─── ВСПОМОГАТЕЛЬНЫЕ ─────────────────────────────────────────
function getMainDB() {
  var props = PropertiesService.getScriptProperties();
  var id    = props.getProperty('MAIN_DB_ID');
  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch(e) {
      props.deleteProperty('MAIN_DB_ID');
    }
  }
  // Ищем по имени
  var files = DriveApp.getFilesByName(MAIN_DB_NAME);
  while (files.hasNext()) {
    var f = files.next();
    try {
      var ss = SpreadsheetApp.open(f);
      props.setProperty('MAIN_DB_ID', ss.getId());
      return ss;
    } catch(e) {}
  }
  return null;
}

function hashPassword(password) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password + 'GOLDLAVASH_SALT_2025'
  );
  return bytes.map(function(b) {
    return ('0' + (b & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function requireRole(user, allowedRoles) {
  // Администратор в режиме симуляции роли уже прошёл проверку допустимости
  // симулируемой роли при входе в режим; пропускаем дальше, чтобы не блокировать
  // действия, доступные обычному пользователю с этой ролью.
  if (user.isAdminSimulating) return;
  if (allowedRoles.indexOf(user.role) === -1) {
    throw new Error('Нет доступа. Требуется: ' + allowedRoles.join(' / '));
  }
}

function logAction(ss, fio, role, action, details) {
  try {
    ss.getSheetByName('Лог').appendRow([new Date(), fio||'', role||'', action||'', details||'']);
  } catch(e) {}
}

// ─── ТРИГГЕР: очистка сессий ─────────────────────────────────
function cleanExpiredSessions() {
  var ss = getMainDB();
  if (!ss) return;
  var sh   = ss.getSheetByName('Сессии');
  var rows = sh.getDataRange().getValues();
  var now  = new Date();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][0] && new Date(rows[i][3]) < now) sh.deleteRow(i + 1);
  }
}

function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(function(t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('cleanExpiredSessions').timeBased().everyHours(1).create();
}

// ─── ТЕСТ В РЕДАКТОРЕ (запустите вручную) ────────────────────
function testLogin() {
  var result = handleAction(JSON.stringify({action:'login', login:'admin', password:'admin123'}));
  Logger.log(result);
}

function testCheckDB() {
  var result = handleAction(JSON.stringify({action:'checkDB'}));
  Logger.log(result);
}

// ─── ТЕСТ СТРАНИЦЫ (запустите для проверки HTML) ─────────────
function testLoginPage() {
  try {
    var html = buildLoginPage();
    Logger.log('Login page length: ' + html.length);
    Logger.log('First 500 chars: ' + html.substring(0, 500));
  } catch(e) {
    Logger.log('ERROR in buildLoginPage: ' + e.message);
    Logger.log(e.stack);
  }
}

function testAppShell() {
  // Создаём тестового пользователя
  var fakeUser = {id:'test', login:'admin', role:'Администратор', fio:'Тест Тестов', liniya:'', smena:''};
  try {
    var html = buildAppShell(fakeUser, 'test-token-123');
    Logger.log('App shell length: ' + html.length);
    Logger.log('First 500 chars: ' + html.substring(0, 500));
  } catch(e) {
    Logger.log('ERROR in buildAppShell: ' + e.message);
    Logger.log(e.stack);
  }
}

// ─── ДИАГНОСТИКА: Поиск работника (запустите вручную в редакторе) ───
function testSearchWorker() {
  try {
    Logger.log('Открываю таблицу Кадры GL по ID: ' + KADRY_SS_ID);
    var kadry = SpreadsheetApp.openById(KADRY_SS_ID);
    Logger.log('Таблица открыта: ' + kadry.getName());

    var sh = kadry.getSheetByName('Стаж рабочих');
    if (!sh) {
      Logger.log('ОШИБКА: лист "Стаж рабочих" не найден!');
      var allSheets = kadry.getSheets().map(function(s){return s.getName();});
      Logger.log('Доступные листы: ' + allSheets.join(', '));
      return;
    }
    Logger.log('Лист найден: ' + sh.getName());

    var rows = sh.getDataRange().getValues();
    Logger.log('Всего строк: ' + rows.length);
    Logger.log('Заголовки (строка 1): ' + JSON.stringify(rows[0]));
    Logger.log('Пример строки 2: ' + JSON.stringify(rows[1]));
    Logger.log('Пример строки 3: ' + JSON.stringify(rows[2]));

    // Тестовый поиск
    var query = 'касимов';
    var found = [];
    for (var i = 1; i < rows.length && found.length < 5; i++) {
      if (!rows[i][1]) continue;
      var fio = rows[i][1].toString();
      if (fio.toLowerCase().indexOf(query) !== -1) {
        found.push(fio);
      }
    }
    Logger.log('Найдено по запросу "' + query + '": ' + JSON.stringify(found));

  } catch(e) {
    Logger.log('ИСКЛЮЧЕНИЕ: ' + e.message);
    Logger.log(e.stack);
  }
}

// ─── ДИАГНОСТИКА: полный тест действия brigSearchWorker ───
function testBrigSearchAction() {
  var result = handleAction(JSON.stringify({
    action: 'brigSearchWorker',
    token: 'PUT_REAL_TOKEN_HERE', // замените на реальный токен бригадира из логина
    payload: {query: 'касимов'}
  }));
  Logger.log(result);
}

// ─── ДИАГНОСТИКА: тест электронного табеля ───
function testTimesheet() {
  try {
    // Тестовый пользователь-бригадир (подставьте реальные данные если нужно)
    var fakeUser = {id:'test', login:'test', role:'Бригадир', fio:'Тест Бригадир', liniya:'Линия №2', smena:'День'};
    var result = brigGetTimesheet(fakeUser, {});
    Logger.log('Результат: ' + JSON.stringify(result));
  } catch(e) {
    Logger.log('ОШИБКА: ' + e.message);
    Logger.log(e.stack);
  }
}