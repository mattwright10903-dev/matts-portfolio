// Status and uptime logging — server-side only, URL never exposed to browser.

const state = {
  serverStartedAt:   Date.now(),
  lastHealthCheckAt: null,
  lastErrorAt:       null,
  requestCount:      0,
  status:            'online',
};

const cooldownMap = new Map();

function isOnCooldown(key, ms) {
  const last = cooldownMap.get(key);
  const now  = Date.now();
  if (last && now - last < ms) return true;
  cooldownMap.set(key, now);
  return false;
}

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts = [];
  if (d > 0)  parts.push(`${d}d`);
  if (h > 0)  parts.push(`${h}h`);
  if (m > 0)  parts.push(`${m}m`);
  parts.push(`${sec}s`);
  return parts.join(' ');
}

function getMemoryMb() {
  const mem = process.memoryUsage();
  return `${Math.round(mem.rss / 1024 / 1024)} MB RSS`;
}

function getIp(req) {
  const xff = req?.headers?.['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return req?.ip || 'unknown';
}

function truncate(value, max = 200) {
  const s = String(value ?? '').trim();
  if (!s) return '—';
  return s.length > max ? s.slice(0, max) + '…' : s;
}

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
    // Never crash the site if Discord is unavailable or the URL is wrong
  }
}

// ── Public helpers ──────────────────────────────────────────────────────────

export function incrementRequestCount() {
  state.requestCount++;
}

export function getStatus() {
  const uptimeMs = Date.now() - state.serverStartedAt;
  return {
    status:            state.status,
    site:              'Matt Wright Portfolio',
    url:               process.env.BASE_URL || 'https://mattwright.online',
    environment:       process.env.NODE_ENV || 'development',
    version:           process.version,
    uptime:            formatUptime(uptimeMs),
    uptimeMs,
    startedAt:         new Date(state.serverStartedAt).toISOString(),
    lastHealthCheckAt: state.lastHealthCheckAt,
    lastErrorAt:       state.lastErrorAt,
    requestCount:      state.requestCount,
    memory:            getMemoryMb(),
    timestamp:         new Date().toISOString(),
  };
}

// ── Discord log functions ───────────────────────────────────────────────────

export async function logStartup() {
  const uptimeMs = Date.now() - state.serverStartedAt;
  await sendDiscordEmbed({
    title:  '✅ Website Online',
    color:  0x2ecc71,
    fields: [
      { name: 'Site',         value: 'Matt Wright Portfolio',                     inline: true  },
      { name: 'Status',       value: 'Online',                                     inline: true  },
      { name: 'Environment',  value: process.env.NODE_ENV || 'development',        inline: true  },
      { name: 'URL',          value: process.env.BASE_URL || 'https://mattwright.online', inline: true },
      { name: 'Node Version', value: process.version,                              inline: true  },
      { name: 'Memory',       value: getMemoryMb(),                                inline: true  },
      { name: 'Uptime',       value: formatUptime(uptimeMs),                       inline: true  },
      { name: 'Started At',   value: new Date().toUTCString(),                     inline: false },
    ],
    footer:    { text: 'Matt Wright Portfolio Monitor' },
    timestamp: new Date().toISOString(),
  });
}

export async function logError(err, req) {
  const route   = req ? truncate(`${req.method} ${req.path}`, 100) : 'unknown';
  const message = truncate(err?.message || String(err), 300);

  // Cooldown: same route + error message at most once per 60 seconds
  if (isOnCooldown(`error:${route}:${message.slice(0, 80)}`, 60_000)) return;

  state.lastErrorAt = new Date().toISOString();

  const fields = [
    { name: 'Status', value: 'Error', inline: true },
  ];
  if (req) {
    fields.push({ name: 'Method',     value: truncate(req.method, 10),                     inline: true  });
    fields.push({ name: 'Route',      value: truncate(req.path, 120),                      inline: true  });
    fields.push({ name: 'IP',         value: truncate(getIp(req), 80),                     inline: true  });
    fields.push({ name: 'User Agent', value: truncate(req.headers?.['user-agent'], 200),   inline: false });
  }
  fields.push({ name: 'Error', value: message, inline: false });
  fields.push({ name: 'Time',  value: new Date().toUTCString(),  inline: true });

  await sendDiscordEmbed({
    title:     '🔴 Website Error',
    color:     0xe74c3c,
    fields,
    footer:    { text: 'Matt Wright Portfolio Monitor' },
    timestamp: new Date().toISOString(),
  });
}

export async function logHealthPing(req) {
  // Cooldown: max one Discord ping every 5 minutes from /status-ping?log=true
  if (isOnCooldown('health-ping', 5 * 60_000)) return;

  state.lastHealthCheckAt = new Date().toISOString();
  const uptimeMs = Date.now() - state.serverStartedAt;

  await sendDiscordEmbed({
    title:  '📡 Health Check',
    color:  0x5865f2,
    fields: [
      { name: 'Status',      value: 'Online',                                              inline: true  },
      { name: 'Site',        value: 'Matt Wright Portfolio',                                inline: true  },
      { name: 'Environment', value: process.env.NODE_ENV || 'development',                 inline: true  },
      { name: 'Uptime',      value: formatUptime(uptimeMs),                                inline: true  },
      { name: 'Memory',      value: getMemoryMb(),                                         inline: true  },
      { name: 'Requests',    value: String(state.requestCount),                            inline: true  },
      { name: 'Pinged From', value: req ? truncate(getIp(req), 80) : '—',                 inline: true  },
      { name: 'Time',        value: new Date().toUTCString(),                              inline: false },
    ],
    footer:    { text: 'Matt Wright Portfolio Monitor' },
    timestamp: new Date().toISOString(),
  });
}
