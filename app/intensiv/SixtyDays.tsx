'use client';

import { useState } from 'react';

const MONTHS = [
  'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
  'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie',
];

function dayDate(start: string, day: number): string {
  const d = new Date(`${start}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + day - 1);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** The live thing: the 60 days of the plan as squares; tap one to see its date. */
export default function SixtyDays({ start }: { start: string }) {
  const [day, setDay] = useState(60);

  return (
    <div className="ix-days">
      <p className="ix-days-readout" aria-live="polite">
        <span className="ix-days-num">Ziua {day}</span>
        <span>{dayDate(start, day)}</span>
      </p>
      <div className="ix-days-grid" role="group" aria-label="Cele 60 de zile ale planului">
        {Array.from({ length: 60 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            className="ix-day"
            data-on={n <= day ? '' : undefined}
            aria-pressed={n === day}
            aria-label={`Ziua ${n}, ${dayDate(start, n)}`}
            onClick={() => setDay(n)}
            onMouseEnter={() => setDay(n)}
          />
        ))}
      </div>
      <p className="ix-days-note">
        Ziua 1 e chiar ziua intensivului. Atinge orice zi ca să vezi unde vei fi cu planul.
      </p>
    </div>
  );
}
