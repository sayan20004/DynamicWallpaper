import React, { useState, useEffect, useRef } from 'react';

// --- CONFIGURATION ---
const DEPLOYED_BACKEND_URL = 'https://dynamicwallpaper.onrender.com'; 

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
  controls: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  label: { fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #444',
    background: '#222',
    color: '#fff',
    fontSize: '1rem',
    width: '100px'
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#2C4E80',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '18px'
  },
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
    maxWidth: '600px',
    width: '90%',
    borderRadius: '12px',
    border: '4px solid #F3EFE3',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    marginBottom: '40px'
  },
  // --- REAL FULLSCREEN STYLES ---
  fullscreenContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#000', // Pure black for immersive feel
    display: 'flex', // We toggle this via inline style
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  fullscreenImg: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain' // Ensures the whole calendar fits without scrolling
  },
  exitBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '10px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.4)',
    borderRadius: '30px',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)'
  }
};

function App() {
  const [customDims, setCustomDims] = useState({ w: 0, h: 0 });
  const [url, setUrl] = useState('');
  
  // We use this ref to target the specific div we want to make fullscreen
  const fullscreenRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const w = window.screen.width * window.devicePixelRatio;
    const h = window.screen.height * window.devicePixelRatio;
    setCustomDims({ w, h });
  }, []);

  useEffect(() => {
    if (customDims.w > 0) {
      setUrl(`${API_BASE}?width=${customDims.w}&height=${customDims.h}&t=${Date.now()}`);
    }
  }, [customDims]);

  // Handle Input Changes
  const handleDimChange = (e, type) => {
    const val = parseInt(e.target.value) || 0;
    setCustomDims(prev => ({ ...prev, [type]: val }));
  };

  // --- TRIGGER TRUE FULLSCREEN ---
  const enterFullscreen = () => {
    if (fullscreenRef.current) {
      setIsFullscreen(true); // Show the div
      // Request native browser fullscreen
      if (fullscreenRef.current.requestFullscreen) {
        fullscreenRef.current.requestFullscreen();
      } else if (fullscreenRef.current.webkitRequestFullscreen) { // Safari
        fullscreenRef.current.webkitRequestFullscreen();
      } else if (fullscreenRef.current.msRequestFullscreen) { // IE11
        fullscreenRef.current.msRequestFullscreen();
      }
    }
  };

  // --- EXIT FULLSCREEN ---
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    setIsFullscreen(false);
  };

  // Listen for "Esc" key to update state if user exits via keyboard
  useEffect(() => {
    const handleChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>2026 Calendar Wallpaper</h1>
      
      <div style={styles.controls}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Width (px)</label>
          <input 
            type="number" 
            style={styles.input} 
            value={customDims.w} 
            onChange={(e) => handleDimChange(e, 'w')}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Height (px)</label>
          <input 
            type="number" 
            style={styles.input} 
            value={customDims.h} 
            onChange={(e) => handleDimChange(e, 'h')}
          />
        </div>

        <button style={styles.button} onClick={enterFullscreen}>
          ⛶ Go Full Screen
        </button>
      </div>

      {url && (
        <>
          <p><strong>Your Dynamic Link:</strong></p>
          <div style={styles.urlBox}>{url}</div>
          
          <p style={{color:'#888', marginBottom:'10px'}}>Preview:</p>
          <img src={url} alt="Preview" style={styles.img} />
        </>
      )}

      {/* --- HIDDEN FULLSCREEN LAYER --- */}
      {/* We keep this in the DOM but hidden until needed */}
      <div 
        ref={fullscreenRef} 
        style={{
          ...styles.fullscreenContainer,
          display: isFullscreen ? 'flex' : 'none'
        }}
      >
        <img src={url} alt="Full Screen" style={styles.fullscreenImg} />
        
        <button style={styles.exitBtn} onClick={exitFullscreen}>
          Exit Full Screen
        </button>
      </div>
    </div>
  );
}

export default App;