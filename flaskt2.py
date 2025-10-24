from flask import Flask, render_template, request, redirect, url_for, jsonify
import mysql.connector
import os
import json
from datetime import datetime
from werkzeug.utils import secure_filename
import traceback

# DB config (usar conexión por-request para evitar conexiones cerradas)
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'pass',
    'database': 'tarea2'
}

def get_db_conn():
    return mysql.connector.connect(**DB_CONFIG)

# Ejecutar desde la carpeta del proyecto (Tarea 3). Configuramos Flask
# para usar la carpeta actual como plantilla y para servir archivos estáticos
# desde la misma carpeta.
app = Flask(__name__, template_folder='.', static_folder='.', static_url_path='')

# Configura tu conexión a MySQL
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="pass",
    database="tarea2"
)

# Carpeta para subir fotos (se guarda en ./uploads dentro de la carpeta actual)
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_CONTACTS = {
    'Whatsapp': 'whatsapp', 'Telegram': 'telegram', 'X': 'X',
    'Instagram': 'instagram', 'Tiktok': 'tiktok', 'Otro': 'otra'
}

@app.route('/agregar', methods=['GET', 'POST'])
def agregar_aviso():
    if request.method == 'POST':
        # Leer campos del formulario.
        comuna_val = request.form.get('comuna', '').strip()
        sector = request.form.get('sector', '').strip()
        nombre = request.form.get('nombre', '').strip()
        email = request.form.get('email', '').strip()
        celular = request.form.get('celular', '').strip()
        tipo = request.form.get('tipo', '').strip().lower()
        try:
            cantidad = int(request.form.get('cantidad') or 0)
        except ValueError:
            cantidad = 0
        try:
            edad = int(request.form.get('edad') or 0)
        except ValueError:
            edad = 0
        unidad_edad = request.form.get('unidad_edad', '').strip().lower()
        descripcion = request.form.get('descripcion', '').strip()
        fecha_entrega_raw = request.form.get('fecha_entrega', '').strip()

        # Normalizar unidad_medida: usar 'm' para meses, 'a' para años
        unidad_medida = 'm' if 'mes' in unidad_edad else 'a'

        # Preparar fecha_entrega si es que en formato compatible MySQL
        fecha_entrega = None
        if fecha_entrega_raw:
            # si viene en formato datetime-local: 'YYYY-MM-DDTHH:MM'
            fecha_entrega = fecha_entrega_raw.replace('T', ' ') + ':00' if 'T' in fecha_entrega_raw else fecha_entrega_raw

        conn = get_db_conn()
        cursor = conn.cursor()

        # Resolver comuna_id: si el campo es numérico lo usamos como id,
        # si no intentamos buscar por nombre
        comuna_id = None
        try:
            comuna_id = int(comuna_val)
        except Exception:
            if comuna_val:
                cursor.execute("SELECT id FROM comuna WHERE nombre = %s LIMIT 1", (comuna_val,))
                row = cursor.fetchone()
                comuna_id = row[0] if row else None

        if not comuna_id:
            cursor.close()
            conn.close()
            return "Comuna no encontrada", 400

        # Insertar aviso_adopcion
        fecha_ingreso = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        insert_sql = ("""
            INSERT INTO aviso_adopcion (fecha_ingreso, comuna_id, sector, nombre, email, celular, tipo, cantidad, edad, unidad_medida, fecha_entrega, descripcion)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """)
        cursor.execute(insert_sql, (fecha_ingreso, comuna_id, sector, nombre, email, celular, tipo, cantidad, edad, unidad_medida, fecha_entrega, descripcion))
        conn.commit()
        aviso_id = cursor.lastrowid

        # Guardar archivos subidos (aceptamos 'fotos[]' o 'fotos')
        files = request.files.getlist('fotos[]') or request.files.getlist('fotos')
        for f in files:
            if f and f.filename:
                filename = secure_filename(f.filename)
                unique = f"{aviso_id}_{int(datetime.now().timestamp())}_{filename}"
                dest = os.path.join(UPLOAD_DIR, unique)
                f.save(dest)
                ruta_rel = os.path.join('uploads', unique).replace('\\', '/')
                cursor.execute("INSERT INTO foto (ruta_archivo, nombre_archivo, aviso_id) VALUES (%s, %s, %s)", (ruta_rel, filename, aviso_id))
        conn.commit()

        # Guardar contactos (si el formulario envió contactos_json)
        contactos_json = request.form.get('contactos_json', '').strip()
        if contactos_json:
            try:
                contactos_list = json.loads(contactos_json)
                for c in contactos_list:
                    canal = c.get('canal') if isinstance(c, dict) else None
                    valor = c.get('valor') if isinstance(c, dict) else None
                    if canal and valor:
                        # Normalizar canal al valor permitido por el enum y guardar como (nombre, identificador, aviso_id)
                        nombre_enum = ALLOWED_CONTACTS.get(canal, 'otra')
                        cursor.execute("INSERT INTO contactar_por (nombre, identificador, aviso_id) VALUES (%s, %s, %s)", (nombre_enum, valor, aviso_id))
                conn.commit()
            except Exception:
                # Si falla el parseo, no bloqueamos el guardado del aviso
                pass

        cursor.close()
        conn.close()
        return redirect(url_for('portada') + f'?success=1&id={aviso_id}')

    # Si es GET, renderizamos la página principal que contiene el formulario
    return render_template('main.html')


