import asyncio
import logging
import smtplib
from email.message import EmailMessage

from app.config import settings

logger = logging.getLogger(__name__)


def _send_smtp(to_email: str, subject: str, body: str) -> None:
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.SMTP_FROM
    message["To"] = to_email
    message.set_content(body)

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as server:
        if settings.SMTP_USE_TLS:
            server.starttls()
        if settings.SMTP_USER:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(message)


async def send_verification_email(to_email: str, name: str, code: str) -> None:
    subject = "Verify your AI Business Assistant account"
    body = (
        f"Hi {name},\n\n"
        f"Your verification code is: {code}\n\n"
        f"This code expires in {settings.VERIFICATION_CODE_EXPIRE_MINUTES} minutes.\n\n"
        "If you did not create an account, you can ignore this email.\n"
    )

    if not settings.SMTP_HOST:
        logger.warning(
            "SMTP not configured. Verification code for %s: %s",
            to_email,
            code,
        )
        return

    await asyncio.to_thread(_send_smtp, to_email, subject, body)
