import { startOverlays } from './overlay';
import React, { useState } from 'react';
import { definePlugin } from '@decky/api';
import { PanelSection, PanelSectionRow } from '@decky/ui';

type Position = 'top-left'|'top-center'|'top-right'|'middle-left'|'center'|'middle-right'|'bottom-left'|'bottom-center'|'bottom-right';
type Settings = { pagePosition: Position; capsulePosition: Position; showPage: boolean; showCapsule: boolean; showUpNext: boolean };
const defaults: Settings = { pagePosition:'top-center', capsulePosition:'top-left', showPage:true, showCapsule:true, showUpNext:false };
const positions: Position[] = ['top-left','top-center','top-right','middle-left','center','middle-right','bottom-left','bottom-center','bottom-right'];
const key = 'saychieves.settings.v1';
function load(): Settings {
  try { const value = JSON.parse(localStorage.getItem(key) || '{}'); return {...defaults,...value}; }
  catch { return defaults; }
}
function Trophy({size=16}:{size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#e9c35b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4ZM7 6H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4"/></svg>;
}
type Achievement = { id:string; name:string; description:string; icon?:string; globalPercent?:number; earned:boolean; hidden?:boolean };
function firstUnearned(items:Achievement[]):Achievement|undefined { return items.find(item=>!item.earned); }
function Badge({earned,total,variant,showUpNext=false,achievements=[]}:{earned:number;total:number;variant:'page'|'capsule';showUpNext?:boolean;achievements?:Achievement[]}) {
  const pct=total>0?Math.max(0,Math.min(100,earned/total*100)):0;
  if(variant==='capsule') return <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:4,padding:'5px 8px',minHeight:28,borderRadius:999,background:'rgba(0,0,0,0.72)',border:'1px solid #638095',boxShadow:'0 2px 8px #0008',color:'#fff',fontWeight:700,fontSize:12,whiteSpace:'nowrap'}} aria-label={`${earned} of ${total} achievements`}><Trophy size={14}/>{earned}/{total}</span>;
  const next=showUpNext?firstUnearned(achievements):undefined;
  return <div style={{width:showUpNext?245:145,padding:'7px 10px',borderRadius:12,background:'rgba(0,0,0,0.72)',border:'1px solid #638095',color:'#fff',boxShadow:'0 2px 8px #0008'}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:14,fontWeight:700}}><Trophy/>{earned}/{total}</div>
    <div role="progressbar" aria-label="Achievement completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} style={{height:5,background:'#41505b',borderRadius:99,overflow:'hidden',marginTop:6}}><div style={{height:'100%',width:`${pct}%`,background:'#e9c35b',borderRadius:99}}/></div>
    {next && <div style={{marginTop:9,paddingTop:8,borderTop:'1px solid #ffffff33',fontSize:11}}>
      <div style={{fontWeight:700,color:'#e9c35b',marginBottom:5}}>Up next:</div>
      <div style={{display:'flex',gap:8,alignItems:'flex-start'}}>
        {next.icon ? <img src={next.icon} alt="" style={{width:36,height:36,borderRadius:5,objectFit:'cover'}}/> : <div style={{width:36,height:36,flexShrink:0,borderRadius:5,background:'#444'}}/>}
        <div style={{minWidth:0}}>
          <div style={{fontWeight:700}}>{next.hidden?'Hidden achievement':next.name}</div>
          <div style={{color:'#ddd',marginTop:3}}>{next.hidden?'Details hidden':next.description}</div>
          <div style={{color:'#e9c35b',marginTop:4}}>Global: {typeof next.globalPercent==='number' ? `${next.globalPercent.toFixed(1)}%` : 'Unavailable'}</div>
        </div>
      </div>
    </div>}
  </div>;
}
function Preview({position,variant,showUpNext=false}:{position:Position;variant:'page'|'capsule';showUpNext?:boolean}) {
  const [vertical,horizontal] = position === 'center' ? ['center','center'] : position.split('-');
  const alignItems = horizontal==='left'?'flex-start':horizontal==='right'?'flex-end':'center';
  const justifyContent = vertical==='top'?'flex-start':vertical==='bottom'?'flex-end':'center';
  return <div style={{display:'flex',alignItems,justifyContent,padding:8,boxSizing:'border-box',width:'100%',height:variant==='page'?(showUpNext?185:100):125,borderRadius:8,background:'linear-gradient(130deg,#243d57,#14202e)'}}><Badge earned={12} total={35} variant={variant} showUpNext={showUpNext} achievements={[{id:"example",name:"Example achievement",description:"Complete the next objective.",earned:false,globalPercent:24.6}]}/></div>;
}
function SettingsPanel() {
  const [settings,setSettings] = useState<Settings>(load);
  const change = (update:Partial<Settings>) => setSettings(old => {const next={...old,...update};localStorage.setItem(key,JSON.stringify(next));return next;});
  return <PanelSection title="SayChieves badge settings">
    <PanelSectionRow>Game-page badge: trophy, earned/total, and completion bar. Capsule badge: compact rounded pill inspired by Steam library status badges. These settings and previews are implemented; live game-page/capsule injection and Steam achievement retrieval still require integration.</PanelSectionRow>
    <PanelSectionRow><label><input type="checkbox" checked={settings.showPage} onChange={e=>change({showPage:e.target.checked})}/> Show game-page badge</label></PanelSectionRow>
    <PanelSectionRow><label>Game-page position <select value={settings.pagePosition} onChange={e=>change({pagePosition:e.target.value as Position})}>{positions.map(p=><option key={p} value={p}>{p}</option>)}</select></label><Preview position={settings.pagePosition} variant="page" showUpNext={settings.showUpNext}/></PanelSectionRow>
    <PanelSectionRow><label><input type="checkbox" checked={settings.showUpNext} onChange={e=>change({showUpNext:e.target.checked})}/> Show “Up next” on game-page badge (off by default)</label></PanelSectionRow>
    <PanelSectionRow><label><input type="checkbox" checked={settings.showCapsule} onChange={e=>change({showCapsule:e.target.checked})}/> Show library capsule badge</label></PanelSectionRow>
    <PanelSectionRow><label>Capsule position <select value={settings.capsulePosition} onChange={e=>change({capsulePosition:e.target.value as Position})}>{positions.map(p=><option key={p} value={p}>{p}</option>)}</select></label><Preview position={settings.capsulePosition} variant="capsule"/></PanelSectionRow>
    <PanelSectionRow><button onClick={()=>change(defaults)}>Restore default positions</button></PanelSectionRow>
  </PanelSection>;
}
export default definePlugin(() => { const stop=startOverlays(); return {name:'SayChieves',title:<div>SayChieves</div>,content:<SettingsPanel/>,icon:<span>🏆</span>,onDismount:stop}; });
