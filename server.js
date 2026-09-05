const express = require('express');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const app = express();
const PORT = process.env.PORT || 3000;
const STATE_FILE = path.join(__dirname, 'state.json');
const REAL_COVERS_DIR = path.join(__dirname, 'real_covers');
const REAL_COVERS_ZIP = path.join(__dirname, 'real_covers.zip');

// Si subiste real_covers.zip pero la carpeta real_covers/ no existe (o esta vacia),
// la descomprimimos automaticamente al arrancar. Asi no hay que subir 213 archivos sueltos a GitHub.
function ensureRealCoversExtracted() {
  try {
    if (!fs.existsSync(REAL_COVERS_ZIP)) return;
    const zipStat = fs.statSync(REAL_COVERS_ZIP);
    const markerFile = path.join(__dirname, '.real_covers_extracted_at');
    const alreadyExtracted = fs.existsSync(REAL_COVERS_DIR) && fs.readdirSync(REAL_COVERS_DIR).length > 0;
    const marker = fs.existsSync(markerFile) ? fs.readFileSync(markerFile, 'utf8') : '';
    const needsExtract = !alreadyExtracted || marker !== String(zipStat.mtimeMs);
    if (needsExtract) {
      console.log('Descomprimiendo real_covers.zip ...');
      const zip = new AdmZip(REAL_COVERS_ZIP);
      zip.extractAllTo(__dirname, true);
      fs.writeFileSync(markerFile, String(zipStat.mtimeMs));
      console.log('real_covers/ listo.');
    }
  } catch (e) {
    console.error('Error descomprimiendo real_covers.zip:', e);
  }
}
ensureRealCoversExtracted();

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
