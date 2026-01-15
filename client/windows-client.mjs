import axios from 'axios';
import { setWallpaper } from 'wallpaper';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- USER SETTINGS ---
// You can adjust these numbers to match your specific laptop screen
const WIDTH = 2560;
const HEIGHT = 1600;

// --- CONFIGURATION ---
// Updated to point to your live hosted server
const BACKEND_URL = 'https://dynamicwallpaper.onrender.com'; 

const FULL_URL = `${BACKEND_URL}/api/calendar?width=${WIDTH}&height=${HEIGHT}`;

// --- SCRIPT ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Save image to the same folder as this script
const imagePath = path.join(__dirname, `daily-wallpaper.png`);

const updateWallpaper = async () => {
  try {
    console.log('⏳ Connecting to Calendar Server...');
    console.log(`   Target: ${FULL_URL}`);
    
    // 1. Download the image
    const response = await axios({
      url: FULL_URL,
      method: 'GET',
      responseType: 'stream'
    });

    // 2. Save it to disk
    const writer = fs.createWriteStream(imagePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log('✅ Image downloaded successfully.');

    // 3. Set it as the desktop wallpaper
    await setWallpaper(imagePath);
    console.log('🖥️  Windows Wallpaper updated!');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Error: Could not reach the server.');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
};

updateWallpaper();