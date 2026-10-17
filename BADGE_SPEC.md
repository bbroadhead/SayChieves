# SayChieves badge specification

- Format: trophy icon followed by `earned/total` (example: 🏆 12/35).
- Game detail page default: top-center.
- Library game capsule default: top-left.
- Separate configuration for each badge: enabled/disabled and 9-point positioning grid.
- Persist settings between sessions.
- Badge should not block gamepad navigation, game launch, or other capsule controls; overlay should use pointer-events:none.
- Achievement data must be read from Steam's authenticated client APIs, not fabricated. Do not show 0/0 when unavailable; hide or show an unavailable state.
- Refresh when the selected game changes and when achievements are unlocked; cache carefully for library scrolling performance.
- Position relative to the visible game page or capsule, accounting for different layouts, sizes, and Steam client updates.

## Current state
The React settings panel includes controls and a static preview. Actual Steam UI injection, achievement data retrieval, and compatibility testing are pending. Do not describe this version as feature-complete or store-ready.
