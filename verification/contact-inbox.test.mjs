import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

async function fixture(folder,{write=async()=>{}}={}){
 const fields={name:'Preview visitor',email:'visitor@example.test',message:'A sample collaboration brief.',service:'Video content',timeline:'Next month',website:''};
 const status={textContent:''},button={textContent:'Send enquiry',disabled:false},writes=[];
 let handler,resets=0;
 const form={dataset:{site:folder==='creator-website'?'creator':'hub'},reportValidity:()=>true,querySelector:s=>s==='[type="submit"]'?button:status,setAttribute(){},removeAttribute(){},reset(){resets++;},addEventListener:(_,callback)=>handler=callback};
 const context=vm.createContext({document:{querySelector:()=>form},FormData:class{get(key){return fields[key];}},location:{origin:'https://example.test',pathname:'/'},firebaseConfig:{},setTimeout,clearTimeout,
  __import:async url=>url.endsWith('firebase-app.js')?{getApps:()=>[],initializeApp:()=>({})}:{getFirestore:()=>({}),collection:(_,name)=>name,serverTimestamp:()=>123,addDoc:async(collection,message)=>{writes.push({collection,message});await write();}}
 });
 const source=(await readFile(new URL('../'+folder+'/src/contact.js',import.meta.url),'utf8')).replace(/^import .*?;\s*/,'').replaceAll('import(','__import(');
 vm.runInContext(source,context);
 return {fields,status,button,writes,form,get resets(){return resets;},send:()=>handler({preventDefault(){}})};
}
for(const folder of ['creator-website','maskid-hub']){
 test(folder+': confirms delivery only after the database write and identifies the website',async()=>{
  const f=await fixture(folder);await f.send();
  assert.equal(f.writes.length,1);assert.equal(f.writes[0].collection,'messages');
  assert.equal(f.writes[0].message.site,folder==='creator-website'?'creator':'hub');
  assert.equal(f.writes[0].message.timeline,'Next month');assert.equal(f.writes[0].message.status,'unread');
  assert.match(f.status.textContent,/has been sent/);assert.equal(f.resets,1);assert.equal(f.button.disabled,false);
 });
 test(folder+': retains the brief and supports retry on failure',async()=>{
  const f=await fixture(folder,{write:async()=>{throw Error('offline');}});await f.send();
  assert.match(f.status.textContent,/could not be sent/);assert.equal(f.resets,0);assert.equal(f.button.disabled,false);
 });
 test(folder+': prevents double submits and ignores the bot trap',async()=>{
  let finish;const pending=new Promise(resolve=>{finish=resolve;});
  const f=await fixture(folder,{write:()=>pending});const first=f.send();await f.send();finish();await first;
  assert.equal(f.writes.length,1);
  f.fields.website='bot-filled';await f.send();assert.equal(f.writes.length,1);
 });
}
