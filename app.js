// ระบบภารกิจรายวัน: โปรไฟล์ / ดาว / สติกเกอร์ / วันต่อเนื่อง / เก็บข้อมูล / แจ้งเตือน
// แต้มให้ "เมื่อทำภารกิจครบ" เท่านั้น ไม่ขึ้นกับความเร็วหรือความแม่น เพื่อไม่ให้รางวัลไปรบกวนผลวัด
const APP=(()=>{
const K='pvtsart.app.v1',z=n=>String(n).padStart(2,'0');
const DEF={pin:null,profiles:[],current:null,
 settings:{pvt:{on:true,trials:60,kss:4},sart:{on:true,trials:225,probes:5},replay:false,remind:{on:false,time:'19:00'}},progress:{}};
let S={};try{S=JSON.parse(localStorage.getItem(K))||{}}catch(e){}
S={...DEF,...S,settings:{...DEF.settings,...(S.settings||{})}};
for(const k of['pvt','sart','remind'])S.settings[k]={...DEF.settings[k],...S.settings[k]};
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};

const day=(d=new Date())=>d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate());
const stamp=(d=new Date())=>day(d).replace(/-/g,'')+'_'+z(d.getHours())+z(d.getMinutes())+z(d.getSeconds());
const MISSIONS={
 pvt:{name:'เกมจับเวลา',sub:'PVT',icon:'⏱️',min:7,page:'pvt.html',
  how:['นั่งสบาย ๆ แล้วมองกลางจอไว้','เมื่อตัวเลขสีแดงเริ่มวิ่ง ให้แตะจอให้เร็วที่สุด','อย่าแตะก่อนตัวเลขวิ่ง รอให้เห็นก่อน','ระหว่างเล่นจะมีคำถามว่าง่วงแค่ไหน ตอบตามที่รู้สึกจริง','ถ้ารู้ตัวว่าใจลอย แตะปุ่ม 💭 ด้านล่าง']},
 sart:{name:'เกมห้ามแตะ',sub:'SART',icon:'🔢',min:6,page:'sart.html',
  how:['ตัวเลข 1–9 จะขึ้นทีละตัวในวงกลม','แตะจอทุกครั้งที่เห็นตัวเลข','ยกเว้น "เลขห้ามแตะ" ซึ่งจะบอกก่อนเริ่มเกม','บางช่วงจะถามว่าเมื่อกี้มีสมาธิอยู่ไหม ตอบตามจริง','ถ้ารู้ตัวว่าใจลอย แตะปุ่ม 💭 ด้านล่าง']}};
const STAR={mission:10,bonus:5};
const STAGES=[[0,'🥚','ไข่นกฮูก'],[20,'🐣','ลูกนกแรกเกิด'],[60,'🐥','ลูกนกฮูก'],[150,'🐦','นกฮูกน้อย'],[300,'🦉','นกฮูกตาสว่าง']];
const STICKERS=[
 {id:'m1',e:'🌱',n:'ภารกิจแรก',h:'ทำภารกิจแรกให้เสร็จ',t:c=>c.missions>=1},
 {id:'d1',e:'🎯',n:'ครบทั้งวัน',h:'ทำครบทุกภารกิจใน 1 วัน',t:c=>c.days>=1},
 {id:'s3',e:'🔥',n:'3 วันติด',h:'ทำครบ 3 วันติดกัน',t:c=>c.streak>=3},
 {id:'s7',e:'🌟',n:'7 วันติด',h:'ทำครบ 7 วันติดกัน',t:c=>c.streak>=7},
 {id:'s14',e:'🏆',n:'14 วันติด',h:'ทำครบ 14 วันติดกัน',t:c=>c.streak>=14},
 {id:'s30',e:'👑',n:'30 วันติด',h:'ทำครบ 30 วันติดกัน',t:c=>c.streak>=30},
 {id:'st50',e:'⭐',n:'50 ดาว',h:'สะสมครบ 50 ดาว',t:c=>c.stars>=50},
 {id:'st100',e:'💫',n:'100 ดาว',h:'สะสมครบ 100 ดาว',t:c=>c.stars>=100},
 {id:'st250',e:'🌈',n:'250 ดาว',h:'สะสมครบ 250 ดาว',t:c=>c.stars>=250},
 {id:'st500',e:'🚀',n:'500 ดาว',h:'สะสมครบ 500 ดาว',t:c=>c.stars>=500},
 {id:'m10',e:'🧭',n:'นักสำรวจ',h:'ทำภารกิจครบ 10 ครั้ง',t:c=>c.missions>=10},
 {id:'m30',e:'🗺️',n:'นักผจญภัย',h:'ทำภารกิจครบ 30 ครั้ง',t:c=>c.missions>=30}];
