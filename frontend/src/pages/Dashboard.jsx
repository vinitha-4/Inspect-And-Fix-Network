import React from 'react';
import StatCard from '../components/StatCard';
import { 
  FileCheck, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCheck, 
  ArrowRight, 
  ShieldAlert, 
  Cpu, 
  Zap,
  Activity
} from 'lucide-react';

export default function Dashboard({ stats, analysisResult, onNavigate, onRunDemo }) {
  const recentIssues = analysisResult?.issues || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderLeft: '4px solid #3b82f6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-blue">Cisco VIP-2026 Demo Project</span>
            <span className="badge badge-green">Engine Active</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Network Configuration Health Center</h2>
          <p className="subtitle">
            Upload or paste Cisco IOS switch configurations to detect trunk VLAN omissions, IP misconfigurations, and receive real-time CLI auto-fixes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-demo" onClick={onRunDemo}>
            <Zap size={16} />
            <span>Run VIP-2026 Demo</span>
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate('checker')}>
            <span>Open Checker</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Dashboard Metric Cards */}
      <div className="grid-4">
        <StatCard
          title="Total Configurations Checked"
          value={stats.totalChecked}
          icon={FileCheck}
          colorClass="badge-blue"
          subtitle="Analyzed by Python Engine"
        />
        <StatCard
          title="Errors Detected"
          value={stats.errorsDetected}
          icon={AlertOctagon}
          colorClass="badge-red"
          subtitle="Requires immediate CLI fix"
        />
        <StatCard
          title="Warnings"
          value={stats.warnings}
          icon={AlertTriangle}
          colorClass="badge-yellow"
          subtitle="Best-practice recommendations"
        />
        <StatCard
          title="Fixed Issues"
          value={stats.fixedIssues}
          icon={CheckCheck}
          colorClass="badge-green"
          subtitle="Successfully remediated"
        />
      </div>

      {/* Main Grid: Status Summary & Recent Analysis */}
      <div className="grid-2">
        {/* Current Active Analysis Overview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="#3b82f6" />
              <span>Current Config Overview</span>
            </h3>
            {analysisResult && (
              <span className={`badge badge-${analysisResult.status === 'correct' ? 'green' : 'red'}`}>
                {analysisResult.status.toUpperCase()}
              </span>
            )}
          </div>

          {analysisResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ 
                padding: '1rem', 
                borderRadius: '8px', 
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Target Hostname</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                    {analysisResult.hostname}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Detected VLANs</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', textAlign: 'right' }}>
                    {analysisResult.detected_vlans.length} VLANs
                  </div>
                </div>
              </div>

              {/* Check Matrix Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 600 }}>CHECK MATRIX STATUS</span>
                {analysisResult.check_matrix.map((chk, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.85rem',
                    borderRadius: '6px',
                    backgroundColor: '#0d1322',
                    border: '1px solid var(--border-color)'
                  }}>
                    <span style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>{chk.name}</span>
                    <span className={`badge badge-${chk.status === 'correct' ? 'green' : chk.status === 'error' ? 'red' : 'yellow'}`}>
                      {chk.status === 'correct' ? '✓ Correct' : chk.status === 'error' ? '✗ Error' : '⚠ Warning'}
                    </span>
                  </div>
                ))}
              </div>

              <button className="btn btn-secondary" onClick={() => onNavigate('issues')} style={{ width: '100%', marginTop: '0.5rem' }}>
                <span>View Full Analysis Breakdown</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              <p>No configuration analyzed yet.</p>
              <button className="btn btn-demo" onClick={onRunDemo} style={{ marginTop: '1rem' }}>
                <Zap size={16} />
                <span>Load VIP-2026 Demo Config</span>
              </button>
            </div>
          )}
        </div>

        {/* Recent Detected Issues */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="#ef4444" />
              <span>Detected Issues</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {recentIssues.length} total issue(s)
            </span>
          </div>

          {recentIssues.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {recentIssues.map((issue, idx) => (
                <div key={idx} style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{issue.title}</span>
                    <span className={`badge badge-${issue.severity}`}>{issue.severity}</span>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: '#cbd5e1' }}>{issue.message}</p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }} onClick={() => onNavigate('fixes')}>
                      <span>Auto-Fix</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <CheckCheck size={40} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 600 }}>All Systems Operational</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>No configuration errors currently detected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

