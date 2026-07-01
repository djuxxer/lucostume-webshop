# LU Costume — webshop

Online prodavnica za baletske i scenske kostime. Napravljena kao samostalna Node.js aplikacija (frontend + backend + baza u jednom), bez zavisnosti od WordPress-a.

## Šta je unutra

- **Prodavnica** (`/`) — hero sekcija (rotirajuće slike), grid proizvoda, filter po kategoriji, brzi pregled, korpa, checkout sa dostavom **pouzećem**.
- **Svi proizvodi** (`/svi-proizvodi.html`) — puna lista kolekcije sa filterom.
- **Vodič za veličine** (`/vodic-za-velicine.html`) — kako se izmeriti + tabela mera po veličinama.
- **Kontakt** (`/kontakt.html`) — kontakt forma (poruke stižu u admin panel) + podaci radnje.
- **Admin panel** (`/admin`) — proizvodi, hero slike, logo, porudžbine, kontakt poruke, podešavanja.
- **Baza** — SQLite fajl (`server/data/shop.db`), ugrađen u Node.js (nema potrebe za posebnim serverom baze).

## Pokretanje lokalno (test)

Potreban je **Node.js verzija 22 ili novija** (koristi ugrađeni `node:sqlite` modul).

```bash
npm install
npm run seed     # samo prvi put — kreira admin nalog i demo proizvode
npm start
```

Sajt: `http://localhost:3000`
Admin: `http://localhost:3000/admin`

**Početni admin nalog:**
- Korisničko ime: `admin`
- Lozinka: `lucostume2026`

⚠️ **Odmah promeni lozinku** — Admin panel → Podešavanja → Promena lozinke.

## Hosting (produkcija)

Aplikaciji treba hosting koji podržava Node.js (ne radi na običnom WordPress/cPanel shared hostingu bez Node podrške). Opcije:

- **VPS** (npr. DigitalOcean, Hetzner, domaći provideri) — instaliraj Node 22+, kopiraj projekat, `npm install`, `npm run seed`, pa pokreni sa `pm2` ili kao systemd servis da radi trajno.
- **Railway / Render / Fly.io** — automatski prepoznaju Node.js projekat, samo povežeš GitHub repo i deploy je automatski.

Bitno:
- Folder `server/data/` (baza) i `public/uploads/` (slike) moraju biti na **trajnom disku** koji se ne briše pri redeploy-u — kod Railway/Render ovo se zove "persistent volume/disk", obavezno uključi. **Render free tier nema persistent disk** — baza i slike se brišu pri svakom redeploy-u/restartu, pa je dobar samo za kratkotrajan demo, ne za produkciju.
- Postavi environment varijablu `JWT_SECRET` na neki nasumičan tekst (trenutno koristi placeholder vrednost iz koda — nije opasno za probu, ali za pravi sajt promeni).
- Domen `lucostume.rs` (ili koji god koristiš) samo treba da pokazuje (DNS) na server gde app radi.

Ako želiš, mogu da napravim i Dockerfile za lakši deploy — javi.

## Korišćenje admin panela

### Dodavanje proizvoda
1. Admin → Proizvodi → "+ Novi proizvod"
2. Unesi naziv, cenu, kategoriju (npr. Tutu, Jazz, Lyrical — koristi se za filter na sajtu), veličine (XS, S, M, L odvojeno zarezom), opis.
3. "+ Dodaj slike" — možeš dodati više slika odjednom. **Prva slika u listi je glavna** (prikazuje se u gridu).
4. "Aktivan" čekboks — isključi ako proizvod ne treba da se vidi na sajtu (npr. nema ga na stanju).
5. **Stock = 0** automatski prikazuje "Rasprodato" na sajtu umesto dugmeta za kupovinu.

### Hero slike (vrh početne strane)
- Admin → Hero slike → "+ Novi slajd". Ako dodaš više slajdova, rotiraju se automatski na 6 sekundi.
- Slajd bez slike i dalje radi — koristi se kao tekstualni hero sa dugmetom.

### Logo
- Admin → Podešavanja → "Logo" kartica na vrhu. Otpremi sliku (PNG sa providnom pozadinom najbolje izgleda) — automatski se primenjuje na header i footer sajta.
- "Ukloni logo" vraća na tekstualni "LU Costume" logo.

### Porudžbine
- Admin → Porudžbine — lista svih porudžbina, status se menja iz padajućeg menija (Novo → Potvrđeno → Poslato → Završeno, ili Otkazano).
- Klik na "Detalji" prikazuje sve stavke, adresu, telefon, napomenu kupca.
- Plaćanje je isključivo **pouzećem** — kupac plaća kuriru pri preuzimanju, nema online naplate ni provere kartice.

### Poruke
- Admin → Poruke — poruke poslate kroz kontakt formu na sajtu (`/kontakt.html`).
- Nepročitane poruke imaju oznaku "Novo". Klik "Označi pročitano" ili "Obriši" po potrebi.

### Podešavanja
- Cena dostave i prag za besplatnu dostavu (npr. "iznad 15.000 рсд dostava besplatna").
- Email/telefon radnje — prikazuje se u footeru i na kontakt stranici.

## Slike proizvoda

Kad budeš spreman da ubaciš slike sa WeTransfer-a, samo uđi u Admin → Proizvodi → otvori proizvod → "+ Dodaj slike", i izaberi fajlove sa računara (one koje preuzmeš sa WeTransfer linka). Isto za hero slike i logo.

### Vodič za veličine — slika dijagrama mera
Stranica `/vodic-za-velicine.html` referencira sliku na putanji `/uploads/mere.png`. Da bi se prikazala, fajl `mere.png` treba da postoji u `public/uploads/` folderu (samo ga prevuci/kopiraj tamo, ne ide kroz admin panel jer nije proizvod).

## Struktura projekta (za referencu)


```
lucostume/
├── server/
│   ├── index.js       # API server (Express)
│   ├── db.js           # baza (SQLite)
│   ├── auth.js         # admin login (JWT)
│   ├── seed.js          # inicijalni podaci
│   └── data/shop.db      # baza podataka
├── public/
│   ├── index.html        # prodavnica
│   ├── css/style.css
│   ├── js/app.js
│   ├── admin/             # admin panel
│   └── uploads/            # otpremljene slike
└── package.json
```
