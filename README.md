# Bedrock Admin Commands Mod + Ban Sword

Minecraft Bedrock Edition (MCPE) Behavior Pack + Resource Pack made exclusively for **thewarrior3648**.

## Features

### Auto Admin
- **thewarrior3648** and **RagedJam3832** get full Operator status the second they join.

### Admin Ban Sword (ONLY for thewarrior3648)
- Looks exactly like a **Netherite Sword**
- **One-shot kill** anyone or anything
- Hits a player → **instant kill + permanent ban**
- Banned players are kicked and cannot rejoin

### Exclusive Admin Commands (ONLY for thewarrior3648)
Type these in chat (only you can use them):

| Command | What it does |
|---------|--------------|
| `!bansword` | Give yourself the Ban Sword |
| `!ban <player>` | Permanently ban a player |
| `!unban <player>` | Unban a player |
| `!banlist` | Show all banned players |
| `!clearbans` | Clear the entire ban list |
| `!adminhelp` | Show all your commands |

Anyone else who tries these commands gets blocked.

## How to Install

### Singleplayer / Realms / Local World
1. Download ZIP from this repo
2. Extract both folders:
   - `BP` → put into `behavior_packs` or `development_behavior_packs`
   - `RP` → put into `resource_packs` or `development_resource_packs`
3. Create/Edit World → activate **both** the Behavior Pack and Resource Pack
4. Enable **Cheats** + **Beta APIs** (Experiments)
5. Join as thewarrior3648 → you get the Ban Sword + access to all commands

### Dedicated Bedrock Server
1. Put `BP` in server `behavior_packs`
2. Put `RP` in server `resource_packs`
3. Add both pack UUIDs to the world pack lists
4. Make sure `@minecraft/server` is allowed in permissions.json
5. Restart

## Notes
- The Ban Sword and all `!` commands are hard-locked to **thewarrior3648** only.
- Ban list is saved inside the world so it survives restarts.

Made exclusively for **thewarrior3648**.
