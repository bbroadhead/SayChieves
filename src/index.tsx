import React, { useState } from 'react';
import { definePlugin } from '@decky/api';
import { PanelSection, PanelSectionRow } from '@decky/ui';

type Position = 'top-left'|'top-center'|'top-right'|'middle-left'|'center'|'middle-right'|'bottom-left'|'bottom-center'|'bottom-right';
type Settings = { pagePosition: Position; capsulePosition: Position; showPage: boolean; showCapsule: boolean };
const defaults: Settings = { pagePosition:'top-center', capsulePosition:'top-left', showPage:true, showCapsule:true };
const positions: Position[] = ['top-left','top-center','top-right','middle-left','center','middle-right','bottom-left','bottom-center','bottom-right'];
const key = 'saychieves.settings.v1';
function load(): Settings {
  try { const value = JSON.parse(localStorage.getItem(key) || '{}'); return {...defaults,...value}; }
  catch { return defaults; }
}
function Badge({earned,total}:{earned:number;total:number}) {
  return <span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'4px 8px',borderRadius:8,background:'rgba(12,17,25,.88)',color:'#fff',fontWeight:700,fontSize:13}} aria-label={`${earned} of ${total} achievements`}>
    <span aria-hidden="true">🏆</span>{earned}/{total}
  </span>;
}
function Preview({position}:{position:Position}) {
  const [vertical,horizontal] = position === 'center' ? ['center','center'] : position.split('-');
  const alignItems = horizontal==='left'?'flex-start':horizontal==='right'?'flex-end':'center';
  const justifyContent = vertical==='top'?'flex-start':vertical==='bottom'?'flex-end':'center';
  return <div style={{display:'flex',alignItems,justifyContent,padding:8,boxSizing:'border-box',width:'100%',height:90,borderRadius:8,background:'linear-gradient(130deg,#243d57,#14202e)'}}><Badge earned={12} total={35}/></div>;
}
function SettingsPanel() {
  const [settings,setSettings] = useState<Settings>(load);
  const change = (update:Partial<Settings>) => setSettings(old => {const next={...old,...update};localStorage.setItem(key,JSON.stringify(next));return next;});
  return <PanelSection title="SayChieves badge settings">
    <PanelSectionRow>Badge format: 🏆 earned/total. These settings and previews are implemented; live game-page/capsule injection and Steam achievement retrieval still require integration.</PanelSectionRow>
    <PanelSectionRow><label><input type="checkbox" checked={settings.showPage} onChange={e=>change({showPage:e.target.checked})}/> Show game-page badge</label></PanelSectionRow>
    <PanelSectionRow><label>Game-page position <select value={settings.pagePosition} onChange={e=>change({pagePosition:e.target.value as Position})}>{positions.map(p=><option key={p} value={p}>{p}</option>)}</select></label><Preview position={settings.pagePosition}/></PanelSectionRow>
    <PanelSectionRow><label><input type="checkbox" checked={settings.showCapsule} onChange={e=>change({showCapsule:e.target.checked})}/> Show library capsule badge</label></PanelSectionRow>
    <PanelSectionRow><label>Capsule position <select value={settings.capsulePosition} onChange={e=>change({capsulePosition:e.target.value as Position})}>{positions.map(p=><option key={p} value={p}>{p}</option>)}</select></label><Preview position={settings.capsulePosition}/></PanelSectionRow>
    <PanelSectionRow><button onClick={()=>change(defaults)}>Restore default positions</button></PanelSectionRow>
  </PanelSection>;
}
export default definePlugin(() => ({name:'SayChieves',title:<div>SayChieves</div>,content:<SettingsPanel/>,icon:<span>🏆</span>}));
