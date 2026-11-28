export const CREATOR_MARKER='__creator_catalog_v1';
export function parsePostUrl(value){
 try{const url=new URL(value);if(url.protocol!=='https:'||!['x.com','www.x.com','twitter.com','www.twitter.com'].includes(url.hostname))return null;
 const match=url.pathname.match(/^\/(?:[A-Za-z0-9_]+\/status|i\/web\/status)\/(\d{15,22})(?:\/.*)?$/);
 return match?{postId:match[1],url:'https://x.com/i/web/status/'+match[1]}:null;
 }catch{return null;}
}
export function publicPosts(records){return records.filter(p=>p.published===true&&['video','thread'].includes(p.type)&&parsePostUrl(p.url)).sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0)||String(a.id).localeCompare(String(b.id)));}
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function postMarkup(post){
 const link=parsePostUrl(post.url);if(!link||!['video','thread'].includes(post.type))return '';
 const title=post.title||'Featured '+post.type;
 return '<article class="content-card card in-view" data-post-type="'+post.type+'" data-post-search="'+escape((title+' '+(post.text||'')+' '+(post.excerpt||'')).toLowerCase())+'"><div class="inline-post-preview" data-inline-post="'+link.postId+'" aria-label="Embedded X post"><p class="inline-post-status" role="status">Loading post preview…</p><div class="inline-post-host"></div></div><div class="content-poster '+post.type+'"><div class="poster-top"><span>'+escape(post.type==='video'?'Video':'Thread')+'</span><span>@deft_gfx</span></div><h3>'+escape(title)+'</h3></div><div class="content-card-body"><p>'+escape(post.excerpt||'Explore this post on X.')+'</p><div class="content-card-actions"><button class="text-button" type="button" data-preview-post="'+link.postId+'" data-post-title="'+escape(title)+'" data-post-url="'+escape(link.url)+'">Preview post</button><a href="'+escape(link.url)+'" target="_blank" rel="noopener noreferrer">'+(post.type==='video'?'Watch on X':'Read on X')+'</a></div></div></article>';
}
