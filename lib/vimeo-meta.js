const request = require('request-promise-native');

function getHighestResolution(formats) {
  const availableFormats = [...formats];
  availableFormats.sort((a, b) => a.width - b.width);
  return availableFormats.pop();
}

async function vimeoMetaExtractor(vimeoUrl) {
  const videoPageHTML = await request(vimeoUrl);
  const videoMeta = JSON.parse(
    videoPageHTML.match(/(?<=var config = )(( |\S){1,}})(?=;\s)/gm)[0],
  );

  const videoFormats = videoMeta.request.files.progressive;
  const bestFormat = getHighestResolution(videoFormats);
  const rawVideoUrl = bestFormat.url;

  return rawVideoUrl;
}

module.exports = vimeoMetaExtractor;
