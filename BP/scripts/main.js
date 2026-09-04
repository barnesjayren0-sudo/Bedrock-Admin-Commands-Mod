import { world, system, EquipmentSlot, ItemStack } from "@minecraft/server";

// ==================== CONFIG ====================
const ADMINS = [
    "thewarrior3648",
    "RagedJam3832"
];

// Only thewarrior3648 gets the Ban Sword and can use its power
const SWORD_OWNER = "thewarrior3648";
const BAN_SWORD_ID = "admin:ban_sword";

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

// Simple ban list stored in world dynamic property
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
    if (!list.includes(name.toLowerCase())) {
        list.push(name.toLowerCase());
        saveBannedList(list);
    }
}

function isBanned(name) {
    return getBannedList().includes(name.toLowerCase());
}

// ==================== GIVE SWORD TO OWNER ====================
function giveBanSword(player) {
    try {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv || !inv.container) return;

        // Check if already has it
        for (let i = 0; i < inv.container.size; i++) {
            const item = inv.container.getItem(i);
            if (item && item.typeId === BAN_SWORD_ID) return;
        }

        const sword = new ItemStack(BAN_SWORD_ID, 1);
        inv.container.addItem(sword);
        player.sendMessage("§4[Admin Mod] Ban Sword granted. One hit = instant kill + ban.");
    } catch (e) {
        console.error("[Admin Mod] Failed to give Ban Sword: " + e);
    }
}

// ==================== EVENTS ====================

// On join: OP + give sword + check ban
world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;

    if (event.initialSpawn) {
        // Ban check first
        if (isBanned(player.name)) {
            system.runTimeout(() => {
                try {
                    player.runCommandAsync(`kick "${player.name}" §cYou are permanently banned by Admin Ban Sword`);
                    world.getDimension("overworld").runCommandAsync(`kick "${player.name}" §cBanned by thewarrior3648`);
                } catch (e) {}
            }, 10);
            return;
        }

        if (isAdmin(player.name)) {
            system.runTimeout(() => {
                grantOp(player);
                if (isSwordOwner(player.name)) {
                    giveBanSword(player);
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

// ==================== ONESHOT + BAN LOGIC ====================
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
        // Force kill no matter what
        hurtEntity.runCommandAsync("kill @s");
        // Also apply massive damage just in case
        hurtEntity.applyDamage(99999, { cause: "entityAttack", damagingEntity: attacker });
    } catch (e) {}

    // If it was a player → BAN
    if (hurtEntity.typeId === "minecraft:player") {
        const victimName = hurtEntity.name;

        banPlayer(victimName);

        try {
            hurtEntity.sendMessage("§c§lYou have been BANNED by thewarrior3648's Admin Ban Sword!");
            attacker.sendMessage(`§4[Ban Sword] §c${victimName} has been permanently banned.`);

            // Kick immediately
            system.runTimeout(() => {
                try {
                    world.getDimension("overworld").runCommandAsync(`kick "${victimName}" §cBanned by Admin Ban Sword`);
                } catch (e) {}
            }, 5);
        } catch (e) {}
    }
});

console.warn("[Admin Mod] Loaded - Auto OP + Ban Sword active for thewarrior3648");
