'use strict';

// Both editions keep the module paths used by the scenes. The event drawings
// are created by the modules from the live room geometry and guest sprites.
const base = 'concepts/cinema-mods/';
const eventFiles = [
  'lobby-events.js', 'guest-routes.js', 'guest-travel.js',
  'incidents/arcade.js', 'incidents/paper-stage.js', 'incidents/sidewalk.js', 'incidents/stage.js',
  'incidents/marquee-photo.js', 'incidents/shared-umbrella.js', 'events.html',
  'preshow/transition-cues.js', 'preshow/house-events.js', 'preshow/popcorn-pass.js',
].map(file => base + file);

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

module.exports = { eventFiles, shaderFile, lookGuide, lookFilters };
