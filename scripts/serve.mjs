import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const args=process.argv.slice(2);
const portIndex=args.indexOf('--port');
const requestedPort=Number(portIndex>=0 ? args[portIndex+1] : process.env.PORT || 4185);
if(!Number.isInteger(requestedPort)||requestedPort<1||requestedPort>65535)throw Error('Please provide a valid port between 1 and 65535.');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.webp':'image/webp','.gif':'image/gif'};
function createServer(){
 return http.createServer(async(req,res)=>{
 try{
 let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)&&file!==root)throw Error('Invalid path');
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404,{'Content-Type':'text/html'});res.end('<h1>Page not found</h1><a href="/">Return home</a>');}
 });
}
function listen(port){
 const server=createServer();
 server.once('error',error=>{
  if(error.code==='EADDRINUSE'&&port<requestedPort+20){
   console.log(`Port ${port} is busy, trying ${port+1}...`);
   listen(port+1);
   return;
  }
  throw error;
 });
 server.listen(port,'0.0.0.0',()=>console.log(`\nIfedayo Portfolio\nWebsite: http://localhost:${port}/\nAdmin:   http://localhost:${port}/admin/\nServing files from: ${root}\n`));
}
listen(requestedPort);
