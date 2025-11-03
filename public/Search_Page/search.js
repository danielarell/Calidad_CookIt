let recipes_toShow = [];
let categories = [];
let ingredientesArray = [];

let actualpage;
let pageSize = 6;

function getParameterByCategory(name, url) {
    console.log(url);
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    console.log(results);
    return decodeURIComponent(results[2].replace(/\+/g, ' '));

}

document.addEventListener('DOMContentLoaded', function() {
    getData();
    actualpage = sessionStorage.getItem('recipe_page') || 1;
});


async function getData()
{
    let resp = await fetch('/api/recipes/search',{
        method :'GET'
    });

    console.log(resp.status);
    let data = await resp.json();

    console.log(data);
    
    recipes_toShow = data.recipes;

    // let html = toHtml(View.toHtmlList,recipes_toShow);
    // View.render(html, "recipes_display");

    pagination(actualpage);

    loadCategories();
    
}

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

    categorySelect();

    let category = getParameterByCategory('category');
    if (category) {
        document.querySelector('#categorySelect').value = category;
        readFilterValues();
    }

}

function categorySelect() {
    var categorySelectMenu = document.getElementById('categorySelect');

    categories.forEach(function(category) {
        var option = document.createElement('option');
        option.innerHTML = category.name;
        option.setAttribute('value', category.name);
        categorySelectMenu.appendChild(option);
    });
}

function toHtml(fnToHtml = View.toHtmlList, prodlist) {
    console.log('entro');
    return fnToHtml(prodlist);
}

function pagination(page=1, prodlist = recipes_toShow, fnToHtml = View.toHtmlList, pagesize = pageSize) {
        
    sessionStorage.setItem('recipe_page', page);
    actualpage = page;

    // Calcula el índice inicial y final de los productos a mostrar en la página
    let startIndex = (page - 1) * pagesize;
    let endIndex = startIndex + pagesize;
    
    // Filtra los productos para mostrar solo los de la página actual
    let recipes_to_show = prodlist.slice(startIndex, endIndex);

    console.log(recipes_to_show);

    pageLogic(prodlist,pageSize);

    // Renderiza los productos de la página actual
    let html = toHtml(fnToHtml,recipes_to_show);
    View.render(html, 'recipes_display');
}


