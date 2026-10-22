import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Caietul intensivului se citește din private/ de funcțiile care trimit emailul de plată.
  outputFileTracingIncludes: {
    '/api/paynet/**': ['./private/caiet-intensiv.pdf'],
    '/api/cron/**': ['./private/caiet-intensiv.pdf'],
  },
  // Intensivul trăiește pe liliadubita.md/intensiv (proiectul LMS); copia de aici trimite acolo.
  async redirects() {
    return [
      { source: '/intensiv', destination: 'https://www.liliadubita.md/intensiv', permanent: false },
    ];
  },
};

export default nextConfig;
