// Avvio di tutti i comportamenti della pagina. L'ordine conta:
// il nastro bloccato (pin) deve esistere prima dei trigger che stanno sotto di lui, scimmietta compresa.
import { initScroll } from './scroll';
import { initTono } from './tono';
import { initTitolo } from './titolo';
import { initNastro } from './nastro';
import { initScimmia, initAngoli } from './scimmia';

initScroll();
initTitolo();
initNastro();
initTono();
initScimmia();
initAngoli();
