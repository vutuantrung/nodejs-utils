const { default: axios } = require('axios');

async function getAsync(url, headers, params) {
    try {
        const response = await axios.get(url, {
            headers: headers,
            params: params,
        });
        return response;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function postAsync(url, data, headers, params) {
    try {
        const response = await axios.post(
            url,
            { body: data },
            { headers: headers, params: params }
        );
        return response;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function putAsync() {}

async function patchAsync() {}

async function deleteAsync() {}

module.exports = { getAsync, postAsync, putAsync, patchAsync, deleteAsync };
