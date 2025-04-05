const fs = require('fs');
const { getAsync } = require('../apiHelpers');

const TAG = '[INSTAGRAM]';

const cookies = ``;

async function getAllUserMedia(userId) {
    try {
        if (!userId) {
            throw new Error('Invalid user id');
        }

        let all_urls = [];
        let after = '';

        while (true) {
            const url = `https://www.instagram.com/graphql/query/?query_hash=396983faee97f4b49ccbe105b4daf7a0&variables={"id":"${userId}","first":50,"after":"${after}"}`;
            const response = await fetch(url);
            const json = await response.json();
            const edges = json?.data?.user?.edge_owner_to_timeline_media?.edges || [];

            const urls = [];
            edges.forEach((e) => {
                let childs = e.node?.edge_sidecar_to_children?.edges;
                if (childs) {
                    urls.push(...childs.map((c) => getBiggestMediaFromNode(c.node)));
                } else {
                    urls.push(getBiggestMediaFromNode(e.node));
                }
            });
            all_urls.push(...urls);
            const pageInfo = json?.data?.user?.edge_owner_to_timeline_media?.page_info;
            if (pageInfo?.has_next_page) {
                after = pageInfo?.end_cursor;
            } else {
                // Reach last page
                break;
            }
        }
        return all_urls;
    } catch (error) {
        console.log(TAG, '[getAllUserMedia]', error.message);
    }
}

async function getUserInformation(username) {
    try {
        if (!cookies) {
            throw new Error('Invalid cookies');
        }
        if (!username) {
            throw new Error('Invalid username');
        }

        const url = 'https://www.instagram.com/web/search/topsearch/?query=' + username;
        const response = await getAsync(url, { Cookie: cookies.replace(/\r?\n|\r/g, '') });

        return response.data;
    } catch (error) {
        console.log(TAG, '[getUserInformation]', error.message);
    }
}

// Utils
function getBiggestMediaFromNode(node) {
    if (!node.is_video) {
        const r = node.display_resources;
        return r[r.length - 1]?.src;
    }
    return getUniversalCdnUrl(node.video_url);
}

function getUniversalCdnUrl(cdnLink) {
    const cdn = new URL(cdnLink);
    cdn.host = 'scontent.cdninstagram.com';
    return cdn.href;
}

module.exports = { getAllUserMedia, getUserInformation };
