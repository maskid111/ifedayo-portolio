const projectCount=document.querySelector('#publishedProjectCount');
const repositoryCount=document.querySelector('#githubRepositoryCount');
const contributionCount=document.querySelector('#githubContributionCount');
const githubNote=document.querySelector('#githubStatsNote');
const githubState=document.querySelector('#githubStatsState');
const formatter=new Intl.NumberFormat();

function number(element,value) {
 if(element && Number.isSafeInteger(value) && value>=0){element.textContent=formatter.format(value);const label=element.getAttribute('aria-label')?.split(':')[0];if(label)element.setAttribute('aria-label',label+': '+formatter.format(value));}
}
let githubLoading=false;
async function refreshGitHub() {
 if(!repositoryCount || githubLoading || document.hidden)return;
 githubLoading=true;
 try {
  const response=await fetch('/api/github-stats',{signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw Error('Unavailable');
  const totals=await response.json();
  if(![totals.repositoryCount,totals.contributionsThisYear].every(n=>Number.isSafeInteger(n)&&n>=0) || totals.year!==new Date().getUTCFullYear())throw Error('Invalid totals');
  number(repositoryCount,totals.repositoryCount);
  number(contributionCount,totals.contributionsThisYear);
  document.querySelector('#githubContributionLabel').textContent='Contributions · '+totals.year+' ↗';
  githubNote.textContent=totals.contributionsThisYear===0 ? 'GitHub reports no contributions for '+totals.year+'.' : 'Synced with GitHub. Private details stay private.';
  githubNote.title=totals.contributionsThisYear===0 ? 'This is GitHub’s calendar total for this year, not a lifetime commit count. Private activity depends on contribution visibility and token access.' : '';
  githubState.textContent='SYNCED';githubState.dataset.state='synced';
 } catch {
  repositoryCount.textContent='—';contributionCount.textContent='—';
  githubNote.textContent='GitHub connection unavailable. Showing no estimate.';
  githubState.textContent='OFFLINE';githubState.dataset.state='offline';
 } finally {githubLoading=false;}
}

refreshGitHub();
setInterval(refreshGitHub,5*60*1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshGitHub();});

if(projectCount) {
 try {
  const [{collection,db,onSnapshot},{catalogState,builtInProjects}]=await Promise.all([import('./firebase-client.js'),import('./project-catalog.js')]);
  onSnapshot(collection(db,'projects'),snapshot=>{
   const state=catalogState(snapshot.docs.map(item=>({...item.data(),id:item.id})));
   number(projectCount,state.managed?state.projects.length:builtInProjects.filter(p=>p.published).length);
  },()=>{projectCount.textContent='—';});
 } catch {projectCount.textContent='—';}
}
