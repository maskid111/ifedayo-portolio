import {developerProjects,normalizeProjectUrl,isCatalogMetadata} from './developer-catalog.js';

const markerId='web3-project-selection-v1';
// Apply the owner's explicit area change once, including records imported earlier.
export async function migrateWeb3Selection(firebase,user){
 if(!firebase.isAdmin(user))throw Error('Administrator access required.');
 const {db,doc,collection,getDoc,getDocs,runTransaction,serverTimestamp}=firebase;
 const marker=doc(db,'projects',markerId);
 if((await getDoc(marker)).exists())return 0;
 const snapshot=await getDocs(collection(db,'projects'));
 const existing=snapshot.docs.filter(item=>!isCatalogMetadata({...item.data(),id:item.id}));
 const refs=new Map(existing.map(item=>[item.id,doc(db,'projects',item.id)]));
 const selected=developerProjects.filter(project=>['trustescrow','seismic-flyer-generator'].includes(project.id));
 const targets=new Map();
 for(const source of selected){let id=source.id;while(refs.has(id))id='selected-'+id;const reference=doc(db,'projects',id);refs.set(id,reference);targets.set(source.id,reference);}
 return runTransaction(db,async transaction=>{
  if((await transaction.get(marker)).exists())return 0;
  const snapshots=await Promise.all([...refs.values()].map(reference=>transaction.get(reference)));
  const records=snapshots.filter(item=>item.exists()).map(item=>({...item.data(),id:item.id}));
  let changed=0;
  for(const source of selected){
   const record=records.find(project=>normalizeProjectUrl(project.liveUrl||project.url)===normalizeProjectUrl(source.liveUrl));
   if(record){
    if(record.track!=='web3'){
     transaction.set(refs.get(record.id),{track:'web3',updatedAt:serverTimestamp()},{merge:true});changed++;
    }
   }else{
    const {id,aliases,...data}=source;
    transaction.set(targets.get(id),{...data,createdAt:serverTimestamp(),updatedAt:serverTimestamp(),updatedBy:user.email});changed++;
   }
  }
  transaction.set(marker,{kind:'catalog-migration',importedAt:serverTimestamp(),importedBy:user.email});
  return changed;
 });
}
