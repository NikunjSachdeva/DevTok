from firebase_config import db
from typing import Dict

def active_user_profile_ref(username: str):
    return (db.collection("users")
              .document("active_users_meta")
              .collection("users")
              .document(username)
              .collection("meta")
              .document("profile"))  

def active_user_uploaded_col(username: str):
    return (db.collection("users")
              .document("active_users_meta")
              .collection("users")
              .document(username)
              .collection("uploaded_snaps"))

def active_user_liked_col(username: str):
    return (db.collection("users")
              .document("active_users_meta")
              .collection("users")
              .document(username)
              .collection("liked_snaps"))

def registered_user_ref(username: str):
    return (db.collection("users")
              .document("registered_users_meta")
              .collection("users")
              .document(username))
