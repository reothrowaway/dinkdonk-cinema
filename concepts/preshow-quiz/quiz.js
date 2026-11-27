'use strict';

const choices = document.getElementById('choices');
const cards = Array.from(choices.querySelectorAll('button'));
const action = document.getElementById('action');
const message = document.getElementById('status');
let pairs = [];
let round = -1;
let revealed = false;

function next() {
  round++;
  if (round === pairs.length) {
    round = 0;
    CinemaQuizDeck.shuffle(pairs);
  }
  revealed = false;
  pairs[round].forEach((film, i) => {
    const card = cards[i];
    card.disabled = false;
    card.classList.remove('winner');
    card.querySelector('.title').textContent = film.title;
    card.querySelector('.year').hidden = true;
  });
  choices.hidden = action.hidden = false;
  action.textContent = 'Reveal years';
  message.textContent = 'Pick the earlier film.';
}

function reveal(picked) {
  if (revealed) return;
  revealed = true;
  const pair = pairs[round];
  const first = pair[0].year < pair[1].year ? 0 : 1;
  pair.forEach((film, i) => {
    const year = cards[i].querySelector('.year');
    year.textContent = film.year;
    year.hidden = false;
    cards[i].classList.toggle('winner', i === first);
    cards[i].disabled = true;
  });
  const gap = Math.abs(pair[0].year - pair[1].year);
  const lead = picked === undefined ? '' : picked === first ? 'Correct. ' : 'Other way around. ';
  message.textContent = lead + pair[first].title + ' came out ' + gap + (gap === 1 ? ' year' : ' years') + ' earlier.';
  action.textContent = 'Next pair';
  if (picked !== undefined) action.focus();
}

async function load() {
  message.textContent = 'Opening the watch log…';
  action.hidden = true;
  try {
    const response = await fetch('/dd/data.json', { signal: AbortSignal.timeout(25000) });
    if (!response.ok) throw Error();
    pairs = CinemaQuizDeck.makeDeck((await response.json()).history);
    if (pairs.length) {
      next();
      return;
    }
    message.textContent = 'Waiting for two different films with different release years.';
  } catch {
    message.textContent = 'The watch log could not be loaded.';
  }
  action.textContent = 'Try again';
  action.hidden = false;
}

cards.forEach((card, i) => card.addEventListener('click', () => reveal(i)));
action.addEventListener('click', () => {
  if (!pairs.length) load();
  else if (revealed) next();
  else reveal();
});
load();
