// Scimmietta: parte seduta sul punto di "costruisco.", scende sul bordo basso e cammina con lo scroll.
// In ogni sezione (data-scena) cambia posa: cammina con l'oggetto della scena o, quando ti fermi, si mette in posa.
import { ScrollTrigger, reduce } from './scroll';
import { NASTRO } from '../config';
import type { Scena } from '../data/progetti';

interface Posa { src: string; scala: number; fondo: number }

// scala: porta la testa alla stessa larghezza in tutte le pose; fondo: riga dei piedi nell'immagine (su 600 px)
const POSE: Record<string, Posa> = {
  base: { src: '/assets/scimmia/base.webp', scala: .92, fondo: 541 },
  cammina1: { src: '/assets/scimmia/cammina-1.webp', scala: 1, fondo: 555 },
  passaggio: { src: '/assets/scimmia/passaggio.webp', scala: 1, fondo: 556 },
  cammina2: { src: '/assets/scimmia/cammina-2.webp', scala: 1, fondo: 551 },
  hero: { src: '/assets/scimmia/hero.webp', scala: .9, fondo: 570 },
  hando: { src: '/assets/scimmia/hando.webp', scala: 1.13, fondo: 557 },
  handoPassaggio: { src: '/assets/scimmia/hando-passaggio.webp', scala: 1.13, fondo: 572 },
  bosco: { src: '/assets/scimmia/bosco.webp', scala: 1.29, fondo: 524 },
  bosco2: { src: '/assets/scimmia/bosco-2.webp', scala: 1.29, fondo: 524 },
  boscoPassaggio: { src: '/assets/scimmia/bosco-passaggio.webp', scala: 1.29, fondo: 524 },
  siti: { src: '/assets/scimmia/siti.webp', scala: 1.2, fondo: 570 },
  metodo: { src: '/assets/scimmia/metodo.webp', scala: .94, fondo: 563 },
  contatti: { src: '/assets/scimmia/contatti.webp', scala: .85, fondo: 569 },
};
const CAMMINATA = ['cammina1', 'passaggio', 'cammina2', 'passaggio'];
const CAMMINATA_BOSCO = ['bosco', 'boscoPassaggio', 'bosco2', 'boscoPassaggio'];
const CAMMINATA_HANDO = ['hando', 'handoPassaggio'];
// Un cambio di immagine dentro lo stesso ciclo è un passo, non un cambio di scena: niente saltello
const CICLI = [CAMMINATA, CAMMINATA_BOSCO, CAMMINATA_HANDO];

// "sempre": la posa della scena è già una camminata (cartelline, carriola); "ferma": la prende quando ti fermi
// La hero non ha posa ferma: la seduta vale solo sul punto (inCima), a metà discesa sarebbe sospesa nel vuoto
const SCENE: Record<Scena, { sempre?: string; ciclo?: string[]; ferma?: string }> = {
  hero: {},
  base: { ferma: 'base' },
  hando: { sempre: 'hando', ciclo: CAMMINATA_HANDO },
  bosco: { sempre: 'bosco', ciclo: CAMMINATA_BOSCO },
  siti: { sempre: 'siti' },
  metodo: { sempre: 'metodo' },
  contatti: { ferma: 'contatti' },
};

// Su mobile niente camminata: in ogni sezione la scimmietta compare ferma nell'angolo con la posa della scena
export function initAngoli() {
  document.querySelectorAll<HTMLElement>('[data-scena]').forEach(sezione => {
    const scena = SCENE[sezione.dataset.scena as Scena] ?? SCENE.base;
    const nome = sezione.dataset.scena === 'hero' ? 'hero' : scena.sempre ?? scena.ferma ?? 'base';
    const posa = POSE[nome];
    const img = document.createElement('img');
    img.className = 'scimmia-angolo';
    img.src = posa.src;
    img.alt = '';
    img.loading = 'lazy';
    img.style.width = `${76 * posa.scala}px`;
    sezione.appendChild(img);
  });
  const osserva = new IntersectionObserver(voci => voci.forEach(v => {
    if (v.isIntersecting) { v.target.classList.add('visto'); osserva.unobserve(v.target); }
  }), { threshold: .6 });
  document.querySelectorAll('.scimmia-angolo').forEach(el => osserva.observe(el));
}

