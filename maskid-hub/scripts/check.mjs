import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const html=await readFile(path.join(root,'index.html'),'utf8');
const failures=[];
for(const match of html.matchAll(/(?:src|href)="(\/[^"#?]*)[^"]*"/g)){const target=path.join(root,match[1]);try{if((await stat(target)).isDirectory())await stat(path.join(target,'index.html'));}catch{failures.push('Missing asset: '+match[1]);}}
for(const match of html.matchAll(/href="#([^"]+)"/g)){if(!html.includes('id="'+match[1]+'"'))failures.push('Missing section: '+match[1]);}
if(/\{\{[A-Z_]+\}\}/.test(html))failures.push('Unfilled template.');
if(!html.includes('name="viewport"')||!html.includes('property="og:image"'))failures.push('Missing page metadata.');
const css=await readFile(path.join(root,'styles.css'),'utf8');
for(const match of css.matchAll(/url\(['"]?(\/[^)'"]+)/g)){try{await stat(path.join(root,match[1]));}catch{failures.push('Missing font: '+match[1]);}}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}else console.log('Checked assets, sections, fonts, and sharing metadata.');