const AVATARS=['🐱','🐶','🐰','🐼','🦊','🐸','🐯','🐨','🐵','🦁','🐧','🐢'];

const prog=pid=>S.progress[pid]||(S.progress[pid]={stars:0,missions:0,best:0,log:{},stickers:[]});
const enabled=()=>Object.keys(MISSIONS).filter(k=>S.settings[k].on);
const dayDone=(p,d)=>{const l=p.log[d]||{},e=enabled();return e.length>0&&e.every(k=>l[k])};
function streak(p){let n=0;const d=new Date();if(!dayDone(p,day(d)))d.setDate(d.getDate()-1);while(dayDone(p,day(d))){n++;d.setDate(d.getDate()-1)}return n}
function stage(stars){let s=STAGES[0],next=null;for(const x of STAGES){if(stars>=x[0])s=x;else{next=x;break}}return{s,next}}
function award(pid,m){   // เรียกเมื่อทำภารกิจครบ -> ดาว (ครั้งแรกของวันเท่านั้น), โบนัสครบวัน, สติกเกอร์ใหม่
 const p=prog(pid),d=day(),l=p.log[d]||(p.log[d]={});
 if(l[m]){l[m+'_n']=(l[m+'_n']||1)+1;save();return{repeat:true,stars:p.stars,streak:streak(p)}}
 l[m]=Date.now();p.missions++;let bonus=0;
 if(dayDone(p,d)&&!l._bonus){l._bonus=1;bonus=STAR.bonus}
 p.stars+=STAR.mission+bonus;const st=streak(p);p.best=Math.max(p.best||0,st);
 const c={missions:p.missions,stars:p.stars,streak:p.best,days:Object.values(p.log).filter(x=>x._bonus).length};
 const nw=STICKERS.filter(s=>!p.stickers.includes(s.id)&&s.t(c));nw.forEach(s=>p.stickers.push(s.id));
 const before=stage(p.stars-STAR.mission-bonus).s,after=stage(p.stars).s;
 save();return{got:STAR.mission,bonus,streak:st,stickers:nw,stars:p.stars,grew:before!==after?after:null}}

// ---------- ฐานข้อมูลผลทดสอบ (IndexedDB) ----------
const DB={open(){return this._p||(this._p=new Promise((res,rej)=>{const r=indexedDB.open('pvtsart',1);
  r.onupgradeneeded=()=>r.result.createObjectStore('sessions',{keyPath:'uid'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}))},
 async tx(mode,fn){const db=await this.open();return new Promise((res,rej)=>{const t=db.transaction('sessions',mode),st=t.objectStore('sessions');let out;
  const q=fn(st);if(q)q.onsuccess=()=>out=q.result;t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error)})},
 put(o){return this.tx('readwrite',s=>s.put(o))},all(){return this.tx('readonly',s=>s.getAll())},
 async delWhere(f){const a=await this.all();return this.tx('readwrite',s=>{a.filter(f).forEach(o=>s.delete(o.uid))})}};
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}

// ---------- PIN ผู้ใหญ่ (กันเด็กเข้าไปแก้ค่า ไม่ใช่ระบบความปลอดภัย) ----------
const hash=s=>{let h=2166136261;for(const c of 'pvtsart:'+s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36)};

// ---------- แจ้งเตือนรายวัน (เฉพาะในแอป) ----------
async function schedule(){if(!(typeof PE!=='undefined'&&PE.native))return{ok:false,why:'web'};
 const LN=Capacitor.registerPlugin('LocalNotifications');
 try{await LN.cancel({notifications:[{id:1}]})}catch(e){}
 if(!S.settings.remind.on)return{ok:true};
 let p=await LN.checkPermissions();if(p.display!=='granted')p=await LN.requestPermissions();
 if(p.display!=='granted')return{ok:false,why:'denied'};
 const[h,m]=S.settings.remind.time.split(':').map(Number);
 await LN.schedule({notifications:[{id:1,title:'ได้เวลาภารกิจวันนี้แล้ว 🦉',body:'มาเล่นเกมสั้น ๆ เก็บดาวกันเถอะ',
  schedule:{on:{hour:h,minute:m},allowWhileIdle:true},smallIcon:'ic_stat_owl'}]});
 return{ok:true}}

