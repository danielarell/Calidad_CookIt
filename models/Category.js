const {mongoose} = require('../DB/connectDB');
const {User} = require('./User');
const {nanoid} = require('nanoid');


let categorySchema = mongoose.Schema({
    uid:{
        type: String,
        unique: true,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    photo:{
        type: String,
        required: true
    }
});

categorySchema.statics.findCategories= async (filter)=>{
    let proj = {};
    // let docs = await User.find(filter, proj).skip(3).limit(2); filtrar por página,
    let docs = Category.find(filter, proj).sort({name: 1});
    let count = Category.find(filter).count();

    let resp = await Promise.all([docs, count]);

    console.log(resp[0], resp[1]);

    return {categories: resp[0], total: resp[1]};
};

categorySchema.statics.saveCategory = async (categoryData)=>{
    categoryData.uid = nanoid(6);
    let newCategory = Category(categoryData);
    return await newCategory.save();
};

categorySchema.statics.findCategory = async (name)=>{
    let category = await Category.findOne({name});
    return category;
};

categorySchema.statics.findCategoryById = async (_id)=>{
    let proj = {name: 1};
    let category = await Category.findById({_id},proj);
    return category;
};

categorySchema.statics.updateCategory = async (name, categoryData)=>{
    delete categoryData.uid;
    let updateCategory = await User.findOneAndUpdate({name},
                                {$set: categoryData},
                                {new: true}
                            );
    return updateCategory;
};

categorySchema.statics.deleteCategory = async (name)=>{
    let deletedCategory = await User.findOneAndDelete({name});
    console.log(deletedCategory);
    return deletedCategory;
};

let Category = mongoose.model('Category', categorySchema);

// async  function createAndShow(){
//     let doc = await User.saveUser({
//         "name": 'Gemini',
//         "email": 'Gemini@gmail.com',
//         "password": 'gemini'
//     });
    
// }

//createAndShow();

Category.findCategories({},true);


module.exports = {Category};