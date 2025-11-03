let categories = [];
let recipes_toShow = [];

document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    getData();
    console.log(categories);
});

async function loadCategories()
{
    let resp = await fetch('/api/categories',{
        method :'GET',
        headers: {
            'x-auth': 23423
        }
    });

    console.log(resp.status);
    let data = await resp.json();

    console.log(data);
    
    categories = data.categories;

    console.log(categories);

    renderCategoryDropdown();
}

async function getData()
{
    let resp = await fetch('/api/recipes/search',{
        method :'GET'
    });

    console.log(resp.status);
    let data = await resp.json();

    console.log(data);
    
    recipes_toShow = data.recipes;

    let html = toHtml(View.toHtmlList,recipes_toShow);
    View.render(html, 'recipes_display');
    
}

function toHtml(fnToHtml = View.toHtmlList, prodlist) {
    console.log('entro');
    return fnToHtml(prodlist);
}


// Obtener referencia al formulario
var recipeForm = document.getElementById('recipeForm');
var selectedCategories = [];

function renderCategoryDropdown() {
    var categoryDropdownMenu = document.getElementById('categoryDropdownMenu');
    categoryDropdownMenu.innerHTML = ''; // Limpiar el dropdown antes de renderizar las categorías

    categories.forEach(function(category) {
        var option = document.createElement('li');
        option.classList.add('dropdown-item');
        option.innerHTML = category.name;
        option.setAttribute('data-id', category._id);
        categoryDropdownMenu.appendChild(option);
    });
}
// Manejar clic en una categoría desde el menú desplegable
document.getElementById('categoryDropdownMenu').addEventListener('click', function(event) {
    if (event.target.classList.contains('dropdown-item')) {
        var categoryId = event.target.getAttribute('data-id');
        var categoryName = event.target.innerHTML;
        addCategory(categoryId, categoryName);
    }
});

// Agregar categoría seleccionada
function addCategory(id, name) {
    // Verificar si la categoría ya está seleccionada
    var exists = selectedCategories.find(function(category) {
        return category.id === id;
    });

    console.log({selected: selectedCategories});

    if (!exists) {
        selectedCategories.push({ id: id, name: name });

        // Mostrar la categoría seleccionada
        renderSelectedCategories();

        // Limpiar dropdown
        document.getElementById('categoryDropdownMenuButton').innerHTML = 'Seleccionar Categorías';
    }

    console.log({selected2: selectedCategories});
}

// Renderizar las categorías seleccionadas
function renderSelectedCategories() {
    var selectedCategoriesContainer = document.getElementById('selectedCategorieshtml');
    selectedCategoriesContainer.innerHTML = '';

    selectedCategories.forEach(function(category) {
        var selectedCategory = document.createElement('div');
        selectedCategory.classList.add('alert', 'alert-primary', 'alert-dismissible', 'fade', 'show');
        selectedCategory.innerHTML = `
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" onclick="removeCategory('${category.id}')"></button>
            ${category.name}
        `;
        selectedCategoriesContainer.appendChild(selectedCategory);
    });

    console.log({add_categories: selectedCategories});
}

// Eliminar categoría seleccionada
// eslint-disable-next-line no-unused-vars
function removeCategory(id) {
    var index = selectedCategories.findIndex(obj => obj.id === id);
    console.log({id,index});
    if (index !== -1) {
        selectedCategories.splice(index, 1); 
    }

    console.log({selec: selectedCategories});
    renderSelectedCategories();
}

// Manejar el envío del formulario
recipeForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Evitar que el formulario se envíe por defecto

    // Obtener los datos del formulario
    var formData = new FormData(recipeForm);

    // Crear un objeto con los datos de la receta
    var recipeData = {};
    formData.forEach(function(value, key){
        recipeData[key] = value;
    });

    // Convertir ingredientes y pasos en arrays
    recipeData.ingredients = recipeData.ingredients.split('\n').map(function(line) {
        var parts = line.split(':');
        return { name: parts[0].trim(), quantity: parts[1].trim() };
    });
    recipeData.steps = recipeData.steps.split('\n').map(function(step) {
        return step.trim();
    });

    // Agregar categorías a los datos de la receta
    recipeData.categories = selectedCategories.map(function(category) {
        return category.id;
    });

    // Enviar los datos a la API o realizar otras acciones según sea necesario
    console.log('Datos de la receta:', recipeData);

    let resp = await fetch('/api/recipes',{
        method :'POST',
        headers:{
            'content-type': 'Application/json'
        },
        body: JSON.stringify(recipeData)
    });

    console.log(resp.status);
    let data = await resp.json();
    //console.log(data);

   if(data.error)
   {
        Swal.fire('Error', data.error , 'error');
        return;
   }

   location.reload();

    // Cerrar el modal
    var modal = bootstrap.Modal.getInstance(document.getElementById('recipeModal'));
    modal.hide();
});

class View
{

    static render(html, elementId){
        document.querySelector(`#${elementId}`).innerHTML = html;
    }

    static toHtmlList(list){
        console.log('entro2');
        let html = `
                    ${list.map((prod) => View.toHtmlDiv(prod)).join('')}
                
                    `;
        return html;
    }
    
    static toHtmlDiv(obj) {
        let html = `
        <div class="col">
        <div class="card position-relative" style="width: 18rem;">
            <img src="${obj.photo}" class="card-img-top" alt="...">
            <div class="card-body">
                <h3 class="card-title">${obj.title}</h3>
                <p class="card-text">${obj.description}</p>
            </div>
            <!-- Botón con ícono de corazón -->
            <button type="button" class="btn btn-outline-danger position-absolute top-0 end-0 m-2">
                <i class="bi bi-heart"></i>
            </button>
            <div class="d-flex justify-content-around mb-5">
                <p>${obj.author.username}</p>
                <p>${obj.prep_time}</p>
                <a href="../recipes/single_recipe.html?id=${obj._id}" class="btn btn-dark">More Info</a>
            </div>
        </div>
    </div>`;
        return html;
    }
    
}
