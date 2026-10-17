import {readAchievements, type Progress} from './steam';
export type Position='top-left'|'top-center'|'top-right'|'middle-left'|'center'|'middle-right'|'bottom-left'|'bottom-center'|'bottom-right';
export type Settings={pagePosition:Position;capsulePosition:Position;showPage:boolean;showCapsule:boolean;showUpNext:boolean};
export const defaults:Settings={pagePosition:'top-center',capsulePosition:'top-left',showPage:true,showCapsule:true,showUpNext:false};
const key='saychieves.settings.v1';
export function load():Settings {try{return {...defaults,...JSON.parse(localStorage.getItem(key)||'{}')}}catch{return {...defaults}}}
export function save(s:Settings){localStorage.setItem(key,JSON.stringify(s));window.dispatchEvent(new Event('saychieves-settings'));}
const css=`
.saychieves-anchor{position:relative!important}
.saychieves-overlay{position:absolute;z-index:12;pointer-events:none;color:white;font:700 12px system-ui,sans-serif;max-width:calc(100% - 12px)}
.saychieves-overlay[data-pos^="top"]{top:6px}.saychieves-overlay[data-pos^="middle"],.saychieves-overlay[data-pos="center"]{top:50%;transform:translateY(-50%)}.saychieves-overlay[data-pos^="bottom"]{bottom:6px}
.saychieves-overlay[data-pos$="left"]{left:6px}.saychieves-overlay[data-pos$="right"]{right:6px}
.saychieves-overlay[data-pos$="center"],.saychieves-overlay[data-pos="center"]{left:50%;transform:translateX(-50%)}
.saychieves-overlay[data-pos="center"]{transform:translate(-50%,-50%)}
.saychieves-badge{background:rgba(0,0,0,.72);border:1px solid #638095;box-shadow:0 2px 8px #0008;padding:6px 9px;display:flex;align-items:center;justify-content:center;gap:5px;white-space:nowrap}
.saychieves-capsule .saychieves-badge{border-radius:999px;font-size:11px}
.saychieves-page .saychieves-badge{border-radius:12px;display:block;min-width:135px}
.saychieves-title{display:flex;align-items:center;justify-content:center;gap:6px}
.saychieves-progress{height:5px;background:#41505b;border-radius:99px;overflow:hidden;margin-top:6px}
.saychieves-progress>div{height:100%;background:#e9c35b}
.saychieves-next{white-space:normal;width:230px;max-width:70vw;border-top:1px solid #ffffff33;margin-top:9px;padding-top:8px;font-weight:400}
.saychieves-next-row{display:flex;gap:8px;margin-top:5px}.saychieves-next img{width:36px;height:36px;object-fit:cover;border-radius:5px}
`;
const trophy='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e9c35b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4ZM7 6H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4"/></svg>';
function el(tag:string,cls?:string,text?:string){const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;}
function badge(data:Progress,kind:'page'|'capsule',settings:Settings):HTMLElement{
 const root=el('div','saychieves-overlay saychieves-'+kind);root.dataset.pos=kind==='page'?settings.pagePosition:settings.capsulePosition;
 const panel=el('div','saychieves-badge'),title=el('div','saychieves-title');
 const symbol=el('span');symbol.innerHTML=trophy;title.append(symbol,el('span',undefined,`${data.earned}/${data.total}`));panel.append(title);
 if(kind==='page'){
   const track=el('div','saychieves-progress');const fill=el('div');fill.style.width=`${data.total?100*data.earned/data.total:0}%`;track.append(fill);panel.append(track);
   if(settings.showUpNext){const next=data.achievements.find(a=>!a.earned);if(next){
     const section=el('div','saychieves-next');section.append(el('strong',undefined,'Up next:'));
     const row=el('div','saychieves-next-row');if(next.icon&&!next.hidden){const img=el('img') as HTMLImageElement;img.src=next.icon;img.alt='';row.append(img);}
     const details=el('div');details.append(el('div',undefined,next.hidden?'Hidden achievement':next.name),el('div',undefined,next.hidden?'Details hidden':next.description),el('div',undefined,'Global: '+(next.globalPercent===undefined?'Unavailable':next.globalPercent.toFixed(1)+'%')));row.append(details);section.append(row);panel.append(section);
   }}
 }
 root.append(panel);return root;
}
function appIdFrom(node:Element):number|null{
 const link=node.closest('a[href*="/app/"]')||node.querySelector('a[href*="/app/"]');
 const sources=[node.getAttribute('data-appid'),node.getAttribute('data-app-id'),node.getAttribute('data-gameid'),link?.getAttribute('href'),location.pathname];
 for(const source of sources){const match=source?.match(/(?:\/app\/|^)(\d{2,10})(?:\/|$)/);if(match)return Number(match[1]);}
 return null;
}
export function startOverlays():()=>void{
 const style=el('style');style.textContent=css;document.head.append(style);
 let active=true,busy=false;
 const cache=new Map<number,{time:number;data:Progress|null}>();
 const get=async(id:number)=>{const old=cache.get(id);if(old&&Date.now()-old.time<60000)return old.data;const data=await readAchievements(id);cache.set(id,{time:Date.now(),data});return data;};
 const refresh=async()=>{
  if(!active||busy)return;busy=true;
  try{
   const settings=load();
   document.querySelectorAll('.saychieves-overlay').forEach(n=>n.remove());
   // Selectors are intentionally conservative; Steam UI classes change between client releases.
   const capsuleNodes=settings.showCapsule?document.querySelectorAll('[data-appid], [data-app-id], a[href*="/app/"]'):[];
   const pageNodes=settings.showPage?document.querySelectorAll('[data-featuretarget="library-game-detail"], .appdetails_Glassy, [class*="appdetails_Header"]'):[];
   const targets:Array<{node:Element;kind:'page'|'capsule'}>=[];
   capsuleNodes.forEach(node=>{if(targets.length<80)targets.push({node,kind:'capsule'});});
   pageNodes.forEach(node=>targets.push({node,kind:'page'}));
   for(const {node,kind} of targets){
    if(!active||!node.isConnected)continue;
    const id=appIdFrom(node);if(!id)continue;
    const data=await get(id);if(!data||!data.total||!active||!node.isConnected)continue;
    if(node.querySelector('.saychieves-overlay'))continue;
    node.classList.add('saychieves-anchor');node.append(badge(data,kind,settings));
   }
  }finally{busy=false;}
 };
 let pending:number|undefined;
 const schedule=()=>{window.clearTimeout(pending);pending=window.setTimeout(()=>{void refresh()},450);};
 const observer=new MutationObserver(records=>{if(records.some(r=>Array.from(r.addedNodes).some(n=>n instanceof Element&&!n.classList.contains('saychieves-overlay'))))schedule();});
 observer.observe(document.body,{childList:true,subtree:true});
 window.addEventListener('saychieves-settings',schedule);
 const timer=window.setInterval(schedule,30000);schedule();
 return ()=>{active=false;observer.disconnect();window.clearTimeout(pending);window.clearInterval(timer);window.removeEventListener('saychieves-settings',schedule);document.querySelectorAll('.saychieves-overlay').forEach(n=>n.remove());document.querySelectorAll('.saychieves-anchor').forEach(n=>n.classList.remove('saychieves-anchor'));style.remove();};
}
