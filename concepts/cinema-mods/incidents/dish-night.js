import {ease, ellipse, group, mix, node, path, ramp} from './stage.js';

const patterns = [
  {rim:'#335c94', petal:'#6487af', count:6},
  {rim:'#406d58', petal:'#8ba477', count:4},
  {rim:'#8e4550', petal:'#c68684', count:8},
  {rim:'#806130', petal:'#bc9656', count:5},
];

function saucer(parent) {
  const week = Math.floor((Date.now() / 86400000 + 3) / 7);
  const pattern = patterns[week % patterns.length];
  const plate = node(parent, 'svg', {viewBox:'-32 -27 64 54', width:64, height:54,
    class:'dish-night-saucer', 'aria-hidden':'true'});
  plate.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;transform-origin:0 0';
  ellipse(plate, 0, 2, 29, 23, '#b0a78a', {stroke:'#494536','stroke-width':1.4});
  ellipse(plate, 0, 0, 29, 23, '#fff6db', {stroke:pattern.rim,'stroke-width':2.2});
  ellipse(plate, 0, 0, 24, 18.5, 'none', {stroke:pattern.rim,'stroke-width':1});
  const flowers = group(plate,{transform:'scale(1 .78)'});
  for (let i = 0; i < pattern.count; i++) {
    const sprig = group(flowers,{transform:'rotate(' + (i * 360 / pattern.count) + ')'});
    ellipse(sprig, 0, -11, 2.3, 4.6, pattern.petal);
    ellipse(sprig, 0, -23, 1.4, 1.4, pattern.rim);
  }
  ellipse(plate, 0, 0, 4.5, 3.8, pattern.rim);
  return plate;
}

function dimensions(w) {
  return [Number(w.em?.dataset.w) || 42, parseFloat(w.em?.style.height) || 45];
}
function locate(el, x, y, scale, angle) {
  el.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + angle + 'deg) scale(' + scale + ') translate(-50%,-50%)';
}

export function dishNight(getWindows, staff, fx) {
  function windowFor(candidates) {
    return getWindows().find(win => win.cur && staff[win.cashier] && (!candidates || candidates.includes(win.cur)));
  }
  return {
    automatic:true, waitForCast:true, minCast:1, duration:14,
    anchor:() => windowFor()?.at,
    selectCast(candidates) { const win = windowFor(candidates); return win ? [win.cur] : []; },
    start({cast, project, center}) {
      const guest = cast.keys().next().value;
      const win = getWindows().find(w => w.cur === guest), clerk = win && staff[win.cashier];
      if (!clerk) return null;
      const [gw, gh] = dimensions(guest), [cw, ch] = dimensions(clerk);
      const [cx, foot] = project(clerk.u, clerk.v);
      const cy = foot - (clerk.stand || 0) - ch * .5;
      const toward = project(...win.at)[0] >= cx ? 1 : -1;
      const plate = saucer(fx);
      const grip = node(fx,'svg',{width:1,height:1,'aria-hidden':'true'});
      grip.style.cssText='position:absolute;left:0;top:0;overflow:visible;pointer-events:none';
      const sleeve = path(grip,'','none',{stroke:'#485b5b','stroke-width':5,'stroke-linecap':'round'});
      const hand = group(grip);
      path(hand,'M-4 1Q-7-5-4-6L0-2L5-5Q7-6 8-4L5 2Q3 5-1 5Z','#f0ce95',
        {stroke:'#574334','stroke-width':1.3,'stroke-linejoin':'round'});
      let carried = false;
      win.dishGuest = guest;
      const release = () => { if (win.dishGuest === guest) win.dishGuest = null; };
      function camera(t) {
        const [gx, gy] = project(guest.u, guest.v);
        const follow = ease(ramp(t,7.4,10));
        const gain = ease(ramp(t,0,2)) * (1 - ease(ramp(t,12,14)));
        return {x:mix((cx+gx)/2,gx,follow), y:mix((cy+gy-gh*.55)/2,gy-gh,follow), z:1+1.4*gain};
      }
      return {
        ready:() => !guest.plan.length,
        valid:onFoot => onFoot(guest) && !guest.quitting && (carried || win.cur === guest && getWindows().includes(win)),
        actionBounds:() => {
          const [gx, gy] = project(guest.u, guest.v);
          return [Math.min(gx,cx)-center[0]-50,Math.min(gy-gh,cy)-center[1]-50,
            Math.max(gx,cx)-center[0]+52,Math.max(gy,cy)-center[1]+12];
        },
        camera,
        paint(t, reduced) {
          const raise = ease(ramp(t,.7,2.5)), pass = ease(ramp(t,3.2,5.1));
          const [gx, gy] = project(guest.u, guest.v);
          const reach = ease(ramp(t,4.1,5.1));
          const lower = ease(ramp(t,7.4,9.6));
          const wristX = gx-toward*gw*.25, wristY = gy-gh*.55;
          const rimX = gx-toward*(gw*.45+2-7*lower), rimY = gy+mix(-gh-11,-gh*.53+9,lower);
          grip.style.opacity=String(reach*(1-ease(ramp(t,8.3,9.5))));
          const hx=mix(wristX,rimX,reach), hy=mix(wristY,rimY,reach);
          sleeve.setAttribute('d','M'+wristX+' '+wristY+'Q'+(wristX-toward*9)+' '+wristY+' '+hx+' '+hy);
          hand.setAttribute('transform','translate('+hx+' '+hy+') scale('+toward+' 1)');
          if (t < 7.4) {
            plate.style.opacity = String(raise);
            locate(plate,mix(cx + toward*cw*.36, gx - toward*(gw*.45+11), pass),
              mix(cy + (1-raise)*12,gy-gh-22,pass) - (reduced ? 0 : 13*Math.sin(Math.PI*pass)),
              .5+.34*raise, reduced ? 0 : 8*toward*(1-2*pass));
          } else {
            if (!carried) {
              carried = true;
              guest.bod.append(plate);
              guest.bounce = .7;
              release();
            }
            const stow = ease(ramp(t,12,13.7));
            plate.style.opacity = String(1-stow);
            locate(plate,-toward*(gw*.45+11-7*lower),mix(-gh-22,-gh*.53,lower)+stow*9,
              .84-.14*lower-.35*stow, reduced ? 0 : toward*(-8+14*lower));
          }
        },
        dispose() { release(); plate.remove(); grip.remove(); },
      };
    },
  };
}
