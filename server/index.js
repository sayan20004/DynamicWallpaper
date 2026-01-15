import express from 'express';
import { createCanvas } from 'canvas';
import cors from 'cors';

const app = express();
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

// Calendar Logic
const getMonthCalendar = (year, monthIndex) => {
  const firstDay = new Date(year, monthIndex, 1).getDay(); 
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startDayOffset = (firstDay === 0 ? 6 : firstDay - 1); 
  return { daysInMonth, startDayOffset };
};

app.get('/api/calendar', (req, res) => {
  try {
    // 1. Get Dimensions
    const width = parseInt(req.query.width) || 2560;
    const height = parseInt(req.query.height) || 1664;
    
    // 2. Determine Orientation (Landscape vs Portrait)
    const isLandscape = width >= height;
    
    // 3. Responsive Grid Settings
    // Landscape: 4 Cols x 3 Rows
    // Portrait:  2 Cols x 6 Rows (Better for phones)
    const cols = isLandscape ? 4 : 2;
    const rows = isLandscape ? 3 : 6;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 4. Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, width, height);

    // 5. Layout Framework
    const padding = Math.min(width, height) * 0.05; // 5% padding based on smallest side
    const contentW = width - (padding * 2);
    const contentH = height - (padding * 2);
    
    // Draw Border
    ctx.strokeStyle = COLORS.text;
    ctx.lineWidth = Math.min(width, height) * 0.003; // Responsive border thickness
    ctx.strokeRect(padding, padding, contentW, contentH);

    // 6. Header "2026"
    // Allocate 10-15% of vertical space for header
    const headerH = contentH * 0.12; 
    
    ctx.fillStyle = COLORS.text;
    // Font size based on width, but capped for vertical screens
    const titleFontSize = Math.min(contentW * 0.15, headerH * 0.8);
    ctx.font = `bold ${titleFontSize}px sans-serif`; 
    ctx.textBaseline = 'middle';
    ctx.fillText(YEAR.toString(), padding + (contentW * 0.02), padding + (headerH / 2));

    // 7. Grid Calculation
    const gridTop = padding + headerH; 
    const gridH = (padding + contentH) - gridTop - (padding * 0.5); // Bottom padding
    
    const colW = contentW / cols;
    const rowH = gridH / rows;

    // --- RESPONSIVE FONT SIZING ---
    // We calculate font sizes based on the *cell width*, so it scales perfectly
    const bigNumSize = colW * 0.20;     // "01"
    const monthNameSize = colW * 0.07;  // "January"
    const dayTextSize = colW * 0.042;   // "1, 2, 3..."
    const cellPadding = colW * 0.08;    // Internal padding

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
      
      // Number "01"
      ctx.font = `bold ${bigNumSize}px sans-serif`;
      ctx.fillText((m + 1).toString().padStart(2, '0'), cellX + cellPadding, headerY);
      
      // Name "January"
      const numWidth = ctx.measureText((m + 1).toString().padStart(2, '0')).width;
      ctx.font = `bold ${monthNameSize}px sans-serif`;
      ctx.fillText(monthNames[m], cellX + cellPadding + numWidth + (colW * 0.03), headerY + (bigNumSize * 0.25));

      // B. Days Grid
      // We calculate exact vertical space available for the 7 rows of text (header + 6 weeks)
      const gridStartY = headerY + bigNumSize + (rowH * 0.02); 
      const availableH = rowH - (bigNumSize + (rowH * 0.1));
      const lineSpacingY = availableH / 8; // Distribute vertically
      const daySpacingX = (colW - (cellPadding * 2)) / 7; // Distribute horizontally

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

        // Highlight Logic
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