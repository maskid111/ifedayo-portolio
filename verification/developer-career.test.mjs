import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {migrateDeveloperProjects} from '../src/app/developer-migration.js';
import {migrateWeb3Selection} from '../src/app/web3-selection-migration.js';
import {developerProjects,DEVELOPER_MARKER_ID,projectTrack} from '../src/app/developer-catalog.js';
import {builtInProjects,catalogState} from '../src/app/project-catalog.js';
const user={email:'admin@example.test'};
function fixture(initial=builtInProjects){
 const records=new Map(initial.map(project=>[project.id,{...project}]));
 const snap=id=>({id,exists:()=>records.has(id),data:()=>records.get(id)});
 const firebase={db:{},isAdmin:account=>account===user,doc:(_db,_name,id)=>({id}),collection:()=>({}),getDoc:async ref=>snap(ref.id),getDocs:async()=>({docs:[...records.keys()].map(snap)}),serverTimestamp:()=> 'now',runTransaction:async(_db,work)=>{const writes=[];const result=await work({get:async ref=>{assert.equal(writes.length,0);return snap(ref.id);},set:(ref,data,options)=>writes.push([ref.id,data,options])});for(const [id,data,options]of writes)records.set(id,options?.merge?{...records.get(id),...data}:data);return result;}};
 return {records,firebase};
}
test('brings in TrustEscrow, classifies known builds, and attaches verified source links',async()=>{
 const {records,firebase}=fixture();assert.equal(await migrateDeveloperProjects(firebase,user),1);
 assert.equal(records.get('trustescrow').track,'web3');assert.equal(records.get('judgelayer').track,'web3');assert.equal(records.get('aimabluxe').track,'web2');
 assert.equal(records.get('echomap').codeUrl,'https://github.com/maskid111/EchoMap');assert.equal(records.get('teamzadore').liveUrl,'https://teamzadore.com.ng/');
 assert.equal(records.get('maskid-portfolio').liveUrl,'https://maskidportfolio.vercel.app/');
});
test('keeps edited copy, custom destinations, drafts, and homepage choices',async()=>{
 const existing={...builtInProjects[4],name:'Custom JudgeLayer',description:'My edited description',liveUrl:'https://judgelayer.vercel.app/',published:false,featured:true,track:'web2',codeUrl:'https://github.com/custom/repo'};
 const {records,firebase}=fixture([existing]);await migrateDeveloperProjects(firebase,user);
 const updated=records.get(existing.id);for(const field of ['name','description','liveUrl','published','featured','track','codeUrl'])assert.equal(updated[field],existing[field]);
});
test('one-time upgrade does not restore deleted originals or deleted imported builds',async()=>{
 const {records,firebase}=fixture(builtInProjects.filter(p=>p.id!=='echomap'));
 await migrateDeveloperProjects(firebase,user);assert.equal(records.has('echomap'),false);records.delete('trustescrow');
 assert.equal(await migrateDeveloperProjects(firebase,user),0);assert.equal(records.has('trustescrow'),false);
});
test('unrelated record IDs do not get overwritten',async()=>{
 const unrelated={id:'trustescrow',name:'Another project',liveUrl:'https://example.com/',order:0};const {records,firebase}=fixture([unrelated]);
 await migrateDeveloperProjects(firebase,user);assert.deepEqual(records.get('trustescrow'),unrelated);assert.equal(records.get('developer-trustescrow').name,'TrustEscrow');
});
test('migration metadata never becomes a public project or statistic',()=>{
 const state=catalogState([{id:DEVELOPER_MARKER_ID,kind:'catalog-migration'},...builtInProjects]);assert.equal(state.projects.length,builtInProjects.length);
 assert.equal(catalogState([{id:DEVELOPER_MARKER_ID,kind:'catalog-migration'}]).managed,true);
});
test('legacy records classify using verified identity and explicit admin choices win',()=>{
 assert.equal(projectTrack({id:'random',liveUrl:'https://judgelayer.vercel.app/'}),'web3');assert.equal(projectTrack({track:'web2',category:'Blockchain'}),'web2');assert.equal(projectTrack({category:'Web application'}),'web2');
});
test('homepage has no portrait and About retains it; new page includes current build',async()=>{
 const home=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
 const about=await readFile(new URL('../dist/about/index.html',import.meta.url),'utf8');
 const web3=await readFile(new URL('../dist/web3/index.html',import.meta.url),'utf8');
 assert.doesNotMatch(home,/<img[^>]+src="\/assets\/ifedayo.jpg"/);assert.match(about,/<img[^>]+ifedayo-about-photo/);
 assert.match(home,/id="publishedProjectCount"/);assert.match(home,/data-developer-hero/);assert.match(web3,/Consensus Hire/);
 for(const project of developerProjects.filter(p=>p.track==='web3')){assert.ok(web3.includes(project.name));assert.ok(web3.includes(project.codeUrl));}
 for(const html of [home,about,web3])assert.ok((html.match(/href="\/web3\/"/g)||[]).length>=2);
});

test('requested Web3 selection upgrades already-imported projects without duplicates or lost edits',async()=>{
 const existing={...builtInProjects.find(project=>project.id==='seismic-flyer-generator'),id:'uploaded-seismic',track:'web2',description:'My edited description',published:false,featured:true};
 const trust={...developerProjects.find(project=>project.id==='trustescrow'),id:'uploaded-trust'};
 const {firebase,records}=fixture([existing,trust,{id:DEVELOPER_MARKER_ID,kind:'catalog-migration'}]);
 assert.equal(await migrateWeb3Selection(firebase,user),1);
 assert.equal(records.get('uploaded-seismic').track,'web3');
 assert.equal(records.get('uploaded-seismic').published,false);
 assert.equal(records.get('uploaded-seismic').featured,true);
 assert.equal(records.get('uploaded-seismic').description,'My edited description');
 assert.equal([...records.values()].filter(project=>project.liveUrl===trust.liveUrl).length,1);
 assert.equal([...records.values()].filter(project=>project.liveUrl===existing.liveUrl).length,1);
 records.get('uploaded-seismic').track='web2';
 assert.equal(await migrateWeb3Selection(firebase,user),0);
 assert.equal(records.get('uploaded-seismic').track,'web2');
});
test('requested missing Web3 projects import once and stay deleted afterward',async()=>{
 const {firebase,records}=fixture([]);
 assert.equal(await migrateWeb3Selection(firebase,user),2);
 assert.equal(records.get('seismic-flyer-generator').track,'web3');
 records.delete('trustescrow');
 assert.equal(await migrateWeb3Selection(firebase,user),0);
 assert.equal(records.has('trustescrow'),false);
});
