const express = require('express');
const router = express.Router();
const { Tutor } = require('../models');

// GET /api/tutores 
router.get('/', async (req, res, next) => {
  try {
    const tutores = await Tutor.findAll({
      where: { activo: true },
      attributes: ['id', 'nombre', 'especialidad'] // Mandamos solo lo necesario para el select
    });
    res.status(200).json(tutores);
  } catch (error) {
    next(error);
  }
});

module.exports = router;