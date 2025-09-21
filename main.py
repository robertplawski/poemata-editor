import os
from fastapi import FastAPI, Request, Query, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

app = FastAPI(title="File Manager API")

TEMPLATE_DIR = "templates"
STORAGE_DIR = "storage"


templates = Jinja2Templates(directory=TEMPLATE_DIR)
os.makedirs(STORAGE_DIR, exist_ok=True)


# Pydantic model for creating/updating files
class FileData(BaseModel):
    content: str


# Helper to get full file path
def get_file_path(filepath: str):
    return os.path.join(STORAGE_DIR, filepath)


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
@app.get("/files/{filepath:path}")
async def read_file(filepath: str):
    path = get_file_path(filepath)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path)

# ---------------------------
# Preview file
# ---------------------------
@app.get("/preview/{filepath:path}",  response_class=HTMLResponse)
async def preview_file(request:Request,filepath: str,      template: str = Query(..., description="Template name in templates folder")
):
   # Validate template exists
    template_path = os.path.join(TEMPLATE_DIR, template)
    if not os.path.isfile(template_path):
        raise HTTPException(status_code=404, detail="Template not found")

    path = get_file_path(filepath)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="File not found")    # Read file content

    path = get_file_path(filepath)
    with open(path, "r", encoding="utf-8") as f:
        lines = f.read().splitlines()
    title = lines[0]
    footer = lines[-1]
    content = lines[1:-1]
    # Render template with file content
    context = {
        "request": request,
        "content": content,
        "title":title,
        "footer":footer,
    }
    return templates.TemplateResponse(template, context)



# ---------------------------
# Create file
# ---------------------------
@app.post("/files/{filepath:path}")
async def create_file(filepath: str, file: FileData):
    path = get_file_path(filepath)
    if os.path.exists(path):
        raise HTTPException(status_code=400, detail="File already exists")

    os.makedirs(os.path.dirname(path), exist_ok=True)  # create subdirs if needed
    with open(path, "w", encoding="utf-8") as f:
        f.write(file.content)
    return {"message": "File created", "file": filepath}


# ---------------------------
# Update file
# ---------------------------
@app.put("/files/{filepath:path}")
async def update_file(filepath: str, file: FileData):
    path = get_file_path(filepath)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="File not found")

    with open(path, "w", encoding="utf-8") as f:
        f.write(file.content)
    return {"message": "File updated", "file": filepath}


# ---------------------------
# Delete file
# ---------------------------
@app.delete("/files/{filepath:path}")
async def delete_file(filepath: str):
    path = get_file_path(filepath)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="File not found")

    os.remove(path)
    return {"message": "File deleted", "file": filepath}

