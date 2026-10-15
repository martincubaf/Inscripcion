# Verificación de la entrega

Fecha: 13 de octubre de 2026.

## Ejecutado localmente

- Compilación TypeScript y producción Vite: aprobada.
- Diez pruebas automatizadas con `node --test`: aprobadas.
- Celular de nueve dígitos que comienza con 9, con y sin `+51`; valores inválidos rechazados.
- Correo, obligatorios, consentimiento y opciones permitidas.
- Campos condicionales “Otro”, atención de pacientes y “Otra localidad”.
- Campos ocultos del establecimiento descartados al responder “No”.
- Bloqueo de envíos con origen incorrecto, firma inválida, tiempo insuficiente o trampa antispam completada.
- No se muestra éxito si falta un recibo válido, el ID no coincide o ocurre un error de red/escritura.
- Apps Script ejecutado en un entorno simulado con APIs de Google sustituidas: 18 columnas, hora Perú, validación, clave, bloqueo, deduplicación y neutralización de fórmulas.

## Ejecutado en navegador

Navegador integrado de Codex, con ancho de 390 píxeles:

- No hay desbordamiento horizontal: ancho de página = ancho de viewport = 390 px.
- Elegir profesión “Otro” muestra el campo adicional.
- Elegir “Sí” muestra establecimiento, tipo, dirección, distrito y referencia.
- Elegir “Otra localidad” muestra ubicación; elegir “No” oculta los campos del establecimiento.
- Un formulario vacío muestra errores y no envía.

En un servidor local exclusivo de pruebas, con almacenamiento simulado en memoria:

- Doble clic en confirmar: 1 solicitud y 1 registro simulado.
- Se simuló pérdida de respuesta después del guardado: se mostró error, sin confirmación de éxito.
- Reintento en la misma página: 2 solicitudes totales, 1 registro simulado, mismo ID; éxito solo después del recibo confirmado.

El servidor de prueba es un archivo de trabajo externo al proyecto entregado. No forma parte del despliegue.

## Pendiente de acceso del propietario

- Crear y autorizar Apps Script en Google.
- Guardar una inscripción en Google Sheets real y revisar la fila.
- Verificar hora/fecha de Perú con el reloj real y exportar Excel.
- Configurar y desplegar en Vercel, comprobar HTTPS y acceso sin iniciar sesión.
- Recibir y publicar la política de privacidad aprobada.
- Pruebas en iPhone y Android físicos y tablet.

La compilación y las simulaciones no acreditan la integración con una cuenta real. No se ha emitido ni verificado una URL pública.

## Actualización de identidad visual

Se incorporó la imagen proporcionada por el organizador, completa y sin modificar, en `public/consevia-presentacion.png`. La compilación de producción volvió a aprobarse. Se revisaron capturas del sitio a 1366 px y 390 px. La imagen se cargó correctamente (1536 × 1024 px de origen), mantuvo su proporción y no hubo desbordamiento horizontal. La API continúa sin habilitar inscripciones hasta completar la configuración real.

## Configuración en la cuenta real de Google

Se confirmó acceso al archivo seleccionado con `neslabproyectos@gmail.com`, se nombró el archivo `CONSEVIA_INSCRIPCIONES` y se creó su proyecto vinculado de Apps Script. Se cargó el código completo y se comprobó que coincidía con la fuente local; Google confirmó su guardado. Se guardó el manifiesto con zona horaria America/Lima, V8 y permiso de hojas de cálculo. El organizador autorizó la configuración de la app web como su cuenta y acceso Cualquiera. La implementación está detenida en el consentimiento de Google, con el botón Autorizar acceso. No se ha ejecutado setupSheet, no hay URL /exec confirmada y todavía no se ha escrito un registro real.

La suite local ahora contiene 11 pruebas aprobadas, incluyendo que la configuración genera la clave solo una vez y conserva la hoja seleccionada.

## Integración real completada

El 13 de octubre de 2026 se confirmó la implementación de Apps Script, se ejecutó `setupSheet` sin errores y se verificó que la hoja sigue privada. Se probó el endpoint real con un registro ficticio: dos solicitudes devolvieron `ok: true`, `saved: true` y el mismo ID. Se leyó mediante la interfaz de Sheets el rango A1:R4: 18 columnas, una única fila y las restantes vacías. La fecha 2026-10-13 y la hora 16:11:27 se contrastaron con el instante UTC de la petición y el huso -05:00 de Perú. Google rechazó clave incorrecta y celular inválido. Se comprobó también el servidor de la aplicación contra Google real, usando el mismo ID y una configuración exclusiva de prueba, sin habilitar públicamente las inscripciones.

Pendiente: política aprobada, publicación del organizador en Vercel y prueba desde el dominio definitivo. No se modificaron los datos de la pestaña original. La fila técnica se dejó claramente identificada para revisión.

## Corrección de origen — 14 de octubre de 2026

Se corrigió la comparación estricta que bloqueaba el alias de main. La suite local pasa 14 pruebas: ambos dominios conocidos funcionan con cualquiera de los dos configurado como PUBLIC_ORIGIN; se rechazan dominios ajenos, imitaciones, puertos/protocolos distintos y origen ausente. Se normalizan espacios y barra final en la configuración. La compilación de producción pasó. La corrección de origen todavía no se ha aplicado al despliegue del usuario ni se ha verificado en ese dominio actualizado.
