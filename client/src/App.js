import React, { useState, useEffect } from 'react';

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
    marginTop: '18px' // Align with inputs
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
  // Full Screen Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalImg: {
    maxWidth: '95%',
    maxHeight: '85vh',
    borderRadius: '8px',
    boxShadow: '0 0 50px rgba(0,0,0,0.8)',
    border: '2px solid #555'
  },
  closeBtn: {
    marginTop: '20px',
    padding: '10px 30px',
    backgroundColor: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1.2rem',
    cursor: 'pointer'
  }
};

function App() {
  // Use "customDims" to track what the user types
  const [customDims, setCustomDims] = useState({ w: 0, h: 0 });
  const [url, setUrl] = useState('');
  const [showModal, setShowModal] = useState(false);

  // 1. On Load: Auto-detect screen size
  useEffect(() => {
    const w = window.screen.width * window.devicePixelRatio;
    const h = window.screen.height * window.devicePixelRatio;
    setCustomDims({ w, h });
  }, []);

  // 2. Whenever dimensions change, update the URL
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

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>2026 Calendar Wallpaper</h1>
      
      {/* --- CONTROL PANEL --- */}
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

        <button 
          style={styles.button} 
          onClick={() => setShowModal(true)}
        >
          👁️ Preview Full Screen
        </button>
      </div>

      {url && (
        <>
          <p><strong>Your Dynamic Link:</strong></p>
          <div style={styles.urlBox}>{url}</div>
          
          <p style={{color:'#888', marginBottom:'10px'}}>Small Preview:</p>
          <img src={url} alt="Preview" style={styles.img} />
        </>
      )}

      {/* --- FULL SCREEN MODAL --- */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <img 
            src={url} 
            alt="Full Screen Preview" 
            style={styles.modalImg} 
            onClick={(e) => e.stopPropagation()} // Prevent clicking image from closing
          />
          <button style={styles.closeBtn} onClick={() => setShowModal(false)}>
            Close Preview
          </button>
        </div>
      )}
    </div>
  );
}

export default App;