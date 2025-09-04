# Portal de Adopciones - Documentación

## Código fuente
El código fuente principal de la aplicación se encuentra en los siguientes archivos:
- `main.html`: Estructura y contenido de la página web.
- `estilo.css`: Estilos visuales y diseño responsivo.
- `func.js`: Lógica de interacción y manejo dinámico de las secciones.

## Decisiones de diseño importantes

- **Secciones ocultas y dinámicas:** Se implementaron varias secciones (`listado`, `detalle`, `formulario-adopcion`, `estadisticas`, etc.) que están ocultas al cargar la página y se muestran solo cuando el usuario interactúa con los botones correspondientes. Esto permite una experiencia de usuario más fluida y evita recargar la página.

- **Validación personalizada:** El formulario de adopción utiliza validaciones personalizadas en JavaScript para asegurar que los datos ingresados sean correctos antes de permitir el envío. Se evita la validación automática del navegador para tener mayor control sobre los mensajes y el flujo.

- **Accesibilidad y usabilidad:** Se agregaron identificadores únicos a los elementos interactivos y se usaron modales accesibles para confirmaciones y visualización de imágenes ampliadas.


## Consideraciones para la corrección
- Las secciones ocultas se activan dinámicamente, por lo que es normal que no se vean al cargar la página hasta que el usuario interactúe.
- Los datos de ejemplo y las imágenes están pensados para mostrar la funcionalidad y pueden ser reemplazados por información real (quiza mas adelante)

