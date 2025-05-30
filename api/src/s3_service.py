import boto3
from botocore.exceptions import ClientError
from botocore.config import Config
import os
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()

S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY")
S3_REGION = os.getenv("S3_REGION")

s3_client = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT_URL,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
    region_name=S3_REGION,
    config=Config(request_checksum_calculation="when_required", response_checksum_validation="when_required")
)

def generate_presigned_url(object_name: str, expiration: int = 3600) -> str:
    try:
        response = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET_NAME, 'Key': object_name},
            ExpiresIn=expiration
        )
    except ClientError as e:
        print(f"Error generating URL: {e}")
        return ""
    return response

def save_file_to_bucket(file_content: bytes, unique_filename: str):
    s3_client.upload_fileobj(
        Fileobj=BytesIO(file_content),
        Bucket=S3_BUCKET_NAME,
        Key=unique_filename,
        ExtraArgs={'ContentType': 'image/jpeg'}
    )
