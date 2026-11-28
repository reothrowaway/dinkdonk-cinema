const clamp = n => Math.max(0, Math.min(1, n));
const radius = 20;

function castSeats(host) {
  const seats = host.seated().filter(w => !w.dozing && !w.texting && !w.pendingSeat && w.box)
    .map(w => ({w, seat:w.seat, x:host.point(w)[0], y:host.point(w)[1], top:w.box[1] + 10,
      scale:(w.box[2]-w.box[0]-20)/w.emW}))
    .sort((a,b) => a.x - b.x);
  // Choose the side with visible air over the shoulder. Back-row spectators
  // generally have room to reach without a foreground face covering the hit.
  for (const s of seats) {
    const space = side => {
      const x = s.x + side*(s.w.emW*.34+10)*s.scale, y = s.top-radius-7;
      return seats.reduce((cost,other) => {
        if (s === other) return cost;
        const box = other.w.box;
        const dx = Math.max(box[0]+8-x, x-box[2]+8, 0);
        const dy = Math.max(box[1]+8-y, y-box[3]+8, 0);
        return cost + Math.max(0, 35-Math.hypot(dx,dy));
      },0);
    };
    const left = space(-1), right = space(1);
    s.side = left < right ? -1 : 1;
    s.crowd = Math.min(left,right);
  }
  let pair, best = Infinity;
  for (let i = 0; i < seats.length; i++) {
    for (let j = i + 1; j < seats.length; j++) {
      const a = seats[i], b = seats[j], dx = b.x - a.x, dy = Math.abs(a.top - b.top);
      if (dx > 570) break;
      if (dx < 60 || dy > 150) continue;
      const score = Math.abs(dx - 250) + dy + 3*(a.crowd+b.crowd) + Math.random() * 25;
      if (score < best) { best = score; pair = [a,b]; }
    }
  }
  if (!pair) return [];
  const [a,b] = pair;
  const center = (a.x+b.x)/2;
  const middle = seats.filter(s => s.x > a.x + 60 && s.x < b.x - 60 && Math.abs(s.top - (a.top + b.top)/2) < 90 && s.crowd < 35)
    .sort((l,r) => (Math.abs(l.x-center)+3*l.crowd) - (Math.abs(r.x-center)+3*r.crowd))[0];
  return middle ? [a,middle,b] : pair;
}

