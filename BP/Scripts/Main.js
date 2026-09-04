import {
  world, system, EquipmentSlot, ItemStack,
  CustomCommandParamType, CustomCommandStatus, CommandPermissionLevel
} from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

const OWNER = "thewarrior3648";
const ADMINS = [OWNER, "RagedJam3832"];

const I = {
  sword: "admin:ban_sword",
  helmet: "admin:ban_helmet",
  chest: "admin:ban_chestplate",
  legs: "admin:ban_leggings",
  boots: "admin:ban_boots",
  pick: "admin:ban_pickaxe",
  axe: "admin:ban_axe",
  shovel: "admin:ban_shovel",
  hoe: "admin:ban_hoe"
};

const god = new Set();
const vanish = new Set();
const fly = new Set();
const freeze = new Set();
const mute = new Set();

const admin = n =>
  ADMINS.some(x => x.toLowerCase() == String(n).toLowerCase());

const owner = n =>
  String(n).toLowerCase() == OWNER.toLowerCase();

const find = n =>
  world.getAllPlayers().find(
    p => p.name.toLowerCase() == String(n).toLowerCase()
  );

function list(k) {
  try {
    const x = JSON.parse(world.getDynamicProperty(k) || "[]");
    return Array.isArray(x) ? x : [];
  } catch {
    return [];
  }
}

const save = (k, x) =>
  world.setDynamicProperty(k, JSON.stringify(x));

function add(k, n) {
  const x = list(k);
  const v = String(n).toLowerCase();

  if (x.includes(v)) return false;

  x.push(v);
  save(k, x);
  return true;
}

function del(k, n) {
  const x = list(k);
  const v = String(n).toLowerCase();
  const i = x.indexOf(v);

  if (i < 0) return false;

  x.splice(i, 1);
  save(k, x);
  return true;
}

const has = (k, n) =>
  list(k).includes(String(n).toLowerCase());

const banned = n =>
  has("admin_banned_players", n);

const kicked = n =>
  has("admin_kicked_players", n);

function give(p, id) {
  try {
    p.getComponent("minecraft:inventory")
      .container
      .addItem(new ItemStack(id, 1));
    return true;
  } catch {
    return false;
  }
}

function armor(p) {
  try {
    const e = p.getComponent("minecraft:equippable");

    e.setEquipment(
      EquipmentSlot.Head,
      new ItemStack(I.helmet, 1)
    );

    e.setEquipment(
      EquipmentSlot.Chest,
      new ItemStack(I.chest, 1)
    );

    e.setEquipment(
      EquipmentSlot.Legs,
      new ItemStack(I.legs, 1)
    );

    e.setEquipment(
      EquipmentSlot.Feet,
      new ItemStack(I.boots, 1)
    );

    p.sendMessage("§4[Admin] Ban Armor equipped.");
  } catch {
    p.sendMessage("§cFailed to equip Ban Armor.");
  }
}

function gear(p) {
  armor(p);

  [
    I.pick,
    I.axe,
    I.shovel,
    I.hoe,
    I.sword
  ].forEach(x => give(p, x));

  p.sendMessage("§4§l[Admin] Full Ban Gear given.");
}

function op(p) {
  try {
    p.runCommand("op @s");
  } catch {}
}

function confirmBan(a, t) {
  new ActionFormData()
    .title("§4Ban Confirmation")
    .body(`§fBan §c${t.name}§f?`)
    .button("§4BAN")
    .button("§aCANCEL")
    .show(a)
    .then(r => {
      if (r.canceled || r.selection !== 0) return;

      if (owner(t.name))
        return a.sendMessage(
          "§cYou cannot ban the owner."
        );

      add("admin_banned_players", t.name);
      a.sendMessage(`§4Banned §c${t.name}`);

      try {
        t.runCommand(
          `kick "${t.name}" §cBanned by ${OWNER}`
        );
      } catch {}
    })
    .catch(() => {});
}

function ok(m) {
  return {
    status: CustomCommandStatus.Success,
    message: m
  };
}

