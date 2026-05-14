from rest_framework.permissions import BasePermission

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        token = request.auth
        if token is None:
            return False
        return token['role'] == 'admin'
