const mongoose = require('mongoose');
//const {User} = require("./User");
const {Recipe} = require('./Recipe');

// Schema para los mensajes del chat
let messageSchema = new mongoose.Schema({
    user: { 
        type: String, 
        required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

messageSchema.statics.saveMessage = async (username, recipeId, messageData)=>{
    let user = username;

    messageData.user = user ;

    let newMessage = Post(messageData);
    let doc = await newMessage.save();

    await Recipe.addMessages(recipeId, doc._id);
    return doc;

};

messageSchema.statics.deleteMessage = async (_id, recipeId)=>{
   let deletedMessage = await Post.findOneAndDelete({_id});
   console.log(recipeId);
   console.log(deletedMessage);
   return deletedMessage;
};



let Post = mongoose.model('Message', messageSchema);

module.exports = {Post};
