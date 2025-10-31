const {mongoose} = require("../DB/connectDB")
const {Post} = require('./Message')
const {User} = require('./User')
//const {Category} = require('./Category')
const {nanoid} = require('nanoid')

let recipeSchema = mongoose.Schema({
    uid: {
        type: String,
        unique: true,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    ingredients: {
        type: Array,
        required: true
    },
    steps: {
        type: Array,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    creation_date: {
        type: String,
        format: Date,
        required: true
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        default: []
    }],
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: []
    }],
    rating: {
        type: Number,
        default: 0
    },
    photo: {
        type: String,
        required: true
    },
    cook_time: {
        type: Number,
        required: true
    },
    prep_time: {
        type: Number,
        required: true
    },
    chat: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: []
    }]
})

// eslint-disable-next-line no-unused-vars
recipeSchema.statics.findRecipes = async (filter, _pageSize = 10, _pageNumber = 1, skip = 0, limit = 0) => {
    let proj = {};
    let regexFilter = {};
    let cadena = '';
    
    for (const key in filter) {
        if (key === 'title' || key === 'description') {
            console.log({key: key, valor: filter[key]})
            regexFilter[key] = { $regex: filter[key], $options: 'i' };
        }

        if(Object.prototype.hasOwnProperty.call(filter, key) && (key == 'cook_time' || key == 'prep_time')){
            regexFilter[key] = filter[key]
        }

        if(Object.prototype.hasOwnProperty.call(filter, key) && (key == 'cook_time_gt' || key == 'prep_time_gt')){
            cadena = key.slice(0, -3);
            regexFilter[cadena] = filter[key]
        }

        if(Object.prototype.hasOwnProperty.call(filter, key) && (key == 'cook_time_lt' || key == 'prep_time_lt')){
            cadena = key.slice(0, -3);
            regexFilter[cadena] = filter[key]
        }

        if(Object.prototype.hasOwnProperty.call(filter, key) && (key == 'cook_time_gte' || key == 'prep_time_gte')){
            cadena = key.slice(0, -4);
            regexFilter[cadena] = filter[key]
        }

        if(Object.prototype.hasOwnProperty.call(filter, key) && (key == 'cook_time_lte' || key == 'prep_time_lte')){
            cadena = key.slice(0, -4);
            regexFilter[cadena] = filter[key]
        }
    }

    console.log(regexFilter)

    let docs = Recipe.find(regexFilter, proj).skip(skip).limit(limit).sort({ creation_date: 1 }).populate('author', 'username userPhoto').populate('categories', 'name').populate('chat', 'user content');
    let count = Recipe.find(regexFilter).count();

    let resp = await Promise.all([docs, count]);

    console.log(resp[0], resp[1]);

    if (filter.categories) {
        resp[0] = resp[0].filter(objeto => {
            return objeto.categories.some(categoria => categoria.name.toLowerCase() === filter.categories.toLowerCase());
        });
    }

    if(filter.ingredients){
        const filtroIngredientes = filter.ingredients.toLowerCase();

        resp[0] = resp[0].filter(objeto => {
            // Verificar si alguno de los nombres de ingredientes contiene la cadena de filtro, ignorando las mayúsculas/minúsculas
            return objeto.ingredients.some(ingredient => {
                // Verificar si ingredient y ingredient.name están definidos antes de llamar a toLowerCase()
                if (ingredient && ingredient.name) {
                    return ingredient.name.toLowerCase().includes(filtroIngredientes);
                }
                return false; // Si ingredient o ingredient.name es undefined, retornar false
            });
        });
    }

    if(filter.author){
        resp[0] = resp[0].filter(obj => {
            return obj.author.username.includes(filter.author)
        })
    }

    if(filter.steps){
        resp[0] = resp[0].filter(obj => {
            return obj.steps.length == filter.steps
        })
    }

    console.log({ user: User });
    return { recipes: resp[0], total: resp[1] };
};

recipeSchema.statics.getRecipes = async (_id)=>{
    try {

        let recipes = await Recipe.find({ author: _id });
        console.log(recipes);
        return recipes;
    } catch (error) {
        console.error('Error al obtener recetas:', error);
        throw error;
    }
}

recipeSchema.statics.removeReviews = async (reviewId, recipeId) => {
    let recipe = await Recipe.findById(recipeId);
    if(recipe){
        
        var indiceAEliminar = recipe.reviews.findIndex(function(review) {
            return review._id == reviewId;
        });

        // Si se encuentra el objeto, eliminarlo
        if (indiceAEliminar !== -1) {
            recipe.reviews.splice(indiceAEliminar, 1);
            await recipe.save(); // Guardar los cambios en la base de datos
            return { success: true };
        } else {
            return { error: "review not found in recipe's reviews" };
        }
    }

    return {error: "recipe not found"};
}

