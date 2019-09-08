const request = require('request');
const streamBuffers = require('stream-buffers');
const EventEmitter = require('events');

class ChunkEmitter extends EventEmitter {}

function createStreamBuffer() {
  const mb = 2 ** 20;
  return new streamBuffers.ReadableStreamBuffer({
    initialSize: 1024 * 1024,
    incrementAmount: 1024 * 1024,
    frequency: 1,
    chunkSize: mb * 10,
  });
}

function createHttpRequest(options) {
  const {
    url,
    startOffset,
    endOffset,
    onDataReceive,
    onDataEnd,
    onError,
  } = options;

  const httpRequest = request({
    url,
    headers: {
      Range: `bytes=${startOffset}-${endOffset || ' '}`,
    },
    timeout: 1000 * 10,
  });
  httpRequest.on('data', onDataReceive);
  httpRequest.on('end', onDataEnd);
  httpRequest.on('error', onError);

  return httpRequest;
}

function createChunk(options) {
  const { url, startOffset, endOffset } = options;

  let promise;
  let httpRequest;
  let bytesDownloaded = 0;
  const chunkSize = endOffset - startOffset + 1;

  const buffer = createStreamBuffer();
  const event = new ChunkEmitter();

  const promiseInstance = new Promise((resolve, reject) => {
    promise = { resolve, reject };
  });

  const onDataReceive = (data) => {
    bytesDownloaded += data.length;
    buffer.put(data);
    event.emit('progress', { bytesDownloaded, chunkSize });
  };

  const onDataEnd = () => {
    if (!promise || bytesDownloaded < chunkSize) return;
    promise.resolve();
  };

  const onError = (err) => {
    httpRequest.abort();
    setTimeout(() => {
      httpRequest = createHttpRequest({
        url,
        startOffset: startOffset + bytesDownloaded,
        endOffset,
        onDataReceive,
        onDataEnd,
        onError,
      });
    }, 1000);
    event.emit('error', err);
  };

  const chunkObject = {
    on(...args) {
      event.on(...args);
    },
    getBytesDownloaded() {
      return bytesDownloaded;
    },
    getBuffer() {
      return buffer;
    },
    startDownload() {
      if (!httpRequest) {
        httpRequest = createHttpRequest({
          url,
          startOffset,
          endOffset,
          onDataReceive,
          onDataEnd,
          onError,
        });
      }
      return promiseInstance;
    },
    getChunkName() {
      return options.name;
    },
    getStartOffset() {
      return startOffset;
    },
    getEndOffset() {
      return endOffset;
    },
    getChunkSize() {
      return chunkSize;
    },
  };

  return chunkObject;
}

module.exports = createChunk;
