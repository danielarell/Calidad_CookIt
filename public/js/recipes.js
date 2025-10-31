let recipes_toShow = [];

document.addEventListener("DOMContentLoaded", function() {
    getData();
});

async function getData()
{
    console.log("hola");
    await DataManager.loadData();

    recipes_toShow = recipesArray.slice();

    console.log(recipes_toShow);
}
