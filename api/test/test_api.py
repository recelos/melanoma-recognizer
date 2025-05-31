import io
from fastapi.testclient import TestClient
from main import app
from unittest.mock import AsyncMock, patch, MagicMock
import pytest
from botocore.exceptions import BotoCoreError

client = TestClient(app)

@pytest.fixture
def mock_db():
    with patch("main.get_db", new_callable=lambda: AsyncMock) as db:
        yield db

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
    filepath = "./api/test/test_data/melanoma_5000.jpg"

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
    filepath = "./api/test/test_data/melanoma_0.jpg"

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

@patch("main.async_session")
def test_get_user_folders(mock_async_session):
    # Arrange
    db_mock = AsyncMock()
    mock_async_session.return_value.__aenter__.return_value = db_mock

    fake_folder = type("Folder", (), {
        "id": 1,
        "name": "Test Folder",
        "user_id": "user123"
    })()

    scalars_result_mock = MagicMock()
    scalars_result_mock.all.return_value = [fake_folder]

    result_mock = MagicMock()
    result_mock.scalars.return_value = scalars_result_mock

    db_mock.execute.return_value = result_mock
    # Act
    response = client.get("/users/user123/folders")

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert data[0]["id"] == 1
    assert data[0]["name"] == "Test Folder"

@patch("main.async_session")
def test_get_user_folders_empty(mock_async_session):
    # Arrange
    db_mock = AsyncMock()
    mock_async_session.return_value.__aenter__.return_value = db_mock

    # Brak folderów
    scalars_result_mock = MagicMock()
    scalars_result_mock.all.return_value = []

    result_mock = MagicMock()
    result_mock.scalars.return_value = scalars_result_mock

    db_mock.execute.return_value = result_mock

    # Act
    response = client.get("/users/user123/folders")

    # Assert
    assert response.status_code == 404
    assert response.json() == {"detail": "No folders found for this user"}

@patch("main.generate_presigned_url", return_value="http://example.com/test.jpg")
@patch("main.async_session")
def test_get_photos_for_folder(mock_async_session, mock_url):
    # Arrange
    db_mock = AsyncMock()
    mock_async_session.return_value.__aenter__.return_value = db_mock

    photo_mock = type("Photo", (), {
        "id": 1,
        "classification_result": "malignant",
        "url": "test-path.jpg"
    })()

    scalars_result_mock = MagicMock()
    scalars_result_mock.all.return_value = [photo_mock]

    result_mock = MagicMock()
    result_mock.scalars.return_value = scalars_result_mock

    db_mock.execute.return_value = result_mock

    # Act
    response = client.get("/folders/1/photos")

    # Assert
    assert response.status_code == 200
    photos = response.json()
    assert len(photos) == 1
    assert photos[0]["id"] == 1
    assert photos[0]["classification_result"] == "malignant"
    assert photos[0]["url"] == "http://example.com/test.jpg"

@patch("main.generate_presigned_url", return_value="http://example.com/test.jpg")
@patch("main.async_session")
def test_get_photos_for_folder_empty(mock_async_session, mock_url):
    # Arrange
    db_mock = AsyncMock()
    mock_async_session.return_value.__aenter__.return_value = db_mock

    scalars_result_mock = MagicMock()
    scalars_result_mock.all.return_value = []

    result_mock = MagicMock()
    result_mock.scalars.return_value = scalars_result_mock

    db_mock.execute.return_value = result_mock

    # Act
    response = client.get("/folders/1/photos")

    # Assert
    assert response.status_code == 404
    assert response.json() == {"detail": "No images in this folder"}

@patch("main.async_session")
def test_create_folder(mock_async_session):
    # Arrange
    db_mock = AsyncMock()
    mock_async_session.return_value.__aenter__.return_value = db_mock
    folder_obj = type("Folder", (), {"id": 1, "name": "NewFolder"})()
    db_mock.commit.return_value = None
    db_mock.refresh.return_value = folder_obj

    # Act
    response = client.post(
        "/folders",
        data={"name": "NewFolder", "user_id": "123"}
    )

    # Assert
    assert response.status_code == 200
    assert response.json()["name"] == "NewFolder"

@patch("main.save_file_to_bucket")
@patch("main.async_session")
def test_save_file_success(mock_session, mock_s3):
    # Arrange
    db_mock = AsyncMock()

    result_mock = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = True
    result_mock.scalars.return_value = scalars_mock
    db_mock.execute.return_value = result_mock

    db_mock.add = MagicMock()
    db_mock.commit = AsyncMock()
    db_mock.refresh = AsyncMock()

    mock_session.return_value.__aenter__.return_value = db_mock

    # Act
    response = client.post(
        "/save",
        data={"folder_id": 1, "classification_result": "benign"},
        files={"file": ("test.jpg", b"fake_image_data", "image/jpeg")},
    )

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["classification_result"] == "benign"
    assert data["url"].endswith(".jpg")

@patch("main.async_session")
def test_save_file_invalid_content_type(mock_session):
    # Arrange
    db_mock = AsyncMock()
    mock_session.return_value.__aenter__.return_value = db_mock

    # Act
    response = client.post(
        "/save",
        data={
            "folder_id": 1,
            "classification_result": "benign"
        },
        files={"file": ("test.txt", b"This is a text file", "text/plain")}
    )

    # Assert
    assert response.status_code == 400
    assert response.json()["detail"] == "File must be of image/jpeg type"

@patch("main.save_file_to_bucket")
@patch("main.async_session")
def test_save_file_folder_not_found(mock_session, mock_s3):
    # Arrange
    db_mock = AsyncMock()
    mock_session.return_value.__aenter__.return_value = db_mock

    result_mock = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = False
    result_mock.scalars.return_value = scalars_mock
    db_mock.execute.return_value = result_mock

    db_mock.add = MagicMock()
    db_mock.commit = AsyncMock()
    db_mock.refresh = AsyncMock()

    # Act
    response = client.post(
        "/save",
        data={
            "folder_id": 999,
            "classification_result": "benign"
        },
        files={"file": ("test.jpg", b"fake_image_data", "image/jpeg")}
    )

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Folder does not exist"

@patch("main.save_file_to_bucket")
@patch("main.async_session")
def test_save_file_s3_upload_error(mock_session, mock_s3):
    # Arrange
    db_mock = AsyncMock()
    mock_session.return_value.__aenter__.return_value = db_mock
  
    result_mock = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = True
    result_mock.scalars.return_value = scalars_mock
    db_mock.execute.return_value = result_mock

    db_mock.add = MagicMock()
    db_mock.commit = AsyncMock()
    db_mock.refresh = AsyncMock()

    mock_s3.side_effect = BotoCoreError()

    # Act
    response = client.post(
        "/save",
        data={
            "folder_id": 1,
            "classification_result": "benign"
        },
        files={"file": ("test.jpg", b"fake_image_data", "image/jpeg")}
    )

    # Assert
    assert response.status_code == 500
    assert "Error during uploading to S3" in response.json()["detail"]
