import { world, system, EquipmentSlot, ItemStack } from "@minecraft/server";

// ==================== CONFIG ====================
const ADMINS = [
    "thewarrior3648",
    "RagedJam3832"
];

// Only thewarrior3648 gets the Ban Sword + exclusive admin commands
const SWORD_OWNER = "thewarrior3648";
const BAN_SWORD_ID = "admin:ban_sword";

// Command prefix (type in chat)
const PREFIX = "!";

// ==================== HELPERS ====================
function isAdmin(playerName) {
    return ADMINS.some(admin => admin.toLowerCase() === playerName.toLowerCase());
}

function isSwordOwner(playerName) {
    return playerName.toLowerCase() === SWORD_OWNER.toLowerCase();
}

function grantOp(player) {
    try {
        player.runCommandAsync("op @s");
        player.sendMessage("§a[Admin Mod] You have been granted Operator status!");
    } catch (e) {
        try {
            world.getDimension("overworld").runCommandAsync(`op "${player.name}"`);
        } catch (e2) {}
    }
}

// Ban list stored in world dynamic property
function getBannedList() {
    try {
        const raw = world.getDynamicProperty("admin_banned_players");
        if (typeof raw === "string") return JSON.parse(raw);
    } catch (e) {}
    return [];
}

function saveBannedList(list) {
    try {
        world.setDynamicProperty("admin_banned_players", JSON.stringify(list));
    } catch (e) {}
}

function banPlayer(name) {
    const list = getBannedList();
    const lower = name.toLowerCase();
    if (!list.includes(lower)) {
        list.push(lower);
        saveBannedList(list);
        return true;
    }
    return false;
}

function unbanPlayer(name) {
    const list = getBannedList();
    const lower = name.toLowerCase();
    const index = list.indexOf(lower);
    if (index !== -1) {
        list.splice(index, 1);
        saveBannedList(list);
        return true;
    }
    return false;
}

function isBanned(name) {
    return getBannedList().includes(name.toLowerCase());
}

// ==================== GIVE SWORD ====================
function giveBanSword(player) {
    try {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv || !inv.container) return false;

        // Remove existing ones first so we don't duplicate forever
        for (let i = 0; i < inv.container.size; i++) {
            const item = inv.container.getItem(i);
            if (item && item.typeId === BAN_SWORD_ID) {
                inv.container.setItem(i, undefined);
            }
        }

        const sword = new ItemStack(BAN_SWORD_ID, 1);
        inv.container.addItem(sword);
        player.sendMessage("§4[Admin Mod] Ban Sword granted. One hit = instant kill + ban.");
        return true;
    } catch (e) {
        console.error("[Admin Mod] Failed to give Ban Sword: " + e);
        return false;
    }
}

// ==================== COMMAND SYSTEM (ONLY thewarrior3648) ====================
function handleCommand(player, message) {
    if (!isSwordOwner(player.name)) return false; // HARD LOCK - only you

    const args = message.slice(PREFIX.length).trim().split(/\s+/);
    const cmd = args[0]?.toLowerCase();

    if (!cmd) return false;

    switch (cmd) {
        case "bansword":
        case "sword":
        case "givesword":
            giveBanSword(player);
            player.sendMessage("§a[Admin] Ban Sword given.");
            return true;

        case "ban":
            if (!args[1]) {
                player.sendMessage("§cUsage: !ban <player>");
                return true;
            }
            const targetBan = args[1];
            if (banPlayer(targetBan)) {
                player.sendMessage(`§4[Admin] §c${targetBan} has been permanently banned.`);
                // Kick if online
                for (const p of world.getAllPlayers()) {
                    if (p.name.toLowerCase() === targetBan.toLowerCase()) {
                        try {
                            world.getDimension("overworld").runCommandAsync(`kick "${p.name}" §cBanned by thewarrior3648`);
                        } catch (e) {}
                    }
                }
            } else {
                player.sendMessage(`§e[Admin] ${targetBan} is already banned.`);
            }
            return true;

        case "unban":
            if (!args[1]) {
                player.sendMessage("§cUsage: !unban <player>");
                return true;
            }
            const targetUnban = args[1];
            if (unbanPlayer(targetUnban)) {
                player.sendMessage(`§a[Admin] ${targetUnban} has been unbanned.`);
            } else {
                player.sendMessage(`§e[Admin] ${targetUnban} was not banned.`);
            }
            return true;

        case "banlist":
        case "bans":
            const list = getBannedList();
            if (list.length === 0) {
                player.sendMessage("§a[Admin] Ban list is empty.");
            } else {
                player.sendMessage(`§4[Admin] Banned players (${list.length}):`);
                player.sendMessage("§c" + list.join(", "));
            }
            return true;

        case "clearbans":
            saveBannedList([]);
            player.sendMessage("§a[Admin] All bans cleared.");
            return true;

        case "adminhelp":
        case "help":
            player.sendMessage("§6===== Admin Commands (only you) =====");
            player.sendMessage("§e!bansword §7- Give yourself the Ban Sword");
            player.sendMessage("§e!ban <player> §7- Permanently ban a player");
            player.sendMessage("§e!unban <player> §7- Unban a player");
            player.sendMessage("§e!banlist §7- Show all banned players");
            player.sendMessage("§e!clearbans §7- Clear entire ban list");
            player.sendMessage("§e!adminhelp §7- Show this help");
            return true;

        default:
            return false; // not one of our commands
    }
}

