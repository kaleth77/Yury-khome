"use strict";

// ======================================
// YURY'KHOME - CARRITO INDEPENDIENTE
// ======================================

const CLAVE_CARRITO = "yurykhome_carrito";

// Bro, aquí pondremos el número de WhatsApp
// de tu mamá en el formato internacional.
// Ejemplo Colombia: 573001234567
const WHATSAPP_TIENDA = "";

let carrito = cargarCarritoGuardado();

function cargarCarritoGuardado() {
    try {
        const guardado = JSON.parse(
            localStorage.getItem(CLAVE_CARRITO) || "[]"
        );

        if (!Array.isArray(guardado)) return [];

        return guardado.filter(item =>
            item &&
            typeof item.nombre === "string" &&
            Number.isFinite(Number(item.precio)) &&
            Number(item.precio) >= 0 &&
            Number.isInteger(Number(item.cantidad)) &&
            Number(item.cantidad) > 0
        ).map(item => ({
            nombre: item.nombre,
            precio: Number(item.precio),
            imagen: typeof item.imagen === "string" ? item.imagen : "",
            cantidad: Number(item.cantidad)
        }));
    } catch (error) {
        console.error("No se pudo recuperar el carrito:", error);
        return [];
    }
}

function guardarCarrito() {
    try {
        localStorage.setItem(
            CLAVE_CARRITO,
            JSON.stringify(carrito)
        );
    } catch (error) {
        console.error("No se pudo guardar el carrito:", error);
        alert("No pudimos guardar el carrito en este dispositivo.");
    }
}

function formatoDinero(valor) {
    return new Intl.NumberFormat("es-CO", {
        maximumFractionDigits: 0
    }).format(Number(valor) || 0);
}

function agregarAlCarrito(nombre, precio, imagen = "") {
    const precioNumero = Number(precio);

    if (
        typeof nombre !== "string" ||
        !nombre.trim() ||
        !Number.isFinite(precioNumero) ||
        precioNumero < 0
    ) {
        alert("No pudimos agregar este producto.");
        return;
    }

    const existente = carrito.find(
        item => item.nombre === nombre &&
                item.precio === precioNumero
    );

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({
            nombre: nombre.trim(),
            precio: precioNumero,
            imagen: typeof imagen === "string" ? imagen : "",
            cantidad: 1
        });
    }

    guardarCarrito();
    actualizarCarrito();
    abrirCarrito();
}

function cambiarCantidad(indice, cambio) {
    if (!carrito[indice]) return;

    carrito[indice].cantidad += cambio;

    if (carrito[indice].cantidad <= 0) {
        carrito.splice(indice, 1);
    }

    guardarCarrito();
    actualizarCarrito();
}

function eliminarDelCarrito(indice) {
    if (!carrito[indice]) return;

    carrito.splice(indice, 1);
    guardarCarrito();
    actualizarCarrito();
}