@app.route('/api/regiones', methods=['GET'])
def api_regiones():
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("SELECT id, nombre FROM region ORDER BY nombre")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify([{"id": r[0], "nombre": r[1]} for r in rows])
    except Exception:
        print(traceback.format_exc())
        return jsonify([]), 500


@app.route('/api/comunas', methods=['GET'])
def api_comunas():
    region_id = request.args.get('region_id')
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        if region_id:
            try:
                rid = int(region_id)
                cur.execute("SELECT id, nombre FROM comuna WHERE region_id = %s ORDER BY nombre", (rid,))
            except Exception:
                cur.close(); conn.close()
                return jsonify([])
        else:
            cur.execute("SELECT id, nombre FROM comuna ORDER BY nombre")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify([{"id": r[0], "nombre": r[1]} for r in rows])
    except Exception:
        print(traceback.format_exc())
        return jsonify([]), 500


@app.route('/api/avisos', methods=['GET'])
def api_avisos():
    # paginación: ?page=1 (1-based)
    try:
        page = int(request.args.get('page', '1'))
        if page < 1: page = 1
    except Exception:
        page = 1
    per_page = 5
    offset = (page - 1) * per_page

    try:
        conn = get_db_conn()
        cur = conn.cursor()
        # total
        cur.execute("SELECT COUNT(*) FROM aviso_adopcion")
        total = cur.fetchone()[0]

        # obtener avisos con comuna/region y conteo de fotos y una foto previa
        sql = ("SELECT a.id, a.fecha_ingreso, a.fecha_entrega, a.sector, a.cantidad, a.tipo, a.edad, a.unidad_medida, a.nombre, "
            "c.nombre AS comuna, r.nombre AS region, "
               "(SELECT COUNT(*) FROM foto f WHERE f.aviso_id = a.id) AS total_fotos, "
               "(SELECT ruta_archivo FROM foto f WHERE f.aviso_id = a.id LIMIT 1) AS preview "
               "FROM aviso_adopcion a "
               "JOIN comuna c ON a.comuna_id = c.id "
               "JOIN region r ON c.region_id = r.id "
               "ORDER BY a.fecha_ingreso DESC LIMIT %s OFFSET %s")
        cur.execute(sql, (per_page, offset))
        rows = cur.fetchall()
        avisos = []
        for r in rows:
            unidad = r[7]
            # orden de columnas ahora: id(0), fecha_ingreso(1), fecha_entrega(2), sector(3), cantidad(4), tipo(5), edad(6), unidad_medida(7), nombre(8), comuna(9), region(10), total_fotos(11), preview(12)
            edad_idx = 6
            unidad_idx = 7
            nombre_idx = 8
            comuna_idx = 9
            region_idx = 10
            fotos_idx = 11
            preview_idx = 12
            edad_val = r[edad_idx]
            unidad_val = r[unidad_idx]
            unidad_text = 'años' if unidad_val == 'a' else ('meses' if unidad_val == 'm' else '')
            avisos.append({
                'id': r[0],
                'fecha_publicacion': r[1].strftime('%Y-%m-%d %H:%M:%S') if r[1] else None,
                'fecha_entrega': r[2].strftime('%Y-%m-%d %H:%M:%S') if r[2] else None,
                'sector': r[3],
                'cantidad': r[4],
                'tipo': r[5],
                'edad': edad_val,
                'unidad': unidad_text,
                'nombre_contacto': r[nombre_idx],
                'comuna': r[comuna_idx],
                'region': r[region_idx],
                'total_fotos': int(r[fotos_idx]) if r[fotos_idx] is not None else 0,
                'preview': r[preview_idx]
            })
        cur.close()
        conn.close()
        return jsonify({'total': total, 'page': page, 'per_page': per_page, 'avisos': avisos})
    except Exception:
        print(traceback.format_exc())
        return jsonify({'error': 'server error'}), 500


