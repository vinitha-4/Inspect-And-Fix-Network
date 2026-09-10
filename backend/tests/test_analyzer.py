"""
Unit tests for Cisco Configuration Analyzer engine.
"""
import sys
import os
import unittest

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from analyzer.engine import NetworkConfigAnalyzer

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

class TestAnalyzer(unittest.TestCase):

    def test_demo_config_detects_vlan_20_trunk_error(self):
        analyzer = NetworkConfigAnalyzer(DEMO_CONFIG)
        result = analyzer.analyze()

        self.assertEqual(result["status"], "error")
        self.assertGreaterEqual(result["summary"]["total_issues"], 1)

        # Check issues for VLAN 20 missing on trunk
        vlan20_issue = None
        for issue in result["issues"]:
            if issue["type"] == "TRUNK_VLAN_MISSING" and issue["vlan_id"] == 20:
                vlan20_issue = issue
                break

        self.assertIsNotNone(vlan20_issue, "VLAN 20 trunk missing issue should be detected")
        self.assertEqual(vlan20_issue["interface"], "GigabitEthernet0/1")
        self.assertEqual(vlan20_issue["severity"], "high")
        self.assertIn("VLAN 20 is not allowed on trunk.", vlan20_issue["message"])
        self.assertEqual(vlan20_issue["suggested_fix"], "interface GigabitEthernet0/1\nswitchport trunk allowed vlan 10,20,30")

    def test_correct_config_passes(self):
        analyzer = NetworkConfigAnalyzer(CORRECT_CONFIG)
        result = analyzer.analyze()

        self.assertEqual(result["status"], "correct")
        self.assertEqual(result["summary"]["total_issues"], 0)

if __name__ == "__main__":
    unittest.main()

