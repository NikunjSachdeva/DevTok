import os
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader

load_dotenv()

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True
)


def upload_to_cloudinary(file):
    try:
        result = cloudinary.uploader.upload_large(file, resource_type="video")
        print("✅ Cloudinary upload success:", result['secure_url'])
        return result['secure_url']
    except Exception as e:
        print("❌ Cloudinary upload error:", str(e))
        raise e
