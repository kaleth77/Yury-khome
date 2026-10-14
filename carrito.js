console.log("Carrito Yury’khome conectado");

// ===== CONFIGURACIÓN =====
const CLAVE_CARRITO = "yurykhome_carrito";

// Pon aquí un número que SÍ tenga WhatsApp.
// Formato Colombia: 57 + 10 dígitos, sin +, espacios ni guiones.
const WHATSAPP_TIENDA = "573208279769";

// ===== CARRITO =====
let carrito = [];

try {
  const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
  if (Array.isArray(guardado)) carrito = guardado;
} catch (e) {
  carrito = [];
}

function guardarCarrito() {
  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  } catch (e) {
    console.warn("No se pudo guardar el carrito:", e);
  }
}

function abrirCarrito() {
  const modal = document.getElementById("modal-carrito");
  const fondo = document.getElementById("fondoCarrito");

  if (fondo) fondo.style.display = "block";
  if (modal) {
    modal.classList.add("abierto");
    modal.setAttribute("aria-hidden", "false");
  }
  document.body.style.overflow = "hidden";
}

function cerrarCarrito() {
  const modal = document.getElementById("modal-carrito");
  const fondo = document.getElementById("fondoCarrito");

  if (modal) {
    modal.classList.remove("abierto");
    modal.setAttribute("aria-hidden", "true");
  }
  if (fondo) fondo.style.display = "none";
  document.body.style.overflow = "";
}

function agregarAlCarrito(nombre, precio, imagen) {
  carrito.push({
    nombre,
    precio: Number(precio) || 0,
    imagen: imagen || ""
  });

  guardarCarrito();
  actualizarCarrito();
  abrirCarrito();
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  guardarCarrito();
  actualizarCarrito();
}

function actualizarCarrito() {
  const lista = document.getElementById("lista-carrito");
  const totalElemento = document.getElementById("total");
  const contador = document.getElementById("contador-carrito");

  let total = 0;

  if (lista) {
    lista.innerHTML = "";

    if (carrito.length === 0) {
      const vacio = document.createElement("p");
      vacio.textContent = "Tu carrito está vacío.";
      vacio.style.cssText = "padding:30px 0;text-align:center;color:#777066;";
      lista.appendChild(vacio);
    }

    carrito.forEach((producto, index) => {
      total += producto.precio;

      const item = document.createElement("div");
      item.className = "item-carrito";

      const imagen = document.createElement("img");
      imagen.src = producto.imagen || "";
      imagen.alt = producto.nombre;

      const datos = document.createElement("div");

      const nombre = document.createElement("h4");
      nombre.textContent = producto.nombre;

      const precio = document.createElement("p");
      precio.textContent = "$" + producto.precio.toLocaleString("es-CO");

      datos.append(nombre, precio);

      const eliminar = document.createElement("button");
      eliminar.textContent = "Eliminar";
      eliminar.type = "button";
      eliminar.onclick = () => eliminarDelCarrito(index);

      item.append(imagen, datos, eliminar);
      lista.appendChild(item);
    });
  } else {
    carrito.forEach((p) => (total += p.precio));
  }

  if (totalElemento) {
    totalElemento.textContent = total.toLocaleString("es-CO");
  }

  if (contador) {
    contador.textContent = carrito.length;
  }
}

function comprarWhatsApp() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío. Agrega productos antes de continuar.");
    return;
  }

  const numero = String(WHATSAPP_TIENDA).replace(/\D/g, "");

  let total = 0;

  let mensaje =
    "🛍️ NUEVO PEDIDO - YURY’KHOME\n\n" +
    "📦 Productos seleccionados:\n";

  carrito.forEach(function (producto) {
    total += producto.precio;

    let linkImagen = "";
    if (producto.imagen) {
      try {
        linkImagen = new URL(producto.imagen, window.location.href).href;
      } catch (e) {
        linkImagen = "";
      }
    }

    mensaje +=
      "\n🛒 " + producto.nombre +
      "\n💰 Precio: $" + producto.precio.toLocaleString("es-CO") +
      (linkImagen ? "\n🖼️ Imagen: " + linkImagen : "") +
      "\n";
  });

  mensaje +=
    "\n━━━━━━━━━━━━━━━━" +
    "\n💵 TOTAL DEL PEDIDO: $" + total.toLocaleString("es-CO") +
    "\n\n📍 DATOS DE ENTREGA" +
    "\n✍️ Nombre:" +
    "\n📞 Teléfono:" +
    "\n🏠 Dirección:" +
    "\n\n🚚 Envío a domicilio." +
    "\n\n✨ Gracias por elegir Yury’khome." +
    "\n¡Tu hogar, tu estilo!";

  const url = "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensaje);

  // Celular: misma pestaña (abre la app). PC: pestaña nueva, con respaldo.
  const esMovil = /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);

  if (esMovil) {
    window.location.href = url;
  } else {
    const ventana = window.open(url, "_blank");
    if (!ventana) window.location.href = url;
  }
}

window.abrirCarrito = abrirCarrito;
window.cerrarCarrito = cerrarCarrito;
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.actualizarCarrito = actualizarCarrito;
window.comprarWhatsApp = comprarWhatsApp;

document.addEventListener("DOMContentLoaded", actualizarCarrito);
