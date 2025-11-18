from rest_framework import permissions



#this function is to check if the user either  a teacher or admin
class IsTeacherOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(
            u and u.is_authenticated and (
                getattr(u, "role", None) == "teacher" or u.is_staff or u.is_superuser
            )
        )