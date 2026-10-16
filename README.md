# Portfolio

Il mio portfolio da developer full-stack. L'ho costruito come un progetto a sé: tipografia grande, movimento legato allo scroll e una scimmietta di feltro che accompagna la pagina e cambia posa a seconda della sezione.

Online: https://portfolio-zeta-ruby-5zcapnulh5.vercel.app/

## Cosa c'è dentro

- **Hero tipografica.** Il titolo è composto lettera per lettera con un font variabile: avvicinando il cursore le lettere cambiano peso e larghezza, si spostano e, oltre una soglia, cambiano colore. All'apertura un passaggio automatico mostra l'effetto una volta.
- **Nastro orizzontale dei progetti.** Scorrendo in verticale i pannelli si muovono in orizzontale (ScrollTrigger con `pin` e `scrub`). Parole giganti e immagini viaggiano a velocità diverse, per dare profondità. Alla fine il nastro sosta sull'ultimo pannello.
- **Tablet con le schermate.** I progetti mostrano le loro schermate dentro la cornice di un tablet disegnata in CSS. Le schermate cambiano con una dissolvenza legata allo scroll.
- **Metodo e contatti.** Due sezioni verticali, con le parole del metodo che entrano una alla volta.
- **La scimmietta.** Segue lo scroll lungo il bordo basso e cammina: il passo avanza con lo scroll, non con lo spostamento sullo schermo. In ogni sezione prende la posa della scena. Quando ci si ferma, si mette in posa.

## Stack

- [Astro](https://astro.build) 7, sito statico, nessun framework UI
- Script in TypeScript
- [GSAP](https://gsap.com) 3.15 con ScrollTrigger
- [Lenis](https://lenis.darkroom.engineering) 1.3 per lo scroll morbido, sincronizzato con il ticker di GSAP
- Font da Google Fonts: Bricolage Grotesque (titoli, assi `wght`, `wdth`, `opsz`) e Figtree (testo)
- Immagini in WebP, circa 2,7 MB in totale nella build
- Pubblicato su Vercel

## Scelte che ho fatto

- **Solo `transform`, `opacity` e `clip-path`** per le animazioni, senza listener sullo `scroll`: lo scroll si legge tramite ScrollTrigger.
- **`prefers-reduced-motion` gestito.** Con il movimento ridotto non partono il nastro, la scimmietta e l'animazione del titolo.
- **Versione mobile pensata a parte.** Sotto i 900 px il nastro diventa una colonna verticale e la scimmietta resta ferma nell'angolo di ogni sezione, senza coprire il testo.
- **La hero vive su un fotogramma fisso 1600×900** che si scala con una variabile CSS, e le dimensioni giganti usano `min(vw, dvh)`: su schermi bassi si rimpiccioliscono invece di tagliarsi.
- **Stili in file CSS globali** importati dai componenti, non scoped: le lettere del titolo le crea JavaScript e gli stili scoped non le raggiungerebbero.
- **Palette ridotta:** carta `#f3f1ec`, cartoncino `#e3dfd7`, nero `#141414`, un solo accento arancio `#ea5a1c`.

## Struttura

```
src/
  components/   una sezione per componente
  data/         i contenuti: progetti.ts e contatti.ts
  scripts/      titolo, nastro, scimmietta, scroll
  styles/       tokens.css, base.css e un file per sezione
  config.ts     morbidezza dello scroll e lunghezza del nastro
public/assets/  immagini
```

I contenuti dei progetti si cambiano in `src/data/progetti.ts`, senza toccare i componenti.

## Avvio in locale

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # genera dist/
npm run preview   # serve dist/
```

## Contatti

Federica Rotiroti: [LinkedIn](https://www.linkedin.com/in/federicarotiroti), federica.rotiroti3@gmail.com
