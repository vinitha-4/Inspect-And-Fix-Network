import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

import Dashboard from './pages/Dashboard';
import ConfigChecker from './pages/ConfigChecker';
import DetectedIssues from './pages/DetectedIssues';
import FixSuggestions from './pages/FixSuggestions';
import Verification from './pages/Verification';
import About from './pages/About';

import { analyzeConfiguration, applyFix, getSampleConfigs } from './services/api';

const DEFAULT_DEMO_CONFIG = `hostname Switch1

vlan 10
 name Students

vlan 20
 name Faculty

vlan 30
 name Administration

interface GigabitEthernet0/1
 switchport mode trunk
 switchport trunk allowed vlan 10,30
`;

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [configText, setConfigText] = useState(DEFAULT_DEMO_CONFIG);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [sampleConfigs, setSampleConfigs] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const [stats, setStats] = useState({
    totalChecked: 1,
    errorsDetected: 1,
    warnings: 0,
    fixedIssues: 0
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Initial load: fetch sample configs and perform initial analysis
  useEffect(() => {
    async function init() {
      try {
        const samples = await getSampleConfigs();
        setSampleConfigs(samples);
      } catch (err) {
        console.warn("Backend sample configs endpoint fallback:", err);
      }

      // Initial analysis
      try {
        const result = await analyzeConfiguration(DEFAULT_DEMO_CONFIG);
        setAnalysisResult(result);
        setStats(prev => ({
          ...prev,
          errorsDetected: result.summary.high_severity,
          warnings: result.summary.medium_severity
        }));
      } catch (err) {
        console.warn("Initial backend analysis fallback:", err);
      }
    }
    init();
  }, []);

  const handleAnalyze = async (textToAnalyze = configText) => {
    if (!textToAnalyze || !textToAnalyze.trim()) {
      showToast('Please enter or paste a configuration text first.', 'error');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeConfiguration(textToAnalyze);
      setAnalysisResult(result);
      setStats(prev => ({
        ...prev,
        totalChecked: prev.totalChecked + 1,
        errorsDetected: result.summary.high_severity,
        warnings: result.summary.medium_severity
      }));

      if (result.status === 'error') {
        showToast(`Analysis complete: ${result.summary.total_issues} issue(s) detected!`, 'error');
      } else if (result.status === 'warning') {
        showToast(`Analysis complete: Warnings identified.`, 'info');
      } else {
        showToast('Analysis complete: Configuration is 100% valid!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Analysis failed. Is Python backend running?', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunDemo = async () => {
    setConfigText(DEFAULT_DEMO_CONFIG);
    await handleAnalyze(DEFAULT_DEMO_CONFIG);
    setActiveTab('issues');
    showToast('Loaded Cisco VIP-2026 Demo Configuration. Error detected: VLAN 20 missing on trunk.', 'info');
  };

  const handleApplyFix = async (suggestedFix, intf, vlanId) => {
    try {
      const res = await applyFix(configText, suggestedFix, intf, vlanId);
      setConfigText(res.updated_configuration);
      setAnalysisResult(res.analysis);
      setStats(prev => ({
        ...prev,
        fixedIssues: prev.fixedIssues + 1,
        errorsDetected: res.analysis.summary.high_severity,
        warnings: res.analysis.summary.medium_severity
      }));
      return res;
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="main-content">
        <Navbar onRunDemo={handleRunDemo} />

        <main className="page-body">
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              analysisResult={analysisResult}
              onNavigate={setActiveTab}
              onRunDemo={handleRunDemo}
            />
          )}

          {activeTab === 'checker' && (
            <ConfigChecker
              configText={configText}
              setConfigText={setConfigText}
              onAnalyze={() => handleAnalyze(configText)}
              onRunDemo={handleRunDemo}
              sampleConfigs={sampleConfigs}
              isAnalyzing={isAnalyzing}
            />
          )}

          {activeTab === 'issues' && (
            <DetectedIssues
              analysisResult={analysisResult}
              onNavigate={setActiveTab}
              onApplyFix={handleApplyFix}
            />
          )}

          {activeTab === 'fixes' && (
            <FixSuggestions
              analysisResult={analysisResult}
              onApplyFix={handleApplyFix}
              onShowToast={showToast}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'verification' && (
            <Verification
              configText={configText}
              analysisResult={analysisResult}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'about' && (
            <About />
          )}
        </main>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}

