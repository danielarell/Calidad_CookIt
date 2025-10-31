const router = require("express").Router()
const {User} = require('../models/User')
const auth = require('../middleware/auth')
//const {nanoid} = require('nanoid')
const fs = require('fs')
const bcrypt = require('bcrypt');


// console.log(users);
router.get('/', auth.validateHeader, auth.validateAdmin, async (req,res)=>{
    console.log(req.query);
    // console.log(req.get('x-auth'));
    // let token = req.get('x-auth')
    // let admin = false;
    // if(token == '23423')
    //     admin = true;

    let filters = {}

    
    //let filteredUsers = users.slice()
    
    //console.log(filteredUsers);
    let {name, email, minId, maxId, pageSize, pageNumber} = req.query;
    console.log(name, email);

    if(name){
        filters.name = new RegExp(name, 'i'); // /name/i
    }

    let filteredUsers = await User.findUsers(filters, req.admin, 5,1);

    // if(name){
    //     filteredUsers = filteredUsers.filter(u => 
    //                 u.name.toUpperCase().includes(name.toUpperCase())
    //                 )
    // }

    // if(email){
    //     filteredUsers = filteredUsers.filter(u => 
    //                 u.email.toUpperCase().includes(email.toUpperCase())
    //                 )
    // }
    // if(minId){
    //     filteredUsers = filteredUsers.filter(u => u.id >= minId)
    // }
    // if(maxId){
    //     filteredUsers = filteredUsers.filter(u => u.id <= maxId)
    // }

    // pageSize = pageSize? pageSize: 3

    res.send(filteredUsers)
})



router.get('/:_id', async (req, res)=>{
    console.log(req.params.id);
    let user = await User.findUserById(req.params._id)
    if (!user){
        res.status(404).send({error: "User not found"})
        return;
    }
    res.send(user)
})

router.get('/search/me',  auth.validateTokenWithCookie ,async (req, res)=>{
    console.log(req._id);
    let user = await User.findUserById(req._id)
    if (!user){
        res.status(404).send({error: "User not found"})
        return;
    }
    res.send(user)
})


// this will never be reached
router.get('/username/:username', async (req, res)=>{
    console.log(req.params.username);
    let user = await User.findUser(req.params.username);
    if (!user){
        res.status(404).send({error: "User not found"})
        return;
    }
    res.send(user)
})


router.post('/', async (req,res)=>{
    console.log(req.body);
    
    let {email} = req.body.email;
    //let user = users.find(u => u.email == email)
    let user = await User.findUser(email)
    if(user){
        res.status(400).send({error: 'User exists'})
        return 
    }

    if (req.body.userPhoto == ""){
        delete req.body.userPhoto;
    }
    
    let userObj = req.body;

    let newUser = await User.saveUser(userObj)
    //users.push(userObj)
    //fs.writeFileSync('./data/usersdata.json', JSON.stringify(users) )

    res.status(201).send(newUser)
    return
    

    // let error = ''
    // if(name == undefined || !name.trim())
    //     error += 'name is invalid;'
    // if(email == undefined || !email.trim())
    //     error += 'email is invalid'

    // res.status(400).send({error})

})


//updating an existent object
router.put('/update', auth.validateTokenWithCookie, async (req,res)=>{
    //search for the id
    const userId = req._id;

    try {
        const updateUser = await User.findByIdAndUpdate(userId, req.body, { new: true });

        if (!updateUser) {
            res.status(404).send({ error: 'User not found' });
            return;
        }

        res.send(updateUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
})

router.put('/change-password', auth.validateTokenWithCookie, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findOne({ _id: req._id });
    if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
        res.status(400).send({ error: 'Current password is incorrect' });
        return;
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    res.status(200).send({ message: 'Password changed successfully' });
});


router.delete('/username/:username', auth.validateTokenWithCookie, async (req, res)=>{
    // search for the id
    if(req.username != req.params.username)
    {
        res.status(403).send({error: "You dont have permissions"})
        return;
    }
    let pos= await User.deleteUser(req.params.username)
    
    // if not found return 404
    if(!pos){
        res.status(404).send({error: 'User not found'})
        return
    }

    
    res.send({pos})
})

// POST /api/users/:userId/reviews/subscribe
router.post('/:userId/reviews/subscribe', auth.validateTokenWithCookie ,async (req, res) => {
    try {
        const userId = req.params.userId;
        let user = await User.findUserById(req._id);
        const subscriberId = user._id; // ID del usuario autenticado

        // Agregar el ID del usuario a seguir a la lista de suscripciones del usuario actual
        await User.findByIdAndUpdate(subscriberId, { $addToSet: { reviewsubscriptions: userId } });

        res.status(200).send("Usuario suscrito a las reseñas correctamente.");
    } catch (error) {
        res.status(500).send("Error al suscribirse a las reseñas: " + error.message);
    }
});

// DELETE /api/users/:userId/reviews/subscribe
router.delete('/:userId/reviews/subscribe', auth.validateTokenWithCookie, async (req, res) => {
    try {
        const userId = req.params.userId;
        let user = await User.findUserById(req._id);
        const subscriberId = user._id; // ID del usuario autenticado

        // Eliminar el ID del usuario a dejar de seguir de la lista de suscripciones del usuario actual
        await User.findByIdAndUpdate(subscriberId, { $pull: { reviewsubscriptions: userId } });

        res.status(200).send("Suscripción a las reseñas eliminada correctamente.");
    } catch (error) {
        res.status(500).send("Error al eliminar la suscripción a las reseñas: " + error.message);
    }
});

module.exports = router;
