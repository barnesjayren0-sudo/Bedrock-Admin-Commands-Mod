# Bedrock Admin Commands Mod + Ban Sword

Minecraft Bedrock Edition (MCPE) Behavior Pack + Resource Pack.

## Features

### Auto Admin
- **thewarrior3648** and **RagedJam3832** get full Operator status the second they join.

### Admin Ban Sword (ONLY for thewarrior3648)
- Looks exactly like a **Netherite Sword**
- **One-shot kill** anyone or anything
- Hits a player → **instant kill + permanent ban**
- Banned players are kicked and cannot rejoin (ban list saved in the world)
- Only **thewarrior3648** receives the sword and can use its power

## How to Install

### Singleplayer / Realms / Local World
1. Download ZIP from this repo
2. Extract both folders:
   - `BP` → put into `behavior_packs` or `development_behavior_packs`
   - `RP` → put into `resource_packs` or `development_resource_packs`
3. Create/Edit World → activate **both** the Behavior Pack and Resource Pack
4. Enable **Cheats** + **Beta APIs** (Experiments)
5. Join as thewarrior3648 → you get the Ban Sword automatically

### Dedicated Bedrock Server
1. Put `BP` in server `behavior_packs`
2. Put `RP` in server `resource_packs`
3. Add both pack UUIDs to the world pack lists
4. Make sure `@minecraft/server` is allowed in permissions.json
5. Restart

## How the Ban Sword works
- Hold it and hit anyone → they die instantly
- If you hit a player → they get permanently banned from the world
- Ban list is stored in the world so it survives restarts
- Only works when **thewarrior3648** is holding the sword

## Files
- `BP/` - Behavior pack (items + scripts)
- `RP/` - Resource pack (makes the sword look like netherite)
- `BP/scripts/main.js` - All the logic

Made exclusively for **thewarrior3648**.
