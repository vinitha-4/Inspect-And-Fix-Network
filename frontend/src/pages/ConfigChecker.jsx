import React, { useState } from 'react';
import { 
  FileCode2, 
  Upload, 
  Play, 
  Zap, 
  Trash2, 
  Copy, 
  Check, 
  Loader2,
  FileText
} from 'lucide-react';

export default function ConfigChecker({ 
  configText, 
  setConfigText, 
  onAnalyze, 
  onRunDemo, 
  sampleConfigs, 
  isAnalyzing 
}) {
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'upload'
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setConfigText(evt.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(configText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = configText.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileCode2 size={24} color="#3b82f6" />
            <span>Cisco Configuration Input</span>
          </h2>
          <p className="subtitle">
            Enter or upload a Cisco IOS configuration text to run Python-based rule checking.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-demo" onClick={onRunDemo}>
            <Zap size={16} />
            <span>Load VIP-2026 Demo</span>
          </button>
        </div>
      </div>

      {/* Preset selector bar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
          Sample Presets:
        </span>
        {sampleConfigs && Object.entries(sampleConfigs).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setConfigText(cfg.content)}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            <FileText size={14} color="#38bdf8" />
            <span>{cfg.name}</span>
          </button>
        ))}
      </div>

      {/* Input Mode Selector */}
      <div className="card" style={{ padding: '0.5rem', display: 'inline-flex', gap: '0.5rem', width: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('paste')}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'paste' ? 'var(--accent-blue)' : 'transparent',
            color: activeTab === 'paste' ? '#ffffff' : '#94a3b8',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FileCode2 size={16} />
          <span>Option 1: Paste Configuration</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'upload' ? 'var(--accent-blue)' : 'transparent',
            color: activeTab === 'upload' ? '#ffffff' : '#94a3b8',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Upload size={16} />
          <span>Option 2: Upload File (.txt, .cfg, .conf)</span>
        </button>
      </div>

      {/* Tab 1: Paste Configuration Code Editor */}
      {activeTab === 'paste' && (
        <div className="code-editor-container">
          <div className="code-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCode2 size={14} color="#3b82f6" />
              Cisco IOS Configuration Editor ({lineCount} lines)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={handleCopy}
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem' }}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setConfigText('')}
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem', color: '#ef4444' }}
              >
                <Trash2 size={14} />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', position: 'relative' }}>
            {/* Line numbers gutter */}
            <div style={{
              padding: '1rem 0.75rem',
              backgroundColor: '#070b14',
              color: '#475569',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              lineHeight: 1.6,
              textAlign: 'right',
              userSelect: 'none',
              borderRight: '1px solid var(--border-color)',
              whiteSpace: 'pre'
            }}>
              {lineNumbers}
            </div>

            {/* Code Textarea */}
            <textarea
              className="code-textarea"
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              placeholder={`hostname Switch1\n\nvlan 10\n name Students\n\nvlan 20\n name Faculty\n\nvlan 30\n name Administration\n\ninterface GigabitEthernet0/1\n switchport mode trunk\n switchport trunk allowed vlan 10,30`}
              rows={16}
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Upload File */}
      {activeTab === 'upload' && (
        <div className="card" style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          border: '2px dashed var(--border-highlight)',
          backgroundColor: 'rgba(15, 23, 42, 0.4)'
        }}>
          <Upload size={48} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Upload Cisco Configuration File</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Supports <code>.txt</code>, <code>.cfg</code>, or <code>.conf</code> Cisco IOS configuration exports.
          </p>
          
          <input
            type="file"
            id="fileInput"
            accept=".txt,.cfg,.conf"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <label htmlFor="fileInput" className="btn btn-primary" style={{ display: 'inline-flex', cursor: 'pointer' }}>
            <Upload size={16} />
            <span>Select Configuration File</span>
          </label>

          {fileName && (
            <div style={{ marginTop: '1.5rem', color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>
              Loaded: {fileName} ({lineCount} lines)
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button
          className="btn btn-primary"
          onClick={onAnalyze}
          disabled={isAnalyzing || !configText.strip?.() && !configText}
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Analyzing Configuration...</span>
            </>
          ) : (
            <>
              <Play size={20} />
              <span>Analyze Configuration</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

