// OBS setup, the local control panel and a direct scene link share this room's clock and source matching.
(() => {
  'use strict';
  const roomKey = new URLSearchParams(location.search).get('k');
  window.createHostedLookDirector = (request, onError) => {
    if (!roomKey) throw new Error('A room link is required for cinema looks.');
    async function get(path) {
      const response = await fetch(path, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error('Cinema looks could not load room settings or shader (' + response.status + ').');
      return response;
    }
    return window.CinemaLookDirector.create({
      request, onError, seed: roomKey,
      async readSettings() {
        const state = await (await get('/ctl/settings?k=' + encodeURIComponent(roomKey))).json();
        if (!state.values?.lobby || !state.values?.auditorium) throw new Error('Cinema look settings are unavailable.');
        return state.values;
      },
      async readShader() { return (await get('/concepts/vaporwave/cinema-looks.shader')).text(); },
      matchSource(raw) {
        let url;
        try { url = new URL(raw); } catch { return null; }
        if (url.origin !== location.origin || url.username || url.password ||
            url.searchParams.getAll('k').length !== 1 || url.searchParams.get('k') !== roomKey) return null;
        if (url.pathname === '/lobby.html') return 'lobby';
        if (url.pathname === '/auditorium.html') return 'auditorium';
        return null;
      },
    });
  };
})();
