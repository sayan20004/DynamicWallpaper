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
  // Special style for large scripts
  scriptBox: {
    background: '#0a0a0a',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #333',
    fontFamily: 'monospace',
    color: '#a5d6a7', 
    fontSize: '0.85rem',
    margin: '10px 0 20px 0',
    whiteSpace: 'pre-wrap', 
    overflowX: 'auto',
    maxHeight: '300px',
    overflowY: 'auto',
    position: 'relative'
  },
  copyBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid #555',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    marginLeft: '10px',
    flexShrink: 0
  },
  copyBtnFloating: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: '#2C4E80',
    color: '#fff',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
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

  const rawImageUrl = `${BACKEND_BASE}/api/calendar?width=${dims.w}&height=${dims.h}`;

  // --- WINDOWS SCRIPT (PowerShell) ---
  const windowsScript = `# PowerShell Installer for Life Calendar
$Url = "${rawImageUrl}"
$Dest = "$env:USERPROFILE\\Pictures\\LifeCalendar.png"
$ScriptPath = "$env:USERPROFILE\\Documents\\Update-LifeCalendar.ps1"

Write-Host "⏳ Installing Life Calendar..."

# 1. Create the persistent Updater Script
$Code = @"
\`$Url = "$Url&t=" + (Get-Date).Ticks
\`$Dest = "$Dest"

# Download Image
Invoke-WebRequest -Uri \`$Url -OutFile \`$Dest

# Set Wallpaper using SystemParametersInfo
\`$c_code = @'
using System.Runtime.InteropServices;
public class Wallpaper {
    [DllImport("user32.dll", CharSet=CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
'@
Add-Type -TypeDefinition \`$c_code 
[Wallpaper]::SystemParametersInfo(20, 0, \`$Dest, 3)
"@

Set-Content -Path $ScriptPath -Value $Code

# 2. Run it immediately
PowerShell -ExecutionPolicy Bypass -File $ScriptPath

# 3. Schedule Daily Task
$TaskName = "LifeCalendarUpdate"
$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File \`"$ScriptPath\`""
$Trigger = New-ScheduledTaskTrigger -Daily -At 6am

Unregister-ScheduledTask -TaskName $TaskName -Confirm:\`$false -ErrorAction SilentlyContinue
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Force

Write-Host "✅ Success! Wallpaper will update daily at 6:00 AM."
Start-Sleep -Seconds 5`;

  // --- LINUX INSTALLER SCRIPT (Updated for Fedora/Modern GNOME) ---
  // Change: Using direct /run/user/$UID/bus instead of searching for PID
  const linuxInstallScript = `#!/bin/bash
WIDTH=${dims.w}
HEIGHT=${dims.h}
TARGET_DIR="$HOME/.local/bin"
UPDATER_SCRIPT="$TARGET_DIR/update-life-calendar.sh"
IMAGE_PATH="$HOME/.life-calendar.png"
URL="${BACKEND_BASE}/api/calendar?width=$WIDTH&height=$HEIGHT"

echo "⚙️  Setting up Life Calendar..."
mkdir -p "$TARGET_DIR"

# Write the updater script
cat <<EOF > "$UPDATER_SCRIPT"
#!/bin/bash
wget -q -O "$IMAGE_PATH" "$URL&t=\$(date +%s)"

# CRITICAL FIX: Connect to the correct display bus (Modern Fedora/Ubuntu)
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/\$(id -u)/bus"

# Set for both Light and Dark modes
gsettings set org.gnome.desktop.background picture-uri "file://$IMAGE_PATH"
gsettings set org.gnome.desktop.background picture-uri-dark "file://$IMAGE_PATH"
EOF

chmod +x "$UPDATER_SCRIPT"
"$UPDATER_SCRIPT"

if ! crontab -l 2>/dev/null | grep -q "$UPDATER_SCRIPT"; then
    (crontab -l 2>/dev/null; echo "0 6 * * * $UPDATER_SCRIPT") | crontab -
    echo "✅ Automation scheduled!"
else
    echo "✅ Automation already exists."
fi
echo "🎉 Done!"`;

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
          <p style={{color: '#ccc', marginBottom: '20px', lineHeight: '1.6'}}>
            This <b>PowerShell script</b> will create a hidden task to automatically 
            download and set your wallpaper every day. No extra apps required.
          </p>

          <ol style={styles.stepList}>
            <li>Create a new file named <code>install.ps1</code> on your Desktop.</li>
            <li>Paste the code below into it:</li>
          </ol>

          <div style={styles.scriptBox}>
            {windowsScript}
            <button style={styles.copyBtnFloating} onClick={() => copyToClipboard(windowsScript)}>
              {copyFeedback || 'Copy Script'}
            </button>
          </div>

          <ol style={styles.stepList} start={3}>
            <li>Right-click the file and select <b>"Run with PowerShell"</b>.</li>
          </ol>
        </div>
      )}

      {/* LINUX INSTRUCTIONS */}
      {activeTab === 'linux' && (
        <div style={styles.instructionBox}>
          <h3 style={styles.stepTitle}>Installation for Linux (GNOME)</h3>
          <p style={{color: '#ccc', marginBottom: '20px', lineHeight: '1.6'}}>
            This script downloads the wallpaper, sets it for both Light/Dark modes, 
            and creates a daily cron job.
          </p>

          <ol style={styles.stepList}>
            <li>Create a file named <code>install.sh</code> and paste the code below:</li>
          </ol>

          <div style={styles.scriptBox}>
            {linuxInstallScript}
            <button style={styles.copyBtnFloating} onClick={() => copyToClipboard(linuxInstallScript)}>
              {copyFeedback || 'Copy Script'}
            </button>
          </div>

          <ol style={styles.stepList} start={2}>
            <li>Run the installer in terminal:</li>
            <div style={styles.codeBox}>
              chmod +x install.sh && ./install.sh
              <button style={styles.copyBtn} onClick={() => copyToClipboard('chmod +x install.sh && ./install.sh')}>Copy</button>
            </div>
          </ol>
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