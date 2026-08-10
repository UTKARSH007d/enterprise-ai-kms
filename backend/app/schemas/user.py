from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):

    name: str

    email: str

    password: str

    department_id: int

class UserLogin(BaseModel):

    email: str

    password: str

class AdminCreateUser(BaseModel):
    name: str
    email: EmailStr
    password: str
    department_id: int
    


class AdminUpdateUser(BaseModel):
    name: str | None = None
    role: str | None = None
    department_id: int | None = None
    is_active: bool | None = None