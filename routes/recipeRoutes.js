const router = require('express').Router();
// eslint-disable-next-line no-unused-vars
const { fileURLToPath } = require('url');
// eslint-disable-next-line no-unused-vars
const recipes = require('../Data/recipesData.json');
const {Recipe} = require('../models/Recipe.js');
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const {User} = require('../models/User.js');
const auth = require('../middleware/auth.js');
const {Post} = require('../models/Message.js');


router.get('/',  auth.addSkipLimittoGet(),async (req, res) => {
    let filters = {};
    let recipes = await Recipe.findRecipes(filters, 10, 1, req.skip, req.limit);
    res.json(recipes);
});

router.get('/search', async (req, res) => {
    try {
        let filters = {};

        // Add filters
        if (req.query) {
            // Exact filters
            for (const key in req.query) {
                if (req.query.hasOwnProperty(key)) {
                    if (key === 'title' || key === 'description' || key === 'author') {
                        filters[key] = req.query[key];
                        console.log({ filtro: filters, valor: req.query[key] });
                    } else if (key === 'creation_date') {
                        // Assuming req.query[key] contains the date in "YYYY-MM-DD" format
                        const dateValue = new Date(req.query[key]);
                        // Set the filter to match the entire day
                        filters[key] = {
                            $gte: dateValue, // Greater than or equal to the start of the day
                            $lt: new Date(dateValue.getTime() + 24 * 60 * 60 * 1000), // Less than the start of the next day
                        };
                    } else if (key === 'cook_time' || key === 'prep_time') {
                        // Assuming req.query[key] contains the time in minutes (e.g., "30")
                        const timeInMinutes = parseInt(req.query[key], 10);
                        filters[key] = timeInMinutes;
                    } else if (key === 'cook_time_gt' || key === 'prep_time_gt') {
                        // More than (>)
                        const timeInMinutes = parseInt(req.query[key], 10);
                        filters[key] = { $gt: timeInMinutes };
                    } else if (key === 'prep_time_gte' || key === 'cook_time_gte') {
                        // More than or equal to (>=)
                        const timeInMinutes = parseInt(req.query[key], 10);
                        filters[key] = { $gte: timeInMinutes };
                    } else if (key === 'cook_time_lte' || key === 'prep_time_lte') {
                        // Less than or equal to (<=)
                        const timeInMinutes = parseInt(req.query[key], 10);
                        filters[key] = { $lte: timeInMinutes };
                    } else if (key === 'prep_time_lt' || key === 'cook_time_lt') {
                        // Less than (<)
                        const timeInMinutes = parseInt(req.query[key], 10);
                        filters[key] = { $lt: timeInMinutes };
                    } else {
                        filters[key] = req.query[key];
                    }
                }
            }
        }

        console.log({estelog: filters});
        let recipes = await Recipe.findRecipes(filters, 10, 1);
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Error fetching recipes' });
    }
});

router.get('/mine', auth.validateTokenWithCookie, async (req,res)=>{
    console.log('owner', req.username, req._id);
    const myrecipes =  await Recipe.getRecipes(req._id);
    
    res.send(myrecipes);
});

router.get('/favorites', auth.validateTokenWithCookie, async (req,res)=>{
    let recipes = await User.getFavorites(req._id);
    res.send(recipes);
});

router.post('/favorites/:recipeId', auth.validateTokenWithCookie, async (req,res)=>{
    let recipe = await Recipe.findById(req.params.recipeId);
    if(!recipe){
        res.status(404).send('Recipe doesnt exists');
        return;
    }
    let status = await User.addFavorites(req.username, req.params.recipeId);
    res.send(status);
});

router.delete('/favorites/:recipeId', auth.validateTokenWithCookie, async (req,res)=>{
    let recipe = await Recipe.findById(req.params.recipeId);
    if(!recipe){
        res.status(404).send('Recipe doesnt exists');
        return;
    }
    let status = await User.removeFavorites(req.username, req.params.recipeId);
    res.send(status);
});

router.get('/chat/:recipeId', async (req, res)=>{
    let chat = await Recipe.getChat(req.params.recipeId);
    res.send(chat);
});

// Operación POST para crear una nueva receta
router.post('/', auth.validateTokenWithCookie,async (req, res) => {
    console.log(User);
    console.log(req.body);
    let recipe = req.body;
    // eslint-disable-next-line no-unused-vars
    let newRecipe = await Recipe.saveRecipe(req.username, req._id, recipe);
    res.send(recipe);
});

// Operación GET para obtener una receta por su ID
router.get('/:recipeId', auth.validateTokenWithCookie, async (req, res) => {
    // eslint-disable-next-line no-unused-vars
    let filters = {};
    let recipe = await Recipe.findRecipe(req.params.recipeId);
    if(!recipe){
        res.status(404).send({error: 'Recipe Not Found'});
        return;
    }    

    res.send(recipe);
});

// Operación DELETE para eliminar una receta por su ID
router.delete('/:recipeId',auth.validateTokenWithCookie ,async (req, res) => {
    const recipeId = req.params.recipeId;
    let recipe = await Recipe.findRecipe(recipeId);
    console.log(recipe);
    if(!recipe){
        res.status(404).send({error: 'Recipe Not Found'});
        return;
    } 

    if(recipe.author._id != req._id){
        res.status(403).send({error: 'You dont have permissions'});
        return;
    }

    let recipedeleted = await Recipe.deleteRecipe(recipeId);
    await User.removeMyRecipes(req.username, req.params.recipeId);
    res.send(recipedeleted);
});

// Operación PUT para actualizar una receta por su ID
router.put('/:recipeId', auth.validateTokenWithCookie, async (req, res) => {
    let recipe = await Recipe.findById(req.params.recipeId);

    console.log(recipe.author._id.toString());
    if (!recipe){
        // return 404 not found 
        res.status(404).send({error: 'Recipe not found'});
        return;
    }

    if(req._id != recipe.author._id.toString()){
        res.status(403).send({error: 'You are not the owner'});
        return;
    }

    let updateRecipe = await Recipe.updateRecipe(recipe._id, req.body);
    //fs.writeFileSync('./data/usersdata.json', JSON.stringify(users) )
    res.send(updateRecipe);
});

// Endpoint para añadir un mensaje al chat de una receta específica
router.post('/:recipeId/chat',auth.validateTokenWithCookie,async (req, res) => {
    try {
        const user = req.username;
        const { content } = req.body;
        const recipeId = req.params.recipeId;

        console.log(user);

        //Verificar si la receta existe
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: 'Receta no encontrada' });
        }

        // Crear el mensaje
        const message = new Post({ user, content });

        // Guardar el mensaje en la base de datos
        await message.save();

        // Añadir el ID del mensaje al chat de la receta
        recipe.chat.push(message._id);
        await recipe.save();

        res.status(201).json({ message: 'Mensaje añadido al chat de la receta correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al añadir mensaje al chat de la receta', error: error.message });
    }
});

module.exports = router;
