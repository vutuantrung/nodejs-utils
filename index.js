const express = require('express');
const app = express();
const port = 8000;
const cors = require('cors');
const fs = require('fs');
const moment = require('moment');
const { fetchVideoDataYLTD } = require('./services/youtubeServices');
const { getAllUserMedia, getUserInformation } = require('./services/instagramServices');

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.get('/instagram/getAllUserMedia', async (req, res) => {
	try {
		console.log('api /instagram/getAllUserMedia called.');
		const userId = req.query.userId;
		const data = await getAllUserMedia(userId);

		response = {
			status: 200,
			data: videoData,
			error: null,
		};

		res.send(data);
	} catch (error) {
	} finally {
		res.status(response.status ?? 401).send(response);
	}
});

app.get('/instagram/getUserInfor', async (req, res) => {
	console.log('api /instagram/getUserInfor called.');
	const username = req.query.username;
	const data = await getUserInformation(username);
	res.send(data);
});

app.post('/youtube/getYoutubeVideoData', async (req, res) => {
	let response;
	try {
		console.log('api /youtube/getYoutubeVideoData called.');
		const videoData = await fetchVideoDataYLTD(req.body.url);

		response = {
			status: 200,
			data: videoData,
			error: null,
		};
	} catch (error) {
		console.log('[getYoutubeVideoData]', error);
		const errorStatus = parseInt(error.message.split('Status code:')[1].trim());
		response = {
			status: errorStatus,
			data: null,
			error: error,
		};
	} finally {
		res.status(response.status ?? 401).send(response);
	}
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

process.title = 'helper server';
