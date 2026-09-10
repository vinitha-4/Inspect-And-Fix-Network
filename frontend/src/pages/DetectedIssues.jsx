import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Wrench, 
  HelpCircle,
  FileCode,
  ShieldAlert
} from 'lucide-react';

export default function DetectedIssues({ analysisResult, onNavigate, onApplyFix }) {
  const [selectedIssue, setSelectedIssue] = useState(null);

  if (!analysisResult) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <AlertTriangle size={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
        <h3>No Analysis Data Available</h3>
        <p style={{ marginTop: '0.5rem' }}>Please paste or upload a configuration and click 'Analyze Configuration'.</p>
        <button className="btn btn-primary" onClick={() => onNavigate('checker')} style={{ marginTop: '1.5rem' }}>
          Go to Configuration Checker
        </button>
      </div>
    );
  }

  const { status, summary, check_matrix, issues } = analysisResult;
  const currentSelected = selectedIssue || (issues.length > 0 ? issues[0] : null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertTriangle size={24} color="#ef4444" />
            <span>Configuration Analysis Results</span>
          </h2>
          <p className="subtitle">
            Hostname: <strong>{analysisResult.hostname}</strong> | Overall Status: {' '}
            <strong style={{ color: status === 'correct' ? '#10b981' : '#ef4444' }}>
              {status === 'correct' ? 'PASSED' : 'ISSUES FOUND'}
            </strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <span className="badge badge-red">{summary.high_severity} High Severity</span>
          <span className="badge badge-yellow">{summary.medium_severity} Warnings</span>
          <span className="badge badge-green">{summary.passed_checks} Passed Checks</span>
        </div>
      </div>

      {/* Grid: Check Matrix Table vs Error Details */}
      <div className="grid-2">
        {/* Table: Checks vs Status */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} color="#3b82f6" />
            <span>Check Matrix</span>
          </h3>

          <table className="custom-table">
            <thead>
              <tr>
                <th>Check Component</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {check_matrix.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: '#f8fafc' }}>{item.name}</td>
                  <td>
                    {item.status === 'correct' && (
                      <span className="badge badge-green">
                        <CheckCircle2 size={13} /> Correct
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span className="badge badge-red">
                        <XCircle size={13} /> Error
                      </span>
                    )}
                    {item.status === 'warning' && (
                      <span className="badge badge-yellow">
                        <AlertTriangle size={13} /> Warning
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.825rem', color: '#cbd5e1' }}>{item.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detailed Issues List & Selector */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} color="#ef4444" />
            <span>Detected Issues ({issues.length})</span>
          </h3>

          {issues.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {issues.map((iss, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedIssue(iss)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: currentSelected?.id === iss.id ? 'rgba(59, 130, 246, 0.15)' : '#0d1322',
                    border: currentSelected?.id === iss.id ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.875rem' }}>{iss.title}</span>
                    <span className={`badge badge-${iss.severity}`}>{iss.severity}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    {iss.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#10b981' }}>
              <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem' }} />
              <p>No configuration errors detected!</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Error Details Breakdown (Section 8 of prompt) */}
      {currentSelected && (
        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <XCircle size={22} />
              <span>Error Details: {currentSelected.title}</span>
            </h3>
            <span className={`badge badge-${currentSelected.severity}`}>
              Severity: {currentSelected.severity.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Reason & Explanation */}
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#fca5a5', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Explanation & Reason
              </h4>
              <p style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: 500 }}>
                "{currentSelected.explanation}"
              </p>
              <p style={{ fontSize: '0.825rem', color: '#cbd5e1', marginTop: '0.5rem' }}>
                <strong>Reason:</strong> {currentSelected.reason}
              </p>
            </div>

            {/* Config Comparison: Detected vs Expected */}
            <div className="grid-2">
              <div style={{ backgroundColor: '#020617', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <span style={{ fontSize: '0.775rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>
                  Detected Configuration (Incorrect)
                </span>
                <pre style={{ color: '#fca5a5', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                  {currentSelected.detected_config}
                </pre>
              </div>

              <div style={{ backgroundColor: '#020617', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <span style={{ fontSize: '0.775rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>
                  Expected Configuration (Correct)
                </span>
                <pre style={{ color: '#6ee7b7', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                  {currentSelected.expected_config}
                </pre>
              </div>
            </div>

            {/* Recommended Fix Box */}
            <div style={{ backgroundColor: '#090d16', padding: '1rem', borderRadius: '8px', border: '1px solid #1f293d' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
                  Recommended Cisco CLI Fix
                </span>
                <button
                  className="btn btn-primary"
                  onClick={() => onNavigate('fixes')}
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                >
                  <Wrench size={14} />
                  <span>Go to Auto-Fix Tool</span>
                </button>
              </div>

              <pre style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', backgroundColor: '#020617', padding: '0.85rem', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
                {currentSelected.suggested_fix}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

