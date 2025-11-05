const router = require('express').Router();
const auth = require('../middleware/auth.js');
const { Category } = require('../models/Category.js');

// Operación GET para obtener todas las categorias
router.get('/',async (req, res)=> {
    let filters = {};
    let categories = await Category.findCategories(filters, req.admin);
    res.json(categories);
});

router.post('/', auth.validateTokenWithCookie ,async (req, res) => {
    try {
    console.log(req.body);
    let category = req.body;
    let newCategory = await Category.saveCategory(category);
    res.send(newCategory);
  } catch (error) {
    console.error('Error saving category:', error);
    res.status(500).json({ error: 'Error saving category' });
  }
});

module.exports = router;