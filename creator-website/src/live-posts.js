import {firebaseConfig} from './firebase-config.js';
import {CREATOR_MARKER,publicPosts,postMarkup} from './post-catalog.js';
export async function connectCreatorPosts(onChange){
 try{
  const [app,f]=await Promise.all([import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')]);
  const db=f.getFirestore(app.getApps()[0]||app.initializeApp(firebaseConfig));
  return f.onSnapshot(f.query(f.collection(db,'creatorPosts'),f.where('published','==',true)),snapshot=>{
   const records=snapshot.docs.map(item=>({...item.data(),id:item.id}));
   if(records.some(p=>p.id===CREATOR_MARKER&&p.initialized)||records.some(p=>p.type))onChange(publicPosts(records));
  },()=>{document.querySelector('#catalog-notice').hidden=false;});
 }catch{document.querySelector('#catalog-notice').hidden=false;return ()=>{};}
}
export function renderPosts(posts){return posts.map(postMarkup).join('\n');}
