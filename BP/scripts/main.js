import { world, system, EquipmentSlot, ItemStack, GameMode } from "@minecraft/server";

// ==================== CONFIG ====================
const ADMINS = ["thewarrior3648", "RagedJam3832"];
const OWNER = "thewarrior3648";
const PREFIX = "!";

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

const BAN_ARMOR = [BAN_ITEMS.helmet, BAN_ITEMS.chestplate, BAN_ITEMS.leggings, BAN_ITEMS.boots];

// State tracking
const godMode = new Set();
const vanished = new Set();
const flying = new Set();
const frozen = new Set();
const muted = new Set();

// ==================== HELPERS ====================
function isAdmin(name) {
    return ADMINS.some(a => a.toLowerCase() === name.toLowerCase());
}
function isOwner(name) {
    return name.toLowerCase() === OWNER.toLowerCase();
}

function grantOp(player) {
    try { player.runCommand("op @s"); } catch (e) {
        try { world.getDimension("overworld").runCommand(`op "${player.name}"`); } catch (e2) {}
    }
}

function isWearingBanArmor(player) {
    try {
        const eq = player.getComponent("minecraft:equippable");
        if (!eq) return false;
        return [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet]
            .some(slot => {
                const item = eq.getEquipment(slot);
                return item && BAN_ARMOR.includes(item.typeId);
            });
    } catch (e) { return false; }
}

