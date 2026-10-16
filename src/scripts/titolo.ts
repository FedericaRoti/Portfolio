// Hero: scala il fotogramma 1600×900 e fa reagire il titolo al cursore, lettera per lettera
import { gsap, reduce, desktop } from './scroll';

interface Lettera { el: HTMLElement; heavy: boolean; cx: number; cy: number; ox: number; oy: number; rot: number; f: number }

const RAGGIO = 290;

export function initTitolo() {
  const frame = document.querySelector<HTMLElement>('.frame');
  if (!frame) return;

  let s = 1;
  const fit = () => { s = Math.min(innerWidth / 1600, innerHeight / 900); frame.style.setProperty('--s', String(s)); };
  fit();
  addEventListener('resize', fit);

  // Spezza le parole in lettere singole: ogni lettera reagisce da sola
  frame.querySelectorAll<HTMLElement>('.title .w').forEach(w => {
    [...w.childNodes].forEach(n => {
      if (n.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        [...(n.textContent ?? '')].forEach(c => {
          if (c === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
          const sp = document.createElement('span');
          sp.className = 'ch';
          sp.textContent = c;
          frag.appendChild(sp);
        });
        n.replaceWith(frag);
      } else if ((n as HTMLElement).classList?.contains('dot')) {
        (n as HTMLElement).classList.add('ch');
      }
    });
  });

  const lettere: Lettera[] = [...frame.querySelectorAll<HTMLElement>('.title .ch')].map(el => ({
    el, heavy: !!el.closest('.heavy'), cx: 0, cy: 0, ox: 0, oy: 0, rot: 0, f: 0,
  }));
  const misura = () => lettere.forEach(l => {
    const fb = frame.getBoundingClientRect(), r = l.el.getBoundingClientRect();
    l.cx = (r.left + r.width / 2 - fb.left) / s - l.ox;
    l.cy = (r.top + r.height / 2 - fb.top) / s - l.oy;
  });

  // Coordinate del cursore nel fotogramma (tx/ty = obiettivo, x/y = posizione inseguita)
  let tx = -999, ty = -999, x = -999, y = -999, raf = 0, dentro = false;
  const tick = () => {
    const k = reduce ? 1 : .18;
    x += (tx - x) * k; y += (ty - y) * k;
    let occupato = Math.abs(tx - x) + Math.abs(ty - y) > .4;
    lettere.forEach(l => {
      const goal = dentro ? Math.max(0, 1 - Math.hypot(l.cx - x, l.cy - y) / RAGGIO) : 0;
      l.f += (goal - l.f) * (reduce ? 1 : .16);
      if (Math.abs(goal - l.f) > .003) occupato = true;
      const e = l.f * l.f * (3 - 2 * l.f);
      // Peso: le pesanti si alleggeriscono e si allargano, le leggere si appesantiscono e si stringono
      const wght = l.heavy ? 700 - 380 * e : 300 + 460 * e;
      const wdth = l.heavy ? 82 + 16 * e : 100 - 20 * e;
      l.el.style.fontVariationSettings = `"opsz" 96, "wdth" ${wdth.toFixed(1)}, "wght" ${wght.toFixed(0)}`;
      // Spostamento: si allontanano dal cursore e tornano al loro posto
      const dx = l.cx - x, dy = l.cy - y, len = Math.hypot(dx, dy) || 1;
      l.ox += (dx / len * 46 * e - l.ox) * .25;
      l.oy += (dy / len * 46 * e - l.oy) * .25;
      l.rot += ((dx > 0 ? 1 : -1) * 8 * e - l.rot) * .25;
      if (Math.abs(l.ox) + Math.abs(l.oy) > .3) occupato = true;
      l.el.style.transform = `translate(${l.ox.toFixed(1)}px, ${l.oy.toFixed(1)}px) rotate(${l.rot.toFixed(1)}deg)`;
      // Tra nero e arancio c'è solo marrone: il colore scatta oltre una soglia, la transizione CSS lo ammorbidisce
      if (!l.el.classList.contains('dot')) l.el.classList.toggle('hot', e > .28);
    });
    raf = occupato ? requestAnimationFrame(tick) : 0;
  };
  const avvia = () => { if (!raf) raf = requestAnimationFrame(tick); };

  frame.addEventListener('pointermove', e => {
    if (!desktop.matches) return;
    const b = frame.getBoundingClientRect();
    tx = (e.clientX - b.left) / s; ty = (e.clientY - b.top) / s;
    if (x < -900) { x = tx; y = ty; }
    dentro = ty > 140 && ty < 700 && tx < 1520;
    avvia();
  });
  frame.addEventListener('pointerleave', () => { dentro = false; avvia(); });

  // All'apertura un passaggio dimostrativo attraversa tutto il titolo fino al punto arancio: mostra che reagisce, senza scriverlo.
  // Non si annulla col mouse (lo si vedrebbe solo se fermi): durante il passaggio il cursore vero viene ignorato.
  let guidata = false;
  frame.addEventListener('pointermove', e => { if (guidata) e.stopImmediatePropagation(); }, { capture: true });
  const dimostrazione = () => {
    if (reduce || !desktop.matches || scrollY > 40) return;
    const t0 = performance.now(), durata = 2800;
    guidata = true;
    const passo = (now: number) => {
      const t = Math.min(1, (now - t0) / durata);
      const ease = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      tx = 60 + 1290 * ease;
      ty = 360 + Math.sin(ease * Math.PI * 2.5) * 130;
      if (x < -900) { x = tx; y = ty; }
      dentro = t < 1;
      avvia();
      if (t < 1) { requestAnimationFrame(passo); return; }
      guidata = false;
      // Arrivata al punto, la scimmietta seduta saluta con un salto
      const scimmia = document.querySelector<HTMLElement>('.scimmia');
      if (scimmia && scrollY < 40) { scimmia.classList.remove('hop'); void scimmia.offsetWidth; scimmia.classList.add('hop'); }
    };
    requestAnimationFrame(passo);
  };

  document.fonts.ready.then(() => setTimeout(() => { misura(); setTimeout(dimostrazione, 250); }, 1300));
  addEventListener('resize', () => setTimeout(misura, 50));

  if (reduce) return;
  gsap.from('.title .w', { yPercent: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08 });
  gsap.from('.hi, .note, .hero .ctas', { y: 18, opacity: 0, filter: 'blur(8px)', duration: 1, ease: 'expo.out', stagger: .06, delay: .35 });
}
