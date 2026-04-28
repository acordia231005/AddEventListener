const button = document.querySelector(".saludo");


button.addEventListener("click", () => {
    console.log("click");
})

const buttons = document.getElementsByTagName("button");

for (const button of buttons) {
    button.addEventListener("click", () => {
        console.log("click");
    })
}


let form = document.getElementById("formulario");
let mensajeError = document.getElementById("mensajeError");

form.addEventListener("submit", (e) => {
    if(validar()){
       e.preventDefault();
       mensajeError.textContent = "El nombre y los apellidos son obligatorios y la edad mayor a 0";
       setTimeout(() => {mensajeError.textContent = "";}, 3000);
    }
})


function validar(){
    let nombre = document.getElementById("nombre").value;
    let apellido = document.getElementById("apellido").value;
    let edad = document.getElementById("edad").value;

    return nombre && apellido && edad > 0;
}