# Group V2 — Guía de mantenimiento y recuperación

Última revisión: 2026-11-14.

## Fuente de verdad
- GitHub: repositorio `groupv2vzla-creator/CalculadoraV2`, rama `main`. El código y los recursos visuales deben versionarse aquí.
- Vercel: proyecto `calculadorav2`, despliegue web. Verificar que el despliegue correspondiente al commit esté en estado READY antes de anunciar una modificación como publicada.
- Supabase: proyecto `xcfjfqaknvbtytdlssnx`; datos y autenticación. El historial de GitHub NO respalda la base de datos.
- Google Drive: opcional, para copias independientes del repositorio, exportaciones de datos y fotos originales. No alojar aquí recursos necesarios en tiempo de ejecución.

## Configuración de imágenes de separadores (importante)
- Las dos miniaturas en `app/page.tsx` deben usar la ruta local `/reference/separadores-foto.svg`.
- El archivo está en `public/reference/separadores-foto.svg`. Contiene una imagen JPEG incrustada dentro de SVG para que GitHub pueda almacenar el recurso como texto UTF-8.
- NO sustituir estas referencias por URLs externas, rutas temporales, ni cadenas Base64 JPEG sin validar: causaron imágenes rotas anteriormente.
- La imagen integrada es una versión reducida; conservar una copia independiente de la fotografía original para futuras mejoras de calidad.
- Al cambiar imágenes, comprobar que las dos miniaturas se vean en la aplicación publicada, tanto en escritorio como en móvil.

## Reglas para cambios
1. Antes de editar, registrar el SHA de la versión que funciona; idealmente crear una etiqueta Git de versión estable.
2. Trabajar en una rama o pull request, ejecutar build y pruebas, revisar cambios y publicar solo después de aprobarlos.
3. Verificar acceso, cuatro selectores de materiales, imágenes, costos de acrílico/MDF, accesorios, margen, ganancia, presupuesto y recuperación de cotizaciones.
4. Confirmar en Vercel el commit exacto y estado READY. Si falla, revertir al commit estable anterior.
5. No guardar contraseñas, claves de servicio ni secretos en GitHub, Drive o este documento. Mantener secretos en las variables de entorno seguras.

## Respaldo y continuidad
- Código: mantener historial Git, etiquetas estables y copia externa periódica del repositorio.
- Datos: programar y probar exportaciones/restauraciones periódicas de Supabase, incluyendo las cotizaciones y esquemas. Confirmar la política de backups del plan contratado.
- Imágenes: guardar originales fuera del repositorio además de las versiones optimizadas para la web.
- Revisar dependencias, dominio, facturación y accesos administrativos periódicamente.

Esta guía documenta el procedimiento; no significa que ya existan backups automatizados, etiquetas estables o pruebas automáticas.
