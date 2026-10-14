"use strict";

/*
 * YURY'KHOME
 * Catálogo de productos conectado con Google Sheets.
 *
 * La conexión se configurará en el siguiente paso.
 */

const CONFIG_TIENDA = {
  URL_CATALOGO: "https://script.google.com/macros/s/AKfycbylOBwfPPBGn9r0_1bWr8cH_yIO6TVHNVGONOoxcwr3HcEVq46Q0Wa5farEukpNzSPY6Q/exec"
};

let productosTienda = [];

const formatoCOP = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0
});

function dinero(valor) {
    return formatoCOP.format(Number(valor) || 0);
}

function textoSeguro(valor) {
    return String(valor ?? "").trim();
}

function precioValido(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) && numero >= 0 ? numero : 0;
}

function imagenPredeterminada() {
    return "https://placehold.co/600x600/f0ece6/777066?text=Yury%27khome";
}

function prepararImagen(url) {
    const valor = textoSeguro(url);

    if (!valor) return imagenPredeterminada();

    try {
        const direccion = new URL(valor, window.location.href);

        if (
            direccion.protocol === "https:" ||
            direccion.protocol === "http:"
        ) {
            return direccion.href;
        }
    } catch (error) {
        console.warn("Imagen no válida:", valor);
    }

    return imagenPredeterminada();
}

function mostrarEstado(mensaje) {
    const estado = document.getElementById("estadoCatalogo");
    if (estado) estado.textContent = mensaje;
}

function cargarProductos(datos) {
    productosTienda = datos
        .filter(producto => {
            const activo = textoSeguro(producto.activo).toUpperCase();
            return activo !== "NO" && activo !== "FALSE" && activo !== "0";
        })
        .map(producto => ({
            nombre: textoSeguro(producto.nombre),
            precio: precioValido(producto.precio),
            imagen: prepararImagen(producto.imagen),
            categoria: textoSeguro(producto.categoria) || "Hogar",
            descripcion: textoSeguro(producto.descripcion)
        }))
        .filter(producto => producto.nombre !== "");

    cargarCategorias();
    aplicarFiltros();
}

function cargarCategorias() {
    const selector = document.getElementById("filtroCategoria");
    if (!selector) return;

    const seleccionAnterior = selector.value;
    const categorias = [
        ...new Set(productosTienda.map(producto => producto.categoria))
    ].sort((a, b) => a.localeCompare(b, "es"));

    selector.replaceChildren(new Option("Todas las categorías", ""));

    categorias.forEach(categoria => {
        selector.add(new Option(categoria, categoria));
    });

    if (categorias.includes(seleccionAnterior)) {
        selector.value = seleccionAnterior;
    }
}

function aplicarFiltros() {
    const busqueda = textoSeguro(
        document.getElementById("buscarProducto")?.value
    ).toLocaleLowerCase("es");

    const categoria = textoSeguro(
        document.getElementById("filtroCategoria")?.value
    );

    const minimoTexto = document.getElementById("precioMin")?.value ?? "";
    const maximoTexto = document.getElementById("precioMax")?.value ?? "";

    const minimo = minimoTexto === "" ? null : Number(minimoTexto);
    const maximo = maximoTexto === "" ? null : Number(maximoTexto);

    const filtrados = productosTienda.filter(producto => {
        const coincideTexto = (
            producto.nombre + " " +
            producto.categoria + " " +
            producto.descripcion
        ).toLocaleLowerCase("es").includes(busqueda);

        const coincideCategoria =
            categoria === "" || producto.categoria === categoria;

        const coincideMinimo =
            minimo === null || producto.precio >= minimo;

        const coincideMaximo =
            maximo === null || producto.precio <= maximo;

        return coincideTexto &&
            coincideCategoria &&
            coincideMinimo &&
            coincideMaximo;
    });

    renderizarProductos(filtrados);
}

