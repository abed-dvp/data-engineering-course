const steps=window.DE_STEPS; const $=id=>document.getElementById(id);
let current=Number(localStorage.getItem("de-current")||0);
let done=new Set(JSON.parse(localStorage.getItem("de-done")||"[]"));
let selected=null;

function save(){localStorage.setItem("de-current",current);localStorage.setItem("de-done",JSON.stringify([...done]))}
function renderNav(){
  $("nav").innerHTML=steps.map((s,i)=>`<button class="nav-item ${i===current?"active":""} ${done.has(i)?"done":""}" data-i="${i}"><span class="num">${done.has(i)?"✓":i+1}</span><span class="nav-title">${s.title}</span></button>`).join("");
  document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>{current=Number(b.dataset.i);selected=null;save();render()});
}
function render(){
  const s=steps[current]; renderNav();
  $("stepLabel").textContent=`Step ${current+1} of ${steps.length}`;
  $("title").textContent=s.title; $("intro").textContent=s.intro;
  $("learn").innerHTML=s.learn.map(x=>"<li>"+x+"</li>").join("");
  $("challenge").textContent=s.challenge; $("takeaway").textContent=s.takeaway;
  $("options").innerHTML=s.options.map((o,i)=>`<button class="option" data-i="${i}"><strong>${i+1}.</strong> ${o}</button>`).join("");
  document.querySelectorAll(".option").forEach(b=>b.onclick=()=>check(Number(b.dataset.i)));
  $("feedback").hidden=true; $("feedback").className="";
  $("complete").textContent=done.has(current)?"✓ Complete":"Mark complete";
  $("prev").disabled=current===0; $("next").disabled=current===steps.length-1;
  $("progressText").textContent=`${done.size} of ${steps.length} complete`;
  $("progressBar").style.width=`${done.size/steps.length*100}%`;
}
function check(i){
  selected=i; const s=steps[current], fb=$("feedback"); fb.hidden=false;
  document.querySelectorAll(".option").forEach((b,j)=>{b.classList.remove("selected","correct","wrong"); if(j===s.answer)b.classList.add("correct"); if(j===i&&i!==s.answer)b.classList.add("wrong")});
  if(i===s.answer){fb.className="good";fb.textContent="Correct.";done.add(current);save();renderNav();$("complete").textContent="✓ Complete";$("progressText").textContent=`${done.size} of ${steps.length} complete`;$("progressBar").style.width=`${done.size/steps.length*100}%`}
  else{fb.textContent="Not quite. Review the explanation and try again."}
}
$("prev").onclick=()=>{if(current>0){current--;selected=null;save();render()}};
$("next").onclick=()=>{if(current<steps.length-1){current++;selected=null;save();render()}};
$("complete").onclick=()=>{done.has(current)?done.delete(current):done.add(current);save();render()};
$("resetProgress").onclick=()=>{done.clear();current=0;save();render()};
$("themeButton").onclick=()=>{const d=document.documentElement.dataset.theme==="dark";document.documentElement.dataset.theme=d?"light":"dark";localStorage.setItem("de-theme",d?"light":"dark")};
$("menuButton").onclick=()=>document.getElementById("sidebar").classList.toggle("open");
document.documentElement.dataset.theme=localStorage.getItem("de-theme")||"light";
render();