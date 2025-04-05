const path = require('path');
const fs = require('fs');
const { removeDuplicateUrls: rDupYt } = require('./services/youtubeServices');
const { removeDuplicateUrls: rDupRule34 } = require('./services/rule34Services');
console.log(__dirname);

const WATCHING_YOUTUBE_URLS = 'C:/Users/TRUNG/Downloads/watching_youtube.txt';
const WATCHING_RULE34_URLS = 'C:/Users/TRUNG/Downloads/watching_rule34.txt';
const WATCHING_URLS = 'C:/Users/TRUNG/Downloads/watching_urls.txt';

const URLS_SOURCE = __dirname + '/data/urls.txt';
const urlString = fs.readFileSync(URLS_SOURCE, 'utf-8');
const urls = urlString.replaceAll('\r', '').split('\n');

let treat_youtube = true,
    treat_rule34 = true;

const externalRule34Urls = urls.filter((url) => url.includes('rule34.xxx'));
const externalYoutubeUrls = urls.filter((url) => url.startsWith('https://www.youtube.com'));

const specificUrls = [...externalRule34Urls, ...externalYoutubeUrls];
const otherUrls = urls.filter((url) => !specificUrls.includes(url));

fs.writeFileSync(WATCHING_URLS, otherUrls.join('\n'));

if (treat_youtube) rDupYt(WATCHING_YOUTUBE_URLS, WATCHING_YOUTUBE_URLS, externalYoutubeUrls);
if (treat_rule34) rDupRule34(WATCHING_RULE34_URLS, WATCHING_RULE34_URLS, externalRule34Urls);
