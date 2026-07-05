import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import TicketButton from "./TicketButton";

/* =============================================================================
 *  Paletă
 *  INK    — text principal (charcoal)
 *  MUTED  — text secundar
 *  GOLD   — accent șampanie (linii fine, numere de modul, eyebrow-uri)
 *  Prețul real se setează în lib/products.ts (psihologia_banilor).
 * ========================================================================== */
const INK = "#1F2933";
const MUTED = "#6B7280";
const GOLD = "#B8975A";

const EVENT = {
  eyebrow: "Eveniment de inteligență financiară",
  title: "Psihologia Banilor",
  lead: "Pentru cei care vor claritate, stabilitate și creștere reală.",
  tagline:
    "Nu e despre bani în sine, ci despre inteligența financiară din spatele lor — cum gândești, cum câștigi și cum crești. Patru ore, simplu și practic, în 2026.",
  date: "8 august 2026",
  time: "14:00 – 18:00",
  duration: "4 ore",
  venue: "Chișinău", // public — adresa exactă se transmite doar participanților, pe Telegram
  price: {
    current: "990 lei",
    note: "Primele 20 de bilete",
    regular: "1290 lei",
  },
};

// „De ce acum" — puncte de durere
const PAINS = [
  "Muncești mult, dar nu simți stabilitate financiară.",
  "Ai venituri, dar nu știi unde dispar banii.",
  "Încerci să economisești, dar nu reușești constant.",
  "Ai idei de business, dar nu știi de unde să începi.",
  "Simți frică sau confuzie când vine vorba de investiții.",
];

// Structura evenimentului — 3 module = 3 vorbitori
const MODULES = [
  {
    no: "01",
    moduleTitle: "Psihologia banilor",
    name: "Lilia Dubița",
    role: "Psiholog",
    photo: "/images/speakers/lilia1.png",
    imgPos: "center 20%",
    focus:
      "Tiparele mentale și emoționale care îți influențează banii și deciziile din viață.",
    bio: "Psiholog cu peste 13 ani de experiență privată, specializată în relații, dezvoltare personală și comunicare eficientă.",
    learnLabel: "Vei înțelege:",
    learn: [
      "de ce repetăm aceleași greșeli financiare;",
      "cum emoțiile îți influențează banii;",
      "cum familia și trecutul îți formează comportamentul financiar;",
      "cum comunicarea și relațiile îți influențează succesul;",
      "cum îți poți rescrie mentalitatea financiară.",
    ],
  },
  {
    no: "02",
    moduleTitle: "Ideea ta poate deveni o afacere?",
    name: "Daniela Croitoru",
    role: "Antreprenoare",
    photo: "/images/speakers/daniela.jpg",
    imgPos: "center 15%",
    focus: "Transformarea: idee → acțiune → venit.",
    bio: "Antreprenoare în beauty și echipamente medicale, cu peste 10 ani de experiență. A pornit de la zero și a construit o afacere reală, trecând prin toate etapele antreprenoriatului.",
    learnLabel: "Vei învăța:",
    learn: [
      "cum știi dacă o idee merită sau nu să fie construită;",
      "cum validezi o idee înainte de investiții;",
      "cum faci primii bani dintr-o idee simplă;",
      "ce greșeli blochează majoritatea începătorilor;",
      "cum construiești un business stabil, pas cu pas.",
    ],
  },
  {
    no: "03",
    moduleTitle: "Inteligență financiară & investiții",
    name: "Dorin Ciochină",
    role: "Investitor | Școala Banilor",
    photo: "/images/speakers/dorin1.PNG",
    imgPos: "center 25%",
    focus: "Momentul în care banii capătă structură și direcție.",
    bio: "Investitor cu peste 8 ani de experiență în piețele financiare și peste 10.000 de cursanți formați.",
    learnLabel: "Vei învăța:",
    learn: [
      "cum ieși din ciclul datoriilor și îți recapeți controlul;",
      "cum îți organizezi veniturile corect și simplu;",
      "cum construiești un fond de siguranță;",
      "cum începi investiții reale și accesibile;",
      "cum gândești financiar pe termen lung.",
    ],
  },
];

