let recipesArray = []
let categories = []
let latest_recipes = []
let newest_recipe;

let actualPage;
let pageSize = 5;

class DataManager
{

    static pruebaID(_id)
    {
        console.log(_id);
    }

    static async loadData(category = null){
    
        console.log(category);
        let resp = await fetch('/api/recipes',{
            method :'GET',
            headers: {
                'x-auth': 23423
            }
        })
    
        console.log(resp.status);
        let data = await resp.json()

        console.log(data);
        
        recipesArray = data.recipes;

        let html = this.toHtml(View.toHtmlList,recipesArray);
        View.render(html, "recipes_display");

        let resp_cat = await fetch('/api/categories',{
            method :'GET',
            headers: {
                'x-auth': 23423
            }
        })
    
        console.log(resp_cat.status);
        let cat = await resp_cat.json()
        
        categories = cat.categories;

        const primeras_3_categorias = categories.slice(0, 3);

        let cat_html = this.toHtml(ViewCategory.toHtmlList,primeras_3_categorias);
        View.render(cat_html, "categories");

        // if(category == null)
        // {
        //     this.pagination(actualPage);
        // }else{
        //     this.filterProducts(category);
        // }
  
    }

    static filterProducts(category)
    {
        recipesArray = recipesArray.filter(e => e.category.toLowerCase().includes(category.toLowerCase()));

        this.pagination(actualPage,prodlist_cat);
    }

    static pagination(page, prodlist = recipesArray, fnToHtml = View.toHtmlList, pagesize = pageSize) {
        
        sessionStorage.setItem("page", page);
        actualPage = page;
    
        // Calcula el índice inicial y final de los productos a mostrar en la página
        let startIndex = (page - 1) * pagesize;
        let endIndex = startIndex + pagesize;
        
        // Filtra los productos para mostrar solo los de la página actual
        let productsToShow = prodlist.slice(startIndex, endIndex);
    
        console.log(productsToShow);

        this.pageLogic(prodlist,pageSize);
    
        // Renderiza los productos de la página actual
        let html = this.toHtml(fnToHtml,productsToShow);
        View.render(html, "card_recipes");
    }

    static toHtml(fnToHtml = View.toHtmlList, prodlist) {
        console.log("entro");
        return fnToHtml(prodlist);
    }

    static pageLogic(prodList, pageSize)
    {
        const totalPages = Math.ceil(prodList.length / pageSize);

        console.log(prodList);

        let paginationHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            let encodedProdList = encodeURIComponent(JSON.stringify(prodList));
            if (i === parseInt(sessionStorage.getItem("page"))) {
                paginationHTML += `<li class="page-item active"><a class="page-link" href="#" onclick="DataManager.pagination(${i}, JSON.parse(decodeURIComponent('${encodedProdList}')))">${i}</a></li>`;
            } else {
                paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="DataManager.pagination(${i}, JSON.parse(decodeURIComponent('${encodedProdList}')))">${i}</a></li>`;
            }
        }


        document.getElementById('pagination').innerHTML = paginationHTML;

        if (totalPages === 0) {
            document.getElementById('pagination').style.display = 'none';
        } else {
            document.getElementById('pagination').style.display = 'flex';
        }
    }
}

class View
{

    static render(html, elementId){
        document.querySelector(`#${elementId}`).innerHTML = html;
    }

    static toHtmlList(list){
        console.log("entro2");
        let html = `
                    ${list.map((prod) => View.toHtmlDiv(prod)).join("")}
                
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
                <a class="btn btn-dark" href="./recipes/single_recipe.html?id=${obj._id}">More Info</a>
            </div>
        </div>
    </div>`;
        return html;
    }

    static toHtmlTable(list, propOrder){
        let html = `<table> 
                        <tr> 
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Category</th>
                            <th>unit</th>
                            <th>image</th>
                            <th>Actions</th>
                        </tr>
                    
                    ${list.map((prod) => View.toHtmlRow(prod)).join("")}
                    </table>
                    `;
        return html;
    }

    static toHtmlRow(obj, propOrder = []) {
        if (propOrder.length === 0) {
            propOrder = ['uuid', 'name', 'description', 'pricePerUnit', 'stock', 'category', 'unit', 'imageUrl'];
        }
        let html = '<tr>';
        for (const prop of propOrder) {
            if(prop =="imageUrl"){
                html+=`<td><img src="${obj[prop]}" alt="" style="width: 50px;"></td>`
            }else
            html+=`<td>${obj[prop]}</td>`
        }
        html += `<td>
                    <a
                        class="btn btn-primary"
                        href="#"
                        role="button"
                        onclick = "editProduct('${obj.uuid}')"
                        ><i class="bi bi-pencil-fill"></i>
                    </a>
                </td>`
        html += '</tr>';
        return html;
    }
    
}

class ViewCategory
{

    static render(html, elementId){
        document.querySelector(`#${elementId}`).innerHTML = html;
    }

    static toHtmlList(list){
        console.log("entro2");
        let html = `
                    ${list.map((prod) => ViewCategory.toHtmlDiv(prod)).join("")}
                
                    `;
        return html;
    }
    
    static toHtmlDiv(obj) {
        console.log("entro3");
        let html = `<div class="col-lg-4">
                        <div class="bd-placeholder-img rounded-circle" style="width: 200px; height: 200px;">
                            <img src="${obj.photo}" alt="" class="w-100">
                        </div>
    
                        <h2>${obj.name}</h2>
                        <p><a class="btn btn-secondary" href="./Search_Page/index.html?category=${obj.name}">View details &raquo;</a></p>
                    </div>`;
        return html;
        
    }
}