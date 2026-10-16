// Contenuti del nastro orizzontale.
// Prima i prodotti, ognuno con un pannello a tutto schermo; poi i siti, raccolti insieme in un solo pannello.

export type Fondo = 'carta' | 'cartoncino' | 'arancio' | 'nero';
// Scene della scimmietta: ogni sezione ne dichiara una con data-scena (vedi SCENE in scripts/scimmia.ts)
export type Scena = 'hero' | 'base' | 'hando' | 'bosco' | 'siti' | 'metodo' | 'contatti';

export interface Media { src: string; alt: string }
export interface Link { url: string; etichetta: string }

export interface Prodotto {
  nome: string;
  // heavy = pesante e stretto, light = leggero e largo: alternarli dà ritmo al nastro
  peso: 'heavy' | 'light';
  // Nomi lunghi (oltre ~10 caratteri) vanno rimpiccioliti per non uscire dallo schermo
  lungo?: boolean;
  fondo: Fondo;
  meta: string;
  testo: string;
  link?: Link;
  // Senza media il pannello mostra un riquadro "Registrazione da aggiungere"
  media?: Media;
  // Più schermate dentro la cornice di un tablet, al posto del riquadro: cambiano mentre il pannello attraversa lo schermo
  schermi?: Media[];
  scena: Scena;
}

export interface Sito {
  nome: string;
  meta: string;
  testo: string;
  link?: Link;
  media?: Media;
}

export const prodotti: Prodotto[] = [
  {
    nome: 'Hando',
    peso: 'heavy',
    fondo: 'arancio',
    scena: 'hando',
    meta: 'Il mio SaaS, in sviluppo',
    // Niente link: handoapp.it ha ancora il listino e il pagamento non funzionanti
    testo: 'Un portale per freelance che lavorano con clienti. Ogni progetto ha il suo link: il cliente vede le fasi, i file e le note e approva le anteprime, senza registrarsi.',
    schermi: [
      { src: '/assets/hando/hando-1.webp', alt: 'Hando: la panoramica dei progetti in corso, con i numeri e l\'elenco dei clienti' },
      { src: '/assets/hando/hando-4.webp', alt: 'Hando: la scheda di un progetto, con il link da condividere col cliente e l\'avanzamento per fasi, e sotto le anteprime approvate dal cliente' },
    ],
  },
  {
    nome: 'Il Bosco di Bobo',
    peso: 'light',
    lungo: true,
    fondo: 'nero',
    scena: 'bosco',
    meta: 'Startup, ruolo da CTO',
    testo: 'Il marketplace della legna. Sono il CTO e la sviluppatrice: al momento lavoro al portale per i fornitori e al percorso per i privati, dalla richiesta al preventivo.',
    schermi: [
      { src: '/assets/bosco/bosco-1.webp', alt: 'Il Bosco di Bobo: la sezione "Come funziona", in cinque passi dalla richiesta alla consegna della legna' },
      { src: '/assets/bosco/bosco-2.webp', alt: 'Il Bosco di Bobo: il supporto umano, l\'invito a cercare la legna nella propria zona e il piè di pagina' },
    ],
  },
];

// Il pannello dei siti è pensato per 2 voci affiancate; con 3 o 4 le schede si restringono da sole
export const siti: Sito[] = [
  {
    nome: 'duezero.eu',
    meta: 'Sito istituzionale, tirocinio',
    testo: 'Ho rifatto il sito di Due.Zero, che si occupa di comunicazione tecnica.',
    link: { url: 'https://duezero.eu', etichetta: 'Apri il sito' },
    media: { src: '/assets/progetti/duezero.webp', alt: 'La homepage di duezero.eu.' },
  },
  {
    nome: 'Hyper.Parts',
    meta: 'Single page, in sviluppo',
    testo: 'Una single page per accedere a documentazione e ricambi delle macchine: login, richiesta di accesso e QR per aprire l\'app. La sto sviluppando per Due.Zero.',
    media: { src: '/assets/progetti/hyperparts.webp', alt: 'La pagina di accesso di Hyper.Parts: login, richiesta di accesso e QR dell\'app, davanti a una linea di produzione.' },
  },
];
