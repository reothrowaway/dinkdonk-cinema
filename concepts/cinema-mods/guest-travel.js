import {guestRoute, walkableMark} from './guest-routes.js';

// A trip belongs to the native stepPlan loop. It never writes to a guest's
// coordinates. Preserve the interrupted plan, including partially spent waits.
const trips = new WeakMap();

export function syncGuestTravel(w) {
  const leg=trips.get(w);
  if (leg && !leg.ownsPlan()) {
    trips.delete(w);
    showStage(w,null,leg.i);
  }
}

export function availableForTravel(w, anchors) {
  return !trips.get(w)?.ownsPlan() && Array.isArray(w.plan) && !w.entering &&
    !w.hurry && !w.quitting && !w.waitingBus && !w.inQueue && !w.snack && !w.stall && !w.reFreeze && !w.ride &&
    !w.doorBound && !w.dancing && !w.group && !w.thru && !w.gone && !w.removing &&
    (!anchors.canWalk || anchors.canWalk(w));
}

function showStage(w, phase, index) {
  if (!w.el) return;
  if (phase) {
    w.el.dataset.eventWalk = phase;
    w.el.dataset.eventSlot = String(index);
  } else {
    delete w.el.dataset.eventWalk;
    delete w.el.dataset.eventSlot;
  }
}

export function beginGuestTravel(cast, targets, anchors, cues = []) {
  const legs = [];
  let storyTime = 0;
  // Plan the whole cast before taking any guest away from an ordinary activity.
  for (const [w,i] of cast) {
    if (!availableForTravel(w, anchors)) return null;
    const target = walkableMark(targets[i], anchors);
    const path = target && guestRoute([w.u,w.v], target, anchors);
    if (!path?.length) return null;
    const mark = path.at(-1), walks = [];
    let from = mark;
    for (const cue of cues.filter(cue => cue.slot === i)) {
      const to = walkableMark([mark[0]+cue.offset[0], mark[1]+cue.offset[1]], anchors);
      const route = to && guestRoute(from, to, anchors);
      if (!route) return null;
      walks.push({at:cue.at, route});
      from = to;
    }
    legs.push({w,i,path,walks,mark,original:w.plan,arrived:false});
  }

  for (const leg of legs) {
    const {w,i,path} = leg;
    // Keep the intermediate step objects so a cancellation can retrace only
    // those waypoints this guest actually reached.
    leg.steps = path.slice(1).map(to => ({to}));
    leg.storySteps = [];
    leg.plan = [...leg.steps, {call(){leg.arrived=true;showStage(w,'mark',i);}}];
    for (const {at,route} of leg.walks) {
      const crossing = route.slice(1).map(to=>({to,slow:true}));
      leg.storySteps.push(...crossing);
      leg.plan.push({until:()=>storyTime>=at}, {call:()=>showStage(w,'story',i)},
        ...crossing, {call:()=>showStage(w,'mark',i)});
    }
    leg.plan.push({until:()=>false});
    leg.ownedSteps = new Set(leg.plan);
    leg.ownsPlan = () => w.plan === leg.plan;
    trips.set(w,leg);
    w.plan = leg.plan;
    showStage(w,'approach',i);
  }
  function release() {
    for (const leg of legs) {
      const {w,i,path,original,steps} = leg;
      if (trips.get(w)!==leg || leg.returning) continue;
      if (!leg.ownsPlan() || w.gone || w.removing) {
        trips.delete(w);
        showStage(w,null,i);
        continue;
      }
      const firstOwned=w.plan.findIndex(step=>leg.ownedSteps.has(step));
      const priority=firstOwned<0 ? w.plan.slice() : w.plan.slice(0,firstOwned);
      const next = steps.indexOf(w.plan[firstOwned]);
      const visited = next < 0 ? path : path.slice(0,next+1);
      const back = visited.slice().reverse();
      // During a story walk the actual foot may be between two turns. Rejoin
      // the original stage mark over safe floor before retracing the approach.
      // This also avoids walking out to repeat a cue already on its way back.
      if (leg.arrived && leg.walks.length) {
        const home = guestRoute([w.u,w.v], leg.mark, anchors);
        if (home) back.unshift(...home.slice(1,-1));
        else {
          const pending = leg.storySteps.findIndex(step => w.plan.includes(step));
          const reached = pending < 0 ? leg.storySteps : leg.storySteps.slice(0,pending);
          back.unshift(...reached.map(step => step.to).reverse());
        }
      }
      if (Math.hypot(back[0][0]-w.u,back[0][1]-w.v)<.001) back.shift();
      leg.returning=true;
      showStage(w,'return',i);
      leg.plan = [...priority,...back.map(to=>({to})), {call(){
        trips.delete(w);
        showStage(w,null,i);
        w.plan=original;
      }}];
      w.plan=leg.plan;
    }
  }
  return {marks:legs.map(leg=>leg.mark), ready:()=>legs.every(leg=>leg.arrived), setTime(t){storyTime=t;},
    valid:()=>legs.every(leg=>leg.ownsPlan() && !leg.w.gone && !leg.w.removing), release};
}
