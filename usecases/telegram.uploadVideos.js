const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram');
const fs = require('fs');
const input = require('input');
require('dotenv').config();

// Config
const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.SESSION || '');

const VIDEO_DIR = './videos'; // Folder with videos
const MAX_VIDEOS = 10;

(async () => {
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    console.log('⏳ Connecting...');
    await client.start({
        phoneNumber: async () => await input.text('📱 Phone number: '),
        password: async () => await input.text('🔐 2FA Password (if any): '),
        phoneCode: async () => await input.text('💬 Code from Telegram: '),
        onError: (err) => console.error(err),
    });

    console.log('✅ Connected as:', await client.getMe());
    const session = client.session.save();
    console.log('💾 Save this SESSION string:', session);

    // Save back to .env
    const envPath = '.env';
    const envText = fs.readFileSync(envPath, 'utf-8').split('\n')
        .map(line => line.startsWith('SESSION=') ? `SESSION=${session}` : line)
        .join('\n');
    fs.writeFileSync(envPath, envText);

    const channel = await client.getEntity(process.env.CHANNEL);
    const files = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.mp4')).slice(0, MAX_VIDEOS);

    if (files.length === 0) {
        console.log('❌ No videos found in videos/');
        return;
    }

    const mediaList = [];
    for (const file of files) {
        const filePath = `${VIDEO_DIR}/${file}`;
        console.log(`📤 Uploading ${file}...`);

        const uploaded = await client.uploadFile({ file: filePath, workers: 4 });
        mediaList.push({
            media: new Api.InputMediaUploadedDocument({
                file: uploaded,
                mimeType: 'video/mp4',
                attributes: [
                    new Api.DocumentAttributeVideo({ supportsStreaming: true }),
                ],
            }),
            message: `Uploaded: ${file}`,
        });
    }

    await client.invoke(
        new Api.messages.SendMultiMedia({
            peer: channel,
            multiMedia: mediaList,
        })
    );

    console.log('✅ Uploaded all videos successfully.');
})();
