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