@app.route('/api/estadisticas/avisos_por_dia', methods=['GET'])
def api_avisos_por_dia():
    """Devuelve la cantidad de avisos agrupados por día para los últimos N días.
    Parámetro opcional: ?days=30 (por defecto 30).
    Respuesta: { days: N, data: [{dia: 'YYYY-MM-DD', total: X}, ...] }
    """
    try:
        try:
            days = int(request.args.get('days', '30'))
        except Exception:
            days = 30
        if days < 1:
            days = 30

        # Limit reasonable
        days = min(days, 365)

        conn = get_db_conn()
        cur = conn.cursor()
        # Usamos fechas desde CURDATE() - INTERVAL (days-1) DAY para incluir hoy
        sql = f"SELECT DATE(fecha_ingreso) AS dia, COUNT(*) FROM aviso_adopcion WHERE fecha_ingreso >= CURDATE() - INTERVAL {days-1} DAY GROUP BY dia ORDER BY dia ASC"
        cur.execute(sql)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        data = []
        for r in rows:
            dia = r[0].isoformat() if hasattr(r[0], 'isoformat') else str(r[0])
            data.append({'dia': dia, 'total': int(r[1])})

        return jsonify({'days': days, 'data': data})
    except Exception:
        print(traceback.format_exc())
        return jsonify({'error': 'server error'}), 500


@app.route('/api/estadisticas/avisos_por_tipo', methods=['GET'])
def api_avisos_por_tipo():
    """Devuelve el total de avisos agrupados por tipo (gato, perro).
    Respuesta: { data: [{tipo: 'gato', total: X}, {tipo: 'perro', total: Y}] }
    """
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("SELECT tipo, COUNT(*) FROM aviso_adopcion GROUP BY tipo")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        data = []
        for r in rows:
            tipo = r[0] if r[0] is not None else 'desconocido'
            data.append({'tipo': tipo, 'total': int(r[1])})
        return jsonify({'data': data})
    except Exception:
        print(traceback.format_exc())
        return jsonify({'error': 'server error'}), 500


@app.route('/api/estadisticas/avisos_por_mes_tipo', methods=['GET'])
def api_avisos_por_mes_tipo():
    """Devuelve conteos mensuales por tipo para los últimos N meses (por defecto 12).
    Respuesta: { months: ["YYYY-MM",...], gato: [...], perro: [...] }
    """
    try:
        try:
            months = int(request.args.get('months', '12'))
        except Exception:
            months = 12
        if months < 1:
            months = 12
        months = min(months, 60)

        # calcular fecha de inicio (primer día del mes hace months-1)
        cur = get_db_conn().cursor()
        # compute start month string
        conn = get_db_conn()
        cur = conn.cursor()
        # start date = first day of month (months-1 ago)
        cur.execute("SELECT DATE_FORMAT(DATE_SUB(DATE_SUB(LAST_DAY(CURDATE()), INTERVAL DAY(LAST_DAY(CURDATE()))-1 DAY), INTERVAL %s MONTH),'%Y-%m-01')", (months-1,))
        row = cur.fetchone()
        start_date = row[0] if row and row[0] else None
        if not start_date:
            start_date = None

        # Query grouped counts by year-month and tipo
        sql = "SELECT DATE_FORMAT(fecha_ingreso, '%Y-%m') AS ym, tipo, COUNT(*) FROM aviso_adopcion WHERE fecha_ingreso >= %s GROUP BY ym, tipo ORDER BY ym ASC"
        cur.execute(sql, (start_date,))
        rows = cur.fetchall()

        # build map ym -> {tipo: count}
        counts = {}
        for r in rows:
            ym = r[0]
            tipo = (r[1] or '').lower()
            cnt = int(r[2])
            if ym not in counts: counts[ym] = {}
            counts[ym][tipo] = cnt

        # generate list of months from start_date up to current month
        from datetime import datetime
        import calendar
        labels = []
        today = datetime.today()
        # compute first year-month from start_date
        if start_date:
            y, m, _ = start_date.split('-')
            y = int(y); m = int(m)
        else:
            y = today.year; m = today.month
        for i in range(months):
            labels.append(f"{y:04d}-{m:02d}")
            m += 1
            if m > 12:
                m = 1; y += 1

        gato_arr = []
        perro_arr = []
        for ym in labels:
            entry = counts.get(ym, {})
            gato_arr.append(int(entry.get('gato', 0)))
            perro_arr.append(int(entry.get('perro', 0)))

        cur.close()
        conn.close()
        return jsonify({'months': labels, 'gato': gato_arr, 'perro': perro_arr})
    except Exception:
        print(traceback.format_exc())
        return jsonify({'error': 'server error'}), 500