function no(m) {
  return {
    status: CustomCommandStatus.Failure,
    message: m
  };
}

function cmd(p, c, a = []) {
  if (!owner(p.name))
    return no("No permission.");

  const n = a[0];
  const t = find(n);

  switch (c) {
    case "bangear":
      gear(p);
      break;

    case "banarmor":
      armor(p);
      break;

    case "bantools":
      [I.pick, I.axe, I.shovel, I.hoe]
        .forEach(x => give(p, x));

      p.sendMessage("§4[Admin] Ban Tools given.");
      break;

    case "bansword":
      give(p, I.sword);
      p.sendMessage("§4Ban Sword given.");
      break;

    case "banhelmet":
      give(p, I.helmet);
      break;

    case "banchest":
      give(p, I.chest);
      break;

    case "banlegs":
      give(p, I.legs);
      break;

    case "banboots":
      give(p, I.boots);
      break;

    case "banpick":
      give(p, I.pick);
      break;

    case "banaxe":
      give(p, I.axe);
      break;

    case "banshovel":
      give(p, I.shovel);
      break;

    case "banhoe":
      give(p, I.hoe);
      break;

    case "ban":
      if (!n)
        return no("Usage: /admin:ban <player>");

      if (owner(n))
        return no("You cannot ban the owner.");

      t
        ? confirmBan(p, t)
        : (
            add("admin_banned_players", n),
            p.sendMessage(`§4Banned §c${n}`)
          );
      break;

    case "unban":
      n
        ? (
            del("admin_banned_players", n)
              ? p.sendMessage(`§aUnbanned §f${n}`)
              : p.sendMessage(`§e${n} was not banned.`)
          )
        : null;
      break;

    case "kick":
      if (!n)
        return no("Usage: /admin:kick <player>");

      if (owner(n))
        return no("You cannot kick the owner.");

      add("admin_kicked_players", n);

      if (t) {
        try {
          t.runCommand(
            `kick "${t.name}" §eKicked by ${OWNER}`
          );
        } catch {}
      }

      p.sendMessage(`§eKicked §f${n}`);
      break;

    case "unkick":
      n
        ? (
            del("admin_kicked_players", n)
              ? p.sendMessage(
                  `§a${n} can join again.`
                )
              : p.sendMessage(
                  `§e${n} is not kick-blocked.`
                )
          )
        : null;
      break;

    case "banlist":
      p.sendMessage(
        list("admin_banned_players").length
          ? `§4Banned: §c${list(
              "admin_banned_players"
            ).join(", ")}`
          : "§aBan list empty."
      );
      break;

    case "kicklist":
      p.sendMessage(
        list("admin_kicked_players").length
          ? `§eKick-blocked: §f${list(
              "admin_kicked_players"
            ).join(", ")}`
          : "§aKick list empty."
      );
      break;

    case "clearbans":
      save("admin_banned_players", []);
      p.sendMessage("§aAll bans cleared.");
      break;

    case "clearkicks":
      save("admin_kicked_players", []);
      p.sendMessage("§aAll kick blocks cleared.");
      break;

    case "god":
      god.has(p.id)
        ? (
            god.delete(p.id),
            p.sendMessage("§cGod OFF")
          )
        : (
            god.add(p.id),
            p.sendMessage("§aGod ON")
          );
      break;

    case "vanish":
      vanish.has(p.id)
        ? (
            vanish.delete(p.id),
            p.removeEffect("invisibility"),
            p.sendMessage("§cVanish OFF")
          )
        : (
            vanish.add(p.id),
            p.addEffect(
              "invisibility",
              999999,
              {
                amplifier: 1,
                showParticles: false
              }
            ),
            p.sendMessage("§aVanish ON")
          );
      break;

    case "fly":
      fly.has(p.id)
        ? (
            fly.delete(p.id),
            p.runCommand("ability @s mayfly false"),
            p.sendMessage("§cFly OFF")
          )
        : (
            fly.add(p.id),
            p.runCommand("ability @s mayfly true"),
            p.sendMessage("§aFly ON")
          );
      break;

    case "tp":
      if (!t)
        return no("Player not found.");

      p.teleport(t.location, {
        dimension: t.dimension
      });
      break;

    case "tphere":
      if (!t)
        return no("Player not found.");

      t.teleport(p.location, {
        dimension: p.dimension
      });
      break;

    case "tpall":
      world.getAllPlayers().forEach(x => {
        if (x.id != p.id) {
          x.teleport(p.location, {
            dimension: p.dimension
          });
        }
      });
      break;

    case "smite":
      if (!t)
        return no("Player not found.");

      try {
        t.dimension.spawnEntity(
          "minecraft:lightning_bolt",
          t.location
        );
      } catch {}
      break;

    case "nuke":
      try {
        p.dimension.createExplosion(
          p.location,
          10,
          {
            breaksBlocks: true,
            causesFire: true
          }
        );
      } catch {}
      break;

    case "freeze":
      if (!t)
        return no("Player not found.");

      freeze.has(t.id)
        ? (
            freeze.delete(t.id),
            t.removeEffect("slowness"),
            t.removeEffect("mining_fatigue"),
            p.sendMessage(`§aUnfroze ${t.name}`)
          )
        : (
            freeze.add(t.id),
            t.addEffect(
              "slowness",
              999999,
              {
                amplifier: 255,
                showParticles: false
              }
            ),
            t.addEffect(
              "mining_fatigue",
              999999,
              {
                amplifier: 255,
                showParticles: false
              }
            ),
            p.sendMessage(`§bFroze ${t.name}`)
          );
      break;

    case "mute":
      if (!t)
        return no("Player not found.");

      mute.has(t.id)
        ? (
            mute.delete(t.id),
            p.sendMessage(`§aUnmuted ${t.name}`)
          )
        : (
            mute.add(t.id),
            p.sendMessage(`§cMuted ${t.name}`)
          );
      break;

    case "speed":
      p.addEffect(
        "speed",
        6000,
        {
          amplifier: 5,
          showParticles: false
        }
      );
      break;

    case "jump":
      p.addEffect(
        "jump_boost",
        6000,
        {
          amplifier: 5,
          showParticles: false
        }
      );
      break;

    case "heal":
      p.runCommand(
        "effect @s instant_health 1 255 true"
      );
      p.runCommand(
        "effect @s saturation 1 255 true"
      );
      break;

    case "feed":
      p.runCommand(
        "effect @s saturation 1 255 true"
      );
      break;

    case "help":
      p.sendMessage(
        "§6/admin:bangear §e/admin:banarmor §e/admin:bantools §e/admin:bansword"
      );

      p.sendMessage(
        "§e/admin:ban <player> §e/admin:unban <player> §e/admin:kick <player> §e/admin:unkick <player>"
      );

      p.sendMessage(
        "§e/admin:banlist §e/admin:kicklist §e/admin:clearbans §e/admin:clearkicks"
      );

      p.sendMessage(
        "§a/admin:god §a/admin:vanish §a/admin:fly §a/admin:tp <player> §a/admin:tphere <player> §a/admin:tpall"
      );

      p.sendMessage(
        "§c/admin:smite <player> §c/admin:nuke §c/admin:freeze <player> §c/admin:mute <player>"
      );

      p.sendMessage(
        "§b/admin:speed §b/admin:jump §b/admin:heal §b/admin:feed"
      );
      break;

    default:
      return no(
        "Unknown command. Use /admin:help"
      );
  }

  return ok("Done.");
}

