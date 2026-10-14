# CONSEVIA · Inscripciones al lanzamiento

Aplicación construida con React, TypeScript, Tailwind y Vite. Almacenamiento exclusivo en Google Sheets, mediante Google Apps Script. Servidor compatible con Vercel (principal) y Netlify. No requiere inicio de sesión del participante.

## Estado de esta entrega

Formulario terminado y conexión real con Google Sheets comprobada el 13 de octubre de 2026. Apps Script está publicado y autorizado en `neslabproyectos@gmail.com`. `setupSheet` terminó correctamente; existe la pestaña `CONSEVIA_INSCRIPCIONES` con 18 columnas. Se envió una inscripción ficticia y el mismo ID se reintentó; se confirmó una sola fila. Se verificó la fecha/hora de Perú y el servidor recibió el acuse de guardado real.

La fila “PRUEBA TÉCNICA CONSEVIA — NO ES INSCRIPCIÓN” se conserva como evidencia, no es un participante. La pestaña original “Hoja 1” no se modificó.

La publicación en Vercel la realizará el organizador. Debe subir el proyecto completo, incluida `api`, y configurar las variables descritas en `VERCEL_CONFIG.md`. La clave real está en las propiedades de Google y en el `.env` privado local; no se incluye en el ZIP. La política de privacidad sigue pendiente, por lo que el formulario público permanece deshabilitado hasta su aprobación y configuración. No existe todavía una URL de Vercel verificada.

## Vista previa local

Requiere Node.js 22 o superior.

```sh
npm ci
npm run dev
```

Abrir http://localhost:5173. Sin `.env` se muestra el formulario, pero no se admiten inscripciones. Para probar con Google real, copiar `.env.example` a `.env`, completar las variables y usar `PUBLIC_ORIGIN=http://localhost:5173`.

```sh
npm test
npm run build
```

`npm run preview` sirve solamente la compilación estática: no ejecuta la API. Usar `npm run dev` para la prueba completa local.

## 1. Crear la hoja de Google Sheets

1. Iniciar sesión en Google con `neslabproyectos@gmail.com`.
2. Crear una hoja desde https://sheets.google.com y llamarla `CONSEVIA_INSCRIPCIONES`.
3. Dejar el archivo privado. No compartirlo con “cualquier persona con el enlace”. Dar acceso solo a organizadores que lo necesiten.
4. Copiar el identificador de la URL: `https://docs.google.com/spreadsheets/d/IDENTIFICADOR/edit`.
5. En la hoja, abrir **Extensiones → Apps Script**.

## 2. Configurar Apps Script

1. Reemplazar el contenido de `Code.gs` por el archivo completo `apps-script/Code.gs` de este proyecto. Ya contiene las reglas de validación; no copiar únicamente `handler.gs`.
2. En **Configuración del proyecto**, activar la visualización del manifiesto `appsscript.json`. Reemplazarlo por el archivo suministrado. Su zona horaria es `America/Lima`.
3. Generar dos secretos distintos de forma local (ejecutar dos veces):

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

   El primero se usa como `WRITE_SECRET` en Google y `APPS_SCRIPT_SECRET` en Vercel. El segundo como `FORM_TOKEN_SECRET` solo en Vercel. No enviar secretos por WhatsApp ni añadirlos al repositorio.

4. En **Propiedades del script**, añadir:

   | Propiedad        | Valor                                      |
   | ---------------- | ------------------------------------------ |
   | `SPREADSHEET_ID` | Identificador del archivo de Google Sheets |
   | `WRITE_SECRET`   | Primer secreto generado                    |

5. Seleccionar la función `setupSheet` y pulsar **Ejecutar**. Autorizar el acceso a la hoja con la cuenta del organizador. La función crea la pestaña y los 18 encabezados y configura la zona horaria de Perú. Nunca borra filas existentes; si encuentra encabezados diferentes, detiene la configuración.
6. Pulsar **Implementar → Nueva implementación → Aplicación web**.
7. Configurar **Ejecutar como: Yo** y **Quién tiene acceso: Cualquier persona**. Este permiso corresponde al endpoint de Apps Script, no a la hoja. Cada escritura exige el secreto que solo conoce el servidor. El endpoint no permite consultar registros.
8. Autorizar y copiar la URL terminada en `/exec`, no `/dev`.
9. Al modificar Apps Script, actualizar la implementación a una **nueva versión**. Guardar el código en el editor por sí solo no actualiza la aplicación publicada.

Si la organización impide Apps Script accesible a cualquier persona, solicitar al administrador que permita la implementación. No publicar la hoja como alternativa.

## 3. Política de privacidad y marca

Antes de habilitar el formulario, el organizador debe proporcionar una política revisada y accesible por HTTPS. Debe identificar al responsable y sus canales de contacto, el uso de los datos para la inscripción, conservación, destinatarios/proveedores y el mecanismo de ejercicio de derechos. Esta entrega no inventa una política ni acredita su cumplimiento legal.

