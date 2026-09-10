"""
Interface Configuration Checker.
Validates interface administrative states, dot1q sub-interfaces, and descriptions.
"""
from typing import Dict, List, Any
from .base_checker import BaseChecker

class InterfaceChecker(BaseChecker):
    def check(self) -> List[Dict[str, Any]]:
        issues = []
        interfaces = self.parsed_config.get("interfaces", {})

        for intf_name, intf_data in interfaces.items():
            is_shutdown = intf_data.get("shutdown", False)
            mode = intf_data.get("mode", "").lower()
            ip_addr = intf_data.get("ip_address")
            line_num = intf_data.get("line")

            # 1. Interface shutdown state warning if interface has IP or trunk configured
            if is_shutdown and (ip_addr or mode == "trunk"):
                issues.append({
                    "id": f"INTF_SHUTDOWN_{intf_name}",
                    "type": "INTERFACE_SHUTDOWN",
                    "title": f"Configured interface {intf_name} is shutdown",
                    "severity": "medium",
                    "category": "Interface",
                    "message": f"WARNING: Interface {intf_name} is configured but administratively shutdown.",
                    "interface": intf_name,
                    "line_number": line_num,
                    "detected_config": f"interface {intf_name}\n shutdown",
                    "expected_config": f"interface {intf_name}\n no shutdown",
                    "reason": f"Interface {intf_name} has active configurations (mode={mode}, IP={ip_addr}) but is disabled.",
                    "explanation": f"Traffic cannot pass until the interface is administratively enabled with 'no shutdown'.",
                    "suggested_fix": f"interface {intf_name}\n no shutdown"
                })

            # 2. Check sub-interface dot1q encapsulation missing
            if "." in intf_name and not intf_data.get("encapsulation"):
                sub_vlan = intf_name.split(".")[1]
                issues.append({
                    "id": f"SUBINTF_MISSING_DOT1Q_{intf_name}",
                    "type": "SUBINTF_MISSING_DOT1Q",
                    "title": f"Subinterface {intf_name} missing 802.1Q encapsulation",
                    "severity": "high",
                    "category": "Interface",
                    "message": f"ERROR: Subinterface {intf_name} requires 802.1Q encapsulation statement.",
                    "interface": intf_name,
                    "line_number": line_num,
                    "detected_config": f"interface {intf_name}",
                    "expected_config": f"interface {intf_name}\n encapsulation dot1q {sub_vlan}",
                    "reason": f"Cisco sub-interfaces on router-on-a-stick topology require dot1q encapsulation.",
                    "explanation": f"Specify 'encapsulation dot1q <vlan_id>' to map sub-interface to appropriate 802.1Q VLAN tag.",
                    "suggested_fix": f"interface {intf_name}\n encapsulation dot1q {sub_vlan}"
                })

        return issues

