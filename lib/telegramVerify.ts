import { supabaseAdmin } from './supabaseAdmin';
import { sha256Hex } from './token';

export type VerifyResultReason =
  | 'NOT_FOUND'
  | 'NOT_PAID'
  | 'TOKEN_USED_BY_OTHER'
  | 'BAD_FORMAT'
  | 'BLOCKED'
  | 'RATE_LIMIT'
  | 'INTERNAL_ERROR';

export type VerifyResult =
  | { ok: true; productId: string }
  | { ok: false; reason: VerifyResultReason };

type VerifyParams = {
  token: string;
  telegramUserId: number;
  username?: string | null;
};

const TEN_MINUTES_MS = 10 * 60 * 1000;

export async function verifyAccessTokenAndBind(
  params: VerifyParams,
): Promise<VerifyResult> {
  const { token, telegramUserId, username } = params;

  const trimmed = token.trim();
  if (!trimmed || trimmed.length < 16) {
    await logAttempt(telegramUserId, false, 'BAD_FORMAT');
    return { ok: false, reason: 'BAD_FORMAT' };
  }

  const now = new Date();
  const cutoff = new Date(now.getTime() - TEN_MINUTES_MS).toISOString();

  // Check if user is already blocked
  const { data: userRow, error: userError } = await supabaseAdmin
    .from('telegram_users')
    .select('telegram_user_id, state, blocked_until')
    .eq('telegram_user_id', telegramUserId)
    .maybeSingle();

  if (userError) {
    console.error('TELEGRAM_VERIFY_USER_FETCH_ERROR', userError);
  }

  if (userRow?.state === 'BLOCKED' && userRow.blocked_until) {
    const blockedUntil = new Date(userRow.blocked_until);
    if (blockedUntil > now) {
      await logAttempt(telegramUserId, false, 'BLOCKED');
      return { ok: false, reason: 'BLOCKED' };
    }
  }

  // Rate limiting: last 10 minutes, max 5 attempts
  const { data: attempts, error: attemptsError } = await supabaseAdmin
    .from('telegram_token_attempts')
    .select('id, success, attempted_at')
    .eq('telegram_user_id', telegramUserId)
    .gte('attempted_at', cutoff);

  if (attemptsError) {
    console.error('TELEGRAM_VERIFY_ATTEMPTS_ERROR', attemptsError);
  }

  const recentAttemptsCount = attempts?.length ?? 0;
  if (recentAttemptsCount >= 5) {
    // Block user for 10 minutes
    const blockedUntil = new Date(now.getTime() + TEN_MINUTES_MS).toISOString();
    const { error: blockError } = await supabaseAdmin
      .from('telegram_users')
      .upsert(
        {
          telegram_user_id: telegramUserId,
          state: 'BLOCKED',
          blocked_until: blockedUntil,
          last_seen_at: now.toISOString(),
        },
        { onConflict: 'telegram_user_id' },
      );
    if (blockError) {
      console.error('TELEGRAM_VERIFY_BLOCK_ERROR', blockError);
    }

    await logAttempt(telegramUserId, false, 'RATE_LIMIT');
    return { ok: false, reason: 'RATE_LIMIT' };
  }

  // Fetch order by access_token
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select(
      'id, product_id, status, access_token, telegram_user_id, telegram_username',
    )
    .eq('access_token', trimmed)
    .maybeSingle();

  if (orderError) {
    console.error('TELEGRAM_VERIFY_ORDER_ERROR', orderError);
    await logAttempt(telegramUserId, false, 'INTERNAL_ERROR');
    return { ok: false, reason: 'INTERNAL_ERROR' };
  }

  if (!order) {
    await logAttempt(telegramUserId, false, 'NOT_FOUND');
    return { ok: false, reason: 'NOT_FOUND' };
  }

  if (order.status !== 'paid') {
    await logAttempt(telegramUserId, false, 'NOT_PAID');
    return { ok: false, reason: 'NOT_PAID' };
  }

  // Bind token to first Telegram user
  if (order.telegram_user_id == null) {
    const { error: bindError } = await supabaseAdmin
      .from('orders')
      .update({
        telegram_user_id: telegramUserId,
        telegram_username: username ?? order.telegram_username ?? null,
        access_used_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', order.id);

    if (bindError) {
      console.error('TELEGRAM_VERIFY_BIND_ERROR', bindError);
      await logAttempt(telegramUserId, false, 'INTERNAL_ERROR');
      return { ok: false, reason: 'INTERNAL_ERROR' };
    }
  } else if (order.telegram_user_id !== telegramUserId) {
    // Token already bound to another user
    await logAttempt(telegramUserId, false, 'TOKEN_USED_BY_OTHER');
    return { ok: false, reason: 'TOKEN_USED_BY_OTHER' };
  }

  // At this point, token is valid and bound to this user
  const tokenHash = sha256Hex(trimmed);

  // Upsert into telegram_access
  const { error: accessError } = await supabaseAdmin
    .from('telegram_access')
    .upsert(
      {
        telegram_user_id: telegramUserId,
        product_id: order.product_id,
        access_granted_at: now.toISOString(),
        revoked_at: null,
        source_token_hash: tokenHash,
      },
      { onConflict: 'telegram_user_id,product_id' },
    );

  if (accessError) {
    console.error('TELEGRAM_VERIFY_ACCESS_UPSERT_ERROR', accessError);
    await logAttempt(telegramUserId, false, 'INTERNAL_ERROR');
    return { ok: false, reason: 'INTERNAL_ERROR' };
  }

  // Mark user as ACTIVE
  const { error: userUpsertError } = await supabaseAdmin
    .from('telegram_users')
    .upsert(
      {
        telegram_user_id: telegramUserId,
        username: username ?? null,
        state: 'ACTIVE',
        blocked_until: null,
        last_seen_at: now.toISOString(),
      },
      { onConflict: 'telegram_user_id' },
    );

  if (userUpsertError) {
    console.error('TELEGRAM_VERIFY_USER_UPSERT_ERROR', userUpsertError);
  }

  await logAttempt(telegramUserId, true, 'OK');

  return { ok: true, productId: order.product_id };
}

async function logAttempt(
  telegramUserId: number,
  success: boolean,
  reason: string,
): Promise<void> {
  try {
    await supabaseAdmin.from('telegram_token_attempts').insert({
      telegram_user_id: telegramUserId,
      success,
      reason,
    });
  } catch (err) {
    console.error('TELEGRAM_VERIFY_LOG_ATTEMPT_ERROR', String(err));
  }
}


