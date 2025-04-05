const fs = require('fs');
const moment = require('moment');
const TAG = 'RULE34';

function removeDuplicateUrls(filePath, destPath, externalUrls = []) {
    let data = fs.readFileSync(filePath, 'utf-8');
    if (!data) {
        console.log(TAG, 'File not found', filePath);
        return;
    }
    data = data
        .replaceAll('\r', '')
        .split('\n')
        .concat(externalUrls)
        .filter((e) => {
            if (!e) return false;
            if (!e.includes('rule34.xxx')) return false;

            return true;
        })
        .map((url) => {
            const treatingUrl = new URL(url);
            const params = new URLSearchParams(treatingUrl.search);
            // delete pid
            if (params.has('pid')) {
                params.delete('pid');
            }

            // remove dup in tags
            let hasMultiTag = false;
            if (params.has('tags')) {
                const filteredTags = params
                    .get('tags')
                    .split(' ')
                    .filter((e) => e);
                hasMultiTag = filteredTags.length > 1;
                const params_tags = Array.from(new Set(filteredTags)).reduce(
                    (acc, cur) => acc + ' ' + cur
                );
                params.set('tags', params_tags);
            }

            // check type
            let type = 'unknown';
            if (params.has('s')) type = params.get('s');
            if (hasMultiTag) type = 'list_multi';

            // reconstruct url
            const new_url = new URL(`${treatingUrl.origin}${treatingUrl.pathname}?` + params);

            return { type: type, url: new_url.href };
        });
    console.log('Finish treating url array', data.length, 'url found');

    /// CREATING SET
    const view = Array.from(
        new Set(data.filter((url) => url.type === 'view').map((url) => url.url))
    );
    const list = Array.from(
        new Set(data.filter((url) => url.type === 'list').map((url) => url.url))
    );
    const list_multi = Array.from(
        new Set(data.filter((url) => url.type === 'list_multi').map((url) => url.url))
    );
    const unknown = Array.from(
        new Set(data.filter((url) => url.type === 'unknown').map((url) => url.url))
    );

    /// SAVE IN FILE
    if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
    }
    fs.writeFileSync(destPath, '');
    fs.appendFileSync(destPath, `[updated_time] ${moment().format('YYYY-MM-DD')}\r\n\r\n`);

    if (view.length > 0) {
        fs.appendFileSync(destPath, '[view]\r\n');
        for (let i = 0; i < view.length; i++) {
            fs.appendFileSync(destPath, view[i] + '\r\n');
        }
        fs.appendFileSync(destPath, '\r\n');
        console.log('Finish writing data to file by style view', view.length, 'url');
    }

    if (list.length > 0) {
        fs.appendFileSync(destPath, '[list]\r\n');
        for (let i = 0; i < list.length; i++) {
            fs.appendFileSync(destPath, list[i] + '\r\n');
        }
        fs.appendFileSync(destPath, '\r\n');
        console.log('Finish writing data to file by style list', list.length, 'url');
    }

    if (list_multi.length > 0) {
        fs.appendFileSync(destPath, '[list_multi]\r\n');
        for (let i = 0; i < list_multi.length; i++) {
            fs.appendFileSync(destPath, list_multi[i] + '\r\n');
        }
        fs.appendFileSync(destPath, '\r\n');
        console.log('Finish writing data to file by style list_multi', list_multi.length, 'url');
    }

    if (unknown.length > 0) {
        fs.appendFileSync(destPath, '[unknown]\r\n');
        for (let i = 0; i < unknown.length; i++) {
            fs.appendFileSync(destPath, unknown[i] + '\r\n');
        }
        fs.appendFileSync(destPath, '\r\n');
        console.log('Finish writing data to file by style unknown', unknown.length, 'url');
    }
}

module.exports = { removeDuplicateUrls };
