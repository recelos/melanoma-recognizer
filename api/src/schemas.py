from pydantic import BaseModel

class FolderSchema(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True