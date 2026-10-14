console.log("Carrito Yury’khome conectado");

// Configuración de Yury’khome
const CLAVE_CARRITO = "yurykhome_carrito";
const WHATSAPP_TIENDA = "573208279769";

let carrito = JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];

function guardarCarrito() {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
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
    precio: Number(precio),
    imagen
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
      precio.textContent =
        "$" + producto.precio.toLocaleString("es-CO");

      const eliminar = document.createElement("button");
      eliminar.textContent = "Eliminar";
      eliminar.type = "button";
      eliminar.onclick = () => eliminarDelCarrito(index);

      item.append(imagen, document.createElement("br"),
        nombre, precio, eliminar);

      lista.appendChild(item);
    });
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

  let total = 0;

  let mensaje =
    "🛍️ NUEVO PEDIDO - YURY’KHOME\n\n" +
    "📦 Productos seleccionados:\n";

  carrito.forEach(function(producto) {
    total += producto.precio;

    mensaje +=
      "\n🛒 " + producto.nombre +
      "\n💰 Precio: $" +
      producto.precio.toLocaleString("es-CO") +
      (producto.imagen
        ? "\n🖼️ Imagen: " + new URL(
            producto.imagen,
            window.location.href
          ).href
        : "") +
      "\n";
  });

  mensaje +=
    "\n━━━━━━━━━━━━━━━━" +
    "\n💵 TOTAL DEL PEDIDO: $" +
    total.toLocaleString("es-CO") +
    "\n\n📍 DATOS DE ENTREGA" +
    "\n✍️ Nombre:" +
    "\n📞 Teléfono:" +
    "\n🏠 Dirección:" +
    "\n\n🚚 Envío a domicilio." +
    "\n\n✨ Gracias por elegir Yury’khome." +
    "\n¡Tu hogar, tu estilo!";

  const url =
    "https://wa.me/" +
    WHATSAPP_TIENDA +
    "?text=" +
    encodeURIComponent(mensaje);

  // Conserva el carrito hasta que el cliente regrese.
  // Así no se pierden los productos si cancela el envío.
  window.open(url, "_blank");
}

document.addEventListener("DOMContentLoaded", actualizarCarrito);
