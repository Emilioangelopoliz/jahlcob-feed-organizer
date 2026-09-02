# JAHLCOB Feed Organizer

App para organizar y decidir qué posts de Instagram archivar y cuáles mantener.

## Instalación Local

1. **Instalar Node.js** desde https://nodejs.org (v16+)

2. **Clonar/descargar este proyecto**

3. **Instalar dependencias:**
```bash
npm install
```

4. **Correr servidor:**
```bash
npm start
```

5. **Abrir navegador:**
```
http://localhost:3000
```

6. **Usar la app:**
   - Ingresa @jahlcob (o cualquier usuario Instagram)
   - Click en "Descargar Posts"
   - Haz click en posts para marcar ARCHIVA/MANTIENE
   - Click "Exportar Decisiones" para descargar JSON

## Deploy en Railway (Gratis)

1. Ir a https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Autorizar GitHub y seleccionar este repo
4. Railway automáticamente:
   - Instala dependencias
   - Corre `npm start`
   - Da URL pública

**¡Listo! La app estará disponible en `https://tu-proyecto.railway.app`**

## Estructura

- `server.js` - Backend Node.js + Express
- `public/index.html` - Frontend HTML/CSS/JS
- `package.json` - Dependencias

## Funcionalidad

✅ Conecta con Instagram (scraping)
✅ Descarga posts automáticamente
✅ Interfaz ARCHIVA/MANTIENE
✅ Exporta decisiones en JSON
