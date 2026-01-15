import express from 'express';
import { createCanvas } from 'canvas';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());

// --- CONFIGURATION ---
const YEAR = 2026;
const COLORS = {
  bg: '#F3EFE3',        // Cream Background
  text: '#2C4E80',      // Navy Blue Text
  highlight: '#2C4E80', // Navy Blue Circle
  highlightText: '#F3EFE3' // Cream Text
};

// --- HELPER: Calendar Math ---
const getMonthCalendar = (year, monthIndex) => {
  const firstDay = new Date(year, monthIndex, 1).getDay(); 
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startDayOffset = (firstDay === 0 ? 6 : firstDay - 1); 
  return { daysInMonth, startDayOffset };
};

// --- ROUTE 1: The "Viewer" for Lively Wallpaper/Browsers ---
// Use this link in Lively Wallpaper: https://your-url.onrender.com/view?width=2560&height=1600
app.get('/view', (req, res) => {
  const width = req.query.width || 1920;
  const height = req.query.height || 1080;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Life Calendar Wallpaper</title>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden; /* CRITICAL: Stops scrollbars */
            background-color: ${COLORS.bg};
            display: flex;
            align-items: center;
            justify-content: center;
          }
          img {
            max-width: 100vw;
            max-height: 100vh;
            object-fit: contain; /* Ensures image fits inside window perfectly */
            display: block;
          }
        </style>
        <meta http-equiv="refresh" content="3600">
      </head>
      <body>
        <img src="/api/calendar?width=${width}&height=${height}&t=${Date.now()}" alt="Wallpaper" />
      </body>
    </html>
  `;
  res.send(html);
});

// --- ROUTE 2: The Image Generator (API) ---
// This draws the actual PNG file
app.get('/api/calendar', (req, res) => {
  try {
    // 1. Get Dimensions
    const width = parseInt(req.query.width) || 2560;
    const height = parseInt(req.query.height) || 1664;
    
    // 2. Determine Orientation
    const isLandscape = width >= height;
    
    // 3. Responsive Grid Settings
    const cols = isLandscape ? 4 : 2;
    const rows = isLandscape ? 3 : 6;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 4. Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, width, height);

    // 5. Layout Framework
    const padding = Math.min(width, height) * 0.05; // 5% padding
    const contentW = width - (padding * 2);
    const contentH = height - (padding * 2);
    
    // Draw Border
    ctx.strokeStyle = COLORS.text;
    ctx.lineWidth = Math.min(width, height) * 0.003; 
    ctx.strokeRect(padding, padding, contentW, contentH);

    // 6. Header "2026"
    const headerH = contentH * 0.12; 
    
    ctx.fillStyle = COLORS.text;
    const titleFontSize = Math.min(contentW * 0.15, headerH * 0.8);
    ctx.font = `bold ${titleFontSize}px sans-serif`; 
    ctx.textBaseline = 'middle';
    ctx.fillText(YEAR.toString(), padding + (contentW * 0.02), padding + (headerH / 2));

    // 7. Grid Calculation
    const gridTop = padding + headerH; 
    const gridH = (padding + contentH) - gridTop - (padding * 0.5); 
    
    const colW = contentW / cols;
    const rowH = gridH / rows;

    // Font Sizing (Relative to column width)
    const bigNumSize = colW * 0.20;     
    const monthNameSize = colW * 0.07;  
    const dayTextSize = colW * 0.042;   
    const cellPadding = colW * 0.08;    

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekHeader = "Mo Tu We Th Fr Sa Su".split(" ");

    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const isCurrentYear = now.getFullYear() === YEAR;

    // --- RENDER LOOP ---
    for (let m = 0; m < 12; m++) {
      const col = m % cols;
      const row = Math.floor(m / cols);

      const cellX = padding + (col * colW);
      const cellY = gridTop + (row * rowH);

      // A. Month Header
      const headerY = cellY + (rowH * 0.05);
      
      ctx.fillStyle = COLORS.text;
      ctx.textBaseline = 'top';
      
      // Number
      ctx.font = `bold ${bigNumSize}px sans-serif`;
      ctx.fillText((m + 1).toString().padStart(2, '0'), cellX + cellPadding, headerY);
      
      // Name
      const numWidth = ctx.measureText((m + 1).toString().padStart(2, '0')).width;
      ctx.font = `bold ${monthNameSize}px sans-serif`;
      ctx.fillText(monthNames[m], cellX + cellPadding + numWidth + (colW * 0.03), headerY + (bigNumSize * 0.25));

      // B. Days Grid
      const gridStartY = headerY + bigNumSize + (rowH * 0.02); 
      const availableH = rowH - (bigNumSize + (rowH * 0.1));
      const lineSpacingY = availableH / 8; 
      const daySpacingX = (colW - (cellPadding * 2)) / 7; 

      // Week Headers
      ctx.font = `${dayTextSize}px sans-serif`;
      weekHeader.forEach((day, i) => {
        ctx.fillText(day, cellX + cellPadding + (i * daySpacingX), gridStartY);
      });

      // Days
      const { daysInMonth, startDayOffset } = getMonthCalendar(YEAR, m);
      let drawX = startDayOffset;
      let drawY = 1; 

      for (let d = 1; d <= daysInMonth; d++) {
        const xPos = cellX + cellPadding + (drawX * daySpacingX);
        const yPos = gridStartY + (drawY * lineSpacingY);

        if (isCurrentYear && m === currentMonth && d === currentDay) {
            const radius = dayTextSize * 1.1;
            const cx = xPos + (ctx.measureText(d.toString()).width / 2);
            const cy = yPos + (dayTextSize / 2);

            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = COLORS.highlight;
            ctx.fill();
            ctx.fillStyle = COLORS.highlightText;
        } else {
            ctx.fillStyle = COLORS.text;
        }

        ctx.fillText(d.toString(), xPos, yPos);

        drawX++;
        if (drawX > 6) {
          drawX = 0;
          drawY++;
        }
      }
    }

    res.setHeader('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});