const PASSO_PX = 26;
// Le pose con l'oggetto sono un'immagine sola: un arco di rimbalzo ogni BALZO_PX di percorso
const BALZO_PX = 70;
const ATTESA_FERMA_MS = 320;

export function initScimmia() {
  const box = document.querySelector<HTMLElement>('.scimmia');
  const img = box?.querySelector('img');
  const seduta = document.querySelector<HTMLElement>('.hero .scimmia-hero');
  if (!box || !img || !seduta || reduce) return;
  document.documentElement.classList.add('has-scimmia');
  Object.values(POSE).forEach(p => { new Image().src = p.src; });

  const larghezza = () => (innerWidth < 900 ? 84 : 132);
  let posa = '', verso: 'sinistra' | 'destra' = 'sinistra';
  let ultimoX: number | null = null, percorsa = 0, piedi = { x: 0, y: 0 };
  let ferma = true, inCima = true, timer = 0, ultimoScroll = 0;

  const scenaSotto = (): string => {
    // La scena si legge a metà altezza dello schermo, non sotto i piedi: dal bordo basso entra già la sezione successiva
    // (con l'inerzia di Lenis, a fine nastro sale Metodo mentre si sta guardando Siti).
    // Tutti gli elementi in quel punto, non solo il primo: possono esserci altri strati (in sviluppo, la toolbar di Astro)
    const sotto = document.elementsFromPoint(Math.min(innerWidth - 1, Math.max(0, piedi.x)), innerHeight / 2);
    for (const el of sotto) {
      const scena = el.closest<HTMLElement>('[data-scena]')?.dataset.scena;
      if (scena) return scena;
    }
    return 'base';
  };

  const disegna = () => {
    const scena = SCENE[scenaSotto() as Scena] ?? SCENE.base;
    let nuova: string;
    if (inCima) nuova = 'hero';
    else if (scena.ciclo) nuova = ferma ? scena.sempre! : scena.ciclo[Math.floor(percorsa / PASSO_PX) % scena.ciclo.length];
    else if (scena.sempre) nuova = scena.sempre;
    else if (ferma && scena.ferma) nuova = scena.ferma;
    else nuova = CAMMINATA[Math.floor(percorsa / PASSO_PX) % CAMMINATA.length];

    const p = POSE[nuova];
    if (nuova !== posa) {
      // Cambio di scena (non di passo): un saltello nasconde lo stacco tra due immagini diverse
      if (posa && !CICLI.some(c => c.includes(nuova) && c.includes(posa))) {
        box.classList.remove('hop'); void box.offsetWidth; box.classList.add('hop');
      }
      img.src = p.src;
      posa = nuova;
    }
    const w = larghezza() * p.scala;
    img.style.width = w + 'px';
    // Le immagini guardano a sinistra: verso destra si specchiano; ferme in posa guardano a sinistra, verso il contenuto
    // Seduta sul punto guarda a destra (verso il punto stesso), sempre, qualunque sia la strada fatta per arrivarci
    box.classList.toggle('verso-destra', inCima || (verso === 'destra' && !(ferma && scena.ferma)));
    // Le pose con l'oggetto sono un'immagine sola: il rimbalzo a ogni passo ne fa una camminata
    const rimbalzo = scena.sempre && !scena.ciclo && !ferma && !inCima ? Math.abs(Math.sin((percorsa / BALZO_PX) * Math.PI)) * 7 : 0;
    box.style.transform = `translate(${piedi.x - w / 2}px, ${piedi.y - rimbalzo - (p.fondo / 600) * w}px)`;
  };

  // Tappe del percorso in px di scroll: [scroll, x]. Tra due tappe cammina, tra due tappe con la stessa x resta ferma
  const percorso = (): Array<[number, number]> => {
    const altezzaHero = document.getElementById('hero')!.offsetHeight;
    const track = document.querySelector<HTMLElement>('.track')!;
    const bloccato = getComputedStyle(track).display === 'flex';
    const W = innerWidth, H = innerHeight;
    const metodo = document.getElementById('metodo')!.offsetTop;
    const contatti = document.getElementById('contatti')!.offsetTop;

    const xInizio = W * .08;
    // Siti: sotto l'immagine di duezero, a destra del suo testo; Metodo: lato destro, libero; Contatti: tra pulsante e link
    // Siti e Metodo: con il rullo e con la matita attraversa il bordo basso, così si vede a lungo. Su Siti resta nel varco tra il testo di duezero e quello di Hyper.Parts
    const xSiti0 = W * .28, xSiti1 = W * .50, xMetodo0 = W * .88, xMetodo1 = W * .62, xContatti = W * .58;
    const fineMovimento = altezzaHero + (track.scrollWidth - W) * NASTRO.lunghezza;
    const fineSosta = fineMovimento + H * NASTRO.sosta;

    return [
      [0, xInizio],
      [altezzaHero, xInizio],
      ...(bloccato
        ? [[fineMovimento, xSiti0], [fineSosta, xSiti1]] as Array<[number, number]>
        : []),
      // Metodo entra a metà schermo: la scimmietta lo raggiunge e lo attraversa con la matita da destra a sinistra;
      // poi arriva ai Contatti mentre quella scena prende il centro dello schermo
      [metodo - H * .5, xMetodo0],
      [contatti - H * .5, xMetodo1],
      [contatti, xContatti],
    ];
  };

  const piazza = (p: number) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const scroll = p * max;
    const terra = innerHeight - 14;
    const tappe = percorso();
    const pInizioPx = tappe[1][0];
    let x: number, y: number;

    if (scroll <= pInizioPx) {
      // Dalla posa seduta nella hero (posizione a pagina in cima) al bordo basso
      const r = seduta.getBoundingClientRect();
      const t = pInizioPx ? scroll / pInizioPx : 1;
      const sx = r.width ? r.left + r.width / 2 : tappe[0][1];
      const sy = r.width ? r.top + window.scrollY + r.height * (POSE.hero.fondo / 600) : terra;
      // Prima scende dritta dal punto, poi cammina lungo il bordo basso: in diagonale attraverserebbe il testo
      const caduta = .3;
      const u = Math.min(1, t / caduta), tc = Math.max(0, (t - caduta) / (1 - caduta));
      x = sx + (tappe[1][1] - sx) * tc;
      y = sy + (terra - sy) * u * u;
    } else {
      // Interpolazione lineare tra le due tappe che racchiudono lo scroll
      let i = 1;
      while (i < tappe.length - 1 && scroll > tappe[i + 1][0]) i++;
      const [s0, x0] = tappe[i], [s1, x1] = tappe[i + 1] ?? tappe[i];
      const t = s1 > s0 ? Math.min(1, Math.max(0, (scroll - s0) / (s1 - s0))) : 1;
      x = x0 + (x1 - x0) * t;
      y = terra;
    }

    inCima = p < .002 && !!seduta.getBoundingClientRect().width;
    if (ultimoX !== null) {
      const dx = x - ultimoX;
      if (Math.abs(dx) > .5) verso = dx > 0 ? 'destra' : 'sinistra';
      // Nel nastro lei resta quasi ferma sullo schermo ma il mondo scorre: il passo e il "ferma" seguono lo scroll, non lo spostamento
      const nelNastro = tappe.length > 5 && scroll > tappe[1][0] && scroll < tappe[2][0];
      const dScroll = Math.abs(scroll - ultimoScroll);
      const spostamento = Math.hypot(dx, y - piedi.y);
      percorsa += nelNastro ? dScroll * .45 : spostamento;
      if (nelNastro ? dScroll > .5 : spostamento > .5) {
        ferma = false;
        clearTimeout(timer);
        // Seconda lettura: il nastro arriva in posizione dopo lo scroll (scrub + inerzia di Lenis), la prima può vedere ancora il pannello precedente
        timer = window.setTimeout(() => { ferma = true; disegna(); timer = window.setTimeout(disegna, 450); }, ATTESA_FERMA_MS);
      }
    }
    ultimoX = x;
    ultimoScroll = scroll;
    piedi = { x, y };
    disegna();
  };

  const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => piazza(s.progress), onRefresh: s => piazza(s.progress) });
  piazza(0);
  addEventListener('resize', () => piazza(st.progress));

  addEventListener('pointermove', e => {
    const w = img.offsetWidth;
    if (Math.hypot(e.clientX - piedi.x, e.clientY - (piedi.y - w / 2)) < w * .6 && !box.classList.contains('hop')) {
      box.classList.add('hop');
    }
  });
  box.addEventListener('animationend', () => box.classList.remove('hop'));
}
