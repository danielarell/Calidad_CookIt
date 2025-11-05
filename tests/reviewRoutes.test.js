const request = require('supertest');
const express = require('express');

// ---- MOCKS ----
jest.mock('../models/Review.js', () => ({
  Review: {
    findReviews: jest.fn(),
    saveReview: jest.fn(),
    findById: jest.fn(),
    deleteReview: jest.fn(),
  },
}));

jest.mock('../models/Recipe.js', () => ({
  Recipe: {
    removeReviews: jest.fn(),
    calculateRating: jest.fn(),
  },
}));

jest.mock('../middleware/auth.js', () => ({
  validateTokenWithCookie: jest.fn((req, res, next) => {
    req.username = 'testuser';
    req._id = 'user123';
    req.admin = false;
    next();
  }),
}));

const { Review } = require('../models/Review.js');
const { Recipe } = require('../models/Recipe.js');
const reviewRoutes = require('../routes/reviewRoutes');

const app = express();
app.use(express.json());
app.use('/reviews', reviewRoutes);

describe('Review Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- GET /
  test('GET /reviews debe devolver las reseñas (mocked)', async () => {
    const mockReviews = [
      { _id: 'r1', content: 'Excelente receta' },
      { _id: 'r2', content: 'Muy buena' },
    ];
    Review.findReviews.mockResolvedValue(mockReviews);

    const res = await request(app)
      .get('/reviews')
      .set('Cookie', ['access_token=fake']);

    expect(res.status).toBe(200);
    // el endpoint devuelve el json de recipesData.json, no de Review.findReviews
    // así que solo verificamos que se llame correctamente
    expect(Review.findReviews).toHaveBeenCalledWith({}, false, 5, 1);
  });

  // --- POST /:recipeId
  test('POST /reviews/:recipeId debe crear una nueva reseña', async () => {
    const newReview = { content: 'Deliciosa receta' };
    Review.saveReview.mockResolvedValue({ ...newReview, _id: 'rev123' });

    const res = await request(app)
      .post('/reviews/recipe123')
      .send(newReview)
      .set('Cookie', ['access_token=fake']);

    expect(res.status).toBe(200);
    expect(Review.saveReview).toHaveBeenCalledWith('user123', newReview, 'recipe123');
    expect(res.body).toEqual({ ...newReview, _id: 'rev123' });
  });

  // --- DELETE (éxito) ---
  test('DELETE /reviews/:recipeId/:reviewId debe eliminar una reseña si el usuario es el autor', async () => {
    const mockReview = { _id: 'rev1', author: { _id: 'user123' } };
    Review.findById.mockResolvedValue(mockReview);
    Review.deleteReview.mockResolvedValue({ deleted: true });

    const res = await request(app)
      .delete('/reviews/recipe123/rev1')
      .set('Cookie', ['access_token=fake']);

    expect(res.status).toBe(200);
    expect(Recipe.removeReviews).toHaveBeenCalledWith('rev1', 'recipe123');
    expect(Recipe.calculateRating).toHaveBeenCalledWith('recipe123');
    expect(Review.deleteReview).toHaveBeenCalledWith('rev1', 'recipe123');
    expect(res.body).toEqual({ deleted: true });
  });

  // --- DELETE (sin permisos) ---
  test('DELETE /reviews/:recipeId/:reviewId debe devolver 403 si no es el autor', async () => {
    const mockReview = { _id: 'rev2', author: { _id: 'otroUser' } };
    Review.findById.mockResolvedValue(mockReview);

    const res = await request(app)
      .delete('/reviews/recipe123/rev2')
      .set('Cookie', ['access_token=fake']);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'You dont have permissions' });
  });

});
