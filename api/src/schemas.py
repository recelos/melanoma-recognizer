from pydantic import BaseModel

class FolderSchema(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class PhotoSchema(BaseModel):
    id: int
    classification_result: str
    url: str

    class Config:
        orm_mode = True