from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EnquiryCreate(BaseModel):
    customer_id: int
    subject: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1)
    category: str | None = Field(default=None, max_length=100)
    status: str = Field(default="pending", max_length=50)


class EnquiryUpdate(BaseModel):
    subject: str | None = Field(default=None, min_length=1, max_length=255)
    message: str | None = Field(default=None, min_length=1)
    category: str | None = Field(default=None, max_length=100)
    status: str | None = Field(default=None, max_length=50)


class EnquiryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    business_id: int
    customer_id: int
    subject: str
    message: str
    category: str | None
    status: str
    received_at: datetime
    updated_at: datetime
