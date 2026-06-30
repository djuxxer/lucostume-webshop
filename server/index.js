import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from './db.js';
import { signToken, requireAdmin } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(PUBLIC_DIR));

// ---------- Helpers ----------
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/đ/g, 'dj')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getSetting(key, fallback = '') {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

function setSetting(key, value) {
  const exists = db.prepare('SELECT key FROM settings WHERE key = ?').get(key);
  if (exists) {
    db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(String(value), key);
  } else {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, String(value));
  }
}

function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LU-${y}${m}${d}-${rand}`;
}

// ---------- Multer (image uploads) ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'].includes(ext) ? ext : '.jpg';
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|avif|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Samo slike su dozvoljene (jpg, png, webp, avif, gif).'));
  },
});

// =========================================================
// PUBLIC API
// =========================================================

// --- Products (public, only active) ---
app.get('/api/products', (req, res) => {
  const rows = db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY sort_order ASC, id DESC').all();
  const products = rows.map((p) => ({ ...p, images: JSON.parse(p.images || '[]') }));
  res.json(products);
});

app.get('/api/products/:slug', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE slug = ? AND active = 1').get(req.params.slug);
  if (!p) return res.status(404).json({ error: 'Proizvod nije pronađen.' });
  res.json({ ...p, images: JSON.parse(p.images || '[]') });
});

// --- Hero slides (public, only active) ---
app.get('/api/hero', (req, res) => {
  const rows = db.prepare('SELECT * FROM hero_slides WHERE active = 1 ORDER BY sort_order ASC, id ASC').all();
  res.json(rows);
});

// --- Public settings (shipping info etc, safe subset) ---
app.get('/api/settings/public', (req, res) => {
  res.json({
    shipping_cost: Number(getSetting('shipping_cost', '350')),
    free_shipping_threshold: Number(getSetting('free_shipping_threshold', '15000')),
    shop_name: getSetting('shop_name', 'LU Costume'),
    shop_email: getSetting('shop_email', ''),
    shop_phone: getSetting('shop_phone', ''),
  });
});

// --- Create order (checkout) ---
app.post('/api/orders', (req, res) => {
  const { customer_name, phone, email, address, city, postal_code, note, items } = req.body;

  if (!customer_name || !phone || !address || !city) {
    return res.status(400).json({ error: 'Popunite sva obavezna polja (ime, telefon, adresa, grad).' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Korpa je prazna.' });
  }

  // Recompute prices server-side from DB (never trust client prices)
  let subtotal = 0;
  const validatedItems = [];
  for (const item of items) {
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(item.id);
    if (!product) continue;
    const qty = Math.max(1, Math.min(20, parseInt(item.qty) || 1));
    subtotal += product.price * qty;
    validatedItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty,
      size: item.size || '',
    });
  }

  if (validatedItems.length === 0) {
    return res.status(400).json({ error: 'Nijedan proizvod iz korpe nije validan.' });
  }

  const freeThreshold = Number(getSetting('free_shipping_threshold', '15000'));
  const baseShipping = Number(getSetting('shipping_cost', '350'));
  const shipping_cost = subtotal >= freeThreshold ? 0 : baseShipping;
  const total = subtotal + shipping_cost;
  const order_number = generateOrderNumber();

  db.prepare(`
    INSERT INTO orders (order_number, customer_name, phone, email, address, city, postal_code, note, items, subtotal, shipping_cost, total, payment_method, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pouzece', 'novo')
  `).run(
    order_number,
    customer_name,
    phone,
    email || '',
    address,
    city,
    postal_code || '',
    note || '',
    JSON.stringify(validatedItems),
    subtotal,
    shipping_cost,
    total
  );

  res.json({ success: true, order_number, subtotal, shipping_cost, total });
});

// =========================================================
// ADMIN AUTH
// =========================================================

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password || '', admin.password_hash)) {
    return res.status(401).json({ error: 'Pogrešno korisničko ime ili lozinka.' });
  }
  const token = signToken({ id: admin.id, username: admin.username });
  res.cookie('admin_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ success: true, username: admin.username });
});

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({ username: req.admin.username });
});

app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  const { current_password, new_password } = req.body;
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.admin.id);
  if (!bcrypt.compareSync(current_password || '', admin.password_hash)) {
    return res.status(401).json({ error: 'Trenutna lozinka nije ispravna.' });
  }
  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'Nova lozinka mora imati bar 6 karaktera.' });
  }
  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(hash, req.admin.id);
  res.json({ success: true });
});

// =========================================================
// ADMIN: PRODUCTS (protected)
// =========================================================

app.get('/api/admin/products', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY sort_order ASC, id DESC').all();
  res.json(rows.map((p) => ({ ...p, images: JSON.parse(p.images || '[]') })));
});

app.get('/api/admin/products/:id', requireAdmin, (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Proizvod nije pronađen.' });
  res.json({ ...p, images: JSON.parse(p.images || '[]') });
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  const { name, description, price, sizes, stock, category, image, images, active, sort_order } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Naziv i cena su obavezni.' });
  }
  let slug = slugify(name);
  const slugExists = db.prepare('SELECT id FROM products WHERE slug = ?').get(slug);
  if (slugExists) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  const result = db.prepare(`
    INSERT INTO products (name, slug, description, price, sizes, stock, category, image, images, active, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    slug,
    description || '',
    parseInt(price) || 0,
    sizes || '',
    stock !== undefined ? parseInt(stock) : 100,
    category || '',
    image || '',
    JSON.stringify(images || []),
    active !== undefined ? (active ? 1 : 0) : 1,
    sort_order || 0
  );
  res.json({ success: true, id: result.lastInsertRowid });
});

