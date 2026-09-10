"""
FastAPI Backend REST API Server for Network Configuration Checker (Cisco VIP-2026).
"""
import os
import sys
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# Ensure backend directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from analyzer.engine import NetworkConfigAnalyzer

app = FastAPI(
    title="Network Configuration Checker API",
    description="Cisco VIP-2026 Network Configuration Analysis & Auto-Fix REST API",
    version="1.0.0"
)

# Enable CORS for local React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    configuration: str

class ApplyFixRequest(BaseModel):
    configuration: str
    suggested_fix: str
    interface: Optional[str] = None
    vlan_id: Optional[int] = None

class VerifyRequest(BaseModel):
    configuration: str
    issue_id: Optional[str] = None

DEMO_CONFIG = """hostname Switch1

vlan 10
 name Students

vlan 20
 name Faculty

vlan 30
 name Administration

interface GigabitEthernet0/1
 switchport mode trunk
 switchport trunk allowed vlan 10,30
"""

ACCESS_VLAN_ERROR_CONFIG = """hostname Switch2

vlan 10
 name Sales

vlan 30
 name Engineering

interface GigabitEthernet0/1
 switchport mode access
 switchport access vlan 20

interface GigabitEthernet0/2
 switchport mode trunk
 switchport trunk allowed vlan 10,30
"""

IP_DHCP_ERROR_CONFIG = """hostname Switch3

vlan 10
 name Management

interface Vlan10
 ip address 192.168.10.255 255.255.255.0

ip default-gateway 10.0.0.1

ip dhcp pool FACULTY_POOL
 network 192.168.20.0 255.255.255.0
 default-router 192.168.99.1
"""

CORRECT_CONFIG = """hostname Switch1

vlan 10
 name Students

vlan 20
 name Faculty

vlan 30
 name Administration

interface GigabitEthernet0/1
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30

interface GigabitEthernet0/2
 switchport mode access
 switchport access vlan 10
"""

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Network Configuration Checker API", "version": "1.0.0"}

@app.get("/api/sample-configs")
def get_sample_configs():
    return {
        "demo": {
            "name": "Cisco VIP-2026 Demo (VLAN 20 Trunk Omission)",
            "description": "VLAN 20 exists on switch but missing from trunk allowed VLAN list on Gi0/1",
            "content": DEMO_CONFIG
        },
        "access_vlan_error": {
            "name": "Missing Access VLAN Definition",
            "description": "Interface configured for VLAN 20 which is not created globally",
            "content": ACCESS_VLAN_ERROR_CONFIG
        },
        "ip_dhcp_error": {
            "name": "IP Broadcast & Gateway Mismatch",
            "description": "Broadcast IP assigned to SVI and mismatched default gateway / DHCP router",
            "content": IP_DHCP_ERROR_CONFIG
        },
        "correct": {
            "name": "Fully Valid Configuration",
            "description": "Clean configuration with no errors",
            "content": CORRECT_CONFIG
        }
    }

@app.post("/api/analyze")
def analyze_config(req: AnalyzeRequest):
    if not req.configuration or not req.configuration.strip():
        raise HTTPException(status_code=400, detail="Configuration text cannot be empty.")
    
    analyzer = NetworkConfigAnalyzer(req.configuration)
    result = analyzer.analyze()
    return result

