function Savedсom() { 
 
  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let sTotal = ss.getSheetByName('Поступление')
    let lrTotal = sTotal.getLastRow()
   
    if (sTotal.getRange('F3').isChecked()==true){

  let totalRange = sTotal.getRange('A2:F2').getValues()
   sTotal.getRange(lrTotal+1,1, totalRange.length,totalRange[0].length).setValues(totalRange)
   sTotal.getRange('B2:F2').clearContent()
   sTotal.getRange('F3').uncheck();

    }
  Logger.log(lrTotal+1)
      }