function pageLogic(prodList, pageSize)
{
    const totalPages = Math.ceil(prodList.length / pageSize);

    console.log(prodList);

    let paginationHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        if (i === parseInt(sessionStorage.getItem('recipe_page'))) {
            paginationHTML += `<li class="page-item active"><a class="page-link" href="#" onclick="pagination(${i})">${i}</a></li>`;
        } else {
            paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="pagination(${i})">${i}</a></li>`;
        }
    }


    document.getElementById('pagination').innerHTML = paginationHTML;

    if (totalPages === 0) {
        document.getElementById('pagination').style.display = 'none';
    } else {
        document.getElementById('pagination').style.display = 'flex';
    }
}

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

document.querySelector('#filterBtn').addEventListener('click', readFilterValues);

document.querySelector('#resetfilters').addEventListener('click', resetvalues);

function resetvalues()
{
    // Resetear los valores de los inputs
    document.querySelector('#Arrayselect').value = '0';
    document.querySelector('#categorySelect').value = '0';

    // Resetear el valor del dropdown
    document.querySelector('#title').value = '';
    document.querySelector('#ingredients').value = '';
    document.querySelector('#min_preptime').value = '';
    document.querySelector('#max_preptime').value = '';
    document.querySelector('#min_cooktime').value = '';
    document.querySelector('#max_cooktime').value = '';
    document.querySelector('#minsteps').value = '';
    document.querySelector('#maxsteps').value = '';
    document.querySelector('#min_rating').value = '';
    document.querySelector('#max_rating').value = '';

    ingredientesArray = [];

    readFilterValues();

}


async function readFilterValues() {

    let resp = await fetch('/api/users/search/me',{
        method :'GET'
    });

    console.log(resp.status);
    let data = await resp.json();

    console.log(data);

    let selectedArray = document.querySelector('#Arrayselect').value;
    let selectedCategory = document.querySelector('#categorySelect').value;
    let selectedTitle = document.querySelector('#title').value;
    let selectedIngredient = document.querySelector('#ingredients').value;
    if(selectedIngredient != '')
        {
            ingredientesArray = selectedIngredient.split(',');
            console.log({ingredients: ingredientesArray});
        }
    let selectedminprepTime = document.querySelector('#min_preptime').value;
    let selectedmaxprepTime = document.querySelector('#max_preptime').value;
    let selectedmincookTime = document.querySelector('#min_cooktime').value;
    let selectedmaxcookTime = document.querySelector('#max_cooktime').value;
    let selectedminsteps = document.querySelector('#minsteps').value;
    let selectedmaxsteps = document.querySelector('#maxsteps').value;
    let selectedminrating = document.querySelector('#min_rating').value;
    let selectedmaxrating = document.querySelector('#max_rating').value;
    console.log({rating: selectedminrating});
    // let minPrice = document.querySelector('#minPrice').value;
    // let maxPrice = document.querySelector('#maxPrice').value;

    console.log('Selected array:', selectedArray);
    console.log('Selected category:', selectedCategory);
    // console.log('Minimum Price:', minPrice);
    // console.log('Maximum Price:', maxPrice);

    let recipelist = recipes_toShow.slice();

    if(selectedArray == 'all')
    {
        //We will search in all the recipes
        recipelist = recipelist;
    }
    else if(selectedArray == 'mine'){
        recipelist = recipelist.filter(recipe => recipe.author.username == data.username);
    }else if(selectedArray == 'favorites'){
        //we will search in my favorites
        recipelist = recipelist.filter(obj1 => data.favorites.some(obj2 => obj1._id == obj2._id));
    }

    if(selectedCategory != '0')
    {
        recipelist = recipelist.filter(objeto =>
            objeto.categories.some(categoria => categoria.name == selectedCategory)
        );
    }

    if(selectedTitle)
    {
        recipelist = recipelist.filter(objeto => 
            objeto.title.toLowerCase().includes(selectedTitle.toLowerCase())
        );
    }

    if (ingredientesArray.length != 0) {
        recipelist = recipelist.filter(objeto =>
            objeto.ingredients.some(ingredient =>
                selectedIngredient.includes(ingredient.name)
            )
        );
    }

    if(selectedminprepTime)
    {
        recipelist = recipelist.filter(objeto => 
            objeto.prep_time >= parseInt(selectedminprepTime)
        );
    }

    if(selectedmaxprepTime)
    {
        recipelist = recipelist.filter(objeto => 
            objeto.prep_time <= parseInt(selectedmaxprepTime)
        );
    }

    if(selectedmaxcookTime)
    {
        recipelist = recipelist.filter(objeto => 
            objeto.cook_time <= parseInt(selectedmaxcookTime)
        );
    }

    if(selectedmincookTime)
    {
        recipelist = recipelist.filter(objeto => 
            objeto.cook_time >= parseInt(selectedmincookTime)
        );
    }

    if(selectedminsteps)
    {
        recipelist = recipelist.filter(objeto => 
            objeto.steps.length >= parseInt(selectedminsteps)
        );
    }

    if(selectedmaxsteps)
    {
        recipelist = recipelist.filter(objeto => 
            objeto.steps.length <= parseInt(selectedmaxsteps)
        );
    }

    if(selectedmaxrating)
    {
        recipelist = recipelist.filter(objeto => 
            objeto.rating <= parseInt(selectedmaxrating)
        );
    }

    if(selectedminrating)
    {
        recipelist = recipelist.filter(objeto => 
            objeto.rating >= parseInt(selectedminrating)
        );
    }
    

    console.log(recipelist);

    
    pagination(1,recipelist,View.toHtmlList);


    
}

// eslint-disable-next-line no-unused-vars
function showUsersTable(prodlist)
{
    DataManager.pagination(1,prodlist,View.toHtmlTable, 1000);
}



