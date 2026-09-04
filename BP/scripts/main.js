import { world, system, EquipmentSlot, ItemStack } from "@minecraft/server";

// ==================== CONFIG ====================
const ADMINS = [
    "thewarrior3648",
    "RagedJam3832"
];

// Only thewarrior3648 gets the full Ban Gear + exclusive commands
const OWNER = "thewarrior3648";

const BAN_ITEMS = {
    sword: "admin:ban_sword",
    helmet: "admin:ban_helmet",
    chestplate: "admin:ban_chestplate",
    leggings: "admin:ban_leggings",
    boots: "admin:ban_boots",
    pickaxe: "admin:ban_pickaxe",
    axe: "admin:ban_axe",
    shovel: "admin:ban_shovel",
    hoe: "admin:ban_hoe"
};

const PREFIX = "!";

// ==================== HELPERS ====================
function isAdmin(playerName) {
    return ADMINS.some(admin => admin.toLowerCase() === playerName.toLowerCase());
}

function isOwner(playerName) {
    return playerName.toLowerCase() === OWNER.toLowerCase();
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

// Ban list
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

// ==================== GIVE GEAR ====================
function giveItem(player, itemId, name) {
    try {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv || !inv.container) return false;

        // Remove existing copies of this item
        for (let i = 0; i < inv.container.size; i++) {
            const item = inv.container.getItem(i);
            if (item && item.typeId === itemId) {
                inv.container.setItem(i, undefined);
            }
        }

        const stack = new ItemStack(itemId, 1);
        inv.container.addItem(stack);
        return true;
    } catch (e) {
        console.error(`[Admin Mod] Failed to give ${name}: ` + e);
        return false;
    }
}

function giveFullArmor(player) {
    giveItem(player, BAN_ITEMS.helmet, "Ban Helmet");
    giveItem(player, BAN_ITEMS.chestplate, "Ban Chestplate");
    giveItem(player, BAN_ITEMS.leggings, "Ban Leggings");
    giveItem(player, BAN_ITEMS.boots, "Ban Boots");
    player.sendMessage("§4[Admin] Full Ban Armor set given.");
}

function giveFullTools(player) {
    giveItem(player, BAN_ITEMS.sword, "Ban Sword");
    giveItem(player, BAN_ITEMS.pickaxe, "Ban Pickaxe");
    giveItem(player, BAN_ITEMS.axe, "Ban Axe");
    giveItem(player, BAN_ITEMS.shovel, "Ban Shovel");
    giveItem(player, BAN_ITEMS.hoe, "Ban Hoe");
    player.sendMessage("§4[Admin] Full Ban Tools given.");
}

function giveFullGear(player) {
    giveFullArmor(player);
    giveFullTools(player);
    player.sendMessage("§4§l[Admin] Complete Ban Gear equipped. You are unstoppable.");
}

