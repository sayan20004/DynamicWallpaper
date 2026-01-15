import express from 'express';
import { createCanvas } from 'canvas';
import cors from 'cors';

const app = express();
// Use the port Render assigns, or 5001 if on localhost
const port = process.env.PORT || 5001;

app.use(cors());

// --- CONFIGURATION ---
const YEAR = 2026;
const COLORS = {
  bg: '#F3EFE3',        
  text: '#2C4E80',      
  highlight: '#2C4E80', 
  highlightText: '#F3EFE3' 
};

const getMonthCalendar = (year, monthIndex) => {
  const firstDay = new Date(year, monthIndex, 1).getDay(); 
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startDayOffset = (firstDay === 0 ? 6 : firstDay - 1); 
  return { daysInMonth, startDayOffset };
};

app.get('/api/calendar', (req, res) => {
  try {
    const width = parseInt(req.query.width) || 2560;
    const height = parseInt(req.query.height) || 1664;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, width, height);

    // 2. Layout Framework
    const padding = width * 0.04; 
    const contentW = width - (padding * 2);
    const contentH = height - (padding * 2);
    
    ctx.strokeStyle = COLORS.text;
    ctx.lineWidth = 5;
    ctx.strokeRect(padding, padding, contentW, contentH);

    // 3. Header "2026"
    const headerH = contentH * 0.12; 
    ctx.fillStyle = COLORS.text;
    ctx.font = `bold ${headerH * 0.9}px sans-serif`; 
    ctx.textBaseline = 'middle';
    ctx.fillText(YEAR.toString(), padding + (contentW * 0.02), padding + (headerH / 2));

    // 4. Grid Setup
    const gridTop = padding + headerH + (contentH * 0.02); 
    const gridH = (padding + contentH) - gridTop - (contentH * 0.02); 
    
    const colW = contentW / 4;
    const rowH = gridH / 3;

    // Font Sizing
    const bigNumSize = colW * 0.22;    
    const monthNameSize = colW * 0.08; 
    const dayTextSize = colW * 0.045;  
    const cellPadding = colW * 0.08;   

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekHeader = "Mo Tu We Th Fr Sa Su".split(" ");

    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const isCurrentYear = now.getFullYear() === YEAR;

    // --- RENDER LOOP ---
    for (let m = 0; m < 12; m++) {
      const col = m % 4;
      const row = Math.floor(m / 4);

      const cellX = padding + (col * colW);
      const cellY = gridTop + (row * rowH);
      const headerY = cellY; 
      
      ctx.fillStyle = COLORS.text;
      ctx.textBaseline = 'top';
      
      // Number & Name
      ctx.font = `bold ${bigNumSize}px sans-serif`;
      ctx.fillText((m + 1).toString().padStart(2, '0'), cellX + cellPadding, headerY);
      
      const numWidth = ctx.measureText((m + 1).toString().padStart(2, '0')).width;
      ctx.font = `bold ${monthNameSize}px sans-serif`;
      ctx.fillText(monthNames[m], cellX + cellPadding + numWidth + 15, headerY + (bigNumSize * 0.2));

      // Grid
      const gridStartY = headerY + bigNumSize + (rowH * 0.02); 
      const availableHeightForDays = rowH - (bigNumSize + (rowH * 0.05));
      const lineSpacingY = availableHeightForDays / 8; 
      const daySpacingX = (colW - (cellPadding * 2)) / 7;

      ctx.font = `${dayTextSize}px sans-serif`;
      weekHeader.forEach((day, i) => {
        ctx.fillText(day, cellX + cellPadding + (i * daySpacingX), gridStartY);
      });

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