@app.route('/api/aviso/<int:aviso_id>', methods=['GET'])
def api_aviso_detail(aviso_id):
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("SELECT a.id, a.fecha_ingreso, a.fecha_entrega, a.sector, a.cantidad, a.tipo, a.edad, a.nombre, a.email, a.celular, a.descripcion, c.id, c.nombre, r.id, r.nombre "
                    "FROM aviso_adopcion a JOIN comuna c ON a.comuna_id = c.id JOIN region r ON c.region_id = r.id WHERE a.id = %s LIMIT 1", (aviso_id,))
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return jsonify({'error': 'not found'}), 404
        aviso = {
            'id': row[0],
            'fecha_ingreso': row[1].strftime('%Y-%m-%d %H:%M:%S') if row[1] else None,
            'fecha_entrega': row[2].strftime('%Y-%m-%d %H:%M:%S') if row[2] else None,
            'sector': row[3],
            'cantidad': row[4],
            'tipo': row[5],
            'edad': row[6],
            'nombre': row[7],
            'email': row[8],
            'celular': row[9],
            'descripcion': row[10],
            'comuna': {'id': row[11], 'nombre': row[12]},
            'region': {'id': row[13], 'nombre': row[14]}
        }

        # fotos
        cur.execute("SELECT ruta_archivo, nombre_archivo FROM foto WHERE aviso_id = %s ORDER BY id", (aviso_id,))
        fotos = [{'ruta': r[0], 'nombre': r[1]} for r in cur.fetchall()]
        # contactos
        cur.execute("SELECT nombre, identificador FROM contactar_por WHERE aviso_id = %s ORDER BY id", (aviso_id,))
        contactos = [{'nombre': r[0], 'identificador': r[1]} for r in cur.fetchall()]
        # comentarios (si existe la tabla comentario en el esquema)
        comentarios = []
        try:
            # la tabla `comentario` usa la columna `fecha` (según tabla SQL), por eso la seleccionamos
            cur.execute("SELECT id, nombre, texto, fecha FROM comentario WHERE aviso_id = %s ORDER BY fecha ASC", (aviso_id,))
            comentarios = [{'id': r[0], 'nombre': r[1], 'texto': r[2], 'fecha_ingreso': r[3].strftime('%Y-%m-%d %H:%M:%S') if r[3] else None} for r in cur.fetchall()]
        except Exception:
            # Si la tabla comentario no existe o hay error, lo ignoramos para no romper el detalle
            comentarios = []

        cur.close(); conn.close()
        aviso['fotos'] = fotos
        aviso['contactos'] = contactos
        aviso['comentarios'] = comentarios
        return jsonify(aviso)
    except Exception:
        print(traceback.format_exc())
        return jsonify({'error': 'server error'}), 500

@app.route('/')
def portada():
    # Aquí puedes mostrar la portada y los últimos avisos
    return render_template('main.html')


@app.route('/api/aviso/<int:aviso_id>/comentarios', methods=['POST'])
def api_agregar_comentario(aviso_id):
    """Recibe JSON o form con: nombre, texto
    Valida en servidor (nombre 3-80, texto >=5) e inserta en tabla comentario.
    Responde JSON: { success: True, comentario: { id, nombre, texto, fecha_ingreso } } o { success: False, errors: {...} }
    """
    try:
        data = request.get_json(silent=True) or request.form or {}
        nombre = (data.get('nombre') or '').strip()
        texto = (data.get('texto') or '').strip()

        errors = {}
        if not nombre or len(nombre) < 3 or len(nombre) > 80:
            errors['nombre'] = 'El nombre debe tener entre 3 y 80 caracteres.'
        if not texto or len(texto) < 5:
            errors['texto'] = 'El texto del comentario debe tener al menos 5 caracteres.'

        if errors:
            return jsonify({'success': False, 'errors': errors}), 400

        conn = get_db_conn()
        cur = conn.cursor()
        fecha_ingreso = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        comentario_id = None
        try:
            # insertar en la columna `fecha` según el esquema proporcionado
            cur.execute(
                "INSERT INTO comentario (aviso_id, nombre, texto, fecha) VALUES (%s, %s, %s, %s)",
                (aviso_id, nombre, texto, fecha_ingreso)
            )
            conn.commit()
            comentario_id = cur.lastrowid
        except Exception:
            conn.rollback()
            print(traceback.format_exc())
            return jsonify({'success': False, 'errors': {'server': 'Error al insertar comentario en la base de datos.'}}), 500
        finally:
            try:
                cur.close()
            except Exception:
                pass
            try:
                conn.close()
            except Exception:
                pass

        # devolvemos fecha_ingreso en la respuesta para mantener compatibilidad con el frontend
        return jsonify({'success': True, 'comentario': {'id': comentario_id, 'nombre': nombre, 'texto': texto, 'fecha_ingreso': fecha_ingreso}})
    except Exception:
        print(traceback.format_exc())
        return jsonify({'success': False, 'errors': {'server': 'server error'}}), 500

if __name__ == '__main__':
    app.run(debug=True)