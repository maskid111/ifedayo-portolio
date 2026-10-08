"""Rebuild the reference's public routes with shared, local theme assets."""
import concurrent.futures, hashlib, json, re
from pathlib import Path
from urllib.parse import urljoin,urlsplit,unquote
import requests
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'dist'; BASE='https://dawatechonline.com/'
pages={}; pending=[BASE]; assets={}; failures=[]
def asset(url,base=BASE):
 u=urljoin(base,url)
 if not u.startswith('http'):return url
 parts=urlsplit(u)
 if parts.netloc=='dawatechonline.com': local='/'+unquote(parts.path).lstrip('/')
 else: local='/assets/external/'+hashlib.sha1(u.encode()).hexdigest()[:16]+('.css' if 'fonts.googleapis.com' in u else Path(parts.path).suffix or '.bin')
 assets.setdefault(u,local)
 return local
while pending:
 u=pending.pop(0)
 if u in pages:continue
 r=requests.get(u,timeout=45);r.raise_for_status();s=BeautifulSoup(r.text,'html.parser');pages[u]=s
 for a in s.select('a[href]'):
  dest=urljoin(u,a['href']);p=urlsplit(dest)
  if p.netloc=='dawatechonline.com' and not p.query and (p.path in ['/','/about/','/projects/','/contact/'] or (p.path.startswith('/projects/') and not Path(p.path.rstrip('/')).suffix)):
   dest=BASE.rstrip('/')+p.path
   if dest not in pages and dest not in pending:pending.append(dest)
 print('PAGE',u,flush=True)
for u,s in pages.items():
 for el in s.select('script'):
  src=el.get('src','');txt=el.get_text()
  if any(k in src for k in ['contact-form-7','recaptcha','stats.wp.com','ajax-scripts.js','email-decode','wp-emoji','lazyload.min.js']) or any(k in txt for k in ['wpcf7','_stq','wpEmoji','wp-emoji-settings','LazyLoad::Initialized']) or el.get('type')=='speculationrules':el.decompose()
 for el in s.select('link'):
  if el.get('rel') in [['stylesheet'],['icon'],['apple-touch-icon']]:el['href']=asset(el['href'],u)
  elif el.get('rel') in [['https://api.w.org/'],['EditURI'],['shortlink'],['alternate'],['preconnect'],['dns-prefetch']]:el.decompose()
 for el in s.select('[src]'):
  if el['src'].startswith(('http','/')):el['src']=asset(el['src'],u)
 for el in s.select('img'):
  if el.get('data-src'):el['src']=asset(el['data-src'],u);del el['data-src']
  for name in ['srcset','data-srcset']:
   if el.get(name):
    el['srcset']=', '.join(asset(z.strip().split()[0],u)+' '+ ' '.join(z.strip().split()[1:]) for z in el[name].split(','));
    if name=='data-srcset':del el[name]
  el['loading']='lazy';el['decoding']='async'
  el['class']=[x for x in el.get('class',[]) if x!='lazy']
 for a in s.select('a[href]'):
  v=a['href'];p=urlsplit(urljoin(u,v))
  if '/cdn-cgi/l/email-protection' in v:a['href']='mailto:hello@dawatechonline.com'
  elif p.netloc=='dawatechonline.com':
   if '/wp-content/' in p.path:a['href']=asset(v,u)
   else:a['href']=p.path+ ('#'+p.fragment if p.fragment else '')
 for el in s.select('[style]'):
  el['style']=re.sub(r'url\([\"\']?([^\)\"\']+)[\"\']?\)',lambda m:'url('+asset(m[1],u)+')',el['style'])
 for st in s.select('style'):
  st.string=re.sub(r'url\([\"\']?([^\)\"\']+)[\"\']?\)',lambda m:'url('+asset(m[1],u)+')',st.get_text())
 # Preserve reference interactions; replace only unavailable network services.
 for el in s.select('form.wpcf7-form'):
  el['action']='#';el['data-local-contact']='true'
  for h in el.select('input[type=hidden]'):h.decompose()
  for field in el.select('input,textarea'):
   if 'wpcf7-validates-as-required' in field.get('class',[]):field['required']=''
 for a in s.select('a.like-button'):a['role']='button';a['aria-label']='Like this project'
 for el in s.select('.portfolio-password-protected-field'):el['aria-label']='Open password protected project'
 sc=s.new_tag('script',src='/app/interactions.js',type='module');s.body.append(sc)
 p=OUT/urlsplit(u).path.lstrip('/')/'index.html';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(str(s))
(ROOT/'routes.json').write_text(json.dumps([urlsplit(u).path for u in pages],indent=2))
seen=set()
def download(item):
 u,local=item;p=OUT/local.lstrip('/');p.parent.mkdir(parents=True,exist_ok=True)
 try:
  r=requests.get(u,timeout=50);r.raise_for_status();data=r.content
  if local.endswith('.css'):
   txt=r.text
   txt=re.sub(r'url\([\"\']?([^\)\"\']+)[\"\']?\)',lambda m:m[0] if m[1].startswith(('data:','#')) else 'url('+asset(m[1],u)+')',txt)
   data=txt.encode()
  p.write_bytes(data)
 except Exception as e:failures.append({'url':u,'error':str(e)})
while True:
 batch=[(u,v) for u,v in list(assets.items()) if u not in seen]
 if not batch:break
 seen.update(u for u,v in batch)
 with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:list(ex.map(download,batch))
 print('ASSETS',len(seen),'failures',len(failures),flush=True)
(ROOT/'asset-report.json').write_text(json.dumps({'count':len(seen),'failures':failures},indent=2))
