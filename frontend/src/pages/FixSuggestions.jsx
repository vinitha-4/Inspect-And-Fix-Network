import React, { useState } from 'react';
import { 
  Wrench, 
  Copy, 
  Check, 
  Play, 
  EyeOff, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2,
  Terminal
} from 'lucide-react';

export default function FixSuggestions({ 
  analysisResult, 
  onApplyFix, 
  onShowToast, 
  onNavigate 
}) {
  const [ignoredIssues, setIgnoredIssues] = useState(new Set());
  const [activeExplanation, setActiveExplanation] = useState(null);
  const [appliedFixes, setAppliedFixes] = useState(new Set());

  if (!analysisResult || !analysisResult.issues || analysisResult.issues.length === 0) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#10b981' }}>
        <CheckCircle2 size={56} style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.4rem' }}>No Fixes Required</h2>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
          Your network configuration passed all Python engine validation rules cleanly!
        </p>
        <button className="btn btn-primary" onClick={() => onNavigate('verification')} style={{ marginTop: '1.5rem' }}>
          Go to Verification Simulation
        </button>
      </div>
    );
  }

  const activeIssues = analysisResult.issues.filter(i => !ignoredIssues.has(i.id));

  const handleCopyCommand = (fixCommand) => {
    navigator.clipboard.writeText(fixCommand);
    onShowToast('Fix command copied successfully.', 'success');
  };

  const handleIgnore = (issueId) => {
    setIgnoredIssues(prev => new Set(prev).add(issueId));
    onShowToast('Issue ignored for this session.', 'info');
  };

  const handleApplyFix = async (issue) => {
    try {
      await onApplyFix(issue.suggested_fix, issue.interface, issue.vlan_id);
      setAppliedFixes(prev => new Set(prev).add(issue.id));
      onShowToast(`Applied CLI fix for ${issue.title}`, 'success');
    } catch (err) {
      onShowToast(err.message || 'Failed to apply fix', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Wrench size={24} color="#3b82f6" />
            <span>Cisco CLI Auto-Fix Engine</span>
          </h2>
          <p className="subtitle">
            Review Python-generated Cisco CLI remediations, copy CLI commands directly, or auto-apply fixes in memory.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <span className="badge badge-blue">{activeIssues.length} Suggested Fixes</span>
          {ignoredIssues.size > 0 && (
            <span className="badge badge-yellow">{ignoredIssues.size} Ignored</span>
          )}
        </div>
      </div>

      {/* Fix Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {activeIssues.map((issue, idx) => {
          const isApplied = appliedFixes.has(issue.id);

          return (
            <div key={idx} className="card" style={{
              borderLeft: `4px solid ${isApplied ? '#10b981' : issue.severity === 'high' ? '#ef4444' : '#f59e0b'}`,
              backgroundColor: isApplied ? 'rgba(16, 185, 129, 0.03)' : 'var(--bg-card)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem' }}>{issue.title}</h3>
                  <span className={`badge badge-${isApplied ? 'green' : issue.severity}`}>
                    {isApplied ? 'FIX APPLIED ✓' : `${issue.severity.toUpperCase()} SEVERITY`}
                  </span>
                </div>
                {issue.interface && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#38bdf8', backgroundColor: '#090d16', padding: '0.25rem 0.65rem', borderRadius: '4px' }}>
                    Interface: {issue.interface}
                  </span>
                )}
              </div>

              {/* Message */}
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {issue.message}
              </p>

              {/* Suggested Fix Code Box */}
              <div style={{ backgroundColor: '#020617', borderRadius: '8px', border: '1px solid #1e293b', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.775rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Suggested Cisco CLI Fix
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cisco IOS CLI Syntax</span>
                </div>

                <pre style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)', fontSize: '0.925rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {issue.suggested_fix}
                </pre>
              </div>

              {/* Four Required Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleCopyCommand(issue.suggested_fix)}
                >
                  <Copy size={16} />
                  <span>Copy Command</span>
                </button>

                <button
                  className="btn btn-success"
                  onClick={() => handleApplyFix(issue)}
                  disabled={isApplied}
                >
                  <CheckCircle2 size={16} />
                  <span>{isApplied ? 'Fix Applied' : 'Apply Fix'}</span>
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => setActiveExplanation(activeExplanation === issue.id ? null : issue.id)}
                  style={{ color: '#38bdf8' }}
                >
                  <HelpCircle size={16} />
                  <span>View Explanation</span>
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => handleIgnore(issue.id)}
                  style={{ color: '#94a3b8' }}
                >
                  <EyeOff size={16} />
                  <span>Ignore</span>
                </button>
              </div>

              {/* Explanation Collapsible Drawer */}
              {activeExplanation === issue.id && (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: '#090d16',
                  border: '1px solid #1f293d',
                  animation: 'slideUp 0.2s ease-out'
                }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Detailed Technical Explanation
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6 }}>
                    {issue.explanation}
                  </p>
                  {issue.reason && (
                    <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                      <strong>Root Cause:</strong> {issue.reason}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Verification Redirect Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button className="btn btn-primary" onClick={() => onNavigate('verification')}>
          <span>Proceed to Verification Page</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

