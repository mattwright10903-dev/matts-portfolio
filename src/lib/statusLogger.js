// Simple status logger — sends Discord embeds on startup and errors.
// Reads STATUS_LOG_WEBHOOK_URL from process.env (set in Render).
// Never crashes the app. Never blocks requests.

async function sendDiscordEmbed(embed) {
  const url = process.env.STATUS_LOG_WEBHOOK_URL;
  if (!url) return;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ embeds: [embed] }),
      signal:  controller.signal,
    });
    clearTimeout(timer);
  } catch {
    // Ignore — Discord being down must never crash the site
  }
}

export async function logStartup() {
  await sendDiscordEmbed({
    title:       'Website Online',
    color:       0x2ecc71,
    description: 'Matt Wright Portfolio is online.',
    fields: [
      { name: 'URL',          value: process.env.BASE_URL || 'https://mattwright.online', inline: true },
      { name: 'Environment',  value: process.env.NODE_ENV || 'development',               inline: true },
      { name: 'Node Version', value: process.version,                                     inline: true },
      { name: 'Started At',   value: new Date().toUTCString(),                            inline: true },
      { name: 'Uptime',       value: '0s',                                                inline: true },
      { name: 'Status',       value: 'Online',                                            inline: true },
    ],
    footer:    { text: 'Matt Wright Portfolio' },
    timestamp: new Date().toISOString(),
  });
}

export async function logError(err, req) {
  const route   = req ? `${req.method} ${req.path}`.slice(0, 100) : 'unknown';
  const message = String(err?.message || err).slice(0, 300);

  await sendDiscordEmbed({
    title:  'Website Error',
    color:  0xe74c3c,
    fields: [
      { name: 'Route',  value: route,                       inline: true  },
      { name: 'Method', value: req?.method || '—',          inline: true  },
      { name: 'Error',  value: message,                     inline: false },
      { name: 'Time',   value: new Date().toUTCString(),    inline: true  },
    ],
    footer:    { text: 'Matt Wright Portfolio' },
    timestamp: new Date().toISOString(),
  });
}
