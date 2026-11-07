from pydantic import BaseModel, ConfigDict


class CategorySchema(BaseModel):
    id: str
    name: str
    slug: str
    icon: str
    problemCount: int
    description: str

    model_config = ConfigDict(from_attributes=True)
