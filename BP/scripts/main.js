import { world, system } from "@minecraft/server";

// The players who get full admin / operator powers
const ADMINS = [
    "thewarrior3648",
    "RagedJam3832"
];

// Normalize names for comparison (case-insensitive)
function isAdmin(playerName) {
    return ADMINS.some(admin => admin.toLowerCase() === playerName.toLowerCase());
}

// Run the op command for a player
function grantOp(player) {
    try {
        // This works when the pack has command permission (cheats/Beta APIs enabled)
        player.runCommandAsync("op @s");
        player.sendMessage("§a[Admin Mod] You have been granted Operator status!");
        console.warn(`[Admin Mod] Granted OP to ${player.name}`);
    } catch (e) {
        console.error(`[Admin Mod] Failed to OP ${player.name}: ${e}`);
        // Fallback: try world command
        try {
            world.getDimension("overworld").runCommandAsync(`op "${player.name}"`);
        } catch (e2) {
            console.error(`[Admin Mod] Fallback also failed: ${e2}`);
        }
    }
}

// Listen for player spawn (join + respawn)
world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;

    // Only on initial join (not every respawn)
    if (event.initialSpawn && isAdmin(player.name)) {
        // Small delay to make sure player is fully loaded
        system.runTimeout(() => {
            grantOp(player);
        }, 20); // 1 second (20 ticks)
    }
});

// Also check every few seconds in case of late joins or reloads
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        if (isAdmin(player.name)) {
            // Re-apply OP just in case it was removed
            try {
                player.runCommandAsync("op @s");
            } catch (e) {
                // Silent fail
            }
        }
    }
}, 200); // every 10 seconds

console.warn("[Admin Mod] Loaded - Auto OP active for thewarrior3648 and RagedJam3832");
