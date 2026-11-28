// Generate a machine-local OBS collection from the clean, packaged cinema scenes.
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const desktop = path.resolve(__dirname, '../../../..');
const base = path.join(desktop, 'dist/DinkDonk-Cinema/obs/DinkDonk Cinema 1440p.json');
const shader = path.resolve(__dirname, '../cinema-looks.shader').replaceAll('\\', '/');
const collection = JSON.parse(fs.readFileSync(base, 'utf8'));
const shortlist = {
  lobby: [[12,'Neon rain',85], [0,'After-hours mall',75], [2,'Chrome & cyan',65],
    [4,'Miami dusk',65], [10,'Ultraviolet arcade',60], [7,'Curved CRT',65]],
  auditorium: [[1,'Pearl diffusion',55], [11,'35 mm midnight',70]],
};
collection.name = 'DinkDonk Cinema Looks QA';
collection.current_scene = collection.current_program_scene = 'Lobby + Poll setup';
const id = name => {
  const hex=createHash('sha256').update(collection.name+'/'+name).digest('hex');
  return [hex.slice(0,8),hex.slice(8,12),'4'+hex.slice(13,16),'a'+hex.slice(17,20),hex.slice(20,32)].join('-');
};
for (const src of collection.sources.filter(s => s.id === 'browser_source')) {
  const url = new URL(src.settings.url);
  const room = url.pathname === '/auditorium.html' ? 'auditorium' : url.pathname === '/lobby.html' ? 'lobby' : null;
  if (!room) throw Error('Unexpected browser source '+src.name);
  url.pathname = '/'+room+'-qa.html'; url.port='18791';
  url.searchParams.set('everyone','1'); url.searchParams.set('events','1');
  url.searchParams.set('bridge','0'); url.searchParams.set('relay','127.0.0.1:18792');
  src.settings.url = url.toString();
  const key = room === 'auditorium';
  if (key && !src.filters.some(f => f.id === 'color_key_filter')) throw Error('Missing auditorium color key');
  for (const [i,[preset,label,strength]] of shortlist[room].entries()) {
    const name=label+' · '+strength+'%';
    src.filters.push({name,uuid:id(room+name),id:'shader_filter',versioned_id:'shader_filter',
      enabled:i===0,settings:{from_file:true,shader_file_name:shader,Preset:preset,Strength:strength,Keyed_Plate:key}});
  }
}
const file=path.join(__dirname,'DinkDonk_Cinema_Looks_QA.json');
fs.writeFileSync(file,JSON.stringify(collection,null,2)+'\n');
console.log(file);
