import { NextResponse } from 'next/server';

/**
 * GET /api/config
 * Returns public configuration values (non-sensitive)
 * Used by client-side to get Telegram bot username
 */
export async function GET() {
  return NextResponse.json({
    telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME || 'Relatia360Bot',
  });
}

