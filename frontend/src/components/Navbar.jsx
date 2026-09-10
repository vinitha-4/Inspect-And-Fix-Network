import React from 'react';
import { Cpu, Zap } from 'lucide-react';

export default function Navbar({ onRunDemo }) {
  return (
    <header className="navbar">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
            Network Configuration Checker
          </h1>
          <span className="badge badge-blue">Cisco VIP-2026</span>
        </div>
        <p className="subtitle" style={{ fontSize: '0.825rem', marginTop: '0.15rem' }}>
          Python-Based Network Configuration Checker with Auto-Fix Suggestions
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-demo" onClick={onRunDemo}>
          <Zap size={16} />
          <span>Demo Configuration</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.75rem',
          borderRadius: '20px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          fontSize: '0.8rem',
          color: '#10b981',
          fontWeight: 600
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }}></span>
          <span>Python Backend Online</span>
        </div>
      </div>
    </header>
  );
}

