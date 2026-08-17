from openai import AsyncOpenAI

from app.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

DEFAULT_MODEL = "gpt-4o-mini"

TONE_GUIDANCE = {
    "professional": "Use a professional, courteous tone.",
    "friendly": "Use a warm, friendly, approachable tone.",
    "concise": "Be brief and to the point while remaining helpful.",
}


def _build_system_prompt(
    business_name: str,
    business_description: str | None,
    tone: str | None,
) -> str:
    tone_line = TONE_GUIDANCE.get(tone or "", "")
    if tone and tone not in TONE_GUIDANCE:
        tone_line = f"Use a {tone} tone."

    description = business_description or "No additional description provided."

    parts = [
        f"You are a customer support assistant for {business_name}.",
        f"Business context: {description}",
        "Draft a reply to the customer's enquiry using only the knowledge base provided.",
        "If the knowledge base does not contain enough information, say what you can "
        "confirm and politely ask for any details needed to help further.",
        "Do not invent prices, policies, or availability that are not in the knowledge base.",
        "Write only the reply body — no subject line or sign-off placeholders like [Your Name].",
    ]
    if tone_line:
        parts.append(tone_line)

    return " ".join(parts)


def _build_user_prompt(
    customer_name: str,
    subject: str,
    message: str,
    knowledge_entries: list[tuple[str, str]],
) -> str:
    if knowledge_entries:
        kb_block = "\n\n".join(
            f"### {title}\n{content}" for title, content in knowledge_entries
        )
        knowledge_section = f"Knowledge base:\n\n{kb_block}"
    else:
        knowledge_section = (
            "Knowledge base: (empty — rely only on general courtesy; "
            "do not make specific claims about products or policies.)"
        )

    return (
        f"Customer: {customer_name}\n"
        f"Subject: {subject}\n"
        f"Message:\n{message}\n\n"
        f"{knowledge_section}"
    )


async def generate_enquiry_response(
    *,
    business_name: str,
    business_description: str | None,
    customer_name: str,
    enquiry_subject: str,
    enquiry_message: str,
    knowledge_entries: list[tuple[str, str]],
    tone: str | None = None,
) -> str:
    response = await client.chat.completions.create(
        model=DEFAULT_MODEL,
        messages=[
            {
                "role": "system",
                "content": _build_system_prompt(
                    business_name, business_description, tone
                ),
            },
            {
                "role": "user",
                "content": _build_user_prompt(
                    customer_name,
                    enquiry_subject,
                    enquiry_message,
                    knowledge_entries,
                ),
            },
        ],
        temperature=0.7,
    )

    content = response.choices[0].message.content
    if not content:
        raise ValueError("OpenAI returned an empty response")

    return content.strip()