function getBannedList() {
    try {
        const raw = world.getDynamicProperty("admin_banned_players");
        if (typeof raw === "string") return JSON.parse(raw);
    } catch (e) {}
    return [];
}
function saveBannedList(list) {
    try { world.setDynamicProperty("admin_banned_players", JSON.stringify(list)); } catch (e) {}
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
    const idx = list.indexOf(name.toLowerCase());
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

function findPlayer(name) {
    return world.getAllPlayers().find(p => p.name.toLowerCase() === name.toLowerCase());
}

// ==================== GIVE GEAR ====================
function giveItem(player, id) {
    try {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv?.container) return;
        for (let i = 0; i < inv.container.size; i++) {
            const it = inv.container.getItem(i);
            if (it && it.typeId === id) inv.container.setItem(i, undefined);
        }
        inv.container.addItem(new ItemStack(id, 1));
    } catch (e) {}
}
function giveFullArmor(player) {
    giveItem(player, BAN_ITEMS.helmet);
    giveItem(player, BAN_ITEMS.chestplate);
    giveItem(player, BAN_ITEMS.leggings);
    giveItem(player, BAN_ITEMS.boots);
    player.sendMessage("§4[Admin] Full Ban Armor given.");
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

// ==================== COMMAND HANDLER ====================
function handleCommand(player, msg) {
    if (!isOwner(player.name)) return;

    const args = msg.slice(PREFIX.length).trim().split(/\s+/);
    const cmd = (args[0] || "").toLowerCase();
    const targetName = args[1];

    switch (cmd) {
        // ===== GEAR =====
        case "bangear": case "gear":
            giveFullGear(player); break;
        case "banarmor": case "armor":
            giveFullArmor(player); break;
        case "bantools": case "tools":
            giveFullTools(player); break;
        case "bansword": case "sword":
            giveItem(player, BAN_ITEMS.sword);
            player.sendMessage("§aBan Sword given."); break;
        case "banhelmet": case "helmet":
            giveItem(player, BAN_ITEMS.helmet); player.sendMessage("§aBan Helmet given."); break;
        case "banchest": case "chestplate":
            giveItem(player, BAN_ITEMS.chestplate); player.sendMessage("§aBan Chestplate given."); break;
        case "banlegs": case "leggings":
            giveItem(player, BAN_ITEMS.leggings); player.sendMessage("§aBan Leggings given."); break;
        case "banboots": case "boots":
            giveItem(player, BAN_ITEMS.boots); player.sendMessage("§aBan Boots given."); break;
        case "banpick": case "pickaxe":
            giveItem(player, BAN_ITEMS.pickaxe); player.sendMessage("§aBan Pickaxe given."); break;
        case "banaxe": case "axe":
            giveItem(player, BAN_ITEMS.axe); player.sendMessage("§aBan Axe given."); break;
        case "banshovel": case "shovel":
            giveItem(player, BAN_ITEMS.shovel); player.sendMessage("§aBan Shovel given."); break;
        case "banhoe": case "hoe":
            giveItem(player, BAN_ITEMS.hoe); player.sendMessage("§aBan Hoe given."); break;

        // ===== BAN SYSTEM =====
        case "ban":
            if (!targetName) return player.sendMessage("§cUsage: !ban <player>");
            if (banPlayer(targetName)) {
                player.sendMessage(`§4Banned §c${targetName}`);
                const t = findPlayer(targetName);
                if (t) {
                    try { t.runCommand(`kick "${t.name}" §cBanned by thewarrior3648`); } catch (e) {}
                }
            } else player.sendMessage(`§e${targetName} already banned.`);
            break;
        case "unban":
            if (!targetName) return player.sendMessage("§cUsage: !unban <player>");
            if (unbanPlayer(targetName)) player.sendMessage(`§aUnbanned ${targetName}`);
            else player.sendMessage(`§e${targetName} was not banned.`);
            break;
        case "banlist": case "bans":
            const list = getBannedList();
            player.sendMessage(list.length ? `§4Banned: §c${list.join(", ")}` : "§aBan list empty.");
            break;
        case "clearbans":
            saveBannedList([]);
            player.sendMessage("§aAll bans cleared.");
            break;

        // ===== HIGH PRIORITY =====
        case "god":
            if (godMode.has(player.id)) {
                godMode.delete(player.id);
                player.sendMessage("§cGod Mode OFF");
            } else {
                godMode.add(player.id);
                player.sendMessage("§aGod Mode ON - You are invincible");
            }
            break;

        case "vanish": case "v":
            if (vanished.has(player.id)) {
                vanished.delete(player.id);
                try { player.removeEffect("invisibility"); } catch (e) {}
                player.sendMessage("§cVanish OFF");
            } else {
                vanished.add(player.id);
                try { player.addEffect("invisibility", 999999, { amplifier: 1, showParticles: false }); } catch (e) {}
                player.sendMessage("§aVanish ON - You are invisible");
            }
            break;

        case "fly":
            if (flying.has(player.id)) {
                flying.delete(player.id);
                try { player.runCommand("ability @s mayfly false"); } catch (e) {}
                player.sendMessage("§cFly OFF");
            } else {
                flying.add(player.id);
                try { player.runCommand("ability @s mayfly true"); } catch (e) {}
                player.sendMessage("§aFly ON");
            }
            break;

        case "tp":
            if (!targetName) return player.sendMessage("§cUsage: !tp <player>");
            const tpTarget = findPlayer(targetName);
            if (!tpTarget) return player.sendMessage("§cPlayer not found.");
            player.teleport(tpTarget.location, { dimension: tpTarget.dimension });
            player.sendMessage(`§aTeleported to ${tpTarget.name}`);
            break;

        case "tphere":
            if (!targetName) return player.sendMessage("§cUsage: !tphere <player>");
            const hereTarget = findPlayer(targetName);
            if (!hereTarget) return player.sendMessage("§cPlayer not found.");
            hereTarget.teleport(player.location, { dimension: player.dimension });
            player.sendMessage(`§aTeleported ${hereTarget.name} to you`);
            break;

        case "tpall":
            for (const p of world.getAllPlayers()) {
                if (p.id !== player.id) {
                    p.teleport(player.location, { dimension: player.dimension });
                }
            }
            player.sendMessage("§aTeleported all players to you");
            break;

        // ===== EXTRA =====
        case "smite":
            if (!targetName) return player.sendMessage("§cUsage: !smite <player>");
            const smiteTarget = findPlayer(targetName);
            if (!smiteTarget) return player.sendMessage("§cPlayer not found.");
            try {
                smiteTarget.dimension.spawnEntity("minecraft:lightning_bolt", smiteTarget.location);
                player.sendMessage(`§eSmitten ${smiteTarget.name}`);
            } catch (e) {}
            break;

        case "nuke":
            try {
                player.dimension.createExplosion(player.location, 10, { breaksBlocks: true, causesFire: true });
                player.sendMessage("§cNUKE activated");
            } catch (e) {}
            break;

        case "freeze":
            if (!targetName) return player.sendMessage("§cUsage: !freeze <player>");
            const freezeTarget = findPlayer(targetName);
            if (!freezeTarget) return player.sendMessage("§cPlayer not found.");
            if (frozen.has(freezeTarget.id)) {
                frozen.delete(freezeTarget.id);
                try {
                    freezeTarget.removeEffect("slowness");
                    freezeTarget.removeEffect("mining_fatigue");
                } catch (e) {}
                player.sendMessage(`§aUnfroze ${freezeTarget.name}`);
            } else {
                frozen.add(freezeTarget.id);
                try {
                    freezeTarget.addEffect("slowness", 999999, { amplifier: 255, showParticles: false });
                    freezeTarget.addEffect("mining_fatigue", 999999, { amplifier: 255, showParticles: false });
                } catch (e) {}
                player.sendMessage(`§bFroze ${freezeTarget.name}`);
            }
            break;

        case "mute":
            if (!targetName) return player.sendMessage("§cUsage: !mute <player>");
            const muteTarget = findPlayer(targetName);
            if (!muteTarget) return player.sendMessage("§cPlayer not found.");
            if (muted.has(muteTarget.id)) {
                muted.delete(muteTarget.id);
                player.sendMessage(`§aUnmuted ${muteTarget.name}`);
            } else {
                muted.add(muteTarget.id);
                player.sendMessage(`§cMuted ${muteTarget.name}`);
            }
            break;

        case "speed":
            try {
                player.addEffect("speed", 6000, { amplifier: 5, showParticles: false });
                player.sendMessage("§aSpeed boost activated");
            } catch (e) {}
            break;

        case "jump":
            try {
                player.addEffect("jump_boost", 6000, { amplifier: 5, showParticles: false });
                player.sendMessage("§aJump boost activated");
            } catch (e) {}
            break;

        case "heal":
            try {
                player.runCommand("effect @s instant_health 1 255 true");
                player.runCommand("effect @s saturation 1 255 true");
                player.sendMessage("§aFully healed");
            } catch (e) {}
            break;

        case "feed":
            try {
                player.runCommand("effect @s saturation 1 255 true");
                player.sendMessage("§aHunger filled");
            } catch (e) {}
            break;

        // ===== HELP =====
        case "adminhelp": case "help":
            player.sendMessage("§6========== ADMIN COMMANDS ==========");
            player.sendMessage("§e!bangear !banarmor !bantools !bansword");
            player.sendMessage("§e!ban !unban !banlist !clearbans");
            player.sendMessage("§a!god §7- Toggle invincibility");
            player.sendMessage("§a!vanish §7- Toggle invisibility");
            player.sendMessage("§a!fly §7- Toggle flying");
            player.sendMessage("§a!tp <player> §7- Teleport to player");
            player.sendMessage("§a!tphere <player> §7- Teleport player to you");
            player.sendMessage("§a!tpall §7- Teleport everyone to you");
            player.sendMessage("§c!smite <player> §7- Lightning strike");
            player.sendMessage("§c!nuke §7- Big explosion");
            player.sendMessage("§c!freeze <player> §7- Freeze / unfreeze");
            player.sendMessage("§c!mute <player> §7- Mute / unmute");
            player.sendMessage("§b!speed !jump !heal !feed");
            break;

        default:
            player.sendMessage("§cUnknown command. Type !adminhelp");
    }
}

// ==================== EVENTS ====================

// Commands
world.beforeEvents.chatSend.subscribe((event) => {
    const msg = event.message.trim();
    if (!msg.startsWith(PREFIX)) return;

    const player = event.sender;

    // Mute check
    if (muted.has(player.id)) {
        event.cancel = true;
        player.sendMessage("§cYou are muted.");
        return;
    }

    if (!isOwner(player.name)) {
        if (msg.startsWith(PREFIX)) {
            event.cancel = true;
            player.sendMessage("§cCommands locked to thewarrior3648 only.");
        }
        return;
    }

    event.cancel = true;
    system.run(() => handleCommand(player, msg));
});

// Join
world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;
    if (!event.initialSpawn) return;

    if (isBanned(player.name)) {
        system.runTimeout(() => {
            try { player.runCommand(`kick "${player.name}" §cBanned by thewarrior3648`); } catch (e) {}
        }, 10);
        return;
    }

    if (isAdmin(player.name)) {
        system.runTimeout(() => {
            grantOp(player);
            if (isOwner(player.name)) {
                giveFullGear(player);
                player.sendMessage("§6Type §e!adminhelp §6for all commands.");
            }
        }, 40);
    }
});

