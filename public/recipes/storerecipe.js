let receta;
let categories = [];
let recipeId;

// This is an example for the button of categories
// Función para obtener el parámetro de la URL por su nombre
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

document.addEventListener("DOMContentLoaded", function() {
    // Obtener el ID de la receta de la URL
    recipeId = getParameterByName('id');
    loadRecipe(recipeId);
    loadCategories();
});

async function loadCategories()
{
    let resp = await fetch('/api/categories',{
        method :'GET',
        headers: {
            'x-auth': 23423
        }
    })

    console.log(resp.status);
    let data = await resp.json()

    console.log(data);
    
    categories = data.categories;

    console.log(categories);

    renderCategoryDropdown()
}

async function loadRecipe(recipeId)
{
    let resp = await fetch('/api/recipes/'+recipeId,{
        method :'GET'
    })

    console.log(resp.status);
    let data = await resp.json()

    receta = data;

    console.log(data);

    let respuser = await fetch('/api/users/search/me',{
        method :'GET'
    })

    console.log(respuser.status);
    user = await respuser.json()

    let html = renderRecipe(data, user);
    render(html, "recipe");
}

// Cosas del chat:
// Obtener referencias a elementos del DOM
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');


// Función para agregar un mensaje al chat
async function addMessageToChat() {
    // const messageElement = document.createElement('div');
    const newMessage = document.getElementById('message-input');

    // Check if the element exists
    if (newMessage != '') {
        // Get the value of the input field
        const content = {content: newMessage.value};
        console.log("message: " + content);
        // Reset the input field after retrieving the value (if needed)
        newMessage.value = '';

        let resp = await fetch('/api/recipes/' + recipeId + '/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(content)
        })
        console.log(resp.status);
        let data = await resp.json()
       
        
    } else {
        console.error("Element with id 'content' not found.");

        
    }
    location.reload()    
}

//Funcion para postear una review
async function addReview() {
    const review = document.getElementById('new-review');
    const rating = document.getElementById('new-rating');

    // Checar si ha excrito algo
    if (review != '' && rating != '' && rating.value <= 5 && rating.value >= 0) {
        // Get the value of the input field
        const content = {comment: review.value, rating: rating.value};
        console.log("review: " + content);
        
        review.value = '';
        rating.value = '';

        let resp = await fetch('/api/reviews/' + recipeId , {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(content)
        })
        console.log(resp.status);
        let data = await resp.json()
       
        location.reload()   
        
    } 
    
}

async function del_review(id){
    // Checar si ha excrito algo
    if (id != '') {        

        let resp = await fetch('/api/reviews/' + recipeId +'/' + id, {
            method: 'DELETE',
        })

        console.log(resp.status);
        let data = await resp.json()
       
        location.reload()   
        
    } 
}

async function sub(id){

    // Checar si ha excrito algo
    if (id != '') {        

        let resp = await fetch('/api/users/' + id + '/reviews/subscribe', {
            method: 'POST',
        })

        console.log(resp.status);
       
        location.reload()   
    } 
}

async function del_message(id){
    if (id != '') {        

        let resp = await fetch('/api/messages/' + recipeId +'/' + id, {
            method: 'DELETE',
        })

        console.log(resp.status);
        let data = await resp.json()
       
        location.reload()   
    } 
}

