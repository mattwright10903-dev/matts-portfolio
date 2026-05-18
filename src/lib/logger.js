// Discord webhook logger — server-side only. URLs never exposed to frontend.

const cooldownMap = new Map();

function isOnCooldown(ip, event, path) {
  const key = `${ip}:${event}:${path}`;
  const last = cooldownMap.get(key);
  const now = Date.now();
  if (last && now - last < 60_000) return true;
  cooldownMap.set(key, now);
  // Prune stale entries to prevent unbounded memory growth
  if (cooldownMap.size > 2000) {
    const cutoff = now - 60_000;
    for (const [k, v] of cooldownMap) {
      if (v < cutoff) cooldownMap.delete(k);
    }
  }
  return false;
}

function truncate(value, max = 200) {
  const s = String(value ?? '').trim();
  if (!s) return '—';
  return s.length > max ? s.slice(0, max) + '…' : s;
}

function getIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return req.ip || 'unknown';
}

function getUa(req) {
  return truncate(req.headers['user-agent'] || 'unknown', 200);
}

function timestamp() {
  return new Date().toUTCString();
}

async function sendWebhook(url, payload) {
  if (!url) return;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch {
    // Never crash the site if Discord is unavailable or env var is missing
  }
}

export async function logAdmin(event, req, extra = {}, opts = {}) {
  const url = process.env.ADMIN_LOG_WEBHOOK_URL;
  if (!url) return;

  const ip = getIp(req);
  if (!opts.bypassCooldown && isOnCooldown(ip, event, req.path || '/')) return;

  const evLower = event.toLowerCase();
  const color =
    evLower.includes('block') || evLower.includes('fail') ? 0xe74c3c
    : evLower.includes('success') || evLower.includes('login success') ? 0x2ecc71
    : evLower.includes('delete') ? 0xe67e22
    : 0x7289da;

  const fields = [
    { name: 'IP',         value: truncate(ip, 80),         inline: true },
    { name: 'Method',     value: truncate(req.method, 10), inline: true },
    { name: 'Path',       value: truncate(req.path, 120),  inline: true },
    { name: 'Time',       value: timestamp(),               inline: true },
    { name: 'User Agent', value: getUa(req),                inline: false },
  ];

  const ref = req.headers.referer || req.headers.referrer;
  if (ref) fields.push({ name: 'Referrer', value: truncate(ref, 200), inline: false });

  for (const [k, v] of Object.entries(extra)) {
    fields.push({ name: truncate(k, 50), value: truncate(String(v), 200), inline: true });
  }

  await sendWebhook(url, {
    embeds: [{
      title: `🔐 Admin — ${event}`,
      color,
      fields,
      timestamp: new Date().toISOString(),
    }],
  });
}

export async function logSite(event, req, extra = {}) {
  const url = process.env.SITE_LOG_WEBHOOK_URL;
  if (!url) return;

  const ip = getIp(req);
  if (isOnCooldown(ip, event, req.path || '/')) return;

  const evLower = event.toLowerCase();
  const color =
    evLower.includes('discord') ? 0x5865f2
    : evLower.includes('fiverr') ? 0x1dbf73
    : evLower.includes('email') ? 0x4285f4
    : 0x2c2f33;

  const fields = [
    { name: 'IP',         value: truncate(ip, 80),        inline: true },
    { name: 'Path',       value: truncate(req.path, 120), inline: true },
    { name: 'Time',       value: timestamp(),              inline: true },
    { name: 'User Agent', value: getUa(req),               inline: false },
  ];

  const ref = req.headers.referer || req.headers.referrer;
  if (ref) fields.push({ name: 'Referrer', value: truncate(ref, 200), inline: false });

  const country = req.headers['cf-ipcountry'] || req.headers['x-country'] || null;
  if (country) fields.push({ name: 'Country', value: truncate(country, 10), inline: true });

  for (const [k, v] of Object.entries(extra)) {
    fields.push({ name: truncate(k, 50), value: truncate(String(v), 200), inline: true });
  }

  await sendWebhook(url, {
    embeds: [{
      title: `🌐 ${event}`,
      color,
      fields,
      timestamp: new Date().toISOString(),
    }],
  });
}
