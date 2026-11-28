(() => {
  'use strict';
  const allowed = s => !!s && s.screen === 'auto' && !s.houseOut && !s.intermissionUntil && ['seating','up'].includes(s.phase);
  function candidates(report, roster, names, now) {
    if (!report || now - report.at > 12000) return [];
    const seated = new Set(roster.filter(e => e.seat && !e.steppedOut).map(e => e.key));
    return report.chatters.filter(c => /^seat /.test(c.status) && typeof c.nick === 'string' &&
      seated.has(c.nick.toLowerCase()) && names.has(c.emote));
  }
  function begin(players, previous, now) {
    if (!players.length) return null;
    const fresh = players.filter(c => c.emote !== previous);
    const pool = fresh.length ? fresh : players;
    const player = pool[Math.floor(Math.random() * pool.length)];
    return {state:'playing', emote:player.emote, wearer:player.nick, start:now, reveal:now + 16000, end:now + 23000, winner:''};
  }
  function guess(round, message, nick, now) {
    if (round?.state !== 'playing' || now < round.start || now >= round.reveal ||
        typeof message !== 'string' || typeof nick !== 'string' || !nick.trim()) return false;
    const answer = /^!guess\s+(\S+)$/i.exec(message.trim())?.[1];
    if (answer?.toLowerCase() !== round.emote.toLowerCase()) return false;
    round.winner = nick.trim().slice(0, 25);
    round.reveal = now;
    round.end = now + 7000;
    return true;
  }
  const api = {allowed, candidates, begin, guess};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else window.ShadowRound = api;
})();
