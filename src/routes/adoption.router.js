import express from 'express';
import Adoption from '../dao/models/adoption.model.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Adoption
 *   description: Endpoints de adopciones de mascotas
 */

/**
 * @swagger
 * /adoption:
 *   get:
 *     summary: Lista todas las solicitudes de adopción
 *     tags: [Adoption]
 *     responses:
 *       200:
 *         description: Lista de adopciones obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', async (req, res) => {
  try {
    const adoptions = await Adoption.find();
    res.status(200).json(adoptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /adoption/{id}:
 *   get:
 *     summary: Obtiene una adopción por ID
 *     tags: [Adoption]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Adopción obtenida correctamente
 *       404:
 *         description: Adopción no encontrada
 */
router.get('/:id', async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (adoption) {
      res.status(200).json(adoption);
    } else {
      res.status(404).json({ error: 'Adopción no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /adoption:
 *   post:
 *     summary: Crea una nueva solicitud de adopción
 *     tags: [Adoption]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Adopción creada correctamente
 *       400:
 *         description: Error al crear la adopción
 */
router.post('/', async (req, res) => {
  try {
    const newAdoption = new Adoption(req.body);
    await newAdoption.save();
    res.status(201).json(newAdoption);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /adoption/{id}:
 *   put:
 *     summary: Actualiza una solicitud de adopción existente
 *     tags: [Adoption]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Adopción actualizada correctamente
 *       404:
 *         description: Adopción no encontrada
 */
router.put('/:id', async (req, res) => {
  try {
    const updatedAdoption = await Adoption.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedAdoption) {
      res.status(200).json(updatedAdoption);
    } else {
      res.status(404).json({ error: 'Adopción no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /adoption/{id}:
 *   delete:
 *     summary: Elimina una solicitud de adopción
 *     tags: [Adoption]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Adopción eliminada correctamente
 *       404:
 *         description: Adopción no encontrada
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedAdoption = await Adoption.findByIdAndDelete(req.params.id);
    if (deletedAdoption) {
      res.status(200).json({ message: 'Adopción eliminada correctamente' });
    } else {
      res.status(404).json({ error: 'Adopción no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;