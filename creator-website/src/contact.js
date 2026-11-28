import {firebaseConfig} from './firebase-config.js';

const form=document.querySelector('[data-brief-form]');
let client;
async function database(){
 if(!client) client=Promise.all([
  import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
  import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')
 ]).then(([app,firestore])=>({...firestore,db:firestore.getFirestore(app.getApps()[0]||app.initializeApp(firebaseConfig))})).catch(error=>{client=null;throw error;});
 return client;
}
form?.addEventListener('submit',async event=>{
 event.preventDefault();
 if(form.dataset.sending==='true'||!form.reportValidity())return;
 const data=new FormData(form);
 if(data.get('website'))return;
 const name=String(data.get('name')||'').trim(),email=String(data.get('email')||'').trim(),message=String(data.get('message')||'').trim();
 const status=form.querySelector('[data-form-status]'),button=form.querySelector('[type="submit"]');
 if(!name||!email||!message){status.textContent='Please complete your name, email, and project brief.';return;}
 const original=button.textContent;
 form.dataset.sending='true';button.disabled=true;button.textContent='Sending…';form.setAttribute('aria-busy','true');status.textContent='Sending your enquiry…';
 const timer=setTimeout(()=>{status.textContent='Still sending. Please keep this page open until delivery is confirmed.';},12000);
 try{
  const {db,collection,addDoc,serverTimestamp}=await database();
  await addDoc(collection(db,'messages'),{
   name,email,message,subject:String(data.get('service')||'Website enquiry'),
   service:String(data.get('service')||''),timeline:String(data.get('timeline')||'').trim(),
   site:form.dataset.site,source:location.origin+location.pathname,status:'unread',createdAt:serverTimestamp()
  });
  form.reset();status.textContent='Thank you. Your enquiry has been sent. I’ll get back to you soon.';
 }catch{
  status.textContent='Your enquiry could not be sent. Please try again, or use the email or WhatsApp link. Your brief is still here.';
 }finally{clearTimeout(timer);delete form.dataset.sending;button.disabled=false;button.textContent=original;form.removeAttribute('aria-busy');}
});
