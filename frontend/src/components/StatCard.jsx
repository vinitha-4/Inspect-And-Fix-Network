import React from 'react';

export default function StatCard({ title, value, icon: Icon, colorClass, subtitle }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <div style={{
        padding: '0.9rem',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }} className={colorClass}>
        <Icon size={26} />
      </div>
      <div>
        <span style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0.1rem 0', color: '#f8fafc' }}>
          {value}
        </h3>
        {subtitle && (
          <span style={{ fontSize: '0.775rem', color: '#64748b' }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

