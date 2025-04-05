const fs = require('fs');
const path = require('path');
const moment = require('moment');
const sanitize = require('sanitize-filename');
const pathProject = process.cwd();

const TAG = 'YOUTUBE';
const CONFIG = {
    inputFilePath: path.join(pathProject, "savefiles", "youtubeDownloadUrls.txt"),
    successLogFilePath: path.join(pathProject, "savefiles", "youtubeDownloadSuccesss.log"),
    failedLogFilePath: path.join(pathProject, "savefiles", "youtubeDownloadFailed.log"),
    failedTxtFilePath: path.join(pathProject, "savefiles", "youtubeDownloadFailed.txt"),
}

// Main
async function downloadVideosByUrl() {
    const RETRY_MAX = 3;
    const urlsStringData = fs.readFileSync(CONFIG.inputFilePath, "utf-8");
    const urls = urlsStringData.split("\n").replaceAll("\r", "").map(e => e);

    if (!Array.isArray(urls) || urls.length === 0) {
        console.log(TAG, 'No urls found');
        return;
    }

    for (let i = 0; i < urls.length; i++) {
        console.log("Video url:", urls[i]);
        //// 0. Check if youtube video is already downloaded
        const videoDownloadSuccessUrls = fs.readFileSync(CONFIG.successLogFilePath, "utf-8");
        if (videoDownloadSuccessUrls.includes(urls[i])) {
            continue;
        }

        console.log("[TASK] Check video hasn't been downloaded => Fetch video information");

        //// 1. Get youtube video download url
        let retrievedData = null;
        for (let retryTime = 0; retryTime < RETRY_MAX; retryTime++) {
            const data = await fetchVideoData(urls[i]);
            if (data.success) {
                retrievedData = data;
                break;
            }

            console.log(TAG, `Retrying ${retryTime} time... (3s)`, data.error || data.message);
            await sleep(3000);
        }

        if (!retrievedData) {
            console.log(TAG, 'Error when fetching video data: ', urls[i]);
            appendTextToFile(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] [FETCHING] ${urls[i]}\r\n`, CONFIG.failedLogFilePath);
            appendTextToFile(`${urls[i]}\n`, CONFIG.failedTxtFilePath);
            console.log("\r\n\r\n");
            continue;
        }

        console.log("[TASK] Fetch video success => Find best video");

        //// 2. Get best video (highest resolution)
        const medias = retrievedData.medias.filter(m => m.type === 'video');
        const bestVideo =
            medias.find(m => m.quality === '4320p' && m.extension === 'mp4') ||
            medias.find(m => m.quality === '2160p' && m.extension === 'webm') ||
            medias.find(m => m.quality === '2160p60' && m.extension === 'webm') ||
            medias.find(m => m.quality === '1440p' && m.extension === 'webm') ||
            medias.find(m => m.quality === '1440p60' && m.extension === 'webm') ||
            medias.find(m => m.quality === '1080p' && m.extension === 'webm') ||
            medias.find(m => m.quality === '1080p60' && m.extension === 'webm') ||
            medias.find(m => m.quality === '1080p60' && m.extension === 'mp4') ||
            medias.find(m => m.quality === '1080p60' && m.extension === 'mp4');

        if (!bestVideo) {
            console.log(TAG, 'Error when getting best video: ', urls[i]);
            appendTextToFile(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] [FILTERING] ${urls[i]}\r\n`, CONFIG.failedLogFilePath);
            appendTextToFile(`${urls[i]}\n`, CONFIG.failedTxtFilePath);
            console.log("\r\n\r\n");
            continue;
        }
        // console.log('[bestVideo found]', bestVideo)
        console.log("[TASK] Best video found => Download");

        //// 3. Download video
        const saveDir = path.join(__dirname, '..', 'savefiles');
        const videoName = sanitize(`${retrievedData.title}.${bestVideo.extension}`);
        const videoPath = path.join(saveDir, videoName);


        const isVideoDownloaded = fs.existsSync(videoPath);
        if (isVideoDownloaded) {
            console.log(TAG, 'Video is already downloaded: ', urls[i]);
            appendTextToFile(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${urls[i]}\r\n`, CONFIG.successLogFilePath);
            console.log("\r\n\r\n");
            continue;
        }
        const videoUrl = bestVideo.url;
        try {
            await downloadVideo(videoUrl, videoPath);

            console.log(TAG, 'Download successfully', urls[i]);
            appendTextToFile(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${urls[i]}\r\n`, CONFIG.successLogFilePath);
        } catch (error) {
            console.log(TAG, 'Error when downloading video: ', urls[i], error.message);
            appendTextToFile(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] [DOWNLOAD] ${urls[i]}\r\n`, CONFIG.failedLogFilePath);
            appendTextToFile(`${urls[i]}\n`, CONFIG.failedTxtFilePath);
        }
        console.log("\r\n\r\n");
    }
}

// Utils
async function fetchVideoData(url) {
    const req = await fetch("https://www.clipto.com/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
    });

    if (!req.ok) {
        return { success: false, error: req.statusText };
    }
    const data = await req.json();
    // console.log(data)
    return data;
}

async function fetchVideoData(url) {
    const req = await fetch("https://www.clipto.com/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
    });

    if (!req.ok) {
        return { success: false, error: req.statusText };
    }
    const data = await req.json();
    // console.log(data)
    return data;
}

function appendTextToFile(text, filePath) {
    fs.appendFile(filePath, text, function (err) {
        if (err) throw err;
        console.log('Data appended to file!');
    });
}