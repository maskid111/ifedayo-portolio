import test from 'node:test';
import assert from 'node:assert/strict';
import {createGitHubStatsHandler} from '../api/github-stats.js';

function response(){return {headers:{},setHeader(name,value){this.headers[name]=value;},end(body){this.body=body;}};}
const date=new Date('2026-11-03T12:00:00Z');
function fixture({count=42,contributions=318,login='maskid111',errors,...extra}={}){
 return {data:{viewer:{login,repositories:{totalCount:count,privateName:'never-expose-this'},contributionsCollection:{contributionCalendar:{totalContributions:contributions}},...extra}},errors};
}
function setup(result=fixture()){
 const calls=[];
 const handler=createGitHubStatsHandler({getToken:()=> 'private-test-token',now:()=>date,fetchImpl:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>result};}});
 return {handler,calls};
}
test('only aggregate totals and a timestamp reach visitors',async()=>{
 const {handler,calls}=setup();const res=response();await handler({method:'GET',url:'/?username=someone-else'},res);
 assert.equal(res.statusCode,200);
 assert.deepEqual(JSON.parse(res.body),{repositoryCount:42,contributionsThisYear:318,year:2026,updatedAt:date.toISOString()});
 assert.doesNotMatch(res.body,/private-test-token|never-expose-this|maskid111|repositories/);
 assert.equal(calls[0].options.headers.Authorization,'Bearer private-test-token');
 const request=JSON.parse(calls[0].options.body);
 assert.equal(request.variables.from,'2026-01-01T00:00:00.000Z');
 assert.equal(request.variables.to,date.toISOString());
 assert.match(request.query,/ownerAffiliations: \[OWNER\]/);
 assert.doesNotMatch(request.query,/nodes|edges|\.\.\.|\bname\b|\bcontents\b/);
});
test('a missing token makes no GitHub request and fabricates no totals',async()=>{
 const handler=createGitHubStatsHandler({getToken:()=>'',fetchImpl:()=>{throw Error('Must not fetch');}});
 const res=response();await handler({method:'GET'},res);
 assert.equal(res.statusCode,503);assert.deepEqual(JSON.parse(res.body),{error:'not_configured'});assert.equal(res.headers['Cache-Control'],'no-store');
});
test('rejects tokens belonging to another account',async()=>{
 const {handler}=setup(fixture({login:'another-account'}));const res=response();await handler({method:'GET'},res);
 assert.equal(res.statusCode,503);assert.equal(res.body,'{"error":"unavailable"}');
});
test('does not expose upstream errors or a partial response',async()=>{
 const {handler}=setup(fixture({errors:[{message:'sensitive repository information'}]}));const res=response();await handler({method:'GET'},res);
 assert.equal(res.statusCode,503);assert.doesNotMatch(res.body,/sensitive|repositoryCount/);
});
test('reuses successful totals within the cache period',async()=>{
 const {handler,calls}=setup();await handler({method:'GET'},response());await handler({method:'GET'},response());assert.equal(calls.length,1);
});
test('coalesces concurrent requests',async()=>{
 const {handler,calls}=setup();await Promise.all([handler({method:'GET'},response()),handler({method:'GET'},response())]);assert.equal(calls.length,1);
});
test('rejects invalid numeric results but accepts genuine zero values',async()=>{
 for(const count of [-1,'42',null]){const {handler}=setup(fixture({count}));const res=response();await handler({method:'GET'},res);assert.equal(res.statusCode,503);}
 const {handler}=setup(fixture({count:0,contributions:0}));const res=response();await handler({method:'GET'},res);assert.equal(res.statusCode,200);assert.equal(JSON.parse(res.body).repositoryCount,0);
});
test('unsupported methods are rejected without calling GitHub',async()=>{
 const {handler,calls}=setup();const res=response();await handler({method:'POST'},res);assert.equal(res.statusCode,405);assert.equal(calls.length,0);
});
test('network failures return only a generic error',async()=>{
 const handler=createGitHubStatsHandler({getToken:()=> 'secret',fetchImpl:async()=>{throw Error('secret details');}});const res=response();await handler({method:'GET'},res);assert.equal(res.statusCode,503);assert.equal(res.body,'{"error":"unavailable"}');
});
