const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const reservasRouter = require('./routes/reservas');


const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Rutas
app.use('/api', require('./routes/auth')); // Login / Registro
app.use('/api/reservas', reservasRouter);
// <-- ESTA ES LA QUE FALTABA ✅



app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
