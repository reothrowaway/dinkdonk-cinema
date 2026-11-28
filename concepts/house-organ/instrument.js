(() => {
  'use strict';
  const colors = {
    flute: [0,1,.25,.08,.03],
    diapason: [0,1,.62,.38,.24,.14,.09,.05],
    reed: [0,.85,.28,.85,.2,.53,.14,.27,.1,.12]
  };
  // An original eight-bar waltz. Each bar has three beats; the pedal plays its root.
  const bars = [
    {bass:48,chord:[55,64,69],tune:[[64,.5],[67,.5],[69,1.5],[67,.5]]},
    {bass:45,chord:[55,60,64],tune:[[72,1],[71,.5],[69,.5],[64,1]]},
    {bass:50,chord:[57,60,65],tune:[[65,.75],[69,.25],[72,1],[69,1]]},
    {bass:43,chord:[53,59,62],tune:[[67,1.5],[65,.5],[62,1]]},
    {bass:52,chord:[55,59,62],tune:[[64,.5],[67,.5],[71,1],[74,1]]},
    {bass:45,chord:[55,61,64],tune:[[73,.75],[69,.25],[67,1],[64,1]]},
    {bass:50,chord:[53,57,60],tune:[[65,1],[69,.5],[67,.5],[62,1]]},
    {bass:48,chord:[55,64,69],tune:[[60,3]]}
  ];
  function create(context, destination = context.destination) {
    const master = context.createGain();
    master.gain.value = .55;
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -9;
    limiter.ratio.value = 8;
    master.connect(limiter).connect(destination);
    const waves = Object.fromEntries(Object.entries(colors).map(([name, spectrum]) =>
      [name, context.createPeriodicWave(new Float32Array(spectrum.length), Float32Array.from(spectrum))]));
    const sounding = new Set();
    let stop = 'flute';
    function note(midi, at = context.currentTime, level = .16) {
      const oscillator = context.createOscillator(), gain = context.createGain();
      oscillator.setPeriodicWave(waves[stop]);
      oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
      gain.gain.value = 0;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(level, at + .035);
      oscillator.connect(gain).connect(master);
      let releaseAt = Infinity;
      const voice = {oscillator, release(when = context.currentTime) {
        const t = Math.max(context.currentTime, when);
        if (t >= releaseAt) return;
        releaseAt = t;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(level * Math.max(0, Math.min(1, (t - at) / .035)), t);
        gain.gain.setTargetAtTime(0, t, .024);
        oscillator.stop(t + .14);
      }};
      sounding.add(voice);
      oscillator.onended = () => { sounding.delete(voice); oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(at);
      return voice;
    }
    function playOverture() {
      const beat = .56, start = context.currentTime + .06, melody = [];
      bars.forEach(({bass,chord,tune}, bar) => {
        let time = start + bar * 3 * beat;
        note(bass, time, .10).release(time + 2.7 * beat);
        for (const offset of [1,2]) for (const pitch of chord) {
          const t = time + offset * beat;
          note(pitch, t, .052).release(t + beat * .68);
        }
        for (const [pitch,length] of tune) {
          const end = time + length * beat * .91;
          note(pitch, time, .19).release(end);
          melody.push({pitch, time, end});
          time += length * beat;
        }
      });
      return {melody, end:start + 24 * beat + .14};
    }
    return {note, playOverture,
      register(name) { if (waves[name]) { stop = name; for (const v of sounding) v.oscillator.setPeriodicWave(waves[name]); } },
      volume(value) { master.gain.setTargetAtTime(value, context.currentTime, .025); },
      silence() { for (const voice of sounding) voice.release(); }
    };
  }
  window.CinemaOrgan = {create};
})();
