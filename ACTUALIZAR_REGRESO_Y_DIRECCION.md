# Regreso desde privacidad y dirección obligatoria

Extrae este ZIP sobre la raíz del repositorio, conservando sus carpetas, y haz el commit para publicar en Vercel. Debes subir el archivo nuevo `src/draft.js` junto con los demás; no basta con reemplazar `main.tsx`.

Cambios: borrador temporal en la sesión de la pestaña para recuperar lo escrito al regresar de la política o recargar; dirección obligatoria cuando atiende pacientes; política actualizada para reflejar ambos cambios. No se usa almacenamiento permanente. El borrador se elimina después del registro confirmado y se descarta al recuperarlo tras dos horas sin actualizarlo.

Google ya tiene la versión 4 de la misma implementación, con dirección obligatoria. Conserva URL y claves actuales. No requiere otra hoja ni columnas nuevas.

Esta corrección todavía necesita tu commit/despliegue en Vercel. Después abre el enlace público, llénalo parcialmente, lee la política y vuelve: los valores deben conservarse. La casilla publicitaria debe mantener la elección anterior. Si eliges que atiende pacientes, la dirección es obligatoria. No se exige dirección a quienes eligen «No».

22 pruebas automatizadas aprobadas y compilación correcta. Se comprobó el recorrido real en la vista previa local sin crear registros en Google.
