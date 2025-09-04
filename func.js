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
// ===== Volver a la portada desde estadísticas =====
btnVolverPortada3?.addEventListener('click', () => {
  seccionEstadisticas.style.display = 'none';
  seccionListado && (seccionListado.style.display = 'none');
  seccionDetalle && (seccionDetalle.style.display = 'none');
  seccionFormulario.style.display = 'none';
  seccionExito.style.display      = 'none';
  seccionAvisos.style.display     = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
  // mostrar estadísticas
  seccionEstadisticas.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


// === Referencias del formulario =====
const formulario = document.getElementById('formulario');
const fotosContainer = document.getElementById('fotos-container');
const btnAgregarFoto = document.getElementById('agregar-foto');

// === Secciones/elementos del listado y detalle (nuevo) ====
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

// ===== Datos de ejemplo: 5 avisos (nuevos) =====
const avisosData = [
  {
    id: 1,
    fechaPublicacion: "2025-08-19 17:00",
    fechaEntrega:     "2025-08-22 11:00",
    region: "Región Metropolitana",
    comuna: "Santiago",
    sector: "Parque O'Higgins",
    cantidad: 1,
    tipo: "Perro",
    edad: "1 año y 8 meses",
    nombreContacto: "María Pérez",
    fotos: ["listado1.1.jpg", "listado1.2.jpg"]
  },
  {
    id: 2,
    fechaPublicacion: "2025-08-15 10:30",
    fechaEntrega:     "2025-08-18 09:00",
    region: "Región Metropolitana",
    comuna: "Estación Central",
    sector: "Persa",
    cantidad: 2,
    tipo: "Gato",
    edad: "1 mes",
    nombreContacto: "Carlos Soto",
    fotos: ["listado2.1.jpg"]
  },
  {
    id: 3,
    fechaPublicacion: "2025-08-09 12:00",
    fechaEntrega:     "2025-08-13 16:30",
    region: "Región Metropolitana",
    comuna: "Santiago",
    sector: "Beauchef 850, terraza",
    cantidad: 2,
    tipo: "Perro",
    edad: "6 meses",
    nombreContacto: "Javiera Rivas",
    fotos: ["listado3.1.jpg", "listado3.2.jpg", "listado3.3.jpg"]
  },
  {
    id: 4,
    fechaPublicacion: "2025-08-21 15:45",
    fechaEntrega:     "2025-08-25 10:00",
    region: "Región de Valparaíso",
    comuna: "Viña del Mar",
    sector: "Plaza Sucre",
    cantidad: 1,
    tipo: "Perro",
    edad: "3 años",
    nombreContacto: "Pedro García",
    fotos: ["listado4.1.jpg"]
  },
  {
    id: 5,
    fechaPublicacion: "2025-08-23 09:10",
    fechaEntrega:     "2025-08-26 18:00",
    region: "Región del Biobío",
    comuna: "Concepción",
    sector: "Parque Ecuador",
    cantidad: 3,
    tipo: "Gato",
    edad: "2 meses",
    nombreContacto: "Ana Fuentes",
    fotos: ["listado5.1.jpg", "listado5.2.jpg"]
  }
];

// Modal de confirmación
const modal = document.getElementById('mensaje-confirmacion');
const btnConfirmarSi = document.getElementById('confirmar-si');
const btnConfirmarNo = document.getElementById('confirmar-no');

// Botón volver portada (en pantalla de éxito)
const btnVolverPortada = document.getElementById('volver-portada');

// ===== Fecha disponible: prellenar +3h y fijar mínimo  =====
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


// ====== Contactar por (opcional, máx. 5) ======
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

// ====== Validaciones auxiliares ======
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

// ====== Submit con validación + confirmación ======
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

  // Mostrar pantalla de éxito
  seccionFormulario.style.display = 'none';
  seccionAvisos.style.display = 'none';
  seccionExito.style.display = 'block';

  // Reiniciar formulario (y dejar solo 1 input de foto)
  formulario.reset();
  const inputs = fotosContainer.querySelectorAll('input[type="file"]');
  inputs.forEach((inp, idx) => {
    if (idx === 0) {
      inp.id = 'foto-1';
      inp.name = 'fotos[]';
      inp.value = '';
    } else {
      inp.remove();
    }
  });

  // Resetear contactos
  contactos = [];
  renderContactos();
  if (selectContactar) selectContactar.value = '';
  if (inputContactoId) inputContactoId.value = '';
  toggleContactoUI();
});

btnConfirmarNo?.addEventListener('click', () => {
  hideModal();
});

btnVolverPortada?.addEventListener('click', () => {
  seccionExito.style.display = 'none';
  seccionAvisos.style.display = 'block';
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
  avisosData.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${a.fechaPublicacion}</td>
      <td>${a.fechaEntrega}</td>
      <td>${a.comuna}</td>
      <td>${a.sector}</td>
      <td>${a.cantidad} ${a.tipo.toLowerCase()}(s) — ${a.edad}</td>
      <td>${a.nombreContacto}</td>
      <td>${a.fotos.length}</td>
    `;
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => mostrarDetalle(a));
    tablaListadoBody.appendChild(tr);
  });
}

function mostrarListado(){
  seccionAvisos.style.display = 'none';
  seccionFormulario.style.display = 'none';
  seccionExito.style.display = 'none';
  seccionDetalle.style.display = 'none';
  seccionEstadisticas.style.display = 'none'; // Oculta estadísticas
  seccionListado.style.display = 'block';
  renderListado();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// REEMPLAZA tu listener anterior de "ver-listado" por este:
btnVerListado?.addEventListener('click', mostrarListado);

// Detalle
function mostrarDetalle(a){
  seccionListado.style.display = 'none';
  seccionAvisos.style.display = 'none';
  seccionFormulario.style.display = 'none';
  seccionExito.style.display = 'none';
  seccionDetalle.style.display = 'block';

  detalleContenido.innerHTML = `
    <div><strong>Fecha publicación:</strong> ${a.fechaPublicacion}</div>
    <div><strong>Fecha entrega:</strong> ${a.fechaEntrega}</div>
    <div><strong>Región:</strong> ${a.region}</div>
    <div><strong>Comuna:</strong> ${a.comuna}</div>
    <div><strong>Sector:</strong> ${a.sector}</div>
    <div><strong>Cantidad · tipo · edad:</strong> ${a.cantidad} ${a.tipo.toLowerCase()}(s) — ${a.edad}</div>
    <div class="full"><strong>Nombre contacto:</strong> ${a.nombreContacto}</div>
    <div class="full"><strong>Fotos (${a.fotos.length}):</strong></div>
    <div class="fotos-grid full">
      ${a.fotos.map((src,i)=> `<img src="${src}" alt="Foto ${i+1}" data-src="${src}" class="thumb">`).join('')}
    </div>
  `;

  // Miniatura 320×240 -> modal 800×600
  detalleContenido.querySelectorAll('.thumb').forEach(img => {
    img.addEventListener('click', () => {
      imgAmpliada.src = img.dataset.src;
      modalFoto.classList.add('abierto');
      modalFoto.setAttribute('aria-hidden', 'false');
    });
  });
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
