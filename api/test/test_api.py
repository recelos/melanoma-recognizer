import io
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_upload_no_file_should_return_400_bad_request():
    # Act
    response = client.post("/image")

    # Assert
    assert response.status_code == 400
    assert response.json() == {"detail": "No file uploaded"}

def test_invalid_file_type_should_return_400_bad_request():
    # Arrange
    invalid_file = io.BytesIO(b"This is a text file")

    # Act
    response = client.post("/image", files={"file": ("test.txt", invalid_file, "text/plain")})

    # Assert
    assert response.status_code == 400
    assert response.json() == {"detail": "Image must be of jpeg type"}

def test_upload_malignant_should_return_malignant():
    # Arrange
    filepath = "../../data/train/malignant/melanoma_5000.jpg"

    # Act
    with open (filepath, 'rb') as image:
        response = client.post(
        "/image",
        files={"file": ("test_image.jpg", image, "image/jpeg")}
        )

    # Assert
    assert response.status_code == 200
    assert "result" in response.json()
    assert response.json()["result"] == "malignant"

def test_upload_benign_should_return_benign():
    # Arrange
    filepath = "../../data/train/benign/melanoma_0.jpg"

    # Act
    with open (filepath, 'rb') as image:
        response = client.post(
        "/image",
        files={"file": ("test_image.jpg", image, "image/jpeg")}
        )

    # Assert
    assert response.status_code == 200
    assert "result" in response.json()
    assert response.json()["result"] == "benign"
