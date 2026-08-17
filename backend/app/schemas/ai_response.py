from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AIResponseGenerate(BaseModel):
    tone: str | None = Field(default=None, max_length=50)


class AIResponseUpdate(BaseModel):
    generated_response: str | None = Field(default=None, min_length=1)
    approved: bool | None = None
    tone: str | None = Field(default=None, max_length=50)


class AIResponseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    enquiry_id: int
    generated_response: str
    tone: str | None
    approved: bool
    generated_at: datetime
    sent_at: datetime | None
    updated_at: datetime


class AIResponseStats(BaseModel):
    approved: int
    total: int
