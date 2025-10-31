let categories_toShow = [];

document.addEventListener("DOMContentLoaded", function() {
    getData();
});

async function getData()
{
    //console.log("hola");
    await categoryManager.loadData();

    categories_toShow = categories.slice();

    console.log(categories_toShow);
}
