const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const STATE_FILE = path.join(__dirname, 'state.json');

app.use(express.json({ limit: '2mb' }));

// Sirve todos los archivos estaticos (index.html, posts_clean_final.json,
// images/, thumbnails/, real_covers/) desde la raiz del proyecto.
app.use(express.static(__dirname));

// Devuelve el estado guardado (a que columna esta cada post, y el orden dentro de cada una)
app.get('/api/state', (req, res) => {
  if (fs.existsSync(STATE_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      return res.json(data);
    } catch (e) {
      console.error('Error leyendo state.json:', e);
    }
  }
  res.json({ status: {}, order: [] });
});

// Guarda el estado (se llama cada vez que alguien archiva/mantiene o reordena)
app.post('/api/state', (req, res) => {
  const { status, order } = req.body || {};
  if (!status || !order) {
    return res.status(400).json({ ok: false, error: 'Faltan status u order' });
  }
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify({ status, order, updatedAt: new Date().toISOString() }, null, 2));
    res.json({ ok: true });
  } catch (e) {
    console.error('Error guardando state.json:', e);
    res.status(500).json({ ok: false });
  }
});

app.listen(PORT, () => {
  console.log(`JAHLCOB Feed Organizer corriendo en el puerto ${PORT}`);
});
