import React, { useState, useEffect, useRef } from 'react';

// --- CONFIGURATION ---
const DEPLOYED_BACKEND_URL = 'https://dynamicwallpaper.onrender.com'; 

const BACKEND_BASE = DEPLOYED_BACKEND_URL 
  ? DEPLOYED_BACKEND_URL
  : 'http://localhost:5001';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a', 
    color: '#ededed', 
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px'
  },
  header: { fontSize: '2.8rem', marginBottom: '10px', color: '#F3EFE3', fontWeight: '800', textAlign: 'center' },
  subHeader: { fontSize: '1.1rem', color: '#888', marginBottom: '40px', textAlign: 'center', maxWidth: '600px', lineHeight: '1.5' },
  
  // Controls
  controls: {
    display: 'flex',
    gap: '15px',
    marginBottom: '40px',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    justifyContent: 'center',
    background: '#1a1a1a',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #333'
  },
  inputGroup: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  label: { fontSize: '0.85rem', color: '#aaa', marginBottom: '8px', fontWeight: '500' },
  input: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #444',
    background: '#0a0a0a',
    color: '#fff',
    fontSize: '1rem',
    width: '100px',
    textAlign: 'center'
  },
  previewBtn: {
    padding: '12px 24px',
    backgroundColor: '#2C4E80',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background 0.2s',
    height: '44px'
  },

  // Tabs
  tabs: {
    display: 'flex',
    marginBottom: '20px',
    background: '#1a1a1a',
    borderRadius: '8px',
    padding: '4px',
    border: '1px solid #333'
  },
  tab: (isActive) => ({
    padding: '10px 30px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    backgroundColor: isActive ? '#333' : 'transparent',
    color: isActive ? '#fff' : '#888',
    transition: 'all 0.2s'
  }),
  
  // Instructions
  instructionBox: {
    background: '#161616',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '700px',
    width: '100%',
    marginBottom: '40px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
  },
  stepTitle: { fontSize: '1.2rem', color: '#fff', marginBottom: '15px', fontWeight: '600' },
  stepList: { paddingLeft: '20px', lineHeight: '1.8', color: '#ccc' },
  codeBox: {
    background: '#0a0a0a',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #333',
    fontFamily: 'monospace',
    color: '#4CAF50',
    fontSize: '0.9rem',
    margin: '10px 0 20px 0',
    wordBreak: 'break-all',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  copyBtn: {
    background: 'transparent',
    border: '1px solid #555',
    color: '#aaa',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    marginLeft: '10px'
  },

  // Full Screen
  fullscreenContainer: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
  },
  fullscreenImg: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
  exitBtn: {
    position: 'absolute', top: '20px', right: '20px',
    padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '30px', cursor: 'pointer', backdropFilter: 'blur(10px)'
  }
};

