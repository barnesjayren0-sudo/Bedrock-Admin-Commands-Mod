import{world,system,EquipmentSlot,ItemStack}from"@minecraft/server";

const ADMINS=["thewarrior3648","RagedJam3832"],OWNER="thewarrior3648",PREFIX="!";
const BAN_ITEMS={sword:"admin:ban_sword",helmet:"admin:ban_helmet",chestplate:"admin:ban_chestplate",leggings:"admin:ban_leggings",boots:"admin:ban_boots",pickaxe:"admin:ban_pickaxe",axe:"admin:ban_axe",shovel:"admin:ban_shovel",hoe:"admin:ban_hoe"};
const BAN_ARMOR=[BAN_ITEMS.helmet,BAN_ITEMS.chestplate,BAN_ITEMS.leggings,BAN_ITEMS.boots];
const godMode=new Set(),vanished=new Set(),flying=new Set(),frozen=new Set(),muted=new Set();

const isAdmin=n=>ADMINS.some(a=>a.toLowerCase()==n.toLowerCase());
const isOwner=n=>n.toLowerCase()==OWNER.toLowerCase();
const findPlayer=n=>world.getAllPlayers().find(p=>p.name.toLowerCase()==n.toLowerCase());

function db(key){
 try{let x=world.getDynamicProperty(key);return typeof x=="string"?JSON.parse(x):[]}catch{return[]}
}
function save(key,x){try{world.setDynamicProperty(key,JSON.stringify(x))}catch{}}
function add(key,n){let x=db(key),l=n.toLowerCase();if(!x.includes(l)){x.push(l);save(key,x);return true}return false}
function rem(key,n){let x=db(key),i=x.indexOf(n.toLowerCase());if(i>-1){x.splice(i,1);save(key,x);return true}return false}
const banned=n=>db("admin_banned_players").includes(n.toLowerCase());
const kicked=n=>db("admin_kicked_players").includes(n.toLowerCase());

function grantOp(p){try{p.runCommand("op @s")}catch{try{world.getDimension("overworld").runCommand(`op "${p.name}"`)}catch{}}}
function ban(n){return add("admin_banned_players",n)}
function unban(n){return rem("admin_banned_players",n)}
function kickBlock(n){return add("admin_kicked_players",n)}
function unkick(n){return rem("admin_kicked_players",n)}

function wearing(p){
 try{
  const e=p.getComponent("minecraft:equippable");if(!e)return false;
  return[EquipmentSlot.Head,EquipmentSlot.Chest,EquipmentSlot.Legs,EquipmentSlot.Feet].some(s=>{let i=e.getEquipment(s);return i&&BAN_ARMOR.includes(i.typeId)})
 }catch{return false}
}

function give(p,id){
 try{
  const c=p.getComponent("minecraft:inventory")?.container;if(!c)return;
  for(let i=0;i<c.size;i++){let x=c.getItem(i);if(x&&x.typeId==id)c.setItem(i,undefined)}
  c.addItem(new ItemStack(id,1))
 }catch{}
}
function armor(p){for(let x of[ BAN_ITEMS.helmet,BAN_ITEMS.chestplate,BAN_ITEMS.leggings,BAN_ITEMS.boots])give(p,x);p.sendMessage("§4[Admin] Full Ban Armor given.")}
function tools(p){for(let x of[BAN_ITEMS.sword,BAN_ITEMS.pickaxe,BAN_ITEMS.axe,BAN_ITEMS.shovel,BAN_ITEMS.hoe])give(p,x);p.sendMessage("§4[Admin] Full Ban Tools given.")}
function gear(p){armor(p);tools(p);p.sendMessage("§4§l[Admin] Complete Ban Gear given.")}

