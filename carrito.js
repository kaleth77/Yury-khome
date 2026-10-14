console.log("Carrito Yury’khome conectado");

// ===== CONFIGURACIÓN =====
const CLAVE_CARRITO = "yurykhome_carrito";

// IMPORTANTE: pon aquí un número que SÍ tenga WhatsApp.
// Formato Colombia: 57 + 10 dígitos, sin +, sin espacios, sin guiones.
// Ejemplo: 573001234567
const WHATSAPP_TIENDA = "573208279769";

// ===== CARRITO (con protección si localStorage falla) =====
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
  if (modal) modal.style.display = "flex";
}

function cerrarCarrito() {
  const modal = document.getElementById("modal-carrito");
  if (modal) modal.style.display = "none";
}

function agregarAlCarrito(nombre, precio, imagen) {
  carrito.push({
    nombre,
    precio: Number(precio) || 0,
    imagen: imagen || ""
  });

  guardarCarrito();
  actualizarCarrito();
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

    carrito.forEach((producto, index) => {
      total += producto.precio;

      const item = document.createElement("div");
      item.style.cssText =
        "margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #ddd;";

      const imagen = document.createElement("img");
      imagen.src = producto.imagen || "";
      imagen.alt = producto.nombre;
      imagen.width = 60;
      imagen.style.borderRadius = "6px";

      const nombre = document.createElement("strong");
      nombre.textContent = producto.nombre;

      const precio = document.createElement("p");
      precio.textContent = "$" + producto.precio.toLocaleString("es-CO");

      const eliminar = document.createElement("button");
      eliminar.textContent = "Eliminar";
      eliminar.type = "button";
      eliminar.onclick = () => eliminarDelCarrito(index);

      item.append(imagen, document.createElement("br"), nombre, precio, eliminar);
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

  // Limpia el número por si trae espacios, + o guiones
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

  // Celular: abrir en la misma pestaña (los navegadores móviles bloquean
  // las ventanas nuevas y así abre directo la app de WhatsApp).
  // PC: abrir en pestaña nueva, y si la bloquean, usar la misma.
  const esMovil = /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);

  if (esMovil) {
    window.location.href = url;
  } else {
    const ventana = window.open(url, "_blank");
    if (!ventana) window.location.href = url;
  }
}

// Por si el script se carga como módulo o los botones usan onclick="..."
window.abrirCarrito = abrirCarrito;
window.cerrarCarrito = cerrarCarrito;
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.actualizarCarrito = actualizarCarrito;
window.comprarWhatsApp = comprarWhatsApp;

document.addEventListener("DOMContentLoaded", actualizarCarrito);