function actualizarCarrito() {
    const lista = document.getElementById("lista-carrito");
    const totalElemento = document.getElementById("total");
    const contador = document.getElementById("contador-carrito");

    if (!lista || !totalElemento || !contador) return;

    lista.replaceChildren();

    const cantidadTotal = carrito.reduce(
        (suma, item) => suma + item.cantidad,
        0
    );

    const precioTotal = carrito.reduce(
        (suma, item) => suma + item.precio * item.cantidad,
        0
    );

    contador.textContent = cantidadTotal;
    totalElemento.textContent = formatoDinero(precioTotal);

    if (carrito.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "sin-resultados";
        vacio.textContent = "Tu carrito está vacío. ¡Vamos a encontrar algo para tu hogar!";
        lista.appendChild(vacio);
        return;
    }

    carrito.forEach((item, indice) => {
        const fila = document.createElement("div");
        fila.className = "item-carrito";

        const imagen = document.createElement("img");
        imagen.src = item.imagen || "https://placehold.co/100x100/f0ece6/777066?text=Producto";
        imagen.alt = item.nombre;

        imagen.addEventListener("error", () => {
            imagen.src = "https://placehold.co/100x100/f0ece6/777066?text=Producto";
        }, { once: true });

        const detalles = document.createElement("div");

        const nombre = document.createElement("h4");
        nombre.textContent = item.nombre;

        const precio = document.createElement("p");
        precio.textContent =
            "$" + formatoDinero(item.precio) + " c/u";

        const controles = document.createElement("div");
        controles.style.display = "flex";
        controles.style.alignItems = "center";
        controles.style.gap = "12px";
        controles.style.marginTop = "8px";

        const menos = document.createElement("button");
        menos.type = "button";
        menos.textContent = "−";
        menos.setAttribute("aria-label", "Disminuir cantidad");
        menos.addEventListener("click", () =>
            cambiarCantidad(indice, -1)
        );

        const cantidad = document.createElement("span");
        cantidad.textContent = item.cantidad;

        const mas = document.createElement("button");
        mas.type = "button";
        mas.textContent = "+";
        mas.setAttribute("aria-label", "Aumentar cantidad");
        mas.addEventListener("click", () =>
            cambiarCantidad(indice, 1)
        );

        controles.append(menos, cantidad, mas);
        detalles.append(nombre, precio, controles);

        const eliminar = document.createElement("button");
        eliminar.type = "button";
        eliminar.textContent = "Eliminar";
        eliminar.addEventListener("click", () =>
            eliminarDelCarrito(indice)
        );

        fila.append(imagen, detalles, eliminar);
        lista.appendChild(fila);
    });
}

function abrirCarrito() {
    const modal = document.getElementById("modal-carrito");
    const fondo = document.getElementById("fondoCarrito");

    if (!modal || !fondo) return;

    modal.classList.add("abierto");
    fondo.style.display = "block";
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function cerrarCarrito() {
    const modal = document.getElementById("modal-carrito");
    const fondo = document.getElementById("fondoCarrito");

    if (!modal || !fondo) return;

    modal.classList.remove("abierto");
    fondo.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

function comprarWhatsApp() {
    if (carrito.length === 0) {
        alert("Bro, primero agrega productos al carrito.");
        return;
    }

    if (!/^\d{10,15}$/.test(WHATSAPP_TIENDA)) {
        alert(
            "Todavía falta configurar el WhatsApp de Yury’khome. " +
            "Cuando tengamos el número, lo ponemos en carrito.js."
        );
        return;
    }

    const total = carrito.reduce(
        (suma, item) => suma + item.precio * item.cantidad,
        0
    );

    let mensaje = "¡Hola! Quiero hacer un pedido en Yury’khome 🏡\n\n";

    carrito.forEach((item, indice) => {
        mensaje += `${indice + 1}. ${item.nombre}\n`;
        mensaje += `Cantidad: ${item.cantidad}\n`;
        mensaje += `Precio unitario: $${formatoDinero(item.precio)}\n`;
        mensaje += `Subtotal: $${formatoDinero(item.precio * item.cantidad)}\n`;

        if (item.imagen) {
            try {
                const url = new URL(item.imagen, window.location.href);
                if (url.protocol === "https:" || url.protocol === "http:") {
                    mensaje += `Foto: ${url.href}\n`;
                }
            } catch (error) {
                // Se omite el enlace si no es válido.
            }
        }

        mensaje += "\n";
    });

    mensaje += `TOTAL DEL PEDIDO: $${formatoDinero(total)}\n\n`;
    mensaje += "Mis datos para el pedido:\n";
    mensaje += "Nombre: \n";
    mensaje += "Dirección: \n";
    mensaje += "Ciudad: \n";
    mensaje += "Método de entrega: \n";
    mensaje += "\nQuedo pendiente. ¡Gracias!";

    const urlWhatsApp =
        "https://wa.me/" + WHATSAPP_TIENDA +
        "?text=" + encodeURIComponent(mensaje);

    window.open(urlWhatsApp, "_blank", "noopener,noreferrer");
}

document.addEventListener("DOMContentLoaded", () => {
    actualizarCarrito();
});