// „Ce face diferit" — un singur parcurs logic
const FLOW = [
  { label: "Cum gândești", desc: "Psihologia din spatele deciziilor tale financiare." },
  { label: "Cum câștigi", desc: "De la o idee la un venit real, construit corect." },
  { label: "Cum crești", desc: "Structură, investiții și stabilitate pe termen lung." },
];

// „Pentru cine este"
const AUDIENCE = [
  "Simți că banii vin și pleacă fără control.",
  "Ai obosit să trăiești de la salariu la salariu.",
  "Vrei să înțelegi cum gândesc oamenii care construiesc avere.",
  "Ai o idee de business, dar n-ai acționat încă.",
  "Vrei să începi să investești, dar nu știi de unde.",
  "Vrei claritate, nu informații haotice de pe internet.",
];

// „Ce primești"
const BENEFITS = [
  "Vezi exact unde pierzi bani în mod inconștient.",
  "Înveți cum să îți organizezi veniturile simplu.",
  "Înțelegi cum se validează o idee de business.",
  "Primești claritate despre primii pași în investiții.",
  "Descoperi cum se construiește stabilitatea financiară reală.",
];

// „Ce obții după"
const OUTCOMES = ["Claritate", "Structură", "Direcție", "Încredere în decizii", "Un plan real pentru următorul pas"];

const FAQ = [
  {
    q: "Trebuie să am cunoștințe financiare ca să particip?",
    a: "Nu. Totul e explicat simplu și practic, de la zero. Vii pentru claritate, nu pentru teorie.",
  },
  {
    q: "Vin dacă am doar o idee de business, nu o afacere?",
    a: "Da. Un modul întreg e despre cum validezi o idee și cum faci primii pași concreți.",
  },
  {
    q: "Cum primesc confirmarea?",
    a: "Imediat după plată ești redirecționat către pagina de confirmare, de unde deschizi botul de Telegram care îți confirmă locul la eveniment.",
  },
  {
    q: "Pot participa online?",
    a: "Nu. Evenimentul este exclusiv live, cu prezență fizică în Chișinău — fără transmisiune și fără înregistrare. Adresa exactă a sălii o primești pe Telegram după înscriere. Toată valoarea vine din experiența din sală și interacțiunea directă cu vorbitorii.",
  },
];

export const metadata: Metadata = {
  title: "Psihologia Banilor — Eveniment de inteligență financiară",
  description:
    "Psihologie, business și investiții într-un singur parcurs. Cu Lilia Dubița, Daniela Croitoru și Dorin Ciochină. 8 august, Chișinău.",
};

/* ------------------------------- Helpers UI ------------------------------- */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-5">
      <span className="h-px w-8" style={{ backgroundColor: GOLD }} />
      <span
        className="text-[11px] font-semibold uppercase"
        style={{ color: GOLD, letterSpacing: "0.2em" }}
      >
        {children}
      </span>
      <span className="h-px w-8" style={{ backgroundColor: GOLD }} />
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-3xl md:text-5xl text-center"
      style={{ color: INK, fontFamily: "var(--font-heading)", lineHeight: 1.1 }}
    >
      {children}
    </h2>
  );
}

const cardStyle = {
  backgroundColor: "#FFFFFF",
  boxShadow: "0 10px 40px rgba(31,41,51,0.06)",
  border: "1px solid rgba(184,151,90,0.15)",
} as const;

/* --------------------------------- Page ---------------------------------- */

