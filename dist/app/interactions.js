import {services} from './services.js';
function initialize(){
 let activeModal=null,modalTrigger=null,backdrop=null;
 function closeModal(){if(!activeModal)return;activeModal.classList.remove('show');activeModal.style.display='none';activeModal.setAttribute('aria-hidden','true');activeModal.removeAttribute('aria-modal');document.body.classList.remove('modal-open');backdrop?.remove();activeModal=null;modalTrigger?.focus();}
 document.querySelectorAll('[data-toggle="modal"][data-target]').forEach(trigger=>trigger.addEventListener('click',event=>{
  event.preventDefault();event.stopImmediatePropagation();const modal=document.querySelector(trigger.dataset.target);if(!modal)return;closeModal();modalTrigger=trigger;activeModal=modal;modal.style.display='block';modal.removeAttribute('aria-hidden');modal.setAttribute('aria-modal','true');modal.classList.add('show');modal.scrollTop=0;document.body.classList.add('modal-open');backdrop=document.createElement('div');backdrop.className='modal-backdrop fade show';document.body.append(backdrop);modal.querySelector('[data-dismiss="modal"]')?.focus();
 },true));
 document.querySelectorAll('[data-dismiss="modal"]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();closeModal();},true));
 document.querySelectorAll('.modal').forEach(modal=>modal.addEventListener('click',event=>{if(event.target===modal)closeModal();}));
 document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal();if(event.key==='Tab'&&activeModal){const controls=[...activeModal.querySelectorAll('a,button,input')].filter(e=>e.getClientRects().length);const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});

 document.querySelectorAll('[data-local-contact]').forEach(form=>{
  form.addEventListener('submit',async event=>{
   event.preventDefault();event.stopImmediatePropagation();
   if(!form.reportValidity())return;
   const button=form.querySelector('[type=submit]');button.disabled=true;
   const status=form.querySelector('.wpcf7-response-output');status.setAttribute('role','status');status.style.display='block';
   try{const result=await services.submitContact(Object.fromEntries(new FormData(form)));status.textContent=result.message;status.style.borderColor='#2563eb';}
   catch{status.textContent='Unable to save your message. Please email muizadeyemo17@gmail.com.'}
   finally{button.disabled=false}
  },true);
 });
 document.querySelectorAll('.inbio-password-protected').forEach(card=>card.addEventListener('click',event=>{if(event.target.closest('form,a[href^="mailto:"]'))return;const prompt=card.querySelector('.inbio-protected-content-main-wrapper');prompt?.classList.add('inbio-protected-from-opend');card.querySelector('.portfolio-password-protected-field')?.style.setProperty('display','none');prompt?.querySelector('input')?.focus();}));
 document.querySelectorAll('.inbio-portfolio-password').forEach(form=>{
  form.addEventListener('submit',async event=>{
   event.preventDefault();event.stopImmediatePropagation();if(!form.reportValidity())return;
   const result=await services.unlockProject(new FormData(form).get('password'));
   const status=form.parentElement.querySelector('.inbio-errorPWdata');status.setAttribute('role','status');status.textContent=result.message;
  },true);
 });
 const likeLinks=[...document.querySelectorAll('a.like-button,a[href*="rainbow_pt_like_it"]')];
 likeLinks.forEach((link,index)=>{
  const original=link.getAttribute('href');const id=new URL(original,location.origin).searchParams.get('post_id')||link.dataset.id||link.querySelector('[id]')?.id||`protected-${index}`;
  link.href='#';link.setAttribute('role','button');link.setAttribute('aria-label','Like this project');
  link.dataset.likeId=id;const count=link.querySelector('.like-count,mark');const base=parseInt(count?.textContent)||0;
  link.dataset.baseCount=base;link.setAttribute('aria-pressed',String(services.isLiked(id)));if(count&&base)count.textContent=base+Number(services.isLiked(id));
  link.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();const liked=services.toggleLike(id);likeLinks.filter(x=>x.dataset.likeId===id).forEach(x=>{x.setAttribute('aria-pressed',String(liked));const c=x.querySelector('.like-count,mark');if(c&&Number(x.dataset.baseCount))c.textContent=Number(x.dataset.baseCount)+Number(liked);});},true);
 });
 const menu=document.querySelector('.popup-mobile-menu');
 const opener=document.querySelector('.hamberger-menu');
 const closer=menu?.querySelector('.close-menu-activation');
 function setMenu(open){menu?.classList.toggle('menu-open',open);opener?.setAttribute('aria-expanded',String(open));document.documentElement.style.overflow=open?'hidden':'';if(open)closer?.focus();else opener?.focus();}
 opener?.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();setMenu(true);},true);
 closer?.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();setMenu(false);},true);
 menu?.querySelectorAll('#menu-nav-menu-1 a[href]').forEach(link=>link.addEventListener('click',event=>{
  const href=link.getAttribute('href');if(!href||href==='#')return;
  event.preventDefault();event.stopImmediatePropagation();setMenu(false);window.location.assign(new URL(href,location.href).href);
 },true));
 menu?.addEventListener('click',event=>{if(event.target===menu)setMenu(false);});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.classList.contains('menu-open'))setMenu(false);if(event.key==='Tab'&&menu?.classList.contains('menu-open')){const controls=[...menu.querySelectorAll('a,button')].filter(e=>e.getClientRects().length);const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
 document.querySelectorAll('.hamberger-menu,.closeTrigger').forEach(button=>{button.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();button.click();}});});
 // Assets are eager within a case-study modal, avoiding zero-size lazy images.
 document.querySelectorAll('.modal img').forEach(img=>img.loading='eager');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize);else initialize();
