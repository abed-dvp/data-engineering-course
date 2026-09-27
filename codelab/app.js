const steps = window.DE_STEPS;
const modules = window.DE_MODULES;
const $ = id => document.getElementById(id);
const stateKey = 'de-complete-v2';
const currentKey = 'de-current-v2';
const notePrefix = 'de-note-v2-';
let current = Math.min(Number(localStorage.getItem(currentKey) || 0), steps.length - 1);
let completed = new Set(JSON.parse(localStorage.getItem(stateKey) || '[]'));
let selectedQuiz = null;
let sqlDb = null;
let SQL = null;

const sqlSeed = `
CREATE TABLE users(user_id INTEGER PRIMARY KEY, full_name TEXT, email TEXT, country TEXT, created_at TEXT);
CREATE TABLE orders(order_id INTEGER PRIMARY KEY, user_id INTEGER, order_date TEXT, amount REAL, status TEXT);
INSERT INTO users VALUES
(1,'Ada Lovelace','ada@example.com','UK','2026-01-05'),
(2,'Grace Hopper','grace@example.com','USA','2026-01-12'),
(3,'Guido van Rossum','guido@example.com','Netherlands','2026-02-01'),
(4,'Margaret Hamilton','margaret@example.com','USA','2026-02-14'),
(5,'Linus Torvalds','linus@example.com','Finland','2026-03-01'),
(6,'Barbara Liskov','barbara@example.com','USA','2026-03-10');
INSERT INTO orders VALUES
(101,1,'2026-02-01',120,'paid'),(102,1,'2026-03-15',80,'paid'),
(103,2,'2026-02-05',250,'paid'),(104,2,'2026-03-21',40,'cancelled'),
(105,3,'2026-03-02',175,'paid'),(106,4,'2026-03-08',320,'paid'),
(107,4,'2026-04-01',90,'paid'),(108,5,'2026-04-03',110,'paid');`;

