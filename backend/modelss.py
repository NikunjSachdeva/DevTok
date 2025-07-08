# models.py
from pydantic import BaseModel, EmailStr

class RegisterUser(BaseModel):
    uid: str
    username: str
    email: EmailStr
    # bio: str = ""

# main.py
from backend.modelss import RegisterUser
from firestore_helpers import registered_user_ref, active_user_profile_ref
from firebase_admin import firestore

@app.post("/register_user/")
async def register_user(data: RegisterUser):
    profile_data = data.dict()

    # 1️⃣ create / update in registered_users
    registered_user_ref(data.username).set(profile_data, merge=True)

    # 2️⃣ create / update (or keep fresh) in active_users
    active_user_profile_ref(data.username).set(
        {**profile_data, "last_active": firestore.SERVER_TIMESTAMP}, merge=True
    )

    return {"message": "User registered", "username": data.username}
