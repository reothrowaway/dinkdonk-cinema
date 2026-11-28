'use strict';

// Both editions keep the module paths used by the scenes. The event drawings
// are created by the modules from the live room geometry and guest sprites.
const base = 'concepts/cinema-mods/';
const eventFiles = [
  'lobby-events.js', 'guest-routes.js', 'guest-travel.js',
  'incidents/arcade.js', 'incidents/paper-stage.js', 'incidents/sidewalk.js', 'incidents/stage.js',
  'incidents/marquee-photo.js', 'incidents/shared-umbrella.js', 'incidents/dish-night.js', 'incidents/tape-swap.js', 'events.html',
  'incidents/poster-bin.js',
  'preshow/transition-cues.js', 'preshow/house-events.js', 'preshow/popcorn-pass.js', 'preshow/mic-runner.js',
  'preshow/house-velvet.webp',
  'preshow/beach-ball.js', 'preshow/beach-ball.webp',
  'preshow/visual-applause.js',
].map(file => base + file);
const extrasFiles = [
  'ticket-counter/index.html', 'ticket-counter/ticket.js',
  'preshow-quiz/index.html', 'preshow-quiz/quiz.js', 'preshow-quiz/deck.js',
  'cinema-guide/index.html', 'cinema-guide/guide.js',
  'film-diary/index.html', 'film-diary/diary.js',
  'mutoscope/index.html', 'mutoscope/viewer.js', 'mutoscope/sallie-gardner.webp',
  'mutoscope/foley.html', 'mutoscope/foley.js',
  'question-desk/panel.js',
  'double-bill/index.html', 'double-bill/bill.js',
  'seating-plan/plan.js', 'seating-plan/plan.css',
  'projection-booth/index.html', 'projection-booth/booth.js',
  'projection-booth/sync-leader.html', 'projection-booth/sync-leader.js', 'projection-booth/sync-leader.mp4',
  'projection-booth/framing.html', 'projection-booth/framing.js',
  'projection-booth/reel-sheet.html', 'projection-booth/reel-sheet.js',
  'house-organ/index.html', 'house-organ/instrument.js', 'house-organ/organ.js', 'house-organ/console.webp',
  'house-organ/save-me-a-seat.mp4',
].map(file => 'concepts/' + file);

const looksDir = 'concepts/vaporwave/';
const shaderFile = looksDir + 'cinema-looks.shader';
const lookGuide = looksDir + 'obs-looks.html';
const presets = require('../concepts/vaporwave/scene-looks.json');

function lookFilters(room, shaderText) {
  return presets[room].map(([preset, label, strength], index) => ({
    name: label + ' · ' + strength + '%', id: 'shader_filter', versioned_id: 'shader_filter',
    enabled: index === 0,
    settings: { from_file: false, shader_text: shaderText, Preset: preset, Strength: strength, Keyed_Plate: room === 'auditorium' },
  }));
}

module.exports = { eventFiles, extrasFiles, shaderFile, lookGuide, lookFilters };
