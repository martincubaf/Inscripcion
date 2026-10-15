# CONSEVIA · Inscripciones al lanzamiento

React, TypeScript, Tailwind y Vite, con API de servidor para Vercel o Netlify y almacenamiento en Google Sheets mediante Apps Script.

## Entrega actual · 15 de octubre de 2026

- Presentación e imagen originales, fecha/lugar del evento y botón «Ver programa».
- Política en `/privacidad`, preparada con los datos del organizador: Innovagen Diagnostic Group, RUC 20615552241, laboratorio@innovagen.pe y domicilio confirmado.
- Consentimiento de inscripción obligatorio y publicidad opcional por correo y WhatsApp, desmarcada por defecto.
- Conservación de 30 días desde la inscripción para ambas finalidades. La fecha de vencimiento se registra; el borrado es manual.
- Integración de Google actualizada a versión 3; la hoja conserva A:R y añade S:V para autorizaciones y vencimiento. Registros anteriores no autorizan publicidad.
- 19 pruebas automatizadas y compilación aprobadas. La integración original se comprobó con Google real el 13 de octubre; el nuevo contrato se verificó con simulaciones y publicación de Apps Script. La nueva versión pública requiere el commit/despliegue del organizador.

**Para publicar esta entrega, leer `ACTUALIZAR_PRIVACIDAD.md`.** Incluye el estado exacto de Google, los archivos, las variables de Vercel y las tareas manuales de conservación. No se ha desplegado esta actualización en Vercel desde esta sesión.

## Desarrollo

Node.js 22 o superior:

```sh
npm ci
npm run dev
npm test
npm run build
```

Abrir http://localhost:5173. Se pueden usar `PORT` y `HMR_PORT` para una segunda vista previa. Sin `.env` completo el formulario se muestra, pero no admite inscripciones. `npm run preview` sirve archivos estáticos y no ejecuta la API.

Para integración local, copiar `.env.example` a `.env`, completar secretos privados y configurar el origen de esa vista previa en `PUBLIC_ORIGIN`. No subas `.env` a GitHub ni lo pongas en `public/`. Los secretos nunca usan prefijo `VITE_`.

## Publicación existente

Formulario: https://inscripcion-nine.vercel.app

Hoja privada: https://docs.google.com/spreadsheets/d/1CFRPtNyyhpmA8kvR7uVb28ui2sl2pd_CJhv9jS2p7Xc/edit

Proyecto de Google: https://script.google.com/u/0/home/projects/1bVrmHmSaJtG95SIDl7BF6jSe4Z8gEtT3jITaKOD-EeIkEfJZuTh1XkGU/edit

La API exige `APPS_SCRIPT_URL`, `APPS_SCRIPT_SECRET`, `FORM_TOKEN_SECRET`, `PUBLIC_ORIGIN`, `PRIVACY_URL` y `PRIVACY_APPROVED`. Consultar `VERCEL_CONFIG.md`. Mantén la hoja privada. El endpoint `/exec` usa POST y secreto de servidor; abrirlo en el navegador muestra `METHOD_NOT_ALLOWED` y no consulta registros.

Si necesitas reinstalar Google, copia `apps-script/Code.gs` completo, conserva el manifiesto y las propiedades privadas, ejecuta `setupSheet` y actualiza la implementación a una nueva versión. `setupSheet` crea 22 encabezados o migra de 18 añadiendo S:V; se detiene si hay encabezados incompatibles o datos ajenos en esas columnas. No borra registros. Para el proyecto actual estos pasos ya están realizados.

Después de cambiar validaciones o `handler.gs`, ejecuta `npm run gas:build`. Guardar el código de Google sin actualizar la versión publicada no cambia el endpoint activo.

## Funcionamiento

El navegador llama a `/api/registration` del mismo sitio. La API valida origen, firma temporal, tiempo mínimo, campo trampa, identificador UUID y datos; envía a Google usando una clave privada. Google revalida, toma un bloqueo y deduplica por ID. La API confirma únicamente un recibo guardado que coincida con el ID y la decisión publicitaria del envío.

Al cambiar datos o autorizaciones después de un intento, el formulario crea otro ID. Reintentar en la misma página con los mismos datos conserva el identificador. No se deduplica por persona o correo. Recargar inicia otro registro.

La fecha se calcula en Perú; se neutralizan fórmulas en las celdas. No se devuelven registros ni claves al navegador ni se escriben cuerpos de solicitudes en los logs de la aplicación. El control antispam limita aproximadamente cinco envíos por diez minutos mediante caché; no es una defensa absoluta. Hay cuotas y posibles fallos de Google/Vercel; un error de guardado no se presenta como éxito.

## Archivos

- `src/main.tsx` y `src/styles.css`: interfaz y consentimiento.
- `public/privacidad.html`: texto de política, versión 2026-10-15.
- `public/consevia-presentacion.png` y `public/consevia-programa.png`: imágenes aportadas, completas.
- `shared/validation.js`: reglas y versión de política compartidas.
- `server/service.mjs`: API, confirmación y controles de servidor.
- `api/registration.js`: entrada de Vercel.
- `apps-script/Code.gs`: código completo de Google generado desde validación y `handler.gs`.
- `tests/registration.test.mjs`: pruebas de validación, recibos, migración y escritura simulada.

El evento es el miércoles 28 de octubre de 2026, de 07:00 p. m. a 10:00 p. m., hora de Perú, en Av. Javier Prado Oeste 757, piso 21, Magdalena del Mar, Edificio Securitas.
