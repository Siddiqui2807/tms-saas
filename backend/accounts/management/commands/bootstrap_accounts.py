import secrets

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--admin-email", default="admin@tms.local")
        parser.add_argument("--admin-password", default="")
        parser.add_argument("--manager-email", default="manager@tms.local")
        parser.add_argument("--manager-password", default="")
        parser.add_argument("--employee-email", default="employee@tms.local")
        parser.add_argument("--employee-password", default="")

    def handle(self, *args, **options):
        User = get_user_model()

        admin_email = options["admin_email"]
        admin_password = options["admin_password"] or f"Admin@{secrets.token_urlsafe(8)}"

        manager_email = options["manager_email"]
        manager_password = options["manager_password"] or f"Manager@{secrets.token_urlsafe(8)}"

        employee_email = options["employee_email"]
        employee_password = options["employee_password"] or f"Employee@{secrets.token_urlsafe(8)}"

        created = []

        admin, admin_created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                "full_name": "System Admin",
                "role": "ADMIN",
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
            },
        )
        if admin_created:
            admin.set_password(admin_password)
            admin.save(update_fields=["password"])
            created.append(("ADMIN", admin_email, admin_password))

        manager, manager_created = User.objects.get_or_create(
            email=manager_email,
            defaults={
                "full_name": "Default Manager",
                "role": "MANAGER",
                "department": "Operations",
                "is_active": True,
            },
        )
        if manager_created:
            manager.set_password(manager_password)
            manager.save(update_fields=["password"])
            created.append(("MANAGER", manager_email, manager_password))

        employee, employee_created = User.objects.get_or_create(
            email=employee_email,
            defaults={
                "full_name": "Default Employee",
                "role": "IT_EMPLOYEE",
                "department": "IT",
                "is_active": True,
            },
        )
        if employee_created:
            employee.set_password(employee_password)
            employee.save(update_fields=["password"])
            created.append(("EMPLOYEE", employee_email, employee_password))

        if created:
            for role, email, password in created:
                self.stdout.write(self.style.SUCCESS(f"CREATED {role}: {email} / {password}"))
        else:
            self.stdout.write(self.style.WARNING("No accounts created (already exist)."))
