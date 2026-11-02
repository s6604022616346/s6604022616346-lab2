// ฟังก์ชันร่วม: PRNG (seeded), config, CSV, อัลกอริทึมสุ่ม
const PE={
 rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}},
 cfg(){const P=new URLSearchParams(location.search),g=(k,d)=>P.get(k)||d;
  return{id:g('id','ID_7421'),session:g('session','3 (Day 1)'),seed:+g('seed',Math.floor(Math.random()*1e6)),
  trials:+g('trials',60),kss:+g('kss',4),isiMin:+g('isimin',2000),isiMax:+g('isimax',10000),
  sartTrials:+g('sart_trials',225),probes:+g('probes',5),probeGap:+g('probegap',20)}},
 isi(rng,min,max){return min+rng()*(max-min)},                       // Uniform(min,max)
 sartSeq(rng,n=225,maxRun=15,target=3){          // สร้างลำดับโดยตรง (ไม่ใช้ rejection sampling -> เร็วและไม่ค้าง)
  const per=Math.max(1,Math.round(n/9)),m=n-per,cap=Math.max(maxRun,Math.ceil(m/per)),base=Math.floor(m/per),g=Array(per).fill(base);
  for(let i=0;i<m-base*per;i++)g[i]++;                       // g = จำนวนตัวเลขอื่นระหว่าง No-Go แต่ละตัว (แบบวงกลม)
  for(let s=0;s<per*80;s++){const i=Math.floor(rng()*per),j=Math.floor(rng()*per);if(i!==j&&g[i]>0&&g[j]<cap){g[i]--;g[j]++}}  // สุ่มช่องว่าง โดยแต่ละช่อง <= maxRun
  const other=[1,2,3,4,5,6,7,8,9].filter(d=>d!==target),o=Array.from({length:m},(_,t)=>other[t%8]);
  for(let i=o.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[o[i],o[j]]=[o[j],o[i]]}
  const a=[];let p=0;g.forEach(c=>{a.push(target);for(let i=0;i<c;i++)a.push(o[p++])});
  const k=Math.floor(rng()*n);return a.slice(k).concat(a.slice(0,k))},   // หมุนตำแหน่งสุ่ม -> No-Go ไม่เอนเอียงที่ต้น/ท้ายลำดับ
 probePos(rng,n,k,gap){gap=Math.min(gap,Math.max(1,Math.floor((n-20)/k)));for(;;){const s=new Set();while(s.size<k)s.add(10+Math.floor(rng()*(n-20)));
  const a=[...s].sort((x,y)=>x-y);if(a.every((v,i)=>i===0||v-a[i-1]>=gap))return a}},
 csv(rows){if(!rows.length)return'';const h=[...new Set(rows.flatMap(r=>Object.keys(r)))];   // รวมชื่อคอลัมน์จากทุกแถว (event แต่ละชนิดมีคอลัมน์ไม่เท่ากัน)
  return h.join(',')+'\n'+rows.map(r=>h.map(k=>JSON.stringify(r[k]??'')).join(',')).join('\n')},
 file(name,rows){return new File(['\ufeff'+PE.csv(rows)],name,{type:'text/csv'})},
 download(name,rows){const a=document.createElement('a'),u=URL.createObjectURL(PE.file(name,rows));
  a.href=u;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000)},
 mmss(ms){const s=Math.floor(ms/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
};

PE.digit=e=>{const m=/^(?:Digit|Numpad)([0-9])$/.exec(e.code);return m?+m[1]:-1};
PE.toast=msg=>{let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t)}
 t.textContent=msg;t.classList.add('show');clearTimeout(PE._tt);PE._tt=setTimeout(()=>t.classList.remove('show'),1800)};

PE.result=(title,rows,files,again,early)=>{const m=document.createElement('div');m.className='modal';m.style.cssText='display:flex;position:fixed';
 m.innerHTML='<div class="box res"><h2></h2><table></table><div class="acts"></div></div>';m.querySelector('h2').textContent=title;
 const tb=m.querySelector('table');rows.forEach(([k,v])=>{const r=tb.insertRow();r.insertCell().textContent=k;r.insertCell().textContent=v});
 const a=m.querySelector('.acts'),mk=(t,f)=>{const b=document.createElement('button');b.className='btn';b.textContent=t;b.onclick=f;a.appendChild(b)};
 if(PE.native){const d=new Date(),z=n=>String(n).padStart(2,'0'),ts=d.getFullYear()+z(d.getMonth()+1)+z(d.getDate())+'_'+z(d.getHours())+z(d.getMinutes())+z(d.getSeconds()),
   nf=files.map(f=>({name:f.name.replace(/\.csv$/,'_'+ts+'.csv'),rows:f.rows})),saved=PE.nativeSave(nf);   // แอป: บันทึกอัตโนมัติทันที (ชื่อไฟล์มีวันเวลา กันทับไฟล์เก่า)
  saved.then(r=>PE.toast(r.dir==='DOCUMENTS'?'✓ บันทึกไฟล์ CSV ไว้ที่ Documents/PvtSart แล้ว':'✓ บันทึกไฟล์ไว้ในแอปแล้ว — กดแชร์เพื่อส่งออก'),()=>PE.toast('บันทึกอัตโนมัติไม่สำเร็จ — กดแชร์เพื่อส่งไฟล์'));
  const sb=document.createElement('button');sb.className='btn dl';sb.textContent='📤 แชร์ / ส่งไฟล์ CSV';a.appendChild(sb);
  sb.onclick=()=>saved.catch(()=>PE.nativeSave(nf)).then(r=>PE.nativeShare(r.uris))}
 else if(!PE.touch)mk('⬇ ดาวน์โหลด CSV',()=>files.forEach(f=>PE.download(f.name,f.rows)));
 else{const fl=files.map(f=>PE.file(f.name,f.rows)),each=()=>[...files].reverse().forEach(f=>{const b=document.createElement('button');b.className='btn dl';b.textContent='⬇ '+f.name;b.onclick=()=>PE.download(f.name,f.rows);a.prepend(b)});
  let ok=false;try{ok=!!(navigator.canShare&&navigator.canShare({files:fl}))}catch(e){}
  if(ok){const sb=document.createElement('button');sb.className='btn dl';sb.textContent='📤 บันทึก / แชร์ไฟล์ CSV';a.prepend(sb);   // iPhone: เลือก "บันทึกลงในไฟล์" หรือส่งต่อได้
   sb.onclick=()=>navigator.share({files:fl}).catch(e=>{if(e.name!=='AbortError'){sb.remove();each()}})}else each()}   // ไม่รองรับการแชร์ (เช่นเปิดผ่าน http) -> ปุ่มดาวน์โหลดทีละไฟล์
 mk('เล่นอีกครั้ง',again||(()=>location.reload()));mk('กลับเมนู',()=>location.href='index.html');
 document.body.appendChild(m)};