// ==================== EVENTS ====================

// Chat command interceptor (only you can use them)
world.beforeEvents.chatSend.subscribe((event) => {
    const message = event.message.trim();
    if (!message.startsWith(PREFIX)) return;

    const player = event.sender;

    // Only thewarrior3648 is allowed to run these commands
    if (!isSwordOwner(player.name)) {
        event.cancel = true;
        player.sendMessage("§c[Admin] These commands are locked to thewarrior3648 only.");
        return;
    }

    // Cancel the chat message so others don't see the command
    event.cancel = true;

    // Run the command
    system.run(() => {
        handleCommand(player, message);
    });
});

// On join: OP + give sword + check ban
world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;

    if (event.initialSpawn) {
        // Ban check first
        if (isBanned(player.name)) {
            system.runTimeout(() => {
                try {
                    world.getDimension("overworld").runCommandAsync(`kick "${player.name}" §cYou are permanently banned by thewarrior3648`);
                } catch (e) {}
            }, 10);
            return;
        }

        if (isAdmin(player.name)) {
            system.runTimeout(() => {
                grantOp(player);
                if (isSwordOwner(player.name)) {
                    giveBanSword(player);
                    player.sendMessage("§6[Admin] Type §e!adminhelp §6for your exclusive commands.");
                }
            }, 20);
        }
    }
});

// Keep OP alive
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        if (isAdmin(player.name)) {
            try { player.runCommandAsync("op @s"); } catch (e) {}
        }
    }
}, 200);

// ==================== ONESHOT + BAN ON HIT ====================
world.afterEvents.entityHurt.subscribe((event) => {
    const hurtEntity = event.hurtEntity;
    const damageSource = event.damageSource;

    if (!damageSource.damagingEntity) return;

    const attacker = damageSource.damagingEntity;

    // Only thewarrior3648 can use the power
    if (attacker.typeId !== "minecraft:player" || !isSwordOwner(attacker.name)) return;

    // Check if holding the Ban Sword
    const equippable = attacker.getComponent("minecraft:equippable");
    if (!equippable) return;

    const weapon = equippable.getEquipment(EquipmentSlot.Mainhand);
    if (!weapon || weapon.typeId !== BAN_SWORD_ID) return;

    // ONESHOT
    try {
        hurtEntity.runCommandAsync("kill @s");
        hurtEntity.applyDamage(99999, { cause: "entityAttack", damagingEntity: attacker });
    } catch (e) {}

    // If it was a player → BAN
    if (hurtEntity.typeId === "minecraft:player") {
        const victimName = hurtEntity.name;

        banPlayer(victimName);

        try {
            hurtEntity.sendMessage("§c§lYou have been BANNED by thewarrior3648's Admin Ban Sword!");
            attacker.sendMessage(`§4[Ban Sword] §c${victimName} has been permanently banned.`);

            system.runTimeout(() => {
                try {
                    world.getDimension("overworld").runCommandAsync(`kick "${victimName}" §cBanned by Admin Ban Sword`);
                } catch (e) {}
            }, 5);
        } catch (e) {}
    }
});

console.warn("[Admin Mod] Loaded - Exclusive commands + Ban Sword locked to thewarrior3648");
