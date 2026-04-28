let alumnos = [];
let idArrastrado = null;

function añadirAlumno() {
  let nombre = prompt("Nombre del alumno:");
  if (!nombre) return;

  let curso = prompt("Curso:");
  if (!curso) return;

  let alumno = { id: Date.now(), nombre: nombre, curso: curso };
  alumnos.push(alumno);

  // Insertamos la tarjeta ANTES del botón de añadir
  let tarjeta = crearTarjeta(alumno);
  let columna = document.getElementById("disponibles");
  let boton = columna.querySelector("button");
  columna.insertBefore(tarjeta, boton);
}

function crearTarjeta(alumno) {
  let div = document.createElement("div");
  div.className = "alumno";
  div.textContent = alumno.nombre + " - " + alumno.curso;
  div.draggable = true;

  div.addEventListener("dragstart", function() {
    idArrastrado = div;
    div.style.opacity = "0.5";
  });

  div.addEventListener("dragend", function() {
    div.style.opacity = "1";
  });

  return div;
}

let columnas = document.querySelectorAll(".columna");

columnas.forEach(function(columna) {

  columna.addEventListener("dragover", function(e) {
    e.preventDefault();
    columna.classList.add("resaltada");
  });

  columna.addEventListener("dragleave", function() {
    columna.classList.remove("resaltada");
  });

  columna.addEventListener("drop", function(e) {
    columna.classList.remove("resaltada");
    if (!idArrastrado) return;

    // Insertamos antes del botón de cada columna
    let boton = columna.querySelector("button");
    columna.insertBefore(idArrastrado, boton);

    idArrastrado = null;
  });

});

function enviar() {
  let tarjetas = document.querySelectorAll("#seleccionados .alumno");

  if (tarjetas.length === 0) {
    alert("No hay alumnos seleccionados.");
    return;
  }

  let nombres = [];
  tarjetas.forEach(function(t) {
    nombres.push(t.textContent);
  });

  alert("Alumnos enviados:\n" + nombres.join("\n"));
}