function renderRecipe(obj, user){

    let ingredientsHtml = '';
    obj.ingredients.forEach((ingredient, index) => {
        ingredientsHtml += `<li><p><span>${ingredient.name}</span>: ${ingredient.quantity}</p></li>`;
    });

    let instructionsHtml = '';
    obj.steps.forEach((instruction, index) => {
        instructionsHtml += `<div class="item">
                                <div class="num">${index + 1}.</div>
                                <p><span>${instruction}</span></p>
                            </div>`;
    });

    let reviewHtml = '';
    
    obj.reviews.forEach((review,index)=>{
        let delButton = '';
        if(review.author.username == user.username){
            delButton += `<div class="edit button">
                                <button class="btn btn-danger btn-sm fixed-button" onclick="del_review('${review._id}')"> <i class="bi bi-trash3-fill"></i> </button>
                            </div>`
        }

        
        let subButton = '';
        console.log({susbs: user.reviewsubscriptions})
        console.log(review.author._id.toString())
        const isSubscribed = user.reviewsubscriptions.some(subs => subs === review.author._id.toString() );
        console.log(isSubscribed);
        if (!isSubscribed && review.author.username != user.username) {
            subButton += `<div class="edit button">
                                <button class="btn btn-danger btn fixed-button" onclick="sub('${review.author._id}')">Subscribe</button>
                            </div>`;
        } else if (isSubscribed){
            subButton = '';
        }
        
        
        
        reviewHtml += `<div class="container">  
                            <div class="card">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-2">
                                            <img src="https://image.ibb.co/jw55Ex/def_face.jpg" class="img img-rounded img-fluid"/>
                                        </div>
                                        <div class="col-md-10">
                                            <p>
                                                <a class="float-left"><strong>${review.author.username}</strong></a>
                                                
                                                <span class="float-right"> ${review.rating} <i class="bi bi-star-fill"></i></span>
                                                

                                            </p>
                                            <div class="clearfix"></div>
                                                <p style = "color:gray; font-size: 80%"><strong>${review.creation_date}</strong></p>
                                                <p>${review.comment}</p>
                                                <p>
                                                    <a class="float-right ">${subButton} </a>
                                                    <a class = "float- left">${delButton}</a>
                                            </p>
                                            </div>
                                        </div>
                                            
                                    </div>
                                </div>
                            </div>`;
    });
    
    let chatRecipe = '';
    let delButtonChat = '';
    obj.chat.forEach((messa, index) => {
        // Convert timestamp to a Date object
        const dateObj = new Date(messa.timestamp);
        // Format date to a more readable format
        const formattedDate = dateObj.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        if (messa.user == user.username) {
            chatRecipe += `
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <p><strong>${messa.user}:</strong> ${messa.content}</p>
                        <p style="color: gray; font-size: 12px;">${formattedDate}</p>
                    </div>
                    <div class="edit button">
                        <button class="btn btn-danger btn-sm fixed-button" onclick="del_message('${messa._id}')">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </div>
                </div>
            `;
        } else {
            chatRecipe += `
                <div>
                    <p><strong>${messa.user}:</strong> ${messa.content}</p>
                    <p style="color: gray; font-size: 12px;">${formattedDate}</p>
                </div>
            `;
        }
    });
    





    let editbutton_ifuser = '';
    if(user.username == obj.author.username){
        editbutton_ifuser += `<div class="edit button">
                                <button class="btn btn-dark btn-lg fixed-button"
                                data-bs-toggle="modal"
                                data-bs-target="#recipeModal" onclick="render_to_edit()"> EDIT </button>
                              </div>`
    }

    let deletebutton_ifuser = '';
    if(user.username == obj.author.username){
        editbutton_ifuser += `<div class="edit button">
                                <button class="btn btn-danger btn-lg fixed-button"
                                 onclick="Deleterecipe()"> Delete </button>
                              </div>`
    }

    let html = `
                <div class="recipe-img">
                    <img src="${obj.photo}" alt="">
                </div>

                <div class="recipe-info">
                    <h1>${obj.title}</h1>
                    <h2>${obj.author.username}</h2>
                    <h3>${obj.creation_date}</h3>
                    <h3>Rating: ${obj.rating}</h3>
                    <p class="description">${obj.description}</p>
  
                    <div class="recipe-prep-time">
                        <h3>Preparation and Cook time</h3>
                        <ul>
                            <li><span>Total</span>: Approx  ${obj.prep_time + obj.cook_time}</li>
                            <li><span>Preparation</span>: ${obj.prep_time}</li>
                            <li><span>Cooking</span>: ${obj.cook_time}</li>
                        </ul>
                    </div>

                    <div class="recipe-step">
                        <h2>Ingredients</h2>
                        <ul class="ingredients">
                            ${ingredientsHtml}
                        </ul>
                    </div>

                    <hr>

                    <div class="recipe-step">
                        <h2>Instructions</h2>
                        <div class="instructions">
                            ${instructionsHtml}
                        </div>
                    </div>

                    <hr>

                    <div class="chat-area">
                        <div id="chat-messages"><p>${chatRecipe}</p> </div>
                       
                        <input type="text" id="message-input" placeholder="Escribe un mensaje...">
                        <button onclick="addMessageToChat()">Enviar</button>
                       
                    </div>

                    <div class="review-area">
                            ${reviewHtml}
                    </div>

                    <div class="container">
                        <div class="row" id="post-review-box" style="margin-top: 20px;">
                            <div class="col-md-8 offset-md-2">
                                
                                <div class="form-group">
                                    <textarea class="form-control animated" id="new-review" name="comment" placeholder="Enter your review here..." rows="5"></textarea>
                                </div>
                                <div class="form-group row">
                                    <div class="col-md-6">
                                        <input type="number" min="0" max="5" id="new-rating" class="form-control" placeholder="Rating between 0 and 5...">
                                    </div>
                                    <div class="col-md-6 text-right">
                                        <button class="btn btn-success btn-sm"  onclick="addReview()">Save</button>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    </div>


                    ${editbutton_ifuser}

                </div>
    `;

    return html;
}