// Keep OP + maintain effects
system.runInterval(() => {
    for (const p of world.getAllPlayers()) {
        if (isAdmin(p.name)) {
            try { p.runCommand("op @s"); } catch (e) {}
        }

        // Keep vanish
        if (vanished.has(p.id)) {
            try { p.addEffect("invisibility", 100, { amplifier: 1, showParticles: false }); } catch (e) {}
        }

        // Keep freeze
        if (frozen.has(p.id)) {
            try {
                p.addEffect("slowness", 100, { amplifier: 255, showParticles: false });
                p.addEffect("mining_fatigue", 100, { amplifier: 255, showParticles: false });
            } catch (e) {}
        }
    }
}, 40);

// Invincibility (armor or god mode)
world.beforeEvents.entityHurt.subscribe((event) => {
    const entity = event.hurtEntity;
    if (entity.typeId !== "minecraft:player") return;
    if (!isOwner(entity.name)) return;

    if (godMode.has(entity.id) || isWearingBanArmor(entity)) {
        event.cancel = true;
        event.damage = 0;
    }
});

// Ban Sword oneshot
world.beforeEvents.entityHurt.subscribe((event) => {
    const hurt = event.hurtEntity;
    const source = event.damageSource;
    if (!source.damagingEntity) return;

    const attacker = source.damagingEntity;
    if (attacker.typeId !== "minecraft:player" || !isOwner(attacker.name)) return;

    try {
        const eq = attacker.getComponent("minecraft:equippable");
        if (!eq) return;
        const weapon = eq.getEquipment(EquipmentSlot.Mainhand);
        if (!weapon || weapon.typeId !== BAN_ITEMS.sword) return;

        event.damage = 999999;

        system.run(() => {
            try { hurt.runCommand("kill @s"); } catch (e) {
                try { hurt.applyDamage(999999); } catch (e2) {}
            }
        });

        if (hurt.typeId === "minecraft:player") {
            const name = hurt.name;
            banPlayer(name);
            attacker.sendMessage(`§4[Ban Sword] §c${name} killed & banned`);
            system.runTimeout(() => {
                try { hurt.runCommand(`kick "${name}" §cBanned by Ban Sword`); } catch (e) {}
            }, 5);
        }
    } catch (e) {}
});

console.warn("[Admin Mod] Full power loaded for thewarrior3648");
