# Variables para Vercel

La integración con tu Google Sheets ya está publicada y probada. Para desplegar el formulario, sube el proyecto completo con su carpeta `api` y configura estas variables de **Production**:

| Variable | Valor |
|---|---|
| `APPS_SCRIPT_URL` | `https://script.google.com/macros/s/AKfycbxHBmoFLxz-cV9XCzKj4aV_nGaCIwUF-enIY6APKNkB_NVg4_c2etgeGUS5bIB62rqB/exec` |
| `APPS_SCRIPT_SECRET` | El valor de `WRITE_SECRET` en las propiedades del proyecto de Google |
| `FORM_TOKEN_SECRET` | Un secreto distinto, mínimo 32 caracteres. Ya generado en el `.env` privado local |
| `PUBLIC_ORIGIN` | `https://inscripcion-nine.vercel.app` |
| `PRIVACY_URL` | URL HTTPS de la política de privacidad aprobada de CONSEVIA |
| `PRIVACY_APPROVED` | `true` solo después de revisar y publicar esa política |

Los dos secretos reales están en el archivo `.env` local del proyecto. Ese archivo es privado y no está en el ZIP: no lo subas a GitHub, no uses el prefijo `VITE_` para sus variables y no lo coloques dentro de `public`.

Si no tienes acceso al `.env` local, `WRITE_SECRET` se puede copiar desde **Configuración del proyecto → Propiedades de las secuencias de comandos** en Google. Genera un secreto independiente para `FORM_TOKEN_SECRET` con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.

Cuando tengas el dominio real, configura `PUBLIC_ORIGIN` y vuelve a desplegar. Hasta completar las seis variables, el botón de inscripción estará deshabilitado. La política de privacidad no se ha inventado ni aprobado automáticamente.

El endpoint de Apps Script es técnico: abrirlo directamente muestra `METHOD_NOT_ALLOWED`, porque los registros se envían mediante POST desde el servidor. No es el enlace que se comparte con participantes.

## Diagnóstico del botón deshabilitado

Se consultó el despliegue `https://inscripcion-nine.vercel.app/api/registration`: respondió `ready: false` y `privacyUrl` vacío. Esto confirma que la configuración de producción no está completa y no tiene una URL de política de privacidad. No permite determinar públicamente qué secretos faltan, ya que el servidor no los revela.

Configura las seis variables para **Production** y realiza un **Redeploy**. Usa `PRIVACY_APPROVED=true` solo con una política aprobada y publicada por HTTPS. Al terminar, vuelve a abrir el formulario o recarga su página. El botón se habilita cuando el servidor devuelve `ready: true`. Marcar la casilla de consentimiento no sustituye estas variables.

## Corrección del alias de main — 14 de octubre de 2026

El nuevo `server/service.mjs` acepta los dos dominios exactos de este proyecto: `https://inscripcion-nine.vercel.app` y `https://inscripcion-git-main-neslab.vercel.app`, cuando uno de ellos está configurado en `PUBLIC_ORIGIN`. La variable puede mantenerse en el dominio principal. Es necesario subir el archivo actualizado y desplegar ese código; un Redeploy de la versión anterior conserva el error. Se siguen rechazando otros dominios de Vercel y nombres parecidos.
