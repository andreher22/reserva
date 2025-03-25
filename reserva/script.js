document.addEventListener("DOMContentLoaded", function () {
    let usuarioAutenticado = localStorage.getItem("usuarioAutenticado") === "true"; // Cargar estado de sesión

    // Credenciales de prueba (puedes cambiar esto en el futuro con base de datos)
    const usuarioValido = "usuario@gmail.com";
    const contraseñaValida = "12345678";

    // Elementos del modal de autenticación
    const modal = document.getElementById("modal-auth");
    const authButton = document.getElementById("btn-auth");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const closeModal = document.querySelector(".cerrar");
    const toggleAuthText = document.getElementById("toggle-auth");
    const modalTitle = document.getElementById("modal-titulo");

    // Elementos del modal de reserva
    const modalReserva = document.getElementById("modal-reserva");
    const cerrarReserva = document.querySelector(".cerrar-reserva");
    const confirmarReservaBtn = document.getElementById("confirmar-reserva-btn");

    // Botones de navegación y de reservar
    const nav = document.querySelector("nav");
    const botonesReservar = document.querySelectorAll(".reservar-btn");

    // Botones de "Iniciar sesión" y "Registrarse"
    let loginBtn = document.querySelector("nav a:nth-child(1)");
    let registerBtn = document.querySelector("nav a:nth-child(2)");

    // ====== Cargar sesión si el usuario ya ha iniciado ======
    if (usuarioAutenticado) {
        nav.innerHTML = '<a href="#" id="btn-cuenta">Cuenta</a>';
    }

    // ====== Eventos para el modal de autenticación ======
    loginBtn?.addEventListener("click", function (e) {
        e.preventDefault();
        abrirModalLogin();
    });

    registerBtn?.addEventListener("click", function (e) {
        e.preventDefault();
        abrirModalRegistro();
    });

    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    toggleAuthText.addEventListener("click", function (e) {
        e.preventDefault();
        if (modalTitle.textContent === "Iniciar Sesión") {
            abrirModalRegistro();
        } else {
            abrirModalLogin();
        }
    });    

    window.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    // ====== Función de autenticación ======
    authButton.addEventListener("click", function () {
        const usuarioIngresado = emailInput.value.trim();
        const contraseñaIngresada = passwordInput.value.trim();

        if (!usuarioIngresado || !contraseñaIngresada) {
            alert("Por favor, ingresa tu correo y contraseña.");
            return;
        }

        if (usuarioIngresado === usuarioValido && contraseñaIngresada === contraseñaValida) {
            usuarioAutenticado = true;
            localStorage.setItem("usuarioAutenticado", "true"); // Guardar sesión
        
            alert("¡Inicio de sesión exitoso!");
            location.reload();
            modal.style.display = "none"; // Cierra el modal
        //637523
            // Reemplazar botones de inicio y registro por "Cuenta"
            nav.innerHTML = '<a href="#" id="btn-cuenta">Cuenta</a>';
        
            // 💡 Volver a asignar el evento de apertura de la barra lateral
            const btnCuenta = document.getElementById("btn-cuenta");
            const sidebar = document.getElementById("sidebar");
        
            btnCuenta.addEventListener("click", function () {
                sidebar.style.right = "0";
            });
        } 
    });

    // ====== Mostrar habitaciones solo después de hacer clic en "Buscar" ======
    const buscarBtn = document.getElementById("buscar-btn");
    const habitacionesDisponibles = document.getElementById("habitaciones-disponibles");
    const paisInput = document.getElementById("pais");
    const estadoSelect = document.getElementById("estado");
    const fechaEntrada = document.getElementById("fecha-entrada");
    const fechaSalida = document.getElementById("fecha-salida");

    buscarBtn.addEventListener("click", function () {
        if (!paisInput.value || !estadoSelect.value) {
            alert("Por favor, selecciona un país y un estado válidos.");
            return;
        }
    
        if (!fechasValidas()) {
            alert("La fecha de salida debe ser posterior a la fecha de entrada.");
            return;
        }
    
        // Obtener referencias a las secciones
        const seccionDestacadas = document.querySelector(".habitaciones");
        const consultaReserva = document.querySelector(".consulta-reserva");
    
        // Mostrar habitaciones disponibles en la parte superior
        habitacionesDisponibles.style.display = "block";
    
        // Mover habitaciones disponibles al lugar de habitaciones destacadas
        seccionDestacadas.insertAdjacentElement("beforebegin", habitacionesDisponibles);
    
        // Mover habitaciones destacadas y consulta de reserva abajo
        habitacionesDisponibles.parentNode.appendChild(seccionDestacadas);
        habitacionesDisponibles.parentNode.appendChild(consultaReserva);
    });
    

    function fechasValidas() {
        return fechaEntrada.value && fechaSalida.value && new Date(fechaEntrada.value) < new Date(fechaSalida.value);
    }

    // ====== Manejo de los botones de reserva ======
    modalReserva.style.display = "none"; // Asegurar que el modal esté oculto al iniciar

    botonesReservar.forEach(boton => {
        boton.addEventListener("click", function (e) {
            if (!usuarioAutenticado) {
                e.preventDefault();
                alert("Debes iniciar sesión para reservar.");
                modal.style.display = "flex";
            } else {
                e.preventDefault();
                // Guardar referencia a la habitación en el modal
                modalReserva.querySelector('.modal-contenido').habitacionReserva = this.closest('.habitacion');
                modalReserva.style.display = "flex";
            }
        });
    });

    // Cerrar modal de reserva
    cerrarReserva.addEventListener("click", function () {
        modalReserva.style.display = "none";
    });

    confirmarReservaBtn.addEventListener("click", function () {
        // Generar ID único
        const idReserva = Math.floor(100000 + Math.random() * 900000);
        
        // Obtener referencia a la habitación específica que se está reservando
        const habitacionSeleccionada = this.closest('.modal-contenido').habitacionReserva;
        
        // Obtener todos los datos necesarios de la habitación
        const nombreHabitacion = habitacionSeleccionada.querySelector("h3").textContent;
        const precio = habitacionSeleccionada.querySelector("p:nth-of-type(2)").textContent.split(": ")[1];
        const capacidad = habitacionSeleccionada.querySelector("p:nth-of-type(3)").textContent.split(": ")[1];
        const estado = "Activa";
        
        // Obtener fechas de búsqueda
        const fechaEntrada = document.getElementById("fecha-entrada").value;
        const fechaSalida = document.getElementById("fecha-salida").value;
        
        // Fecha de creación
        const fechaCreacion = new Date().toISOString();
        
        // Crear objeto de reserva completo
        const reserva = {
            id: idReserva,
            habitacion: nombreHabitacion,
            precio: precio,
            capacidad: capacidad,
            estado: estado,
            fechaCreacion: fechaCreacion,
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            pais: document.getElementById("pais").value,
            estadoUbicacion: document.getElementById("estado").value
        };
        
        // Guardar en localStorage con la ID como referencia
        localStorage.setItem(`reserva_${idReserva}`, JSON.stringify(reserva));
        
        alert(`✅ ¡Reserva confirmada! Tu ID de reserva es: ${idReserva}`);
        modalReserva.style.display = "none";
    });

const consultarBtn = document.getElementById("consultar-btn");
const modalDetalleReserva = document.getElementById("modal-detalle-reserva");
const cerrarDetalle = document.querySelector(".cerrar-detalle");
const infoReserva = document.getElementById("info-reserva");
const estadoReserva = document.getElementById("estado-reserva");
const cancelarReservaBtn = document.getElementById("cancelar-reserva-btn");

consultarBtn.addEventListener("click", function () {
    const idReserva = document.getElementById("reserva-id").value.trim();

    if (!idReserva) {
        alert("Por favor, ingresa un ID de reserva.");
        return;
    }

    // Buscar específicamente por la ID proporcionada
    const reserva = JSON.parse(localStorage.getItem(`reserva_${idReserva}`));

    if (reserva) {
        infoReserva.innerHTML = `
            <strong>Habitación:</strong> ${reserva.habitacion}<br>
            <strong>ID:</strong> ${reserva.id}<br>
            <strong>Precio:</strong> ${reserva.precio}<br>
            <strong>Capacidad:</strong> ${reserva.capacidad}<br>
            <strong>Ubicación:</strong> ${reserva.pais}, ${reserva.estadoUbicacion}<br>
            <strong>Check-in:</strong> ${new Date(reserva.fechaEntrada).toLocaleDateString()}<br>
            <strong>Check-out:</strong> ${new Date(reserva.fechaSalida).toLocaleDateString()}<br>
            <strong>Reservado el:</strong> ${new Date(reserva.fechaCreacion).toLocaleString()}
        `;

        estadoReserva.innerHTML = `<strong>Estado:</strong> ${reserva.estado}`;
        modalDetalleReserva.style.display = "flex";

        if (reserva.estado === "Cancelada") {
            cancelarReservaBtn.disabled = true;
            cancelarReservaBtn.textContent = "Reserva Cancelada";
        } else {
            cancelarReservaBtn.disabled = false;
            cancelarReservaBtn.textContent = "Cancelar Reserva";
        }
    } else {
        alert("No se encontró ninguna reserva con ese ID.");
    }
});

// Cerrar modal de detalles de la reserva
cerrarDetalle.addEventListener("click", function () {
    modalDetalleReserva.style.display = "none";
});

// Cancelar una reserva
cancelarReservaBtn.addEventListener("click", function () {
    const idReserva = document.getElementById("reserva-id").value.trim();
    let reserva = JSON.parse(localStorage.getItem(`reserva_${idReserva}`));

    if (reserva) {
        reserva.estado = "Cancelada"; // Marcar como cancelada
        localStorage.setItem(`reserva_${idReserva}`, JSON.stringify(reserva)); // Guardar cambios

        alert("❌ Tu reserva ha sido cancelada.");
        modalDetalleReserva.style.display = "none"; // Cerrar modal
    }
});

    // Cerrar modal si se hace clic fuera del contenido
    window.addEventListener("click", function (e) {
        if (e.target === modalReserva) {
            modalReserva.style.display = "none";
        }
    });

    // ====== Detectar cambio en el país y actualizar estados ======
    const estadosPorPais = {
        "México": ["CDMX", "Jalisco", "Nuevo León"],
        "Estados Unidos": ["California", "Texas", "Nueva York"],
        "España": ["Madrid", "Cataluña", "Andalucía"]
    };

    paisInput.addEventListener("input", function () {
        const paisSeleccionado = Object.keys(estadosPorPais).find(pais => pais.toLowerCase() === paisInput.value.toLowerCase());

        estadoSelect.innerHTML = "";
        if (paisSeleccionado) {
            estadoSelect.removeAttribute("disabled");
            estadosPorPais[paisSeleccionado].forEach(estado => {
                const option = document.createElement("option");
                option.value = estado;
                option.textContent = estado;
                estadoSelect.appendChild(option);
            });
        } else {
            estadoSelect.setAttribute("disabled", true);
            estadoSelect.innerHTML = '<option value="">Selecciona un país primero</option>';
        }
    });

    // ====== Funciones para abrir el modal ======
    function abrirModalLogin() {
        modal.style.display = "flex";
        modalTitle.textContent = "Iniciar Sesión";
        authButton.textContent = "Ingresar";
        toggleAuthText.innerHTML = '¿No tienes cuenta? <a href="#">Regístrate</a>';
    }

    function abrirModalRegistro() {
        modal.style.display = "flex";
        modalTitle.textContent = "Registrarse";
        authButton.textContent = "Registrarse";
        toggleAuthText.innerHTML = '¿Ya tienes cuenta? <a href="#">Inicia sesión</a>';
    }
 });

 document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar");
    const btnCuenta = document.getElementById("btn-cuenta");
    const cerrarSidebar = document.querySelector(".cerrar-sidebar");
    const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

    // Mostrar la barra lateral al hacer clic en "Cuenta"
    btnCuenta?.addEventListener("click", function () {
        sidebar.style.right = "0";
    });

    // Cerrar la barra lateral
    cerrarSidebar.addEventListener("click", function () {
        sidebar.style.right = "-250px";
    });

    // Cerrar sesión desde la barra lateral
    btnCerrarSesion.addEventListener("click", function () {
        const confirmar = confirm("¿Seguro que quieres cerrar sesión?");
        if (confirmar) {
            localStorage.removeItem("usuarioAutenticado");
            alert("Has cerrado sesión.");
            location.reload();
        }
    });    

    // Cerrar la barra si se hace clic fuera de ella
    window.addEventListener("click", function (e) {
        if (e.target !== sidebar && !sidebar.contains(e.target) && e.target !== btnCuenta) {
            sidebar.style.right = "-250px";
        }
    });
});

