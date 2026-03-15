from rest_framework.permissions import BasePermission


class IsNegocioOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "owner"):
            return obj.owner == request.user
        if hasattr(obj, "negocio"):
            return obj.negocio.owner == request.user
        return False