const cmds = [
  "bangear",
  "banarmor",
  "bantools",
  "bansword",
  "banhelmet",
  "banchest",
  "banlegs",
  "banboots",
  "banpick",
  "banaxe",
  "banshovel",
  "banhoe",
  "ban",
  "unban",
  "kick",
  "unkick",
  "banlist",
  "kicklist",
  "clearbans",
  "clearkicks",
  "god",
  "vanish",
  "fly",
  "tp",
  "tphere",
  "tpall",
  "smite",
  "nuke",
  "freeze",
  "mute",
  "speed",
  "jump",
  "heal",
  "feed",
  "help"
];

system.beforeEvents.startup.subscribe(e => {
  for (const c of cmds) {
    const d = {
      name: `admin:${c}`,
      description: `Admin command: ${c}`,
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false
    };

    if (
      [
        "ban",
        "unban",
        "kick",
        "unkick",
        "tp",
        "tphere",
        "smite",
        "freeze",
        "mute"
      ].includes(c)
    ) {
      d.mandatoryParameters = [
        {
          name: "player",
          type: CustomCommandParamType.String
        }
      ];
    }

    e.customCommandRegistry.registerCommand(
      d,
      (o, a) => {
        const p = o.sourceEntity;

        return p?.typeId == "minecraft:player"
          ? cmd(p, c, a)
          : no("Players only.");
      }
    );
  }
});

