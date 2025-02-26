import io
import os
from PIL import Image
from fastapi import FastAPI, UploadFile, HTTPException
import torch
import torchvision.transforms as transforms
from CNN import CNN

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'cnn.pt')

model = CNN()
model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device('cpu')))
model.eval()

app = FastAPI()

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
