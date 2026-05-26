import asyncio
import json
import logging
import os
import ssl
import time
import uuid
from pathlib import Path
from urllib.request import urlopen

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from PIL import Image

app = FastAPI()

# Config from environment
MAX_SIZE = int(os.getenv("MAX_FILE_SIZE_MB", 5)) * 1024 * 1024
ALLOWED_EXTENSIONS = os.getenv("ALLOWED_EXTENSIONS", "jpg,jpeg,png,gif,webp").split(",")
STORAGE = Path(os.getenv("STORAGE_PATH", "/data/images"))
STORAGE.mkdir(parents=True, exist_ok=True)
CA_CERT_PATH = Path(f"/certs/{os.getenv('CA_CRT_NAME', 'ca.crt')}")

CLEANUP_INTERVAL_SECONDS = int(os.getenv("CLEANUP_INTERVAL_SECONDS", 300))
CLEANUP_MIN_AGE_SECONDS = int(os.getenv("CLEANUP_MIN_AGE_SECONDS", 3600))
BACKEND_LISTING_IMAGES_URL = str(os.getenv("BACKEND_LISTING_IMAGES_URL"))

logger = logging.getLogger("image_service.cleanup")
logger.setLevel(os.getenv("LOG_LEVEL", "INFO").upper())

if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(levelname)s:     %(message)s"))
    logger.addHandler(handler)


def fetch_referenced_images() -> set[str]:
    ssl_context = ssl.create_default_context(cafile=str(CA_CERT_PATH))

    with urlopen(BACKEND_LISTING_IMAGES_URL, context=ssl_context, timeout=5) as response:
        payload = json.load(response)

    if not isinstance(payload, list):
        raise ValueError("backend /api/listings/images/ did not return a list")

    return {name for name in payload if isinstance(name, str) and name}


def cleanup_orphan_images() -> None:
    try:
        referenced = fetch_referenced_images()
    except Exception as exc:
        logger.error(
            "cleanup skipped\n"
            "  reason=failed to fetch referenced images\n"
            "  error=%s",
            exc,
        )
        return

    now = time.time()
    disk_files = [path for path in STORAGE.iterdir() if path.is_file()]
    deleted = 0
    skipped_recent = 0
    orphan_candidates = 0

    for path in disk_files:
        if path.name in referenced:
            continue

        orphan_candidates += 1
        age_seconds = now - path.stat().st_mtime

        if age_seconds < CLEANUP_MIN_AGE_SECONDS:
            skipped_recent += 1
            logger.info(
                "cleanup keep recent orphan\n"
                "  file=%s\n"
                "  age_seconds=%d",
                path.name,
                int(age_seconds),
            )
            continue

        try:
            path.unlink()
            deleted += 1
            logger.info(
                "cleanup deleted orphan\n"
                "  file=%s\n"
                "  age_seconds=%d",
                path.name,
                int(age_seconds),
            )
        except Exception as exc:
            logger.error(
                "cleanup delete failed\n"
                "  file=%s\n"
                "  error=%s",
                path.name,
                exc,
            )

    logger.info(
        "cleanup cycle done\n"
        "  referenced=%d\n"
        "  disk=%d\n"
        "  orphan_candidates=%d\n"
        "  deleted=%d\n"
        "  skipped_recent=%d",
        len(referenced),
        len(disk_files),
        orphan_candidates,
        deleted,
        skipped_recent,
    )


async def cleanup_loop() -> None:
    while True:
        await asyncio.sleep(CLEANUP_INTERVAL_SECONDS)
        cleanup_orphan_images()


@app.on_event("startup")
async def start_cleanup_loop():
    logger.info(
        "starting cleanup loop\n"
        "  interval_seconds=%d\n"
        "  min_age_seconds=%d\n"
        "  backend_url=%s",
        CLEANUP_INTERVAL_SECONDS,
        CLEANUP_MIN_AGE_SECONDS,
        BACKEND_LISTING_IMAGES_URL,
    )
    app.state.cleanup_task = asyncio.create_task(cleanup_loop())


@app.on_event("shutdown")
async def stop_cleanup_loop():
    task = getattr(app.state, "cleanup_task", None)
    if task is not None:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


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