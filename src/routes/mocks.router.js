import express from 'express';
import bcrypt from 'bcrypt';
import User from '../dao/models/user.model.js';
import Pet from '../dao/models/pet.model.js';
import { generateMockUsers, generateMockPets } from '../utils/mocking.utils.js';

const router = express.Router();

/**
 * Endpoint GET /api/mocks/mockingusers
 * Genera N usuarios mock y los retorna (no los inserta en la base de datos).
 */
router.get('/mockingusers', async (req, res) => {
  const num = Number(req.query.num) || 50;
  try {
    const users = await generateMockUsers(num);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error generating mock users', details: error?.message });
  }
});

/**
 * Endpoint GET /api/mocks/mockingpets
 * Genera N mascotas mock y los retorna (no los inserta en la base de datos).
 */
router.get('/mockingpets', async (req, res) => {
  const num = Number(req.query.num) || 50;
  try {
    const pets = generateMockPets(num);
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Error generating mock pets', details: error?.message });
  }
});

/**
 * Endpoint POST /api/mocks/generateData
 * Recibe { users: NUMBER, pets: NUMBER } en el body.
 * Genera usuarios y mascotas mock, los inserta en la base de datos y devuelve los nuevos registros.
 */
router.post('/generateData', async (req, res) => {
  const { users: numUsers = 0, pets: numPets = 0 } = req.body;
  try {
    // Genera mock
    const mockUsers = await generateMockUsers(numUsers);
    const mockPets = generateMockPets(numPets);

    // Inserta en la DB
    const insertedUsers = await User.insertMany(mockUsers);
    const insertedPets = await Pet.insertMany(mockPets);

    res.json({
      insertedUsers,
      insertedPets
    });
  } catch (error) {
    res.status(500).json({ error: 'Error generating or inserting data', details: error?.message });
  }
});

// <<<<<< CAMBIA LA EXPORTACIÓN >>>>>
export default router;