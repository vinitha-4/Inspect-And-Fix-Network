# Network Configuration Checker with Auto-Fix Suggestions

**Project Name:** Network Configuration Checker  
**Subtitle:** Python-Based Network Configuration Checker with Auto-Fix Suggestions  
**Project Context:** Cisco VIP-2026  

---

## 🌟 Overview

**Network Configuration Checker** is a modern, responsive, full-stack web application designed for campus network administrators and student demonstrations. The application accepts Cisco IOS switch/router configurations (via text paste or file upload), parses them using a modular Python analysis engine, identifies operational errors (such as missing trunk allowed VLANs, uncreated access VLANs, IP subnet mismatches, and DHCP pool errors), explains the issues in plain language, and generates precise Cisco CLI commands as auto-fix suggestions.

---

## ✨ Features

- 📊 **Interactive Dashboard:** Live metrics tracking Total Configurations Checked, Errors Detected, Warnings, and Fixed Issues.
- 📝 **Dual Input Configuration Checker:** Paste Cisco configuration text into a code editor or upload `.txt`, `.cfg`, or `.conf` files.
- ⚡ **One-Click Demo Mode:** Dedicated **"Demo Configuration"** button pre-loading the Cisco VIP-2026 trunk error scenario.
- 🔍 **Modular Python Analysis Engine:** Checks VLAN definitions, trunk allowed VLAN lists, access VLAN assignments, SVI IP configurations, default gateways, and DHCP pool settings.
- 💡 **Auto-Fix CLI Suggestions:** Displays formatted Cisco CLI remediation blocks with one-click **"Copy Command"** (clipboard notification) and **"Apply Fix"** (in-memory remediation & re-analysis).
- 🚦 **Visual Status Indicators:** Color-coded badges and check matrix with Green (✓ Correct), Yellow (⚠ Warning), and Red (✗ Error).
- 🧪 **Verification & Connectivity Simulation:** Before vs After state comparison, simulated `show interfaces trunk` terminal output, and ICMP Ping connectivity simulation (`PING 192.168.20.1`).
- ℹ️ **About Project & Roadmap:** Overview of problem statement, solution architecture, tech stack, and future enhancements (OSPF, ACL, NAT, STP, Netmiko).

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Custom Cybersecurity Dark Modern Theme + Tailwind CSS Utilities
- **Icons:** Lucide React (`lucide-react`)
- **HTTP Client:** Native Fetch API

### Backend
- **Language:** Python 3.10+
- **REST Framework:** FastAPI
- **ASGI Server:** Uvicorn
- **Data Validation:** Pydantic
- **Parser Engine:** Custom Cisco IOS AST Block Parser & BaseChecker Rule Engine

---

## 📁 Project Structure

```
cisco vip/
├── backend/
│   ├── app.py                      # FastAPI REST API endpoints
│   ├── requirements.txt            # Python dependencies
│   ├── analyzer/
│   │   ├── __init__.py
│   │   ├── config_parser.py        # Cisco IOS syntax block parser
│   │   ├── base_checker.py         # Base rule engine class
│   │   ├── vlan_checker.py         # VLAN definition & access checks
│   │   ├── trunk_checker.py        # Trunk allowed VLAN check (Primary Demo)
│   │   ├── ip_checker.py           # IP address & gateway checks
│   │   ├── dhcp_checker.py         # DHCP pool & network checks
│   │   ├── interface_checker.py    # Administrative state & dot1q checks
│   │   └── engine.py               # Central analysis orchestrator
│   └── tests/
│       └── test_analyzer.py        # PyTest/Unittest suite
├── frontend/
│   ├── package.json                # Node dependencies & scripts
│   ├── index.html                  # Main HTML entrypoint
│   ├── src/
│   │   ├── main.jsx                # React mount entrypoint
│   │   ├── App.jsx                 # App layout & state orchestrator
│   │   ├── index.css               # Modern dark theme styles
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Header with VIP-2026 title & Demo button
│   │   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   │   ├── StatCard.jsx        # Metric summary card
│   │   │   └── Toast.jsx           # Notification alert popup
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main metrics dashboard
│   │   │   ├── ConfigChecker.jsx   # Input editor & file uploader
│   │   │   ├── DetectedIssues.jsx  # Check matrix & error details
│   │   │   ├── FixSuggestions.jsx  # CLI auto-fix action cards
│   │   │   ├── Verification.jsx   # Terminal simulation & ping test
│   │   │   └── About.jsx          # Project overview & sitemap
│   │   └── services/
│   │       └── api.js              # REST API client
├── sample_configs/
│   ├── demo_trunk_error.txt        # VIP-2026 primary demo scenario
│   ├── access_vlan_error.txt       # Uncreated access VLAN scenario
│   ├── ip_dhcp_error.txt           # IP broadcast & gateway error scenario
│   └── correct_config.txt          # Fully valid configuration scenario
└── README.md                       # Documentation
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Python:** 3.10 or higher
- **Node.js:** v18 or higher (npm included)

### 1. Backend Setup

1. Open a terminal and navigate to the project root:
   ```bash
   cd "c:\Users\kulka\OneDrive\ドキュメント\Desktop\cisco vip"
   ```

2. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Run the backend unit tests:
   ```bash
   python -m unittest backend/tests/test_analyzer.py
   ```

4. Start the Python FastAPI server on port 8005:
   ```bash
   python -m uvicorn backend.app:app --host 127.0.0.1 --port 8005 --reload
   ```

---

### 2. Frontend Setup

1. Open a second terminal and navigate to the `frontend` folder:
   ```bash
   cd "c:\Users\kulka\OneDrive\ドキュメント\Desktop\cisco vip\frontend"
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Build or start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://127.0.0.1:5173
   ```

---

## 🎥 Demonstration Scenario Guide (Cisco VIP-2026)

### Demo Goal
Demonstrate how the application detects that **VLAN 20 (Faculty)** is defined globally on the switch but intentionally omitted from the trunk allowed list (`switchport trunk allowed vlan 10,30`).

### Step-by-Step Demo Instructions

1. **Launch App:** Open `http://127.0.0.1:5173` in your browser.
2. **Trigger Demo:** Click the **"Demo Configuration"** button on the Navbar or Dashboard.
3. **Analyze Configuration:** On the **Configuration Checker** page, click **"Analyze Configuration"**.
4. **View Detected Issue:**
   - Go to **Detected Issues** page.
   - Observe the Red status badge: `ERROR: VLAN 20 is not allowed on trunk.`
   - View Explanation: *"VLAN 20 is configured on the switch but is not allowed on the trunk interface. Therefore, VLAN 20 traffic cannot pass through the trunk."*
