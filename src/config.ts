// Impostazioni del movimento: si regolano qui, senza toccare i componenti

export const SCROLL = {
  // Morbidezza di Lenis: più basso = scroll più scivoloso e lento a fermarsi (0.05–0.15)
  lerp: 0.08,
  // Quanto spazio percorre una rotellata: sopra 1 la pagina corre di più
  wheelMultiplier: 1,
};

export const NASTRO = {
  // Lunghezza del nastro dei progetti: 1 = un pannello per ogni schermata di scroll, 1.5 = ci vuole il 50% di scroll in più
  lunghezza: 1.4,
  // Sosta sull'ultimo pannello (Siti) prima che il nastro si sblocchi, in altezze di schermo: 0.5 = mezza schermata di scroll
  sosta: 0.5,
};
