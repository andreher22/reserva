const express = require('express');
const router = express.Router();
const db = require('../db');

// Registro
router.post('/registro', (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  db.query('INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)', [nombre, correo, contrasena], (err) => {
    if (err) return res.status(500).json({ error: 'Error al registrar' });
    res.status(200).json({ mensaje: 'Registro exitoso' });
  });
});

// Login
router.post('/login', (req, res) => {
  const { correo, contrasena } = req.body;

  db.query('SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?', [correo, contrasena], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en login' });

    if (results.length > 0) {
      res.status(200).json({ autenticado: true, usuario: results[0] });
    } else {
      res.status(401).json({ autenticado: false });
    }
  });
});

module.exports = router;
