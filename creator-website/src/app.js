import {fitEmbed} from './fit-embeds.js';
import {connectCreatorPosts,renderPosts} from './live-posts.js';
const menuButton=document.querySelector('[data-menu-toggle]');
const nav=document.querySelector('#site-navigation');
function closeMenu(){nav?.classList.remove('is-open');menuButton?.setAttribute('aria-expanded','false');menuButton?.setAttribute('aria-label','Open navigation');}
menuButton?.addEventListener('click',()=>{const opened=nav.classList.toggle('is-open');menuButton.setAttribute('aria-expanded',String(opened));menuButton.setAttribute('aria-label',opened?'Close navigation':'Open navigation');});
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav?.classList.contains('is-open')){closeMenu();menuButton.focus();}});
document.addEventListener('click',event=>{if(nav&&!nav.contains(event.target)&&!menuButton?.contains(event.target))closeMenu();});
const motion=matchMedia('(prefers-reduced-motion: reduce)');
if(!motion.matches&&'IntersectionObserver'in window){document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));}
document.querySelectorAll('[data-copy-email]').forEach(button=>button.addEventListener('click',async()=>{const notice=document.querySelector('#toast');try{await navigator.clipboard.writeText(button.dataset.copyEmail);notice.textContent='Email address copied.';}catch{notice.textContent=button.dataset.copyEmail;}notice.hidden=false;setTimeout(()=>{notice.hidden=true;},5000);}));


let cards=[...document.querySelectorAll('[data-post-type]')];
const filterButtons=[...document.querySelectorAll('[data-filter]')];
const search=document.querySelector('#content-search');
const more=document.querySelector('#show-more');
let selectedFilter='all',expanded=false;
function filterContent(){
 const term=search.value.trim().toLowerCase();
 const matches=cards.filter(card=>(selectedFilter==='all'||card.dataset.postType===selectedFilter)&&card.dataset.postSearch.includes(term));
 cards.forEach(card=>{card.hidden=true;});
 const visible=expanded?matches:matches.slice(0,6);
 visible.forEach(card=>{card.hidden=false;card.classList.add('in-view');});
 document.querySelector('#content-result-count').textContent=matches.length?'Showing '+visible.length+' of '+matches.length+' '+(matches.length===1?'post':'posts'):'No matching posts';
 document.querySelector('#empty-content').hidden=matches.length>0;
 more.hidden=expanded||matches.length<=6;
 more.textContent='Show all '+matches.length+' posts';
 filterButtons.forEach(button=>{const active=button.dataset.filter===selectedFilter;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
}
filterButtons.forEach(button=>button.addEventListener('click',()=>{selectedFilter=button.dataset.filter;expanded=false;filterContent();}));
search.addEventListener('input',()=>{expanded=false;filterContent();});
more.addEventListener('click',()=>{expanded=true;filterContent();});
document.querySelector('#reset-filters').addEventListener('click',()=>{selectedFilter='all';expanded=false;search.value='';filterContent();search.focus();});
filterContent();
const postDialog=document.querySelector('#post-dialog');
const embedHost=document.querySelector('#post-embed');
const embedStatus=document.querySelector('#post-preview-status');
let xPromise=null,previewSession=0;
function loadX(){
 if(window.twttr?.widgets)return Promise.resolve(window.twttr);
 if(xPromise)return xPromise;
 xPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://platform.twitter.com/widgets.js';script.async=true;script.referrerPolicy='strict-origin-when-cross-origin';
  const timer=setTimeout(()=>{reject(Error('Preview timed out'));},12000);
  script.onload=()=>{clearTimeout(timer);window.twttr?.widgets?resolve(window.twttr):reject(Error('Preview unavailable'));};
  script.onerror=()=>{clearTimeout(timer);script.remove();reject(Error('Preview unavailable'));};
  document.head.append(script);
 }).catch(error=>{xPromise=null;throw error;});
 return xPromise;
}
// Load the original X embeds as their cards approach the viewport.
const embedQueue=[];
let activeEmbeds=0;
async function renderInlinePost(slot){
 const card=slot.closest('[data-post-type]'),status=slot.querySelector('[role="status"]');
 try{
  const x=await loadX();
  if(matchMedia('(max-width:760px)').matches)slot.querySelector('.inline-post-host').style.width='330px';
  const widget=await x.widgets.createTweet(slot.dataset.inlinePost,slot.querySelector('.inline-post-host'),{theme:'light',dnt:true,conversation:'none',align:'center'});
  if(!widget)throw Error('Post unavailable');
  status.hidden=true;card.classList.add('has-inline-preview');fitEmbed(slot.querySelector('.inline-post-host'));
 }catch{
  status.textContent='X preview unavailable. Open the original post below.';
 }finally{slot.dataset.loaded='true';}
}
function drainEmbeds(){
 while(activeEmbeds<2&&embedQueue.length){
  const slot=embedQueue.shift();activeEmbeds++;
  renderInlinePost(slot).finally(()=>{activeEmbeds--;drainEmbeds();});
 }
}
let embedObserver;
if('IntersectionObserver'in window){
 embedObserver=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){embedObserver.unobserve(entry.target);embedQueue.push(entry.target);}
  drainEmbeds();
 },{rootMargin:'200px'});
 document.querySelectorAll('[data-inline-post]').forEach(slot=>embedObserver.observe(slot));
}else{
 document.querySelectorAll('[data-inline-post]').forEach(slot=>embedQueue.push(slot));drainEmbeds();
}

document.querySelector('#content-grid').addEventListener('click',async event=>{
 const button=event.target.closest('[data-preview-post]');if(!button)return;
 const id=button.dataset.previewPost;if(!/^\d{15,22}$/.test(id))return;
 const session=++previewSession;
 document.querySelector('#post-dialog-title').textContent=button.dataset.postTitle;
 document.querySelector('#original-post-link').href=button.dataset.postUrl;
 embedHost.replaceChildren();embedStatus.hidden=false;embedStatus.textContent='Loading the post from X…';postDialog.showModal();
 try{const x=await loadX();if(session!==previewSession||!postDialog.open)return;const widget=await x.widgets.createTweet(id,embedHost,{theme:'light',dnt:true,align:'center',conversation:'none'});if(session!==previewSession)return;if(widget)embedStatus.hidden=true;else embedStatus.textContent='This post can’t be previewed here. Open the original post on X.';}
 catch{if(session===previewSession)embedStatus.textContent='X couldn’t load this preview. You can still open the original post below.';}
});
document.querySelector('.dialog-close').addEventListener('click',()=>postDialog.close());
postDialog.addEventListener('close',()=>{previewSession++;embedHost.replaceChildren();});

let catalogSignature='';
connectCreatorPosts(posts=>{
 const signature=JSON.stringify(posts.map(({id,url,type,title,excerpt,text,order})=>({id,url,type,title,excerpt,text,order})));
 if(signature===catalogSignature)return;catalogSignature=signature;
 embedObserver?.disconnect();embedQueue.length=0;
 if(postDialog.open)postDialog.close();
 document.querySelector('#content-grid').innerHTML=renderPosts(posts);
 cards=[...document.querySelectorAll('[data-post-type]')];expanded=false;filterContent();
 document.querySelectorAll('[data-inline-post]').forEach(slot=>{if(embedObserver)embedObserver.observe(slot);else embedQueue.push(slot);});
 if(!embedObserver)drainEmbeds();
 document.querySelector('[data-video-total]').textContent=posts.filter(p=>p.type==='video').length;
 document.querySelector('[data-thread-total]').textContent=posts.filter(p=>p.type==='thread').length;
 document.querySelector('#catalog-notice').hidden=true;
});