function App() {
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [activeTab, setActiveTab] = useState('mac'); 
  const [copyFeedback, setCopyFeedback] = useState('');
  
  const fullscreenRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setDims({
      w: window.screen.width * window.devicePixelRatio,
      h: window.screen.height * window.devicePixelRatio
    });
  }, []);

  const handleDimChange = (e, type) => {
    const val = parseInt(e.target.value) || 0;
    setDims(prev => ({ ...prev, [type]: val }));
  };

  // --- URL LOGIC ---
  const rawImageUrl = `${BACKEND_BASE}/api/calendar?width=${dims.w}&height=${dims.h}`;
  const windowsUrl = `${BACKEND_BASE}/view?width=${dims.w}&height=${dims.h}`;

  // Linux: Download One-Liner
  const linuxCommand = `wget -O ~/.life-calendar.png "${rawImageUrl}" && gsettings set org.gnome.desktop.background picture-uri "file://$HOME/.life-calendar.png"`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback('Copied!');
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const enterFullscreen = () => {
    if (fullscreenRef.current) {
      setIsFullscreen(true);
      if (fullscreenRef.current.requestFullscreen) fullscreenRef.current.requestFullscreen();
      else if (fullscreenRef.current.webkitRequestFullscreen) fullscreenRef.current.webkitRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    setIsFullscreen(false);
  };

  useEffect(() => {
    const handleChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>2026 Life Calendar</h1>
      <p style={styles.subHeader}>
        A minimalist, auto-updating wallpaper that tracks your year in dots. 
        <br />Select your OS below to get started.
      </p>

      {/* CONTROLS */}
      <div style={styles.controls}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Width</label>
          <input type="number" style={styles.input} value={dims.w} onChange={(e) => handleDimChange(e, 'w')} />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Height</label>
          <input type="number" style={styles.input} value={dims.h} onChange={(e) => handleDimChange(e, 'h')} />
        </div>
        <button style={styles.previewBtn} onClick={enterFullscreen}>
          ⛶ Full Screen Preview
        </button>
      </div>

      {/* TABS */}
      <div style={styles.tabs}>
        <div style={styles.tab(activeTab === 'mac')} onClick={() => setActiveTab('mac')}>
           macOS
        </div>
        <div style={styles.tab(activeTab === 'windows')} onClick={() => setActiveTab('windows')}>
          🪟 Windows
        </div>
        <div style={styles.tab(activeTab === 'linux')} onClick={() => setActiveTab('linux')}>
          🐧 Linux
        </div>
      </div>

      {/* MAC INSTRUCTIONS */}
      {activeTab === 'mac' && (
        <div style={styles.instructionBox}>
          <h3 style={styles.stepTitle}>Installation for macOS / iOS</h3>
          <p style={{color: '#888', marginBottom: '20px'}}>Use this link in the Shortcuts App to automate your background.</p>
          
          <div style={styles.codeBox}>
            {rawImageUrl}
            <button style={styles.copyBtn} onClick={() => copyToClipboard(rawImageUrl)}>{copyFeedback || 'Copy'}</button>
          </div>
          
          <ol style={styles.stepList}>
            <li>Open <b>Shortcuts App</b> → New Automation.</li>
            <li>Add <b>"Get Contents of URL"</b> (Paste above link).</li>
            <li>Add <b>"Set Wallpaper"</b>.</li>
          </ol>
        </div>
      )}

      {/* WINDOWS INSTRUCTIONS */}
      {activeTab === 'windows' && (
        <div style={styles.instructionBox}>
          <h3 style={styles.stepTitle}>Installation for Windows</h3>
          <p style={{color: '#888', marginBottom: '20px'}}>Use this special Viewer Link in "Lively Wallpaper" to fix black bars.</p>
          
          <div style={styles.codeBox}>
            {windowsUrl}
            <button style={styles.copyBtn} onClick={() => copyToClipboard(windowsUrl)}>{copyFeedback || 'Copy'}</button>
          </div>

          <ol style={styles.stepList}>
            <li>Open <b>Lively Wallpaper</b> (Free on Store).</li>
            <li>Click <b>+ Add</b> → Select "Enter URL".</li>
            <li>Paste the link above and click Go.</li>
          </ol>
        </div>
      )}

      {/* LINUX INSTRUCTIONS */}
      {activeTab === 'linux' && (
        <div style={styles.instructionBox}>
          <h3 style={styles.stepTitle}>Installation for Linux</h3>
          <p style={{color: '#888', marginBottom: '20px'}}>You can use the direct image link in tools like <b>Variety</b>, or run the command below.</p>
          
          {/* 1. The Direct Link (User Request) */}
          <div style={styles.codeBox}>
            {rawImageUrl}
            <button style={styles.copyBtn} onClick={() => copyToClipboard(rawImageUrl)}>{copyFeedback || 'Copy'}</button>
          </div>

          {/* 2. The Terminal One-Liner (For Automation) */}
          <p style={{color: '#888', marginTop: '30px', marginBottom: '10px'}}>Or run this one-liner to download & apply immediately (GNOME):</p>
          <div style={styles.codeBox}>
            {linuxCommand}
            <button style={styles.copyBtn} onClick={() => copyToClipboard(linuxCommand)}>{copyFeedback || 'Copy'}</button>
          </div>
        </div>
      )}

      {/* FULLSCREEN PREVIEW */}
      <div 
        ref={fullscreenRef} 
        style={{...styles.fullscreenContainer, display: isFullscreen ? 'flex' : 'none'}}
      >
        <img src={rawImageUrl + `&t=${Date.now()}`} alt="Full Screen" style={styles.fullscreenImg} />
        <button style={styles.exitBtn} onClick={exitFullscreen}>Exit Preview</button>
      </div>
    </div>
  );
}

export default App;