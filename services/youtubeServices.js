const fs = require('fs');
const path = require('path');
const moment = require('moment');
const ytdl = require('ytdl-core');
const { secondsToHms } = require('../helpers');
const { getAsync } = require('../apiHelpers');
const sanitize = require('sanitize-filename');
const axios = require('axios');

const TAG = 'YOUTUBE';

async function fetchVideoDataYLTD(url) {
    const options = { quality: 'highest' };
    const info = await ytdl.getInfo(url);
    const jsonValue = JSON.parse(JSON.stringify(info));

    const videoId = jsonValue['videoDetails']['videoId'];
    const dataVideoDetails = {
        title: jsonValue['videoDetails']['title'],
        embed: jsonValue['videoDetails']['embed'],
        viewCount: jsonValue['videoDetails']['viewCount'],
        uploadDate: moment(jsonValue['videoDetails']['uploadDate']).format('DD-MM-YYYY hh:mm:ss'),
        publishDate: moment(jsonValue['videoDetails']['publishDate']).format('DD-MM-YYYY hh:mm:ss'),
        lengthSeconds: secondsToHms(jsonValue['videoDetails']['lengthSeconds']),
        description: jsonValue['videoDetails']['description'],
        video_url: jsonValue['videoDetails']['video_url'],
        thumbnails: jsonValue['videoDetails']['thumbnails'],
    };

    const dataVideoFormat = jsonValue['formats'].map((val) => ({
        url: val['url'],
        mimeType: val['mimeType'],
        bitrate: val['bitrate'],
        fps: val['fps'],
        qualityLabel: val['qualityLabel'],
        width: val['width'],
        height: val['height'],
        contentLength: val['contentLength'],
        quality: val['quality'],
        projectionType: val['projectionType'],
        hasVideo: val['hasVideo'],
        hasAudio: val['hasAudio'],
    }));

    const staticalData = await getAsync('https://returnyoutubedislikeapi.com/votes?videoId=' + videoId);

    const videoData = {
        ...dataVideoDetails,
        ...staticalData.data,
        formats: dataVideoFormat,
    };

    fs.writeFileSync('videoData.json', JSON.stringify(videoData));

    return videoData;
}

module.exports = { fetchVideoDataYLTD };