function render(html, elementId){
    document.querySelector(`#${elementId}`).innerHTML = html;
}

function goBack() {
    window.history.back();
}

let selectedCategories = [];

function render_to_edit()
{
    document.getElementById("edittitle").value = receta.title;
    document.getElementById("editdescription").value = receta.description;
    var ingredientesTexto = receta.ingredients.map(function(ingrediente) {
        return ingrediente.name + ": " + ingrediente.quantity;
    }).join("\n");
    document.getElementById("editingredients").value = ingredientesTexto;
    var pasosTexto = receta.steps.join("\n");
    document.getElementById("editsteps").value = pasosTexto;
    document.getElementById("editphoto").value = receta.photo;
    document.getElementById("editcook_time").value = receta.cook_time;
    document.getElementById("editprep_time").value = receta.prep_time;
    receta.categories.forEach(function(categoria) {
        selectedCategories.push(categoria);
      });
    renderSelectedCategories()

}

function renderCategoryDropdown() {
    var categoryDropdownMenu = document.getElementById("categoryDropdownMenu");
    categoryDropdownMenu.innerHTML = ""; // Limpiar el dropdown antes de renderizar las categorías

    categories.forEach(function(category) {
        var option = document.createElement("li");
        option.classList.add("dropdown-item");
        option.innerHTML = category.name;
        option.setAttribute("data-id", category._id);
        categoryDropdownMenu.appendChild(option);
    });
}
// Manejar clic en una categoría desde el menú desplegable
document.getElementById("categoryDropdownMenu").addEventListener("click", function(event) {
    if (event.target.classList.contains("dropdown-item")) {
        var categoryId = event.target.getAttribute("data-id");
        var categoryName = event.target.innerHTML;
        addCategory(categoryId, categoryName);
    }
});

// Agregar categoría seleccionada
function addCategory(id, name) {
    // Verificar si la categoría ya está seleccionada
    var exists = selectedCategories.find(function(category) {
        return category._id === id;
    });

    if (!exists) {
        selectedCategories.push({ _id: id, name: name });

        // Mostrar la categoría seleccionada
        renderSelectedCategories();

        // Limpiar dropdown
        document.getElementById("categoryDropdownMenuButton").innerHTML = "Seleccionar Categorías";
    }
}

// Renderizar las categorías seleccionadas
function renderSelectedCategories(categoriesin = selectedCategories ) {
    var selectedCategoriesContainer = document.getElementById("selectedCategorieshtml");
    selectedCategoriesContainer.innerHTML = "";

    categoriesin.forEach(function(category) {
        var selectedCategory = document.createElement("div");
        selectedCategory.classList.add("alert", "alert-primary", "alert-dismissible", "fade", "show");
        selectedCategory.innerHTML = `
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" onclick="removeCategory(${category.id})"></button>
            ${category.name}
        `;
        selectedCategoriesContainer.appendChild(selectedCategory);
    });

    console.log({add_categories: categoriesin});
}

// Eliminar categoría seleccionada
function removeCategory(id) {
    var index = selectedCategories.findIndex(obj => obj._id === id);
    if (index !== -1) {
        selectedCategories.splice(index, 1); 
    }

    renderSelectedCategories()
}

async function Deleterecipe()
{
    console.log(recipeId);

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
    if (result.isConfirmed) {
        Swal.fire({
        title: "Deleted!",
        text: "Your file has been deleted.",
        icon: "success"
        });
        let resp = await fetch('/api/recipes/' + recipeId,{
            method :'DELETE'
        })
    
        location.reload();
        window.location.href = "./recipes_page.html";
    }
    });

}

// Manejar el envío del formulario
recipeForm.addEventListener("submit", async function(event) {
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
        return category._id;
    });

    // Enviar los datos a la API o realizar otras acciones según sea necesario
    console.log("Datos de la receta:", recipeData);

    let resp = await fetch('/api/recipes/' + recipeId,{
        method :'PUT',
        headers:{
            'content-type': 'Application/json'
        },
        body: JSON.stringify(recipeData)
    })

    console.log(resp.status);
    let data = await resp.json()
    //console.log(data);

   if(data.error)
   {
        Swal.fire("Error", data.error , "error");
        return;
   }else{
        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "The Recipe has been saved",
            showConfirmButton: false,
            timer: 1500
        });
   }

    // Cerrar el modal
    var modal = bootstrap.Modal.getInstance(document.getElementById("recipeModal"));
    modal.hide();

    loadRecipe(recipeId);
});