const {mongoose} = require("../DB/connectDB")
const {Recipe} = require("../models/Recipe.js")


let reviewSchema = mongoose.Schema({
    comment: {
        type: String,
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
    rating: {
        type: Number,
        default: 0,
        required: true
    }
})

reviewSchema.statics.saveReview = async (_id,reviewData, recipeId)=>{
    reviewData.author = _id;

    var fechaActual = new Date();
    // Obtener la fecha en formato "YYYY-MM-DD"
    var fechaFormateada = fechaActual.toISOString().split('T')[0];

    reviewData.creation_date = fechaFormateada;

    let newReview = Review(reviewData);
    let doc = await newReview.save();

    const {User} = require('../models/User.js');

    await User.addMyReviews(_id, doc._id);
    await Recipe.addReviews(recipeId, doc._id);
    await Recipe.calculateRating(recipeId);
    return doc;

}

// eslint-disable-next-line no-unused-vars
reviewSchema.statics.deleteReview = async (_id, recipeId)=>{
    let deletedReview = await Review.findOneAndDelete({_id})
    console.log(deletedReview);
    return deletedReview;
}

let Review = mongoose.model('Review', reviewSchema);

module.exports = {Review};