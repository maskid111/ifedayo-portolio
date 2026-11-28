import {
 addDoc,
 collection,
 db,
 serverTimestamp,
} from './firebase-client.js';

const storage={get(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}},set(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}};
export const services={
 async submitContact(fields){
  const message={
   name:fields['your-name']||fields.name||'',
   email:fields['your-email']||fields.email||'',
   subject:fields['your-subject']||fields.subject||'',
   message:fields['your-message']||fields.message||'',
   status:'unread',
   site:'developer',
   source:location.origin+location.pathname,
   createdAt:serverTimestamp(),
  };
  try{
   await addDoc(collection(db,'messages'),message);
   return {delivered:true,message:'Thank you. Your message has been sent successfully.'};
  }catch(error){
   const drafts=storage.get('contact-drafts',[]);drafts.push({...message,createdAt:new Date().toISOString(),error:error.message});storage.set('contact-drafts',drafts);
   return {delivered:false,message:'Your message could not reach the dashboard yet. Please email muizadeyemo17@gmail.com if it is urgent.'};
  }
 },
 async unlockProject(){return {unlocked:false,message:'This project requires access to the original authentication service. Request access from Ifedayo.'}},
 toggleLike(id){const likes=storage.get('project-likes',{});likes[id]=!likes[id];storage.set('project-likes',likes);return likes[id]},
 isLiked(id){return !!storage.get('project-likes',{})[id]}
};
