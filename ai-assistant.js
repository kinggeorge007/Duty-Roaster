/* AI Roster Assistant UI. Uses the app's existing globals: sb, S, SH, hod, esc, toast, render. */
(()=>{
if(typeof sb==="undefined"||SH)return;
const css=`
#aiFab{position:fixed;right:16px;bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:7;display:flex;align-items:center;gap:6px;padding:0 14px;height:44px;border-radius:99px;background:var(--card);color:var(--ink);border:1px solid var(--line);box-shadow:0 6px 20px rgba(0,0,0,.14);font:600 14px system-ui,sans-serif}
#aiFab svg{color:var(--pri)}
#aiSheet{position:fixed;left:0;right:0;top:0;height:100%;z-index:60;background:var(--bg);color:var(--ink);display:none;flex-direction:column}
#aiSheet.open{display:flex}
#aiSheet header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px calc(10px);padding-top:max(12px,env(safe-area-inset-top,0px));border-bottom:1px solid var(--line);background:var(--card)}
#aiSheet .ait{display:flex;align-items:center;gap:8px;font-weight:600;font-size:16px}#aiSheet .ait svg{color:var(--pri)}
#aiX{background:var(--bg);color:var(--ink);width:40px;height:40px;border-radius:12px;padding:0;font-size:18px}
#aiBody{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px;width:100%;max-width:720px;margin:0 auto}
#aiHi h2{margin:8px 0 2px;font-size:22px;font-weight:600;letter-spacing:-.02em}#aiHi p{margin:0 0 16px;color:var(--mut);font-size:15px}
.aiq{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.aiq button{background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:14px;padding:12px 8px;font-size:14px;font-weight:600}
.aim{margin:10px 0;max-width:88%;padding:10px 13px;border-radius:16px;font-size:15px;line-height:1.45;overflow-wrap:anywhere}
.aim.u{margin-left:auto;background:var(--pri);color:#fff;border-bottom-right-radius:5px}
.aim.a{background:var(--card);border:1px solid var(--line);border-bottom-left-radius:5px}
.aim.t{color:var(--mut);font-size:14px}
.aip{margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:12px;background:var(--bg)}
.aip .r{display:flex;justify-content:space-between;gap:8px;margin:3px 0;font-size:14px}.aip .r span:first-child{color:var(--mut)}
.aip .b{display:flex;gap:8px;margin-top:10px}.aip .b button{flex:1}
#aiSheet footer{display:flex;gap:8px;align-items:flex-end;padding:10px 12px;padding-bottom:max(10px,env(safe-area-inset-bottom,0px));border-top:1px solid var(--line);background:var(--card)}
#aiIn{flex:1;resize:none;max-height:120px;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:14px;padding:11px 12px;font:16px system-ui,sans-serif;margin:0}
#aiSend{width:44px;height:44px;padding:0;border-radius:14px;flex:none}
@media print{#aiFab,#aiSheet{display:none!important}}`;
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
const SP='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3l1.9 5.1L17 10l-5.1 1.9L10 17l-1.9-5.1L3 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>';
document.body.insertAdjacentHTML("beforeend",`<button id="aiFab" aria-label="Ask AI" style="display:none">${SP}Ask AI</button>
<div id="aiSheet" role="dialog" aria-label="AI Roster Assistant"><header><div class="ait">${SP}AI Roster Assistant</div><button id="aiX" aria-label="Close">✕</button></header>
<div id="aiBody"><div id="aiHi"><h2></h2><p>How can I help with your roster?</p><div class="aiq">
<button data-q="Who is working today?">Today's Staff</button><button data-a="analyze">Check Conflicts</button>
<button data-a="summarize">Roster Summary</button><button data-q="When am I working this month?">My Shifts</button></div></div><div id="aiMsgs"></div></div>
<footer><textarea id="aiIn" rows="1" maxlength="500" placeholder="Ask anything about your roster…"></textarea><button id="aiSend" aria-label="Send"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button></footer></div>`);
const g=id=>document.getElementById(id),fab=g("aiFab"),sheet=g("aiSheet"),msgs=g("aiMsgs"),inp=g("aiIn"),body=g("aiBody");
let hist=[],busy=false;
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const rich=t=>esc(t).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/\n/g,"<br>");
const fit=()=>{const v=window.visualViewport;if(!sheet.classList.contains("open"))return;sheet.style.height=(v?v.height:innerHeight)+"px";sheet.style.top=(v?v.offsetTop:0)+"px"};
window.visualViewport?.addEventListener("resize",fit);window.visualViewport?.addEventListener("scroll",fit);
const down=()=>{body.scrollTop=body.scrollHeight};
function bubble(cls,html){const d=document.createElement("div");d.className="aim "+cls;d.innerHTML=html;msgs.appendChild(d);g("aiHi").style.display="none";down();return d}
function open(){const h=new Date().getHours(),n=(S.prof?.full_name||"").split(" ")[0];
 g("aiHi").querySelector("h2").textContent=`Good ${h<12?"morning":h<18?"afternoon":"evening"}${n?", "+n:""}.`;
 sheet.classList.add("open");document.body.style.overflow="hidden";fit();setTimeout(()=>inp.focus({preventScroll:true}),150)}
function close(){sheet.classList.remove("open");document.body.style.overflow=""}
async function errText(e){try{const j=await e.context.json();if(j?.error?.message)return j.error.message}catch(_){}
 if(e?.context?.status===401)return"Your session has expired. Please sign in again.";
 return navigator.onLine?"The AI assistant is temporarily unavailable. Please try again.":"You appear to be offline. Check your connection and try again."}
function proposal(p,host){const fd=new Date(p.date+"T00:00:00").toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long"});
 const c=document.createElement("div");c.className="aip";
 c.innerHTML=`<b>${esc(p.name)}</b><div class="r"><span>${esc(fd)}</span></div><div class="r"><span>Current</span><span>${esc(p.currentLabel)}</span></div><div class="r"><span>Proposed</span><span>${esc(p.proposedLabel)}</span></div><div class="b"><button class="ghost">Cancel</button><button>Approve Change</button></div>`;
 const [no,yes]=c.querySelectorAll("button");
 no.onclick=()=>{c.remove();bubble("a","Okay, no change made.")};
 yes.onclick=async()=>{if(!hod())return;yes.disabled=no.disabled=true;
  const{error}=await sb.from("assignments").upsert([{roster_id:p.rosterId,user_id:p.userId,day:p.date,shift_code:p.shiftCode}],{onConflict:"roster_id,user_id,day"});
  if(error){yes.disabled=no.disabled=false;return toast("Couldn't save the change. Please try again.")}
  if(S.roster&&S.roster.id===p.rosterId){(S.asg[p.userId]??={})[p.date]=p.shiftCode;render()}
  c.remove();bubble("a",`Done. ${esc(p.name)} is now on ${esc(p.proposedLabel)} on ${esc(fd)}.`)};
 host.appendChild(c)}
async function ask(text,action="ask"){
 if(busy)return;
 if(!S.roster?.id)return bubble("a","Please open a roster before asking the AI about it.");
 if(S.dirty&&hod())return bubble("a","You have unsaved roster changes. Save the roster first so I check the latest version.");
 const shown=action==="analyze"?"Analyze roster":action==="summarize"?"Summarize roster":text;
 bubble("u",esc(shown));busy=true;const t=bubble("a t","AI is checking the roster…");
 const slow=setTimeout(()=>t.textContent="Still working on it…",8000);
 try{
  const{data,error}=await sb.functions.invoke("bright-responder",{body:{action,message:text||"",rosterId:S.roster.id,today:iso(new Date()),history:hist.slice(-6)}});
  if(error)throw error;if(data?.error)throw{context:{json:async()=>data}};
  t.remove();const m=bubble("a",rich(data?.reply||"I couldn't find that information in the current roster."));
  if(data?.proposal&&hod())proposal(data.proposal,m);
  hist.push({role:"user",content:shown},{role:"assistant",content:(data?.reply||"").slice(0,1000)});
 }catch(e){t.remove();bubble("a",esc(await errText(e)))}
 finally{clearTimeout(slow);busy=false;down()}}
function send(){const v=inp.value.trim();if(!v)return;inp.value="";inp.style.height="auto";ask(v)}
fab.onclick=open;g("aiX").onclick=close;g("aiSend").onclick=send;
inp.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}});
inp.addEventListener("input",()=>{inp.style.height="auto";inp.style.height=Math.min(inp.scrollHeight,120)+"px"});
g("aiHi").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;b.dataset.a?ask("",b.dataset.a):ask(b.dataset.q)});
const sync=()=>{fab.style.display=(S.prof&&!S.preview&&!document.querySelector(".lg"))?"flex":"none"};
for(const n of["render","vRender"]){const f=window[n];if(typeof f==="function")window[n]=function(){const r=f.apply(this,arguments);sync();return r}}
})();
