import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer 
      className="w-full py-12 md:py-16 border-t"
      style={{ 
        backgroundColor: "#FFFFFF",
        borderColor: "#e5d9c8",
      }}
    >
      <div className="mx-auto px-4 sm:px-6 max-w-7xl w-full">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-8">
          {/* Company Info */}
          <div>
            <h3 
              className="text-lg font-semibold mb-4 uppercase"
              style={{ color: "#1F2933" }}
            >
              Danex Prim SRL
            </h3>
            <div className="space-y-2 text-sm" style={{ color: "#6B7280" }}>
              <p>mun. Chișinău, sec. Buiucani</p>
              <p>str. Calea Ieșilor, 11</p>
              <p className="mt-3">
                <a 
                  href="tel:067102290" 
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: "#1F2933" }}
                >
                  Tel: 067102290
                </a>
              </p>
              <p>
                <a 
                  href="mailto:danexprim@liliadubita.md" 
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: "#1F2933" }}
                >
                  danexprim@liliadubita.md
                </a>
              </p>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h3 
              className="text-lg font-semibold mb-4 uppercase"
              style={{ color: "#1F2933" }}
            >
              Informații Legale
            </h3>
            <nav className="space-y-2">
              <Link 
                href="/termeni"
                className="block text-sm hover:opacity-80 transition-opacity"
                style={{ color: "#6B7280" }}
              >
                Termeni și Condiții
              </Link>
              <Link 
                href="/confidentialitate"
                className="block text-sm hover:opacity-80 transition-opacity"
                style={{ color: "#6B7280" }}
              >
                Politică de Confidențialitate
              </Link>
            </nav>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 
              className="text-lg font-semibold mb-4 uppercase"
              style={{ color: "#1F2933" }}
            >
              Metode de Plată
            </h3>
            <div className="flex flex-wrap gap-3 items-center">
              {/* Visa Logo */}
              <div className="flex items-center justify-center w-20 h-12 rounded bg-white border px-2" style={{ borderColor: "#e5d9c8" }}>
                <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <text x="5" y="15" fontSize="14" fontWeight="bold" fill="#1434CB" fontFamily="Arial, sans-serif">VISA</text>
                </svg>
              </div>
              
              {/* Mastercard Logo */}
              <div className="flex items-center justify-center w-20 h-12 rounded bg-white border px-2" style={{ borderColor: "#e5d9c8" }}>
                <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="10" r="7" fill="#EB001B"/>
                  <circle cx="20" cy="10" r="7" fill="#F79E1B"/>
                  <path d="M14 10C14 7.2 16.2 5 19 5C21.8 5 24 7.2 24 10C24 12.8 21.8 15 19 15C16.2 15 14 12.8 14 10Z" fill="#FF5F00"/>
                </svg>
              </div>
              
              {/* Paynet Logo */}
              <div className="flex items-center justify-center w-24 h-12 rounded bg-white border px-2" style={{ borderColor: "#e5d9c8" }}>
                <Image
                  src="/images/paynet.png"
                  alt="Paynet"
                  width={80}
                  height={32}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t text-center text-sm" style={{ borderColor: "#e5d9c8", color: "#6B7280" }}>
          <p>© {new Date().getFullYear()} Danex Prim SRL. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
}

