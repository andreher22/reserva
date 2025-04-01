// backend/routes/reservas.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// ========================
// Guardar una nueva reserva
// ========================
router.post('/guardar', (req, res) => {
  const {
    habitacion,
    precio,
    capacidad,
    estado,
    fechaEntrada,
    fechaSalida,
    fechaCreacion,
    pais,
    estadoUbicacion,
    correoUsuario
  } = req.body;

  // Convertir la fecha al formato compatible con MySQL (YYYY-MM-DD HH:MM:SS)
  const fechaCreacionSQL = new Date(fechaCreacion).toISOString().slice(0, 19).replace('T', ' ');

  const sql = `
    INSERT INTO reservas (
      habitacion,
      precio,
      capacidad,
      estado,
      fecha_entrada,
      fecha_salida,
      fecha_creacion,
      pais,
      estado_ubicacion,
      correo_usuario
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const valores = [
    habitacion,
    precio,
    capacidad,
    estado,
    fechaEntrada,
    fechaSalida,
    fechaCreacionSQL,
    pais,
    estadoUbicacion,
    correoUsuario
  ];

  db.query(sql, valores, (err, resultado) => {
    if (err) {
      console.error('❌ Error al guardar reserva:', err);
      return res.status(500).json({ error: 'Error al guardar la reserva' });
    }
    const idGenerado = resultado.insertId;
    res.status(200).json({ mensaje: '✅ Reserva guardada correctamente', id: idGenerado });
  });
});

// ========================
// Obtener reservas por correo (historial)
// ========================
router.get('/usuario/:correo', (req, res) => {
  const correo = req.params.correo;

  db.query(
    'SELECT * FROM reservas WHERE correo_usuario = ? ORDER BY fecha_creacion DESC',
    [correo],
    (err, resultados) => {
      if (err) {
        console.error('❌ Error al obtener reservas:', err);
        return res.status(500).json({ error: 'Error al obtener reservas' });
      }
      res.status(200).json(resultados);
    }
  );
});


// Obtener una reserva por ID
router.get('/:id', (req, res) => {
    const id = req.params.id;
  
    db.query('SELECT * FROM reservas WHERE id = ?', [id], (err, resultados) => {
      if (err) {
        console.error('❌ Error al obtener reserva por ID:', err);
        return res.status(500).json({ error: 'Error al obtener la reserva' });
      }
  
      if (resultados.length === 0) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }
  
      // ✅ Devolver la reserva encontrada
      res.status(200).json(resultados[0]);
    });
  });
  

// ========================
// Cancelar (eliminar) una reserva por ID
// ========================
router.delete('/:id/cancelar', (req, res) => {
    const id = req.params.id;
  
    const sql = 'DELETE FROM reservas WHERE id = ?';
    db.query(sql, [id], (err, resultado) => {
      if (err) {
        console.error('❌ Error al cancelar (eliminar) reserva:', err);
        return res.status(500).json({ error: 'Error al eliminar la reserva' });
      }
  
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }
  
      res.status(200).json({ mensaje: '✅ Reserva eliminada correctamente' });
    });
  });
  
  

module.exports = router;