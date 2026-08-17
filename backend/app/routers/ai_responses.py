import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_current_business, get_db
from app.models.ai_response import AIResponse
from app.models.business import Business
from app.models.enquiry import Enquiry
from app.models.knowledge_base import KnowledgeBase
from app.schemas.ai_response import (
    AIResponseGenerate,
    AIResponseResponse,
    AIResponseStats,
    AIResponseUpdate,
)
from app.services.ai import generate_enquiry_response
from app.services.email import send_customer_response_email

router = APIRouter(tags=["ai-responses"])
logger = logging.getLogger(__name__)


async def _get_enquiry_for_business(
    db: AsyncSession, enquiry_id: int, business_id: int
) -> Enquiry:
    result = await db.execute(
        select(Enquiry)
        .options(selectinload(Enquiry.customer))
        .where(
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


async def _get_response_for_enquiry(
    db: AsyncSession, response_id: int, enquiry_id: int
) -> AIResponse:
    result = await db.execute(
        select(AIResponse).where(
            AIResponse.id == response_id,
            AIResponse.enquiry_id == enquiry_id,
        )
    )
    ai_response = result.scalar_one_or_none()
    if ai_response is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI response not found",
        )
    return ai_response


@router.get("/ai-responses/stats", response_model=AIResponseStats)
async def get_ai_response_stats(
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            func.count(AIResponse.id),
            func.count().filter(AIResponse.approved.is_(True)),
        )
        .select_from(AIResponse)
        .join(Enquiry, AIResponse.enquiry_id == Enquiry.id)
        .where(Enquiry.business_id == business.id)
    )
    total, approved = result.one()
    return AIResponseStats(total=total, approved=approved)


@router.get(
    "/enquiries/{enquiry_id}/ai-responses",
    response_model=list[AIResponseResponse],
)
async def list_ai_responses(
    enquiry_id: int,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    await _get_enquiry_for_business(db, enquiry_id, business.id)

    result = await db.execute(
        select(AIResponse)
        .where(AIResponse.enquiry_id == enquiry_id)
        .order_by(AIResponse.generated_at.desc())
    )
    return result.scalars().all()


@router.post(
    "/enquiries/{enquiry_id}/ai-responses",
    response_model=AIResponseResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_ai_response(
    enquiry_id: int,
    data: AIResponseGenerate = AIResponseGenerate(),
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    enquiry = await _get_enquiry_for_business(db, enquiry_id, business.id)

    kb_result = await db.execute(
        select(KnowledgeBase)
        .where(KnowledgeBase.business_id == business.id)
        .order_by(KnowledgeBase.title)
    )
    knowledge_entries = [
        (entry.title, entry.content) for entry in kb_result.scalars().all()
    ]

    try:
        generated_text = await generate_enquiry_response(
            business_name=business.business_name,
            business_description=business.description,
            customer_name=enquiry.customer.name,
            enquiry_subject=enquiry.subject,
            enquiry_message=enquiry.message,
            knowledge_entries=knowledge_entries,
            tone=data.tone,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to generate AI response: {exc}",
        ) from exc

    ai_response = AIResponse(
        enquiry_id=enquiry.id,
        generated_response=generated_text,
        tone=data.tone,
        approved=False,
    )
    db.add(ai_response)
    await db.commit()
    await db.refresh(ai_response)
    return ai_response


@router.put(
    "/enquiries/{enquiry_id}/ai-responses/{response_id}",
    response_model=AIResponseResponse,
)
async def update_ai_response(
    enquiry_id: int,
    response_id: int,
    data: AIResponseUpdate,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    await _get_enquiry_for_business(db, enquiry_id, business.id)
    ai_response = await _get_response_for_enquiry(db, response_id, enquiry_id)

    if ai_response.sent_at is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A sent response cannot be changed",
        )

    updates = data.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    for field, value in updates.items():
        setattr(ai_response, field, value)

    await db.commit()
    await db.refresh(ai_response)
    return ai_response


@router.post(
    "/enquiries/{enquiry_id}/ai-responses/{response_id}/send",
    response_model=AIResponseResponse,
)
async def send_ai_response(
    enquiry_id: int,
    response_id: int,
    business: Business = Depends(get_current_business),
    db: AsyncSession = Depends(get_db),
):
    enquiry = await _get_enquiry_for_business(db, enquiry_id, business.id)
    ai_response = await _get_response_for_enquiry(db, response_id, enquiry_id)

    if not ai_response.approved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Approve the response before sending it",
        )
    if ai_response.sent_at is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This response has already been sent",
        )
    if not enquiry.customer.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The customer does not have an email address",
        )

    try:
        await send_customer_response_email(
            to_email=enquiry.customer.email,
            enquiry_subject=enquiry.subject,
            response_body=ai_response.generated_response,
        )
    except Exception as exc:
        logger.exception(
            "Failed to send AI response %s to customer", ai_response.id
        )
        detail = (
            "Email delivery is not configured"
            if str(exc) == "SMTP is not configured"
            else "Email delivery failed. Check the SMTP configuration and try again."
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=detail,
        ) from exc

    ai_response.sent_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(ai_response)
    return ai_response
