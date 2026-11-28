import {migrateCreatorPosts,CREATOR_MARKER} from './creator-migration.js';
import {parsePostUrl} from './creator-catalog.js';
const $=selector=>document.querySelector(selector);
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function startCreatorAdmin(f,user,notify,onPosts=()=>{}){
 let active=true,unsubscribe=()=>{},posts=[],loaded=false,saving=false;
 const form=$('#creatorForm'),dialog=$('#creatorDialog'),list=$('#creatorPostsList');
 const controller=new AbortController(),options={signal:controller.signal};
 const listen=(element,event,callback)=>element.addEventListener(event,callback,options);
 $('#addCreatorBtn').disabled=true;
 list.textContent='Loading your creator posts…';
 function errorText(error){return error?.code?.includes('permission-denied')?'Creator access was denied. Deploy the updated Firestore rules, then refresh this page.':'Creator posts could not be saved or loaded. Check your connection and try again.';}
 function render(){
  const term=$('#creatorSearch').value.trim().toLowerCase(),filter=$('#creatorFilter').value;
  const visible=posts.filter(p=>(p.title+' '+p.url).toLowerCase().includes(term)&&(filter==='all'||p.type===filter||filter==='draft'&&!p.published));
  $('#creatorCount').textContent=posts.length;
  list.innerHTML=visible.map(p=>'<article class="message-card"><div class="message-heading"><h3>'+escape(p.title||'Featured '+p.type)+'</h3><span class="visibility-label">'+(p.published?'Published':'Hidden')+'</span></div><p class="message-origin">'+escape(p.type==='video'?'Video':'Thread')+' · Order '+escape(p.order)+'</p><p class="message-copy">'+escape(p.excerpt||'')+'</p><div class="message-actions"><a class="text-button" href="'+escape(parsePostUrl(p.url)?.url||'#')+'" target="_blank" rel="noopener noreferrer">View on X</a><button class="text-button" data-creator-edit="'+escape(p.id)+'">Edit post</button><button class="text-button" data-creator-toggle="'+escape(p.id)+'">'+(p.published?'Hide from website':'Publish post')+'</button><button class="text-button danger" data-creator-delete="'+escape(p.id)+'">Delete</button></div></article>').join('')||'<p class="empty-state">'+(posts.length?'No posts match your filter.':'No creator posts. Add an X post to publish it on your creator website.')+'</p>';
 }
 function openEditor(post){
  form.reset();form.elements.id.value=post?.id||'';
  for(const field of ['url','title','excerpt','type'])form.elements[field].value=post?.[field]||(field==='type'?'video':'');
  form.elements.order.value=post?.order??(posts.length?Math.max(...posts.map(p=>Number(p.order)||0))+1:0);
  form.elements.published.checked=post?.published!==false;
  $('#creatorFormTitle').textContent=post?'Edit creator post':'Add creator post';$('#creatorFormError').textContent='';dialog.showModal();
 }
 listen($('#addCreatorBtn'),'click',()=>{if(loaded)openEditor();});
 listen($('#creatorSearch'),'input',render);listen($('#creatorFilter'),'change',render);
 listen($('#closeCreatorBtn'),'click',()=>{if(!saving)dialog.close();});
 listen(dialog,'cancel',event=>{if(saving)event.preventDefault();});
 listen(list,'click',async event=>{
  const button=event.target.closest('button');if(!button||!loaded||!active)return;
  const id=button.dataset.creatorEdit||button.dataset.creatorToggle||button.dataset.creatorDelete;
  const post=posts.find(p=>p.id===id);if(!post)return;
  if(button.dataset.creatorEdit){openEditor(post);return;}
  if(button.dataset.creatorDelete&&!confirm('Delete this creator post from your portfolio? The original X post will remain on X.'))return;
  button.disabled=true;
  try{const ref=f.doc(f.db,'creatorPosts',post.id);
   if(button.dataset.creatorDelete)await f.deleteDoc(ref);else await f.updateDoc(ref,{published:!post.published,updatedAt:f.serverTimestamp()});
   if(active)notify(button.dataset.creatorDelete?'Creator post removed from the portfolio.':'Creator post visibility updated.');
  }catch(error){if(active)notify(errorText(error),true);}finally{button.disabled=false;}
 });
 listen(form,'submit',async event=>{
  event.preventDefault();if(!active||saving||!loaded)return;
  const data=Object.fromEntries(new FormData(form)),link=parsePostUrl(data.url),order=Number(data.order),error=$('#creatorFormError');
  if(!link){error.textContent='Paste a complete HTTPS X or Twitter post link.';return;}
  if(!Number.isSafeInteger(order)||order<0){error.textContent='Display order must be a whole number, zero or greater.';return;}
  const existing=posts.find(p=>p.id===data.id);
  if(posts.some(p=>p.id!==data.id&&parsePostUrl(p.url)?.postId===link.postId)){error.textContent='This X post is already in your library. Edit its existing entry.';return;}
  const id=link.postId;
  const payload={postId:link.postId,url:link.url,type:data.type==='thread'?'thread':'video',title:data.title.trim(),excerpt:data.excerpt.trim(),text:data.excerpt.trim(),order,published:form.elements.published.checked,updatedAt:f.serverTimestamp()};
  if(!existing)payload.createdAt=f.serverTimestamp();
  saving=true;$('#saveCreatorBtn').disabled=true;$('#closeCreatorBtn').disabled=true;error.textContent='Saving…';
  try{
   // A transaction also prevents two admin tabs from creating the same X post.
   await f.runTransaction(f.db,async transaction=>{
    const ref=f.doc(f.db,'creatorPosts',id),original=existing?f.doc(f.db,'creatorPosts',existing.id):null;
    const current=await transaction.get(ref);
    const previous=original&&existing.id!==id?await transaction.get(original):current;
    if(current.exists()&&(!existing||existing.id!==id))throw Error('duplicate');
    if(existing&&!previous.exists())throw Error('removed');
    transaction.set(ref,payload,{merge:true});
    if(original&&existing.id!==id)transaction.delete(original);
   });
   if(active){dialog.close();notify('Creator post saved. Published changes appear on the creator website.');}
  }catch(failure){if(active)error.textContent=failure.message==='duplicate'?'This post already exists. Refresh the library.':errorText(failure);}
  finally{saving=false;$('#saveCreatorBtn').disabled=false;$('#closeCreatorBtn').disabled=false;}
 });
 migrateCreatorPosts(f,user).then(()=>{
  if(!active)return;
  unsubscribe=f.onSnapshot(f.collection(f.db,'creatorPosts'),snapshot=>{
   if(!active)return;
   posts=snapshot.docs.filter(item=>item.id!==CREATOR_MARKER).map(item=>({...item.data(),id:item.id})).sort((a,b)=>(a.order||0)-(b.order||0));
   loaded=true;$('#addCreatorBtn').disabled=false;render();onPosts(posts);
  },error=>{if(active){list.textContent=errorText(error);notify(errorText(error),true);}});
 }).catch(error=>{if(active){list.textContent=errorText(error);notify(errorText(error),true);}});
 return ()=>{active=false;unsubscribe();controller.abort();$('#creatorCount').textContent='—';if(dialog.open)dialog.close();};
}
