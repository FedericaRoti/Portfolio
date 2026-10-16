// Scroll morbido con Lenis, sincronizzato con GSAP ScrollTrigger.
// È l'unico punto in cui nascono gsap, ScrollTrigger e lenis: gli altri moduli li importano da qui.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SCROLL, NASTRO } from '../config';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const desktop = matchMedia('(min-width: 900px)');

// Lenis rispetta da solo prefers-reduced-motion (respectReducedMotion è attivo di default)
export const lenis = new Lenis({ lerp: SCROLL.lerp, wheelMultiplier: SCROLL.wheelMultiplier });

export function initScroll() {
  // Setup indicato dalla documentazione di Lenis: ScrollTrigger si aggiorna a ogni scroll, Lenis gira nel ticker di GSAP
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // I link interni (#progetti, #contatti…) passano da Lenis, così anche il salto è morbido
  document.addEventListener('click', e => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector<HTMLElement>(a.getAttribute('href')!);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(posizioneDi(target));
  });
}

// Dentro il nastro bloccato la posizione verticale di un pannello non è il suo offsetTop:
// va calcolata dall'inizio del nastro più la sua posizione orizzontale
function posizioneDi(el: HTMLElement): number {
  const track = document.querySelector<HTMLElement>('.track');
  if (track && track.contains(el) && getComputedStyle(track).display === 'flex') {
    const inizio = document.getElementById('hero')!.offsetHeight;
    return inizio + el.offsetLeft * NASTRO.lunghezza;
  }
  return el.getBoundingClientRect().top + window.scrollY;
}
