const labels={developer:'Developer',creator:'Creator',hub:'Main Hub'};
export function messageSite(message){
 if(labels[message.site])return message.site;
 try{
  const host=new URL(message.source).hostname;
  if(host==='creator.maskid.site')return 'creator';
  if(['maskid.site','www.maskid.site'].includes(host))return 'hub';
 }catch{}
 return 'developer';
}
export function messageSiteLabel(message){return labels[messageSite(message)];}
export function filterMessages(messages,{status='all',site='all'}={}){
 return messages.filter(message=>(status==='all'||(message.status==='read'?'read':'unread')===status)&&(site==='all'||messageSite(message)===site));
}
