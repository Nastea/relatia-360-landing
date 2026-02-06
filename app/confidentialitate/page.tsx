import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politică de Confidențialitate | Relația 360",
  description: "Politică de confidențialitate și protecția datelor personale pentru cursul Relația 360",
};

export default function ConfidentialitatePage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: "linear-gradient(to bottom, #f5ede3, #ebdfce)" }}>
      <section className="py-20 md:py-32">
        <div className="mx-auto px-4 sm:px-6 max-w-4xl w-full">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-12 text-center uppercase"
            style={{ 
              color: "#1F2933",
              letterSpacing: "-0.02em",
              lineHeight: "1.1",
            }}
          >
            POLITICĂ DE<br />
            CONFIDENȚIALITATE
          </h1>

          <div 
            className="rounded-2xl p-8 md:p-12 space-y-8"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
            }}
          >
            {/* Operator */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                1. Operator de Date
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  <strong style={{ color: "#1F2933" }}>Operator de date cu caracter personal:</strong>
                </p>
                <div className="p-6 rounded-lg" style={{ backgroundColor: "#faf8f5" }}>
                  <p><strong style={{ color: "#1F2933" }}>Danex Prim SRL</strong></p>
                  <p>mun. Chișinău, sec. Buiucani, str. Calea Ieșilor, 11</p>
                  <p>Telefon: 067102290</p>
                </div>
              </div>
            </section>

            {/* Date colectate */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                2. Date cu Caracter Personal Colectate
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  În cadrul activității noastre, colectăm următoarele categorii de date cu caracter personal:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong style={{ color: "#1F2933" }}>Nume</strong> - pentru identificare și personalizare</li>
                  <li><strong style={{ color: "#1F2933" }}>Adresă de email</strong> - pentru comunicare, livrare acces și suport</li>
                  <li><strong style={{ color: "#1F2933" }}>Telegram user ID</strong> - dacă utilizați Telegram pentru comunicare</li>
                  <li><strong style={{ color: "#1F2933" }}>Adresă IP și date de analytics</strong> - pentru analiza traficului și îmbunătățirea serviciului</li>
                </ul>
                <p className="mt-4">
                  <strong style={{ color: "#1F2933" }}>Important:</strong> Nu stocăm date de plată (număr card, CVV, etc.). Toate tranzacțiile financiare sunt procesate prin intermediul procesatorilor de plăți autorizați, care respectă standardele de securitate PCI DSS.
                </p>
              </div>
            </section>

            {/* Scop */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                3. Scopul Prelucrării
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Datele cu caracter personal sunt prelucrate în următoarele scopuri:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong style={{ color: "#1F2933" }}>Livrare acces la curs</strong> - pentru furnizarea accesului la materialele cursului digital</li>
                  <li><strong style={{ color: "#1F2933" }}>Suport clienți</strong> - pentru răspunderea la întrebări și rezolvarea problemelor</li>
                  <li><strong style={{ color: "#1F2933" }}>Contabilitate și facturare</strong> - pentru emiterea facturilor și îndeplinirea obligațiilor fiscale</li>
                  <li><strong style={{ color: "#1F2933" }}>Îmbunătățire servicii</strong> - pentru analiza utilizării și îmbunătățirea experienței utilizatorului</li>
                  <li><strong style={{ color: "#1F2933" }}>Comunicare</strong> - pentru trimiterea de informații relevante despre curs și actualizări</li>
                </ul>
              </div>
            </section>

            {/* Temei legal */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                4. Temei Legal pentru Prelucrare
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Prelucrarea datelor cu caracter personal se bazează pe:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong style={{ color: "#1F2933" }}>Executarea contractului</strong> - pentru livrarea accesului la curs și îndeplinirea obligațiilor contractuale</li>
                  <li><strong style={{ color: "#1F2933" }}>Consimțământul</strong> - pentru comunicări de marketing și newsletter (dacă aplicabil)</li>
                  <li><strong style={{ color: "#1F2933" }}>Obligații legale</strong> - pentru îndeplinirea obligațiilor fiscale și contabile</li>
                  <li><strong style={{ color: "#1F2933" }}>Interese legitime</strong> - pentru îmbunătățirea serviciilor și analiza utilizării</li>
                </ul>
              </div>
            </section>

            {/* Durata */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                5. Durata Păstrării Datelor
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Datele cu caracter personal sunt păstrate:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Pentru durata necesară îndeplinirii scopurilor pentru care au fost colectate</li>
                  <li>Conform termenelor legale de păstrare pentru documentele contabile (de obicei 7 ani)</li>
                  <li>Până la retragerea consimțământului (dacă prelucrarea se bazează pe consimțământ)</li>
                </ul>
              </div>
            </section>

            {/* Drepturi GDPR */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                6. Drepturile Dvs. (GDPR)
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Conform Regulamentului General privind Protecția Datelor (GDPR), aveți următoarele drepturi:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong style={{ color: "#1F2933" }}>Dreptul de acces</strong> - puteți solicita informații despre datele dvs. prelucrate</li>
                  <li><strong style={{ color: "#1F2933" }}>Dreptul la rectificare</strong> - puteți solicita corectarea datelor inexacte</li>
                  <li><strong style={{ color: "#1F2933" }}>Dreptul la ștergere</strong> - puteți solicita ștergerea datelor (în anumite condiții)</li>
                  <li><strong style={{ color: "#1F2933" }}>Dreptul la restricționarea prelucrării</strong> - puteți solicita limitarea prelucrării</li>
                  <li><strong style={{ color: "#1F2933" }}>Dreptul la portabilitatea datelor</strong> - puteți solicita transferul datelor către alt operator</li>
                  <li><strong style={{ color: "#1F2933" }}>Dreptul de opoziție</strong> - puteți vă opune anumitor tipuri de prelucrare</li>
                  <li><strong style={{ color: "#1F2933" }}>Dreptul de a retrage consimțământul</strong> - dacă prelucrarea se bazează pe consimțământ</li>
                </ul>
                <p className="mt-4">
                  Pentru exercitarea acestor drepturi, vă rugăm să ne contactați la adresa de email sau telefon indicată mai jos.
                </p>
              </div>
            </section>

            {/* Partajare date */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                7. Partajarea Datelor
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Datele dvs. pot fi partajate cu:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong style={{ color: "#1F2933" }}>Procesatori de plăți</strong> - pentru procesarea tranzacțiilor (fără stocare date card)</li>
                  <li><strong style={{ color: "#1F2933" }}>Furnizori de servicii IT</strong> - pentru hosting și suport tehnic (sub contract strict)</li>
                  <li><strong style={{ color: "#1F2933" }}>Autorități competente</strong> - dacă este cerut legal</li>
                </ul>
                <p className="mt-4">
                  Nu vindem sau închiriem datele dvs. către terți în scopuri de marketing.
                </p>
              </div>
            </section>

            {/* Securitate */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                8. Securitatea Datelor
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Implementăm măsuri tehnice și organizatorice adecvate pentru protejarea datelor dvs.:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Criptare a datelor sensibile</li>
                  <li>Acces restricționat la date (doar personal autorizat)</li>
                  <li>Backup-uri regulate</li>
                  <li>Actualizări de securitate</li>
                </ul>
              </div>
            </section>

            {/* Cookie-uri */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                9. Cookie-uri și Tehnologii Similar
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Site-ul nostru poate utiliza cookie-uri și tehnologii similare pentru:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Funcționalitatea site-ului</li>
                  <li>Analiza traficului și comportamentului utilizatorilor</li>
                  <li>Îmbunătățirea experienței utilizatorului</li>
                </ul>
                <p className="mt-4">
                  Puteți gestiona preferințele pentru cookie-uri prin setările browser-ului dvs.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                10. Contact
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Pentru întrebări despre prelucrarea datelor dvs. cu caracter personal sau pentru exercitarea drepturilor GDPR, puteți contacta:
                </p>
                <div className="p-6 rounded-lg" style={{ backgroundColor: "#faf8f5" }}>
                  <p><strong style={{ color: "#1F2933" }}>Danex Prim SRL</strong></p>
                  <p>mun. Chișinău, sec. Buiucani, str. Calea Ieșilor, 11</p>
                  <p>Telefon: 067102290</p>
                </div>
                <p className="mt-4">
                  Aveți dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal dacă considerați că prelucrarea datelor dvs. încalcă legislația în vigoare.
                </p>
              </div>
            </section>

            {/* Modificări */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                11. Modificări
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Ne rezervăm dreptul de a actualiza această politică de confidențialitate. Modificările vor fi publicate pe această pagină.
                </p>
                <p>
                  Vă recomandăm să consultați periodic această pagină pentru a fi la curent cu politicile noastre.
                </p>
              </div>
            </section>

            <div className="pt-8 mt-8 border-t" style={{ borderColor: "#e5d9c8" }}>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

