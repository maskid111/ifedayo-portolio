import {creatorSeed} from './creator-seed.js';
export const CREATOR_MARKER='__creator_catalog_v1';
export async function migrateCreatorPosts(f,user){
 if(!f.isAdmin(user))throw Error('Administrator access required.');
 const marker=f.doc(f.db,'creatorPosts',CREATOR_MARKER);
 return f.runTransaction(f.db,async transaction=>{
  if((await transaction.get(marker)).exists())return 0;
  const targets=creatorSeed.map(post=>f.doc(f.db,'creatorPosts',post.id));
  const snapshots=await Promise.all(targets.map(ref=>transaction.get(ref)));
  let count=0;
  creatorSeed.forEach((post,index)=>{if(!snapshots[index].exists()){transaction.set(targets[index],{...post,order:index,published:true,createdAt:f.serverTimestamp(),updatedAt:f.serverTimestamp()});count++;}});
  transaction.set(marker,{kind:'creator-catalog',published:true,initialized:true});return count;
 });
}
