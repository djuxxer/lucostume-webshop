import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'lucostume-secret-change-in-production-2026';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAdmin(req, res, next) {
  const token = req.cookies?.admin_token;
  if (!token) return res.status(401).json({ error: 'Niste prijavljeni.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Sesija je istekla, prijavite se ponovo.' });
  }
}

export { JWT_SECRET };
