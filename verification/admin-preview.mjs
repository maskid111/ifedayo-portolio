// Isolated UI verification server. Uses in-memory fixtures, never Firebase.
// This folder is excluded from Vercel deployments.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const mock=`
export const auth={},db={},googleProvider={};
export const isAdmin=user=>!!user;
const user={email:'preview@example.test',displayName:'Ifedayo Preview'};
let authCallback;
const listeners=new Map();
const stamp={toDate:()=>new Date('2026-11-03T10:30:00Z')};
const projects=[
 {id:'aimabluxe',name:'Aimabluxe',category:'E-commerce',description:'A premium hair shopping experience with a considered visual identity.',liveUrl:'https://www.aimabluxe.com/',previewUrl:'/assets/project-previews/aimabluxe.png',order:0,featured:true,published:true},
 {id:'teamzadore',name:'Teamzadore',category:'Brand website',description:'A fashion storefront designed to help a distinctive brand find its audience.',liveUrl:'https://deftgfx.github.io/Teamz-Adore/',previewUrl:'/assets/project-previews/teamzadore.png',order:1,featured:true,published:true},
 {id:'judgelayer',name:'JudgeLayer',category:'Web application',description:'A focused experience for exploring ideas and bringing decisions together.',liveUrl:'https://judgelayer.vercel.app/',previewUrl:'/assets/project-previews/judgelayer.png',order:2,featured:false,published:false}
];
const messages=[{id:'message-1',name:'Preview visitor',email:'visitor@example.test',subject:'Let’s build something together',message:'Hello Ifedayo! I enjoyed exploring your work. I would love to discuss an upcoming website project.',status:'unread',createdAt:stamp}];
const data={projects,messages};
export function onAuthStateChanged(a,callback){authCallback=callback;callback(user);}
export async function signInWithPopup(){authCallback(user);}
export async function signOut(){authCallback(null);}
export const collection=(db,name)=>({name});
export const doc=(source,name,id)=>({name:source.name||name,id:source.name?(name||crypto.randomUUID()):id});
export const query=ref=>ref;
export const orderBy=()=>null;
const snapshot=id=>{const value=projects.find(project=>project.id===id);return {id,exists:()=>!!value,data:()=>value};};
export const getDoc=async ref=>snapshot(ref.id);
export const getDocs=async()=>({docs:projects.map(project=>snapshot(project.id))});
export async function runTransaction(db,work){const writes=[];const result=await work({get:async ref=>snapshot(ref.id),set:(ref,value)=>writes.push([ref,value])});for(const [ref,value]of writes){const old=projects.find(project=>project.id===ref.id);if(old)Object.assign(old,value);else projects.push({...value,id:ref.id});}emit('projects');return result;}
function emit(name){listeners.get(name)?.({docs:data[name].filter(p=>name!=='projects'||p.order!==undefined).map(p=>({id:p.id,data:()=>p}))});}
export function onSnapshot(ref,callback){listeners.set(ref.name,callback);emit(ref.name);return ()=>listeners.delete(ref.name);}
export const serverTimestamp=()=>stamp;
export async function setDoc(ref,payload){const existing=data[ref.name].find(p=>p.id===ref.id);if(existing)Object.assign(existing,payload);else data[ref.name].push({...payload,id:ref.id});emit(ref.name);}
export async function updateDoc(ref,payload){return setDoc(ref,payload);}
export async function deleteDoc(ref){const list=data[ref.name];list.splice(list.findIndex(p=>p.id===ref.id),1);emit(ref.name);}
export const previewUrlFor=project=>project.previewUrl||project.previewPath||'https://example.test/preview.png';
`;
http.createServer(async(req,res)=>{
 try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/app/firebase-client.js'){res.setHeader('Content-Type','text/javascript');res.end(mock);return;}
  const relative=pathname.endsWith('/')?pathname+'index.html':pathname;
  const file=path.resolve(root,'.'+decodeURIComponent(relative));
  if(!file.startsWith(root+path.sep))throw Error('Invalid path');
  const content=await readFile(file);
  const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png'};
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(content);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(4190,'127.0.0.1',()=>console.log('Isolated admin verification: http://localhost:4190/admin/'));