world.afterEvents.playerSpawn.subscribe(e => {
  const p = e.player;

  if (!e.initialSpawn) return;

  if (banned(p.name)) {
    return system.runTimeout(() => {
      try {
        p.runCommand(
          `kick "${p.name}" §cBanned by ${OWNER}`
        );
      } catch {}
    }, 10);
  }

  if (kicked(p.name)) {
    return system.runTimeout(() => {
      try {
        p.runCommand(
          `kick "${p.name}" §eYou are currently kick-blocked.`
        );
      } catch {}
    }, 10);
  }

  if (admin(p.name)) {
    system.runTimeout(() => {
      op(p);

      if (owner(p.name)) {
        gear(p);
        p.sendMessage(
          "§6Use §e/admin:help §6for commands."
        );
      }
    }, 40);
  }
});

system.runInterval(() => {
  world.getAllPlayers().forEach(p => {
    if (admin(p.name))
      op(p);

    if (vanish.has(p.id)) {
      p.addEffect(
        "invisibility",
        100,
        {
          amplifier: 1,
          showParticles: false
        }
      );
    }

    if (freeze.has(p.id)) {
      p.addEffect(
        "slowness",
        100,
        {
          amplifier: 255,
          showParticles: false
        }
      );

      p.addEffect(
        "mining_fatigue",
        100,
        {
          amplifier: 255,
          showParticles: false
        }
      );
    }

    // Keep Ban Sword at full durability.
    try {
      const inv =
        p.getComponent(
          "minecraft:inventory"
        )?.container;

      if (!inv) return;

      for (let i = 0; i < inv.size; i++) {
        const item = inv.getItem(i);

        if (item?.typeId !== I.sword) continue;

        const durability =
          item.getComponent(
            "minecraft:durability"
          );

        if (durability) {
          durability.damage = 0;
          inv.setItem(i, item);
        }
      }
    } catch {}
  });
}, 40);

world.beforeEvents.entityHurt.subscribe(e => {
  const p = e.hurtEntity;

  if (
    p.typeId == "minecraft:player" &&
    owner(p.name) &&
    god.has(p.id)
  ) {
    e.cancel = true;
  }
});

// Ban Sword: instantly kill any player it hits.
world.beforeEvents.entityHurt.subscribe(e => {
  const a = e.damageSource?.damagingEntity;
  const t = e.hurtEntity;

  if (
    !a ||
    a.typeId != "minecraft:player" ||
    !t ||
    t.typeId != "minecraft:player" ||
    !owner(a.name)
  ) {
    return;
  }

  try {
    const w = a
      .getComponent("minecraft:equippable")
      .getEquipment(EquipmentSlot.Mainhand);

    if (w?.typeId !== I.sword) return;

    // Prevent normal damage.
    e.cancel = true;

    // Instantly kill the target after the hurt event.
    system.run(() => {
      if (!t.isValid) return;

      try {
        t.kill();
      } catch {
        try {
          t.runCommand(
            "damage @s 999999 void"
          );
        } catch {}
      }
    });
  } catch {}
});

world.beforeEvents.chatSend.subscribe(e => {
  if (mute.has(e.sender.id)) {
    e.cancel = true;
    e.sender.sendMessage("§cYou are muted.");
  }
});

console.warn("[Admin] Loaded.");
