/** Replace these methods with your own API; no requests reach the reference backend. */
const storage={get(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}},set(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}};
export const services={
 async submitContact(fields){const drafts=storage.get('contact-drafts',[]);drafts.push({...fields,createdAt:new Date().toISOString()});storage.set('contact-drafts',drafts);return {delivered:false,message:'Your message has been saved in this browser. Email delivery is not connected. Please email muizadeyemo17@gmail.com to send it.'}},
 async unlockProject(){return {unlocked:false,message:'This project requires access to the original authentication service. Request access from Ifedayo.'}},
 toggleLike(id){const likes=storage.get('project-likes',{});likes[id]=!likes[id];storage.set('project-likes',likes);return likes[id]},
 isLiked(id){return !!storage.get('project-likes',{})[id]}
};
