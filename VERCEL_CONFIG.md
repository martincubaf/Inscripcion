# Variables para Vercel

La integración con tu Google Sheets ya está publicada y probada. Para desplegar el formulario, sube el proyecto completo con su carpeta `api` y configura estas variables de **Production**:

| Variable | Valor |
|---|---|
| `APPS_SCRIPT_URL` | `https://script.google.com/macros/s/AKfycbxHBmoFLxz-cV9XCzKj4aV_nGaCIwUF-enIY6APKNkB_NVg4_c2etgeGUS5bIB62rqB/exec` |
| `APPS_SCRIPT_SECRET` | El valor de `WRITE_SECRET` en las propiedades del proyecto de Google |
| `FORM_TOKEN_SECRET` | Un secreto distinto, mínimo 32 caracteres. Ya generado en el `.env` privado local |
| `PUBLIC_ORIGIN` | `https://inscripcion-nine.vercel.app` |
| `PRIVACY_URL` | `https://inscripcion-nine.vercel.app/privacidad` después de revisar y subir la política de esta entrega |
| `PRIVACY_APPROVED` | `true` solo después de revisar y publicar esa política |

Los dos secretos reales están en el archivo `.env` local del proyecto. Ese archivo es privado y no está en el ZIP: no lo subas a GitHub, no uses el prefijo `VITE_` para sus variables y no lo coloques dentro de `public`.

Si no tienes acceso al `.env` local, `WRITE_SECRET` se puede copiar desde **Configuración del proyecto → Propiedades de las secuencias de comandos** en Google. Genera un secreto independiente para `FORM_TOKEN_SECRET` con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.

Cuando tengas el dominio real, configura `PUBLIC_ORIGIN` y vuelve a desplegar. Hasta completar las seis variables, el botón de inscripción estará deshabilitado. La política de privacidad no se ha inventado ni aprobado automáticamente.

El endpoint de Apps Script es técnico: abrirlo directamente muestra `METHOD_NOT_ALLOWED`, porque los registros se envían mediante POST desde el servidor. No es el enlace que se comparte con participantes.

## Actualización de privacidad — 15 de octubre de 2026

Leer `ACTUALIZAR_PRIVACIDAD.md`. Google ya está actualizado a versión 3 y conserva su URL y secretos. Publica el código actualizado y la página de privacidad juntos, y configura `PRIVACY_URL` con la ruta `/privacidad`. Conserva las demás variables. La casilla publicitaria es opcional y no habilita ni sustituye la configuración del servidor. La aprobación del texto corresponde al organizador.

## Corrección del alias de main — 14 de octubre de 2026

El nuevo `server/service.mjs` acepta los dos dominios exactos de este proyecto: `https://inscripcion-nine.vercel.app` y `https://inscripcion-git-main-neslab.vercel.app`, cuando uno de ellos está configurado en `PUBLIC_ORIGIN`. La variable puede mantenerse en el dominio principal. Es necesario subir el archivo actualizado y desplegar ese código; un Redeploy de la versión anterior conserva el error. Se siguen rechazando otros dominios de Vercel y nombres parecidos.
