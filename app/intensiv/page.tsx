import Image from 'next/image';
import type { Metadata } from 'next';
import { Archivo } from 'next/font/google';
import { getProduct, resolveAmount, INTENSIV } from '@/lib/products';
import SignupForm from './SignupForm';
import ThirtyDays from './ThirtyDays';
import Reveal from './Reveal';
import './intensiv.css';

/* =============================================================================
 *  Intensiv „Am un plan pentru viața mea" — landing.
 *  Ideea: pagina este caietul de lucru al intensivului. Coperta = primul ecran,
 *  fiecare secțiune = încă o foaie din caiet, footer-ul = coperta din spate.
 *  Prețul, data și linkurile vin din lib/products.ts (intensiv_plan, INTENSIV).
 * ========================================================================== */

const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--ix-font',
});

const PRODUCT_ID = 'intensiv_plan';

// Prețul se schimbă la o dată fixă → pagina se regenerează din oră în oră.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Am un plan pentru viața mea — intensiv online cu Lilia Dubița',
  description:
    '7 noiembrie, online. 3 ore în care lucrezi practic la planul tău pentru următoarele 30 de zile. Caiet de lucru inclus.',
};

const SHEETS = [
  {
    title: 'Planul pe 30 de zile',
    text: 'Nu o listă de dorințe, ci pași concreți, împărțiți pe săptămâni, pe care îi scrii tu, cu mâna ta, în timpul intensivului.',
    photo: '/images/IMG_0650.JPG',
    alt: 'Lilia Dubița citind, așezată pe podea printre caiete și foi deschise',
    pos: 'center 40%',
    tone: 'paper',
  },
  {
    title: 'Caietul de lucru',
    text: 'Îl primești în grupul participanților, îl completăm împreună și te întorci la el în toate cele 30 de zile.',
    photo: '/images/462581361_1836053763900029_7874199193613626130_n.jpg',
    alt: 'Lilia Dubița într-un costum crem, pe un scaun',
    pos: 'center 25%',
    tone: 'frost',
  },
  {
    title: 'Instrumente practice',
    text: 'Pleci cu instrumente practice și începi să acționezi chiar de a doua zi. Nu rămâi cu slide-uri copiate pe care le uiți undeva.',
    photo: '/images/IMG_0651.JPG',
    alt: 'Lilia Dubița lângă o ușă de lemn, în costum închis',
    pos: 'center 30%',
    tone: 'ink',
  },
] as const;

function euro(n: number) {
  return `${n} €`;
}

