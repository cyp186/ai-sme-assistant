from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    pass


def get_async_engine_url_and_connect_args(database_url: str) -> tuple[str, dict]:
    """Strip query params asyncpg rejects; map sslmode to connect_args."""
    parsed = urlparse(database_url)
    query_params = dict(parse_qsl(parsed.query))
    connect_args: dict = {}

    sslmode = query_params.pop("sslmode", None)
    query_params.pop("channelBinding", None)

    if sslmode == "require" or (parsed.hostname and "neon.tech" in parsed.hostname):
        connect_args["ssl"] = "require"

    clean_query = urlencode(query_params)
    clean_url = urlunparse(parsed._replace(query=clean_query))
    return clean_url, connect_args


_db_url, _connect_args = get_async_engine_url_and_connect_args(settings.DATABASE_URL)

engine = create_async_engine(
    _db_url,
    echo=True,
    connect_args=_connect_args,
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)
