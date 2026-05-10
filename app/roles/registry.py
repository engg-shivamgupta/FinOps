"""
Role Registrar
--------------
Central registry that maps role names to their IRoleInterface implementation.
On entering a role, the corresponding interface is returned.

Usage:
    interface = RoleRegistrar.get("admin")
    interface.can_create_record()  # True
    interface.permissions_map()    # {can_view_records: True, ...}
"""

from app.models.user import RoleEnum
from app.roles.admin import AdminRole
from app.roles.analyst import AnalystRole
from app.roles.interfaces import IRoleInterface
from app.roles.viewer import ViewerRole


class RoleRegistrar:
    """Maps each role to its interface implementation.

    The registry is a class-level dict. Roles are registered at module load time.
    To add a new role, simply add an entry to _registry and create the implementation.
    """

    _registry: dict[str, IRoleInterface] = {
        RoleEnum.VIEWER: ViewerRole(),
        RoleEnum.ANALYST: AnalystRole(),
        RoleEnum.ADMIN: AdminRole(),
    }

    @classmethod
    def get(cls, role: str | RoleEnum) -> IRoleInterface:
        """Look up the interface for a given role.

        Args:
            role: Role name string or RoleEnum value.

        Returns:
            The IRoleInterface instance for that role.

        Raises:
            ValueError: If the role is not registered.
        """
        role_key = role if isinstance(role, RoleEnum) else RoleEnum(role)
        interface = cls._registry.get(role_key)
        if interface is None:
            raise ValueError(f"No interface registered for role: {role}")
        return interface

    @classmethod
    def register(cls, role: RoleEnum, interface: IRoleInterface) -> None:
        """Register a new role-interface mapping (extensibility hook)."""
        cls._registry[role] = interface

    @classmethod
    def get_interface_map(cls, role: str | RoleEnum) -> dict[str, bool]:
        """Return the permissions map for a role — used in login response."""
        return cls.get(role).permissions_map()

    @classmethod
    def all_roles(cls) -> dict[str, dict[str, bool]]:
        """Return permissions maps for all registered roles."""
        return {role.value: iface.permissions_map() for role, iface in cls._registry.items()}
