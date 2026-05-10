from app.roles.interfaces import IRoleInterface


class AdminRole(IRoleInterface):
    """Admins have full access to all operations."""

    def can_view_records(self) -> bool:
        return True

    def can_create_record(self) -> bool:
        return True

    def can_update_record(self) -> bool:
        return True

    def can_delete_record(self) -> bool:
        return True

    def can_view_dashboard(self) -> bool:
        return True

    def can_view_insights(self) -> bool:
        return True

    def can_manage_users(self) -> bool:
        return True