export default function PsihologiaBanilorPage() {
  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{ background: "linear-gradient(to bottom, #f7f1e8, #ece0cf)" }}
    >
      {/* ================= HERO (bandă distinctă, charcoal) ================= */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: INK, borderBottom: "1px solid rgba(184,151,90,0.35)" }}
      >
        {/* Foto live din sală ca fundal — verticală pe mobil, orizontală pe desktop */}
        <Image
          src="/images/speakers/hero-vertical.png"
          alt="Eveniment live Psihologia Banilor — panel cu vorbitorii"
          fill
          priority
          sizes="100vw"
          className="object-cover md:hidden"
          style={{ objectPosition: "center" }}
        />
        <Image
          src="/images/speakers/hero-horizontal.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover hidden md:block"
          style={{ objectPosition: "center" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,26,33,0.88) 0%, rgba(20,26,33,0.76) 45%, rgba(20,26,33,0.92) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto px-4 sm:px-6 max-w-4xl w-full text-center pt-20 pb-20 md:pt-32 md:pb-32">
          <Eyebrow>{EVENT.eyebrow}</Eyebrow>

          <h1
            className="text-5xl md:text-7xl mb-5"
            style={{ color: "#F7F1E8", fontFamily: "var(--font-heading)", lineHeight: 1.02 }}
          >
            {EVENT.title}
          </h1>

          <p
            className="text-xl md:text-2xl font-medium mb-5 max-w-2xl mx-auto"
            style={{ color: GOLD }}
          >
            {EVENT.lead}
          </p>

          <p
            className="text-base md:text-lg leading-relaxed mb-9 max-w-2xl mx-auto"
            style={{ color: "rgba(247,241,232,0.72)" }}
          >
            {EVENT.tagline}
          </p>

          {/* Date / location */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-9 text-sm md:text-base" style={{ color: "#F7F1E8" }}>
            <span className="font-medium">{EVENT.date}</span>
            <span style={{ color: GOLD }}>•</span>
            <span className="font-medium">{EVENT.time}</span>
            <span style={{ color: GOLD }}>•</span>
            <span className="font-medium">{EVENT.venue}</span>
          </div>

          <Link
            href="#bilet"
            className="inline-block px-9 py-4 rounded-full text-base font-semibold uppercase tracking-wide transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #E56B6F 0%, #D84A4E 100%)",
              color: "#FFFFFF",
              boxShadow: "0 8px 20px rgba(229, 107, 111, 0.35)",
              letterSpacing: "0.05em",
            }}
          >
            Vreau bilet
          </Link>
          <p className="mt-4 text-sm" style={{ color: "rgba(247,241,232,0.75)" }}>
            {EVENT.price.current} · {EVENT.price.note.toLowerCase()}
          </p>
          <p className="mt-2 text-xs uppercase" style={{ color: GOLD, letterSpacing: "0.15em" }}>
            Participare exclusiv live · locuri limitate
          </p>
        </div>
      </section>

      {/* ================= DE CE ACUM ================= */}
      <section className="py-16 md:py-24">
        <div className="mx-auto px-4 sm:px-6 max-w-5xl w-full">
          <Eyebrow>De ce acum</Eyebrow>
          <SectionHeading>Îți sună cunoscut?</SectionHeading>

          <div className="grid sm:grid-cols-2 gap-4 md:gap-5 mt-12">
            {PAINS.map((text) => (
              <div key={text} className="flex items-start gap-4 rounded-2xl p-6" style={cardStyle}>
                <span
                  className="mt-1 flex-shrink-0 w-2 h-2 rounded-full"
                  style={{ backgroundColor: GOLD }}
                />
                <span className="text-base leading-relaxed" style={{ color: INK }}>
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* Punchline — card închis, clasy */}
          <div
            className="mt-8 rounded-2xl px-8 py-12 md:py-16 text-center"
            style={{ backgroundColor: INK, boxShadow: "0 20px 50px rgba(31,41,51,0.25)" }}
          >
            <p className="text-xs font-semibold uppercase mb-4" style={{ color: GOLD, letterSpacing: "0.2em" }}>
              Adevărul
            </p>
            <p
              className="text-2xl md:text-4xl leading-snug"
              style={{ color: "#FFFFFF", fontFamily: "var(--font-heading)" }}
            >
              Nu lipsa banilor e problema.
              <br />
              Ci lipsa unui <span style={{ color: GOLD }}>sistem clar</span> despre bani.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CE FACE DIFERIT ================= */}
      <section className="py-16 md:py-24">
        <div className="mx-auto px-4 sm:px-6 max-w-5xl w-full">
          <Eyebrow>Ce face diferit</Eyebrow>
          <SectionHeading>Psihologie + business + investiții</SectionHeading>
          <p className="text-center text-base md:text-lg mt-5 mb-14 max-w-2xl mx-auto" style={{ color: MUTED }}>
            Majoritatea evenimentelor vorbesc despre bani pe bucăți — ori psihologie,
            ori business, ori investiții. Aici le ai pe toate trei, într-un singur
            parcurs logic.
          </p>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {FLOW.map((f, i) => (
              <div key={f.label} className="relative rounded-2xl p-8 text-center" style={cardStyle}>
                <div
                  className="text-4xl mb-3"
                  style={{ color: GOLD, fontFamily: "var(--font-heading)" }}
                >
                  {i + 1}
                </div>
                <h3 className="text-xl mb-2" style={{ color: INK, fontFamily: "var(--font-heading)" }}>
                  {f.label}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STRUCTURA / MODULE ================= */}
      <section className="py-16 md:py-24">
        <div className="mx-auto px-4 sm:px-6 max-w-6xl w-full">
          <Eyebrow>Structura evenimentului</Eyebrow>
          <SectionHeading>Trei module, trei experți</SectionHeading>
          <p className="text-center text-base md:text-lg mt-5 mb-14 max-w-2xl mx-auto" style={{ color: MUTED }}>
            Un parcurs complet: cum gândești banii, cum construiești venit și cum îl
            faci să crească.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {MODULES.map((m) => (
              <div key={m.name} className="rounded-2xl overflow-hidden flex flex-col" style={cardStyle}>
                {/* Banner foto cu badge de modul */}
                <div className="relative w-full aspect-[4/5]">
                  <Image
                    src={m.photo}
                    alt={m.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                    style={{ objectPosition: m.imgPos }}
                  />
                  <span
                    className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-semibold uppercase"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.92)",
                      color: GOLD,
                      letterSpacing: "0.15em",
                    }}
                  >
                    Modul {m.no}
                  </span>
                </div>

                <div className="p-7 flex flex-col flex-1">
                  <h3 className="text-2xl mb-3" style={{ color: INK, fontFamily: "var(--font-heading)", lineHeight: 1.15 }}>
                    {m.moduleTitle}
                  </h3>

                  <div className="mb-4 pb-4 border-b" style={{ borderColor: "rgba(184,151,90,0.25)" }}>
                    <p className="text-sm font-semibold" style={{ color: INK }}>
                      {m.name}
                    </p>
                    <p className="text-xs uppercase tracking-wide mb-3" style={{ color: GOLD }}>
                      {m.role}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                      {m.bio}
                    </p>
                  </div>

                  <p className="text-sm italic mb-4" style={{ color: INK }}>
                    {m.focus}
                  </p>

                  <p className="text-sm font-semibold mb-3 mt-auto" style={{ color: INK }}>
                    {m.learnLabel}
                  </p>
                  <ul className="space-y-2">
                    {m.learn.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GOLD }} />
                        <span className="text-sm leading-relaxed" style={{ color: MUTED }}>
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PENTRU CINE + CE PRIMEȘTI ================= */}
      <section className="py-16 md:py-24">
        <div className="mx-auto px-4 sm:px-6 max-w-6xl w-full">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Pentru cine */}
            <div className="rounded-2xl p-8 md:p-10" style={cardStyle}>
              <p className="text-[11px] font-semibold uppercase mb-3" style={{ color: GOLD, letterSpacing: "0.2em" }}>
                Pentru cine este
              </p>
              <h3 className="text-2xl md:text-3xl mb-6" style={{ color: INK, fontFamily: "var(--font-heading)" }}>
                Este pentru tine dacă…
              </h3>
              <ul className="space-y-3">
                {AUDIENCE.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GOLD }} />
                    <span className="text-base leading-relaxed" style={{ color: INK }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ce primești */}
            <div className="rounded-2xl p-8 md:p-10" style={cardStyle}>
              <p className="text-[11px] font-semibold uppercase mb-3" style={{ color: GOLD, letterSpacing: "0.2em" }}>
                Ce primești
              </p>
              <h3 className="text-2xl md:text-3xl mb-6" style={{ color: INK, fontFamily: "var(--font-heading)" }}>
                Pleci de aici cu…
              </h3>
              <ul className="space-y-4">
                {BENEFITS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm"
                      style={{ backgroundColor: "rgba(184,151,90,0.12)", color: GOLD }}
                    >
                      ✓
                    </span>
                    <span className="text-base leading-relaxed" style={{ color: INK }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ce obții după — chips */}
          <div className="mt-8 rounded-2xl p-8 md:p-10 text-center" style={cardStyle}>
            <p className="text-[11px] font-semibold uppercase mb-5" style={{ color: GOLD, letterSpacing: "0.2em" }}>
              Ce obții după eveniment
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {OUTCOMES.map((o) => (
                <span
                  key={o}
                  className="px-5 py-2 rounded-full text-sm font-medium"
                  style={{ backgroundColor: "#faf6ee", border: "1px solid rgba(184,151,90,0.3)", color: INK }}
                >
                  {o}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= LOCAȚIE ================= */}
      <section className="py-16 md:py-24">
        <div className="mx-auto px-4 sm:px-6 max-w-4xl w-full">
          <Eyebrow>Locație</Eyebrow>
          <SectionHeading>Unde ne vedem</SectionHeading>
          <div className="mt-12 rounded-2xl p-10 md:p-12 text-center" style={cardStyle}>
            <div className="text-4xl mb-4">📍</div>
            <p className="text-3xl mb-2" style={{ color: INK, fontFamily: "var(--font-heading)" }}>
              {EVENT.venue}
            </p>
            <p className="text-base mb-6" style={{ color: INK }}>
              {EVENT.date} · {EVENT.time} · {EVENT.duration}
            </p>
            <div
              className="inline-flex items-start gap-3 text-left rounded-xl px-5 py-4 max-w-md"
              style={{ backgroundColor: "#faf6ee", border: "1px solid rgba(184,151,90,0.3)" }}
            >
              <span style={{ color: GOLD }}>🔒</span>
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                Adresa exactă a sălii o primești pe Telegram, imediat după înscriere.
                Numărul de locuri este limitat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BILET / PLATĂ ================= */}
      <section id="bilet" className="py-16 md:py-24">
        <div className="mx-auto px-4 sm:px-6 max-w-2xl w-full">
          <Eyebrow>Rezervare</Eyebrow>
          <SectionHeading>Rezervă-ți locul</SectionHeading>

          <div className="mt-12 rounded-2xl p-8 md:p-12 text-center" style={cardStyle}>
            <p className="text-sm uppercase tracking-wide mb-3" style={{ color: MUTED }}>
              Preț bilet
            </p>
            <div className="text-5xl md:text-6xl mb-3" style={{ color: INK, fontFamily: "var(--font-heading)" }}>
              {EVENT.price.current}
            </div>
            <div
              className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full mb-3"
              style={{ backgroundColor: "rgba(184,151,90,0.12)", border: `1px solid ${GOLD}` }}
            >
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: GOLD }}>
                {EVENT.price.note}
              </span>
            </div>
            <p className="text-sm mb-8" style={{ color: MUTED }}>
              apoi {EVENT.price.regular}
            </p>

            <TicketButton label="Vreau bilet" />
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="py-16 md:py-24">
        <div className="mx-auto px-4 sm:px-6 max-w-3xl w-full">
          <Eyebrow>Întrebări</Eyebrow>
          <SectionHeading>Întrebări frecvente</SectionHeading>
          <div className="mt-12 space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-2xl p-6 md:p-8" style={cardStyle}>
                <p className="text-base font-semibold mb-2" style={{ color: INK }}>
                  {item.q}
                </p>
                <p className="text-base leading-relaxed" style={{ color: MUTED }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
