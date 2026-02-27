from django.contrib.auth import get_user_model
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .permissions import IsAdminOrHRRole, IsAdminRole
from .serializers import (
    AdminUserCreateSerializer,
    MeUpdateSerializer,
    RegisterSerializer,
    UserPublicSerializer,
)


User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data["user"] = UserPublicSerializer(user).data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserPublicSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    def get(self, request):
        return Response(UserPublicSerializer(request.user).data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = MeUpdateSerializer(instance=request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserPublicSerializer(request.user).data, status=status.HTTP_200_OK)


class AssigneesView(APIView):
    def get(self, request):
        user = request.user
        qs = User.objects.filter(is_active=True).order_by("full_name", "email")

        if user.role in {"ADMIN", "HR_EMPLOYEE"}:
            pass
        elif user.role in {"MANAGER", "TEAM_LEADER"}:
            if user.department:
                qs = qs.filter(department=user.department)
            else:
                qs = qs.filter(id=user.id)
        else:
            qs = qs.filter(id=user.id)

        return Response(UserPublicSerializer(qs, many=True).data, status=status.HTTP_200_OK)


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    permission_classes = [IsAdminOrHRRole]

    def get_serializer_class(self):
        if self.action == "create":
            return AdminUserCreateSerializer
        return UserPublicSerializer

    def get_permissions(self):
        if self.action in {"create", "update", "partial_update", "destroy"}:
            return [IsAdminRole()]
        return super().get_permissions()

    @action(detail=False, methods=["get"])
    def roles(self, request):
        return Response(
            [{"value": value, "label": label} for value, label in User.Role.choices],
            status=status.HTTP_200_OK,
        )
