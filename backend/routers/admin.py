from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from collections import Counter

from database import get_db
from models.schemas import AffiliateClick, User
from schemas.product import AffiliateClickResponse, AffiliateStatsResponse
from auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])

ADMIN_EMAIL = "admin@demo.com"


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.email != ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu alana erişim yetkiniz yok.",
        )
    return current_user


@router.get("/clicks", response_model=AffiliateStatsResponse)
async def get_affiliate_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Tüm 'Satın Al' tıklamalarını ve platform bazlı istatistikleri döner"""
    clicks = (
        db.query(AffiliateClick)
        .order_by(AffiliateClick.clicked_at.desc())
        .all()
    )

    platform_counts = Counter(c.platform or "Bilinmiyor" for c in clicks)

    return AffiliateStatsResponse(
        total_clicks=len(clicks),
        by_platform=dict(platform_counts),
        recent_clicks=[AffiliateClickResponse.model_validate(c) for c in clicks[:100]],
    )


@router.get("/clicks/list", response_model=list[AffiliateClickResponse])
async def list_affiliate_clicks(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Sayfalanmış tıklama listesi"""
    clicks = (
        db.query(AffiliateClick)
        .order_by(AffiliateClick.clicked_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [AffiliateClickResponse.model_validate(c) for c in clicks]
