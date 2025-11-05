const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');

// --- Mocks ---
jest.mock('../models/User', () => ({
  User: {
    findUsers: jest.fn(),
    findUserById: jest.fn(),
    findUser: jest.fn(),
    saveUser: jest.fn(),
    deleteUser: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../middleware/auth', () => ({
  validateHeader: jest.fn((req, res, next) => next()),
  validateAdmin: jest.fn((req, res, next) => {
    req.admin = true;
    next();
  }),
  validateTokenWithCookie: jest.fn((req, res, next) => {
    req.username = 'testuser';
    req._id = 'user123';
    next();
  }),
}));

const { User } = require('../models/User');
const userRoutes = require('../routes/userRoutes');
const app = express();
app.use(express.json());
app.use('/users', userRoutes);

describe('User Routes (4 rutas principales)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- GET / (listar usuarios)
  test('GET /users debe devolver la lista de usuarios', async () => {
    const mockUsers = [
      { _id: 'u1', name: 'Alice', email: 'alice@example.com' },
      { _id: 'u2', name: 'Bob', email: 'bob@example.com' },
    ];
    User.findUsers.mockResolvedValue(mockUsers);

    const res = await request(app).get('/users');

    expect(res.status).toBe(200);
    expect(User.findUsers).toHaveBeenCalledWith({}, true, 5, 1);
    expect(res.body).toEqual(mockUsers);
  });

  // --- POST / (crear usuario)
  test('POST /users debe crear un usuario nuevo', async () => {
    User.findUser.mockResolvedValue(null);
    User.saveUser.mockResolvedValue({ _id: 'u1', name: 'Nuevo', email: 'nuevo@example.com' });

    const res = await request(app)
      .post('/users')
      .send({ name: 'Nuevo', email: 'nuevo@example.com', password: '12345' });

    expect(res.status).toBe(201);
    expect(User.saveUser).toHaveBeenCalledWith({
      name: 'Nuevo',
      email: 'nuevo@example.com',
      password: '12345',
    });
    expect(res.body).toEqual({ _id: 'u1', name: 'Nuevo', email: 'nuevo@example.com' });
  });

  test('POST /users debe devolver error si el usuario ya existe', async () => {
    User.findUser.mockResolvedValue({ email: 'existente@example.com' });

    const res = await request(app)
      .post('/users')
      .send({ name: 'Existente', email: 'existente@example.com' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'User exists' });
  });

  // --- PUT /change-password
  test('PUT /users/change-password debe cambiar la contraseña correctamente', async () => {
    const mockUser = {
      _id: 'user123',
      password: bcrypt.hashSync('oldpass', 10),
      save: jest.fn(),
    };
    User.findOne.mockResolvedValue(mockUser);

    const res = await request(app)
      .put('/users/change-password')
      .send({ currentPassword: 'oldpass', newPassword: 'newpass' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Password changed successfully' });
    expect(mockUser.save).toHaveBeenCalled();
  });

  test('PUT /users/change-password debe fallar si la contraseña actual es incorrecta', async () => {
    const mockUser = { _id: 'user123', password: bcrypt.hashSync('otra', 10) };
    User.findOne.mockResolvedValue(mockUser);

    const res = await request(app)
      .put('/users/change-password')
      .send({ currentPassword: 'incorrecta', newPassword: 'newpass' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Current password is incorrect' });
  });

  // --- DELETE /username/:username
  test('DELETE /users/username/:username debe eliminar usuario si es el dueño', async () => {
    User.deleteUser.mockResolvedValue(true);

    const res = await request(app)
      .delete('/users/username/testuser')
      .set('Cookie', ['access_token=fake']);

    expect(res.status).toBe(200);
    expect(User.deleteUser).toHaveBeenCalledWith('testuser');
  });

  test('DELETE /users/username/:username debe devolver 403 si no es el dueño', async () => {
    const res = await request(app)
      .delete('/users/username/otroUser')
      .set('Cookie', ['access_token=fake']);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'You dont have permissions' });
  });
});
