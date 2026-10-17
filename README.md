# SayChieves

Experimental Decky Loader plugin for Steam Deck. **Current status: prototype, not store-ready.**

## Goal
Show unlocked/total Steam achievements and a completion bar on each game's Steam library page. Steam game-page integration and real achievement retrieval are **not implemented** in this first scaffold. The current Quick Access panel accepts a Steam App ID to verify that the frontend loads.

## Build
Install Node.js and pnpm 9 on a Linux development environment (or Steam Deck Desktop Mode with a user-managed Node environment).

```bash
npm install -g pnpm@9
pnpm install
pnpm build
```

The build should produce `dist/index.js`. Build compatibility has not yet been verified on Steam Deck.

## Local testing
1. Install Decky Loader from its official GitHub repository.
2. Switch to Desktop Mode and build this project.
3. Create `~/homebrew/plugins/SayChieves` with appropriate Decky plugin directory permissions, then copy `dist/`, `plugin.json`, and `package.json` into it.
4. Restart the loader with `sudo systemctl restart plugin_loader` and return to Gaming Mode.
5. Open Quick Access (…) > Decky > SayChieves; enter a numeric Steam App ID and press Check ID.

If the plugin does not appear, inspect `journalctl -u plugin_loader -n 100 --no-pager`. Avoid changing SteamOS's read-only system partition.

## Store submission (after implementing real features and testing)
See [Decky plugin database](https://github.com/SteamDeckHomebrew/decky-plugin-database) and its submission wiki. Add a license, screenshots/store image, validated release packaging, and test Stable/Beta SteamOS. Fork the database, add this repository as a git submodule in `plugins/SayChieves`, and open a PR. Do not submit this prototype as a finished achievement display plugin.
