const fs = require('fs');
const path = require('path');
const moment = require('moment');
const pathProject = process.cwd();

const TAG = 'YOUTUBE';
const CONFIG = {
    CONFIG_PATH: path.join(pathProject, "config.json"),
    YOUTUBE_URLS: path.join(pathProject, "savefiles", "youtubeUrls.txt"),
}

function loadDocumentFromDocuments() {
    if (!fs.existsSync(CONFIG.CONFIG_PATH)) {
        console.log("JSON file not found");
        return;
    }

    if (!fs.existsSync(CONFIG.YOUTUBE_URLS)) {
        console.log("Output file path not found");
        return;
    }

    const configString = fs.readFileSync(CONFIG.CONFIG_PATH, "utf-8");
    const config = JSON.parse(configString);

    if (!config.watchingYoutubeUrlsFilePath) {
        console.log("Document file path not found: watchingYoutubeUrlsFilePath");
        return;
    }

    const watchingUrlsString = fs.readFileSync(config.watchingYoutubeUrlsFilePath, "utf-8");
    if (watchingUrlsString) {
        fs.appendFileSync(CONFIG.YOUTUBE_URLS, '\n' + watchingUrlsString + '\n');
    }
    console.log("Finished !");
}

loadDocumentFromDocuments();