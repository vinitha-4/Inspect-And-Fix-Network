"""
DHCP Configuration Checker.
Validates DHCP pools, network statements, default routers, and subnet alignments.
"""
import ipaddress
from typing import Dict, List, Any
from .base_checker import BaseChecker

class DHCPChecker(BaseChecker):
    def check(self) -> List[Dict[str, Any]]:
        issues = []
        dhcp_pools = self.parsed_config.get("dhcp_pools", {})
        interfaces = self.parsed_config.get("interfaces", {})

        for pool_name, pool_data in dhcp_pools.items():
            line_num = pool_data.get("line")
            net_addr = pool_data.get("network")
            mask = pool_data.get("mask")
            def_router = pool_data.get("default_router")

            # 1. Missing network statement
            if not net_addr or not mask:
                issues.append({
                    "id": f"DHCP_MISSING_NETWORK_{pool_name}",
                    "type": "DHCP_MISSING_NETWORK",
                    "title": f"DHCP pool '{pool_name}' missing network configuration",
                    "severity": "high",
                    "category": "DHCP",
                    "message": f"ERROR: DHCP pool '{pool_name}' has no 'network' address/mask configured.",
                    "interface": None,
                    "line_number": line_num,
                    "detected_config": f"ip dhcp pool {pool_name}",
                    "expected_config": f"ip dhcp pool {pool_name}\n network 192.168.10.0 255.255.255.0",
                    "reason": f"A DHCP pool requires a network definition to assign IP addresses to clients.",
                    "explanation": f"Without a network command, DHCP pool '{pool_name}' cannot serve client requests.",
                    "suggested_fix": f"ip dhcp pool {pool_name}\n network 192.168.10.0 255.255.255.0"
                })

            # 2. Missing default-router
            if not def_router:
                issues.append({
                    "id": f"DHCP_MISSING_ROUTER_{pool_name}",
                    "type": "DHCP_MISSING_ROUTER",
                    "title": f"DHCP pool '{pool_name}' missing default router",
                    "severity": "medium",
                    "category": "DHCP",
                    "message": f"WARNING: DHCP pool '{pool_name}' has no 'default-router' configured.",
                    "interface": None,
                    "line_number": line_num,
                    "detected_config": f"ip dhcp pool {pool_name}",
                    "expected_config": f"ip dhcp pool {pool_name}\n default-router 192.168.10.1",
                    "reason": f"DHCP clients will receive IP addresses but will have no default gateway for external traffic.",
                    "explanation": f"Configure 'default-router' so clients know where to send off-subnet packets.",
                    "suggested_fix": f"ip dhcp pool {pool_name}\n default-router 192.168.10.1"
                })

            # 3. Default router subnet mismatch with network statement
            if net_addr and mask and def_router:
                try:
                    pool_net = ipaddress.IPv4Network(f"{net_addr}/{mask}", strict=False)
                    router_ip = ipaddress.IPv4Address(def_router)
                    if router_ip not in pool_net:
                        issues.append({
                            "id": f"DHCP_ROUTER_MISMATCH_{pool_name}",
                            "type": "DHCP_ROUTER_MISMATCH",
                            "title": f"DHCP default-router subnet mismatch in '{pool_name}'",
                            "severity": "high",
                            "category": "DHCP",
                            "message": f"ERROR: default-router {def_router} is not inside pool network {pool_net.with_prefixlen}.",
                            "interface": None,
                            "line_number": line_num,
                            "detected_config": f"ip dhcp pool {pool_name}\n network {net_addr} {mask}\n default-router {def_router}",
                            "expected_config": f"ip dhcp pool {pool_name}\n default-router {pool_net.network_address + 1}",
                            "reason": f"The default router IP address ({def_router}) must belong to the pool subnet.",
                            "explanation": f"Clients in subnet {pool_net.with_prefixlen} will be unable to communicate with default router {def_router}.",
                            "suggested_fix": f"ip dhcp pool {pool_name}\n default-router {pool_net.network_address + 1}"
                        })
                except ValueError:
                    pass

        return issues

