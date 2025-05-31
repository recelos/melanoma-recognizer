FROM python:3.11

WORKDIR /api

COPY ./requirements.txt /api/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /api/requirements.txt

COPY ./api/src/ /api/src/
EXPOSE 8000

ARG S3_BUCKET_NAME
ARG S3_ENDPOINT_URL
ARG S3_ACCESS_KEY
ARG S3_SECRET_KEY
ARG S3_REGION

ENV S3_BUCKET_NAME=$S3_BUCKET_NAME
ENV S3_ENDPOINT_URL=$S3_ENDPOINT_URL
ENV S3_ACCESS_KEY=$S3_ACCESS_KEY
ENV S3_SECRET_KEY=$S3_SECRET_KEY
ENV S3_REGION=$S3_REGION

CMD ["fastapi", "run", "/api/src/main.py", "--port", "8000"]