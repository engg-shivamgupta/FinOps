"""
Role Interface System
---------------------
Each role maps to a concrete implementation of IRoleInterface.
The interface defines what actions a role CAN or CANNOT perform.
The RoleRegistrar maps role names to their interface instances.
"""

from abc import ABC, abstractmethod


class IRoleInterface(ABC):
    """Abstract interface that every role must implement.

    Each method returns True if the role is allowed to perform that action,
    or raises an HTTPException(403) if denied.
    """

    @abstractmethod
    def can_view_records(self) -> bool:
        ...

    @abstractmethod
    def can_create_record(self) -> bool:
        ...

    @abstractmethod
    def can_update_record(self) -> bool:
        ...

    @abstractmethod
    def can_delete_record(self) -> bool:
        ...

    @abstractmethod
    def can_view_dashboard(self) -> bool:
        ...

    @abstractmethod
    def can_view_insights(self) -> bool:
        ...

    @abstractmethod
    def can_manage_users(self) -> bool:
        ...

    def permissions_map(self) -> dict[str, bool]:
        """Return a serializable dict of all permissions for this role."""
        return {
            "can_view_records": self._safe(self.can_view_records),
            "can_create_record": self._safe(self.can_create_record),
            "can_update_record": self._safe(self.can_update_record),
            "can_delete_record": self._safe(self.can_delete_record),
            "can_view_dashboard": self._safe(self.can_view_dashboard),
            "can_view_insights": self._safe(self.can_view_insights),
            "can_manage_users": self._safe(self.can_manage_users),
        }

    @staticmethod
    def _safe(fn) -> bool:
        try:
            return fn()
        except Exception:
            return False
