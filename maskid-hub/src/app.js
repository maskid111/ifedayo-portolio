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

