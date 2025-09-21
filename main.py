import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI(title="File Manager API")

STORAGE_DIR = "storage"

# Ensure storage directory exists
os.makedirs(STORAGE_DIR, exist_ok=True)


# Pydantic model for creating/updating files
class FileData(BaseModel):
    content: str


# Helper to get full file path
def get_file_path(filename: str):
    return os.path.join(STORAGE_DIR, filename)


# ---------------------------
# List files recursively
# ---------------------------
@app.get("/files/")
async def list_files():
    file_list = []
    for root, dirs, files in os.walk(STORAGE_DIR):
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, STORAGE_DIR)
            file_list.append(rel_path)
    return {"files": file_list}


# ---------------------------
# Read file
# ---------------------------
@app.get("/files/{filename}")
async def read_file(filename: str):
    path = get_file_path(filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path)


# ---------------------------
# Create file
# ---------------------------
@app.post("/files/{filename}")
async def create_file(filename: str, file: FileData):
    path = get_file_path(filename)
    if os.path.exists(path):
        raise HTTPException(status_code=400, detail="File already exists")

    os.makedirs(os.path.dirname(path), exist_ok=True)  # create subdirs if needed
    with open(path, "w", encoding="utf-8") as f:
        f.write(file.content)
    return {"message": "File created", "file": filename}


# ---------------------------
# Update file
# ---------------------------
@app.put("/files/{filename}")
async def update_file(filename: str, file: FileData):
    path = get_file_path(filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="File not found")

    with open(path, "w", encoding="utf-8") as f:
        f.write(file.content)
    return {"message": "File updated", "file": filename}


# ---------------------------
# Delete file
# ---------------------------
@app.delete("/files/{filename}")
async def delete_file(filename: str):
    path = get_file_path(filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="File not found")

    os.remove(path)
    return {"message": "File deleted", "file": filename}

