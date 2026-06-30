import db from './db.js';
import bcrypt from 'bcryptjs';

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

// --- Admin user ---
const existingAdmin = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');
if (!existingAdmin) {
  const hash = bcrypt.hashSync('lucostume2026', 10);
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', hash);
  console.log('Admin nalog kreiran -> username: admin / password: lucostume2026 (PROMENI OVO ODMAH posle prijave!)');
} else {
  console.log('Admin nalog vec postoji.');
}

// --- Settings (shipping etc) ---
const settingsDefaults = {
  shipping_cost: '350',
  free_shipping_threshold: '15000',
  shop_name: 'LU Costume',
  shop_email: 'emai@lucostume.rs',
  shop_phone: '+381 64 1234567',
};
for (const [key, value] of Object.entries(settingsDefaults)) {
  const exists = db.prepare('SELECT * FROM settings WHERE key = ?').get(key);
  if (!exists) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, value);
  }
}
console.log('Settings podeseni.');

// --- Demo products (placeholder, Vanja ce zameniti kroz admin) ---
const demoProducts = [
  {
    name: 'Very Light, Silvery Lilac Tutu',
    price: 20000,
    description: 'Lagani baletski tutu u srebrno-liloj nijansi, idealan za nastupe i recitale.',
    sizes: 'XS,S,M,L',
    category: 'Tutu',
  },
  {
    name: 'Soft Pink and Gold Glitter Classical Tutu',
    price: 20000,
    description: 'Klasicni tutu u roze i zlatnoj boji sa glitter detaljima.',
    sizes: 'XS,S,M,L',
    category: 'Tutu',
  },
  {
    name: 'Dusty Rose and Gold Lyrical',
    price: 20000,
    description: 'Lirski kostim u prasinasto roze i zlatnoj kombinaciji.',
    sizes: 'XS,S,M,L',
    category: 'Lyrical',
  },
  {
    name: 'Fabulous, Sassy Red Tassel Jazz',
    price: 20000,
    description: 'Crveni jazz kostim sa resama, za nastupe pune energije.',
    sizes: 'XS,S,M,L',
    category: 'Jazz',
  },
];

const existingCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
if (existingCount === 0) {
  let order = 0;
  for (const p of demoProducts) {
    db.prepare(`
      INSERT INTO products (name, slug, description, price, sizes, category, image, images, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, '', '[]', ?)
    `).run(p.name, slugify(p.name), p.description, p.price, p.sizes, p.category, order++);
  }
  console.log(`${demoProducts.length} demo proizvoda dodato (bez slika - dodaj kroz admin panel).`);
} else {
  console.log('Proizvodi vec postoje, demo podaci se ne dodaju ponovo.');
}

// --- Demo hero slide (no image, placeholder gradient will show) ---
const existingHero = db.prepare('SELECT COUNT(*) as c FROM hero_slides').get().c;
if (existingHero === 0) {
  db.prepare(`
    INSERT INTO hero_slides (image, title, subtitle, button_text, button_link, sort_order)
    VALUES ('', ?, ?, ?, ?, 0)
  `).run(
    'Kvalitetni, udobni i moderni kostimi koji ističu vaš stil i pokret.',
    'Rucno biran materijal, izrada koja prati pokret, i veličine za svaki nastup.',
    'Pogledaj kolekciju',
    '#products'
  );
  console.log('Demo hero slajd dodat (bez slike - dodaj kroz admin panel).');
}

console.log('\nSeed zavrsen.');
