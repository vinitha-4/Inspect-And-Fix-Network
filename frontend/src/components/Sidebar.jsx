import React from 'react';
import { 
  LayoutDashboard, 
  FileCode2, 
  AlertTriangle, 
  Wrench, 
  CheckCircle2, 
  Info,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'checker', label: 'Configuration Checker', icon: FileCode2 },
    { id: 'issues', label: 'Detected Issues', icon: AlertTriangle },
    { id: 'fixes', label: 'Fix Suggestions', icon: Wrench },
    { id: 'verification', label: 'Verification', icon: CheckCircle2 },
    { id: 'about', label: 'About Project', icon: Info },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          width: '38px', 
          height: '38px', 
          borderRadius: '8px', 
          background: 'linear-gradient(135deg, #3b82f6, #0284c7)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#ffffff'
        }}>
          <ShieldCheck size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>Cisco VIP-2026</h2>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>NetConfig Checker</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: isActive ? '#60a5fa' : '#94a3b8',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={19} color={isActive ? '#60a5fa' : '#64748b'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer info */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: '#64748b' }}>
        <p style={{ fontWeight: 600, color: '#94a3b8' }}>Engine Version: 1.0.0</p>
        <p>Python FastAPI Analyzer</p>
      </div>
    </aside>
  );
}

