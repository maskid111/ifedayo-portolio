import {postMarkup} from '../src/post-catalog.js';
import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import config from '../site.config.mjs';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const excerpt=value=>value?.length>180?value.slice(0,176).replace(/\s+\S*$/,'').trimEnd()+'…':value;
function url(value){const parsed=new URL(value);if(parsed.protocol!=='https:')throw Error('Use HTTPS destinations.');return parsed.href;}
const menuIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
function header(){const links=config.kind==='creator'?[['Work','#work'],['Services','#services'],['About','#about'],['Contact','#contact']]:[['Explore','#explore'],['About','#about'],['Contact','#contact']];
return '<a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="container header-inner"><a class="brand" href="/" aria-label="Maskid '+(config.kind==='creator'?'Creator':'Hub')+' home"><img src="/assets/logo.png" width="48" height="50" alt="Deft GFX"/><span><strong>Maskid</strong><small>'+escape(config.kind==='creator'?'Creator portfolio':'Believe in Something.')+'</small></span></a><button class="menu-toggle" data-menu-toggle aria-controls="site-navigation" aria-expanded="false" aria-label="Open navigation">'+menuIcon+'</button><nav id="site-navigation" class="site-nav" aria-label="Main navigation">'+links.map(([text,href])=>'<a href="'+href+'"'+(href==='#contact'?' class="nav-contact"':'')+'>'+text+'</a>').join('')+'</nav></div></header>';}
function footer(){return '<footer class="site-footer"><div class="container footer-inner"><p>© '+new Date().getUTCFullYear()+' Deft GFX. All rights reserved.</p><nav class="footer-links" aria-label="Other Maskid websites"><a href="'+url(config.sites.hub)+'">Main hub</a><a href="'+url(config.sites.creator)+'">Creator</a><a href="'+url(config.sites.portfolio)+'">Developer</a><a href="'+url(config.sites.trading)+'">Trading</a></nav></div></footer><p id="toast" class="toast" role="status" hidden></p>';}
function postsMarkup(posts){return posts.map(postMarkup).join('\n');}
function servicesMarkup(items){return items.map(item=>'<a class="destination-card card reveal '+escape(item.key)+'" href="'+url(item.url)+'"><div class="destination-art" aria-hidden="true">'+(item.key==='creator'?'<img src="/assets/maskid-banner.jpg" alt="" width="1280" height="492"/>':item.key==='developer'?'<img src="/assets/developer-preview.png" alt="" width="1200" height="750"/>':'<div class="market-art"><svg viewBox="0 0 24 24"><path d="M4 4v16h16M7 15l4-5 4 2 5-7"/></svg><span>CRYPTO · FOREX<br/>RESEARCH &amp; PROCESS</span></div>')+'</div><div class="destination-body"><span class="destination-domain">'+escape(new URL(item.url).hostname)+'</span><h3>'+escape(item.title)+'</h3><p>'+escape(item.description)+'</p><span class="destination-action">'+escape(item.action)+'</span></div></a>').join('\n');}
export async function build(){
 await mkdir(path.join(root,'dist'),{recursive:true});
 await cp(path.join(root,'src/assets'),path.join(root,'dist/assets'),{recursive:true});
 let html=await readFile(path.join(root,'src/index.html'),'utf8');
 const posts=config.kind==='creator'?JSON.parse(await readFile(path.join(root,'content/posts.json'),'utf8')):[];
 const services=config.kind==='hub'?JSON.parse(await readFile(path.join(root,'content/services.json'),'utf8')):[];
 const replacements={TITLE:config.title,DESCRIPTION:config.description,DOMAIN:config.domain,EMAIL:config.email,HUB_URL:config.sites.hub,CREATOR_URL:config.sites.creator,PORTFOLIO_URL:config.sites.portfolio,TRADING_URL:config.sites.trading,HEADER:header(),FOOTER:footer(),POSTS:postsMarkup(posts),DESTINATIONS:servicesMarkup(services),VIDEO_COUNT:posts.filter(p=>p.type==='video').length,THREAD_COUNT:posts.filter(p=>p.type==='thread').length,POST_COUNT:posts.length};
 html=html.replace(/\{\{([A-Z_]+)\}\}/g,(_,key)=>{if(!(key in replacements))throw Error('Unknown template '+key);return ['HEADER','FOOTER','POSTS','DESTINATIONS'].includes(key)?replacements[key]:escape(replacements[key]);});
 await writeFile(path.join(root,'dist/index.html'),html);
 await writeFile(path.join(root,'dist/styles.css'),await readFile(path.join(root,'src/styles.css')));
 await writeFile(path.join(root,'dist/app.js'),await readFile(path.join(root,'src/app.js')));
 for(const file of ['site-motion.js','motion.css','contact.js','firebase-config.js','post-catalog.js','live-posts.js','fit-embeds.js'])await cp(path.join(root,'src',file),path.join(root,'dist',file));
 await writeFile(path.join(root,'dist/robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+config.domain+'/sitemap.xml\n');
 await writeFile(path.join(root,'dist/sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+config.domain+'/</loc></url></urlset>');
 console.log('Built '+config.title);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await build();
