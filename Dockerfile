FROM python:3.11

WORKDIR /api

COPY ./requirements.txt /api/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /api/requirements.txt

COPY ./api/src/ /api/src/
EXPOSE 8000
CMD ["fastapi", "run", "/api/src/main.py", "--port", "8000"]