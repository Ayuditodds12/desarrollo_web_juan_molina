# Proyecto: Portal de Adopciones (Tarea 3)

## Cómo correr (instrucciones rápidas)

Pasos mínimos para ejecutar la aplicación en un entorno Windows (PowerShell). Incluye los comandos que se deben ejecutar, las librerías necesarias y las acciones para preparar MySQL.

Requisitos básicos:
- Python 3.8+ instalado y disponible en PATH.
- MySQL (o MariaDB) instalado y accesible localmente o en un host remoto.
- Acceso a la carpeta del proyecto: `Tarea 3`.

Librerías Python necesarias:
- Flask
- mysql-connector-python (o cualquier otro conector MySQL compatible)
- (opcional) python-dotenv para cargar credenciales desde un `.env`

Comandos (PowerShell) — en la carpeta del proyecto:
```powershell
# Ir a la carpeta del proyecto
cd "C:\Users\juani\Desktop\Tareas Aplicaciones WEB\Tarea 3"

# Crear y activar un entorno virtual
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Actualizar pip e instalar dependencias
python -m pip install --upgrade pip
pip install Flask mysql-connector-python python-dotenv

# fijar versiones en requirements.txt
pip freeze > requirements.txt
```

Preparar la base de datos MySQL

1) Crear la base `tarea2` (si aún no existe). En el cliente mysql o desde PowerShell:
```sql
CREATE DATABASE IF NOT EXISTS tarea2 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2) Importar los esquemas provistos (ajusta usuario/host según corresponda):
```powershell
mysql -u root -p tarea2 < "C:\Users\juani\Desktop\Tareas Aplicaciones WEB\Tarea 3\region-comuna.sql"
mysql -u root -p tarea2 < "C:\Users\juani\Desktop\Tareas Aplicaciones WEB\Tarea 3\tarea2.sql"
mysql -u root -p tarea2 < "C:\Users\juani\Desktop\Tareas Aplicaciones WEB\Tarea 3\tabla-comentario.sql"
```

3) (Opcional) si utilizas `.env`, crea un archivo `.env` con las variables necesarias:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_password
DB_NAME=tarea2
```

Configuración en la aplicación
- El archivo `flaskt2.py` contiene al inicio un diccionario `DB_CONFIG` que por defecto apunta a `localhost`/`root`/`pass` y a la base `tarea2`. Actualiza esos valores manualmente o modifica el código para leer de variables de entorno si se prefiere no dejar credenciales en el fichero.

Ejecutar la aplicación
```powershell
# Con el entorno activado
python flaskt2.py

# Abrir en el navegador
http://127.0.0.1:5000
```

Comprobaciones rápidas
- Verificar que exista la carpeta `uploads/` (el servidor crea la carpeta si no existe) y que el proceso tenga permisos de escritura.
- Usar los endpoints API para probar la API.

Notas sobre entornos Linux/macOS
- Los mismos pasos aplican; sustituir comandos PowerShell por bash. Por ejemplo:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install Flask mysql-connector-python
python flaskt2.py
```

Resumen de archivos
- `main.html`, `func.js`, `estilo.css` — frontend (HTML, JS y CSS).
- `flaskt2.py` — servidor Flask con los endpoints API.
- `tarea2.sql`, `region-comuna.sql`, `tabla-comentario.sql` — esquemas SQL y scripts de creación de tablas.
- `uploads/` — directorio donde se almacenan las fotos subidas (se crea automáticamente al ejecutar la aplicación si no existe).

Requisitos previos
- Python 3.8 o superior.
- Servidor MySQL accesible y con privilegios para crear la base y las tablas.

Instalación y preparación (PowerShell, Windows)
1) Abrir PowerShell en la carpeta del proyecto:
```powershell
cd "C:\Users\juani\Desktop\Tareas Aplicaciones WEB\Tarea 3"
```
2) Crear y activar un entorno virtual:
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```
3) Instalar dependencias Python mínimas:
```powershell
pip install --upgrade pip
pip install Flask mysql-connector-python
pip freeze > requirements.txt
```

