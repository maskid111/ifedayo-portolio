import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {socialMetadata,shareImage} from '../scripts/update-social-meta.mjs';

test('sharing metadata is absolute, names the website, and avoids the portrait',()=>{
 const html=socialMetadata('<html><head><title>Deft GFX</title></head><body></body></html>','/projects/');
 assert.match(html,/property="og:url" content="https:\/\/portfolio.maskid.site\/projects\/"/);
 assert.ok(html.includes('property="og:image" content="'+shareImage+'"'));
 assert.match(html,/name="twitter:card" content="summary_large_image"/);
 assert.doesNotMatch(html,/ifedayo\.jpg/);
});
test('regeneration replaces stale sharing metadata without duplicates',()=>{
 const old='<head><title>Deft GFX</title><meta content="portrait.jpg" property="og:image"/><meta name="twitter:image" content="portrait.jpg"/><link rel="canonical" href="https://old.test"/></head>';
 const once=socialMetadata(old,'/');
 const twice=socialMetadata(once,'/');
 assert.equal((twice.match(/property="og:image" /g)||[]).length,1);
 assert.equal((twice.match(/rel="canonical"/g)||[]).length,1);
 assert.doesNotMatch(twice,/portrait\.jpg|old\.test/);
});
test('every public route contains the website preview image',async()=>{
 const routes=JSON.parse(await readFile(new URL('../routes.json',import.meta.url),'utf8'));
 for(const route of routes.filter(route=>route!=='/admin/')){
  const html=await readFile(new URL('../dist'+route+'index.html',import.meta.url),'utf8');
  assert.ok(html.includes(shareImage),route);
  assert.equal((html.match(/property="og:image" /g)||[]).length,1,route);
 }
 const image=await readFile(new URL('../dist/assets/website-preview-v2.jpg',import.meta.url));
 assert.equal(image[0],0xff);assert.equal(image[1],0xd8);
});
