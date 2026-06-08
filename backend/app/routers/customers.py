from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_business, get_db
from app.models.business import Business
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerResponse, CustomerUpdate

router = APIRouter(prefix="/customers", tags=["customers"])


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


@router.get("", response_model=list[CustomerResponse])
async def list_customers(
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Customer)
        .where(Customer.business_id == business.id)
        .order_by(Customer.name)
    )
    return result.scalars().all()


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    data: CustomerCreate,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    customer = Customer(business_id=business.id, **data.model_dump())
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return customer


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: int,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await _get_customer_for_business(db, customer_id, business.id)


@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: int,
    data: CustomerUpdate,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    customer = await _get_customer_for_business(db, customer_id, business.id)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)

    await db.commit()
    await db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: int,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    customer = await _get_customer_for_business(db, customer_id, business.id)
    await db.delete(customer)
    await db.commit()
