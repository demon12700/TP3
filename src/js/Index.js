// ==========================================
// 1. DATOS Y ESTADO DE LA APLICACIÓN
// ==========================================
var EMPANADAS_INICIALES = [
  {
    id: 1,
    nombre: "Jamón y Queso",
    precioCU: 500
  },
  {
    id: 2,
    nombre: "Carne y Huevo",
    precioCU: 300
  },
  {
    id: 3,
    nombre: "Queso y Cebolla",
    precioCU: 600
  }
];

var Empanadas = []

var Compra_Haciendo = [];

var Compra_hechas = [];

// ==========================================
// 2. CONSTANTES Y SELECTORES DEL DOM
// ==========================================
const CLAVE_TEMA = "tema_empanadas";
const CLAVE_EMPANADAS = "empanadas_menu";
const CLAVE_COMPRAS_HECHAS = "compras_hechas_historial";
const TEMA_ESTANDAR = "normal";
const TEMA_BLACK_UI = "blackui";

const menuContenedor = document.querySelector("#menu-empanadas");
const modalNuevaEmpanada = document.querySelector("#modal-nueva-empanada");
const btnCancelarEmpanada = document.querySelector("#btn-cancelar-empanada");
const formNuevaEmpanada = document.querySelector("#form-nueva-empanada");
const inputEmpanadaNombre = document.querySelector("#empanada-nombre");
const inputEmpanadaPrecio = document.querySelector("#empanada-precio");
const errorEmpanada = document.querySelector("#error-empanada");

const listaCompra = document.querySelector("#lista-compra");
const totalCompraEl = document.querySelector("#total-compra");
const formPedido = document.querySelector("#form-pedido");
const inputCliente = document.querySelector("#cliente-nombre");
const selectPago = document.querySelector("#cliente-pago");
const mensajeError = document.querySelector("#mensaje-error");

const comprasHechasEl = document.querySelector("#compras-hechas");
const modalConfirmacion = document.querySelector("#modal-confirmacion");
const detalleModal = document.querySelector("#detalle-modal");
const btnCerrarModal = document.querySelector("#btn-cerrar-modal");
const btnTema = document.querySelector("#btn-tema");

// ==========================================
// 3. FUNCIONES DE CÁLCULO, ESTADO Y TEMA
// ==========================================
const guardarEmpanadas = () => {
  localStorage.setItem(CLAVE_EMPANADAS, JSON.stringify(Empanadas));
};

const cargarEmpanadas = () => {
  const guardado = localStorage.getItem(CLAVE_EMPANADAS);
  if (guardado === null) {
    Empanadas = EMPANADAS_INICIALES.map((item) => ({ ...item }));
    guardarEmpanadas();
    return;
  }

  try {
    const parsed = JSON.parse(guardado);
    if (Array.isArray(parsed) && parsed.length > 0) {
      Empanadas = parsed;
    } else {
      Empanadas = EMPANADAS_INICIALES.map((item) => ({ ...item }));
      guardarEmpanadas();
    }
  } catch (error) {
    console.warn("No se pudieron leer las empanadas guardadas:", error);
    Empanadas = EMPANADAS_INICIALES.map((item) => ({ ...item }));
  }
};

const guardarComprasHechas = () => {
  localStorage.setItem(CLAVE_COMPRAS_HECHAS, JSON.stringify(Compra_hechas));
};

const cargarComprasHechas = () => {
  const guardado = localStorage.getItem(CLAVE_COMPRAS_HECHAS);
  if (guardado === null) return;

  try {
    const parsed = JSON.parse(guardado);
    if (Array.isArray(parsed)) {
      Compra_hechas = parsed;
    }
  } catch (error) {
    console.warn("No se pudieron leer las compras guardadas:", error);
  }
};

const Calcular_Compra = () => {
  return Compra_Haciendo.reduce((acum, item) => acum + item.precioCU * item.cantidad, 0);
};

const mostrarMensaje = (elemento, texto) => {
  elemento.textContent = texto;
  elemento.hidden = false;
};

const ocultarMensaje = (elemento) => {
  elemento.textContent = "";
  elemento.hidden = true;
};

const aplicarTema = (tema) => {
  if (tema === TEMA_BLACK_UI) {
    document.documentElement.setAttribute("data-tema", TEMA_BLACK_UI);
    btnTema.textContent = "Tema: Estándar";
    btnTema.setAttribute("aria-pressed", "true");
  } else {
    document.documentElement.removeAttribute("data-tema");
    btnTema.textContent = "Tema: Black UI";
    btnTema.setAttribute("aria-pressed", "false");
  }
  localStorage.setItem(CLAVE_TEMA, tema);
};

