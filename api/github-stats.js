// This module runs on the server only. Never import it into browser code.
const GITHUB_USERNAME = 'maskid111';
const query = `query PortfolioStats($from: DateTime!, $to: DateTime!) {
 viewer {
  login
  repositories(ownerAffiliations: [OWNER]) { totalCount }
  contributionsCollection(from: $from, to: $to) {
   contributionCalendar { totalContributions }
  }
 }
}`;

export function createGitHubStatsHandler({fetchImpl=fetch, getToken=()=>process.env.GITHUB_STATS_TOKEN, now=()=>new Date()}={}) {
 let cache=null, pending=null;
 async function collect(token, date) {
  const year=date.getUTCFullYear();
  const response=await fetchImpl('https://api.github.com/graphql', {
   method:'POST',
   headers:{Authorization:`Bearer ${token}`, 'Content-Type':'application/json', 'User-Agent':'Deft-GFX-Portfolio'},
   body:JSON.stringify({query,variables:{from:new Date(Date.UTC(year,0,1)).toISOString(),to:date.toISOString()}}),
   signal:AbortSignal.timeout(10000),
  });
  if(!response.ok)throw Error('GitHub unavailable');
  const result=await response.json();
  const viewer=result.data?.viewer;
  if(result.errors?.length || viewer?.login?.toLowerCase()!==GITHUB_USERNAME)throw Error('Unexpected GitHub response');
  const repositoryCount=viewer.repositories?.totalCount;
  const contributionsThisYear=viewer.contributionsCollection?.contributionCalendar?.totalContributions;
  if(![repositoryCount,contributionsThisYear].every(n=>Number.isSafeInteger(n)&&n>=0))throw Error('Invalid totals');
  // Deliberately return only aggregate numbers, never raw API data or errors.
  return {repositoryCount,contributionsThisYear,year,updatedAt:date.toISOString()};
 }
 return async function githubStats(req,res) {
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(!['GET','HEAD'].includes(req.method)) {
   res.setHeader('Allow','GET, HEAD');res.setHeader('Cache-Control','no-store');res.statusCode=405;res.end(JSON.stringify({error:'method_not_allowed'}));return;
  }
  const token=getToken()?.trim();
  if(!token) {cache=null;res.setHeader('Cache-Control','no-store');res.statusCode=503;res.end(req.method==='HEAD'?'':JSON.stringify({error:'not_configured'}));return;}
  try {
   const date=now();
   if(!cache || cache.year!==date.getUTCFullYear() || date.getTime()-Date.parse(cache.updatedAt)>=60000) {
    if(!pending)pending=collect(token,date).then(result=>{cache=result;return result;}).finally(()=>{pending=null;});
    await pending;
   }
   res.setHeader('Cache-Control','public, max-age=0, s-maxage=300');
   res.statusCode=200;res.end(req.method==='HEAD'?'':JSON.stringify(cache));
  } catch {
   res.setHeader('Cache-Control','no-store');res.statusCode=503;res.end(req.method==='HEAD'?'':JSON.stringify({error:'unavailable'}));
  }
 };
}

export default createGitHubStatsHandler();
