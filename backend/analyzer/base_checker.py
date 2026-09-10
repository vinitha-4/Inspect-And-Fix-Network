"""
Base Rule Checker class definition.
"""
from typing import Dict, List, Any

class BaseChecker:
    """
    Base class for all configuration rule checkers.
    """
    def __init__(self, parsed_config: Dict[str, Any], raw_config: str):
        self.parsed_config = parsed_config
        self.raw_config = raw_config

    def check(self) -> List[Dict[str, Any]]:
        """
        Runs analysis checks and returns a list of detected issue dicts.
        """
        raise NotImplementedError("Subclasses must implement check()")

