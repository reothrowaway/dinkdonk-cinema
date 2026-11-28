(() => {
  'use strict';
  function text(value) {
    if (typeof value !== 'string') return '';
    return Array.from(value.trim().replace(/\s+/gu, ' ')).slice(0, 120).join('');
  }
  function forget(show) {
    show.noticeText = '';
    delete show.noticePrevious;
  }
  function apply(show, command) {
    if (command.withdraw === true) {
      if (show.screen !== 'notice') return false;
      show.screen = show.noticePrevious || 'auto';
      forget(show);
      return true;
    }
    const message = text(command.text);
    if (!message) return false;
    if (show.screen !== 'notice') show.noticePrevious = show.screen || 'auto';
    show.noticeText = message;
    show.screen = 'notice';
    return true;
  }
  const api = {text, forget, apply};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else window.HouseNotice = api;
})();
