const fs = require('fs');
const util = require('util');
const path = require('path');
const downloadAndSaveVideo = require('./lib/download-cli');
const vimeoMetaExtractor = require('./lib/vimeo-meta');

const readFile = util.promisify(fs.readFile);

async function loadBulkConfig() {
  const configFile = path.join(__dirname, '.bulkdownload');

  if (!fs.existsSync(configFile)) {
    console.log('No .bulkdownload file exists in the current directory');
    return null;
  }

  const bulkConfig = JSON.parse(await readFile(configFile, 'utf8'));
  return bulkConfig;
}

(async () => {
  const config = await loadBulkConfig();

  if (!config) return;

  const { saveDirectory, videos } = config;

  /* eslint-disable no-restricted-syntax, no-await-in-loop */
  for (const video of videos) {
    const rawVideoUrl = await vimeoMetaExtractor(video.url);
    await downloadAndSaveVideo(
      rawVideoUrl,
      path.join(saveDirectory, video.filename),
    );
  }
  /* eslint-enable no-restricted-syntax, no-await-in-loop */

  console.log('All the files has been downloaded.');
})();
