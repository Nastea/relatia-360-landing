import { NextResponse } from 'next/server';
import { verifyAccessTokenAndBind } from '@/lib/telegramVerify';

/**
 * GET /api/telegram/verify
 *
 * Query params:
 * - token: access_token returned after payment
 * - telegramUserId: Telegram numeric user ID
 * - username: optional Telegram username
 *
 * Returns:
 * - { ok: true, productId }
 * - { ok: false, reason }
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const telegramUserIdRaw = searchParams.get('telegramUserId');
    const username = searchParams.get('username');

    if (!token) {
      return NextResponse.json(
        { ok: false, reason: 'BAD_FORMAT', error: 'Missing token parameter' },
        { status: 400 }
      );
    }

    if (!telegramUserIdRaw) {
      return NextResponse.json(
        {
          ok: false,
          reason: 'BAD_FORMAT',
          error: 'Missing telegramUserId parameter',
        },
        { status: 400 }
      );
    }

    const telegramUserId = Number(telegramUserIdRaw);
    if (!Number.isFinite(telegramUserId) || telegramUserId <= 0) {
      return NextResponse.json(
        {
          ok: false,
          reason: 'BAD_FORMAT',
          error: 'Invalid telegramUserId parameter',
        },
        { status: 400 }
      );
    }

    const result = await verifyAccessTokenAndBind({
      token,
      telegramUserId,
      username: username ?? null,
    });

    if (result.ok) {
      return NextResponse.json({
        ok: true,
        productId: result.productId,
      });
    }

    // Map reasons to HTTP status for debugging (Telegram will usually ignore status)
    let status = 400;
    switch (result.reason) {
      case 'NOT_FOUND':
      case 'TOKEN_USED_BY_OTHER':
        status = 404;
        break;
      case 'NOT_PAID':
        status = 403;
        break;
      case 'BLOCKED':
      case 'RATE_LIMIT':
        status = 429;
        break;
      case 'INTERNAL_ERROR':
        status = 500;
        break;
      case 'BAD_FORMAT':
      default:
        status = 400;
        break;
    }

    return NextResponse.json(
      {
        ok: false,
        reason: result.reason,
      },
      { status }
    );
  } catch (error) {
    console.error('TELEGRAM_VERIFY_ROUTE_ERROR', String(error));
    return NextResponse.json(
      {
        ok: false,
        reason: 'INTERNAL_ERROR',
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

