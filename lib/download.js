const fs = require('fs');
const request = require('request');
const CombinedStream = require('combined-stream');
const createChunk = require('./chunk');

function getDownloadSize(url) {
  return new Promise((resolve, reject) => {
    const rqSizeTest = request(url, { timeout: 1000 * 10 })
      .on('response', (res) => {
        if (!res.headers['accept-ranges']) {
          const err = new Error(
            "Missing 'accept-ranges' header. Unable to proceed with the download.",
          );
          err.code = 'MISSINGHEADER';
          reject(err);
          return;
        }
        const size = parseInt(res.headers['content-length'], 10);
        rqSizeTest.abort();
        resolve(size);
      })
      .on('error', err => reject(err));
  });
}

function initChunks(options) {
  const { url, totalSize, slices } = options;
  const bytesPerChunk = Math.floor(totalSize / slices);
  const chunks = [];

  let chunkCount = 1;

  for (
    let startOffset = 0;
    startOffset < totalSize;
    startOffset += bytesPerChunk
  ) {
    const endOffset = startOffset + bytesPerChunk >= totalSize
      ? totalSize - 1
      : startOffset + bytesPerChunk - 1;

    const chunk = createChunk({
      name: `chunk ${chunkCount}`,
      url,
      totalSize,
      startOffset,
      endOffset,
    });

    chunks.push(chunk);
    chunkCount += 1;
  }

  return chunks;
}

function mergeFiles(buffers, output) {
  return new Promise((resolve) => {
    const mb = 2 ** 20;
    const writeOpts = { highWaterMark: mb * 10 };
    const fileOutputStream = fs.createWriteStream(output, writeOpts);

    fileOutputStream.on('close', () => {
      resolve();
    });

    const combined = CombinedStream.create();
    buffers.forEach((buffer) => {
      buffer.stop();
      combined.append(buffer);
    });
    combined.pipe(fileOutputStream);
  });
}

async function download(options) {
  const {
    url, slices, output, progress, error,
  } = options;

  const totalSize = await getDownloadSize(url);

  const chunks = initChunks({
    url,
    totalSize,
    slices,
  });

  const progressEvent = () => {
    const bytesDownloaded = chunks.reduce(
      (acc, chunk) => acc + chunk.getBytesDownloaded(),
      0,
    );
    const percent = ((bytesDownloaded / totalSize) * 100).toFixed(2);
    if (progress) progress({ bytesDownloaded, totalSize, percent });
  };
  chunks.forEach((chunk) => {
    chunk.on('progress', progressEvent);
    chunk.on('error', error);
  });

  const chunksPromises = chunks.map(chunk => chunk.startDownload());
  await Promise.all(chunksPromises);

  const buffers = chunks.map(chunk => chunk.getBuffer());
  await mergeFiles(buffers, output);
}

module.exports = download;
