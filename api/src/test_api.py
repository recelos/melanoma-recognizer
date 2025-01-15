import io
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_invalid_file_type_should_return_400():
    # Arrange
    invalid_file = io.BytesIO(b"This is a text file")

    # Act
    response = client.post("/image", files={"file": ("test.txt", invalid_file, "text/plain")})

    # Assert
    assert response.status_code == 400
    assert response.json() == {"detail": "Image must be of jpeg type"}
