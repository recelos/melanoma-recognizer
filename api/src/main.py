import io
import os
from PIL import Image
from fastapi import FastAPI, UploadFile, HTTPException, Depends, Form
from fastapi.responses import JSONResponse
import torch
import torchvision.transforms as transforms
from CNN import CNN
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.future import select
from schemas import FolderSchema, PhotoSchema
from models import Folder, Photo
from fastapi.staticfiles import StaticFiles
import uuid
from s3_service import generate_presigned_url, save_file_to_bucket
from botocore.exceptions import BotoCoreError, ClientError

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = async_sessionmaker(engine, expire_on_commit=False)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'cnn.pt')

model = CNN()
model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device('cpu')))
model.eval()

app = FastAPI()
async def get_db():
    async with async_session() as session:
        yield session

@app.post("/image")
async def upload_file(file: UploadFile | None = None):
    if not file:
        raise HTTPException(status_code=400, detail='No file uploaded')

    if file.content_type != 'image/jpeg':
        raise HTTPException(status_code=400, detail='Image must be of jpeg type')

    data = await file.read()
    image = transform(Image.open(io.BytesIO(data)).convert('RGB'))
    image = image.unsqueeze(0)

    with torch.no_grad():
        result = model(image)

    probabilities = torch.nn.functional.softmax(result, dim=1)
    probabilities = probabilities.squeeze().tolist()

    result = 'benign' if probabilities[0] > probabilities[1] else 'malignant'
    return {'result' : result }

@app.get("/users/{user_id}/folders", response_model=list[FolderSchema])
async def get_user_folders(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Folder).where(Folder.user_id == user_id))
    folders = result.scalars().all()
    if not folders:
        raise HTTPException(status_code=404, detail="No folders found for this user")
    return folders

@app.get("/folders/{folder_id}/photos", response_model=list[PhotoSchema])
async def get_photos_for_folder(folder_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Photo).where(Photo.folder_id == folder_id))
    photos = result.scalars().all()
    if not photos:
        raise HTTPException(status_code=404, detail="No images in this folder")

    return [
        PhotoSchema(
            id=photo.id,
            classification_result=photo.classification_result,
            url=generate_presigned_url(photo.url)
        )
        for photo in photos
    ]

@app.post("/folders")
async def create_folder(
    name: str = Form(...),
    user_id: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    new_folder = Folder(name=name, user_id=user_id)
    db.add(new_folder)
    await db.commit()
    await db.refresh(new_folder)

    return {"id": new_folder.id, "name": new_folder.name}

@app.post('/save')
async def save_file(
    file: UploadFile,
    folder_id: int = Form(...),
    classification_result: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    if file.content_type != 'image/jpeg':
        raise HTTPException(status_code=400, detail='File must be of image/jpeg type')

    result = await db.execute(select(Folder).where(Folder.id == folder_id))
    folder = result.scalars().first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder does not exist")

    unique_filename = f"{uuid.uuid4().hex}.jpg"

    try:
        file_content = await file.read()
        save_file_to_bucket(file_content, unique_filename)
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=500, detail=f"Error during uploading to S3: {str(e)}")

    photo = Photo(
        classification_result=classification_result,
        folder_id=folder_id,
        url=unique_filename
    )
    db.add(photo)
    await db.commit()
    await db.refresh(photo)

    return JSONResponse({
        "id": photo.id,
        "classification_result": classification_result,
        "url": unique_filename
    })
