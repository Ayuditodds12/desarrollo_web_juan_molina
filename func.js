// ====== navegación principal ======
const btnAgregar = document.getElementById('agregar');
const btnVerListado = document.getElementById('ver-listado');
const btnVerEstadisticas = document.getElementById('ver-estadisticas');
const seccionAvisos = document.getElementById('avisos');
const seccionFormulario = document.getElementById('formulario-adopcion');
const seccionExito = document.getElementById('exito');
const seccionEstadisticas = document.getElementById('estadisticas');
const btnVolverPortada3  = document.getElementById('volver-portada-3');
document.addEventListener('DOMContentLoaded', () => {
  seccionAvisos.style.display = 'block'; // portada
  seccionFormulario.style.display = 'none';
  seccionExito.style.display = 'none';
});

btnAgregar?.addEventListener('click', () => {
  seccionFormulario.style.display = 'block';
  seccionAvisos.style.display = 'none';
  seccionListado.style.display = 'none'; // <-- oculta listado
  seccionDetalle.style.display = 'none'; // <-- oculta detalle
  seccionExito.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


btnVerEstadisticas?.addEventListener('click', () => {
  // ocultar todo lo demás
  seccionFormulario.style.display = 'none';
  seccionAvisos.style.display     = 'none';
  seccionListado && (seccionListado.style.display = 'none');
  seccionDetalle && (seccionDetalle.style.display = 'none');
  seccionExito.style.display      = 'none';
// ===== Volver a la portada desde estadísticas =============
btnVolverPortada3?.addEventListener('click', () => {
  seccionEstadisticas.style.display = 'none';
  seccionListado && (seccionListado.style.display = 'none');
  seccionDetalle && (seccionDetalle.style.display = 'none');
  seccionFormulario.style.display = 'none';
  seccionExito.style.display      = 'none';
  seccionAvisos.style.display     = 'block';
  // Refrescar portada con los últimos avisos
  fetchUltimosAvisos();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
  // mostrar estadísticas
  seccionEstadisticas.style.display = 'block';
  // Cargar y dibujar las estadísticas (avisos por día)
  fetchEstadisticas();
  // Cargar y dibujar la estadística por tipo (torta)
  fetchEstadisticasTipo();
  // Cargar y dibujar la estadística por mes (barras agrupadas)
  fetchEstadisticasMesTipo();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


// === Referencias del formulario ===================
const formulario = document.getElementById('formulario');
const fotosContainer = document.getElementById('fotos-container');
const btnAgregarFoto = document.getElementById('agregar-foto');

// === Secciones/elementos del listado y detalle (nuevo) ========
const seccionListado = document.getElementById('listado');
const seccionDetalle = document.getElementById('detalle');
const tablaListadoBody = document.getElementById('tabla-listado');
const detalleContenido = document.getElementById('detalle-contenido');
const btnVolverListado = document.getElementById('volver-listado');
const btnVolverPortada2 = document.getElementById('volver-portada-2');

// Modal foto
const modalFoto = document.getElementById('modal-foto');
const imgAmpliada = document.getElementById('img-ampliada');
const btnCerrarFoto = document.getElementById('cerrar-foto');

// Avisos dinámicos (sin datos fijos). Si se desea, el listado puede recuperarse desde /api/avisos
const avisosData = [];

// Modal de confirmación
const modal = document.getElementById('mensaje-confirmacion');
const btnConfirmarSi = document.getElementById('confirmar-si');
const btnConfirmarNo = document.getElementById('confirmar-no');

// Botón volver portada (en pantalla de éxito)
const btnVolverPortada = document.getElementById('volver-portada');

// ===== Fecha disponible: prellenar +3h y fijar mínimo  ===========
const fechaEntregaEl = document.getElementById('fecha-entrega');

function isoLocalPlus(hours) {
  // Convierte "ahora" a ISO local corrigiendo el offset del huso horario
  const tz = new Date().getTimezoneOffset() * 60000; // minutos → ms
  const d  = new Date(Date.now() - tz + hours * 60 * 60 * 1000);
  return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
}

function parseLocal(str) {
  if (!str) return null;
  // Interpreta "YYYY-MM-DDTHH:MM" como hora local
  const [d, t] = str.split('T');
  if (!d || !t) return null;
  const [Y, M, D] = d.split('-').map(Number);
  const [h, m]    = t.split(':').map(Number);
  return new Date(Y, M - 1, D, h, m, 0, 0);
}

function initFechaEntregaPlus3h() {
  if (!fechaEntregaEl) return;
  const minStr = isoLocalPlus(3); // ahora + 3h en local, sin segundos
  fechaEntregaEl.min = minStr; // mínimo permitido
  const cur = fechaEntregaEl.value ? parseLocal(fechaEntregaEl.value) : null;
  if (!cur || cur < parseLocal(minStr)) {
    fechaEntregaEl.value = minStr;  // prellenado si está vacío o es menor al mínimo
  }
}

// Llamar al cargar y al abrir el formulario
document.addEventListener('DOMContentLoaded', initFechaEntregaPlus3h);
btnAgregar?.addEventListener('click', initFechaEntregaPlus3h);


// ====== Contactar por (opcional, máx. 5) ==========.
const selectContactar = document.getElementById('contactar');
const inputContactoId = document.getElementById('contacto-id');
const btnAddContacto   = document.getElementById('add-contacto');
const listaContactos   = document.getElementById('contactos-list');
let contactos = []; // elementos: { canal, id }

function toggleContactoUI() {
  if (!selectContactar || !inputContactoId || !btnAddContacto) return;
  const visible = !!selectContactar.value;
  inputContactoId.style.display = visible ? 'block' : 'none';
  btnAddContacto.style.display  = visible ? 'inline-block' : 'none';
}

function renderContactos() {
  if (!listaContactos) return;
  listaContactos.innerHTML = '';
  contactos.forEach((c, idx) => {
    const li = document.createElement('li');
    li.className = 'contact-chip';
    li.innerHTML = `
      <span><strong>${c.canal}:</strong> ${c.id}</span>
      <button type="button" class="chip-remove" aria-label="Eliminar">×</button>
    `;
    li.querySelector('.chip-remove').addEventListener('click', () => {
      contactos.splice(idx, 1);
      renderContactos();
      // re-habilitar añadir si estaba en 5
      if (btnAddContacto) btnAddContacto.disabled = contactos.length >= 5;
    });
    listaContactos.appendChild(li);
  });
  if (btnAddContacto) btnAddContacto.disabled = contactos.length >= 5;
}

if (selectContactar) {
  selectContactar.addEventListener('change', toggleContactoUI);
  toggleContactoUI();
}
btnAddContacto?.addEventListener('click', () => {
  if (contactos.length >= 5) {
    alert('Solo puedes agregar hasta 5 contactos.');
    return;
  }
  const canal = (selectContactar?.value || '').trim();
  if (!canal) {
    alert('Selecciona un canal.');
    return;
  }
  const id = (inputContactoId?.value || '').trim();
  if (id.length < 4 || id.length > 50) {
    alert('El ID o URL debe tener entre 4 y 50 caracteres.');
    return;
  }
  contactos.push({ canal, id });
  if (selectContactar) selectContactar.value = '';
  if (inputContactoId) inputContactoId.value = '';
  toggleContactoUI();
  renderContactos();
});

// ====== Lógica: agregar foto hasta 5 ======
btnAgregarFoto?.addEventListener('click', () => {
  const inputsActuales = fotosContainer.querySelectorAll('input[type="file"]');
  if (inputsActuales.length >= 5) {
    alert('Solo puedes subir hasta 5 fotografías.');
    return;
  }
  const nuevo = document.createElement('input');
  nuevo.type = 'file';
  nuevo.accept = 'image/*';
  nuevo.name = 'fotos[]';
  nuevo.id = `foto-${inputsActuales.length + 1}`;
  fotosContainer.appendChild(nuevo);
});

// ====== Validaciones auxiliares ========0
function hayAlMenosUnaFotoSeleccionada() {
  const archivos = fotosContainer.querySelectorAll('input[type="file"]');
  for (const input of archivos) {
    if (input.files && input.files.length > 0) return true;
  }
  return false;
}

function totalArchivosSeleccionados() {
  const archivos = fotosContainer.querySelectorAll('input[type="file"]');
  let total = 0;
  archivos.forEach(i => { total += (i.files ? i.files.length : 0); });
  return total;
}

function showModal() {
  modal.classList.add('abierto');
  modal.setAttribute('aria-hidden', 'false');
}

function hideModal() {
  modal.classList.remove('abierto');
  modal.setAttribute('aria-hidden', 'true');
}

// Submit con validación + confirmación 
formulario?.addEventListener('submit', (event) => {
  event.preventDefault();

  // Campos obligatorios
  const region = document.getElementById('region').value.trim();
  const comuna = document.getElementById('comuna').value.trim();
  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const celular = document.getElementById('celular').value.trim();
  const tipo = document.getElementById('tipo').value.trim();
  const cantidad = document.getElementById('cantidad').value;
  const edad = document.getElementById('edad').value;
  const unidadEdad = document.getElementById('unidad-edad').value.trim();
  const fechaEntrega = document.getElementById('fecha-entrega').value;

  const errores = [];

  if (!region) errores.push('Debe seleccionar una región.');
  if (!comuna) errores.push('Debe seleccionar una comuna.');
  if (!nombre || nombre.length < 3) errores.push('El nombre debe tener al menos 3 caracteres.');
  if (!email) errores.push('Debe ingresar un email válido.');
  if (celular && !/^\+\d{3}\.\d{8}$/.test(celular)) {
  errores.push('El celular debe tener formato +NNN.NNNNNNNN (ej: +569.12345678).');
  }  
  // CONTACTAR POR: ahora es OPCIONAL → no se exige seleccionar nada.
  // Si dejó un canal o un ID escrito sin agregarlo a la lista, avisamos:
  const hayCanalPendiente = (selectContactar && selectContactar.value) || (inputContactoId && inputContactoId.value.trim().length > 0);
  if (hayCanalPendiente) {
    errores.push('Pulsa "Agregar contacto" para registrar el canal seleccionado o deja ambos campos vacíos.');
  }
  if (contactos.length > 5) {
    errores.push('Solo puedes agregar hasta 5 contactos.');
  }

  if (!tipo) errores.push('Debe seleccionar el tipo de mascota.');
  const cant = document.getElementById('cantidad').valueAsNumber;
  if (!Number.isFinite(cant) || !Number.isInteger(cant) || cant < 1) {
    errores.push('La cantidad debe ser un entero y ser mayor o igual a 1.');
  }
  const ed = document.getElementById('edad').valueAsNumber;
  if (!Number.isFinite(ed) || !Number.isInteger(ed) || ed < 1) {
    errores.push('La edad debe ser un entero y ser mayor o igual a 1');
  }
  if (!unidadEdad) errores.push('Debe seleccionar la unidad de edad.');

  // Fecha de entrega: requerida y >= min (+3h)
  const fechaEntregaStr = fechaEntregaEl?.value || '';
  if (!fechaEntregaStr) {
    errores.push('Debe indicar una fecha de entrega.');
  } else {
    const escogida = parseLocal(fechaEntregaStr);
    const minimo   = parseLocal(fechaEntregaEl.min);
    if (!escogida || !minimo) {
      errores.push('Fecha de entrega inválida.');
    } else if (escogida < minimo) {
      const legible = fechaEntregaEl.min.replace('T',' ');
      errores.push(`La fecha/hora debe ser mayor o igual a ${legible}.`);
    }
  }


  // Fotos: al menos 1 seleccionada y máximo 5 inputs totales
  const inputsFotos = fotosContainer.querySelectorAll('input[type="file"]');
  if (inputsFotos.length === 0) errores.push('Debe existir al menos un campo de foto.');
  if (!hayAlMenosUnaFotoSeleccionada()) errores.push('Debe seleccionar al menos una fotografía.');
  if (inputsFotos.length > 5) errores.push('Solo se permiten 5 campos de foto como máximo.');
  if (totalArchivosSeleccionados() > 5) {
    errores.push('En total solo se permiten 5 fotografías seleccionadas.');
  }

  if (errores.length > 0) {
    alert('Revisa lo siguiente:\n\n- ' + errores.join('\n- '));
    return;
  }

  // Si todo ok, mostrar modal de confirmación
  showModal();
});

// ===== Acciones del modal ====
btnConfirmarSi?.addEventListener('click', () => {
  hideModal();

  // Antes de enviar, serialize contactos al hidden input
  try {
    const contactosParaEnvio = contactos.map(c => ({ canal: c.canal, valor: c.id }));
    const inputContactos = document.getElementById('contactos_json');
    if (inputContactos) inputContactos.value = JSON.stringify(contactosParaEnvio);
  } catch (e) {
    console.error('Error serializando contactos', e);
  }

  // Enviar el formulario al servidor (POST a /agregar)
  if (formulario) formulario.submit();
});

btnConfirmarNo?.addEventListener('click', () => {
  hideModal();
});

btnVolverPortada?.addEventListener('click', () => {
  seccionExito.style.display = 'none';
  seccionAvisos.style.display = 'block';
  // Refrescar portada con los últimos avisos
  fetchUltimosAvisos();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
// Añade * rojo a labels de campos con required
function marcarObligatorios() {
  // todos los inputs/select/textarea con required dentro del formulario
  const requeridos = document.querySelectorAll('#formulario [required]');
  requeridos.forEach(ctrl => {
    // busca <label for="..."> o un label ancestro
    let label = document.querySelector(`label[for="${ctrl.id}"]`) || ctrl.closest('label');
    if (label && !label.querySelector('.req-asterisk')) {
      const star = document.createElement('span');
      star.className = 'req-asterisk';
      star.setAttribute('aria-hidden', 'true'); // no “lee” el asterisco
      star.textContent = '*';
      label.appendChild(star);
    }
  });
}

marcarObligatorios();
document.addEventListener('DOMContentLoaded', marcarObligatorios);


// Render del listado
function renderListado(){
  if (!tablaListadoBody) return;
  tablaListadoBody.innerHTML = '';
  if (!avisosData || avisosData.length === 0) {
    const trEmpty = document.createElement('tr');
    trEmpty.innerHTML = `<td colspan="7" style="text-align:center; color:#666; padding:1rem">No hay avisos registrados.</td>`;
    tablaListadoBody.appendChild(trEmpty);
    return;
  }
  avisosData.forEach(a => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-aviso-id', String(a.id));
    tr.style.cursor = 'pointer';
    tr.innerHTML = `
      <td>${a.fecha_publicacion || ''}</td>
      <td>${a.fecha_entrega || ''}</td>
      <td>${a.comuna || ''}</td>
      <td>${a.sector || ''}</td>
      <td>${a.cantidad || ''} ${String(a.tipo || '').toLowerCase()} — ${a.edad || ''}${a.unidad ? ' ' + a.unidad : ''}</td>
      <td>${a.nombre_contacto || ''}</td>
      <td>${a.total_fotos || 0}</td>
    `;
    tr.addEventListener('click', () => mostrarDetalle(a.id));
    tablaListadoBody.appendChild(tr);
  });
}


// ==== Cargar regiones/comunas desde backend ========
async function loadRegiones(){
  try{
    const res = await fetch('/api/regiones');
    if (!res.ok) return;
    const list = await res.json();
    const sel = document.getElementById('region');
    if (!sel) return;
    // conservar la primera opción
    sel.querySelectorAll('option:not([value=""])').forEach(n => n.remove());
    list.forEach(r => {
      const opt = document.createElement('option');
      opt.value = String(r.id);
      opt.textContent = r.nombre;
      sel.appendChild(opt);
    });
  }catch(e){ console.error('Error cargando regiones', e); }
}

async function loadComunas(regionId){
  try{
    const sel = document.getElementById('comuna');
    if (!sel) return;
    sel.querySelectorAll('option:not([value=""])').forEach(n => n.remove());
    if (!regionId) return;
    const res = await fetch('/api/comunas?region_id=' + encodeURIComponent(regionId));
    if (!res.ok) return;
    const list = await res.json();
    list.forEach(c => {
      const opt = document.createElement('option');
      opt.value = String(c.id);
      opt.textContent = c.nombre;
      sel.appendChild(opt);
    });
  }catch(e){ console.error('Error cargando comunas', e); }
}

// Inicializar regiones al cargar
document.addEventListener('DOMContentLoaded', () => {
  loadRegiones();
  // Cargar últimos avisos para la portada al iniciar
  fetchUltimosAvisos();
});
 
// Fetch y render para la tabla de portada (últimos 5 avisos)
async function fetchUltimosAvisos(){
  try{
    const res = await fetch('/api/avisos?page=1');
    if (!res.ok) return;
    const data = await res.json();
    const cont = document.getElementById('tabla-avisos');
    if (!cont) return;
    cont.innerHTML = '';
    const avisos = data.avisos || [];
    if (!avisos || avisos.length === 0){
      cont.innerHTML = `<tr class="sin-avisos"><td colspan="7" style="text-align:center; color:#666; padding:1rem">No hay avisos disponibles todavía.</td></tr>`;
      return;
    }
    avisos.forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${a.fecha_publicacion || ''}</td>
        <td>${a.comuna || ''}</td>
        <td>${a.sector || ''}</td>
        <td>${a.cantidad || ''}</td>
        <td>${a.tipo || ''}</td>
        <td>${a.edad || ''}${a.unidad ? ' ' + a.unidad : ''}</td>
        <td>${a.preview ? `<img src="${a.preview}" alt="foto" style="max-width:80px; height:auto">` : ''}</td>
      `;
      cont.appendChild(tr);
    });
  }catch(e){
    console.error('Error cargando últimos avisos', e);
  }
}

// ===== Estadísticas: avisos por día (gráfico de líneas) =====
async function fetchEstadisticas(days=30){
  try{
    const res = await fetch('/api/estadisticas/avisos_por_dia?days=' + encodeURIComponent(days));
    if (!res.ok) throw new Error('Error cargando estadísticas');
    const payload = await res.json();
    const data = payload.data || [];
    const labels = data.map(d => d.dia);
    const values = data.map(d => d.total);
    drawLineChart('chart-avisos-dia', labels, values);
  }catch(e){
    console.error('Error cargando estadísticas', e);
  }
}

function drawLineChart(canvasId, labels, values){
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  // Resize canvas to fit container and account for devicePixelRatio
  const desiredHeight = 300;
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || parseInt(canvas.style.width) || 800;
  const cssH = desiredHeight;
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
  canvas.style.height = cssH + 'px';
  canvas.style.width = cssW + 'px';
  const ctx = canvas.getContext('2d');
  // reset transform then scale for DPR so drawing uses CSS pixels
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(dpr, dpr);
  const W = cssW, H = cssH;
  ctx.clearRect(0,0,W,H);

  // Padding
  const pad = { left: 60, right: 20, top: 20, bottom: 40 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const n = Math.max(1, labels.length);
  const maxVal = Math.max(1, ...(values.length ? values : [0]));

  // Draw axes
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  // y axis
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + plotH);
  // x axis
  ctx.lineTo(pad.left + plotW, pad.top + plotH);
  ctx.stroke();

  // Y ticks and labels
  const yTicks = 5;
  ctx.fillStyle = '#333';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i=0;i<=yTicks;i++){
    const v = Math.round(maxVal * (i / yTicks));
    const y = pad.top + plotH - (plotH * (i / yTicks));
    ctx.strokeStyle = '#e6e6e6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + plotW, y);
    ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.fillText(String(v), pad.left - 8, y);
  }
  // Compute points positions first so X labels can be placed exactly under each point
  const points = [];
  for (let i=0;i<n;i++){
    const vx = n===1 ? pad.left + plotW/2 : pad.left + (i/(n-1))*plotW;
    const vy = pad.top + plotH - (plotH * ( (values[i] || 0) / maxVal ));
    points.push({x:vx, y:vy});
  }

  // X labels (show skipping if too many) — place labels under the computed points
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const step = Math.max(1, Math.ceil(n / 10));
  for (let i=0;i<n;i+=step){
    const x = points[i].x;
    const label = labels[i] ? labels[i].slice(5) : ''; // show MM-DD
    ctx.fillStyle = '#333';
    ctx.fillText(label, x, pad.top + plotH + 6);
  }

  // Draw filled area
  if (points.length>0){
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let p of points) ctx.lineTo(p.x, p.y);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(33,150,243,0.12)';
    ctx.fill();
  }

  // Draw line
  ctx.beginPath();
  ctx.strokeStyle = '#2196F3';
  ctx.lineWidth = 2;
  for (let i=0;i<points.length;i++){
    const p = points[i];
    if (i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);
  }
  ctx.stroke();

  // Draw points
  ctx.fillStyle = '#0D47A1';
  for (let p of points){
    ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
  }
}


// ===== Estadísticas: avisos por tipo (gráfico de torta) =====
async function fetchEstadisticasTipo(){
  try{
    const res = await fetch('/api/estadisticas/avisos_por_tipo');
    if (!res.ok) throw new Error('Error cargando estadísticas por tipo');
    const payload = await res.json();
    const data = payload.data || [];
    const labels = data.map(d => d.tipo);
    const values = data.map(d => d.total);
    drawPieChart('chart-avisos-tipo', labels, values);
  }catch(e){
    console.error('Error cargando estadísticas por tipo', e);
  }
}

// ===== Estadísticas: avisos por mes por tipo (gráfico de barras agrupadas) =====
async function fetchEstadisticasMesTipo(months=12){
  try{
    const res = await fetch('/api/estadisticas/avisos_por_mes_tipo?months=' + encodeURIComponent(months));
    if (!res.ok) throw new Error('Error cargando estadísticas por mes');
    const payload = await res.json();
    const labels = payload.months || [];
    const gato = payload.gato || [];
    const perro = payload.perro || [];
    drawGroupedBarChart('chart-avisos-mes', labels, [ {label:'Gato', data: gato, color:'#66BB6A'}, {label:'Perro', data: perro, color:'#42A5F5'} ]);
  }catch(e){
    console.error('Error cargando estadísticas por mes', e);
  }
}

function drawGroupedBarChart(canvasId, labels, series){
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const desiredHeight = 320;
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || parseInt(canvas.style.width) || 800;
  const cssH = desiredHeight;
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(dpr, dpr);
  const W = cssW, H = cssH;
  ctx.clearRect(0,0,W,H);

  const pad = { left: 60, right: 20, top: 20, bottom: 60 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const n = labels.length;
  const groups = series.length;

  // find max
  let maxVal = 1;
  series.forEach(s => s.data.forEach(v => { if (v > maxVal) maxVal = v; }));

  // axes
  ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad.left, pad.top); ctx.lineTo(pad.left, pad.top+plotH); ctx.lineTo(pad.left+plotW, pad.top+plotH); ctx.stroke();

  // y ticks
  const yTicks = 5; ctx.fillStyle='#333'; ctx.textAlign='right'; ctx.textBaseline='middle';
  for (let i=0;i<=yTicks;i++){ const v = Math.round(maxVal * (i/yTicks)); const y = pad.top+plotH - (plotH*(i/yTicks)); ctx.strokeStyle='#e6e6e6'; ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(pad.left+plotW,y); ctx.stroke(); ctx.fillText(String(v), pad.left-8, y); }

  // x groups: compute group width and bar width
  const groupW = plotW / Math.max(1, n);
  const barGap = 6; // gap between bars in group
  const totalBarGap = (groups-1) * barGap;
  const barW = (groupW - totalBarGap) / groups * 0.9; // slightly smaller

  // draw bars
  for (let i=0;i<n;i++){
    const gx = pad.left + i*groupW;
    for (let s=0;s<groups;s++){
      const val = (series[s].data[i] || 0);
      const bx = gx + s*(barW + barGap) + (groupW - (groups*barW + totalBarGap))/2;
      const bh = plotH * (val / Math.max(1, maxVal));
      const by = pad.top + plotH - bh;
      ctx.fillStyle = series[s].color || '#888';
      ctx.fillRect(bx, by, barW, bh);
      // value label on top
      ctx.fillStyle = '#111'; ctx.textAlign='center'; ctx.textBaseline='bottom'; ctx.fillText(String(val), bx + barW/2, by - 4);
    }
    // x label
    ctx.fillStyle = '#333'; ctx.textAlign='center'; ctx.textBaseline='top';
    const label = labels[i] ? labels[i].slice(5) : labels[i];
    ctx.fillText(label, gx + groupW/2, pad.top + plotH + 6);
  }

  // legend
  const legendX = pad.left; let lx = legendX; const ly = H - 28;
  series.forEach(s => { ctx.fillStyle = s.color; ctx.fillRect(lx, ly, 12, 12); ctx.fillStyle='#111'; ctx.textAlign='left'; ctx.textBaseline='top'; ctx.fillText(s.label + ' (' + (s.data.reduce((a,b)=>a+b,0)||0) + ')', lx+18, ly-2); lx += 140; });
}

function drawPieChart(canvasId, labels, values){
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const desiredHeight = 300;
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || parseInt(canvas.style.width) || 400;
  const cssH = desiredHeight;
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(dpr, dpr);
  const W = cssW, H = cssH;
  ctx.clearRect(0,0,W,H);

  const total = values.reduce((s,v)=>s+v,0) || 1;
  const cx = W/2; const cy = H/2; const radius = Math.min(W,H)/2 - 40;

  // simple palette
  const palette = ['#42A5F5','#FF7043','#66BB6A','#AB47BC','#FFCA28'];

  let start = -Math.PI/2;
  for (let i=0;i<values.length;i++){
    const v = values[i] || 0;
    const angle = (v/total) * Math.PI * 2;
    const end = start + angle;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.fillStyle = palette[i % palette.length];
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fill();

    // label line
    const mid = (start + end) / 2;
    const lx = cx + Math.cos(mid) * (radius + 10);
    const ly = cy + Math.sin(mid) * (radius + 10);
    ctx.beginPath(); ctx.strokeStyle = '#666'; ctx.moveTo(cx + Math.cos(mid)*(radius-6), cy + Math.sin(mid)*(radius-6)); ctx.lineTo(lx, ly); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.textAlign = lx < cx ? 'right' : 'left'; ctx.textBaseline = 'middle';
    const pct = ((v/total)*100).toFixed(0) + '%';
    ctx.fillText((labels[i]||'') + ' ' + pct, lx + (lx < cx ? -6 : 6), ly);

    start = end;
  }

  // legend (bottom)
  const legendX = 10; let ly = H - 18;
  for (let i=0;i<labels.length;i++){
    ctx.fillStyle = palette[i % palette.length];
    ctx.fillRect(legendX + i*120, ly, 12, 12);
    ctx.fillStyle = '#111'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`${labels[i] || ''} (${values[i] || 0})`, legendX + 18 + i*120, ly - 2);
  }
}

// Cuando cambia la región, cargar comunas
const selRegion = document.getElementById('region');
if (selRegion) selRegion.addEventListener('change', (e) => loadComunas(e.target.value));

// NOTE: the paginated version of mostrarListado(page) is defined below and
// is used by the "Ver listado" button. The simple non-paginated variant was
// removed to avoid having duplicate definitions.

// REEMPLAZA tu listener anterior de "ver-listado" por este:
btnVerListado?.addEventListener('click', () => mostrarListado(1));

// Estado de paginación
let listadoState = { page: 1, per_page: 5, total: 0 };

async function fetchListado(page=1){
  try{
    const res = await fetch('/api/avisos?page=' + encodeURIComponent(page));
    if (!res.ok) throw new Error('Error cargando avisos');
    const data = await res.json();
    listadoState.page = data.page;
    listadoState.per_page = data.per_page;
    listadoState.total = data.total;
    avisosData.length = 0; // vaciar
    data.avisos.forEach(a => avisosData.push(a));
    renderListado();
    renderPaginacion();
  }catch(e){
    console.error(e);
    alert('No fue posible cargar el listado de avisos. Revisa la consola.');
  }
}

function renderPaginacion(){
  const cont = document.getElementById('paginacion-listado');
  if (!cont) return;
  cont.innerHTML = '';
  const totalPages = Math.ceil(listadoState.total / listadoState.per_page) || 1;
  const info = document.createElement('span');
  info.textContent = `Página ${listadoState.page} de ${totalPages} — ${listadoState.total} avisos`;
  const btnPrev = document.createElement('button');
  btnPrev.textContent = '« Anterior';
  btnPrev.disabled = listadoState.page <= 1;
  btnPrev.addEventListener('click', () => { if (listadoState.page > 1) fetchListado(listadoState.page - 1); });
  const btnNext = document.createElement('button');
  btnNext.textContent = 'Siguiente »';
  btnNext.disabled = listadoState.page >= totalPages;
  btnNext.addEventListener('click', () => { if (listadoState.page < totalPages) fetchListado(listadoState.page + 1); });
  cont.appendChild(btnPrev);
  cont.appendChild(info);
  cont.appendChild(btnNext);
}

// Mostrar listado (inicio en la página indicada)
function mostrarListado(page=1){
  seccionAvisos.style.display = 'none';
  seccionFormulario.style.display = 'none';
  seccionExito.style.display = 'none';
  seccionDetalle.style.display = 'none';
  seccionEstadisticas.style.display = 'none';
  seccionListado.style.display = 'block';
  fetchListado(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Detalle
function mostrarDetalle(a){
  // si 'a' es un id, pedir detalle al backend
  const id = (typeof a === 'number' || typeof a === 'string') ? a : a.id;
  fetch('/api/aviso/' + encodeURIComponent(id)).then(res => {
    if (!res.ok) throw new Error('No se encontró aviso');
    return res.json();
  }).then(aviso => {
    seccionListado.style.display = 'none';
    seccionAvisos.style.display = 'none';
    seccionFormulario.style.display = 'none';
    seccionExito.style.display = 'none';
    seccionDetalle.style.display = 'block';

    // Render basic info + fotos + contactos + comentarios + formulario de nuevo comentario
    detalleContenido.innerHTML = `
      <div><strong>Fecha publicación:</strong> ${aviso.fecha_ingreso}</div>
      <div><strong>Fecha entrega:</strong> ${aviso.fecha_entrega}</div>
      <div><strong>Región:</strong> ${aviso.region?.nombre || ''}</div>
      <div><strong>Comuna:</strong> ${aviso.comuna?.nombre || ''}</div>
      <div><strong>Sector:</strong> ${aviso.sector}</div>
      <div><strong>Cantidad · tipo · edad:</strong> ${aviso.cantidad} ${aviso.tipo}(s) — ${aviso.edad || ''}${aviso.unidad ? ' ' + aviso.unidad : ''}</div>
      <div class="full"><strong>Nombre contacto:</strong> ${aviso.nombre}</div>
      <div class="full"><strong>Contacto(s):</strong> ${aviso.contactos.map(c=>`${c.nombre || c.canal || ''}: ${c.identificador || c.valor || ''}`).join(' · ')}</div>
      <div class="full"><strong>Descripción:</strong><p>${aviso.descripcion || ''}</p></div>
      <div class="full"><strong>Fotos (${aviso.fotos.length}):</strong></div>
      <div class="fotos-grid full">
        ${aviso.fotos.map((f,i)=> `<img src="${f.ruta}" alt="Foto ${i+1}" data-src="${f.ruta}" class="thumb">`).join('')}
      </div>

      <hr>
      <section id="comentarios-section">
        <h3>Comentarios (${(aviso.comentarios||[]).length})</h3>
        <ul id="comentarios-list"></ul>

        <form id="comentario-form" class="comentario-form" novalidate>
          <h4>Agregar comentario</h4>
          <div id="comentario-errors" style="color:#b00020; display:none; margin-bottom:0.5rem"></div>
          <label for="comentario-nombre">Nombre:</label>
          <input id="comentario-nombre" name="nombre" type="text" minlength="3" maxlength="80" required>
          <label for="comentario-texto">Comentario:</label>
          <textarea id="comentario-texto" name="texto" rows="4" cols="50" minlength="5" required></textarea>
          <div style="margin-top:0.5rem"><button id="agregar-comentario-btn" type="submit">Agregar comentario</button></div>
        </form>
      </section>
    `;

    // activar click en miniaturas de foto
    detalleContenido.querySelectorAll('.thumb').forEach(img => {
      img.addEventListener('click', () => {
        imgAmpliada.src = img.dataset.src;
        modalFoto.classList.add('abierto');
        modalFoto.setAttribute('aria-hidden', 'false');
      });
    });

    // Escapar texto para evitar inyección simple
    function escapeHtml(s){ if (!s) return ''; return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }

    // Helper para añadir un comentario al DOM (sin recargar)
    // increment: si true, incrementa el contador visible en el título; si false, solo añade al listado
    function appendComentarioToList(c, increment = true){
      const ul = document.getElementById('comentarios-list');
      if (!ul) return;
      const li = document.createElement('li');
      li.className = 'comentario-item';
      const fecha = c.fecha_ingreso ? ` <em style="color:#666; font-size:0.9em">(${c.fecha_ingreso})</em>` : '';
      li.innerHTML = `<strong>${escapeHtml(c.nombre)}</strong>${fecha}<div>${escapeHtml(c.texto)}</div>`;
      ul.appendChild(li);
      // actualizar contador solo si se solicita
      if (increment){
        const h3 = document.querySelector('#comentarios-section h3');
        if (h3){
          const cur = parseInt((h3.textContent||'').match(/\d+/)?.[0] || 0, 10);
          h3.textContent = `Comentarios (${cur + 1})`;
        }
      }
    }

    // Rellenar comentarios existentes (desde la respuesta)
  // Poblar los comentarios existentes sin tocar el contador (ya muestra el total devuelto por el backend)
  (aviso.comentarios || []).forEach(c => appendComentarioToList({ nombre: c.nombre, texto: c.texto, fecha_ingreso: c.fecha_ingreso }, false));

    // Manejo del formulario de comentario
    const comentarioForm = document.getElementById('comentario-form');
    if (comentarioForm){
      comentarioForm.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const nombreEl = document.getElementById('comentario-nombre');
        const textoEl = document.getElementById('comentario-texto');
        const errorsEl = document.getElementById('comentario-errors');
        const btn = document.getElementById('agregar-comentario-btn');
        const nombreVal = (nombreEl.value || '').trim();
        const textoVal = (textoEl.value || '').trim();
        const errs = [];
        if (nombreVal.length < 3 || nombreVal.length > 80) errs.push('El nombre debe tener entre 3 y 80 caracteres.');
        if (textoVal.length < 5) errs.push('El comentario debe contener al menos 5 caracteres.');
        if (errs.length){
          errorsEl.style.display = 'block';
          errorsEl.innerHTML = errs.map(e => `<div>• ${escapeHtml(e)}</div>`).join('');
          return;
        }

        // enviar al backend
        try{
          btn.disabled = true;
          errorsEl.style.display = 'none';
          const resp = await fetch('/api/aviso/' + encodeURIComponent(id) + '/comentarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombreVal, texto: textoVal })
          });
          const payload = await resp.json().catch(()=>({}));
            if (resp.ok && payload && payload.success){
            // agregar al DOM (incrementar contador)
            appendComentarioToList(payload.comentario, true);
            // limpiar formulario
            nombreEl.value = '';
            textoEl.value = '';
            errorsEl.style.display = 'none';
          } else if (payload && payload.errors){
            const serverErrs = Object.values(payload.errors || {});
            errorsEl.style.display = 'block';
            errorsEl.innerHTML = serverErrs.map(e => `<div>• ${escapeHtml(e)}</div>`).join('');
          } else {
            errorsEl.style.display = 'block';
            errorsEl.innerHTML = `<div>• Error inesperado al enviar el comentario.</div>`;
          }
        }catch(e){
          console.error('Error enviando comentario', e);
          errorsEl.style.display = 'block';
          errorsEl.innerHTML = `<div>• Error de comunicación con el servidor.</div>`;
        }finally{
          btn.disabled = false;
        }
      });
    }
  }).catch(err => { console.error(err); alert('No fue posible obtener los detalles del aviso.'); });
}

// Cuando se haga click en una fila generada por renderListado, abrimos detalle por id
function bindRowClicks(){
  const rows = tablaListadoBody.querySelectorAll('tr[data-aviso-id]');
  rows.forEach(r=> r.addEventListener('click', () => {
    const id = r.getAttribute('data-aviso-id');
    mostrarDetalle(id);
  }));
}

// Volver
btnVolverListado?.addEventListener('click', () => {
  seccionDetalle.style.display = 'none';
  seccionListado.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
btnVolverPortada2?.addEventListener('click', () => {
  seccionDetalle.style.display = 'none';
  seccionListado.style.display = 'none';
  seccionAvisos.style.display = 'block';
  // Refrescar los últimos 5 avisos al volver a la portada
  fetchUltimosAvisos();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Modal foto grande
btnCerrarFoto?.addEventListener('click', () => {
  modalFoto.classList.remove('abierto');
  modalFoto.setAttribute('aria-hidden', 'true');
});
modalFoto?.addEventListener('click', (e) => {
  if (e.target === modalFoto) btnCerrarFoto.click(); // clic fuera = cerrar
});
