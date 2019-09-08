require('dotenv').config();
const downloadAndSaveVideo = require('./lib/download-cli');
const vimeoMetaExtractor = require('./lib/vimeo-meta');

(async () => {
  const { VIDEO_URL, OUTPUT_PATH } = process.env;

  const rawVideoUrl = await vimeoMetaExtractor(VIDEO_URL);
  await downloadAndSaveVideo(rawVideoUrl, OUTPUT_PATH);
})();
