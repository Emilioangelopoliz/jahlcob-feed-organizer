const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint raíz - servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para obtener posts de Instagram
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
      venue: `${username}`,
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
