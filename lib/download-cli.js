const fs = require('fs');
const path = require('path');
const ProgressBar = require('progress');
const download = require('./download');

function displayBytes(bytes) {
  const units = [
    { unit: 'TB', size: 2 ** 40 },
    { unit: 'GB', size: 2 ** 30 },
    { unit: 'MB', size: 2 ** 20 },
    { unit: 'KB', size: 2 ** 10 },
    { unit: 'B', size: 0 },
  ];
  const selectedUnit = units.find(unit => bytes >= unit.size);
  const convertedValue = (bytes / selectedUnit.size).toFixed(2);
  return `${convertedValue} ${selectedUnit.unit}`;
}

async function downloadAndSaveVideo(videoUrl, output) {
  let progressBar;

  const outputDir = path.dirname(output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const initProgressBar = (totalSize) => {
    progressBar = new ProgressBar(
      ' ⏩ :bar :rate KB/s :percent :etas [:downloaded / :size]',
      {
        complete: '▓',
        incomplete: '░',
        width: 30,
        total: Math.round(totalSize / 1024),
      },
    );
  };

  console.log(`Downloading: "${path.basename(output)}"`);

  await download({
    url: videoUrl,
    slices: 10,
    output,
    progress({ bytesDownloaded, totalSize }) {
      if (!progressBar) initProgressBar(totalSize);

      progressBar.update(bytesDownloaded / totalSize, {
        downloaded: displayBytes(bytesDownloaded),
        size: displayBytes(totalSize),
      });
    },
    error(err) {
      progressBar.interrupt(`An error has occured: ${err}`);
    },
  });

  console.log('Download finished');
}

module.exports = downloadAndSaveVideo;
