import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Activity, 
  RefreshCw, 
  ShieldCheck, 
  Info,
  Server
} from 'lucide-react';
import { verifyConfiguration } from '../services/api';

export default function Verification({ configText, analysisResult, onShowToast }) {
  const [verificationData, setVerificationData] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const runVerificationTest = async () => {
    setIsVerifying(true);
    try {
      const data = await verifyConfiguration(configText);
      setVerificationData(data);
      if (data.is_fixed) {
        onShowToast('Verification passed: Configuration is valid and ping successful!', 'success');
      } else {
        onShowToast('Verification failed: Trunk issues remain in configuration.', 'error');
      }
    } catch (err) {
      onShowToast(err.message || 'Verification test failed', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    runVerificationTest();
  }, [configText]);

  const isFixed = verificationData?.is_fixed ?? false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={24} color="#10b981" />
            <span>Verification & Connectivity Test</span>
          </h2>
          <p className="subtitle">
            Simulate Cisco CLI trunk interface verification and end-to-end ICMP ping connectivity testing.
          </p>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={runVerificationTest} 
          disabled={isVerifying}
        >
          <RefreshCw size={16} className={isVerifying ? 'animate-spin' : ''} />
          <span>Re-Run Verification</span>
        </button>
      </div>

      {/* Mandatory Notice as requested by Prompt */}
      <div style={{
        padding: '0.85rem 1.25rem',
        borderRadius: '8px',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.875rem',
        color: '#93c5fd'
      }}>
        <Info size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
        <span>
          <strong>Simulated Verification Mode:</strong> CLI outputs and ping tests are simulated using Python analyzer state validation for college project/demo purposes.
        </span>
      </div>

      {/* Before Fix vs After Fix Cards Comparison (Section 9 of prompt) */}
      <div className="grid-2">
        {/* Before Fix Card */}
        <div className="card" style={{ borderTop: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem' }}>Before Fix (Initial State)</h3>
            <span className="badge badge-red">Trunk Misconfigured</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem', backgroundColor: '#0d1322', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Allowed Trunk VLANs:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#fca5a5' }}>10,30</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem', backgroundColor: '#0d1322', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Status:</span>
              <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}>
                ✗ VLAN 20 unavailable on trunk
              </span>
            </div>
          </div>
        </div>

        {/* After Fix Card */}
        <div className="card" style={{ borderTop: `4px solid ${isFixed ? '#10b981' : '#f59e0b'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem' }}>After Fix (Current State)</h3>
            <span className={`badge badge-${isFixed ? 'green' : 'yellow'}`}>
              {isFixed ? 'Remediated ✓' : 'Awaiting Fix'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem', backgroundColor: '#0d1322', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Allowed Trunk VLANs:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: isFixed ? '#6ee7b7' : '#fcd34d' }}>
                {isFixed ? '10,20,30' : '10,30'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem', backgroundColor: '#0d1322', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Status:</span>
              <span style={{ color: isFixed ? '#10b981' : '#f59e0b', fontWeight: 600, fontSize: '0.85rem' }}>
                {isFixed ? '✓ Configuration Corrected' : '✗ Issues Still Present'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated CLI Verification Result (`show interfaces trunk`) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={20} color="#3b82f6" />
            <span>Simulated CLI Verification Output (<code>show interfaces trunk</code>)</span>
          </h3>
          <span className={`badge badge-${isFixed ? 'green' : 'red'}`}>
            {isFixed ? '✓ VLAN 20 Allowed' : '✗ VLAN 20 Omitted'}
          </span>
        </div>

        <div className="terminal-box">
          Switch1# {verificationData?.cli_simulation?.command || 'show interfaces trunk'}
          {'\n'}
          {verificationData?.cli_simulation?.output || 'Executing verification...'}
        </div>

        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          backgroundColor: isFixed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: isFixed ? '#10b981' : '#ef4444',
          fontWeight: 600,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {isFixed ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span>
            {isFixed
              ? '✓ VLAN 20 is now allowed on the trunk interface.'
              : '✗ VLAN 20 is configured globally but missing from trunk allowed VLAN list.'}
          </span>
        </div>
      </div>

      {/* Ping Verification Section (Section 10 of prompt) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="#06b6d4" />
            <span>Ping Connectivity Verification Simulation</span>
          </h3>
          <span className={`badge badge-${isFixed ? 'green' : 'red'}`}>
            {verificationData?.ping_simulation?.status || 'Ping Pending'}
          </span>
        </div>

        {/* Source & Destination Details */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Source Node:</span>
            <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.925rem' }}>
              {verificationData?.ping_simulation?.source || 'VLAN 20 PC (192.168.20.10)'}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Destination Target:</span>
            <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.925rem' }}>
              {verificationData?.ping_simulation?.destination || 'VLAN 20 Gateway (192.168.20.1)'}
            </div>
          </div>
        </div>

        {/* Terminal Ping Simulation Block */}
        <div className="terminal-box" style={{ color: isFixed ? '#4ade80' : '#fca5a5' }}>
          {verificationData?.ping_simulation?.output || 'Executing ping...'}
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
            Simulated end-to-end ICMP echo response across trunk link
          </span>
          <button className="btn btn-primary" onClick={runVerificationTest} disabled={isVerifying}>
            <Activity size={16} />
            <span>Run Ping Test</span>
          </button>
        </div>
      </div>
    </div>
  );
}

