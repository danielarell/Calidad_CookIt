const request = require('supertest');
const express = require('express');

// ---- MOCKS ----
jest.mock('../models/Recipe.js', () => ({
  Recipe: {
    findRecipes: jest.fn(),
    findRecipe: jest.fn(),
    saveRecipe: jest.fn(),
    deleteRecipe: jest.fn(),
  },
}));

jest.mock('../models/User.js', () => ({
  User: {
    removeMyRecipes: jest.fn(),
  },
}));

jest.mock('../middleware/auth.js', () => ({
  validateTokenWithCookie: jest.fn((req, res, next) => {
    req.username = 'testuser';
    req._id = 'user123';
    next();
  }),
  addSkipLimittoGet: jest.fn(() => (req, res, next) => {
    req.skip = 0;
    req.limit = 10;
    next();
  }),
}));

const { Recipe } = require('../models/Recipe.js');
const { User } = require('../models/User.js');
// eslint-disable-next-line no-unused-vars
const auth = require('../middleware/auth.js');
const recipeRoutes = require('../routes/recipeRoutes');

const app = express();
app.use(express.json());
app.use('/recipes', recipeRoutes);

describe('Recipe Routes (principales)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- GET 
  test('GET /recipes debe devolver lista de recetas', async () => {
    const mockRecipes = [{ title: 'Tacos' }, { title: 'Enchiladas' }];
    Recipe.findRecipes.mockResolvedValue(mockRecipes);

    const res = await request(app).get('/recipes');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockRecipes);
    expect(Recipe.findRecipes).toHaveBeenCalledWith({}, 10, 1, 0, 10);
  });

  // --- GET /:recipeId
  test('GET /recipes/:id debe devolver una receta si existe', async () => {
    const mockRecipe = { _id: 'r1', title: 'Pizza' };
    Recipe.findRecipe.mockResolvedValue(mockRecipe);

    const res = await request(app)
      .get('/recipes/r1')
      .set('Cookie', ['access_token=fake']);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockRecipe);
  });

  test('GET /recipes/:id debe devolver 404 si no existe', async () => {
    Recipe.findRecipe.mockResolvedValue(null);

    const res = await request(app).get('/recipes/999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Recipe Not Found' });
  });

  // --- POST 
  test('POST /recipes debe crear una nueva receta', async () => {
    const newRecipe = { title: 'Guacamole', ingredients: ['Aguacate', 'Sal'] };
    Recipe.saveRecipe.mockResolvedValue(newRecipe);

    const res = await request(app)
      .post('/recipes')
      .send(newRecipe)
      .set('Cookie', ['access_token=fake']);

    expect(res.status).toBe(200);
    expect(Recipe.saveRecipe).toHaveBeenCalledWith('testuser', 'user123', newRecipe);
    expect(res.body).toEqual(newRecipe);
  });

  // --- DELETE /:recipeId
  test('DELETE /recipes/:id debe eliminar receta si el usuario es dueño', async () => {
    const mockRecipe = { _id: 'r1', author: { _id: 'user123' } };
    Recipe.findRecipe.mockResolvedValue(mockRecipe);
    Recipe.deleteRecipe.mockResolvedValue({ deleted: true });

    const res = await request(app)
      .delete('/recipes/r1')
      .set('Cookie', ['access_token=fake']);

    expect(res.status).toBe(200);
    expect(User.removeMyRecipes).toHaveBeenCalledWith('testuser', 'r1');
    expect(res.body).toEqual({ deleted: true });
  });

  test('DELETE /recipes/:id debe devolver 403 si el usuario no es el dueño', async () => {
    const mockRecipe = { _id: 'r2', author: { _id: 'otheruser' } };
    Recipe.findRecipe.mockResolvedValue(mockRecipe);

    const res = await request(app)
      .delete('/recipes/r2')
      .set('Cookie', ['access_token=fake']);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'You dont have permissions' });
  });

  test('DELETE /recipes/:id debe devolver 404 si la receta no existe', async () => {
    Recipe.findRecipe.mockResolvedValue(null);

    const res = await request(app)
      .delete('/recipes/999')
      .set('Cookie', ['access_token=fake']);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Recipe Not Found' });
  });
});