// ==================== COMMAND SYSTEM (ONLY YOU) ====================
function handleCommand(player, message) {
    if (!isOwner(player.name)) return false;

    const args = message.slice(PREFIX.length).trim().split(/\s+/);
    const cmd = args[0]?.toLowerCase();

    if (!cmd) return false;

    switch (cmd) {
        // ===== GEAR COMMANDS =====
        case "bangear":
        case "fullgear":
        case "gear":
            giveFullGear(player);
            return true;

        case "banarmor":
        case "armor":
            giveFullArmor(player);
            return true;

        case "bantools":
        case "tools":
            giveFullTools(player);
            return true;

        case "bansword":
        case "sword":
            giveItem(player, BAN_ITEMS.sword, "Ban Sword");
            player.sendMessage("§a[Admin] Ban Sword given.");
            return true;

        case "banhelmet":
        case "helmet":
            giveItem(player, BAN_ITEMS.helmet, "Ban Helmet");
            player.sendMessage("§a[Admin] Ban Helmet given.");
            return true;

        case "banchest":
        case "chestplate":
            giveItem(player, BAN_ITEMS.chestplate, "Ban Chestplate");
            player.sendMessage("§a[Admin] Ban Chestplate given.");
            return true;

        case "banlegs":
        case "leggings":
            giveItem(player, BAN_ITEMS.leggings, "Ban Leggings");
            player.sendMessage("§a[Admin] Ban Leggings given.");
            return true;

        case "banboots":
        case "boots":
            giveItem(player, BAN_ITEMS.boots, "Ban Boots");
            player.sendMessage("§a[Admin] Ban Boots given.");
            return true;

        case "banpick":
        case "pickaxe":
            giveItem(player, BAN_ITEMS.pickaxe, "Ban Pickaxe");
            player.sendMessage("§a[Admin] Ban Pickaxe given.");
            return true;

        case "banaxe":
        case "axe":
            giveItem(player, BAN_ITEMS.axe, "Ban Axe");
            player.sendMessage("§a[Admin] Ban Axe given.");
            return true;

        case "banshovel":
        case "shovel":
            giveItem(player, BAN_ITEMS.shovel, "Ban Shovel");
            player.sendMessage("§a[Admin] Ban Shovel given.");
            return true;

        case "banhoe":
        case "hoe":
            giveItem(player, BAN_ITEMS.hoe, "Ban Hoe");
            player.sendMessage("§a[Admin] Ban Hoe given.");
            return true;

        // ===== BAN COMMANDS =====
        case "ban":
            if (!args[1]) {
                player.sendMessage("§cUsage: !ban <player>");
                return true;
            }
            const targetBan = args[1];
            if (banPlayer(targetBan)) {
                player.sendMessage(`§4[Admin] §c${targetBan} has been permanently banned.`);
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

        // ===== HELP =====
        case "adminhelp":
        case "help":
            player.sendMessage("§6========== ADMIN COMMANDS (ONLY YOU) ==========");
            player.sendMessage("§e!bangear §7- Give full Ban Armor + Tools");
            player.sendMessage("§e!banarmor §7- Give full Ban Armor set");
            player.sendMessage("§e!bantools §7- Give full Ban Tools set");
            player.sendMessage("§e!bansword §7- Give Ban Sword only");
            player.sendMessage("§e!banhelmet / !banchest / !banlegs / !banboots");
            player.sendMessage("§e!banpick / !banaxe / !banshovel / !banhoe");
            player.sendMessage("§e!ban <player> §7- Permanently ban");
            player.sendMessage("§e!unban <player> §7- Unban");
            player.sendMessage("§e!banlist §7- Show banned players");
            player.sendMessage("§e!clearbans §7- Clear all bans");
            player.sendMessage("§e!adminhelp §7- Show this help");
            return true;

        default:
            return false;
    }
}

// ==================== EVENTS ====================

// Chat commands - HARD LOCKED to you only
world.beforeEvents.chatSend.subscribe((event) => {
    const message = event.message.trim();
    if (!message.startsWith(PREFIX)) return;

    const player = event.sender;

    if (!isOwner(player.name)) {
        event.cancel = true;
        player.sendMessage("§c[Admin] These commands are locked to thewarrior3648 only.");
        return;
    }

    event.cancel = true;

    system.run(() => {
        handleCommand(player, message);
    });
});

// On join
world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;

    if (event.initialSpawn) {
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
                if (isOwner(player.name)) {
                    giveFullGear(player);
                    player.sendMessage("§6[Admin] Type §e!adminhelp §6for all your exclusive commands.");
                }
            }, 20);
        }
    }
});

// Keep OP
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        if (isAdmin(player.name)) {
            try { player.runCommandAsync("op @s"); } catch (e) {}
        }
    }
}, 200);

// Ban Sword oneshot + ban
world.afterEvents.entityHurt.subscribe((event) => {
    const hurtEntity = event.hurtEntity;
    const damageSource = event.damageSource;

    if (!damageSource.damagingEntity) return;

    const attacker = damageSource.damagingEntity;

    if (attacker.typeId !== "minecraft:player" || !isOwner(attacker.name)) return;

    const equippable = attacker.getComponent("minecraft:equippable");
    if (!equippable) return;

    const weapon = equippable.getEquipment(EquipmentSlot.Mainhand);
    if (!weapon || weapon.typeId !== BAN_ITEMS.sword) return;

    try {
        hurtEntity.runCommandAsync("kill @s");
        hurtEntity.applyDamage(99999, { cause: "entityAttack", damagingEntity: attacker });
    } catch (e) {}

    if (hurtEntity.typeId === "minecraft:player") {
        const victimName = hurtEntity.name;
        banPlayer(victimName);

        try {
            hurtEntity.sendMessage("§c§lYou have been BANNED by thewarrior3648's Ban Sword!");
            attacker.sendMessage(`§4[Ban Sword] §c${victimName} has been permanently banned.`);

            system.runTimeout(() => {
                try {
                    world.getDimension("overworld").runCommandAsync(`kick "${victimName}" §cBanned by Ban Sword`);
                } catch (e) {}
            }, 5);
        } catch (e) {}
    }
});

console.warn("[Admin Mod] Full Ban Gear + exclusive commands locked to thewarrior3648");
