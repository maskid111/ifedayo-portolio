const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
if(!reduced.matches){
 const seen=new WeakSet();
 const selectors='.destination-card,.content-card,.service-card,.ifedayo-project-card,.capability-grid article,.section-heading,.developer-section-heading,.hub-guide>div,.split-section>div,.contact-panel,.developer-page-cta';
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){
   observer.unobserve(entry.target);
   const siblings=[...entry.target.parentElement.children];
   const delay=Math.min(siblings.indexOf(entry.target)%3,2)*65;
   entry.target.animate([{opacity:0,transform:'translateY(22px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:650,delay,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});
  }
 },{threshold:.08});
 function watch(){document.querySelectorAll(selectors).forEach(element=>{if(!seen.has(element)){seen.add(element);observer.observe(element);}});}
 watch();
 const mutations=new MutationObserver(watch);mutations.observe(document.querySelector('main')||document.body,{childList:true,subtree:true});
 const progress=document.createElement('div');progress.className='page-reading-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
 let pending=false;
 function update(){const range=document.documentElement.scrollHeight-innerHeight;progress.style.transform='scaleX('+(range>0?Math.min(1,scrollY/range):0)+')';pending=false;}
 addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});
 addEventListener('resize',update);update();
 reduced.addEventListener('change',event=>{if(event.matches){observer.disconnect();mutations.disconnect();document.getAnimations().forEach(animation=>animation.cancel());progress.remove();}});
}
