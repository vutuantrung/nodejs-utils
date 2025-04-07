const fs = require('fs');
const path = require('path');
const PlatformServices = require('../platform-common/services.js')
const { getCurrentDate } = require('../platform-common/helper.js')

class RedgifsServices extends PlatformServices {
    constructor() {
        super('[RedgifsServices]', '');
    }

    readDataFromInput() {
        const inputPath = path.join(process.cwd(), 'platform-redgifs', 'data', 'input.txt');
        const buffer = fs.readFileSync(inputPath);
        return buffer;
    }

    readDataFromOutput(fileName) {
        const outputPath = path.join(process.cwd(), 'platform-redgifs', 'data', fileName);
        const buffer = fs.readFileSync(outputPath);
        return buffer;
    }

    writeData(data) {
        const currentTime = getCurrentDate();
        const outputName = 'output_' + currentTime.toString() + '.json';
        const outputPath = path.join(process.cwd(), 'platform-redgifs', 'data', outputName);
        fs.writeFileSync(outputPath, JSON.stringify(data));
    }

    cleanOutput(buffer) {
        return JSON.parse(buffer);
    }

    cleanInput(buffer) {
        const bufferString = buffer.toString();
        if (!bufferString) {
            console.warn('No data to extract');
            return [];
        }

        return bufferString
            .replaceAll('https://www.redgifs.com/', '')
            .replaceAll('\r', '')
            .split('\n');
    }

    cleanData(items) {
        return items.filter((item) => {
            return item.type !== 'watch';
        })
    }

    extractData(items) {
        return items.map((item) => {
            const val = item.split('/');
            return {
                type: val[0],
                value: val[1]
            }
        })
    }

    rebuildUrl(items) {
        const redgifsUrlSample = 'https://www.redgifs.com/#category#/#value#';
        return items.map((item) => {
            return redgifsUrlSample
                .replace('#category#', item.type)
                .replace('#value#', item.value);
        })
    }

    extractDataFromInput() {
        const buffer = this.readDataFromInput();
        const cleanedInput = this.cleanInput(buffer);
        const data = this.extractData(cleanedInput);
        const cleanedData = this.cleanData(data);

        this.writeData(cleanedData);
    }

    restoreDataFromOutput(fileName) {
        if (!fileName) {
            console.log('Invalid file name.');
        }
        const buffer = this.readDataFromOutput(fileName);
        const cleanedOutput = this.cleanOutput(buffer);
        const urls = this.rebuildUrl(cleanedOutput);
        return urls;
    }
}

module.exports = RedgifsServices;