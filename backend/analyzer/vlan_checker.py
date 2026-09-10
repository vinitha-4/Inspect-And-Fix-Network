"""
VLAN Configuration Checker.
Checks for missing VLAN definitions, invalid VLAN IDs, and duplicate VLAN names.
"""
from typing import Dict, List, Any
from .base_checker import BaseChecker

class VLANChecker(BaseChecker):
    def check(self) -> List[Dict[str, Any]]:
        issues = []
        configured_vlans = self.parsed_config.get("vlans", {})
        interfaces = self.parsed_config.get("interfaces", {})

        # 1. Check invalid VLAN IDs (e.g. VLAN 0 or > 4094)
        for vid, data in configured_vlans.items():
            if vid < 1 or vid > 4094:
                issues.append({
                    "id": f"INVALID_VLAN_ID_{vid}",
                    "type": "INVALID_VLAN_ID",
                    "title": f"Invalid VLAN ID {vid}",
                    "severity": "high",
                    "category": "VLAN",
                    "message": f"ERROR: VLAN ID {vid} is out of valid range (1-4094).",
                    "interface": None,
                    "vlan_id": vid,
                    "line_number": data.get("line"),
                    "detected_config": f"vlan {vid}",
                    "expected_config": f"vlan 1..4094",
                    "reason": f"VLAN ID {vid} is invalid on Cisco IOS devices.",
                    "explanation": f"Cisco IOS supports VLAN IDs in the range 1-4094. VLAN {vid} is invalid.",
                    "suggested_fix": f"no vlan {vid}"
                })

        # 2. Check for duplicate VLAN names
        seen_names = {}
        for vid, data in configured_vlans.items():
            name = data.get("name")
            if name and name.lower() not in ("default", ""):
                lower_name = name.lower()
                if lower_name in seen_names:
                    prev_vid = seen_names[lower_name]
                    issues.append({
                        "id": f"DUPLICATE_VLAN_NAME_{vid}",
                        "type": "DUPLICATE_VLAN_NAME",
                        "title": f"Duplicate VLAN Name '{name}'",
                        "severity": "medium",
                        "category": "VLAN",
                        "message": f"WARNING: VLAN {vid} shares duplicate name '{name}' with VLAN {prev_vid}.",
                        "interface": None,
                        "vlan_id": vid,
                        "line_number": data.get("line"),
                        "detected_config": f"vlan {vid}\n name {name}",
                        "expected_config": f"vlan {vid}\n name {name}_{vid}",
                        "reason": f"Duplicate VLAN names can lead to operational confusion during network maintenance.",
                        "explanation": f"Both VLAN {prev_vid} and VLAN {vid} use the name '{name}'. Assign unique descriptive names.",
                        "suggested_fix": f"vlan {vid}\n name {name}_{vid}"
                    })
                else:
                    seen_names[lower_name] = vid

        # 3. Check for access interfaces assigned to non-existent VLANs
        for intf_name, intf_data in interfaces.items():
            mode = intf_data.get("mode", "").lower()
            if mode == "access":
                access_vlan = intf_data.get("access_vlan", 1)
                # VLAN 1 is built-in default
                if access_vlan != 1 and access_vlan not in configured_vlans:
                    issues.append({
                        "id": f"MISSING_VLAN_DEF_{intf_name}_{access_vlan}",
                        "type": "MISSING_VLAN_DEFINITION",
                        "title": f"VLAN {access_vlan} not configured on switch",
                        "severity": "high",
                        "category": "VLAN",
                        "message": f"ERROR: Interface {intf_name} uses VLAN {access_vlan}, but VLAN {access_vlan} is not created.",
                        "interface": intf_name,
                        "vlan_id": access_vlan,
                        "line_number": intf_data.get("line"),
                        "detected_config": f"interface {intf_name}\n switchport access vlan {access_vlan}",
                        "expected_config": f"vlan {access_vlan}\n name VLAN_{access_vlan}",
                        "reason": f"VLAN {access_vlan} is assigned to interface {intf_name} but does not exist in the VLAN database.",
                        "explanation": f"Traffic on interface {intf_name} will be dropped or fail to forward because VLAN {access_vlan} has not been created globally.",
                        "suggested_fix": f"vlan {access_vlan}\n name VLAN_{access_vlan}"
                    })

        return issues

