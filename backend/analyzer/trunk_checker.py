"""
Trunk Interface Allowed VLAN Checker.
Identifies missing VLANs on trunk allowed VLAN lists.
"""
from typing import Dict, List, Any
from .base_checker import BaseChecker

class TrunkChecker(BaseChecker):
    def check(self) -> List[Dict[str, Any]]:
        issues = []
        configured_vlans = self.parsed_config.get("vlans", {})
        configured_vlan_ids = set(configured_vlans.keys())
        
        # Include default VLAN 1 if not explicitly present
        all_active_vlan_ids = configured_vlan_ids if configured_vlan_ids else {1}

        interfaces = self.parsed_config.get("interfaces", {})
        
        for intf_name, intf_data in interfaces.items():
            mode = intf_data.get("mode", "").lower()
            if mode != "trunk":
                continue

            allowed_vlans = intf_data.get("allowed_vlans", [])
            allowed_raw = intf_data.get("allowed_vlan_raw")
            line_num = intf_data.get("line")

            # If switchport trunk allowed vlan was explicitly defined
            if allowed_raw is not None and allowed_vlans:
                allowed_set = set(allowed_vlans)
                # Find defined VLANs that are missing from allowed trunk list
                missing_vlans = sorted(list(configured_vlan_ids - allowed_set))

                if missing_vlans:
                    for missing_vid in missing_vlans:
                        vlan_info = configured_vlans.get(missing_vid, {})
                        vlan_name = vlan_info.get("name", f"VLAN{missing_vid}")

                        # Complete new allowed list including missing VLANs
                        all_allowed = sorted(list(allowed_set.union(configured_vlan_ids)))
                        allowed_str = ",".join(str(v) for v in all_allowed)

                        suggested_fix = (
                            f"interface {intf_name}\n"
                            f"switchport trunk allowed vlan {allowed_str}"
                        )

                        issues.append({
                            "id": f"TRUNK_VLAN_MISSING_{intf_name}_{missing_vid}",
                            "type": "TRUNK_VLAN_MISSING",
                            "title": f"VLAN {missing_vid} not allowed on trunk",
                            "severity": "high",
                            "category": "Trunk",
                            "message": f"ERROR: VLAN {missing_vid} is not allowed on trunk.",
                            "interface": intf_name,
                            "vlan_id": missing_vid,
                            "vlan_name": vlan_name,
                            "line_number": line_num,
                            "detected_config": f"switchport trunk allowed vlan {allowed_raw}",
                            "expected_config": f"switchport trunk allowed vlan {allowed_str}",
                            "reason": f"VLAN {missing_vid} ({vlan_name}) exists on the switch, but it is missing from the trunk allowed VLAN list.",
                            "explanation": (
                                f"VLAN {missing_vid} is configured on the switch but is not allowed on the "
                                f"trunk interface ({intf_name}). Therefore, VLAN {missing_vid} traffic cannot pass through the trunk."
                            ),
                            "suggested_fix": suggested_fix
                        })
            else:
                # If trunk interface has no trunk allowed vlan command specified, Cisco defaults to allowing all VLANs (1-4094),
                # which is generally fine unless security policies require explicit allowed lists.
                pass

        return issues