Configurar `PRIVACY_URL` con la URL definitiva y `PRIVACY_APPROVED=true` solo tras su revisión. No usar como política una URL vacía, de ejemplo o ajena al evento. Si se dispone del logotipo oficial, colocar el archivo en `public/` y configurar `VITE_LOGO_URL=/logo-oficial.png` antes de compilar. En su ausencia se muestra únicamente el nombre CONSEVIA en texto; la imagen de presentación proporcionada por el organizador se muestra completa y no se utiliza como un logotipo independiente.

## 4. Publicar en Vercel

1. Iniciar sesión en https://vercel.com con la cuenta que alojará el formulario.
2. Crear un repositorio privado con el contenido de esta carpeta (sin `node_modules`, `dist` ni `.env`). Importarlo en Vercel con **Add New → Project**. Seleccionar **Vite**. Si se carga dentro de otro repositorio, indicar esta carpeta como **Root Directory**.
3. Configurar Node.js 22 o una versión LTS compatible. El comando es `npm run build` y la salida `dist`; `vercel.json` ya incluye la API y los encabezados de seguridad.
4. Añadir estas variables para el entorno **Production** (y **Preview** solo si se va a probar allí):

   | Variable             | Valor                                                                                    |
   | -------------------- | ---------------------------------------------------------------------------------------- |
   | `APPS_SCRIPT_URL`    | URL `/exec` del paso anterior                                                            |
   | `APPS_SCRIPT_SECRET` | Exactamente el `WRITE_SECRET` de Google                                                  |
   | `FORM_TOKEN_SECRET`  | Segundo secreto, mínimo 32 caracteres                                                    |
   | `PUBLIC_ORIGIN`      | Origen público definitivo, por ejemplo `https://nombre-real.vercel.app`, sin barra final |
   | `PRIVACY_URL`        | Enlace HTTPS a la política aprobada                                                      |
   | `PRIVACY_APPROVED`   | `true` después de la revisión                                                            |

5. Desplegar. Vercel proporcionará la URL real. Si no se conocía antes, actualizar `PUBLIC_ORIGIN` con esa URL y **volver a desplegar**. Un dominio de vista previa distinto será rechazado hasta configurarlo como origen de ese entorno.
6. Revisar que **Deployment Protection** permita acceso público a Production; los invitados no deben iniciar sesión. Usar el enlace estable de producción con HTTPS.
7. Ejecutar la prueba real del apartado 6. Solo entonces compartir el enlace.

Alternativa por terminal autenticado:

```sh
npx vercel login
npx vercel
# Configurar variables en el proyecto enlazado; después:
npx vercel --prod
```

La autenticación la realiza el propietario. No incluir tokens de Vercel en el código ni en el navegador.

## 5. Netlify (alternativa)

Importar el mismo repositorio, usar `npm run build`, publicación `dist` y Node.js 22. `netlify.toml` enruta la API a la función suministrada. Configurar las mismas variables, con el origen de Netlify, y volver a desplegar. No usar una carga de `dist` mediante arrastrar y soltar: se necesita desplegar también la función del servidor.

## 6. Prueba real obligatoria antes de compartir

Estas comprobaciones requieren cuentas y conexión reales; las pruebas automatizadas con simulaciones no las sustituyen.

1. Abrir el enlace de producción en modo incógnito y en un celular.
2. Confirmar que se puede leer la política aprobada y que el botón está habilitado.
3. Intentar enviar vacío: se muestran campos obligatorios y no se escribe una fila.
4. Probar celular incompleto, uno que no comienza con 9 y correo sin formato correcto.
5. Elegir profesión “Otro”: debe aparecer el campo adicional obligatorio.
6. Elegir “Sí”: deben aparecer establecimiento, tipo y distrito obligatorios. Probar “Otra localidad”. Elegir “No”: deben ocultarse; no se almacenarán valores ocultos.
7. Registrar datos ficticios identificados como prueba, con consentimiento. Confirmar una nueva fila de 18 columnas en Google Sheets y verificar hora/fecha de Perú frente al reloj real.
8. Pulsar dos veces el botón durante el guardado: debe generarse una sola fila.
9. Si se pierde la respuesta, reintentar **en la misma página con los mismos datos**: el identificador se conserva y no se añade otra fila. Recargar inicia otra inscripción; no es deduplicación por persona o correo.
10. Probar una clave incorrecta en un entorno de prueba: debe mostrarse error, nunca éxito. Restaurar la clave después.
11. Revisar en iPhone y Android reales y en tablet. Las comprobaciones con un navegador pequeño no acreditan todas las plataformas.
12. Eliminar manualmente únicamente las filas de prueba identificadas, sin tocar los encabezados ni datos reales.

