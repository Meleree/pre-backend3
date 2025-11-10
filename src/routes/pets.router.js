import { Router } from 'express';
import Pet from '../dao/models/pet.model.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const pets = await Pet.find().populate('owner');
    res.json(pets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;