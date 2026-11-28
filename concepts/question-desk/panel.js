window.createQuestionDeskPanel = function createQuestionDeskPanel(root,refresh) {
  'use strict';
  const find=id=>root.querySelector('#'+id);
  const draft=find('question-draft'), list=find('question-list');
  const rows=new Map();
  let desk=null, busy=false;

  async function act(action,questionId) {
    if (busy) return;
    busy=true; render();
    find('question-error').textContent='';
    try {
      const res=await fetch('/ctl/cmd',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({page:'auditorium',cmd:'discussion',action,session:desk?.session,questionId,
          ...(action==='host' ? {text:draft.value} : {})}),signal:AbortSignal.timeout(3500)});
      const reply=await res.json();
      if (!res.ok || !reply.ok) throw Error(reply.error || 'The question desk could not update.');
      if (action==='host') draft.value='';
    } catch(error) {
      find('question-error').textContent=error.message;
    } finally {
      await refresh();
      busy=false; render();
    }
  }
  function rowFor(q) {
    if (rows.has(q.id)) return rows.get(q.id);
    const item=document.createElement('li'), by=document.createElement('b'), question=document.createElement('span');
    by.textContent=q.nick || 'Host'; question.textContent=q.text;
    const actions=document.createElement('div'); actions.className='btns';
    const project=document.createElement('button'), dismiss=document.createElement('button');
    project.type=dismiss.type='button';project.textContent='Project';dismiss.textContent='Dismiss';
    project.onclick=()=>act('project',q.id);dismiss.onclick=()=>act('dismiss',q.id);
    actions.append(project,dismiss);item.append(by,document.createTextNode(' · '),question,actions);
    const row={item,project,dismiss};rows.set(q.id,row);
    return row;
  }
  function render() {
    const active=!!desk?.session;
    find('question-open').disabled=busy || !desk?.available || active;
    find('question-close').disabled=busy || !active;
    find('question-host').disabled=busy || !active || !draft.value.trim();
    find('question-answered').disabled=busy || !desk?.current;
    draft.disabled=busy || !active;
    const message=active ? (desk.current ? 'On screen · '+(desk.current.nick || 'Host')+' · '+desk.current.text :
      'Accepting !ask questions from chat.') : desk?.available ? 'Ready to open audience questions.' : 'Choose Lights up and Auto with an available shared auditorium.';
    if (find('question-state').textContent!==message) find('question-state').textContent=message;
    find('question-waiting').hidden=!active;
    const pending=desk?.pending || [];
    find('question-count').textContent='Waiting ('+pending.length+'/20)';
    const ids=new Set(pending.map(q=>q.id));
    for (const [id,row] of rows) if (!ids.has(id)) { row.item.remove();rows.delete(id); }
    pending.forEach((question,index)=>{
      const row=rowFor(question);
      row.project.disabled=busy || !!desk.current;
      row.dismiss.disabled=busy;
      if (list.children[index]!==row.item) list.insertBefore(row.item,list.children[index]||null);
    });
  }
  root.addEventListener('toggle',()=>{if(root.open)refresh();});
  find('question-open').onclick=()=>act('open');
  find('question-close').onclick=()=>act('close');
  find('question-host').onclick=()=>act('host');
  find('question-answered').onclick=()=>act('answered',desk?.current?.id);
  draft.addEventListener('input',render);
  render();
  return state=>{desk=state||null;render();};
};
