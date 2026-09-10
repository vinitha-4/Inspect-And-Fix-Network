import React from 'react';
import { 
  Info, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  Rocket, 
  Layers, 
  Code,
  Server,
  Network
} from 'lucide-react';

export default function About() {
  const futureEnhancements = [
    { title: "OSPF Routing Validation", desc: "Detect area mismatches, passive interfaces, and MTU issues." },
    { title: "Access Control List (ACL) Auditing", desc: "Identify shadowed rules, incorrect port bindings, and implicit deny blocks." },
    { title: "Network Address Translation (NAT)", desc: "Verify inside/outside pool boundaries and static mapping syntax." },
    { title: "Spanning Tree Protocol (STP)", desc: "Check BPDU Guard, Root Guard, and PortFast configuration consistency." },
    { title: "Port Security Hardening", desc: "Audit sticky MAC addresses, violation actions, and max host limits." },
    { title: "Real Cisco Device Integration", desc: "Direct SSH/NETCONF orchestration with live Cisco Catalyst switches." },
    { title: "Netmiko & Nornir Automation", desc: "Automate bulk deployment of CLI fixes to multiple network nodes." },
    { title: "Automated Configuration Backups", desc: "Periodic TFTP/SFTP configuration snapshots and version diffing." }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Header */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0d1322 0%, #1e293b 100%)',
        borderLeft: '4px solid #3b82f6',
        padding: '2.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-blue">Cisco VIP-2026 Project</span>
          <span className="badge badge-green">College Demo Ready</span>
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#f8fafc' }}>
          Python-Based Network Configuration Checker with Auto-Fix Suggestions
        </h1>

        <p className="subtitle" style={{ fontSize: '1rem', color: '#94a3b8', maxWidth: '900px', lineHeight: 1.6 }}>
          An intelligent web application that automates the audit of Cisco IOS switch configurations. The platform parses configuration blocks in Python, detects operational flaws (such as missing trunk VLANs, misconfigured SVIs, and DHCP errors), explains the issues in plain language, and generates precise Cisco CLI auto-fix commands.
        </p>
      </div>

      {/* Problem Statement & Proposed Solution */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Info size={20} />
            <span>Problem Statement</span>
          </h3>
          <p style={{ color: '#cbd5e1', fontSize: '0.925rem', lineHeight: 1.6 }}>
            In enterprise campus networks, manual CLI configuration errors are the primary cause of network downtime, security vulnerabilities, and VLAN isolation failures. A common and critical human error occurs when a network administrator defines a new VLAN globally (e.g. <code>vlan 20 name Faculty</code>) but forgets to append it to the trunk interface allowed list (<code>switchport trunk allowed vlan 10,30</code>). As a result, VLAN 20 traffic is silently dropped across switches without obvious syntax errors.
          </p>
        </div>

        <div className="card">
          <h3 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <CheckCircle2 size={20} />
            <span>Proposed Solution</span>
          </h3>
          <p style={{ color: '#cbd5e1', fontSize: '0.925rem', lineHeight: 1.6 }}>
            The Network Configuration Checker solves this by providing an automated Python rule engine that parses Cisco IOS configuration files in real-time. It cross-references defined VLAN databases against interface trunk allowed lists, pinpoints exact line numbers, provides intuitive plain-English explanations, and generates exact copy-pasteable CLI commands (e.g. <code>switchport trunk allowed vlan 10,20,30</code>) or applies fixes instantly.
          </p>
        </div>
      </div>

      {/* Tech Stack Overview */}
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Layers size={20} color="#3b82f6" />
          <span>Technologies Used</span>
        </h3>

        <div className="grid-4">
          <div style={{ padding: '1rem', backgroundColor: '#0d1322', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 600, marginBottom: '0.35rem' }}>
              <Code size={18} /> Frontend
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              React 19, Vite, Tailwind CSS, Lucide Icons, Modern Dark Cybersecurity Theme.
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#0d1322', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80', fontWeight: 600, marginBottom: '0.35rem' }}>
              <Server size={18} /> Backend REST API
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Python 3.10, FastAPI, Uvicorn ASGI Server, CORS Middleware, REST Endpoints.
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#0d1322', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#facc15', fontWeight: 600, marginBottom: '0.35rem' }}>
              <Cpu size={18} /> Rule Engine
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Modular Python AST-style Cisco IOS Parser, Regex Block Segmenter, BaseChecker architecture.
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#0d1322', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc', fontWeight: 600, marginBottom: '0.35rem' }}>
              <Network size={18} /> Verification
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Simulated Cisco CLI <code>show interfaces trunk</code> terminal and ICMP Ping simulator.
            </p>
          </div>
        </div>
      </div>

      {/* Future Enhancements Roadmap */}
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Rocket size={20} color="#06b6d4" />
          <span>Future Enhancements Roadmap</span>
        </h3>

        <div className="grid-2">
          {futureEnhancements.map((item, idx) => (
            <div key={idx} style={{
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#0d1322',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <div style={{
                padding: '0.4rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                color: '#06b6d4',
                marginTop: '0.1rem'
              }}>
                <CheckCircle2 size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 600 }}>{item.title}</h4>
                <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '0.2rem' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

