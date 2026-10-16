// Marchio e menu prendono il colore giusto per il pannello che hanno sotto (data-tone="dark" | "light")
import { ScrollTrigger } from './scroll';

const mark = document.querySelector<HTMLElement>('.mark')!;
const menu = document.querySelector<HTMLElement>('.menu')!;

// Nasconde un attimo l'elemento fisso per sapere cosa c'è sotto quel punto
function scuroIn(x: number, sopra: HTMLElement): boolean {
  sopra.style.visibility = 'hidden';
  const zona = document.elementFromPoint(x, 44)?.closest<HTMLElement>('[data-tone]');
  sopra.style.visibility = '';
  return zona?.dataset.tone === 'dark';
}

export function aggiornaTono() {
  document.body.classList.toggle('dark-l', scuroIn(60, mark));
  document.body.classList.toggle('dark-r', scuroIn(innerWidth - 120, menu));
}

export function initTono() {
  aggiornaTono();
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: aggiornaTono });
}