const abrirModalNuevaEmpanada = () => {
  ocultarMensaje(errorEmpanada);
  formNuevaEmpanada.reset();
  modalNuevaEmpanada.showModal();
  inputEmpanadaNombre.focus();
};

const cerrarModalNuevaEmpanada = () => {
  ocultarMensaje(errorEmpanada);
  formNuevaEmpanada.reset();
  modalNuevaEmpanada.close();
};

const validarNuevaEmpanada = (nombre, precio) => {
  if (nombre.length < 2) {
    return {
      valido: false,
      mensaje: "Ingresá un nombre de empanada (mínimo 2 caracteres).",
      foco: inputEmpanadaNombre
    };
  }
  if (!Number.isFinite(precio) || precio <= 0) {
    return {
      valido: false,
      mensaje: "Ingresá un precio válido mayor a 0.",
      foco: inputEmpanadaPrecio
    };
  }
  return { valido: true };
};

const crearEmpanada = (nombre, precioCU) => {
  const maxId = Empanadas.reduce((max, item) => (item.id > max ? item.id : max), 0);
  Empanadas.push({
    id: maxId + 1,
    nombre,
    precioCU
  });
  guardarEmpanadas();
  renderizarMenu();
};

const eliminarEmpanadaDelMenu = (id) => {
  Empanadas = Empanadas.filter((empanada) => empanada.id !== id);
  Compra_Haciendo = Compra_Haciendo.filter((item) => item.id !== id);
  guardarEmpanadas();
  renderizarMenu();
  renderizarCompraActual();
};

const agregarEmpanada = (id) => {
  const encontrada = Empanadas.find((e) => e.id === id);
  if (!encontrada) return;

  const enCarrito = Compra_Haciendo.find((item) => item.id === id);
  if (enCarrito) {
    enCarrito.cantidad += 1;
  } else {
    Compra_Haciendo.push({ ...encontrada, cantidad: 1 });
  }

  ocultarMensaje(mensajeError);
  renderizarCompraActual();
};

const quitarEmpanada = (id) => {
  const indice = Compra_Haciendo.findIndex((item) => item.id === id);
  if (indice === -1) return;

  if (Compra_Haciendo[indice].cantidad > 1) {
    Compra_Haciendo[indice].cantidad -= 1;
  } else {
    Compra_Haciendo.splice(indice, 1);
  }

  renderizarCompraActual();
};

const eliminarCompraHecha = (indice) => {
  if (!Number.isInteger(indice) || indice < 0 || indice >= Compra_hechas.length) return;
  Compra_hechas.splice(indice, 1);
  guardarComprasHechas();
  renderizarComprasHechas();
};

const validarPedido = (nombre, pago) => {
  if (Compra_Haciendo.length === 0) {
    return { valido: false, mensaje: "Agregá al menos una empanada antes de confirmar.", foco: null };
  }
  if (nombre.length < 2) {
    return {
      valido: false,
      mensaje: "Ingresá el nombre del cliente (mínimo 2 caracteres).",
      foco: inputCliente
    };
  }
  if (!pago) {
    return { valido: false, mensaje: "Seleccioná un medio de pago.", foco: selectPago };
  }
  return { valido: true };
};

// ==========================================
// 4. FUNCIONES DE RENDERIZADO (DOM)
// ==========================================
const renderizarMenu = () => {
  menuContenedor.innerHTML = "";

  Empanadas.forEach((empanada) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-empanada";

    tarjeta.innerHTML = `
      <div>
        <h3 class="nombre-empanada">${empanada.nombre}</h3>
        <p class="precio-empanada">$${empanada.precioCU} c/u</p>
      </div>
      <div class="acciones-tarjeta">
        <button type="button" class="btn btn-secundario" data-id="${empanada.id}">
          Agregar
        </button>
        <button type="button" class="btn btn-quitar" data-eliminar-empanada="${empanada.id}">
          Eliminar
        </button>
      </div>
    `;

    menuContenedor.appendChild(tarjeta);
  });

  const skeleton = document.createElement("button");
  skeleton.type = "button";
  skeleton.className = "tarjeta-skeleton";
  skeleton.setAttribute("data-abrir-modal-empanada", "true");
  skeleton.innerHTML = `
    <span class="skeleton-mas" aria-hidden="true">+</span>
    <span class="skeleton-texto">Nueva empanada</span>
  `;
  menuContenedor.appendChild(skeleton);
};

const renderizarCompraActual = () => {
  listaCompra.innerHTML = "";

  if (Compra_Haciendo.length === 0) {
    listaCompra.innerHTML = `<li class="item-compra">Todavía no agregaste empanadas.</li>`;
  } else {
    Compra_Haciendo.forEach((item) => {
      const li = document.createElement("li");
      li.className = "item-compra";
      li.innerHTML = `
        <span>${item.nombre} x${item.cantidad} ($${item.precioCU * item.cantidad})</span>
        <button type="button" class="btn btn-quitar" data-quitar-id="${item.id}">Quitar</button>
      `;
      listaCompra.appendChild(li);
    });
  }

  totalCompraEl.textContent = `$${Calcular_Compra()}`;
};

