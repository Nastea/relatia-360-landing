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
            {/* Comerciant */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                1. Comerciant
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  <strong style={{ color: "#1F2933" }}>Denumire:</strong> Danex Prim SRL
                </p>
                <p>
                  <strong style={{ color: "#1F2933" }}>Adresă:</strong> mun. Chișinău, sec. Buiucani, str. Calea Ieșilor, 11
                </p>
                <p>
                  <strong style={{ color: "#1F2933" }}>Telefon:</strong> 067102290
                </p>
              </div>
            </section>

            {/* Produs */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                2. Produs
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Comerciantul comercializează <strong style={{ color: "#1F2933" }}>acces digital la cursul "Relația 360 - De la conflict la conectare"</strong>, un curs online de comunicare în relații.
                </p>
                <p>
                  Cursul include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>5 lecții practice video</li>
                  <li>Exerciții aplicate</li>
                  <li>Caiet practic PDF</li>
                  <li>Acces online imediat</li>
                  <li>Acces pe viață</li>
                </ul>
              </div>
            </section>

            {/* Preț */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                3. Preț și Plată
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Prețul cursului este afișat clar pe pagina de prezentare și este exprimat în lei (MDL), inclusiv TVA, dacă este cazul.
                </p>
                <p>
                  Plata se efectuează online prin metodele de plată disponibile pe platformă.
                </p>
              </div>
            </section>

            {/* Livrare */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                4. Livrare
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  <strong style={{ color: "#1F2933" }}>Accesul la curs este livrat instant</strong> după confirmarea plății.
                </p>
                <p>
                  Clientul primește accesul la materialele cursului imediat după finalizarea cu succes a plății, prin email sau prin platforma de acces.
                </p>
                <p>
                  <strong style={{ color: "#1F2933" }}>Accesul este valabil pe viață</strong> - odată cumpărat, clientul poate accesa materialele cursului fără limitare de timp.
                </p>
              </div>
            </section>

            {/* Drept de retur */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                5. Drept de Retur și Rambursare
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Conform legislației în vigoare privind protecția consumatorilor, pentru produse digitale:
                </p>
                <p>
                  <strong style={{ color: "#1F2933" }}>Nu se acordă rambursare</strong> după ce clientul a primit accesul la materialele cursului digital.
                </p>
                <p>
                  Rambursarea poate fi solicitată doar înainte de primirea accesului la curs, în cazul în care există probleme tehnice care împiedică livrarea produsului.
                </p>
                <p>
                  Pentru solicitări de rambursare, contactați comerciantul la adresa de email sau telefon indicată mai jos.
                </p>
              </div>
            </section>

            {/* Responsabilități */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                6. Responsabilități
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Comerciantul se angajează să furnizeze accesul la curs conform descrierii prezentate.
                </p>
                <p>
                  Clientul este responsabil pentru:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Păstrarea confidențialității datelor de acces</li>
                  <li>Utilizarea materialelor cursului în scop personal, fără distribuire sau revânzare</li>
                  <li>Respectarea drepturilor de autor asupra materialelor</li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                7. Contact
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Pentru întrebări, solicitări sau reclamații, puteți contacta:
                </p>
                <div className="p-6 rounded-lg" style={{ backgroundColor: "#faf8f5" }}>
                  <p><strong style={{ color: "#1F2933" }}>Danex Prim SRL</strong></p>
                  <p>mun. Chișinău, sec. Buiucani, str. Calea Ieșilor, 11</p>
                  <p>Telefon: 067102290</p>
                </div>
              </div>
            </section>

            {/* Modificări */}
            <section>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4 uppercase"
                style={{ color: "#1F2933" }}
              >
                8. Modificări
              </h2>
              <div className="space-y-3 text-lg" style={{ color: "#6B7280" }}>
                <p>
                  Comerciantul își rezervă dreptul de a modifica acești termeni și condiții. Modificările vor fi publicate pe această pagină.
                </p>
                <p>
                  Utilizarea continuă a serviciului după modificarea termenilor constituie acceptarea noilor condiții.
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

