const router = require("express").Router()
const { fileURLToPath } = require("url");
const recipes = require('../Data/recipesData.json')
const {Recipe} = require('../models/Recipe.js')
const fs = require('fs');
const {User} = require('../models/User.js');
const auth = require('../middleware/auth.js');
const {Post} = require('../models/Message.js');



router.post('/:recipeId', auth.validateToken ,async (req, res) => {
    console.log(req.body);
    let message = req.body;
    let newMessage = await Post.saveMessage(req.username, req.params.recipeId,message);
    res.send(message);
});

router.delete('/:recipeId/:messageId', auth.validateTokenWithCookie, async (req, res) => {
    const messageid = req.params.messageId;
    let message = await Post.findById(messageid);
    if(!message){
        res.status(404).send({error: "Message Not Found"})
        return;
    }
    await Recipe.removeMessage(messageid, req.params.recipeId);
    let messageDeleted = await Post.deleteMessage(messageid, req.params.recipeId);
    res.send(messageDeleted);

});

module.exports = router;