function renderizarProductos(productos) {
    const contenedor = document.getElementById("productos");
    if (!contenedor) return;

    contenedor.replaceChildren();

    if (productos.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.className = "sin-resultados";
        mensaje.textContent = productosTienda.length === 0
            ? "Todavía no hay productos para mostrar."
            : "No encontramos productos con esos filtros.";

        contenedor.appendChild(mensaje);
        return;
    }

    productos.forEach(producto => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "producto";

        const zonaImagen = document.createElement("div");
        zonaImagen.className = "producto-imagen";

        const imagen = document.createElement("img");
        imagen.src = producto.imagen;
        imagen.alt = producto.nombre;
        imagen.loading = "lazy";
        imagen.addEventListener("error", () => {
            imagen.src = imagenPredeterminada();
        }, { once: true });

        imagen.addEventListener("click", () => {
            abrirImagen(producto.imagen, producto.nombre);
        });

        zonaImagen.appendChild(imagen);

        const info = document.createElement("div");
        info.className = "producto-info";

        const etiqueta = document.createElement("span");
        etiqueta.className = "producto-categoria";
        etiqueta.textContent = producto.categoria;

        const nombre = document.createElement("h3");
        nombre.textContent = producto.nombre;

        const descripcion = document.createElement("p");
        descripcion.className = "producto-descripcion";
        descripcion.textContent = producto.descripcion;

        const precio = document.createElement("p");
        precio.className = "producto-precio";
        precio.textContent = "$" + dinero(producto.precio);

        const boton = document.createElement("button");
        boton.className = "boton-agregar";
        boton.type = "button";
        boton.textContent = "Agregar al carrito";

        boton.addEventListener("click", () => {
            agregarAlCarrito(
                producto.nombre,
                producto.precio,
                producto.imagen
            );
        });

        info.append(
            etiqueta,
            nombre
        );

        if (producto.descripcion) {
            info.appendChild(descripcion);
        }

        info.append(precio, boton);
        tarjeta.append(zonaImagen, info);
        contenedor.appendChild(tarjeta);
    });
}

function abrirImagen(url, nombre = "Producto") {
    const visor = document.getElementById("visor");
    const imagen = document.getElementById("imagenGrande");

    if (!visor || !imagen) return;

    imagen.src = prepararImagen(url);
    imagen.alt = nombre;
    visor.style.display = "flex";
    visor.setAttribute("aria-hidden", "false");
}

function cerrarImagen() {
    const visor = document.getElementById("visor");
    if (!visor) return;

    visor.style.display = "none";
    visor.setAttribute("aria-hidden", "true");
}

async function iniciarCatalogo() {
    document.getElementById("anio").textContent =
        new Date().getFullYear();

    document.getElementById("buscarProducto")
        .addEventListener("input", aplicarFiltros);

    document.getElementById("filtroCategoria")
        .addEventListener("change", aplicarFiltros);

    document.getElementById("precioMin")
        .addEventListener("input", aplicarFiltros);

    document.getElementById("precioMax")
        .addEventListener("input", aplicarFiltros);

    document.getElementById("limpiarFiltros")
        .addEventListener("click", () => {
            document.getElementById("buscarProducto").value = "";
            document.getElementById("filtroCategoria").value = "";
            document.getElementById("precioMin").value = "";
            document.getElementById("precioMax").value = "";
            aplicarFiltros();
        });

    document.getElementById("visor")
        .addEventListener("click", evento => {
            if (evento.target.id === "visor") cerrarImagen();
        });

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape") {
            cerrarImagen();
            cerrarCarrito();
        }
    });

    if (!CONFIG_TIENDA.URL_CATALOGO) {
        mostrarEstado(
            "La página está preparada. Falta conectar Google Sheets."
        );
        renderizarProductos([]);
        return;
    }

    mostrarEstado("Cargando productos...");

    try {
        const respuesta = await fetch(CONFIG_TIENDA.URL_CATALOGO);

        if (!respuesta.ok) {
            throw new Error("No se pudo consultar el catálogo.");
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos)) {
            throw new Error("El catálogo no tiene el formato esperado.");
        }

        cargarProductos(datos);
        mostrarEstado(
            productosTienda.length + " productos disponibles"
        );
    } catch (error) {
        console.error("Error al cargar el catálogo:", error);
        mostrarEstado(
            "No pudimos cargar los productos. Revisa la conexión con la hoja."
        );
    }
}

document.addEventListener("DOMContentLoaded", iniciarCatalogo);