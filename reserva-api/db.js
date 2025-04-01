const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'hotel_user',
    password: '123456',
    database: 'hotel_reservas'
  });

db.connect(err => {
  if (err) throw err;
  console.log('✅ Conectado a MySQL');
});

module.exports = db;