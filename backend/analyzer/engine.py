"""
Central Network Configuration Analysis Engine.
Executes parser and all modular rule checkers.
"""
from typing import Dict, List, Any
from .config_parser import CiscoConfigParser
from .vlan_checker import VLANChecker
from .trunk_checker import TrunkChecker
from .ip_checker import IPChecker
from .dhcp_checker import DHCPChecker
from .interface_checker import InterfaceChecker

class NetworkConfigAnalyzer:
    def __init__(self, raw_config: str):
        self.raw_config = raw_config
        self.parser = CiscoConfigParser(raw_config)
        self.parsed = self.parser.parse()

    def analyze(self) -> Dict[str, Any]:
        """
        Runs all checks and produces structured output.
        """
        checkers = [
            VLANChecker(self.parsed, self.raw_config),
            TrunkChecker(self.parsed, self.raw_config),
            IPChecker(self.parsed, self.raw_config),
            DHCPChecker(self.parsed, self.raw_config),
            InterfaceChecker(self.parsed, self.raw_config),
        ]

        issues = []
        for checker in checkers:
            issues.extend(checker.check())

        # Count issue severities
        high_cnt = sum(1 for i in issues if i["severity"] == "high")
        med_cnt = sum(1 for i in issues if i["severity"] == "medium")
        low_cnt = sum(1 for i in issues if i["severity"] == "low")

        # Determine overall status
        if high_cnt > 0:
            status = "error"
        elif med_cnt > 0 or low_cnt > 0:
            status = "warning"
        else:
            status = "correct"

        # Build Check Matrix for visual indicators (VLAN 10, VLAN 20, VLAN 30, Trunk Config, etc.)
        check_matrix = []

        # 1. VLAN individual checks
        vlans_dict = self.parsed.get("vlans", {})
        if not vlans_dict:
            # If no VLANs defined
            check_matrix.append({
                "name": "VLAN Configuration",
                "status": "warning",
                "details": "No VLANs explicitly defined."
            })
        else:
            for vid in sorted(vlans_dict.keys()):
                vname = vlans_dict[vid].get("name", f"VLAN{vid}")
                # check if there is an issue specific to this vlan
                vlan_issues = [i for i in issues if i.get("vlan_id") == vid]
                if vlan_issues:
                    # If issue is trunk missing allowed, check if it's error or warning
                    worst_sev = vlan_issues[0]["severity"]
                    status_code = "error" if worst_sev == "high" else "warning"
                    check_matrix.append({
                        "name": f"VLAN {vid} ({vname})",
                        "status": status_code,
                        "details": vlan_issues[0]["title"]
                    })
                else:
                    check_matrix.append({
                        "name": f"VLAN {vid} ({vname})",
                        "status": "correct",
                        "details": "✓ Configured Correctly"
                    })

        # 2. Trunk Configuration Check
        trunk_issues = [i for i in issues if i["category"] == "Trunk"]
        if trunk_issues:
            check_matrix.append({
                "name": "Trunk Configuration",
                "status": "error",
                "details": trunk_issues[0]["message"]
            })
        else:
            check_matrix.append({
                "name": "Trunk Configuration",
                "status": "correct",
                "details": "✓ Trunk interfaces properly configured"
            })

        # 3. IP Configuration Check
        ip_issues = [i for i in issues if i["category"] == "IP"]
        if ip_issues:
            check_matrix.append({
                "name": "IP Configuration",
                "status": "error",
                "details": ip_issues[0]["title"]
            })
        else:
            check_matrix.append({
                "name": "IP Configuration",
                "status": "correct",
                "details": "✓ IP & default gateway configuration valid"
            })

        # 4. DHCP Configuration Check
        dhcp_issues = [i for i in issues if i["category"] == "DHCP"]
        if dhcp_issues:
            check_matrix.append({
                "name": "DHCP Configuration",
                "status": "warning" if all(i["severity"] != "high" for i in dhcp_issues) else "error",
                "details": dhcp_issues[0]["title"]
            })
        else:
            check_matrix.append({
                "name": "DHCP Configuration",
                "status": "correct",
                "details": "✓ DHCP pools properly configured"
            })

        # Prepare detected VLAN list for response
        detected_vlans_list = [
            {"id": vid, "name": data["name"], "status": "active"}
            for vid, data in sorted(vlans_dict.items())
        ]

        # Prepare trunk interfaces list for response
        trunk_intfs_list = []
        for intf_name, intf_data in self.parsed.get("interfaces", {}).items():
            if intf_data.get("mode") == "trunk":
                intf_missing = [i.get("vlan_id") for i in issues if i.get("interface") == intf_name and i["type"] == "TRUNK_VLAN_MISSING"]
                trunk_intfs_list.append({
                    "interface": intf_name,
                    "allowed_vlans": intf_data.get("allowed_vlans", []),
                    "allowed_raw": intf_data.get("allowed_vlan_raw"),
                    "missing_vlans": intf_missing,
                    "status": "error" if intf_missing else "correct"
                })

        return {
            "hostname": self.parsed.get("hostname", "Switch"),
            "status": status,
            "summary": {
                "total_issues": len(issues),
                "high_severity": high_cnt,
                "medium_severity": med_cnt,
                "low_severity": low_cnt,
                "passed_checks": sum(1 for c in check_matrix if c["status"] == "correct")
            },
            "check_matrix": check_matrix,
            "detected_vlans": detected_vlans_list,
            "trunk_interfaces": trunk_intfs_list,
            "issues": issues,
            "parsed_structure": {
                "vlans_count": len(vlans_dict),
                "interfaces_count": len(self.parsed.get("interfaces", {})),
                "dhcp_pools_count": len(self.parsed.get("dhcp_pools", {}))
            }
        }

