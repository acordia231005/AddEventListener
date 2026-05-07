let alumnos = Array.from(document.getElementsByClassName("alumno"));
let elementoArrastrando = null;

//Empiezo a arrastrar
alumnos.forEach(alumno => {
    alumno.addEventListener("dragstart", (e)=> {
        elementoArrastrando = e.target;
    });
});

//Estoy arrastrando
let columnas = Array.from(document.getElementsByClassName("column"));

columnas.forEach(columna => {
    columna.addEventListener("dragover", (e)=>{
        e.preventDefault();
    });
})

//Suelto 
columnas.forEach(columna => {
    columna.addEventListener("drop", (e)=>{
        let lista = columna.querySelector("ul");
        lista.appendChild(elementoArrastrando);
    });
});

//Al finalizar
alumnos.forEach(alumno => {
    alumno.addEventListener("dragend", (e)=> {
        elementoArrastrando = null;
    });
});


const btnNuevo = document.querySelectorAll(".btn")[0];
const btnEnviar = document.querySelectorAll(".btn")[1]; 
const formularioSection = document.getElementById("formulario");
const listaAll = document.getElementById("listaAll");


const modal = document.getElementById("modalSummary");
const modalList = document.getElementById("modalList");
const modalMessage = document.getElementById("modalMessage");
const btnCerrarModal = document.getElementById("closeModal");
const btnConfirmarModal = document.getElementById("confirmBtn");


formularioSection.innerHTML = `
    <h3>Nuevo Alumno</h3>
    <div class="form-group">
        <label for="nombre">Nombre y Apellidos</label>
        <input type="text" id="nombre" placeholder="Ej. Juan Pérez">
    </div>
    <div class="form-group">
        <label for="edad">Edad</label>
        <input type="number" id="edad" placeholder="Ej. 20">
    </div>
    <div class="form-actions">
        <button class="btn btn-cancel" id="btnCancelar">Cancelar</button>
        <button class="btn btn-save" id="btnGuardar">Guardar</button>
    </div>
`;

// Función para añadir los eventos de arrastre a un nuevo elemento
function configurarArrastre(alumno) {
    alumno.addEventListener("dragstart", (e) => {
        elementoArrastrando = e.target;
    });
    alumno.addEventListener("dragend", (e) => {
        elementoArrastrando = null;
    });
}

// Evento para mostrar el formulario
btnNuevo.addEventListener("click", () => {
    formularioSection.classList.toggle("active");
    if (formularioSection.classList.contains("active")) {
        document.getElementById("nombre").focus();
    }
});

// Evento para cancelar
document.getElementById("btnCancelar").addEventListener("click", () => {
    formularioSection.classList.remove("active");
    limpiarFormulario();
});

// Evento para guardar
document.getElementById("btnGuardar").addEventListener("click", () => {
    const nombre = document.getElementById("nombre").value;
    const edad = document.getElementById("edad").value;

    if (nombre && edad) {
        const nuevoAlumno = document.createElement("li");
        nuevoAlumno.className = "alumno";
        nuevoAlumno.draggable = true;
        nuevoAlumno.textContent = `${nombre} (${edad})`;
        
        // Configuramos el arrastre para el nuevo alumno
        configurarArrastre(nuevoAlumno);
        
        // Lo añadimos a la lista
        listaAll.appendChild(nuevoAlumno);
        
        // Cerramos y limpiamos
        formularioSection.classList.remove("active");
        limpiarFormulario();
        mostrarNotificacion(`Alumno ${nombre} creado`, "var(--success)");
    } else {
        mostrarNotificacion("Por favor, rellena todos los campos", "var(--danger)");
    }
});

// Evento para el botón Enviar
btnEnviar.addEventListener("click", () => {
    const seleccionados = Array.from(document.getElementById("listaSelected").children);
    
    if (seleccionados.length === 0) {
        mostrarNotificacion("No hay alumnos seleccionados", "var(--danger)");
        return;
    }

    // Limpiar lista previa
    modalList.innerHTML = "";
    modalMessage.textContent = `Se van a enviar ${seleccionados.length} alumnos:`;

    seleccionados.forEach(s => {
        const li = document.createElement("li");
        li.textContent = s.textContent;
        modalList.appendChild(li);
    });

    // Mostrar Modal
    modal.classList.add("active");
});

// Cerrar Modal
[btnCerrarModal, btnConfirmarModal].forEach(btn => {
    btn.addEventListener("click", () => {
        modal.classList.remove("active");
        if (btn === btnConfirmarModal) {
            mostrarNotificacion("Envío completado", "var(--success)");
        }
    });
});

function limpiarFormulario() {
    document.getElementById("nombre").value = "";
    document.getElementById("edad").value = "";
}

// Función para mostrar notificaciones elegantes
function mostrarNotificacion(texto, color) {
    const notif = document.createElement("div");
    notif.className = "notificacion";
    notif.style.borderLeftColor = color;
    notif.textContent = texto;
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.opacity = "0";
        notif.style.transform = "translateX(100%)";
        notif.style.transition = "all 0.3s ease";
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}