import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {builtInProjects, CATALOG_MARKER_ID} from '../src/app/project-catalog.js';
import {migrateBuiltInProjects} from '../src/app/project-migration.js';

const user={email:'admin@example.test'};
function database(initial=[], fail=false) {
 const records=new Map(initial.map(project=>[project.id,{...project}]));
 const snapshot=id=>({id,exists:()=>records.has(id),data:()=>records.get(id)});
 const firebase={db:{},isAdmin:account=>account===user,
  doc:(_db,_collection,id)=>({id}),collection:()=>({}),
  getDoc:async reference=>snapshot(reference.id),
  getDocs:async()=>({docs:[...records.keys()].map(snapshot)}),
  serverTimestamp:()=> 'timestamp',
  runTransaction:async(_db,work)=>{
   const writes=[];
   const result=await work({get:async reference=>{assert.equal(writes.length,0,'all reads precede writes');return snapshot(reference.id);},set:(reference,value)=>writes.push([reference.id,value])});
   if(fail)throw Error('Commit failed');
   writes.forEach(([id,data])=>records.set(id,data));
   return result;
  },
 };
 return {firebase,records};
}
test('imports all eight projects with original homepage choices and local previews',async()=>{
 const {firebase,records}=database();
 assert.equal(await migrateBuiltInProjects(firebase,user),8);
 assert.equal(records.size,9);
 assert.equal([...records.values()].filter(p=>p.featured).length,4);
 assert.doesNotMatch(CATALOG_MARKER_ID,/^__.*__$/);
 for(const project of builtInProjects){assert.equal(new URL(project.liveUrl).protocol,'https:');assert.equal(records.get(project.id).liveUrl,project.liveUrl);await readFile(new URL('../dist'+project.previewPath,import.meta.url));}
});
test('matches existing URLs without overwriting edits or adding duplicates',async()=>{
 const existing={id:'custom-id',name:'My edited title',liveUrl:'https://www.aimabluxe.com',order:99,featured:false,published:false};
 const {firebase,records}=database([existing]);
 assert.equal(await migrateBuiltInProjects(firebase,user),7);
 assert.deepEqual(records.get('custom-id'),existing);
 assert.equal(records.has('aimabluxe'),false);
});
test('never reimports deleted projects after migration',async()=>{
 const {firebase,records}=database();
 await migrateBuiltInProjects(firebase,user);
 for(const project of builtInProjects)records.delete(project.id);
 assert.equal(await migrateBuiltInProjects(firebase,user),0);
 assert.equal(records.size,1);
});
test('leaves an unrelated project with a colliding ID intact',async()=>{
 const existing={id:'aimabluxe',name:'Different project',liveUrl:'https://example.com/',order:0};
 const {firebase,records}=database([existing]);
 await migrateBuiltInProjects(firebase,user);
 assert.deepEqual(records.get('aimabluxe'),existing);
 assert.equal(records.get('original-aimabluxe').name,'Aimabluxe');
});
test('failed migration leaves no partial import or completion marker',async()=>{
 const {firebase,records}=database([],true);
 await assert.rejects(migrateBuiltInProjects(firebase,user),/Commit failed/);
 assert.equal(records.size,0);
});
test('unapproved visitors cannot trigger an import',async()=>{
 const {firebase,records}=database();
 await assert.rejects(migrateBuiltInProjects(firebase,null),/Administrator/);
 assert.equal(records.size,0);
});

const source=await readFile(new URL('../src/app/projects.js',import.meta.url),'utf8');
const transformed=source.replace(/import \{[\s\S]*?\} from '\.\/firebase-client.js';/,
 'const {collection,db,getDocs,previewUrlFor}=globalThis.projectTestFirebase;')
 .replace("'./project-catalog.js'",JSON.stringify(new URL('../src/app/project-catalog.js',import.meta.url).href))
 .replace("'./developer-catalog.js'",JSON.stringify(new URL('../src/app/developer-catalog.js',import.meta.url).href))
 .replace(/hydrateProjects\(\);\s*$/,'');
globalThis.projectTestFirebase={collection:()=>({}),db:{},getDocs:async()=>({docs:globalThis.projectTestDocuments.map(project=>({id:project.id,data:()=>project}))}),previewUrlFor:project=>project.previewPath||''};
const {hydrateProjects}=await import('data:text/javascript;base64,'+Buffer.from(transformed).toString('base64'));
function page(documents){
 globalThis.projectTestDocuments=documents;
 const container=()=>({innerHTML:'ORIGINAL STATIC CARDS',setAttribute(){},removeAttribute(){}});
 const home=container(),archive=container(),web3=container(),homeWeb3=container();
 globalThis.document={querySelector:selector=>({'.rbt-portfolio-replace-area':home,'.project-archive-wrapper .row.row--25':archive,'[data-web3-projects]':web3,'[data-home-web3]':homeWeb3})[selector]||null};
 return {home,archive,web3,homeWeb3};
}
test('unfeaturing all projects empties homepage while preserving the Projects page',async()=>{
 const {home,archive}=page([{id:CATALOG_MARKER_ID},...builtInProjects.map(p=>({...p,featured:false}))]);
 await hydrateProjects();
 assert.match(home.innerHTML,/More featured work coming soon/);
 assert.doesNotMatch(home.innerHTML,/ORIGINAL STATIC CARDS|ifedayo-project-card/);
 assert.equal((archive.innerHTML.match(/ifedayo-project-card/g)||[]).length,5);
});
test('deleting all projects keeps both pages empty instead of restoring static cards',async()=>{
 const {home,archive}=page([{id:CATALOG_MARKER_ID}]);
 await hydrateProjects();
 assert.doesNotMatch(home.innerHTML+archive.innerHTML,/ORIGINAL STATIC CARDS|ifedayo-project-card/);
 assert.match(archive.innerHTML,/New projects coming soon/);
});
test('drafts are absent publicly and featured projects follow display order',async()=>{
 const {home,archive}=page([{id:CATALOG_MARKER_ID},...builtInProjects.map(p=>({...p,published:p.id!=='aimabluxe',order:8-p.order}))]);
 await hydrateProjects();
 assert.doesNotMatch(home.innerHTML+archive.innerHTML,/Aimabluxe/);
 assert.ok(home.innerHTML.indexOf('Malete Hostel')<home.innerHTML.indexOf('Teamzadore'));
 assert.equal((archive.innerHTML.match(/ifedayo-project-card/g)||[]).length,4);
});
test('unmigrated empty database retains the original portfolio for first-time setup',async()=>{
 const {home,archive}=page([]);
 await hydrateProjects();
 assert.equal(home.innerHTML,'ORIGINAL STATIC CARDS');
 assert.equal(archive.innerHTML,'ORIGINAL STATIC CARDS');
});

test('Web3 builds are separated from the primary Web2 page and homepage',async()=>{
 const {home,archive,web3,homeWeb3}=page([{id:CATALOG_MARKER_ID},...builtInProjects.map(project=>({...project,featured:true}))]);
 await hydrateProjects();
 assert.doesNotMatch(home.innerHTML+archive.innerHTML,/JudgeLayer|Echomap/);
 assert.match(web3.innerHTML,/JudgeLayer/);assert.match(web3.innerHTML,/Echomap/);
 assert.match(homeWeb3.innerHTML,/JudgeLayer/);
 assert.doesNotMatch(web3.innerHTML,/Aimabluxe/);
});
