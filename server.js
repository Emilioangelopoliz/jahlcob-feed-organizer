const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let POSTS = [];
const postsFile = path.join(__dirname, 'posts_clean.json');
if (fs.existsSync(postsFile)) {
  try {
    POSTS = JSON.parse(fs.readFileSync(postsFile, 'utf-8'));
    console.log(`✅ ${POSTS.length} posts`);
  } catch (e) {}
}

const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>JAHLCOB</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#fff;font-family:system-ui;padding:20px}h1{text-align:center;margin:20px 0;font-size:28px}.container{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0}.section{border-radius:5px;overflow:hidden}.section-title{padding:15px;font-size:20px;font-weight:bold;text-align:center}.archive-title{background:#ef4444}.keep-title{background:#22c55e}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;padding:10px;max-height:600px;overflow-y:auto}.card{cursor:pointer;border-radius:3px;overflow:hidden;transition:all 0.2s}.card:hover{transform:scale(1.05)}.card img{width:100%;height:180px;object-fit:cover}.card-info{background:#1a1a1a;padding:8px;font-size:12px}.stats{text-align:center;margin:20px 0;display:flex;justify-content:center;gap:40px}.stat{text-align:center}.stat-num{font-size:24px;font-weight:bold;color:#2563eb}.controls{text-align:center;margin:20px 0}.btn{padding:10px 20px;margin:0 5px;border:none;border-radius:5px;cursor:pointer;font-weight:bold;font-size:14px}.btn-export{background:#2563eb;color:#fff}.btn-reset{background:#666;color:#fff}</style></head><body><h1>🎥 JAHLCOB Feed Organizer</h1><div class="stats"><div class="stat"><div class="stat-num" id="total">0</div><div>Total</div></div><div class="stat"><div class="stat-num" id="archived">0</div><div>Archivados</div></div><div class="stat"><div class="stat-num" id="kept">0</div><div>Mantener</div></div></div><div class="container"><div class="section"><div class="section-title archive-title">❌ A ARCHIVAR</div><div class="grid" id="archive"></div></div><div class="section"><div class="section-title keep-title">✅ A MANTENER</div><div class="grid" id="keep"></div></div></div><div class="controls"><button class="btn btn-export" onclick="exportar()">📥 Exportar</button><button class="btn btn-reset" onclick="reset()">🔄 Reset</button></div><script>let posts=[];const status={};fetch('/api/posts').then(r=>r.json()).then(data=>{posts=data;posts.forEach(p=>status[p.id]='keep');render()});function render(){const arc=document.getElementById('archive');const kee=document.getElementById('keep');arc.innerHTML='';kee.innerHTML='';posts.forEach(p=>{const div=document.createElement('div');div.className='card';div.innerHTML=\`<img src="\${p.image_path||'/placeholder.jpg'}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect fill=%22%23333%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E'" alt="\${p.couple}"><div class="card-info">\${p.couple}<br>\${p.venue}</div>\`;div.onclick=()=>{status[p.id]=status[p.id]==='archive'?'keep':'archive';render()};if(status[p.id]==='archive'){arc.appendChild(div)}else{kee.appendChild(div)}});const archived=Object.values(status).filter(s=>s==='archive').length;const kept=posts.length-archived;document.getElementById('total').textContent=posts.length;document.getElementById('archived').textContent=archived;document.getElementById('kept').textContent=kept}function exportar(){const archived=posts.filter(p=>status[p.id]==='archive').map(p=>({id:p.id,couple:p.couple,venue:p.venue,date:p.date}));const kept=posts.filter(p=>status[p.id]==='keep').map(p=>({id:p.id,couple:p.couple,venue:p.venue,date:p.date}));const data={timestamp:new Date().toLocaleString('es-MX'),total:posts.length,archived:archived.length,kept:kept.length,archived_posts:archived,kept_posts:kept};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='JAHLCOB_'+Date.now()+'.json';a.click()}function reset(){if(confirm('¿Resetear todo a MANTENER?')){posts.forEach(p=>status[p.id]='keep');render()}}</script></body></html>`;

app.get('/', (req, res) => res.send(html));
app.get('/api/posts', (req, res) => res.json(POSTS));

app.listen(process.env.PORT||3000, () => console.log('✅'));
