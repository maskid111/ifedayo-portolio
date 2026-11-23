import {developerProjects,DEVELOPER_MARKER_ID,normalizeProjectUrl,isCatalogMetadata} from './developer-catalog.js';
import {builtInProjects} from './project-catalog.js';

// A separate completion marker makes this upgrade safe for existing portfolios.
// It supplements existing records and preserves visibility and featured choices.
export async function migrateDeveloperProjects(firebase,user){
 if(!firebase.isAdmin(user))throw Error('Administrator access required.');
 const {db,doc,collection,getDoc,getDocs,runTransaction,serverTimestamp}=firebase;
 const marker=doc(db,'projects',DEVELOPER_MARKER_ID);
 if((await getDoc(marker)).exists())return 0;
 const initial=await getDocs(collection(db,'projects'));
 const references=new Map(initial.docs.filter(item=>!isCatalogMetadata({...item.data(),id:item.id})).map(item=>[item.id,doc(db,'projects',item.id)]));
 const targets=new Map();
 for(const source of developerProjects){let id=source.id;while(references.has(id))id='developer-'+id;const reference=doc(db,'projects',id);references.set(id,reference);targets.set(source.id,reference);}
 return runTransaction(db,async transaction=>{
  if((await transaction.get(marker)).exists())return 0;
  const snapshots=await Promise.all([...references.values()].map(reference=>transaction.get(reference)));
  const records=snapshots.filter(item=>item.exists()).map(item=>({...item.data(),id:item.id}));
  let imported=0;
  for(const source of developerProjects){
   const urls=[source.liveUrl,...(source.aliases||[])].map(normalizeProjectUrl);
   const existing=records.find(item=>urls.includes(normalizeProjectUrl(item.liveUrl||item.url)))||records.find(item=>item.id===source.id&&String(item.name).toLowerCase()===source.name.toLowerCase());
   if(existing){
    const changes={};
    const original=builtInProjects.find(item=>item.id===source.id);
    for(const field of ['name','category','description'])if(original&&existing[field]===original[field]&&source[field]!==undefined)changes[field]=source[field];
    for(const field of ['track','codeUrl','stack','status'])if(existing[field]===undefined&&source[field]!==undefined)changes[field]=source[field];
    // Upgrade only known former links; preserve custom destinations and previews.
    if((source.aliases||[]).map(normalizeProjectUrl).includes(normalizeProjectUrl(existing.liveUrl||existing.url)))changes.liveUrl=source.liveUrl;
    if(Object.keys(changes).length)transaction.set(references.get(existing.id),{...changes,updatedAt:serverTimestamp()},{merge:true});
   }else{
    const original=builtInProjects.find(item=>item.id===source.id);
    const {aliases,...data}={...original,...source};
    // Only import a missing Web2 original if it was never migrated at all.
    // Deleted originals must stay deleted; the new Web3 addition is TrustEscrow.
    if(source.id!=='trustescrow')continue;
    const {id,...payload}=data;
    transaction.set(targets.get(id),{...payload,createdAt:serverTimestamp(),updatedAt:serverTimestamp(),updatedBy:user.email});
    imported++;
   }
  }
  transaction.set(marker,{kind:'catalog-migration',version:1,importedAt:serverTimestamp(),importedBy:user.email});
  return imported;
 });
}
