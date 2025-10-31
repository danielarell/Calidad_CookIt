const router = require("express").Router()
const auth = require('../middleware/auth.js');
const { Category } = require("../models/Category.js");

// Operación GET para obtener todas las categorias
router.get('/',async (req, res)=> {
    let filters = {}
    let categories = await Category.findCategories(filters, req.admin);
    res.json(categories);
});

router.post('/', auth.validateTokenWithCookie ,async (req, res) => {
    console.log(req.body);
    let category = req.body;
    let newCategory = await Category.saveCategory(category);
    res.send(newCategory);
});

module.exports = router;