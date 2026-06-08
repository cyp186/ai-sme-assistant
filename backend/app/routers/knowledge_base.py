from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_business, get_db
from app.models.business import Business
from app.models.knowledge_base import KnowledgeBase
from app.schemas.knowledge_base import (
    KnowledgeBaseCreate,
    KnowledgeBaseResponse,
    KnowledgeBaseUpdate,
)

router = APIRouter(prefix="/knowledge-base", tags=["knowledge-base"])


async def _get_entry_for_business(
    db: AsyncSession, entry_id: int, business_id: int
) -> KnowledgeBase:
    result = await db.execute(
        select(KnowledgeBase).where(
            KnowledgeBase.id == entry_id,
            KnowledgeBase.business_id == business_id,
        )
    )
    entry = result.scalar_one_or_none()
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base entry not found",
        )
    return entry


@router.get("", response_model=list[KnowledgeBaseResponse])
async def list_knowledge_entries(
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgeBase)
        .where(KnowledgeBase.business_id == business.id)
        .order_by(KnowledgeBase.title)
    )
    return result.scalars().all()


@router.post("", response_model=KnowledgeBaseResponse, status_code=status.HTTP_201_CREATED)
async def create_knowledge_entry(
    data: KnowledgeBaseCreate,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    entry = KnowledgeBase(business_id=business.id, **data.model_dump())
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.get("/{entry_id}", response_model=KnowledgeBaseResponse)
async def get_knowledge_entry(
    entry_id: int,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    return await _get_entry_for_business(db, entry_id, business.id)


@router.put("/{entry_id}", response_model=KnowledgeBaseResponse)
async def update_knowledge_entry(
    entry_id: int,
    data: KnowledgeBaseUpdate,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    entry = await _get_entry_for_business(db, entry_id, business.id)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)

    await db.commit()
    await db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_knowledge_entry(
    entry_id: int,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    entry = await _get_entry_for_business(db, entry_id, business.id)
    await db.delete(entry)
    await db.commit()