const renderizarComprasHechas = () => {
  comprasHechasEl.innerHTML = "";

  if (Compra_hechas.length === 0) {
    comprasHechasEl.innerHTML = `<p class="texto-lectura">Aún no hay compras confirmadas.</p>`;
    return;
  }

  Compra_hechas.forEach((pedido, index) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-pedido";
    const resumenItems = pedido.items.map((i) => `${i.nombre} x${i.cantidad}`).join(", ");

    tarjeta.innerHTML = `
      <div class="encabezado-pedido">
        <strong>Pedido #${index + 1} — ${pedido.cliente}</strong>
        <button type="button" class="btn btn-quitar" data-eliminar-pedido="${index}">Eliminar</button>
      </div>
      <p class="precio-empanada">${resumenItems}</p>
      <p class="precio-empanada">Pago: ${pedido.pago} | Total: <strong>$${pedido.total}</strong></p>
    `;
    comprasHechasEl.appendChild(tarjeta);
  });
};

// ==========================================
// 5. EVENT LISTENERS
// ==========================================
btnTema.addEventListener("click", () => {
  const esBlackUi = document.documentElement.getAttribute("data-tema") === TEMA_BLACK_UI;
  aplicarTema(esBlackUi ? TEMA_ESTANDAR : TEMA_BLACK_UI);
});

menuContenedor.addEventListener("click", (event) => {
  const btnAbrirModal = event.target.closest("button[data-abrir-modal-empanada]");
  if (btnAbrirModal) {
    abrirModalNuevaEmpanada();
    return;
  }

  const btnAgregar = event.target.closest("button[data-id]");
  if (btnAgregar) {
    agregarEmpanada(Number(btnAgregar.dataset.id));
    return;
  }

  const btnEliminar = event.target.closest("button[data-eliminar-empanada]");
  if (btnEliminar) {
    eliminarEmpanadaDelMenu(Number(btnEliminar.dataset.eliminarEmpanada));
  }
});

btnCancelarEmpanada.addEventListener("click", () => {
  cerrarModalNuevaEmpanada();
});

formNuevaEmpanada.addEventListener("submit", (event) => {
  event.preventDefault();

  const nombre = inputEmpanadaNombre.value.trim();
  const precio = Number(inputEmpanadaPrecio.value);
  const validacion = validarNuevaEmpanada(nombre, precio);

  if (!validacion.valido) {
    mostrarMensaje(errorEmpanada, validacion.mensaje);
    if (validacion.foco) validacion.foco.focus();
    return;
  }

  crearEmpanada(nombre, precio);
  cerrarModalNuevaEmpanada();
});

listaCompra.addEventListener("click", (event) => {
  const boton = event.target.closest("button[data-quitar-id]");
  if (!boton) return;
  const id = Number(boton.dataset.quitarId);
  quitarEmpanada(id);
});

formPedido.addEventListener("submit", (event) => {
  event.preventDefault();

  const nombre = inputCliente.value.trim();
  const pago = selectPago.value;
  const validacion = validarPedido(nombre, pago);

  if (!validacion.valido) {
    mostrarMensaje(mensajeError, validacion.mensaje);
    if (validacion.foco) validacion.foco.focus();
    return;
  }

  ocultarMensaje(mensajeError);

  const total = Calcular_Compra();
  Compra_hechas.push({
    cliente: nombre,
    pago,
    items: Compra_Haciendo.map((item) => ({ ...item })),
    total
  });

  guardarComprasHechas();
  Compra_Haciendo = [];
  formPedido.reset();
  renderizarCompraActual();
  renderizarComprasHechas();

  detalleModal.textContent = `Cliente: ${nombre} | Medio de pago: ${pago} | Total abonado: $${total}.`;
  modalConfirmacion.showModal();
});

comprasHechasEl.addEventListener("click", (event) => {
  const boton = event.target.closest("button[data-eliminar-pedido]");
  if (!boton) return;
  const indice = Number(boton.dataset.eliminarPedido);
  eliminarCompraHecha(indice);
});

btnCerrarModal.addEventListener("click", () => {
  modalConfirmacion.close();
});

// ==========================================
// 6. INICIALIZACIÓN
// ==========================================
const inicializarApp = () => {
  cargarEmpanadas();
  cargarComprasHechas();
  aplicarTema(localStorage.getItem(CLAVE_TEMA) || TEMA_ESTANDAR);
  renderizarMenu();
  renderizarCompraActual();
  renderizarComprasHechas();
};

inicializarApp();