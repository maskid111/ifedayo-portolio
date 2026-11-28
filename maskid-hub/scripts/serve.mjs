import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import config from '../site.config.mjs';
import {build} from './build.mjs';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const args=process.argv.slice(2),portFlag=args.indexOf('--port');
const requested=Number(portFlag>=0?args[portFlag+1]:process.env.PORT||config.port);
if(!Number.isInteger(requested)||requested<1||requested>65535)throw Error('Please provide a valid port.');
const vercel=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
await build();
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.ttf':'font/ttf','.xml':'application/xml','.txt':'text/plain'};
const request=async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const redirect=vercel.redirects?.find(item=>item.source===pathname||item.source.endsWith('/:path*')&&pathname.startsWith(item.source.slice(0,-8)+'/'));
 if(redirect){res.writeHead(redirect.permanent?308:307,{Location:redirect.destination.replace('/:path*','/')});res.end();return;}
 let file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)&&file!==root)throw Error('Invalid path');
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
 }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end('<h1>Page not found</h1><a href="/">Return home</a>');}};
function listen(port){const server=http.createServer(request);server.once('error',error=>{if(error.code==='EADDRINUSE'&&port<requested+10){console.log('Port '+port+' is busy. Trying '+(port+1));listen(port+1);}else throw error;});server.listen(port,'0.0.0.0',()=>console.log(config.title+'\nLocal: http://localhost:'+port+'/'));}
listen(requested);