5. **Auto-Fix Remediations:**
   - Go to **Fix Suggestions** page.
   - Click **"Copy Command"** to copy `switchport trunk allowed vlan 10,20,30` to clipboard. Notice toast message: *"Fix command copied successfully."*
   - Click **"Apply Fix"** to apply the fix in memory.
6. **Verify Results:**
   - Go to **Verification** page.
   - Observe **After Fix** allowed VLANs updated to `10,20,30` (Status: `✓ Configuration Corrected`).
   - Inspect simulated `show interfaces trunk` terminal output (`Gi0/1 trunk active 10,20,30`).
   - Run the **Ping Connectivity Verification Simulation** to confirm `✓ Ping Successful` (`PING 192.168.20.1` replies).

---

## 📡 REST API Documentation

### 1. `POST /api/analyze`
Analyzes raw Cisco IOS configuration text.

**Request Payload:**
```json
{
  "configuration": "hostname Switch1\n\nvlan 10\n name Students\n\nvlan 20\n name Faculty\n\nvlan 30\n name Administration\n\ninterface GigabitEthernet0/1\n switchport mode trunk\n switchport trunk allowed vlan 10,30"
}
```

**Response JSON:**
```json
{
  "hostname": "Switch1",
  "status": "error",
  "summary": {
    "total_issues": 1,
    "high_severity": 1,
    "medium_severity": 0,
    "low_severity": 0,
    "passed_checks": 4
  },
  "check_matrix": [
    { "name": "VLAN 10 (Students)", "status": "correct", "details": "✓ Configured Correctly" },
    { "name": "VLAN 20 (Faculty)", "status": "error", "details": "VLAN 20 not allowed on trunk" },
    { "name": "VLAN 30 (Administration)", "status": "correct", "details": "✓ Configured Correctly" },
    { "name": "Trunk Configuration", "status": "error", "details": "ERROR: VLAN 20 is not allowed on trunk." }
  ],
  "issues": [
    {
      "id": "TRUNK_VLAN_MISSING_GigabitEthernet0/1_20",
      "type": "TRUNK_VLAN_MISSING",
      "severity": "high",
      "category": "Trunk",
      "message": "ERROR: VLAN 20 is not allowed on trunk.",
      "interface": "GigabitEthernet0/1",
      "vlan_id": 20,
      "detected_config": "switchport trunk allowed vlan 10,30",
      "expected_config": "switchport trunk allowed vlan 10,20,30",
      "explanation": "VLAN 20 is configured on the switch but is not allowed on the trunk interface (GigabitEthernet0/1). Therefore, VLAN 20 traffic cannot pass through the trunk.",
      "suggested_fix": "interface GigabitEthernet0/1\nswitchport trunk allowed vlan 10,20,30"
    }
  ]
}
```

### 2. `POST /api/apply-fix`
Applies a CLI fix to the configuration text and returns re-analysis.

### 3. `POST /api/verify`
Runs simulated CLI command execution (`show interfaces trunk`) and ICMP ping test.

---

## 🔮 Future Enhancements

- **OSPF & BGP Routing Verification:** Validate area IDs, passive interfaces, and neighbor states.
- **ACL Auditing:** Detect shadowed rules and implicit deny conflicts.
- **Netmiko Integration:** Connect directly to physical Cisco Catalyst switches over SSH to apply fixes automatically.
- **Auto Configuration Backup:** Scheduled snapshots over SFTP/TFTP.