Configuración de la base de datos (MySQL)
1) Crear la base de datos `tarea2` si no existe:
```sql
CREATE DATABASE IF NOT EXISTS tarea2 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
2) Importar los esquemas SQL provistos (ajustar usuario/host según corresponda):
```powershell
mysql -u root -p tarea2 < "C:\Users\juani\Desktop\Tareas Aplicaciones WEB\Tarea 3\region-comuna.sql"
mysql -u root -p tarea2 < "C:\Users\juani\Desktop\Tareas Aplicaciones WEB\Tarea 3\tarea2.sql"
mysql -u root -p tarea2 < "C:\Users\juani\Desktop\Tareas Aplicaciones WEB\Tarea 3\tabla-comentario.sql"
```

Configuración de credenciales en la aplicación
- El archivo `flaskt2.py` contiene un diccionario `DB_CONFIG` en su cabecera. Ese bloque debe actualizarse con los valores de `host`, `user`, `password` y `database` del entorno donde se ejecute la aplicación. Alternativamente, se puede modificar el código para leer variables de entorno o usar `python-dotenv`.

Ejecución de la aplicación
1) Con el entorno virtual activado, ejecutar:
```powershell
python flaskt2.py
```
2) Acceder en un navegador a: `http://127.0.0.1:5000`

Descripción de los endpoints principales
- GET `/api/regiones` — lista de regiones.
- GET `/api/comunas?region_id=<id>` — lista de comunas (filtradas opcionalmente por región).
- GET `/api/avisos?page=N` — listado paginado de avisos (5 por página).
- GET `/api/aviso/<id>` — detalle de un aviso; la respuesta JSON incluye `fotos`, `contactos` y `comentarios`.
- POST `/agregar` — recibe el formulario (multipart/form-data) para crear un aviso.
- POST `/api/aviso/<id>/comentarios` — agrega un comentario al aviso (acepta JSON o form-data).
- Estadísticas:
  - GET `/api/estadisticas/avisos_por_dia?days=N`
  - GET `/api/estadisticas/avisos_por_tipo`
  - GET `/api/estadisticas/avisos_por_mes_tipo?months=N`

Cómo probar rápidamente (ejemplos con PowerShell)
```powershell
# Obtener detalle del aviso con id 1 (incluye comentarios)
Invoke-RestMethod 'http://127.0.0.1:5000/api/aviso/1'

# Agregar un comentario al aviso 1
$body = @{ nombre = 'Prueba'; texto = 'Comentario de prueba desde PowerShell' } | ConvertTo-Json
Invoke-RestMethod 'http://127.0.0.1:5000/api/aviso/1/comentarios' -Method Post -Body $body -ContentType 'application/json'
```

Notas de implementación (resumen técnico)
- Listado de comentarios: el endpoint `GET /api/aviso/<id>` obtiene los comentarios asociados a `aviso_id` desde la tabla `comentario` y los incluye en la respuesta JSON como un arreglo `comentarios` con campos `id`, `nombre`, `texto` y `fecha_ingreso`.
- Agregar comentario: el frontend realiza validación mínima en cliente (nombre entre 3 y 80 caracteres; texto al menos 5 caracteres) y envía la información usando `fetch` hacia `POST /api/aviso/<id>/comentarios`. El servidor valida los mismos criterios y persiste el comentario en la tabla `comentario`.
- Gráficos: las representaciones gráficas se generan en el navegador mediante Canvas usando funciones propias en `func.js`. Los datos se obtienen de forma asíncrona desde los endpoints de estadísticas.

Problemas frecuentes y soluciones rápidas
- Error de inserción de comentarios: comprobar que la tabla `comentario` exista y que el `aviso_id` referenciado exista en `aviso_adopcion` (clave foránea).
- Permisos de escritura: si las fotos no se almacenan, verificar permisos de escritura en la carpeta `uploads/`.
- Conexión a la base: si la aplicación no puede conectar a MySQL, revisar las credenciales en `DB_CONFIG` dentro de `flaskt2.py` o configurar variables de entorno.

Recomendaciones y pasos opcionales
- Migrar credenciales a variables de entorno para no dejar secretos en el código fuente.
- Añadir `requirements.txt` si se desea fijar versiones de dependencias (el comando `pip freeze > requirements.txt` ya fue sugerido en la sección de instalación).
- Considerar el uso de una librería de gráficos (por ejemplo Flot o Highcharts) si se requiere funcionalidad avanzada; en ese caso, agregar la dependencia y documentar la licencia en este README.

Ubicación de los archivos principales
- `flaskt2.py`
- `main.html`
- `func.js`

- `estilo.css`
- `tarea2.sql`, `region-comuna.sql`, `tabla-comentario.sql`

Si es necesario adaptar estas instrucciones a otro entorno (Linux, Docker, usuario/host de MySQL distinto), se deberá actualizar las rutas y comandos correspondientes.

