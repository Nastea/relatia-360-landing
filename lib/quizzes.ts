export type QuizResultKey = 'A' | 'B' | 'C' | 'D';

export type QuizQuestion = {
  prompt: string;
  options: [string, string, string, string];
};

export type QuizDefinition = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  questions: [QuizQuestion, QuizQuestion, QuizQuestion, QuizQuestion, QuizQuestion];
  internalResults: Record<QuizResultKey, string>;
};

export const QUIZZES: QuizDefinition[] = [
  {
    slug: 'de-ce-nu-te-aude-partenerul',
    title: 'De ce nu te aude partenerul?',
    subtitle: 'Află rapid ce blochează comunicarea dintre voi.',
    description: 'Claritate rapidă despre blocajul principal din comunicarea voastră.',
    questions: [
      {
        prompt: 'Când încerci să spui ceva important, cel mai des…',
        options: [
          'simt că tonul meu urcă fără să vreau',
          'explic mult, cu multe detalii',
          'deschid subiectul când deja sunt încărcată',
          'spun ce mă deranjează, dar nu și ce am nevoie',
        ],
      },
      {
        prompt: 'Partenerul tău reacționează cel mai des prin faptul că…',
        options: [
          'se aprinde de la felul în care spun',
          'pare că nu mai înțelege esența',
          'se închide, tace sau amână',
          'intră în defensivă foarte repede',
        ],
      },
      {
        prompt: 'Când nu te simți auzită, cum reacționezi cel mai des?',
        options: [
          'insist și mai mult',
          'explic și mai mult',
          'forțez discuția pe loc',
          'repet problema, dar nu spun clar de ce am nevoie',
        ],
      },
      {
        prompt: 'Ce te frustrează cel mai tare?',
        options: [
          'că reacționează la ton, nu la mesaj',
          'că după atâtea explicații tot nu înțelege',
          'că evită discuția și te lasă singură în tensiune',
          'că vorbiți despre simptome, nu despre problema reală',
        ],
      },
      {
        prompt: 'Care frază descrie cel mai bine situația voastră?',
        options: [
          'nu mă aude pentru că reacționează la tonul meu',
          'nu mă aude pentru că spun prea multe deodată',
          'nu mă aude pentru că se închide imediat',
          'nu mă aude pentru că nu spun clar ce am nevoie',
        ],
      },
    ],
    internalResults: {
      A: 'Ce blochează comunicarea dintre voi: tonul și tensiunea',
      B: 'Ce blochează comunicarea dintre voi: prea multe explicații',
      C: 'Ce blochează comunicarea dintre voi: închiderea și evitarea',
      D: 'Ce blochează comunicarea dintre voi: nevoia nespusă',
    },
  },
  {
    slug: 'de-ce-repetati-aceleasi-certuri',
    title: 'De ce repetați mereu aceleași certuri?',
    subtitle: 'Descoperă ce reaprinde între voi același conflict.',
    description: 'Vezi ce reaprinde între voi același conflict, iar și iar.',
    questions: [
      {
        prompt: 'Cele mai frecvente certuri dintre voi apar în jurul…',
        options: [
          'banilor, cheltuielilor, responsabilităților',
          'timpului petrecut împreună',
          'suspiciunilor, explicațiilor, geloziei',
          'felului în care „trebuie” făcute lucrurile',
        ],
      },
      {
        prompt: 'Ce te doare cel mai tare în aceste certuri?',
        options: [
          'că nu simt stabilitate',
          'că nu mă simt aleasă',
          'că nu mă simt în siguranță emoțional',
          'că mă simt controlată sau corectată',
        ],
      },
      {
        prompt: 'Ce se repetă cel mai des?',
        options: [
          'reproșuri legate de bani sau asumare',
          'promisiuni legate de timp care nu se respectă',
          'tensiuni din cauza neîncrederii',
          'critici, indicații sau presiune',
        ],
      },
      {
        prompt: 'După ceartă, cel mai des rămâne…',
        options: [
          'frică de viitor sau instabilitate',
          'distanță și tristețe',
          'neliniște și scenarii în minte',
          'revoltă sau închidere',
        ],
      },
      {
        prompt: 'Care propoziție seamănă cel mai mult cu adevărul dintre voi?',
        options: [
          'nu ne simțim în siguranță împreună',
          'nu ne alegem unul pe altul cu adevărat',
          'între noi există prea multă nesiguranță',
          'între noi există prea multă presiune',
        ],
      },
    ],
    internalResults: {
      A: 'Ce reaprinde aceleași certuri: lupta pentru siguranță',
      B: 'Ce reaprinde aceleași certuri: lipsa de prioritate',
      C: 'Ce reaprinde aceleași certuri: nesiguranța dintre voi',
      D: 'Ce reaprinde aceleași certuri: lupta pentru control',
    },
  },
  {
    slug: 'de-ce-va-certati-atat-de-des',
    title: 'De ce vă certați atât de des?',
    subtitle: 'Înțelege de ce apare atât de des tensiunea dintre voi.',
    description: 'Află de ce tensiunea dintre voi apare atât de frecvent.',
    questions: [
      {
        prompt: 'Cel mai des, certurile dintre voi pornesc pentru că…',
        options: [
          'vă aprindeți foarte repede',
          'se adună prea multe lucruri nespuse',
          'unul evită până când celălalt explodează',
          'vă atingeți unul altuia punctele sensibile',
        ],
      },
      {
        prompt: 'Cum începe, de obicei, o ceartă între voi?',
        options: [
          'dintr-un lucru mic, totul escaladează repede',
          'după o perioadă în care s-au adunat multe',
          'unul vrea să vorbească, celălalt se retrage',
          'unul spune ceva care îl rănește profund pe celălalt',
        ],
      },
      {
        prompt: 'Ce se întâmplă cel mai des între voi?',
        options: [
          'reacționați prea impulsiv',
          'lăsați prea multe nerezolvate',
          'nu sunteți disponibili în același timp pentru discuție',
          'vă activați reciproc dureri mai vechi',
        ],
      },
      {
        prompt: 'După ce vă certați, cel mai des simți că…',
        options: [
          'totul a scăpat de sub control prea repede',
          'problema era mai veche, nu doar cea de acum',
          'iar n-ați reușit să vorbiți în același ritm',
          'v-ați rănit mai mult decât era cazul',
        ],
      },
      {
        prompt: 'Care frază descrie cel mai bine situația voastră?',
        options: [
          'ne aprindem prea repede',
          'lăsăm prea multe să se adune',
          'unul vrea să rezolve, altul evită',
          'ne lovim exact unde doare mai tare',
        ],
      },
    ],
    internalResults: {
      A: 'De ce vă certați atât de des: reacționați prea impulsiv',
      B: 'De ce vă certați atât de des: se adună prea multe lucruri',
      C: 'De ce vă certați atât de des: unul insistă, altul evită',
      D: 'De ce vă certați atât de des: vă activați unul altuia rănile',
    },
  },
  {
    slug: 'tiparul-vostru-de-conflict',
    title: 'Care este tiparul vostru de conflict?',
    subtitle: 'Vezi dinamica ce se repetă între voi în tensiune.',
    description: 'Identifică dinamica ce se repetă între voi în momente tensionate.',
    questions: [
      {
        prompt: 'Când apare tensiunea între voi, cel mai des…',
        options: [
          'amândoi ridicați intensitatea',
          'vorbiți mult, dar nu ajungeți nicăieri',
          'unul insistă, celălalt se retrage',
          'vă răniți subtil, apoi rămâne distanță',
        ],
      },
      {
        prompt: 'În timpul unei certuri, cel mai des simți că…',
        options: [
          'totul se transformă rapid în confruntare',
          'discuția se învârte în cerc',
          'alergi după o conversație care nu se întâmplă',
          'rămân lucruri spuse care dor mult',
        ],
      },
      {
        prompt: 'Cum se termină, de obicei, conflictul dintre voi?',
        options: [
          'prin explozie, oboseală sau ruptură de moment',
          'fără concluzie clară, după multe explicații',
          'prin retragere, tăcere sau amânare',
          'aparent se oprește, dar rămâne rece între voi',
        ],
      },
      {
        prompt: 'Ce se repetă cel mai des în certurile voastre?',
        options: [
          'reacții puternice și escaladare',
          'aceleași discuții fără rezolvare',
          'alergare după celălalt și evitare',
          'înțepături, răni și distanță',
        ],
      },
      {
        prompt: 'Care formulare vă descrie cel mai bine?',
        options: [
          'vă confruntați prea intens',
          'vă pierdeți în discuții fără sfârșit',
          'unul urmărește, altul fuge',
          'vă răniți și apoi vă îndepărtați',
        ],
      },
    ],
    internalResults: {
      A: 'Tiparul vostru de conflict: confruntare și escaladare',
      B: 'Tiparul vostru de conflict: discuții în cerc',
      C: 'Tiparul vostru de conflict: unul urmărește, altul evită',
      D: 'Tiparul vostru de conflict: răni și distanță',
    },
  },
];

export function getQuizBySlug(slug: string): QuizDefinition | undefined {
  return QUIZZES.find((quiz) => quiz.slug === slug);
}

export function getResultFromAnswers(answers: number[]): QuizResultKey {
  const keys: QuizResultKey[] = ['A', 'B', 'C', 'D'];
  const score: Record<QuizResultKey, number> = { A: 0, B: 0, C: 0, D: 0 };

  answers.forEach((optionIndex) => {
    const key = keys[optionIndex];
    if (key) score[key] += 1;
  });

  const maxScore = Math.max(...Object.values(score));
  const tied = keys.filter((k) => score[k] === maxScore);

  if (tied.length === 1) return tied[0];

  // Tie-break: answer from question 5 wins if it belongs to tied results.
  const q5 = answers[4];
  const q5Key = keys[q5];
  if (q5Key && tied.includes(q5Key)) return q5Key;

  // Stable fallback
  return tied[0];
}
