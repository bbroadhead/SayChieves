import React, { useState } from 'react';
import { definePlugin } from '@decky/api';
import { PanelSection, PanelSectionRow, TextField, ButtonItem } from '@decky/ui';

function SayChievesPanel() {
  const [appId, setAppId] = useState('');
  const [message, setMessage] = useState('');
  return <PanelSection title="SayChieves">
    <PanelSectionRow>Achievement progress on game pages is planned; this initial build verifies Decky installation and the panel UI.</PanelSectionRow>
    <PanelSectionRow><TextField label="Steam App ID" value={appId} onChange={event => setAppId(event.target.value)} /></PanelSectionRow>
    <PanelSectionRow><ButtonItem layout="below" onClick={() => setMessage(/^\\d+$/.test(appId.trim()) ? 'App ID accepted. Live achievement lookup is not implemented yet.' : 'Enter a numeric Steam App ID.')}>Check ID</ButtonItem></PanelSectionRow>
    {message && <PanelSectionRow>{message}</PanelSectionRow>}
  </PanelSection>;
}
export default definePlugin(() => ({name:'SayChieves',title:<div>SayChieves</div>,content:<SayChievesPanel />,icon:<span>★</span>}));
