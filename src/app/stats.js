const projectCount=document.querySelector('#publishedProjectCount');
const repositoryCount=document.querySelector('#githubRepositoryCount');
const contributionCount=document.querySelector('#githubContributionCount');
const githubNote=document.querySelector('#githubStatsNote');
const formatter=new Intl.NumberFormat();

function number(element,value) {
 if(element && Number.isSafeInteger(value) && value>=0)element.textContent=formatter.format(value);
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
  githubNote.textContent='GitHub totals refresh every few minutes. Only numbers are shared.';
 } catch {
  repositoryCount.textContent='—';contributionCount.textContent='—';
  githubNote.textContent='GitHub totals are currently unavailable.';
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
