from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from cloudinary_config import upload_to_cloudinary
from firebase_config import db
from fastapi.responses import JSONResponse
import uuid
from firebase_admin import credentials, firestore
from pydantic import BaseModel
from firestore_helpers import active_user_uploaded_col
from firestore_helpers import active_user_liked_col
from pydantic import BaseModel, EmailStr
from firestore_helpers import registered_user_ref, active_user_profile_ref
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"]
,  # Update if your frontend is hosted elsewhere
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RegisterUser(BaseModel):
    uid: str
    username: str
    email: EmailStr
    bio: str = ""  # optional default

@app.post("/register_user/")
async def register_user(data: RegisterUser):
    profile_data = data.dict()

    # Registered Users
    registered_user_ref(data.username).set(profile_data, merge=True)

    # Active Users (profile doc)
    active_user_profile_ref(data.username).set(
        {**profile_data, "last_active": firestore.SERVER_TIMESTAMP},
        merge=True
    )

    return {"message": "User registered", "username": data.username}

class ProfileUpdate(BaseModel):
    uid: str
    username : str
    email: str
    bio: str

@app.post("/update_profile/")
async def update_profile(data: ProfileUpdate):
    profile_data = data.dict()

    # 1️⃣ Update in registered_users
    registered_user_ref(data.username).set(profile_data, merge=True)

    # 2️⃣ Update in active_users
    active_user_profile_ref(data.username).set(
        {**profile_data, "last_updated": firestore.SERVER_TIMESTAMP},
        merge=True
    )

    return {"message": "Profile updated successfully!"}

@app.post("/upload_snap/")
async def upload_snap(
    username : str = Form(""),
    title: str = Form(...),
    description: str = Form(""),
    codeSnippet: str = Form(""),
    hashtags: str = Form(""),
    video: UploadFile = File(...)
):
    print("🔥 Received request with title:", title)
    # Upload video to Cloudinary
    video_url = upload_to_cloudinary(video.file)

    # Store metadata in Firestore
    snap_data = {
        "username" : username,
        "title": title,
        "description": description,
        "code_snippet": codeSnippet,
        "hashtags": [tag.strip() for tag in hashtags.split(",") if tag.strip()],
        "video_url": video_url,
        "likes": 0,
    }
    new_snap = db.collection("snaps").add(snap_data)         # existing line
    snap_id = new_snap[1].id   
    # db.collection("snaps").add(snap_data)

    # 1️⃣ store under the user’s uploaded_snaps
    active_user_uploaded_col(username).document(snap_id).set(
        {**snap_data, "snap_id": snap_id}
    )

    return {"message": "Snap uploaded successfully!", "video_url": video_url}


@app.get("/fetch_snaps/")
def fetch_snaps():
    try:
        snaps_ref = db.collection("snaps").stream()
        snaps = []
        for snap in snaps_ref:
            snap_dict = snap.to_dict()
            snap_dict["id"] = snap.id  # Firestore document ID
            # Ensure comments key exists even if no comments yet
            snap_dict["comments"] = snap_dict.get("comments", [])
            snaps.append(snap_dict)
        return JSONResponse(content=snaps)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/comments/{snap_id}")
def get_comments(snap_id: str):
    snap_ref = db.collection("snaps").document(snap_id)
    snap_doc = snap_ref.get()
    if not snap_doc.exists:
        raise HTTPException(status_code=404, detail="Snap not found")

    comments = snap_doc.to_dict().get("comments", [])
    print(f"📤 Returning comments for {snap_id}: {comments}")
    return {"comments": comments}


class LikeData(BaseModel):
    uid: str
    username: str  # 👈 include this

@app.post("/like_snap/{snap_id}")
def like_snap(snap_id: str, data: LikeData):
    snap_ref = db.collection("snaps").document(snap_id)
    snap_doc = snap_ref.get()
    if not snap_doc.exists:
        raise HTTPException(status_code=404, detail="Snap not found")

    snap_data = snap_doc.to_dict()
    current_likes = snap_data.get("likes", 0)
    liked_users = snap_data.get("liked_users", [])

    if data.uid in liked_users:
        return {"message": "User already liked this snap"}

    snap_ref.update({
        "likes": current_likes + 1,
        "liked_users": firestore.ArrayUnion([data.uid]),
        "liked_usernames": firestore.ArrayUnion([data.username]),  # Optional tracking
    })

    # 1️⃣ add to user/liked_snaps
    active_user_liked_col(data.username).document(snap_id).set({
        "snap_id": snap_id,
        "liked_at": firestore.SERVER_TIMESTAMP
    })

    return {"message": "Snap liked successfully!"}




class CommentData(BaseModel):
    comment: str
    uid: str
    email: str
    username: str

@app.post("/comment_snap/{snap_id}")
def comment_snap(snap_id: str, data: CommentData):
    snap_ref = db.collection("snaps").document(snap_id)
    snap_doc = snap_ref.get()
    if not snap_doc.exists:
        raise HTTPException(status_code=404, detail="Snap not found")

    comment_entry = {
        "uid": data.uid,
        "email": data.email,
        "username": data.username,
        "comment": data.comment
    }

    snap_ref.update({
        "comments": firestore.ArrayUnion([comment_entry])
    })

    return {"message": "Comment added successfully"}
