import { world, system, EquipmentSlot, ItemStack } from "@minecraft/server";

// ==================== CONFIG ====================
const ADMINS = [
    "thewarrior3648",
    "RagedJam3832"
];

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

const BAN_ARMOR = [
    BAN_ITEMS.helmet,
    BAN_ITEMS.chestplate,
    BAN_ITEMS.leggings,
    BAN_ITEMS.boots
];

const PREFIX = "!";

// ==================== HELPERS ====================
function isAdmin(name) {
    return ADMINS.some(a => a.toLowerCase() === name.toLowerCase());
}

function isOwner(name) {
    return name.toLowerCase() === OWNER.toLowerCase();
}

function grantOp(player) {
    try {
        player.runCommand("op @s");
    } catch (e) {
        try {
            world.getDimension("overworld").runCommand(`op "${player.name}"`);
        } catch (e2) {}
    }
}

function isWearingBanArmor(player) {
    try {
        const eq = player.getComponent("minecraft:equippable");
        if (!eq) return false;
        const pieces = [
            eq.getEquipment(EquipmentSlot.Head),
            eq.getEquipment(EquipmentSlot.Chest),
            eq.getEquipment(EquipmentSlot.Legs),
            eq.getEquipment(EquipmentSlot.Feet)
        ];
        return pieces.some(p => p && BAN_ARMOR.includes(p.typeId));
    } catch (e) {
        return false;
    }
}

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
    const idx = list.indexOf(lower);
    if (idx !== -1) {
        list.splice(idx, 1);
        saveBannedList(list);
        return true;
    }
    return false;
}

function isBanned(name) {
    return getBannedList().includes(name.toLowerCase());
}

// ==================== GIVE GEAR ====================
function giveItem(player, id) {
    try {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv?.container) return;

        // Clear existing
        for (let i = 0; i < inv.container.size; i++) {
            const it = inv.container.getItem(i);
            if (it && it.typeId === id) inv.container.setItem(i, undefined);
        }

        inv.container.addItem(new ItemStack(id, 1));
    } catch (e) {
        console.warn("Give failed: " + e);
    }
}

function giveFullArmor(player) {
    giveItem(player, BAN_ITEMS.helmet);
    giveItem(player, BAN_ITEMS.chestplate);
    giveItem(player, BAN_ITEMS.leggings);
    giveItem(player, BAN_ITEMS.boots);
    player.sendMessage("§4[Admin] Full Ban Armor given. You are invincible while wearing it.");
}

function giveFullTools(player) {
    giveItem(player, BAN_ITEMS.sword);
    giveItem(player, BAN_ITEMS.pickaxe);
    giveItem(player, BAN_ITEMS.axe);
    giveItem(player, BAN_ITEMS.shovel);
    giveItem(player, BAN_ITEMS.hoe);
    player.sendMessage("§4[Admin] Full Ban Tools given.");
}

function giveFullGear(player) {
    giveFullArmor(player);
    giveFullTools(player);
    player.sendMessage("§4§l[Admin] Complete Ban Gear given.");
}

// ==================== COMMANDS ====================
function handleCommand(player, msg) {
    if (!isOwner(player.name)) return;

    const args = msg.slice(PREFIX.length).trim().split(/\s+/);
    const cmd = (args[0] || "").toLowerCase();

    switch (cmd) {
        case "bangear":
        case "gear":
            giveFullGear(player);
            break;

        case "banarmor":
        case "armor":
            giveFullArmor(player);
            break;

        case "bantools":
        case "tools":
            giveFullTools(player);
            break;

        case "bansword":
        case "sword":
            giveItem(player, BAN_ITEMS.sword);
            player.sendMessage("§a[Admin] Ban Sword given.");
            break;

        case "banhelmet":
        case "helmet":
            giveItem(player, BAN_ITEMS.helmet);
            player.sendMessage("§aBan Helmet given.");
            break;

        case "banchest":
        case "chestplate":
            giveItem(player, BAN_ITEMS.chestplate);
            player.sendMessage("§aBan Chestplate given.");
            break;

        case "banlegs":
        case "leggings":
            giveItem(player, BAN_ITEMS.leggings);
            player.sendMessage("§aBan Leggings given.");
            break;

        case "banboots":
        case "boots":
            giveItem(player, BAN_ITEMS.boots);
            player.sendMessage("§aBan Boots given.");
            break;

        case "banpick":
        case "pickaxe":
            giveItem(player, BAN_ITEMS.pickaxe);
            player.sendMessage("§aBan Pickaxe given.");
            break;

        case "banaxe":
        case "axe":
            giveItem(player, BAN_ITEMS.axe);
            player.sendMessage("§aBan Axe given.");
            break;

        case "banshovel":
        case "shovel":
            giveItem(player, BAN_ITEMS.shovel);
            player.sendMessage("§aBan Shovel given.");
            break;

        case "banhoe":
        case "hoe":
            giveItem(player, BAN_ITEMS.hoe);
            player.sendMessage("§aBan Hoe given.");
            break;

        case "ban":
            if (!args[1]) {
                player.sendMessage("§cUsage: !ban <player>");
                return;
            }
            const target = args[1];
            if (banPlayer(target)) {
                player.sendMessage(`§4[Admin] §c${target} has been permanently banned.`);
                // Kick if online
                for (const p of world.getAllPlayers()) {
                    if (p.name.toLowerCase() === target.toLowerCase()) {
                        try {
                            p.runCommand(`kick "${p.name}" §cBanned by thewarrior3648`);
                        } catch (e) {
                            try {
                                world.getDimension("overworld").runCommand(`kick "${p.name}" §cBanned by thewarrior3648`);
                            } catch (e2) {}
                        }
                    }
                }
            } else {
                player.sendMessage(`§e${target} is already banned.`);
            }
            break;

        case "unban":
            if (!args[1]) {
                player.sendMessage("§cUsage: !unban <player>");
                return;
            }
            if (unbanPlayer(args[1])) {
                player.sendMessage(`§a${args[1]} has been unbanned.`);
            } else {
                player.sendMessage(`§e${args[1]} was not banned.`);
            }
            break;

        case "banlist":
        case "bans":
            const list = getBannedList();
            if (list.length === 0) player.sendMessage("§aBan list is empty.");
            else {
                player.sendMessage(`§4Banned (${list.length}): §c${list.join(", ")}`);
            }
            break;

        case "clearbans":
            saveBannedList([]);
            player.sendMessage("§aAll bans cleared.");
            break;

        case "adminhelp":
        case "help":
            player.sendMessage("§6===== YOUR ADMIN COMMANDS =====");
            player.sendMessage("§e!bangear §7- Full gear");
            player.sendMessage("§e!banarmor §7- Armor only (invincible)");
            player.sendMessage("§e!bantools §7- Tools only");
            player.sendMessage("§e!bansword §7- Sword only");
            player.sendMessage("§e!ban <player> §7- Ban player");
            player.sendMessage("§e!unban <player> §7- Unban");
            player.sendMessage("§e!banlist §7- Show bans");
            player.sendMessage("§e!clearbans §7- Clear bans");
            player.sendMessage("§e!adminhelp §7- This help");
            break;

        default:
            player.sendMessage("§cUnknown command. Type !adminhelp");
    }
}

