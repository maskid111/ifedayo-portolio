import {
 collection,
 db,
 getDocs,
 previewUrlFor,
} from './firebase-client.js';
import { catalogState } from './project-catalog.js';

const tones=['amber','rose','blue','green','violet','cyan','orange','pink'];

function escapeHtml(value){
 return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function card(project,index,mode){
 const name=escapeHtml(project.name);
 const category=escapeHtml(project.category||project.type||'Project');
 const description=escapeHtml(project.description||project.summary||'');
 const liveUrl=project.liveUrl||project.url||'#';
 const preview=previewUrlFor(project);
 const tone=project.tone||tones[index%tones.length];
 const column=mode==='home'
  ?'col-lg-6 col-md-6 col-sm-12 col-12 mt--50 mt_md--30 mt_sm--30 rb-items preview-type-image'
  :'col-lg-6 col-md-6 col-sm-12 col-12 rainbow-items mt--50 mt_md--30 mt_sm--30 preview-type-image faridmiatesting';
 const number=String(index+1).padStart(2,'0');
 return `<div class="${column}">
<div class="rn-portfolio ifedayo-project-card">
<div class="inner">
<span class="preview-type"><i class="feather-external-link"></i></span>
<div class="thumbnail">
<a href="${escapeHtml(liveUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${name}">
<div class="ifedayo-project-thumb ifedayo-tone-${escapeHtml(tone)}">
${preview?`<img class="ifedayo-project-preview" src="${escapeHtml(preview)}" alt="${name} website preview" loading="lazy"/>`:''}
<div class="ifedayo-project-overlay">
<span>${number}</span>
<strong>${name}</strong>
<small>${category}</small>
</div>
</div>
</a>
</div>
<div class="content">
<div class="category-info"><div class="category-list"><span>${category}</span></div></div>
<h4 class="title"><a href="${escapeHtml(liveUrl)}" target="_blank" rel="noopener noreferrer">${name} <i class="feather-arrow-up-right"></i></a></h4>
<p class="ifedayo-project-summary">${description}</p>
</div>
</div>
</div>
</div>`;
}

async function loadProjects(){
 const snap=await getDocs(collection(db,'projects'));
 return catalogState(snap.docs.map(doc=>({...doc.data(),id:doc.id})));
}

export async function hydrateProjects(){
 const homeContainer=document.querySelector('.rbt-portfolio-replace-area');
 const archiveContainer=document.querySelector('.project-archive-wrapper .row.row--25');
 if(!homeContainer&&!archiveContainer)return;
 const containers=[homeContainer,archiveContainer].filter(Boolean);
 const originalMarkup=containers.map(container=>container.innerHTML);
 containers.forEach(container=>{container.setAttribute('aria-busy','true');container.innerHTML='<p class="col-12">Loading projects…</p>';});
 try{
  const {projects,managed}=await loadProjects();
  if(!managed){containers.forEach((container,index)=>{container.innerHTML=originalMarkup[index];});return;}
  if(homeContainer){
   const featured=projects.filter(project=>project.featured).slice(0,4);
   homeContainer.innerHTML=featured.map((project,index)=>card(project,index,'home')).join('')||'<p class="col-12">More featured work coming soon.</p>';
  }
  if(archiveContainer)archiveContainer.innerHTML=projects.map((project,index)=>card(project,index,'projects')).join('')||'<p class="col-12">New projects coming soon.</p>';
 }catch(error){
  containers.forEach(container=>{container.innerHTML='<p class="col-12">Projects could not be loaded. Please refresh to try again.</p>';});
  console.warn('Could not load Firestore projects.',error);
 }finally{
  containers.forEach(container=>container.removeAttribute('aria-busy'));
 }
}

hydrateProjects();
