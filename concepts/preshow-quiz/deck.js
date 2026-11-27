'use strict';

(() => {
  function shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }

  function makeDeck(history) {
    const movies = new Map();
    for (const entry of history) {
      if (entry?.type !== 'Movie' || !/^\d{4}$/.test(entry.year) || typeof entry.title !== 'string') continue;
      const title = entry.title.trim();
      if (!title) continue;
      // Keep remakes, collapse repeat screenings of the same title and year.
      const key = title.toLowerCase() + '|' + entry.year;
      movies.set(key, { title, year: Number(entry.year) });
    }
    const remaining = shuffle([...movies.values()]);
    const deck = [];
    while (remaining.length > 1) {
      const a = remaining.pop();
      const i = remaining.findIndex(b => a.year !== b.year && a.title.toLowerCase() !== b.title.toLowerCase());
      if (i >= 0) deck.push([a, remaining.splice(i, 1)[0]]);
    }
    return deck;
  }
  window.CinemaQuizDeck = {makeDeck, shuffle};
})();
