export const professions = [
  "Obstetra",
  "Médico",
  "Biólogo",
  "Tecnólogo médico",
  "Enfermero(a)",
  "Otro",
];
export const establishments = [
  "Consultorio particular",
  "Centro médico",
  "Clínica privada",
  "Hospital",
  "Centro de fertilidad",
  "Otro",
];
export const lima = [
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
export const callao = [
  "Bellavista",
  "Callao",
  "Carmen de la Legua Reynoso",
  "La Perla",
  "La Punta",
  "Mi Perú",
  "Ventanilla",
];
export const districts = [...lima, ...callao, "Otra localidad"];
export function phone(value) {
  const n = String(value || "").replace(/[\s()-]/g, "");
  return /^(?:\+51)?9\d{8}$/.test(n) ? "+51" + n.slice(-9) : null;
}
export function validate(input) {
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
