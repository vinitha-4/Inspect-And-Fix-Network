"""
IP Configuration Checker.
Validates IP addresses, subnet masks, SVIs, and default gateway configurations.
"""
import ipaddress
from typing import Dict, List, Any
from .base_checker import BaseChecker

class IPChecker(BaseChecker):
    def check(self) -> List[Dict[str, Any]]:
        issues = []
        ip_globals = self.parsed_config.get("ip_globals", {})
        default_gw = ip_globals.get("default_gateway")
        interfaces = self.parsed_config.get("interfaces", {})

        svi_networks = []

        # Check Interface IP configurations
        for intf_name, intf_data in interfaces.items():
            ip_addr = intf_data.get("ip_address")
            mask = intf_data.get("subnet_mask")
            line_num = intf_data.get("line")

            if ip_addr and mask:
                try:
                    net = ipaddress.IPv4Network(f"{ip_addr}/{mask}", strict=False)
                    svi_networks.append((intf_name, ip_addr, mask, net))

                    # Check if interface IP is network or broadcast address
                    ip_obj = ipaddress.IPv4Address(ip_addr)
                    if ip_obj == net.network_address:
                        issues.append({
                            "id": f"IP_NETWORK_ADDR_ASSIGNED_{intf_name}",
                            "type": "IP_INVALID_HOST",
                            "title": f"Network address assigned to interface {intf_name}",
                            "severity": "high",
                            "category": "IP",
                            "message": f"ERROR: IP address {ip_addr} is a subnet network ID, not a valid host IP.",
                            "interface": intf_name,
                            "line_number": line_num,
                            "detected_config": f"ip address {ip_addr} {mask}",
                            "expected_config": f"ip address {net.network_address + 1} {mask}",
                            "reason": f"{ip_addr} is the network identifier for {net.with_prefixlen}.",
                            "explanation": f"Network addresses cannot be assigned to interfaces. Use a host IP such as {net.network_address + 1}.",
                            "suggested_fix": f"interface {intf_name}\n ip address {net.network_address + 1} {mask}"
                        })
                    elif ip_obj == net.broadcast_address:
                        issues.append({
                            "id": f"IP_BROADCAST_ADDR_ASSIGNED_{intf_name}",
                            "type": "IP_INVALID_HOST",
                            "title": f"Broadcast address assigned to interface {intf_name}",
                            "severity": "high",
                            "category": "IP",
                            "message": f"ERROR: IP address {ip_addr} is a subnet broadcast address.",
                            "interface": intf_name,
                            "line_number": line_num,
                            "detected_config": f"ip address {ip_addr} {mask}",
                            "expected_config": f"ip address {net.broadcast_address - 1} {mask}",
                            "reason": f"{ip_addr} is the broadcast address for {net.with_prefixlen}.",
                            "explanation": f"Subnet broadcast addresses cannot be assigned to host interfaces.",
                            "suggested_fix": f"interface {intf_name}\n ip address {net.broadcast_address - 1} {mask}"
                        })

                except ValueError:
                    issues.append({
                        "id": f"INVALID_IP_FORMAT_{intf_name}",
                        "type": "INVALID_IP_FORMAT",
                        "title": f"Invalid IP address format on {intf_name}",
                        "severity": "high",
                        "category": "IP",
                        "message": f"ERROR: IP address format '{ip_addr} {mask}' is invalid.",
                        "interface": intf_name,
                        "line_number": line_num,
                        "detected_config": f"ip address {ip_addr} {mask}",
                        "expected_config": f"ip address <valid_ip> <valid_mask>",
                        "reason": f"Syntax error in IP address or subnet mask.",
                        "explanation": f"Ensure the IP address and subnet mask follow standard dotted decimal format.",
                        "suggested_fix": f"interface {intf_name}\n ip address 192.168.1.1 255.255.255.0"
                    })

        # Check Default Gateway alignment
        if default_gw:
            try:
                gw_obj = ipaddress.IPv4Address(default_gw)
                matched = False
                for intf_name, ip_addr, mask, net in svi_networks:
                    if gw_obj in net:
                        matched = True
                        break

                if svi_networks and not matched:
                    first_intf, first_ip, first_mask, first_net = svi_networks[0]
                    correct_gw = str(first_net.network_address + 1)
                    issues.append({
                        "id": "DEFAULT_GATEWAY_MISMATCH",
                        "type": "DEFAULT_GATEWAY_MISMATCH",
                        "title": "Default gateway subnet mismatch",
                        "severity": "high",
                        "category": "IP",
                        "message": f"ERROR: Default gateway {default_gw} is not in the same subnet as any SVI/Interface IP.",
                        "interface": first_intf,
                        "line_number": None,
                        "detected_config": f"ip default-gateway {default_gw}",
                        "expected_config": f"ip default-gateway {correct_gw}",
                        "reason": f"Gateway {default_gw} does not belong to subnet {first_net.with_prefixlen} configured on {first_intf}.",
                        "explanation": f"The default gateway must be reachable on the local management subnet ({first_net.with_prefixlen}).",
                        "suggested_fix": f"no ip default-gateway {default_gw}\nip default-gateway {correct_gw}"
                    })
            except ValueError:
                issues.append({
                    "id": "INVALID_DEFAULT_GATEWAY",
                    "type": "INVALID_DEFAULT_GATEWAY",
                    "title": "Invalid default gateway IP format",
                    "severity": "high",
                    "category": "IP",
                    "message": f"ERROR: 'ip default-gateway {default_gw}' contains an invalid IP address.",
                    "interface": None,
                    "line_number": None,
                    "detected_config": f"ip default-gateway {default_gw}",
                    "expected_config": f"ip default-gateway <valid_ip>",
                    "reason": f"Syntax error in default gateway IP address.",
                    "explanation": f"Provide a valid IPv4 address for the default gateway.",
                    "suggested_fix": f"no ip default-gateway {default_gw}"
                })

        return issues