function escapeHtml(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));}
function save(){localStorage.setItem(currentKey,String(current));localStorage.setItem(stateKey,JSON.stringify([...completed]));}
function moduleFor(step){return modules.find(m=>m.id===step.module);}
function moduleSteps(id){return steps.map((s,i)=>({s,i})).filter(x=>x.s.module===id);}
function completedInModule(id){return moduleSteps(id).filter(x=>completed.has(x.i)).length;}
function updateProgress(){
  const pct = steps.length ? completed.size / steps.length * 100 : 0;
  $('progressBar').style.width = pct+'%';
  $('progressText').textContent = `${completed.size} of ${steps.length} complete`;
  $('doneCount').textContent = completed.size;
  $('totalCount').textContent = steps.length;
}
function renderNav(){
  $('moduleNav').innerHTML = modules.map(m=>{
    const ms=moduleSteps(m.id), done=completedInModule(m.id);
    return `<div class="module-group"><button class="module-heading" data-module="${m.id}"><span>${escapeHtml(m.title)}</span><span class="module-progress">${done}/${ms.length}</span></button><div class="lesson-nav">${ms.map(({s,i})=>`<button class="nav-item ${i===current?'active':''} ${completed.has(i)?'done':''}" data-step="${i}"><span class="nav-index">${completed.has(i)?'✓':i+1}</span><span class="nav-title"><strong>${escapeHtml(s.title)}</strong><small>${escapeHtml(s.duration||'')}</small></span></button>`).join('')}</div></div>`;
  }).join('');
  document.querySelectorAll('[data-step]').forEach(btn=>btn.onclick=()=>goTo(Number(btn.dataset.step)));
  document.querySelectorAll('[data-module]').forEach(btn=>btn.onclick=()=>{const first=moduleSteps(btn.dataset.module)[0]; if(first) goTo(first.i);});
}
function renderOverview(){
  $('moduleCards').innerHTML = modules.map(m=>{
    const ms=moduleSteps(m.id), done=completedInModule(m.id);
    return `<div class="module-card" data-card-module="${m.id}"><div class="eyebrow">${done}/${ms.length} COMPLETE</div><h3>${escapeHtml(m.title)}</h3><p>${escapeHtml(m.subtitle)}</p><div class="card-progress">${ms.length} lessons</div></div>`;
  }).join('');
  document.querySelectorAll('[data-card-module]').forEach(card=>card.onclick=()=>{
    const first=moduleSteps(card.dataset.cardModule).find(x=>!completed.has(x.i)) || moduleSteps(card.dataset.cardModule)[0];
    if(first){$('overview').hidden=true;$('lesson').hidden=false;goTo(first.i);}
  });
}
function goTo(index){saveNote(); current=Math.max(0,Math.min(index,steps.length-1)); selectedQuiz=null; save(); $('overview').hidden=true; $('lesson').hidden=false; render(); window.scrollTo({top:0,behavior:'smooth'}); if(window.innerWidth<=880)$('sidebar').classList.remove('open');}
function render(){
  const s=steps[current], m=moduleFor(s);
  renderNav(); updateProgress(); renderOverview();
  $('moduleLabel').textContent=m?m.title:'Module'; $('stepLabel').textContent=`Lesson ${current+1} / ${steps.length}`; $('durationLabel').textContent=s.duration||'';
  $('title').textContent=s.title; $('intro').textContent=s.intro||'';
  $('objectives').innerHTML=(s.objectives||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('');
  $('theory').innerHTML=(s.theory||[]).map(x=>`<p>${escapeHtml(x)}</p>`).join('');
  $('why').textContent=s.why||''; $('exampleCode').textContent=s.code||'';
  $('walkthrough').innerHTML=(s.walkthrough||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('');
  $('mistake').textContent=s.mistake||''; $('takeaway').textContent=s.takeaway||'';
  $('notes').value=localStorage.getItem(notePrefix+current)||'';
  const done=completed.has(current); $('completeButton').textContent=done?'✓ Lesson complete':'Mark lesson complete'; $('markCompleteTop').textContent=done?'✓ Complete':'Mark complete'; $('markCompleteTop').classList.toggle('done',done);
  $('prevButton').disabled=current===0; $('nextButton').disabled=current===steps.length-1;
  setupPractice(s.practice||{});
}
function setupPractice(p){
  selectedQuiz=null; $('feedback').hidden=true; $('hintPanel').hidden=true; $('solutionPanel').hidden=true; $('sqlResult').hidden=true;
  $('practicePrompt').textContent=p.prompt||''; $('hintText').textContent=p.hint||''; $('solutionExplanation').textContent=p.explanation||'';
  $('quizOptions').hidden=p.type!=='quiz'; $('editorWrap').hidden=p.type==='quiz'; $('checkButton').hidden=p.type==='quiz'; $('resetAnswer').hidden=p.type==='quiz';
  $('sqlRuntime').hidden=p.type!=='sql'; $('practiceTitle').textContent=p.type==='sql'?'Run the SQL':'Check your understanding';
  if(p.type==='quiz'){
    $('quizOptions').innerHTML=(p.options||[]).map((x,i)=>`<button class="option" data-option="${i}"><strong>${i+1}.</strong> ${escapeHtml(x)}</button>`).join('');
    document.querySelectorAll('[data-option]').forEach(btn=>btn.onclick=()=>checkQuiz(Number(btn.dataset.option)));
    $('solutionCode').textContent=(p.options||[])[p.answer]||'';
  }else{
    $('answerEditor').value=p.starter||''; $('solutionCode').textContent=p.solution||'';
    $('editorType').textContent=p.type==='sql'?'SQL EDITOR':'YOUR ANSWER';
    if(p.type==='sql') updateSqlRuntime();
  }
}
function checkQuiz(i){
  const p=steps[current].practice; selectedQuiz=i;
  document.querySelectorAll('[data-option]').forEach((b,j)=>{b.classList.remove('selected','correct','wrong');if(j===p.answer)b.classList.add('correct');if(j===i&&i!==p.answer)b.classList.add('wrong');});
  const good=i===p.answer; showFeedback(good,good?'Correct. '+(p.explanation||''):'Not yet. '+(p.hint||'Review the lesson and try again.'));
  if(good) markComplete(true);
}
function normalizeText(s){return String(s).toLowerCase().replace(/\s+/g,' ').trim();}
function checkCode(){
  const p=steps[current].practice, answer=normalizeText($('answerEditor').value);
  const missing=(p.mustInclude||[]).filter(token=>!answer.includes(normalizeText(token)));
  const good=missing.length===0 && answer.length>0;
  showFeedback(good,good?'Looks good. Your answer contains the core elements. '+(p.explanation||''):`Not yet. ${p.hint||'Review the required pieces and try again.'}`);
  if(good) markComplete(true);
}
function resetSqlDb(){if(!SQL)return; if(sqlDb)sqlDb.close(); sqlDb=new SQL.Database(); sqlDb.run(sqlSeed);}
function normalizeResult(r){return JSON.stringify({columns:r.columns.map(c=>c.toLowerCase()),values:r.values.map(row=>row.map(v=>typeof v==='number'?Math.round(v*1e8)/1e8:v))});}
function execSql(q){resetSqlDb();const results=sqlDb.exec(q);return results.length?results[results.length-1]:{columns:[],values:[]};}
function resultTable(r){if(!r.columns.length)return '<p>Query executed successfully. No rows returned.</p>';return `<table><thead><tr>${r.columns.map(c=>`<th>${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>${r.values.map(row=>`<tr>${row.map(v=>`<td>${escapeHtml(v===null?'NULL':v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
function checkSql(){
  const p=steps[current].practice;
  try{
    const actual=execSql($('answerEditor').value), expected=execSql(p.solution);
    $('sqlResult').hidden=false; $('sqlResult').innerHTML='<div class="eyebrow">QUERY RESULT</div>'+resultTable(actual);
    const good=normalizeResult(actual)===normalizeResult(expected);
    showFeedback(good,good?'Correct — your result matches the target. '+(p.explanation||''):'Your SQL runs, but the result does not match the target yet. '+(p.hint||''));
    if(good) markComplete(true);
  }catch(e){$('sqlResult').hidden=false;$('sqlResult').innerHTML=`<div class="feedback bad"><strong>SQL error</strong><br>${escapeHtml(e.message||e)}</div>`;showFeedback(false,'Fix the SQL error first, then check again.');}
}
function showFeedback(good,text){$('feedback').hidden=false;$('feedback').className='feedback '+(good?'good':'bad');$('feedback').textContent=text;}
function markComplete(force){const was=completed.has(current);if(force===true)completed.add(current);else was?completed.delete(current):completed.add(current);save();renderNav();updateProgress();renderOverview();const done=completed.has(current);$('completeButton').textContent=done?'✓ Lesson complete':'Mark lesson complete';$('markCompleteTop').textContent=done?'✓ Complete':'Mark complete';$('markCompleteTop').classList.toggle('done',done);}
function saveNote(){if($('lesson').hidden)return; const el=$('notes');if(el)localStorage.setItem(notePrefix+current,el.value);}
async function bootSql(){
  try{SQL=await initSqlJs({locateFile:file=>`https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/${file}`});resetSqlDb();updateSqlRuntime();}
  catch(e){SQL=null;updateSqlRuntime(true);}
}
function updateSqlRuntime(failed=false){
  if(!$('sqlRuntime'))return; $('sqlRuntime').classList.toggle('ready',!!SQL);$('sqlRuntime').classList.toggle('error',failed);
  $('runtimeText').textContent=failed?'SQL runtime failed to load':SQL?'SQL runtime ready':'Loading SQL runtime…';
  if(steps[current]&&steps[current].practice&&steps[current].practice.type==='sql')$('checkButton').disabled=!SQL;
}

$('checkButton').onclick=()=>{const type=steps[current].practice.type;if(type==='sql')checkSql();else checkCode();};
$('hintButton').onclick=()=>{$('hintPanel').hidden=!$('hintPanel').hidden;};
$('solutionButton').onclick=()=>{$('solutionPanel').hidden=!$('solutionPanel').hidden;};
$('resetAnswer').onclick=()=>{$('answerEditor').value=steps[current].practice.starter||'';$('feedback').hidden=true;$('sqlResult').hidden=true;};
$('copyCode').onclick=async()=>{try{await navigator.clipboard.writeText($('exampleCode').textContent);$('copyCode').textContent='Copied';setTimeout(()=>$('copyCode').textContent='Copy',900);}catch{}};
$('prevButton').onclick=()=>goTo(current-1); $('nextButton').onclick=()=>goTo(current+1); $('completeButton').onclick=()=>markComplete(false); $('markCompleteTop').onclick=()=>markComplete(false);
$('notes').addEventListener('input',()=>localStorage.setItem(notePrefix+current,$('notes').value));
$('themeButton').onclick=()=>{const dark=document.documentElement.dataset.theme==='dark';document.documentElement.dataset.theme=dark?'light':'dark';localStorage.setItem('de-theme-v2',dark?'light':'dark');};
$('menuButton').onclick=()=>{$('sidebar').classList.toggle('open');};
$('focusButton').onclick=()=>{document.body.classList.toggle('focus');$('focusButton').textContent=document.body.classList.contains('focus')?'Exit focus':'Focus';};
$('overviewButton').onclick=()=>{saveNote();$('lesson').hidden=true;$('overview').hidden=false;renderOverview();window.scrollTo({top:0,behavior:'smooth'});};
$('resumeButton').onclick=()=>{$('overview').hidden=true;$('lesson').hidden=false;render();};
$('resetProgress').onclick=()=>{if(confirm('Reset completed lessons? Your notes will stay saved.')){completed.clear();current=0;save();render();}};
$('answerEditor').addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();$('checkButton').click();}});
document.addEventListener('keydown',e=>{if(['TEXTAREA','INPUT'].includes(document.activeElement.tagName))return;if(e.key==='ArrowLeft'&&current>0)goTo(current-1);if(e.key==='ArrowRight'&&current<steps.length-1)goTo(current+1);});
window.addEventListener('beforeunload',saveNote);
document.documentElement.dataset.theme=localStorage.getItem('de-theme-v2')||'light';
render();bootSql();