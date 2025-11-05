const request = require('supertest');
const express = require('express');

// Mock de dependencias
jest.mock('../models/Category.js', () => ({
  Category: {
    findCategories: jest.fn(),
    saveCategory: jest.fn(),
  },
}));

jest.mock('../middleware/auth.js', () => ({
  validateTokenWithCookie: jest.fn((req, res, next) => next()),
}));

const { Category } = require('../models/Category.js');
const auth = require('../middleware/auth.js');
const categoryRoutes = require('../routes/categoryRoutes');

const app = express();
app.use(express.json());
app.use('/categories', categoryRoutes);

describe('Category Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- GET /categories ---
  test('GET /categories debe devolver todas las categorías', async () => {
    const mockCategories = [
      { name: 'Comida' },
      { name: 'Repostería' },
    ];

    Category.findCategories.mockResolvedValue(mockCategories);

    const res = await request(app).get('/categories');

    expect(res.status).toBe(200);
    expect(Category.findCategories).toHaveBeenCalledWith({}, undefined);
    expect(res.body).toEqual(mockCategories);
  });

  // --- POST /categories ---
  test('POST /categories debe crear una nueva categoría', async () => {
    const newCategory = { name: 'Bebidas' };
    Category.saveCategory.mockResolvedValue(newCategory);

    const res = await request(app)
      .post('/categories')
      .send(newCategory);

    expect(auth.validateTokenWithCookie).toHaveBeenCalled();
    expect(Category.saveCategory).toHaveBeenCalledWith(newCategory);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(newCategory);
  });

  // --- POST /categories error simulado ---
  test('POST /categories debe manejar errores al guardar la categoría', async () => {
    const newCategory = { name: 'Postres' };
    Category.saveCategory.mockRejectedValue(new Error('DB Error'));

    const res = await request(app)
      .post('/categories')
      .send(newCategory);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error saving category' });
  });
});