function cmd(p,m){
 if(!isOwner(p.name))return p.sendMessage("§cYou do not have permission to use admin commands.");
 let a=m.slice(1).trim().split(/\s+/),c=(a[0]||"").toLowerCase(),n=a[1],t=findPlayer(n);
 switch(c){

 case"bangear":case"gear":gear(p);break;
 case"banarmor":case"armor":armor(p);break;
 case"bantools":case"tools":tools(p);break;
 case"bansword":case"sword":give(p,BAN_ITEMS.sword);p.sendMessage("§aBan Sword given.");break;
 case"banhelmet":case"helmet":give(p,BAN_ITEMS.helmet);p.sendMessage("§aBan Helmet given.");break;
 case"banchest":case"chestplate":give(p,BAN_ITEMS.chestplate);p.sendMessage("§aBan Chestplate given.");break;
 case"banlegs":case"leggings":give(p,BAN_ITEMS.leggings);p.sendMessage("§aBan Leggings given.");break;
 case"banboots":case"boots":give(p,BAN_ITEMS.boots);p.sendMessage("§aBan Boots given.");break;
 case"banpick":case"pickaxe":give(p,BAN_ITEMS.pickaxe);p.sendMessage("§aBan Pickaxe given.");break;
 case"banaxe":case"axe":give(p,BAN_ITEMS.axe);p.sendMessage("§aBan Axe given.");break;
 case"banshovel":case"shovel":give(p,BAN_ITEMS.shovel);p.sendMessage("§aBan Shovel given.");break;
 case"banhoe":case"hoe":give(p,BAN_ITEMS.hoe);p.sendMessage("§aBan Hoe given.");break;

 case"ban":
  if(!n)return p.sendMessage("§cUsage: !ban <player>");
  if(n.toLowerCase()==OWNER.toLowerCase())return p.sendMessage("§cYou cannot ban the owner.");
  if(ban(n)){p.sendMessage(`§4Banned §c${n}`);if(t)try{t.runCommand(`kick "${t.name}" §cBanned by ${OWNER}`)}catch{}}
  else p.sendMessage(`§e${n} is already banned.`);
 break;

 case"unban":
  if(!n)return p.sendMessage("§cUsage: !unban <player>");
  p.sendMessage(unban(n)?`§aUnbanned §f${n}`:`§e${n} was not banned.`);break;

 case"kick":
  if(!n)return p.sendMessage("§cUsage: !kick <player>");
  if(n.toLowerCase()==OWNER.toLowerCase())return p.sendMessage("§cYou cannot kick the owner.");
  if(kickBlock(n)){if(t)try{t.runCommand(`kick "${t.name}" §eKicked by ${OWNER}`)}catch{}p.sendMessage(`§eKicked §f${n}`)}
  else p.sendMessage(`§e${n} is already kick-blocked.`);
 break;

 case"unkick":
  if(!n)return p.sendMessage("§cUsage: !unkick <player>");
  p.sendMessage(unkick(n)?`§aUnkick successful: §f${n} may join again.`:`§e${n} is not kick-blocked.`);break;

 case"banlist":case"bans":{let x=db("admin_banned_players");p.sendMessage(x.length?`§4Banned: §c${x.join(", ")}`:"§aBan list empty.");break}
 case"kicklist":case"kicks":{let x=db("admin_kicked_players");p.sendMessage(x.length?`§eKick-blocked: §f${x.join(", ")}`:"§aKick list empty.");break}
 case"clearbans":save("admin_banned_players",[]);p.sendMessage("§aAll bans cleared.");break;
 case"clearkicks":save("admin_kicked_players",[]);p.sendMessage("§aAll kick blocks cleared.");break;

 case"god":
  godMode.has(p.id)?(godMode.delete(p.id),p.sendMessage("§cGod Mode OFF")):(godMode.add(p.id),p.sendMessage("§aGod Mode ON"));break;

 case"vanish":case"v":
  if(vanished.has(p.id)){vanished.delete(p.id);try{p.removeEffect("invisibility")}catch{}p.sendMessage("§cVanish OFF")}
  else{vanished.add(p.id);try{p.addEffect("invisibility",999999,{amplifier:1,showParticles:false})}catch{}p.sendMessage("§aVanish ON")}break;

 case"fly":
  if(flying.has(p.id)){flying.delete(p.id);try{p.runCommand("ability @s mayfly false")}catch{}p.sendMessage("§cFly OFF")}
  else{flying.add(p.id);try{p.runCommand("ability @s mayfly true")}catch{}p.sendMessage("§aFly ON")}break;

 case"tp":
  if(!n)return p.sendMessage("§cUsage: !tp <player>");
  if(!t)return p.sendMessage("§cPlayer not found.");
  p.teleport(t.location,{dimension:t.dimension});p.sendMessage(`§aTeleported to ${t.name}`);break;

 case"tphere":
  if(!n)return p.sendMessage("§cUsage: !tphere <player>");
  if(!t)return p.sendMessage("§cPlayer not found.");
  t.teleport(p.location,{dimension:p.dimension});p.sendMessage(`§aTeleported ${t.name} to you`);break;

 case"tpall":
  for(let x of world.getAllPlayers())if(x.id!=p.id)x.teleport(p.location,{dimension:p.dimension});
  p.sendMessage("§aTeleported all players to you");break;

 case"smite":
  if(!n)return p.sendMessage("§cUsage: !smite <player>");
  if(!t)return p.sendMessage("§cPlayer not found.");
  try{t.dimension.spawnEntity("minecraft:lightning_bolt",t.location);p.sendMessage(`§eSmitten ${t.name}`)}catch{}break;

 case"nuke":
  try{p.dimension.createExplosion(p.location,10,{breaksBlocks:true,causesFire:true});p.sendMessage("§cNUKE activated")}catch{}break;

 case"freeze":
  if(!n)return p.sendMessage("§cUsage: !freeze <player>");
  if(!t)return p.sendMessage("§cPlayer not found.");
  if(frozen.has(t.id)){frozen.delete(t.id);try{t.removeEffect("slowness");t.removeEffect("mining_fatigue")}catch{}p.sendMessage(`§aUnfroze ${t.name}`)}
  else{frozen.add(t.id);try{t.addEffect("slowness",999999,{amplifier:255,showParticles:false});t.addEffect("mining_fatigue",999999,{amplifier:255,showParticles:false})}catch{}p.sendMessage(`§bFroze ${t.name}`)}break;

 case"mute":
  if(!n)return p.sendMessage("§cUsage: !mute <player>");
  if(!t)return p.sendMessage("§cPlayer not found.");
  muted.has(t.id)?(muted.delete(t.id),p.sendMessage(`§aUnmuted ${t.name}`)):(muted.add(t.id),p.sendMessage(`§cMuted ${t.name}`));break;

 case"speed":try{p.addEffect("speed",6000,{amplifier:5,showParticles:false});p.sendMessage("§aSpeed boost activated")}catch{}break;
 case"jump":try{p.addEffect("jump_boost",6000,{amplifier:5,showParticles:false});p.sendMessage("§aJump boost activated")}catch{}break;
 case"heal":try{p.runCommand("effect @s instant_health 1 255 true");p.runCommand("effect @s saturation 1 255 true");p.sendMessage("§aFully healed")}catch{}break;
 case"feed":try{p.runCommand("effect @s saturation 1 255 true");p.sendMessage("§aHunger filled")}catch{}break;

 case"adminhelp":case"help":
  ["§6========== ADMIN COMMANDS ==========","§e!bangear !banarmor !bantools !bansword","§e!ban <player> §7- Ban","§e!unban <player> §7- Unban","§e!kick <player> §7- Kick + block rejoin","§e!unkick <player> §7- Remove kick block","§e!banlist §7- Show bans","§e!kicklist §7- Show kick blocks","§e!clearbans §7- Clear bans","§e!clearkicks §7- Clear kick blocks","§a!god §7- Toggle invincibility","§a!vanish §7- Toggle invisibility","§a!fly §7- Toggle flying","§a!tp <player>","§a!tphere <player>","§a!tpall","§c!smite <player>","§c!nuke","§c!freeze <player>","§c!mute <player>","§b!speed !jump !heal !feed"].forEach(x=>p.sendMessage(x));break;

 default:p.sendMessage("§cUnknown command. Type !adminhelp");
 }
}

