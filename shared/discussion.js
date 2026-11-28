'use strict';
const {randomUUID} = require('node:crypto');

function eligible(show) {
  return show.phase === 'up' && show.screen === 'auto' && !show.houseOut &&
    !show.intermissionUntil && !show.singAlongAt && !show.shadowRound;
}
function questionText(value) {
  if (typeof value !== 'string') return '';
  const text = value.trim().replace(/\s+/gu,' ');
  return Array.from(text).length <= 160 ? text : '';
}
function parseQuestion(message) {
  if (typeof message !== 'string') return '';
  const match = /^!ask\s+([\s\S]+)$/iu.exec(message.trim());
  return match ? questionText(match[1]) : '';
}

function createDesk(showChanged) {
  let session = null, current = null;
  const pending = [];
  function close() {
    if (!session) return;
    session = null; current = null; pending.length = 0;
    showChanged();
  }
  function add(nick,text) {
    if (!session || !text || pending.length >= 20) return false;
    const key = nick?.toLowerCase();
    if (pending.some(q=>key ? q.nick?.toLowerCase()===key : q.nick===null && q.text===text)) return false;
    pending.push({id:randomUUID(),nick,text});
    return true;
  }
  function receive(nick, message) {
    if (session && typeof nick==='string' && /^[\w-]{1,32}$/u.test(nick)) add(nick,parseQuestion(message));
  }
  function purge(key) {
    for (let i=pending.length-1;i>=0;i--) if (pending[i].nick?.toLowerCase()===key) pending.splice(i,1);
    if (current?.nick?.toLowerCase()===key) { current=null; showChanged(); }
  }
  function act(command, show) {
    if (!eligible(show)) return 'Choose Lights up and Auto with the projector available.';
    if (command.action==='open') {
      if (!session) { session=randomUUID(); showChanged(); }
      return '';
    }
    if (!session || command.session!==session) return 'This Q&A has ended. Refresh the desk.';
    switch (command.action) {
      case 'close': close(); return '';
      case 'host':
        return add(null,questionText(command.text)) ? '' : 'Enter a new question of up to 160 characters, with room in the queue.';
      case 'answered':
        if (!current || current.id!==command.questionId) return 'The projected question has changed.';
        current=null; showChanged(); return '';
      case 'project':
      case 'dismiss': {
        const index=pending.findIndex(q=>q.id===command.questionId);
        if (index<0) return 'This question is no longer waiting.';
        if (command.action==='project' && current) return 'Finish the projected question first.';
        const [question]=pending.splice(index,1);
        if (command.action==='project') { current=question; showChanged(); }
        return '';
      }
      default: return 'Unknown question desk action.';
    }
  }
  return {act, close, receive, purge, reconcile(show){ if (!eligible(show)) close(); },
    projector:()=>session ? {question:current} : null,
    panel:show=>({available:eligible(show),session,current,pending:[...pending]})};
}
module.exports={createDesk,parseQuestion};
