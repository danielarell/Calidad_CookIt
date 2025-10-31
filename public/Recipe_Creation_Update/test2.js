// Array de ingredientes
const ingredientesDisponibles = ["Pollo", "Carne", "Pescado", "Arroz", "Frijoles", "Verduras", "Papas"];

// Función para generar opciones del menú desplegable de ingredientes
function generarOpcionesIngredientes() {
    const ingredientesDropdown = document.getElementById("ingredientesDropdown");
    ingredientesDropdown.innerHTML = "<option value=''>Choose an ingredient</option>";

    ingredientesDisponibles.forEach(function(ingrediente) {
        const option = document.createElement("option");
        option.value = ingrediente;
        option.textContent = ingrediente;
        ingredientesDropdown.appendChild(option);
    });
}

function addingredient_tolist()
{
    const ingredient = document.getElementById("");
}

// Función para agregar ingrediente al contenedor
function agregarIngrediente() {
    const ingredientesDropdown = document.getElementById("ingredientesDropdown");
    const selectedIngredient = ingredientesDropdown.value;

    if (selectedIngredient) {
        const ingredientesContainer = document.getElementById("ingredientesContainer");

        const ingredienteDiv = document.createElement("div");
        ingredienteDiv.innerHTML = `
            <span>${selectedIngredient}</span>
            <button class="btn btn-danger" onclick="eliminarIngrediente(this)"><i class="bi bi-trash3-fill"></i></button>
            <input type="hidden" name="ingredientes[]" value="${selectedIngredient}">
        `;
        ingredientesContainer.appendChild(ingredienteDiv);
    } else {
        alert("Por favor seleccione un ingrediente");
    }
}

// Función para eliminar ingredientes
function eliminarIngrediente(btn) {
    btn.parentNode.remove();
}

// Llamada inicial para generar las opciones del menú desplegable de ingredientes
generarOpcionesIngredientes();

// Manejo del formulario
document.getElementById("recipeForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;
    const duracion = parseInt(document.getElementById("duracion").value);
    //const autor = document.getElementById("autor").value;
    const pasos = document.getElementById("pasos").value.split("\n");
    const ingredientes = [];
    const ingredientesInputs = document.getElementsByName("ingredientes[]");

    for (let i = 0; i < ingredientesInputs.length; i++) {
        ingredientes.push(ingredientesInputs[i].value);
    }

    const fechaCreacion = new Date().toLocaleDateString();

    // Crear objeto de receta
    const receta = {
        titulo: titulo,
        descripcion: descripcion,
        duracion: duracion,
        //autor: autor,
        pasos: pasos,
        ingredientes: ingredientes,
        fechaCreacion: fechaCreacion
    };

    
    console.log("Receta guardada:", receta);
});
