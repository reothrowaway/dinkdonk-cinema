(() => {
  'use strict';
  const pad=(n,width)=>String(n).padStart(width,'0');
  function time(ms,separator='.'){
    return pad(Math.floor(ms/3600000),2)+':'+pad(Math.floor(ms/60000)%60,2)+':'+
      pad(Math.floor(ms/1000)%60,2)+separator+pad(ms%1000,3);
  }
  function milliseconds(value){
    const match=/^(?:(\d+):)?(\d{1,2}):([0-5]\d)(?:[.,](\d{1,3}))?$/.exec(String(value).trim());
    if(!match||Number(match[2])>=60)return NaN;
    const ms=((Number(match[1]||0)*60+Number(match[2]))*60+Number(match[3]))*1000+Number((match[4]||'').padEnd(3,'0'));
    return Number.isSafeInteger(ms)?ms:NaN;
  }
  const escape=text=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const decode=text=>text.replace(/&(amp|lt|gt|nbsp);/g,(all,key)=>({amp:'&',lt:'<',gt:'>',nbsp:'\u00a0'})[key]);
  function verify(cue){
    if(!Number.isSafeInteger(cue.start)||cue.start<0||!Number.isSafeInteger(cue.end)||cue.end<=cue.start)
      throw Error('Enter an out time later than the in time. Use hours, minutes, seconds and milliseconds.');
    if(typeof cue.text!=='string'||!cue.text.trim())throw Error('Enter caption text.');
    if(/\n[ \t]*\n/.test(cue.text))throw Error('Remove the empty line inside the caption.');
  }
  const ordered=cues=>cues.slice().sort((a,b)=>a.start-b.start||a.end-b.end);
  function read(contents){
    const src=contents.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').trim();
    const blocks=src?src.split(/\n[ \t]*\n/):[];
    const vtt=/^WEBVTT(?:[ \t].*)?$/.test(blocks[0]||'');
    if(vtt)blocks.shift();else if(!blocks.length)throw Error('The caption file is empty.');
    const cues=[];
    for(const [index,block] of blocks.entries()){
      if(vtt && /^NOTE(?:[ \t\n]|$)/.test(block))continue;
      const lines=block.split('\n'),start=lines[0].includes('-->')?0:1;
      const timing=/^(\S+)[ \t]+-->[ \t]+(\S+)[ \t]*$/.exec(lines[start]||'');
      if(!timing)throw Error('Block '+(index+1)+' needs plain in and out times. Positioned or styled cues require a separate editor.');
      const raw=lines.slice(start+1).join('\n');
      if(/<\/?[a-z!][^>]*>|<\d[\d:.]*>/i.test(raw))throw Error('Block '+(index+1)+' includes markup. Import plain-text captions to preserve your original formatting.');
      const cue={start:milliseconds(timing[1]),end:milliseconds(timing[2]),text:decode(raw).trim()};
      try{verify(cue);}catch(e){throw Error('Block '+(index+1)+' — '+e.message);}
      cues.push(cue);
    }
    return ordered(cues);
  }
  function write(cues,format){
    const vtt=format==='vtt', sep=vtt?'.':',';
    return (vtt?'WEBVTT\n\n':'')+ordered(cues).map((c,i)=>{
      verify(c);
      return (vtt?'':(i+1)+'\n')+time(c.start,sep)+' --> '+time(c.end,sep)+'\n'+escape(c.text);
    }).join('\n\n')+'\n';
  }
  window.CaptionFile={time,milliseconds,escape,verify,ordered,read,write};
})();