@app.post("/api/apply-fix")
def apply_fix(req: ApplyFixRequest):
    """
    Applies suggested CLI fix to the configuration text cleanly.
    """
    lines = req.configuration.splitlines()
    fix_lines = [l.strip() for l in req.suggested_fix.strip().splitlines() if l.strip()]

    if not fix_lines:
        raise HTTPException(status_code=400, detail="Fix command empty.")

    new_lines = list(lines)

    # Case 1: Fix is interface command (e.g. interface GigabitEthernet0/1 \n switchport trunk allowed vlan 10,20,30)
    if fix_lines[0].startswith("interface "):
        target_intf = fix_lines[0].strip()
        cmd_to_set = fix_lines[1] if len(fix_lines) > 1 else ""

        # Find target interface block in configuration
        intf_start = -1
        intf_end = len(new_lines)
        for i, l in enumerate(new_lines):
            if l.strip() == target_intf:
                intf_start = i
                break
        
        if intf_start != -1:
            # Find end of interface block
            for j in range(intf_start + 1, len(new_lines)):
                if new_lines[j] and not (new_lines[j].startswith(" ") or new_lines[j].startswith("\t")):
                    intf_end = j
                    break

            # If cmd_to_set is switchport trunk allowed vlan...
            cmd_prefix = "switchport trunk allowed vlan" if "switchport trunk allowed vlan" in cmd_to_set else (cmd_to_set.split()[0] if cmd_to_set else "")

            # Check if command prefix exists inside block
            found_cmd = False
            for idx in range(intf_start + 1, intf_end):
                if cmd_prefix in new_lines[idx]:
                    new_lines[idx] = f" {cmd_to_set}"
                    found_cmd = True
                    break

            if not found_cmd:
                # Insert command into interface block
                new_lines.insert(intf_start + 1, f" {cmd_to_set}")
        else:
            # Interface block didn't exist, append fix block
            new_lines.append("")
            new_lines.append(target_intf)
            new_lines.append(f" {cmd_to_set}")

    # Case 2: Fix is global vlan creation (e.g. vlan 20 \n name VLAN_20)
    elif fix_lines[0].startswith("vlan "):
        vlan_block = [fix_lines[0]]
        if len(fix_lines) > 1:
            vlan_block.append(f" {fix_lines[1]}")
        insert_idx = 0
        for i, l in enumerate(new_lines):
            if l.strip().startswith("hostname ") or l.strip().startswith("vlan "):
                insert_idx = i + 1
        new_lines.insert(insert_idx, "\n".join(vlan_block))

    # Case 3: Simple global replacement or append
    else:
        new_lines.append("")
        for fl in fix_lines:
            new_lines.append(fl)

    updated_config = "\n".join(new_lines)
    
    # Re-analyze updated config
    analyzer = NetworkConfigAnalyzer(updated_config)
    analysis = analyzer.analyze()

    return {
        "status": "success",
        "updated_configuration": updated_config,
        "analysis": analysis
    }

@app.post("/api/verify")
def verify_config(req: VerifyRequest):
    """
    Simulates command execution and ping verification based on configuration state.
    """
    analyzer = NetworkConfigAnalyzer(req.configuration)
    analysis = analyzer.analyze()

    trunk_issues = [i for i in analysis["issues"] if i["category"] == "Trunk"]
    is_fixed = len(trunk_issues) == 0 and analysis["status"] != "error"

    trunk_intf = "Gi0/1"
    allowed_vlans_str = "10,20,30" if is_fixed else "10,30"

    show_trunk_output = f"""Port        Mode      Encapsulation  Status        Native vlan
{trunk_intf}       on        802.1q         trunking      1

Port        Vlans allowed on trunk
{trunk_intf}       {allowed_vlans_str}

Port        Vlans allowed and active in management domain
{trunk_intf}       {allowed_vlans_str}

Port        Vlans in spanning tree forwarding state and not pruned
{trunk_intf}       {allowed_vlans_str}
"""

    if is_fixed:
        verification_status = "passed"
        verification_message = "✓ VLAN 20 is now allowed on the trunk. Network connectivity verified."
        ping_output = """Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.20.1, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms

PING 192.168.20.1 (VLAN 20 Gateway):
Reply from 192.168.20.1: bytes=32 time=2ms TTL=64
Reply from 192.168.20.1: bytes=32 time=1ms TTL=64
Reply from 192.168.20.1: bytes=32 time=2ms TTL=64
Reply from 192.168.20.1: bytes=32 time=1ms TTL=64

Result: ✓ Ping Successful (0% loss)"""
    else:
        verification_status = "failed"
        verification_message = "✗ VLAN 20 is missing from trunk allowed list on GigabitEthernet0/1."
        ping_output = """Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.20.1, timeout is 2 seconds:
.....
Success rate is 0 percent (0/5)

PING 192.168.20.1 (VLAN 20 Gateway):
Request timed out.
Request timed out.
Request timed out.
Request timed out.

Result: ✗ Ping Failed (100% loss - VLAN 20 traffic blocked by trunk filter)"""

    return {
        "verification_status": verification_status,
        "is_fixed": is_fixed,
        "message": verification_message,
        "before_fix": {
            "allowed_vlans": "10,30",
            "status": "✗ VLAN 20 unavailable on trunk"
        },
        "after_fix": {
            "allowed_vlans": allowed_vlans_str,
            "status": "✓ Configuration Corrected" if is_fixed else "✗ Issues Remain"
        },
        "cli_simulation": {
            "command": "show interfaces trunk",
            "output": show_trunk_output.strip()
        },
        "ping_simulation": {
            "source": "VLAN 20 PC (192.168.20.10)",
            "destination": "VLAN 20 Gateway (192.168.20.1)",
            "command": "PING 192.168.20.1",
            "output": ping_output.strip(),
            "status": "✓ Ping Successful" if is_fixed else "✗ Ping Failed"
        },
        "analysis": analysis
    }

