const { isImageUrl, sleep } = require("../helper");
const PlatformServices = require("../platform-common/services");

class JJGirlServices extends PlatformServices {
    BASE_IMAGE_TEMPLATE = 'https://jjgirls.com/japanese/#NAME#/#FOLDER#/#NAME#-#INDEX#.jpg';
    STEP = 10;
    constructor() {
        super('[JJGirlServices]', '');
    }

    async checkNameExist(name) {
        const firstImgUrl = this.BASE_IMAGE_TEMPLATE
            .replaceAll('#NAME#', name)
            .replaceAll('#FOLDER#', 1)
            .replaceAll('#INDEX#', 1);
        const isUrlValid = await isImageUrl(firstImgUrl);
        return isUrlValid;
    }

    async getLastFolder(name) {
        const stepUntilReachInvalid = async (step) => {
            let isImage = true;
            let curStepCount = 0;
            while (isImage) {
                const newImageUrl = this.BASE_IMAGE_TEMPLATE
                    .replaceAll('#NAME#', name)
                    .replaceAll('#FOLDER#', (++curStepCount * step).toString())
                    .replaceAll('#INDEX#', '1');
                isImage = await isImageUrl(newImageUrl);
                await sleep(1000);
                // console.log(curStepCount);
            }
            return curStepCount;
        }

        const chooseRange = async (min, max) => {
            if (max - min <= 1) {
                return { min, max }
            }
            const average = Math.round((max - min) / 2);
            const newImageUrl = this.BASE_IMAGE_TEMPLATE
                .replaceAll('#NAME#', name)
                .replaceAll('#FOLDER#', (min + average).toString())
                .replaceAll('#INDEX#', '1');
            const isImage = await isImageUrl(newImageUrl);
            await sleep(1000);
            if (isImage) {
                return { min: max - average, max: max }
            }
            return { min: min, max: min + average }
        }

        const getExactNumber = async (range, currentStepCount) => {
            if (currentStepCount === 1) {
                let isImage = true;
                let curIndex = 0;
                while (isImage) {
                    const newImageUrl = this.BASE_IMAGE_TEMPLATE
                        .replaceAll('#NAME#', name)
                        .replaceAll('#FOLDER#', (++curIndex).toString())
                        .replaceAll('#INDEX#', '1');
                    isImage = await isImageUrl(newImageUrl);
                    await sleep(1000);
                    // console.log(curIndex);
                }
                return curIndex;
            } else {
                let max = range * currentStepCount;
                let min = range * (currentStepCount - 1);
                if (max <= 0) throw new Error("Error: max");

                let values;
                while (max - min > 1) {
                    values = await chooseRange(min, max);
                    // console.log(values);
                    max = values.max;
                    min = values.min;
                }

                let isImage = true;
                const newImageUrl = this.BASE_IMAGE_TEMPLATE
                    .replaceAll('#NAME#', name)
                    .replaceAll('#FOLDER#', max.toString())
                    .replaceAll('#INDEX#', '1');
                isImage = await isImageUrl(newImageUrl);
                await sleep(1000);
                if (isImage) return max;
                return min;
            }
        }

        console.log("[STEP]", "Getting last folder index");
        const curStepCount = await stepUntilReachInvalid(this.STEP);
        const folderIndex = await getExactNumber(this.STEP, curStepCount);
        console.log('[curStepCount]', curStepCount, '[folderIndex]', folderIndex);

        // Check index
        console.log("[STEP]", "Getting last image index");
        let imageIndex = 12;
        let newImageUrl = this.BASE_IMAGE_TEMPLATE
            .replaceAll('#NAME#', name)
            .replaceAll('#FOLDER#', folderIndex.toString())
            .replaceAll('#INDEX#', imageIndex.toString());
        let isImage = await isImageUrl(newImageUrl);
        await sleep(1000);

        if (!isImage) {
            for (let i = 1; i <= 12; i++) {
                let newImageUrl = this.BASE_IMAGE_TEMPLATE
                    .replaceAll('#NAME#', name)
                    .replaceAll('#FOLDER#', folderIndex.toString())
                    .replaceAll('#INDEX#', i.toString());
                isImage = await isImageUrl(newImageUrl);
                await sleep(1000);

                if (!isImage) {
                    imageIndex = --imageIndex;
                    break;
                }
            }
        }

        console.log('[STEP]', 'Done. Name: ' + name + '. Last folder: ' + folderIndex + '. Last image index: ' + imageIndex + ']');
        return { 'name': name, 'folder': folderIndex, 'index': imageIndex }
    }
}

module.exports = JJGirlServices;