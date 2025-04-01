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
        const correo = emailInput.value.trim();
        const contrasena = passwordInput.value.trim();
    
        if (!correo || !contrasena) {
            alert("Por favor, ingresa tu correo y contraseña.");
            return;
        }
    
        if (modalTitle.textContent === "Registrarse") {
            const nombre = prompt("Ingresa tu nombre:") || "Usuario"; // podrías agregar un campo en el modal
    
            fetch("http://localhost:3000/api/registro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, correo, contrasena })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert("❌ Error: " + data.error);
                } else {
                    alert("✅ Registro exitoso. Ahora inicia sesión.");
                    abrirModalLogin();
                }
            });
        } else {
            // Login
            fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, contrasena })
            })
            .then(res => res.json())
            .then(data => {
                if (data.autenticado) {
                    localStorage.setItem("usuarioAutenticado", "true");
                    localStorage.setItem("usuarioNombre", data.usuario.nombre);
                    localStorage.setItem("usuarioCorreo", data.usuario.correo);
                    alert("✅ Inicio de sesión exitoso");
                    location.reload();
                } else {
                    alert("❌ Credenciales incorrectas");
                }
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
        const habitacionSeleccionada = this.closest('.modal-contenido').habitacionReserva;
        const nombreHabitacion = habitacionSeleccionada.querySelector("h3").textContent;
        const precio = habitacionSeleccionada.querySelector("p:nth-of-type(2)").textContent.split(": ")[1];
        const capacidad = habitacionSeleccionada.querySelector("p:nth-of-type(3)").textContent.split(": ")[1];
        const estado = "Activa";
    
        const fechaEntrada = document.getElementById("fecha-entrada").value;
        const fechaSalida = document.getElementById("fecha-salida").value;
        const fechaCreacion = new Date().toISOString();
    
        const pais = document.getElementById("pais").value;
        const estadoUbicacion = document.getElementById("estado").value;
        const correoUsuario = localStorage.getItem("usuarioCorreo");
    
        const reserva = {
            habitacion: nombreHabitacion,
            precio: precio,
            capacidad: capacidad,
            estado: estado,
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            fechaCreacion: fechaCreacion,
            pais: pais,
            estadoUbicacion: estadoUbicacion,
            correoUsuario: correoUsuario
        };
    
        fetch("http://localhost:3000/api/reservas/guardar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reserva)
        })
        .then(res => res.json())
        .then(data => {
            if (data.id) {
                alert(`✅ ¡Reserva confirmada! Tu ID es: ${data.id}`);
                modalReserva.style.display = "none";
            } else {
                alert("⚠️ Reserva guardada pero sin ID.");
            }
        })
        .catch(err => {
            console.error("❌ Error al guardar reserva:", err);
            alert("❌ Error al guardar la reserva.");
        });
    });
    
    
// esta parte del codigo se respalda
const consultarBtn = document.getElementById("consultar-btn");
const modalDetalleReserva = document.getElementById("modal-detalle-reserva");
const cerrarDetalle = document.querySelector(".cerrar-detalle");
const infoReserva = document.getElementById("info-reserva");
const estadoReserva = document.getElementById("estado-reserva");
const cancelarReservaBtn = document.getElementById("cancelar-reserva-btn");

consultarBtn.addEventListener("click", function () {
    const idReserva = document.getElementById("reserva-id").value.trim();

    if (!idReserva || isNaN(idReserva)) {
        alert("⚠️ Ingresa un ID de reserva válido (número).");
        return;
    }

    fetch(`http://localhost:3000/api/reservas/${idReserva}`)
        .then(res => {
            if (!res.ok) throw new Error("No se encontró la reserva");
            return res.json();
        })
        .then(reserva => {
            console.log("✅ Reserva encontrada:", reserva); // DEBUG

            infoReserva.innerHTML = `
                <strong>Habitación:</strong> ${reserva.habitacion}<br>
                <strong>ID:</strong> ${reserva.id}<br>
                <strong>Precio:</strong> ${reserva.precio}<br>
                <strong>Capacidad:</strong> ${reserva.capacidad}<br>
                <strong>Ubicación:</strong> ${reserva.pais}, ${reserva.estado_ubicacion}<br>
                <strong>Check-in:</strong> ${new Date(reserva.fecha_entrada).toLocaleDateString()}<br>
                <strong>Check-out:</strong> ${new Date(reserva.fecha_salida).toLocaleDateString()}<br>
                <strong>Reservado el:</strong> ${new Date(reserva.fecha_creacion).toLocaleString()}
            `;

            estadoReserva.innerHTML = `<strong>Estado:</strong> ${reserva.estado}`;
            modalDetalleReserva.style.display = "flex";

            cancelarReservaBtn.disabled = reserva.estado === "Cancelada";
            cancelarReservaBtn.textContent = reserva.estado === "Cancelada"
                ? "Reserva Cancelada" : "Cancelar Reserva";
        })
        .catch(err => {
            console.error("❌ Error al consultar reserva:", err);
            alert("❌ No se encontró ninguna reserva con ese ID.");
        });
});



