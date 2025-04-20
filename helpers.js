function secondsToHms(d) {
	d = Number(d);
	const h = Math.floor(d / 3600);
	const m = Math.floor(d % 3600 / 60);
	const s = Math.floor(d % 3600 % 60);

	const hDisplay = h > 0 ? h : "";
	const mDisplay = m > 0 ? m : "";
	const sDisplay = s > 0 ? s : "";

	const times = [hDisplay, mDisplay, sDisplay].filter(t => t);
	const value = times.reduce((acc, cur) => acc + ":" + cur);

	return value;
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { secondsToHms, sleep }