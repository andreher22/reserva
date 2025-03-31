document.addEventListener("DOMContentLoaded", function () {
    let usuarioAutenticado = localStorage.getItem("usuarioAutenticado") === "true";

    const modal = document.getElementById("modal-auth");
    const authButton = document.getElementById("btn-auth");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const closeModal = document.querySelector(".cerrar");
    const toggleAuthText = document.getElementById("toggle-auth");
    const modalTitle = document.getElementById("modal-titulo");

    const modalReserva = document.getElementById("modal-reserva");
    const cerrarReserva = document.querySelector(".cerrar-reserva");
    const confirmarReservaBtn = document.getElementById("confirmar-reserva-btn");

    const nav = document.querySelector("nav");
    const botonesReservar = document.querySelectorAll(".reservar-btn");

    let loginBtn = document.querySelector("nav a:nth-child(1)");
    let registerBtn = document.querySelector("nav a:nth-child(2)");

    if (usuarioAutenticado) {
        nav.innerHTML = '<a href="#" id="btn-cuenta">Cuenta</a>';
    }

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

    authButton.addEventListener("click", function () {
        const correo = emailInput.value.trim();
        const contrasena = passwordInput.value.trim();

        if (!correo || !contrasena) {
            alert("Por favor, ingresa tu correo y contraseña.");
            return;
        }

        if (modalTitle.textContent === "Registrarse") {
            const nombre = prompt("Ingresa tu nombre:") || "Usuario";

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

        const seccionDestacadas = document.querySelector(".habitaciones");
        const consultaReserva = document.querySelector(".consulta-reserva");

        habitacionesDisponibles.style.display = "block";
        seccionDestacadas.insertAdjacentElement("beforebegin", habitacionesDisponibles);
        habitacionesDisponibles.parentNode.appendChild(seccionDestacadas);
        habitacionesDisponibles.parentNode.appendChild(consultaReserva);
    });

    function fechasValidas() {
        return fechaEntrada.value && fechaSalida.value && new Date(fechaEntrada.value) < new Date(fechaSalida.value);
    }

    modalReserva.style.display = "none";

    botonesReservar.forEach(boton => {
        boton.addEventListener("click", function (e) {
            if (!usuarioAutenticado) {
                e.preventDefault();
                alert("Debes iniciar sesión para reservar.");
                modal.style.display = "flex";
            } else {
                e.preventDefault();
                modalReserva.querySelector('.modal-contenido').habitacionReserva = this.closest('.habitacion');
                modalReserva.style.display = "flex";
            }
        });
    });

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

    const consultarBtn = document.getElementById("consultar-btn");
    const modalDetalleReserva = document.getElementById("modal-detalle-reserva");
    const cerrarDetalle = document.querySelector(".cerrar-detalle");
    const infoReserva = document.getElementById("info-reserva");
    const estadoReserva = document.getElementById("estado-reserva");
    const cancelarReservaBtn = document.getElementById("cancelar-reserva-btn");

    consultarBtn.addEventListener("click", function () {
        consultarBtn.addEventListener("click", function () {
            const idReserva = document.getElementById("reserva-id").value.trim();
        
            if (!idReserva) {
                alert("Por favor, ingresa un ID de reserva.");
                return;
            }
        
            fetch(`http://localhost:3000/api/reservas/${idReserva}`)
                .then(res => {
                    if (!res.ok) throw new Error("No se encontró la reserva");
                    return res.json();
                })
                .then(reserva => {
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
                    console.error("❌", err);
                    alert("❌ No se encontró ninguna reserva con ese ID.");
                });
        });
        
        
    });

    cerrarDetalle.addEventListener("click", function () {
        modalDetalleReserva.style.display = "none";
    });

    /* cancelarReservaBtn.addEventListener("click", function () {
        alert("Esta funcionalidad se implementará más adelante.");
    }); */
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
    

    window.addEventListener("click", function (e) {
        if (e.target === modalReserva) {
            modalReserva.style.display = "none";
        }
    });

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







