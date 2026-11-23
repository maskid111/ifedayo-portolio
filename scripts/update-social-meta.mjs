import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const siteOrigin='https://portfolio.maskid.site';
export const shareImage=siteOrigin+'/assets/website-preview-v2.jpg';
const description='Explore Adeyemo Muiz Ifedayo’s developer portfolio: websites, full-stack applications, and Web3 builds with working demos and source code.';
const escape=value=>value.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');

export function socialMetadata(html,route) {
 const title=html.match(/<title>([^<]*)<\/title>/i)?.[1]||'Deft GFX — Portfolio';
 // Set explicit crawler metadata so platforms do not choose the portrait image.
 html=html.replace(/<meta\b[^>]*(?:property|name)=["'](?:og:[^"']+|twitter:[^"']+|description)["'][^>]*>\s*/gi,'')
  .replace(/<link\b[^>]*rel=["'](?:canonical|image_src)["'][^>]*>\s*/gi,'');
 const tags=[
  ['name','description',description],['property','og:type','website'],
  ['property','og:site_name','Deft GFX'],['property','og:title',title],
  ['property','og:description',description],['property','og:url',new URL(route,siteOrigin).href],
  ['property','og:image',shareImage],['property','og:image:secure_url',shareImage],
  ['property','og:image:type','image/jpeg'],['property','og:image:width','1185'],['property','og:image:height','622'],
  ['property','og:image:alt','Deft GFX portfolio website showing featured projects'],
  ['name','twitter:card','summary_large_image'],['name','twitter:title',title],
  ['name','twitter:description',description],['name','twitter:image',shareImage],
  ['name','twitter:image:alt','Deft GFX portfolio website showing featured projects'],
 ].map(([attribute,key,value])=>`<meta ${attribute}="${key}" content="${escape(value)}"/>`).join('\n');
 return html.replace('</head>',`<link rel="canonical" href="${new URL(route,siteOrigin).href}"/>\n${tags}\n</head>`);
}

export async function updateSocialMetadata() {
 const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
 const routes=JSON.parse(await readFile(path.join(root,'routes.json'),'utf8'));
 for(const route of routes.filter(route=>route!=='/admin/')){
  const file=path.join(root,'dist',route,'index.html');
  await writeFile(file,socialMetadata(await readFile(file,'utf8'),route));
 }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await updateSocialMetadata();
