const TELEGRAM_API_BASE = 'https://api.telegram.org';

type InlineKeyboardButton = {
  text: string;
  url?: string;
  callback_data?: string;
};

type InlineKeyboardMarkup = {
  inline_keyboard: InlineKeyboardButton[][];
};

export async function sendMessage(params: {
  botToken: string;
  chatId: number;
  text: string;
  replyMarkup?: InlineKeyboardMarkup;
}): Promise<void> {
  const { botToken, chatId, text, replyMarkup } = params;

  const url = `${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`;

  const body = {
    chat_id: chatId,
    text,
    reply_markup: replyMarkup,
    parse_mode: 'HTML' as const,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('TELEGRAM_SEND_MESSAGE_ERROR', {
        status: res.status,
        body: errorText,
      });
    }
  } catch (err) {
    console.error('TELEGRAM_SEND_MESSAGE_NETWORK_ERROR', String(err));
  }
}

export async function answerCallbackQuery(params: {
  botToken: string;
  callbackQueryId: string;
  text?: string;
  showAlert?: boolean;
}): Promise<void> {
  const { botToken, callbackQueryId, text, showAlert } = params;
  const url = `${TELEGRAM_API_BASE}/bot${botToken}/answerCallbackQuery`;

  const body: Record<string, unknown> = {
    callback_query_id: callbackQueryId,
  };
  if (text) body.text = text;
  if (typeof showAlert === 'boolean') body.show_alert = showAlert;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('TELEGRAM_ANSWER_CALLBACK_ERROR', {
        status: res.status,
        body: errorText,
      });
    }
  } catch (err) {
    console.error('TELEGRAM_ANSWER_CALLBACK_NETWORK_ERROR', String(err));
  }
}

export async function sendMainMenu(params: {
  botToken: string;
  chatId: number;
  courseUrl: string;
}): Promise<void> {
  const { botToken, chatId, courseUrl } = params;

  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [{ text: '📚 Deschide toate lecțiile', url: courseUrl }],
      [{ text: '❓ Suport', callback_data: 'support' }],
    ],
  };

  await sendMessage({
    botToken,
    chatId,
    text:
      'Toate lecțiile cursului RELAȚIA 360 sunt aici, publicate integral.\n' +
      'Apasă butonul de mai jos ca să le deschizi — linkul e public, îl poți accesa oricând.',
    replyMarkup: keyboard,
  });
}