// ==================== EVENTS ====================

// Chat commands
world.beforeEvents.chatSend.subscribe((event) => {
    const msg = event.message.trim();
    if (!msg.startsWith(PREFIX)) return;

    const player = event.sender;

    if (!isOwner(player.name)) {
        event.cancel = true;
        player.sendMessage("§cThese commands are only for thewarrior3648.");
        return;
    }

    event.cancel = true;

    system.run(() => {
        handleCommand(player, msg);
    });
});

// Join
world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;
    if (!event.initialSpawn) return;

    if (isBanned(player.name)) {
        system.runTimeout(() => {
            try {
                player.runCommand(`kick "${player.name}" §cYou are banned by thewarrior3648`);
            } catch (e) {
                try {
                    world.getDimension("overworld").runCommand(`kick "${player.name}" §cYou are banned`);
                } catch (e2) {}
            }
        }, 10);
        return;
    }

    if (isAdmin(player.name)) {
        system.runTimeout(() => {
            grantOp(player);
            if (isOwner(player.name)) {
                giveFullGear(player);
                player.sendMessage("§6Type §e!adminhelp §6for commands.");
                player.sendMessage("§aBan Armor = invincible");
            }
        }, 40);
    }
});

// Keep OP
system.runInterval(() => {
    for (const p of world.getAllPlayers()) {
        if (isAdmin(p.name)) {
            try { p.runCommand("op @s"); } catch (e) {}
        }
    }
}, 200);

// ==================== INVINCIBILITY ====================
world.beforeEvents.entityHurt.subscribe((event) => {
    const entity = event.hurtEntity;
    if (entity.typeId !== "minecraft:player") return;
    if (!isOwner(entity.name)) return;

    if (isWearingBanArmor(entity)) {
        event.cancel = true;
        event.damage = 0;
    }
});

// ==================== BAN SWORD - STRONG ONESHOT ====================
world.beforeEvents.entityHurt.subscribe((event) => {
    const hurt = event.hurtEntity;
    const source = event.damageSource;

    if (!source.damagingEntity) return;
    const attacker = source.damagingEntity;

    if (attacker.typeId !== "minecraft:player") return;
    if (!isOwner(attacker.name)) return;

    try {
        const eq = attacker.getComponent("minecraft:equippable");
        if (!eq) return;
        const weapon = eq.getEquipment(EquipmentSlot.Mainhand);
        if (!weapon || weapon.typeId !== BAN_ITEMS.sword) return;

        // Force massive damage
        event.damage = 999999;

        // Also kill next tick
        system.run(() => {
            try {
                hurt.runCommand("kill @s");
            } catch (e) {
                try {
                    hurt.applyDamage(999999, { causingEntity: attacker });
                } catch (e2) {}
            }
        });

        // Ban if player
        if (hurt.typeId === "minecraft:player") {
            const name = hurt.name;
            banPlayer(name);
            attacker.sendMessage(`§4[Ban Sword] §c${name} banned & killed.`);

            system.runTimeout(() => {
                try {
                    hurt.runCommand(`kick "${name}" §cBanned by Ban Sword`);
                } catch (e) {
                    try {
                        world.getDimension("overworld").runCommand(`kick "${name}" §cBanned by Ban Sword`);
                    } catch (e2) {}
                }
            }, 5);
        }
    } catch (e) {
        console.warn("BanSword error: " + e);
    }
});

console.warn("[Admin Mod] Loaded - Ban Sword oneshot + commands fixed for thewarrior3648");
