// =========================================================
// LU COSTUME — i18n (SR / EN / HU / RO)
// =========================================================
(function () {
  'use strict';

  const LANGS = ['sr', 'en', 'hu', 'ro'];
  const STORAGE_KEY = 'lucostume_lang';

  const translations = {
    sr: {
      // Nav
      nav_costumes: 'Kostimi',
      nav_all: 'Svi proizvodi',
      nav_sizes: 'Veličine',
      nav_contact: 'Kontakt',
      nav_presale: 'Pre-Sale',
      // Hero
      hero_eyebrow: 'Nova kolekcija',
      hero_title: 'Kostimi koji prate svaki pokret',
      hero_subtitle: 'Ručno birani materijal, izrada koja prati pokret, veličine za svaki nastup.',
      hero_cta: 'Pogledaj kolekciju',
      // Products
      products_eyebrow: 'Kolekcija',
      products_title: 'Kostimi za scenu i nastup',
      products_sub: 'Svaki komad je rađen da prati pokret — od probe do reflektora.',
      add_to_cart: 'Dodaj u korpu',
      sold_out: 'Rasprodato',
      quick_view: 'Brzi pregled',
      // Cart
      cart_title: 'Tvoja korpa',
      cart_empty: 'Korpa je prazna.\nDodaj kostim iz kolekcije.',
      cart_products: 'Proizvodi',
      cart_shipping: 'Dostava',
      cart_total: 'Ukupno',
      cart_free: 'Besplatno',
      cart_checkout: 'Nastavi na plaćanje',
      // Checkout
      checkout_title: 'Podaci za dostavu',
      checkout_sub: 'Plaćanje pouzećem — platite kuriru prilikom prijema paketa.',
      checkout_name: 'Ime i prezime *',
      checkout_phone: 'Telefon *',
      checkout_email: 'Email',
      checkout_address: 'Adresa *',
      checkout_city: 'Grad *',
      checkout_postal: 'Poštanski broj',
      checkout_note: 'Napomena',
      checkout_note_ph: 'Npr. veličina, boja, vreme dostave...',
      checkout_confirm: 'Potvrdi porudžbinu (pouzećem)',
      // Success
      success_title: 'Hvala na porudžbini!',
      success_order: 'Broj porudžbine:',
      success_msg: 'Kontaktiraćemo vas radi potvrde. Plaćanje je pouzećem prilikom isporuke.',
      success_continue: 'Nastavi kupovinu',
      // How to order
      how_eyebrow: 'Poručivanje',
      how_title: 'Kako poručiti?',
      how_text: 'Izaberi kostim, dodaj u korpu, i potvrdi porudžbinu. Plaćaš pouzećem — kurir naplaćuje prilikom isporuke.',
      how_step1: 'Izaberi kostim i veličinu',
      how_step2: 'Dodaj u korpu i unesi podatke za dostavu',
      how_step3: 'Plati pouzećem kad paket stigne',
      how_cta: 'Pogledaj kolekciju',
      // Size guide teaser
      size_eyebrow: 'Pomoć pri izboru',
      size_title: 'Vodič za veličine',
      size_text: 'Nisi sigurna koja veličina ti odgovara? Pogledaj detaljnu tabelu mera ili nam javi pa rado pomažemo pre nego što poručiš.',
      size_cta: 'Pogledaj vodič',
      size_ask: 'Pitaj nas',
      // Instagram
      ig_eyebrow: 'Pratite nas',
      ig_title: '@ludancecostume',
      ig_sub: 'Novi modeli, iza kulisa, i kostimi na sceni — pratite nas na Instagramu.',
      ig_cta: 'Otvorite Instagram',
      // Footer
      footer_pages: 'Stranice',
      footer_newsletter_title: 'Ne propusti nove kolekcije',
      footer_newsletter_ph: 'Tvoj email',
      footer_newsletter_btn: 'Prijavi se',
      footer_newsletter_ok: 'Hvala na prijavi!',
      footer_copyright: '© 2026 LU Costume. Sva prava zadržana.',
    },
    en: {
      nav_costumes: 'Costumes',
      nav_all: 'All Products',
      nav_sizes: 'Size Guide',
      nav_contact: 'Contact',
      nav_presale: 'Pre-Sale',
      hero_eyebrow: 'New Collection',
      hero_title: 'Costumes that follow every move',
      hero_subtitle: 'Hand-selected materials, craftsmanship that moves with you, sizes for every performance.',
      hero_cta: 'View Collection',
      products_eyebrow: 'Collection',
      products_title: 'Stage & Performance Costumes',
      products_sub: 'Every piece is made to follow the movement — from rehearsal to spotlight.',
      add_to_cart: 'Add to Cart',
      sold_out: 'Sold Out',
      quick_view: 'Quick View',
      cart_title: 'Your Cart',
      cart_empty: 'Your cart is empty.\nAdd a costume from the collection.',
      cart_products: 'Products',
      cart_shipping: 'Shipping',
      cart_total: 'Total',
      cart_free: 'Free',
      cart_checkout: 'Proceed to Checkout',
      checkout_title: 'Delivery Details',
      checkout_sub: 'Cash on delivery — pay the courier upon receiving your package.',
      checkout_name: 'Full Name *',
      checkout_phone: 'Phone *',
      checkout_email: 'Email',
      checkout_address: 'Address *',
      checkout_city: 'City *',
      checkout_postal: 'Postal Code',
      checkout_note: 'Note',
      checkout_note_ph: 'E.g. size, color, delivery time...',
      checkout_confirm: 'Confirm Order (Cash on Delivery)',
      success_title: 'Thank you for your order!',
      success_order: 'Order number:',
      success_msg: 'We will contact you to confirm. Payment is cash on delivery.',
      success_continue: 'Continue Shopping',
      how_eyebrow: 'How to Order',
      how_title: 'How to Order?',
      how_text: 'Choose a costume, add to cart, and confirm your order. Pay cash on delivery — the courier collects payment upon delivery.',
      how_step1: 'Choose costume and size',
      how_step2: 'Add to cart and enter delivery details',
      how_step3: 'Pay cash when package arrives',
      how_cta: 'View Collection',
      size_eyebrow: 'Sizing Help',
      size_title: 'Size Guide',
      size_text: 'Not sure which size fits you? Check our detailed size chart or contact us — we are happy to help before you order.',
      size_cta: 'View Size Guide',
      size_ask: 'Ask Us',
      ig_eyebrow: 'Follow Us',
      ig_title: '@ludancecostume',
      ig_sub: 'New designs, behind the scenes, and costumes on stage — follow us on Instagram.',
      ig_cta: 'Open Instagram',
      footer_pages: 'Pages',
      footer_newsletter_title: "Don't miss new collections",
      footer_newsletter_ph: 'Your email',
      footer_newsletter_btn: 'Subscribe',
      footer_newsletter_ok: 'Thank you!',
      footer_copyright: '© 2026 LU Costume. All rights reserved.',
    },
    hu: {
      nav_costumes: 'Jelmezek',
      nav_all: 'Összes termék',
      nav_sizes: 'Mérettáblázat',
      nav_contact: 'Kapcsolat',
      nav_presale: 'Előrendelés',
      hero_eyebrow: 'Új kollekció',
      hero_title: 'Jelmezek, amelyek követnek minden mozdulatot',
      hero_subtitle: 'Kézzel válogatott anyagok, táncos szabás, minden előadáshoz megfelelő méret.',
      hero_cta: 'Kollekció megtekintése',
      products_eyebrow: 'Kollekció',
      products_title: 'Színpadi és fellépő jelmezek',
      products_sub: 'Minden darabot mozgásra terveztünk — a próbától a reflektorfényig.',
      add_to_cart: 'Kosárba',
      sold_out: 'Elfogyott',
      quick_view: 'Gyors nézet',
      cart_title: 'Kosár',
      cart_empty: 'A kosár üres.\nAdjon hozzá jelmezt a kollekcióból.',
      cart_products: 'Termékek',
      cart_shipping: 'Szállítás',
      cart_total: 'Összesen',
      cart_free: 'Ingyenes',
      cart_checkout: 'Tovább a fizetéshez',
      checkout_title: 'Szállítási adatok',
      checkout_sub: 'Utánvétes fizetés — a futárnak fizet a csomag átvételekor.',
      checkout_name: 'Teljes név *',
      checkout_phone: 'Telefon *',
      checkout_email: 'Email',
      checkout_address: 'Cím *',
      checkout_city: 'Város *',
      checkout_postal: 'Irányítószám',
      checkout_note: 'Megjegyzés',
      checkout_note_ph: 'Pl. méret, szín, szállítási idő...',
      checkout_confirm: 'Rendelés megerősítése (utánvét)',
      success_title: 'Köszönjük a rendelést!',
      success_order: 'Rendelésszám:',
      success_msg: 'Felvesszük Önnel a kapcsolatot a megerősítéshez. Fizetés utánvéttel.',
      success_continue: 'Vásárlás folytatása',
      how_eyebrow: 'Rendelés menete',
      how_title: 'Hogyan rendeljen?',
      how_text: 'Válasszon jelmezt, tegye a kosárba, és erősítse meg a rendelést. Utánvéttel fizet.',
      how_step1: 'Válasszon jelmezt és méretet',
      how_step2: 'Tegye kosárba és adja meg a szállítási adatokat',
      how_step3: 'Fizessen utánvéttel a csomag átvételekor',
      how_cta: 'Kollekció megtekintése',
      size_eyebrow: 'Méretválasztás',
      size_title: 'Mérettáblázat',
      size_text: 'Nem biztos a méretben? Nézze meg részletes mérettáblázatunkat, vagy kérdezzen minket!',
      size_cta: 'Mérettáblázat',
      size_ask: 'Kérdezzen',
      ig_eyebrow: 'Kövessen minket',
      ig_title: '@ludancecostume',
      ig_sub: 'Új modellek, kulisszák mögött, jelmezek a színpadon — kövessen Instagramon.',
      ig_cta: 'Instagram megnyitása',
      footer_pages: 'Oldalak',
      footer_newsletter_title: 'Ne maradjon le az újdonságokról',
      footer_newsletter_ph: 'Email cím',
      footer_newsletter_btn: 'Feliratkozás',
      footer_newsletter_ok: 'Köszönjük!',
      footer_copyright: '© 2026 LU Costume. Minden jog fenntartva.',
    },
    ro: {
      nav_costumes: 'Costume',
      nav_all: 'Toate produsele',
      nav_sizes: 'Ghid mărimi',
      nav_contact: 'Contact',
      nav_presale: 'Pre-comandă',
      hero_eyebrow: 'Colecție nouă',
      hero_title: 'Costume care urmează fiecare mișcare',
      hero_subtitle: 'Materiale alese manual, croială pentru dans, mărimi pentru fiecare spectacol.',
      hero_cta: 'Vezi colecția',
      products_eyebrow: 'Colecție',
      products_title: 'Costume pentru scenă și spectacol',
      products_sub: 'Fiecare piesă este creată pentru mișcare — de la repetiție la reflector.',
      add_to_cart: 'Adaugă în coș',
      sold_out: 'Epuizat',
      quick_view: 'Previzualizare',
      cart_title: 'Coșul tău',
      cart_empty: 'Coșul este gol.\nAdaugă un costum din colecție.',
      cart_products: 'Produse',
      cart_shipping: 'Livrare',
      cart_total: 'Total',
      cart_free: 'Gratuit',
      cart_checkout: 'Continuă la plată',
      checkout_title: 'Date de livrare',
      checkout_sub: 'Plată ramburs — plătiți curierului la primirea coletului.',
      checkout_name: 'Nume complet *',
      checkout_phone: 'Telefon *',
      checkout_email: 'Email',
      checkout_address: 'Adresă *',
      checkout_city: 'Oraș *',
      checkout_postal: 'Cod poștal',
      checkout_note: 'Notă',
      checkout_note_ph: 'Ex. mărime, culoare, timp de livrare...',
      checkout_confirm: 'Confirmă comanda (ramburs)',
      success_title: 'Vă mulțumim pentru comandă!',
      success_order: 'Numărul comenzii:',
      success_msg: 'Vă vom contacta pentru confirmare. Plata se face ramburs la livrare.',
      success_continue: 'Continuă cumpărăturile',
      how_eyebrow: 'Cum să comanzi',
      how_title: 'Cum să comanzi?',
      how_text: 'Alege costumul, adaugă în coș și confirmă comanda. Plătești ramburs — curierul încasează la livrare.',
      how_step1: 'Alege costumul și mărimea',
      how_step2: 'Adaugă în coș și introdu datele de livrare',
      how_step3: 'Plătește ramburs când sosește coletul',
      how_cta: 'Vezi colecția',
      size_eyebrow: 'Ajutor cu mărimile',
      size_title: 'Ghid de mărimi',
      size_text: 'Nu ești sigur/ă ce mărime ți se potrivește? Consultă tabelul nostru detaliat sau contactează-ne!',
      size_cta: 'Ghid de mărimi',
      size_ask: 'Întreabă-ne',
      ig_eyebrow: 'Urmărește-ne',
      ig_title: '@ludancecostume',
      ig_sub: 'Modele noi, culise și costume pe scenă — urmărește-ne pe Instagram.',
      ig_cta: 'Deschide Instagram',
      footer_pages: 'Pagini',
      footer_newsletter_title: 'Nu rata colecțiile noi',
      footer_newsletter_ph: 'Email-ul tău',
      footer_newsletter_btn: 'Abonare',
      footer_newsletter_ok: 'Mulțumim!',
      footer_copyright: '© 2026 LU Costume. Toate drepturile rezervate.',
    },
  };

  // ——— State ———
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'sr';
  if (!LANGS.includes(currentLang)) currentLang = 'sr';

  // ——— Public API ———
  window.i18n = {
    t(key) {
      return (translations[currentLang] && translations[currentLang][key]) ||
             (translations['sr'] && translations['sr'][key]) || key;
    },
    lang() { return currentLang; },
    set(lang) {
      if (!LANGS.includes(lang)) return;
      currentLang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      applyTranslations();
      updateSwitcher();
      document.documentElement.lang = lang;
      document.dispatchEvent(new CustomEvent('langChanged', { detail: lang }));
    },
  };

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const val = window.i18n.t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else if (el.tagName === 'A' || el.tagName === 'BUTTON') {
        el.textContent = val;
      } else {
        // Preserve inner HTML for elements with <em> etc.
        if (key === 'hero_title') {
          // Special case: keep em tag
          el.innerHTML = val.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        } else {
          el.textContent = val;
        }
      }
    });
  }

  function updateSwitcher() {
    // Desktop dropdown
    const currentBtn = document.querySelector('.lang-current');
    if (currentBtn) {
      currentBtn.innerHTML = `
        <span class="lang-flag">${LANG_LABELS[currentLang].flag}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    document.querySelectorAll('.lang-option').forEach((opt) => {
      opt.classList.toggle('active', opt.dataset.lang === currentLang);
    });
    // Mobile pills
    document.querySelectorAll('.nav-lang-mobile .lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
  }

  // ——— Init on DOM ready ———
  const LANG_LABELS = {
    sr: { flag: '🇷🇸', name: 'Srpski' },
    en: { flag: '🇬🇧', name: 'English' },
    hu: { flag: '🇭🇺', name: 'Magyar' },
    ro: { flag: '🇷🇴', name: 'Română' },
  };

  function init() {
    // Desktop dropdown
    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
      const switcher = document.createElement('div');
      switcher.className = 'lang-switcher';
      switcher.innerHTML = `
        <button class="lang-current" aria-haspopup="listbox" aria-expanded="false">
          <span class="lang-flag">${LANG_LABELS[currentLang].flag}</span>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="lang-dropdown" role="listbox">
          ${LANGS.map((l) => `
            <button class="lang-option ${l === currentLang ? 'active' : ''}" data-lang="${l}" role="option">
              <span class="lang-flag">${LANG_LABELS[l].flag}</span>
              <span>${LANG_LABELS[l].name}</span>
            </button>`).join('')}
        </div>`;

      const btn = switcher.querySelector('.lang-current');
      const dropdown = switcher.querySelector('.lang-dropdown');

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = switcher.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
      });
      document.addEventListener('click', () => {
        switcher.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
      switcher.querySelectorAll('.lang-option').forEach((opt) => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          window.i18n.set(opt.dataset.lang);
          switcher.classList.remove('open');
        });
      });

      headerRight.insertBefore(switcher, headerRight.firstChild);
    }

    // Mobile nav lang pills
    const mobileNav = document.getElementById('navLangMobile');
    if (mobileNav) {
      mobileNav.innerHTML = LANGS.map((l) =>
        `<button class="lang-btn ${l === currentLang ? 'active' : ''}" data-lang="${l}">
          ${LANG_LABELS[l].flag} ${l.toUpperCase()}
        </button>`
      ).join('');
      mobileNav.querySelectorAll('.lang-btn').forEach((b) => {
        b.addEventListener('click', () => window.i18n.set(b.dataset.lang));
      });
    }

    document.documentElement.lang = currentLang;
    applyTranslations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-apply after langChanged (for dynamically rendered content)
  document.addEventListener('langChanged', applyTranslations);
})();