// Reemplaza todo el código del historial con este:

document.addEventListener("DOMContentLoaded", function() {
    const btnHistorial = document.getElementById("btn-historial");
    const historialReservas = document.getElementById("historial-reservas");
    
    function mostrarHistorial() {
        historialReservas.innerHTML = `
            <button id="btn-limpiar-historial" class="btn-limpiar">Borrar Historial</button>
        `;
        
        const reservas = [];
        
        // Recoger todas las reservas
        for (let i = 0; i < localStorage.length; i++) {
            const clave = localStorage.key(i);
            if (clave.startsWith("reserva_")) {
                const reserva = JSON.parse(localStorage.getItem(clave));
                reservas.push(reserva);
            }
        }
        
        // Ordenar por fecha (más recientes primero)
        reservas.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
        
        // Mostrar reservas
        if (reservas.length === 0) {
            historialReservas.innerHTML += '<p class="sin-reservas">No hay reservas registradas</p>';
        } else {
            reservas.forEach(reserva => {
                const item = document.createElement("div");
                item.classList.add("historial-item");
                item.innerHTML = `
                    <p><strong>ID:</strong> ${reserva.id}</p>
                    <p><strong>Habitación:</strong> ${reserva.habitacion}</p>
                    <p><strong>Fecha:</strong> ${new Date(reserva.fechaCreacion).toLocaleString()}</p>
                    <p><strong>Estado:</strong> ${reserva.estado}</p>
                    <hr>
                `;
                historialReservas.appendChild(item);
            });
        }
        
        document.getElementById("btn-limpiar-historial").addEventListener("click", limpiarHistorialCompleto);
    }
    
    // Función para limpiar todo el historial
    function limpiarHistorialCompleto() {
        if (confirm("⚠️ ¿Estás seguro que quieres eliminar TODAS tus reservas? Esta acción no se puede deshacer.")) {
            // Crear array de claves a eliminar
            const clavesAEliminar = [];
            
            // Identificar todas las claves de reservas
            for (let i = 0; i < localStorage.length; i++) {
                const clave = localStorage.key(i);
                if (clave.startsWith("reserva_")) {
                    clavesAEliminar.push(clave);
                }
            }
            
            // Eliminar todas las reservas encontradas
            clavesAEliminar.forEach(clave => localStorage.removeItem(clave));
            
            // Mostrar mensaje de éxito
            alert("✅ Todas las reservas han sido eliminadas");
            
            // Actualizar la vista del historial
            mostrarHistorial();
        }
    }
    
    // Evento para mostrar/ocultar el historial
    btnHistorial.addEventListener("click", function() {
        historialReservas.classList.toggle("oculto");
        if (!historialReservas.classList.contains("oculto")) {
            mostrarHistorial();
        }
    });
    
    // Cerrar historial al hacer clic fuera
    document.addEventListener("click", function(e) {
        if (!historialReservas.contains(e.target) && e.target !== btnHistorial) {
            historialReservas.classList.add("oculto");
        }
    });
});