export function startBeachBall(host, reduced) {
  const cast = castSeats(host);
  if (cast.length < 2) return null;
  const tour = cast.length === 3 ? [0,1,2,1,0] : [0,1,0,1,0];
  const marks = cast.map(s => [s.x+s.side*(s.w.emW*.34+10)*s.scale, s.top-radius-7]);
  const hands = cast.map(({w,side}) => {
    const arm = document.createElement('span'), palm = document.createElement('span');
    arm.className = 'beach-volley-hand';
    arm.setAttribute('aria-hidden','true');
    const length = Math.max(18,w.emH*.44+6);
    arm.style.cssText = 'position:absolute;width:6px;border-radius:4px;background:#e4b569;box-shadow:0 0 0 1px #41372c;transform-origin:50% 100%;pointer-events:none;z-index:3';
    Object.assign(arm.style,{height:length+'px',left:(side*w.emW*.34-3)+'px',top:(-w.emH*.53-length)+'px',opacity:'0'});
    palm.textContent = '✋';
    palm.style.cssText = 'position:absolute;left:50%;top:0;transform:translate(-50%,-70%);font:19px/1 "Segoe UI Emoji",sans-serif';
    arm.append(palm);w.bod.append(arm);
    return arm;
  });
  const ball = document.createElement('img');
  ball.src = new URL('./beach-ball.webp', import.meta.url).href;
  ball.className = 'festival-beach-ball';
  ball.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;width:40px;height:40px;object-fit:contain;opacity:0';
  ball.style.zIndex = Math.max(...cast.map(s => Number(s.w.el.style.zIndex)))+2;
  document.getElementById('cam').append(ball);
  const left = Math.min(...marks.map(p=>p[0]))-76, right = Math.max(...marks.map(p=>p[0]))+76;
  const top = Math.min(...marks.map(p=>p[1]))-109, bottom = Math.max(...cast.map(s=>host.point(s.w)[1]))+27;
  const requested = performance.now(), lead = 2.5, beat = 2.15, lastHit = lead + beat*(tour.length-1);
  const end = lastHit + 3.6;
  let began = null, t = 0, last = -1;
  function cancel() { ball.remove(); for (const arm of hands) arm.remove(); }
  function reach(i) {
    let tap = 0;
    for (let j=0;j<tour.length;j++) if (tour[j]===i) tap = Math.max(tap,1-Math.abs(t-lead-j*beat)/.65);
    return tap;
  }
  function state() {
    const now = performance.now();
    if (!ball.naturalWidth) return ball.complete || now-requested>5000 ? 'interrupted' : 'playing';
    if (began === null) began = now;
    t = (now-began)/1000;
    if (t >= end) { cancel(); return 'complete'; }
    if (cast.some(s=>!host.active(s.w) || s.w.seat !== s.seat)) return 'interrupted';
    const progress = Math.max(0, (t-lead)/beat);
    const step = Math.min(tour.length-1, Math.floor(progress));
    const from = marks[tour[step]], to = marks[tour[Math.min(step+1,tour.length-1)]];
    const p = clamp(progress-step);
    if (step !== last) {
      last = step;
      const w = cast[tour[step]].w;
      w.nameT = Math.max(w.nameT || 0, 2);
      ball.alt = 'Beach ball with ' + w.nick;
    }
    const flight = step < tour.length-1 ? 4*p*(1-p) : 0;
    const arc = reduced ? 24 : Math.min(90, 50+Math.abs(to[0]-from[0])*.15);
    const owner = cast[0], lowering = clamp((t-lastHit-.45)/2.1);
    const pocket = lowering*lowering*(3-2*lowering);
    const held = t<lead ? 1-clamp((t-.6)/1.6) : pocket;
    const lip = owner.y - (owner.w.hideLocal||0)*owner.scale;
    const x = from[0]+(to[0]-from[0])*p - owner.side*5*held;
    const y = from[1]+(to[1]-from[1])*p - arc*flight + (t<lead ? 17*held : (lip+radius+3-from[1])*pocket);
    const spin = reduced ? 0 : 90*Math.min(progress,tour.length-1);
    ball.style.transform = 'translate('+(x-radius).toFixed(1)+'px,'+(y-radius).toFixed(1)+'px) rotate('+spin.toFixed(1)+'deg)';
    ball.style.opacity = clamp(t/.35).toFixed(2);
    if (pocket) ball.style.clipPath = 'inset(0 0 '+Math.min(40,Math.max(0,y+radius-lip)).toFixed(1)+'px 0)';
    hands.forEach((arm,i)=>{
      const tap = reach(i), holding = i===0 && (t<lead || t>=lastHit) ? 1 : 0;
      const strength = Math.max(tap, holding*(1-pocket));
      arm.style.opacity = Math.min(1,strength*2).toFixed(2);
      arm.style.transform = 'rotate('+(cast[i].side*(64-40*strength)).toFixed(1)+'deg) scaleY('+(0.55+.45*strength).toFixed(2)+')';
    });
    return 'playing';
  }
  function pose(w) {
    const i = cast.findIndex(s=>s.w===w);
    if (i<0) return;
    const tap = reach(i);
    return {lift:(reduced?2:9)*tap,tilt:(i===cast.length-1?-1:1)*(reduced?2:8)*tap,sq:1-.05*tap};
  }
  state();
  return {state, pose, cancel, bounds:[left,top,right,bottom],
    camera:()=>reduced||began===null?null:[(left+right)/2,(top+bottom)/2,Math.min(2.8,1550/(right-left),850/(bottom-top))]};
}
