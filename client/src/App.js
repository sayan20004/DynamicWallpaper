import React, { useState, useEffect } from 'react';

// --- CONFIGURATION ---
// Your hosted backend URL from Render
const DEPLOYED_BACKEND_URL = 'https://dynamicwallpaper.onrender.com'; 

// LOGIC UPDATE:
// We now check if DEPLOYED_BACKEND_URL is set. 
// If it is, we use it immediately (so you see the hosted link).
// We only fall back to localhost if the variable is empty.
const API_BASE = DEPLOYED_BACKEND_URL 
  ? `${DEPLOYED_BACKEND_URL}/api/calendar`
  : 'http://localhost:5001/api/calendar';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#111', 
    color: '#eee', 
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px'
  },
  header: { fontSize: '2.5rem', marginBottom: '20px', color: '#F3EFE3' },
  urlBox: {
    background: '#222',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #444',
    fontFamily: 'monospace',
    color: '#4CAF50',
    marginBottom: '30px',
    wordBreak: 'break-all',
    maxWidth: '800px',
    textAlign: 'center'
  },
  img: {
    maxWidth: '90%',
    borderRadius: '12px',
    border: '4px solid #F3EFE3',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
  }
};

function App() {
  const [winSize, setWinSize] = useState({ w: 0, h: 0 });
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Detect screen resolution
    setWinSize({
      w: window.screen.width * window.devicePixelRatio,
      h: window.screen.height * window.devicePixelRatio
    });
  }, []);

  useEffect(() => {
    if (winSize.w > 0) {
      // Create the URL with a timestamp (&t=) to prevent caching
      setUrl(`${API_BASE}?width=${winSize.w}&height=${winSize.h}&t=${Date.now()}`);
    }
  }, [winSize]);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>2026 Calendar Wallpaper</h1>
      
      {url && (
        <>
          <p><strong>For Mac Users:</strong> Copy this URL into your Shortcuts app.</p>
          <div style={styles.urlBox}>{url}</div>
          
          <p>Live Preview:</p>
          <img src={url} alt="Preview" style={styles.img} />
        </>
      )}
    </div>
  );
}

export default App;