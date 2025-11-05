const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Mock de dependencias
jest.mock('../models/User', () => ({
  User: {
    authUser: jest.fn(),
  },
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('../middleware/auth', () => ({
  validateTokenWithCookie: jest.fn((req, res, next) => next()),
}));

const { User } = require('../models/User');
const auth = require('../middleware/auth');
const authRoutes = require('../routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/', authRoutes);

describe('Auth Routes', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- LOGIN ---
  test('POST /login debe devolver token si las credenciales son correctas', async () => {
    const fakeUser = { username: 'Daniel', _id: '123' };
    User.authUser.mockResolvedValue(fakeUser);
    jwt.sign.mockReturnValue('fake-token');

    const res = await request(app)
      .post('/login')
      .send({ email: 'test@mail.com', password: '12345' });

    expect(User.authUser).toHaveBeenCalledWith('test@mail.com', '12345');
    expect(jwt.sign).toHaveBeenCalledWith(
      { username: 'Daniel', _id: '123' },
      process.env.TOKEN_KEY,
      { expiresIn: 60 * 60 }
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ token: 'fake-token' });
  });

  test('POST /login debe devolver 401 si el usuario no existe', async () => {
    User.authUser.mockResolvedValue(null);

    const res = await request(app)
      .post('/login')
      .send({ email: 'no@existe.com', password: 'badpass' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'email or password not correct' });
  });

  // --- LOGOUT ---
  test('GET /logout debe limpiar cookie y responder mensaje', async () => {
    const res = await request(app).get('/logout');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'You are logged out' });
    expect(auth.validateTokenWithCookie).toHaveBeenCalled();
  });
});
