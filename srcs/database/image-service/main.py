import os
import uuid
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from PIL import Image

app = FastAPI()

# Config from environment
MAX_SIZE = int(os.getenv("MAX_FILE_SIZE_MB", 5)) * 1024 * 1024
ALLOWED_EXTENSIONS = os.getenv("ALLOWED_EXTENSIONS", "jpg,jpeg,png,gif,webp").split(",")
STORAGE = Path(os.getenv("STORAGE_PATH", "/data/images"))

STORAGE.mkdir(parents=True, exist_ok=True)

@app.get("/images/health")
def health():
    return {"status": "ok"}

@app.post("/images/upload")
async def upload(image: UploadFile = File(...)):
    # Check magic bytes with Pillow
    try:
        img = Image.open(image.file)
        img.verify()
    except Exception:
        raise HTTPException(400, detail="Invalid image")
    ext = img.format.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, detail="Only JPEG, PNG, GIF, WebP allowed")

    # Reset file pointer after verify()
    image.file.seek(0)
    content = await image.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(400, detail=f"File too large, max {MAX_SIZE // (1024*1024)} MB")

    filename = f"{uuid.uuid4()}.{ext}"
    filepath = STORAGE / filename
    filepath.write_bytes(content)

    return {"filename": filename, "url": f"/images/{filename}"}

@app.get("/images/{filename}")
async def get_image(filename: str):
    filepath = STORAGE / filename
    if not filepath.exists():
        raise HTTPException(404, detail="Image not found")
    return FileResponse(filepath)