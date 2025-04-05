const fs = require('fs');
const path = require('path');
const moment = require('moment');
const pathProject = process.cwd();

const TAG = 'YOUTUBE';
const CONFIG = {
    inputPath: path.join(pathProject, "savefiles", "youtubeUrls.txt"),
    outputPath: path.join(pathProject, "savefiles", "youtubeUrls.txt"),
}

function removeDuplicateUrls(externalUrls = []) {
    let data = fs.readFileSync(CONFIG.inputPath, 'utf-8');
    if (!data) {
        console.log(TAG, 'File not found', CONFIG.inputPath);
        return;
    }

    data = data
        .replaceAll('\r', '')
        .split('\n')
        .concat(externalUrls)
        .filter((e) => {
            if (!e) return false;
            if (!e.startsWith('https://www.youtube.com')) return false;

            return true;
        })
        .map((e) => {
            const orgUrl = e.split('&')[0].replace('/videos', '');
            return orgUrl;
        });
    console.log('Finish treating url array', data.length, 'url found');

    /// CREATING SET
    data = Array.from(new Set(data));
    console.log('Finish removing dup from url array', data.length, 'url found');

    /// FILTER
    const page = [],
        watch = [],
        search = [],
        shorts = [],
        unknown = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i].startsWith('https://www.youtube.com/watch')) {
            watch.push(data[i]);
            continue;
        }
        if (data[i].startsWith('https://www.youtube.com/results')) {
            search.push(data[i]);
            continue;
        }
        if (data[i].startsWith('https://www.youtube.com/shorts')) {
            shorts.push(data[i]);
            continue;
        }
        if (data[i].startsWith('https://www.youtube.com/@')) {
            page.push(data[i]);
            continue;
        }
        unknown.push(data[i]);
    }

    /// SAVE IN FILE
    if (fs.existsSync(CONFIG.outputPath)) {
        fs.unlinkSync(CONFIG.outputPath);
    }
    fs.writeFileSync(CONFIG.outputPath, '');
    fs.appendFileSync(CONFIG.outputPath, `[updated_time] ${moment().format('YYYY-MM-DD')}\r\n\r\n`);

    if (page.length > 0) {
        fs.appendFileSync(CONFIG.outputPath, '[page]\r\n');
        for (let i = 0; i < page.length; i++) {
            fs.appendFileSync(CONFIG.outputPath, page[i] + '\r\n');
        }
        fs.appendFileSync(CONFIG.outputPath, '\r\n');
        console.log('Finish writing data to file by style page', page.length, 'url');
    }

    if (watch.length > 0) {
        fs.appendFileSync(CONFIG.outputPath, '[watch]\r\n');
        for (let i = 0; i < watch.length; i++) {
            fs.appendFileSync(CONFIG.outputPath, watch[i] + '\r\n');
        }
        fs.appendFileSync(CONFIG.outputPath, '\r\n');
        console.log('Finish writing data to file by style watch', watch.length, 'url');
    }

    if (search.length > 0) {
        fs.appendFileSync(CONFIG.outputPath, '[search]\r\n');
        for (let i = 0; i < search.length; i++) {
            fs.appendFileSync(CONFIG.outputPath, search[i] + '\r\n');
        }
        fs.appendFileSync(CONFIG.outputPath, '\r\n');
        console.log('Finish writing data to file by style search', search.length, 'url');
    }

    if (shorts.length > 0) {
        fs.appendFileSync(CONFIG.outputPath, '[shorts]\r\n');
        for (let i = 0; i < shorts.length; i++) {
            fs.appendFileSync(CONFIG.outputPath, shorts[i] + '\r\n');
        }
        fs.appendFileSync(CONFIG.outputPath, '\r\n');
        console.log('Finish writing data to file by style short', shorts.length, 'url');
    }

    if (unknown.length > 0) {
        fs.appendFileSync(CONFIG.outputPath, '[unknown]\r\n');
        for (let i = 0; i < unknown.length; i++) {
            fs.appendFileSync(CONFIG.outputPath, unknown[i] + '\r\n');
        }
        fs.appendFileSync(CONFIG.outputPath, '\r\n');
        console.log('Finish writing data to file by style unknown', unknown.length, 'url');
    }
}

removeDuplicateUrls();

const testString = "[p1] asdfae [p2]a sfaeg [p3] asfgegasd".split(/\[p1\]|\[p2\]|\[p3\]/).filter(e => e).map(e => e.trim());
console.log(testString);
