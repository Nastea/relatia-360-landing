import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Intensivul trăiește pe liliadubita.md/intensiv (proiectul LMS); copia de aici trimite acolo.
  async redirects() {
    return [
      { source: '/intensiv', destination: 'https://www.liliadubita.md/intensiv', permanent: false },
    ];
  },
};

export default nextConfig;
