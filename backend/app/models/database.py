from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


class Base(DeclarativeBase):
    pass


# Create engine - supports both SQLite and PostgreSQL
def create_engine():
    db_url = settings.database_url
    
    if "sqlite" in db_url:
        engine = create_async_engine(
            db_url,
            echo=settings.debug,
            connect_args={"check_same_thread": False},
        )
    else:
        engine = create_async_engine(
            db_url,
            echo=settings.debug,
            pool_size=10,
            max_overflow=20,
        )
    return engine


engine = create_engine()
AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def get_db():
    """Dependency: yield a DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Create all tables on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database tables created/verified")
