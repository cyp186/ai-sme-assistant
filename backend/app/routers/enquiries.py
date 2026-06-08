from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_business, get_db
from app.models.business import Business
from app.models.customer import Customer
from app.models.enquiry import Enquiry
from app.schemas.enquiry import EnquiryCreate, EnquiryResponse, EnquiryUpdate

router = APIRouter(prefix="/enquiries", tags=["enquiries"])


async def _get_enquiry_for_business(
    db: AsyncSession, enquiry_id: int, business_id: int
) -> Enquiry:
    result = await db.execute(
        select(Enquiry).where(
            Enquiry.id == enquiry_id,
            Enquiry.business_id == business_id,
        )
    )
    enquiry = result.scalar_one_or_none()
    if enquiry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enquiry not found",
        )
    return enquiry


async def _get_customer_for_business(
    db: AsyncSession, customer_id: int, business_id: int
) -> Customer:
    result = await db.execute(
        select(Customer).where(
            Customer.id == customer_id,
            Customer.business_id == business_id,
        )
    )
    customer = result.scalar_one_or_none()
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )
    return customer


@router.get("", response_model=list[EnquiryResponse])
async def list_enquiries(
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Enquiry)
        .where(Enquiry.business_id == business.id)
        .order_by(Enquiry.received_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=EnquiryResponse, status_code=status.HTTP_201_CREATED)
async def create_enquiry(
    data: EnquiryCreate,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    await _get_customer_for_business(db, data.customer_id, business.id)

    enquiry = Enquiry(business_id=business.id, **data.model_dump())
    db.add(enquiry)
    await db.commit()
    await db.refresh(enquiry)
    return enquiry


@router.get("/{enquiry_id}", response_model=EnquiryResponse)
async def get_enquiry(
    enquiry_id: int,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await _get_enquiry_for_business(db, enquiry_id, business.id)


@router.put("/{enquiry_id}", response_model=EnquiryResponse)
async def update_enquiry(
    enquiry_id: int,
    data: EnquiryUpdate,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    enquiry = await _get_enquiry_for_business(db, enquiry_id, business.id)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(enquiry, field, value)

    await db.commit()
    await db.refresh(enquiry)
    return enquiry


@router.delete("/{enquiry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_enquiry(
    enquiry_id: int,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    enquiry = await _get_enquiry_for_business(db, enquiry_id, business.id)
    await db.delete(enquiry)
    await db.commit()
