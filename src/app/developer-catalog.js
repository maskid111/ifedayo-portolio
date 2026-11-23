// Developer work verified against maskid.site/development on 23 November 2026.
// Creator and trading material belongs to the separate brand destinations.
export const DEVELOPER_MARKER_ID='developer-career-import-v1';
export const developerProjects=[
 {id:'echomap',name:'EchoMap',track:'web3',category:'Onchain Mapping',description:'A decentralized mapping platform where users create, store, and own location-based data onchain.',liveUrl:'https://echomapxyz.vercel.app/',codeUrl:'https://github.com/maskid111/EchoMap',stack:['Move','TypeScript','CSS'],previewPath:'/assets/project-previews/echomap.png',status:'completed',order:4,featured:false,published:true,tone:'cyan'},
 {id:'judgelayer',name:'JudgeLayer',track:'web3',category:'Decentralized AI',description:'A decentralized AI evaluation protocol. Connect a wallet, submit a project, and receive transparent consensus-based evaluation from GenLayer validators.',liveUrl:'https://judgelayer.vercel.app/',codeUrl:'https://github.com/maskid111/judgelayer',stack:['TypeScript','CSS','Python'],previewPath:'/assets/project-previews/judgelayer.png',status:'completed',order:5,featured:false,published:true,tone:'violet'},
 {id:'trustescrow',name:'TrustEscrow',track:'web3',category:'Decentralized Escrow',description:'A secure, decentralized escrow platform built on TRUST.',liveUrl:'https://trustescrow.intuition.box/',codeUrl:'https://github.com/intuition-box/TrustEscrow',stack:['TypeScript','CSS','Solidity','JavaScript'],previewPath:'/assets/project-previews/trustescrow.jpg',status:'completed',order:6,featured:false,published:true,tone:'blue'},
 {id:'maskid-portfolio',name:'Maskid Portfolio',track:'web2',liveUrl:'https://maskidportfolio.vercel.app/',aliases:['https://maskid.site','https://www.maskid.site/'],codeUrl:'https://github.com/maskid111/my-portfolio',stack:['TypeScript','CSS','JavaScript']},
 {id:'seismic-flyer-generator',name:'Seismic Flyer Generator',track:'web2',liveUrl:'https://seismicflyer.vercel.app/',codeUrl:'https://github.com/maskid111/seismicflyer',stack:['HTML','CSS']},
 {id:'aimabluxe',name:'Aimabluxe',track:'web2',liveUrl:'https://www.aimabluxe.com/',codeUrl:'https://github.com/maskid111/Aimab-Luxe',stack:['HTML','CSS','JavaScript','TypeScript']},
 {id:'malete-hostel',name:'Malete Hostel',track:'web2',liveUrl:'https://maletehostel.com.ng/',aliases:['https://maskid111.github.io/maletehostel/'],codeUrl:'https://github.com/maskid111/maletehostel',stack:['HTML']},
 {id:'teamzadore',name:'Teamzadore',track:'web2',liveUrl:'https://teamzadore.com.ng/',aliases:['https://deftgfx.github.io/Teamz-Adore/'],codeUrl:'https://github.com/deftgfx/Teamz-Adore',stack:['HTML','JavaScript']},
];

export const currentBuild={name:'Consensus Hire',status:'In development',ecosystem:'GenLayer',description:'An AI validator consensus product for job matching, candidate evaluation, and hiring recommendations.'};

export function normalizeProjectUrl(value){try{const u=new URL(value);u.hash='';return u.href.replace(/\/$/,'').toLowerCase();}catch{return '';}}
export function projectTrack(project){
 if(['web2','web3'].includes(project.track))return project.track;
 const url=normalizeProjectUrl(project.liveUrl||project.url);
 const known=developerProjects.find(item=>item.track==='web3'&&(item.id===project.id||normalizeProjectUrl(item.liveUrl)===url));
 return known || /blockchain|web3|onchain|decentraliz|smart contract/i.test(project.category||project.type||'') ? 'web3':'web2';
}
export function isCatalogMetadata(project){return project.kind==='catalog-migration'||['portfolio-catalog-migration-v1',DEVELOPER_MARKER_ID].includes(project.id);}