PE.median=a=>{const s=[...a].sort((x,y)=>x-y),n=s.length;return n?(n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2):NaN};
PE.f1=v=>isFinite(v)?v.toFixed(1)+' ms':'-';

// ---------- รองรับจอสัมผัส (iPhone / iPad) ----------
PE.touch=matchMedia('(pointer: coarse)').matches;
if(PE.touch)document.documentElement.classList.add('touch');
PE.wake=()=>{try{navigator.wakeLock&&navigator.wakeLock.request('screen').catch(()=>{})}catch(e){}};   // กันจอดับระหว่างทดสอบ (iOS 16.4+, ต้องเป็น https)
// press(src) = เหมือนกด Spacebar, mind() = เหมือนกด M, stop() = เหมือนกด Esc
PE.touchUI=(press,mind,stop)=>{document.body.classList.add('tap');
 addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||e.target.closest('button,a,input,.modal,.tbtns'))return;   // แตะตรงไหนก็ได้ (ยกเว้นปุ่ม/หน้าต่างคำถาม) = Spacebar
  e.preventDefault();press('touch')},{passive:false});
 if(!PE.touch)return;
 const bar=document.createElement('div'),bm=document.createElement('button'),bs=document.createElement('button'),LS='■ หยุด / ดูผล';let arm=0,at;
 bar.className='tbtns';bm.textContent='💭 ใจลอย (M)';bs.textContent=LS;bm.onclick=()=>mind();
 bs.onclick=()=>{if(Date.now()-arm<3000){clearTimeout(at);bs.textContent=LS;bs.classList.remove('arm');arm=0;return stop()}   // กันกดพลาด: ต้องแตะ 2 ครั้ง
  arm=Date.now();bs.textContent='แตะอีกครั้งเพื่อหยุด';bs.classList.add('arm');clearTimeout(at);at=setTimeout(()=>{bs.textContent=LS;bs.classList.remove('arm')},3000)};
 bar.append(bm,bs);document.body.appendChild(bar)};

// ---------- เมื่อรันเป็นแอป Android/iOS (Capacitor) ----------
PE.native=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
PE.busy=()=>false;   // หน้า PVT/SART จะกำหนดใหม่: true = กำลังทดสอบอยู่
if(PE.native){
 const FS=Capacitor.registerPlugin('Filesystem'),SH=Capacitor.registerPlugin('Share'),AP=Capacitor.registerPlugin('App');
 PE.nativeSave=async files=>{let dir='DOCUMENTS';const uris=[];          // เขียนลง Documents/PvtSart (ถ้าเขียนไม่ได้ ใช้ Cache ของแอปแทน)
  for(const f of files){const o={path:'PvtSart/'+f.name,data:'\ufeff'+PE.csv(f.rows),encoding:'utf8',recursive:true};
   if(dir==='DOCUMENTS')try{uris.push((await FS.writeFile({...o,directory:dir})).uri);continue}catch(e){dir='CACHE'}
   uris.push((await FS.writeFile({...o,directory:'CACHE'})).uri)}
  return{uris,dir}};
 PE.nativeShare=uris=>SH.share({files:uris,dialogTitle:'ส่ง / บันทึกไฟล์ CSV'}).catch(()=>{});
 PE.download=(name,rows)=>PE.nativeSave([{name,rows}]).then(r=>{PE.toast('✓ บันทึก '+name);return PE.nativeShare(r.uris)},e=>PE.toast('บันทึกไม่สำเร็จ: '+e.message));
 AP.addListener('backButton',()=>{const pg=location.pathname.split('/').pop();   // ปุ่มย้อนกลับของ Android
  if(PE.busy())return PE.toast('กำลังทดสอบอยู่ — แตะ "หยุด / ดูผล" ถ้าต้องการหยุด');
  if(!pg||pg==='index.html')return AP.exitApp();
  location.href='index.html'});
}
