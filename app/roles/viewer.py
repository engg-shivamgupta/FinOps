from fastapi import HTTPException, status

from app.roles.interfaces import IRoleInterface


class ViewerRole(IRoleInterface):
    """Viewers can only read dashboard data and view records."""

    def can_view_records(self) -> bool:
        return True

    def can_create_record(self) -> bool:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot create records",
        )

    def can_update_record(self) -> bool:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot update records",
        )

    def can_delete_record(self) -> bool:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot delete records",
        )

    def can_view_dashboard(self) -> bool:
        return True

    def can_view_insights(self) -> bool:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot access insights",
        )

    def can_manage_users(self) -> bool:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot manage users",
        )
