import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni și Condiții | Relația 360",
  description: "Termeni și condiții pentru cursul Relația 360 - De la conflict la conectare",
};

export default function TermeniPage() {
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
            TERMENI ȘI<br />
            CONDIȚII
          </h1>

          <div 
            className="rounded-2xl p-8 md:p-12 space-y-8"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
            }}
          >
            {/* Datele Comerciantului */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                1. Datele Comerciantului
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  <strong style={{ color: "#1F2933" }}>Denumire juridică:</strong> Danex Prim SRL
                </p>
                <p>
                  <strong style={{ color: "#1F2933" }}>IDNO:</strong> 1006600027352
                </p>
                <p>
                  <strong style={{ color: "#1F2933" }}>Adresa juridică:</strong> mun. Chișinău, sec. Buiucani, str. Calea Ieșilor, 11
                </p>
                <p>
                  <strong style={{ color: "#1F2933" }}>Telefon:</strong> 067102290
                </p>
                <p>
                  <strong style={{ color: "#1F2933" }}>Email:</strong> danexprim@liliadubita.md
                </p>
                <p>
                  Societatea desfășoară activitate comercială conform legislației Republicii Moldova.
                </p>
              </div>
            </section>

            {/* Obiectul Contractului */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                2. Obiectul Contractului
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Comerciantul oferă acces digital la cursul online:
                </p>
                <p className="font-semibold" style={{ color: "#1F2933" }}>
                  „Relația 360 – De la conflict la conectare"
                </p>
                <p>
                  Cursul include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>5 lecții video</li>
                  <li>exerciții practice</li>
                  <li>caiet practic în format PDF</li>
                  <li>acces online pe platformă securizată</li>
                </ul>
                <p>
                  Prin efectuarea plății, clientul încheie un contract la distanță pentru furnizarea de conținut digital.
                </p>
              </div>
            </section>

            {/* Acces și Durată */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                3. Acces și Durată
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Accesul la curs este acordat pentru o perioadă de <strong style={{ color: "#1F2933" }}>6 luni</strong> din momentul confirmării plății.
                </p>
                <p>
                  După expirarea perioadei de 6 luni, accesul poate fi suspendat sau dezactivat.
                </p>
                <p>
                  Accesul este personal și netransferabil.
                </p>
              </div>
            </section>

            {/* Preț și Modalități de Plată */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                4. Preț și Modalități de Plată
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Prețul este afișat pe pagina de prezentare și este exprimat în lei (MDL), incluzând TVA, dacă este cazul.
                </p>
                <p>
                  Plata se efectuează online prin metodele disponibile pe site (ex: Visa, Paynet sau alte metode active la momentul achiziției).
                </p>
                <p>
                  <strong style={{ color: "#1F2933" }}>Comerciantul nu stochează datele cardurilor bancare.</strong>
                </p>
              </div>
            </section>

            {/* Livrarea Conținutului Digital */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                5. Livrarea Conținutului Digital
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Accesul la curs este oferit imediat după confirmarea plății.
                </p>
                <p>
                  Clientul primește accesul:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>prin email</li>
                  <li>sau prin cont creat pe platforma de curs</li>
                </ul>
                <p>
                  Livrarea este considerată finalizată în momentul în care accesul este pus la dispoziția clientului.
                </p>
              </div>
            </section>

            {/* Dreptul de Retragere și Politica de Rambursare */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                6. Dreptul de Retragere și Politica de Rambursare
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Conform legislației privind protecția consumatorilor, în cazul contractelor la distanță, consumatorul are dreptul de retragere în termen de 14 zile.
                </p>
                <p>
                  Totuși, conform excepției aplicabile conținutului digital:
                </p>
                <p>
                  Prin efectuarea plății și accesarea cursului, clientul își exprimă acordul expres pentru furnizarea imediată a conținutului digital și confirmă că înțelege că își pierde dreptul de retragere după începerea furnizării acestuia.
                </p>
                <p>
                  <strong style={{ color: "#1F2933" }}>Nu se acordă rambursări după activarea accesului la curs.</strong>
                </p>
                <p>
                  Rambursarea poate fi analizată doar în cazul în care:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>plata a fost procesată, dar accesul nu a fost livrat din motive tehnice imputabile comerciantului</li>
                  <li>există dublă plată confirmată</li>
                </ul>
                <p>
                  Solicitările se trimit în scris la adresa de email indicată.
                </p>
              </div>
            </section>

            {/* Responsabilitățile Clientului */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                7. Responsabilitățile Clientului
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Clientul este responsabil pentru:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>păstrarea confidențialității datelor de acces</li>
                  <li>utilizarea materialelor exclusiv în scop personal</li>
                  <li>ne-distribuirea, copierea sau revânzarea conținutului</li>
                </ul>
                <p>
                  Orice utilizare neautorizată poate atrage răspundere civilă conform legislației privind drepturile de autor.
                </p>
              </div>
            </section>

            {/* Proprietate Intelectuală */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                8. Proprietate Intelectuală
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Toate materialele din cadrul cursului sunt protejate de legislația privind drepturile de autor.
                </p>
                <p>
                  Este interzisă:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>copierea</li>
                  <li>distribuirea</li>
                  <li>reproducerea</li>
                  <li>înregistrarea</li>
                  <li>comercializarea materialelor</li>
                </ul>
                <p>
                  fără acordul scris al Comerciantului.
                </p>
              </div>
            </section>

            {/* Limitarea Răspunderii */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                9. Limitarea Răspunderii
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Cursul are caracter educațional și informativ.
                </p>
                <p>
                  Comerciantul nu garantează rezultate specifice în viața personală sau profesională a clientului.
                </p>
                <p>
                  Clientul își asumă responsabilitatea pentru aplicarea informațiilor primite.
                </p>
                <p>
                  Comerciantul nu este responsabil pentru:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>întreruperi temporare ale platformei</li>
                  <li>probleme tehnice independente de voința sa</li>
                  <li>utilizarea necorespunzătoare a conținutului</li>
                </ul>
              </div>
            </section>

            {/* Forță Majoră */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                10. Forță Majoră
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Comerciantul nu poate fi tras la răspundere pentru neexecutarea obligațiilor cauzată de evenimente de forță majoră.
                </p>
              </div>
            </section>

            {/* Protecția Datelor */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                11. Protecția Datelor
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Datele personale sunt prelucrate conform Politicii de Confidențialitate disponibile pe site.
                </p>
              </div>
            </section>

            {/* Litigii și Legea Aplicabilă */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                12. Litigii și Legea Aplicabilă
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Prezentul contract este guvernat de legislația Republicii Moldova.
                </p>
                <p>
                  Eventualele litigii vor fi soluționate pe cale amiabilă, iar în caz contrar de instanțele competente din Republica Moldova.
                </p>
              </div>
            </section>

            {/* Modificarea Termenilor */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                13. Modificarea Termenilor
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Comerciantul își rezervă dreptul de a modifica acești termeni.
                </p>
                <p>
                  Versiunea aplicabilă este cea publicată pe site la data efectuării comenzii.
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

