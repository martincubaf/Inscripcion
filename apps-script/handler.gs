// Hoja proporcionada por el organizador. Se puede reemplazar mediante SPREADSHEET_ID.
var CONSEVIA_SPREADSHEET_ID = '1CFRPtNyyhpmA8kvR7uVb28ui2sl2pd_CJhv9jS2p7Xc';
function spreadsheetId_() { return PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || CONSEVIA_SPREADSHEET_ID; }
var HEADERS = ['ID','Fecha de inscripción','Hora de inscripción','Nombres y apellidos','Profesión','Otra profesión','Especialidad','Colegiatura','Celular','Email','Atiende pacientes','Nombre del establecimiento','Tipo de establecimiento','Dirección','Distrito','Otra localidad','Referencia','Consentimiento de datos','Consentimiento de publicidad','Fecha y hora del consentimiento','Versión de política de privacidad','Retener hasta'];
var POLICY_VERSION = '2026-10-15';
function output_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
function doGet() { return output_({ok:false,code:'METHOD_NOT_ALLOWED'}); }
function setupSheet() {
  var props=PropertiesService.getScriptProperties();
  // La clave se genera una sola vez en Google; nunca se incorpora al formulario público.
  if(!props.getProperty('WRITE_SECRET')) props.setProperty('WRITE_SECRET', (Utilities.getUuid()+Utilities.getUuid()).replace(/-/g,''));
  var book=SpreadsheetApp.openById(spreadsheetId_());
  book.setSpreadsheetTimeZone('America/Lima');
  var sheet=book.getSheetByName('CONSEVIA_INSCRIPCIONES') || book.insertSheet('CONSEVIA_INSCRIPCIONES');
  if(sheet.getLastRow() === 0) { sheet.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);sheet.setFrozenRows(1);sheet.getRange(1,1,1,HEADERS.length).setFontWeight('bold'); }
  // Migración aditiva: conserva A:R y los registros existentes. No presume consentimientos antiguos.
  var oldHeaders=sheet.getRange(1,1,1,18).getValues()[0];
  if(JSON.stringify(oldHeaders) !== JSON.stringify(HEADERS.slice(0,18))) throw new Error('Encabezados originales incompatibles.');
  var extra=sheet.getRange(1,19,1,4).getValues()[0];
  if(extra.every(function(value){ return value === ''; })) {
    // Evita ocupar columnas con datos existentes aunque sus encabezados estén vacíos.
    if(sheet.getLastRow()>1 && sheet.getRange(2,19,sheet.getLastRow()-1,4).getValues().some(function(row){return row.some(function(value){return value !== '';});})) throw new Error('S:V contiene datos. Revisión manual necesaria.');
    sheet.getRange(1,19,1,4).setValues([HEADERS.slice(18)]).setFontWeight('bold');
  }
  assertHeaders_(sheet);
}
function assertHeaders_(sheet) {
  if(JSON.stringify(sheet.getRange(1,1,1,HEADERS.length).getValues()[0]) !== JSON.stringify(HEADERS)) throw new Error('Encabezados incompatibles.');
}
function safe_(value) { return /^[=+@\-\t\r]/.test(String(value)) ? "'"+value : value; }
function doPost(e) {
 var lock=LockService.getScriptLock(); var acquired=false;
 try {
  if(!e || !e.postData || e.postData.contents.length>15000) return output_({ok:false,code:'INVALID_REQUEST'});
  var body=JSON.parse(e.postData.contents);var props=PropertiesService.getScriptProperties();
  var secret=props.getProperty('WRITE_SECRET');
  if(!secret || body.secret !== secret) return output_({ok:false,code:'UNAUTHORIZED'});
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.id || '') || !/^[a-f0-9]{32}$/.test(body.rateKey || '')) return output_({ok:false,code:'INVALID_REQUEST'});
  var result=validate(body.data); if(!result.valid) return output_({ok:false,code:'VALIDATION'});
  lock.waitLock(10000);acquired=true;
  var sheet=SpreadsheetApp.openById(spreadsheetId_()).getSheetByName('CONSEVIA_INSCRIPCIONES');
  if(!sheet) throw new Error('Ejecuta setupSheet.'); assertHeaders_(sheet);
  if(sheet.getLastRow()>1) {
   var found=sheet.getRange(2,1,sheet.getLastRow()-1,1).createTextFinder(body.id).matchEntireCell(true).findNext();
   if(found) {
    var stored=sheet.getRange(found.getRow(),19,1,4).getValues()[0];
    if(stored[2] !== POLICY_VERSION || !['Sí','No'].includes(stored[0])) return output_({ok:false,code:'CONSENT_NOT_RECORDED'});
    return output_({ok:true,saved:true,id:body.id,schemaVersion:2,marketingConsent:stored[0] === 'Sí'});
   }
  }
  var cache=CacheService.getScriptCache();var key='rate:'+body.rateKey;var hits=Number(cache.get(key)||0);
  if(hits>=5) return output_({ok:false,code:'RATE_LIMIT'});
  cache.put(key,String(hits+1),600);
  var d=result.data;var now=new Date();
  // Un formulario anterior no acredita haber mostrado la política nueva.
  var acceptedVersion=d.policyVersion || 'Anterior (sin versión)';
  var row=[body.id,Utilities.formatDate(now,'America/Lima','yyyy-MM-dd'),Utilities.formatDate(now,'America/Lima','HH:mm:ss'),d.name,d.profession,d.otherProfession,d.specialty,d.license,d.phone,d.email,d.attends,d.establishment,d.establishmentType,d.address,d.district,d.otherLocation,d.reference,'Sí',d.marketingConsent ? 'Sí' : 'No',Utilities.formatDate(now,'America/Lima','yyyy-MM-dd HH:mm:ss'),acceptedVersion,Utilities.formatDate(new Date(now.getTime()+30*24*60*60*1000),'America/Lima','yyyy-MM-dd HH:mm:ss')];
  var next=sheet.getLastRow()+1;
  sheet.getRange(next,1,1,HEADERS.length).setNumberFormat('@').setValues([row.map(safe_)]);
  SpreadsheetApp.flush();
  if(sheet.getRange(next,1).getValue() !== body.id) throw new Error('No se confirmó la escritura.');
  var storedConsent=sheet.getRange(next,19,1,4).getValues()[0];
  if(storedConsent[0] !== row[18] || storedConsent[1] !== row[19] || storedConsent[2] !== acceptedVersion || storedConsent[3] !== row[21]) throw new Error('No se confirmaron las autorizaciones.');
  return output_({ok:true,saved:true,id:body.id,schemaVersion:2,marketingConsent:storedConsent[0] === 'Sí'});
 } catch(error) { return output_({ok:false,code:'SAVE_FAILED'}); }
 finally { if(acquired) lock.releaseLock(); }
}
