const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

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
        .stat-number { font-size: 1.8rem; font-weight: bold; }
        .feeds-wrapper { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
        .feed { background: #0a0a0a; border-radius: 0.5rem; border: 1px solid #222; }
        .feed-header { padding: 1.5rem; border-bottom: 2px solid; text-align: center; }
        .feed-title { font-size: 1.3rem; font-weight: bold; }
        .grid { padding: 1rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; max-height: 700px; overflow-y: auto; }
        .post-card { border-radius: 0.5rem; overflow: hidden; cursor: pointer; border: 3px solid; transition: all 0.3s; }
        .post-image { width: 100%; height: 150px; object-fit: cover; }
        .post-info { padding: 0.75rem; font-size: 0.85rem; }
        .buttons { text-align: center; margin-bottom: 2rem; }
        button { padding: 0.75rem 1.5rem; background: #2563eb; color: white; border: none; border-radius: 0.375rem; font-weight: bold; cursor: pointer; margin: 0.5rem; }
        .hidden { display: none; }
        .loading { text-align: center; padding: 2rem; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎥 JAHLCOB Feed Organizer</h1>
            <p>Conecta con Instagram y reorganiza tu feed</p>
        </header>

        <div id="loginSection" class="login-section">
            <h2>Login Instagram</h2>
            <input type="text" id="usernameInput" placeholder="@jahlcob" value="jahlcob">
            <button onclick="fetchPosts()">Descargar Posts</button>
            <div id="loadingMsg" class="loading hidden">Descargando posts...</div>
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
            </div>
        </div>
    </div>

    <script>
        let allPosts = [];

        async function fetchPosts() {
            const username = document.getElementById('usernameInput').value.replace('@', '');
            const loadingMsg = document.getElementById('loadingMsg');
            
            loadingMsg.classList.remove('hidden');

            try {
                const response = await fetch('/api/fetch-posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });

                const data = await response.json();
                
                if (data.success) {
                    allPosts = data.posts;
                    document.getElementById('loginSection').classList.add('hidden');
                    document.getElementById('appSection').classList.remove('hidden');
                    render();
                } else {
                    alert('Error: ' + data.error);
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

            archivePosts.forEach(post => {
                archiveGrid.appendChild(createPostCard(post, true));
            });

            keepPosts.forEach(post => {
                keepGrid.appendChild(createPostCard(post, false));
            });

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
            
            card.innerHTML = '<img src="' + post.url + '" class="post-image" alt="' + post.couple + '"><div class="post-info"><div>' + post.couple + '</div></div>';
            
            return card;
        }

        function exportarDecisiones() {
            const archivePosts = allPosts.filter(p => p.status === "archivar");
            const keepPosts = allPosts.filter(p => p.status === "mantener");

            const resumen = {
                timestamp: new Date().toLocaleString('es-MX'),
                username: document.getElementById('usernameInput').value,
                totalPosts: allPosts.length,
                aArchivar: archivePosts.length,
                aMantener: keepPosts.length
            };

            const contenido = JSON.stringify(resumen, null, 2);
            const blob = new Blob([contenido], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'JAHLCOB_Decisiones_' + new Date().getTime() + '.json';
            a.click();
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
app.post('/api/fetch-posts', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username requerido' });
    }

    const response = await axios.get(`https://www.instagram.com/${username}/?__a=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const userData = response.data.graphql.user;
    const media = userData.edge_owner_to_timeline_media.edges;

    const posts = media.map((edge, idx) => ({
      id: idx + 1,
      username: username,
      couple: `Post ${idx + 1}`,
      venue: username,
      engagement: `${(Math.random() * 10).toFixed(1)}%`,
      views: Math.floor(Math.random() * 2000) + 100,
      status: idx % 2 === 0 ? 'mantener' : 'archivar',
      url: edge.node.display_url,
      likes: Math.floor(Math.random() * 500),
      timestamp: edge.node.taken_at_timestamp
    }));

    res.json({ 
      success: true,
      totalPosts: posts.length,
      posts: posts.slice(0, 100)
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      error: 'Error al descargar posts',
      message: error.message 
    });
  }
});

app.post('/api/save-decisions', (req, res) => {
  try {
    const { decisions, username } = req.body;
    
    const report = {
      timestamp: new Date().toLocaleString('es-MX'),
      username,
      totalPosts: decisions.length,
      archiveCount: decisions.filter(d => d.status === 'archivar').length,
      keepCount: decisions.filter(d => d.status === 'mantener').length,
      decisions
    };

    res.json({ 
      success: true, 
      message: 'Decisiones guardadas',
      report 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
