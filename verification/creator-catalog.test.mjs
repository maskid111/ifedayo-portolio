import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePostUrl,publicPosts,postMarkup} from '../creator-website/src/post-catalog.js';
import {migrateCreatorPosts,CREATOR_MARKER} from '../src/app/creator-migration.js';
const url='https://x.com/deft_gfx/status/2046236894044786912';
test('accepts X and Twitter post links while rejecting unrelated or unsafe URLs',()=>{
 assert.equal(parsePostUrl(url+'?s=20').postId,'2046236894044786912');
 assert.equal(parsePostUrl(url.replace('x.com','twitter.com')).postId,'2046236894044786912');
 for(const value of ['javascript:alert(1)',url.replace('x.com','x.com.evil.test'),'https://x.com/deft_gfx','http://x.com/deft_gfx/status/2046236894044786912'])assert.equal(parsePostUrl(value),null);
});
test('published catalogue excludes drafts and marker, sorts by order, and can be empty',()=>{
 const records=[{id:'a',type:'video',url,order:5,published:true},{id:'b',type:'thread',url,order:1,published:true},{id:'c',type:'video',url,order:0,published:false},{id:CREATOR_MARKER,published:true,initialized:true}];
 assert.deepEqual(publicPosts(records).map(p=>p.id),['b','a']);
 assert.deepEqual(publicPosts(records.slice(2)),[]);
 assert.match(postMarkup({...records[0],title:'<img onerror="bad">'}),/&lt;img/);
 assert.equal(postMarkup({...records[0],url:'javascript:alert(1)'}),'');
});
test('imports existing posts once, preserves edits, and never restores deletions',async()=>{
 const store=new Map([['2046236894044786912',{title:'My edited title',published:false}]]);
 const f={db:{},isAdmin:user=>user?.email==='admin',doc:(_,collection,id)=>({id}),serverTimestamp:()=>1,
  runTransaction:async(_,work)=>{const writes=[];const result=await work({get:async ref=>({exists:()=>store.has(ref.id)}),set:(ref,value)=>writes.push([ref.id,value])});writes.forEach(([id,value])=>store.set(id,value));return result;}};
 assert.equal(await migrateCreatorPosts(f,{email:'admin'}),9);
 assert.equal(store.get('2046236894044786912').title,'My edited title');
 store.delete('2036124432704458865');
 assert.equal(await migrateCreatorPosts(f,{email:'admin'}),0);
 assert.equal(store.has('2036124432704458865'),false);
 await assert.rejects(()=>migrateCreatorPosts(f,{email:'visitor'}));
});
