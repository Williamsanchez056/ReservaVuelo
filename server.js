const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'reservations.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      airline TEXT NOT NULL,
      departure TEXT NOT NULL,
      arrival TEXT NOT NULL,
      departureDate TEXT NOT NULL,
      departureTime TEXT NOT NULL,
      arrivalTime TEXT NOT NULL,
      duration TEXT NOT NULL,
      price TEXT NOT NULL,
      seats INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      seat TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/reservations', (req, res) => {
  db.all('SELECT * FROM reservations ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Error al leer reservas:', err.message);
      return res.status(500).json({ error: 'Error al leer reservas' });
    }
    res.json(rows);
  });
});

app.post('/api/reservations', (req, res) => {
  const {
    airline,
    departure,
    arrival,
    departureDate,
    departureTime,
    arrivalTime,
    duration,
    price,
    seats,
    name,
    email,
    seat
  } = req.body;

  if (!airline || !departure || !arrival || !departureDate || !departureTime || !arrivalTime || !duration || !price || !seats || !name || !email || !seat) {
    return res.status(400).json({ error: 'Faltan datos requeridos para crear la reserva' });
  }

  const stmt = db.prepare(`
    INSERT INTO reservations (
      airline, departure, arrival, departureDate, departureTime, arrivalTime, duration,
      price, seats, name, email, seat
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    airline,
    departure,
    arrival,
    departureDate,
    departureTime,
    arrivalTime,
    duration,
    price,
    seats,
    name,
    email,
    seat,
    function (err) {
      if (err) {
        console.error('Error al guardar reserva:', err.message);
        return res.status(500).json({ error: 'No se pudo guardar la reserva' });
      }

      res.status(201).json({ id: this.lastID });
    }
  );

  stmt.finalize();
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
