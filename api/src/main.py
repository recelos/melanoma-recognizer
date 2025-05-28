import io
import os
from PIL import Image
from fastapi import FastAPI, UploadFile, HTTPException, Depends
import torch
import torchvision.transforms as transforms
from CNN import CNN
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.future import select
from schemas import FolderSchema
from models import Base, Folder

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@localhost:5432/photosdb")
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
