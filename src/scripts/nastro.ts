// Il nastro dei progetti scorre da destra a sinistra mentre si scorre in verticale; poi Metodo e Contatti entrano dal basso
import { gsap, ScrollTrigger } from './scroll';
import { aggiornaTono } from './tono';
import { NASTRO } from '../config';

// Le schermate di un tablet stanno sovrapposte: scorrendo si dissolvono una nell'altra.
// La timeline copre tutta la corsa del tablet, così ogni schermata resta visibile per un tratto uguale; `cambio` sposta il punto del passaggio
function dissolvenza(tablet: HTMLElement, trigger: ScrollTrigger.Vars, cambio: number) {
  const schermate = tablet.querySelectorAll<HTMLElement>('.schermata');
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { ...trigger, scrub: true } });
  schermate.forEach((img, i) => {
    if (i === 0) return;
    tl.to(schermate[i - 1], { opacity: 0, duration: .3 }, i + cambio);
    tl.to(img, { opacity: 1, duration: .3 }, i + cambio);
  });
  tl.to({}, { duration: schermate.length }, 0);
}

export function initNastro() {
  // Su mobile la pagina è una colonna: il tablet cambia schermata mentre attraversa lo schermo in verticale
  gsap.matchMedia().add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
    document.querySelectorAll<HTMLElement>('.tablet').forEach(t => {
      dissolvenza(t, { trigger: t, start: 'top 70%', end: 'bottom 40%' }, -.15);
    });
  });

  // gsap.matchMedia crea e smonta da solo le animazioni quando la condizione cambia (per esempio ridimensionando)
  gsap.matchMedia().add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    const track = document.querySelector<HTMLElement>('.track')!;
    const distanza = () => track.scrollWidth - innerWidth;
    const move = gsap.to(track, {
      x: () => -distanza(),
      ease: 'none',
      onUpdate: aggiornaTono,
      scrollTrigger: {
        trigger: '#viaggio',
        // Senza pin il default sarebbe 'top bottom': il nastro partirebbe prima che il pannello riempia lo schermo
        start: 'top top',
        // Con Lenis lo scroll è già morbido: scrub breve, altrimenti il nastro sembra in ritardo
        scrub: .3,
        end: () => '+=' + distanza() * NASTRO.lunghezza,
        invalidateOnRefresh: true,
      },
    });
    // Il blocco è un ScrollTrigger a parte, più lungo dello spostamento: a fine corsa il nastro resta fermo sull'ultimo pannello.
    // Allungare l'animazione stessa non va bene: i trigger con containerAnimation: move assumono che sia lineare per tutta la durata.
    ScrollTrigger.create({
      trigger: '#viaggio',
      pin: true,
      end: () => '+=' + (distanza() * NASTRO.lunghezza + innerHeight * NASTRO.sosta),
      invalidateOnRefresh: true,
    });
    // Il tablet cambia schermata mentre il pannello lo attraversa
    document.querySelectorAll<HTMLElement>('.track .tablet').forEach(t => {
      dissolvenza(t, { trigger: t.closest('.panel'), containerAnimation: move, start: 'left 60%', end: 'right 65%' }, .3);
    });
    // Le parole giganti e le immagini viaggiano a velocità diverse dal pannello: profondità
    document.querySelectorAll<HTMLElement>('.track .giant').forEach(g => {
      gsap.fromTo(g, { xPercent: 14 }, { xPercent: -14, ease: 'none', scrollTrigger: { trigger: g.closest('.panel'), containerAnimation: move, start: 'left right', end: 'right left', scrub: true } });
    });
    document.querySelectorAll<HTMLElement>('.track .media').forEach(m => {
      gsap.fromTo(m, { xPercent: 12, rotate: 2 }, { xPercent: -6, rotate: -1, ease: 'none', scrollTrigger: { trigger: m.closest('.panel'), containerAnimation: move, start: 'left right', end: 'right left', scrub: true } });
    });
  });

  // Metodo: le parole entrano una alla volta da sinistra; Contatti: la parola gigante scivola appena
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.from('.method .stack li', { xPercent: -14, opacity: 0, ease: 'none', stagger: .25, scrollTrigger: { trigger: '.method', start: 'top 85%', end: 'top 15%', scrub: .6 } });
  gsap.fromTo('.contact .giant', { xPercent: 8 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom bottom', scrub: .6 } });
}
