"""Localize remaining runtime configuration and apply shared accessibility repairs."""
import json,re,shutil
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'dist'
for file in OUT.rglob('index.html'):
 if 'qa' in file.parts:continue
 s=BeautifulSoup(file.read_text(),'html.parser')
 for link in s.select('link'):
  if link.get('as')=='script':link.decompose()
  elif link.get('rel')==['canonical']:link['href']='https://dawatech-recreation.coolcod8.chatgpt.site/'+file.relative_to(OUT).as_posix().removesuffix('index.html')
 for el in s.select('script:not([src])'):
  txt=el.get_text()
  if 'wp-emoji' in txt:el.decompose();continue
  txt=txt.replace('https://dawatechonline.com/','/').replace('https:\\/\\/dawatechonline.com\\/','\\/')
  txt=re.sub(r'"(?:endpoint|ajaxUrl|ajaxurl)":"[^"]+"',lambda m:m[0].split(':',1)[0]+':""',txt)
  if txt:el.string=txt
 for a in s.select('a.like-button'):a['href']='#';a['role']='button';a['aria-label']='Like this project'
 for a in s.select('a[href=""]'):a['href']='/'
 for el in s.select('.hamberger-menu'):
  el['role']='button';el['tabindex']='0';el['aria-label']='Open mobile menu';el['aria-expanded']='false'
 for el in s.select('button.close-menu-activation'):el['aria-label']='Close mobile menu'
 for el in s.select('.close-menu .closeTrigger'):
  el['role']='button';el['tabindex']='0';el['aria-label']='Close mobile menu'
 file.write_text(str(s))
for p in (ROOT/'src/app').glob('*'):shutil.copy2(p,OUT/'app'/p.name)
p=OUT/'wp-content/plugins/rainbow-elements/assets/js/element-scripts.js';s=p.read_text()
if '    var portfolio_ajax =' in s:
 start=s.index('    var portfolio_ajax =');end=s.index('    // Init',start);s=s[:start]+'    var portfolio_ajax = function() {};\n\n'+s[end:];p.write_text(s)
p=OUT/'wp-content/themes/inbio/assets/js/has-elementor.js';p.write_text(p.read_text().replace('Theme.likeit();','').replace('Theme.likeit2();',''))
report=json.loads((ROOT/'asset-report.json').read_text())
for p in OUT.rglob('*.css'):
 s=p.read_text()
 for f in report['failures']:s=s.replace('url('+f['url'].replace('https://dawatechonline.com','')+')','none')
 p.write_text(s)
