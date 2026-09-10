"""
Cisco IOS Configuration Parser module.
Parses raw Cisco IOS text configurations into structured data models.
"""
import re
from typing import Dict, List, Any, Optional

class CiscoConfigParser:
    def __init__(self, raw_config: str):
        self.raw_config = raw_config
        self.lines = raw_config.splitlines()

    def parse(self) -> Dict[str, Any]:
        """
        Parses raw configuration text into structured dict format.
        """
        parsed = {
            "hostname": "Switch",
            "vlans": {},           # vlan_id (int) -> {"name": str, "line": int}
            "interfaces": {},       # intf_name (str) -> dict of settings
            "ip_globals": {
                "default_gateway": None,
                "ip_routing": False,
            },
            "dhcp_pools": {},       # pool_name (str) -> dict
            "dhcp_excluded": [],    # list of excluded ranges/IPs
            "raw_lines": self.lines
        }

        current_block_type = None
        current_block_key = None

        for idx, raw_line in enumerate(self.lines):
            line_num = idx + 1
            line = raw_line.strip()

            # Skip empty lines or comment lines starting with !
            if not line or line.startswith("!"):
                continue

            # Hostname
            if line.startswith("hostname "):
                parsed["hostname"] = line.split("hostname ")[1].strip()
                continue

            # Global IP routing / default gateway
            if line.startswith("ip default-gateway "):
                parsed["ip_globals"]["default_gateway"] = line.split("ip default-gateway ")[1].strip()
                continue

            if line == "ip routing":
                parsed["ip_globals"]["ip_routing"] = True
                continue

            # DHCP Excluded Address
            if line.startswith("ip dhcp excluded-address "):
                ex_str = line.replace("ip dhcp excluded-address ", "").strip()
                parsed["dhcp_excluded"].append({"spec": ex_str, "line": line_num})
                continue

            # Check top-level block starts
            # VLAN block: e.g. "vlan 10" or "vlan 10,20"
            vlan_match = re.match(r"^vlan\s+([0-9,\-\s]+)$", line, re.IGNORECASE)
            if vlan_match:
                vlan_spec = vlan_match.group(1).strip()
                vlan_ids = self._parse_vlan_spec(vlan_spec)
                current_block_type = "vlan"
                current_block_key = vlan_ids
                for vid in vlan_ids:
                    if vid not in parsed["vlans"]:
                        parsed["vlans"][vid] = {"id": vid, "name": f"VLAN{vid:04d}", "line": line_num}
                continue

            # Interface block: e.g. "interface GigabitEthernet0/1" or "interface FastEthernet0/1" or "interface Vlan10"
            intf_match = re.match(r"^interface\s+(.+)$", line, re.IGNORECASE)
            if intf_match:
                intf_name = intf_match.group(1).strip()
                current_block_type = "interface"
                current_block_key = intf_name
                parsed["interfaces"][intf_name] = {
                    "name": intf_name,
                    "line": line_num,
                    "mode": "access",  # default in Cisco IOS until changed
                    "access_vlan": 1,   # default access vlan
                    "allowed_vlans": [], # if trunk, list of allowed vlan IDs
                    "allowed_vlan_raw": None,
                    "ip_address": None,
                    "subnet_mask": None,
                    "shutdown": False,
                    "description": None,
                    "encapsulation": None,
                    "raw_lines": [raw_line]
                }
                continue

            # DHCP Pool block: e.g. "ip dhcp pool STUDENTS"
            dhcp_match = re.match(r"^ip\s+dhcp\s+pool\s+(.+)$", line, re.IGNORECASE)
            if dhcp_match:
                pool_name = dhcp_match.group(1).strip()
                current_block_type = "dhcp_pool"
                current_block_key = pool_name
                parsed["dhcp_pools"][pool_name] = {
                    "name": pool_name,
                    "line": line_num,
                    "network": None,
                    "mask": None,
                    "default_router": None,
                    "dns_server": None,
                    "raw_lines": [raw_line]
                }
                continue

            # Process lines inside blocks
            if raw_line.startswith(" ") or raw_line.startswith("\t"):
                if current_block_type == "vlan" and isinstance(current_block_key, list):
                    if line.startswith("name "):
                        vlan_name = line.split("name ")[1].strip()
                        for vid in current_block_key:
                            if vid in parsed["vlans"]:
                                parsed["vlans"][vid]["name"] = vlan_name

                elif current_block_type == "interface" and isinstance(current_block_key, str):
                    intf_data = parsed["interfaces"][current_block_key]
                    intf_data["raw_lines"].append(raw_line)

                    if line.startswith("description "):
                        intf_data["description"] = line.split("description ")[1].strip()
                    elif line == "shutdown":
                        intf_data["shutdown"] = True
                    elif line.startswith("switchport mode "):
                        intf_data["mode"] = line.split("switchport mode ")[1].strip()
                    elif line.startswith("switchport access vlan "):
                        try:
                            intf_data["access_vlan"] = int(line.split("switchport access vlan ")[1].strip())
                        except ValueError:
                            pass
                    elif line.startswith("switchport trunk allowed vlan "):
                        vlan_str = line.replace("switchport trunk allowed vlan ", "").replace("add ", "").replace("remove ", "").strip()
                        intf_data["allowed_vlan_raw"] = vlan_str
                        intf_data["allowed_vlans"] = self._parse_vlan_spec(vlan_str)
                    elif line.startswith("ip address "):
                        ip_parts = line.replace("ip address ", "").strip().split()
                        if len(ip_parts) >= 2:
                            intf_data["ip_address"] = ip_parts[0]
                            intf_data["subnet_mask"] = ip_parts[1]
                    elif line.startswith("encapsulation dot1q "):
                        try:
                            intf_data["encapsulation"] = int(line.split("encapsulation dot1q ")[1].strip().split()[0])
                        except Exception:
                            pass

                elif current_block_type == "dhcp_pool" and isinstance(current_block_key, str):
                    pool_data = parsed["dhcp_pools"][current_block_key]
                    pool_data["raw_lines"].append(raw_line)

                    if line.startswith("network "):
                        parts = line.replace("network ", "").strip().split()
                        if len(parts) >= 2:
                            pool_data["network"] = parts[0]
                            pool_data["mask"] = parts[1]
                    elif line.startswith("default-router "):
                        pool_data["default_router"] = line.replace("default-router ", "").strip().split()[0]
                    elif line.startswith("dns-server "):
                        pool_data["dns_server"] = line.replace("dns-server ", "").strip().split()[0]
            else:
                # Reset block if unindented non-block line encountered
                current_block_type = None
                current_block_key = None

        return parsed

    @staticmethod
    def _parse_vlan_spec(vlan_spec: str) -> List[int]:
        """
        Parses vlan spec strings like '10,20,30' or '10-15,20' or 'all' or 'except 20'.
        """
        vlans = set()
        spec = vlan_spec.strip().lower()
        if spec == "all":
            return list(range(1, 4095))
        
        # Handle simple comma separated / range lists
        tokens = spec.split(",")
        for tok in tokens:
            tok = tok.strip()
            if "-" in tok:
                parts = tok.split("-")
                if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
                    start, end = int(parts[0]), int(parts[1])
                    for v in range(start, end + 1):
                        if 1 <= v <= 4094:
                            vlans.add(v)
            elif tok.isdigit():
                v = int(tok)
                if 1 <= v <= 4094:
                    vlans.add(v)
        return sorted(list(vlans))

