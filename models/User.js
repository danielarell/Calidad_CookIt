const {mongoose} = require('../DB/connectDB');
const bcrypt = require('bcryptjs');


let userSchema = mongoose.Schema({
    uid:{
        type: Number
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    userPhoto: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    },
    name:{
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    email:{
        type: String,
        unique: true,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    birthday: {
        type: String,
        format: Date
    },
    country: {
        type: String,
        required: true
    },
    myrecipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        deafult: []
    }],
    myreviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        default: []
    }],
    reviewsubscriptions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        deafult: []
    }],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        default: []
    }]
});

// eslint-disable-next-line no-unused-vars
userSchema.statics.findUsers= async (filter, isAdmin = false, pageSize=4, pageNumber=1)=>{
    let proj = isAdmin? {}:{name: 1, email:1, _id:0};
    // let docs = await User.find(filter, proj).skip(3).limit(2); filtrar por página,
    let docs = User.find(filter, proj).sort({name: 1}).populate('myrecipes', 'title').populate('friends', 'username name').populate('reviewsubscriptions', 'username').populate({
        path: 'favorites',
        select: 'title', // Selecciona solo el título de cada favorito
        populate: { // Anidamos otra llamada a populate para el atributo 'author' de cada favorito
            path: 'author',
            select: 'username' // Selecciona solo el nombre de usuario del autor de cada favorito
        }
    });
    let count = User.find(filter).count();

    let resp = await Promise.all([docs, count]);

    //console.log("my recipes" + resp[0][0].myrecipes);

    console.log(resp);

    

    return {users: resp[0], total: resp[1]};
};

userSchema.statics.addrecipes = async (username, recipeId) => {
    console.log('entro');
    let user = await User.findOne({username});
    if(user){
        user.myrecipes.push(recipeId);
        return await user.save();
    }

    return {error: 'User not found'};
};

userSchema.statics.addMyReviews = async (_id, reviewId) => {
    let user = await User.findOne({_id});
    if(user)
    {
        user.myreviews.push(reviewId);
        return await user.save();
    }

    return {error: 'User not found'};
};

userSchema.statics.addFavorites = async (username, recipeId) => {
    let user = await User.findOne({username});
    if(user){
        // Verificar si la receta ya está en la lista de favoritos
        if(user.favorites.includes(recipeId)) {
            return { error: 'Recipe already exists in user\'s favorites' };
        } else {
            user.favorites.push(recipeId);
            return await user.save();
        }
    }

    return {error: 'User not found'};
};

userSchema.statics.removeFavorites = async (username, recipeId) => {
    let user = await User.findOne({username});
    if(user){
        // Buscar el índice del objeto con el ID de la receta en los favoritos del usuario
        var indiceAEliminar = user.favorites.findIndex(function(favorite) {
            return favorite._id == recipeId;
        });

        // Si se encuentra el objeto, eliminarlo
        if (indiceAEliminar !== -1) {
            user.favorites.splice(indiceAEliminar, 1);
            await user.save(); // Guardar los cambios en la base de datos
            return { success: true };
        } else {
            return { error: 'Recipe not found in user\'s favorites' };
        }
    }

    return {error: 'User not found'};
};

userSchema.statics.removeMyRecipes = async (username, recipeId) => {
    let user = await User.findOne({username});
    if(user){
        // Buscar el índice del objeto con el ID de la receta en los favoritos del usuario
        var indiceAEliminar = user.myrecipes.findIndex(function(recipe) {
            return recipe._id == recipeId;
        });

        // Si se encuentra el objeto, eliminarlo
        if (indiceAEliminar !== -1) {
            user.myrecipes.splice(indiceAEliminar, 1);
            await user.save(); // Guardar los cambios en la base de datos
            return { success: true };
        } else {
            return { error: 'Recipe not found in user\'s favorites' };
        }
    }

    return {error: 'User not found'};
};

userSchema.statics.getFavorites = async (userId) => {
    try {
        // Buscar al usuario por su ID
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const {Recipe} = require('./Recipe');

        // Obtener las recetas favoritas del usuario
        const favorites = await Recipe.find({ _id: { $in: user.favorites } });

        return favorites;
    } catch (error) {
        console.error('Error al obtener recetas favoritas:', error);
        throw error;
    }
};

userSchema.statics.addFriends = async (username, friendId) => {
    let user = await User.findOne({username});
    if(user)
    {
        user.friends.push(friendId);
        return await user.save();
    }

    return {error: 'user not found'};
};

userSchema.statics.saveUser = async (userData)=>{

    try {
        let hash = bcrypt.hashSync(userData.password, 10);
        userData.password = hash; 
        let newUser = User(userData);
        let doc =  await newUser.save();
        return doc;
    }catch(error)
    {
        return {error_mesg : error.errmsg};
    }
};

userSchema.statics.findUser = async (username)=>{
    let user = await User.findOne({username});
    return user;
};

userSchema.statics.findUserById = async (_id)=>{
    /*
    let proj = {username: 1, myrecipes: 1, favorites: 1};
    let user = await User.findById(_id).populate('myrecipes', 'title').populate('favorites', 'title');*/
    let user = await User.findById(_id);
    return user;
};

userSchema.statics.updateUser = async (email, userData)=>{
    delete userData.email;
    if (userData.password){
        let hash = bcrypt.hashSync(userData.password, 10);
        userData.password = hash; 
    }
    let updateUser = await User.findOneAndUpdate({email},
                                {$set: userData},
                                {new: true}
                            );
    return updateUser;
};

userSchema.statics.deleteUser = async (username)=>{
    let deletedUser = await User.findOneAndDelete({username});
    console.log(deletedUser);
    return deletedUser;
};

userSchema.statics.authUser = async(email, password)=>{
    let user = await User.findOne({email});

    if(!user)
        return null;

    if (bcrypt.compareSync(password, user.password)){
        return user;
    }

    return null;
};

let User = mongoose.model('User', userSchema);

// async  function createAndShow(){
//     let doc = await User.saveUser({
//         "name": 'Gemini',
//         "email": 'Gemini@gmail.com',
//         "password": 'gemini'
//     });
    
// }

//createAndShow();

//User.findUsers({},true, 4, 1);


module.exports = {User};