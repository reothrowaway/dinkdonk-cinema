// Authoring tool. Requires Playwright Chromium and FFmpeg. The cinema plays the finished MP4.
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const {spawn} = require('node:child_process'), {once} = require('node:events');
const {chromium} = require('playwright');
const fps = 24, seconds = 18, rate = 48000, intro = 2;
const phrases = [
  [['Save','me','a','seat,'],['down','in','row','two.']],
  [['Turn','your','eyes','up'],['to','the','screen.']],
  [['High','in','the','booth,'],['hear','that','reel','spin.']],
  [['Let','the','show'],['be','gin.']],
];

function wave(pcm) {
  const silence = Buffer.alloc(rate * intro * 2);
  const size = rate * seconds * 2, header = Buffer.alloc(44);
  header.write('RIFF'); header.writeUInt32LE(36+size,4); header.write('WAVEfmt ',8);
  header.writeUInt32LE(16,16); header.writeUInt16LE(1,20); header.writeUInt16LE(1,22);
  header.writeUInt32LE(rate,24); header.writeUInt32LE(rate*2,28);
  header.writeUInt16LE(2,32); header.writeUInt16LE(16,34); header.write('data',36); header.writeUInt32LE(size,40);
  return Buffer.concat([header,silence,pcm,Buffer.alloc(size-silence.length-pcm.length)]);
}

// Executed in the same browser that renders the organ score.
async function drawFrames({phrases, melody, fps, seconds, intro}) {
  const canvas = document.createElement('canvas'); canvas.width = 960; canvas.height = 540;
  const g = canvas.getContext('2d');
  const paper = '#fff0cb', amber = '#ffd26e', muted = '#e1cab0', wine = '#512228';
  function text(s,x,y,font,color) {
    g.font = font; g.fillStyle = color; g.textAlign = 'center'; g.fillText(s,x,y);
  }
  let n = 0;
  const pages = phrases.map((lines,section) => lines.map((words,row) => {
    g.font = 'bold 68px Georgia';
    const widths = words.map(word=>g.measureText(word).width);
    const gaps = words.map((_,i)=>i>0 && !(section===3 && row===1) ? g.measureText(' ').width : 0);
    let x = (960-widths.reduce((a,b)=>a+b,0)-gaps.reduce((a,b)=>a+b,0))/2;
    return words.map((word,i) => {
      x += gaps[i]; const cx = x+widths[i]/2; x += widths[i];
      return {word,x:cx,y:row?355:255,time:melody[n++].time+intro};
    });
  }));
  if (n !== melody.length) throw Error('Lyrics and original melody have different syllable counts');
  const all = pages.flat(2), last = intro+melody.at(-1).end;
  function border() {
    g.fillStyle = wine; g.fillRect(0,0,960,540);
    g.strokeStyle = '#ca965c'; g.lineWidth = 2; g.strokeRect(18,18,924,504); g.strokeRect(27,27,906,486);
    g.lineWidth = 1;
    for (const [x,y,dx,dy] of [[32,32,1,1],[928,32,-1,1],[32,508,1,-1],[928,508,-1,-1]]) {
      g.beginPath(); g.moveTo(x+30*dx,y); g.lineTo(x+14*dx,y+14*dy); g.lineTo(x,y+30*dy); g.stroke();
    }
  }
  for (let frame=0;frame<fps*seconds;frame++) {
    const t = frame/fps;
    border();
    text('D I N K D O N K   C I N E M A',480,80,'bold 23px Georgia',amber);
    if (t<1.3 || t>last+.25) {
      text('Save Me a Seat',480,274,'italic bold 82px Georgia',paper);
      text(t<1.3?'A house organ sing-along':'The DinkDonk house organ',480,341,'32px Georgia',muted);
    } else {
      const index = Math.max(0,all.findLastIndex(s=>s.time<=t));
      const active = all[index], next = all[index+1];
      const lines = pages.find(rows=>rows.some(line=>line.includes(active)));
      for (const line of lines) for (const syllable of line) {
        text(syllable.word,syllable.x,syllable.y,'bold 68px Georgia',syllable===active&&t>=active.time?amber:paper);
      }
      const phase = Math.min(1,Math.max(0,(t-active.time)/((next?.time||last)-active.time)));
      const x = next?.y===active.y && lines.some(line=>line.includes(next)) ? active.x+(next.x-active.x)*phase : active.x;
      const y = active.y-69-26*Math.sin(Math.PI*phase);
      g.fillStyle = amber; g.beginPath(); g.arc(x,y,10,0,2*Math.PI); g.fill();
      text('Save Me a Seat',480,456,'italic 29px Georgia',muted);
    }
    await window.emitSongFrame(canvas.toDataURL('image/png').split(',')[1]);
  }
}

async function make() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(),'cinema-song-'));
  const audio = path.join(temp,'organ.wav'), output = path.join(__dirname,'save-me-a-seat.mp4');
  const part = path.join(__dirname,'.save-me-a-seat-'+process.pid+'.mp4');
  let browser, encoder;
  try {
    browser = await chromium.launch({executablePath:process.env.CINEMA_CHROME || undefined,headless:true,args:['--disable-gpu']});
    const page = await browser.newPage();
    await page.addScriptTag({path:path.join(__dirname,'instrument.js')});
    const score = await page.evaluate(async rate=>{
      const context = new OfflineAudioContext(1,rate*15,rate);
      const organ = CinemaOrgan.create(context); organ.register('diapason');
      const {melody} = organ.playOverture();
      const samples = (await context.startRendering()).getChannelData(0);
      const pcm = new Int16Array(samples.length);
      for(let i=0;i<pcm.length;i++) pcm[i]=Math.round(Math.max(-1,Math.min(1,samples[i]))*32767);
      const bytes = new Uint8Array(pcm.buffer), chunks=[];
      for(let i=0;i<bytes.length;i+=8192) chunks.push(String.fromCharCode(...bytes.subarray(i,i+8192)));
      return {melody, pcm:btoa(chunks.join(''))};
    },rate);
    fs.writeFileSync(audio,wave(Buffer.from(score.pcm,'base64')));
    encoder = spawn(process.env.CINEMA_FFMPEG || 'ffmpeg',['-hide_banner','-loglevel','error','-y',
      '-f','image2pipe','-framerate',String(fps),'-c:v','png','-i','pipe:0','-i',audio,
      '-c:v','libx264','-pix_fmt','yuv420p','-threads','2','-crf','18','-preset','veryfast',
      '-c:a','aac','-b:a','128k','-movflags','+faststart',part],{stdio:['pipe','ignore','inherit'],windowsHide:true});
    const finished=once(encoder,'close');
    encoder.stdin.on('error',()=>{});
    await page.exposeFunction('emitSongFrame',async data=>{
      if (encoder.exitCode!==null || encoder.stdin.destroyed) throw Error('Video encoder stopped');
      if (!encoder.stdin.write(Buffer.from(data,'base64'))) await once(encoder.stdin,'drain');
    });
    await page.evaluate(drawFrames,{phrases,melody:score.melody,fps,seconds,intro});
    encoder.stdin.end();
    const [code] = await finished; if(code!==0) throw Error('Video encoding failed');
    fs.renameSync(part,output);
  } finally {
    if (encoder && encoder.exitCode===null) encoder.kill();
    if (browser) await browser.close();
    fs.rmSync(part,{force:true}); fs.rmSync(audio,{force:true}); fs.rmdirSync(temp);
  }
}
make().catch(error=>{console.error(error);process.exitCode=1;});
