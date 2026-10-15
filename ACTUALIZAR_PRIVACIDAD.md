# Actualización de privacidad · 15 de octubre de 2026

## Ya realizado en Google

Se guardó el código actualizado en el proyecto existente, se ejecutó `setupSheet` correctamente y se actualizó la misma implementación a la **versión 3**. Se conservan URL, claves, permisos y registros anteriores. No necesitas crear otra hoja ni generar secretos nuevos.

Se añadieron cuatro columnas al final de `CONSEVIA_INSCRIPCIONES`:

| Columna | Encabezado | Uso |
|---|---|---|
| S | Consentimiento de publicidad | Sí o No, elección independiente |
| T | Fecha y hora del consentimiento | Recepción del envío en hora de Perú |
| U | Versión de política de privacidad | 2026-10-15 en el formulario actualizado |
| V | Retener hasta | Fecha de inscripción más 30 días calendario |

Las columnas A:R se conservan. En registros anteriores, S:V permanecen vacías: una casilla vacía NO autoriza publicidad. Envíos de la versión antigua se distinguen como «Anterior (sin versión)»; no se les atribuye la política nueva.

## Lo que debes subir a GitHub

Reemplaza el contenido del proyecto con esta entrega conservando las carpetas. No subas `.env`, archivos de variables privadas, `node_modules` ni `.git`. El ZIP completo ya los excluye. Si prefieres el ZIP de cambios, extráelo sobre la raíz del proyecto.

Incluye especialmente `public/privacidad.html`, `vercel.json`, `src/main.tsx`, `src/styles.css`, `shared/validation.js` y `server/service.mjs`. La API y las reglas compartidas deben actualizarse junto al formulario. La entrega también incluye el código de Google como respaldo.

## Variables en Vercel

Conserva `APPS_SCRIPT_URL`, `APPS_SCRIPT_SECRET`, `FORM_TOKEN_SECRET` y `PUBLIC_ORIGIN` actuales.

Después de revisar el texto preparado con los datos que proporcionaste, utiliza:

```text
PRIVACY_URL=https://inscripcion-nine.vercel.app/privacidad
PRIVACY_APPROVED=true
```

El texto está en `public/privacidad.html`. Estos cambios todavía no se han publicado en tu Vercel desde esta sesión: tú realizas el commit y el despliegue. Verifica que el nuevo despliegue use el commit actualizado; editar variables no cambia el código de una versión anterior.

Después del despliegue, abre en incógnito:

- Formulario: https://inscripcion-nine.vercel.app
- Política: https://inscripcion-nine.vercel.app/privacidad

El enlace «Leer política de privacidad» abre la política en la misma pestaña. Un borrador temporal de sesión conserva los datos al regresar y al recargar; se descarta tras dos horas sin actualizarlo y se elimina después de confirmar la inscripción. La publicidad no es obligatoria para inscribirse. Un formulario abierto antes del despliegue debe recargarse para mostrar la nueva política y sus casillas.

## Gestión de los 30 días y solicitudes

El plazo se cuenta desde cada inscripción, tanto para gestionar el evento como para publicidad. No es un plazo de 30 días desde el evento ni una autorización de publicidad indefinida.

El sistema calcula V, pero **no elimina datos automáticamente**. El responsable debe revisar los vencimientos y eliminar los registros vencidos de la hoja y las copias/exportaciones bajo su control, además de gestionar la papelera y cualquier copia recuperable según las posibilidades de cada proveedor. Mantén el acceso restringido durante ese proceso. No prolongues el uso publicitario por conservar una copia o historial recuperable.

Antes de cada campaña, selecciona únicamente filas con S = «Sí», U = «2026-10-15», V posterior al momento actual y sin una revocación recibida. Los datos anteriores, S vacía o S = «No» no se incluyen. La aplicación no envía campañas.

Atiende las solicitudes recibidas en laboratorio@innovagen.pe. Si retiran publicidad, excluye inmediatamente al contacto de futuras campañas, registra la gestión y cambia S a «No». No es necesario cancelar su inscripción. Si solicitan cancelación/eliminación, comprueba la identidad proporcionalmente y gestiona los datos y sus copias dentro del plazo aplicable. No recopiles documentos de identidad innecesarios.

No se ha automatizado el borrado ni la atención de ese buzón. No se ha certificado la razón social en SUNAT, la inscripción de bancos de datos, ni las condiciones contractuales de proveedores/transferencias internacionales; el responsable debe revisar que la política refleja su operación antes de publicarla.

## Validación de esta entrega

19 pruebas automatizadas aprobadas y compilación de producción correcta. Se comprobó en navegador local la página de privacidad, su enlace y la independencia de las dos casillas, manteniendo las imágenes del evento. Apps Script confirmó preparación de hoja y publicación de versión 3. No se añadieron inscripciones ficticias a la hoja real en esta actualización. La prueba de extremo a extremo del nuevo formulario público queda para después de tu despliegue.
