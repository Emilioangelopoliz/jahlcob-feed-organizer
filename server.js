const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Cargar posts reales
let REAL_POSTS = [];
try {
  const postsData = fs.readFileSync(path.join(__dirname, 'posts_clean.json'), 'utf-8');
  REAL_POSTS = JSON.parse(postsData);
  console.log(`✅ Cargados ${REAL_POSTS.length} posts reales`);
} catch (e) {
  console.error('No se pueden cargar posts_clean.json');
}

// Descomprimir imágenes si existe el tar.gz
const imagesPath = path.join(__dirname, 'public', 'images');
const tarPath = path.join(__dirname, 'public', 'images.tar.gz');

if (fs.existsSync(tarPath) && !fs.existsSync(imagesPath)) {
  console.log('⏳ Descomprimiendo imágenes...');
  exec(`cd ${path.join(__dirname, 'public')} && tar -xzf images.tar.gz`, (err) => {
    if (err) {
      console.error('Error descomprimiendo:', err);
    } else {
      console.log('✅ Imágenes descomprimidas');
    }
  });
}

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

const HTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JAHLCOB Feed Organizer</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #000; color: #fff; padding: 1rem; }
        .container { max-width: 1600px; margin: 0 auto; }
        header { margin-bottom: 2rem; text-align: center; }
        h1 { font-size: 2rem; margin-bottom: 0.5rem; }
        .login-section { max-width: 500px; margin: 2rem auto; background: #1a1a1a; padding: 2rem; border-radius: 0.5rem; text-align: center; }
        .login-section input { width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #333; border-radius: 0.375rem; background: #0a0a0a; color: #fff; font-size: 1rem; }
        .login-section button { width: 100%; padding: 0.75rem; background: #2563eb; color: white; border: none; border-radius: 0.375rem; font-weight: bold; cursor: pointer; font-size: 1rem; }
        .login-section button:hover { background: #1d4ed8; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto; }
        .stat-card { background: #1a1a1a; padding: 1rem; border-radius: 0.5rem; text-align: center; }
        .stat-number { font-size: 1.8rem; font-weight: bold; color: #2563eb; }
        .feeds-wrapper { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
        .feed { background: #0a0a0a; border-radius: 0.5rem; border: 1px solid #222; }
        .feed-header { padding: 1.5rem; border-bottom: 2px solid; text-align: center; }
        .feed-title { font-size: 1.3rem; font-weight: bold; }
        .grid { padding: 1rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; max-height: 700px; overflow-y: auto; }
        .post-card { border-radius: 0.5rem; overflow: hidden; cursor: pointer; border: 3px solid; transition: all 0.3s; background: #1a1a1a; }
        .post-card:hover { transform: scale(1.02); }
        .post-image { width: 100%; height: 150px; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; }
        .post-info { padding: 0.75rem; font-size: 0.85rem; }
        .buttons { text-align: center; margin-bottom: 2rem; }
        button { padding: 0.75rem 1.5rem; background: #2563eb; color: white; border: none; border-radius: 0.375rem; font-weight: bold; cursor: pointer; margin: 0.5rem; }
        button:hover { background: #1d4ed8; }
        .hidden { display: none; }
        .loading { text-align: center; padding: 2rem; color: #888; }
        .info { background: #1a1a1a; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; color: #aaa; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎥 JAHLCOB Feed Organizer</h1>
            <p>Organiza tu feed de Instagram por bodas</p>
        </header>

        <div id="loginSection" class="login-section">
            <h2>Cargar Posts</h2>
            <input type="text" id="usernameInput" placeholder="@jahlcob" value="jahlcob" disabled>
            <button onclick="loadPosts()">Cargar Posts Reales</button>
            <div id="loadingMsg" class="loading hidden">Cargando posts...</div>
            <div class="info">✨ Se cargarán los posts reales de tu feed con FOTOS</div>
        </div>

        <div id="appSection" class="hidden">
            <div class="stats">
                <div class="stat-card">
                    <div>Total Posts</div>
                    <div class="stat-number" id="totalPosts">0</div>
                </div>
                <div class="stat-card">
                    <div>A Archivar</div>
                    <div class="stat-number" id="archiveCount">0</div>
                </div>
                <div class="stat-card">
                    <div>A Mantener</div>
                    <div class="stat-number" id="keepCount">0</div>
                </div>
            </div>

            <div class="feeds-wrapper">
                <div class="feed">
                    <div class="feed-header">
                        <div class="feed-title">❌ A ARCHIVAR</div>
                    </div>
                    <div class="grid" id="archiveGrid"></div>
                </div>

                <div class="feed">
                    <div class="feed-header">
                        <div class="feed-title">✅ A MANTENER</div>
                    </div>
                    <div class="grid" id="keepGrid"></div>
                </div>
            </div>

            <div class="buttons">
                <button onclick="exportarDecisiones()">📥 Exportar Decisiones</button>
                <button onclick="resetear()">🔄 Resetear</button>
            </div>
        </div>
    </div>

    <script>
        let allPosts = [];

        async function loadPosts() {
            const loadingMsg = document.getElementById('loadingMsg');
            loadingMsg.classList.remove('hidden');

            try {
                const response = await fetch('/api/fetch-posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: 'jahlcob' })
                });

                const data = await response.json();
                
                if (data.success) {
                    allPosts = data.posts;
                    document.getElementById('loginSection').classList.add('hidden');
                    document.getElementById('appSection').classList.remove('hidden');
                    render();
                } else {
                    alert('Error: ' + (data.message || data.error));
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
            
            loadingMsg.classList.add('hidden');
        }

        function togglePost(id) {
            const post = allPosts.find(p => p.id === id);
            if (post) {
                post.status = post.status === 'mantener' ? 'archivar' : 'mantener';
                render();
            }
        }

        function render() {
            const archiveGrid = document.getElementById('archiveGrid');
            const keepGrid = document.getElementById('keepGrid');
            
            archiveGrid.innerHTML = '';
            keepGrid.innerHTML = '';

            const archivePosts = allPosts.filter(p => p.status === "archivar");
            const keepPosts = allPosts.filter(p => p.status === "mantener");

            if (archivePosts.length === 0) {
                archiveGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#666;padding:2rem;">Sin posts</div>';
            } else {
                archivePosts.forEach(post => {
                    archiveGrid.appendChild(createPostCard(post, true));
                });
            }

            if (keepPosts.length === 0) {
                keepGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#666;padding:2rem;">Sin posts</div>';
            } else {
                keepPosts.forEach(post => {
                    keepGrid.appendChild(createPostCard(post, false));
                });
            }

            document.getElementById('totalPosts').textContent = allPosts.length;
            document.getElementById('archiveCount').textContent = archivePosts.length;
            document.getElementById('keepCount').textContent = keepPosts.length;
        }

        function createPostCard(post, isArchive) {
            const card = document.createElement('div');
            card.className = 'post-card';
            card.style.borderColor = isArchive ? '#ef4444' : '#22c55e';
            card.style.opacity = isArchive ? '0.65' : '1';
            card.onclick = () => togglePost(post.id);
            
            const imgStyle = post.image_path ? 
                `background-image: url('${post.image_path}');` : 
                'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);';
            
            card.innerHTML = '<div class="post-image" style="' + imgStyle + '"></div><div class="post-info"><div style="font-weight:bold;">' + post.couple + '</div><div style="color:#888;">' + post.venue + '</div></div>';
            
            return card;
        }

        function exportarDecisiones() {
            const archivePosts = allPosts.filter(p => p.status === "archivar");
            const keepPosts = allPosts.filter(p => p.status === "mantener");

            const resumen = {
                timestamp: new Date().toLocaleString('es-MX'),
                username: 'jahlcob',
                totalPosts: allPosts.length,
                aArchivar: archivePosts.length,
                aMantener: keepPosts.length,
                posts_archivar: archivePosts.map(p => ({ id: p.id, couple: p.couple, venue: p.venue, date: p.date })),
                posts_mantener: keepPosts.map(p => ({ id: p.id, couple: p.couple, venue: p.venue, date: p.date }))
            };

            const contenido = JSON.stringify(resumen, null, 2);
            const blob = new Blob([contenido], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'JAHLCOB_Decisiones_' + new Date().getTime() + '.json';
            a.click();
        }

        function resetear() {
            if (confirm('¿Resetear y mantener todos los posts?')) {
                allPosts.forEach(p => p.status = 'mantener');
                render();
            }
        }
    </script>
</body>
</html>
`;

// Servir HTML
app.get('/', (req, res) => {
  res.send(HTML);
});

// API para descargar posts
app.post('/api/fetch-posts', (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username requerido', success: false });
    }

    const posts = REAL_POSTS.length > 0 ? REAL_POSTS : [];

    res.json({ 
      success: true,
      totalPosts: posts.length,
      posts: posts.slice(0, 100),
      message: `✨ Cargados ${posts.length} posts de @${username}`
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      error: 'Error al descargar posts',
      message: error.message,
      success: false
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', posts: REAL_POSTS.length, timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Posts cargados: ${REAL_POSTS.length}`);
  console.log(`📸 Sirviendo imágenes desde /public/images`);
});