## 7. Descargar Excel y compartir por WhatsApp

En Google Sheets: **Archivo → Descargar → Microsoft Excel (.xlsx)**. No hay botón adicional en el formulario.

Después de comprobar la URL real, copiarla en WhatsApp con un texto como:

> Te invitamos al lanzamiento de CONSEVIA. Registra tu participación aquí: [pegar enlace de producción verificado].

## Funcionamiento y límites

El navegador llama a `/api/registration` del mismo sitio. El servidor valida origen, datos, firma temporal (mínimo 3 segundos, máximo 2 horas), trampa para bots y consentimiento; envía a Apps Script con el secreto privado. Apps Script vuelve a validar, toma un bloqueo de escritura, busca el ID antes de añadir una fila y confirma la escritura después de `SpreadsheetApp.flush()`.

Fecha y hora se calculan en Google, con `America/Lima`. Celdas de texto que puedan interpretarse como fórmulas se neutralizan. No se devuelve ninguna fila, ni datos de participantes, ni claves al navegador. No se registran cuerpos de solicitud en logs de la aplicación.

La protección antispam es básica: campo trampa, tiempo mínimo, origen y límite aproximado de cinco registros por diez minutos mediante caché de Apps Script y una huella del origen. La caché de Google puede expirar antes; el límite no es una defensa absoluta. Una red compartida puede alcanzar el límite entre varios asistentes. Para el evento se puede ajustar el límite en `handler.gs` y regenerar `Code.gs`. No hay CAPTCHA ni servicios adicionales.

Google Apps Script y Vercel aplican sus propias cuotas. Un error de cuota, permiso o red devuelve un fallo recuperable y no se presenta como inscripción exitosa. No se guarda información clínica.

## Archivos principales

- `src/main.tsx`: formulario y estados de validación, envío y confirmación.
- `src/styles.css`: diseño responsive.
- `shared/validation.js`: reglas compartidas de cliente, servidor y Apps Script.
- `server/service.mjs`: servidor sin credenciales públicas.
- `api/registration.js`: entrada de Vercel.
- `apps-script/Code.gs`: archivo completo listo para copiar en Google.
- `tests/registration.test.mjs`: pruebas locales de validación, protección, recibos y escritura simulada.

Después de cambiar `shared/validation.js` o `apps-script/handler.gs`, ejecutar `npm run gas:build` y actualizar la implementación de Google.

Referencias oficiales: [Apps Script Web Apps](https://developers.google.com/apps-script/guides/web), [Vercel Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js), [INEI: 43 distritos de Lima y 7 del Callao](https://www.gob.pe/institucion/inei/noticias/536100-cerca-de-10-millones-de-personas-viven-en-lima-metropolitana).

## Imagen de marca proporcionada

`public/consevia-presentacion.png` contiene la imagen entregada por el organizador, sin alteraciones. Se muestra completa en la presentación, con proporción 3:2 y sin recortar el producto, el logotipo ni los textos. La interfaz usa azul marino, rosa y violeta inspirados en esa imagen. En celulares, la imagen se ubica antes del formulario; la información de inscripción permanece en texto accesible.

## Hoja seleccionada para la conexión

El organizador proporcionó [esta hoja de Google Sheets](https://docs.google.com/spreadsheets/d/1CFRPtNyyhpmA8kvR7uVb28ui2sl2pd_CJhv9jS2p7Xc/edit). El archivo `apps-script/Code.gs` ya tiene su identificador como destino predeterminado. La propiedad `SPREADSHEET_ID` permite cambiarlo; para este archivo se puede omitir. `WRITE_SECRET` sigue siendo obligatoria y no se incluye en el código.

El enlace de una hoja no sustituye la URL de Apps Script `/exec`. `APPS_SCRIPT_URL` debe completarse después de implementar Apps Script y autorizarlo con la cuenta propietaria. El destino configurado todavía no acredita acceso, encabezados compatibles ni escritura real.

## Proyecto de Apps Script vinculado

El código se ha cargado y guardado en [CONSEVIA · Registro al lanzamiento](https://script.google.com/u/0/home/projects/1bVrmHmSaJtG95SIDl7BF6jSe4Z8gEtT3jITaKOD-EeIkEfJZuTh1XkGU/edit), desde la cuenta propietaria. La zona horaria del proyecto es Lima. `setupSheet` genera `WRITE_SECRET` en las propiedades de Google si todavía no existe, sin incluirlo en el código fuente ni en el navegador público. El siguiente paso es autorizar y ejecutar la configuración e implementar el endpoint web. El guardado del código no equivale a una integración activa.

## Actualización: integración comprobada

La autorización y la implementación ya se completaron. Las notas anteriores que describen estos pasos como pendientes corresponden al estado previo. La guía de variables de Vercel contiene la URL definitiva `/exec`. Ver `PRUEBAS.md` para los resultados de Google real.
