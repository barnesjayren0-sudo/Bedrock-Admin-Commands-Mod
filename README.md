# Bedrock Admin Commands Mod

Minecraft Bedrock Edition (MCPE) Behavior Pack that automatically grants **Operator (Admin)** status to specific players when they join the world/server.

## Protected Admins
- **thewarrior3648**
- **RagedJam3832**

These two players will automatically receive full admin/operator commands on join.

## How to Install

### For Singleplayer / Realms / Local Worlds:
1. Download this repository as ZIP (Code → Download ZIP)
2. Extract the folder
3. Copy the entire `BP` folder into your Minecraft `behavior_packs` or `development_behavior_packs` folder
4. Open Minecraft → Create/Edit World → Behavior Packs → Activate this pack
5. **Important**: Enable **Cheats** and **Beta APIs** (Experiments) in world settings
6. The two players will get OP automatically when they join

### For Dedicated Bedrock Servers:
1. Place the `BP` folder inside your server's `behavior_packs` folder
2. Add the pack UUID to `worlds/<world>/world_behavior_packs.json`
3. Make sure scripting is enabled in `config/default/permissions.json` (include `@minecraft/server`)
4. Restart the server
5. Players `thewarrior3648` and `RagedJam3832` will be auto-opped on join

## Manual OP (if needed)
If the script doesn't trigger, run in console or as existing OP:
```
op thewarrior3648
op RagedJam3832
```

Or edit `permissions.json` with their XUIDs for permanent OP.

## Files
- `BP/manifest.json` - Pack definition
- `BP/scripts/main.js` - Auto-OP script

Made for thewarrior3648's server.
