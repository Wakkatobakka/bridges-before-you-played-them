document.documentElement.classList.add('js');

// The catalogue is rendered in HTML. Filtering needs no service or file access.
const search=document.querySelector('#catalogue-search');
if(search){
 const records=[...document.querySelectorAll('.record')];
 const buttons=[...document.querySelectorAll('[data-platform-filter]')];
 const histories=document.querySelector('#histories-only');
 let platform='all';
 const normalize=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function apply(){
  const words=normalize(search.value.trim()).split(/\s+/).filter(Boolean);
  let shown=0;
  for(const record of records){
   const match=words.every(w=>normalize(record.dataset.search).includes(w))&&(platform==='all'||record.dataset.platform===platform)&&(!histories.checked||record.dataset.history==='true');
   record.hidden=!match;if(match)shown++;
  }
  document.querySelector('#result-count').textContent=`${shown} of ${records.length} projects`;
  document.querySelector('#catalogue-empty').hidden=shown!==0;
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.platformFilter===platform)));
 }
 search.addEventListener('input',apply);histories.addEventListener('change',apply);
 buttons.forEach(b=>b.addEventListener('click',()=>{platform=b.dataset.platformFilter;apply()}));
 document.querySelector('#clear-search').addEventListener('click',()=>{search.value='';platform='all';histories.checked=false;apply();search.focus()});
 apply();
}

const dialog=document.querySelector('#evidence-dialog');
if(dialog&&typeof dialog.showModal==='function'){
 let opener=null;
 document.querySelectorAll('[data-source]').forEach(link=>link.addEventListener('click',event=>{
  const source=document.getElementById('source-'+link.dataset.source);
  if(!source)return;
  event.preventDefault();opener=link;
  const title=source.querySelector('.source-title').textContent;
  const body=source.querySelector('.source-content').cloneNode(true);
  body.querySelector('[data-copy-source]')?.remove();body.querySelector('.copy-result')?.remove();
  const target=dialog.querySelector('.dialog-body');target.replaceChildren();
  const heading=document.createElement('h2');heading.id='dialog-source-title';heading.textContent=title;
  target.append(heading,body);dialog.showModal();dialog.scrollTop=0;
 }));
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
 dialog.addEventListener('close',()=>{opener?.focus()});
}

document.querySelectorAll('[data-copy-source]').forEach(button=>button.addEventListener('click',async()=>{
 const source=document.getElementById('source-'+button.dataset.copySource);
 const text=source?.querySelector('pre')?.textContent;
 const status=source?.querySelector('.copy-result');
 try{await navigator.clipboard.writeText(text);status.textContent='Excerpt copied.'}catch{status.textContent='Copy is unavailable here. Use the text download.'}
}));

const printButton=document.querySelector('#print-story');
printButton?.addEventListener('click',()=>window.print());
const progress=document.querySelector('.read-progress');
if(progress){
 const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=`${max>0?Math.min(100,Math.max(0,scrollY/max*100)):0}%`};
 addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
}
if('IntersectionObserver' in window){
 const links=[...document.querySelectorAll('.toc a[href^="#"]')];
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){links.forEach(l=>l.classList.toggle('active',l.hash==='#'+e.target.id))}},{rootMargin:'-15% 0px -65% 0px'});
 document.querySelectorAll('.prose>section[id]').forEach(s=>observer.observe(s));
}

// Direct source links remain usable when scripting is disabled.
if(location.hash.startsWith('#source-')){const target=document.getElementById(location.hash.slice(1));if(target instanceof HTMLDetailsElement)target.open=true}
addEventListener('hashchange',()=>{if(location.hash.startsWith('#source-')){const target=document.getElementById(location.hash.slice(1));if(target instanceof HTMLDetailsElement)target.open=true}});
