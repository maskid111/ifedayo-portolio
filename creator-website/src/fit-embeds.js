// X embeds retain their natural layout, then scale as a unit in compact cards.
const compact=matchMedia('(max-width: 760px)');
const hosts=new Set();
function fit(host){
 if(!host.isConnected){hosts.delete(host);resize?.unobserve(host);return;}
 const slot=host.parentElement,padding=6;
 if(compact.matches){
  const width=Math.max(1,slot.clientWidth-padding*2),scale=Math.min(1,width/330);
  host.style.width='330px';host.style.position='absolute';host.style.left=padding+'px';host.style.top=padding+'px';
  host.style.transformOrigin='top left';host.style.transform='scale('+scale+')';
  slot.style.position='relative';slot.style.height=Math.ceil(host.offsetHeight*scale+padding*2)+'px';
 }else{host.style.width='';host.style.position='';host.style.left='';host.style.top='';host.style.transform='';slot.style.height='';}
}
const resize='ResizeObserver'in window?new ResizeObserver(entries=>entries.forEach(entry=>{
 const host=entry.target.classList.contains('inline-post-host')?entry.target:entry.target.querySelector('.inline-post-host');if(host)fit(host);
})):null;
export function fitEmbed(host){hosts.add(host);resize?.observe(host);resize?.observe(host.parentElement);fit(host);}
addEventListener('resize',()=>hosts.forEach(fit),{passive:true});