export default function IntensivPage() {
  const product = getProduct(PRODUCT_ID)!;
  const price = resolveAmount(product, 0);
  const increase = product.priceIncrease;
  const increaseDate = increase
    ? new Date(increase.from).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })
    : null;
  const priceActive = !increase || price !== increase.amount;

  return (
    <div className={`ix ${archivo.variable}`}>
      <Reveal />

      <div className="ix-sheet-main">
        {/* ── Coperta ─────────────────────────────────────────────────── */}
        <header className="ix-hero">
          <nav className="ix-nav" aria-label="Navigare">
            <a href="#top" className="ix-mono" aria-label="Lilia Dubița">LD</a>
            <div className="ix-nav-links">
              <a href="#ce-primesti">Ce primești</a>
              <a href="#intrebari">Întrebări</a>
            </div>
            <a href="#inscriere" className="ix-btn">Mă înscriu</a>
          </nav>

          <div className="ix-cover" id="top">
            <i className="ix-notch ix-notch-tl" aria-hidden />
            <i className="ix-notch ix-notch-tr" aria-hidden />
            <h1 className="ix-cover-title">
              <span>Am un plan</span>
              <span>pentru viața mea</span>
            </h1>
            <p className="ix-cover-by">Intensiv online cu Lilia Dubița, psiholog</p>
            <p className="ix-cover-line">
              7 noiembrie 2026 <i className="ix-diamond" aria-hidden /> 3 ore pe Zoom{' '}
              <i className="ix-diamond" aria-hidden /> caiet de lucru inclus
            </p>
            <p className="ix-cover-sub">
              Unicul meu intensiv online de o singură zi din 2026. Lucrăm practic la planul tău pentru
              următoarele 30 de zile.
            </p>
            <a href="#inscriere" className="ix-btn ix-btn-big">
              Mă înscriu — {euro(price)}
            </a>
          </div>
        </header>

        {/* ── Foaia 1: trei ore, un plan ──────────────────────────────── */}
        <section className="ix-intro" data-reveal>
          <div className="ix-intro-top">
            <h2 className="ix-h">Trei ore. Un plan.</h2>
            <p className="ix-intro-note">
              Nu vii să notezi informații și să copiezi slide-uri pe care apoi le uiți. Te apuci de
              treabă și îți organizezi viața așa încât la final să spui: trăiesc varianta mai frumoasă
              a vieții mele și am resursele pentru ea.
            </p>
          </div>
          <dl className="ix-facts">
            <div><dt>7 noiembrie</dt><dd>sâmbătă, {INTENSIV.timeText.includes('COMPLETAT') ? 'ora se anunță' : INTENSIV.timeText}</dd></div>
            <div><dt>3 ore</dt><dd>lucru practic, nu teorie</dd></div>
            <div><dt>Zoom</dt><dd>de oriunde ești</dd></div>
            <div><dt>{euro(price)}</dt><dd>{increaseDate && priceActive ? `până pe ${increaseDate}` : 'caietul inclus'}</dd></div>
          </dl>
          <div className="ix-intro-bottom">
            <ThirtyDays start={INTENSIV.startDate} />
            <Image
              src="/images/462555055_1908035599726421_3831973571258710936_n.jpg"
              alt="Lilia Dubița, psiholog, pe un fotoliu de piele"
              width={1256}
              height={863}
              className="ix-intro-photo"
              sizes="(max-width: 760px) 100vw, 42vw"
            />
          </div>
        </section>

        {/* ── Ce primești ──────────────────────────────────── */}
        <section className="ix-stack" id="ce-primesti">
          <h2 className="ix-h ix-stack-h" data-reveal>Ce iei cu tine</h2>
          {SHEETS.map((s) => (
            <article key={s.title} className={`ix-stack-sheet ix-tone-${s.tone}`}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <div className="ix-stack-photo">
                <Image src={s.photo} alt={s.alt} fill sizes="(max-width: 760px) 100vw, 50vw" style={{ objectPosition: s.pos }} />
              </div>
            </article>
          ))}
        </section>

        {/* ── Preț + înscriere ────────────────────────────────────────── */}
        <section className="ix-price" id="inscriere">
          <div className="ix-price-head" data-reveal>
            <h2 className="ix-h">Înscrierea</h2>
            <Image
              src="/images/IMG_0646.JPG"
              alt="Lilia Dubița pe o canapea, în costum gri"
              width={829}
              height={1280}
              className="ix-price-photo"
              sizes="(max-width: 760px) 60vw, 22vw"
            />
          </div>
          <div className="ix-price-body" data-reveal>
            <div className="ix-menu">
              <p className="ix-menu-group">Intensivul</p>
              <div className="ix-menu-row" data-current={priceActive ? '' : undefined}>
                <div>
                  <p className="ix-menu-name">Participare + caiet de lucru</p>
                  <p className="ix-menu-desc">
                    {increaseDate ? `Prețul de lansare, până pe ${increaseDate}` : '3 ore pe Zoom, grupul participanților'}
                  </p>
                </div>
                <p className="ix-menu-price">{euro(priceActive ? price : product.amount)}</p>
              </div>
              {increase && (
                <div className="ix-menu-row" data-current={!priceActive ? '' : undefined}>
                  <div>
                    <p className="ix-menu-name">De pe {increaseDate}</p>
                    <p className="ix-menu-desc">Același intensiv, același caiet</p>
                  </div>
                  <p className="ix-menu-price">{euro(increase.amount)}</p>
                </div>
              )}
            </div>
            <SignupForm productId={PRODUCT_ID} label={`Plătesc ${euro(price)} și mă înscriu`} />
          </div>
        </section>

        {/* ── Întrebări ───────────────────────────────────────────────── */}
        <section className="ix-faq" id="intrebari">
          <div className="ix-faq-col" data-reveal>
            <h2 className="ix-h">Întrebări</h2>
            <ul className="ix-faq-facts">
              <li>Sâmbătă, 7 noiembrie 2026</li>
              <li>Online, pe Zoom, 3 ore</li>
              <li>Linkurile vin pe email și în Telegram</li>
            </ul>
            <details>
              <summary>Ce am nevoie să pregătesc?</summary>
              <p>Caietul de lucru, pe care îl primești în grupul de Telegram (printat sau deschis pe ecran), un pix și trei ore doar pentru tine.</p>
            </details>
            <details>
              <summary>Cum primesc linkul de Zoom?</summary>
              <p>Imediat după plată primești un email cu linkul spre grupul participanților și linkul de Zoom. Aceleași linkuri ți le trimite și botul nostru de Telegram.</p>
            </details>
            <details>
              <summary>Nu am primit emailul. Ce fac?</summary>
              <p>Verifică dosarul Spam sau Promoții. Dacă nu e acolo, scrie-ne la danexprim@liliadubita.md sau sună la 067 102 290.</p>
            </details>
            <a href="#inscriere" className="ix-btn">Mă înscriu — {euro(price)}</a>
          </div>
          <div className="ix-faq-photos">
            <Image
              src="/images/462576124_1542539003296328_8932070267725812252_n.jpg"
              alt="Lilia Dubița într-un costum alb, pe o canapea"
              width={1280}
              height={1862}
              className="ix-faq-tall"
              sizes="(max-width: 760px) 100vw, 45vw"
            />
            <Image
              src="/images/hero.jpg"
              alt="Portret Lilia Dubița"
              width={600}
              height={600}
              className="ix-faq-square"
              sizes="(max-width: 760px) 40vw, 15vw"
            />
          </div>
        </section>
      </div>

      {/* ── Coperta din spate ─────────────────────────────────────────── */}
      <footer className="ix-back">
        <svg className="ix-back-edge" viewBox="0 0 1200 50" preserveAspectRatio="none" aria-hidden>
          <path d={`M0 50 ${Array.from({ length: 12 }, (_, i) => `L${i * 100} 50 A50 50 0 0 1 ${i * 100 + 100} 50`).join(' ')} L1200 50 Z`} />
        </svg>
        <div className="ix-back-panel">
          <div>
            <p className="ix-back-sign">Ne vedem pe 7 noiembrie</p>
            <p>Adu-ți caietul, un pix și trei ore doar pentru tine. Restul îl facem împreună.</p>
          </div>
          <div className="ix-back-address">
            <a href="mailto:danexprim@liliadubita.md">danexprim@liliadubita.md</a>
            <a href="tel:067102290">067 102 290</a>
            <a href="https://www.liliadubita.md">liliadubita.md</a>
          </div>
          <div className="ix-back-imprint">
            <p>© {new Date().getFullYear()} Danex Prim SRL · mun. Chișinău, sec. Buiucani, str. Calea Ieșilor 11</p>
            <nav aria-label="Informații legale">
              <a href="/termeni">Termeni și Condiții</a>
              <a href="/confidentialitate">Politică de Confidențialitate</a>
            </nav>
            <p className="ix-back-pay">
              Plată cu Visa sau Mastercard prin
              <Image src="/images/paynet.png" alt="Paynet" width={32} height={32} />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
