# Cisco Packet Tracer Topology & Setup Guide (Cisco VIP-2026)

This document provides exact instructions to recreate the **Network Configuration Checker** topology inside **Cisco Packet Tracer**.

---

## 📐 Network Topology Overview

```
                          [ Cisco 2960 Switch ]
                               (Switch1)
                                   |
                   +---------------+---------------+
                   | GigabitEthernet0/1 (Trunk Link) |
                   +---------------+---------------+
                                   |
                         [ Core Router / Switch2 ]
                                   |
     +-----------------------------+-----------------------------+
     |                             |                             |
[ VLAN 10 PC ]               [ VLAN 20 PC ]               [ VLAN 30 PC ]
(Students)                   (Faculty)                    (Administration)
IP: 192.168.10.10/24         IP: 192.168.20.10/24         IP: 192.168.30.10/24
GW: 192.168.10.1             GW: 192.168.20.1             GW: 192.168.30.1
```

---

## 📊 IP Addressing & VLAN Table

| Device / Host | Interface | VLAN ID | Subnet / Mask | IP Address | Default Gateway |
|---|---|---|---|---|---|
| **PC-Students** | FastEthernet0 | VLAN 10 (Students) | `192.168.10.0/24` | `192.168.10.10` | `192.168.10.1` |
| **PC-Faculty** | FastEthernet0 | VLAN 20 (Faculty) | `192.168.20.0/24` | `192.168.20.10` | `192.168.20.1` |
| **PC-Admin** | FastEthernet0 | VLAN 30 (Admin) | `192.168.30.0/24` | `192.168.30.10` | `192.168.30.1` |
| **Switch1** | GigabitEthernet0/1 | Trunk Link | N/A | Trunk | N/A |
| **Gateway Router** | GigabitEthernet0/0.20 | VLAN 20 Subintf | `192.168.20.0/24` | `192.168.20.1` | N/A |

---

## 🛠️ Step-by-Step Packet Tracer Instructions

### Step 1: Add Devices in Packet Tracer
1. Drag **1 x 2960 Switch** (Name: `Switch1`).
2. Drag **3 x End Devices (PC-PT)** (Names: `PC-Students`, `PC-Faculty`, `PC-Admin`).
3. Drag **1 x 4331 Router** or core switch (Name: `Router1`).

### Step 2: Connect Cables
- Connect `PC-Students` (Fa0) to `Switch1` (FastEthernet0/10).
- Connect `PC-Faculty` (Fa0) to `Switch1` (FastEthernet0/20).
- Connect `PC-Admin` (Fa0) to `Switch1` (FastEthernet0/30).
- Connect `Switch1` (GigabitEthernet0/1) to `Router1` (GigabitEthernet0/0/0).

---

## 📄 Switch Configurations

### Option A: Intentionally Incorrect Switch Config (Demo Error)
Paste this into `Switch1` CLI to simulate the bug:

```cisco
enable
configure terminal
hostname Switch1

vlan 10
 name Students
vlan 20
 name Faculty
vlan 30
 name Administration
exit

interface FastEthernet0/10
 switchport mode access
 switchport access vlan 10
exit

interface FastEthernet0/20
 switchport mode access
 switchport access vlan 20
exit

interface FastEthernet0/30
 switchport mode access
 switchport access vlan 30
exit

interface GigabitEthernet0/1
 switchport mode trunk
 switchport trunk allowed vlan 10,30
exit
end
write memory
```

> **Testing in Packet Tracer:** Ping from `PC-Faculty` (`192.168.20.10`) to Gateway (`192.168.20.1`) will **FAIL** because VLAN 20 is missing on `Gi0/1` trunk allowed list.

---

### Option B: Corrected Switch Config (Auto-Fix Applied)
Paste this into `Switch1` CLI to apply the fix:

```cisco
enable
configure terminal
interface GigabitEthernet0/1
 switchport trunk allowed vlan 10,20,30
exit
end
write memory
```

> **Testing in Packet Tracer:** Ping from `PC-Faculty` (`192.168.20.10`) to Gateway (`192.168.20.1`) will now **SUCCEED** (`!!!!!`).
