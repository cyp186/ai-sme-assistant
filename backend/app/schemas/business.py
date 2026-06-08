from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BusinessCreate(BaseModel):
    business_name: str = Field(min_length=1, max_length=255)
    industry: str | None = Field(default=None, max_length=255)
    contact_email: str | None = Field(default=None, max_length=255)
    description: str | None = None


class BusinessUpdate(BaseModel):
    business_name: str | None = Field(default=None, min_length=1, max_length=255)
    industry: str | None = Field(default=None, max_length=255)
    contact_email: str | None = Field(default=None, max_length=255)
    description: str | None = None


class BusinessResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    business_name: str
    industry: str | None
    contact_email: str | None
    description: str | None
    created_at: datetime
    updated_at: datetime
