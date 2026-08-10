from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.auth.security import hash_password,verify_password,create_access_token
from fastapi import HTTPException 
 
from fastapi.security import OAuth2PasswordRequestForm
from app.database.database import get_db
from app.schemas.user import UserRegister,UserLogin
from app.models.user import User
from app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db)):

    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first())

    if existing_user:
     raise HTTPException(
        status_code=400,
        detail="Email already registered"
    )

    
    hashed_password = hash_password(user.password)

    
    new_user = User(
    name=user.name,
    email=user.email,
    password_hash=hashed_password,
    role="employee",
    department_id=user.department_id
)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
    "message": "User registered successfully",
    "user_id": new_user.id
}


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    db_user = (
        db.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        form_data.password,
        db_user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "department_id": current_user.department_id
    }