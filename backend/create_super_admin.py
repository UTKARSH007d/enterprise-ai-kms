from app.database.database import SessionLocal
from app.models.department import Department
from app.models.user import User
from app.auth.security import hash_password


# ==========================================
# SUPER ADMIN DETAILS
# ==========================================

NAME = "Super Admin"
EMAIL = "superadmin@test.com"
PASSWORD = "ChangeMe123!"

# Your HR department is ID 2
DEPARTMENT_ID = 2


# ==========================================
# CREATE SUPER ADMIN
# ==========================================

db = SessionLocal()

try:
    # Check whether user already exists
    existing_user = (
        db.query(User)
        .filter(User.email == EMAIL)
        .first()
    )

    if existing_user:
        print("User already exists.")
        print(f"Email: {existing_user.email}")
        print(f"Role: {existing_user.role}")

    else:
        # Check department
        department = (
            db.query(Department)
            .filter(Department.id == DEPARTMENT_ID)
            .first()
        )

        if not department:
            print(f"Department ID {DEPARTMENT_ID} does not exist.")
            print("Please check your department IDs.")
            raise SystemExit

        # Create super admin
        new_user = User(
            name=NAME,
            email=EMAIL,
            password_hash=hash_password(PASSWORD),
            role="super_admin",
            department_id=DEPARTMENT_ID,
            is_active=True
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        print()
        print("======================================")
        print("SUPER ADMIN CREATED SUCCESSFULLY")
        print("======================================")
        print(f"Name:       {new_user.name}")
        print(f"Email:      {new_user.email}")
        print(f"Password:   {PASSWORD}")
        print(f"Role:       {new_user.role}")
        print(f"Department: {department.name}")
        print(f"User ID:    {new_user.id}")
        print("======================================")

finally:
    db.close()