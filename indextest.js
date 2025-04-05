const fs = require('fs');
const path = require("path")
const sanitize = require('sanitize-filename');
// const { getVideoData } = require('./youtubeServices');

// const gifData = fs.readFileSync("./redgifdata.json");
// const gifs = JSON.parse(gifData.toString());
// console.log(gifs.gifs.length);

// getVideoData("https://www.youtube.com/watch?v=TISf7ez-Tgg");


// const { parse } = require('node-html-parser');
// const { HTMLToJSON } = require('html-to-json-parser'); // CommonJS

const ytUrls2 = [
	"https://www.youtube.com/watch?v=PWfgJDz8moA",
	"https://www.youtube.com/watch?v=wzzgrNgykx8",
	"https://www.youtube.com/watch?v=nAIrIL1kiFY"
]

const { downloadVideosByUrl } = require('./services/youtubeServices');
const ytUrls = [
	"https://www.youtube.com/watch?v=PWfgJDz8moA",
	"https://www.youtube.com/watch?v=wzzgrNgykx8",
	"https://www.youtube.com/watch?v=nAIrIL1kiFY"
]
downloadVideosByUrl(ytUrls)