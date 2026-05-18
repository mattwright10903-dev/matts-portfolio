import { logAdmin } from './logger.js';

function getAllowedIps() {
  const raw = process.env.ADMIN_ALLOWED_IPS || '';
  return raw.split(',').map((ip) => ip.trim()).filter(Boolean);
}

function getIp(req) {
  // app.set('trust proxy', 1) is set, so req.ip is already the real client IP on Render.
  // X-Forwarded-For checked as fallback for edge cases.
  const xff = req.headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return req.ip || '';
}

export function adminGuard(req, res, next) {
  // If ADMIN_ALLOWED_IPS is not configured, guard is inactive (won't lock you out on first deploy)
  if (!process.env.ADMIN_ALLOWED_IPS) return next();

  // Already authenticated via session — skip IP re-check
  if (req.session?.isAdmin) return next();

  const ip         = getIp(req);
  const allowedIps = getAllowedIps();

  if (allowedIps.includes(ip)) return next();

  // Blocked
  logAdmin('Admin Access Blocked', req, { 'Blocked IP': ip }).catch(() => {});

  return res.status(403).render('error', {
    user:        null,
    isAdmin:     false,
    adminEmail:  process.env.ADMIN_EMAIL || '',
    baseUrl:     (process.env.BASE_URL || '').replace(/\/$/, ''),
    currentPath: req.path,
    page:        '',
    content:     {},
    message:     'Admin access restricted.',
  });
}