recipeSchema.statics.removeMessage = async (messageId, recipeId) => {
    let recipe = await Recipe.findById(recipeId);
    if(recipe){
        
        var indiceAEliminar = recipe.chat.findIndex(function(message) {
            return message._id == messageId;
        });

        // Si se encuentra el objeto, eliminarlo
        if (indiceAEliminar !== -1) {
            recipe.chat.splice(indiceAEliminar, 1);
            await recipe.save(); // Guardar los cambios en la base de datos
            return { success: true };
        } else {
            return { error: "Message not found in recipe's chat" };
        }
    }

    return {error: "recipe not found"};
}

recipeSchema.statics.getChat = async (recipeId) => {
    try {
        // Buscar la receta por su ID
        const recipe = await Recipe.findById(recipeId);
        
        if (!recipe) {
            throw new Error('Receta no encontrada');
        }

        // Obtener los mensajes de la receta con los campos deseados
        const chat = await Post.find({ _id: { $in: recipe.chat } }, 'user content timestamp -_id');

        return chat;
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        throw error;
    }
}

recipeSchema.statics.addMessages = async (recipeId, messageId) => {
    let recipe = await Recipe.findById(recipeId);
    if(recipe){
        recipe.chat.push(messageId);
        return await recipe.save();
    }

    return {error: "Recipe not found"};
}

recipeSchema.statics.deleteMessages = async (recipeId, messageId) => {
    let recipe = await Recipe.findById(recipeId);
    if(recipe){
        recipe.chat.push(messageId);
        return await recipe.save();
    }

    return {error: "Recipe not found"};
}

recipeSchema.statics.addReviews = async (recipeId, reviewId) => {
    let recipe = await Recipe.findById(recipeId);
    if(recipe){
        recipe.reviews.push(reviewId);
        return await recipe.save();
    }

    return {error: "Recipe not found"};
}

recipeSchema.statics.saveRecipe = async (username, _id, recipeData)=>{

    let id = _id;

    recipeData.author = id;

    recipeData.uid = nanoid(6);

    var fechaActual = new Date();
    // Obtener la fecha en formato "YYYY-MM-DD"
    var fechaFormateada = fechaActual.toISOString().split('T')[0];

    recipeData.creation_date = fechaFormateada;

    let newRecipe = Recipe(recipeData);
    let doc = await newRecipe.save();

    await User.addrecipes(username, doc._id);
    return doc;

}

recipeSchema.statics.findRecipe = async (_id) => {
    try {
        //let proj = {}
        let recipe = await Recipe.findById(_id).populate('author', 'username').populate({path: 'reviews', populate: {path: 'author' , model:'User' , select: 'username' } }).populate('categories', 'name').populate('chat', 'user content timestamp');
        console.log(recipe);

        if (!recipe) {
            throw new Error('No se encontró la receta');
        }

        // Asegúrate de que la receta tiene una propiedad 'author'
        if (!recipe.author) {
            throw new Error('La receta no tiene autor');
        }

        return recipe;
    } catch (error) {
        console.error('Error al encontrar la receta:', error);
        // Manejar el error adecuadamente
    }
}

recipeSchema.statics.updateRecipe = async (_id, recipeData)=>{
    delete recipeData.rating;
    delete recipeData.author;
    let updateRecipe = await Recipe.findOneAndUpdate({_id},
                                {$set: recipeData},
                                {new: true}
                            )
    return updateRecipe;
}

recipeSchema.statics.deleteRecipe = async (_id)=>{
    let deletedRecipe = await Recipe.findOneAndDelete({_id})
    console.log(deletedRecipe);
    return deletedRecipe;
}

recipeSchema.statics.calculateRating = async (_id)=>{
    let recipe_to_calculate = await Recipe.findRecipe(_id);
    let total = 0;
    
    console.log(recipe_to_calculate)
    let len = recipe_to_calculate.reviews.length
    recipe_to_calculate.reviews.forEach(review => {
        total += review.rating
    })

    if (len == 0)
        recipe_to_calculate.rating = 0;
    else
        recipe_to_calculate.rating = total/len;

    console.log({valor: recipe_to_calculate.rating })
    await recipe_to_calculate.save()
    return recipe_to_calculate
}

let Recipe = mongoose.model('Recipe', recipeSchema);


// async  function createAndShow(){
//     let doc = await Recipe.saveRecipe({
//         "instructions": [],
//         "title": 'Mole Negro',
//         "description": 'Puerco en salsa de chile pasilla',
//         "ingredients": [ 'lomo', 'chile pasilla' ],
//         "steps": [ 'cocinar', 'comer' ],
//         "author": '6620682a8c79b23fa54bd305',
//         "creation_date": 'Wed Apr 17 2024 00:00:00 GMT-0600 (Central Standard Time)',
//         "reviews": [ 'muy rica y deliciosa' ],
//         "categories": [ 'mexican' ],
//         "rating": 5,
//         "uid": '2',
//         "photo": 'https://www.hazteveg.com/img/recipes/full/202002/R06-92840.jpg',
//         "cook_time": 30,
//         "prep_time": 45
//     });
    
// }

//createAndShow();

Recipe.findRecipes({},true, 4, 1);


module.exports = {Recipe};