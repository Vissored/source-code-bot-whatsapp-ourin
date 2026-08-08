import { getDatabase } from "../../src/lib/ourin-database.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";

const pluginConfig = {
  name: "mutegc",
  alias: ["mutegrup", "mutebot", "blockbot", "lockbot"],
  category: "group",
  description: "Blokir command bot untuk semua orang (termasuk admin/owner), buka lagi dengan .unmutegc",
  usage: ".mutegc",
  example: ".mutegc",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  isBotAdmin: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const groupData = db.getGroup(m.chat) || {};

  if (groupData.mutegc) {
    return m.reply(
      `🔇 *Mute GC Sudah Aktif*\n\n` +
        `> Semua orang (termasuk admin & owner) tidak bisa menggunakan command bot\n` +
        `> Hanya command *${m.prefix}unmutegc* yang tetap bisa dipakai\n\n` +
        `_Ketik *${m.prefix}unmutegc* untuk membuka_`
    );
  }

  db.setGroup(m.chat, { mutegc: true });
  const ctx = saluranCtx();
  const groupName = m.groupMetadata?.subject || "grup ini";

  return m.reply(
    `🔇 *Mute GC Aktif*\n\n` +
      `> Grup: *${groupName}*\n` +
      `> Semua orang (termasuk admin & owner) tidak bisa menggunakan command bot\n` +
      `> Hanya command *${m.prefix}unmutegc* yang tetap bisa dipakai\n\n` +
      `_Ketik *${m.prefix}unmutegc* untuk membuka_`,
    { contextInfo: ctx }
  );
}

function isMutegc(groupJid, db) {
  const group = db.getGroup(groupJid) || {};
  return !!group.mutegc;
}

export { pluginConfig as config, handler, isMutegc };
