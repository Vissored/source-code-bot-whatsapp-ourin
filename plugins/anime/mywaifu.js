import fetch from "node-fetch";
import crypto from "crypto";
import { generateWAMessageFromContent, generateWAMessage, jidNormalizedUser } from "ourin";

const pluginConfig = {
    name: 'mywaifu',
    alias: ['waifuim', 'waifu', 'waifus'],
    category: 'anime',
    description: 'Mencari sekumpulan gambar waifu (SFW) menggunakan API Waifu.im.',
    usage: '.mywaifu sfw',
    example: '.mywaifu sfw',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true
};

async function handler(m, { sock, args }) {
    const mode = 'sfw';

    if (args[0] && args[0].toLowerCase() !== 'sfw') {
        return m.reply(
            `🌸 *PENCARI WAIFU* 🌸\n\n` +
            `Fitur ini akan mencarikan 10 gambar waifu spesial untukmu langsung dari Waifu.im dan menyatukannya dalam satu album rapi!\n\n` +
            `*CARA PENGGUNAAN:*\n` +
            `- Ketik \`${m.prefix}mywaifu sfw\` untuk gambar waifu yang aman.\n\n` +
            `_Mode dewasa tidak tersedia di bot ini._`
        );
    }

    try {
        await m.react('🕕');

        const isNsfw = mode === 'nsfw';
        const pageSize = 10;

        const params = new URLSearchParams({
            isNsfw: String(isNsfw),
            orderBy: "Random",
            page: "1",
            pageSize: String(pageSize)
        });

        const res = await fetch(`https://api.waifu.im/images?${params}`);
        if (!res.ok) {
            throw new Error(`Gagal mengambil data dari API (Status: ${res.status})`);
        }

        const data = await res.json();
        
        if (!data.items || data.items.length === 0) {
            await m.react('❌');
            return m.reply(`❌ *GAMBAR TIDAK DITEMUKAN*\n\nMaaf, sistem tidak dapat menemukan gambar untuk kategori *${mode.toUpperCase()}* saat ini.`);
        }

        const imageUrls = data.items.map(item => item.url);

        const captionText = `🌸 *KOLEKSI WAIFU (${mode.toUpperCase()})* 🌸\n\nSistem berhasil mendapatkan *${imageUrls.length}* gambar waifu spesial untukmu! Cek album di bawah ini untuk melihat koleksi lengkapnya! ✨`;
        await m.reply(captionText);

        const opener = generateWAMessageFromContent(
            m.chat,
            {
                messageContextInfo: { messageSecret: crypto.randomBytes(32) },
                albumMessage: {
                    expectedImageCount: imageUrls.length,
                    expectedVideoCount: 0,
                },
            },
            {
                userJid: jidNormalizedUser(sock.user.id),
                quoted: m,
                upload: sock.waUploadToServer,
            }
        );

        await sock.relayMessage(opener.key.remoteJid, opener.message, {
            messageId: opener.key.id,
        });

        for (const imgUrl of imageUrls) {
            const msg = await generateWAMessage(opener.key.remoteJid, { image: { url: imgUrl } }, {
                upload: sock.waUploadToServer,
            });

            msg.message.messageContextInfo = {
                messageSecret: crypto.randomBytes(32),
                messageAssociation: {
                    associationType: 1,
                    parentMessageKey: opener.key,
                },
            };

            await sock.relayMessage(msg.key.remoteJid, msg.message, {
                messageId: msg.key.id,
            });
        }

        await m.react('✅');

    } catch (error) {
        console.error("MyWaifu Error:", error);
        await m.react('❌');
        m.reply(`❌ *TERJADI KESALAHAN*\n\nMaaf, terjadi gangguan saat sistem mencoba memanggil API. Pesan error: _${error.message}_`);
    }
}

export { pluginConfig as config, handler };