app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Proizvod nije pronađen.' });

  const { name, description, price, sizes, stock, category, image, images, active, sort_order } = req.body;
  let slug = existing.slug;
  if (name && name !== existing.name) {
    let newSlug = slugify(name);
    const slugExists = db.prepare('SELECT id FROM products WHERE slug = ? AND id != ?').get(newSlug, id);
    slug = slugExists ? `${newSlug}-${Date.now().toString().slice(-5)}` : newSlug;
  }

  db.prepare(`
    UPDATE products SET
      name = ?, slug = ?, description = ?, price = ?, sizes = ?, stock = ?,
      category = ?, image = ?, images = ?, active = ?, sort_order = ?
    WHERE id = ?
  `).run(
    name ?? existing.name,
    slug,
    description ?? existing.description,
    price !== undefined ? parseInt(price) : existing.price,
    sizes ?? existing.sizes,
    stock !== undefined ? parseInt(stock) : existing.stock,
    category ?? existing.category,
    image !== undefined ? image : existing.image,
    images !== undefined ? JSON.stringify(images) : existing.images,
    active !== undefined ? (active ? 1 : 0) : existing.active,
    sort_order !== undefined ? sort_order : existing.sort_order,
    id
  );
  res.json({ success: true });
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// =========================================================
// ADMIN: HERO SLIDES (protected)
// =========================================================

app.get('/api/admin/hero', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM hero_slides ORDER BY sort_order ASC, id ASC').all();
  res.json(rows);
});

app.post('/api/admin/hero', requireAdmin, (req, res) => {
  const { image, title, subtitle, button_text, button_link, sort_order, active } = req.body;
  const result = db.prepare(`
    INSERT INTO hero_slides (image, title, subtitle, button_text, button_link, sort_order, active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(image || '', title || '', subtitle || '', button_text || '', button_link || '', sort_order || 0, active !== undefined ? (active ? 1 : 0) : 1);
  res.json({ success: true, id: result.lastInsertRowid });
});

app.put('/api/admin/hero/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  const existing = db.prepare('SELECT * FROM hero_slides WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Slajd nije pronađen.' });
  const { image, title, subtitle, button_text, button_link, sort_order, active } = req.body;
  db.prepare(`
    UPDATE hero_slides SET image=?, title=?, subtitle=?, button_text=?, button_link=?, sort_order=?, active=?
    WHERE id = ?
  `).run(
    image ?? existing.image,
    title ?? existing.title,
    subtitle ?? existing.subtitle,
    button_text ?? existing.button_text,
    button_link ?? existing.button_link,
    sort_order !== undefined ? sort_order : existing.sort_order,
    active !== undefined ? (active ? 1 : 0) : existing.active,
    id
  );
  res.json({ success: true });
});

app.delete('/api/admin/hero/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM hero_slides WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// =========================================================
// ADMIN: ORDERS (protected)
// =========================================================

app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  res.json(rows.map((o) => ({ ...o, items: JSON.parse(o.items || '[]') })));
});

app.get('/api/admin/orders/:id', requireAdmin, (req, res) => {
  const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!o) return res.status(404).json({ error: 'Porudžbina nije pronađena.' });
  res.json({ ...o, items: JSON.parse(o.items || '[]') });
});

app.put('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  const allowed = ['novo', 'potvrđeno', 'poslato', 'završeno', 'otkazano'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Nepoznat status.' });
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

app.delete('/api/admin/orders/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// =========================================================
// ADMIN: SETTINGS (protected)
// =========================================================

app.get('/api/admin/settings', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const obj = {};
  for (const r of rows) obj[r.key] = r.value;
  res.json(obj);
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  for (const [key, value] of Object.entries(req.body || {})) {
    setSetting(key, value);
  }
  res.json({ success: true });
});

// =========================================================
// ADMIN: IMAGE UPLOAD (protected)
// =========================================================

app.post('/api/admin/upload', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fajl nije primljen.' });
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

app.post('/api/admin/upload-multi', requireAdmin, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Fajlovi nisu primljeni.' });
  res.json({ success: true, urls: req.files.map((f) => `/uploads/${f.filename}`) });
});

// Error handler for multer errors
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message || 'Greška na serveru.' });
  }
  next();
});

// =========================================================
// SPA fallback for admin panel routes
// =========================================================
app.get('/admin/{*splat}', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`LU Costume server running on http://localhost:${PORT}`);
});
