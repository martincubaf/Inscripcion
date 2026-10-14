// Generado con npm run gas:build. Copiar completo en Google Apps Script.
const professions = [
  "Obstetra",
  "Médico",
  "Biólogo",
  "Tecnólogo médico",
  "Enfermero(a)",
  "Otro",
];
const establishments = [
  "Consultorio particular",
  "Centro médico",
  "Clínica privada",
  "Hospital",
  "Centro de fertilidad",
  "Otro",
];
const lima = [
  "Ancón",
  "Ate",
  "Barranco",
  "Breña",
  "Carabayllo",
  "Chaclacayo",
  "Chorrillos",
  "Cieneguilla",
  "Comas",
  "El Agustino",
  "Independencia",
  "Jesús María",
  "La Molina",
  "La Victoria",
  "Lima",
  "Lince",
  "Los Olivos",
  "Lurigancho",
  "Lurín",
  "Magdalena del Mar",
  "Miraflores",
  "Pachacámac",
  "Pucusana",
  "Pueblo Libre",
  "Puente Piedra",
  "Punta Hermosa",
  "Punta Negra",
  "Rímac",
  "San Bartolo",
  "San Borja",
  "San Isidro",
  "San Juan de Lurigancho",
  "San Juan de Miraflores",
  "San Luis",
  "San Martín de Porres",
  "San Miguel",
  "Santa Anita",
  "Santa María del Mar",
  "Santa Rosa",
  "Santiago de Surco",
  "Surquillo",
  "Villa El Salvador",
  "Villa María del Triunfo",
];
const callao = [
  "Bellavista",
  "Callao",
  "Carmen de la Legua Reynoso",
  "La Perla",
  "La Punta",
  "Mi Perú",
  "Ventanilla",
];
const districts = [...lima, ...callao, "Otra localidad"];
function phone(value) {
  const n = String(value || "").replace(/[\s()-]/g, "");
  return /^(?:\+51)?9\d{8}$/.test(n) ? "+51" + n.slice(-9) : null;
}
function validate(input) {
  const data = {};
  /** @type {Record<string, string>} */
  const errors = {};
  const fields = [
    "name",
    "profession",
    "otherProfession",
    "specialty",
    "license",
    "phone",
    "email",
    "attends",
    "establishment",
    "establishmentType",
    "address",
    "district",
    "otherLocation",
    "reference",
  ];
  for (const field of fields) {
    data[field] = typeof input?.[field] === "string" ? input[field].trim() : "";
    if (data[field].length > (field === "email" ? 254 : 200))
      errors[field] =
        "Máximo " + (field === "email" ? 254 : 200) + " caracteres.";
  }
  const required = ["name", "profession", "phone", "email", "attends"];
  if (data.profession === "Otro") required.push("otherProfession");
  else data.otherProfession = "";
  if (data.attends === "Sí") {
    required.push("establishment", "establishmentType", "district");
    if (data.district === "Otra localidad") required.push("otherLocation");
    else data.otherLocation = "";
  } else
    for (const f of [
      "establishment",
      "establishmentType",
      "address",
      "district",
      "otherLocation",
      "reference",
    ])
      data[f] = "";
  for (const f of required) if (!data[f]) errors[f] = "Completa este campo.";
  if (!professions.includes(data.profession))
    errors.profession = "Selecciona una profesión.";
  if (!["Sí", "No"].includes(data.attends))
    errors.attends = "Selecciona una opción.";
  if (data.attends === "Sí" && !establishments.includes(data.establishmentType))
    errors.establishmentType = "Selecciona un tipo de establecimiento.";
  if (data.attends === "Sí" && !districts.includes(data.district))
    errors.district = "Selecciona un distrito.";
  const normalized = phone(data.phone);
  if (!normalized)
    errors.phone =
      "Ingresa un celular peruano: 9 dígitos, empieza con 9. Puedes incluir +51.";
  else data.phone = normalized;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Ingresa un correo electrónico válido.";
  data.email = data.email.toLowerCase();
  data.consent = input?.consent === true;
  if (!data.consent)
    errors.consent = "Debes aceptar la política de privacidad.";
  return { data, errors, valid: Object.keys(errors).length === 0 };
}

// Hoja proporcionada por el organizador. Se puede reemplazar mediante SPREADSHEET_ID.
var CONSEVIA_SPREADSHEET_ID = '1CFRPtNyyhpmA8kvR7uVb28ui2sl2pd_CJhv9jS2p7Xc';
function spreadsheetId_() { return PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || CONSEVIA_SPREADSHEET_ID; }
var HEADERS = ['ID','Fecha de inscripción','Hora de inscripción','Nombres y apellidos','Profesión','Otra profesión','Especialidad','Colegiatura','Celular','Email','Atiende pacientes','Nombre del establecimiento','Tipo de establecimiento','Dirección','Distrito','Otra localidad','Referencia','Consentimiento de datos'];
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
   if(found) return output_({ok:true,saved:true,id:body.id});
  }
  var cache=CacheService.getScriptCache();var key='rate:'+body.rateKey;var hits=Number(cache.get(key)||0);
  if(hits>=5) return output_({ok:false,code:'RATE_LIMIT'});
  cache.put(key,String(hits+1),600);
  var d=result.data;var now=new Date();
  var row=[body.id,Utilities.formatDate(now,'America/Lima','yyyy-MM-dd'),Utilities.formatDate(now,'America/Lima','HH:mm:ss'),d.name,d.profession,d.otherProfession,d.specialty,d.license,d.phone,d.email,d.attends,d.establishment,d.establishmentType,d.address,d.district,d.otherLocation,d.reference,'Sí'];
  var next=sheet.getLastRow()+1;
  sheet.getRange(next,1,1,HEADERS.length).setNumberFormat('@').setValues([row.map(safe_)]);
  SpreadsheetApp.flush();
  if(sheet.getRange(next,1).getValue() !== body.id) throw new Error('No se confirmó la escritura.');
  return output_({ok:true,saved:true,id:body.id});
 } catch(error) { return output_({ok:false,code:'SAVE_FAILED'}); }
 finally { if(acquired) lock.releaseLock(); }
}