// Cerrar modal de detalles de la reserva
cerrarDetalle.addEventListener("click", function () {
    modalDetalleReserva.style.display = "none";
});


cancelarReservaBtn.addEventListener("click", function () {
    const idReserva = document.getElementById("reserva-id").value.trim();

    if (!idReserva) {
        alert("⚠️ ID no válido.");
        return;
    }

    const confirmar = confirm("¿Estás seguro que quieres cancelar esta reserva?");
    if (!confirmar) return;

    fetch(`http://localhost:3000/api/reservas/${idReserva}/cancelar`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
        if (data.mensaje) {
            alert("❌ Reserva cancelada y eliminada.");
            modalDetalleReserva.style.display = "none";
        } else {
            alert("⚠️ No se pudo cancelar la reserva.");
        }
    })
    .catch(err => {
        console.error("❌ Error al cancelar reserva:", err);
        alert("❌ Error al cancelar la reserva.");
    });
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

document.addEventListener("DOMContentLoaded", function () {
    const btnHistorial = document.getElementById("btn-historial");
    const historialReservas = document.getElementById("historial-reservas");

    async function mostrarHistorialDesdeBackend() {
        historialReservas.innerHTML = `<p>Cargando historial...</p>`;

        const correoUsuario = localStorage.getItem("usuarioCorreo");

        if (!correoUsuario) {
            historialReservas.innerHTML = '<p class="sin-reservas">Debes iniciar sesión para ver tu historial.</p>';
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/api/reservas/usuario/${correoUsuario}`);
            if (!res.ok) throw new Error("Error al obtener historial");

            const reservas = await res.json();

            historialReservas.innerHTML = `
                <button id="btn-limpiar-historial" class="btn-limpiar">Borrar Historial</button>
            `;

            if (reservas.length === 0) {
                historialReservas.innerHTML += '<p class="sin-reservas">No tienes reservas registradas.</p>';
            } else {
                reservas.forEach(reserva => {
                    const item = document.createElement("div");
                    item.classList.add("historial-item");
                    item.innerHTML = `
                        <p><strong>ID:</strong> ${reserva.id}</p>
                        <p><strong>Habitación:</strong> ${reserva.habitacion}</p>
                        <p><strong>Fecha:</strong> ${new Date(reserva.fecha_creacion).toLocaleString()}</p>
                        <p><strong>Estado:</strong> ${reserva.estado}</p>
                        <hr>
                    `;
                    historialReservas.appendChild(item);
                });
            }

            // Este botón ahora solo muestra alerta porque no se puede borrar el historial real desde la BD
            document.getElementById("btn-limpiar-historial").addEventListener("click", () => {
                alert("🛑 No puedes borrar el historial desde aquí. Contacta con un administrador si es necesario.");
            });

        } catch (err) {
            console.error("❌ Error al cargar historial:", err);
            historialReservas.innerHTML = '<p class="sin-reservas">Error al cargar tu historial.</p>';
        }
    }

    // Mostrar/ocultar historial
    btnHistorial.addEventListener("click", function () {
        historialReservas.classList.toggle("oculto");
        if (!historialReservas.classList.contains("oculto")) {
            mostrarHistorialDesdeBackend();
        }
    });

    // Cerrar historial al hacer clic fuera
    document.addEventListener("click", function (e) {
        if (!historialReservas.contains(e.target) && e.target !== btnHistorial) {
            historialReservas.classList.add("oculto");
        }
    });
});
