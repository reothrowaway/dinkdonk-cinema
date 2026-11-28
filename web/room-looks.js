// Migrate only legacy filters on this hosted room's own OBS sources.
import '/shared/obs-look-director.js';
export async function disableLegacyLooks(request, current) {
  const roomKey = new URL(location.href).searchParams.get('k');
  if (!roomKey || !current()) return;
  await window.CinemaLookDirector.disableLegacy({ request, current,
    async readShader() {
      const r = await fetch('/concepts/vaporwave/cinema-looks.shader', { signal: AbortSignal.timeout(5000) });
      if (!r.ok) throw Error('Legacy shader HTTP ' + r.status);
      return r.text();
    },
    matchSource(raw) {
      let url;
      try { url = new URL(raw); } catch { return false; }
      return url.origin === location.origin && !url.username && !url.password &&
        url.searchParams.getAll('k').length === 1 && url.searchParams.get('k') === roomKey &&
        ['/lobby.html','/auditorium.html'].includes(url.pathname);
    }
  });
}
