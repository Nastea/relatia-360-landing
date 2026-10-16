'use client';

import { useEffect } from 'react';

/** Marks each [data-reveal] section with data-in once it scrolls into view (CSS does the rest). */
export default function Reveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-in', '');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
