// A short body-percussion score. Each stored attack drives one player's
// motion and the matching sample attack in the original stereo Foley track.
export const rainDuration=24;
const clamp=x=>Math.max(0,Math.min(1,x));
export function rainScore(players){
  const hits=[];
  const phrases=[
    ['rub',2.2,7.35,.59,.74],['snap',6.55,11.65,.62,.84],['pat',10.9,15.9,.56,1],
    ['snap',15.35,19.2,.78,.7],['rub',18.45,22.3,.71,.64]
  ];
  for(let player=0;player<players;player++){
    for(const [index,phrase] of phrases.entries()){
      const [kind,from,to,period,level]=phrase;
      const next=phrases[index+1],stop=next?Math.min(to,next[1]+player*.24):to;
      let beat=0;
      for(let t=from+player*.24;t<stop;t+=period*(1+.075*Math.sin(++beat*1.67+player))){
        const fade=.42+.58*Math.min(clamp((t-from+.35)/.95),clamp((to-t+.17)/.92));
        hits.push({kind,player,t,amp:level*fade*(.88+.12*Math.cos(beat+player)),length:kind==='rub'?.48:kind==='snap'?.12:.22});
      }
    }
  }
  return hits.sort((a,b)=>a.t-b.t);
}
export function rainWave(hits,players){
  const rate=24000,frames=rainDuration*rate,left=new Float32Array(frames),right=new Float32Array(frames);
  let seed=725397;
  function noise(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;}
  for(const h of hits){
    const start=Math.round(h.t*rate),length=Math.ceil(h.length*rate);
    const pan=players===1?0:(h.player/(players-1)-.5)*1.22;
    const l=Math.sqrt((1-pan)/2)*h.amp,r=Math.sqrt((1+pan)/2)*h.amp;
    let fast=0,slow=0,prior=0;
    for(let i=0;i<length&&start+i<frames;i++){
      const t=i/rate,n=noise();fast+=(n-fast)*.52;slow+=(n-slow)*.085;
      let sample;
      if(h.kind==='rub'){
        const envelope=Math.sin(Math.PI*t/h.length)**1.5;
        sample=(fast-slow)*(.13+.08*Math.sin(t*32+h.player)**2)*envelope;
      }else if(h.kind==='snap'){
        const click=Math.exp(-t*155)+(t>.012?Math.exp(-(t-.012)*210)*.38:0);
        sample=((n-prior)*.25+Math.sin(t*(1580+h.player*110)*Math.PI*2)*.17)*click;
      }else{
        const pitch=86+h.player*8;
        sample=Math.sin(2*Math.PI*(pitch*t+.42*(1-Math.exp(-t*42))))*Math.exp(-t*28)*.63+
          fast*Math.exp(-t*66)*.43;
      }
      prior=n;left[start+i]+=sample*l;right[start+i]+=sample*r;
    }
  }
  const buffer=new ArrayBuffer(44+frames*4),view=new DataView(buffer);
  const tag=(at,s)=>{for(let i=0;i<s.length;i++)view.setUint8(at+i,s.charCodeAt(i));};
  tag(0,'RIFF');view.setUint32(4,buffer.byteLength-8,true);tag(8,'WAVE');tag(12,'fmt ');
  view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,2,true);
  view.setUint32(24,rate,true);view.setUint32(28,rate*4,true);view.setUint16(32,4,true);view.setUint16(34,16,true);
  tag(36,'data');view.setUint32(40,frames*4,true);
  let peak=.001;for(let i=0;i<frames;i++)peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
  const gain=Math.min(2,.76/peak)*32767;
  for(let i=0;i<frames;i++){view.setInt16(44+4*i,Math.round(left[i]*gain),true);view.setInt16(46+4*i,Math.round(right[i]*gain),true);}
  return new Blob([buffer],{type:'audio/wav'});
}
