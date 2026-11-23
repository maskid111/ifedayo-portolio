import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {developerHero,web3Teaser,web3PageContent} from '../src/app/developer-home.js';
import {updateSocialMetadata} from './update-social-meta.mjs';

const root=process.cwd();
function matching(html,start,tag){const pattern=new RegExp('<\\/?'+tag+'\\b[^>]*>','gi');pattern.lastIndex=start;let depth=0,match;while((match=pattern.exec(html))){depth+=match[0].startsWith('</')?-1:1;if(depth===0)return pattern.lastIndex;}throw Error('Missing closing '+tag);}
function replaceElement(html,pattern,tag,replacement){const match=pattern.exec(html);if(!match)throw Error('Missing '+pattern);return html.slice(0,match.index)+replacement+html.slice(matching(html,match.index,tag));}
const homeFile=path.join(root,'dist/index.html');
let home=await readFile(homeFile,'utf8');
home=replaceElement(home,/<section\b[^>]*id="home"[^>]*>/,'section',developerHero);
if(home.includes('id="onchain"'))home=replaceElement(home,/<section\b[^>]*id="onchain"[^>]*>/,'section',web3Teaser);
else{const match=/<section\b[^>]*id="portfolio"[^>]*>/.exec(home);const end=matching(home,match.index,'section');home=home.slice(0,end)+'\n'+web3Teaser+home.slice(end);}
home=home.replace('Some projects I\'ve worked on.','WEB2 / WEBSITES &amp; APPLICATIONS').replace('Selected Projects','Selected Web2 projects');
await writeFile(homeFile,home);

const projectsFile=path.join(root,'dist/projects/index.html');
const projectHtml=await readFile(projectsFile,'utf8');
if(!await readFile(path.join(root,'dist/web3/index.html'),'utf8').catch(()=>'')){
 const match=/<div class="portfolio-style-three rainbow-blog-area rn-section-gap">/.exec(projectHtml);
 const web3=projectHtml.slice(0,match.index)+web3PageContent()+projectHtml.slice(matching(projectHtml,match.index,'div'));
 await mkdir(path.join(root,'dist/web3'),{recursive:true});
 await writeFile(path.join(root,'dist/web3/index.html'),web3.replace(/<title>[^<]*<\/title>/,'<title>Web3 Projects — Adeyemo Muiz Ifedayo</title>'));
}else{
 const file=path.join(root,'dist/web3/index.html');const current=await readFile(file,'utf8');await writeFile(file,replaceElement(current,/<main class="web3-page">/,'main',web3PageContent()));
}
const routesFile=path.join(root,'routes.json');const routes=JSON.parse(await readFile(routesFile,'utf8'));if(!routes.includes('/web3/'))routes.splice(routes.indexOf('/projects/')+1,0,'/web3/');await writeFile(routesFile,JSON.stringify(routes,null,2)+'\n');
const navItems=[['Home','/'],['Projects','/projects/'],['Web3','/web3/'],['Contact','/contact/'],['About Me','/about/']];
for(const route of routes.filter(route=>route!=='/admin/')){
 const file=path.join(root,'dist',route,'index.html');let html=await readFile(file,'utf8');
 for(const id of ['menu-nav-menu','menu-nav-menu-1']){
  const matcher=new RegExp('(<ul[^>]*id="'+id+'"[^>]*>)[\\s\\S]*?<\\/ul>');
  html=html.replace(matcher,(_,open)=>open+navItems.map(([label,href])=>`<li class="menu-item${route===href?' current-menu-item':''}"><a${route===href?' aria-current="page"':''} href="${href}">${label}</a></li>`).join('')+'</ul>');
 }
 if(!html.includes('/assets/developer-portfolio.css'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/developer-portfolio.css"/>\n</head>');
 await writeFile(file,html);
}
const aboutFile=path.join(root,'dist/about/index.html');let about=await readFile(aboutFile,'utf8');
about=about.replace(/<p class="p1"(?: data-developer-about)?>[\s\S]*?<\/p>/,`<p class="p1" data-developer-about>I’m <strong>Adeyemo Muiz Ifedayo</strong>, a Full-Stack Developer and Blockchain Builder, also known as Maskid. I hold a <strong>BSc in Computer Science</strong> and enjoy taking ideas from an early concept to a product people can use.<br/><br/>My development work spans ecommerce, student housing, frontend products, and blockchain applications. I care about clear interfaces, sensible product flows, and the systems that make an experience work.<br/><br/>On the Web3 side, my work includes decentralized mapping with EchoMap, AI evaluation with JudgeLayer, and decentralized escrow with TrustEscrow. I’m currently building <strong>Consensus Hire</strong>, exploring AI validator consensus for hiring recommendations on GenLayer.<br/><br/>I’m always learning and building. My focus is to create useful products, make complex technology approachable, and <strong>build things that matter.</strong></p>`);
await writeFile(aboutFile,about);
await updateSocialMetadata();
console.log('Updated developer homepage, About, navigation, and Web3 page.');
