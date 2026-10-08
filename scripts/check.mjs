import {readFile,stat,readdir} from 'node:fs/promises';
import path from 'node:path';
const routes=JSON.parse(await readFile('routes.json','utf8'));let failures=[];
for(const route of routes){const file=path.join('dist',route,'index.html');const html=await readFile(file,'utf8');for(const match of html.matchAll(/(?:src|href)="(\/[^"#?]*)[^"]*"/g)){const url=match[1];if(url.startsWith('/wp-admin')||url.startsWith('/wp-json')){failures.push(`${route}: backend URL ${url}`);continue}try{let p=path.join('dist',decodeURIComponent(url));if((await stat(p)).isDirectory())await stat(path.join(p,'index.html'));}catch{failures.push(`${route}: missing ${url}`)}}}
console.log(`Checked ${routes.length} routes; ${failures.length} broken local references.`);if(failures.length){console.log([...new Set(failures)].join('\n'));process.exitCode=1}
