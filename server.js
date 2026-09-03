const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Cargar posts si existen
let REAL_POSTS = [];
const postsFile = path.join(__dirname, 'posts_clean.json');
if (fs.existsSync(postsFile)) {
  try {
    REAL_POSTS = JSON.parse(fs.readFileSync(postsFile, 'utf-8'));
    console.log(`✅ Cargados ${REAL_POSTS.length} posts`);
  } catch (e) {
    console.log('⚠️ Error cargando posts:', e.message);
  }
}

// API
app.post('/api/fetch-posts', (req, res) => {
  try {
    const posts = REAL_POSTS.slice(0, 100);
    res.json({ 
      success: true,
      posts: posts,
      totalPosts: REAL_POSTS.length
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// HTML simple
const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>JAHLCOB</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui;background:#000;color:#fff;padding:20px}h1{text-align:center;margin:20px 0}button{padding:10px 20px;background:#2563eb;color:white;border:none;border-radius:5px;cursor:pointer;margin:10px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px 0}.card{border:2px solid #22c55e;padding:10px;border-radius:5px;cursor:pointer}.card:hover{opacity:0.8}</style></head><body><h1>🎥 JAHLCOB Feed Organizer</h1><button onclick="loadPosts()">Cargar Posts</button><div class="grid" id="grid"></div><script>let posts=[];async function loadPosts(){const r=await fetch('/api/fetch-posts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({})});const d=await r.json();posts=d.posts;render()}function render(){const g=document.getElementById('grid');g.innerHTML='';posts.forEach(p=>{const c=document.createElement('div');c.className='card';c.innerHTML=p.couple+' @ '+p.venue;g.appendChild(c)})}loadPosts()</script></body></html>`;

app.get('/', (req, res) => {
  res.send(html);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Posts: ${REAL_POSTS.length}`);
});