// ---------- โหมดภารกิจ: เมื่อหน้า PVT/SART ถูกเปิดจากหน้าหลัก ----------
const Q=new URLSearchParams(location.search),M=Q.get('m'),PID=Q.get('pid');
function missionUrl(m,pid){const st=S.settings,pr=S.profiles.find(p=>p.id===pid),done=(prog(pid).log[day()]||{})[m],
  q=new URLSearchParams({m,pid,id:pr.code,session:day()+' '+MISSIONS[m].sub+(done?' (เล่นซ้ำ)':'')});
 if(m==='pvt'){q.set('trials',st.pvt.trials);q.set('kss',st.pvt.kss)}else{q.set('sart_trials',st.sart.trials);q.set('probes',st.sart.probes)}
 return MISSIONS[m].page+'?'+q}
if(M&&PID&&typeof PE!=='undefined'){
 PE.result=(title,rows,files,again,early)=>{
  const pr=S.profiles.find(p=>p.id===PID)||{code:'unknown',name:'?'},ts=stamp(),code=String(pr.code).replace(/[^\w.-]+/g,'_');
  DB.put({uid:PID+'_'+Date.now(),pid:PID,participant:pr.code,name:pr.name,mission:M,date:day(),ended:new Date().toISOString(),completed:!early,summary:rows,files}).catch(e=>console.error(e));
  if(PE.native)PE.nativeSave(files.map(f=>({name:code+'/'+f.name.replace(/\.csv$/,'').replace(/[^\w.-]+/g,'_')+'_'+ts+'.csv',rows:f.rows}))).catch(()=>{});
  const r=early?null:award(PID,M),m=document.createElement('div');m.className='modal';m.style.cssText='display:flex;position:fixed';
  const L=[];
  if(early)L.push('<div class="big">🙂</div><h2>หยุดก่อนจบเกม</h2><p>รอบนี้ยังไม่ได้ดาว ลองใหม่ได้ทุกเมื่อ</p>');
  else if(r.repeat)L.push('<div class="big">👍</div><h2>เล่นจบแล้ว</h2><p>วันนี้เก็บดาวของภารกิจนี้ไปแล้ว พรุ่งนี้มาเก็บใหม่นะ</p>');
  else{L.push('<div class="big">🎉</div><h2>ภารกิจสำเร็จ!</h2><div class="gain">+'+r.got+' ⭐</div>');
   if(r.bonus)L.push('<p class="line">ครบทุกภารกิจวันนี้ โบนัส +'+r.bonus+' ⭐</p>');
   if(r.streak>1)L.push('<p class="line">🔥 ทำครบต่อเนื่อง '+r.streak+' วัน</p>');
   if(r.grew)L.push('<p class="line">'+r.grew[1]+' นกฮูกโตขึ้นแล้ว: '+r.grew[2]+'</p>');
   r.stickers.forEach(s=>L.push('<p class="line">ได้สติกเกอร์ใหม่ '+s.e+' '+s.n+'</p>'))}
  m.innerHTML='<div class="box reward">'+L.join('')+'<div class="acts"></div></div>';
  const a=m.querySelector('.acts'),mk=(t,f,c)=>{const b=document.createElement('button');b.className='btn'+(c?' '+c:'');b.textContent=t;b.onclick=f;a.appendChild(b)};
  if(early)mk('เล่นอีกครั้ง',()=>location.reload());
  mk('กลับหน้าหลัก',()=>location.href='index.html','primary');
  document.body.appendChild(m)}}

return{S,save,day,stamp,MISSIONS,STAR,STAGES,STICKERS,AVATARS,prog,enabled,dayDone,streak,stage,award,DB,hash,schedule,missionUrl,
 profile:()=>S.profiles.find(p=>p.id===S.current)||null};
})();
