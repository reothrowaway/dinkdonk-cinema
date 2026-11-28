(() => {
  'use strict';
  const el=id=>document.getElementById(id);
  // Keep the order of the v1 decks stable so old game links still deal the same cards.
  const decks={
    lobby:[
      ['A bus stops outside','A taxi pulls up','An umbrella opens','A guest enters from the street','Headlights cross the road','The street marquee lights up'],
      ['Someone joins the ticket line','A cashier serves a guest','A guest carries popcorn','A screen door opens','A speech bubble appears','Two guests walk together'],
      ['A guest sits on the bench','The jukebox lights up','The claw cabinet glows','A guest visits the restroom','A cleaner crosses the floor','A guest stops at the snack bar']
    ],
    film:[
      ['A door opens onto a new place','Two people share a meal','Someone checks the time','A phone rings','Someone changes clothes','Someone knocks on a door'],
      ['A face appears in a reflection','A scene starts outdoors','A close-up fills the screen','The camera follows a walker','A sign names a place','A room goes dark'],
      ['Someone reads a message','A character says goodbye','An object changes hands','Someone tells a joke','A vehicle comes to a stop','Music plays inside the scene']
    ]
  };
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const prefix='dinkdonk.bingo.v1.',memory=new Map();
  let persistent=true,deck,seed,game,cardNo,labels;
  function get(key){
    try {
      if(persistent){
        const value=localStorage.getItem(prefix+key);
        if(value===null)memory.delete(key);else memory.set(key,value);
        return value;
      }
    } catch {persistent=false;}
    return memory.get(key)??null;
  }
  function put(key,value){
    if(value===null)memory.delete(key);else memory.set(key,String(value));
    try {
      if(persistent){
        if(value===null)localStorage.removeItem(prefix+key);else localStorage.setItem(prefix+key,String(value));
      }
    } catch {persistent=false;}
  }
  function random(n){return crypto.getRandomValues(new Uint32Array(1))[0]%n;}
  function newId(name){return 'v1-'+name+'-'+random(0x1000000).toString(16).padStart(6,'0').toUpperCase();}
  const valid=id=>/^v1-(lobby|film)-[\da-f]{6}$/i.test(id||'');
  const number=n=>/^\d{1,4}$/.test(String(n)) && Number(n)>=1 && Number(n)<=9999;
  function pool() {
    let state=(seed+0x9e3779b9)>>>0;
    function next(n){state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n;}
    return decks[deck].flatMap((group,i)=>{
      const items=group.slice();
      for(let j=items.length-1;j>0;j--){const k=next(j+1);[items[j],items[k]]=[items[k],items[j]];}
      return items.slice(0,i===2?4:5);
    });
  }
  function deal(no){
    const choices=pool();
    // Rank distinct ordered selections of eight from fourteen. 7919 is coprime
    // to 14P8, so all 9,999 card numbers have different arrangements in this game.
    const possibilities=14*13*12*11*10*9*8*7;
    let rank=(seed+(no-1)*7919)%possibilities;
    const cells=[];
    for(let i=0;i<8;i++){
      const n=choices.length,index=rank%n;
      rank=Math.floor(rank/n);
      cells.push(choices.splice(index,1)[0]);
    }
    cells.splice(4,0,'Free space');return cells;
  }
  const title=()=>deck==='lobby'?'Lobby bingo':'Film bingo';
  const serial=n=>String(n).padStart(4,'0');
  const markKey=i=>game+'.'+cardNo+'.'+i;
  function updateMarks(){
    const cells=[...el('grid').children],stamped=labels.map((_,i)=>i===4||get(markKey(i))==='1');
    const won=lines.filter(line=>line.every(i=>stamped[i]));
    const glowing=new Set(won.flat());
    cells.forEach((cell,i)=>{
      if(i!==4)cell.setAttribute('aria-pressed',String(stamped[i]));
      cell.classList.toggle('win',glowing.has(i));
    });
    const total=stamped.filter(Boolean).length-1;
    el('score').textContent=won.length?'Bingo! '+won.length+(won.length===1?' line':' lines')+' · '+total+' of 8 marked':
      total+' of 8 marked';
  }
  function display(no) {
    cardNo=no;put(game+'.card',no);labels=deal(no);
    el('card').value=String(no);el('card').setCustomValidity('');
    el('deck').value=deck;el('game-title').textContent=title();el('game-id').textContent='Game '+game.slice(-6);
    el('card-id').textContent='Card '+serial(no);
    el('grid').replaceChildren(...labels.map((text,i)=>{
      const cell=document.createElement(i===4?'span':'button');
      cell.textContent=text;cell.className=i===4?'cell free':'cell';
      if(i!==4){
        cell.type='button';cell.addEventListener('click',()=>{
          put(markKey(i),get(markKey(i))==='1'?null:'1');updateMarks();
          if(!persistent)el('feedback').textContent='Marks last only in this tab.';
        });
      }
      return cell;
    }));
    updateMarks();
  }
  function open(id,method){
    if(!valid(id))return;
    const [,theme,hex]=id.toLowerCase().split('-');
    deck=theme;seed=parseInt(hex,16);game='v1-'+deck+'-'+hex.toUpperCase();
    if(method)history[method](null,'','#'+game);
    put('last',game);put('last.'+deck,game);
    const previous=get(game+'.card');
    el('feedback').textContent='';el('share-url').hidden=true;
    display(number(previous)?Number(previous):1+random(9999));
  }
  function restore(){
    const hash=location.hash.slice(1),previous=get('last');
    open(valid(hash)?hash:valid(previous)?previous:newId('lobby'),valid(hash)?null:'replaceState');
    if(hash&&!valid(hash))el('feedback').textContent='This game code is incomplete. The current card is shown.';
  }
  el('card').addEventListener('change',()=>{
    if(!number(el('card').value)){el('card').setCustomValidity('Choose a card from 1 to 9999.');el('card').reportValidity();return;}
    const next=Number(el('card').value);
    if(next!==cardNo)display(next);
  });
  el('card').addEventListener('input',()=>el('card').setCustomValidity(''));
  el('deck').addEventListener('change',()=>{
    const name=el('deck').value, prior=get('last.'+name);
    open(valid(prior)?prior:newId(name),'pushState');
  });
  el('fresh').onclick=()=>{let next=newId(deck);if(next===game)next='v1-'+deck+'-'+((seed+1)%0x1000000).toString(16).padStart(6,'0').toUpperCase();open(next,'pushState');};
  el('share').onclick=async()=>{
    const url=new URL(location.href);url.search='';url.hash=game;
    try {await navigator.clipboard.writeText(url.href);el('feedback').textContent='Game link copied.';}
    catch {const field=el('share-url');field.value=url.href;field.hidden=false;field.focus();field.select();el('feedback').textContent='Copy the selected game link.';}
  };
  function printCards(){
    const sheets=[];
    for(let i=0;i<4;i++){
      const n=(cardNo-1+i)%9999+1,sheet=document.createElement('article'),line=document.createElement('div');
      sheet.className='ticket';line.className='line';
      const id=document.createElement('span'),serialNo=document.createElement('span');
      id.textContent='Game '+game.slice(-6);serialNo.textContent='Card '+serial(n);line.append(id,serialNo);
      const heading=document.createElement('h2');heading.textContent=title();
      const grid=document.createElement('div');grid.className='grid';
      deal(n).forEach((label,at)=>{const c=document.createElement('span');c.className=at===4?'cell free':'cell';c.textContent=label;grid.append(c);});
      const rule=document.createElement('p');rule.className='paper-rule';rule.textContent='Mark what you spot. Three in a line wins.';
      sheet.append(line,heading,grid,rule);sheets.push(sheet);
    }
    el('paper').replaceChildren(...sheets);
  }
  el('print').onclick=()=>{printCards();window.print();};
  window.addEventListener('beforeprint',printCards);
  window.addEventListener('hashchange',restore);
  window.addEventListener('popstate',restore);
  window.addEventListener('storage',e=>{if(e.key===null||e.key.startsWith(prefix+game+'.'+cardNo+'.'))updateMarks();});
  restore();
})();