world.beforeEvents.chatSend.subscribe(e=>{
 let m=e.message.trim();if(!m.startsWith(PREFIX))return;
 let p=e.sender;e.cancel=true;
 if(muted.has(p.id))return p.sendMessage("§cYou are muted.");
 if(!isOwner(p.name))return p.sendMessage("§cCommands are locked to the owner.");
 system.run(()=>cmd(p,m));
});

world.afterEvents.playerSpawn.subscribe(e=>{
 let p=e.player;if(!e.initialSpawn)return;
 if(banned(p.name)||kicked(p.name)){
  system.runTimeout(()=>{try{p.runCommand(`kick "${p.name}" ${banned(p.name)?`§cBanned by ${OWNER}`:"§eYou are currently kick-blocked."}`)}catch{}},10);return;
 }
 if(isAdmin(p.name))system.runTimeout(()=>{
  grantOp(p);
  if(isOwner(p.name)){gear(p);p.sendMessage("§6Type §e!adminhelp §6for all commands.")}
 },40);
});

system.runInterval(()=>{
 for(let p of world.getAllPlayers()){
  if(isAdmin(p.name))try{p.runCommand("op @s")}catch{}
  if(vanished.has(p.id))try{p.addEffect("invisibility",100,{amplifier:1,showParticles:false})}catch{}
  if(frozen.has(p.id))try{
   p.addEffect("slowness",100,{amplifier:255,showParticles:false});
   p.addEffect("mining_fatigue",100,{amplifier:255,showParticles:false});
  }catch{}
 }
},40);

world.beforeEvents.entityHurt.subscribe(e=>{
 let x=e.hurtEntity;
 if(x.typeId=="minecraft:player"&&isOwner(x.name)&&(godMode.has(x.id)||wearing(x)))e.cancel=true,e.damage=0;
});

world.beforeEvents.entityHurt.subscribe(e=>{
 let h=e.hurtEntity,a=e.damageSource.damagingEntity;
 if(!a||a.typeId!="minecraft:player"||!isOwner(a.name))return;
 try{
  let w=a.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);
  if(!w||w.typeId!=BAN_ITEMS.sword)return;
  e.damage=999999;
  if(h.typeId=="minecraft:player"){
   let n=h.name;if(n.toLowerCase()==OWNER.toLowerCase())return;
   ban(n);a.sendMessage(`§4[Ban Sword] §c${n} killed & banned`);
   system.run(()=>{try{h.runCommand("kill @s")}catch{try{h.applyDamage(999999)}catch{}}});
   system.runTimeout(()=>{try{h.runCommand(`kick "${n}" §cBanned by Ban Sword`)}catch{}},5);
  }
 }catch{}
});

console.warn("[Admin Mod] Ban/Unban/Kick/Unkick system loaded.");
