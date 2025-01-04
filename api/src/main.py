import io
from PIL import Image
from fastapi import FastAPI, UploadFile, HTTPException
import torch
import torchvision.transforms as transforms
from models.cnn.CNN import CNN

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

MODEL_PATH = 'models/cnn/cnn.pt'

model = CNN()
model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device('cpu')))
model.eval()

app = FastAPI()

@app.post("/image")
async def upload_file(file: UploadFile):
    if file.content_type is None:
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

    return 'benign' if probabilities[0] > probabilities[1] else 'malignant'
